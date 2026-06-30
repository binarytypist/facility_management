export interface Role {
  id: number;
  name: string;
  code: string;
}

export interface User {
  id: number;
  user_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  designation?: string;
  job_type?: string;
  email: string | null;
  role?: string;
  role_id?: number;
  role_name?: string;
  is_active?: boolean;
  created_at?: string;
}
