import { NextResponse } from 'next/server';
import { AgencyEmployeeService } from '@/modules/agency-employee/agency-employee.service';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const employeeId = Number(params.id);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    const body = await request.json();
    const employee = await AgencyEmployeeService.update(employeeId, {
      firstName: body.first_name,
      lastName: body.last_name,
      mobileNumber: body.mobile_number,
      otherPhone: body.other_phone,
      designation: body.designation,
      email: body.email,
      preferredCallTime: body.preferred_call_time,
      hasPrivatePhone: body.has_private_phone,
      privatePhone: body.private_phone,
      privateCallTime: body.private_call_time,
    });

    return NextResponse.json({ success: true, ...employee });
  } catch (error: any) {
    console.error('Error updating agency employee:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update agency employee', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const employeeId = Number(params.id);
    if (isNaN(employeeId)) {
      return NextResponse.json({ error: 'Invalid employee ID' }, { status: 400 });
    }

    await AgencyEmployeeService.delete(employeeId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agency employee:', error);
    return NextResponse.json({ error: 'Failed to delete agency employee', details: error.message }, { status: 500 });
  }
}


