import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ServiceCategory } from '../../models/service-category.model';
import { WorkType } from '../../models/work-type.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-business-types',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './business-types.html',
})
export class BusinessTypes implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public readonly categories: WritableSignal<ServiceCategory[]> = signal<ServiceCategory[]>([]);
  public readonly workTypes: WritableSignal<WorkType[]> = signal<WorkType[]>([]);
  public readonly loadingCat: WritableSignal<boolean> = signal(true);
  public readonly loadingWT: WritableSignal<boolean> = signal(true);

  // Modal state
  public readonly showCatModal: WritableSignal<boolean> = signal(false);
  public readonly catModalMode: WritableSignal<'create' | 'edit'> = signal<'create' | 'edit'>('create');

  public readonly showWTModal: WritableSignal<boolean> = signal(false);
  public readonly wtModalMode: WritableSignal<'create' | 'edit'> = signal<'create' | 'edit'>('create');

  // Form state
  public currentId: number | null = null;
  public code: string = '';
  public name: string = '';
  public categoryId: number | null = null;
  public readonly saving: WritableSignal<boolean> = signal(false);
  public readonly errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.loadCategories();
    this.loadWorkTypes();
  }

  public loadCategories(): void {
    this.loadingCat.set(true);
    this.http.get<ServiceCategory[]>(`${environment.apiUrl}/service-categories`).subscribe({
      next: (data: ServiceCategory[]) => {
        this.categories.set(data);
        this.loadingCat.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load categories', err);
        this.loadingCat.set(false);
      },
    });
  }

  public loadWorkTypes(): void {
    this.loadingWT.set(true);
    this.http.get<WorkType[]>(`${environment.apiUrl}/work-types`).subscribe({
      next: (data: WorkType[]) => {
        this.workTypes.set(data);
        this.loadingWT.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load work types', err);
        this.loadingWT.set(false);
      },
    });
  }

  public openCreateCatModal(): void {
    this.catModalMode.set('create');
    this.currentId = null;
    this.code = '';
    this.name = '';
    this.errorMessage.set('');
    this.showCatModal.set(true);
  }

  public openEditCatModal(cat: ServiceCategory): void {
    this.catModalMode.set('edit');
    this.currentId = cat.id;
    this.code = cat.code;
    this.name = cat.name;
    this.errorMessage.set('');
    this.showCatModal.set(true);
  }

  public closeCatModal(): void {
    this.showCatModal.set(false);
  }

  public openCreateWTModal(): void {
    this.wtModalMode.set('create');
    this.currentId = null;
    this.code = '';
    this.name = '';
    this.categoryId = this.categories().length > 0 ? this.categories()[0].id : null;
    this.errorMessage.set('');
    this.showWTModal.set(true);
  }

  public openEditWTModal(wt: WorkType): void {
    this.wtModalMode.set('edit');
    this.currentId = wt.id;
    this.code = wt.code;
    this.name = wt.name;
    this.categoryId = wt.service_category_id;
    this.errorMessage.set('');
    this.showWTModal.set(true);
  }

  public closeWTModal(): void {
    this.showWTModal.set(false);
  }

  public get isCatFormValid(): boolean {
    return !!(this.code.trim() && this.name.trim());
  }

  public get isWTFormValid(): boolean {
    return !!(this.code.trim() && this.name.trim() && this.categoryId);
  }

  public saveCat(): void {
    if (!this.isCatFormValid) return;

    this.saving.set(true);
    const payload = { code: this.code.trim(), name: this.name.trim() };

    if (this.catModalMode() === 'create') {
      this.http.post(`${environment.apiUrl}/service-categories`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeCatModal();
          this.loadCategories();
        },
        error: (err: any) => {
          this.saving.set(false);
          const errorMsg = err.error?.details
            ? `${err.error.error}: ${err.error.details}`
            : err.error?.error || 'Failed to create category';
          this.errorMessage.set(errorMsg);
        },
      });
    } else {
      this.http
        .put(`${environment.apiUrl}/service-categories/${this.currentId}`, payload)
        .subscribe({
          next: () => {
            this.saving.set(false);
            this.closeCatModal();
            this.loadCategories();
            this.loadWorkTypes(); // reload WT to update category names
          },
          error: (err: any) => {
            this.saving.set(false);
            const errorMsg = err.error?.details
              ? `${err.error.error}: ${err.error.details}`
              : err.error?.error || 'Failed to update category';
            this.errorMessage.set(errorMsg);
          },
        });
    }
  }

  public saveWT(): void {
    if (!this.isWTFormValid) return;

    this.saving.set(true);
    const payload = {
      code: this.code.trim(),
      name: this.name.trim(),
      service_category_id: this.categoryId,
    };

    if (this.wtModalMode() === 'create') {
      this.http.post(`${environment.apiUrl}/work-types`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeWTModal();
          this.loadWorkTypes();
        },
        error: (err: any) => {
          this.saving.set(false);
          const errorMsg = err.error?.details
            ? `${err.error.error}: ${err.error.details}`
            : err.error?.error || 'Failed to create work type';
          this.errorMessage.set(errorMsg);
        },
      });
    } else {
      this.http.put(`${environment.apiUrl}/work-types/${this.currentId}`, payload).subscribe({
        next: () => {
          this.saving.set(false);
          this.closeWTModal();
          this.loadWorkTypes();
        },
        error: (err: any) => {
          this.saving.set(false);
          const errorMsg = err.error?.details
            ? `${err.error.error}: ${err.error.details}`
            : err.error?.error || 'Failed to update work type';
          this.errorMessage.set(errorMsg);
        },
      });
    }
  }

  public deleteCat(id: number, name: string): void {
    if (
      confirm(
        `Are you sure you want to delete category "${name}"? This will delete all associated work types.`,
      )
    ) {
      this.http.delete(`${environment.apiUrl}/service-categories/${id}`).subscribe({
        next: () => {
          this.loadCategories();
          this.loadWorkTypes();
        },
        error: (err: any) => {
          alert(err.error?.error || 'Failed to delete category');
        },
      });
    }
  }

  public deleteWT(id: number, name: string): void {
    if (confirm(`Are you sure you want to delete work type "${name}"?`)) {
      this.http.delete(`${environment.apiUrl}/work-types/${id}`).subscribe({
        next: () => {
          this.loadWorkTypes();
        },
        error: (err: any) => {
          alert(err.error?.error || 'Failed to delete work type');
        },
      });
    }
  }

  public goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
