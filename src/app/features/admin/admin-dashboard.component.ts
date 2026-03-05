import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { OverlayStoreService } from '../../core/services/overlay-store.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="admin-container">
      <h1>Admin Dashboard</h1>

      <mat-tab-group>
        <mat-tab label="Overview">
          <div class="tab-content">
            <div class="stats-grid">
              <mat-card class="stat-card">
                <mat-card-header>
                  <mat-icon class="stat-icon">people</mat-icon>
                  <mat-card-title>Total Users</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stat-value">{{ users().length }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-header>
                  <mat-icon class="stat-icon">category</mat-icon>
                  <mat-card-title>Total Skills</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stat-value">{{ skills().length }}</div>
                </mat-card-content>
              </mat-card>

              <mat-card class="stat-card">
                <mat-card-header>
                  <mat-icon class="stat-icon">business</mat-icon>
                  <mat-card-title>Departments</mat-card-title>
                </mat-card-header>
                <mat-card-content>
                  <div class="stat-value">{{ departments().length }}</div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Skills Management">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Skill Library</mat-card-title>
                <button mat-raised-button color="primary">
                  <mat-icon>add</mat-icon>
                  Add New Skill
                </button>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="skills()" class="full-width">
                  <ng-container matColumnDef="name">
                    <th mat-header-cell *matHeaderCellDef>Skill Name</th>
                    <td mat-cell *matCellDef="let skill">{{ skill.name }}</td>
                  </ng-container>

                  <ng-container matColumnDef="category">
                    <th mat-header-cell *matHeaderCellDef>Category</th>
                    <td mat-cell *matCellDef="let skill">{{ skill.category }}</td>
                  </ng-container>

                  <ng-container matColumnDef="actions">
                    <th mat-header-cell *matHeaderCellDef>Actions</th>
                    <td mat-cell *matCellDef="let skill">
                      <button mat-icon-button>
                        <mat-icon>edit</mat-icon>
                      </button>
                      <button mat-icon-button color="warn">
                        <mat-icon>delete</mat-icon>
                      </button>
                    </td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['name', 'category', 'actions']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['name', 'category', 'actions'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Users">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>User Management</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <p>Total Active Users: {{ users().length }}</p>
                <p>Users can be managed here - deactivate accounts, view user details, etc.</p>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <mat-tab label="Audit Log">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Recent Activity</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="auditLog().slice(0, 20)" class="full-width">
                  <ng-container matColumnDef="timestamp">
                    <th mat-header-cell *matHeaderCellDef>Timestamp</th>
                    <td mat-cell *matCellDef="let entry">{{ entry.timestamp | date:'short' }}</td>
                  </ng-container>

                  <ng-container matColumnDef="user">
                    <th mat-header-cell *matHeaderCellDef>User</th>
                    <td mat-cell *matCellDef="let entry">{{ getUserName(entry.userId) }}</td>
                  </ng-container>

                  <ng-container matColumnDef="action">
                    <th mat-header-cell *matHeaderCellDef>Action</th>
                    <td mat-cell *matCellDef="let entry">{{ entry.action }}</td>
                  </ng-container>

                  <ng-container matColumnDef="detail">
                    <th mat-header-cell *matHeaderCellDef>Detail</th>
                    <td mat-cell *matCellDef="let entry">{{ entry.detail }}</td>
                  </ng-container>

                  <tr mat-header-row *matHeaderRowDef="['timestamp', 'user', 'action', 'detail']"></tr>
                  <tr mat-row *matRowDef="let row; columns: ['timestamp', 'user', 'action', 'detail'];"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .admin-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 32px;
      font-weight: 400;
    }
    .tab-content {
      padding: 24px 0;
    }
    .stats-grid {
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
    mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .full-width {
      width: 100%;
    }
  `]
})
export class AdminDashboardComponent {
  private overlayStore = inject(OverlayStoreService);

  users = this.overlayStore.users;
  skills = this.overlayStore.skills;
  departments = this.overlayStore.departments;
  auditLog = this.overlayStore.auditLog;

  getUserName(userId: string): string {
    const user = this.users().find(u => u.id === userId);
    return user?.fullName || 'Unknown';
  }
}
