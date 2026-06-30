import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../../../lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const clientId = params.id;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT * FROM client_employees 
      WHERE client_id = ?
      ORDER BY first_name ASC, last_name ASC
    `, [clientId]);
    connection.release();
    
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Error fetching client employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees', details: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const clientId = params.id;
    const body = await request.json();
    
    const { 
      first_name, last_name, mobile_number, other_phone, designation, email, preferred_call_time,
      has_private_phone, private_phone, private_call_time
    } = body;

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'First and Last name are required' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    // Enforce 2 employees per company limit
    const [countRows] = await connection.query(`SELECT COUNT(*) as count FROM client_employees WHERE client_id = ?`, [clientId]) as any;
    if (countRows[0].count >= 2) {
      connection.release();
      return NextResponse.json({ error: 'Maximum limit of 2 employees per company reached.' }, { status: 400 });
    }

    const [result] = await connection.query(`
      INSERT INTO client_employees (
        client_id, first_name, last_name, mobile_number, other_phone, designation, email, preferred_call_time,
        has_private_phone, private_phone, private_call_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientId, first_name, last_name, mobile_number || null, other_phone || null, designation || null, email || null, preferred_call_time || null,
      has_private_phone ? 1 : 0, private_phone || null, private_call_time || null
    ]) as any;
    
    connection.release();
    return NextResponse.json({ 
      id: result.insertId, client_id: clientId, ...body 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client employee:', error);
    return NextResponse.json({ error: 'Failed to add employee', details: error.message }, { status: 500 });
  }
}
