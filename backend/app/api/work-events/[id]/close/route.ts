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

    const [events] = await pool.query(
      'SELECT status FROM work_events WHERE id = ?',
      [eventId]
    ) as any[];

    if (!events || events.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Work event not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const currentStatus = events[0].status;
    if (currentStatus !== 'completed') {
      return NextResponse.json(
        {
          success: false,
          message: `Only completed tasks can be closed. Current status: ${currentStatus}`,
        },
        { status: 400, headers: corsHeaders() }
      );
    }

    await pool.query(
      "UPDATE work_events SET status = 'closed' WHERE id = ?",
      [eventId]
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Work event closed successfully',
      },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error closing work event:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
