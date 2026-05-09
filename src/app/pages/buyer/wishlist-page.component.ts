import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

interface WishlistGroup {
  label: string;
  listings: Listing[];
}

@Component({
  selector: 'app-buyer-wishlist-page',
  imports: [ListingCardComponent],
  template: `
    <section class="min-h-full bg-white">
      <div class="hidden lg:block">
        <header class="h-[69px] border-b border-[#EEEEEE] bg-white px-4">
          <h1 class="pt-4 text-[24px] font-medium leading-normal text-[#0d0d0d]">Wishlist</h1>
        </header>

        <div class="min-h-[calc(100vh-173px)] rounded-b-[24px] bg-white px-6 py-6 xl:px-8">
          <div class="space-y-11">
            @for (group of desktopGroups(); track group.label) {
              <section>
                <h2 class="text-[20px] font-medium leading-6 text-[#222222]">{{ group.label }}</h2>

                <div class="mt-[13px] grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                  @for (listing of group.listings; track listing.id) {
                    <app-listing-card [listing]="listing" [favoriteFilled]="true" />
                  }
                </div>
              </section>
            }
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-[390px] px-5 pb-[120px] pt-3 lg:hidden">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1a1b1d]">Wishlist</h1>

        <div class="mt-8 space-y-8 px-0">
          @for (group of mobileGroups(); track group.label) {
            <section>
              <h2 class="text-[20px] font-medium leading-normal text-[#2a2a2a]">{{ group.label }}</h2>

              <div class="mt-4 grid grid-cols-2 gap-2">
                @for (listing of group.listings; track listing.id) {
                  <app-listing-card [listing]="listing" [favoriteFilled]="true" />
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
export class BuyerWishlistPageComponent {
  readonly desktopGroups = signal<WishlistGroup[]>([
    {
      label: 'Today',
      listings: [
        {
          id: 'desktop-today-1',
          title: 'Iphone 17 pro max',
          price: '₦2,500,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: [
            '/assets/images/listing-iphone-17-pro-max-figma.png',
            '/assets/images/listing-logitech-mouse-figma.png',
            '/assets/images/listing-rgb-keyboard-figma.png',
          ],
        },
        {
          id: 'desktop-today-2',
          title: 'Logitech ergonomic mouse',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-logitech-mouse-figma.png'],
        },
        {
          id: 'desktop-today-3',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-rgb-keyboard-figma.png'],
        },
        {
          id: 'desktop-today-4',
          title: 'RGB keyboard',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-rgb-keyboard-figma.png'],
        },
      ],
    },
    {
      label: '12 February, 2026',
      listings: [
        {
          id: 'desktop-feb-1',
          title: 'Sweatshirt',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-sweatshirt-figma.png'],
        },
      ],
    },
  ]);

  readonly mobileGroups = signal<WishlistGroup[]>([
    {
      label: 'Today',
      listings: [
        {
          id: 'mobile-today-1',
          title: 'Nike sneaker',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-nike-sneaker-figma.png'],
        },
        {
          id: 'mobile-today-2',
          title: 'Bone straight wig',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: false,
          images: [
            '/assets/images/listing-bone-straight-wig-figma.png',
            '/assets/images/listing-nike-sneaker-figma.png',
          ],
        },
      ],
    },
    {
      label: '12 February, 2026',
      listings: [
        {
          id: 'mobile-feb-1',
          title: 'Nike sneaker',
          price: '₦35,000',
          location: 'Ikeja, Lagos',
          timeAgo: 'Used',
          isVerified: true,
          images: ['/assets/images/listing-nike-sneaker-figma.png'],
        },
      ],
    },
  ]);

}
