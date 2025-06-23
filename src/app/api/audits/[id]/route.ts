import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Audit from '@/lib/models/Audit';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/audits/[id] - Get an audit by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const audit = await Audit.findById(params.id)
      .populate('supervisor', 'name')
      .populate('client', 'name');
    
    if (!audit) {
      return NextResponse.json({ message: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching audit', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/audits/[id] - Update an audit
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
    const audit = await Audit.findByIdAndUpdate(params.id, body, { new: true });
    
    if (!audit) {
      return NextResponse.json({ message: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating audit', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/audits/[id] - Delete an audit
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
    const audit = await Audit.findByIdAndDelete(params.id);
    
    if (!audit) {
      return NextResponse.json({ message: 'Audit not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Audit deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting audit', error: error.message },
      { status: 500 }
    );
  }
} 