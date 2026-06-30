import { NextResponse } from 'next/server';
import { CompanyTypeService } from '@/modules/company-type/company-type.service';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const updated = await CompanyTypeService.update(id, code, name);
    return NextResponse.json({ success: true, ...updated });
  } catch (error: any) {
    console.error('Error updating company type:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Company type code or name already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Company type not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update company type', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    await CompanyTypeService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting company type:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Company type not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete company type', details: error.message }, { status: 500 });
  }
}
