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

export async function GET(
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

    const [rows] = await pool.query(`
      SELECT 
        we.*, 
        null as service_category_name, 
        null as service_category_code,
        wt.name as work_type_name, 
        wt.code as work_type_code,
        loc.name as location_name, 
        loc.type as location_type,
        t.name as assigned_team_name,
        t.type as assigned_team_type,
        wr.id as result_id,
        wr.completion_details,
        wr.findings,
        wr.materials_used,
        wr.labor_hours,
        wr.cost as result_cost,
        wr.attachments,
        wr.completion_date,
        ae.first_name as assigned_employee_first_name,
        ae.last_name as assigned_employee_last_name
      FROM work_events we
      LEFT JOIN work_types wt ON we.work_type_id = wt.id
      LEFT JOIN locations loc ON we.location_id = loc.id
      LEFT JOIN teams t ON we.assigned_team_id = t.id
      LEFT JOIN work_results wr ON we.id = wr.work_event_id
      LEFT JOIN agency_employees ae ON we.assigned_employee_id = ae.id
      WHERE we.id = ?
    `, [eventId]) as any[];

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Work event not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    const row = rows[0];
    const workEvent = {
      ...row,
      checklist: row.checklist ? JSON.parse(row.checklist) : null,
      materials_used: row.materials_used ? JSON.parse(row.materials_used) : null,
      attachments: row.attachments ? JSON.parse(row.attachments) : null,
    };

    return NextResponse.json(
      { success: true, workEvent },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error fetching work event details:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    const {
      status,
      assigned_team_id,
      priority,
      checklist,
      title,
      description,
      location_id,
      assigned_agency_id,
      scheduled_date,
      is_assigned,
      client_id,
      service_category_id,
      work_type_id,
      assigned_employee_id,
    } = body;

    // Build dynamic UPDATE query
    const updates: string[] = [];
    const paramsList: any[] = [];

    if (status !== undefined) {
      updates.push('status = ?');
      paramsList.push(status);
    }

    if (assigned_team_id !== undefined) {
      updates.push('assigned_team_id = ?');
      paramsList.push(assigned_team_id ? parseInt(assigned_team_id, 10) : null);
      
      // Auto transition to 'assigned' if currently 'created' and team/agency is added
      if ((assigned_team_id || assigned_agency_id) && status === undefined) {
        const [curr] = await pool.query('SELECT status FROM work_events WHERE id = ?', [eventId]) as any[];
        if (curr && curr.length > 0 && curr[0].status === 'created') {
          updates.push('status = ?');
          paramsList.push('assigned');
        }
      }
    }

    if (assigned_agency_id !== undefined) {
      updates.push('assigned_agency_id = ?');
      paramsList.push(assigned_agency_id ? parseInt(assigned_agency_id, 10) : null);
      
      // Auto transition to 'assigned' if currently 'created' and team/agency is added
      if ((assigned_team_id || assigned_agency_id) && status === undefined && assigned_team_id === undefined) {
        const [curr] = await pool.query('SELECT status FROM work_events WHERE id = ?', [eventId]) as any[];
        if (curr && curr.length > 0 && curr[0].status === 'created') {
          updates.push('status = ?');
          paramsList.push('assigned');
        }
      }
    }

    if (scheduled_date !== undefined) {
      updates.push('scheduled_date = ?');
      paramsList.push(scheduled_date || null);
    }

    if (is_assigned !== undefined) {
      updates.push('is_assigned = ?');
      paramsList.push(parseInt(is_assigned, 10));
    }

    if (client_id !== undefined) {
      updates.push('client_id = ?');
      paramsList.push(client_id ? parseInt(client_id, 10) : null);
    }



    if (work_type_id !== undefined) {
      updates.push('work_type_id = ?');
      paramsList.push(parseInt(work_type_id, 10));
    }

    if (assigned_employee_id !== undefined) {
      updates.push('assigned_employee_id = ?');
      paramsList.push(assigned_employee_id ? parseInt(assigned_employee_id, 10) : null);
    }

    if (priority !== undefined) {
      updates.push('priority = ?');
      paramsList.push(priority);
    }

    if (checklist !== undefined) {
      updates.push('checklist = ?');
      paramsList.push(checklist ? JSON.stringify(checklist) : null);
    }

    if (title !== undefined) {
      updates.push('title = ?');
      paramsList.push(title);
    }

    if (description !== undefined) {
      updates.push('description = ?');
      paramsList.push(description);
    }

    if (location_id !== undefined) {
      updates.push('location_id = ?');
      paramsList.push(parseInt(location_id, 10));
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No fields to update' },
        { status: 400, headers: corsHeaders() }
      );
    }

    paramsList.push(eventId);

    const [result] = await pool.query(`
      UPDATE work_events 
      SET ${updates.join(', ')}
      WHERE id = ?
    `, paramsList) as any[];

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: 'Work event not found' },
        { status: 404, headers: corsHeaders() }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Work event updated successfully' },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error updating work event:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
