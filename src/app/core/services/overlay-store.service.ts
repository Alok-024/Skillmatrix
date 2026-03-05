import { Injectable, inject, signal, computed } from '@angular/core';
import { User, Skill, Endorsement, Vouch, AuditLogEntry, SessionInfo } from '../models';
import { DataService } from './data.service';
import { firstValueFrom } from 'rxjs';

const STORAGE_KEYS = {
  CURRENT_USER: 'sm_currentUser',
  USERS_OVERRIDES: 'sm_users_overrides',
  ENDORSEMENTS: 'sm_endorsements',
  VOUCHES: 'sm_vouches',
  AUDIT_LOG_OVERRIDES: 'sm_audit_log_overrides',
  ADMIN_CHANGES: 'sm_admin_changes',
  REGISTRATIONS: 'sm_registrations'
};

export interface AdminChanges {
  skillsAdded: Skill[];
  skillsRemoved: string[];
  skillsUpdated: Skill[];
  deactivatedUsers: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OverlayStoreService {
  private dataService = inject(DataService);

  private baseUsers = signal<User[]>([]);
  private baseSkills = signal<Skill[]>([]);
  private baseDepartments = signal<string[]>([]);
  private baseAuditLog = signal<AuditLogEntry[]>([]);

  private usersOverrides = signal<Record<string, Partial<User>>>({});
  private endorsements = signal<Endorsement[]>([]);
  private vouches = signal<Vouch[]>([]);
  private auditLogOverrides = signal<AuditLogEntry[]>([]);
  private adminChanges = signal<AdminChanges>({
    skillsAdded: [],
    skillsRemoved: [],
    skillsUpdated: [],
    deactivatedUsers: []
  });
  private registrations = signal<User[]>([]);

  users = computed(() => {
    const base = this.baseUsers();
    const overrides = this.usersOverrides();
    const registered = this.registrations();
    const deactivated = this.adminChanges().deactivatedUsers;

    const allUsers = [...base, ...registered];

    return allUsers
      .map(user => {
        const override = overrides[user.id];
        return override ? { ...user, ...override } : user;
      })
      .filter(user => !deactivated.includes(user.id));
  });

  skills = computed(() => {
    const base = this.baseSkills();
    const changes = this.adminChanges();

    let result = [...base, ...changes.skillsAdded];
    result = result.filter(skill => !changes.skillsRemoved.includes(skill.id));

    result = result.map(skill => {
      const update = changes.skillsUpdated.find(s => s.id === skill.id);
      return update || skill;
    });

    return result;
  });

  departments = computed(() => this.baseDepartments());

  auditLog = computed(() => {
    return [...this.baseAuditLog(), ...this.auditLogOverrides()];
  });

 
  private _ready = signal(false);
  ready = computed(() => this._ready());

  async initialize(): Promise<void> {
    try {
      const data = await firstValueFrom(this.dataService.loadAll());
      if (data) {
        this.baseUsers.set(data.users ?? []);
        this.baseSkills.set(data.skills ?? []);
        this.baseDepartments.set(data.departments ?? []);
        this.baseAuditLog.set(data.auditLog ?? []);
      }
    } catch (err) {
      console.error('[OverlayStoreService.initialize] loadAll() failed', err);
    } finally {
      this.loadFromStorage();
      this._ready.set(true);
    }
  }


  private loadFromStorage(): void {
    const overrides = this.getFromStorage<Record<string, Partial<User>>>(STORAGE_KEYS.USERS_OVERRIDES);
    if (overrides) this.usersOverrides.set(overrides);

    const endorsements = this.getFromStorage<Endorsement[]>(STORAGE_KEYS.ENDORSEMENTS);
    if (endorsements) this.endorsements.set(endorsements);

    const vouches = this.getFromStorage<Vouch[]>(STORAGE_KEYS.VOUCHES);
    if (vouches) this.vouches.set(vouches);

    const auditOverrides = this.getFromStorage<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOG_OVERRIDES);
    if (auditOverrides) this.auditLogOverrides.set(auditOverrides);

    const adminChanges = this.getFromStorage<AdminChanges>(STORAGE_KEYS.ADMIN_CHANGES);
    if (adminChanges) this.adminChanges.set(adminChanges);

    const registrations = this.getFromStorage<User[]>(STORAGE_KEYS.REGISTRATIONS);
    if (registrations) this.registrations.set(registrations);
  }

  updateUserOverride(userId: string, override: Partial<User>): void {
    const current = this.usersOverrides();
    const updated = {
      ...current,
      [userId]: { ...(current[userId] || {}), ...override }
    };
    this.usersOverrides.set(updated);
    this.saveToStorage(STORAGE_KEYS.USERS_OVERRIDES, updated);
  }

  addEndorsement(endorsement: Endorsement): void {
    const current = this.endorsements();
    const exists = current.some(
      e => e.endorserId === endorsement.endorserId &&
           e.targetUserId === endorsement.targetUserId &&
           e.skillId === endorsement.skillId
    );

    if (!exists) {
      const updated = [...current, endorsement];
      this.endorsements.set(updated);
      this.saveToStorage(STORAGE_KEYS.ENDORSEMENTS, updated);
    }
  }

  addVouch(vouch: Vouch): void {
    const current = this.vouches();
    const exists = current.some(
      v => v.voucherId === vouch.voucherId &&
           v.targetUserId === vouch.targetUserId &&
           v.skillId === vouch.skillId
    );

    if (!exists) {
      const updated = [...current, vouch];
      this.vouches.set(updated);
      this.saveToStorage(STORAGE_KEYS.VOUCHES, updated);
    }
  }

  getEndorsementsForUserSkill(userId: string, skillId: string): Endorsement[] {
    return this.endorsements().filter(
      e => e.targetUserId === userId && e.skillId === skillId
    );
  }

  getVouchesForUserSkill(userId: string, skillId: string): Vouch[] {
    return this.vouches().filter(
      v => v.targetUserId === userId && v.skillId === skillId
    );
  }

  addAuditLogEntry(entry: AuditLogEntry): void {
    const current = this.auditLogOverrides();
    const updated = [entry, ...current];
    this.auditLogOverrides.set(updated);
    this.saveToStorage(STORAGE_KEYS.AUDIT_LOG_OVERRIDES, updated);
  }

  updateAdminChanges(changes: Partial<AdminChanges>): void {
    const current = this.adminChanges();
    const updated = { ...current, ...changes };
    this.adminChanges.set(updated);
    this.saveToStorage(STORAGE_KEYS.ADMIN_CHANGES, updated);
  }

  registerNewUser(user: User): void {
    const current = this.registrations();
    const updated = [...current, user];
    this.registrations.set(updated);
    this.saveToStorage(STORAGE_KEYS.REGISTRATIONS, updated);
  }

  private getFromStorage<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }
}
