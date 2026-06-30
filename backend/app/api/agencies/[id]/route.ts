import { NextResponse } from 'next/server';
import { AgencyService } from '@/modules/agency/agency.service';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const agencyId = Number(params.id);
    const agency = await AgencyService.getById(agencyId);

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error('Error fetching agency:', error);
    return NextResponse.json({ error: 'Failed to fetch agency' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const agencyId = Number(params.id);
    const body = await request.json();

    const updated = await AgencyService.update(agencyId, {
      name: body.name,
      code: body.code,
      address: body.address,
      postcode: body.postcode,
      city: body.city,
      phone: body.phone,
      fax: body.fax,
      serviceCategoryId: body.service_category_id !== undefined ? Number(body.service_category_id) : undefined,
      facilityId: body.facility_id !== undefined ? Number(body.facility_id) : undefined,
      otherInfo: body.other_info,
      isActive: body.is_active,
    });

    return NextResponse.json({
      success: true,
      ...updated,
    });
  } catch (error: any) {
    console.error('Error updating agency:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to update agency', details: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const params = await context.params;
    const agencyId = Number(params.id);

    await AgencyService.delete(agencyId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting agency:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete agency', details: error.message }, { status: 500 });
  }
}
