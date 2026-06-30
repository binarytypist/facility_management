export function toAgencyDTO(a: any) {
  if (!a) return null;
  return {
    id: a.id,
    name: a.name,
    code: a.code,
    contact_info: a.contactInfo,
    address: a.address,
    postcode: a.postcode,
    city: a.city,
    phone: a.phone,
    fax: a.fax,
    other_info: a.otherInfo,
    is_active: a.isActive,
    facility_id: a.facilityId,
    service_category_id: a.serviceCategoryId,
    service_category_name: a.serviceCategory?.name ?? null,
    facility_name: a.facility?.name ?? null,
    employee_count: a._count?.employees ?? 0,
  };
}
