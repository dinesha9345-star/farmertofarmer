import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Send, Bot, TrendingUp, Loader2 } from 'lucide-react';
import api, { API } from '../lib/api';
import { toast } from 'sonner';

const CROPS = ['Alphonso Mangoes', 'Basmati Rice', 'Heirloom Tomatoes', 'Organic Turmeric'];

export default function AIHubPage() {
  const { products } = useApp();
  const { isAuthed } = useAuth();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am AgriBot, your AI farming & crop advisor. Ask me about crop price trends, soil health, seasonal produce, or delivery questions!" }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [loadingPredict, setLoadingPredict] = useState(true);
  const [loadingRec, setLoadingRec] = useState(false);
  const scrollRef = useRef(null);
  const sessionIdRef = useRef(`sess-${Date.now()}`);

  useEffect(() => {
    // Load initial price predictions in parallel
    (async () => {
      setLoadingPredict(true);
      try {
        const results = await Promise.all(
          CROPS.map((crop) => api.post('/ai/price-predict', { crop }).then((r) => r.data).catch(() => null))
        );
        setPredictions(results.filter(Boolean));
      } finally {
        setLoadingPredict(false);
      }
    })();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const loadRecommendations = async () => {
    if (!isAuthed) { toast.error('Sign in to get personalized recommendations'); return; }
    setLoadingRec(true);
    try {
      const { data } = await api.post('/ai/recommend', { preferences: 'organic and fresh' });
      setRecommendations(data);
    } catch (e) {
      toast.error('Could not fetch recommendations');
    } finally {
      setLoadingRec(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming) return;
    const userText = input;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }, { sender: 'bot', text: '' }]);
    setInput('');
    setStreaming(true);

    try {
      const resp = await fetch(`${API}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('farm2home_token') ? { Authorization: `Bearer ${localStorage.getItem('farm2home_token')}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ message: userText, sessionId: sessionIdRef.current }),
      });
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (!line.startsWith('data:')) continue;
          try {
            const obj = JSON.parse(line.slice(5).trim());
            if (obj.delta) {
              setMessages((prev) => {
                const next = [...prev];
                next[next.length - 1] = { sender: 'bot', text: (next[next.length - 1].text || '') + obj.delta };
                return next;
              });
            }
          } catch (_) {}
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const next = [...prev];
        next[next.length - 1] = { sender: 'bot', text: 'Sorry, I could not reach the AI service. Please try again.' };
        return next;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Live Agri Intelligence • Powered by AI</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">AI Crop Price Prediction & Smart Chatbot</h1>
          <p className="text-xs text-zinc-500 mt-1">Real-time market predictions and personalized recommendations powered by GPT</p>
        </div>

        {/* Price Predictions */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-zinc-800 dark:text-zinc-100 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-600" /> Crop Price Predictions (Next Month)</h2>
            {loadingPredict && <span className="text-xs text-zinc-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Generating…</span>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(loadingPredict ? CROPS.map((c) => ({ crop: c, loading: true })) : predictions).map((p, idx) => (
              <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4" data-testid={`prediction-card-${idx}`}>
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{p.crop}</span>
                  <span className="text-[10px] bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                    {p.loading ? '...' : p.demandTrend}
                  </span>
                </div>
                {p.loading ? (
                  <div className="text-xs text-zinc-400 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Predicting…</div>
                ) : (
                  <>
                    <div>
                      <div className="text-xs text-zinc-400">Current Mandi Price</div>
                      <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">₹{p.currentPrice} <span className="text-xs font-normal text-zinc-400">/ Kg</span></div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                      <span className="text-[10px] text-zinc-400 uppercase font-bold">AI Prediction Next Month</span>
                      <div className="text-sm font-bold text-amber-600 dark:text-amber-400">₹{p.predictedPriceNextMonth} / Kg</div>
                    </div>
                    <p className="text-xs text-zinc-500 leading-relaxed">💡 {p.recommendation}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> Smart Picks For You</h3>
              <p className="text-xs text-zinc-500 mt-1">AI-curated products based on your preferences and past orders</p>
            </div>
            <button onClick={loadRecommendations} disabled={loadingRec}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl disabled:opacity-50"
              data-testid="get-recommendations-btn"
            >
              {loadingRec ? 'Thinking…' : (recommendations ? 'Refresh Picks' : 'Get Recommendations')}
            </button>
          </div>
          {recommendations && (
            <>
              <p className="text-xs italic text-zinc-500">{recommendations.message}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(recommendations.picks || []).map((pk, idx) => (
                  <div key={idx} className="border border-emerald-100 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-800/60" data-testid={`rec-card-${idx}`}>
                    <img src={pk.product.images?.[0]} alt={pk.product.name} className="w-full h-32 object-cover" />
                    <div className="p-3 space-y-1">
                      <div className="font-bold text-xs text-zinc-900 dark:text-zinc-100 line-clamp-1">{pk.product.name}</div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">₹{pk.product.price} / {pk.product.unit}</div>
                      <p className="text-[10px] text-zinc-500 line-clamp-2">💡 {pk.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Chat */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center"><Bot className="w-5 h-5" /></div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">AgriBot AI Support Assistant</h3>
              <p className="text-xs text-zinc-500">Live streaming answers • powered by GPT</p>
            </div>
          </div>

          <div ref={scrollRef} className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${m.sender === 'user' ? 'bg-emerald-600 text-white font-medium shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'}`} data-testid={`chat-msg-${idx}`}>
                  {m.text || (streaming && idx === messages.length - 1 ? '…' : '')}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <input type="text" placeholder="Ask about crop prices, organic certification, best seasonal picks..." value={input}
              onChange={(e) => setInput(e.target.value)} disabled={streaming}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-xl text-xs sm:text-sm border border-transparent focus:border-emerald-500 outline-none disabled:opacity-70"
              data-testid="ai-chat-input"
            />
            <button type="submit" disabled={streaming || !input.trim()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2 disabled:opacity-50" data-testid="ai-chat-send">
              {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Ask AI</span>}
              {!streaming && <Send className="w-4 h-4" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
