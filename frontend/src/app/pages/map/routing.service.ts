import { Injectable, inject } from '@angular/core';
import { GeoProvider } from './providers/geo-provider';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';
import { GraphNode, CalculatedRouteInfo } from './models/map.model';
import { ShortestPathHelper } from './helpers/shortest-path.helper';

@Injectable({ providedIn: 'root' })
export class RoutingService {
  // Inject the abstract provider rather than concrete class
  private readonly geo = inject(GeoProvider);
  private readonly pathHelper = new ShortestPathHelper(this.geo);

  public calculateRoute(
    sourceAgency: Agency, 
    targetClient: Client, 
    agencies: Agency[], 
    clients: Client[]
  ): CalculatedRouteInfo {
    const graphNodes: GraphNode[] = [];
    
    const sourceNode: GraphNode = {
      id: `agency-${sourceAgency.id}`,
      name: sourceAgency.name,
      coords: this.geo.getCoordinates(sourceAgency),
      type: 'agency'
    };
    
    const targetNode: GraphNode = {
      id: `client-${targetClient.id}`,
      name: targetClient.name,
      coords: this.geo.getCoordinates(targetClient),
      type: 'client'
    };

    graphNodes.push(sourceNode);
    graphNodes.push(targetNode);

    agencies.forEach(a => {
      if (a.id !== sourceAgency.id) {
        graphNodes.push({ id: `agency-${a.id}`, name: a.name, coords: this.geo.getCoordinates(a), type: 'agency' });
      }
    });

    clients.forEach(c => {
      if (c.id !== targetClient.id) {
        graphNodes.push({ id: `client-${c.id}`, name: c.name, coords: this.geo.getCoordinates(c), type: 'client' });
      }
    });

    const edges = this.pathHelper.buildGraph(graphNodes);
    const route = this.pathHelper.calculateShortestPath(sourceNode.id, targetNode.id, graphNodes, edges);

    if (route) {
      return {
        distance: route.distance,
        path: route.path,
        pathStr: route.path.map(n => n.name).join(' → ')
      };
    } else {
      const directDist = this.geo.getDistanceKm(sourceNode.coords, targetNode.coords);
      return {
        distance: directDist,
        path: [sourceNode, targetNode],
        pathStr: `${sourceNode.name} → (Direct) → ${targetNode.name}`
      };
    }
  }
}
