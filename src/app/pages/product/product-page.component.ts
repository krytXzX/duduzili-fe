import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { Review } from '../../components/product/review-card.component';

interface ProductGalleryImage {
  readonly src: string;
  readonly alt: string;
  readonly eyebrow?: string;
}

interface ProductDetails {
  readonly id: string;
  readonly name: string;
  readonly price: string;
  readonly oldPrice: string;
  readonly discount: string;
  readonly lastUpdated: string;
  readonly description: string;
  readonly condition: string;
  readonly likes: string;
  readonly deliveryOptions: readonly string[];
  readonly images: readonly ProductGalleryImage[];
}

interface StoreDetails {
  readonly name: string;
  readonly location: string;
  readonly whatsappNumber: string;
  readonly followers: string;
  readonly products: string;
  readonly rating: string;
  readonly joined: string;
  readonly isVerified: boolean;
  readonly initials: string;
  readonly accentFrom: string;
  readonly accentTo: string;
  readonly bannerImage: string;
}

type ReportSubject = 'listing' | 'seller';
type SellerReportStep = 1 | 2;

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    BuyerDashboardNavbarComponent,
    ListingCardComponent,
    HomeFooterComponent,
  ],
  templateUrl: './product-page.component.html',
  host: {
    class: 'block h-full overflow-y-auto overflow-x-hidden bg-white text-[#1F1F1F]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);

  readonly productId = this.route.snapshot.paramMap.get('id') ?? 'iphone-16-pro';
  readonly isListingActionsMenuOpen = signal(false);
  readonly listingActionsMenuPosition = signal({ top: 0, left: 0 });
  readonly isMessageVendorModalOpen = signal(false);
  readonly isCallVendorModalOpen = signal(false);
  readonly isRequestCallbackModalOpen = signal(false);
  readonly isMakeOfferModalOpen = signal(false);
  readonly isReportModalOpen = signal(false);
  readonly isReportSuccessModalOpen = signal(false);
  readonly isSellerReportSuccessModalOpen = signal(false);
  readonly reportSubject = signal<ReportSubject>('listing');
  readonly sellerReportStep = signal<SellerReportStep>(1);
  readonly selectedSellerReportReason = signal<string | null>(null);
  readonly currentGalleryIndex = signal(0);
  readonly compactReviews = computed(() => this.reviews().slice(0, 2));
  readonly currentGalleryImage = computed(
    () => this.product().images[this.currentGalleryIndex()] ?? this.product().images[0],
  );
  readonly formattedOfferValue = computed(() => {
    const rawValue = this.makeOfferForm.controls.amount.value ?? '';
    const digitsOnly = rawValue.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      return '0.00';
    }

    return new Intl.NumberFormat('en-NG').format(Number(digitsOnly));
  });
  readonly reportModalTitle = computed(() =>
    this.reportSubject() === 'seller' ? 'Report seller' : 'Report listing as unavailable',
  );
  readonly reportModalDescription = computed(() =>
    this.reportSubject() === 'seller'
      ? 'Share what happened and our moderation team will review this seller.'
      : 'Tell us why this listing should be reviewed and we will take a closer look.',
  );

  readonly requestCallbackForm = this.formBuilder.nonNullable.group({
    name: ['Bryan Odjede', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
  });

  readonly makeOfferForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required]],
  });

  readonly reportForm = this.formBuilder.nonNullable.group({
    details: ['', [Validators.required]],
  });

  readonly sellerReportReasons = [
    'Suspected scam or fraud',
    'Seller is unresponsive after payment',
    'Selling prohibited or illegal items',
    'Repeatedly listing sold/unavailable items',
    'Other reason',
  ] as const;

  readonly product = signal<ProductDetails>({
    id: this.productId,
    name: 'Iphone 16 pro',
    price: '₦2,500,000',
    oldPrice: '₦35,000',
    discount: '-24%',
    lastUpdated: '24 January, 2026',
    description:
      'UK used iPhone 16 Pro, neatly used and fully working. Good battery health.',
    condition: 'Used',
    likes: '1.2k',
    deliveryOptions: ['Seller delivery', 'Nation-wide', 'Public location'],
    images: [
      {
        src: '/assets/images/product-mobile-gallery-1.png',
        alt: 'Front view of the featured product',
      },
      {
        src: '/assets/images/product-mobile-gallery-2.png',
        alt: 'Side angle of the featured product',
      },
      {
        src: '/assets/images/product-mobile-gallery-3.png',
        alt: 'What is inside the package',
        eyebrow: "What's inside",
      },
      {
        src: '/assets/images/product-mobile-gallery-4.png',
        alt: 'Extra gallery angle of the featured product',
      },
    ],
  });

  readonly store = signal<StoreDetails>({
    name: 'The Vine Collections',
    location: 'Ikeja, Lagos',
    whatsappNumber: '08169397454',
    followers: '2.5k',
    products: '1,456',
    rating: '4.8',
    joined: '16 Feb, 2024',
    isVerified: true,
    initials: 'VC',
    accentFrom: '#E3A03B',
    accentTo: '#3D785F',
    bannerImage: '/assets/images/hero_img_3.png',
  });

  readonly reviews = signal<Review[]>([
    {
      rating: 5,
      text: "I've bought items from this vendor and they had great customer service.",
      author: 'Olakunle Joshua',
      date: '4 days ago',
    },
    {
      rating: 5,
      text: "I've bought all this from The Vine Collections and they have wonderful service.",
      author: 'Oyin Bankole',
      date: '2 weeks ago',
    },
    {
      rating: 4,
      text: 'Delivery was a bit slow, but the product quality was worth the wait.',
      author: 'Michael Chen',
      date: '3 weeks ago',
    },
    {
      rating: 5,
      text: 'One of the most reliable tech vendors I have ordered from recently.',
      author: 'Blessing Okoro',
      date: '1 month ago',
    },
  ]);

  readonly moreFromSeller = signal<Listing[]>([
    {
      id: 'ms1',
      title: 'Logitech ergonomic mouse',
      price: '₦35,000',
      location: 'Ikeja, Lagos',
      timeAgo: '5 mins ago',
      isVerified: true,
      images: ['/assets/images/product_sneakers.png'],
    },
    {
      id: 'ms2',
      title: 'iPhone 17 Pro Max',
      price: '₦2,500,000',
      location: 'Ikeja, Lagos',
      timeAgo: '12 mins ago',
      isVerified: true,
      images: ['/assets/images/product_watch_luxury.png'],
    },
    {
      id: 'ms3',
      title: 'RGB keyboard',
      price: '₦35,000',
      location: 'Ikeja, Lagos',
      timeAgo: '15 mins ago',
      isVerified: true,
      images: ['/assets/images/product_keyboard_rgb.png'],
    },
    {
      id: 'ms4',
      title: 'Sweatshirt',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      timeAgo: '20 mins ago',
      isVerified: true,
      images: ['/assets/images/fashion_menswear_hero.png'],
    },
    {
      id: 'ms5',
      title: 'iPhone X (64 gb)',
      price: '₦35,000',
      location: 'Ikeja, Lagos',
      timeAgo: '2 mins ago',
      isVerified: true,
      images: ['/assets/images/product_watch_luxury.png'],
    },
  ]);

  readonly relatedItems = signal<Listing[]>([
    {
      id: 're1',
      title: 'Tie',
      price: '₦15,000',
      location: 'Ikeja, Lagos',
      timeAgo: '2 mins ago',
      isVerified: true,
      images: ['/assets/images/fashion_menswear.png'],
    },
    {
      id: 're2',
      title: 'McLaren',
      price: '₦200M',
      location: 'Ikeja, Lagos',
      timeAgo: '10 mins ago',
      isVerified: true,
      images: ['/assets/images/product_watch_luxury.png'],
    },
    {
      id: 're3',
      title: 'Perfume',
      price: '₦55,000',
      location: 'Ikeja, Lagos',
      timeAgo: '15 mins ago',
      isVerified: true,
      images: ['/assets/images/product_keyboard_rgb.png'],
    },
    {
      id: 're4',
      title: 'Watch for men',
      price: '₦25,000',
      location: 'Ikeja, Lagos',
      timeAgo: '25 mins ago',
      isVerified: true,
      images: ['/assets/images/product_watch_luxury.png'],
    },
    {
      id: 're5',
      title: 'Headphones',
      price: '₦85,000',
      location: 'Ikeja, Lagos',
      timeAgo: '30 mins ago',
      isVerified: true,
      images: ['/assets/images/product_keyboard_rgb.png'],
    },
  ]);

  readonly safetyTips = [
    'Avoid paying in advance, even for delivery.',
    'Meet with the seller at a safe public place.',
    'Inspect the item and ensure it is exactly what you want.',
    'Make sure the packed item is the one you inspected.',
    'Only pay if you are satisfied.',
  ] as const;

  readonly ratingStars = [1, 2, 3, 4, 5] as const;

  setGalleryIndex(index: number): void {
    this.currentGalleryIndex.set(index);
  }

  nextImage(): void {
    this.currentGalleryIndex.update(
      (currentIndex) => (currentIndex + 1) % this.product().images.length,
    );
  }

  prevImage(): void {
    this.currentGalleryIndex.update(
      (currentIndex) =>
        (currentIndex - 1 + this.product().images.length) % this.product().images.length,
    );
  }

  whatsappLink(): string {
    return `https://wa.me/234${this.store().whatsappNumber.replace(/^0/, '')}`;
  }

  phoneCallLink(): string {
    return `tel:${this.store().whatsappNumber}`;
  }

  initialsGradient(): string {
    return `linear-gradient(135deg, ${this.store().accentFrom} 0%, ${this.store().accentTo} 100%)`;
  }

  toggleListingActionsMenu(event?: MouseEvent): void {
    if (this.isListingActionsMenuOpen()) {
      this.closeListingActionsMenu();
      return;
    }

    const trigger = event?.currentTarget;

    if (trigger instanceof HTMLElement) {
      const rect = trigger.getBoundingClientRect();
      const menuWidth = 260;
      const horizontalPadding = 20;
      const maxLeft = Math.max(horizontalPadding, window.innerWidth - menuWidth - horizontalPadding);
      const nextLeft = Math.min(Math.max(horizontalPadding, rect.right - menuWidth), maxLeft);

      this.listingActionsMenuPosition.set({
        top: rect.bottom + 8,
        left: nextLeft,
      });
    }

    this.isListingActionsMenuOpen.set(true);
  }

  closeListingActionsMenu(): void {
    this.isListingActionsMenuOpen.set(false);
  }

  shareListing(): void {
    this.closeListingActionsMenu();

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      void navigator.share({
        title: this.product().name,
        text: `Check out ${this.product().name} on Duduzili`,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      }).catch(() => undefined);
    }
  }

  openReportModal(subject: ReportSubject): void {
    this.closeListingActionsMenu();
    this.reportSubject.set(subject);
    if (subject === 'seller') {
      this.resetSellerReportFlow();
    }
    this.isReportModalOpen.set(true);
  }

  closeReportModal(): void {
    this.isReportModalOpen.set(false);
    this.reportForm.reset({ details: '' });
    this.resetSellerReportFlow();
  }

  closeReportSuccessModal(): void {
    this.isReportSuccessModalOpen.set(false);
  }

  closeSellerReportSuccessModal(): void {
    this.isSellerReportSuccessModalOpen.set(false);
    this.resetSellerReportFlow();
  }

  openCallVendorModal(): void {
    this.isCallVendorModalOpen.set(true);
  }

  openRequestCallbackModal(): void {
    this.isRequestCallbackModalOpen.set(true);
  }

  openMakeOfferModal(): void {
    this.isMakeOfferModalOpen.set(true);
  }

  closeCallVendorModal(): void {
    this.isCallVendorModalOpen.set(false);
  }

  closeRequestCallbackModal(): void {
    this.isRequestCallbackModalOpen.set(false);
  }

  closeMakeOfferModal(): void {
    this.isMakeOfferModalOpen.set(false);
  }

  selectSellerReportReason(reason: string): void {
    this.selectedSellerReportReason.set(reason);
  }

  advanceSellerReportStep(): void {
    if (!this.selectedSellerReportReason()) {
      return;
    }

    this.sellerReportStep.set(2);
  }

  backSellerReportStep(): void {
    this.sellerReportStep.set(1);
  }

  submitRequestCallback(): void {
    if (this.requestCallbackForm.invalid) {
      this.requestCallbackForm.markAllAsTouched();
      return;
    }

    this.closeRequestCallbackModal();
    this.requestCallbackForm.reset({ name: 'Bryan Odjede', phoneNumber: '' });
  }

  submitOffer(): void {
    if (this.makeOfferForm.invalid) {
      this.makeOfferForm.markAllAsTouched();
      return;
    }

    this.closeMakeOfferModal();
    this.makeOfferForm.reset({ amount: '' });
  }

  submitReport(): void {
    if (this.reportForm.invalid) {
      this.reportForm.markAllAsTouched();
      return;
    }

    if (this.reportSubject() === 'listing') {
      this.closeReportModal();
      this.isReportSuccessModalOpen.set(true);
      return;
    }

    this.closeReportModal();
    this.isSellerReportSuccessModalOpen.set(true);
  }

  private resetSellerReportFlow(): void {
    this.sellerReportStep.set(1);
    this.selectedSellerReportReason.set(null);
  }
}
