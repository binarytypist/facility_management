import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../../lib/db';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const id = params.id;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        c.id, c.name, c.code, c.contact_info, c.address, c.postcode, c.city, 
        c.phone, c.fax, c.other_info, c.is_active,
        c.facility_id, c.company_type_id,
        c.num_employees, c.floor_level, c.floor_size, c.has_elevator,
        ct.name as company_type_name
      FROM clients c
      LEFT JOIN company_types ct ON c.company_type_id = ct.id
      WHERE c.id = ?
    `, [id]) as any;
    connection.release();
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows[0]);
  } catch (error: any) {
    console.error('Error fetching client:', error);
    return NextResponse.json({ error: 'Failed to fetch client', details: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const id = params.id;
    const body = await request.json();
    const { 
      name, code, address, postcode, city, phone, fax, 
      company_type_id, facility_id,
      num_employees, floor_level, floor_size, has_elevator, other_info, is_active
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Company Name is required' }, { status: 400 });
    }

    const connection = await pool.getConnection();
    await connection.query(`
      UPDATE clients
      SET name = ?, code = ?, address = ?, postcode = ?, city = ?, phone = ?, fax = ?, 
          company_type_id = ?, facility_id = ?,
          num_employees = ?, floor_level = ?, floor_size = ?, has_elevator = ?, other_info = ?, is_active = ?
      WHERE id = ?
    `, [
      name, code || null, address || null, postcode || null, city || null, phone || null, fax || null, 
      company_type_id || null, facility_id || null,
      num_employees || null, floor_level || null, floor_size || null, has_elevator ? 1 : 0, other_info || null, is_active !== undefined ? (is_active ? 1 : 0) : 1, id
    ]);
    
    connection.release();
    return NextResponse.json({ success: true, id, ...body });
  } catch (error: any) {
    console.error('Error updating client:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Client already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update client', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    await initDB();
    const params = await context.params;
    const id = params.id;
    
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM clients WHERE id = ?', [id]);
    connection.release();
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client', details: error.message }, { status: 500 });
  }
}
