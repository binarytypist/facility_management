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

    const [workItems] = await pool.query(`
      SELECT 
        wi.*, 
        f.name as facility_name, 
        c.name as client_name,
        null as service_category_name, 
        wt.name as work_type_name
      FROM work_items wi
      JOIN facilities f ON wi.facility_id = f.id
      LEFT JOIN clients c ON wi.client_id = c.id
      JOIN work_types wt ON wi.work_type_id = wt.id
      ORDER BY wi.id DESC
    `) as any[];

    return NextResponse.json(
      {
        success: true,
        workItems,
      },
      {
        status: 200,
        headers: corsHeaders(),
      }
    );
  } catch (error: any) {
    console.error('Error fetching work items:', error);
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
    const {
      title,
      description,
      facility_id,
      client_id,
      service_category_id,
      work_type_id,
      estimated_duration
    } = body;

    if (!title || !facility_id || !work_type_id) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const [result] = await pool.query(`
      INSERT INTO work_items (
        title, description, facility_id, client_id, 
        work_type_id, estimated_duration
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || null,
      parseInt(facility_id, 10),
      client_id ? parseInt(client_id, 10) : null,
      parseInt(work_type_id, 10),
      estimated_duration !== undefined ? parseFloat(estimated_duration) : 1.00
    ]) as any[];

    return NextResponse.json(
      {
        success: true,
        message: 'Work item created successfully',
        workItemId: result.insertId,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error creating work item:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

