'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  RotateCw, 
  Trash2, 
  Undo2, 
  Redo2, 
  CheckCircle2, 
  Eye, 
  Maximize2 
} from 'lucide-react';
import { motion } from 'motion/react';
import { QueuePage } from '../types/pdf';

interface PageGridProps {
  queue: QueuePage[];
  selectedPageId: string | null;
  onSelectPage: (id: string | null) => void;
  onRotatePage: (id: string) => void;
  onToggleExcludePage: (id: string) => void;
  onRemovePage: (id: string) => void;
  onInsertBlankPage: () => void;
  onClearWorkspace: () => void;
  onUndo: () => void;
  onRedo: () => void;
  historyPastLength: number;
  historyFutureLength: number;
  onOpenFullscreen: (index: number) => void;
  onReorderQueue: (draggedIndex: number, targetIndex: number) => void;
  onDragEnd: () => void;
}

export function PageGrid({
  queue,
  selectedPageId,
  onSelectPage,
  onRotatePage,
  onToggleExcludePage,
  onRemovePage,
  onInsertBlankPage,
  onClearWorkspace,
  onUndo,
  onRedo,
  historyPastLength,
  historyFutureLength,
  onOpenFullscreen,
  onReorderQueue,
  onDragEnd
}: PageGridProps) {
  const [draggedPageIndex, setDraggedPageIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedPageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedPageIndex === null || draggedPageIndex === index) return;
    onReorderQueue(draggedPageIndex, index);
    setDraggedPageIndex(index);
  };

  const handleDragEndInternal = () => {
    setDraggedPageIndex(null);
    onDragEnd();
  };

  const totalPagesInQueue = queue.length;
  const excludedCount = queue.filter(p => p.isExcluded).length;
  const activeCount = totalPagesInQueue - excludedCount;

  return (
    <div className="bg-white border border-[#d1ded7]/70 rounded-2xl shadow-[0_4px_24px_rgba(22,51,39,0.02)] p-6 flex flex-col space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#d1ded7]/40">
        <div>
          <h3 className="font-outfit font-semibold text-lg text-[#163327] flex items-center gap-2">
            <span>Document Pages</span>
            <span className="bg-teal-50 text-teal-800 border border-teal-100 font-mono text-xs px-2.5 py-0.5 rounded-full font-semibold">
              {activeCount} / {totalPagesInQueue} pages selected
            </span>
          </h3>
          <p className="text-xs text-[#4b6155] mt-1">
            Rearrange pages by dragging them. Use the action buttons to edit individual pages, or navigate using your keyboard arrows and Delete key.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={onUndo}
            disabled={historyPastLength === 0}
            title="Undo (Ctrl+Z)"
            type="button"
            className="p-2 border border-[#d1ded7] rounded-xl hover:bg-[#f4f7f5] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Undo2 className="w-4 h-4 text-[#163327]" />
          </button>
          <button 
            onClick={onRedo}
            disabled={historyFutureLength === 0}
            title="Redo (Ctrl+Y)"
            type="button"
            className="p-2 border border-[#d1ded7] rounded-xl hover:bg-[#f4f7f5] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Redo2 className="w-4 h-4 text-[#163327]" />
          </button>
          <div className="h-6 w-px bg-[#d1ded7] mx-1" />
          <button 
            onClick={onInsertBlankPage}
            type="button"
            className="bg-teal-50 text-teal-800 border border-teal-100 hover:bg-teal-100 font-semibold rounded-xl text-xs px-3.5 py-2 inline-flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add a blank page
          </button>
          <button 
            onClick={onClearWorkspace}
            type="button"
            className="border border-[#d1ded7] text-red-700 hover:bg-red-50 font-semibold rounded-xl text-xs px-3.5 py-2 transition-all cursor-pointer"
          >
            Clear Workspace
          </button>
        </div>
      </div>

      {/* Page Grid Canvas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-5 max-h-[580px] overflow-y-auto p-2 border border-[#d1ded7]/30 rounded-xl bg-[#f4f7f5]/40">
        {queue.map((page, index) => {
          const isSelected = selectedPageId === page.id;
          return (
            <div 
              key={page.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEndInternal}
              onClick={() => onSelectPage(page.id)}
              className={`relative bg-white rounded-xl border transition-all cursor-grab active:cursor-grabbing p-3 flex flex-col justify-between group ${
                page.isExcluded 
                  ? 'border-gray-200 bg-gray-50/80 opacity-60' 
                  : isSelected 
                    ? 'ring-2 ring-teal-600 border-teal-600 shadow-[0_8px_16px_rgba(13,148,136,0.08)] scale-102' 
                    : 'border-[#d1ded7] hover:border-teal-700 hover:shadow-[0_4px_12px_rgba(22,51,39,0.03)]'
              }`}
            >
              {/* Exclusion overlay indicator */}
              {page.isExcluded && (
                <div className="absolute top-3 left-3 bg-red-50 text-red-800 border border-red-100 px-2 py-0.5 text-[10px] font-bold rounded-md z-10 font-mono">
                  SKIPPED
                </div>
              )}

              {/* Top operation actions visible on hover */}
              <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity z-10 bg-white/90 p-1 rounded-lg shadow-sm border border-[#d1ded7]/50">
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onOpenFullscreen(index);
                  }}
                  type="button"
                  title="Full-screen View"
                  className="p-1 hover:bg-[#f4f7f5] rounded-md text-teal-700 cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRotatePage(page.id); }}
                  type="button"
                  title="Spin Page (+90°)"
                  className="p-1 hover:bg-[#f4f7f5] rounded-md text-teal-700 cursor-pointer"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onToggleExcludePage(page.id); }}
                  type="button"
                  title={page.isExcluded ? 'Include Page' : 'Skip Page'}
                  className={`p-1 rounded-md cursor-pointer ${page.isExcluded ? 'text-teal-700 hover:bg-teal-50' : 'text-red-700 hover:bg-red-50'}`}
                >
                  {page.isExcluded ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onRemovePage(page.id); }}
                  type="button"
                  title="Remove from workspace"
                  className="p-1 hover:bg-red-50 rounded-md text-red-600 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Thumbnail Container */}
              <div className="h-40 w-full relative flex items-center justify-center bg-[#f4f7f5] rounded-lg overflow-hidden border border-[#d1ded7]/40 mb-3 select-none">
                {page.thumbnailUrl ? (
                  <motion.img 
                    src={page.thumbnailUrl} 
                    alt={`Page ${index + 1}`}
                    style={{ rotate: `${page.rotation}deg` }}
                    className="max-h-full max-w-full object-contain pointer-events-none transition-transform duration-200"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2 p-2">
                    <div className="w-6 h-6 border-2 border-teal-700 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-[#4b6155] font-mono">Generating preview...</span>
                  </div>
                )}
                
                {/* Number tag */}
                <div className="absolute bottom-2 left-2 bg-[#163327] text-white font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold select-none shadow-sm">
                  P. {index + 1}
                </div>
              </div>

              {/* Metadata Labels */}
              <div className="text-left">
                <h4 className="text-[#163327] font-semibold text-[11px] truncate" title={page.sourceName}>
                  {page.isBlank ? 'Blank Page' : page.sourceName}
                </h4>
                <div className="flex items-center justify-between text-[9px] text-[#4b6155] font-mono mt-0.5">
                  <span>Original Page: {page.isBlank ? 'None' : page.originalPageIndex + 1}</span>
                  <span>Rotation: {page.rotation}°</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
