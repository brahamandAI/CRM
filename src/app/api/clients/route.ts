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
    const clients = await Client.find().select('name contactPerson contactPhone contractStart contractEnd status');
    
    // Transform the data to match the frontend interface
    const transformedClients = clients.map(client => ({
      id: client._id.toString(),
      name: client.name,
      contact: client.contactPhone,
      contractPeriod: `${new Date(client.contractStart).getFullYear()}-${new Date(client.contractEnd).getFullYear()}`,
      status: client.status === 'Expired' ? 'Inactive' : 'Active'
    }));

    return NextResponse.json(transformedClients);
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
    
    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      contact: client.contactPhone,
      contractPeriod: `${new Date(client.contractStart).getFullYear()}-${new Date(client.contractEnd).getFullYear()}`,
      status: client.status === 'Expired' ? 'Inactive' : 'Active'
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error creating client', error: error.message },
      { status: 400 }
    );
  }
} 