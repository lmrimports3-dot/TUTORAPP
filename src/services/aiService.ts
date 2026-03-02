/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";
import { config } from "../config";

const ai = new GoogleGenAI({ apiKey: config.ai.apiKey || "" });

export class AIService {
  static async generateResponse(systemInstruction: string, history: any[], message: string) {
    const response = await ai.models.generateContent({
      model: config.ai.model,
      contents: [
        ...history.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ],
      config: {
        systemInstruction,
        temperature: config.ai.temperature,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  }
}
