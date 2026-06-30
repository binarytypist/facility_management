import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

interface agency {
  id: number;
  name: string;
  contact_info: string;
  address: string;
  postcode: string;
  city: string;
  phone: string;
  fax: string;
  other_info: string;
  facility_id: number;
  service_category_id: number;
  service_category_name: string;
  facility_name: string;
  employee_count: number;
}

@Component({
  selector: 'app-agency-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TranslatePipe],
  templateUrl: './agency-list.html',
})
export class AgencyList implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public readonly agencies: WritableSignal<agency[]> = signal<agency[]>([]);
  public readonly loading: WritableSignal<boolean> = signal(true);

  public ngOnInit(): void {
    this.loadAgencies();
  }

  public loadAgencies(): void {
    this.loading.set(true);
    this.http.get<agency[]>(`${environment.apiUrl}/agencies`).subscribe({
      next: (data: agency[]) => {
        this.agencies.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load agencies', err);
        this.loading.set(false);
      },
    });
  }

  public goToCreate(): void {
    this.router.navigate(['/agencies/create']);
  }

  public goToEdit(id: number): void {
    this.router.navigate(['/agencies/edit', id]);
  }
}
