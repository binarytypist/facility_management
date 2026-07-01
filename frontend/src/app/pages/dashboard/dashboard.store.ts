import { Injectable, signal, computed } from '@angular/core';
import { LocationNode } from '../../models/location.model';
import { WorkEvent, KpiStats } from '../../models/work-event.model';

export interface DashboardFilters {
  search: string;
  status: string;
  priority: string;
  category: string;
  schedule: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardStore {
  // Theme & Language
  private readonly _isDarkTheme = signal<boolean>(true);
  private readonly _currentLang = signal<string>('en');

  // Work Events & KPI
  private readonly _workEvents = signal<WorkEvent[]>([]);
  private readonly _kpiStats = signal<KpiStats | null>(null);

  // Filters & State
  private readonly _selectedLocation = signal<LocationNode | null>(null);
  private readonly _filters = signal<DashboardFilters>({
    search: '',
    status: '',
    priority: '',
    category: '',
    schedule: ''
  });
  
  private readonly _activeTab = signal<string>('event');
  private readonly _activeEventSubTab = signal<string>('kanban');

  // Public readonly signals
  readonly isDarkTheme = this._isDarkTheme.asReadonly();
  readonly currentLang = this._currentLang.asReadonly();
  readonly workEvents = this._workEvents.asReadonly();
  readonly kpiStats = this._kpiStats.asReadonly();
  readonly selectedLocation = this._selectedLocation.asReadonly();
  readonly filters = this._filters.asReadonly();
  readonly activeTab = this._activeTab.asReadonly();
  readonly activeEventSubTab = this._activeEventSubTab.asReadonly();

  // Computed: Filtered Events
  readonly filteredEvents = computed(() => {
    const f = this.filters();
    return this.workEvents().filter((event: any) => {
      // Very basic filtering implementation
      if (f.status && event.status !== f.status) return false;
      if (f.priority && event.priority !== f.priority) return false;
      if (f.schedule && event.schedule_type !== f.schedule) return false;
      if (f.category && event.work_type_id !== f.category) return false; // assuming work_type_id mapping or similar
      return true;
    });
  });

  // Setters
  toggleTheme() {
    this._isDarkTheme.set(!this._isDarkTheme());
  }

  setLanguage(lang: string) {
    this._currentLang.set(lang);
  }

  setWorkEvents(events: WorkEvent[]) {
    this._workEvents.set(events);
  }

  setKpiStats(stats: KpiStats) {
    this._kpiStats.set(stats);
  }

  setSelectedLocation(location: LocationNode | null) {
    this._selectedLocation.set(location);
  }

  updateFilters(partialFilters: Partial<DashboardFilters>) {
    this._filters.update(f => ({ ...f, ...partialFilters }));
  }

  clearFilters() {
    this._filters.set({
      search: '',
      status: '',
      priority: '',
      category: '',
      schedule: ''
    });
    this._selectedLocation.set(null);
  }

  setActiveTab(tab: string) {
    this._activeTab.set(tab);
  }

  setActiveEventSubTab(subTab: string) {
    this._activeEventSubTab.set(subTab);
  }
}
