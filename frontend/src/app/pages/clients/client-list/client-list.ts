import { Component, OnInit, signal, inject, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TableModule } from 'primeng/table';
import { TranslatePipe } from '@ngx-translate/core';
import { Client } from '../../../models/client.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, TranslatePipe],
  templateUrl: './client-list.html'
})
export class ClientList implements OnInit {
  private readonly http: HttpClient = inject(HttpClient);
  protected readonly router: Router = inject(Router);

  public readonly clients: WritableSignal<Client[]> = signal<Client[]>([]);
  public readonly loading: WritableSignal<boolean> = signal(true);

  public ngOnInit(): void {
    this.loadClients();
  }

  public loadClients(): void {
    this.loading.set(true);
    this.http.get<Client[]>(`${environment.apiUrl}/clients`).subscribe({
      next: (data: Client[]) => {
        this.clients.set(data);
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Failed to load clients', err);
        this.loading.set(false);
      }
    });
  }

  public goToCreate(): void {
    this.router.navigate(['/clients/create']);
  }

  public goToEdit(id: number): void {
    this.router.navigate(['/clients/edit', id]);
  }
}
