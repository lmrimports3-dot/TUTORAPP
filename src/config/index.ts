/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const config = {
  app: {
    name: "EduAI MVP",
    version: "1.0.0",
    env: process.env.NODE_ENV || "development",
  },
  ai: {
    apiKey: process.env.GEMINI_API_KEY,
    model: "gemini-3-flash-preview",
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  n8n: {
    webhookUrl: process.env.VITE_N8N_WEBHOOK_URL,
    apiKey: process.env.VITE_N8N_API_KEY,
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET || "eduai-secret-key",
    expiresIn: "7d",
  },
};
