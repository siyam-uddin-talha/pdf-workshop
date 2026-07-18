'use client';

import React, { useState, useRef } from 'react';
import { 
  Sliders, 
  Sparkles, 
  Layers, 
  Scissors, 
  Zap, 
  Tag, 
  Lock, 
  FileImage, 
  Download,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SourceFile } from '../types/pdf';
import { formatBytes } from '../utils/utils';

const TAB_INFO: Record<string, { title: string; desc: string }> = {
  merge: {
    title: "Merge Files",
    desc: "Combine multiple PDFs or image files into a single, unified document."
  },
  split: {
    title: "Split PDF",
    desc: "Extract specific pages or divide a document into smaller files by page count."
  },
  compress: {
    title: "Compress PDF",
    desc: "Reduce the file size of your document while maintaining optimal image quality."
  },
  watermark: {
    title: "Add Watermark",
    desc: "Apply a custom text stamp or an image watermark onto your document pages."
  },
  password: {
    title: "Encrypt PDF",
    desc: "Add password protection to secure your PDF, or decrypt a secured document."
  },
  metadata: {
    title: "Edit Metadata",
    desc: "Modify document properties such as title, author, and description."
  },
  export: {
    title: "Export Options",
    desc: "Convert PDF pages to image files or package multiple images into a new PDF."
  }
};

interface TweakControlsProps {
  activeTab: 'merge' | 'split' | 'compress' | 'watermark' | 'password' | 'metadata' | 'export';
  setActiveTab: (tab: 'merge' | 'split' | 'compress' | 'watermark' | 'password' | 'metadata' | 'export') => void;
  isProcessing: boolean;
  sourceFiles: SourceFile[];
  activeCount: number;
  excludedCount: number;
  executeMerge: () => void;
  
  splitType: 'ranges' | 'fixed' | 'all';
  setSplitType: (type: 'ranges' | 'fixed' | 'all') => void;
  splitRanges: string;
  setSplitRanges: (val: string) => void;
  splitFixedSize: number;
  setSplitFixedSize: (val: number) => void;
  executeSplit: () => void;
  
  compressPreset: 'aggressive' | 'balanced' | 'max_quality';
  setCompressPreset: (val: 'aggressive' | 'balanced' | 'max_quality') => void;
  customDpi: number;
  setCustomDpi: (val: number) => void;
  jpegQuality: number;
  setJpegQuality: (val: number) => void;
  subsetFonts: boolean;
  setSubsetFonts: (val: boolean) => void;
  lastCompressionResult: { originalSize: number; compressedSize: number } | null;
  executeCompress: () => void;
  
  watermarkType: 'text' | 'image';
  setWatermarkType: (val: 'text' | 'image') => void;
  watermarkText: string;
  setWatermarkText: (val: string) => void;
  watermarkImage: File | null;
  handleWatermarkImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  watermarkPosition: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  setWatermarkPosition: (val: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile') => void;
  watermarkOpacity: number;
  setWatermarkOpacity: (val: number) => void;
  watermarkRotation: number;
  setWatermarkRotation: (val: number) => void;
  watermarkScale: number;
  setWatermarkScale: (val: number) => void;
  watermarkColor: string;
  setWatermarkColor: (val: string) => void;
  executeWatermark: () => void;
  
  passwordAction: 'add' | 'remove';
  setPasswordAction: (val: 'add' | 'remove') => void;
  userPassword: string;
  setUserPassword: (val: string) => void;
  ownerPassword: string;
  setOwnerPassword: (val: string) => void;
  executePasswordLock: () => void;
  
  metadataTitle: string;
  setMetadataTitle: (val: string) => void;
  metadataAuthor: string;
  setMetadataAuthor: (val: string) => void;
  metadataSubject: string;
  setMetadataSubject: (val: string) => void;
  metadataKeywords: string;
  setMetadataKeywords: (val: string) => void;
  executeMetadataSave: () => void;
  
  executeExportToImages: () => void;
}

export function TweakControls({
  activeTab,
  setActiveTab,
  isProcessing,
  sourceFiles,
  activeCount,
  excludedCount,
  executeMerge,
  splitType,
  setSplitType,
  splitRanges,
  setSplitRanges,
  splitFixedSize,
  setSplitFixedSize,
  executeSplit,
  compressPreset,
  setCompressPreset,
  customDpi,
  setCustomDpi,
  jpegQuality,
  setJpegQuality,
  subsetFonts,
  setSubsetFonts,
  lastCompressionResult,
  executeCompress,
  watermarkType,
  setWatermarkType,
  watermarkText,
  setWatermarkText,
  watermarkImage,
  handleWatermarkImageUpload,
  watermarkPosition,
  setWatermarkPosition,
  watermarkOpacity,
  setWatermarkOpacity,
  watermarkRotation,
  setWatermarkRotation,
  watermarkScale,
  setWatermarkScale,
  watermarkColor,
  setWatermarkColor,
  executeWatermark,
  passwordAction,
  setPasswordAction,
  userPassword,
  setUserPassword,
  ownerPassword,
  setOwnerPassword,
  executePasswordLock,
  metadataTitle,
  setMetadataTitle,
  metadataAuthor,
  setMetadataAuthor,
  metadataSubject,
  setMetadataSubject,
  metadataKeywords,
  setMetadataKeywords,
  executeMetadataSave,
  executeExportToImages
}: TweakControlsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const watermarkImgInputRef = useRef<HTMLInputElement>(null);

  const renderTabButton = (tabKey: typeof activeTab, label: string) => (
    <div 
      className="relative"
      onMouseEnter={() => setHoveredTab(tabKey)}
      onMouseLeave={() => setHoveredTab(null)}
    >
      <button 
        onClick={() => setActiveTab(tabKey)}
        type="button"
        className={`w-full py-2 text-[10px] font-bold rounded-lg transition-all transform duration-150 cursor-pointer ${
          activeTab === tabKey 
            ? 'bg-[#163327] text-white shadow-sm hover:scale-[1.02]' 
            : 'text-[#4b6155] hover:text-[#163327] hover:bg-teal-50/50 hover:scale-105 active:scale-95'
        }`}
      >
        {label}
      </button>
      <AnimatePresence>
        {hoveredTab === tabKey && (
          <motion.div 
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-[#163327] text-white text-[11px] p-3 rounded-xl shadow-lg leading-relaxed pointer-events-none border border-teal-800 z-30 font-normal normal-case text-center"
          >
            <div className="font-bold font-outfit text-teal-300 text-[12px] mb-1">{TAB_INFO[tabKey].title}</div>
            {TAB_INFO[tabKey].desc}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-[#163327]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="bg-white border border-[#d1ded7]/70 rounded-2xl shadow-[0_4px_24px_rgba(22,51,39,0.02)] p-6">
      <h3 className="font-outfit font-semibold text-[#163327] text-lg mb-4 flex items-center gap-2">
        <Sliders className="w-4 h-4 text-teal-700" />
        Tweak Controls
      </h3>

      {/* Tab grid selectors */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#f4f7f5] rounded-xl border border-[#d1ded7]/80 mb-6">
        {renderTabButton('merge', 'Merge')}
        {renderTabButton('split', 'Split')}
        {renderTabButton('compress', 'Compress')}
        {renderTabButton('watermark', 'Watermark')}
      </div>

      <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#f4f7f5] rounded-xl border border-[#d1ded7]/80 mb-6">
        {renderTabButton('password', 'Password')}
        {renderTabButton('metadata', 'Metadata')}
        {renderTabButton('export', 'Export')}
      </div>

      {/* Panels */}
      <div className="space-y-5">
        
        {/* MERGE/MASHUP PANEL */}
        {activeTab === 'merge' && (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
              <h4 className="text-[#163327] font-semibold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-700" />
                Merge Settings
              </h4>
              <p className="text-[11px] text-[#4b6155] mt-1 leading-relaxed">
                Combine all loaded PDFs and images into a single document. Pages can be rotated or excluded in the layout grid.
              </p>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-semibold text-[#163327]">Summary Statistics:</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#f4f7f5] p-2 rounded-lg border border-[#d1ded7]/40">
                  <span className="text-[#4b6155]">Selected Pages:</span>
                  <div className="text-sm font-bold text-[#163327] mt-0.5">{activeCount}</div>
                </div>
                <div className="bg-[#f4f7f5] p-2 rounded-lg border border-[#d1ded7]/40">
                  <span className="text-[#4b6155]">Skipped Pages:</span>
                  <div className="text-sm font-bold text-red-700 mt-0.5">{excludedCount}</div>
                </div>
              </div>
            </div>

            <button 
              onClick={executeMerge}
              disabled={isProcessing || activeCount === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Merge & Download PDF</span>
            </button>
          </div>
        )}

        {/* SPLIT PANEL */}
        {activeTab === 'split' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#163327]">Split Mode</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#f4f7f5] p-1 rounded-xl border border-[#d1ded7]/40">
                <button 
                  onClick={() => setSplitType('ranges')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${splitType === 'ranges' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Ranges
                </button>
                <button 
                  onClick={() => setSplitType('fixed')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${splitType === 'fixed' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Fixed Chunks
                </button>
                <button 
                  onClick={() => setSplitType('all')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${splitType === 'all' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  All Pages
                </button>
              </div>
            </div>

            {splitType === 'ranges' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#163327]">Custom Ranges</label>
                <input 
                  type="text" 
                  value={splitRanges}
                  onChange={(e) => setSplitRanges(e.target.value)}
                  placeholder="e.g. 1-2, 4, 6-8" 
                  className="w-full bg-white border border-[#d1ded7] text-[#163327] placeholder-slate-400 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
                />
                <span className="text-[10px] text-[#4b6155] leading-relaxed block mt-1">
                  Enter comma-separated numbers or page ranges (e.g., &quot;1-3, 5&quot;).
                </span>
              </div>
            )}

            {splitType === 'fixed' && (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#163327]">Split Every N Pages</label>
                <input 
                  type="number" 
                  value={splitFixedSize}
                  onChange={(e) => setSplitFixedSize(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  min="1"
                  className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
                />
              </div>
            )}

            {splitType === 'all' && (
              <p className="text-xs text-[#4b6155] leading-relaxed bg-[#f4f7f5] p-3 rounded-lg">
                Each page will be extracted as a separate PDF. The resulting documents will be downloaded inside a ZIP archive.
              </p>
            )}

            <button 
              onClick={executeSplit}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Split Document</span>
            </button>
          </div>
        )}

        {/* COMPRESS PANEL */}
        {activeTab === 'compress' && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-100 text-[#163327] rounded-xl flex items-start space-x-2">
              <Zap className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <span className="font-semibold">Ghostscript Compress Core:</span> Resolves image matrices, flattens font matrices, and recompresses streams server-side.
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#163327]">Compression Presets</label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#f4f7f5] p-1 rounded-xl border border-[#d1ded7]/40">
                <button 
                  onClick={() => { setCompressPreset('aggressive'); setCustomDpi(72); setJpegQuality(60); }}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${compressPreset === 'aggressive' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Aggressive
                </button>
                <button 
                  onClick={() => { setCompressPreset('balanced'); setCustomDpi(150); setJpegQuality(75); }}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${compressPreset === 'balanced' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Balanced
                </button>
                <button 
                  onClick={() => { setCompressPreset('max_quality'); setCustomDpi(300); setJpegQuality(90); }}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${compressPreset === 'max_quality' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Max Quality
                </button>
              </div>
            </div>

            {/* Advanced settings */}
            <div className="p-3 bg-white border border-[#d1ded7]/60 rounded-xl space-y-3">
              <span className="block text-[10px] font-mono font-bold text-[#4b6155] tracking-wider uppercase">Advanced Settings</span>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] text-[#163327]">Max Res (DPI)</label>
                  <input 
                    type="number" 
                    value={customDpi} 
                    onChange={(e) => setCustomDpi(parseInt(e.target.value, 10) || 150)}
                    className="w-full text-xs p-1.5 border border-[#d1ded7] rounded-md outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] text-[#163327]">JPEG Quality</label>
                  <input 
                    type="number" 
                    value={jpegQuality} 
                    min="10"
                    max="100"
                    onChange={(e) => setJpegQuality(parseInt(e.target.value, 10) || 75)}
                    className="w-full text-xs p-1.5 border border-[#d1ded7] rounded-md outline-none"
                  />
                </div>
              </div>

              <label className="flex items-center space-x-2 text-xs text-[#163327] cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={subsetFonts} 
                  onChange={(e) => setSubsetFonts(e.target.checked)}
                  className="rounded accent-teal-600 cursor-pointer"
                />
                <span>Subset Embedded Fonts</span>
              </label>
            </div>

            {/* Size telemetry results */}
            {lastCompressionResult && (
              <div className="bg-[#f4f7f5] p-3 rounded-xl border border-teal-100 space-y-1.5 text-xs">
                <div className="flex justify-between font-semibold text-[#163327]">
                  <span>Original Size:</span>
                  <span>{formatBytes(lastCompressionResult.originalSize)}</span>
                </div>
                <div className="flex justify-between font-semibold text-teal-800">
                  <span>Compressed Size:</span>
                  <span>{formatBytes(lastCompressionResult.compressedSize)}</span>
                </div>
                <div className="text-[10px] text-[#4b6155] border-t border-[#d1ded7]/30 pt-1.5">
                  Reduced file size by {Math.round((1 - lastCompressionResult.compressedSize / lastCompressionResult.originalSize) * 100)}%.
                </div>
              </div>
            )}

            <button 
              onClick={executeCompress}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Compress PDF</span>
            </button>
          </div>
        )}

        {/* WATERMARK PANEL */}
        {activeTab === 'watermark' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#163327]">Watermark Source</label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#f4f7f5] p-1 rounded-xl border border-[#d1ded7]/40">
                <button 
                  onClick={() => setWatermarkType('text')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${watermarkType === 'text' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Text Watermark
                </button>
                <button 
                  onClick={() => setWatermarkType('image')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${watermarkType === 'image' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Image Watermark
                </button>
              </div>
            </div>

            {watermarkType === 'text' ? (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#163327]">Watermark Text</label>
                <input 
                  type="text" 
                  value={watermarkText}
                  onChange={(e) => setWatermarkText(e.target.value)}
                  className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
                />
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#163327]">Watermark Image</label>
                <input 
                  type="file" 
                  ref={watermarkImgInputRef}
                  onChange={handleWatermarkImageUpload}
                  accept="image/png,image/jpeg"
                  className="w-full text-xs text-[#4b6155] border border-[#d1ded7] p-2 rounded-xl bg-white cursor-pointer"
                />
                {watermarkImage && (
                  <span className="text-[10px] text-teal-800 font-bold block mt-1">✓ Selected: {watermarkImage.name}</span>
                )}
              </div>
            )}

            {/* Watermark position */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#163327]">Position</label>
              <select 
                value={watermarkPosition}
                onChange={(e: any) => setWatermarkPosition(e.target.value)}
                className="w-full bg-white border border-[#d1ded7] text-[#163327] rounded-xl text-sm px-3.5 py-2 outline-none focus:border-teal-600 cursor-pointer"
              >
                <option value="center">Center</option>
                <option value="top-left">Top Left</option>
                <option value="top-right">Top Right</option>
                <option value="bottom-left">Bottom Left</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="tile">Tiled</option>
              </select>
            </div>

            {/* Tweak sliders */}
            <div className="p-3 bg-[#f4f7f5] rounded-xl space-y-3 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#163327]">Opacity ({Math.round(watermarkOpacity * 100)}%)</span>
                <input 
                  type="range" 
                  min="0.05" 
                  max="0.9" 
                  step="0.05"
                  value={watermarkOpacity}
                  onChange={(e) => setWatermarkOpacity(parseFloat(e.target.value))}
                  className="accent-teal-600 w-28 cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#163327]">Rotation ({watermarkRotation}°)</span>
                <input 
                  type="range" 
                  min="-180" 
                  max="180" 
                  step="15"
                  value={watermarkRotation}
                  onChange={(e) => setWatermarkRotation(parseInt(e.target.value, 10))}
                  className="accent-teal-600 w-28 cursor-pointer"
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#163327]">Scale (x{watermarkScale})</span>
                <input 
                  type="range" 
                  min="0.2" 
                  max="2.5" 
                  step="0.1"
                  value={watermarkScale}
                  onChange={(e) => setWatermarkScale(parseFloat(e.target.value))}
                  className="accent-teal-600 w-28 cursor-pointer"
                />
              </div>
              {watermarkType === 'text' && (
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#163327]">Watermark Color</span>
                  <input 
                    type="color" 
                    value={watermarkColor}
                    onChange={(e) => setWatermarkColor(e.target.value)}
                    className="w-10 h-6 border rounded cursor-pointer"
                  />
                </div>
              )}
            </div>

            <button 
              onClick={executeWatermark}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Watermark</span>
            </button>
          </div>
        )}

        {/* PASSWORD LOCK PANEL */}
        {activeTab === 'password' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#163327]">Action</label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#f4f7f5] p-1 rounded-xl border border-[#d1ded7]/40">
                <button 
                  onClick={() => setPasswordAction('add')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${passwordAction === 'add' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Encrypt PDF
                </button>
                <button 
                  onClick={() => setPasswordAction('remove')}
                  type="button"
                  className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${passwordAction === 'remove' ? 'bg-white text-[#163327] border border-[#d1ded7]/40' : 'text-[#4b6155]'}`}
                >
                  Decrypt PDF
                </button>
              </div>
            </div>

            {passwordAction === 'add' ? (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#163327]">User Open Password</label>
                  <input 
                    type="password" 
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    placeholder="Required to open PDF"
                    className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#163327]">Owner Password (Permissions)</label>
                  <input 
                    type="password" 
                    value={ownerPassword}
                    onChange={(e) => setOwnerPassword(e.target.value)}
                    placeholder="Optional permission override"
                    className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[#4b6155] leading-relaxed bg-[#f4f7f5] p-3 rounded-lg border">
                Decrypts the document. Note: You must provide the password if the file is encrypted.
              </p>
            )}

            <button 
              onClick={executePasswordLock}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Apply Password Protection</span>
            </button>
          </div>
        )}

        {/* METADATA PANEL */}
        {activeTab === 'metadata' && (
          <div className="space-y-3.5">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#163327]">Document Title</label>
              <input 
                type="text" 
                value={metadataTitle}
                onChange={(e) => setMetadataTitle(e.target.value)}
                placeholder="Title" 
                className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#163327]">Author / Creator</label>
              <input 
                type="text" 
                value={metadataAuthor}
                onChange={(e) => setMetadataAuthor(e.target.value)}
                placeholder="Author Name" 
                className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#163327]">Subject</label>
              <input 
                type="text" 
                value={metadataSubject}
                onChange={(e) => setMetadataSubject(e.target.value)}
                placeholder="Document Subject" 
                className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#163327]">Keywords (comma-separated)</label>
              <input 
                type="text" 
                value={metadataKeywords}
                onChange={(e) => setMetadataKeywords(e.target.value)}
                placeholder="sage, eco, pdf, workshop" 
                className="w-full bg-white border border-[#d1ded7] text-[#163327] focus:border-teal-600 focus:ring-1 focus:ring-teal-600 transition-all rounded-xl text-sm px-3.5 py-2 outline-none"
              />
            </div>

            <button 
              onClick={executeMetadataSave}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Update Metadata</span>
            </button>
          </div>
        )}

        {/* EXPORT PANEL */}
        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl space-y-1.5 text-xs text-[#163327]">
              <h5 className="font-semibold flex items-center gap-1">
                <FileImage className="w-3.5 h-3.5 text-teal-700" />
                Format Conversion
              </h5>
              <p className="text-[11px] text-[#4b6155] leading-relaxed">
                1. <span className="font-bold">Images to PDF:</span> Upload JPG or PNG files to merge them into a PDF.
              </p>
              <p className="text-[11px] text-[#4b6155] leading-relaxed">
                2. <span className="font-bold">PDF to Images:</span> Export pages as individual high-resolution PNG images in a ZIP archive.
              </p>
            </div>

            <button 
              onClick={executeExportToImages}
              disabled={isProcessing || sourceFiles.length === 0}
              type="button"
              className="w-full bg-[#163327] text-white hover:bg-teal-700 font-semibold rounded-xl text-sm px-4.5 py-2.5 transition-all shadow-sm focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 flex items-center justify-center space-x-2 disabled:opacity-40 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF to Images</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
