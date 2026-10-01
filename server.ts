import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

// Shared Gemini client utility on the server per system guidelines
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI News Generator Endpoint
app.post('/api/gemini/generate-news', async (req, res) => {
  try {
    const { topic, district, category } = req.body;

    if (!topic) {
      return res.status(400).json({ error: 'News topic/prompt is required' });
    }

    const systemPrompt = `You are a Senior Chief Bureau News Editor for "DDN Prime News" (inspired by the Live Hindustan Hindi news style).
Your task is to generate complete, factual, engaging, and professional Hindi news stories based on the topic requested.
Always respond with valid JSON matching this exact structure:
{
  "title": "A crisp, catchy Hindi headline under 15 words (उदा. पटना में नए मेट्रो रूट का ट्रायल शुरू, इन स्टेशनों को मिलेगा फायदा)",
  "subTitle": "An impactful sub-headline or tagline (10-18 words)",
  "summary": "Crisp 2-3 sentence teaser summary of key highlights (50-70 words)",
  "content": "Comprehensive 3-5 paragraph detailed news report in natural, authoritative Hindi journalism standard (250-400 words). Include quotes, administrative statements, context, and public impact.",
  "category": "${category || 'बिहार एक्सप्रेस'}",
  "district": "${district || 'पटना (Patna)'}",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "imagePrompt": "A vivid photojournalism prompt in English describing the news scene for press photography"
}`;

    const userPrompt = `Topic/Instruction: ${topic}
${district ? `Target District: ${district}` : ''}
${category ? `Category: ${category}` : ''}
Generate an authentic, high-quality, breaking news story in Hindi for DDN Prime News.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseErr) {
      // Clean possible markdown code fences
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Default authentic news photo fallback based on category/district if needed
    const defaultPhotos: Record<string, string> = {
      'बिहार एक्सप्रेस': 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=1000&auto=format&fit=crop&q=80',
      'राजनीति': 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1000&auto=format&fit=crop&q=80',
      'क्राइम': 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1000&auto=format&fit=crop&q=80',
      'मनोरंजन': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80',
      'स्पोर्ट्स': 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1000&auto=format&fit=crop&q=80',
      'कारोबार': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1000&auto=format&fit=crop&q=80',
      'देश': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1000&auto=format&fit=crop&q=80',
    };

    if (!parsedData.imageUrl) {
      parsedData.imageUrl = defaultPhotos[parsedData.category] || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1000&auto=format&fit=crop&q=80';
    }

    res.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error('Gemini generate news error:', error);
    res.status(500).json({ error: error.message || 'Failed to generate news with Gemini' });
  }
});

// Single news image generation prompt refiner
app.post('/api/gemini/suggest-headline', async (req, res) => {
  try {
    const { draft } = req.body;
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Provide 3 punchy, Live Hindustan style click-worthy yet ethical Hindi news headlines for this story draft:\n${draft}`,
    });
    res.json({ success: true, suggestions: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // In dev: mount vite.middlewares
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production: serve static files from dist and SPA fallback
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application index.html build not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DDN Prime News Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer();

export default app;
