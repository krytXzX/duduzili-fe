import { ChangeDetectionStrategy, Component, OnInit, inject, input } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardNavbarComponent } from './dashboard-navbar.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';
import { MobileBottomNavComponent } from './mobile-bottom-nav.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import { AppToastComponent } from '../common/app-toast.component';
import { AppModeService } from '../../services/app-mode.service';
import { AuthService, type ProfileResponse } from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-seller-shell',
  imports: [
    DashboardNavbarComponent,
    DashboardSidebarComponent,
    MobileBottomNavComponent,
    AppToastComponent,
  ],
  template: `
    <div class="flex h-screen flex-col bg-[#f7f7fa] lg:gap-4 lg:bg-[#f4f4f4] lg:p-4">
      @if (showDesktopNavbar()) {
        <div class="w-full">
          <app-dashboard-navbar ngSkipHydration />
        </div>
      }

      <div class="flex min-h-0 flex-1 overflow-hidden lg:gap-4">
        @if (showDesktopSidebar()) {
          <aside class="hidden w-56 shrink-0 lg:block">
            <app-dashboard-sidebar class="h-full" />
          </aside>
        }

        <main [class]="mainClass()">
          <ng-content />
        </main>
      </div>

      @if (showMobileBottomNav() && !mobileOverlayService.isAnyMobileOverlayOpen()) {
        <app-mobile-bottom-nav
          variant="seller"
          listingsRoute="/seller/listings"
          [listingsActivePaths]="['/seller/listings']"
          messagesRoute="/seller/messages"
          [messagesActivePaths]="['/seller/messages']"
          storesRoute="/seller/my-stores"
          [storesActivePaths]="['/seller/my-stores']"
          moreRoute="/seller/more"
          [moreActivePaths]="['/seller/more']"
          createButtonRoute="/seller/listings"
        />
      }
    </div>

    <app-toast />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerShellComponent implements OnInit {
  private readonly defaultMainClass =
    'min-h-0 flex-1 overflow-y-auto bg-transparent pb-24 lg:rounded-[32px] lg:bg-white lg:p-8 lg:pb-8 lg:shadow-sm';

  protected readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly appMode = inject(AppModeService);
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private hasRequestedSellerMode = false;

  readonly showDesktopNavbar = input(true);
  readonly showDesktopSidebar = input(true);
  readonly showMobileBottomNav = input(true);
  readonly contentClass = input('');

  async ngOnInit(): Promise<void> {
    if (this.hasRequestedSellerMode || !this.appMode.isBackendEnabled()) {
      return;
    }

    this.hasRequestedSellerMode = true;

    try {
      const response = await firstValueFrom(
        this.authService.switchMode({ is_vendor: true }),
      );
      if (this.isProfileLikeResponse(response)) {
        this.authSession.initializeFromProfile(response);
      }
    } catch {
      // Keep seller navigation usable even if the mode switch request fails.
    }
  }

  mainClass(): string {
    const extraClass = this.contentClass().trim();
    return extraClass ? `${this.defaultMainClass} ${extraClass}` : this.defaultMainClass;
  }

  private isProfileLikeResponse(value: unknown): value is ProfileResponse {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as { user?: unknown; id?: unknown; username?: unknown; email?: unknown };
    if (
      typeof candidate.id === 'number' &&
      typeof candidate.username === 'string' &&
      typeof candidate.email === 'string'
    ) {
      return true;
    }

    if (!candidate.user || typeof candidate.user !== 'object') {
      return false;
    }

    const nestedUser = candidate.user as { id?: unknown; username?: unknown; email?: unknown };
    return (
      typeof nestedUser.id === 'number' &&
      typeof nestedUser.username === 'string' &&
      typeof nestedUser.email === 'string'
    );
  }
}
