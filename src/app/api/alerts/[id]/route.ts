import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Alert from '@/lib/models/Alert';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/alerts/[id] - Get an alert by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const alert = await Alert.findById(params.id)
      .populate('user', 'name')
      .populate('client', 'name')
      .populate('guard', 'name');
    
    if (!alert) {
      return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching alert', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/alerts/[id] - Update an alert
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const alert = await Alert.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!alert) {
      return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating alert', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/alerts/[id] - Delete an alert
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
    const alert = await Alert.findByIdAndDelete(params.id);
    
    if (!alert) {
      return NextResponse.json({ message: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Alert deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting alert', error: error.message },
      { status: 500 }
    );
  }
} 