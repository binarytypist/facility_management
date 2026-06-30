import { NextResponse } from 'next/server';
import { CompanyTypeService } from '@/modules/company-type/company-type.service';

export async function GET() {
  try {
    const types = await CompanyTypeService.getAll();
    return NextResponse.json(types);
  } catch (error) {
    console.error('Error fetching company types:', error);
    return NextResponse.json({ error: 'Failed to fetch company types' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const type = await CompanyTypeService.create(code, name);
    return NextResponse.json(type, { status: 201 });
  } catch (error: any) {
    console.error('Error creating company type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Company type code or name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create company type', details: error.message }, { status: 500 });
  }
}

