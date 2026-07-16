import { NextResponse } from 'next/server';
import { clientService } from '../../../lib/di';

export async function GET() {
  try {
    const clients = await clientService.getAllClients();
    return NextResponse.json(clients);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const result = await clientService.createClient(body);
    
    return NextResponse.json({ id: result.id, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.message === 'Company Name is required') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error.code === 'P2002') { // Prisma unique constraint error
      return NextResponse.json({ error: 'Client already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create client', details: error.message }, { status: 500 });
  }
}


