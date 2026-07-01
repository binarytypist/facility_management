import { Component, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
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
    if (!this.isPasswordValid()) {
      this.errorMessage.set('Passwords do not match');
      return;
    }

    this.setLoadingState();
    this.clearMessages();

    this.http
      .post<any>(`${environment.apiUrl}/register`, this.buildRegisterPayload())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.handleRegisterSuccess(res),
        error: (err) => this.handleRegisterError(err)
      });
  }

  private isPasswordValid(): boolean {
    return this.password() === this.confirmPassword();
  }

  private buildRegisterPayload(): {
    email: string;
    password: string;
    role: string;
  } {
    return {
      email: this.email(),
      password: this.password(),
      role: this.role()
    };
  }

  private setLoadingState(): void {
    this.isLoading.set(true);
  }

  private clearMessages(): void {
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  private handleRegisterSuccess(res: any): void {
    this.successMessage.set('Account created successfully! Redirecting...');

    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

  private handleRegisterError(err: any): void {
    this.errorMessage.set(
      err.error?.message || 'Failed to register. Please try again.'
    );
  }
}
