export function toUserDTO(u: any) {
  if (!u) return null;
  return {
    id: u.id,
    user_number: u.userNumber,
    first_name: u.firstName,
    last_name: u.lastName,
    middle_name: u.middleName,
    designation: u.designation,
    job_type: u.jobType,
    email: u.email,
    role: u.role,
    role_id: u.roleId,
    is_active: u.isActive,
    created_at: u.createdAt,
    role_name: u.roleRelation?.name ?? null,
  };
}
