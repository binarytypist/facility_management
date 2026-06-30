import { Component, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly router: Router = inject(Router);

  protected readonly email: WritableSignal<string> = signal('');
  protected readonly password: WritableSignal<string> = signal('');
  protected readonly errorMessage: WritableSignal<string> = signal('');
  protected readonly isLoading: WritableSignal<boolean> = signal(false);

  public login(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const payload = {
      email: this.email(),
      password: this.password()
    };

    this.http.post<any>(`${environment.apiUrl}/login`, payload).subscribe({
      next: (res: any) => {
        this.isLoading.set(false);
        // Save role locally for policy checking
        localStorage.setItem('userRole', res.role || 'user');
        this.router.navigate(['/landing']);
      },
      error: (err: any) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Invalid email or password');
      }
    });
  }
}
