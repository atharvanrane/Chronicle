import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Helper to get GoogleGenAI client
function getGenAIClient(customKey?: string) {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Health check & configuration info
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    hasServerGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// 2. AI Chatbot (Editorial Copilot & Reader Article Companion)
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { messages, articleContext, customApiKey } = req.body;
    const ai = getGenAIClient(customApiKey);

    if (!ai) {
      return res.status(400).json({
        error: 'No API key available. Please check GEMINI_API_KEY in environment or configure custom API key in settings.',
      });
    }

    let systemInstruction = `You are "Chronicle Copilot", an elite literary editor, SEO expert, and intelligent reader assistant for an aesthetic modern publishing platform.
Your tone is thoughtful, articulate, concise, and helpful. Avoid generic robotic fluff or buzzwords. Provide direct, beautifully formatted responses with markdown formatting (bullet points, bold text, blockquotes) when helpful.`;

    if (articleContext) {
      systemInstruction += `\n\nYou are currently discussing the following article titled "${articleContext.title}" by ${articleContext.author || 'Author'}:\n"""\n${articleContext.content?.slice(0, 8000)}\n"""\nHelp the user explore this article, summarize key points, explain difficult terms, suggest counter-arguments, or discuss its themes.`;
    }

    // Convert message history to prompt string or chat
    const formattedHistory = (messages || []).map((m: { role: string; content: string }) => {
      const speaker = m.role === 'user' ? 'User' : 'Assistant';
      return `${speaker}: ${m.content}`;
    }).join('\n\n');

    const prompt = `${formattedHistory}\n\nAssistant:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I could not generate a response. Please try again.';
    return res.json({ reply });
  } catch (err: any) {
    console.error('Error in /api/ai/chat:', err);
    return res.status(500).json({
      error: err.message || 'Failed to process AI chat request.',
    });
  }
});

// 3. AI SEO Suggestions & Scoring
app.post('/api/ai/seo', async (req: Request, res: Response) => {
  try {
    const { title, content, targetKeywords, customApiKey, customOpenAIKey } = req.body;

    // Optional OpenAI integration if user provides their own key
    if (customOpenAIKey) {
      try {
        const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customOpenAIKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'You are an expert SEO auditor. Return JSON matching: { seoScore: number, metaTitle: string, metaDescription: string, primaryKeywords: string[], readability: string, strengths: string[], improvements: string[], headlineSuggestions: string[], socialSnippet: string }',
              },
              {
                role: 'user',
                content: `Analyze this post for SEO:\nTitle: ${title}\nTarget Keywords: ${targetKeywords || 'None specified'}\nContent:\n${(content || '').slice(0, 5000)}`,
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (openAiRes.ok) {
          const data = await openAiRes.json();
          const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
          return res.json(parsed);
        }
      } catch (e) {
        console.warn('OpenAI fallback failed, defaulting to Gemini:', e);
      }
    }

    const ai = getGenAIClient(customApiKey);
    if (!ai) {
      return res.status(400).json({
        error: 'No API key found. Please ensure GEMINI_API_KEY is configured.',
      });
    }

    const prompt = `Perform a comprehensive SEO and editorial audit of the following article:
Article Title: "${title || 'Untitled'}"
User Target Keywords: "${targetKeywords || 'General editorial'}"
Article Body:
"""
${(content || '').slice(0, 6000)}
"""

Evaluate SEO factors including title strength, meta tag suitability, readability, keyword richness without keyword stuffing, social shareability, and header structure.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are a veteran technical SEO specialist and digital publisher editor. Evaluate content rigorously and output well-formed JSON.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            seoScore: { type: Type.INTEGER, description: 'SEO score from 0 to 100 based on optimization and engagement' },
            metaTitle: { type: Type.STRING, description: 'Optimized search meta title under 60 characters with high click-through appeal' },
            metaDescription: { type: Type.STRING, description: 'Compelling meta description between 140 and 160 characters with CTA' },
            primaryKeywords: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Top 5-8 recommended search keywords and phrases',
            },
            readability: { type: Type.STRING, description: 'Readability level (e.g. "Grade 7 · Fluid & Accessible" or "Advanced · Technical")' },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 concrete SEO and writing strengths present in this piece',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '3 actionable recommendations to rank higher on Google search and engage readers',
            },
            headlineSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '4 high-CTR alternative titles (Curiosity, Direct, How-To, Data-Driven)',
            },
            socialSnippet: { type: Type.STRING, description: 'Punchy 1-2 sentence hook for Twitter/X and LinkedIn sharing' },
          },
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (err: any) {
    console.error('Error in /api/ai/seo:', err);
    return res.status(500).json({
      error: err.message || 'Failed to generate SEO suggestions.',
    });
  }
});

// 4. AI Editorial Tools (Outline, Enhance, Summarize, Auto-tag, Draft)
app.post('/api/ai/editor-assist', async (req: Request, res: Response) => {
  try {
    const { action, title, content, instructions, customApiKey } = req.body;
    const ai = getGenAIClient(customApiKey);

    if (!ai) {
      return res.status(400).json({
        error: 'No API key available. Check GEMINI_API_KEY in environment.',
      });
    }

    let prompt = '';
    let systemInstruction = 'You are an award-winning publishing editor and essayist.';

    switch (action) {
      case 'outline':
        prompt = `Generate a compelling, well-structured article outline for the topic/title: "${title}".
Provide an engaging Introduction hook, 4-5 thematic sections with 2-3 detailed bullet points each, and a thought-provoking Conclusion. Include suggested callout or case-study points. Use clean markdown.`;
        break;

      case 'enhance':
        prompt = `Polish and elevate the following text. Preserve the original author's voice, eliminate wordiness, strengthen verbs, improve flow, and format with beautiful markdown paragraphs and headings if needed.
Specific guidance: ${instructions || 'Make it more engaging, punchy, and clear.'}

Text to enhance:
"""
${content}
"""`;
        break;

      case 'summarize':
        prompt = `Create a clean 3-bullet "Executive Summary / TL;DR" and a 1-sentence synopsis for the following article:
Title: ${title}
Content:
"""
${(content || '').slice(0, 6000)}
"""`;
        break;

      case 'generate-tags':
        prompt = `Based on this article:
Title: "${title}"
Content:
"""
${(content || '').slice(0, 3000)}
"""
Recommend:
1) The single best category among: ["Engineering", "Design", "Artificial Intelligence", "Culture & Society", "Essays & Thinking", "Founders & Startups", "Productivity"]
2) 5-7 concise lowercase tags (e.g. "react", "ux-design", "future-of-work", "minimalism").`;
        systemInstruction = 'Return valid JSON with keys: category (string), tags (array of strings).';
        break;

      case 'generate-post':
        prompt = `Write a comprehensive, publication-ready starter draft for an article titled "${title}".
Style: Thoughtful, immersive, clear, and nuanced.
Include an evocative opening, 3 main subheadings (##), a blockquote callout, and a closing synthesis. Word count: around 500-700 words. Format with clean markdown.`;
        break;

      default:
        prompt = `Assist with this blog post draft: ${content}`;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: action === 'generate-tags' ? 'application/json' : 'text/plain',
      },
    });

    const result = response.text || '';
    if (action === 'generate-tags') {
      try {
        const parsed = JSON.parse(result);
        return res.json(parsed);
      } catch {
        return res.json({ category: 'Essays & Thinking', tags: ['writing', 'ideas', 'culture'] });
      }
    }

    return res.json({ result });
  } catch (err: any) {
    console.error('Error in /api/ai/editor-assist:', err);
    return res.status(500).json({
      error: err.message || 'Failed to execute editor assist action.',
    });
  }
});

// Vite middleware integration for full-stack dev and static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Chronicle Publishing Studio running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

export default app;
