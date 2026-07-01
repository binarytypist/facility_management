import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MapStore } from './map.store';
import { MapApiService } from './map-api.service';
import { LeafletService } from './leaflet.service';
import { RoutingService } from './routing.service';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './map.html',
  styleUrl: './map.css',
  providers: [LeafletService]
})
export class MapComponent implements OnInit, OnDestroy {
  protected readonly store = inject(MapStore);

  private readonly api = inject(MapApiService);
  private readonly leaflet = inject(LeafletService);
  private readonly routing = inject(RoutingService);

  // Expose store state to template for easy binding
  protected readonly clients = this.store.clients;
  protected readonly agencies = this.store.agencies;
  protected readonly selectedRouteSource = this.store.selectedSource;
  protected readonly selectedRouteTarget = this.store.selectedTarget;
  protected readonly calculatedRouteInfo = this.store.route;

  public ngOnInit(): void {
    this.loadData();
  }

  public ngOnDestroy(): void {
    this.leaflet.destroyMap();
  }

  private loadData(): void {
    this.loadClients();
    this.loadAgencies();
  }

  private loadClients(): void {
    this.api.getClients().subscribe({
      next: (res: { clients: Client[] } | Client[]) => {
        const list = this.extractClients(res);
        this.store.setClients(list);
        this.syncMarkers();
      },
      error: (err: any) => {
        console.error('Failed to load clients:', err);
      }
    });
  }
  private loadAgencies(): void {
    this.api.getAgencies().subscribe({
      next: (res: Agency[]) => {
        this.store.setAgencies(res);
        this.syncMarkers();
      },
      error: (err: any) => {
        console.error('Failed to load agencies:', err);
      }
    });
  }

  private extractClients(res: { clients: Client[] } | Client[]): Client[] {
    return Array.isArray(res) ? res : (res.clients || []);
  }


  protected initMap(): void {
    this.leaflet.initMap('map-container');
    this.syncMarkers();
  }

  private syncMarkers(): void {
    // Only attempt to render if map is ready, otherwise initMap handles it later
    if (document.getElementById('map-container')) {
      this.leaflet.renderMarkers(this.clients(), this.agencies());
    }
  }

  protected onRouteSourceChange(event: any): void {
    const val = event.target.value;
    this.store.setSelectedSource(val ? Number(val) : null);
  }

  protected onRouteTargetChange(event: any): void {
    const val = event.target.value;
    this.store.setSelectedTarget(val ? Number(val) : null);
  }

  protected calculateShortestRoute(): void {
    const sourceAgency = this.store.selectedAgency();
    const targetClient = this.store.selectedClient();

    if (!sourceAgency || !targetClient) return;

    const route = this.routing.calculateRoute(
      sourceAgency,
      targetClient,
      this.agencies(),
      this.clients()
    );

    this.store.setRoute(route);
    this.leaflet.drawRoute(route);
  }

  protected clearCalculatedRoute(): void {
    this.store.setRoute(null);
    this.leaflet.clearRoute();
  }
}
