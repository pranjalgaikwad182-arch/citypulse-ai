import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AIChatResponse, AIPlaceCard, Place } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Send,
  MapPin,
  Star,
  Plus,
  Compass,
  Shield,
  Bot,
  User,
  AlertCircle,
  CheckCircle,
  HelpCircle
} from 'lucide-react';

interface AIAssistantPageProps {
  onAddToItinerary: (place: Place) => void;
  itineraryPlaceIds: number[];
  allPlaces: Place[];
}

interface MessageItem {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  places?: AIPlaceCard[];
  safetyNotes?: string;
  limitations?: string;
  isFallback?: boolean;
}

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({
  onAddToItinerary,
  itineraryPlaceIds,
  allPlaces,
}) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q');
  const navigate = useNavigate();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      content:
        'Namaste! I am CityPulse AI, your intelligent city exploration companion for Pune, Maharashtra. Ask me to find affordable places to eat, wheelchair-accessible heritage landmarks, plan a budget day trip, or query active safety hazard reports around the city.',
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'Find affordable food near historical landmarks under ₹300',
    'Suggest places accessible to wheelchair users',
    'Which nearby areas have active hazard or waterlogging reports?',
    'Find parks and cafes for a family outing in Pune',
    'What should I explore for a half-day culture trip?',
  ];

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: MessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const res: AIChatResponse = await api.sendAIChat(textToSend, undefined, history);

      const aiMsg: MessageItem = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: res.answer,
        places: res.places,
        safetyNotes: res.safety_notes || undefined,
        limitations: res.data_limitations || undefined,
        isFallback: res.is_fallback,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          content: 'I encountered an error retrieving city records. Please check backend connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleAddCardToItinerary = (card: AIPlaceCard) => {
    const fullPlace = allPlaces.find((p) => p.id === card.id);
    if (fullPlace) {
      onAddToItinerary(fullPlace);
    } else {
      // Synthesize
      onAddToItinerary({
        id: card.id,
        name: card.name,
        category: card.category,
        address: card.address,
        lat: card.lat,
        lng: card.lng,
        rating: card.rating,
        price_tier: card.price_tier,
        reviews_count: 50,
        accessibility_wheelchair: false,
        is_family_friendly: true,
        source_name: card.evidence_source,
        data_freshness: 'Verified 2026',
        created_at: new Date().toISOString(),
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-950/60 via-slate-900 to-slate-950 p-6 rounded-3xl border border-violet-900/40 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 p-0.5 shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-violet-400" />
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              CityPulse AI Companion
              <span className="text-xs bg-violet-950 border border-violet-700/60 text-violet-300 px-2.5 py-0.5 rounded-full font-semibold">
                RAG Grounded
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Retrieval-augmented intelligence backed by verified Pune open data & citizen reports.
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-4 sm:p-6 min-h-[500px] max-h-[650px] overflow-y-auto space-y-5">
        {messages.map((msg) => {
          const isAi = msg.sender === 'assistant';

          return (
            <div key={msg.id} className={`flex gap-3 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs ${
                  isAi
                    ? 'bg-violet-600/20 border border-violet-500/40 text-violet-300'
                    : 'bg-cyan-600/20 border border-cyan-500/40 text-cyan-300'
                }`}
              >
                {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              <div className={`max-w-2xl space-y-3 ${isAi ? '' : 'text-right'}`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isAi
                      ? 'bg-slate-950 border border-slate-800 text-slate-200'
                      : 'bg-cyan-600 text-slate-950 font-medium inline-block text-left'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Safety Alert Note if present */}
                  {msg.safetyNotes && (
                    <div className="mt-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-200 flex items-start gap-2 text-left">
                      <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{msg.safetyNotes}</span>
                    </div>
                  )}

                  {/* RAG Engine Transparency */}
                  {msg.limitations && (
                    <div className="mt-2 text-[10px] text-slate-500 italic text-left">
                      ℹ️ {msg.limitations}
                    </div>
                  )}
                </div>

                {/* Attached Place Cards */}
                {msg.places && msg.places.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-left">
                    {msg.places.map((place) => (
                      <div
                        key={place.id}
                        className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/50 transition flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-semibold text-violet-400 bg-violet-950/80 px-2 py-0.5 rounded">
                              {place.category}
                            </span>
                            {place.rating && (
                              <span className="text-[10px] text-amber-400 flex items-center font-bold">
                                <Star className="w-3 h-3 fill-amber-400 mr-0.5" />
                                {place.rating}
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-white">{place.name}</div>
                          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
                            {place.reason}
                          </p>
                          <div className="text-[10px] text-slate-500 mt-1 truncate">
                            {place.address}
                          </div>
                        </div>

                        <div className="pt-2.5 mt-2 border-t border-slate-800 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => navigate(`/explore?q=${encodeURIComponent(place.name)}`)}
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <MapPin className="w-3 h-3" /> View on Map
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddCardToItinerary(place)}
                            className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg font-semibold cursor-pointer ${
                              itineraryPlaceIds.includes(place.id)
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-violet-600 hover:bg-violet-500 text-white'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                            {itineraryPlaceIds.includes(place.id) ? 'Added' : 'Itinerary'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 text-violet-300 flex items-center justify-center text-xs">
              <Bot className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>Querying verified municipal database & ranking evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Query Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium">Try asking:</span>
        {suggestedPrompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSendMessage(prompt)}
            className="text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 transition cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputMessage);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask CityPulse AI about places, budgets, safety, or routes..."
          className="flex-1 bg-slate-900 border border-slate-800 focus:border-violet-500 px-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none transition shadow-inner"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || loading}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 transition disabled:opacity-50 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
