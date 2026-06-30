import { z } from 'zod';

export const CreateUserSchema = z.object({
  userNumber: z.string().min(1, 'User Number is required'),
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  middleName: z.string().nullable().optional(),
  designation: z.string().min(1, 'Designation is required'),
  jobType: z.string().min(1, 'Job Type is required'),
  email: z.union([z.string().email('Invalid email address'), z.literal('')]).nullable().optional(),
  password: z.string().nullable().optional(),
  roleId: z.number().nullable().optional(),
  isActive: z.boolean().optional(),
});

export const UserFilterSchema = z.object({
  search: z.string().optional(),
  roleIds: z.union([
    z.string().transform((val) => val.split(',').map(Number)),
    z.array(z.number())
  ]).optional(),
  isActive: z.union([
    z.string().transform((val) => val === 'true'),
    z.boolean()
  ]).optional(),
});
