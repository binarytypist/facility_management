import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Client } from '../models/client.model';
import { ServiceCategory } from '../models/service-category.model';
import { WorkType } from '../models/work-type.model';
import { LocationNode } from '../models/location.model';
import { Agency } from '../models/agency.model';
import { ApiResponse } from '../models/api-response.model';
import { MasterDataPayload } from '../models/master-data.model';

@Injectable({
  providedIn: 'root'
})
export class MasterDataService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMasterData(): Observable<ApiResponse<MasterDataPayload>> {
    return this.http.get<ApiResponse<MasterDataPayload>>(`${this.apiUrl}/master-data`);
  }

  getClients(): Observable<ApiResponse<Client[]>> {
    return this.http.get<ApiResponse<Client[]>>(`${this.apiUrl}/clients`);
  }

  createCategory(payload: Partial<ServiceCategory>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/master-data`, {
      type: 'category',
      data: payload
    });
  }

  createWorkType(payload: Partial<WorkType>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/master-data`, {
      type: 'work_type',
      data: payload
    });
  }

  createFacility(payload: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/facilities`, payload);
  }

  createTeam(payload: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/master-data`, {
      type: 'team',
      data: payload
    });
  }

  createClient(payload: Partial<Client>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/clients`, payload);
  }

  createAgency(payload: Partial<Agency>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/master-data`, {
      type: 'agency',
      data: payload
    });
  }

  getLocations(): Observable<ApiResponse<LocationNode[]>> {
    return this.http.get<ApiResponse<LocationNode[]>>(`${this.apiUrl}/locations`);
  }
}

