import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

interface WishlistGroup {
  label: string;
  listings: Listing[];
}

@Component({
  selector: 'app-buyer-wishlist-page',
  imports: [NgOptimizedImage, RouterLink, ListingCardComponent],
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

      <nav
        class="fixed inset-x-0 bottom-0 z-40 bg-gradient-to-b from-transparent to-white px-5 pb-[18px] pt-5 lg:hidden"
        aria-label="Buyer bottom navigation"
      >
        <div class="mx-auto flex w-full max-w-[390px] items-end gap-1">
          <div class="flex min-w-0 flex-1 items-center rounded-full border border-[#f4f4f4] bg-white p-1 shadow-[0_4px_12px_rgba(212,212,212,0.25)]">
            @for (item of bottomNavItems; track item.label) {
              <a
                [routerLink]="item.route"
                class="flex min-w-0 flex-1 flex-col items-center gap-[2px] py-[6px] text-[#5c5c5c]"
                [class]="item.active ? 'rounded-full bg-[#f5f3ff]' : ''"
              >
                <img
                  [ngSrc]="item.icon"
                  alt=""
                  width="22"
                  height="22"
                  class="h-[22px] w-[22px]"
                  aria-hidden="true"
                />
                <span class="text-[11px] font-medium" [class]="item.active ? 'text-[#6453d9]' : ''">{{ item.label }}</span>
              </a>
            }
          </div>

          <a
            routerLink="/category"
            aria-label="Search"
            class="inline-flex h-[63px] w-[63px] items-center justify-center rounded-full border border-[#f4f4f4] bg-white shadow-[0_4px_12px_rgba(212,212,212,0.25)]"
          >
            <img
              ngSrc="/assets/icons/chats-search-mobile.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6"
              aria-hidden="true"
            />
          </a>
        </div>
      </nav>
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

  protected readonly bottomNavItems = [
    { label: 'Explore', route: '/home', icon: '/assets/icons/home-nav-listings.svg', active: false },
    { label: 'Wishlist', route: '/wishlist', icon: '/assets/icons/buyer-menu/heart.svg', active: true },
    { label: 'Chats', route: '/chats', icon: '/assets/icons/home-nav-chats.svg', active: false },
    { label: 'More', route: '/more', icon: '/assets/icons/home-nav-more.svg', active: false },
  ] as const;
}
