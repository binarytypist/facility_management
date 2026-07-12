export abstract class GeoProvider {
  /**
   * Calculates or retrieves the coordinates for a given item.
   */
  abstract getCoordinates(item: { id: number; name?: string; postcode?: string | null }): [number, number];

  /**
   * Calculates the distance between two coordinates in kilometers.
   */
  abstract getDistanceKm(coords1: [number, number], coords2: [number, number]): number;
}
