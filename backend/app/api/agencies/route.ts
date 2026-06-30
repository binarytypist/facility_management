import { NextResponse } from 'next/server';
import { AgencyService } from '@/modules/agency/agency.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = {
      search: searchParams.get('search') ?? undefined,
      serviceCategoryIds: searchParams.get('service_category_ids') ?? undefined,
      facilityIds: searchParams.get('facility_ids') ?? undefined,
      isActive: searchParams.get('is_active') ?? undefined,
    };
    const agencies = await AgencyService.getAll(filter);
    return NextResponse.json(agencies);
  } catch (error: any) {
    console.error('Error fetching agencies:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid filter parameters', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const agency = await AgencyService.create({
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

    return NextResponse.json(agency, { status: 201 });
  } catch (error: any) {
    console.error('Error creating agency:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Agency already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create agency', details: error.message }, { status: 500 });
  }
}

