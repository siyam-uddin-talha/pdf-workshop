'use client';

import React, { useRef } from 'react';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  isDraggingOver: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function FileDropzone({
  isDraggingOver,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange
}: FileDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`relative bg-white border-2 border-dashed rounded-2xl transition-all duration-200 p-8 text-center flex flex-col items-center justify-center min-h-[220px] ${
        isDraggingOver 
          ? 'border-teal-600 bg-teal-50/30' 
          : 'border-[#d1ded7] hover:border-teal-700'
      }`}
    >
      <input 
        type="file" 
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
        accept="application/pdf,image/png,image/jpeg"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      />
      <div className="p-4 bg-teal-50 rounded-full text-teal-800 border border-teal-100 mb-4">
        <Upload className="w-8 h-8" />
      </div>
      <h3 className="font-outfit font-semibold text-lg text-[#163327]">
        Drag and drop your PDFs or images here
      </h3>
      <p className="text-sm text-[#4b6155] max-w-md mt-1.5 leading-relaxed">
        Drag and drop your files, or click to browse. Supports <span className="font-semibold text-teal-800">PDF, JPG, and PNG</span>. Files are processed locally on your device and are never uploaded.
      </p>
      <div className="flex flex-wrap gap-2.5 mt-5">
        <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-xs px-2.5 py-1 rounded-md">
          ✓ Batch file upload
        </span>
        <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-xs px-2.5 py-1 rounded-md">
          ✓ Reorder pages visually
        </span>
        <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-xs px-2.5 py-1 rounded-md">
          ✓ Split PDFs into separate files
        </span>
      </div>
    </div>
  );
}
