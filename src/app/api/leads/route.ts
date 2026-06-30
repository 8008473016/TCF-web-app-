import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';
import { driveService } from '@/lib/drive';
import { config } from '@/lib/config';

// Helper to check admin secret
const isAdmin = (req: NextRequest): boolean => {
  const token = req.headers.get('authorization') || req.headers.get('x-admin-token');
  return token === config.adminSecret;
};

// GET /api/leads
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = await db.read('leads');
    const formatted = leads.map(l => ({
      leadId: l['Lead ID'] || l.leadId,
      type: l['Type'] || l.type,
      name: l['Name'] || l.name,
      email: l['Email'] || l.email,
      phone: l['Phone'] || l.phone,
      message: l['Message/Notes'] || l.message || l['Message'],
      referenceImages: typeof (l['Reference Images'] || l.referenceImages) === 'string'
        ? (l['Reference Images'] || l.referenceImages).split(',').filter(Boolean)
        : (l['Reference Images'] || l.referenceImages || []),
      floorPlan: l['Floor Plan'] || l.floorPlan,
      roomPhoto: l['Room Photo'] || l.roomPhoto,
      dimensions: l['Dimensions'] || l.dimensions,
      material: l['Material'] || l.material,
      finish: l['Finish'] || l.finish,
      status: l['Status'] || l.status,
      staffNotes: l['Staff Notes'] || l.staffNotes || '',
      createdAt: l['Created At'] || l.createdAt,
    })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving leads', error: error.message }, { status: 500 });
  }
}

// POST /api/leads
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    const type = formData.get('type') as string || 'Contact';
    const name = formData.get('name') as string;
    const email = formData.get('email') as string || '';
    const phone = formData.get('phone') as string;
    const message = formData.get('message') as string || '';
    const material = formData.get('material') as string || '';
    const finish = formData.get('finish') as string || '';
    const dimensions = formData.get('dimensions') as string || '';

    if (!name || !phone) {
      return NextResponse.json({ message: 'Name and Phone are required' }, { status: 400 });
    }

    const tempDir = path.resolve(process.cwd(), 'public/uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let referenceImageUrls: string[] = [];
    let floorPlanUrl = '';
    let roomPhotoUrl = '';

    const uploadPromises: Promise<any>[] = [];

    // Helper to process and upload files
    const saveAndUploadFile = async (file: File, prefix: string) => {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const tempFilePath = path.join(tempDir, `${prefix}_${Date.now()}_${file.name}`);
      await fs.promises.writeFile(tempFilePath, buffer);
      return driveService.uploadFile(tempFilePath, `${prefix}_${Date.now()}_${file.name}`, file.type);
    };

    // 1. Process Reference Images
    const refFiles = formData.getAll('referenceImages') as File[];
    if (refFiles && refFiles.length > 0) {
      refFiles.forEach((file, index) => {
        if (file && file.size > 0) {
          const promise = saveAndUploadFile(file, `ref_${index}`).then(url => {
            referenceImageUrls.push(url);
          });
          uploadPromises.push(promise);
        }
      });
    }

    // 2. Process Floor Plan
    const floorFile = formData.get('floorPlan') as File | null;
    if (floorFile && floorFile.size > 0) {
      const promise = saveAndUploadFile(floorFile, 'floor').then(url => {
        floorPlanUrl = url;
      });
      uploadPromises.push(promise);
    }

    // 3. Process Room Photo
    const roomFile = formData.get('roomPhoto') as File | null;
    if (roomFile && roomFile.size > 0) {
      const promise = saveAndUploadFile(roomFile, 'room').then(url => {
        roomPhotoUrl = url;
      });
      uploadPromises.push(promise);
    }

    await Promise.all(uploadPromises);

    const newLead = {
      'Lead ID': `LD${Date.now()}`,
      'Type': type,
      'Name': name,
      'Email': email,
      'Phone': String(phone),
      'Message/Notes': message,
      'Reference Images': referenceImageUrls.join(','),
      'Floor Plan': floorPlanUrl,
      'Room Photo': roomPhotoUrl,
      'Dimensions': dimensions,
      'Material': material,
      'Finish': finish,
      'Status': 'New',
      'Staff Notes': '',
      'Created At': new Date().toISOString()
    };

    await db.insert('leads', newLead);

    return NextResponse.json({
      success: true,
      message: 'Request submitted successfully!',
      leadId: newLead['Lead ID']
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating lead:', error);
    return NextResponse.json({ message: 'Error processing request', error: error.message }, { status: 500 });
  }
}
