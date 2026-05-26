import * as process from 'node:process';
import { Groq } from 'groq-sdk';

export class QwenService {
  private groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async analyzeReportImage(photoInput: string) {
    if (!process.env.GROQ_API_KEY) {
      return;
    }

    try {
      // Télécharger l'image depuis l'URL et la convertir en base64 data URL
      const imageDataUrl = await this.downloadImageAsDataUrl(photoInput);

      const response = await this.groq.chat.completions.create({
        model: 'meta-llama/llama-4-scout-17b-16e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Décris précisément ce que tu vois sur cette image. Est-ce un nid-de-poule, un arbre tombé, ou une route endommagée ?',
              },
              {
                type: 'image_url',
                // biome-ignore lint/style/useNamingConvention: Propriété requise par l'API
                image_url: {
                  url: imageDataUrl,
                },
              },
            ],
          },
        ],
        // biome-ignore lint/style/useNamingConvention: Propriété requise par l'API
        max_tokens: 100,
      });

      const analysis = response.choices[0].message.content;

      return this.extractTag(analysis || '');
    } catch (error) {
      throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async downloadImageAsDataUrl(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    // Retourner une data URL que Groq peut utiliser
    return `data:image/jpeg;base64,${base64}`;
  }

  private extractTag(analysis: string): string {
    const analysisLower = analysis.toLowerCase();

    // Mapper les keywords reconnus par Groq vers les types valides du report
    // basés sur REPORT_TYPES de @repo/contracts/report

    if (
      analysisLower.includes('nid-de-poule') ||
      analysisLower.includes('route endommagée') ||
      analysisLower.includes('fissure')
    ) {
      return 'Voirie';
    }
    if (
      analysisLower.includes('éclairage') ||
      analysisLower.includes('lampadaire') ||
      analysisLower.includes('lumière')
    ) {
      return 'Éclairage public';
    }
    if (analysisLower.includes('arbre') || analysisLower.includes('buisson') || analysisLower.includes('herbe')) {
      return 'Espaces verts';
    }
    if (analysisLower.includes('propreté') || analysisLower.includes('déchet') || analysisLower.includes('poubelle')) {
      return 'Propreté';
    }
    if (analysisLower.includes('banc') || analysisLower.includes('mobilier') || analysisLower.includes('abri')) {
      return 'Mobilier urbain';
    }
    if (
      analysisLower.includes('voiture') ||
      analysisLower.includes('stationnement') ||
      analysisLower.includes('parking')
    ) {
      return 'Stationnement';
    }
    if (analysisLower.includes('sécurité') || analysisLower.includes('danger') || analysisLower.includes('risque')) {
      return 'Sécurité';
    }
    if (analysisLower.includes('bruit') || analysisLower.includes('son') || analysisLower.includes('noise')) {
      return 'Bruit';
    }

    // Retourner 'Autre' si aucun tag reconnu
    return 'Autre';
  }
}
