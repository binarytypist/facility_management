import { z } from 'zod';

export const CreateAgencySchema = z.object({
  name: z.string().min(1, 'Agency Name is required'),
  code: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  postcode: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  serviceCategoryId: z.number().nullable().optional(),
  facilityId: z.number().nullable().optional(),
  otherInfo: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const UpdateAgencySchema = CreateAgencySchema.partial();

export const AgencyFilterSchema = z.object({
  search: z.string().optional(),
  serviceCategoryIds: z.union([
    z.string().transform((val) => val.split(',').map(Number)),
    z.array(z.number())
  ]).optional(),
  facilityIds: z.union([
    z.string().transform((val) => val.split(',').map(Number)),
    z.array(z.number())
  ]).optional(),
  isActive: z.union([
    z.string().transform((val) => val === 'true'),
    z.boolean()
  ]).optional(),
});
