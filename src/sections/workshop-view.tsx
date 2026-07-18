'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import Link from 'next/link';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Layers, 
  RotateCw, 
  Sliders, 
  Tag, 
  Lock, 
  FileImage, 
  Undo2, 
  Redo2, 
  Download, 
  Eye, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Maximize2, 
  Calendar 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import JSZip from 'jszip';
import { PDFDocument } from 'pdf-lib';

import { 
  loadPdfJs, 
  renderPageToDataUrl, 
  getPdfPageCount, 
  mergePdfs, 
  splitPdf, 
  watermarkPdf, 
  editPdfMetadata, 
  encryptPdf,
  compressPdf
} from '@/lib/pdf-service';

import { QueuePage, SourceFile, ProcessedHistoryItem } from '../types/pdf';
import { formatBytes } from '../utils/utils';

// Components
import { FileDropzone } from '../components/file-dropzone';
import { PageGrid } from '../components/page-grid';
import { TweakControls } from '../components/tweak-controls';
import { HistoryLog } from '../components/history-log';
import { FullscreenViewer } from '../components/fullscreen-viewer';

let globalCounter = 0;
function getUniqueId(prefix: string = 'id'): string {
  globalCounter += 1;
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${globalCounter}`;
}

export function WorkshopView() {
  // --- STATE ---
  const [sourceFiles, setSourceFiles] = useState<SourceFile[]>([]);
  const [queue, setQueue] = useState<QueuePage[]>([]);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'merge' | 'split' | 'compress' | 'watermark' | 'password' | 'metadata' | 'export'>('merge');
  const [isProcessing, startProcessing] = useTransition();
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [pdfJsLoaded, setPdfJsLoaded] = useState(false);

  // Full-screen viewer state
  const [isFullscreenOpen, setIsFullscreenOpen] = useState<boolean>(false);
  const [fullscreenIndex, setFullscreenIndex] = useState<number>(0);

  // Undo/Redo stacks
  const [historyPast, setHistoryPast] = useState<QueuePage[][]>([]);
  const [historyFuture, setHistoryFuture] = useState<QueuePage[][]>([]);

  // Drag and drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Split settings
  const [splitType, setSplitType] = useState<'ranges' | 'fixed' | 'all'>('ranges');
  const [splitRanges, setSplitRanges] = useState<string>('1-2, 3');
  const [splitFixedSize, setSplitFixedSize] = useState<number>(1);

  // Compress settings
  const [compressPreset, setCompressPreset] = useState<'aggressive' | 'balanced' | 'max_quality'>('balanced');
  const [customDpi, setCustomDpi] = useState<number>(150);
  const [jpegQuality, setJpegQuality] = useState<number>(75);
  const [subsetFonts, setSubsetFonts] = useState<boolean>(true);
  const [lastCompressionResult, setLastCompressionResult] = useState<{ originalSize: number; compressedSize: number } | null>(null);

  // Watermark settings
  const [watermarkType, setWatermarkType] = useState<'text' | 'image'>('text');
  const [watermarkText, setWatermarkText] = useState<string>('🌿 Forest Whisper');
  const [watermarkImage, setWatermarkImage] = useState<File | null>(null);
  const [watermarkImageBytes, setWatermarkImageBytes] = useState<ArrayBuffer | null>(null);
  const [watermarkImageFormat, setWatermarkImageFormat] = useState<'png' | 'jpg'>('png');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(0.3);
  const [watermarkRotation, setWatermarkRotation] = useState<number>(-45);
  const [watermarkScale, setWatermarkScale] = useState<number>(1);
  const [watermarkPosition, setWatermarkPosition] = useState<'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile'>('center');
  const [watermarkColor, setWatermarkColor] = useState<string>('#163327');

  // Password settings
  const [passwordAction, setPasswordAction] = useState<'add' | 'remove'>('add');
  const [userPassword, setUserPassword] = useState<string>('');
  const [ownerPassword, setOwnerPassword] = useState<string>('');

  // Metadata settings
  const [metadataTitle, setMetadataTitle] = useState<string>('');
  const [metadataAuthor, setMetadataAuthor] = useState<string>('');
  const [metadataSubject, setMetadataSubject] = useState<string>('');
  const [metadataKeywords, setMetadataKeywords] = useState<string>('');
  const [metadataCreator, setMetadataCreator] = useState<string>('PDF Workshop');
  const [metadataProducer, setMetadataProducer] = useState<string>('Forest Whisper Engine');

  // Recent History list
  const [history, setHistory] = useState<ProcessedHistoryItem[]>([]);
  const [activeNotification, setActiveNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // --- COMPONENT DID MOUNT ---
  useEffect(() => {

    // Load PDF.js on mount
    loadPdfJs()
      .then(() => setPdfJsLoaded(true))
      .catch((err) => {
        console.error('Failed to load PDF.js:', err);
        showNotification('Failed to initialize PDF preview engine. Please reload.', 'error');
      });

    // Load history asynchronously to satisfy strict React effects linter
    Promise.resolve().then(() => {
      const savedHistory = localStorage.getItem('pdf_workshop_history');
      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error('Error loading history:', e);
        }
      }
    });
  }, []);

  // Keyboard shortcut listener for grid organizer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (queue.length === 0) return;

      // Ignore if typing in an input
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedPageId) {
          e.preventDefault();
          removePage(selectedPageId);
        }
      } else if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (e.key === 'y' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        redo();
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        // Navigate selection
        const currentIndex = queue.findIndex(p => p.id === selectedPageId);
        if (currentIndex !== -1) {
          let nextIndex = currentIndex;
          if (e.key === 'ArrowRight') nextIndex = Math.min(queue.length - 1, currentIndex + 1);
          if (e.key === 'ArrowLeft') nextIndex = Math.max(0, currentIndex - 1);
          setSelectedPageId(queue[nextIndex].id);
        } else {
          setSelectedPageId(queue[0].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, selectedPageId, historyPast, historyFuture]);

  // Save history to localStorage whenever it changes
  const saveHistoryList = (newHistory: ProcessedHistoryItem[]) => {
    setHistory(newHistory);
    // Strip binary bytes for localStorage space limits
    const sanitizedHistory = newHistory.map(item => ({
      ...item,
      bytes: undefined // Keep bytes in memory state only
    }));
    localStorage.setItem('pdf_workshop_history', JSON.stringify(sanitizedHistory));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setActiveNotification({ message, type });
    setTimeout(() => {
      setActiveNotification(null);
    }, 5000);
  };

  // --- UNDO / REDO ENGINE ---
  const pushStateToHistory = (newQueue: QueuePage[]) => {
    setHistoryPast(prev => [...prev, queue]);
    setHistoryFuture([]); // clear redo stack
    setQueue(newQueue);
  };

  function undo() {
    if (historyPast.length === 0) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast(prev => prev.slice(0, prev.length - 1));
    setHistoryFuture(prev => [queue, ...prev]);
    setQueue(previous);
    showNotification('Undo applied', 'info');
  }

  function redo() {
    if (historyFuture.length === 0) return;
    const next = historyFuture[0];
    setHistoryFuture(prev => prev.slice(1));
    setHistoryPast(prev => [...prev, queue]);
    setQueue(next);
    showNotification('Redo applied', 'info');
  }

  // --- FILE DROP / UPLOAD HANDLERS ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(e.target.files);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const onDragLeave = () => {
    setIsDraggingOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files) {
      await processFiles(e.dataTransfer.files);
    }
  };

  const processFiles = async (fileList: FileList) => {
    const files = Array.from(fileList);
    setProcessingStatus('Analyzing uploaded documents...');
    
    const newFiles: SourceFile[] = [];
    const newQueuePages: QueuePage[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const fileId = getUniqueId('file');

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        let pageCount = 0;
        try {
          pageCount = await getPdfPageCount(arrayBuffer);
        } catch (e) {
          showNotification(`PDF ${file.name} is password protected or corrupted.`, 'error');
          continue;
        }

        const sourceFile: SourceFile = {
          id: fileId,
          name: file.name,
          bytes: arrayBuffer,
          size: file.size,
          totalPages: pageCount,
        };
        newFiles.push(sourceFile);

        // Pre-populate queue with pages
        for (let i = 0; i < pageCount; i++) {
          const pageId = getUniqueId(`${fileId}_p_${i}`);
          newQueuePages.push({
            id: pageId,
            sourceId: fileId,
            sourceName: file.name,
            originalPageIndex: i,
            rotation: 0,
            isExcluded: false,
            isBlank: false,
          });

          // Trigger asynchronous thumbnail rendering
          triggerThumbnailRender(arrayBuffer, i, pageId);
        }
      } else if (file.type.startsWith('image/')) {
        // Direct image files to PDF page conversion
        const pageId = getUniqueId(`img_${fileId}`);
        
        // Render base64 image immediately for thumbnail
        const reader = new FileReader();
        reader.onloadend = () => {
          setQueue(currentQueue => 
            currentQueue.map(p => p.id === pageId ? { ...p, thumbnailUrl: reader.result as string } : p)
          );
        };
        reader.readAsDataURL(file);

        newQueuePages.push({
          id: pageId,
          sourceId: fileId,
          sourceName: file.name,
          originalPageIndex: 0,
          rotation: 0,
          isExcluded: false,
          isBlank: false,
          imageBytes: arrayBuffer,
          imageType: file.type as 'image/jpeg' | 'image/png'
        });

        newFiles.push({
          id: fileId,
          name: file.name,
          bytes: arrayBuffer,
          size: file.size,
          totalPages: 1
        });
      }
    }

    if (newFiles.length > 0) {
      setSourceFiles(prev => [...prev, ...newFiles]);
      pushStateToHistory([...queue, ...newQueuePages]);
      setSelectedPageId(newQueuePages[0]?.id || null);
      showNotification(`Successfully loaded ${newFiles.length} file(s) into the workshop.`, 'success');
      
      // Auto-populate Metadata values from first PDF if available
      const firstPdf = newFiles.find(f => f.name.endsWith('.pdf'));
      if (firstPdf) {
        setMetadataTitle(firstPdf.name.replace('.pdf', ''));
      }
    }
    setProcessingStatus('');
  };

  const triggerThumbnailRender = async (bytes: ArrayBuffer, pageIndex: number, pageId: string) => {
    try {
      const dataUrl = await renderPageToDataUrl(bytes, pageIndex, 0.35);
      setQueue(currentQueue => 
        currentQueue.map(p => p.id === pageId ? { ...p, thumbnailUrl: dataUrl } : p)
      );
    } catch (e) {
      console.error('Thumbnail render error:', e);
    }
  };

  // --- WORKSPACE ACTIONS ---
  const rotatePage = (pageId: string) => {
    const updated = queue.map(p => {
      if (p.id === pageId) {
        return { ...p, rotation: (p.rotation + 90) % 360 };
      }
      return p;
    });
    pushStateToHistory(updated);
  };

  const togglePageExclude = (pageId: string) => {
    const updated = queue.map(p => {
      if (p.id === pageId) {
        return { ...p, isExcluded: !p.isExcluded };
      }
      return p;
    });
    pushStateToHistory(updated);
  };

  function removePage(pageId: string) {
    const updated = queue.filter(p => p.id !== pageId);
    pushStateToHistory(updated);
    if (selectedPageId === pageId) {
      setSelectedPageId(updated[0]?.id || null);
    }
  }

  const insertBlankPage = () => {
    const blankId = getUniqueId('blank');
    const newBlankPage: QueuePage = {
      id: blankId,
      sourceId: 'blank',
      sourceName: 'Blank Separator Page',
      originalPageIndex: -1,
      rotation: 0,
      isExcluded: false,
      isBlank: true,
      thumbnailUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="170" viewBox="0 0 120 170"><rect width="100%" height="100%" fill="%23ffffff" stroke="%23d1ded7" stroke-dasharray="4"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="11" fill="%234b6155">Blank Page</text></svg>'
    };

    const currentIndex = queue.findIndex(p => p.id === selectedPageId);
    let updatedQueue: QueuePage[] = [];

    if (currentIndex !== -1) {
      // Insert after selected
      updatedQueue = [
        ...queue.slice(0, currentIndex + 1),
        newBlankPage,
        ...queue.slice(currentIndex + 1)
      ];
    } else {
      updatedQueue = [...queue, newBlankPage];
    }

    pushStateToHistory(updatedQueue);
    setSelectedPageId(blankId);
    showNotification('Successfully inserted a blank page.', 'success');
  };

  const clearWorkspace = () => {
    if (confirm('Are you sure you want to clear your current workspace?')) {
      setSourceFiles([]);
      setQueue([]);
      setSelectedPageId(null);
      setHistoryPast([]);
      setHistoryFuture([]);
      setLastCompressionResult(null);
      showNotification('Workspace reset successfully.', 'info');
    }
  };

  // --- DRAG TO REORDER HANDLERS ---
  const handleReorderQueue = (draggedIndex: number, targetIndex: number) => {
    const currentQueue = [...queue];
    const item = currentQueue[draggedIndex];
    currentQueue.splice(draggedIndex, 1);
    currentQueue.splice(targetIndex, 0, item);
    setQueue(currentQueue);
  };

  const handleDragEnd = () => {
    pushStateToHistory(queue);
  };

  // --- EXECUTOR & COMPILER PIPELINES ---
  const triggerDownload = (bytes: Uint8Array, filename: string) => {
    const blob = new Blob([bytes as any], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // HELPER: Compile active pages in the queue into a single PDF
  const compileActiveQueue = async (): Promise<{ bytes: ArrayBuffer; name: string } | null> => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      return null;
    }

    const docsToMerge: any[] = [];
    for (const page of activePages) {
      if (page.isBlank) {
        const tempDoc = await PDFDocument.create();
        tempDoc.addPage([595.276, 841.890]); // A4
        const tempBytes = await tempDoc.save();
        docsToMerge.push({
          bytes: tempBytes,
          pagesToInclude: [0],
          rotations: { 0: page.rotation }
        });
      } else if (page.imageBytes) {
        const imageBytes = page.imageBytes;
        const type = page.imageType;
        const tempDoc = await PDFDocument.create();
        let embeddedImg;
        if (type === 'image/png') {
          embeddedImg = await tempDoc.embedPng(imageBytes);
        } else {
          embeddedImg = await tempDoc.embedJpg(imageBytes);
        }
        const { width, height } = embeddedImg.scale(1);
        const p = tempDoc.addPage([width, height]);
        p.drawImage(embeddedImg, { x: 0, y: 0, width, height });
        const tempBytes = await tempDoc.save();
        docsToMerge.push({
          bytes: tempBytes,
          pagesToInclude: [0],
          rotations: { 0: page.rotation }
        });
      } else {
        const sourceFile = sourceFiles.find(f => f.id === page.sourceId);
        if (!sourceFile) continue;
        
        docsToMerge.push({
          bytes: sourceFile.bytes,
          pagesToInclude: [page.originalPageIndex],
          rotations: { [page.originalPageIndex]: page.rotation }
        });
      }
    }

    const compiledBytes = await mergePdfs(docsToMerge);
    const firstActivePage = activePages[0];
    const baseName = firstActivePage ? firstActivePage.sourceName.replace('.pdf', '') : 'document';
    const name = `${baseName}_compiled.pdf`;

    return { bytes: compiledBytes.buffer as ArrayBuffer, name };
  };

  // 1. MERGE ENGINE
  const executeMerge = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to compile.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Merging documents and generating layout...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to compile.', 'error');
          return;
        }

        const filename = `compiled_document_${Date.now().toString().slice(-4)}.pdf`;
        triggerDownload(new Uint8Array(activeDoc.bytes), filename);

        const compiledUint8 = new Uint8Array(activeDoc.bytes);
        addHistoryItem(filename, compiledUint8, 'Mashup');
        showNotification('Successfully merged and downloaded your PDF document.', 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Merging documents failed: ${err.message || err}`, 'error');
      }
    });
  };

  // 2. SPLIT ENGINE
  const executeSplit = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to split.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Splitting pages and processing document...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to split.', 'error');
          return;
        }

        const splitResults = await splitPdf(activeDoc.bytes, {
          type: splitType,
          rangeValue: splitRanges,
          fixedSize: splitFixedSize,
        });

        if (splitResults.length === 0) {
          showNotification('No pages extracted. Please verify the page range selection.', 'error');
          return;
        }

        if (splitResults.length === 1) {
          triggerDownload(splitResults[0].bytes, splitResults[0].name);
          addHistoryItem(splitResults[0].name, splitResults[0].bytes, 'Split');
        } else {
          const zip = new JSZip();
          splitResults.forEach(file => {
            zip.file(file.name, file.bytes);
          });
          const zipContent = await zip.generateAsync({ type: 'uint8array' });
          
          const blob = new Blob([zipContent as any], { type: 'application/zip' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `split_assets_${activeDoc.name.replace('.pdf', '')}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          addHistoryItem(`split_${activeDoc.name.replace('.pdf', '')}.zip`, zipContent, 'Split (ZIP)', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="170" viewBox="0 0 120 170"><rect width="100%" height="100%" fill="%23f4f7f5" stroke="%230d9488" stroke-dasharray="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%230d9488">ZIP Assets</text></svg>');
        }
        showNotification(`Success! Document split into ${splitResults.length} files.`, 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Splitting document failed: ${err.message}`, 'error');
      }
    });
  };

  // 3. COMPRESS ENGINE (Ghostscript Server-Side)
  const executeCompress = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to compress.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Optimizing resources and compressing document...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to compress.', 'error');
          return;
        }

        const compressedBytes = await compressPdf(activeDoc.bytes, {
          preset: compressPreset,
          dpi: customDpi,
          jpegQuality: jpegQuality,
        });
        const filename = `shrunk_${activeDoc.name}`;
        
        triggerDownload(compressedBytes, filename);
        setLastCompressionResult({
          originalSize: activeDoc.bytes.byteLength,
          compressedSize: compressedBytes.length
        });

        addHistoryItem(filename, compressedBytes, 'Squeezed');
        showNotification('Success! Compressed PDF document generated.', 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Compression failed: ${err.message}`, 'error');
      }
    });
  };

  // 4. WATERMARK ENGINE
  const handleWatermarkImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setWatermarkImage(file);
      setWatermarkImageFormat(file.type === 'image/png' ? 'png' : 'jpg');
      const ab = await file.arrayBuffer();
      setWatermarkImageBytes(ab);
    }
  };

  const executeWatermark = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to watermark.', 'error');
      return;
    }

    if (watermarkType === 'image' && !watermarkImageBytes) {
      showNotification('Please upload a watermark image.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Applying watermark to PDF pages...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to watermark.', 'error');
          return;
        }

        const watermarkedBytes = await watermarkPdf(activeDoc.bytes, {
          type: watermarkType,
          text: watermarkText,
          imageBytes: watermarkImageBytes || undefined,
          imageType: watermarkImageFormat,
          opacity: watermarkOpacity,
          rotation: watermarkRotation,
          scale: watermarkScale,
          position: watermarkPosition,
          color: watermarkColor
        });

        const filename = `watermarked_${activeDoc.name}`;
        triggerDownload(watermarkedBytes, filename);
        addHistoryItem(filename, watermarkedBytes, 'Stamped');
        showNotification('Success! Watermark applied to PDF pages.', 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Failed to apply watermark: ${err.message}`, 'error');
      }
    });
  };

  // 5. SECURITY PASSWORD DESK
  const executePasswordLock = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to configure passwords.', 'error');
      return;
    }

    if (passwordAction === 'add' && !userPassword) {
      showNotification('Please provide a user password to encrypt the document.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Applying encryption settings...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to configure passwords.', 'error');
          return;
        }

        const encryptedBytes = await encryptPdf(activeDoc.bytes, {
          action: passwordAction,
          userPassword,
          ownerPassword: ownerPassword || userPassword
        });

        const filename = `${passwordAction === 'add' ? 'locked_' : 'unlocked_'}${activeDoc.name}`;
        triggerDownload(encryptedBytes, filename);
        addHistoryItem(filename, encryptedBytes, passwordAction === 'add' ? 'Locked' : 'Unlocked');
        showNotification(`Success! PDF protection settings applied.`, 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Protection settings failed: ${err.message}`, 'error');
      }
    });
  };

  // 6. METADATA EDITOR
  const executeMetadataSave = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to edit metadata.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Updating document metadata...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to edit metadata.', 'error');
          return;
        }

        const editedBytes = await editPdfMetadata(activeDoc.bytes, {
          title: metadataTitle,
          author: metadataAuthor,
          subject: metadataSubject,
          keywords: metadataKeywords,
          creator: metadataCreator,
          producer: metadataProducer
        });

        const filename = `tagged_${activeDoc.name}`;
        triggerDownload(editedBytes, filename);
        addHistoryItem(filename, editedBytes, 'Tagged');
        showNotification('Success! Metadata updated successfully.', 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Failed to save metadata: ${err.message}`, 'error');
      }
    });
  };

  // 7. EXPORT PDF AS IMAGE / BATCH MODE
  const executeExportToImages = () => {
    const activePages = queue.filter(p => !p.isExcluded);
    if (activePages.length === 0) {
      showNotification('No active pages in the queue to export as images.', 'error');
      return;
    }

    startProcessing(async () => {
      setProcessingStatus('Converting document pages to high-resolution images...');
      try {
        const activeDoc = await compileActiveQueue();
        if (!activeDoc) {
          showNotification('No active pages in the queue to export as images.', 'error');
          return;
        }

        const total = await getPdfPageCount(activeDoc.bytes);
        const zip = new JSZip();

        for (let i = 0; i < total; i++) {
          const pageDataUrl = await renderPageToDataUrl(activeDoc.bytes, i, 1.5);
          const base64Data = pageDataUrl.replace(/^data:image\/(png|jpg);base64,/, '');
          zip.file(`page_${i + 1}.png`, base64Data, { base64: true });
        }

        const zipContent = await zip.generateAsync({ type: 'uint8array' });
        const blob = new Blob([zipContent as any], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extracted_pages_${activeDoc.name.replace('.pdf', '')}.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addHistoryItem(`extracted_pages_${activeDoc.name.replace('.pdf', '')}.zip`, zipContent, 'PDF to PNG');
        showNotification('Success! All pages exported to a ZIP archive.', 'success');
      } catch (err: any) {
        console.error(err);
        showNotification(`Error: Image export failed: ${err.message}`, 'error');
      }
    });
  };

  // --- HISTORY LIST LOG ---
  const addHistoryItem = async (filename: string, bytes: Uint8Array, operation: string, forceThumbUrl?: string) => {
    let thumb = forceThumbUrl;
    
    if (!thumb && filename.endsWith('.pdf')) {
      try {
        thumb = await renderPageToDataUrl(bytes.buffer as ArrayBuffer, 0, 0.25);
      } catch (e) {
        thumb = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="170" viewBox="0 0 120 170"><rect width="100%" height="100%" fill="%23ffffff" stroke="%23163327" stroke-dasharray="2"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="12" fill="%23163327">PDF Doc</text></svg>';
      }
    } else if (!thumb) {
      thumb = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="170" viewBox="0 0 120 170"><rect width="100%" height="100%" fill="%23f4f7f5" stroke="%23d1ded7"/><path d="M40 55 H80 M40 85 H80 M40 115 H65" stroke="%234b6155" stroke-width="2"/><text x="50%" y="90%" font-size="10" text-anchor="middle" fill="%234b6155">Assets Zip</text></svg>';
    }

    const newItem: ProcessedHistoryItem = {
      id: getUniqueId('hist'),
      name: filename,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      size: bytes.length,
      operation,
      thumbnailUrl: thumb,
      bytes: bytes // cached in memory for download again
    };

    saveHistoryList([newItem, ...history.slice(0, 9)]);
  };

  const downloadHistoryItem = (item: ProcessedHistoryItem) => {
    if (item.bytes) {
      triggerDownload(item.bytes, item.name);
      showNotification(`Document ${item.name} downloaded successfully.`, 'success');
    } else {
      showNotification('The document could not be retrieved from memory. Please reprocess the document.', 'info');
    }
  };

  const clearHistory = () => {
    saveHistoryList([]);
    showNotification('History log cleared.', 'info');
  };

  return (
    <div className="min-h-screen bg-[#f4f7f5] flex flex-col font-sans transition-colors selection:bg-teal-100 selection:text-teal-900">
      
      {/* GLOBAL BANNER NOTIFICATION */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 16 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-3 px-4 py-3 bg-white border border-[#d1ded7] rounded-xl shadow-[0_8px_32px_rgba(22,51,39,0.08)]"
          >
            {activeNotification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-teal-600" />}
            {activeNotification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
            {activeNotification.type === 'info' && <Info className="w-5 h-5 text-emerald-600" />}
            <span className="text-sm font-semibold text-[#163327]">{activeNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <header className="bg-white border-b border-[#d1ded7]/80 sticky top-0 z-30 shadow-[0_2px_12px_rgba(22,51,39,0.01)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <Link href="/" className="flex items-center space-x-3.5 hover:opacity-90 transition-opacity">
              <img src="/logo.png" alt="PDF Workshop Logo" className="w-10 h-10 object-contain rounded-xl" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-outfit font-semibold tracking-tight text-xl text-[#163327]">PDF Workshop</h1>
                  <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-xs px-2 rounded-full">
                    Secure & Private
                  </span>
                </div>
                <p className="text-xs text-[#4b6155] font-mono mt-0.5">
                  Local Processing • Your data never leaves your device
                </p>
              </div>
            </Link>
          </div>

          {/* COOL SYSTEM STATS */}
          <div className="hidden sm:flex flex-wrap items-center gap-4 text-xs font-mono text-[#4b6155] bg-[#f4f7f5] px-3.5 py-2.5 rounded-xl border border-[#d1ded7]/60">
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-teal-700" />
              <span suppressHydrationWarning>
                {(() => {
                  const date = new Date();
                  const yyyy = date.getUTCFullYear();
                  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
                  const dd = String(date.getUTCDate()).padStart(2, '0');
                  return `${yyyy}-${mm}-${dd} UTC`;
                })()}
              </span>
            </div>
            <div className="hidden sm:block text-[#d1ded7]">•</div>
            <div className="flex items-center space-x-1.5">
              <div className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span>Processing Engine: Ready</span>
            </div>
          </div>

        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT WORKSPACE: FILE DROP & VISUAL PAGE ORGANIZER */}
        <section className="flex-1 flex flex-col space-y-6 min-w-0">
          
          {/* DRAG AND DROP ZONE */}
          <FileDropzone 
            isDraggingOver={isDraggingOver}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onFileChange={handleFileChange}
          />

          {/* ACTIVE QUEUE SHEET EDITOR */}
          {queue.length > 0 && (
            <PageGrid 
              queue={queue}
              selectedPageId={selectedPageId}
              onSelectPage={setSelectedPageId}
              onRotatePage={rotatePage}
              onToggleExcludePage={togglePageExclude}
              onRemovePage={removePage}
              onInsertBlankPage={insertBlankPage}
              onClearWorkspace={clearWorkspace}
              onUndo={undo}
              onRedo={redo}
              historyPastLength={historyPast.length}
              historyFutureLength={historyFuture.length}
              onOpenFullscreen={(index) => {
                setFullscreenIndex(index);
                setIsFullscreenOpen(true);
              }}
              onReorderQueue={handleReorderQueue}
              onDragEnd={handleDragEnd}
            />
          )}

          {/* ACTIVE QUEUE EMPTY STATE SUMMARY */}
          {queue.length === 0 && (
            <div className="bg-white border border-[#d1ded7]/70 rounded-xl p-8 shadow-[0_4px_24px_rgba(22,51,39,0.02)]">
              <div className="flex items-center space-x-2">
                <span className="bg-teal-50 text-teal-800 border border-teal-100 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Privacy Guaranteed
                </span>
                <span className="text-[11px] text-[#4b6155] font-mono">Client-side Processing</span>
              </div>
              <h3 className="text-[#163327] font-outfit font-semibold tracking-tight text-lg mt-3">PDF Workshop Workspace</h3>
              <p className="text-[#4b6155] text-sm mt-1 leading-relaxed">
                Merge multiple documents, rearrange or remove pages, compress files for web optimization, and secure PDFs with industry-standard passwords. Upload your files above to begin.
              </p>
            </div>
          )}

          {/* HISTORIC SESSION LOGS list */}
          <HistoryLog 
            history={history}
            onDownloadHistoryItem={downloadHistoryItem}
            onClearHistory={clearHistory}
          />

        </section>

        {/* RIGHT CONTROL PANEL - SETTINGS & ACTIONS */}
        <section className="w-full lg:w-[420px] shrink-0 flex flex-col space-y-6">
          
          {/* PROCESS BLOCKING LOADING SPINNER */}
          {isProcessing && (
            <div className="bg-[#163327] text-white rounded-2xl p-5 shadow-[0_12px_24px_rgba(22,51,39,0.15)] animate-pulse flex items-center space-x-4">
              <RefreshCw className="w-6 h-6 animate-spin text-teal-400 shrink-0" />
              <div>
                <h4 className="font-outfit font-semibold text-sm">Processing Document...</h4>
                <p className="text-xs text-teal-200/90 mt-0.5">{processingStatus || 'Preparing files...'}</p>
              </div>
            </div>
          )}

          {/* ACTIVE TOOL CONTROL BENTO CARD */}
          <TweakControls 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isProcessing={isProcessing}
            sourceFiles={sourceFiles}
            activeCount={queue.length - queue.filter(p => p.isExcluded).length}
            excludedCount={queue.filter(p => p.isExcluded).length}
            executeMerge={executeMerge}
            
            splitType={splitType}
            setSplitType={setSplitType}
            splitRanges={splitRanges}
            setSplitRanges={setSplitRanges}
            splitFixedSize={splitFixedSize}
            setSplitFixedSize={setSplitFixedSize}
            executeSplit={executeSplit}
            
            compressPreset={compressPreset}
            setCompressPreset={setCompressPreset}
            customDpi={customDpi}
            setCustomDpi={setCustomDpi}
            jpegQuality={jpegQuality}
            setJpegQuality={setJpegQuality}
            subsetFonts={subsetFonts}
            setSubsetFonts={setSubsetFonts}
            lastCompressionResult={lastCompressionResult}
            executeCompress={executeCompress}
            
            watermarkType={watermarkType}
            setWatermarkType={setWatermarkType}
            watermarkText={watermarkText}
            setWatermarkText={setWatermarkText}
            watermarkImage={watermarkImage}
            handleWatermarkImageUpload={handleWatermarkImageUpload}
            watermarkPosition={watermarkPosition}
            setWatermarkPosition={setWatermarkPosition}
            watermarkOpacity={watermarkOpacity}
            setWatermarkOpacity={setWatermarkOpacity}
            watermarkRotation={watermarkRotation}
            setWatermarkRotation={setWatermarkRotation}
            watermarkScale={watermarkScale}
            setWatermarkScale={setWatermarkScale}
            watermarkColor={watermarkColor}
            setWatermarkColor={setWatermarkColor}
            executeWatermark={executeWatermark}
            
            passwordAction={passwordAction}
            setPasswordAction={setPasswordAction}
            userPassword={userPassword}
            setUserPassword={setUserPassword}
            ownerPassword={ownerPassword}
            setOwnerPassword={setOwnerPassword}
            executePasswordLock={executePasswordLock}
            
            metadataTitle={metadataTitle}
            setMetadataTitle={setMetadataTitle}
            metadataAuthor={metadataAuthor}
            setMetadataAuthor={setMetadataAuthor}
            metadataSubject={metadataSubject}
            setMetadataSubject={setMetadataSubject}
            metadataKeywords={metadataKeywords}
            setMetadataKeywords={setMetadataKeywords}
            executeMetadataSave={executeMetadataSave}
            
            executeExportToImages={executeExportToImages}
          />

          {/* SAGE BOTANIST INFO BOX */}
          <div className="bg-white border border-[#d1ded7]/70 rounded-xl p-5 text-xs space-y-3">
            <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-xs px-2.5 py-0.5 rounded-full inline-block">
              Privacy & Security
            </span>
            <p className="text-[#4b6155] leading-relaxed">
              This application operates entirely in your browser. Your files are processed locally on your device and are never uploaded to any external server. Zero data collection, 100% private.
            </p>
          </div>

        </section>

      </main>

      {/* FULLSCREEN PDF PAGE VIEWER MODAL */}
      <FullscreenViewer 
        isOpen={isFullscreenOpen}
        onClose={() => setIsFullscreenOpen(false)}
        fullscreenIndex={fullscreenIndex}
        setFullscreenIndex={setFullscreenIndex}
        queue={queue}
      />

      {/* FOOTER SECTION */}
      <footer className="bg-white border-t border-[#d1ded7]/80 py-8 mt-12 text-center text-xs text-[#4b6155]">
        <div className="max-w-3xl mx-auto px-4 space-y-4">
          <p className="font-sans text-[#4b6155]/90">
            PDF Workshop — Browser-powered local document adjustments generated instantly on-demand.
          </p>
          <div className="space-y-1.5 font-sans text-[#4b6155]/70">
            <p>
              PDF Workshop is built and maintained by{" "}
              <a
                href="https://www.sutio.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-teal-800 font-medium transition-colors"
              >
                Sutio
              </a>
              .
            </p>
            <p>
              Made with care by{" "}
              <a
                href="https://www.sutio.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-teal-800 font-medium transition-colors"
              >
                Sutio
              </a>{" "}
              — we build software that helps teams ship faster.
            </p>
            <p>
              © 2026{" "}
              <a
                href="https://www.sutio.co/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline transition-colors"
              >
                Sutio
              </a>
              . All rights reserved.
            </p>
          </div>
          <div className="flex items-center justify-center pt-2">
            <span className="bg-teal-50 text-teal-800 border border-teal-100 font-semibold text-[10px] px-3 py-1 rounded-full">
              100% Private Local Execution
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
