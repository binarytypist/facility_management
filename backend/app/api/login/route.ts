import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;

// Handle CORS headers
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': 'http://localhost:4200',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

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

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Fetch user from MySQL
    const [users] = await pool.query(
      'SELECT id, email, password, role FROM users WHERE email = ?',
      [email]
    ) as any[];

    if (!users || users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401, headers: corsHeaders() }
      );
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        role: user.role || 'user'
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error during login API execution:', error);
    return NextResponse.json(
      { success: false, message: 'Server error during login: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

