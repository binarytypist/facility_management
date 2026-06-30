import { NextResponse } from 'next/server';
import { DesignationService } from '@/modules/designation/designation.service';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);
    const body = await request.json();
    const { code, name } = body;

    if (!code || !name) {
      return NextResponse.json({ error: 'Code and Name are required' }, { status: 400 });
    }

    const updated = await DesignationService.update(id, code, name);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating designation:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Designation code or name already exists' }, { status: 409 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update designation', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const id = Number(params.id);

    await DesignationService.delete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting designation:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Designation not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: 'Failed to delete designation. It might be in use.', details: error.message },
      { status: 500 }
    );
  }
}
