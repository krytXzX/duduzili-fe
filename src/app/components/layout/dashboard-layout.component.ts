import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SellerShellComponent } from './seller-shell.component';

@Component({
  selector: 'app-dashboard-layout',
  imports: [
    RouterOutlet,
    SellerShellComponent,
  ],
  host: {
    class: 'block h-screen w-full'
  },
  template: `
    <app-seller-shell>
      <router-outlet />
    </app-seller-shell>
  `,
  styles: [`
    :host {
      display: block;
      height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardLayoutComponent {}
