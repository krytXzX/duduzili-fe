import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

interface WishlistGroup {
  label: string;
  listings: Listing[];
}

@Component({
  selector: 'app-buyer-wishlist-page',
  imports: [CommonModule, ListingCardComponent],
  template: `
    <section class="min-h-full">
      <header class="border-b border-[#EEF0F4] px-8 py-7">
        <h1 class="text-[24px] font-semibold tracking-tight text-[#1A1C21]">Wishlist</h1>
      </header>

      <div class="space-y-12 px-8 py-8">
        @for (group of groups(); track group.label) {
          <section>
            <h2 class="mb-5 text-[18px] font-medium text-[#1A1C21]">{{ group.label }}</h2>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
              @for (listing of group.listings; track listing.id) {
                <app-listing-card [listing]="listing" [favoriteFilled]="true" />
              }
            </div>
          </section>
        }
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuyerWishlistPageComponent {
  readonly groups = signal<WishlistGroup[]>([
    {
      label: 'Today',
      listings: [
        {
          id: 'wl1',
          title: 'Iphone 17 pro max',
          price: '₦2,500,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_watch_luxury.png', '/assets/images/product_keyboard_rgb.png'],
        },
        {
          id: 'wl2',
          title: 'Logitech ergonomic mouse',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_keyboard_rgb.png'],
        },
        {
          id: 'wl3',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_keyboard_rgb.png'],
        },
        {
          id: 'wl4',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Now',
          isVerified: true,
          images: ['/assets/images/product_keyboard_rgb.png'],
        },
      ],
    },
    {
      label: '12 February, 2026',
      listings: [
        {
          id: 'wl5',
          title: 'Sweatshirt',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/fashion_menswear_hero.png'],
        },
      ],
    },
  ]);
}
