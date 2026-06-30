import { NextResponse } from 'next/server';
import { ServiceCategoryService } from '@/modules/service-category/service-category.service';

export async function GET() {
  try {
    const categories = await ServiceCategoryService.getAll();
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, code } = await request.json();
    if (!name || !code) {
      return NextResponse.json({ error: 'Name and code are required' }, { status: 400 });
    }

    const category = await ServiceCategoryService.create(name, code);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'A service category with this code already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

