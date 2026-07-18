import { NextRequest, NextResponse } from 'next/server';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const action = formData.get('action') as string || 'add';
    const userPassword = formData.get('userPassword') as string || '';
    const ownerPassword = formData.get('ownerPassword') as string || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const inputBytes = new Uint8Array(arrayBuffer);
    let processedBytes: Uint8Array;

    if (action === 'add') {
      if (!userPassword) {
        return NextResponse.json({ error: 'User password is required to encrypt' }, { status: 400 });
      }
      // Encrypt PDF using pure JS (AES-256 or RC4-128 standard)
      processedBytes = await encryptPDF(inputBytes, userPassword, { ownerPassword: ownerPassword || userPassword });
    } else if (action === 'remove') {
      // Decrypt PDF using pure JS
      processedBytes = await decryptPDF(inputBytes, userPassword);
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return new NextResponse(Buffer.from(processedBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${action === 'add' ? 'locked_' : 'unlocked_'}${file.name}"`,
      },
    });
  } catch (error: any) {
    console.error('Pure JS security lock error:', error);
    
    const isAuthFailure = error.message && (
      error.message.includes('Password') || 
      error.message.includes('permission') || 
      error.message.includes('Unmatched') ||
      error.message.includes('decrypt') ||
      error.message.includes('authenticate') ||
      error.message.includes('Incorrect')
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
