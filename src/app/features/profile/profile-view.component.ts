import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { OverlayStoreService } from '../../core/services/overlay-store.service';
import { AuthService } from '../../core/services/auth.service';
import { SkillChipComponent } from '../../shared/components/skill-chip.component';
import { User } from '../../core/models';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    SkillChipComponent
  ],
  template: `
    @if (user()) {
      <div class="profile-container">
        <mat-card class="profile-header">
          <img [src]="user()!.profileImageUrl"
               [alt]="user()!.fullName"
               class="profile-image"
               (error)="onImageError($event)">
          <div class="header-info">
            <h1>{{ user()!.fullName }}</h1>
            <div class="subtitle">{{ user()!.jobTitle }} • {{ user()!.department }}</div>
            <div class="meta-info">
              <span><mat-icon>badge</mat-icon> {{ user()!.employeeId }}</span>
              <span><mat-icon>location_on</mat-icon> {{ user()!.location }}</span>
              <span><mat-icon>email</mat-icon> {{ user()!.email }}</span>
            </div>
            @if (isOwnProfile()) {
              <button mat-raised-button color="primary" [routerLink]="['/profile']">
                <mat-icon>edit</mat-icon>
                Edit Profile
              </button>
            }
          </div>
        </mat-card>

        <mat-card class="bio-card">
          <mat-card-header>
            <mat-card-title>About</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <p>{{ user()!.bio || 'No bio available.' }}</p>
          </mat-card-content>
        </mat-card>

        <mat-card class="skills-card">
          <mat-card-header>
            <mat-card-title>Skills</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="skills-list">
              @for (userSkill of user()!.skills; track userSkill.skillId) {
                <app-skill-chip
                  [skill]="getSkill(userSkill.skillId)!"
                  [userSkill]="userSkill"
                  [targetUserId]="user()!.id"
                  [showProficiency]="true"
                  [showEndorsements]="true"
                  [showVouches]="true"
                  [showActions]="!isOwnProfile()"
                  (endorse)="onEndorse(userSkill.skillId)"
                  (vouch)="onVouch(userSkill.skillId)">
                </app-skill-chip>
              }
            </div>
            @if (user()!.skills.length === 0) {
              <p class="empty-message">No skills added yet.</p>
            }
          </mat-card-content>
        </mat-card>
      </div>
    } @else {
      <div class="error-message">
        <mat-icon>error</mat-icon>
        <h2>User not found</h2>
        <button mat-raised-button color="primary" routerLink="/">
          Back to Search
        </button>
      </div>
    }
  `,
  styles: [`
    .profile-container {
      max-width: 1000px;
      margin: 0 auto;
    }
    .profile-header {
      display: flex;
      gap: 32px;
      padding: 32px;
      margin-bottom: 24px;
    }
    .profile-image {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      object-fit: cover;
    }
    .header-info {
      flex: 1;
    }
    .header-info h1 {
      margin: 0 0 8px 0;
      font-size: 32px;
      font-weight: 400;
    }
    .subtitle {
      font-size: 18px;
      color: rgba(0,0,0,0.6);
      margin-bottom: 16px;
    }
    .meta-info {
      display: flex;
      gap: 24px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .meta-info span {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }
    .meta-info mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: rgba(0,0,0,0.54);
    }
    .bio-card, .skills-card {
      margin-bottom: 24px;
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .empty-message {
      color: rgba(0,0,0,0.54);
      font-style: italic;
    }
    .error-message {
      text-align: center;
      padding: 64px 20px;
    }
    .error-message mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #f44336;
    }
  `]
})
export class ProfileViewComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private overlayStore = inject(OverlayStoreService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);

  user = signal<User | null>(null);

  isOwnProfile = computed(() => {
    const current = this.authService.currentUser();
    return current?.id === this.user()?.id;
  });

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      const foundUser = this.overlayStore.users().find(u => u.id === userId);
      if (foundUser) {
        this.user.set(foundUser);
      }
    }
  }

  getSkill(skillId: string) {
    return this.overlayStore.skills().find(s => s.id === skillId);
  }

  onEndorse(skillId: string): void {
    const currentUser = this.authService.currentUser();
    const targetUser = this.user();

    if (!currentUser || !targetUser) return;

    this.overlayStore.addEndorsement({
      endorserId: currentUser.id,
      targetUserId: targetUser.id,
      skillId,
      timestamp: Date.now()
    });

    this.snackBar.open('Skill endorsed successfully!', 'Close', { duration: 3000 });
  }

  onVouch(skillId: string): void {
    const currentUser = this.authService.currentUser();
    const targetUser = this.user();

    if (!currentUser || !targetUser) return;

    this.overlayStore.addVouch({
      voucherId: currentUser.id,
      targetUserId: targetUser.id,
      skillId,
      timestamp: Date.now()
    });

    this.snackBar.open('Skill vouched successfully!', 'Close', { duration: 3000 });
  }

  onImageError(event: any): void {
    const user = this.user();
    if (user) {
      event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`;
    }
  }
}
