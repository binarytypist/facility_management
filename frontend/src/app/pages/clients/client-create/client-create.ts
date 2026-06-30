import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CompanyType } from '../../../models/company-type.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './client-create.html'
})
export class ClientCreate implements OnInit {
  public companyTypes: WritableSignal<CompanyType[]> = signal<CompanyType[]>([]);
  
  // Company Details
  public name: string = '';
  public code: string = '';
  public company_type_id: number | null = null;
  public address: string = '';
  public phone: string = ''; // Company Phone
  public city: string = '';
  public postcode: string = '';
  public num_employees: number | null = null;
  public floor_level: string = '';
  public floor_size: string = '';
  public has_elevator: boolean = false;
  public other_info: string = '';
  public is_active: boolean = true;

  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.http.get<CompanyType[]>(`${environment.apiUrl}/company-types`).subscribe({
      next: (data: CompanyType[]) => this.companyTypes.set(data),
      error: (err: any) => console.error('Failed to load company types', err)
    });
  }

  public get isPostcodeValid(): boolean {
    if (!this.postcode) return true;
    return /^\d{5}$/.test(this.postcode);
  }

  public get isFormValid(): boolean {
    return !!(this.name.trim() && this.company_type_id && this.isPostcodeValid);
  }

  public save(): void {
    if (!this.isFormValid) {
      if (!this.isPostcodeValid) this.errorMessage.set('Postcode must be exactly 5 digits.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    this.http.post<any>(`${environment.apiUrl}/clients`, this.buildPayload()).subscribe({
      next: (res: any) => this.handleSaveSuccess(res),
      error: (err: any) => this.handleSaveError(err)
    });
  }

  private buildPayload(): any {
    return {
      name: this.name,
      code: this.code,
      company_type_id: this.company_type_id,
      address: this.address,
      phone: this.phone,
      city: this.city,
      postcode: this.postcode,
      num_employees: this.num_employees,
      floor_level: this.floor_level,
      floor_size: this.floor_size,
      has_elevator: this.has_elevator,
      other_info: this.other_info,
      is_active: this.is_active
    };
  }

  private handleSaveSuccess(res: any): void {
    this.saving.set(false);
    if (res.id) {
      this.router.navigate(['/clients/edit', res.id], { queryParams: { tab: 'employees' }});
    } else {
      this.router.navigate(['/clients/list']);
    }
  }

  private handleSaveError(err: any): void {
    console.error('Failed to create client', err);
    this.saving.set(false);
    this.errorMessage.set(err.error?.error || 'Failed to create client.');
  }
}
