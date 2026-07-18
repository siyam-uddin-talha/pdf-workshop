'use client';

import React from 'react';
import { Download, FileText } from 'lucide-react';
import { ProcessedHistoryItem } from '../types/pdf';
import { formatBytes } from '../utils/utils';

interface HistoryLogProps {
  history: ProcessedHistoryItem[];
  onDownloadHistoryItem: (item: ProcessedHistoryItem) => void;
  onClearHistory: () => void;
}

export function HistoryLog({
  history,
  onDownloadHistoryItem,
  onClearHistory
}: HistoryLogProps) {
  if (history.length === 0) return null;

  return (
    <div className="bg-white border border-[#d1ded7]/70 rounded-2xl p-6">
      <div className="flex items-center justify-between pb-3 border-b border-[#d1ded7]/40 mb-4">
        <h4 className="font-outfit font-semibold text-[#163327] text-base">Processed Documents</h4>
        <button 
          onClick={onClearHistory}
          type="button"
          className="text-xs text-red-700 hover:underline font-semibold cursor-pointer"
        >
          Clear History
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {history.map((item) => (
          <div 
            key={item.id}
            onClick={() => onDownloadHistoryItem(item)}
            title="Click to download again"
            className="group border border-[#d1ded7] rounded-xl p-3 bg-[#f4f7f5]/30 hover:bg-white hover:border-teal-700 cursor-pointer transition-all duration-150 flex flex-col justify-between"
          >
            <div className="h-28 bg-white border border-[#d1ded7]/50 rounded-lg overflow-hidden flex items-center justify-center relative mb-2">
              {item.thumbnailUrl ? (
                <img src={item.thumbnailUrl} alt={item.name} className="max-h-full max-w-full object-contain" />
              ) : (
                <FileText className="w-8 h-8 text-teal-800" />
              )}
              
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-[#163327]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-semibold space-x-1">
                <Download className="w-3.5 h-3.5 animate-bounce" />
                <span>Download</span>
              </div>
            </div>

            <div>
              <h5 className="text-[11px] font-semibold text-[#163327] truncate" title={item.name}>
                {item.name}
              </h5>
              <div className="flex items-center justify-between text-[9px] text-[#4b6155] font-mono mt-0.5">
                <span>{item.timestamp}</span>
                <span>{formatBytes(item.size)}</span>
              </div>
              <span className="inline-block mt-1 bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-[8px] px-1.5 py-0.2 rounded-full">
                {item.operation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
