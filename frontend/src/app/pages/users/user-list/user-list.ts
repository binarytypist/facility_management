import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { User } from '../../../models/user.model';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TranslatePipe],
  templateUrl: './user-list.html'
})
export class UserList implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public users: WritableSignal<User[]> = signal<User[]>([]);
  public loading: WritableSignal<boolean> = signal(true);

  public ngOnInit(): void {
    this.loadUsers();
  }

  public loadUsers(): void {
    this.loading.set(true);
    this.http.get<User[]>(`${environment.apiUrl}/users`).subscribe({
      next: (data: User[]) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load users', err);
        this.loading.set(false);
      }
    });
  }

  public goToCreate(): void {
    this.router.navigate(['/users/create']);
  }

  public goToEdit(id: number): void {
    this.router.navigate(['/users/edit', id]);
  }
}
