import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Training from '@/lib/models/Training';

// GET /api/training - Get all training records
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const trainings = await Training.find()
      .populate('guard', 'name')
      .sort({ expiryDate: 1 });
    return NextResponse.json(trainings);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching training records', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/training - Create a new training record
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
    const training = new Training(body);
    await training.save();
    
    return NextResponse.json(training, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating training record', error: error.message },
      { status: 400 }
    );
  }
} 