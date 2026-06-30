import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../../lib/db';

export async function GET(request: Request, context: { params: { id: string } }) {
  try {
    await initDB();
    const { id } = context.params;
    const connection = await pool.getConnection();
    const [[user]] = await connection.query(`
      SELECT id, user_number, first_name, last_name, middle_name, designation, job_type, email, role, role_id, is_active, created_at
      FROM users 
      WHERE id = ?
    `, [id]) as any;
    
    connection.release();
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const body = await request.json();
    await initDB();
    const connection = await pool.getConnection();

    // Partial update logic
    let updates: string[] = [];
    let params: any[] = [];

    // Profile fields
    if (body.user_number !== undefined) { updates.push('user_number = ?'); params.push(body.user_number); }
    if (body.first_name !== undefined) { updates.push('first_name = ?'); params.push(body.first_name); }
    if (body.last_name !== undefined) { updates.push('last_name = ?'); params.push(body.last_name); }
    if (body.middle_name !== undefined) { updates.push('middle_name = ?'); params.push(body.middle_name); }
    if (body.designation !== undefined) { updates.push('designation = ?'); params.push(body.designation); }
    if (body.job_type !== undefined) { updates.push('job_type = ?'); params.push(body.job_type); }
    if (body.is_active !== undefined) { updates.push('is_active = ?'); params.push(body.is_active); }
    
    // Credentials fields
    if (body.email !== undefined) { updates.push('email = ?'); params.push(body.email); }
    if (body.password) { updates.push('password = ?'); params.push(body.password); }

    // Role logic
    if (body.role_id !== undefined) {
      let finalRoleCode = 'user';
      if (body.role_id) {
        const [[role]] = await connection.query('SELECT code FROM roles WHERE id = ?', [body.role_id]) as any;
        if (role) {
          finalRoleCode = role.code;
        }
      }
      updates.push('role_id = ?'); params.push(body.role_id);
      updates.push('role = ?'); params.push(finalRoleCode);
    }

    if (updates.length === 0) {
      connection.release();
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    params.push(id);

    const [result] = await connection.query(query, params) as any;
    connection.release();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const { id } = context.params;
    const connection = await pool.getConnection();
    
    const [result] = await connection.query('DELETE FROM users WHERE id = ?', [id]) as any;
    connection.release();

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
