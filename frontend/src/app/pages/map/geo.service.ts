import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GeoService {
  public getCoordinates(item: { id: number; name?: string; postcode?: string | null }): [number, number] {
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

  public getDistanceKm(coords1: [number, number], coords2: [number, number]): number {
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
}
