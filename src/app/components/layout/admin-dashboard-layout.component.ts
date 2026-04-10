import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AdminDashboardNavbarComponent } from './admin-dashboard-navbar.component';
import { AdminDashboardSidebarComponent } from './admin-dashboard-sidebar.component';

@Component({
  selector: 'app-admin-dashboard-layout',
  imports: [RouterOutlet, AdminDashboardNavbarComponent, AdminDashboardSidebarComponent],
  host: { class: 'block h-screen w-full' },
  template: `
    <div class="flex h-screen flex-col gap-4 bg-gray-100 p-4">
      <app-admin-dashboard-navbar class="w-full"></app-admin-dashboard-navbar>

      <div class="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <aside class="w-64 shrink-0">
          <app-admin-dashboard-sidebar class="h-full"></app-admin-dashboard-sidebar>
        </aside>

        <main class="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-4xl bg-white shadow-sm">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardLayoutComponent {}
