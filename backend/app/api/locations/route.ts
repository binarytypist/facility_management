import { corsHeaders } from '@/lib/cors';
import { NextResponse } from 'next/server';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;



export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  });
}

export async function GET() {
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const [locations] = await pool.query('SELECT * FROM locations ORDER BY id ASC');

    return NextResponse.json(
      {
        success: true,
        locations,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

