import { corsHeaders } from '@/lib/cors';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;

// Handle CORS headers


export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function POST(request: Request) {
  try {
    // Lazy DB initialization on first request
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (existingUsers && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Default role to 'user'
    const userRole = role || 'user';

    // Insert user into MySQL
    await pool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, userRole]
    );

    return NextResponse.json(
      { success: true, message: 'User registered successfully' },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error during registration API execution:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during registration: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

