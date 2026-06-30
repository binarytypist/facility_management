import { Component, OnInit, OnDestroy, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './map.html',
  styleUrl: './map.css',
})
export class MapComponent implements OnInit, OnDestroy {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = environment.apiUrl;

  protected readonly clients: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly agencies: WritableSignal<any[]> = signal<any[]>([]);

  // Leaflet Map state
  private map: L.Map | null = null;
  private clientMarkers: L.Marker[] = [];
  private agencyMarkers: L.Marker[] = [];
  private transitMarkers: L.Marker[] = [];
  private routePolyline: L.Polyline | null = null;

  // Selected Route state
  protected readonly selectedRouteSource: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly selectedRouteTarget: WritableSignal<number | null> = signal<number | null>(null);
  protected readonly calculatedRouteInfo: WritableSignal<any | null> = signal<any | null>(null);

  public ngOnInit(): void {
    this.loadData();
  }

  public ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
  }

  private loadData(): void {
    this.http.get<any>(`${this.apiUrl}/clients`).subscribe({
      next: (res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res.clients || []);
        this.clients.set(list);
        this.renderMarkers();
      },
      error: (err: any) => console.error('Failed to load clients:', err)
    });

    this.http.get<any[]>(`${this.apiUrl}/agencies`).subscribe({
      next: (res: any[]) => {
        this.agencies.set(res);
        this.renderMarkers();
      },
      error: (err: any) => console.error('Failed to load agencies:', err)
    });
  }

  protected initMap(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }

    const container = document.getElementById('map-container');
    if (!container) return;

    this.map = L.map('map-container').setView([52.5200, 13.4050], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    this.renderMarkers();
  }

  private renderMarkers(): void {
    if (!this.map) {
      // Map element might not be in DOM yet, initialize it
      this.initMap();
      return;
    }

    this.clientMarkers.forEach(m => m.remove());
    this.agencyMarkers.forEach(m => m.remove());
    this.transitMarkers.forEach(m => m.remove());
    this.clientMarkers = [];
    this.agencyMarkers = [];
    this.transitMarkers = [];

    // Render Clients
    this.clients().forEach(client => {
      const coords = this.getCoordinates(client);
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
    this.agencies().forEach(agency => {
      const coords = this.getCoordinates(agency);
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

    // Render Transit Routing Nodes
    this.getTransitNodes().forEach(node => {
      const icon = L.divIcon({
        className: 'custom-transit-icon',
        html: `<div class="w-3.5 h-3.5 bg-slate-700 border border-slate-500 rounded-full opacity-70 flex items-center justify-center text-[7px] text-slate-300 font-bold">T</div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7]
      });

      const marker = L.marker(node.coords, { icon })
        .bindPopup(`<strong>Transit Interchange: ${node.name}</strong>`)
        .addTo(this.map!);
      this.transitMarkers.push(marker);
    });
  }

  private getCoordinates(item: { id: number; name: string; postcode?: string | null }): [number, number] {
    if (item.postcode === '13595') {
      return [52.5050 + (item.id % 7) * 0.003, 13.2030 + (item.id % 5) * 0.004];
    }
    if (item.postcode === '90210') {
      return [52.5186, 13.3761];
    }
    const nameStr = item.name || '';
    const hash = nameStr.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) + item.id;
    const latOffset = ((hash % 80) - 40) * 0.0018;
    const lngOffset = (((hash * 17) % 80) - 40) * 0.0018;
    return [52.5200 + latOffset, 13.4050 + lngOffset];
  }

  private getTransitNodes(): any[] {
    return [
      { id: 'transit-T1', name: 'Alexanderplatz', coords: [52.5219, 13.4132] as [number, number], type: 'transit' },
      { id: 'transit-T2', name: 'Hauptbahnhof', coords: [52.5250, 13.3694] as [number, number], type: 'transit' },
      { id: 'transit-T3', name: 'Brandenburger Tor', coords: [52.5162, 13.3777] as [number, number], type: 'transit' },
      { id: 'transit-T4', name: 'Potsdamer Platz', coords: [52.5096, 13.3759] as [number, number], type: 'transit' },
      { id: 'transit-T5', name: 'Südkreuz', coords: [52.4750, 13.3653] as [number, number], type: 'transit' },
      { id: 'transit-T6', name: 'Charlottenburg', coords: [52.5044, 13.3038] as [number, number], type: 'transit' },
      { id: 'transit-T7', name: 'Spandau', coords: [52.5350, 13.2000] as [number, number], type: 'transit' },
      { id: 'transit-T8', name: 'Ostkreuz', coords: [52.5030, 13.4690] as [number, number], type: 'transit' }
    ];
  }

  private getDistanceKm(coords1: [number, number], coords2: [number, number]): number {
    const R = 6371;
    const dLat = (coords2[0] - coords1[0]) * Math.PI / 180;
    const dLng = (coords2[1] - coords1[1]) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(coords1[0] * Math.PI / 180) * Math.cos(coords2[0] * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  protected onRouteSourceChange(event: any): void {
    const val = event.target.value;
    this.selectedRouteSource.set(val ? Number(val) : null);
  }

  protected onRouteTargetChange(event: any): void {
    const val = event.target.value;
    this.selectedRouteTarget.set(val ? Number(val) : null);
  }

  protected calculateShortestRoute(): void {
    const sourceId = this.selectedRouteSource();
    const targetId = this.selectedRouteTarget();
    if (!sourceId || !targetId) return;

    const sourceAgency = this.agencies().find(a => a.id === sourceId);
    const targetClient = this.clients().find(c => c.id === targetId);
    if (!sourceAgency || !targetClient) return;

    const graphNodes: any[] = [];
    const sourceNode = {
      id: `agency-${sourceAgency.id}`,
      name: sourceAgency.name,
      coords: this.getCoordinates(sourceAgency),
      type: 'agency'
    };
    const targetNode = {
      id: `client-${targetClient.id}`,
      name: targetClient.name,
      coords: this.getCoordinates(targetClient),
      type: 'client'
    };

    graphNodes.push(sourceNode);
    graphNodes.push(targetNode);

    this.agencies().forEach(a => {
      if (a.id !== sourceId) {
        graphNodes.push({ id: `agency-${a.id}`, name: a.name, coords: this.getCoordinates(a), type: 'agency' });
      }
    });
    this.clients().forEach(c => {
      if (c.id !== targetId) {
        graphNodes.push({ id: `client-${c.id}`, name: c.name, coords: this.getCoordinates(c), type: 'client' });
      }
    });

    const transitNodes = this.getTransitNodes();
    graphNodes.push(...transitNodes);

    const edges: Map<string, Array<{ to: string; dist: number }>> = new Map<string, Array<{ to: string; dist: number }>>();

    graphNodes.forEach(n1 => {
      const distances: Array<{ id: string; dist: number }> = [];
      graphNodes.forEach(n2 => {
        if (n1.id === n2.id) return;
        const dist = this.getDistanceKm(n1.coords, n2.coords);
        distances.push({ id: n2.id, dist });
      });

      distances.sort((x, y) => x.dist - y.dist);
      const nearest = distances.slice(0, 3);
      edges.set(n1.id, nearest.map(x => ({ to: x.id, dist: x.dist })));
    });

    const route = this.runDijkstra(sourceNode.id, targetNode.id, graphNodes, edges);

    if (route) {
      this.calculatedRouteInfo.set({
        distance: route.distance,
        path: route.path,
        pathStr: route.path.map(n => n.name).join(' → ')
      });

      if (this.map) {
        if (this.routePolyline) {
          this.routePolyline.remove();
        }

        const latlngs = route.path.map(n => n.coords);
        this.routePolyline = L.polyline(latlngs, {
          color: '#10b981',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round',
          lineJoin: 'round'
        }).addTo(this.map);

        const bounds = L.latLngBounds(latlngs);
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    } else {
      const directDist = this.getDistanceKm(sourceNode.coords, targetNode.coords);
      this.calculatedRouteInfo.set({
        distance: directDist,
        path: [sourceNode, targetNode],
        pathStr: `${sourceNode.name} → (Direct) → ${targetNode.name}`
      });

      if (this.map) {
        if (this.routePolyline) {
          this.routePolyline.remove();
        }
        const latlngs = [sourceNode.coords, targetNode.coords];
        this.routePolyline = L.polyline(latlngs, {
          color: '#f59e0b',
          weight: 4,
          opacity: 0.85
        }).addTo(this.map);
        
        const bounds = L.latLngBounds(latlngs);
        this.map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }

  private runDijkstra(startId: string, endId: string, nodes: any[], edges: Map<string, Array<{ to: string; dist: number }>>): { path: any[]; distance: number } | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    nodes.forEach(n => {
      distances.set(n.id, Infinity);
      previous.set(n.id, null);
      unvisited.add(n.id);
    });

    distances.set(startId, 0);

    while (unvisited.size > 0) {
      let currentId: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(id => {
        const dist = distances.get(id)!;
        if (dist < minDistance) {
          minDistance = dist;
          currentId = id;
        }
      });

      if (currentId === null || minDistance === Infinity) {
        break;
      }

      if (currentId === endId) {
        break;
      }

      unvisited.delete(currentId);

      const activeId = currentId;
      const neighbors = edges.get(activeId) || [];
      neighbors.forEach(neighbor => {
        if (!unvisited.has(neighbor.to)) return;

        const alt = distances.get(activeId)! + neighbor.dist;
        if (alt < distances.get(neighbor.to)!) {
          distances.set(neighbor.to, alt);
          previous.set(neighbor.to, activeId);
        }
      });
    }

    if (distances.get(endId) === Infinity) {
      return null;
    }

    const path: any[] = [];
    let curr: string | null = endId;
    while (curr !== null) {
      const node = nodes.find(n => n.id === curr);
      if (node) {
        path.unshift(node);
      }
      curr = previous.get(curr) || null;
    }

    return {
      path,
      distance: distances.get(endId)!
    };
  }

  protected clearCalculatedRoute(): void {
    this.calculatedRouteInfo.set(null);
    if (this.routePolyline) {
      this.routePolyline.remove();
      this.routePolyline = null;
    }
    if (this.map) {
      this.map.setView([52.5200, 13.4050], 12);
    }
  }
}
