import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
      },
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent)
      },
      {
        path: 'profile/:id',
        loadComponent: () => import('./features/profile/profile-view.component').then(m => m.ProfileViewComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile-edit.component').then(m => m.ProfileEditComponent)
      },
      {
        path: 'manager',
        canActivate: [roleGuard],
        data: { roles: ['MANAGER', 'ADMIN'] },
        loadComponent: () => import('./features/manager/manager-dashboard.component').then(m => m.ManagerDashboardComponent)
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () => import('./features/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
