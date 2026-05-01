import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

interface RecentlyViewedGroup {
  label: string;
  listings: Array<Listing & { favoriteFilled?: boolean }>;
}

interface MobileRecentlyViewedGroup {
  label: string;
  listings: Array<Listing & { favoriteFilled?: boolean }>;
}

@Component({
  selector: 'app-buyer-recently-viewed-page',
  imports: [CommonModule, ListingCardComponent, RouterLink, NgOptimizedImage],
  template: `
    <section class="min-h-full bg-white">
      <div class="md:hidden">
        <header class="h-[54px] px-5">
          <div class="flex h-full items-center gap-2">
            <a
              routerLink="/more"
              aria-label="Back"
              class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#f3f3f3]"
            >
              <img
                ngSrc="/assets/icons/recently-viewed-mobile/arrow-left.svg"
                alt=""
                aria-hidden="true"
                width="20"
                height="20"
                class="h-5 w-5"
              />
            </a>
            <h1 class="text-[20px] font-semibold leading-[1.2] text-[#111]">Recently viewed</h1>
          </div>
        </header>

        <div class="space-y-6 px-5 pb-8 pt-3">
          @for (group of mobileGroups(); track group.label) {
            <section>
              <h2 class="mb-4 text-[20px] font-medium leading-[1.2] text-[#2a2a2a]">{{ group.label }}</h2>
              <div class="grid grid-cols-2 gap-2">
                @for (listing of group.listings; track listing.id) {
                  <app-listing-card [listing]="listing" [favoriteFilled]="listing.favoriteFilled ?? false" />
                }
              </div>
            </section>
          }
        </div>
      </div>

      <div class="hidden md:block">
        <header class="border-b border-[#EEF0F4] px-8 py-7">
          <h1 class="text-[24px] font-semibold tracking-tight text-[#1A1C21]">Recently viewed</h1>
        </header>

        <div class="space-y-12 px-8 py-8">
          @for (group of groups(); track group.label) {
            <section>
              <h2 class="mb-5 text-[18px] font-medium text-[#1A1C21]">{{ group.label }}</h2>

              <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                @for (listing of group.listings; track listing.id) {
                  <app-listing-card
                    [listing]="listing"
                    [favoriteFilled]="listing.favoriteFilled ?? false"
                  />
                }
              </div>
            </section>
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerRecentlyViewedPageComponent {
  readonly groups = signal<RecentlyViewedGroup[]>([
    {
      label: 'Today',
      listings: [
        {
          id: 'rv1',
          title: 'Iphone 17 pro max',
          price: '₦2,500,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/image-1-1.jpg', '/assets/images/product_watch_luxury.png'],
          favoriteFilled: false,
        },
        {
          id: 'rv2',
          title: 'Logitech ergonomic mouse',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/image-2-1.jpg'],
          favoriteFilled: false,
        },
        {
          id: 'rv3',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_keyboard_rgb.png'],
          favoriteFilled: true,
        },
        {
          id: 'rv4',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_keyboard_rgb.png'],
          favoriteFilled: true,
        },
      ],
    },
    {
      label: '12 February, 2026',
      listings: [
        {
          id: 'rv5',
          title: 'Sweatshirt',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/fashion_menswear.png'],
          favoriteFilled: false,
        },
      ],
    },
  ]);

  readonly mobileGroups = signal<MobileRecentlyViewedGroup[]>([
    {
      label: 'Today',
      listings: [
        {
          id: 'm-rv1',
          title: 'Nike sneaker',
          price: '₦35,000',
          timeAgo: 'Used',
          location: 'Ikeja, Lagos',
          images: ['/assets/images/recently-viewed-mobile/nike-sneaker.png'],
          isVerified: true,
        },
        {
          id: 'm-rv2',
          title: 'Bone straight wig',
          price: '₦35,000',
          timeAgo: 'Used',
          location: 'Ikeja, Lagos',
          images: [
            '/assets/images/recently-viewed-mobile/bone-straight-wig.png',
            '/assets/images/recently-viewed-mobile/nike-sneaker.png',
          ],
        },
        {
          id: 'm-rv3',
          title: 'Iphone X (64 gig)',
          price: '₦35,000',
          originalPrice: '₦35,000',
          discountBadge: '-22%',
          timeAgo: 'Used',
          location: 'Ikeja, Lagos',
          images: ['/assets/images/recently-viewed-mobile/iphone-x.png'],
          isVerified: true,
        },
        {
          id: 'm-rv4',
          title: 'Ergonomic chair',
          price: 'Free',
          timeAgo: 'New',
          location: 'Ikeja, Lagos',
          images: ['/assets/images/recently-viewed-mobile/ergonomic-chair.png'],
          isVerified: true,
        },
      ],
    },
    {
      label: '12 February, 2026',
      listings: [
        {
          id: 'm-rv5',
          title: 'Nike sneaker',
          price: '₦35,000',
          timeAgo: 'Used',
          location: 'Ikeja, Lagos',
          images: ['/assets/images/recently-viewed-mobile/nike-sneaker.png'],
          isVerified: true,
          favoriteFilled: true,
        },
      ],
    },
  ]);
}
