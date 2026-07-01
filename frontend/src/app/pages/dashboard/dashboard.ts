import { Component, OnInit, inject, signal, WritableSignal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { AuthService, UserRole } from '../../services/auth.service';
import { environment } from '../../../environments/environment';
import { DashboardStatsComponent } from './components/dashboard-stats.component';
import { DashboardStore } from './dashboard.store';
import { MasterDataStore } from './master-data.store';

import { LocationNode, CalendarDay } from '../../models/location.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe, TableModule, DashboardStatsComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);
  private readonly translateService: TranslateService = inject(TranslateService);
  protected readonly auth: AuthService = inject(AuthService);
  private readonly apiUrl: string = environment.apiUrl;

  protected readonly store = inject(DashboardStore);
  protected readonly masterData = inject(MasterDataStore);

  // Theme & Language State
  protected readonly isDarkTheme = this.store.isDarkTheme;
  protected readonly currentLang = this.store.currentLang;
  protected readonly langOptions: Array<{ label: string; value: string }> = [
    { label: 'EN', value: 'en' },
    { label: 'ES', value: 'es' },
    { label: 'DE', value: 'de' }
  ];

  // Master Data
  protected readonly categories = this.masterData.categories;
  protected readonly workTypes = this.masterData.workTypes;
  protected readonly teams = this.masterData.teams;
  protected readonly facilities = this.masterData.facilities;
  protected readonly clients = this.masterData.clients;
  protected readonly agencies = this.masterData.agencies;
  protected readonly locations = this.masterData.locations;
  protected readonly locationTree = this.masterData.locationTree;
  
  protected readonly expandedNodes: WritableSignal<Set<number>> = signal<Set<number>>(new Set());

  // Filter & State
  protected readonly selectedLocation = this.store.selectedLocation;
  protected readonly searchQuery = computed(() => this.store.filters().search);
  protected readonly statusFilter = computed(() => this.store.filters().status);
  protected readonly priorityFilter = computed(() => this.store.filters().priority);
  protected readonly categoryFilter = computed(() => this.store.filters().category);
  protected readonly scheduleFilter = computed(() => this.store.filters().schedule);
  
  protected readonly activeTab = this.store.activeTab;
  protected readonly activeEventSubTab = this.store.activeEventSubTab;

  // Work Events & KPI Stats
  protected readonly workEvents = this.store.workEvents;
  protected readonly filteredEvents = this.store.filteredEvents;
  protected readonly kpiStats = computed(() => this.store.kpiStats() || {
    total: 0,
    active: 0,
    completed: 0,
    closed: 0,
    totalCost: 0,
    priorityDistribution: [],
    statusDistribution: [],
    scheduleDistribution: [],
    costByCategory: [],
    costBySite: []
  });

  protected readonly showDetailModal: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly showCompleteModal: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly showScheduleModal: WritableSignal<boolean> = signal<boolean>(false);

  // Selected Event Details
  protected readonly selectedEvent: WritableSignal<any | null> = signal<any | null>(null);

  // Completion Form State
  protected readonly resultForm: WritableSignal<any> = signal<any>({
    completion_details: '',
    findings: '',
    materials: [] as Array<{ material: string; cost: number; quantity: number }>,
    labor_hours: 0,
    cost: 0,
    attachmentsInput: ''
  });

  // --- WORK ITEMS (Backlog) ---
  protected readonly workItems: WritableSignal<any[]> = signal<any[]>([]);
  protected readonly showCreateWorkItemModal: WritableSignal<boolean> = signal<boolean>(false);
  protected readonly newWorkItem: WritableSignal<any> = signal<any>({
    title: '',
    description: '',
    facility_id: '',
    client_id: '',
    service_category_id: '',
    work_type_id: '',
    estimated_duration: 1.0
  });

  // --- CALENDAR STATE ---
  protected readonly calendarDate: WritableSignal<Date> = signal<Date>(new Date());
  protected readonly calendarDays: WritableSignal<CalendarDay[]> = signal<CalendarDay[]>([]);
  protected readonly selectedCalendarDay: WritableSignal<CalendarDay | null> = signal<CalendarDay | null>(null);
  protected readonly schedulingWorkItem: WritableSignal<any | null> = signal<any | null>(null);

  public ngOnInit(): void {
    const role: string | null = localStorage.getItem('userRole');
    if (!role) {
      this.router.navigate(['/login']);
      return;
    }
    this.auth.init();

    this.loadMasterData();
    this.loadWorkEvents();
    this.loadStats();
    this.loadWorkItems();
    this.loadFacilities();
    this.buildCalendar();


  }

  protected toggleTheme(): void {
    this.store.toggleTheme();
    if (this.isDarkTheme()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  protected changeLang(lang: string): void {
    if (this.currentLang() !== lang) {
      this.store.setLanguage(lang);
      this.translateService.use(lang);
    }
  }

  protected goToUsers(): void {
    this.router.navigate(['/users/list']);
  }

  protected can(action: string): boolean {
    return this.auth.hasPermission(action);
  }

  // --- API CALLS ---

  private loadMasterData(): void {
    this.http.get<any>(`${this.apiUrl}/master-data`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.masterData.setCategories(res.categories);
          this.masterData.setWorkTypes(res.workTypes);
          this.masterData.setTeams(res.teams);
        }
      },
      error: (err: any) => console.error('Failed to load master data:', err)
    });

    this.http.get<any>(`${this.apiUrl}/clients`).subscribe({
      next: (res: any) => {
        const list: any[] = Array.isArray(res) ? res : (res.clients || []);
        this.masterData.setClients(list);
      },
      error: (err: any) => console.error('Failed to load clients:', err)
    });

    this.http.get<any[]>(`${this.apiUrl}/agencies`).subscribe({
      next: (res: any[]) => {
        this.masterData.setAgencies(res);
      },
      error: (err: any) => console.error('Failed to load agencies:', err)
    });

    this.http.get<any>(`${this.apiUrl}/locations`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.masterData.setLocations(res.locations);
          this.buildLocationTree(res.locations);
        }
      },
      error: (err: any) => console.error('Failed to load locations:', err)
    });
  }

  protected loadWorkEvents(): void {
    const params: string[] = [];
    if (this.selectedLocation()) {
      params.push(`location_id=${this.selectedLocation()!.id}`);
    }
    if (this.statusFilter()) {
      params.push(`status=${this.statusFilter()}`);
    }
    if (this.priorityFilter()) {
      params.push(`priority=${this.priorityFilter()}`);
    }
    if (this.categoryFilter()) {
      params.push(`service_category_id=${this.categoryFilter()}`);
    }
    if (this.scheduleFilter()) {
      params.push(`schedule_type=${this.scheduleFilter()}`);
    }
    if (this.searchQuery()) {
      params.push(`search=${encodeURIComponent(this.searchQuery())}`);
    }

    const queryStr: string = params.length > 0 ? `?${params.join('&')}` : '';

    this.http.get<any>(`${this.apiUrl}/work-events${queryStr}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.store.setWorkEvents(res.workEvents);
          this.updateLocationTaskCounts(res.workEvents);
          this.buildCalendar(); // refresh calendar events
        }
      },
      error: (err: any) => console.error('Failed to load work events:', err)
    });
  }

  protected loadStats(): void {
    const locId: number | undefined = this.selectedLocation()?.id;
    const query: string = locId ? `?location_id=${locId}` : '';

    this.http.get<any>(`${this.apiUrl}/dashboard/stats${query}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.store.setKpiStats(res.stats);
        }
      },
      error: (err: any) => console.error('Failed to load stats:', err)
    });
  }

  protected loadWorkItems(): void {
    this.http.get<any>(`${this.apiUrl}/work-items`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.workItems.set(res.workItems);
        }
      },
      error: (err: any) => console.error('Failed to load work items:', err)
    });
  }

  protected loadFacilities(): void {
    this.http.get<any>(`${this.apiUrl}/facilities`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.masterData.setFacilities(res.facilities);
        }
      },
      error: (err: any) => console.error('Failed to load facilities:', err)
    });
  }

  // --- LOCATION TREE BUILDER ---

  private buildLocationTree(flatList: any[]): void {
    const nodeMap: Map<number, LocationNode> = new Map<number, LocationNode>();

    // Create node mapping
    flatList.forEach((loc: any) => {
      nodeMap.set(loc.id, {
        id: loc.id,
        name: loc.name,
        type: loc.type,
        parent_id: loc.parent_id,
        children: [],
        taskCount: 0
      });
    });

    const rootNodes: LocationNode[] = [];

    // Establish links
    flatList.forEach((loc: any) => {
      const node: LocationNode = nodeMap.get(loc.id)!;
      if (loc.parent_id === null) {
        rootNodes.push(node);
      } else {
        const parentNode: LocationNode | undefined = nodeMap.get(loc.parent_id);
        if (parentNode) {
          parentNode.children.push(node);
        }
      }
    });

    this.masterData.setLocationTree(rootNodes);
  }

  // Calculate task counts recursively for the tree sidebar
  private updateLocationTaskCounts(events: any[]): void {
    const flatLocations: any[] = this.locations();
    const tree: LocationNode[] = this.locationTree();
    if (flatLocations.length === 0 || tree.length === 0) return;

    // Helper to get descendant IDs
    const getDescendants = (nodeId: number): number[] => {
      const descendants: number[] = [nodeId];
      const children: any[] = flatLocations.filter((l: any) => l.parent_id === nodeId);
      children.forEach((c: any) => {
        descendants.push(...getDescendants(c.id));
      });
      return descendants;
    };

    // Helper to update counts on tree nodes
    const updateNodeCount = (node: LocationNode): void => {
      const descIds: number[] = getDescendants(node.id);
      node.taskCount = events.filter((e: any) => descIds.includes(e.location_id) && e.status !== 'closed' && e.status !== 'completed').length;
      node.children.forEach(updateNodeCount);
    };

    tree.forEach(updateNodeCount);
    this.masterData.setLocationTree([...tree]);
  }

  protected selectLocation(node: LocationNode | null): void {
    this.store.setSelectedLocation(node);
    this.loadWorkEvents();
    this.loadStats();
  }

  protected toggleNodeExpansion(nodeId: number, event: Event): void {
    event.stopPropagation();
    const current: Set<number> = new Set(this.expandedNodes());
    if (current.has(nodeId)) {
      current.delete(nodeId);
    } else {
      current.add(nodeId);
    }
    this.expandedNodes.set(current);
  }

  // --- FILTERING & RESET ---

  protected clearAllFilters(): void {
    this.store.clearFilters();
    this.loadWorkEvents();
    this.loadStats();
  }

  // --- KANBAN BOARD COLUMNS ---

  protected getEventsByStatus(status: string): any[] {
    return this.filteredEvents().filter((e: any) => e.status === status);
  }

  protected updateEventStatus(event: any, newStatus: string): void {
    this.http.put<any>(`${this.apiUrl}/work-events/${event.id}`, { status: newStatus }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.loadWorkEvents();
          this.loadStats();
          if (this.selectedEvent() && this.selectedEvent()!.id === event.id) {
            this.viewEventDetails(event.id);
          }
        }
      },
      error: (err: any) => console.error('Failed to update event status:', err)
    });
  }

  // --- DETAILS VIEW & CHECKLIST INTERACTION ---

  protected viewEventDetails(id: number): void {
    this.http.get<any>(`${this.apiUrl}/work-events/${id}`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.selectedEvent.set(res.workEvent);
          this.showDetailModal.set(true);
        }
      },
      error: (err: any) => console.error('Failed to load event details:', err)
    });
  }

  protected toggleChecklistItem(item: any): void {
    const event: any = this.selectedEvent();
    if (!event || !event.checklist) return;

    const updatedChecklist: any[] = event.checklist.map((i: any) =>
      i.id === item.id ? { ...i, done: !i.done } : i
    );

    // Save checklist updates to backend
    this.http.put<any>(`${this.apiUrl}/work-events/${event.id}`, { checklist: updatedChecklist }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.selectedEvent.set({ ...event, checklist: updatedChecklist });
          // Reload board to display latest data
          this.loadWorkEvents();
        }
      },
      error: (err: any) => console.error('Failed to update checklist item:', err)
    });
  }

  protected getChecklistPercentage(event: any): number {
    if (!event || !event.checklist || event.checklist.length === 0) return 0;
    const completed: number = event.checklist.filter((i: any) => i.done).length;
    return Math.round((completed / event.checklist.length) * 100);
  }

  // --- COMPLETE WORK FORM & RESULTS ---

  protected openCompleteModal(): void {
    this.resultForm.set({
      completion_details: '',
      findings: '',
      materials: [] as Array<{ material: string; cost: number; quantity: number }>,
      labor_hours: 0,
      cost: 0,
      attachmentsInput: ''
    });
    this.showCompleteModal.set(true);
  }

  protected addMaterialRow(): void {
    const mats: any[] = [...this.resultForm().materials, { material: '', cost: 0, quantity: 1 }];
    this.resultForm.set({ ...this.resultForm(), materials: mats });
    this.calculateSuggestedCost();
  }

  protected removeMaterialRow(index: number): void {
    const mats: any[] = this.resultForm().materials.filter((_: any, i: number) => i !== index);
    this.resultForm.set({ ...this.resultForm(), materials: mats });
    this.calculateSuggestedCost();
  }

  protected calculateSuggestedCost(): void {
    const form: any = this.resultForm();
    const matSum: number = form.materials.reduce((sum: number, m: any) => sum + (parseFloat(m.cost || 0) * parseInt(m.quantity || 0)), 0);
    // Suggest labor cost at $45/hour
    const laborSum: number = parseFloat(form.labor_hours || 0) * 45;
    const total: number = matSum + laborSum;
    this.resultForm.set({ ...form, cost: Math.round(total * 100) / 100 });
  }

  protected submitCompleteEvent(): void {
    const event: any = this.selectedEvent();
    const form: any = this.resultForm();
    if (!event || !form.completion_details) {
      alert('Completion details are required');
      return;
    }

    const attachments: string[] = form.attachmentsInput
      ? form.attachmentsInput.split(',').map((s: string) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      completion_details: form.completion_details,
      findings: form.findings,
      materials_used: form.materials,
      labor_hours: form.labor_hours || 0,
      cost: form.cost || 0,
      attachments
    };

    this.http.post<any>(`${this.apiUrl}/work-events/${event.id}/complete`, payload).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showCompleteModal.set(false);
          this.showDetailModal.set(false);
          this.selectedEvent.set(null);
          this.loadWorkEvents();
          this.loadStats();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error completing work event')
    });
  }

  // --- CLOSE WORK EVENT ---

  protected closeEvent(id: number): void {
    if (!confirm('Are you sure you want to close this work event? This is irreversible.')) return;
    this.http.post<any>(`${this.apiUrl}/work-events/${id}/close`, {}).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showDetailModal.set(false);
          this.selectedEvent.set(null);
          this.loadWorkEvents();
          this.loadStats();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error closing work event')
    });
  }

  // --- WORK ITEMS BACKLOG ---

  protected openCreateWorkItemModal(): void {
    this.newWorkItem.set({
      title: '',
      description: '',
      facility_id: '',
      service_category_id: '',
      work_type_id: '',
      estimated_duration: 1.0
    });
    this.showCreateWorkItemModal.set(true);
  }

  protected submitCreateWorkItem(): void {
    const data: any = this.newWorkItem();
    if (!data.title || !data.facility_id || !data.service_category_id || !data.work_type_id) {
      alert('Please fill in all required fields');
      return;
    }

    this.http.post<any>(`${this.apiUrl}/work-items`, data).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showCreateWorkItemModal.set(false);
          this.loadWorkItems();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error creating work item')
    });
  }

  protected exportWorkItems(): void {
    window.open(`${this.apiUrl}/work-items/export`, '_blank');
  }

  protected importWorkItems(event: any): void {
    const file: any = event.target.files[0];
    if (!file) return;

    const formData: FormData = new FormData();
    formData.append('file', file);

    this.http.post<any>(`${this.apiUrl}/work-items/import`, formData).subscribe({
      next: (res: any) => {
        if (res.success) {
          alert(res.message);
          this.loadWorkItems();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error importing work items')
    });
    event.target.value = null; // reset file input
  }

  protected scheduleWorkItem(item: any, day: CalendarDay): void {
    const dateStr: string = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}-${String(day.date.getDate()).padStart(2, '0')}`;

    this.http.post<any>(`${this.apiUrl}/work-events/schedule`, {
      work_item_id: item.id,
      scheduled_date: dateStr,
      title: item.title,
      description: item.description,
      service_category_id: item.service_category_id,
      work_type_id: item.work_type_id,
      facility_id: item.facility_id,
      location_id: null // will be resolved from facility
    }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.showScheduleModal.set(false);
          this.schedulingWorkItem.set(null);
          this.selectedCalendarDay.set(null);
          this.loadWorkEvents();
          this.loadStats();
        }
      },
      error: (err: any) => alert(err.error?.message || 'Error scheduling work item')
    });
  }

  protected openSchedulerForItem(item: any): void {
    this.schedulingWorkItem.set(item);
    this.showScheduleModal.set(true);
  }

  protected selectCalendarDayForSchedule(day: CalendarDay): void {
    if (!day.isCurrentMonth) return;
    this.selectedCalendarDay.set(day);
  }

  protected confirmSchedule(): void {
    const item: any = this.schedulingWorkItem();
    const day: CalendarDay | null = this.selectedCalendarDay();
    if (item && day) {
      this.scheduleWorkItem(item, day);
    }
  }

  // --- CALENDAR ---

  protected buildCalendar(): void {
    const d: Date = this.calendarDate();
    const year: number = d.getFullYear();
    const month: number = d.getMonth();

    const firstDay: Date = new Date(year, month, 1);

    // Start from the beginning of the week (Monday)
    const startDate: Date = new Date(firstDay);
    const dayOfWeek: number = startDate.getDay();
    // Adjust to start from Monday (0=Sun -> shift by 6, 1=Mon -> shift by 0, etc.)
    const mondayOffset: number = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startDate.setDate(startDate.getDate() - mondayOffset);

    const days: CalendarDay[] = [];
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);

    const events: any[] = this.workEvents();

    // Generate 6 weeks of days (42 days total)
    for (let i = 0; i < 42; i++) {
      const current: Date = new Date(startDate);
      current.setDate(startDate.getDate() + i);

      const dayEvents: any[] = events.filter((e: any) => {
        if (!e.scheduled_date) return false;
        const eDate: Date = new Date(e.scheduled_date);
        return eDate.getFullYear() === current.getFullYear() &&
          eDate.getMonth() === current.getMonth() &&
          eDate.getDate() === current.getDate();
      });

      days.push({
        date: current,
        dayNum: current.getDate(),
        isCurrentMonth: current.getMonth() === month,
        isToday: current.getTime() === today.getTime(),
        events: dayEvents
      });
    }

    this.calendarDays.set(days);
  }

  protected prevMonth(): void {
    const d: Date = this.calendarDate();
    this.calendarDate.set(new Date(d.getFullYear(), d.getMonth() - 1, 1));
    this.buildCalendar();
  }

  protected nextMonth(): void {
    const d: Date = this.calendarDate();
    this.calendarDate.set(new Date(d.getFullYear(), d.getMonth() + 1, 1));
    this.buildCalendar();
  }

  protected getMonthLabel(): string {
    return this.calendarDate().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  protected getCalendarWeekdays(): string[] {
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }

  // --- ANALYTICS HELPERS ---

  // getScheduledPercentage() has been extracted to DashboardStatsComponent

  protected getCategoryCostPercent(cost: number): number {
    const categories: any[] = this.kpiStats()?.costByCategory || [];
    if (categories.length === 0) return 0;
    const max: number = Math.max(...categories.map((c: any) => c.total_cost || 0));
    return max > 0 ? (cost / max) * 100 : 0;
  }

  protected getSiteCostPercent(cost: number): number {
    const sites: any[] = this.kpiStats()?.costBySite || [];
    if (sites.length === 0) return 0;
    const max: number = Math.max(...sites.map((s: any) => s.total_cost || 0));
    return max > 0 ? (cost / max) * 100 : 0;
  }

  // --- ROLE MANAGEMENT (Mock) ---

  protected switchRole(role: UserRole): void {
    this.auth.switchRole(role);
  }

  // --- MASTER DATA MANAGEMENT ---
  // (Master data setup has been removed from the UI as per user request)

  // --- LOGOUT ---

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

}
