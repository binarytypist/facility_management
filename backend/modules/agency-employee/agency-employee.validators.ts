import { z } from 'zod';

export const CreateAgencyEmployeeSchema = z.object({
  agencyId: z.number({ required_error: 'Agency ID is required' }).int().positive(),
  firstName: z.string().min(1, 'First Name is required').max(100),
  lastName: z.string().min(1, 'Last Name is required').max(100),
  mobileNumber: z.string().max(50).nullable().optional(),
  otherPhone: z.string().max(50).nullable().optional(),
  designation: z.string().max(100).nullable().optional(),
  email: z.union([
    z.string().email('Invalid email format').max(150),
    z.string().length(0).transform(() => null),
    z.null()
  ]).optional(),
  preferredCallTime: z.string().max(50).nullable().optional(),
  hasPrivatePhone: z.boolean().optional(),
  privatePhone: z.string().max(50).nullable().optional(),
  privateCallTime: z.string().max(50).nullable().optional(),
});

export const UpdateAgencyEmployeeSchema = CreateAgencyEmployeeSchema.omit({ agencyId: true }).partial();
