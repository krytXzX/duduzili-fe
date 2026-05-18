import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { HomePageComponent } from './home-page.component';

@Component({
  selector: 'app-buyer-signed-in-home-page',
  imports: [
    BuyerDashboardNavbarComponent,
    AppToastComponent,
    MobileBottomNavComponent,
    HomePageComponent,
  ],
  template: `
    <div class="flex h-screen flex-col bg-white">
      <app-buyer-dashboard-navbar class="w-full"></app-buyer-dashboard-navbar>

      <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">
        <app-home-page [showPublicChrome]="false" [showBottomNav]="false" />
        <div class="h-[120px] lg:hidden" aria-hidden="true"></div>
      </main>
    </div>

    <app-mobile-bottom-nav variant="buyer" />
    <app-toast />
  `,
  host: { class: 'block h-screen w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerSignedInHomePageComponent {}
