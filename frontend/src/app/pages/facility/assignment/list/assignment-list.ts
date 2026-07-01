import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-facility-assignments',
  standalone: true,
  imports: [CommonModule, TableModule, TranslatePipe],
  templateUrl: './assignment-list.html'
})
export class AssignmentList implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);

  protected readonly assignments: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly loading: WritableSignal<boolean> = signal<boolean>(true);

  public ngOnInit(): void {
    this.loadAssignments();
  }

  private loadAssignments(): void {
    this.loading.set(true);

    this.http
      .get<{ success: boolean; workEvents: any[] }>(
        `${environment.apiUrl}/work-events?is_assigned=1`
      )
      .subscribe({
        next: (res) => this.handleAssignmentsSuccess(res),
        error: (err) => this.handleAssignmentsError(err)
      });
  }

  private handleAssignmentsSuccess(res: { success: boolean; workEvents: any[] }): void {
    if (res.success) {
      this.assignments.set(res.workEvents);
    }
    this.loading.set(false);
  }

  private handleAssignmentsError(err: any): void {
    console.error('Failed to load assignments:', err);
    this.loading.set(false);
  }
}
