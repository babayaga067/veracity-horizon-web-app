"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { aiNavigate, type AINavigateResult } from "@/app/lib/api/ai";
import { useAuthRedirect } from "@/app/(auth)/_components/useAuthRedirect";

const QUICK_ACTIONS = [
  { id: "market", label: "Marketplace", query: "browse all auctions", href: "/market" },
  { id: "bids", label: "My Bids", query: "show my bids", href: "/dashboard/bids" },
  { id: "won", label: "Won Auctions", query: "show my won auctions", href: "/dashboard/won-auctions" },
  { id: "create", label: "Create Auction", query: "create new auction", href: "/market" },
  { id: "profile", label: "Profile", query: "go to profile", href: "/dashboard/profile" },
];

export default function AINavigationAssistant() {
  const { loading } = useAuthRedirect();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [result, setResult] = useState<AINavigateResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);
    setIsPulsing(false);
    try {
      const res = await aiNavigate(input);
      setResult(res);
      if (res.success && res.data?.href) {
        router.push(res.data.href);
        setOpen(false);
        setInput("");
      }
    } catch {
      setResult({ success: false, message: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }, [input, router]);

  const handleQuickAction = useCallback((href: string) => {
    router.push(href);
    setOpen(false);
  }, [router]);

  if (loading) return null;

  return (
    <>
      {/* Floating AI Button with Pulse */}
      <button
        onClick={() => { setOpen((prev) => !prev); setIsPulsing(false); }}
        className="fixed bottom-8 right-8 z-50 group transform-gpu will-change-transform"
        aria-label="AI Assistant"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 opacity-0 group-hover:opacity-20 transition-opacity"></div>
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.502.06-.998.18-1.476.38a2.25 2.25 0 00-1.476 3.032c.5 1.412 1.956 2.028 3.476 2.028h.002c1.52 0 2.976-.616 3.476-2.028a2.25 2.25 0 00-1.476-3.032 6.768 6.768 0 00-1.476-.38M5 14.5l.75-6.75M5 14.5h9.75M14.25 7.75l.75 3.5m0 0l.75 3.5m-.75-3.5h6.75M14.25 7.75A2.25 2.25 0 0116.5 10h2.25a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-2.25a2.25 2.25 0 01-2.25-2.25V7.75z" />
            </svg>
          </div>
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></span>
        </div>
      </button>

      {/* AI Panel */}
      {open && (
        <div className="fixed bottom-28 right-8 z-50 w-[28rem] max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-slate-700/60 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-slate-700/60 bg-gradient-to-r from-indigo-600/20 to-violet-600/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.502.06-.998.18-1.476.38a2.25 2.25 0 00-1.476 3.032c.5 1.412 1.956 2.028 3.476 2.028h.002c1.52 0 2.976-.616 3.476-2.028a2.25 2.25 0 00-1.476-3.032 6.768 6.768 0 00-1.476-.38M5 14.5l.75-6.75M5 14.5h9.75M14.25 7.75l.75 3.5m0 0l.75 3.5m-.75-3.5h6.75M14.25 7.75A2.25 2.25 0 0116.5 10h2.25a.75.75 0 01.75.75v6.75a.75.75 0 01-.75.75h-2.25a2.25 2.25 0 01-2.25-2.25V7.75z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">AI Assistant</h3>
                <p className="text-xs text-slate-400">Ask anything about auctions or navigation</p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4 max-h-96 overflow-y-auto">
            {/* Quick Actions */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Actions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.href)}
                    className="text-xs px-3 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation Input */}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Try "show won auctions"'
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-slate-700"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
              >
                {isLoading ? "..." : "Go"}
              </button>
            </form>

            {/* Result */}
            {result && (
              <div className="text-sm">
                {result.success ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
                    <p className="font-semibold">Navigating to <span className="text-white">{result.data?.label}</span></p>
                    <p className="text-xs text-slate-400 mt-1">{result.data?.description}</p>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300">
                    <p className="font-semibold">{result.message}</p>
                    {result.suggestions && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs text-slate-400">Try one of these:</p>
                        <div className="flex flex-wrap gap-2">
                          {result.suggestions.map((s) => (
                            <button
                              key={s.href}
                              onClick={() => handleQuickAction(s.href)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
