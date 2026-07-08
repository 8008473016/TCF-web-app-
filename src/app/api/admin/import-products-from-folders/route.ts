export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (e) {
      // Ignore if no body provided
    }

    const action = body.action || 'sync';
    let command = 'node scripts/import-products-from-folders.js';
    
    if (action === 'generate_missing') {
      command += ' --generate-missing';
    } else if (action === 'regenerate_all') {
      command += ' --regenerate-all';
    }

    const { stdout, stderr } = await execAsync(command);
    const output = stdout.toString();
    
    const resultMatch = output.match(/--- IMPORT COMPLETE ---\n(\{[\s\S]+\})/);
    let results = {
      categoriesCreated: 0,
      categoriesExisting: 0,
      productsCreated: 0,
      productsSkipped: 0,
      imagesCreated: 0,
      errors: []
    };

    if (resultMatch && resultMatch[1]) {
      try {
        results = JSON.parse(resultMatch[1]);
      } catch (e) {
        console.error('Failed to parse script output', e);
      }
    }

    return NextResponse.json({ success: true, results, log: output, stderr: stderr.toString() });

  } catch (error: any) {
    console.error('[API ERROR] Import failed:', error);
    return NextResponse.json({ 
      message: 'Error performing import', 
      error: error.message,
      results: { errors: [error.message] }
    }, { status: 500 });
  }
}
