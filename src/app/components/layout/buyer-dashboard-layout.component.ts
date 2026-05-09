import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BuyerDashboardNavbarComponent } from './buyer-dashboard-navbar.component';
import { BuyerDashboardSidebarComponent } from './buyer-dashboard-sidebar.component';
import { WishlistToastComponent } from '../common/wishlist-toast.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';

@Component({
  selector: 'app-buyer-dashboard-layout',
  imports: [
    RouterOutlet,
    BuyerDashboardNavbarComponent,
    BuyerDashboardSidebarComponent,
    WishlistToastComponent,
    MobileBottomNavComponent,
  ],
  template: `
    <div class="flex h-screen flex-col bg-white lg:gap-4 lg:bg-gray-100 lg:p-4">
      <app-buyer-dashboard-navbar class="w-full"></app-buyer-dashboard-navbar>

      <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
        <aside class="hidden w-64 shrink-0 lg:block">
          <app-buyer-dashboard-sidebar class="h-full"></app-buyer-dashboard-sidebar>
        </aside>

        <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white lg:rounded-4xl lg:shadow-sm">
          <router-outlet></router-outlet>
          <div class="h-[120px] lg:hidden" aria-hidden="true"></div>
        </main>
      </div>
    </div>

    <app-mobile-bottom-nav variant="buyer" />
    <app-wishlist-toast />
  `,
  host: { class: 'block h-screen w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerDashboardLayoutComponent {}
