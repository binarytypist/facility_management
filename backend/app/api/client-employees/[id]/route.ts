import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../../lib/db';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const employeeId = params.id;
    const body = await request.json();
    
    const { 
      first_name, last_name, mobile_number, other_phone, designation, email, preferred_call_time,
      has_private_phone, private_phone, private_call_time
    } = body;

    if (!first_name || !last_name) {
      return NextResponse.json({ error: 'First and Last name are required' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    await connection.query(`
      UPDATE client_employees
      SET first_name = ?, last_name = ?, mobile_number = ?, other_phone = ?, designation = ?, email = ?, preferred_call_time = ?,
          has_private_phone = ?, private_phone = ?, private_call_time = ?
      WHERE id = ?
    `, [
      first_name, last_name, mobile_number || null, other_phone || null, designation || null, email || null, preferred_call_time || null,
      has_private_phone ? 1 : 0, private_phone || null, private_call_time || null,
      employeeId
    ]);
    
    connection.release();
    return NextResponse.json({ success: true, id: employeeId, ...body });
  } catch (error: any) {
    console.error('Error updating client employee:', error);
    return NextResponse.json({ error: 'Failed to update employee', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const employeeId = params.id;
    
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM client_employees WHERE id = ?', [employeeId]);
    connection.release();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client employee:', error);
    return NextResponse.json({ error: 'Failed to delete employee', details: error.message }, { status: 500 });
  }
}
