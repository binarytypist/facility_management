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

    const [facilities] = await pool.query(`
      SELECT f.*, ft.name as facility_type_name, ft.code as facility_type_code, loc.name as location_name
      FROM facilities f
      JOIN facility_types ft ON f.facility_type_id = ft.id
      JOIN locations loc ON f.location_id = loc.id
      ORDER BY f.id ASC
    `) as any[];

    return NextResponse.json(
      {
        success: true,
        facilities,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error('Error fetching facilities:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const body = await request.json();
    const { name, facility_type_id, location_id } = body;

    if (!name || !facility_type_id || !location_id) {
      return NextResponse.json(
        { success: false, message: 'Name, facility type, and location are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const [result] = await pool.query(
      'INSERT INTO facilities (name, facility_type_id, location_id) VALUES (?, ?, ?)',
      [name, facility_type_id, location_id]
    );

    return NextResponse.json(
      { success: true, message: 'Created successfully', id: (result as any).insertId },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

