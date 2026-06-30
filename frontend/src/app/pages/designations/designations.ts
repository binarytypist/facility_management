import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Designation } from '../../models/designation.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-designations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './designations.html',
})
export class Designations implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public readonly designations: WritableSignal<Designation[]> = signal<Designation[]>([]);
  public readonly loading: WritableSignal<boolean> = signal(true);

  // Modal state
  public readonly showModal: WritableSignal<boolean> = signal(false);
  public readonly modalMode: WritableSignal<'create' | 'edit'> = signal<'create' | 'edit'>('create');

  // Form state
  public currentId: number | null = null;
  public code: string = '';
  public name: string = '';
  public readonly saving: WritableSignal<boolean> = signal(false);
  public readonly errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.loadDesignations();
  }

  public loadDesignations(): void {
    this.loading.set(true);
    this.http.get<Designation[]>(`${environment.apiUrl}/designations`).subscribe({
      next: (data: Designation[]) => {
        this.designations.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load designations', err);
        this.loading.set(false);
      },
    });
  }

  public openCreateModal(): void {
    this.modalMode.set('create');
    this.currentId = null;
    this.code = '';
    this.name = '';
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  public openEditModal(designation: Designation): void {
    this.modalMode.set('edit');
    this.currentId = designation.id;
    this.code = designation.code;
    this.name = designation.name;
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public get isFormValid(): boolean {
    return !!(this.code.trim() && this.name.trim());
  }

  public save(): void {
    if (!this.isFormValid) return;

    this.saving.set(true);
    const payload = { code: this.code.trim(), name: this.name.trim() };

    if (this.modalMode() === 'create') {
      this.http.post(`${environment.apiUrl}/designations`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadDesignations();
        },
        error: (err: any) => {
          this.saving.set(false);
          const errorMsg = err.error?.details
            ? `${err.error.error}: ${err.error.details}`
            : err.error?.error || 'Failed to create designation';
          this.errorMessage.set(errorMsg);
        },
      });
    } else {
      this.http.put(`${environment.apiUrl}/designations/${this.currentId}`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeModal();
          this.loadDesignations();
        },
        error: (err: any) => {
          this.saving.set(false);
          const errorMsg = err.error?.details
            ? `${err.error.error}: ${err.error.details}`
            : err.error?.error || 'Failed to update designation';
          this.errorMessage.set(errorMsg);
        },
      });
    }
  }

  public deleteDesignation(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete designation "${name}"?`)) {
      this.http.delete(`${environment.apiUrl}/designations/${id}`).subscribe({
        next: () => {
          this.loadDesignations();
        },
        error: (err: any) => {
          alert(err.error?.error || 'Failed to delete designation');
        },
      });
    }
  }

  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  public goToUsers(): void {
    this.router.navigate(['/users/list']);
  }
}
