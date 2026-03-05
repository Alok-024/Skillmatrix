import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../core/services/auth.service';
import { OverlayStoreService } from '../../core/services/overlay-store.service';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSnackBarModule
  ],
  template: `
    <div class="profile-edit-container">
      <h1>Edit Profile</h1>

      <mat-card>
        <mat-card-header>
          <mat-card-title>Profile Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="profileForm">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Bio</mat-label>
              <textarea matInput formControlName="bio" rows="4" placeholder="Tell us about yourself"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Profile Image URL</mat-label>
              <input matInput formControlName="profileImageUrl" placeholder="https://...">
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary" (click)="onSave()" [disabled]="saving()">
                @if (saving()) {
                  <mat-icon>hourglass_empty</mat-icon>
                  Saving...
                } @else {
                  <mat-icon>save</mat-icon>
                  Save Changes
                }
              </button>
              <button mat-button (click)="onCancel()">Cancel</button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="skills-card">
        <mat-card-header>
          <mat-card-title>Skills Management</mat-card-title>
          <mat-card-subtitle>Manage your skills and proficiency levels</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Skills management feature will be available here. You can add, update, and remove skills with proficiency levels from 1-5.</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-edit-container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 32px;
      font-weight: 400;
    }
    mat-card {
      margin-bottom: 24px;
    }
    .full-width {
      width: 100%;
      margin-bottom: 16px;
    }
    .form-actions {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
  `]
})
export class ProfileEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private overlayStore = inject(OverlayStoreService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);

  saving = signal(false);

  profileForm = this.fb.group({
    bio: [''],
    profileImageUrl: ['']
  });

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        bio: user.bio,
        profileImageUrl: user.profileImageUrl
      });
    }
  }

  onSave(): void {
    const user = this.authService.currentUser();
    if (!user) return;

    this.saving.set(true);

    const formValue = this.profileForm.value;
    const updates: Partial<User> = {};
    if (formValue.bio !== null && formValue.bio !== undefined) updates.bio = formValue.bio;
    if (formValue.profileImageUrl !== null && formValue.profileImageUrl !== undefined) updates.profileImageUrl = formValue.profileImageUrl;

    this.overlayStore.updateUserOverride(user.id, updates);

    this.overlayStore.addAuditLogEntry({
      timestamp: new Date().toISOString(),
      userId: user.id,
      action: 'UPDATED_PROFILE',
      detail: 'Updated profile information'
    });

    setTimeout(() => {
      this.saving.set(false);
      this.snackBar.open('Profile updated successfully!', 'Close', { duration: 3000 });
      this.router.navigate(['/profile', user.id]);
    }, 500);
  }

  onCancel(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.router.navigate(['/profile', user.id]);
    }
  }
}
