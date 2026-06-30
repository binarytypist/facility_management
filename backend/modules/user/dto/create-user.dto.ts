export type CreateUserDTO = {
  userNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  designation: string;
  jobType: string;
  email?: string | null;
  password?: string | null;
  roleId?: number | null;
  isActive?: boolean;
};
