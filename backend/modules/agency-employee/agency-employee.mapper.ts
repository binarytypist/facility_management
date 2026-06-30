export function toAgencyEmployeeDTO(e: any) {
  if (!e) return null;
  return {
    id: e.id,
    agency_id: e.agencyId,
    first_name: e.firstName,
    last_name: e.lastName,
    mobile_number: e.mobileNumber ?? null,
    other_phone: e.otherPhone ?? null,
    designation: e.designation ?? null,
    email: e.email ?? null,
    preferred_call_time: e.preferredCallTime ?? null,
    has_private_phone: e.hasPrivatePhone ?? false,
    private_phone: e.privatePhone ?? null,
    private_call_time: e.privateCallTime ?? null,
  };
}
