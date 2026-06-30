import { Injectable, signal, computed } from '@angular/core';

export type UserRole = 'admin' | 'manager' | 'editor' | 'user';

/**
 * AuthService manages the current user's role session.
 * 
 * When Keycloak is available, the role comes from the Keycloak token.
 * When Keycloak is not running (local dev), a mock role switcher allows
 * testing all four access levels from the UI header.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  /** Keycloak connectivity status */
  private readonly _keycloakActive = signal<boolean>(false);
  
  /** Current active role */
  private readonly _role = signal<UserRole>('admin');
  
  /** Username display */
  private readonly _username = signal<string>('');

  /** Observable computed values */
  readonly role = computed(() => this._role());
  readonly username = computed(() => this._username());
  readonly isKeycloakActive = computed(() => this._keycloakActive());

  /** All available roles for the mock switcher dropdown */
  readonly availableRoles: UserRole[] = ['admin', 'manager', 'editor', 'user'];

  /**
   * Initialize auth from localStorage.
   * In a real Keycloak setup, this would call keycloak.init().
   */
  init(): void {
    const storedRole = localStorage.getItem('userRole') as UserRole | null;
    const storedEmail = localStorage.getItem('userEmail');
    
    if (storedRole && this.availableRoles.includes(storedRole)) {
      this._role.set(storedRole);
    } else {
      this._role.set('user');
    }

    this._username.set(storedEmail || 'demo@facilipro.com');
    this._keycloakActive.set(false); // Mock mode by default
  }

  /** Switch role (mock mode) */
  switchRole(newRole: UserRole): void {
    this._role.set(newRole);
    localStorage.setItem('userRole', newRole);
  }

  /** Set the user email/username */
  setUsername(email: string): void {
    this._username.set(email);
  }

  /**
   * Permission matrix:
   * - admin:   can do everything (create, edit, delete, close, approve, manage users)
   * - manager: can create events, close/approve completed work, view analytics
   * - editor:  can create events, edit/update status, record results, but cannot close/approve
   * - user:    read-only viewer — can see kanban, list, analytics, but cannot modify anything
   */
  hasPermission(action: string): boolean {
    const role = this._role();
    
    const permissions: Record<string, UserRole[]> = {
      // Event lifecycle
      'create_event':      ['admin', 'manager', 'editor'],
      'edit_event':        ['admin', 'manager', 'editor'],
      'start_work':        ['admin', 'manager', 'editor'],
      'complete_work':     ['admin', 'manager', 'editor'],
      'close_approve':     ['admin', 'manager'],
      'delete_event':      ['admin'],
      
      // Work items backlog
      'create_work_item':  ['admin', 'manager', 'editor'],
      'schedule_work_item':['admin', 'manager'],
      
      // Calendar scheduling
      'schedule_event':    ['admin', 'manager'],
      
      // Admin only
      'manage_users':      ['admin'],
      'view_all_modules':  ['admin'],
      
      // Everyone can view
      'view_dashboard':    ['admin', 'manager', 'editor', 'user'],
      'view_analytics':    ['admin', 'manager', 'editor', 'user'],
      'view_calendar':     ['admin', 'manager', 'editor', 'user'],
      'view_work_items':   ['admin', 'manager', 'editor', 'user'],
    };

    const allowed = permissions[action];
    if (!allowed) return false;
    return allowed.includes(role);
  }

  /** Logout and clear session */
  logout(): void {
    this._role.set('user');
    this._username.set('');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
  }
}
