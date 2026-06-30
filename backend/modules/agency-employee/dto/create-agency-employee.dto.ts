export type CreateAgencyEmployeeDTO = {
  agencyId: number;
  firstName: string;
  lastName: string;
  mobileNumber?: string | null;
  otherPhone?: string | null;
  designation?: string | null;
  email?: string | null;
  preferredCallTime?: string | null;
  hasPrivatePhone?: boolean;
  privatePhone?: string | null;
  privateCallTime?: string | null;
};
