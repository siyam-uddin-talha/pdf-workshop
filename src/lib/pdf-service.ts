import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

// Options interfaces
export interface WatermarkOptions {
  type: 'text' | 'image';
  text?: string;
  imageBytes?: ArrayBuffer;
  imageType?: 'jpg' | 'png';
  opacity: number;
  rotation: number; // degrees
  scale: number; // 0.1 to 2
  position: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'tile';
  color?: string; // hex color e.g. #163327
}

export interface PasswordOptions {
  action: 'add' | 'remove';
  userPassword?: string;
  ownerPassword?: string;
}

export interface PDFMetadata {
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string;
  creator?: string;
  producer?: string;
}

// Dynamically load PDFJS from CDN to prevent SSR/Webpack compilation errors
let pdfjsPromise: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject('PDF.js can only be loaded in the browser');
  }

  const win = window as any;
  if (win.pdfjsLib) {
    return Promise.resolve(win.pdfjsLib);
  }

  if (pdfjsPromise) {
    return pdfjsPromise;
  }

  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      win.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      resolve(win.pdfjsLib);
    };
    script.onerror = (err) => {
      pdfjsPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return pdfjsPromise;
}

/**
 * Render a specific page of a PDF as a thumbnail (data URL) using PDF.js
 */
export async function renderPageToDataUrl(
  pdfBytes: ArrayBuffer | Uint8Array,
  pageIndex: number,
  scale: number = 0.4
): Promise<string> {
  const pdfjs = await loadPdfJs();
  // Clone the buffer to prevent PDF.js Web Worker from detaching the original buffer in the main thread
  const clonedBytes = pdfBytes instanceof Uint8Array
    ? new Uint8Array(pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength))
    : new Uint8Array(pdfBytes.slice(0));
  const loadingTask = pdfjs.getDocument({ data: clonedBytes });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageIndex + 1);

  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Could not create 2D canvas context');
  }

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({ canvasContext: context, viewport }).promise;
  return canvas.toDataURL('image/png');
}

/**
 * Get the total number of pages in a PDF
 */
export async function getPdfPageCount(pdfBytes: ArrayBuffer | Uint8Array): Promise<number> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    return pdfDoc.getPageCount();
  } catch (error) {
    // If encrypted, fallback to loading via PDF.js which can tell us page count without decrypting
    try {
      const pdfjs = await loadPdfJs();
      // Clone the buffer to prevent PDF.js Web Worker from detaching the original buffer in the main thread
      const clonedBytes = pdfBytes instanceof Uint8Array
        ? new Uint8Array(pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength))
        : new Uint8Array(pdfBytes.slice(0));
      const loadingTask = pdfjs.getDocument({ data: clonedBytes });
      const pdf = await loadingTask.promise;
      return pdf.numPages;
    } catch (e) {
      console.error('Failed to get page count:', e);
      return 0;
    }
  }
}

/**
 * Convert images (JPG/PNG) to a single PDF page or create a multi-page PDF from images
 */
export async function imagesToPdf(
  images: { bytes: ArrayBuffer; name: string; type: 'image/jpeg' | 'image/png' }[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();

  for (const img of images) {
    let embeddedImage;
    if (img.type === 'image/png') {
      embeddedImage = await pdfDoc.embedPng(img.bytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(img.bytes);
    }

    const { width, height } = embeddedImage.scale(1);
    const page = pdfDoc.addPage([width, height]);
    page.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width,
      height,
    });
  }

  return await pdfDoc.save();
}

/**
 * Merge multiple PDFs or specific pages from them, applying optional page-level rotations.
 */
export async function mergePdfs(
  documents: {
    bytes: ArrayBuffer;
    pagesToInclude?: number[]; // 0-indexed page indices. If empty, include all.
    rotations?: Record<number, number>; // pageIndex -> rotation degrees (e.g. 90, 180, 270)
  }[]
): Promise<Uint8Array> {
  const mergedPdf = await PDFDocument.create();

  for (const doc of documents) {
    const srcDoc = await PDFDocument.load(doc.bytes, { ignoreEncryption: true });
    const totalPages = srcDoc.getPageCount();
    
    // Determine which page indices to include
    const indices = doc.pagesToInclude && doc.pagesToInclude.length > 0
      ? doc.pagesToInclude.filter(idx => idx >= 0 && idx < totalPages)
      : Array.from({ length: totalPages }, (_, i) => i);

    if (indices.length === 0) continue;

    // Copy pages
    const copiedPages = await mergedPdf.copyPages(srcDoc, indices);

    // Add and apply optional rotation
    copiedPages.forEach((page, index) => {
      const originalPageIndex = indices[index];
      const rotationDeg = doc.rotations?.[originalPageIndex] || 0;
      if (rotationDeg !== 0) {
        const currentRotation = page.getRotation().angle;
        page.setRotation(degrees((currentRotation + rotationDeg) % 360));
      }
      mergedPdf.addPage(page);
    });
  }

  return await mergedPdf.save();
}

/**
 * Split a single PDF into multiple documents
 */
export async function splitPdf(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: {
    type: 'ranges' | 'fixed' | 'all';
    rangeValue?: string; // e.g. "1-5, 8, 10-12"
    fixedSize?: number; // e.g. every 2 pages
  }
): Promise<{ name: string; bytes: Uint8Array }[]> {
  const srcDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();
  const results: { name: string; bytes: Uint8Array }[] = [];

  if (options.type === 'all') {
    // Every page becomes its own file
    for (let i = 0; i < totalPages; i++) {
      const newDoc = await PDFDocument.create();
      const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
      newDoc.addPage(copiedPage);
      const bytes = await newDoc.save();
      results.push({
        name: `page_${i + 1}.pdf`,
        bytes,
      });
    }
  } else if (options.type === 'fixed') {
    const size = options.fixedSize || 1;
    let currentIdx = 0;
    let fileIndex = 1;

    while (currentIdx < totalPages) {
      const endIdx = Math.min(currentIdx + size, totalPages);
      const indices = Array.from({ length: endIdx - currentIdx }, (_, idx) => currentIdx + idx);
      
      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(p => newDoc.addPage(p));
      
      const bytes = await newDoc.save();
      results.push({
        name: `part_${fileIndex}_pages_${currentIdx + 1}-${endIdx}.pdf`,
        bytes,
      });

      currentIdx = endIdx;
      fileIndex++;
    }
  } else if (options.type === 'ranges') {
    // Parse ranges: "1-5, 8, 10-12" -> [[1,5], [8,8], [10,12]]
    const rangeStr = options.rangeValue || '';
    const parts = rangeStr.split(',');
    let groupIndex = 1;

    for (const part of parts) {
      const cleanPart = part.trim();
      if (!cleanPart) continue;

      let start = 0;
      let end = 0;

      if (cleanPart.includes('-')) {
        const [sStr, eStr] = cleanPart.split('-');
        start = parseInt(sStr.trim(), 10);
        end = parseInt(eStr.trim(), 10);
      } else {
        start = parseInt(cleanPart, 10);
        end = start;
      }

      if (isNaN(start) || isNaN(end)) continue;

      // Convert 1-based indexing to 0-based page index
      const startIdx = Math.max(0, start - 1);
      const endIdx = Math.min(totalPages - 1, end - 1);

      if (startIdx > endIdx || startIdx >= totalPages) continue;

      const indices = Array.from({ length: endIdx - startIdx + 1 }, (_, idx) => startIdx + idx);

      const newDoc = await PDFDocument.create();
      const copiedPages = await newDoc.copyPages(srcDoc, indices);
      copiedPages.forEach(p => newDoc.addPage(p));

      const bytes = await newDoc.save();
      results.push({
        name: `range_${start}-${end}.pdf`,
        bytes,
      });
      groupIndex++;
    }
  }

  return results;
}

/**
 * Apply a watermarking text or image overlay
 */
export async function watermarkPdf(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: WatermarkOptions
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();

  let embeddedImage: any = null;
  if (options.type === 'image' && options.imageBytes) {
    if (options.imageType === 'png') {
      embeddedImage = await pdfDoc.embedPng(options.imageBytes);
    } else {
      embeddedImage = await pdfDoc.embedJpg(options.imageBytes);
    }
  }

  // Load font for text watermark
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Parse color hex to RGB
  let textColor = rgb(0.08, 0.2, 0.15); // Default theme color
  if (options.color) {
    const hex = options.color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      textColor = rgb(r, g, b);
    }
  }

  // Sanitize the watermark text to avoid "WinAnsi cannot encode" errors (e.g., emojis or unsupported characters)
  let text = options.text || '';
  let fontSize = 32 * options.scale;
  let textWidth = 0;
  let textHeight = fontSize;

  if (options.type === 'text' && text) {
    let sanitizedText = '';
    const chars = Array.from(text);
    for (const char of chars) {
      try {
        font.encodeText(char);
        sanitizedText += char;
      } catch (e) {
        // Skip un-encodable characters (like 🌿 or other emojis)
      }
    }
    text = sanitizedText.trim();
    if (!text) {
      text = 'WATERMARK';
    }
    textWidth = font.widthOfTextAtSize(text, fontSize);
  }

  for (const page of pages) {
    const { width, height } = page.getSize();

    if (options.type === 'text' && text) {
      if (options.position === 'tile') {
        // Tile watermark across the page
        const stepX = textWidth + 120;
        const stepY = textHeight + 120;
        for (let x = 40; x < width; x += stepX) {
          for (let y = 40; y < height; y += stepY) {
            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: textColor,
              opacity: options.opacity,
              rotate: degrees(options.rotation),
            });
          }
        }
      } else {
        // Absolute single positioning
        let x = (width - textWidth) / 2;
        let y = (height - textHeight) / 2;

        if (options.position === 'top-left') {
          x = 40;
          y = height - 60;
        } else if (options.position === 'top-right') {
          x = width - textWidth - 40;
          y = height - 60;
        } else if (options.position === 'bottom-left') {
          x = 40;
          y = 40;
        } else if (options.position === 'bottom-right') {
          x = width - textWidth - 40;
          y = 40;
        }

        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: textColor,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      }
    } else if (options.type === 'image' && embeddedImage) {
      const imgWidth = embeddedImage.width * options.scale;
      const imgHeight = embeddedImage.height * options.scale;

      if (options.position === 'tile') {
        const stepX = imgWidth + 120;
        const stepY = imgHeight + 120;
        for (let x = 40; x < width; x += stepX) {
          for (let y = 40; y < height; y += stepY) {
            page.drawImage(embeddedImage, {
              x,
              y,
              width: imgWidth,
              height: imgHeight,
              opacity: options.opacity,
              rotate: degrees(options.rotation),
            });
          }
        }
      } else {
        let x = (width - imgWidth) / 2;
        let y = (height - imgHeight) / 2;

        if (options.position === 'top-left') {
          x = 40;
          y = height - imgHeight - 40;
        } else if (options.position === 'top-right') {
          x = width - imgWidth - 40;
          y = height - imgHeight - 40;
        } else if (options.position === 'bottom-left') {
          x = 40;
          y = 40;
        } else if (options.position === 'bottom-right') {
          x = width - imgWidth - 40;
          y = 40;
        }

        page.drawImage(embeddedImage, {
          x,
          y,
          width: imgWidth,
          height: imgHeight,
          opacity: options.opacity,
          rotate: degrees(options.rotation),
        });
      }
    }
  }

  return await pdfDoc.save();
}

/**
 * Edit PDF metadata fields
 */
export async function editPdfMetadata(
  pdfBytes: ArrayBuffer | Uint8Array,
  metadata: PDFMetadata
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });

  if (metadata.title !== undefined) pdfDoc.setTitle(metadata.title);
  if (metadata.author !== undefined) pdfDoc.setAuthor(metadata.author);
  if (metadata.subject !== undefined) pdfDoc.setSubject(metadata.subject);
  if (metadata.keywords !== undefined) pdfDoc.setKeywords(metadata.keywords.split(',').map(k => k.trim()));
  if (metadata.creator !== undefined) pdfDoc.setCreator(metadata.creator);
  if (metadata.producer !== undefined) pdfDoc.setProducer(metadata.producer);

  return await pdfDoc.save();
}

/**
 * Encrypt/Decrypt PDF with password protection using server-side Ghostscript engine
 */
export async function encryptPdf(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: PasswordOptions
): Promise<Uint8Array> {
  try {
    const formData = new FormData();
    const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
    formData.append('file', blob, 'document.pdf');
    formData.append('action', options.action);
    formData.append('userPassword', options.userPassword || '');
    formData.append('ownerPassword', options.ownerPassword || '');

    const res = await fetch('/api/encrypt', {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Server rejected password lock request.');
    }

    const encryptedBytes = await res.arrayBuffer();
    return new Uint8Array(encryptedBytes);
  } catch (error: any) {
    console.error('Crypto Lock operation failed:', error);
    throw new Error(error.message || 'Crypto Lock operation failed');
  }
}

/**
 * Compress a PDF entirely client-side by rasterizing pages at target resolution (DPI)
 * and compressing them into JPEGs. This runs entirely in the browser.
 */
export async function compressPdf(
  pdfBytes: ArrayBuffer | Uint8Array,
  options: {
    preset: 'aggressive' | 'balanced' | 'max_quality';
    dpi?: number;
    jpegQuality?: number;
  }
): Promise<Uint8Array> {
  const pdfjs = await loadPdfJs();
  // Clone the buffer to prevent PDF.js Web Worker from detaching the original buffer in the main thread
  const clonedBytes = pdfBytes instanceof Uint8Array
    ? new Uint8Array(pdfBytes.buffer.slice(pdfBytes.byteOffset, pdfBytes.byteOffset + pdfBytes.byteLength))
    : new Uint8Array(pdfBytes.slice(0));
  const loadingTask = pdfjs.getDocument({ data: clonedBytes });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  // Map presets to DPI & JPEG Quality targets
  let dpi = 150;
  let quality = 0.75;

  if (options.preset === 'aggressive') {
    dpi = 72;
    quality = 0.40;
  } else if (options.preset === 'max_quality') {
    dpi = 300;
    quality = 0.85;
  }

  if (options.dpi && !isNaN(options.dpi) && options.dpi > 0) {
    dpi = options.dpi;
  }
  if (options.jpegQuality && !isNaN(options.jpegQuality) && options.jpegQuality > 0) {
    quality = options.jpegQuality / 100;
  }

  const pdfDoc = await PDFDocument.create();

  // Scale ratio based on standard 72 DPI PDF user units
  const scale = dpi / 72;

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Could not create 2D canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render page to canvas
    await page.render({ canvasContext: context, viewport }).promise;

    // Convert canvas to compressed JPEG bytes synchronously
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    const base64Data = jpegDataUrl.substring(jpegDataUrl.indexOf(',') + 1);
    const binaryString = atob(base64Data);
    const jpegBytes = new Uint8Array(binaryString.length);
    for (let j = 0; j < binaryString.length; j++) {
      jpegBytes[j] = binaryString.charCodeAt(j);
    }

    // Embed the JPEG into our new PDF
    const embeddedImage = await pdfDoc.embedJpg(jpegBytes);
    
    // Create page matching the original PDF size (at 72 DPI units)
    const origViewport = page.getViewport({ scale: 1.0 });
    const newPage = pdfDoc.addPage([origViewport.width, origViewport.height]);
    
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: origViewport.width,
      height: origViewport.height,
    });
  }

  return await pdfDoc.save();
}
