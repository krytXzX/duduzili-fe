import { ChangeDetectionStrategy, Component, ElementRef, signal, viewChild } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';

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

type HomeStore = {
  id: string;
  name: string;
  location: string;
  coverImage: string;
  mobileCoverImage: string;
  logoImage: string;
  mobileLogoImage: string;
};

@Component({
  selector: 'app-home-page',
  imports: [NgOptimizedImage, RouterLink, MobileBottomNavComponent],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
  host: {
    class: 'block h-full overflow-auto bg-white text-[#1f1f1f]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {
  private readonly categoryRail = viewChild<ElementRef<HTMLDivElement>>('categoryRail');

  readonly showAppDownloadBanner = signal(true);
  readonly showMobileMenu = signal(false);

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
      tag: 'Sponsored',
    },
    { id: 'n4', title: 'White shirt', price: '₦18,500', location: 'Ikeja, Lagos', tag: 'Premium' },
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
      tag: 'Sponsored',
    },
  ];

  readonly promotions: HomePromotion[] = [
    { id: 'p1', image: '/assets/images/home-promo-1.png' },
    { id: 'p2', image: '/assets/images/home-promo-2.png' },
    { id: 'p3', image: '/assets/images/home-promo-3.png' },
  ];

  readonly featuredStores: HomeStore[] = [
    {
      id: 'st1',
      name: 'The Vine Collections',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-vine-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-vine-cover-mobile.png',
      logoImage: '/assets/images/store-vine-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-vine-logo-mobile.png',
    },
    {
      id: 'st2',
      name: 'Eden Organics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-eden-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-eden-cover-mobile.png',
      logoImage: '/assets/images/store-eden-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-eden-logo-mobile.png',
    },
    {
      id: 'st3',
      name: 'Snap Thrifts',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-snap-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-snap-cover-mobile.png',
      logoImage: '/assets/images/store-snap-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-snap-logo-mobile.png',
    },
    {
      id: 'st4',
      name: 'goMelon',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-gomelon-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-gomelon-cover-mobile.png',
      logoImage: '/assets/images/store-gomelon-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-gomelon-logo-mobile.png',
    },
    {
      id: 'st5',
      name: 'Amazing Fragrances',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-amazing-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-amazing-cover-desktop.png',
      logoImage: '/assets/images/store-amazing-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-amazing-logo-desktop.png',
    },
    {
      id: 'st6',
      name: 'None Electronics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-none-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-none-cover-desktop.png',
      logoImage: '/assets/images/store-none-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-none-logo-desktop.png',
    },
    {
      id: 'st7',
      name: 'New Age Properties',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-newage-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-newage-cover-desktop.png',
      logoImage: '/assets/images/store-newage-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-newage-logo-desktop.png',
    },
    {
      id: 'st8',
      name: 'Swift Wears',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-swift-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-swift-cover-desktop.png',
      logoImage: '/assets/images/store-swift-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-swift-logo-desktop.png',
    },
  ];

  dismissAppDownloadBanner(): void {
    this.showAppDownloadBanner.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update((isOpen) => !isOpen);
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  scrollCategories(): void {
    this.categoryRail()?.nativeElement.scrollBy({
      left: 540,
      behavior: 'smooth',
    });
  }

}
