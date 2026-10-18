import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '25mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const HINDI_SYSTEM_PROMPT = `
आप "राकेश" (Rakesh Sir / राकेश सर) हैं — एक अत्यंत कुशल, धैर्यवान, आत्मीय और प्रेरणादायक शिक्षक एवं मेंटर (Teaching AI Assistant)।
आपका उद्देश्य हर छात्र और शिक्षार्थी को किसी भी विषय (गणित, विज्ञान, कंप्यूटर/कोडिंग, अंग्रेज़ी, सामान्य ज्ञान, इतिहास, रोज़मर्रा के कौशल) को सबसे आसान, रोचक और यादगार तरीके से सिखाना है।

शिक्षण के नियम व शैली:
1. हमेशा एक सच्चे और मार्गदर्शक शिक्षक की तरह मधुर, उत्साही और सकारात्मक हिंदी (Devanagari) में बोलें।
   - संबोधन: "नमस्ते! बहुत ही बढ़िया और महत्वपूर्ण सवाल पूछा आपने!", "चिंता मत कीजिए, राकेश सर आपके साथ हैं, आइए इसे बहुत सरल तरीके से समझते हैं!"
2. किसी भी कठिन विषय या सिद्धांत को रोजमर्रा के जीवन के व्यावहारिक उदाहरणों (Daily Life Analogies) से जोड़कर सिखाएं।
3. संरचना (Teaching Structure):
   - 🎯 **सरल और सटीक व्याख्या:** सीधे और आसान शब्दों में सिद्धांत को समझाएं।
   - 💡 **व्यावहारिक उदाहरण:** जैसे दैनिक जीवन की कोई घटना या कहानी से समझाना।
   - 📌 **मुख्य सूत्र / याद रखने योग्य बात (Key Takeaway):** 1-2 बुलेट पॉइंट्स में।
   - ❓ **छोटा अभ्यास प्रश्न (Quiz/Challenge):** उत्तर के अंत में विद्यार्थी से एक हल्का-फुल्का अभ्यास सवाल पूछें ताकि उनकी समझ पक्की हो सके।
4. तकनीकी या वैज्ञानिक शब्दों (जैसे Gravity, Photosynthesis, Algorithm, Variables) को हिंदी और कोष्ठक में अंग्रेजी में सहज रूप से बताएं।
5. भाषा सुनने में एक स्नेही शिक्षक के क्लासरूम जैसी जीवंत और कर्णप्रिय होनी चाहिए, ताकि छात्र को बोलकर सुनने में पूरा आनंद आए।
`;

// API: Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // Build chat contents from history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (Array.isArray(history)) {
      for (const item of history.slice(-8)) {
        if (item && item.role && item.text) {
          contents.push({
            role: item.role === 'model' ? 'model' : 'user',
            parts: [{ text: item.text }],
          });
        }
      }
    }

    // Append the latest user query
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: HINDI_SYSTEM_PROMPT,
        temperature: 0.7,
      },
    });

    const reply = response.text || 'माफ़ कीजिए, मैं अभी उत्तर तैयार नहीं कर सका। कृपया पुनः प्रयास करें।';
    res.json({ reply });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Error generating chat reply:', error);
    res.status(500).json({
      error: 'AI से संपर्क करने में समस्या हुई। कृपया पुनः प्रयास करें।',
      details: error.message,
    });
  }
});

// API: Text-to-Speech endpoint (Gemini 3.8 Flash Lite TTS)
app.post('/api/tts', async (req, res) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Text is required for TTS' });
      return;
    }

    // Clean text: remove excessive asterisks/markdown formatting for smooth speech
    const cleanText = text
      .replace(/[*_#`~]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Limit text length for TTS to prevent excessive latency (up to 400 characters for instant playback)
    const truncatedText = cleanText.length > 500 ? cleanText.substring(0, 500) + '...' : cleanText;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: truncatedText,
              speechMetadata: {
                style: 'Warm, clear, polite, encouraging and articulate Hindi teacher voice',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            // Voices: 'Kore', 'Puck', 'Zephyr', 'Fenrir', 'Charon'
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      res.status(502).json({ error: 'Could not generate speech audio' });
      return;
    }

    res.json({
      audio: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('TTS error:', error);
    res.status(500).json({
      error: 'ऑडियो उत्पन्न करने में त्रुटि।',
      details: error.message,
    });
  }
});

// API: Audio Transcription endpoint (Gemini 3.5 Transcribe fallback)
app.post('/api/transcribe', async (req, res) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      res.status(400).json({ error: 'Audio data is required' });
      return;
    }

    const audioPart = {
      inlineData: {
        mimeType: mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this spoken Hindi audio accurately into Hindi Devanagari script. Do not add explanations or notes. Return only the exact transcribed Hindi sentence.',
          },
        ],
      },
    });

    const transcription = (response.text || '').trim();
    res.json({ text: transcription });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Transcribe error:', error);
    res.status(500).json({
      error: 'आवाज़ पहचानने में समस्या हुई।',
      details: error.message,
    });
  }
});

// Setup Vite middleware in dev or static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Dost AI Server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
