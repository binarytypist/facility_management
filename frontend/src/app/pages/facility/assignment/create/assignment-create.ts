import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-facility-assign',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, SelectModule, MultiSelectModule, ButtonModule, DecimalPipe],
  templateUrl: './assignment-create.html'
})
export class AssignmentCreate implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);
  private readonly messageService: MessageService = inject(MessageService);
  
  protected readonly events: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly agencies: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly clients: WritableSignal<any[]> = signal<any[]>([]);
  
  protected readonly travelMode: WritableSignal<string> = signal<string>('vehicle'); // 'vehicle', 'bicycle', 'walking'
  
  protected selectedAgencies: any[] = [];
  protected selectedEventsToAssign: any[] = [];

  public ngOnInit(): void {
    // Read the passed state from the router
    const navigation = this.router.getCurrentNavigation();
    const state = window.history.state;
    
    if (state && state.events && state.events.length > 0) {
      this.events.set(state.events);
      this.selectedEventsToAssign = [...state.events];
    } else {
      // If no events selected, bounce back to the list
      this.router.navigate(['/facility/list']);
      return;
    }

    this.loadAgencies();
    this.loadClients();
  }

  private loadAgencies(): void {
    this.http.get<any[]>(`${environment.apiUrl}/agencies`).subscribe({
      next: (res: any[]) => {
        const list = res
          .filter(a => a.is_active !== 0 && a.is_active !== false)
          .map(a => ({
            ...a,
            displayName: a.code ? `${a.code} - ${a.name}` : a.name
          }));
        this.agencies.set(list);
      },
      error: (err: any) => console.error('Failed to load agencies:', err)
    });
  }

  private loadClients(): void {
    this.http.get<any>(`${environment.apiUrl}/clients`).subscribe({
      next: (res: any) => {
        const list = Array.isArray(res) ? res : (res.clients || []);
        this.clients.set(list);
      },
      error: (err: any) => console.error('Failed to load clients:', err)
    });
  }

  protected getCoordinates(item: { id: number; name: string; postcode?: string | null }): [number, number] {
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

  protected getDistanceKm(coords1: [number, number], coords2: [number, number]): number {
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

  protected formatTravelTime(hours: number): string {
    const totalMinutes = Math.round(hours * 60);
    if (totalMinutes < 60) {
      return `${totalMinutes} mins`;
    }
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hrs} hr ${mins} mins` : `${hrs} hr`;
  }

  protected getDistanceToSelectedAgency(event: any): number | null {
    if (!this.selectedAgencies || this.selectedAgencies.length === 0) return null;
    const agency = this.selectedAgencies[0];
    
    // Find matching client
    const client = this.clients().find(c => c.id === event.client_id) || {
      id: event.client_id,
      name: event.client_name,
      postcode: event.client_postcode
    };
    
    const agencyCoords = this.getCoordinates(agency);
    const clientCoords = this.getCoordinates(client);
    return this.getDistanceKm(agencyCoords, clientCoords);
  }

  protected getTravelTimeToSelectedAgency(event: any): string | null {
    const dist = this.getDistanceToSelectedAgency(event);
    if (dist === null) return null;
    
    let speed = 50; // default vehicle
    const mode = this.travelMode();
    if (mode === 'walking') speed = 5;
    else if (mode === 'bicycle') speed = 15;
    
    return this.formatTravelTime(dist / speed);
  }

  protected getSummaryStats(): { count: number; totalDistance: number; totalHours: number; formattedTime: string } {
    const selected = this.selectedEventsToAssign;
    if (selected.length === 0 || !this.selectedAgencies || this.selectedAgencies.length === 0) {
      return { count: 0, totalDistance: 0, totalHours: 0, formattedTime: '0 mins' };
    }

    let totalDist = 0;
    selected.forEach(e => {
      const dist = this.getDistanceToSelectedAgency(e);
      if (dist !== null) {
        totalDist += dist;
      }
    });

    let speed = 50; // default vehicle
    const mode = this.travelMode();
    if (mode === 'walking') speed = 5;
    else if (mode === 'bicycle') speed = 15;

    const totalHours = totalDist / speed;
    return {
      count: selected.length,
      totalDistance: totalDist,
      totalHours: totalHours,
      formattedTime: this.formatTravelTime(totalHours)
    };
  }

  public save(): void {
    if (!this.selectedAgencies || this.selectedAgencies.length === 0 || this.selectedEventsToAssign.length === 0) return;
    
    const eventIds = this.selectedEventsToAssign.map(e => e.id);
    const agencyId = this.selectedAgencies[0].id;

    console.log(`Assigning ${eventIds.length} events to agency ${agencyId}`);

    this.http.post(`${environment.apiUrl}/work-events/assign`, { eventIds, agencyId }).subscribe({
      next: () => {
        console.log('Assignment successful');
        this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Work items assigned successfully!' });
        setTimeout(() => {
          this.router.navigate(['/facility/assignment/list']);
        }, 1500);
      },
      error: (err: any) => {
        console.error('Assignment failed:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to assign work items. Please try again.' });
      }
    });
  }

  public cancel(): void {
    this.router.navigate(['/facility/list']);
  }
}
