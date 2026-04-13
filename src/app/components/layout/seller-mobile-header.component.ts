import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seller-mobile-header',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="flex items-center justify-between gap-4 px-5 pt-4 lg:hidden">
      <a
        routerLink="/"
        aria-label="Go to Duduzili home"
        class="block"
      >
        <img
          ngSrc="/assets/icons/seller-shell-logo.svg"
          width="111"
          height="24"
          alt="Duduzili"
          class="h-6 w-auto"
        >
      </a>

      <img
        ngSrc="/assets/images/dashboard-avatar-mobile.png"
        width="36"
        height="36"
        alt="Profile picture"
        class="h-9 w-9 rounded-full object-cover"
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerMobileHeaderComponent {}
