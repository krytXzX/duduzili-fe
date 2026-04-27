import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { FooterComponent } from '../../components/layout/footer.component';
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

@Component({
  selector: 'app-product-page',
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NgOptimizedImage,
    BuyerDashboardNavbarComponent,
    ListingCardComponent,
    FooterComponent,
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
  readonly isMessageVendorModalOpen = signal(false);
  readonly isCallVendorModalOpen = signal(false);
  readonly isRequestCallbackModalOpen = signal(false);
  readonly isMakeOfferModalOpen = signal(false);
  readonly isReportModalOpen = signal(false);
  readonly reportSubject = signal<ReportSubject>('listing');
  readonly currentGalleryIndex = signal(0);
  readonly compactReviews = computed(() => this.reviews().slice(0, 2));
  readonly currentGalleryImage = computed(
    () => this.product().images[this.currentGalleryIndex()] ?? this.product().images[0],
  );
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

  readonly product = signal<ProductDetails>({
    id: this.productId,
    name: 'Iphone 16 pro',
    price: '₦2,500,000',
    oldPrice: '₦35,000',
    discount: '-24%',
    lastUpdated: '24 January, 2026',
    description:
      'UK used iPhone 16 pro, activated and fully working. Good battery health and clean body with all ports tested.',
    condition: 'Used',
    likes: '1.2k',
    deliveryOptions: ['Seller delivery', 'Pickup shop', 'Public location'],
    images: [
      {
        src: '/assets/images/product_watch_luxury.png',
        alt: 'Front view of the featured product',
      },
      {
        src: '/assets/images/product_keyboard_rgb.png',
        alt: 'Side angle of the featured product',
      },
      {
        src: '/assets/images/product_sneakers_lifestyle.png',
        alt: 'What is inside the package',
        eyebrow: "What's inside",
      },
      {
        src: '/assets/images/fashion_menswear_hero.png',
        alt: 'Lifestyle angle of the featured product',
      },
      {
        src: '/assets/images/hero_img_4.png',
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

  toggleListingActionsMenu(): void {
    this.isListingActionsMenuOpen.update((value) => !value);
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
    this.isReportModalOpen.set(true);
  }

  closeReportModal(): void {
    this.isReportModalOpen.set(false);
    this.reportForm.reset({ details: '' });
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

    this.closeReportModal();
  }
}
