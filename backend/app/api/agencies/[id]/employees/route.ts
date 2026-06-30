import { NextResponse } from 'next/server';
import { AgencyEmployeeService } from '@/modules/agency-employee/agency-employee.service';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const agencyId = Number(params.id);
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }

    const employees = await AgencyEmployeeService.getAllByAgencyId(agencyId);
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching agency employees:', error);
    return NextResponse.json({ error: 'Failed to fetch agency employees' }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const agencyId = Number(params.id);
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }

    const body = await request.json();

    const employee = await AgencyEmployeeService.create({
      agencyId,
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

    return NextResponse.json({ success: true, ...employee }, { status: 201 });
  } catch (error: any) {
    console.error('Error adding agency employee:', error);

    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }

    if (error.message?.startsWith('LimitReached:')) {
      return NextResponse.json({ error: error.message.replace('LimitReached: ', '') }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to add agency employee', details: error.message }, { status: 500 });
  }
}


