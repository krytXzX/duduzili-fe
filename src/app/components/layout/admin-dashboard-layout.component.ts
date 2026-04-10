import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminDashboardNavbarComponent } from './admin-dashboard-navbar.component';
import { AdminDashboardSidebarComponent } from './admin-dashboard-sidebar.component';

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, AdminDashboardNavbarComponent, AdminDashboardSidebarComponent],
  host: { class: 'block h-screen w-full' },
  template: `
    <div class="flex h-screen flex-col gap-3 bg-gray-100 p-2 sm:gap-4 sm:p-4">
      <app-admin-dashboard-navbar class="w-full" (menuRequested)="openSidebar()"></app-admin-dashboard-navbar>

      <div class="flex min-h-0 flex-1 gap-4 overflow-hidden">
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

        <main class="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-[28px] bg-white shadow-sm sm:rounded-[32px]">
          <router-outlet></router-outlet>
        </main>
      </div>
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
}
