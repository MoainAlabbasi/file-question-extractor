import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyBHwl_gUpyagPOTx9aFB8lQb_67tUc9llo");

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log("Available models:");
    for await (const model of models) {
      console.log(`- ${model.name}`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  }
}

listModels();
