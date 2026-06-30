import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/reviews
export async function GET(req: NextRequest) {
  try {
    const reviews = await db.read('reviews');
    const formatted = reviews.map(r => ({
      id: r['Review ID'] || r.id,
      productId: r['Product ID'] || r.productId,
      customerName: r['Customer Name'] || r.customerName,
      rating: Number(r['Rating'] || r.rating || 5),
      reviewText: r['Review Text'] || r.reviewText,
      images: typeof (r['Images'] || r.images) === 'string'
        ? (r['Images'] || r.images).split(',').filter(Boolean)
        : (r['Images'] || r.images || []),
      createdAt: r['Created At'] || r.createdAt
    }));
    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json({ message: 'Error retrieving reviews', error: error.message }, { status: 500 });
  }
}

// POST /api/reviews
export async function POST(req: NextRequest) {
  try {
    const { productId, customerName, rating, reviewText, images } = await req.json();
    if (!productId || !customerName || !rating || !reviewText) {
      return NextResponse.json({ message: 'Missing review parameters' }, { status: 400 });
    }

    const newReview = {
      'Review ID': `REV${Date.now()}`,
      'Product ID': productId,
      'Customer Name': customerName,
      'Rating': String(rating),
      'Review Text': reviewText,
      'Images': Array.isArray(images) ? images.join(',') : (images || ''),
      'Created At': new Date().toISOString()
    };

    await db.insert('reviews', newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error creating review', error: error.message }, { status: 500 });
  }
}
