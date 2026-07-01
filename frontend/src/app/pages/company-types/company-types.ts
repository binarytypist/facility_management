import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CompanyType } from '../../models/company-type.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-company-types',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './company-types.html',
})
export class CompanyTypes implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public readonly companyTypes: WritableSignal<CompanyType[]> = signal<CompanyType[]>([]);
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
    this.loadCompanyTypes();
  }

  public loadCompanyTypes(): void {
    this.loading.set(true);
    this.http.get<CompanyType[]>(`${environment.apiUrl}/company-types`).subscribe({
      next: (data: CompanyType[]) => {
        this.companyTypes.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load company types', err);
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

  public openEditModal(item: CompanyType): void {
    this.modalMode.set('edit');
    this.currentId = item.id;
    this.code = item.code;
    this.name = item.name;
    this.errorMessage.set('');
    this.showModal.set(true);
  }

  public closeModal(): void {
    this.showModal.set(false);
  }

  public get isFormValid(): boolean {
    return !!(this.code.trim() && this.name.trim());
  }

  private buildPayload(): { code: string; name: string } {
    return {
      code: this.code.trim(),
      name: this.name.trim()
    };
  }

  private updateCompanyType(payload: any): void {
    this.http.put(`${environment.apiUrl}/company-types/${this.currentId}`, payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err, 'update')
    });
  }


  private handleSuccess(): void {
    this.saving.set(false);
    this.closeModal();
    this.loadCompanyTypes();
  }

  public save(): void {
    if (!this.isFormValid) return;

    this.saving.set(true);

    const payload = this.buildPayload();

    if (this.isCreateMode()) {
      this.createCompanyType(payload);
    } else {
      this.updateCompanyType(payload);
    }
  }

  private createCompanyType(payload: any): void {
    this.http.post(`${environment.apiUrl}/company-types`, payload).subscribe({
      next: () => this.handleSuccess(),
      error: (err) => this.handleError(err, 'create')
    });
  }

  private isCreateMode(): boolean {
    return this.modalMode() === 'create';
  }

  private handleError(err: any, mode: 'create' | 'update'): void {
    this.saving.set(false);

    const errorMsg = err.error?.details
      ? `${err.error.error}: ${err.error.details}`
      : err.error?.error || `Failed to ${mode} company type`;

    this.errorMessage.set(errorMsg);
  }

  public deleteCompanyType(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete company type "${name}"?`)) {
      this.http.delete(`${environment.apiUrl}/company-types/${id}`).subscribe({
        next: () => {
          this.loadCompanyTypes();
        },
        error: (err: any) => {
          alert(err.error?.error || 'Failed to delete company type');
        },
      });
    }
  }

  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
