# PDF Workshop

An elegant, browser-powered local PDF workshop and document editor. PDF Workshop allows users to merge, split, reorder, rotate, watermark, password-protect, and compress PDF documents entirely client-side. **100% private, secure, and processing is done locally—your data never leaves your device.**

Built by **[Sutio](https://www.sutio.co/)**.

---

## Key Features

- **🔒 100% Private & Local:** All processing (merging, splitting, compressing, watermarking) is performed directly in the user's browser. Files are never uploaded to any remote server.
- **🗂️ Merge & Organize:** Combine multiple PDFs, JPGs, and PNGs. Rearrange, rotate, or delete individual pages visually using an interactive grid layout.
- **✂️ Split PDF:** Extract specific page ranges, split a document into fixed intervals, or separate every page into individual files.
- **📉 Compress PDF:** Optimize and shrink PDF file size by configuring custom DPI targets and JPEG image quality presets.
- **🌿 Add Watermark:** Apply customized text stamps (text, opacity, rotation, colors, position) or image watermarks directly onto document pages.
- **🔑 Encrypt PDF:** Secure documents by adding industry-standard owner and user passwords.
- **🏷️ Edit Metadata:** Modify PDF header details such as Title, Author, Subject, Keywords, Creator, and Producer.
- **📤 Export to Images:** Convert and export individual PDF pages as high-resolution images packaged in a ZIP archive.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide React (Icons)
- **PDF Manipulation:** `pdf-lib` (Client-side compilation and encryption)
- **PDF Preview Rendering:** `pdfjs-dist` (In-browser rendering to canvas)
- **Compression & Packaging:** `jszip` (Zip packaging for image outputs)

---

## Getting Started

### Prerequisites

- **Node.js:** v18.x or later
- **Package Manager:** `pnpm` (recommended) or `npm`

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/siyam-uddin-talha/pdf-workshop.git
   cd pdf-workshop
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   pnpm dev
   ```

4. **Open the browser:**
   Navigate to [http://localhost:3000](http://localhost:3000) to view the workshop workspace.

### Production Build

To compile a production build:
```bash
pnpm build
pnpm start
```

---

## SEO & Branding

- Custom sitemap, `robots.txt`, and canonical routing configuration.
- Rich OpenGraph (OG) and Twitter card configuration referencing the brand logo and `/og.png`.
- Dynamic, warning-free inline UTC stats rendering on headers with `suppressHydrationWarning`.

---

## License

Created by **[Sutio](https://www.sutio.co/)**. All rights reserved.
