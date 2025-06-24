import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Audit from '@/lib/models/Audit';
import mongoose from 'mongoose';

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
      .populate('conductedBy', 'name')
      .sort({ createdAt: -1 });
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

    // Allow both Admin and Client roles to create audits
    if (!['Admin', 'Client'].includes(session.user.role)) {
      return NextResponse.json({ message: 'Forbidden - Insufficient permissions' }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();

    // Validate required fields
    if (!body.client || !body.date || typeof body.score !== 'number' || !body.remarks) {
      return NextResponse.json({ 
        message: 'Missing required fields', 
        error: 'Please provide all required fields: client, date, score, and remarks' 
      }, { status: 400 });
    }

    // Validate client ID format
    if (!mongoose.Types.ObjectId.isValid(body.client)) {
      return NextResponse.json({ 
        message: 'Invalid client ID format',
        error: 'The provided client ID is not valid'
      }, { status: 400 });
    }

    // Create the audit with the current user as conductedBy
    const audit = new Audit({
      ...body,
      conductedBy: session.user.id,
      checklist: body.checklist || [] // Make checklist optional
    });

    await audit.save();
    
    // Populate the response with client and conductedBy details
    const populatedAudit = await audit
      .populate('client', 'name')
      .populate('conductedBy', 'name')
      .execPopulate();
    
    return NextResponse.json(populatedAudit, { status: 201 });
  } catch (error: any) {
    console.error('Audit creation error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof mongoose.Error.ValidationError) {
      return NextResponse.json({ 
        message: 'Validation error', 
        error: Object.values(error.errors).map(err => err.message).join(', ') 
      }, { status: 400 });
    }

    return NextResponse.json(
      { message: 'Error creating audit', error: error.message },
      { status: 500 }
    );
  }
} 