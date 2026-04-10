import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardNavbarComponent } from './dashboard-navbar.component';
import { DashboardSidebarComponent } from './dashboard-sidebar.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [RouterOutlet, DashboardNavbarComponent, DashboardSidebarComponent],
  host: {
    class: 'block h-screen w-full'
  },
  template: `
    <div class="flex flex-col h-screen bg-gray-100 p-4 gap-4">
      <!-- Top: Navbar spanning full width -->
      <app-dashboard-navbar class="w-full" ngSkipHydration></app-dashboard-navbar>
      
      <!-- Bottom: Content Section -->
      <div class="flex-1 flex gap-4 overflow-hidden">
        <!-- Left: Sidebar -->
        <app-dashboard-sidebar class="w-64 h-full"></app-dashboard-sidebar>
        
        <!-- Right: Main Content Area -->
        <main class="flex-1 bg-white rounded-4xl overflow-y-auto p-8 shadow-sm">
          <router-outlet></router-outlet>
        </main>
      </div>
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
}
