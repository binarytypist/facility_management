export interface Client {
  id: number;
  name: string;
  contact_info: string;
  address: string;
  postcode: string;
  city: string;
  phone: string;
  fax: string;
  other_info: string;
  facility_id: number;
  company_type_id: number;
  company_type_name: string;
  facility_name: string;
  employee_count: number;
}

export interface ClientEmployee {
  id: number;
  client_id: number;
  first_name: string;
  last_name: string;
  mobile_number: string;
  other_phone: string;
  designation: string;
  email: string;
  preferred_call_time: string;
  has_private_phone: boolean;
  private_phone: string;
  private_call_time: string;
}
