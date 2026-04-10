import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BuyerDashboardNavbarComponent } from './buyer-dashboard-navbar.component';
import { BuyerDashboardSidebarComponent } from './buyer-dashboard-sidebar.component';
import { WishlistToastComponent } from '../common/wishlist-toast.component';

@Component({
  selector: 'app-buyer-dashboard-layout',
  imports: [RouterOutlet, BuyerDashboardNavbarComponent, BuyerDashboardSidebarComponent, WishlistToastComponent],
  template: `
    <div class="flex h-screen flex-col gap-4 bg-gray-100 p-4">
      <app-buyer-dashboard-navbar class="w-full"></app-buyer-dashboard-navbar>

      <div class="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <aside class="hidden w-64 shrink-0 lg:block">
          <app-buyer-dashboard-sidebar class="h-full"></app-buyer-dashboard-sidebar>
        </aside>

        <main class="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-4xl bg-white shadow-sm">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>

    <app-wishlist-toast />
  `,
  host: { class: 'block h-screen w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardLayoutComponent {}
