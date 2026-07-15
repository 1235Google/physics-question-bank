import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { GoogleGenAI, Type } from '@google/genai';

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Use JSON middleware with higher limit for PDFs
  app.use(express.json({ limit: '50mb' }));

  // API routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.post('/api/upload-pdf', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file uploaded.' });
      }

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });
      
      const pdfBase64 = req.file.buffer.toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [
          {
            role: 'user',
            parts: [
              { text: `Analyze this educational worksheet PDF. Extract all questions, preserving mathematical equations, detecting headings, chapter names, worksheet titles, and section headings.
For MCQs, detect the options (A, B, C, D) and the correct answer if available.
Classify each question by Class, Subject, Chapter, Worksheet, Type, Difficulty (easy, medium, hard), and Marks (if available).
Question Types: mcq, tf, fib, vsa, sa, la, numerical, assertion, match.
Ensure no duplicates. Also provide a confidence score (0-100) for the extraction quality of each question. Output as structured JSON.` },
              { inlineData: { data: pdfBase64, mimeType: 'application/pdf' } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    class: { type: Type.INTEGER },
                    subject: { type: Type.STRING },
                    chapter: { type: Type.STRING },
                    worksheet: { type: Type.STRING },
                    type: { type: Type.STRING },
                    difficulty: { type: Type.STRING },
                    marks: { type: Type.INTEGER },
                    question: { type: Type.STRING },
                    options: { 
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    answer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    hint: { type: Type.STRING },
                    tags: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    confidence: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || '{}';
      const extractedData = JSON.parse(jsonStr);

      res.json({ success: true, questions: extractedData.questions || [] });

    } catch (err: any) {
      console.error(err);
      res.status(500).json({ error: err.message || 'Failed to process PDF' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
