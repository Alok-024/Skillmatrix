import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { User, Skill, AuditLogEntry } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  private baseUsersCache$?: Observable<User[]>;
  private skillsCache$?: Observable<Skill[]>;
  private departmentsCache$?: Observable<string[]>;
  private auditLogCache$?: Observable<AuditLogEntry[]>;

  loadBaseUsers(): Observable<User[]> {
    if (!this.baseUsersCache$) {
      this.baseUsersCache$ = this.http.get<User[]>('assets/data/users.json').pipe(
        catchError(err => {
          console.error('[DataService] users.json failed', err);
          return of([] as User[]);
        }),
        shareReplay(1)
      );
    }
    return this.baseUsersCache$;
  }

  loadSkills(): Observable<Skill[]> {
    if (!this.skillsCache$) {
      this.skillsCache$ = this.http.get<Skill[]>('assets/data/skills.json').pipe(
        catchError(err => {
          console.error('[DataService] skills.json failed', err);
          return of([] as Skill[]);
        }),
        shareReplay(1)
      );
    }
    return this.skillsCache$;
  }

  loadDepartments(): Observable<string[]> {
    if (!this.departmentsCache$) {
      this.departmentsCache$ = this.http.get<string[]>('assets/data/departments.json').pipe(
        catchError(err => {
          console.error('[DataService] departments.json failed', err);
          return of([] as string[]);
        }),
        shareReplay(1)
      );
    }
    return this.departmentsCache$;
  }

  loadAuditLog(): Observable<AuditLogEntry[]> {
    if (!this.auditLogCache$) {
      this.auditLogCache$ = this.http.get<AuditLogEntry[]>('assets/data/audit-log.json').pipe(
        catchError(err => {
          console.error('[DataService] audit-log.json failed', err);
          return of([] as AuditLogEntry[]);
        }),
        shareReplay(1)
      );
    }
    return this.auditLogCache$;
  }

  loadAll(): Observable<{
    users: User[];
    skills: Skill[];
    departments: string[];
    auditLog: AuditLogEntry[];
  }> {
    return forkJoin({
      users: this.loadBaseUsers(),
      skills: this.loadSkills(),
      departments: this.loadDepartments(),
      auditLog: this.loadAuditLog()
    });
  }

  /**
   * (Optional) Call this if you want to force-refresh caches after data changes.
   */
  clearCaches(): void {
    this.baseUsersCache$ = undefined;
    this.skillsCache$ = undefined;
    this.departmentsCache$ = undefined;
    this.auditLogCache$ = undefined;
  }
}
