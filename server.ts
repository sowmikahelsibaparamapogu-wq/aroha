import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialize Gemini client to prevent crashes if key is not yet set
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== 'MY_GEMINI_API_KEY') {
      aiClient = new GoogleGenAI({ apiKey: key });
    }
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
  res.json({
    status: 'ok',
    geminiConfigured: hasKey,
    timestamp: new Date().toISOString(),
  });
});

// Multilingual Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY not configured',
        fallback: true,
      });
    }

    const languageNames: Record<string, string> = {
      en: 'English',
      hi: 'Hindi (हिन्दी)',
      te: 'Telugu (తెలుగు)',
      or: 'Odia (ଓଡ଼ିଆ)',
      bn: 'Bengali (বাংলা)',
      sat: 'Santhali (ᱥᱟᱱᱛᱟᱲᱤ)',
      mr: 'Marathi (मराठी)',
      ta: 'Tamil (தமிழ்)',
    };

    const targetLangName = languageNames[language] || language;

    const systemInstruction = `You are AROHA Mitra, the friendly, empathetic, and authoritative AI assistant for the Ministry of Tribal Affairs (MoTA), Government of India, supporting the AROHA portal (AI-Enabled Robust Online Higher-Education & Fellowship Architecture).

YOUR MANDATES:
1. SCHOLARSHIP & FELLOWSHIP EXPERTISE:
   - National Fellowship for Higher Education of ST Students (NFST): 750 annual slots, JRF (₹37,000/month for first 2 years), SRF (₹42,000/month for next 3 years), contingency grant (₹20,500/yr Humanities, ₹25,000/yr Science), 30% statutory quota for ST female scholars, minimum 55% in Master's degree, UGC-NET/CSIR-NET qualification, monthly PFMS Direct Benefit Transfer (DBT) on the 1st of every month.
   - National Overseas Scholarship for ST Candidates (NOS): 20 annual slots for Master's, Ph.D, and Post-Doctoral studies at institutions in the Top 500 QS World University Rankings, 100% tuition fees covered directly by the Government of India, annual maintenance allowance (£9,900 UK / $15,400 USA and other countries), economy return airfare and visa fees, annual family income ceiling of ₹8,00,000 (8 Lakhs), age limit below 35 years as of 1st July.
   - Verification & Scrutiny: AI OCR verification of Caste Certificates and academic documents; detecting discrepancies (such as surname mismatch between application and revenue certificate, requiring an SDM affidavit or Gazette notification); resolving Deficiency Notices within 15 days via the Track Status tab.
   - Offline-First PWA: Built for remote tribal areas (Adilabad, Bastar, Koraput, Khunti, Mayurbhanj), allowing applicants to fill forms and queue documents in local IndexedDB without internet, auto-syncing when network reconnects.
   - Tribal Culture & Heritage: Scheduled Tribes of India (Article 342, 705+ notified communities, PVTGs like Birhor, Chenchu, Maria Gond), master tribal arts like Warli, Gond, Dokra lost-wax casting, Santhal folklore, Saura art.

2. ANSWER ANY QUESTION:
   - You can answer ANY question the user asks! Whether it is general knowledge, history, science, geography, mathematics, coding, daily life, culture, philosophy, general conversation, or greetings.
   - Never say "I can only answer scholarship questions". If the question is general (e.g., "What is the capital of France?", "Who is the Prime Minister of India?", "Write a poem", "Tell me about photosynthesis"), provide an accurate, high-quality answer.

3. MULTILINGUAL EXCELLENCE:
   - The user's active portal language is: ${targetLangName}.
   - ALWAYS respond fluently in ${targetLangName}, OR in whatever language the user typed their question in.
   - Use clean Markdown with bolding and bullet points for readability.`;

    const prompt = `User query: "${message}"\nActive language preference: ${targetLangName}.\nPlease provide an accurate, helpful, and culturally respectful response in ${targetLangName} (or match the user's query language).`;

    let replyText: string | null = null;
    const candidateModels = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
        if (response && response.text) {
          replyText = response.text;
          break;
        }
      } catch {
        // Silently proceed to candidate fallback model to handle temporary high demand spikes
        continue;
      }
    }

    if (!replyText) {
      return res.json({ fallback: true });
    }

    return res.json({ reply: replyText });
  } catch {
    return res.json({ fallback: true });
  }
});

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
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
    console.log(`AROHA full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
