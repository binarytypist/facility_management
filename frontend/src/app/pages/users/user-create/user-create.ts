import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Role } from '../../../models/user.model';
import { Designation } from '../../../models/designation.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './user-create.html',
})
export class UserCreate implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

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

  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.http.get<Role[]>(`${environment.apiUrl}/roles`).subscribe({
      next: (data: Role[]) => this.roles.set(data),
      error: (err: any) => console.error('Failed to load roles', err),
    });
    this.http.get<Designation[]>(`${environment.apiUrl}/designations`).subscribe({
      next: (data: Designation[]) => this.designations.set(data),
      error: (err: any) => console.error('Failed to load designations', err),
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

    this.http.post(`${environment.apiUrl}/users`, this.buildPayload()).subscribe({
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
    console.error('Failed to create user', err);
    this.saving.set(false);
    this.errorMessage.set(
      err.error?.error || 'Failed to create user. User number might already exist.',
    );
  }

  public cancel(): void {
    this.router.navigate(['/users/list']);
  }
}
