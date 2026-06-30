import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-facility-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    IconField,
    InputIcon,
    InputText,
    ButtonModule,
    DatePicker,
    MultiSelectModule,
    TranslatePipe,
  ],
  templateUrl: './facility-list.html',
})
export class FacilityList implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);
  private readonly apiUrl: string = environment.apiUrl;

  protected readonly workEvents: WritableSignal<any[]> = signal<any[]>([]);
  protected selectedEvents: any[] = [];

  protected filterStartDate: Date | null = null;
  protected filterEndDate: Date | null = null;
  protected readonly clients: WritableSignal<any[]> = signal<any[]>([]);
  protected filterSelectedClients: any[] = [];

  public ngOnInit(): void {
    this.loadClients();
    this.loadWorkEvents();
  }

  private loadClients(): void {
    this.http.get<any>(`${this.apiUrl}/clients`).subscribe({
      next: (res: any) => {
        let list = Array.isArray(res) ? res : res.clients || [];
        list = list.map((c: any) => ({
          ...c,
          displayName: c.code ? `${c.code} - ${c.name}` : c.name,
        }));
        this.clients.set(list);
      },
      error: (err: any) => console.error('Failed to load clients:', err),
    });
  }

  protected get filteredEvents(): any[] {
    let events = this.workEvents();
    if (this.filterStartDate) {
      const start = new Date(this.filterStartDate);
      start.setHours(0, 0, 0, 0);
      events = events.filter((e) => {
        if (!e.start_date) return false;
        const eDate = new Date(e.start_date);
        return eDate >= start;
      });
    }
    if (this.filterEndDate) {
      const end = new Date(this.filterEndDate);
      end.setHours(23, 59, 59, 999);
      events = events.filter((e) => {
        const targetDate = e.end_date ? new Date(e.end_date) : new Date(e.start_date);
        return targetDate <= end;
      });
    }
    if (this.filterSelectedClients && this.filterSelectedClients.length > 0) {
      // Find events where the client_name matches one of the selected clients' name
      events = events.filter((e) =>
        this.filterSelectedClients.some(
          (c) => c.name === e.client_name || c.code === e.client_code,
        ),
      );
    }
    return events;
  }

  protected loadWorkEvents(): void {
    this.http.get<any>(`${this.apiUrl}/work-events`).subscribe({
      next: (res: any) => {
        if (res.success) {
          // Exclude assigned events from the main list (is_assigned = 1)
          const unassignedEvents = res.workEvents.filter((e: any) => e.is_assigned !== 1);
          this.workEvents.set(unassignedEvents);
        }
      },
      error: (err: any) => console.error('Failed to load work events:', err),
    });
  }

  public assignEvent(events: any[]): void {
    this.router.navigate(['/facility/assignment/create'], { state: { events } });
  }

  public viewEventDetails(id: number): void {
    this.router.navigate(['/facility/events', id]);
  }
}
