import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Alert from '@/lib/models/Alert';

// GET /api/alerts - Get all alerts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const alerts = await Alert.find()
      .populate('user', 'name')
      .populate('client', 'name')
      .populate('guard', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(alerts);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching alerts', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/alerts - Create a new alert
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const alert = new Alert({
      ...body,
      user: session.user.id,
      reportedBy: session.user.name,
    });
    await alert.save();
    
    return NextResponse.json(alert, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating alert', error: error.message },
      { status: 400 }
    );
  }
} 