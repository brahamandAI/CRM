import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Client from '@/lib/models/Client';

// GET /api/clients/[id] - Get a single client
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const client = await Client.findById(params.id);
    
    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      contact: client.contactPhone,
      contractPeriod: `${new Date(client.contractStart).getFullYear()}-${new Date(client.contractEnd).getFullYear()}`,
      status: client.status === 'Expired' ? 'Inactive' : 'Active'
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error fetching client', error: error.message },
      { status: 500 }
    );
  }
}

// PUT /api/clients/[id] - Update a client
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    const client = await Client.findByIdAndUpdate(params.id, body, { new: true });

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: client._id.toString(),
      name: client.name,
      contact: client.contactPhone,
      contractPeriod: `${new Date(client.contractStart).getFullYear()}-${new Date(client.contractEnd).getFullYear()}`,
      status: client.status === 'Expired' ? 'Inactive' : 'Active'
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error updating client', error: error.message },
      { status: 400 }
    );
  }
}

// DELETE /api/clients/[id] - Delete a client
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'Admin') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    await dbConnect();
    const client = await Client.findByIdAndDelete(params.id);

    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Error deleting client', error: error.message },
      { status: 400 }
    );
  }
} 