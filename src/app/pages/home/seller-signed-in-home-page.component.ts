import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DashboardNavbarComponent } from '../../components/layout/dashboard-navbar.component';
import { HomePageComponent } from './home-page.component';

@Component({
  selector: 'app-seller-signed-in-home-page',
  imports: [DashboardNavbarComponent, HomePageComponent],
  template: `
    <div class="flex h-screen flex-col bg-white">
      <app-dashboard-navbar class="w-full"></app-dashboard-navbar>

      <main class="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">
        <app-home-page [showPublicChrome]="false" [showBottomNav]="false" />
      </main>
    </div>
  `,
  host: { class: 'block h-screen w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerSignedInHomePageComponent {}
