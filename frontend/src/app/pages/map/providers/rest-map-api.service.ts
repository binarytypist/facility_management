import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Client } from '../../../models/client.model';
import { Agency } from '../../../models/agency.model';
import { MapApiProvider } from './map-api-provider';

/**
 * A concrete implementation of MapApiProvider that uses Angular's HttpClient
 * to fetch data from a REST API.
 */
@Injectable()
export class RestMapApiService implements MapApiProvider {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  public getClients(): Observable<{ clients: Client[] } | Client[]> {
    return this.http.get<{ clients: Client[] } | Client[]>(`${this.apiUrl}/clients`);
  }

  public getAgencies(): Observable<Agency[]> {
    return this.http.get<Agency[]>(`${this.apiUrl}/agencies`);
  }
}
