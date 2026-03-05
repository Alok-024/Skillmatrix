import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { OverlayStoreService } from '../../core/services/overlay-store.service';
import { AuthService } from '../../core/services/auth.service';
import { Skill, UserSkill } from '../../core/models';

@Component({
  selector: 'app-skill-chip',
  standalone: true,
  imports: [CommonModule, MatChipsModule, MatIconModule, MatTooltipModule, MatButtonModule],
  template: `
    <mat-chip class="skill-chip" [class.interactive]="showActions">
      <div class="skill-content">
        <span class="skill-name">{{ skillName }}</span>

        @if (showProficiency && userSkill) {
          <span class="proficiency">Lvl {{ userSkill.proficiency }}</span>
        }

        @if (showEndorsements && endorsementCount() > 0) {
          <span
            class="endorsement-badge"
            [matTooltip]="endorsementTooltip()"
            matTooltipClass="endorsement-tooltip">
            <mat-icon class="small-icon" fontSet="material-icons">thumb_up</mat-icon>
            {{ endorsementCount() }}
          </span>
        }

        @if (showVouches && vouchCount() > 0) {
          <span
            class="vouch-badge"
            [matTooltip]="vouchTooltip()"
            matTooltipClass="vouch-tooltip">
            <mat-icon class="small-icon" fontSet="material-icons">verified</mat-icon>
            {{ vouchCount() }}
          </span>
        }
      </div>

      @if (showActions && canEndorse()) {
        <button mat-icon-button (click)="onEndorse()" class="action-btn" aria-label="Endorse">
          <mat-icon class="small-icon" fontSet="material-icons">thumb_up</mat-icon>
        </button>
      }

      @if (showActions && canVouch()) {
        <button mat-icon-button (click)="onVouch()" class="action-btn" aria-label="Vouch">
          <mat-icon class="small-icon" fontSet="material-icons">verified</mat-icon>
        </button>
      }
    </mat-chip>
  `,
  styles: [`
    .skill-chip {
      margin: 4px;
      padding: 0 6px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      max-width: 100%;
    }

    .skill-content {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0; /* allows child text to truncate */
    }

    .skill-name {
      font-weight: 500;
      max-width: 180px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .proficiency {
      font-size: 12px;
      line-height: 1;
      color: rgba(0,0,0,0.65);
      padding: 2px 6px;
      border-radius: 10px;
      background: #f1f3f4; /* subtle grey pill */
    }

    .endorsement-badge, .vouch-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      line-height: 1;
      padding: 2px 6px;
      border-radius: 10px;
    }

    .endorsement-badge {
      background: #eef7ff;  /* light blue */
      color: #1565c0;       /* blue text */
    }

    .vouch-badge {
      background: #e9f7ef;  /* light green */
      color: #2e7d32;       /* green text */
    }

    .small-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      line-height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      vertical-align: middle;
    }

    .action-btn {
      width: 28px;
      height: 28px;
      line-height: 28px;
      min-width: 28px;
      min-height: 28px;
      padding: 0;
    }

    .action-btn:hover mat-icon {
      color: #673ab7; /* subtle hover affordance */
    }

    .interactive {
      cursor: pointer;
    }

    /* Optional: more legible tooltips */
    .endorsement-tooltip, .vouch-tooltip {
      font-size: 12px !important;
      line-height: 1.3 !important;
    }
  `]
})
export class SkillChipComponent {
  private overlayStore = inject(OverlayStoreService);
  private authService = inject(AuthService);

  @Input() skill!: Skill;
  @Input() userSkill?: UserSkill;
  @Input() targetUserId?: string;

  @Input() showProficiency = false;
  @Input() showEndorsements = false;
  @Input() showVouches = false;
  @Input() showActions = false;

  @Output() endorse = new EventEmitter<void>();
  @Output() vouch = new EventEmitter<void>();

  get skillName(): string {
    return this.skill.name;
  }

  endorsementCount = computed(() => {
    if (!this.targetUserId) return 0;
    return this.overlayStore.getEndorsementsForUserSkill(this.targetUserId, this.skill.id).length;
  });

  vouchCount = computed(() => {
    if (!this.targetUserId) return 0;
    return this.overlayStore.getVouchesForUserSkill(this.targetUserId, this.skill.id).length;
  });

  endorsementTooltip = computed(() => {
    if (!this.targetUserId) return '';
    const endorsements = this.overlayStore.getEndorsementsForUserSkill(this.targetUserId, this.skill.id);
    const users = this.overlayStore.users();
    const names = endorsements.map(e => {
      const user = users.find(u => u.id === e.endorserId);
      return user?.fullName || 'Unknown';
    });
    return names.length > 0 ? `Endorsed by: ${names.join(', ')}` : '';
  });

  vouchTooltip = computed(() => {
    if (!this.targetUserId) return '';
    const vouches = this.overlayStore.getVouchesForUserSkill(this.targetUserId, this.skill.id);
    const users = this.overlayStore.users();
    const names = vouches.map(v => {
      const user = users.find(u => u.id === v.voucherId);
      return user?.fullName || 'Unknown';
    });
    return names.length > 0 ? `Vouched by: ${names.join(', ')}` : '';
  });

  canEndorse(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.targetUserId) return false;
    if (currentUser.id === this.targetUserId) return false;

    const endorsements = this.overlayStore.getEndorsementsForUserSkill(this.targetUserId, this.skill.id);
    return !endorsements.some(e => e.endorserId === currentUser.id);
  }

  canVouch(): boolean {
    const currentUser = this.authService.currentUser();
    if (!currentUser || !this.targetUserId) return false;
    if (currentUser.id === this.targetUserId) return false;

    const vouches = this.overlayStore.getVouchesForUserSkill(this.targetUserId, this.skill.id);
    return !vouches.some(v => v.voucherId === currentUser.id);
  }

  onEndorse(): void {
    this.endorse.emit();
  }

  onVouch(): void {
    this.vouch.emit();
  }
}