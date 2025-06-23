import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Audit from '@/lib/models/Audit';

// GET /api/audits - Get all audits
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const audits = await Audit.find()
      .populate('client', 'name')
      .select('date score remarks status');
    return NextResponse.json(audits);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching audits', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/audits - Create a new audit
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const audit = new Audit({
      ...body,
      conductedBy: session.user.id,
      date: new Date(),
      status: 'Pending'
    });
    await audit.save();
    
    return NextResponse.json(audit, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating audit', error: error.message },
      { status: 400 }
    );
  }
} 