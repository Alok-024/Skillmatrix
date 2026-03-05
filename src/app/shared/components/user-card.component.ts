import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { User } from '../../core/models';
import { OverlayStoreService } from '../../core/services/overlay-store.service';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  template: `
    <mat-card class="user-card" (click)="navigateToProfile()">
      <mat-card-header>
        <img [src]="user.profileImageUrl"
             [alt]="user.fullName"
             class="profile-image"
             mat-card-avatar
             (error)="onImageError($event)">
        <mat-card-title>{{ user.fullName }}</mat-card-title>
        <mat-card-subtitle>{{ user.jobTitle }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <div class="info-row">
          <mat-icon class="info-icon">business</mat-icon>
          <span>{{ user.department }}</span>
        </div>
        <div class="info-row">
          <mat-icon class="info-icon">location_on</mat-icon>
          <span>{{ user.location }}</span>
        </div>
        <div class="skills-section">
          <div class="skills-label">Top Skills:</div>
          <div class="skills-list">
            @for (userSkill of topSkills; track userSkill.skillId) {
              <mat-chip class="skill-chip">
                {{ getSkillName(userSkill.skillId) }}
                <span class="proficiency">Lvl {{ userSkill.proficiency }}</span>
              </mat-chip>
            }
          </div>
        </div>
      </mat-card-content>
      <mat-card-actions>
        <button mat-button color="primary">
          <mat-icon>person</mat-icon>
          View Profile
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .user-card {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .user-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .profile-image {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: cover;
    }
    mat-card-content {
      flex: 1;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 8px 0;
      font-size: 0.9em;
    }
    .info-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: rgba(0,0,0,0.54);
    }
    .skills-section {
      margin-top: 16px;
    }
    .skills-label {
      font-weight: 500;
      margin-bottom: 8px;
      font-size: 0.9em;
    }
    .skills-list {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
    .skill-chip {
      font-size: 0.85em;
      min-height: 28px;
    }
    .proficiency {
      margin-left: 4px;
      opacity: 0.7;
    }
    mat-card-actions {
      padding: 8px 16px;
    }
  `]
})
export class UserCardComponent {
  private router = inject(Router);
  private overlayStore = inject(OverlayStoreService);

  @Input() user!: User;

  get topSkills() {
    return this.user.skills
      .sort((a, b) => b.proficiency - a.proficiency)
      .slice(0, 3);
  }

  getSkillName(skillId: string): string {
    const skill = this.overlayStore.skills().find(s => s.id === skillId);
    return skill?.name || skillId;
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile', this.user.id]);
  }

  onImageError(event: any): void {
    event.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(this.user.fullName)}&background=random`;
  }
}
