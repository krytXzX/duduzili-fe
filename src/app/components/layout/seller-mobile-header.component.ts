import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-seller-mobile-header',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="flex h-[72px] items-center justify-between gap-4 px-5 lg:hidden">
      <a
        routerLink="/seller/listings"
        aria-label="Go to Duduzili home"
        class="block"
      >
        <img
          ngSrc="/assets/icons/seller-mobile-header-logo.svg"
          width="111"
          height="24"
          alt="Duduzili"
          priority
          class="h-6 w-auto object-contain"
        >
      </a>

      <img
        ngSrc="/assets/images/seller-mobile-header-avatar.png"
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
