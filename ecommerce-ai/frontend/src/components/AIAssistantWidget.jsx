import React, { useState, useRef, useEffect } from 'react';
import client from '../api/client.js';

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm your shopping assistant. Ask me for recommendations, sizing help, or anything about our products." },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);
    try {
      const { data } = await client.post('/ai/assistant', {
        message: text,
        history: nextMessages.slice(0, -1),
      });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: "Sorry, I couldn't reach the AI assistant just now. Please check your Gemini API key in the backend .env file.",
      }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 sm:w-96 h-[28rem] bg-white border border-panel rounded-card shadow-xl flex flex-col overflow-hidden">
          <div className="bg-ink text-paper px-4 py-3 flex items-center justify-between">
            <span className="font-display font-600 text-sm">AI Shopping Assistant</span>
            <button onClick={() => setOpen(false)} className="text-paper/70 hover:text-paper text-sm">✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-paper">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3 py-2 rounded-card text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'ml-auto bg-market-500 text-white'
                    : 'bg-white border border-panel text-ink'
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-panel text-ink/50 text-sm px-3 py-2 rounded-card w-fit">
                Thinking…
              </div>
            )}
          </div>
          <div className="p-3 border-t border-panel flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about products…"
              className="flex-1 text-sm px-3 py-2 rounded-card border border-panel focus:outline-none focus:ring-2 focus:ring-market-400"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-market-500 text-white text-sm px-3 py-2 rounded-card hover:bg-market-600 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-amber-500 text-white shadow-lg flex items-center justify-center text-xl hover:bg-amber-600 transition-colors"
        aria-label="Open AI shopping assistant"
      >
        {open ? '×' : '✦'}
      </button>
    </div>
  );
}
