import { NextResponse } from 'next/server';
import { pool, initDB } from '@/lib/db';

let isDbInitialized = false;

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
  let connection;
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const { work_item_id, date } = await request.json();

    if (!work_item_id || !date) {
      return NextResponse.json(
        { success: false, message: 'Work item ID and date are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Fetch work item details and its location (via facility)
    const [items] = await connection.query(`
      SELECT wi.*, f.location_id
      FROM work_items wi
      JOIN facilities f ON wi.facility_id = f.id
      WHERE wi.id = ?
    `, [parseInt(work_item_id, 10)]) as any[];

    if (!items || items.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: 'Work item not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const item = items[0];

    // 2. Insert into work_events as a scheduled event
    const [result] = await connection.query(`
      INSERT INTO work_events (
        title, description, service_category_id, work_type_id, location_id,
        facility_id, work_item_id, scheduled_date, schedule_type,
        structure_type, execution_type, priority, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled', 'structured', 'internal', 'medium', 'created')
    `, [
      item.title,
      item.description || `Scheduled from work item backlog template.`,
      item.service_category_id,
      item.work_type_id,
      item.location_id,
      item.facility_id,
      item.id,
      date
    ]) as any[];

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'Work event scheduled successfully',
        workEventId: result.insertId
      },
      {
        status: 201,
        headers: corsHeaders()
      }
    );
  } catch (error: any) {
    console.error('Error scheduling work event:', error);
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError);
      }
    }
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

