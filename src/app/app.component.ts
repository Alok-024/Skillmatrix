import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { filter } from 'rxjs/operators';
import { AuthService } from './core/services/auth.service';
import { OverlayStoreService } from './core/services/overlay-store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule
  ],
  template: `
    @if (showLayout()) {
      <mat-sidenav-container class="sidenav-container">
        <mat-sidenav #sidenav mode="side" [opened]="sidenavOpened()" class="sidenav">
          <div class="sidenav-header">
            <h2>Skill Matrix</h2>
          </div>
          <mat-nav-list>
            <a mat-list-item routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
              <mat-icon matListItemIcon>search</mat-icon>
              <span matListItemTitle>Search Talent</span>
            </a>
            <a mat-list-item [routerLink]="['/profile']" routerLinkActive="active">
              <mat-icon matListItemIcon>person</mat-icon>
              <span matListItemTitle>My Profile</span>
            </a>
            @if (hasManagerRole()) {
              <mat-divider></mat-divider>
              <a mat-list-item routerLink="/manager" routerLinkActive="active">
                <mat-icon matListItemIcon>analytics</mat-icon>
                <span matListItemTitle>Manager Analytics</span>
              </a>
            }
            @if (hasAdminRole()) {
              <mat-divider></mat-divider>
              <a mat-list-item routerLink="/admin" routerLinkActive="active">
                <mat-icon matListItemIcon>admin_panel_settings</mat-icon>
                <span matListItemTitle>Admin Dashboard</span>
              </a>
            }
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar color="primary" class="toolbar">
            <button mat-icon-button (click)="toggleSidenav()">
              <mat-icon>menu</mat-icon>
            </button>
            <span class="toolbar-title">Corporate Skill Matrix</span>
            <span class="spacer"></span>
            @if (currentUser()) {
              <button mat-button [matMenuTriggerFor]="userMenu">
                <mat-icon>account_circle</mat-icon>
                {{ currentUser()?.fullName }}
              </button>
              <mat-menu #userMenu="matMenu">
                <button mat-menu-item [routerLink]="['/profile']">
                  <mat-icon>person</mat-icon>
                  My Profile
                </button>
                <button mat-menu-item (click)="logout()">
                  <mat-icon>logout</mat-icon>
                  Logout
                </button>
              </mat-menu>
            }
          </mat-toolbar>
          <div class="content">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: [`
    .sidenav-container {
      height: 100vh;
    }
    .sidenav {
      width: 260px;
      background: #f5f5f5;
    }
    .sidenav-header {
      padding: 20px;
      background: #673ab7;
      color: white;
    }
    .sidenav-header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    .toolbar-title {
      font-size: 20px;
      font-weight: 500;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .content {
      padding: 24px;
      min-height: calc(100vh - 64px);
      background: #fafafa;
    }
    mat-nav-list a {
      margin: 4px 8px;
      border-radius: 4px;
    }
    mat-nav-list a.active {
      background: rgba(103, 58, 183, 0.1);
      color: #673ab7;
    }
  `]
})
export class AppComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private overlayStore = inject(OverlayStoreService);

  sidenavOpened = signal(true);
  showLayout = signal(false);

  currentUser = this.authService.currentUser;

  hasManagerRole = computed(() => {
    const user = this.currentUser();
    return user?.roles.includes('MANAGER') || user?.roles.includes('ADMIN');
  });

  hasAdminRole = computed(() => {
    const user = this.currentUser();
    return user?.roles.includes('ADMIN');
  });

  ngOnInit(): void {
    this.initializeApp();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.showLayout.set(!event.url.startsWith('/auth'));
    });

    this.showLayout.set(!this.router.url.startsWith('/auth'));
  }

  private async initializeApp(): Promise<void> {
    
    await this.authService.initialize();
  }

  toggleSidenav(): void {
    this.sidenavOpened.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
