import { Injectable, inject } from '@angular/core';
import * as L from 'leaflet';
import { GeoService } from './geo.service';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';
import { RouteResult, CalculatedRouteInfo } from './models/map.model';

@Injectable() // Scoped to component, not 'root'
export class LeafletService {
  private map: L.Map | null = null;
  private clientMarkers: L.Marker[] = [];
  private agencyMarkers: L.Marker[] = [];
  private routePolyline: L.Polyline | null = null;

  private readonly geo = inject(GeoService);

  public initMap(containerId: string): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const container = document.getElementById(containerId);
    if (!container) return;

    this.map = L.map(containerId).setView([52.5200, 13.4050], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
  }

  public renderMarkers(clients: Client[], agencies: Agency[]): void {
    if (!this.map) return;

    this.clientMarkers.forEach(m => m.remove());
    this.agencyMarkers.forEach(m => m.remove());
    this.clientMarkers = [];
    this.agencyMarkers = [];

    // Render Clients
    clients.forEach(client => {
      const coords = this.geo.getCoordinates(client);
      const icon = L.divIcon({
        className: 'custom-client-icon',
        html: `<div class="w-6 h-6 bg-blue-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-blue-500/40">C</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(coords, { icon })
        .bindPopup(`<strong>Client: ${client.name}</strong><br>${client.address || 'No address'}<br>City: ${client.city || 'No city'}`)
        .addTo(this.map!);
      this.clientMarkers.push(marker);
    });

    // Render Agencies
    agencies.forEach(agency => {
      const coords = this.geo.getCoordinates(agency);
      const icon = L.divIcon({
        className: 'custom-agency-icon',
        html: `<div class="w-6 h-6 bg-indigo-600 border-2 border-white rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-lg shadow-indigo-500/40">A</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker(coords, { icon })
        .bindPopup(`<strong>Agency: ${agency.name}</strong><br>${agency.address || 'No address'}<br>City: ${agency.city || 'No city'}`)
        .addTo(this.map!);
      this.agencyMarkers.push(marker);
    });
  }

  public drawRoute(route: CalculatedRouteInfo): void {
    if (!this.map) return;

    if (this.routePolyline) {
      this.routePolyline.remove();
    }

    const latlngs = route.path.map(n => n.coords);
    
    // Direct or complex route styling
    const color = route.path.length === 2 ? '#f59e0b' : '#10b981';
    const dashArray = route.path.length === 2 ? undefined : '8, 8';

    this.routePolyline = L.polyline(latlngs, {
      color: color,
      weight: 4,
      opacity: 0.85,
      dashArray: dashArray,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.map);

    const bounds = L.latLngBounds(latlngs);
    this.map.fitBounds(bounds, { padding: [50, 50] });
  }

  public clearRoute(): void {
    if (this.routePolyline) {
      this.routePolyline.remove();
      this.routePolyline = null;
    }
    if (this.map) {
      this.map.setView([52.5200, 13.4050], 12);
    }
  }

  public destroyMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }
}
