'use client';

import React, { useEffect, useState } from 'react';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QueuePage, SourceFile } from '../types/pdf';
import { renderPageToDataUrl } from '@/lib/pdf-service';

interface FullscreenViewerProps {
  isOpen: boolean;
  onClose: () => void;
  fullscreenIndex: number;
  setFullscreenIndex: (index: number | ((prev: number) => number)) => void;
  queue: QueuePage[];
  sourceFiles: SourceFile[];
}

export function FullscreenViewer({
  isOpen,
  onClose,
  fullscreenIndex,
  setFullscreenIndex,
  queue,
  sourceFiles
}: FullscreenViewerProps) {
  // Keyboard navigation for full screen modal
  useEffect(() => {
    if (!isOpen) return;

    const handleFullscreenKeys = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setFullscreenIndex(prev => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        setFullscreenIndex(prev => Math.min(queue.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleFullscreenKeys);
    return () => window.removeEventListener('keydown', handleFullscreenKeys);
  }, [isOpen, queue.length, onClose, setFullscreenIndex]);

  const [highResUrl, setHighResUrl] = useState<string | null>(null);
  const [isLoadingHighRes, setIsLoadingHighRes] = useState<boolean>(false);

  const currentPage = queue[fullscreenIndex];

  useEffect(() => {
    if (!isOpen || !currentPage) return;

    let active = true;

    if (currentPage.isBlank) {
      Promise.resolve().then(() => {
        if (active) {
          setHighResUrl(null);
          setIsLoadingHighRes(false);
        }
      });
      return;
    }

    if (currentPage.imageBytes) {
      Promise.resolve().then(() => {
        if (active) {
          if (currentPage.thumbnailUrl) {
            setHighResUrl(currentPage.thumbnailUrl);
          }
          setIsLoadingHighRes(false);
        }
      });
      return;
    }

    const sourceFile = sourceFiles.find(f => f.id === currentPage.sourceId);
    if (!sourceFile) {
      Promise.resolve().then(() => {
        if (active) {
          setHighResUrl(null);
          setIsLoadingHighRes(false);
        }
      });
      return;
    }

    Promise.resolve().then(() => {
      if (active) {
        setIsLoadingHighRes(true);
      }
    });

    // Render at 1.8x scale (sharp, readable resolution on high-DPI screens)
    renderPageToDataUrl(sourceFile.bytes, currentPage.originalPageIndex, 1.8)
      .then(url => {
        if (active) {
          setHighResUrl(url);
          setIsLoadingHighRes(false);
        }
      })
      .catch(err => {
        console.error('High-res render error:', err);
        if (active) {
          setIsLoadingHighRes(false);
        }
      });

    return () => {
      active = false;
    };
  }, [isOpen, fullscreenIndex, currentPage, sourceFiles]);

  if (!isOpen || queue.length === 0 || !currentPage) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-[#0d1611]/90 backdrop-blur-md z-50 flex items-center justify-center p-0"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.99 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="bg-white w-screen h-screen overflow-hidden flex flex-col shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 md:px-6 border-b border-[#d1ded7]/40 bg-[#f4f7f5]/70">
            <div className="flex items-center gap-3">
              <div className="bg-teal-50 border border-teal-100 p-2 rounded-xl text-teal-800">
                <FileText className="w-5 h-5" />
              </div>
              <div className="max-w-[200px] sm:max-w-[300px]">
                <h3 className="font-outfit font-semibold text-sm md:text-base text-[#163327] truncate" title={currentPage.sourceName}>
                  {currentPage.isBlank ? 'Blank Page' : currentPage.sourceName}
                </h3>
                <p className="text-[10px] md:text-xs text-[#4b6155] font-mono mt-0.5">
                  Original Page: {currentPage.isBlank ? 'None' : currentPage.originalPageIndex + 1} | Rotation: {currentPage.rotation}°
                </p>
              </div>
            </div>

            {/* Page Navigator Controls */}
            <div className="flex items-center gap-2 sm:gap-4 bg-white px-3 py-1.5 rounded-xl border border-[#d1ded7]/60 shadow-sm">
              <button 
                onClick={() => setFullscreenIndex(prev => Math.max(0, prev - 1))}
                disabled={fullscreenIndex === 0}
                type="button"
                className="p-1 rounded-lg hover:bg-[#f4f7f5] disabled:opacity-30 transition-colors text-[#163327] cursor-pointer"
                title="Previous Page (Left Arrow)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1 text-xs md:text-sm font-semibold text-[#163327]">
                <span>Page</span>
                <input 
                  type="number" 
                  min={1} 
                  max={queue.length}
                  value={fullscreenIndex + 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 1 && val <= queue.length) {
                      setFullscreenIndex(val - 1);
                    }
                  }}
                  className="w-12 text-center border border-[#d1ded7] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-lg py-0.5 px-1 text-xs font-mono font-bold text-teal-800 bg-[#f4f7f5]/30"
                />
                <span className="text-[#4b6155] font-normal">of</span>
                <span className="font-mono font-bold">{queue.length}</span>
              </div>

              <button 
                onClick={() => setFullscreenIndex(prev => Math.min(queue.length - 1, prev + 1))}
                disabled={fullscreenIndex === queue.length - 1}
                type="button"
                className="p-1 rounded-lg hover:bg-[#f4f7f5] disabled:opacity-30 transition-colors text-[#163327] cursor-pointer"
                title="Next Page (Right Arrow)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Close Button */}
            <button 
              onClick={onClose}
              type="button"
              className="p-1.5 border border-[#d1ded7] rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all text-[#4b6155] cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Viewport Canvas container */}
          <div className="flex-1 bg-[#102016] p-6 relative flex items-center justify-center min-h-0 select-none overflow-hidden group/viewport">
            
            {/* Floating Side Arrows for Next/Prev */}
            {fullscreenIndex > 0 && (
              <button 
                onClick={() => setFullscreenIndex(prev => prev - 1)}
                type="button"
                className="absolute left-4 z-10 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-xs border border-white/10 hover:bg-black/60 transition-all opacity-0 group-hover/viewport:opacity-100 hidden sm:block cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {fullscreenIndex < queue.length - 1 && (
              <button 
                onClick={() => setFullscreenIndex(prev => prev + 1)}
                type="button"
                className="absolute right-4 z-10 p-2.5 rounded-full bg-black/40 text-white backdrop-blur-xs border border-white/10 hover:bg-black/60 transition-all opacity-0 group-hover/viewport:opacity-100 hidden sm:block cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}            {/* Active Image Page Frame */}
            <div className="max-w-full max-h-full flex items-center justify-center p-2 relative bg-white/5 rounded-2xl border border-white/5 shadow-xl">
              {highResUrl || currentPage.thumbnailUrl ? (
                <div className="relative flex items-center justify-center">
                  <motion.img 
                    key={fullscreenIndex}
                    src={highResUrl || currentPage.thumbnailUrl}
                    alt={`Full-screen Page ${fullscreenIndex + 1}`}
                    style={{ rotate: `${currentPage.rotation}deg` }}
                    initial={{ scale: 0.98, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="h-[calc(100vh-140px)] md:h-[calc(100vh-120px)] max-h-full max-w-full object-contain pointer-events-none drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)] transition-transform duration-200"
                  />
                  {isLoadingHighRes && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/35 backdrop-blur-xs rounded-xl">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] text-teal-400 font-mono bg-black/60 px-2 py-0.5 rounded">Sharp Focus...</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-3 p-12">
                  <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs text-teal-400 font-mono">Loading preview...</span>
                </div>
              )}
            </div>
            {/* Footer bar indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] font-mono px-3 py-1 rounded-full backdrop-blur-xs">
              PAGE {fullscreenIndex + 1} OF {queue.length}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
