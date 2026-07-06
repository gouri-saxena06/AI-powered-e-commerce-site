import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { pool } from '../config/db.js';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// AI shopping assistant: answers questions and recommends products
// grounded in the actual catalog, so it never invents items that don't exist.
export async function assistant(req, res) {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const { rows: products } = await pool.query(
      'SELECT id, name, description, price, category, stock FROM products ORDER BY id LIMIT 200'
    );

    const catalogText = products
      .map((p) => `#${p.id} | ${p.name} | $${p.price} | ${p.category} | stock:${p.stock} | ${p.description}`)
      .join('\n');

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

    const systemPrompt = `You are a friendly, concise AI shopping assistant for an online store.
Only recommend products that appear in the CATALOG below - never invent products, prices, or stock levels.
When you recommend a product, mention its name and price. Keep replies under 120 words unless asked for detail.

CATALOG:
${catalogText}`;

    const chatHistory = (history || []).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }],
    }));

    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: systemPrompt }] },
        { role: 'model', parts: [{ text: 'Understood. I will only recommend products from the catalog provided.' }] },
        ...chatHistory,
      ],
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();

    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI assistant is temporarily unavailable' });
  }
}

// AI-assisted product description generator, used in the admin dashboard.
export async function generateDescription(req, res) {
  try {
    const { name, category, keywords } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
    const prompt = `Write a compelling e-commerce product description (2-3 sentences, no markdown) for:
Product name: ${name}
Category: ${category || 'general'}
Keywords: ${keywords || ''}`;

    const result = await model.generateContent(prompt);
    res.json({ description: result.response.text().trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI description generation failed' });
  }
}
