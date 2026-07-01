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

export async function POST(request: Request) {
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const body = await request.json();
    const { eventIds, agencyId } = body;

    if (!Array.isArray(eventIds) || eventIds.length === 0 || !agencyId) {
      return NextResponse.json(
        { success: false, message: 'Missing eventIds or agencyId' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const placeholders = eventIds.map(() => '?').join(',');
    const sql = `
      UPDATE work_events 
      SET assigned_agency_id = ?, is_assigned = 1, assigned_date = NOW() 
      WHERE id IN (${placeholders})
    `;
    
    const params = [agencyId, ...eventIds];
    
    await pool.query(sql, params);

    return NextResponse.json(
      { success: true, message: 'Work events assigned successfully' },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error assigning work events:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

