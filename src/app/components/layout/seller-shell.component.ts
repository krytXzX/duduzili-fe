import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { DashboardNavbarComponent } from './dashboard-navbar.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';
import { SellerMobileHeaderComponent } from './seller-mobile-header.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

@Component({
  selector: 'app-seller-shell',
  imports: [
    DashboardNavbarComponent,
    DashboardSidebarComponent,
    SellerMobileHeaderComponent,
    MobileBottomNavComponent,
  ],
  template: `
    <div class="flex h-screen flex-col bg-[#f7f7fa] lg:gap-4 lg:bg-[#f4f4f4] lg:p-4">
      @if (showDesktopNavbar()) {
        <div class="hidden w-full lg:block">
          <app-dashboard-navbar ngSkipHydration />
        </div>
      }

      @if (showMobileHeader()) {
        <app-seller-mobile-header />
      }

      <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
        @if (showDesktopSidebar()) {
          <aside class="hidden w-64 shrink-0 lg:block">
            <app-dashboard-sidebar class="h-full" />
          </aside>
        }

        <main [class]="mainClass()">
          <ng-content />
        </main>
      </div>

      @if (showMobileBottomNav() && !mobileOverlayService.isAnyMobileOverlayOpen()) {
        <app-mobile-bottom-nav />
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerShellComponent {
  private readonly defaultMainClass =
    'min-h-0 flex-1 overflow-y-auto bg-transparent pb-24 lg:rounded-[32px] lg:bg-white lg:p-8 lg:pb-8 lg:shadow-sm';

  protected readonly mobileOverlayService = inject(MobileOverlayService);

  readonly showDesktopNavbar = input(true);
  readonly showDesktopSidebar = input(true);
  readonly showMobileHeader = input(true);
  readonly showMobileBottomNav = input(true);
  readonly contentClass = input('');

  mainClass(): string {
    const extraClass = this.contentClass().trim();
    return extraClass ? `${this.defaultMainClass} ${extraClass}` : this.defaultMainClass;
  }
}
