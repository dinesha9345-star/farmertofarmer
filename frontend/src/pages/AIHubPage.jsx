import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, TrendingUp, Send, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import { MOCK_AI_PREDICTIONS } from '../mock';

export default function AIHubPage() {
  const { products } = useApp();
  const [messages, setMessages] = useState([
    { sender: 'bot', text: "Hello! I am AgriBot, your AI farming & crop advisor. Ask me about crop price trends, soil health, fertilizer recommendations, or low stock warnings!" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');

    setTimeout(() => {
      let botReply = "Based on our machine learning models and mandi data across 2026, prices for this harvest are projected to remain steady with 12% higher demand in metro hubs.";
      if (userText.toLowerCase().includes('mango') || userText.toLowerCase().includes('price')) {
        botReply = "Alphonso Mangoes are currently experiencing high seasonal surge due to early heatwaves. Recommended holding price is ₹180-210/kg.";
      } else if (userText.toLowerCase().includes('soil') || userText.toLowerCase().includes('fertilizer')) {
        botReply = "For organic cultivation in Maharashtrian laterite soil, vermicompost combined with neem cake gives optimal yield without nitrogen depletion.";
      }
      setMessages(prev => [...prev, { sender: 'bot', text: botReply }]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        <div>
          <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            <span>Advanced Agri Intelligence & Predictive Modeling</span>
          </div>
          <h1 className="text-3xl font-serif font-black text-zinc-900 dark:text-zinc-100">AI Crop Price Prediction & Smart Chatbot</h1>
          <p className="text-xs text-zinc-500 mt-1">Real-time market analytics powered by machine learning algorithms for farmers & buyers</p>
        </div>

        {/* Prediction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_AI_PREDICTIONS.map((p, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{p.crop}</span>
                <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-lg font-bold">
                  {p.demandTrend}
                </span>
              </div>
              <div>
                <div className="text-xs text-zinc-400">Current Mandi Price</div>
                <div className="text-2xl font-black text-zinc-900 dark:text-zinc-100">₹{p.currentPrice} <span className="text-xs font-normal text-zinc-400">/ Kg</span></div>
              </div>
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-1">
                <span className="text-[10px] text-zinc-400 uppercase font-bold">AI Prediction Next Month</span>
                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">₹{p.predictedPriceNextMonth} / Kg</div>
              </div>
              <p className="text-xs text-zinc-500 leading-relaxed">💡 {p.recommendation}</p>
            </div>
          ))}
        </div>

        {/* AI Chat Assistant Section */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-emerald-100 dark:border-zinc-800 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-zinc-100 dark:border-zinc-800 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">AgriBot 24/7 AI Support Assistant</h3>
              <p className="text-xs text-zinc-500">Instant answers on crop pricing, weather alerts, pest control, and marketplace queries</p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-2xl max-w-xl text-xs sm:text-sm leading-relaxed ${m.sender === 'user' ? 'bg-emerald-600 text-white font-medium shadow-md' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700'}`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="flex gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <input 
              type="text" 
              placeholder="Ask about crop prices, organic certification, weather forecasts..." 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-zinc-100 dark:bg-zinc-800 px-4 py-3 rounded-xl text-xs sm:text-sm border border-transparent focus:border-emerald-500 outline-none"
              data-testid="ai-chat-input"
            />
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold text-xs flex items-center gap-2">
              <span>Ask AI</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
