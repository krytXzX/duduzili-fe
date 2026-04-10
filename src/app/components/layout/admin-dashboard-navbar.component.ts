import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroBars3,
  heroChevronRight,
  heroMagnifyingGlass,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard-navbar',
  imports: [RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroBars3,
      heroChevronRight,
      heroMagnifyingGlass,
      heroUserCircle,
    }),
  ],
  template: `
    <header class="flex h-16 items-center justify-between rounded-full bg-black px-6 text-white shadow-lg">
      <a routerLink="/" class="flex items-center gap-2 transition-opacity hover:opacity-90">
        <div class="flex h-8 w-8 items-center justify-center">
          <img
            ngSrc="assets/images/logo-light-fill.svg"
            alt="Duduzili"
            width="24"
            height="24"
            priority
            class="brightness-0 invert object-contain"
          />
        </div>
        <span class="text-lg font-bold tracking-tight">Duduzili</span>
      </a>

      <div class="mx-6 flex max-w-lg flex-1 group">
        <div class="relative w-full">
          <div class="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <ng-icon
              name="heroMagnifyingGlass"
              class="text-white/40 transition-colors group-focus-within:text-white"
            ></ng-icon>
          </div>

          <input
            type="text"
            placeholder="Search..."
            [value]="searchQuery()"
            #adminSearchInput
            (input)="updateSearchQuery(adminSearchInput.value)"
            (keydown.enter)="runSearch()"
            class="w-full rounded-full border-none bg-white/10 py-2 pl-12 pr-20 text-sm text-white outline-none transition-all placeholder:text-white/40 focus:bg-white/20 focus:ring-0"
          />

          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute inset-y-0 right-10 flex items-center text-white/30 transition hover:text-white/60"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          }

          <button
            type="button"
            (click)="runSearch()"
            class="absolute inset-y-0 right-3 flex items-center"
            aria-label="Search"
          >
            <div class="flex h-6 w-6 items-center justify-center rounded-lg border border-white/5 bg-white/10">
              <ng-icon name="heroChevronRight" class="text-xs text-white/60"></ng-icon>
            </div>
          </button>
        </div>
      </div>

      <button
        type="button"
        class="flex items-center gap-2 rounded-full border border-white/10 bg-white p-1 pr-3 text-[#1A1C21] transition hover:bg-white/95"
        aria-label="Admin menu"
      >
        <span class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-purple-600 text-white ring-2 ring-white/10">
          <ng-icon name="heroUserCircle" class="text-lg"></ng-icon>
        </span>
        <ng-icon name="heroBars3" class="text-lg text-[#6883B2]"></ng-icon>
      </button>
    </header>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardNavbarComponent {
  private readonly router = inject(Router);

  readonly searchQuery = signal('');

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  runSearch(): void {
    const query = this.searchQuery().trim() || 'iPhone';
    void this.router.navigate(['/category'], { queryParams: { q: query } });
  }
}
