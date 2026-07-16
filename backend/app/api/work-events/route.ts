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

export async function GET(request: Request) {
  try {
    if (!isDbInitialized) {
      await initDB();
      isDbInitialized = true;
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('location_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const categoryId = searchParams.get('service_category_id');
    const scheduleType = searchParams.get('schedule_type');
    const search = searchParams.get('search');

    let sql = `
      SELECT 
        we.*, 
        wt.name as work_type_name, 
        wt.code as work_type_code,
        loc.name as location_name, 
        loc.type as location_type,
        t.name as assigned_team_name,
        t.type as assigned_team_type,
        ag.name as assigned_agency_name,
        ag.code as assigned_agency_code,
        cl.name as client_name,
        cl.code as client_code,
        ae.first_name as assigned_employee_first_name,
        ae.last_name as assigned_employee_last_name
      FROM work_events we
      LEFT JOIN work_types wt ON we.work_type_id = wt.id
      LEFT JOIN locations loc ON we.location_id = loc.id
      LEFT JOIN teams t ON we.assigned_team_id = t.id
      LEFT JOIN agencies ag ON we.assigned_agency_id = ag.id
      LEFT JOIN clients cl ON we.client_id = cl.id
      LEFT JOIN agency_employees ae ON we.assigned_employee_id = ae.id
      WHERE 1=1
    `;
    const params: any[] = [];

    // Filter by location (recursive check)
    if (locationId) {
      const locIdNum = parseInt(locationId, 10);
      if (!isNaN(locIdNum)) {
        // Fetch all locations to compute descendants
        const [allLocs] = await pool.query('SELECT id, parent_id FROM locations') as any[];
        const descendantIds = [locIdNum];
        
        const getChildren = (id: number) => {
          allLocs.forEach((loc: any) => {
            if (loc.parent_id === id) {
              descendantIds.push(loc.id);
              getChildren(loc.id);
            }
          });
        };
        
        getChildren(locIdNum);
        
        sql += ` AND we.location_id IN (${descendantIds.join(',')})`;
      }
    }

    if (status) {
      sql += ' AND we.status = ?';
      params.push(status);
    }

    const isAssigned = searchParams.get('is_assigned');
    if (isAssigned !== null) {
      sql += ' AND we.is_assigned = ?';
      params.push(parseInt(isAssigned, 10));
    }

    if (priority) {
      sql += ' AND we.priority = ?';
      params.push(priority);
    }

    if (categoryId) {
      // Logic for service_category_id can be ignored or adapted to work_type category if needed
      // sql += ' AND we.service_category_id = ?';
      // params.push(parseInt(categoryId, 10));
    }

    if (scheduleType) {
      sql += ' AND we.schedule_type = ?';
      params.push(scheduleType);
    }

    if (search) {
      sql += ' AND (we.title LIKE ? OR we.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY we.created_at DESC';

    const [rows] = await pool.query(sql, params) as any[];

    // Parse checklist field from text to JSON
    const parsedRows = rows.map((row: any) => ({
      ...row,
      checklist: row.checklist ? JSON.parse(row.checklist) : null,
    }));

    return NextResponse.json(
      { success: true, workEvents: parsedRows },
      { status: 200, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error fetching work events:', error);
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
      work_type_id,
      location_id,
      schedule_type,
      structure_type,
      execution_type,
      priority,
      assigned_team_id,
      checklist,
      client_id,
      assigned_agency_id,
      scheduled_date,
      is_assigned,
      assigned_employee_id,
    } = body;

    if (!title || !work_type_id || !schedule_type || !structure_type || !execution_type || !priority) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400, headers: corsHeaders() }
      );
    }

    // Determine default status
    const status = (assigned_team_id || assigned_agency_id) ? 'assigned' : 'created';

    const checklistStr = checklist ? JSON.stringify(checklist) : null;
    const isAssignedVal = assigned_agency_id ? 1 : (is_assigned ? parseInt(is_assigned, 10) : 0);

    const [result] = await pool.query(`
      INSERT INTO work_events (
        title, description, work_type_id, location_id, 
        schedule_type, structure_type, execution_type, priority, status, 
        assigned_team_id, checklist, client_id, assigned_agency_id, scheduled_date, is_assigned,
        assigned_employee_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      description || null,
      parseInt(work_type_id, 10),
      location_id ? parseInt(location_id, 10) : null,
      schedule_type,
      structure_type,
      execution_type,
      priority,
      status,
      assigned_team_id ? parseInt(assigned_team_id, 10) : null,
      checklistStr,
      client_id ? parseInt(client_id, 10) : null,
      assigned_agency_id ? parseInt(assigned_agency_id, 10) : null,
      scheduled_date || null,
      isAssignedVal,
      assigned_employee_id ? parseInt(assigned_employee_id, 10) : null,
    ]) as any[];

    return NextResponse.json(
      {
        success: true,
        message: 'Work event created successfully',
        workEventId: result.insertId,
      },
      { status: 201, headers: corsHeaders() }
    );
  } catch (error: any) {
    console.error('Error creating work event:', error);
    return NextResponse.json(
      { success: false, message: 'Server error: ' + error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}

