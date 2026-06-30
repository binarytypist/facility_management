import { NextResponse } from 'next/server';
import { WorkTypeService } from '@/modules/work-type/work-type.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const workTypes = await WorkTypeService.getAll(category || undefined);
    return NextResponse.json(workTypes);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, code, category } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const type = await WorkTypeService.create(name, code, category);
    return NextResponse.json(type, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A work type with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

