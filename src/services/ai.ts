import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function getChatResponse(
  modelName: string,
  systemInstruction: string,
  history: Message[],
  userMessage: string
) {
  const model = "gemini-3-flash-preview";
  
  const contents = [
    ...history.map(m => ({
      role: m.role,
      parts: [{ text: m.content }]
    })),
    {
      role: 'user' as const,
      parts: [{ text: userMessage }]
    }
  ];

  const response = await genAI.models.generateContent({
    model,
    contents,
    config: {
      systemInstruction,
      temperature: 0.7,
    }
  });

  return response.text || "I'm sorry, I couldn't generate a response.";
}
