import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

interface ServiceCategory {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-agency-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
  templateUrl: './agency-create.html'
})
export class AgencyCreate implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  public readonly serviceCategories: WritableSignal<ServiceCategory[]> = signal<ServiceCategory[]>([]);

  // Company Details
  public name: string = '';
  public code: string = '';
  public service_category_id: number | null = null;
  public address: string = '';
  public phone: string = ''; // Company Phone
  public city: string = '';
  public postcode: string = '';
  public other_info: string = '';
  public is_active: boolean = true;

  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.http.get<ServiceCategory[]>(`${environment.apiUrl}/service-categories`).subscribe({
      next: (data: ServiceCategory[]) => this.serviceCategories.set(data),
      error: (err: any) => console.error('Failed to load service categories', err)
    });
  }

  public get isPostcodeValid(): boolean {
    if (!this.postcode) return true;
    return /^\d{5}$/.test(this.postcode);
  }

  public get isFormValid(): boolean {
    return !!(this.name.trim() && this.service_category_id && this.isPostcodeValid);
  }

  public save(): void {
    if (!this.isFormValid) {
      if (!this.isPostcodeValid) this.errorMessage.set('AGENCY_CREATE_ERROR_POSTCODE');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/agencies`, this.buildPayload()).subscribe({
      next: (res: any) => {
        this.saving.set(false);
        // After creating the company, redirect to the edit page to allow adding employees
        if (res.id) {
          this.router.navigate(['/agencies/edit', res.id], { queryParams: { tab: 'employees' } });
        } else {
          this.router.navigate(['/agencies/list']);
        }
      },
      error: (err: any) => {
        console.error('Failed to create agency', err);
        this.saving.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to create agency.');
      }
    });
  }

  private buildPayload(): any {
    return {
      name: this.name,
      code: this.code,
      service_category_id: this.service_category_id,
      address: this.address,
      phone: this.phone,
      city: this.city,
      postcode: this.postcode,
      other_info: this.other_info,
      is_active: this.is_active
    };
  }
}
