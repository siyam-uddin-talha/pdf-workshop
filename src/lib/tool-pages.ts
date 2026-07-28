import { SITE, absoluteUrl } from "./seo";

export type TabType = 'merge' | 'split' | 'compress' | 'watermark' | 'password' | 'metadata' | 'export';

export interface ToolPageConfig {
  slug: string;
  tab: TabType;
  title: string;
  description: string;
  h1Title: string;
  heroDescription: string;
  keywords: string[];
}

export const TOOL_PAGES: Record<string, ToolPageConfig> = {
  // --- MERGE PDF ROUTES ---
  "merge-pdf": {
    slug: "merge-pdf",
    tab: "merge",
    title: "Merge PDF Online - Free & 100% Private PDF Combiner | PDF Workshop",
    description: "Combine multiple PDF documents and images into a single file directly in your browser. 100% private local processing with zero server uploads.",
    h1Title: "Merge PDF Files Online",
    heroDescription: "Combine multiple PDF files and images into a clean single document. Drag and drop your files, reorder pages visually, and merge instantly.",
    keywords: ["merge pdf", "combine pdf", "pdf merger", "merge pdf files", "join pdf", "combine pdf online"]
  },
  "merge-pdf-free": {
    slug: "merge-pdf-free",
    tab: "merge",
    title: "Merge PDF Free Online - Unlimited Private PDF Merger | PDF Workshop",
    description: "100% free online PDF merger without sign-up or file size limits. Merges PDF files locally inside your web browser.",
    h1Title: "Free Online PDF Merger",
    heroDescription: "Merge unlimited PDF files for free without uploading files to external servers. Safe, fast, and browser-powered.",
    keywords: ["merge pdf free", "free pdf combiner", "free pdf joiner", "merge pdf online free"]
  },
  "merge-pdf-online": {
    slug: "merge-pdf-online",
    tab: "merge",
    title: "Merge PDF Online - Secure Local PDF Joiner | PDF Workshop",
    description: "Online browser tool to join PDF files instantly. Keeps your confidential documents 100% secure with local client-side processing.",
    h1Title: "Merge PDF Online Securely",
    heroDescription: "Join multiple PDF documents online without risking data privacy. Files stay in your browser.",
    keywords: ["merge pdf online", "join pdf online", "combine pdf files online", "browser pdf merger"]
  },
  "combine-pdf": {
    slug: "combine-pdf",
    tab: "merge",
    title: "Combine PDF Files - Fast & Free PDF Joiner | PDF Workshop",
    description: "Combine PDF pages and image files into one single PDF document effortlessly. Fast, local, and browser-powered.",
    h1Title: "Combine PDF Documents",
    heroDescription: "Seamlessly combine PDFs and image assets into a unified file. Rearrange, rotate, or delete individual pages before merging.",
    keywords: ["combine pdf", "combine pdf files", "pdf page combiner", "combine documents into pdf"]
  },
  "combine-pdf-files": {
    slug: "combine-pdf-files",
    tab: "merge",
    title: "Combine PDF Files Online - Free Private Tool | PDF Workshop",
    description: "Easily combine multiple PDF files into one clean document. Fast client-side merging for total privacy.",
    h1Title: "Combine PDF Files",
    heroDescription: "Combine multiple PDF files into a single document with visual page ordering and rotation controls.",
    keywords: ["combine pdf files", "pdf file merger", "combine pdf pages", "join pdf documents"]
  },
  "join-pdf": {
    slug: "join-pdf",
    tab: "merge",
    title: "Join PDF Files - Quick & Secure PDF Binder | PDF Workshop",
    description: "Join separate PDF files together into one file. Works offline in your browser with no limits.",
    h1Title: "Join PDF Files Together",
    heroDescription: "Join PDFs with instant visual preview and drag-and-drop page organization.",
    keywords: ["join pdf", "join pdf files", "pdf binder", "append pdf"]
  },
  "pdf-merger": {
    slug: "pdf-merger",
    tab: "merge",
    title: "PDF Merger - Free Browser-Based PDF Combining Tool | PDF Workshop",
    description: "Powerful browser PDF merger tool. Drag & drop to arrange pages and export a combined PDF in seconds.",
    h1Title: "Browser PDF Merger",
    heroDescription: "A modern, private PDF merger tool that runs directly on your computer without uploading data.",
    keywords: ["pdf merger", "pdf joiner", "pdf binder", "pdf page joiner"]
  },

  // --- SPLIT PDF ROUTES ---
  "split-pdf": {
    slug: "split-pdf",
    tab: "split",
    title: "Split PDF Online - Extract Pages & Separate PDF | PDF Workshop",
    description: "Split PDF documents into separate pages or custom ranges easily. 100% private local PDF extraction.",
    h1Title: "Split PDF & Extract Pages",
    heroDescription: "Divide large PDF files into separate documents or specific page ranges without sending data to servers.",
    keywords: ["split pdf", "extract pdf pages", "separate pdf", "pdf page splitter", "split pdf online"]
  },
  "split-pdf-free": {
    slug: "split-pdf-free",
    tab: "split",
    title: "Split PDF Free Online - Unlimited Page Extractor | PDF Workshop",
    description: "Free online PDF splitter tool. Extract specific page ranges or split every page into individual PDFs for free.",
    h1Title: "Free PDF Splitter",
    heroDescription: "Split PDF files for free. Set page ranges (e.g. 1-3, 5) or separate into single-page documents instantly.",
    keywords: ["split pdf free", "free pdf splitter", "extract pdf pages free", "separate pdf free"]
  },
  "split-pdf-online": {
    slug: "split-pdf-online",
    tab: "split",
    title: "Split PDF Online - Instant & Private PDF Cutter | PDF Workshop",
    description: "Fast online browser tool to split and cut PDF documents securely on your own device.",
    h1Title: "Split PDF Online Privately",
    heroDescription: "Extract PDF pages online with total confidentiality. Downloads ZIP or individual PDF files.",
    keywords: ["split pdf online", "pdf cutter online", "extract pages from pdf online"]
  },
  "pdf-splitter": {
    slug: "pdf-splitter",
    tab: "split",
    title: "PDF Splitter - Separate & Extract PDF Pages | PDF Workshop",
    description: "Professional PDF splitter tool. Custom ranges, fixed page size chunking, or single page extraction.",
    h1Title: "PDF Page Splitter",
    heroDescription: "Break down complex PDFs into manageable files using custom page ranges or fixed chunk sizes.",
    keywords: ["pdf splitter", "pdf range splitter", "pdf document cutter", "split pdf pages"]
  },
  "extract-pdf-pages": {
    slug: "extract-pdf-pages",
    tab: "split",
    title: "Extract Pages from PDF - Free Online Page Extractor | PDF Workshop",
    description: "Extract specific pages from any PDF document quickly and download them as a new PDF or ZIP package.",
    h1Title: "Extract Pages from PDF",
    heroDescription: "Select exact page numbers to extract from your document with private, client-side execution.",
    keywords: ["extract pdf pages", "extract pages from pdf", "pdf page puller", "save selected pdf pages"]
  },
  "separate-pdf": {
    slug: "separate-pdf",
    tab: "split",
    title: "Separate PDF Pages - Split PDF Documents | PDF Workshop",
    description: "Separate multi-page PDF documents into distinct files locally with total security.",
    h1Title: "Separate PDF Pages",
    heroDescription: "Separate PDF pages effortlessly. Specify ranges or break down every page into separate files.",
    keywords: ["separate pdf", "separate pdf pages", "divide pdf file", "break apart pdf"]
  },

  // --- COMPRESS PDF ROUTES ---
  "compress-pdf": {
    slug: "compress-pdf",
    tab: "compress",
    title: "Compress PDF Online - Reduce PDF File Size | PDF Workshop",
    description: "Compress PDF files for email and web upload without quality loss. 100% local client-side compression.",
    h1Title: "Compress PDF & Reduce File Size",
    heroDescription: "Reduce the file size of your PDF documents with customizable DPI and image quality presets.",
    keywords: ["compress pdf", "reduce pdf size", "pdf compressor", "shrink pdf", "make pdf smaller"]
  },
  "compress-pdf-free": {
    slug: "compress-pdf-free",
    tab: "compress",
    title: "Compress PDF Free - Reduce PDF Size Online | PDF Workshop",
    description: "Free PDF compressor tool. Shrink large PDF documents quickly in your browser with zero limits.",
    h1Title: "Free PDF Compressor",
    heroDescription: "Compress large PDFs for free. Choose between Balanced, Max Compression, or High Quality settings.",
    keywords: ["compress pdf free", "free pdf compressor", "reduce pdf size free", "shrink pdf free"]
  },
  "compress-pdf-online": {
    slug: "compress-pdf-online",
    tab: "compress",
    title: "Compress PDF Online - Secure Local File Size Reducer | PDF Workshop",
    description: "Compress PDFs online while keeping your sensitive documents completely private on your machine.",
    h1Title: "Compress PDF Online Privately",
    heroDescription: "Shrink PDF file size directly in your browser without uploading files to remote servers.",
    keywords: ["compress pdf online", "pdf size reducer online", "shrink pdf online"]
  },
  "pdf-compressor": {
    slug: "pdf-compressor",
    tab: "compress",
    title: "PDF Compressor - Optimize & Shrink PDF Files | PDF Workshop",
    description: "Advanced client-side PDF compression engine. Optimizes images, resamples DPI, and subsets fonts.",
    h1Title: "Browser PDF Compressor",
    heroDescription: "Optimize PDF files for email attachments, web forms, and archive storage with custom preset controls.",
    keywords: ["pdf compressor", "pdf file optimizer", "pdf resample tool", "pdf shrinker"]
  },
  "reduce-pdf-size": {
    slug: "reduce-pdf-size",
    tab: "compress",
    title: "Reduce PDF File Size - Instant PDF Resizer | PDF Workshop",
    description: "Easily reduce PDF file size for fast uploads. Works on desktop, mobile, and tablets 100% locally.",
    h1Title: "Reduce PDF File Size",
    heroDescription: "Lower the megabyte size of your PDF documents quickly with real-time compression ratio display.",
    keywords: ["reduce pdf size", "reduce pdf file size", "lower pdf size", "downsize pdf"]
  },
  "shrink-pdf": {
    slug: "shrink-pdf",
    tab: "compress",
    title: "Shrink PDF - Make PDF Smaller Online | PDF Workshop",
    description: "Shrink PDF document size instantly. Perfect for reducing scan sizes and large document bundles.",
    h1Title: "Shrink PDF Documents",
    heroDescription: "Make oversized PDFs smaller with intelligent image downsampling and quality tuning.",
    keywords: ["shrink pdf", "make pdf smaller", "shrink pdf document", "pdf file size reducer"]
  },

  // --- WATERMARK PDF ROUTES ---
  "pdf-watermark": {
    slug: "pdf-watermark",
    tab: "watermark",
    title: "PDF Watermark Tool - Add Text & Image Watermarks | PDF Workshop",
    description: "Add custom text or image watermarks to your PDF pages. Full control over opacity, rotation, scale, and placement.",
    h1Title: "Add Watermark to PDF",
    heroDescription: "Protect and brand your documents with custom text or image watermarks. Instant visual customization.",
    keywords: ["pdf watermark", "add watermark to pdf", "watermark pdf", "pdf stamp", "brand pdf"]
  },
  "watermark-pdf": {
    slug: "watermark-pdf",
    tab: "watermark",
    title: "Watermark PDF Online - Custom Text & Logo Watermarking | PDF Workshop",
    description: "Watermark PDF files online with text or logo stamps. Adjust transparency, angle, position, and color.",
    h1Title: "Watermark PDF Documents",
    heroDescription: "Apply confidential, draft, or branded logo watermarks across all pages of your PDF instantly.",
    keywords: ["watermark pdf", "watermark pdf online", "pdf text watermark", "pdf image watermark"]
  },
  "add-watermark-to-pdf": {
    slug: "add-watermark-to-pdf",
    tab: "watermark",
    title: "Add Watermark to PDF - Free Online Stamp Tool | PDF Workshop",
    description: "Add text or logo watermarks to PDF files for free. Protect intellectual property directly inside your browser.",
    h1Title: "Add Custom Watermark to PDF",
    heroDescription: "Stamp custom text or upload a PNG/JPG logo to watermark every page of your PDF with total control.",
    keywords: ["add watermark to pdf", "stamp watermark on pdf", "add logo to pdf", "pdf watermark tool"]
  },
  "watermark-pdf-online": {
    slug: "watermark-pdf-online",
    tab: "watermark",
    title: "Watermark PDF Online - Fast & Private Watermarking | PDF Workshop",
    description: "Watermark your PDF documents online with 100% privacy guarantee. No uploads, fast local stamping.",
    h1Title: "Watermark PDF Online Privately",
    heroDescription: "Add watermarks online without compromising security. Customize fonts, colors, rotation, and tile positions.",
    keywords: ["watermark pdf online", "online pdf watermark", "watermark pdf free online"]
  },
  "watermark-pdf-free": {
    slug: "watermark-pdf-free",
    tab: "watermark",
    title: "Watermark PDF Free - Add Text or Logo Stamps | PDF Workshop",
    description: "Free PDF watermark generator. Add text banners or image overlays to any PDF file for free.",
    h1Title: "Free PDF Watermark Tool",
    heroDescription: "Create custom text or logo watermarks for free. Adjust opacity, scale, and angle visually.",
    keywords: ["watermark pdf free", "free pdf watermark creator", "free pdf stamp tool"]
  },

  // --- PASSWORD & PROTECT PDF ROUTES ---
  "protect-pdf": {
    slug: "protect-pdf",
    tab: "password",
    title: "Protect PDF - Password Encrypt PDF Online | PDF Workshop",
    description: "Protect PDF files with strong password encryption. Prevent unauthorized viewing, printing, or editing.",
    h1Title: "Password Protect PDF Documents",
    heroDescription: "Lock your PDF files with user and owner passwords. Client-side encryption ensures keys never leave your device.",
    keywords: ["protect pdf", "password protect pdf", "encrypt pdf", "lock pdf", "pdf password protection"]
  },
  "lock-pdf": {
    slug: "lock-pdf",
    tab: "password",
    title: "Lock PDF - Secure PDF with Password | PDF Workshop",
    description: "Lock PDF files with custom user passwords instantly inside your web browser. 100% confidential.",
    h1Title: "Lock PDF with Password",
    heroDescription: "Add password security to your sensitive PDF files before sharing. Fast and browser-executed encryption.",
    keywords: ["lock pdf", "lock pdf file", "secure pdf", "pdf locker"]
  },
  "password-protect-pdf": {
    slug: "password-protect-pdf",
    tab: "password",
    title: "Password Protect PDF - Secure PDF Encryption | PDF Workshop",
    description: "Add user and owner passwords to your PDF. Encrypt documents locally with 128-bit / 256-bit security.",
    h1Title: "Password Protect PDF Files",
    heroDescription: "Encrypt PDFs with custom passwords. Set separate open passwords and administrative owner passwords.",
    keywords: ["password protect pdf", "password protect pdf online", "add password to pdf"]
  },
  "encrypt-pdf": {
    slug: "encrypt-pdf",
    tab: "password",
    title: "Encrypt PDF Online - Secure Document Encryption | PDF Workshop",
    description: "Encrypt PDF documents online with local client-side cryptography. Keep private data completely safe.",
    h1Title: "Encrypt PDF Documents",
    heroDescription: "Apply cryptographic password security to PDF files locally in your browser with zero data exposure.",
    keywords: ["encrypt pdf", "encrypt pdf file", "pdf encryption tool", "secure pdf document"]
  },
  "unlock-pdf": {
    slug: "unlock-pdf",
    tab: "password",
    title: "Unlock PDF / Remove PDF Password | PDF Workshop",
    description: "Remove security restriction passwords from PDF files when you know the authorized password.",
    h1Title: "Unlock PDF & Remove Restrictions",
    heroDescription: "Decrypt and remove password restrictions from your PDF files locally using your master password.",
    keywords: ["unlock pdf", "remove pdf password", "pdf password remover", "decrypt pdf"]
  },
  "pdf-password": {
    slug: "pdf-password",
    tab: "password",
    title: "PDF Password Tool - Lock or Unlock PDF Security | PDF Workshop",
    description: "Add or manage password security for PDF files directly in your web browser.",
    h1Title: "PDF Password Security Center",
    heroDescription: "Manage PDF access control. Protect PDFs with open passwords or strip restrictions seamlessly.",
    keywords: ["pdf password", "pdf security", "pdf password lock", "protect pdf file"]
  },

  // --- METADATA PDF ROUTES ---
  "edit-pdf-metadata": {
    slug: "edit-pdf-metadata",
    tab: "metadata",
    title: "Edit PDF Metadata - Change PDF Title & Author | PDF Workshop",
    description: "Edit PDF properties like Title, Author, Subject, Keywords, Creator, and Producer metadata fields locally.",
    h1Title: "Edit PDF Metadata & Properties",
    heroDescription: "Modify internal PDF document properties like Title, Author, Subject, and Keywords directly in your browser.",
    keywords: ["edit pdf metadata", "pdf metadata editor", "change pdf title", "edit pdf author", "pdf properties editor"]
  },
  "pdf-metadata": {
    slug: "pdf-metadata",
    tab: "metadata",
    title: "PDF Metadata Editor - Modify Document Info | PDF Workshop",
    description: "View and update hidden metadata stored inside PDF files. 100% private, client-side metadata editor.",
    h1Title: "PDF Metadata Editor",
    heroDescription: "Clean or customize metadata attributes embedded within your PDF documents without re-encoding quality.",
    keywords: ["pdf metadata", "pdf property editor", "change pdf metadata", "pdf tags editor"]
  },
  "change-pdf-title": {
    slug: "change-pdf-title",
    tab: "metadata",
    title: "Change PDF Title & Author - Edit PDF Tags | PDF Workshop",
    description: "Quickly update the window title and author metadata of your PDF files before publishing.",
    h1Title: "Change PDF Title & Author",
    heroDescription: "Update document info fields like Title, Author, and Subject so your PDFs display clean titles in PDF readers.",
    keywords: ["change pdf title", "edit pdf title", "change pdf author", "update pdf metadata"]
  },

  // --- EXPORT & CONVERT PDF ROUTES ---
  "export-pdf": {
    slug: "export-pdf",
    tab: "export",
    title: "Export PDF - Convert PDF Pages to Images | PDF Workshop",
    description: "Export PDF pages as high-resolution PNG image files. Download as individual images or a ZIP archive.",
    h1Title: "Export PDF Pages to Images",
    heroDescription: "Convert PDF pages into crisp PNG image files directly in your web browser with local canvas rendering.",
    keywords: ["export pdf", "pdf to image", "export pdf pages", "save pdf as images", "pdf converter"]
  },
  "convert-pdf": {
    slug: "convert-pdf",
    tab: "export",
    title: "Convert PDF - Export PDF to PNG Images | PDF Workshop",
    description: "Convert PDF documents to image formats instantly. 100% local browser execution with high resolution.",
    h1Title: "Convert PDF to PNG Images",
    heroDescription: "Turn multi-page PDF files into image files. Extract page snapshots cleanly without server processing.",
    keywords: ["convert pdf", "convert pdf to images", "pdf to image converter", "pdf page rasterizer"]
  },
  "pdf-to-image": {
    slug: "pdf-to-image",
    tab: "export",
    title: "PDF to Image - Convert PDF Pages to PNG | PDF Workshop",
    description: "Free browser tool to convert PDF pages into PNG images. Extract all pages or active workspace pages.",
    h1Title: "PDF to Image Converter",
    heroDescription: "Render PDF pages into sharp PNG images and download them individually or packaged in a ZIP file.",
    keywords: ["pdf to image", "pdf to png", "pdf to jpg", "convert pdf page to image"]
  },
  "pdf-to-jpg": {
    slug: "pdf-to-jpg",
    tab: "export",
    title: "PDF to JPG / PNG Converter - High Quality Export | PDF Workshop",
    description: "Convert PDF files into high-resolution JPG/PNG image snapshots locally in your browser.",
    h1Title: "PDF to Image Snapshot Converter",
    heroDescription: "Extract PDF pages as crisp image files for presentation slides, documentation, or social media.",
    keywords: ["pdf to jpg", "pdf to png converter", "pdf image extractor"]
  }
};

/** Get configuration for a specific slug, or null if invalid */
export function getToolPageConfig(slug: string): ToolPageConfig | null {
  return TOOL_PAGES[slug] || null;
}

/** Get list of primary tool links for footer / navigation interlinking */
export const PRIMARY_TOOL_LINKS = [
  { slug: "merge-pdf", label: "Merge PDF", tab: "merge" },
  { slug: "split-pdf", label: "Split PDF", tab: "split" },
  { slug: "compress-pdf", label: "Compress PDF", tab: "compress" },
  { slug: "pdf-watermark", label: "Watermark PDF", tab: "watermark" },
  { slug: "protect-pdf", label: "Protect PDF", tab: "password" },
  { slug: "edit-pdf-metadata", label: "Edit Metadata", tab: "metadata" },
  { slug: "pdf-to-image", label: "PDF to Image", tab: "export" },

  // Popular search aliases
  { slug: "merge-pdf-free", label: "Merge PDF Free", tab: "merge" },
  { slug: "add-watermark-to-pdf", label: "Add Watermark", tab: "watermark" },
  { slug: "reduce-pdf-size", label: "Reduce PDF Size", tab: "compress" },
  { slug: "password-protect-pdf", label: "Password Protect", tab: "password" },
  { slug: "extract-pdf-pages", label: "Extract Pages", tab: "split" },
  { slug: "combine-pdf", label: "Combine PDF", tab: "merge" },
  { slug: "convert-pdf", label: "Convert PDF", tab: "export" }
] as const;
