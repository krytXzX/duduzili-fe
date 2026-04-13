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
        class="text-[22px] font-medium tracking-[-0.04em] text-[#6F56F6]"
      >
        Duduzili
      </a>

      <img
        ngSrc="/assets/images/image-1-1.jpg"
        width="40"
        height="40"
        alt="Profile picture"
        class="h-10 w-10 rounded-full object-cover"
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerMobileHeaderComponent {}
