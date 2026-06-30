import { NextResponse } from 'next/server';
import { DesignationService } from '@/modules/designation/designation.service';

export async function GET() {
  try {
    const designations = await DesignationService.getAll();
    return NextResponse.json(designations);
  } catch (error) {
    console.error('Error fetching designations:', error);
    return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const designation = await DesignationService.create(code, name);
    return NextResponse.json(designation, { status: 201 });
  } catch (error: any) {
    console.error('Error creating designation:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Designation code or name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create designation', details: error.message }, { status: 500 });
  }
}

