import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Upload, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedQuestions, setExtractedQuestions] = useState<string[]>([]);

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: async (data) => {
      toast.success(`تم استخراج ${data.questionsCount} سؤال بنجاح!`);
      
      // Fetch the extracted questions
      const questions = await trpcUtils.files.getQuestions.fetch({ fileId: data.fileId });
      setExtractedQuestions(questions.map(q => q.question));
      setUploading(false);
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error("حدث خطأ: " + error.message);
      setUploading(false);
    },
  });

  const trpcUtils = trpc.useUtils();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setExtractedQuestions([]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("الرجاء اختيار ملف أولاً");
      return;
    }

    setUploading(true);

    try {
      // Read file content
      const content = await selectedFile.text();

      // Upload to server
      uploadMutation.mutate({
        filename: selectedFile.name,
        fileKey: `files/${Date.now()}-${selectedFile.name}`,
        fileUrl: `temp-${selectedFile.name}`,
        mimeType: selectedFile.type,
        content: content,
      });
    } catch (error) {
      toast.error("فشل قراءة الملف");
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">مستخرج الأسئلة من الملفات</CardTitle>
            <CardDescription>استخدم الذكاء الاصطناعي لاستخراج الأسئلة من ملفاتك</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild size="lg" className="w-full">
              <a href={getLoginUrl()}>تسجيل الدخول</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">مستخرج الأسئلة</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user?.name}</span>
            <Button variant="outline" size="sm" onClick={() => logout()}>
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع ملف
              </CardTitle>
              <CardDescription>
                اختر ملف نصي (.txt, .md) لاستخراج الأسئلة منه باستخدام Gemini AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4">
                <input
                  type="file"
                  accept=".txt,.md,text/*"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                />
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    {selectedFile.name}
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || uploading}
                  className="w-full"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الاستخراج...
                    </>
                  ) : (
                    "استخراج الأسئلة"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {extractedQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الأسئلة المستخرجة ({extractedQuestions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {extractedQuestions.map((question, index) => (
                    <div
                      key={index}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <p className="text-gray-800">{question}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
