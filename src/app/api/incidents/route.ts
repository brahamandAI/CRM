import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Incident from '@/lib/models/Incident';

// GET /api/incidents - Get all incidents
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const incidents = await Incident.find()
      .populate('client', 'name')
      .populate('guard', 'name')
      .select('type location severity status date');
    return NextResponse.json(incidents);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching incidents', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/incidents - Create a new incident
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const incident = new Incident({
      ...body,
      reportedBy: session.user.id,
      date: new Date(),
    });
    await incident.save();
    
    return NextResponse.json(incident, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating incident', error: error.message },
      { status: 400 }
    );
  }
} 