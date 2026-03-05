import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { OverlayStoreService } from './overlay-store.service';
import { User, SessionInfo } from '../models';

const SESSION_KEY = 'sm_currentUser';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private overlayStore = inject(OverlayStoreService);

  private currentSession = signal<SessionInfo | null>(null);

  isAuthenticated = computed(() => {
    const session = this.currentSession();
    if (!session) return false;

    return Date.now() < session.expiresAt;
  });

  currentUser = computed(() => {
    const session = this.currentSession();
    if (!session || !this.isAuthenticated()) return null;

    return this.overlayStore.users().find(u => u.id === session.userId) || null;
  });

  hasRole(role: string): boolean {
    const session = this.currentSession();
    return session?.roles.includes(role as any) || false;
  }

  async initialize(): Promise<void> {
    const storedSession = this.getStoredSession();
    if (storedSession && Date.now() < storedSession.expiresAt) {
      this.currentSession.set(storedSession);
    } else {
      this.clearSession();
    }
  }

  // core/services/auth.service.ts
async login(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  // Normalize form inputs
  
  console.log('[login] input email:', email, 'password len:', (password ?? '').length);
  console.log('[login] users length:', this.overlayStore.users()?.length)


  const e = (email ?? '').trim().toLowerCase();
  const p = (password ?? '').trim();

  const users = this.overlayStore.users();

  // Defensive: avoid generic 'Invalid' if store is empty/unready
  if (!users || users.length === 0) {
    return { success: false, message: 'User store not initialized yet. Please refresh and try again.' };
  }

  const user = users.find(u =>
    (u.email ?? '').trim().toLowerCase() === e &&
    (u.password ?? '').trim() === p
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password' };
  }

  const session: SessionInfo = {
    userId: user.id,
    roles: user.roles,
    issuedAt: Date.now(),
    expiresAt: Date.now() + 24 * 60 * 60 * 1000
  };

  this.currentSession.set(session);
  this.saveSession(session);
  return { success: true };
}

  async register(userData: Omit<User, 'id' | 'roles'>): Promise<{ success: boolean; message?: string }> {
    const users = this.overlayStore.users();
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
      return { success: false, message: 'Email already exists' };
    }

    const newUser: User = {
      ...userData,
      id: `u-reg-${Date.now()}`,
      roles: ['EMPLOYEE']
    };

    this.overlayStore.registerNewUser(newUser);

    const session: SessionInfo = {
      userId: newUser.id,
      roles: newUser.roles,
      issuedAt: Date.now(),
      expiresAt: Date.now() + SESSION_DURATION
    };

    this.currentSession.set(session);
    this.saveSession(session);

    return { success: true };
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private saveSession(session: SessionInfo): void {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      console.error('Failed to save session', error);
    }
  }

  private getStoredSession(): SessionInfo | null {
    try {
      const item = localStorage.getItem(SESSION_KEY);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private clearSession(): void {
    this.currentSession.set(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear session', error);
    }
  }
}
