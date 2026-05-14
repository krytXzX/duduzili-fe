import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AuthSessionService } from '../../services/auth-session.service';

interface CategoryFilterChip {
  id: string;
  label: string;
  trailingIcon?: 'chevron' | 'close';
}

interface CategoryListing {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  timeAgo: string;
  isVerified: boolean;
}

@Component({
  selector: 'app-category-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    HomeFooterComponent,
  ],
  templateUrl: './category-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full overflow-auto bg-white',
  },
})
export class CategoryPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authSession = inject(AuthSessionService);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly isMobileExpanded = signal(false);

  readonly categoryName = computed(() => this.queryParamMap().get('name')?.trim() || 'Phone & Tablet');
  readonly totalResults = signal('384,961');

  readonly desktopFilters: readonly CategoryFilterChip[] = [
    { id: 'location', label: 'Location', trailingIcon: 'chevron' },
    { id: 'price', label: 'Price', trailingIcon: 'chevron' },
    { id: 'condition', label: 'Condition', trailingIcon: 'chevron' },
    { id: 'verification', label: 'Verification status', trailingIcon: 'chevron' },
    { id: 'following', label: 'Following', trailingIcon: 'close' },
    { id: 'sort', label: 'Sort by: Recommended', trailingIcon: 'chevron' },
  ];

  readonly mobileFilters: readonly CategoryFilterChip[] = [
    { id: 'location', label: 'Location', trailingIcon: 'chevron' },
    { id: 'price', label: 'Price', trailingIcon: 'chevron' },
    { id: 'condition', label: 'Condition', trailingIcon: 'chevron' },
    { id: 'sort', label: 'Sort by', trailingIcon: 'chevron' },
  ];

  readonly listings: readonly CategoryListing[] = [
    {
      id: 'iphone-17-pro-max',
      title: 'iPhone 17 Pro Max',
      price: '₦2,500,000',
      image: '/assets/images/category-page/iphone-17-pro-max.png',
      location: 'Ikeja, Lagos',
      timeAgo: '5 mins ago',
      isVerified: true,
    },
    {
      id: 'iphone-x',
      title: 'iPhone X (64GB)',
      price: '₦350,000',
      image: '/assets/images/category-page/iphone-x.png',
      location: 'Lekki, Lagos',
      timeAgo: '12 mins ago',
      isVerified: true,
    },
    {
      id: 'macbook-air',
      title: 'MacBook Air M2',
      price: '₦1,450,000',
      image: '/assets/images/category-page/macbook-air.png',
      location: 'Wuse, Abuja',
      timeAgo: '17 mins ago',
      isVerified: true,
    },
    {
      id: 'gaming-headset',
      title: 'Gaming headset',
      price: '₦85,000',
      image: '/assets/images/category-page/gaming-headset.png',
      location: 'Port Harcourt',
      timeAgo: '23 mins ago',
      isVerified: true,
    },
    {
      id: 'airpods-pro',
      title: 'AirPods Pro 2',
      price: '₦280,000',
      image: '/assets/images/category-page/airpods-pro.png',
      location: 'Yaba, Lagos',
      timeAgo: '31 mins ago',
      isVerified: true,
    },
    {
      id: 'iphone-14-plus',
      title: 'iPhone 14 Plus',
      price: '₦1,150,000',
      image: '/assets/images/category-page/iphone-14-plus.png',
      location: 'Garki, Abuja',
      timeAgo: '45 mins ago',
      isVerified: true,
    },
    {
      id: 'bluetooth-speaker',
      title: 'Bluetooth speaker',
      price: '₦120,000',
      image: '/assets/images/category-page/bluetooth-speaker.png',
      location: 'Surulere, Lagos',
      timeAgo: '1 hr ago',
      isVerified: true,
    },
    {
      id: 'tecno-camon',
      title: 'Tecno Camon 30',
      price: '₦410,000',
      image: '/assets/images/category-page/tecno-camon.png',
      location: 'Benin City',
      timeAgo: '1 hr ago',
      isVerified: true,
    },
    {
      id: 'surface-pro',
      title: 'Surface Pro 9',
      price: '₦980,000',
      image: '/assets/images/category-page/surface-pro.png',
      location: 'Asokoro, Abuja',
      timeAgo: '2 hrs ago',
      isVerified: true,
    },
    {
      id: 'samsung-s24',
      title: 'Samsung S24 Ultra',
      price: '₦1,700,000',
      image: '/assets/images/category-page/samsung-s24.png',
      location: 'Ikeja, Lagos',
      timeAgo: '2 hrs ago',
      isVerified: true,
    },
    {
      id: 'anker-powerbank',
      title: 'Anker power bank',
      price: '₦65,000',
      image: '/assets/images/category-page/anker-powerbank.png',
      location: 'Ibadan, Oyo',
      timeAgo: '3 hrs ago',
      isVerified: true,
    },
    {
      id: 'ipad-air',
      title: 'iPad Air 5',
      price: '₦930,000',
      image: '/assets/images/category-page/ipad-air.png',
      location: 'Lekki, Lagos',
      timeAgo: '3 hrs ago',
      isVerified: true,
    },
  ];

  readonly visibleMobileListings = computed(() => (
    this.isMobileExpanded() ? this.listings : this.listings.slice(0, 8)
  ));

  readonly canShowMoreMobile = computed(() => !this.isMobileExpanded() && this.listings.length > 8);

  showMoreMobileListings(): void {
    this.isMobileExpanded.set(true);
  }
}
