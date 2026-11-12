import React, { useEffect, useState } from 'react';
import { Download, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          if (isInstallable) {
            install();
          } else {
            setShowGuideModal(true);
          }
        }}
        className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        aria-label="PWA Dasturni Yuklab Olish"
      >
        <Download className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Yuklab olish (PWA)</span>
        <span className="sm:hidden">PWA</span>
      </button>

      {showGuideModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pwa-modal-title"
        >
          <div className="w-full max-w-md rounded-xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-amber-400" />
                <h3 id="pwa-modal-title" className="text-base font-bold text-white">
                  Qurilmaga Oflayn Dastur Sifatida O&apos;rnatish
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Yopish"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                <strong>MebelPro 3D</strong> to&apos;liq oflayn rejimda (internetsiz) ishlaydi va barcha loyihalaringizni qurilmangiz xotirasida saqlaydi.
              </p>
              {isIOS ? (
                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 text-xs">
                  <p className="font-semibold text-amber-300">iPhone / iPad (Safari) uchun:</p>
                  <p>1. Pastki paneldagi <strong>Ulashish (Share)</strong> tugmasini bosing.</p>
                  <p>2. Ro&apos;yxatdan <strong>&quot;Asosiy ekranga qo&apos;shish&quot; (Add to Home Screen)</strong> bandini tanlang.</p>
                </div>
              ) : (
                <div className="rounded-lg bg-slate-950 p-3.5 border border-slate-800 space-y-1.5 text-xs">
                  <p className="font-semibold text-amber-300">Kompyuter va Android (Chrome / Edge) uchun:</p>
                  <p>1. Brauzer manzil qatorining o&apos;ng tomonidagi <strong>O&apos;rnatish (Install)</strong> belgisini bosing.</p>
                  <p>2. Yoki brauzer menyusidan (⋮) <strong>&quot;Ilovani o&apos;rnatish&quot; (Install app)</strong> tugmasini tanlang.</p>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuideModal(false)}
                className="rounded-lg bg-amber-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-amber-400 transition-colors"
              >
                Tushunarli
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-4 left-3 md:left-4 z-50 flex items-center gap-2 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-semibold text-slate-950 shadow-lg">
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Oflayn rejim — Barcha ma&apos;lumotlar qurilmada saqlanmoqda</span>
    </div>
  );
};
