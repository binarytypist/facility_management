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

export async function POST(
  request: Request,
  { params }: { params: any }
) {
  let connection;
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const { id } = await params;
    const eventId = parseInt(id, 10);

    if (isNaN(eventId)) {
      return NextResponse.json(
        { success: false, message: 'Invalid event ID' },
        { status: 400, headers: corsHeaders() }
      );
    }

    const body = await request.json();
    const {
      completion_details,
      findings,
      materials_used, // array of { material, cost, quantity }
      labor_hours,
      cost, // total cost
      attachments, // array of strings (names or URLs)
    } = body;

    if (!completion_details) {
      return NextResponse.json(
        { success: false, message: 'Completion details are required' },
        { status: 400, headers: corsHeaders() }
      );
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Verify work event exists and is not already closed
    const [events] = await connection.query(
      'SELECT status FROM work_events WHERE id = ?',
      [eventId]
    ) as any[];

    if (!events || events.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: 'Work event not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    if (events[0].status === 'closed') {
      await connection.rollback();
      return NextResponse.json(
        { success: false, message: 'Cannot complete a closed work event' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // 2. Insert or Replace Work Result
    const materialsStr = materials_used ? JSON.stringify(materials_used) : null;
    const attachmentsStr = attachments ? JSON.stringify(attachments) : null;

    // Use INSERT INTO ... ON DUPLICATE KEY UPDATE in case complete is called again
    await connection.query(`
      INSERT INTO work_results (
        work_event_id, completion_details, findings, materials_used, 
        labor_hours, cost, attachments, completion_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON DUPLICATE KEY UPDATE
        completion_details = VALUES(completion_details),
        findings = VALUES(findings),
        materials_used = VALUES(materials_used),
        labor_hours = VALUES(labor_hours),
        cost = VALUES(cost),
        attachments = VALUES(attachments),
        completion_date = CURRENT_TIMESTAMP
    `, [
      eventId,
      completion_details,
      findings || null,
      materialsStr,
      labor_hours !== undefined ? parseFloat(labor_hours) : 0.00,
      cost !== undefined ? parseFloat(cost) : 0.00,
      attachmentsStr,
    ]);

    // 3. Update work event status to 'completed'
    await connection.query(
      "UPDATE work_events SET status = 'completed' WHERE id = ?",
      [eventId]
    );

    await connection.commit();

    return NextResponse.json(
      {
        success: true,
        message: 'Work event completed and results saved successfully',
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error completing work event:', error);
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
