import { Injectable, signal, computed } from '@angular/core';
import { ServiceCategory } from '../../models/service-category.model';
import { WorkType } from '../../models/work-type.model';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';
import { LocationNode } from '../../models/location.model';

@Injectable({
  providedIn: 'root'
})
export class MasterDataStore {
  private readonly _categories = signal<ServiceCategory[]>([]);
  private readonly _workTypes = signal<WorkType[]>([]);
  private readonly _teams = signal<unknown[]>([]); // Assuming Team model doesn't exist yet
  private readonly _facilities = signal<unknown[]>([]);
  private readonly _clients = signal<Client[]>([]);
  private readonly _agencies = signal<Agency[]>([]);
  private readonly _locations = signal<LocationNode[]>([]);
  private readonly _locationTree = signal<LocationNode[]>([]);

  // Public readonly signals
  readonly categories = this._categories.asReadonly();
  readonly workTypes = this._workTypes.asReadonly();
  readonly teams = this._teams.asReadonly();
  readonly facilities = this._facilities.asReadonly();
  readonly clients = this._clients.asReadonly();
  readonly agencies = this._agencies.asReadonly();
  readonly locations = this._locations.asReadonly();
  readonly locationTree = this._locationTree.asReadonly();

  // Setters
  setCategories(data: ServiceCategory[]) {
    this._categories.set(data);
  }

  setWorkTypes(data: WorkType[]) {
    this._workTypes.set(data);
  }

  setTeams(data: unknown[]) {
    this._teams.set(data);
  }

  setFacilities(data: unknown[]) {
    this._facilities.set(data);
  }

  setClients(data: Client[]) {
    this._clients.set(data);
  }

  setAgencies(data: Agency[]) {
    this._agencies.set(data);
  }

  setLocations(data: LocationNode[]) {
    this._locations.set(data);
  }

  setLocationTree(data: LocationNode[]) {
    this._locationTree.set(data);
  }
}
