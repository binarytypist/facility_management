import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { WorkEvent, KpiStats } from '../models/work-event.model';

@Injectable({
  providedIn: 'root'
})
export class WorkEventService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public getWorkEvents(): Observable<ApiResponse<WorkEvent[]>> {
    return this.http.get<ApiResponse<WorkEvent[]>>(`${this.apiUrl}/work-events`);
  }

  public getKpiStats(): Observable<ApiResponse<KpiStats>> {
    return this.http.get<ApiResponse<KpiStats>>(`${this.apiUrl}/dashboard/stats`);
  }

  public createWorkEvent(payload: Partial<WorkEvent>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/work-events`, payload);
  }

  public getEventDetails(id: string): Observable<ApiResponse<WorkEvent>> {
    return this.http.get<ApiResponse<WorkEvent>>(`${this.apiUrl}/work-events/${id}`);
  }

  public scheduleEvent(payload: { eventId: string; date: string | Date;[key: string]: unknown }): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/work-events/schedule`, payload);
  }

  public completeEvent(id: string, payload: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/work-events/${id}/complete`, payload);
  }

  public closeEvent(id: string, payload: Record<string, unknown>): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/work-events/${id}/close`, payload);
  }
}

