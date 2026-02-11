"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSTip, setShowIOSTip] = useState(false);

  useEffect(() => {
    // Don't show if already installed as PWA
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    // Check if dismissed recently
    const dismissed = localStorage.getItem("mai-install-dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    // Detect iOS
    const ua = navigator.userAgent;
    const isiOS = /iPhone|iPad|iPod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // Show iOS tip after a delay
      const timer = setTimeout(() => setShowIOSTip(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Chrome install prompt
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  }

  function dismiss() {
    setShowBanner(false);
    setShowIOSTip(false);
    localStorage.setItem("mai-install-dismissed", Date.now().toString());
  }

  // Android install banner
  if (showBanner) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-4 flex items-center gap-4">
          <div className="w-12 h-12 animated-gradient rounded-xl flex items-center justify-center shrink-0 shadow-md">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-900 text-sm">Get the MAI app</p>
            <p className="text-xs text-gray-500">Install for a better experience</p>
          </div>
          <button
            onClick={handleInstall}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            Install
          </button>
          <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // iOS install tip
  if (showIOSTip && isIOS) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-4 right-4 z-50 animate-slide-up">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 animated-gradient rounded-xl flex items-center justify-center shrink-0 shadow-md">
              <span className="text-white font-bold">M</span>
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-900 text-sm">Add MAI to Home Screen</p>
              <p className="text-xs text-gray-500 mt-1">
                Tap the{" "}
                <svg className="inline w-4 h-4 text-indigo-600 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15m0-3l-3-3m0 0l-3 3m3-3V15" />
                </svg>{" "}
                share button, then &ldquo;Add to Home Screen&rdquo;
              </p>
            </div>
            <button onClick={dismiss} className="text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
