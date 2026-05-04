import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminDashboardNavbarComponent } from './admin-dashboard-navbar.component';
import { AdminDashboardSidebarComponent } from './admin-dashboard-sidebar.component';

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [
    RouterLink,
    RouterOutlet,
    NgOptimizedImage,
    AdminDashboardNavbarComponent,
    AdminDashboardSidebarComponent,
  ],
  host: { class: 'block h-screen w-full' },
  template: `
    <div
      class="flex h-screen flex-col lg:gap-4 lg:bg-gray-100 lg:p-4"
      [class.bg-[#F4F4F4]]="isAdminRoutePrefix('/admin/more')"
      [class.bg-white]="!isAdminRoutePrefix('/admin/more')"
    >
      <header
        class="flex h-[72px] shrink-0 items-center justify-between px-5 lg:hidden"
        [class.bg-[#F4F4F4]]="isAdminRoutePrefix('/admin/more')"
        [class.bg-white]="!isAdminRoutePrefix('/admin/more')"
      >
        <a routerLink="/admin" class="flex items-center" aria-label="Go to admin home">
          <img
            ngSrc="/assets/images/admin-mobile-shell/logo.svg"
            width="112"
            height="24"
            alt="Duduzili"
            priority
            class="h-6 w-[111px]"
          />
        </a>

        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="runMobileSearch()"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F3F3]"
            aria-label="Search"
          >
            <img
              ngSrc="/assets/icons/admin-mobile-shell/search.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
              aria-hidden="true"
            />
          </button>
          <button
            type="button"
            (click)="openSidebar()"
            class="relative flex h-9 w-9 overflow-hidden rounded-full"
            aria-label="Open admin menu"
          >
            <img
              ngSrc="/assets/images/admin-mobile-shell/avatar.png"
              width="36"
              height="36"
              alt=""
              class="absolute left-[-61.11%] top-0 h-[141.67%] w-[259.72%] max-w-none rounded-full"
              aria-hidden="true"
            />
          </button>
        </div>
      </header>

      <app-admin-dashboard-navbar class="hidden w-full lg:block" (menuRequested)="openSidebar()"></app-admin-dashboard-navbar>

      <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
        <aside class="hidden w-64 shrink-0 lg:block">
          <app-admin-dashboard-sidebar class="h-full"></app-admin-dashboard-sidebar>
        </aside>

        @if (isSidebarOpen()) {
          <div class="fixed inset-0 z-[70] bg-black/30 backdrop-blur-[1px] lg:hidden" (click)="closeSidebar()"></div>
          <div class="fixed inset-y-0 left-0 z-[80] w-[min(320px,88vw)] bg-gray-100 p-2 sm:p-4 lg:hidden">
            <div class="flex h-full flex-col gap-3 rounded-[28px] bg-gray-100">
              <div class="flex justify-end px-2 pt-2">
                <button
                  type="button"
                  (click)="closeSidebar()"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-[#E8EAF0] bg-white px-4 text-[14px] font-medium text-[#1A1C21] shadow-sm transition hover:bg-[#FAFAFC]"
                  aria-label="Close admin sidebar"
                >
                  Close
                </button>
              </div>
              <div class="min-h-0 flex-1 overflow-hidden rounded-[28px] bg-gray-100">
                <app-admin-dashboard-sidebar class="h-full"></app-admin-dashboard-sidebar>
              </div>
            </div>
          </div>
        }

        <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white pb-[116px] lg:rounded-[32px] lg:pb-0 lg:shadow-sm">
          <router-outlet></router-outlet>
        </main>
      </div>

      <nav
        class="fixed inset-x-0 bottom-0 z-50 h-[101px] bg-gradient-to-b from-white/0 to-white lg:hidden"
        aria-label="Admin mobile navigation"
      >
        <div class="absolute bottom-[19px] left-1/2 flex w-[min(350px,calc(100vw-40px))] -translate-x-1/2 items-center rounded-full border border-[#F4F4F4] bg-white p-1 shadow-[0_4px_12px_rgba(212,212,212,0.25)]">
          <a
            routerLink="/admin"
            class="flex h-[53px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[32px] text-[11px] font-medium leading-[1.4]"
            [class.bg-[#F5F3FF]]="isAdminRouteExact('/admin')"
            [class.text-[#6453D9]]="isAdminRouteExact('/admin')"
            [class.text-[#5C5C5C]]="!isAdminRouteExact('/admin')"
            [attr.aria-current]="isAdminRouteExact('/admin') ? 'page' : null"
          >
            <span
              class="h-[22px] w-[22px]"
              [style.background-color]="isAdminRouteExact('/admin') ? '#6453D9' : '#5C5C5C'"
              style="-webkit-mask: url('/assets/icons/admin-mobile-shell/home.svg') center / contain no-repeat; mask: url('/assets/icons/admin-mobile-shell/home.svg') center / contain no-repeat;"
              aria-hidden="true"
            ></span>
            Home
          </a>
          <a
            routerLink="/admin/users"
            class="flex h-[53px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[32px] text-[11px] font-medium leading-[1.4]"
            [class.bg-[#F5F3FF]]="isAdminRoutePrefix('/admin/users')"
            [class.text-[#6453D9]]="isAdminRoutePrefix('/admin/users')"
            [class.text-[#5C5C5C]]="!isAdminRoutePrefix('/admin/users')"
            [attr.aria-current]="isAdminRoutePrefix('/admin/users') ? 'page' : null"
          >
            <span
              class="h-[22px] w-[22px]"
              [style.background-color]="isAdminRoutePrefix('/admin/users') ? '#6453D9' : '#5C5C5C'"
              style="-webkit-mask: url('/assets/icons/admin-mobile-shell/users.svg') center / contain no-repeat; mask: url('/assets/icons/admin-mobile-shell/users.svg') center / contain no-repeat;"
              aria-hidden="true"
            ></span>
            Users
          </a>
          <a
            routerLink="/admin/listings"
            class="flex h-[53px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[32px] text-[11px] font-medium leading-[1.4]"
            [class.bg-[#F5F3FF]]="isAdminRoutePrefix('/admin/listings')"
            [class.text-[#6453D9]]="isAdminRoutePrefix('/admin/listings')"
            [class.text-[#5C5C5C]]="!isAdminRoutePrefix('/admin/listings')"
            [attr.aria-current]="isAdminRoutePrefix('/admin/listings') ? 'page' : null"
          >
            <span
              class="h-[22px] w-[22px]"
              [style.background-color]="isAdminRoutePrefix('/admin/listings') ? '#6453D9' : '#5C5C5C'"
              style="-webkit-mask: url('/assets/icons/admin-mobile-shell/listings.svg') center / contain no-repeat; mask: url('/assets/icons/admin-mobile-shell/listings.svg') center / contain no-repeat;"
              aria-hidden="true"
            ></span>
            Listings
          </a>
          <a
            routerLink="/admin/analytics"
            class="flex h-[53px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[32px] text-[11px] font-medium leading-[1.4]"
            [class.bg-[#F5F3FF]]="isAdminRoutePrefix('/admin/analytics')"
            [class.text-[#6453D9]]="isAdminRoutePrefix('/admin/analytics')"
            [class.text-[#5C5C5C]]="!isAdminRoutePrefix('/admin/analytics')"
            [attr.aria-current]="isAdminRoutePrefix('/admin/analytics') ? 'page' : null"
          >
            <span
              class="h-[22px] w-[22px]"
              [style.background-color]="isAdminRoutePrefix('/admin/analytics') ? '#6453D9' : '#5C5C5C'"
              style="-webkit-mask: url('/assets/icons/admin-mobile-shell/analytics.svg') center / contain no-repeat; mask: url('/assets/icons/admin-mobile-shell/analytics.svg') center / contain no-repeat;"
              aria-hidden="true"
            ></span>
            Analytics
          </a>
          <a
            routerLink="/admin/more"
            class="flex h-[53px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-[32px] text-[11px] font-medium leading-[1.4]"
            [class.bg-[#F5F3FF]]="isMoreActive()"
            [class.text-[#6453D9]]="isMoreActive()"
            [class.text-[#5C5C5C]]="!isMoreActive()"
            [attr.aria-current]="isMoreActive() ? 'page' : null"
          >
            <span
              class="h-[22px] w-[22px]"
              [style.background-color]="isMoreActive() ? '#6453D9' : '#5C5C5C'"
              style="-webkit-mask: url('/assets/icons/admin-mobile-shell/more.svg') center / contain no-repeat; mask: url('/assets/icons/admin-mobile-shell/more.svg') center / contain no-repeat;"
              aria-hidden="true"
            ></span>
            More
          </a>
        </div>
      </nav>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardLayoutComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly isSidebarOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isSidebarOpen.set(false);
      });
  }

  openSidebar(): void {
    this.isSidebarOpen.set(true);
  }

  closeSidebar(): void {
    this.isSidebarOpen.set(false);
  }

  runMobileSearch(): void {
    void this.router.navigate(['/category'], { queryParams: { q: 'iPhone' } });
  }

  isAdminRouteExact(path: string): boolean {
    return this.normalizedAdminUrl() === path;
  }

  isAdminRoutePrefix(path: string): boolean {
    const currentUrl = this.normalizedAdminUrl();
    return currentUrl === path || currentUrl.startsWith(`${path}/`);
  }

  isMoreActive(): boolean {
    return this.isAdminRoutePrefix('/admin/more');
  }

  private normalizedAdminUrl(): string {
    return this.router.url.split('?')[0].split('#')[0].replace(/\/$/, '') || '/admin';
  }
}
