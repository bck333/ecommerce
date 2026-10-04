import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, MicOff, X, Sparkles, Search, Plus, Check, ShoppingBag, ArrowRight } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import api from '../api/client';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

const samplePrompts = [
  'Fresh Milk',
  'Farm Tomatoes',
  'Amul Butter',
  'Brown Bread',
  'Organic Eggs',
  'Basmati Rice',
  'Potato & Onion',
];

export const VoiceAssistantFAB: React.FC = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [matchedProducts, setMatchedProducts] = useState<Product[]>([]);
  const [searching, setSearching] = useState(false);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);

  const {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    setTranscript,
  } = useVoiceRecognition({
    onResult: (text) => {
      if (text.trim()) {
        searchProducts(text.trim());
      }
    },
  });

  const searchProducts = async (query: string) => {
    try {
      setSearching(true);
      const res = await api.get<{
        success: boolean;
        data: { content: Product[] };
      }>('/products/search', {
        params: { query, size: 4 },
      });
      if (res.data.success && res.data.data) {
        setMatchedProducts(res.data.data.content);
      }
    } catch (err) {
      console.error('Failed to voice search products', err);
    } finally {
      setSearching(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setMatchedProducts([]);
    setTranscript('');
    startListening();
  };

  const handleClose = () => {
    stopListening();
    setIsOpen(false);
  };

  const handlePromptClick = (prompt: string) => {
    setTranscript(prompt);
    searchProducts(prompt);
  };

  const handleViewAllResults = () => {
    if (transcript.trim()) {
      handleClose();
      navigate(`/search?q=${encodeURIComponent(transcript.trim())}`);
    }
  };

  const handleAddToCart = async (product: Product) => {
    await addItem(product, 1);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 1800);
  };

  return (
    <>
      {/* Floating Action Button (FAB) - Quarter Moon at bottom right */}
      {!isOpen && (
        <div className="fixed bottom-0 right-0 z-40">
          <button
            onClick={handleOpen}
            aria-label="Voice Search"
            className="group relative flex items-end justify-start w-28 h-28 bg-gradient-to-tl from-emerald-600 via-emerald-500 to-green-500 hover:from-emerald-700 hover:to-green-600 text-white rounded-tl-full shadow-[-8px_-8px_30px_rgba(16,185,129,0.3)] hover:shadow-[-8px_-8px_40px_rgba(16,185,129,0.5)] transition-all duration-300 overflow-hidden"
          >
            <span className="absolute inset-0 rounded-tl-full bg-emerald-400 opacity-0 group-hover:opacity-30 animate-pulse pointer-events-none"></span>
            <div className="absolute bottom-5 right-5 flex flex-col items-center">
              <Mic className="w-8 h-8 text-white animate-bounce" />
              <span className="text-[10px] font-bold mt-1 tracking-wider uppercase">Voice</span>
            </div>
          </button>
        </div>
      )}

      {/* Voice Assistant - Big Half Moon (30% screen height) */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center pointer-events-none">
          {/* We remove the background dimming. The pointer-events-none on the wrapper ensures users can still click the page if needed, but pointer-events-auto on the modal allows interaction. */}
          <div 
            className="pointer-events-auto bg-white/95 backdrop-blur-xl border-t-4 border-emerald-500 shadow-[0_-20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col items-center justify-start pt-6 px-4 animate-in slide-in-from-bottom duration-300 relative"
            style={{ 
              width: '100%', 
              height: '35vh', 
              borderTopLeftRadius: '50% 100%', 
              borderTopRightRadius: '50% 100%',
              maxWidth: '1200px'
            }}
          >
            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-8 md:right-16 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition z-10"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Central Animated Mic Sphere */}
            <div className="flex flex-col items-center justify-center mt-2 z-10">
              <div className="relative">
                {isListening && (
                  <>
                    <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping"></div>
                    <div className="absolute -inset-4 rounded-full bg-emerald-500/10 animate-pulse"></div>
                  </>
                )}
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
                    isListening
                      ? 'bg-gradient-to-tr from-emerald-600 to-green-500 scale-110 shadow-emerald-500/40'
                      : 'bg-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isListening ? (
                    <Mic className="w-7 h-7 animate-bounce" />
                  ) : (
                    <MicOff className="w-6 h-6 text-slate-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Spoken Transcript / Text Fallback */}
            <div className="mt-4 w-full max-w-md z-10 flex flex-col items-center">
              {transcript ? (
                <p className="text-lg font-black text-slate-800 italic text-center mb-2">
                  "{transcript}"
                </p>
              ) : (
                <p className="text-sm font-semibold text-slate-500 text-center mb-3">
                  Try saying: "Fresh Amul Toned Milk"
                </p>
              )}
              
              {/* Text fallback input just in case mic doesn't work */}
              <div className="w-full relative flex items-center">
                <input
                  type="text"
                  value={transcript}
                  onChange={(e) => {
                    setTranscript(e.target.value);
                    if (e.target.value.trim().length > 2) {
                      searchProducts(e.target.value);
                    }
                  }}
                  placeholder="Or type here if mic isn't working..."
                  className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-4" />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-2 px-4 py-1.5 bg-rose-50 border border-rose-200 rounded-full text-rose-700 text-xs font-bold z-10">
                {error}
              </div>
            )}

            {/* Quick Prompt Suggestions */}
            {!transcript && !error && (
              <div className="mt-4 z-10">
                <div className="flex flex-wrap gap-2 justify-center max-w-lg mx-auto">
                  {samplePrompts.slice(0, 4).map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handlePromptClick(prompt)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 rounded-full text-xs font-semibold transition shadow-xs"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Actions for Transcript */}
            {transcript && (
               <div className="mt-4 z-10">
                 <button
                   onClick={handleViewAllResults}
                   className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-emerald-500/30"
                 >
                   <Search className="w-4 h-4" />
                   <span>Search for "{transcript}"</span>
                 </button>
               </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
