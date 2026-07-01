import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { DatePicker } from 'primeng/datepicker';
import { TranslatePipe } from '@ngx-translate/core';
import { MasterDataService } from '../../../services/master-data.service';
import { WorkEventService } from '../../../services/work-event.service';

@Component({
  selector: 'app-facility-create',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePicker, TranslatePipe],
  templateUrl: './facility-create.html',
  styleUrls: ['./facility-create.css']
})
export class FacilityCreate implements OnInit {
  protected readonly router: Router = inject(Router);
  private readonly masterDataService = inject(MasterDataService);
  private readonly workEventService = inject(WorkEventService);

  protected readonly categories: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly workTypes: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly clients: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly locations: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly teams: WritableSignal<any[]> = signal<any[]>([]);

  protected readonly newEvent: WritableSignal<any> = signal<any>({
    title: '',
    description: '',
    client_id: '',
    start_date: new Date(),
    end_date: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      return d;
    })(),
    work_type_id: '',
    schedule_type: 'scheduled',
    structure_type: 'structured',
    execution_type: 'internal',
    priority: 'medium',
    checklistItems: [] as string[]
  });
  protected newChecklistItemText: string = '';

  public ngOnInit(): void {
    this.loadMasterData();
  }

  private loadMasterData(): void {
    this.fetchMasterData();
    this.fetchClients();
  }

  private fetchMasterData(): void {
    this.masterDataService.getMasterData().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.categories.set(res.categories);
          this.workTypes.set(res.workTypes);
          this.teams.set(res.teams);
        }
      },
      error: (err: any) => console.error('Failed to load master data:', err)
    });
  }

  private fetchClients(): void {
    this.masterDataService.getClients().subscribe({
      next: (res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res.clients || []);
        this.clients.set(list);
      },
      error: (err: any) => console.error('Failed to load clients:', err)
    });
  }

  protected getSelectedClientCode(): string {
    const clientId = this.newEvent().client_id;
    if (!clientId) return '';
    const client = this.clients().find(c => c.id == clientId);
    return client?.code || '';
  }

  protected getFilteredWorkTypes(): any[] {
    const selectedStructure = this.newEvent().structure_type;
    if (!selectedStructure) return this.workTypes();
    
    const normalizedSelected = selectedStructure.toLowerCase().replace('-', '');
    
    return this.workTypes().filter(wt => {
      if (!wt.category) return false;
      const wtCat = wt.category.toLowerCase().replace('-', '');
      return wtCat === normalizedSelected;
    });
  }

  protected addChecklistItem(): void {
    if (this.newChecklistItemText.trim()) {
      const items = [...this.newEvent().checklistItems, this.newChecklistItemText.trim()];
      this.newEvent.set({ ...this.newEvent(), checklistItems: items });
      this.newChecklistItemText = '';
    }
  }

  protected removeChecklistItem(index: number): void {
    const items = this.newEvent().checklistItems.filter((_: any, i: number) => i !== index);
    this.newEvent.set({ ...this.newEvent(), checklistItems: items });
  }

  protected submitCreateEvent(): void {
    const data = this.newEvent();
    if (!data.title || !data.client_id) {
      alert('Please fill in all required fields: Client and Event Title');
      return;
    }

    this.workEventService.createWorkEvent(this.buildPayload(data)).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.router.navigate(['/facility/list']);
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error creating work event')
    });
  }

  private buildPayload(data: any): any {
    return {
      title: data.title,
      description: data.description,
      client_id: data.client_id || null,
      work_type_id: data.work_type_id,
      schedule_type: data.schedule_type,
      structure_type: data.structure_type,
      execution_type: data.execution_type,
      priority: data.priority,
      checklist: data.checklistItems.length > 0
        ? data.checklistItems.map((text: string, id: number) => ({ id: id + 1, text, done: false })) 
        : null
    };
  }
}

