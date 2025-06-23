import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';

// GET /api/clients - Get all clients
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const clients = await Client.find().select('name contact contractPeriod status');
    return NextResponse.json(clients);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching clients', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/clients - Create a new client
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
    const client = new Client(body);
    await client.save();
    
    return NextResponse.json(client, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating client', error: error.message },
      { status: 400 }
    );
  }
} 