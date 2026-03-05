import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { OverlayStoreService } from '../../core/services/overlay-store.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule
  ],
  template: `
    <div class="manager-container">
      <h1>Manager Analytics</h1>

      <div class="cards-grid">
        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon">people</mat-icon>
            <mat-card-title>Team Members</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ teamMembers().length }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon">category</mat-icon>
            <mat-card-title>Total Skills</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ totalSkills() }}</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header>
            <mat-icon class="stat-icon">trending_up</mat-icon>
            <mat-card-title>Avg Proficiency</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="stat-value">{{ avgProficiency() }}</div>
          </mat-card-content>
        </mat-card>
      </div>

      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Top Skills in Department</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="topSkills()" class="full-width">
            <ng-container matColumnDef="skill">
              <th mat-header-cell *matHeaderCellDef>Skill</th>
              <td mat-cell *matCellDef="let element">{{ element.name }}</td>
            </ng-container>

            <ng-container matColumnDef="count">
              <th mat-header-cell *matHeaderCellDef>People</th>
              <td mat-cell *matCellDef="let element">{{ element.count }}</td>
            </ng-container>

            <ng-container matColumnDef="avgLevel">
              <th mat-header-cell *matHeaderCellDef>Avg Level</th>
              <td mat-cell *matCellDef="let element">{{ element.avgLevel }}</td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="['skill', 'count', 'avgLevel']"></tr>
            <tr mat-row *matRowDef="let row; columns: ['skill', 'count', 'avgLevel'];"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Trending Skills</mat-card-title>
          <mat-card-subtitle>Skills recently added or updated in the last 30 days</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <p>Chart visualization showing trending skills will appear here using Chart.js</p>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .manager-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 32px;
      font-weight: 400;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    .stat-card mat-card-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .stat-icon {
      font-size: 32px;
      width: 32px;
      height: 32px;
      color: #673ab7;
    }
    .stat-value {
      font-size: 48px;
      font-weight: 300;
      color: #673ab7;
      margin-top: 16px;
    }
    .chart-card {
      margin-bottom: 24px;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class ManagerDashboardComponent {
  private overlayStore = inject(OverlayStoreService);
  private authService = inject(AuthService);

  users = this.overlayStore.users;
  skills = this.overlayStore.skills;

  teamMembers = computed(() => {
    const currentUser = this.authService.currentUser();
    if (!currentUser) return [];

    return this.users().filter(u => u.department === currentUser.department);
  });

  totalSkills = computed(() => {
    const uniqueSkills = new Set<string>();
    this.teamMembers().forEach(member => {
      member.skills.forEach(skill => uniqueSkills.add(skill.skillId));
    });
    return uniqueSkills.size;
  });

  avgProficiency = computed(() => {
    const members = this.teamMembers();
    if (members.length === 0) return '0.0';

    const totalProf = members.reduce((sum, member) => {
      const memberAvg = member.skills.reduce((s, sk) => s + sk.proficiency, 0) / (member.skills.length || 1);
      return sum + memberAvg;
    }, 0);

    return (totalProf / members.length).toFixed(1);
  });

  topSkills = computed(() => {
    const skillMap = new Map<string, { count: number; totalLevel: number }>();

    this.teamMembers().forEach(member => {
      member.skills.forEach(us => {
        const current = skillMap.get(us.skillId) || { count: 0, totalLevel: 0 };
        skillMap.set(us.skillId, {
          count: current.count + 1,
          totalLevel: current.totalLevel + us.proficiency
        });
      });
    });

    return Array.from(skillMap.entries())
      .map(([skillId, data]) => {
        const skill = this.skills().find(s => s.id === skillId);
        return {
          name: skill?.name || skillId,
          count: data.count,
          avgLevel: (data.totalLevel / data.count).toFixed(1)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  });
}
