import { GoogleGenAI, Type } from '@google/genai';
import { readFileSync } from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function test() {
  const pdfBuffer = readFileSync('package.json'); // sending as json just to test inlineData, wait, I need a pdf file.
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: [
      {
         role: 'user',
         parts: [
           { text: 'What is this file?' },
           { inlineData: { data: pdfBuffer.toString('base64'), mimeType: 'application/json' } }
         ]
      }
    ]
  });
  console.log(response.text);
}
test();
