import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { WishlistToastComponent } from '../../components/common/wishlist-toast.component';
import { HomePageComponent } from './home-page.component';

@Component({
  selector: 'app-buyer-signed-in-home-page',
  imports: [BuyerDashboardNavbarComponent, WishlistToastComponent, HomePageComponent],
  template: `
    <div class="flex h-screen flex-col gap-4 bg-gray-100 p-4">
      <app-buyer-dashboard-navbar class="w-full"></app-buyer-dashboard-navbar>

      <main class="min-h-0 min-w-0 flex-1 overflow-y-auto rounded-[32px] bg-white shadow-sm">
        <app-home-page [showPublicChrome]="false" [showBottomNav]="false" />
      </main>
    </div>

    <app-wishlist-toast />
  `,
  host: { class: 'block h-screen w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerSignedInHomePageComponent {}
