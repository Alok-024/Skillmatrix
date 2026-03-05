import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';
import { OverlayStoreService } from '../../core/services/overlay-store.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Create Account</mat-card-title>
          <mat-card-subtitle>Join Corporate Skill Matrix</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Full Name</mat-label>
              <input matInput formControlName="fullName" placeholder="John Doe">
              <mat-icon matPrefix>person</mat-icon>
              @if (registerForm.get('fullName')?.hasError('required')) {
                <mat-error>Full name is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Employee ID</mat-label>
              <input matInput formControlName="employeeId" placeholder="EMP1234">
              <mat-icon matPrefix>badge</mat-icon>
              @if (registerForm.get('employeeId')?.hasError('required')) {
                <mat-error>Employee ID is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="john.doe@company.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (registerForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (registerForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="hidePassword() ? 'password' : 'text'"
                     formControlName="password"
                     placeholder="Create a password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (registerForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
              }
              @if (registerForm.get('password')?.hasError('minlength')) {
                <mat-error>Password must be at least 6 characters</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Department</mat-label>
              <mat-select formControlName="department">
                @for (dept of departments(); track dept) {
                  <mat-option [value]="dept">{{ dept }}</mat-option>
                }
              </mat-select>
              <mat-icon matPrefix>business</mat-icon>
              @if (registerForm.get('department')?.hasError('required')) {
                <mat-error>Department is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Job Title</mat-label>
              <input matInput formControlName="jobTitle" placeholder="Software Engineer">
              <mat-icon matPrefix>work</mat-icon>
              @if (registerForm.get('jobTitle')?.hasError('required')) {
                <mat-error>Job title is required</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Location</mat-label>
              <input matInput formControlName="location" placeholder="Bengaluru">
              <mat-icon matPrefix>location_on</mat-icon>
              @if (registerForm.get('location')?.hasError('required')) {
                <mat-error>Location is required</mat-error>
              }
            </mat-form-field>

            @if (errorMessage()) {
              <div class="error-message">
                <mat-icon>error</mat-icon>
                {{ errorMessage() }}
              </div>
            }

            <button mat-raised-button
                    color="primary"
                    type="submit"
                    class="full-width submit-button"
                    [disabled]="loading() || registerForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Create Account
              }
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <div class="login-link">
            Already have an account?
            <a routerLink="/auth/login">Sign in here</a>
          </div>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    .auth-card {
      width: 100%;
      max-width: 500px;
    }
    mat-card-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 24px 0 16px;
    }
    mat-card-title {
      font-size: 28px;
      margin-bottom: 8px;
    }
    mat-card-content {
      padding: 24px;
      max-height: 70vh;
      overflow-y: auto;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .submit-button {
      height: 48px;
      margin-top: 8px;
      font-size: 16px;
    }
    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }
    .login-link {
      text-align: center;
      padding: 16px;
      width: 100%;
    }
    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private overlayStore = inject(OverlayStoreService);
  private router = inject(Router);

  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');
  departments = this.overlayStore.departments;

  registerForm = this.fb.group({
    fullName: ['', Validators.required],
    employeeId: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    department: ['', Validators.required],
    jobTitle: ['', Validators.required],
    location: ['', Validators.required]
  });

  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid || this.loading()) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const formValue = this.registerForm.value;
    const userData = {
      fullName: formValue.fullName!,
      employeeId: formValue.employeeId!,
      email: formValue.email!,
      password: formValue.password!,
      department: formValue.department!,
      jobTitle: formValue.jobTitle!,
      location: formValue.location!,
      bio: '',
      profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(formValue.fullName!)}&background=random`,
      skills: []
    };

    const result = await this.authService.register(userData);

    this.loading.set(false);

    if (result.success) {
      this.router.navigate(['/']);
    } else {
      this.errorMessage.set(result.message || 'Registration failed');
    }
  }
}
