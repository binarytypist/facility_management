import { Injectable, signal, computed } from '@angular/core';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';
import { CalculatedRouteInfo } from './models/map.model';

@Injectable({ providedIn: 'root' })
export class MapStore {
  // State
  private readonly _clients = signal<Client[]>([]);
  private readonly _agencies = signal<Agency[]>([]);

  private readonly _selectedSource = signal<number | null>(null);
  private readonly _selectedTarget = signal<number | null>(null);

  private readonly _route = signal<CalculatedRouteInfo | null>(null);

  // Readonly Signals
  readonly clients = this._clients.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  readonly selectedSource = this._selectedSource.asReadonly();
  readonly selectedTarget = this._selectedTarget.asReadonly();
  readonly route = this._route.asReadonly();

  // Computed
  readonly selectedAgency = computed(() => 
    this._agencies().find(a => a.id === this._selectedSource())
  );

  readonly selectedClient = computed(() => 
    this._clients().find(c => c.id === this._selectedTarget())
  );

  // Setters
  public setClients(clients: Client[]): void {
    this._clients.set(clients);
  }

  public setAgencies(agencies: Agency[]): void {
    this._agencies.set(agencies);
  }

  public setSelectedSource(id: number | null): void {
    this._selectedSource.set(id);
  }

  public setSelectedTarget(id: number | null): void {
    this._selectedTarget.set(id);
  }

  public setRoute(routeInfo: CalculatedRouteInfo | null): void {
    this._route.set(routeInfo);
  }
}
