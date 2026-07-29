"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { DarkModeProvider, useDarkMode } from "./DarkModeToggle";
import { NotificationBell } from "./NotificationBell";
import AINavigationAssistant from "./AINavigationAssistant";

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark, toggleDarkMode } = useDarkMode();
  const isAuthPage = pathname.startsWith("/auth") && !pathname.includes("/dashboard");
  const isPublicPage = pathname === "/" || pathname === "/market";

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      {!isAuthPage && !isPublicPage && (
        <header className="fixed top-0 left-0 right-0 z-40 glass-dark border-b border-white/10">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-white/80">Veracity Horizon</span>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors"
                aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDark ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
                {isDark ? "Light" : "Dark"}
              </button>
            </div>
          </div>
        </header>
      )}
      <main id="main-content" className={!isAuthPage && !isPublicPage ? "pt-12" : ""}>
        {children}
      </main>
      {!isAuthPage && !isPublicPage && <AINavigationAssistant />}
    </>
  );
}

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <DarkModeProvider>
      <ClientLayout>{children}</ClientLayout>
    </DarkModeProvider>
  );
}