import * as process from 'node:process';
import { REPORT_TYPES, type ReportType } from '@repo/contracts/report';
import { Groq } from 'groq-sdk';

export class QwenService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async analyzeReportImage(photoInput: string): Promise<ReportType | undefined> {
    if (!process.env.GROQ_API_KEY) {
      return;
    }

    const imageDataUrl = await this.downloadImageAsDataUrl(photoInput);

    const response = await this.groq.chat.completions.create({
      model: 'meta-llama/llama-4-scout-17b-16e-instruct',
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant de classification de signalements municipaux.
Analyse l'image et réponds UNIQUEMENT avec l'un de ces tags (mot pour mot, sans ponctuation ni explication) :
${REPORT_TYPES.join('\n')}`,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Quel est le tag le plus approprié pour ce signalement ?',
            },
            {
              type: 'image_url',
              // biome-ignore lint/style/useNamingConvention: Propriété requise par l'API
              image_url: { url: imageDataUrl },
            },
          ],
        },
      ],
      // biome-ignore lint/style/useNamingConvention: Propriété requise par l'API
      max_tokens: 20,
    });

    const raw = response.choices[0].message.content?.trim() ?? '';

    // Valider que la réponse est bien un tag connu, sinon fallback sur 'Autre'
    const match = REPORT_TYPES.find((t) => t.toLowerCase() === raw.toLowerCase());
    return match ?? 'Autre';
  }

  private async downloadImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  }
}
