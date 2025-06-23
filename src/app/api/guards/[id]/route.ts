import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Guard from '@/lib/models/Guard';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/guards/[id] - Get a guard by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['Admin', 'Client'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const guard = await Guard.findById(params.id).populate('assignedClient', 'name');
    
    if (!guard) {
      return NextResponse.json({ message: 'Guard not found' }, { status: 404 });
    }

    return NextResponse.json(guard);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching guard', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/guards/[id] - Update a guard
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
    const guard = await Guard.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!guard) {
      return NextResponse.json({ message: 'Guard not found' }, { status: 404 });
    }

    return NextResponse.json(guard);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating guard', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/guards/[id] - Delete a guard
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
    const guard = await Guard.findByIdAndDelete(params.id);
    
    if (!guard) {
      return NextResponse.json({ message: 'Guard not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Guard deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting guard', error: error.message },
      { status: 500 }
    );
  }
} 