import { GraphNode } from '../models/map.model';
import { GeoProvider } from '../providers/geo-provider';

/**
 * Helper class responsible for graph operations and finding the shortest path.
 * Extracted from RoutingService to maintain Single Responsibility Principle.
 */
export class ShortestPathHelper {
  constructor(private readonly geoProvider: GeoProvider) {}

  /**
   * Builds a directed graph from the given nodes.
   * Optimizes the graph by only linking each node to its 3 nearest neighbors.
   */
  public buildGraph(nodes: GraphNode[]): Map<string, Array<{ to: string; dist: number }>> {
    const edges = new Map<string, Array<{ to: string; dist: number }>>();

    nodes.forEach(n1 => {
      const distances: Array<{ id: string; dist: number }> = [];
      nodes.forEach(n2 => {
        if (n1.id === n2.id) return;
        const dist = this.geoProvider.getDistanceKm(n1.coords, n2.coords);
        distances.push({ id: n2.id, dist });
      });

      // Keep only 3 nearest neighbors to optimize the graph
      distances.sort((x, y) => x.dist - y.dist);
      const nearest = distances.slice(0, 3);
      edges.set(n1.id, nearest.map(x => ({ to: x.id, dist: x.dist })));
    });

    return edges;
  }

  /**
   * Runs a shortest-path algorithm to find the optimal route between startId and endId.
   */
  public calculateShortestPath(
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
