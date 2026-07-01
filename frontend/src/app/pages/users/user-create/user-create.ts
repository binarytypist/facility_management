import { Component, OnInit, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { Role } from '../../../models/user.model';
import { Designation } from '../../../models/designation.model';
import { UserService, CreateUserPayload } from '../../../services/user.service';

@Component({
  selector: 'app-user-create',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './user-create.html',
})
export class UserCreate implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly userService = inject(UserService);

  public roles: WritableSignal<Role[]> = signal<Role[]>([]);
  public designations: WritableSignal<Designation[]> = signal<Designation[]>([]);

  public userForm = this.fb.group({
    user_number: ['', Validators.required],
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    middle_name: [''],
    designation: ['', Validators.required],
    job_type: ['', Validators.required],
    role_id: [null as number | null],
    is_active: [true]
  });

  public saving: WritableSignal<boolean> = signal(false);
  public errorMessage: WritableSignal<string> = signal('');

  public ngOnInit(): void {
    this.loadRoles();
    this.loadDesignations();
  }

  private loadRoles(): void {
    this.userService.getRoles().subscribe({
      next: (data: Role[]) => this.roles.set(data),
      error: (err: any) => {
        console.error('Failed to load roles', err);
        this.errorMessage.set('Failed to load roles from the server.');
      }
    });
  }

  private loadDesignations(): void {
    this.userService.getDesignations().subscribe({
      next: (data: Designation[]) => this.designations.set(data),
      error: (err: any) => {
        console.error('Failed to load designations', err);
        this.errorMessage.set('Failed to load designations from the server.');
      }
    });
  }

  public get isFormValid(): boolean {
    return this.userForm.valid;
  }

  public save(): void {
    if (!this.isFormValid) return;

    this.saving.set(true);
    this.errorMessage.set('');

    const payload = this.buildPayload();

    this.userService.createUser(payload).pipe(
      finalize(() => this.saving.set(false))
    ).subscribe({
      next: () => this.handleSaveSuccess(),
      error: (err: any) => this.handleSaveError(err),
    });
  }

  private buildPayload(): CreateUserPayload {
    const formValue = this.userForm.value;
    return {
      user_number: formValue.user_number!,
      first_name: formValue.first_name!,
      last_name: formValue.last_name!,
      middle_name: formValue.middle_name || undefined,
      designation: formValue.designation!,
      job_type: formValue.job_type!,
      role_id: formValue.role_id ?? null,
      is_active: formValue.is_active ?? true,
    };
  }

  private handleSaveSuccess(): void {
    this.router.navigate(['/users/list']);
  }

  private handleSaveError(err: any): void {
    console.error('Failed to create user', err);
    this.errorMessage.set(
      err.error?.error || err.error?.message || 'Failed to create user. User number might already exist.'
    );
  }

  public cancel(): void {
    this.router.navigate(['/users/list']);
  }
}
