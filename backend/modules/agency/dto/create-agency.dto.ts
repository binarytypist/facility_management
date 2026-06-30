export type CreateAgencyDTO = {
  name: string;
  code?: string | null;
  address?: string | null;
  postcode?: string | null;
  city?: string | null;
  phone?: string | null;
  fax?: string | null;
  serviceCategoryId?: number | null;
  facilityId?: number | null;
  otherInfo?: string | null;
  isActive?: boolean;
};
