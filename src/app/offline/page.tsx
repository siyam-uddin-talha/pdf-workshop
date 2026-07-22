'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WifiOff, ShieldCheck, Cpu, ArrowLeft, RefreshCw } from 'lucide-react';
import { SITE } from '@/lib/seo';


export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#163327] flex flex-col justify-between p-4 sm:p-8 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/logo.png"
            alt={SITE.name}
            width={40}
            height={40}
            className="rounded-xl shadow-sm transition-transform group-hover:scale-105"
          />
          <div>
            <span className="font-bold text-xl tracking-tight block text-[#163327]">
              {SITE.name}
            </span>
            <span className="text-xs text-[#2b5946] font-medium block">
              Offline-First PDF Engine
            </span>
          </div>
        </Link>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Offline Ready
        </span>
      </header>

      {/* Main Offline Card */}
      <main className="max-w-xl mx-auto w-full my-auto py-12 text-center">
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-8 sm:p-10 shadow-xl border border-[#e1e9e5] relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-50 text-emerald-600 mb-6 shadow-inner border border-emerald-100">
            <WifiOff className="w-10 h-10 stroke-[1.75]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#163327] tracking-tight mb-3">
            You're Offline (and safe!)
          </h1>
          
          <p className="text-[#3b6653] text-sm sm:text-base leading-relaxed mb-8">
            PDF Workshop works 100% locally in your browser memory. Your PDF documents are never uploaded to any external server.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left mb-8">
            <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-[#e5eeea] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-[#163327]">100% Private</h2>
                <p className="text-[11px] text-[#4b7a67]">Zero tracking, zero cloud dependencies.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f8faf9] border border-[#e5eeea] flex items-start gap-3">
              <Cpu className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-xs font-bold text-[#163327]">Local Processing</h2>
                <p className="text-[11px] text-[#4b7a67]">Powered directly by your device CPU.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#163327] text-white font-semibold text-sm hover:bg-[#214a39] active:scale-[0.98] transition-all shadow-md"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Workshop
            </Link>
            
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white text-[#163327] font-semibold text-sm border border-[#cbe0d6] hover:bg-emerald-50 active:scale-[0.98] transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-[#55826f] py-4">
        PDF Workshop by Sutio — Secure Local PDF Workshop App
      </footer>
    </div>
  );
}
