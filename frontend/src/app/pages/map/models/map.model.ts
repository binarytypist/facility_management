export interface GraphNode {
  id: string;
  name: string;
  coords: [number, number];
  type: 'agency' | 'client';
}

export interface RouteResult {
  distance: number;
  path: GraphNode[];
}

export interface CalculatedRouteInfo {
  distance: number;
  path: GraphNode[];
  pathStr: string;
}
