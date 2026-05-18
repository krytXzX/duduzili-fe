import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { Review } from '../../components/product/review-card.component';
import { ListingsApiItem, ListingsService } from '../../services/listings.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { VendorsService, VendorFollowResponse } from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

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
  readonly id: string;
  readonly name: string;
  readonly location: string;
  readonly whatsappNumber: string;
  readonly followers: string;
  readonly products: string;
  readonly rating: string;
  readonly joined: string;
  readonly isVerified: boolean;
  readonly isFollowed: boolean;
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
    AppToastComponent,
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
  private readonly listingsService = inject(ListingsService);
  private readonly vendorsService = inject(VendorsService);
  private readonly authSession = inject(AuthSessionService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

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
  readonly isFollowPending = signal(false);
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
    id: 'the-vine-collections-7691',
    name: 'The Vine Collections',
    location: 'Ikeja, Lagos',
    whatsappNumber: '08169397454',
    followers: '2.5k',
    products: '1,456',
    rating: '4.8',
    joined: '16 Feb, 2024',
    isVerified: true,
    isFollowed: false,
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

  constructor() {
    void this.loadProductDetails();
  }

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

  async toggleVendorFollow(): Promise<void> {
    if (this.isFollowPending()) {
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      if (typeof window !== 'undefined') {
        void Promise.resolve().then(() => (window.location.href = '/sign-in'));
      }
      return;
    }

    const vendorId = this.store().id;
    if (!vendorId) {
      return;
    }

    const previousState = this.store().isFollowed;
    this.isFollowPending.set(true);

    try {
      const response = await firstValueFrom(this.vendorsService.toggleFollow(vendorId));
      const nextState = this.resolveVendorFollowState(response, previousState);
      const nextFollowers = this.resolveFollowerCount(
        response['followers_count'],
        this.store().followers,
        previousState,
        nextState,
      );

      this.store.update((store) => ({
        ...store,
        isFollowed: nextState,
        followers: nextFollowers,
      }));
    } finally {
      this.isFollowPending.set(false);
    }
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

  private async loadProductDetails(): Promise<void> {
    try {
      const record = await firstValueFrom(this.listingsService.getListingDetails(this.productId));
      this.applyProductDetails(record);
    } catch {
      // Keep the existing fallback content when the detail request fails.
    }
  }

  private applyProductDetails(record: ListingsApiItem): void {
    const storeInfo = this.readRecord(record['store_info']);
    const galleryImages = this.extractGalleryImages(record);
    const productName = this.readString(record['title']) ?? this.product().name;
    const formattedPrice =
      this.formatPrice(record['price']) ?? this.product().price;
    const formattedOldPrice =
      this.formatPrice(record['original_price']) ?? this.product().oldPrice;
    const formattedDiscount =
      this.formatDiscountBadge(record['discount_percentage']) ?? this.product().discount;
    const description =
      this.readString(record['description']) ?? this.product().description;
    const condition =
      this.formatCondition(record['condition']) ?? this.product().condition;
    const lastUpdated =
      this.formatDate(record['updated_at'] ?? record['created_at']) ?? this.product().lastUpdated;
    const likes =
      this.formatCount(record['likes_count']) ?? this.product().likes;
    const deliveryOptions =
      this.extractDeliveryOptions(record) ?? this.product().deliveryOptions;
    const storeName =
      this.readString(storeInfo?.['store_name']) ??
      this.readString(record['store_name']) ??
      this.readString(record['vendor_name']) ??
      this.store().name;
    const storeLocation =
      this.readString(storeInfo?.['location']) ??
      this.readString(record['store_location']) ??
      this.composeLocation(record) ??
      this.store().location;
    const callNumber =
      this.readString(storeInfo?.['whatsapp_number']) ??
      this.readString(storeInfo?.['call_number']) ??
      this.readString(record['whatsapp_number']) ??
      this.readString(record['call_number']) ??
      this.store().whatsappNumber;
    const joined =
      this.formatDate(storeInfo?.['date_joined'] ?? record['date_joined'] ?? record['created_at']) ??
      this.store().joined;
    const bannerImage =
      this.resolveMediaUrl(
        this.readString(storeInfo?.['cover_image']) ??
          this.readString(storeInfo?.['banner_image']) ??
          this.readString(record['store_cover_image']) ??
          this.readString(record['cover_image']) ??
          this.readString(record['banner_image']),
      ) ?? this.store().bannerImage;
    const relatedListings = this.extractRelatedListings(record['related_items']);
    const sellerListings = this.extractRelatedListings(
      record['more_from_seller'] ?? record['seller_listings'],
    );

    this.currentGalleryIndex.set(0);
    this.product.set({
      ...this.product(),
      id: this.readString(record['id']) ?? this.productId,
      name: productName,
      price: formattedPrice,
      oldPrice: formattedOldPrice,
      discount: formattedDiscount,
      lastUpdated,
      description,
      condition,
      likes,
      deliveryOptions,
      images: galleryImages,
    });
    this.store.set({
      ...this.store(),
      id:
        this.readString(storeInfo?.['id']) ??
        this.readString(record['vendor_id']) ??
        this.readString(record['store_id']) ??
        this.store().id,
      name: storeName,
      location: storeLocation,
      whatsappNumber: callNumber,
      followers:
        this.formatCount(storeInfo?.['followers_count'] ?? record['followers_count']) ??
        this.store().followers,
      products:
        this.formatCount(storeInfo?.['products_count'] ?? record['products_count']) ??
        this.store().products,
      rating:
        this.formatRating(
          storeInfo?.['average_rating'] ??
            storeInfo?.['store_rating'] ??
            record['average_rating'] ??
            record['store_rating'],
        ) ?? this.store().rating,
      joined,
      isVerified:
        this.readBoolean(
          storeInfo?.['is_verified'] ??
            this.readRecord(record['user'])?.['is_verified'] ??
            record['is_verified'],
        ) ?? this.store().isVerified,
      isFollowed: this.readBoolean(record['is_followed']) ?? this.store().isFollowed,
      initials: this.buildInitials(storeName),
      bannerImage,
    });

    if (sellerListings.length > 0) {
      this.moreFromSeller.set(sellerListings);
    }

    if (relatedListings.length > 0) {
      this.relatedItems.set(relatedListings);
    }
  }

  private extractGalleryImages(record: ListingsApiItem): readonly ProductGalleryImage[] {
    const galleryCandidates = [
      record['images'],
      record['gallery'],
      record['photos'],
      record['media'],
    ];

    for (const candidate of galleryCandidates) {
      const images = this.toGalleryImages(candidate);
      if (images.length > 0) {
        return images;
      }
    }

    const singleImage =
      this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['cover_image']));

    if (singleImage) {
      return [{ src: singleImage, alt: this.readString(record['title']) ?? 'Listing image' }];
    }

    return this.product().images;
  }

  private toGalleryImages(value: unknown): ProductGalleryImage[] {
    if (!Array.isArray(value)) {
      return [];
    }

    const images = value
      .map((entry, index) => {
        if (typeof entry === 'string') {
          return {
            src: this.resolveMediaUrl(entry) ?? '',
            alt: `${this.product().name} image ${index + 1}`,
          };
        }

        const record = this.readRecord(entry);
        if (!record) {
          return null;
        }

        const src =
          this.resolveMediaUrl(this.readString(record['image'])) ??
          this.resolveMediaUrl(this.readString(record['url'])) ??
          this.resolveMediaUrl(this.readString(record['src'])) ??
          this.resolveMediaUrl(this.readString(record['thumbnail']));

        if (!src) {
          return null;
        }

        return {
          src,
          alt:
            this.readString(record['alt']) ??
            this.readString(record['label']) ??
            `${this.product().name} image ${index + 1}`,
          eyebrow: this.readString(record['eyebrow']) ?? undefined,
        };
      })
      .filter((image): image is ProductGalleryImage => image !== null && image.src.length > 0);

    return images;
  }

  private extractDeliveryOptions(record: ListingsApiItem): readonly string[] | null {
    const candidate = record['delivery_options'];
    if (Array.isArray(candidate)) {
      const options = candidate.filter((option): option is string => typeof option === 'string');
      return options.length > 0 ? options : null;
    }

    return null;
  }

  private extractRelatedListings(value: unknown): Listing[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((entry, index) => {
        const record = this.readRecord(entry);
        return record ? this.toListingCard(record, index) : null;
      })
      .filter((listing): listing is Listing => listing !== null);
  }

  private toListingCard(record: ListingsApiItem, index: number): Listing | null {
    const title =
      this.readString(record['title']) ??
      this.readString(record['name']) ??
      this.readString(record['listing_name']);
    const price = this.formatPrice(record['price']);

    if (!title || !price) {
      return null;
    }

    return {
      id: this.readString(record['id']) ?? `related-${index + 1}`,
      title,
      price,
      originalPrice: this.formatPrice(record['original_price']) ?? undefined,
      discountBadge: this.formatDiscountBadge(record['discount_percentage']) ?? undefined,
      location: this.composeLocation(record) ?? 'Nigeria',
      timeAgo: this.formatRelativeTime(record['created_at']) ?? 'Recently',
      isVerified:
        this.readBoolean(
          this.readRecord(record['user'])?.['is_verified'] ?? record['is_verified'],
        ) ?? false,
      images: this.extractListingImages(record),
    };
  }

  private extractListingImages(record: ListingsApiItem): string[] {
    const arrayCandidates = [record['images'], record['gallery'], record['photos']];

    for (const candidate of arrayCandidates) {
      if (!Array.isArray(candidate)) {
        continue;
      }

      const images = candidate
        .map((entry) => {
          if (typeof entry === 'string') {
            return this.resolveMediaUrl(entry);
          }

          const entryRecord = this.readRecord(entry);
          if (!entryRecord) {
            return null;
          }

          return (
            this.resolveMediaUrl(this.readString(entryRecord['image'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['url'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['src'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['thumbnail']))
          );
        })
        .filter((image): image is string => typeof image === 'string' && image.length > 0);

      if (images.length > 0) {
        return images;
      }
    }

    const singleImage =
      this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['cover_image']));

    return singleImage ? [singleImage] : ['/assets/images/home-item-placeholder.png'];
  }

  private formatPrice(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return `₦${new Intl.NumberFormat('en-NG').format(parsed)}`;
  }

  private formatDiscountBadge(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null || parsed <= 0) {
      return null;
    }

    return `-${Math.round(parsed)}%`;
  }

  private formatDate(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  private formatRelativeTime(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const createdAt = new Date(value);
    if (Number.isNaN(createdAt.getTime())) {
      return null;
    }

    const diffInMinutes = Math.max(1, Math.floor((Date.now() - createdAt.getTime()) / 60000));
    if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hrs ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} days ago`;
  }

  private formatCount(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    if (parsed >= 1000) {
      return `${(parsed / 1000).toFixed(parsed >= 10000 ? 0 : 1).replace(/\.0$/, '')}k`;
    }

    return new Intl.NumberFormat('en-NG').format(parsed);
  }

  private formatRating(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return parsed.toFixed(1);
  }

  private formatCondition(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private composeLocation(record: ListingsApiItem): string | null {
    const location = this.readString(record['location']);
    if (location) {
      return location;
    }

    const city = this.readString(record['city']);
    const state = this.readString(record['state']);

    if (city && state && !city.includes(state)) {
      return `${city}, ${state}`;
    }

    return city ?? state ?? null;
  }

  private resolveMediaUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized.endsWith('k')) {
        const parsed = Number(normalized.slice(0, -1));
        return Number.isFinite(parsed) ? parsed * 1000 : null;
      }

      const parsed = Number(normalized.replace(/,/g, ''));
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private buildInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return 'DV';
    }

    return words
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() ?? '')
      .join('');
  }

  private resolveVendorFollowState(
    response: VendorFollowResponse,
    previousState: boolean,
  ): boolean {
    const directState = response['is_followed'];
    if (typeof directState === 'boolean') {
      return directState;
    }

    const nestedState =
      typeof response['data'] === 'object' && response['data'] !== null
        ? (response['data'] as Record<string, unknown>)['is_followed']
        : null;

    if (typeof nestedState === 'boolean') {
      return nestedState;
    }

    return !previousState;
  }

  private resolveFollowerCount(
    backendValue: unknown,
    currentValue: string,
    previousState: boolean,
    nextState: boolean,
  ): string {
    const backendCount = this.formatCount(backendValue);
    if (backendCount) {
      return backendCount;
    }

    const currentCount = this.readNumber(currentValue);
    if (currentCount === null || previousState === nextState) {
      return currentValue;
    }

    const nextCount = nextState ? currentCount + 1 : Math.max(0, currentCount - 1);
    return this.formatCount(nextCount) ?? currentValue;
  }
}
