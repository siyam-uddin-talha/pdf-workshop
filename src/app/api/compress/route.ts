import { NextRequest, NextResponse } from 'next/server';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execFileAsync = promisify(execFile);

export async function POST(req: NextRequest) {
  let inputPath = '';
  let outputPath = '';

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const preset = formData.get('preset') as string || 'balanced';
    const customDpi = formData.get('dpi') as string | null;
    const jpegQuality = formData.get('jpegQuality') as string | null;
    const stripMetadata = formData.get('stripMetadata') === 'true';
    const subsetFonts = formData.get('subsetFonts') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer and write to a temp input path
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const tempDir = os.tmpdir();
    const uniqueId = Math.random().toString(36).substring(2, 15);
    inputPath = path.join(tempDir, `input_${uniqueId}.pdf`);
    outputPath = path.join(tempDir, `output_${uniqueId}.pdf`);

    await fs.writeFile(inputPath, buffer);

    // Map presets to Ghostscript /PDFSETTINGS
    // screen = 72 dpi (aggressive)
    // ebook = 150 dpi (balanced)
    // printer = 300 dpi (max quality)
    let pdfSettings = '/ebook';
    let dpi = 150;

    if (preset === 'aggressive') {
      pdfSettings = '/screen';
      dpi = 72;
    } else if (preset === 'max_quality') {
      pdfSettings = '/printer';
      dpi = 300;
    }

    if (customDpi) {
      const parsedDpi = parseInt(customDpi, 10);
      if (!isNaN(parsedDpi) && parsedDpi > 0) {
        dpi = parsedDpi;
      }
    }

    // Construct Ghostscript arguments safely
    const gsArgs = [
      '-sDEVICE=pdfwrite',
      '-dCompatibilityLevel=1.4',
      `-dPDFSETTINGS=${pdfSettings}`,
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
      '-dDetectDuplicateImages=true',
    ];

    // Control downsampling of images
    gsArgs.push(
      '-dDownsampleColorImages=true',
      `-dColorImageResolution=${dpi}`,
      '-dDownsampleGrayImages=true',
      `-dGrayImageResolution=${dpi}`,
      '-dDownsampleMonoImages=true',
      `-dMonoImageResolution=${dpi}`
    );

    // If font subsetting is requested, or enabled by default in settings
    if (subsetFonts) {
      gsArgs.push('-dSubsetFonts=true');
    }

    // Optional: strip metadata by preventing copying of metadata keys
    // Ghostscript by default copies Info. For aggressive stripping, or custom pdf-lib stripping,
    // we can also handle it on client side.
    
    gsArgs.push(`-sOutputFile=${outputPath}`, inputPath);

    // Execute Ghostscript
    // We verified gs is located at /usr/bin/gs
    await execFileAsync('/usr/bin/gs', gsArgs);

    // Read the compressed PDF output
    const compressedBuffer = await fs.readFile(outputPath);

    // Clean up temp files
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    // Return compressed PDF as binary response
    return new NextResponse(compressedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="compressed_${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error('Ghostscript compression error:', error);
    
    // Attempt clean up of files
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
    if (outputPath) await fs.unlink(outputPath).catch(() => {});

    return NextResponse.json(
      { error: 'PDF compression failed', details: error.message || String(error) },
      { status: 500 }
    );
  }
}
