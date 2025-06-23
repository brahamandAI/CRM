import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Incident from '@/lib/models/Incident';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/incidents/[id] - Get an incident by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const incident = await Incident.findById(params.id)
      .populate('guard', 'name')
      .populate('client', 'name');
    
    if (!incident) {
      return NextResponse.json({ message: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching incident', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/incidents/[id] - Update an incident
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!['Admin', 'Guard'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const incident = await Incident.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!incident) {
      return NextResponse.json({ message: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json(incident);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating incident', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/incidents/[id] - Delete an incident
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
    const incident = await Incident.findByIdAndDelete(params.id);
    
    if (!incident) {
      return NextResponse.json({ message: 'Incident not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Incident deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting incident', error: error.message },
      { status: 500 }
    );
  }
} 