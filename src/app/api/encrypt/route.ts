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
    const action = formData.get('action') as string || 'add';
    const userPassword = formData.get('userPassword') as string || '';
    const ownerPassword = formData.get('ownerPassword') as string || '';

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

    // Construct Ghostscript arguments safely
    const gsArgs = [
      '-sDEVICE=pdfwrite',
      '-dNOPAUSE',
      '-dQUIET',
      '-dBATCH',
    ];

    if (action === 'add') {
      if (!userPassword) {
        return NextResponse.json({ error: 'User password is required to encrypt' }, { status: 400 });
      }
      gsArgs.push(
        `-sUserPassword=${userPassword}`,
        `-sOwnerPassword=${ownerPassword || userPassword}`,
        '-dEncryptionR=3',
        '-dKeyLength=128',
        '-dPermissions=-4'
      );
    } else if (action === 'remove') {
      if (userPassword) {
        // Ghostscript needs the password to read the encrypted PDF
        gsArgs.push(`-sPDFPassword=${userPassword}`);
      }
    }

    gsArgs.push(`-sOutputFile=${outputPath}`, inputPath);

    // Execute Ghostscript
    await execFileAsync('/usr/bin/gs', gsArgs);

    // Read the processed PDF output
    const processedBuffer = await fs.readFile(outputPath);

    // Clean up temp files
    await fs.unlink(inputPath).catch(() => {});
    await fs.unlink(outputPath).catch(() => {});

    // Return processed PDF as binary response
    return new NextResponse(processedBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${action === 'add' ? 'locked_' : 'unlocked_'}${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error('Ghostscript security lock error:', error);
    
    // Attempt clean up of files
    if (inputPath) await fs.unlink(inputPath).catch(() => {});
    if (outputPath) await fs.unlink(outputPath).catch(() => {});

    // Check if the error is due to password decryption failure
    const isAuthFailure = error.message && (
      error.message.includes('Password') || 
      error.message.includes('permission') || 
      error.message.includes('Unmatched')
    );

    return NextResponse.json(
      { 
        error: isAuthFailure ? 'Authentication failed: Incorrect password.' : 'PDF security lock operation failed', 
        details: error.message || String(error) 
      },
      { status: isAuthFailure ? 401 : 500 }
    );
  }
}
