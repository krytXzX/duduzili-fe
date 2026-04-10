import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroMagnifyingGlass,
  heroUserCircle,
  heroBars3,
  heroChevronRight
} from '@ng-icons/heroicons/outline';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-dashboard-navbar',
  imports: [CommonModule, RouterLink, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroMagnifyingGlass,
      heroUserCircle,
      heroBars3,
      heroChevronRight
    })
  ],
  template: `
    <header class="h-16 bg-black text-white rounded-full flex items-center justify-between px-6 shadow-lg">
      <!-- Left: Logo -->
      <a routerLink="/" class="flex items-center gap-2 group cursor-pointer transition-opacity hover:opacity-90">
        <div class="w-8 h-8 flex items-center justify-center">
          <img ngSrc="assets/images/logo-light-fill.svg" alt="Duduzili" width="24" height="24" class="brightness-0 invert object-contain" />
        </div>
        <span class="text-lg font-bold tracking-tight">Duduzili</span>
      </a>

      <!-- Center: Search -->
      <div class="flex-1 max-w-lg mx-6 group">
        <div class="relative">
          <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <ng-icon name="heroMagnifyingGlass" class="text-white/40 group-focus-within:text-white transition-colors"></ng-icon>
          </div>
          <input 
            type="text" 
            [value]="searchQuery()"
            #dashboardSearchInput
            (input)="updateSearchQuery(dashboardSearchInput.value)"
            (keydown.enter)="runSearch()"
            placeholder="Search..." 
            class="w-full bg-white/10 border-none rounded-full py-2 pl-12 pr-20 text-sm text-white placeholder:text-white/40 focus:ring-0 focus:bg-white/20 transition-all outline-none"
          >
          @if (searchQuery()) {
            <button
              type="button"
              (click)="clearSearch()"
              class="absolute inset-y-0 right-10 flex items-center text-white/30 transition hover:text-white/60"
              aria-label="Clear search"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          }
          <button
            type="button"
            (click)="runSearch()"
            class="absolute inset-y-0 right-3 flex items-center"
            aria-label="Search"
          >
            <div class="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center border border-white/5 transition hover:bg-white/15">
               <ng-icon name="heroChevronRight" class="text-white/60 text-xs"></ng-icon>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-6">
        <button
          type="button"
          (click)="switchToBuyerMode()"
          class="text-xs font-semibold text-white/80 hover:text-white transition-colors tracking-wide hidden sm:block"
        >
          Switch to buyer mode
        </button>
        
        <!-- Profile & Menu Pill -->
        <button class="flex items-center gap-2 bg-white/10 p-1 pr-3 rounded-full hover:bg-white/20 transition-all border border-white/10">
          <div class="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white ring-2 ring-white/10">
            <ng-icon name="heroUserCircle" class="text-lg"></ng-icon>
          </div>
          <ng-icon name="heroBars3" class="text-white/60 text-lg"></ng-icon>
        </button>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardNavbarComponent {
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

  switchToBuyerMode(): void {
    void this.router.navigate(['/buyer']);
  }
}
