import { Component, OnInit, inject, signal, WritableSignal, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-work-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, MultiSelectModule, TranslatePipe],
  templateUrl: './work-item-list.html'
})
export class WorkItemListComponent implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);
  
  protected readonly assignments: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly agencies: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly loading: WritableSignal<boolean> = signal<boolean>(true);
  
  protected readonly selectedAgencyIds = signal<number[]>([]);

  // Filter assignments based on selected agency
  protected filteredAssignments: Signal<any[]> = computed(() => {
    const allAssignments = this.assignments();
    const selectedIds = this.selectedAgencyIds();
    
    if (!selectedIds || selectedIds.length === 0) {
      return allAssignments;
    }
    
    return allAssignments.filter(assignment => {
      if (!assignment.assigned_agency_id) return false;
      const agencyId = typeof assignment.assigned_agency_id === 'string'
        ? parseInt(assignment.assigned_agency_id, 10)
        : assignment.assigned_agency_id;
      return selectedIds.includes(agencyId);
    });
  });

  protected selectedAgencyIdsList: number[] = [];

  protected onAgencyChange(ids: number[]): void {
    this.selectedAgencyIds.set(ids || []);
  }

  public ngOnInit(): void {
    this.loadAgencies();
    this.loadAssignments();
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

  private loadAssignments(): void {
    this.loading.set(true);
    this.http.get<{success: boolean, workEvents: any[]}>(`${environment.apiUrl}/work-events?is_assigned=1`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.assignments.set(res.workEvents);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load assignments:', err);
        this.loading.set(false);
      }
    });
  }

  protected editAssignment(id: number): void {
    this.router.navigate([`/work/item/edit/${id}`]);
  }
}
