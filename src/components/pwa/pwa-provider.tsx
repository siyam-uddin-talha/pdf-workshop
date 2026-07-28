'use client';

import React, { useEffect, useState } from 'react';
import { Download, WifiOff, CheckCircle2, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const PWA_DISMISS_KEY = 'pwa_install_dismissed_until';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function PWAProvider({ children }: { children?: React.ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [dismissedInstall, setDismissedInstall] = useState<boolean>(false);

  const dismissPromptFor24Hours = () => {
    try {
      const until = Date.now() + TWENTY_FOUR_HOURS_MS;
      localStorage.setItem(PWA_DISMISS_KEY, until.toString());
    } catch (err) {
      console.warn('[PWA] Unable to save dismissal to localStorage:', err);
    }
    setDismissedInstall(true);
  };

  useEffect(() => {
    // 0. Check if prompt was dismissed within the last 24 hours
    try {
      const dismissedUntil = localStorage.getItem(PWA_DISMISS_KEY);
      if (dismissedUntil && Date.now() < Number(dismissedUntil)) {
        setDismissedInstall(true);
      }
    } catch (err) {
      console.warn('[PWA] Unable to read dismissal from localStorage:', err);
    }

    // 1. Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    
    setIsInstalled(isStandalone);

    // 2. Track network online/offline status
    setIsOffline(!navigator.onLine);

    const handleOnline = () => {
      setIsOffline(false);
      setToastMessage('Back online! Workshop synced.');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setToastMessage('You are offline. PDF Workshop continues working 100% locally.');
      setShowToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Capture beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Track app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      dismissPromptFor24Hours();
      setToastMessage('PDF Workshop installed successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 5. Register Service Worker
    if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope:', registration.scope);
            
            // Check for SW updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker) {
                installingWorker.onstatechange = () => {
                  if (installingWorker.state === 'installed') {
                    if (navigator.serviceWorker.controller) {
                      console.log('[PWA] New content available; please refresh.');
                    } else {
                      console.log('[PWA] Content is cached for offline use.');
                    }
                  }
                };
              }
            };
          })
          .catch((err) => {
            console.warn('[PWA] ServiceWorker registration failed:', err);
          });
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        setIsInstalled(true);
      } else {
        console.log('[PWA] User dismissed the install prompt');
      }
    } catch (err) {
      console.error('[PWA] Install prompt error:', err);
    } finally {
      dismissPromptFor24Hours();
      setInstallPrompt(null);
    }
  };

  return (
    <>
      {children}

      {/* Floating PWA Install & Offline Toast Container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
        {/* Offline Status Badge */}
        {isOffline && (
          <div className="pointer-events-auto bg-amber-900/90 text-amber-100 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-amber-700/50 flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Working Offline (Local Processing)</span>
            </div>
          </div>
        )}

        {/* Generic Toast Notification */}
        {showToast && !isOffline && (
          <div className="pointer-events-auto bg-[#163327] text-emerald-100 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border border-emerald-800/50 flex items-center justify-between text-xs sm:text-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="text-emerald-400 hover:text-white p-1 rounded-lg transition-colors ml-2"
              aria-label="Close notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* PWA Install Prompt Banner */}
        {installPrompt && !isInstalled && !dismissedInstall && (
          <div className="pointer-events-auto bg-[#163327] text-white p-4 rounded-3xl shadow-2xl border border-[#2b5946] flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-6 duration-300">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white leading-snug">
                    Install PDF Workshop
                  </h3>
                  <p className="text-xs text-emerald-200/80 leading-normal">
                    Install app on desktop for instant offline PDF editing.
                  </p>
                </div>
              </div>
              <button
                onClick={dismissPromptFor24Hours}
                className="text-emerald-300/60 hover:text-white p-1 rounded-lg transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#0d2219] font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
              <button
                onClick={dismissPromptFor24Hours}
                className="bg-white/10 hover:bg-white/20 text-emerald-100 font-semibold text-xs py-2.5 px-3 rounded-xl transition-all"
              >
                Not now
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

