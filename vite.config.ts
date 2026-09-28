import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

function geminiNewsPlugin(): Plugin {
  return {
    name: 'gemini-news-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/gemini/generate-news' && req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const { topic, district, category } = JSON.parse(bodyStr || '{}');
              if (!topic) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'News topic/prompt is required' }));
                return;
              }

              const ai = new GoogleGenAI({
                apiKey: process.env.GEMINI_API_KEY,
                httpOptions: {
                  headers: {
                    'User-Agent': 'aistudio-build',
                  },
                },
              });

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
                const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
                parsedData = JSON.parse(cleanJson);
              }

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

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, data: parsedData }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Gemini news generation failed' }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), geminiNewsPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

