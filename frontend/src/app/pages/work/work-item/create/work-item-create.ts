import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-work-item-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker],
  templateUrl: './work-item-create.html'
})
export class WorkItemCreateComponent implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly apiUrl: string = environment.apiUrl;
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly messageService: MessageService = inject(MessageService);

  protected readonly categories: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly workTypes: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly clients: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly locations: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly agencies: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly agencyEmployees: WritableSignal<any[]> = signal<any[]>([]);

  protected isEditMode: boolean = false;
  protected eventId: number | null = null;
  protected newChecklistItemText: string = '';

  protected readonly formModel: WritableSignal<any> = signal<any>({
    title: '',
    description: '',
    client_id: '',
    location_id: '',
    service_category_id: '',
    work_type_id: '',
    priority: 'medium',
    status: 'created',
    assigned_agency_id: '',
    assigned_employee_id: '',
    scheduled_date: null,
    checklistItems: [] as string[]
  });

  public ngOnInit(): void {
    this.loadMasterData();

    // Check for edit mode
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.eventId = parseInt(idParam, 10);
      this.loadEventDetails(this.eventId);
    }
  }

  private loadMasterData(): void {
    // Categories, WorkTypes, Teams
    this.http.get<any>(`${this.apiUrl}/master-data`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories.set(res.categories);
          this.workTypes.set(res.workTypes);
        }
      },
      error: (err: any) => console.error('Failed to load master data:', err)
    });

    // Clients
    this.http.get<any>(`${this.apiUrl}/clients`).subscribe({
      next: (res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res.clients || []);
        this.clients.set(list);
      },
      error: (err: any) => console.error('Failed to load clients:', err)
    });

    // Locations
    this.http.get<any>(`${this.apiUrl}/locations`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.locations.set(res.locations);
        }
      },
      error: (err: any) => console.error('Failed to load locations:', err)
    });

    // Agencies
    this.http.get<any[]>(`${this.apiUrl}/agencies`).subscribe({
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

  private loadEventDetails(id: number): void {
    this.http.get<any>(`${this.apiUrl}/work-events/${id}`).subscribe({
      next: (res: any) => {
        if (res.success && res.workEvent) {
          const ev = res.workEvent;
          
          let parsedChecklist: string[] = [];
          if (ev.checklist) {
            // Checklist is already parsed as array in backend helper, or is string
            parsedChecklist = Array.isArray(ev.checklist)
              ? ev.checklist.map((c: any) => c.text || c)
              : [];
          }

          this.formModel.set({
            title: ev.title || '',
            description: ev.description || '',
            client_id: ev.client_id || '',
            location_id: ev.location_id || '',
            service_category_id: ev.service_category_id || '',
            work_type_id: ev.work_type_id || '',
            priority: ev.priority || 'medium',
            status: ev.status || 'created',
            assigned_agency_id: ev.assigned_agency_id || '',
            assigned_employee_id: ev.assigned_employee_id || '',
            scheduled_date: ev.scheduled_date ? new Date(ev.scheduled_date) : null,
            checklistItems: parsedChecklist
          });

          if (ev.assigned_agency_id) {
            this.loadAgencyEmployees(ev.assigned_agency_id);
          }
        }
      },
      error: (err: any) => console.error('Failed to load event details for editing:', err)
    });
  }

  protected onAgencyChange(agencyIdVal: any): void {
    const current = this.formModel();
    this.formModel.set({ ...current, assigned_agency_id: agencyIdVal, assigned_employee_id: '' });
    if (agencyIdVal) {
      this.loadAgencyEmployees(parseInt(agencyIdVal, 10));
    } else {
      this.agencyEmployees.set([]);
    }
  }

  private loadAgencyEmployees(agencyId: number): void {
    this.http.get<any[]>(`${this.apiUrl}/agencies/${agencyId}/employees`).subscribe({
      next: (res: any[]) => {
        this.agencyEmployees.set(res || []);
      },
      error: (err: any) => {
        console.error('Failed to load agency employees:', err);
        this.agencyEmployees.set([]);
      }
    });
  }

  protected getFilteredWorkTypes(): any[] {
    const selectedCat = this.formModel().service_category_id;
    if (!selectedCat) return this.workTypes();
    return this.workTypes().filter(wt => !wt.service_category_id || wt.service_category_id == selectedCat);
  }

  protected addChecklistItem(): void {
    if (this.newChecklistItemText.trim()) {
      const items = [...this.formModel().checklistItems, this.newChecklistItemText.trim()];
      this.formModel.set({ ...this.formModel(), checklistItems: items });
      this.newChecklistItemText = '';
    }
  }

  protected removeChecklistItem(index: number): void {
    const items = this.formModel().checklistItems.filter((_: any, i: number) => i !== index);
    this.formModel.set({ ...this.formModel(), checklistItems: items });
  }

  protected submitForm(): void {
    const data = this.formModel();
    if (!this.isEditMode) {
      if (!data.title || !data.client_id || !data.location_id || !data.service_category_id || !data.work_type_id) {
        this.messageService.add({
          severity: 'error',
          summary: this.translateService.instant('TOAST_ERROR'),
          detail: this.translateService.instant('WORK_ITEM_REQUIRED_FIELDS_ERROR')
        });
        return;
      }
    }

    const payload = this.buildPayload(data);

    if (this.isEditMode && this.eventId) {
      this.http.put<any>(`${this.apiUrl}/work-events/${this.eventId}`, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('TOAST_SUCCESS'),
              detail: this.translateService.instant('WORK_ITEM_UPDATED_SUCCESS')
            });
            setTimeout(() => {
              this.router.navigate(['/work/item/list']);
            }, 1000);
          }
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('TOAST_ERROR'),
            detail: err.error?.message || this.translateService.instant('WORK_ITEM_SAVE_ERROR')
          });
        }
      });
    } else {
      this.http.post<any>(`${this.apiUrl}/work-events`, payload).subscribe({
        next: (res: any) => {
          if (res.success) {
            this.messageService.add({
              severity: 'success',
              summary: this.translateService.instant('TOAST_SUCCESS'),
              detail: this.translateService.instant('WORK_ITEM_CREATED_SUCCESS')
            });
            setTimeout(() => {
              this.router.navigate(['/work/item/list']);
            }, 1000);
          }
        },
        error: (err: any) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translateService.instant('TOAST_ERROR'),
            detail: err.error?.message || this.translateService.instant('WORK_ITEM_SAVE_ERROR')
          });
        }
      });
    }
  }

  private buildPayload(data: any): any {
    if (this.isEditMode) {
      return {
        assigned_employee_id: data.assigned_employee_id ? parseInt(data.assigned_employee_id, 10) : null,
        status: data.status,
        scheduled_date: data.scheduled_date ? this.formatDate(data.scheduled_date) : null
      };
    }

    const isAssignedVal = data.assigned_agency_id ? 1 : 0;
    const defaultStatus = isAssignedVal ? 'assigned' : 'created';

    return {
      title: data.title,
      description: data.description,
      client_id: data.client_id ? parseInt(data.client_id, 10) : null,
      service_category_id: parseInt(data.service_category_id, 10),
      work_type_id: parseInt(data.work_type_id, 10),
      location_id: parseInt(data.location_id, 10),
      schedule_type: 'scheduled',
      structure_type: 'structured',
      execution_type: 'external',
      priority: data.priority,
      status: defaultStatus,
      assigned_agency_id: data.assigned_agency_id ? parseInt(data.assigned_agency_id, 10) : null,
      assigned_employee_id: data.assigned_employee_id ? parseInt(data.assigned_employee_id, 10) : null,
      scheduled_date: data.scheduled_date ? this.formatDate(data.scheduled_date) : null,
      is_assigned: isAssignedVal,
      checklist: data.checklistItems.length > 0
        ? data.checklistItems.map((text: string, id: number) => ({ id: id + 1, text, done: false })) 
        : null
    };
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected cancel(): void {
    this.router.navigate(['/work/item/list']);
  }
}
