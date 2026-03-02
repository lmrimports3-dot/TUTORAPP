/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export class N8NService {
  static async triggerWorkflow(workflowId: string, data: any) {
    const { webhookUrl, apiKey } = (window as any).config?.n8n || {};
    if (!webhookUrl) return null;

    try {
      const response = await fetch(`${webhookUrl}/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': apiKey,
        },
        body: JSON.stringify(data),
      });
      return await response.json();
    } catch (error) {
      console.error('N8N Workflow Error:', error);
      return null;
    }
  }
}
