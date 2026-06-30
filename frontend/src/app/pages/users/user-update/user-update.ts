import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Role } from '../../../models/user.model';
import { Designation } from '../../../models/designation.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-update',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-update.html',
})
export class UserUpdate implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);
  private readonly route: ActivatedRoute = inject(ActivatedRoute);

  public userId!: string;
  public roles: WritableSignal<Role[]> = signal<Role[]>([]);
  public designations: WritableSignal<Designation[]> = signal<Designation[]>([]);

  public user_number: string = '';
  public first_name: string = '';
  public last_name: string = '';
  public middle_name: string = '';
  public designation: string = '';
  public job_type: string = '';

  public role_id: number | null = null;
  public is_active: boolean = true;

  public loading: WritableSignal<boolean> = signal(true);
  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id')!;

    // Load roles and designations first
    this.http.get<Designation[]>(`${environment.apiUrl}/designations`).subscribe({
      next: (data: Designation[]) => this.designations.set(data),
      error: (err: any) => console.error('Failed to load designations', err),
    });

    this.http.get<Role[]>(`${environment.apiUrl}/roles`).subscribe({
      next: (data: Role[]) => {
        this.roles.set(data);
        this.loadUser();
      },
      error: (err: any) => {
        console.error('Failed to load roles', err);
        this.loading.set(false);
      },
    });
  }

  public loadUser(): void {
    this.http.get<any>(`${environment.apiUrl}/users/${this.userId}`).subscribe({
      next: (user: any) => {
        this.user_number = user.user_number || '';
        this.first_name = user.first_name || '';
        this.last_name = user.last_name || '';
        this.middle_name = user.middle_name || '';
        this.designation = user.designation || '';
        this.job_type = user.job_type || '';

        this.role_id = user.role_id;
        this.is_active = user.is_active === 1 || user.is_active === true;
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load user', err);
        this.loading.set(false);
        alert('Failed to load user details.');
      },
    });
  }

  public get isFormValid(): boolean {
    return !!(
      this.user_number &&
      this.first_name &&
      this.last_name &&
      this.designation &&
      this.job_type
    );
  }

  public save(): void {
    if (!this.isFormValid) return;

    this.saving.set(true);

    this.http.put(`${environment.apiUrl}/users/${this.userId}`, this.buildPayload()).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private buildPayload(): any {
    return {
      user_number: this.user_number,
      first_name: this.first_name,
      last_name: this.last_name,
      middle_name: this.middle_name,
      designation: this.designation,
      job_type: this.job_type,
      role_id: this.role_id,
      is_active: this.is_active,
    };
  }

  private handleSaveSuccess(): void {
    this.saving.set(false);
    this.router.navigate(['/users/list']);
  }

  private handleSaveError(err: any): void {
    console.error('Failed to update user', err);
    this.saving.set(false);
    this.errorMessage.set(
      err.error?.error || 'Failed to update user. User number might already exist.',
    );
  }

  public cancel(): void {
    this.router.navigate(['/users/list']);
  }
}
