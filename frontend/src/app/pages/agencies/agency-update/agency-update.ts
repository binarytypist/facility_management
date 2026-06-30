import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

interface ServiceCategory {
  id: number;
  code: string;
  name: string;
}

interface AgencyEmployee {
  id: number;
  agency_id: number;
  first_name: string;
  last_name: string;
  mobile_number: string;
  other_phone: string;
  designation: string;
  email: string;
  preferred_call_time: string;
  has_private_phone: boolean;
  private_phone: string;
  private_call_time: string;
}

interface Designation {
  id: number;
  code: string;
  name: string;
}

@Component({
  selector: 'app-agency-update',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CheckboxModule, TranslatePipe],
  templateUrl: './agency-update.html'
})
export class AgencyUpdate implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  public serviceCategories: WritableSignal<ServiceCategory[]> = signal<ServiceCategory[]>([]);
  public designations: WritableSignal<Designation[]> = signal<Designation[]>([]);
  public agencyId: number | null = null;
  public loading: WritableSignal<boolean> = signal(true);
  
  public activeTab: WritableSignal<'company' | 'employees'> = signal<'company' | 'employees'>('company');

  // Company Details
  public name: string = '';
  public code: string = '';
  public service_category_id: number | null = null;
  public address: string = '';
  public phone: string = ''; 
  public city: string = '';
  public postcode: string = '';
  public other_info: string = '';
  public is_active: boolean = true;

  // Employees State
  public employees: WritableSignal<AgencyEmployee[]> = signal<AgencyEmployee[]>([]);
  public loadingEmployees: WritableSignal<boolean> = signal(false);
  
  // Employee Modal State
  public showEmployeeModal: WritableSignal<boolean> = signal(false);
  public employeeModalMode: WritableSignal<'create' | 'edit'> = signal<'create' | 'edit'>('create');
  public currentEmployeeId: number | null = null;
  public empFirstName: string = '';
  public empLastName: string = '';
  public empMobile: string = '';
  public empOtherPhone: string = '';
  public empDesignation: string = '';
  public empEmail: string = '';
  public empCallTime: string = '';
  public empHasPrivatePhone: boolean = false;
  public empPrivatePhone: string = '';
  public empPrivateCallTime: string = '';
  public savingEmployee: WritableSignal<boolean> = signal(false);
  public empErrorMessage: WritableSignal<string> = signal('');

  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.http.get<ServiceCategory[]>(`${environment.apiUrl}/service-categories`).subscribe({
      next: (data) => this.serviceCategories.set(data),
      error: (err) => console.error('Failed to load service categories', err)
    });

    this.http.get<Designation[]>(`${environment.apiUrl}/designations`).subscribe({
      next: (data) => this.designations.set(data),
      error: (err) => console.error('Failed to load designations', err)
    });

    this.route.queryParamMap.subscribe(params => {
      if (params.get('tab') === 'employees') {
        this.activeTab.set('employees');
      }
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.agencyId = parseInt(id, 10);
        this.loadAgencyData();
        this.loadEmployees();
      }
    });
  }

  public setTab(tab: 'company' | 'employees'): void {
    this.activeTab.set(tab);
    if (tab === 'employees' && this.employees().length === 0) {
      this.loadEmployees();
    }
  }

  public loadAgencyData(): void {
    this.http.get<any>(`${environment.apiUrl}/agencies/${this.agencyId}`).subscribe({
      next: (agency) => {
        this.name = agency.name || '';
        this.code = agency.code || '';
        this.service_category_id = agency.service_category_id || null;
        this.address = agency.address || '';
        this.phone = agency.phone || '';
        this.city = agency.city || '';
        this.postcode = agency.postcode || '';
        this.other_info = agency.other_info || '';
        this.is_active = agency.is_active === 1 || agency.is_active === true || agency.is_active === undefined;
        
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load agency', err);
        this.loading.set(false);
      }
    });
  }

  public loadEmployees(): void {
    if (!this.agencyId) return;
    this.loadingEmployees.set(true);
    this.http.get<AgencyEmployee[]>(`${environment.apiUrl}/agencies/${this.agencyId}/employees`).subscribe({
      next: (data) => {
        this.employees.set(data);
        this.loadingEmployees.set(false);
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.loadingEmployees.set(false);
      }
    });
  }

  get isPostcodeValid(): boolean {
    if (!this.postcode) return true;
    return /^\d{5}$/.test(this.postcode);
  }

  get isFormValid(): boolean {
    return !!(this.name.trim() && this.service_category_id && this.isPostcodeValid);
  }

  public saveCompany(): void {
    if (!this.isFormValid || !this.agencyId) {
      if (!this.isPostcodeValid) this.errorMessage.set('AGENCY_CREATE_ERROR_POSTCODE');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');

    const payload = {
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

    this.http.put(`${environment.apiUrl}/agencies/${this.agencyId}`, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/agencies/list']);
      },
      error: (err) => {
        console.error('Failed to update agency', err);
        this.saving.set(false);
        this.errorMessage.set(err.error?.error || 'Failed to update agency.');
      }
    });
  }

  public deleteAgency(): void {
    if (!this.agencyId) return;
    if (confirm(`Are you sure you want to delete ${this.name}? This will also delete all associated employees.`)) {
      this.http.delete(`${environment.apiUrl}/agencies/${this.agencyId}`).subscribe({
        next: () => {
          this.router.navigate(['/agencies/list']);
        },
        error: (err) => {
          alert('Failed to delete agency');
        }
      });
    }
  }

  // Employee Management Methods
  public openEmployeeModal(): void {
    this.employeeModalMode.set('create');
    this.currentEmployeeId = null;
    this.empFirstName = '';
    this.empLastName = '';
    this.empMobile = '';
    this.empOtherPhone = '';
    this.empDesignation = '';
    this.empEmail = '';
    this.empCallTime = '';
    this.empHasPrivatePhone = false;
    this.empPrivatePhone = '';
    this.empPrivateCallTime = '';
    this.empErrorMessage.set('');
    this.showEmployeeModal.set(true);
  }

  public editEmployee(emp: AgencyEmployee): void {
    this.employeeModalMode.set('edit');
    this.currentEmployeeId = emp.id;
    this.empFirstName = emp.first_name;
    this.empLastName = emp.last_name;
    this.empMobile = emp.mobile_number || '';
    this.empOtherPhone = emp.other_phone || '';
    this.empDesignation = emp.designation || '';
    this.empEmail = emp.email || '';
    this.empCallTime = emp.preferred_call_time || '';
    this.empHasPrivatePhone = !!emp.has_private_phone;
    this.empPrivatePhone = emp.private_phone || '';
    this.empPrivateCallTime = emp.private_call_time || '';
    this.empErrorMessage.set('');
    this.showEmployeeModal.set(true);
  }

  public closeEmployeeModal(): void {
    this.showEmployeeModal.set(false);
  }

  get isEmployeeFormValid(): boolean {
    const hasNames = !!(this.empFirstName.trim() && this.empLastName.trim());
    let validMobile = true;
    if (this.empMobile) {
      validMobile = /^(\+49|0)1[5-7]\d{7,12}$/.test(this.empMobile.replace(/[\s-]/g, ''));
    }
    let validEmail = true;
    if (this.empEmail) {
      validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.empEmail);
    }
    return hasNames && validMobile && validEmail;
  }

  public saveEmployee(): void {
    if (!this.isEmployeeFormValid || !this.agencyId) return;

    this.savingEmployee.set(true);
    const payload = {
      first_name: this.empFirstName,
      last_name: this.empLastName,
      mobile_number: this.empMobile,
      other_phone: this.empOtherPhone,
      designation: this.empDesignation,
      email: this.empEmail,
      preferred_call_time: this.empCallTime,
      has_private_phone: this.empHasPrivatePhone,
      private_phone: this.empPrivatePhone,
      private_call_time: this.empPrivateCallTime
    };

    if (this.employeeModalMode() === 'create') {
      this.http.post(`${environment.apiUrl}/agencies/${this.agencyId}/employees`, payload).subscribe({
        next: () => {
          this.savingEmployee.set(false);
          this.closeEmployeeModal();
          this.loadEmployees();
        },
        error: (err) => {
          this.savingEmployee.set(false);
          this.empErrorMessage.set(err.error?.error || 'Failed to add employee');
        }
      });
    } else {
      this.http.put(`${environment.apiUrl}/agency-employees/${this.currentEmployeeId}`, payload).subscribe({
        next: () => {
          this.savingEmployee.set(false);
          this.closeEmployeeModal();
          this.loadEmployees();
        },
        error: (err) => {
          this.savingEmployee.set(false);
          this.empErrorMessage.set(err.error?.error || 'Failed to update employee');
        }
      });
    }
  }

  public deleteEmployee(id: number): void {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.http.delete(`${environment.apiUrl}/agency-employees/${id}`).subscribe({
        next: () => {
          this.loadEmployees();
        },
        error: (err) => {
          alert('Failed to delete employee');
        }
      });
    }
  }
}
