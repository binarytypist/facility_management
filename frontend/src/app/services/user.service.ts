import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Role } from '../models/user.model';
import { Designation } from '../models/designation.model';

export interface CreateUserPayload {
  user_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  designation: string;
  job_type: string;
  role_id: number | null;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public getRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${this.apiUrl}/roles`);
  }

  public getDesignations(): Observable<Designation[]> {
    return this.http.get<Designation[]>(`${this.apiUrl}/designations`);
  }

  public createUser(payload: CreateUserPayload): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/users`, payload);
  }
}
