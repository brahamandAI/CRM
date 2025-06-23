import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Guard from '@/lib/models/Guard';

// GET /api/guards - Get all guards
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['Admin', 'Client'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const guards = await Guard.find().populate('assignedClient', 'name');
    return NextResponse.json(guards);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching guards', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/guards - Create a new guard
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
    const guard = new Guard(body);
    await guard.save();
    
    return NextResponse.json(guard, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating guard', error: error.message },
      { status: 400 }
    );
  }
} 