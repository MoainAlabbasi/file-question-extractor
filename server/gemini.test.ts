import { describe, expect, it } from "vitest";
import { extractQuestionsFromText } from "./gemini";

describe("Gemini API Integration", () => {
  it("should extract questions from text using Gemini API", async () => {
    const sampleText = `
الذكاء الاصطناعي هو فرع من علوم الحاسوب يهتم بإنشاء أنظمة قادرة على أداء مهام تتطلب ذكاءً بشرياً.
يشمل ذلك التعلم الآلي، معالجة اللغة الطبيعية، والرؤية الحاسوبية.
    `;

    const questions = await extractQuestionsFromText(sampleText);

    expect(questions).toBeDefined();
    expect(Array.isArray(questions)).toBe(true);
    expect(questions.length).toBeGreaterThan(0);
    
    // Each question should be a non-empty string
    questions.forEach(q => {
      expect(typeof q).toBe("string");
      expect(q.length).toBeGreaterThan(0);
    });

    console.log("Extracted questions:", questions);
  }, 30000); // 30 second timeout for API call
});
