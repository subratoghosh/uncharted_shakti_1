import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// PUT: Update FAQ (Admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { faqId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: { message: 'Unauthorized. Admin privilege required.' } }, { status: 403 });
    }

    const { faqId } = params;
    if (!ObjectId.isValid(faqId)) {
      return NextResponse.json({ error: { message: 'Invalid FAQ ID' } }, { status: 400 });
    }

    const body = await req.json();
    const { question, answer, category, order } = body;

    const db = await getDb();
    const collection = db.collection('faqs');

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (question !== undefined) updateFields.question = question.trim();
    if (answer !== undefined) updateFields.answer = answer.trim();
    if (category !== undefined) updateFields.category = category.trim();
    if (order !== undefined) updateFields.order = Number(order);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(faqId) },
      { $set: updateFields },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json({ error: { message: 'FAQ not found.' } }, { status: 404 });
    }

    return NextResponse.json({ data: { id: faqId, ...result } });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json({ error: { message: 'Failed to update FAQ.' } }, { status: 500 });
  }
}

// DELETE: Remove FAQ (Admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { faqId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: { message: 'Unauthorized. Admin privilege required.' } }, { status: 403 });
    }

    const { faqId } = params;
    if (!ObjectId.isValid(faqId)) {
      return NextResponse.json({ error: { message: 'Invalid FAQ ID' } }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection('faqs');

    const result = await collection.deleteOne({ _id: new ObjectId(faqId) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: { message: 'FAQ not found.' } }, { status: 404 });
    }

    return NextResponse.json({ data: { success: true, message: 'FAQ deleted successfully.' } });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json({ error: { message: 'Failed to delete FAQ.' } }, { status: 500 });
  }
}
