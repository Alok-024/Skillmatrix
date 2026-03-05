import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
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
    MatProgressSpinnerModule
  ],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Welcome Back</mat-card-title>
          <mat-card-subtitle>Sign in to Corporate Skill Matrix</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Email</mat-label>
              <input matInput
                     type="email"
                     formControlName="email"
                     placeholder="your.email@company.com">
              <mat-icon matPrefix>email</mat-icon>
              @if (loginForm.get('email')?.hasError('required')) {
                <mat-error>Email is required</mat-error>
              }
              @if (loginForm.get('email')?.hasError('email')) {
                <mat-error>Please enter a valid email</mat-error>
              }
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput
                     [type]="hidePassword() ? 'password' : 'text'"
                     formControlName="password"
                     placeholder="Enter your password">
              <mat-icon matPrefix>lock</mat-icon>
              <button mat-icon-button matSuffix type="button"
                      (click)="hidePassword.set(!hidePassword())">
                <mat-icon>{{ hidePassword() ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              @if (loginForm.get('password')?.hasError('required')) {
                <mat-error>Password is required</mat-error>
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
                    [disabled]="loading() || loginForm.invalid">
              @if (loading()) {
                <mat-spinner diameter="20"></mat-spinner>
              } @else {
                Sign In
              }
            </button>

            <div class="demo-accounts">
              <div class="demo-title">Demo Accounts:</div>
              <div class="demo-list">
                <div class="demo-item" (click)="fillDemo('admin@company.com', 'Admin@123')">
                  <strong>Admin:</strong> admin@company.com / Admin@123
                </div>
                <div class="demo-item" (click)="fillDemo('manager@company.com', 'Manager@123')">
                  <strong>Manager:</strong> manager@company.com / Manager@123
                </div>
                <div class="demo-item" (click)="fillDemo('employee@company.com', 'Employee@123')">
                  <strong>Employee:</strong> employee@company.com / Employee@123
                </div>
              </div>
            </div>
          </form>
        </mat-card-content>
        <mat-card-actions>
          <div class="register-link">
            Don't have an account?
            <a routerLink="/auth/register">Register here</a>
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
      max-width: 450px;
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
    .demo-accounts {
      margin-top: 24px;
      padding: 16px;
      background: #f5f5f5;
      border-radius: 8px;
    }
    .demo-title {
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .demo-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .demo-item {
      font-size: 13px;
      padding: 8px;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .demo-item:hover {
      background: #e3f2fd;
    }
    .register-link {
      text-align: center;
      padding: 16px;
      width: 100%;
    }
    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }
    mat-spinner {
      margin: 0 auto;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  hidePassword = signal(true);
  loading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  fillDemo(email: string, password: string): void {
    this.loginForm.patchValue({ email, password });
  }

  // features/auth/login.component.ts
async onSubmit(): Promise<void> {
  if (this.loginForm.invalid || this.loading()) return;

  this.loading.set(true);
  this.errorMessage.set('');

  const email = (this.loginForm.get('email')?.value ?? '').trim().toLowerCase();
  const password = (this.loginForm.get('password')?.value ?? '').trim();

  const result = await this.authService.login(email, password);

  this.loading.set(false);

  if (result.success) {
    this.router.navigate(['/']);
  } else {
    this.errorMessage.set(result.message || 'Login failed');
  }
}
}
