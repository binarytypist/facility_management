import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../../lib/db';

let isDbInitialized = false;

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders() });
}

export async function GET() {
  try {
    if (!isDbInitialized) {
      await initDB();
    }

    const [items] = await pool.query(`
      SELECT 
        w.id,
        w.title,
        w.description,
        f.name as facility,
        c.name as client,
        null as service_category,
        wt.name as work_type,
        w.estimated_duration
      FROM work_items w
      JOIN facilities f ON w.facility_id = f.id
      LEFT JOIN clients c ON w.client_id = c.id
      JOIN work_types wt ON w.work_type_id = wt.id
      ORDER BY w.id ASC
    `) as any[];

    if (!items || items.length === 0) {
      return new NextResponse('No data available', { status: 404, headers: corsHeaders() });
    }

    // Convert JSON to CSV
    const header = Object.keys(items[0]).join(',');
    const rows = items.map(item => 
      Object.values(item).map(val => 
        typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
      ).join(',')
    );

    const csvContent = [header, ...rows].join('\n');

    const headers = {
      ...corsHeaders(),
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="work_items_export.csv"'
    };

    return new NextResponse(csvContent, { status: 200, headers });
  } catch (error: any) {
    console.error('Error exporting work items:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

