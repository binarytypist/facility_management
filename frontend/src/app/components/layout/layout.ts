import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { Footer } from '../footer/footer';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

import { LocationNode } from '../../models/location.model';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, Footer, FormsModule],
  templateUrl: './layout.html'
})
export class Layout implements OnInit {
  protected readonly router: Router = inject(Router);
  private readonly translateService: TranslateService = inject(TranslateService);
  protected readonly auth: AuthService = inject(AuthService);
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl: string = environment.apiUrl;

  protected readonly isDarkTheme: WritableSignal<boolean> = signal<boolean>(true);
  protected readonly currentLang: WritableSignal<string> = signal<string>('en');
  protected readonly langOptions: Array<{ label: string; value: string }> = [
    { label: 'EN', value: 'en' },
    { label: 'ES', value: 'es' },
    { label: 'DE', value: 'de' }
  ];

  protected readonly activeTab: WritableSignal<string> = signal<string>('event');

  protected readonly searchQuery: WritableSignal<string> = signal<string>('');
  
  protected readonly expandedNodes: WritableSignal<Set<number>> = signal<Set<number>>(new Set());
  protected readonly locationTree: WritableSignal<LocationNode[]> = signal<LocationNode[]>([]);
  protected readonly selectedLocation: WritableSignal<LocationNode | null> = signal<LocationNode | null>(null);

  public ngOnInit(): void {
    this.auth.init();
    if (this.isDarkTheme()) {
      document.documentElement.classList.add('dark');
    }
    this.loadLocations();

    // Sync activeTab signal with route URLs
    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/map')) {
        this.activeTab.set('map');
      } else if (url.includes('/dashboard')) {
        this.activeTab.set('event');
      } else {
        this.activeTab.set('');
      }
    });
  }

  private loadLocations(): void {
    this.http.get<any>(`${this.apiUrl}/locations`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.buildLocationTree(res.locations);
        }
      },
      error: (err: any) => console.error('Failed to load locations', err)
    });
  }

  private buildLocationTree(locations: any[]): void {
    const nodeMap: Map<number, LocationNode> = new Map<number, LocationNode>();
    locations.forEach((loc: any) => {
      nodeMap.set(loc.id, { ...loc, children: [], taskCount: Math.floor(Math.random() * 5) });
    });

    const rootNodes: LocationNode[] = [];
    locations.forEach((loc: any) => {
      const node: LocationNode = nodeMap.get(loc.id)!;
      if (loc.parent_id === null) {
        rootNodes.push(node);
      } else {
        const parent: LocationNode | undefined = nodeMap.get(loc.parent_id);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    this.locationTree.set(rootNodes);
  }

  protected selectLocation(node: LocationNode | null): void {
    this.selectedLocation.set(node);
  }

  protected goToTab(tab: string): void {
    this.activeTab.set(tab);
    if (tab === 'map') {
      this.router.navigate(['/map']);
    } else {
      this.router.navigate(['/dashboard'], { queryParams: { tab } });
    }
  }

  protected toggleTheme(): void {
    this.isDarkTheme.set(!this.isDarkTheme());
    if (this.isDarkTheme()) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  protected changeLanguage(lang: string): void {
    this.currentLang.set(lang);
    this.translateService.use(lang);
  }

  protected logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
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

  protected can(action: string): boolean {
    return this.auth.hasPermission(action);
  }
}
