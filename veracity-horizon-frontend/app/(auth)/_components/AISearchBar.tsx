"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { aiSearch } from "@/app/lib/api/ai";

interface AISearchBarProps {
  onSearch?: (query: string, category?: string) => void;
  placeholder?: string;
  className?: string;
}

export default function AISearchBar({ onSearch, placeholder = "Search with AI...", className = "" }: AISearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<{ text: string; category?: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [detectedCategory, setDetectedCategory] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadSuggestions = async () => {
      if (!query || query.length < 3 || query.length > 40) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      try {
        const result = await aiSearch(query);
        if (mounted) {
          setSuggestions(result.ai?.suggestions || []);
          setDetectedCategory(result.ai?.detectedCategory || null);
        }
      } catch {
        setSuggestions([]);
      } finally {
        if (mounted) setIsSearching(false);
      }
    };

    const timeout = setTimeout(loadSuggestions, 300);
    return () => { mounted = false; clearTimeout(timeout); };
  }, [query]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(query, detectedCategory || undefined);
    } else {
      router.push(`/market?search=${encodeURIComponent(query)}`);
    }
  }, [query, detectedCategory, onSearch, router]);

  const handleSuggestionClick = useCallback((suggestion: { text: string; category?: string }) => {
    setQuery(suggestion.text);
    setShowSuggestions(false);
    setDetectedCategory(suggestion.category || null);
    if (onSearch) {
      onSearch(suggestion.text, suggestion.category);
    } else {
      router.push(`/market?search=${encodeURIComponent(suggestion.text)}`);
    }
  }, [onSearch, router]);

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {isSearching && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => { if (suggestions.length) setShowSuggestions(true); }}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder={placeholder}
            className="w-full pl-12 pr-12 py-4 rounded-2xl border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-base"
          />
          {detectedCategory && (
            <span className="absolute right-14 top-1/2 -translate-y-1/2 text-xs font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700 border border-indigo-200">
              {detectedCategory}
            </span>
          )}
        </div>
      </form>

      {/* AI Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-slate-200 rounded-2xl shadow-xl z-40 overflow-hidden">
          <div className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-slate-200">
            <p className="text-xs font-bold text-indigo-700 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.502.06-.998.18-1.476.38a2.25 2.25 0 00-1.476 3.032c.5 1.412 1.956 2.028 3.476 2.028h.002c1.52 0 2.976-.616 3.476-2.028a2.25 2.25 0 00-1.476-3.032 6.768 6.768 0 00-1.476-.38M5 14.5l.75-6.75M5 14.5h9.75M14.25 7.75l.75 3.5m0 0l.75 3.5m-.75-3.5h6.75M14.25 7.75A2.25 2.25 0 0116.5 10h2.25a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-2.25a2.25 2.25 0 01-2.25-2.25V7.75z" />
              </svg>
              AI Suggestions
            </p>
          </div>
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onMouseDown={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-3 hover:bg-indigo-50 flex items-center justify-between transition-colors"
            >
              <span className="text-sm text-slate-700">{suggestion.text}</span>
              <div className="flex items-center gap-2">
                {suggestion.category && (
                  <span className="text-xs font-medium px-2 py-1 rounded-lg bg-indigo-100 text-indigo-700">{suggestion.category}</span>
                )}
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
