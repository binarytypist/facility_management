import { NextResponse } from 'next/server';
import { UserService } from '@/modules/user/user.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      search: searchParams.get('search') ?? undefined,
      roleIds: searchParams.get('role_ids') ?? undefined,
      isActive: searchParams.get('is_active') ?? undefined,
    };
    const users = await UserService.getAll(filter);
    return NextResponse.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid filter parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newUser = await UserService.create({
      userNumber: body.user_number,
      firstName: body.first_name,
      lastName: body.last_name,
      middleName: body.middle_name,
      designation: body.designation,
      jobType: body.job_type,
      email: body.email,
      password: body.password,
      roleId: body.role_id !== undefined ? Number(body.role_id) : undefined,
      isActive: body.is_active,
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'User number or email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user', details: error.message }, { status: 500 });
  }
}

