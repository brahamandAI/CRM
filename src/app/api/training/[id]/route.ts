import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Training from '@/lib/models/Training';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/training/[id] - Get a training record by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const training = await Training.findById(params.id).populate('guard', 'name');
    
    if (!training) {
      return NextResponse.json({ message: 'Training record not found' }, { status: 404 });
    }

    return NextResponse.json(training);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching training record', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/training/[id] - Update a training record
export async function PUT(request: Request, { params }: RouteParams) {
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
    const training = await Training.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!training) {
      return NextResponse.json({ message: 'Training record not found' }, { status: 404 });
    }

    return NextResponse.json(training);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating training record', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/training/[id] - Delete a training record
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const training = await Training.findByIdAndDelete(params.id);
    
    if (!training) {
      return NextResponse.json({ message: 'Training record not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Training record deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting training record', error: error.message },
      { status: 500 }
    );
  }
} 