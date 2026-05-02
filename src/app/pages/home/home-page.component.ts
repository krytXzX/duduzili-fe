import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';

type HomeCategory = {
  id: string;
  label: string;
  icon: string;
};

type HomeListing = {
  id: string;
  title: string;
  price: string;
  location: string;
  tag?: string;
  badge?: string;
};

type HomePromotion = {
  id: string;
  image: string;
};

@Component({
  selector: 'app-home-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    MobileBottomNavComponent,
    StoreCardComponent,
    ListingCardComponent,
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  host: {
    class: 'block h-full overflow-auto bg-white text-[#1f1f1f]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly categoryRail = viewChild<ElementRef<HTMLDivElement>>('categoryRail');

  readonly showPublicChrome = input(true);
  readonly showBottomNav = input(true);
  readonly showAppDownloadBanner = signal(true);
  readonly showMobileMenu = signal(false);
  readonly isMobileSearchOverlayOpen = signal(false);
  readonly mobileSearchQuery = signal('');
  readonly recentSearches = signal([
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
  ]);
  readonly popularSearches = [
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
    'Toyota camry 2016 model',
    'Miniflat in Lagos',
    'shirt for men',
  ] as const;

  readonly categories: HomeCategory[] = [
    { id: 'automotives', label: 'Automotives', icon: '/assets/images/category-automotives.png' },
    {
      id: 'real-estate',
      label: 'Real Estate & Properties',
      icon: '/assets/images/category-real-estate-properties.png',
    },
    { id: 'phones', label: 'Phone & Tablet', icon: '/assets/images/category-phone-tablet.png' },
    { id: 'electronics', label: 'Electronics', icon: '/assets/images/category-electronics.png' },
    {
      id: 'home',
      label: 'Home, Furniture & Appliances',
      icon: '/assets/images/category-home-furniture-appliances.png',
    },
    { id: 'menswear', label: 'Men’s fashion', icon: '/assets/images/category-mens-fashion.png' },
    {
      id: 'womenswear',
      label: 'Women’s fashion',
      icon: '/assets/images/category-womens-fashion.png',
    },
    {
      id: 'children-baby',
      label: 'Children & Baby fashion',
      icon: '/assets/images/category-children-baby-fashion.png',
    },
    {
      id: 'fashion-design',
      label: 'Fashion & Design',
      icon: '/assets/images/category-fashion-design.png',
    },
    {
      id: 'beauty',
      label: 'Beauty & Personal Care',
      icon: '/assets/images/category-beauty-personal-care.png',
    },
    {
      id: 'industrial-home',
      label: 'Industrial & Home Supplies',
      icon: '/assets/images/category-industrial-home-supplies.png',
    },
    {
      id: 'business-industrial',
      label: 'Business & Industrial',
      icon: '/assets/images/category-business-industrial.png',
    },
    {
      id: 'school-office',
      label: 'School, Office & General Supplies',
      icon: '/assets/images/category-school-office-general-supplies.png',
    },
    {
      id: 'leisure',
      label: 'Leisure & Activities',
      icon: '/assets/images/category-leisure-activities.png',
    },
    { id: 'grocery', label: 'Grocery', icon: '/assets/images/category-grocery.png' },
    { id: 'party', label: 'Party Supplies', icon: '/assets/images/category-party-supplies.png' },
    {
      id: 'food',
      label: 'Food, Agriculture & Farming',
      icon: '/assets/images/category-food-agriculture-farming.png',
    },
    { id: 'pets', label: 'Animals & Pets', icon: '/assets/images/category-animals-pets.png' },
    {
      id: 'books',
      label: 'Books, Movies & Music',
      icon: '/assets/images/category-books-movies-music.png',
    },
  ];

  readonly sponsoredListings: HomeListing[] = [
    {
      id: 's1',
      title: 'Nike sneaker',
      price: '₦35,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's2',
      title: 'Bone straight wig',
      price: '₦45,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's3',
      title: 'iPhone X (64 gig)',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
    {
      id: 's4',
      title: 'Ergonomic chair',
      price: '₦85,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
      badge: 'Used',
    },
  ];

  readonly nearbyListings: HomeListing[] = [
    {
      id: 'n1',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n2',
      title: 'Leather sandals',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      badge: 'Used',
    },
    {
      id: 'n3',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n4', title: 'White shirt', price: '₦18,500', location: 'Ikeja, Lagos', tag: 'Verified' },
    { id: 'n5', title: 'Perfume set', price: '₦32,000', location: 'Ikeja, Lagos' },
    {
      id: 'n6',
      title: 'Luxury watch',
      price: '₦120,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n7',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n8', title: 'Leather sandals', price: '₦25,000', location: 'Ikeja, Lagos' },
    {
      id: 'n9',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n10', title: 'White shirt', price: '₦18,500', location: 'Ikeja, Lagos', badge: 'Used' },
    {
      id: 'n11',
      title: 'Ceramic set',
      price: '₦15,500',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    { id: 'n12', title: 'Luxury watch', price: '₦120,000', location: 'Ikeja, Lagos' },
    {
      id: 'n13',
      title: 'Orange iPhone',
      price: '₦450,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
    {
      id: 'n14',
      title: 'Leather sandals',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      badge: 'Used',
    },
    {
      id: 'n15',
      title: 'Mechanical keyboard',
      price: '₦65,000',
      location: 'Ikeja, Lagos',
      tag: 'Verified',
    },
  ];

  readonly promotions: HomePromotion[] = [
    { id: 'p1', image: '/assets/images/home-promo-1.png' },
    { id: 'p2', image: '/assets/images/home-promo-2.png' },
    { id: 'p3', image: '/assets/images/home-promo-3.png' },
  ];

  readonly featuredStores: Store[] = [
    {
      id: 'st1',
      name: 'The Vine Collections',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-vine-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-vine-cover-mobile.png',
      logoImage: '/assets/images/store-vine-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-vine-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st2',
      name: 'Eden Organics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-eden-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-eden-cover-mobile.png',
      logoImage: '/assets/images/store-eden-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-eden-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st3',
      name: 'Snap Thrifts',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-snap-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-snap-cover-mobile.png',
      logoImage: '/assets/images/store-snap-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-snap-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st4',
      name: 'goMelon',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-gomelon-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-gomelon-cover-mobile.png',
      logoImage: '/assets/images/store-gomelon-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-gomelon-logo-mobile.png',
      route: ['/'],
    },
    {
      id: 'st5',
      name: 'Amazing Fragrances',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-amazing-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-amazing-cover-desktop.png',
      logoImage: '/assets/images/store-amazing-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-amazing-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st6',
      name: 'None Electronics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-none-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-none-cover-desktop.png',
      logoImage: '/assets/images/store-none-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-none-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st7',
      name: 'New Age Properties',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-newage-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-newage-cover-desktop.png',
      logoImage: '/assets/images/store-newage-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-newage-logo-desktop.png',
      route: ['/'],
    },
    {
      id: 'st8',
      name: 'Swift Wears',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-swift-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-swift-cover-desktop.png',
      logoImage: '/assets/images/store-swift-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-swift-logo-desktop.png',
      route: ['/'],
    },
  ];

  readonly sponsoredListingCards: Listing[] = this.sponsoredListings.map((listing) =>
    this.toReusableListing(listing),
  );

  readonly nearbyListingCards: Listing[] = this.nearbyListings.map((listing) =>
    this.toReusableListing(listing),
  );

  dismissAppDownloadBanner(): void {
    this.showAppDownloadBanner.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  openMobileSearchOverlay(): void {
    this.isMobileSearchOverlayOpen.set(true);
  }

  closeMobileSearchOverlay(): void {
    this.isMobileSearchOverlayOpen.set(false);
  }

  updateMobileSearchQuery(event: Event): void {
    const target = event.target as HTMLInputElement | null;
    this.mobileSearchQuery.set(target?.value ?? '');
  }

  removeRecentSearch(term: string): void {
    this.recentSearches.update((current) => current.filter((item) => item !== term));
  }

  clearRecentSearchHistory(): void {
    this.recentSearches.set([]);
  }

  applySearchTerm(term: string): void {
    this.mobileSearchQuery.set(term);
  }

  scrollCategories(): void {
    this.categoryRail()?.nativeElement.scrollBy({
      left: 540,
      behavior: 'smooth',
    });
  }

  private toReusableListing(listing: HomeListing): Listing {
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      location: listing.location,
      images: ['/assets/images/home-item-placeholder.png'],
      timeAgo: listing.badge ?? '',
      isVerified: listing.tag === 'Verified',
      discountBadge:
        listing.tag && listing.tag !== 'Verified' ? listing.tag.toUpperCase() : undefined,
    };
  }
}
