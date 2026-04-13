import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardNavbarComponent } from './dashboard-navbar.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';
import { SellerMobileHeaderComponent } from './seller-mobile-header.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    DashboardNavbarComponent,
    DashboardSidebarComponent,
    SellerMobileHeaderComponent,
    MobileBottomNavComponent,
  ],
  host: {
    class: 'block h-screen w-full'
  },
  template: `
    <div class="flex h-screen flex-col bg-[#F7F7FA] lg:gap-4 lg:bg-gray-100 lg:p-4">
      <div class="hidden w-full lg:block">
        <app-dashboard-navbar ngSkipHydration></app-dashboard-navbar>
      </div>
      <app-seller-mobile-header />

      <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
        <aside class="hidden w-64 shrink-0 lg:block">
          <app-dashboard-sidebar class="h-full"></app-dashboard-sidebar>
        </aside>

        <main class="min-h-0 flex-1 overflow-y-auto bg-transparent pb-24 lg:rounded-[32px] lg:bg-white lg:p-8 lg:pb-8 lg:shadow-sm">
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (!mobileOverlayService.isAnyMobileOverlayOpen()) {
        <app-mobile-bottom-nav />
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent {
  protected readonly mobileOverlayService = inject(MobileOverlayService);
}
