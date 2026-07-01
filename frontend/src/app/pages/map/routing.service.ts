import { Injectable, inject } from '@angular/core';
import { GeoService } from './geo.service';
import { Client } from '../../models/client.model';
import { Agency } from '../../models/agency.model';
import { GraphNode, CalculatedRouteInfo } from './models/map.model';

@Injectable({ providedIn: 'root' })
export class RoutingService {
  private readonly geo = inject(GeoService);

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


    const edges = this.buildGraph(graphNodes);
    const route = this.runDijkstra(sourceNode.id, targetNode.id, graphNodes, edges);

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

  private buildGraph(nodes: GraphNode[]): Map<string, Array<{ to: string; dist: number }>> {
    const edges = new Map<string, Array<{ to: string; dist: number }>>();

    nodes.forEach(n1 => {
      const distances: Array<{ id: string; dist: number }> = [];
      nodes.forEach(n2 => {
        if (n1.id === n2.id) return;
        const dist = this.geo.getDistanceKm(n1.coords, n2.coords);
        distances.push({ id: n2.id, dist });
      });

      // Keep only 3 nearest neighbors to optimize the graph
      distances.sort((x, y) => x.dist - y.dist);
      const nearest = distances.slice(0, 3);
      edges.set(n1.id, nearest.map(x => ({ to: x.id, dist: x.dist })));
    });

    return edges;
  }

  private runDijkstra(
    startId: string, 
    endId: string, 
    nodes: GraphNode[], 
    edges: Map<string, Array<{ to: string; dist: number }>>
  ): { path: GraphNode[]; distance: number } | null {
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

    const path: GraphNode[] = [];
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
}
