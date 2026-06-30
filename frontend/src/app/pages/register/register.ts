import { Component, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  protected readonly email: WritableSignal<string> = signal('');
  protected readonly password: WritableSignal<string> = signal('');
  protected readonly confirmPassword: WritableSignal<string> = signal('');
  protected readonly role: WritableSignal<string> = signal('user');
  protected readonly errorMessage: WritableSignal<string> = signal('');
  protected readonly successMessage: WritableSignal<string> = signal('');
  protected readonly isLoading: WritableSignal<boolean> = signal(false);

  public register(): void {
    if (this.password() !== this.confirmPassword()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const payload = {
      email: this.email(),
      password: this.password(),
      role: this.role()
    };

    this.http.post<any>(`${environment.apiUrl}/register`, payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        this.successMessage.set('Account created successfully! Redirecting...');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Failed to register. Please try again.');
      }
    });
  }
}
