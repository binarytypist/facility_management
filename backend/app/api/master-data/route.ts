import { NextResponse } from 'next/server';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

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

    const [workTypes] = await pool.query('SELECT * FROM work_types ORDER BY name ASC');
    const [teams] = await pool.query('SELECT * FROM teams ORDER BY name ASC');

    return NextResponse.json(
      {
        success: true,
        workTypes,
        teams,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error('Error fetching master data:', error);
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
    const { type, name, code, category, team_type, contact_info } = body;

    if (!type || !name) {
      return NextResponse.json(
        { success: false, message: 'Type and name are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    let result;
    if (type === 'work_type') {
      if (!code) throw new Error('Code is required for work type');
      [result] = await pool.query('INSERT INTO work_types (name, code, category) VALUES (?, ?, ?)', [name, code, category || null]);
    } else if (type === 'team') {
      if (!team_type) throw new Error('Team type is required');
      [result] = await pool.query('INSERT INTO teams (name, type, contact_info) VALUES (?, ?, ?)', [name, team_type, contact_info || '']);
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid master data type' },
        { status: 400, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Created successfully', id: (result as any).insertId },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error creating master data:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

