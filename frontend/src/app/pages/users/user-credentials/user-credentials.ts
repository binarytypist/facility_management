import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { User } from '../../../models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-credentials',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-credentials.html',
})
export class UserCredentials implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  public users: WritableSignal<User[]> = signal<User[]>([]);
  public selectedUserId: number | null = null;

  public email: string = '';
  public password: string = '';
  public retype_password: string = '';

  public saving: WritableSignal<boolean> = signal(false);

  public ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.http.get<any>(`${environment.apiUrl}/users`).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.users.set(res.users);
        }
      },
      error: (err: any) => console.error('Failed to load users', err),
    });
  }

  public onUserSelect(event: any): void {
    const userId = Number(event.target.value);
    this.selectedUserId = userId;

    // Auto-fill existing email if they have one
    const user = this.users().find((u) => u.id === userId);
    if (user) {
      this.email = user.email || '';
    } else {
      this.email = '';
    }
    this.password = '';
    this.retype_password = '';
  }

  public get isFormValid(): boolean {
    if (!this.selectedUserId || !this.email) return false;

    // If they provided a password, retype_password must match
    if (this.password) {
      return this.password === this.retype_password;
    }

    // If they didn't provide a password, it's valid if they already have one (we just update email),
    // but in this simple flow, let's say they must provide a password if they don't have an email yet.
    const user = this.users().find((u) => u.id === this.selectedUserId);
    if (user && !user.email && !this.password) {
      return false; // New credentials must have a password
    }

    return true;
  }

  public save(): void {
    if (!this.isFormValid || !this.selectedUserId) return;

    this.saving.set(true);

    this.http.put(`${environment.apiUrl}/users/${this.selectedUserId}`, this.buildPayload()).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private buildPayload(): any {
    const payload: any = {
      email: this.email,
    };
    if (this.password) {
      payload.password = this.password;
    }
    return payload;
  }

  private handleSaveSuccess(): void {
    this.saving.set(false);
    this.router.navigate(['/users/list']);
  }

  private handleSaveError(err: any): void {
    console.error('Failed to save credentials', err);
    this.saving.set(false);
    alert(err.error?.error || 'Failed to save credentials. Email might be in use.');
  }

  public cancel(): void {
    this.router.navigate(['/users/list']);
  }
}
