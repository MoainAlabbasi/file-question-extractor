import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("[Gemini] API key not found in environment variables");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function extractQuestionsFromText(text: string): Promise<string[]> {
  if (!genAI) {
    throw new Error("Gemini API key not configured");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `قم بتحليل النص التالي واستخراج جميع الأسئلة الموجودة فيه. إذا لم يكن هناك أسئلة واضحة، قم بتوليد 5-10 أسئلة مفيدة حول محتوى النص.

أعد الأسئلة كقائمة، كل سؤال في سطر منفصل، بدون ترقيم أو رموز.

النص:
${text}`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const generatedText = response.text();

  // Split by newlines and filter empty lines
  const questions = generatedText
    .split("\n")
    .map((q) => q.trim())
    .filter((q) => q.length > 0 && !q.match(/^[\d\-\*\.]+\s*/)); // Remove numbering

  return questions;
}
