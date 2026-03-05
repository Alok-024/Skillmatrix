import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { debounceTime, distinctUntilChanged, startWith, map } from 'rxjs/operators';
import { toSignal } from '@angular/core/rxjs-interop';
import { OverlayStoreService } from '../../core/services/overlay-store.service';
import { UserCardComponent } from '../../shared/components/user-card.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    MatCardModule,
    UserCardComponent
  ],
  template: `
    <div class="search-container">
      <h1>Talent Discovery</h1>
      <mat-card class="search-filters">
        <mat-card-content>
          <div class="filter-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search by skill</mat-label>
              <input matInput [formControl]="searchControl" placeholder="e.g. Angular, Java, Python">
              <mat-icon matPrefix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Department</mat-label>
              <mat-select [formControl]="departmentControl" multiple>
                @for (dept of departments(); track dept) {
                  <mat-option [value]="dept">{{ dept }}</mat-option>
                }
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline" class="filter-field">
              <mat-label>Min Proficiency</mat-label>
              <mat-select [formControl]="proficiencyControl">
                <mat-option [value]="0">Any</mat-option>
                <mat-option [value]="1">Beginner (1+)</mat-option>
                <mat-option [value]="2">Intermediate (2+)</mat-option>
                <mat-option [value]="3">Advanced (3+)</mat-option>
                <mat-option [value]="4">Expert (4+)</mat-option>
                <mat-option [value]="5">Mentor (5)</mat-option>
              </mat-select>
            </mat-form-field>

            <button mat-raised-button color="primary" (click)="clearFilters()">
              <mat-icon>clear</mat-icon>
              Clear Filters
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="results-info">
        <h2>Results ({{ filteredUsers().length }})</h2>
      </div>

      <div class="results-grid">
        @for (user of paginatedUsers(); track user.id) {
          <app-user-card [user]="user"></app-user-card>
        }
      </div>

      @if (filteredUsers().length > pageSize()) {
        <mat-paginator
          [length]="filteredUsers().length"
          [pageSize]="pageSize()
          "
          [pageSizeOptions]="[12, 24, 48]"
          (page)="onPageChange($event)">
        </mat-paginator>
      }

      @if (filteredUsers().length === 0) {
        <div class="no-results">
          <mat-icon>search_off</mat-icon>
          <h3>No results found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
      font-size: 32px;
      font-weight: 400;
    }
    .search-filters {
      margin-bottom: 24px;
    }
    .filter-row {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .search-field {
      flex: 2;
      min-width: 250px;
    }
    .filter-field {
      flex: 1;
      min-width: 200px;
    }
    .results-info {
      margin: 24px 0 16px;
    }
    .results-info h2 {
      font-size: 24px;
      font-weight: 400;
      margin: 0;
    }
    .results-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }
    mat-paginator {
      background: transparent;
    }
    .no-results {
      text-align: center;
      padding: 64px 20px;
      color: rgba(0,0,0,0.54);
    }
    .no-results mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
    }
  `]
})
export class SearchComponent {
  private overlayStore = inject(OverlayStoreService);

  // ===== Form Controls (unchanged UI) =====
  searchControl = new FormControl('');
  departmentControl = new FormControl<string[]>([]);
  proficiencyControl = new FormControl(0);

  // ===== Turn form controls into signals so computed() re-runs on change =====
  searchTermSig = toSignal(
    this.searchControl.valueChanges.pipe(
      debounceTime(200),
      map(v => (v ?? '').toString().trim().toLowerCase()),
      distinctUntilChanged(),
      startWith('')
    ),
    { initialValue: '' }
  );

  departmentsSig = toSignal(
    this.departmentControl.valueChanges.pipe(
      map(v => (v ?? []) as string[]),
      startWith(this.departmentControl.value ?? [])
    ),
    { initialValue: this.departmentControl.value ?? [] }
  );

  minProfSig = toSignal(
    this.proficiencyControl.valueChanges.pipe(
      map(v => Number(v ?? 0)),
      distinctUntilChanged(),
      startWith(this.proficiencyControl.value ?? 0)
    ),
    { initialValue: this.proficiencyControl.value ?? 0 }
  );

  // ===== Pagination (unchanged) =====
  pageIndex = signal(0);
  pageSize = signal(12);

  // ===== Store signals (unchanged) =====
  users = this.overlayStore.users;
  departments = this.overlayStore.departments;
  skills = this.overlayStore.skills;

  // ===== Filtered users (now reactive to form changes) =====
  filteredUsers = computed(() => {
    const users = this.users();
    const skills = this.skills();

    const searchTerm = this.searchTermSig();
    const selectedDepts = this.departmentsSig();
    const minProf = this.minProfSig();

    return users.filter(user => {
      // Department filter (always applies)
      if (selectedDepts.length > 0 && !selectedDepts.includes(user.department)) {
        return false;
      }

      // Check skills against min proficiency and (optional) search term
      const hasQualifiedSkill = user.skills.some(us => {
        const skillMeta = skills.find(s => s.id === us.skillId);
        const skillNameOrId = (skillMeta?.name ?? us.skillId).toLowerCase();

        const meetsLevel = us.proficiency >= minProf;
        if (!searchTerm) return meetsLevel;

        const matchesSkill = skillNameOrId.includes(searchTerm);
        return meetsLevel && matchesSkill;
      });

      if (!searchTerm) {
        // No text search → pure department + min proficiency filter
        return hasQualifiedSkill;
      }

      // Optional: broaden search to user info (uncomment if you want people-search)
      // const matchesUserInfo =
      //   user.fullName.toLowerCase().includes(searchTerm) ||
      //   user.jobTitle.toLowerCase().includes(searchTerm) ||
      //   user.department.toLowerCase().includes(searchTerm) ||
      //   user.location.toLowerCase().includes(searchTerm) ||
      //   user.email.toLowerCase().includes(searchTerm);

      // return hasQualifiedSkill || matchesUserInfo;

      return hasQualifiedSkill; // keep pure skill-based search as before
    });
  });

  // ===== Paginated slice (unchanged) =====
  paginatedUsers = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredUsers().slice(start, end);
  });

  constructor() {
    // Reset pagination when filters change (unchanged)
    this.searchControl.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => this.pageIndex.set(0));

    this.departmentControl.valueChanges
      .subscribe(() => this.pageIndex.set(0));

    this.proficiencyControl.valueChanges
      .subscribe(() => this.pageIndex.set(0));
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.departmentControl.setValue([]);
    this.proficiencyControl.setValue(0);
    this.pageIndex.set(0);
  }
}
