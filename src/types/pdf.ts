export interface QueuePage {
  id: string; // unique UUID
  sourceId: string; // references SourceFile
  sourceName: string;
  originalPageIndex: number; // 0-indexed original index, or -1 for blank page
  rotation: number; // 0, 90, 180, 270 degrees
  thumbnailUrl?: string; // Loaded from PDF.js or Image base64
  isExcluded: boolean;
  isBlank: boolean;
  imageBytes?: ArrayBuffer; // For direct images in queue
  imageType?: 'image/jpeg' | 'image/png';
}

export interface SourceFile {
  id: string;
  name: string;
  bytes: ArrayBuffer;
  size: number;
  totalPages: number;
}

export interface ProcessedHistoryItem {
  id: string;
  name: string;
  timestamp: string;
  size: number;
  compressedSize?: number;
  operation: string;
  thumbnailUrl?: string;
  bytes?: Uint8Array; // Stored in-memory for session download
}
