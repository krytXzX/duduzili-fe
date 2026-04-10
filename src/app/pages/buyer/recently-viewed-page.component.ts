import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

interface RecentlyViewedGroup {
  label: string;
  listings: Array<Listing & { favoriteFilled?: boolean }>;
}

@Component({
  selector: 'app-buyer-recently-viewed-page',
  imports: [CommonModule, ListingCardComponent],
  template: `
    <section class="min-h-full">
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
}
