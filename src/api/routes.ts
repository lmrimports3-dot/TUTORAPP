/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import { AIService } from '../services/aiService';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.post('/chat', async (req, res) => {
  const { systemInstruction, history, message } = req.body;
  try {
    const response = await AIService.generateResponse(systemInstruction, history, message);
    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
