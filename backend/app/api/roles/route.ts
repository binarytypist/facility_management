import { NextResponse } from 'next/server';
import { RoleService } from '@/modules/role/role.service';

export async function GET() {
  try {
    const roles = await RoleService.getAll();
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json({ error: 'Failed to fetch roles' }, { status: 500 });
  }
}

