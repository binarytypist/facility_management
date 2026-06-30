import { NextResponse } from 'next/server';
import { pool, initDB } from '../../../lib/db';

export async function GET() {
  try {
    await initDB();
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT 
        c.id, c.name, c.code, c.contact_info, c.address, c.postcode, c.city, 
        c.phone, c.fax, c.other_info, c.is_active,
        c.facility_id, c.company_type_id,
        c.num_employees, c.floor_level, c.floor_size, c.has_elevator,
        ct.name as company_type_name,
        f.name as facility_name,
        COUNT(ce.id) as employee_count
      FROM clients c
      LEFT JOIN company_types ct ON c.company_type_id = ct.id
      LEFT JOIN facilities f ON c.facility_id = f.id
      LEFT JOIN client_employees ce ON c.id = ce.client_id
      GROUP BY c.id
    `);
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
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
    const [result] = await connection.query(`
      INSERT INTO clients (
        name, code, address, postcode, city, phone, fax, 
        company_type_id, facility_id,
        num_employees, floor_level, floor_size, has_elevator, other_info, is_active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name, code || null, address || null, postcode || null, city || null, phone || null, fax || null, 
      company_type_id || null, facility_id || null,
      num_employees || null, floor_level || null, floor_size || null, has_elevator ? 1 : 0, other_info || null, is_active !== undefined ? (is_active ? 1 : 0) : 1
    ]) as any;
    
    connection.release();
    return NextResponse.json({ id: result.insertId, ...body }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating client:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Client already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create client', details: error.message }, { status: 500 });
  }
}

