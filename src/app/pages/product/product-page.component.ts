import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { Review } from '../../components/product/review-card.component';
import { SellerReportModalComponent } from '../../components/product/seller-report-modal.component';
import {
  ListingsApiItem,
  ListingsSearchResponse,
  ListingsService,
  ToggleWishlistResponse,
} from '../../services/listings.service';
import { AppToastService } from '../../services/app-toast.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { FavoritesStateService } from '../../services/favorites-state.service';
import { MessagesService } from '../../services/messages.service';
import {
  VendorsService,
  VendorFollowResponse,
  VendorListingRecord,
  VendorListingsResponse,
  VendorRecord,
  VendorReviewRecord,
  VendorReviewsResponse,
} from '../../services/vendors.service';
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
  readonly hasDiscount: boolean;
  readonly lastUpdated: string;
  readonly description: string;
  readonly condition: string;
  readonly saves: string;
  readonly isSaved: boolean;
  readonly deliveryOptions: readonly string[];
  readonly images: readonly ProductGalleryImage[];
}

interface StoreDetails {
  readonly id: string;
  readonly ownerUserId: string | null;
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
  readonly logoImage: string;
  readonly bannerImage: string;
}

type ProductReviewSort = 'most-recent' | 'highest-rated';

interface ReviewTagSummary {
  readonly label: string;
  readonly count: number;
}

interface ReviewRatingBreakdownItem {
  readonly stars: number;
  readonly count: number;
  readonly percentage: number;
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
    SellerReportModalComponent,
  ],
  templateUrl: './product-page.component.html',
  host: {
    class: 'block h-full overflow-y-auto overflow-x-hidden bg-white text-[#1F1F1F]',
    '(document:keydown.escape)': 'handleOverlayEscape()',
  },
  styles: [
    `
      .skeleton-shimmer {
        position: relative;
        overflow: hidden;
        background: #f1f3f6;
      }

      .skeleton-shimmer::after {
        position: absolute;
        inset: 0;
        content: '';
        transform: translateX(-100%);
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.72) 50%,
          rgba(255, 255, 255, 0) 100%
        );
        animation: product-skeleton-shimmer 1.45s ease-in-out infinite;
      }

      @keyframes product-skeleton-shimmer {
        100% {
          transform: translateX(100%);
        }
      }

      :host button:not(:disabled),
      :host a {
        transition-duration: 180ms;
        transition-timing-function: cubic-bezier(0.2, 0, 0, 1);
      }

      :host button:not(:disabled):focus-visible,
      :host a:focus-visible {
        outline: 2px solid #6453d9;
        outline-offset: 3px;
      }

      :host button:not(:disabled):hover {
        filter: brightness(0.985);
      }

      :host button:not(:disabled):active {
        filter: brightness(0.94);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly listingsService = inject(ListingsService);
  private readonly vendorsService = inject(VendorsService);
  private readonly appToastService = inject(AppToastService);
  private readonly authSession = inject(AuthSessionService);
  private readonly favoritesStateService = inject(FavoritesStateService);
  private readonly messagesService = inject(MessagesService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  readonly productId = signal(this.route.snapshot.paramMap.get('id') ?? '');
  readonly isListingActionsMenuOpen = signal(false);
  readonly listingActionsMenuPosition = signal({ top: 0, left: 0 });
  readonly isMessageVendorModalOpen = signal(false);
  readonly isCallVendorModalOpen = signal(false);
  readonly isRequestCallbackModalOpen = signal(false);
  readonly isMakeOfferModalOpen = signal(false);
  readonly isShareListingModalOpen = signal(false);
  readonly isReviewsModalOpen = signal(false);
  readonly isReportModalOpen = signal(false);
  readonly isReportSuccessModalOpen = signal(false);
  readonly isSellerReportSuccessModalOpen = signal(false);
  readonly reportSubject = signal<ReportSubject>('listing');
  readonly sellerReportStep = signal<SellerReportStep>(1);
  readonly selectedSellerReportReason = signal<string | null>(null);
  readonly currentGalleryIndex = signal(0);
  readonly isGalleryPreviewOpen = signal(false);
  readonly isFollowPending = signal(false);
  readonly isWishlistPending = signal(false);
  readonly hasCopiedShareUrl = signal(false);
  readonly isSubmittingListingReport = signal(false);
  readonly isSubmittingSellerReport = signal(false);
  readonly isStartingConversation = signal(false);
  readonly isSubmittingOffer = signal(false);
  readonly isSubmittingCallbackRequest = signal(false);
  readonly isProductLoading = signal(true);
  readonly productLoadError = signal<string | null>(null);
  readonly reviewSort = signal<ProductReviewSort>('most-recent');
  readonly compactReviews = computed(() => this.reviews().slice(0, 2));
  readonly reviewAverageValue = computed(() => {
    const reviews = this.reviews();
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return total / reviews.length;
  });
  readonly reviewAverage = computed(() => this.reviewAverageValue().toFixed(1));
  readonly reviewAveragePrecise = computed(() => this.reviewAverageValue().toFixed(2));
  readonly reviewCount = computed(() => this.reviews().length);
  readonly reviewCountLabel = computed(() => {
    const count = this.reviewCount();
    return `${count} ${count === 1 ? 'rating' : 'ratings'}`;
  });
  readonly reviewTotalLabel = computed(() => {
    const count = new Intl.NumberFormat('en-NG').format(this.reviewCount());
    return `${count} reviews`;
  });
  readonly reviewSortLabel = computed(() =>
    this.reviewSort() === 'most-recent' ? 'Most recent' : 'Highest rated',
  );
  readonly sortedReviews = computed(() => {
    const reviews = [...this.reviews()];

    if (this.reviewSort() === 'highest-rated') {
      return reviews.sort((left, right) => right.rating - left.rating || right.date.localeCompare(left.date));
    }

    return reviews.sort((left, right) => this.reviewTimestamp(right.date) - this.reviewTimestamp(left.date));
  });
  readonly reviewTagSummaries = computed<readonly ReviewTagSummary[]>(() => {
    const counts = new Map<string, number>();

    for (const review of this.reviews()) {
      for (const tag of review.tags ?? []) {
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label))
      .slice(0, 5);
  });
  readonly ratingBreakdown = computed<readonly ReviewRatingBreakdownItem[]>(() => {
    const reviews = this.reviews();
    const total = reviews.length;

    return [5, 4, 3, 2, 1].map((stars) => {
      const count = reviews.filter((review) => review.rating === stars).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { stars, count, percentage };
    });
  });
  readonly isProductSaved = computed(() =>
    this.product().isSaved || this.favoritesStateService.isFavorited(this.product().id),
  );
  readonly isOwnStore = computed(() => {
    const currentUserId = this.authSession.user()?.id;
    const ownerUserId = this.store().ownerUserId;

    return currentUserId !== undefined && ownerUserId !== null && String(currentUserId) === ownerUserId;
  });
  readonly currentGalleryImage = computed(
    () => this.product().images[this.currentGalleryIndex()] ?? this.product().images[0] ?? null,
  );
  readonly shareUrl = computed(() => this.document.defaultView?.location.href ?? '');
  readonly canUseNativeShare = computed(
    () => typeof navigator !== 'undefined' && 'share' in navigator,
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
    name: ['', [Validators.required]],
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
    id: this.productId(),
    name: '',
    price: '',
    oldPrice: '',
    discount: '',
    hasDiscount: false,
    lastUpdated: '',
    description: '',
    condition: '',
    saves: '0',
    isSaved: false,
    deliveryOptions: [],
    images: [],
  });

  readonly store = signal<StoreDetails>({
    id: '',
    ownerUserId: null,
    name: '',
    location: '',
    whatsappNumber: '',
    followers: '0',
    products: '0',
    rating: '0.0',
    joined: '',
    isVerified: false,
    isFollowed: false,
    initials: '',
    accentFrom: '#E5E7EB',
    accentTo: '#CBD5E1',
    logoImage: '',
    bannerImage: '',
  });

  readonly reviews = signal<Review[]>([]);

  readonly moreFromSeller = signal<Listing[]>([]);

  readonly relatedItems = signal<Listing[]>([]);

  readonly safetyTips = [
    'Avoid paying in advance, even for delivery.',
    'Meet with the seller at a safe public place.',
    'Inspect the item and ensure it is exactly what you want.',
    'Make sure the packed item is the one you inspected.',
    'Only pay if you are satisfied.',
  ] as const;

  readonly ratingStars = [1, 2, 3, 4, 5] as const;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.document.body.style.overflow = '';
    });

    // Subscribe to live param changes so navigating between products
    // (e.g. "More from store" / "Explore related items") properly reloads.
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const id = params.get('id') ?? '';
      if (id && id !== this.productId()) {
        this.productId.set(id);
        // Reset state for the new product
        this.currentGalleryIndex.set(0);
        this.reviewSort.set('most-recent');
        this.moreFromSeller.set([]);
        this.relatedItems.set([]);
        this.reviews.set([]);
        // Scroll host element back to top
        this.document.querySelector('app-product-page')?.scrollTo({ top: 0, behavior: 'instant' });
      }
      void this.loadProductDetails();
    });

    if (this.route.snapshot.queryParamMap.get('report') === 'seller') {
      this.openReportModal('seller');
    }
  }

  openGalleryPreview(index = this.currentGalleryIndex()): void {
    this.setGalleryIndex(index);
    this.isGalleryPreviewOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  closeGalleryPreview(): void {
    this.isGalleryPreviewOpen.set(false);
    this.setBodyScrollLocked(false);
  }

  setGalleryIndex(index: number): void {
    this.currentGalleryIndex.set(index);
  }

  nextImage(): void {
    const imageCount = this.product().images.length;
    if (imageCount === 0) {
      return;
    }

    this.currentGalleryIndex.update(
      (currentIndex) => (currentIndex + 1) % imageCount,
    );
  }

  prevImage(): void {
    const imageCount = this.product().images.length;
    if (imageCount === 0) {
      return;
    }

    this.currentGalleryIndex.update(
      (currentIndex) =>
        (currentIndex - 1 + imageCount) % imageCount,
    );
  }

  galleryImageCountLabel(): string {
    if (this.product().images.length === 0) {
      return '0/0';
    }

    return `${this.currentGalleryIndex() + 1}/${this.product().images.length}`;
  }

  handleOverlayEscape(): void {
    if (this.isReviewsModalOpen()) {
      this.closeReviewsModal();
      return;
    }

    if (this.isShareListingModalOpen()) {
      this.closeShareListingModal();
      return;
    }

    if (this.isGalleryPreviewOpen()) {
      this.closeGalleryPreview();
    }
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
    this.hasCopiedShareUrl.set(false);
    this.isShareListingModalOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  closeShareListingModal(): void {
    this.isShareListingModalOpen.set(false);
    this.hasCopiedShareUrl.set(false);
    this.setBodyScrollLocked(false);
  }

  openReviewsModal(): void {
    this.isReviewsModalOpen.set(true);
    this.setBodyScrollLocked(true);
  }

  closeReviewsModal(): void {
    this.isReviewsModalOpen.set(false);
    this.setBodyScrollLocked(false);
  }

  toggleReviewSort(): void {
    this.reviewSort.update((current) =>
      current === 'most-recent' ? 'highest-rated' : 'most-recent',
    );
  }

  async leaveReviewFromProduct(): Promise<void> {
    const storeId = this.store().id;
    if (!storeId) {
      return;
    }

    this.closeReviewsModal();
    await this.router.navigate(['/stores', storeId], {
      queryParams: { tab: 'reviews', review: '1' },
    });
  }

  reviewAuthorInitials(review: Review): string {
    return review.author
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U';
  }

  reviewBarWidth(percentage: number): string {
    return `${Math.max(0, Math.min(100, percentage))}%`;
  }

  async shareListingWithDevice(): Promise<void> {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: 'This listing can’t be shared right now. Please try again in a moment.',
      });
      return;
    }

    if (!(typeof navigator !== 'undefined' && 'share' in navigator)) {
      this.appToastService.show({
        message: 'Sharing is not available on this device.',
      });
      return;
    }

    try {
      await navigator.share({
        title: this.product().name,
        text: `Check out ${this.product().name} on Duduzili`,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      this.appToastService.show({
        message: 'This listing can’t be shared right now. Please try again in a moment.',
      });
    }
  }

  async copyShareUrl(): Promise<void> {
    this.closeListingActionsMenu();

    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: 'This listing can’t be shared right now. Please try again in a moment.',
      });
      return;
    }

    const copied = await this.copyTextToClipboard(shareUrl);
    if (copied) {
      this.hasCopiedShareUrl.set(true);
      this.appToastService.show({
        message: 'Listing link copied',
        durationMs: 2200,
      });
      return;
    }

    this.appToastService.show({
      message: 'This listing can’t be shared right now. Please try again in a moment.',
    });
  }

  shareViaWhatsApp(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://wa.me/?text=${encodeURIComponent(`Check out ${this.product().name} on Duduzili: ${shareUrl}`)}`,
    );
  }

  shareViaEmail(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `mailto:?subject=${encodeURIComponent(this.product().name)}&body=${encodeURIComponent(`Check out ${this.product().name} on Duduzili: ${shareUrl}`)}`,
    );
  }

  shareViaX(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out ${this.product().name} on Duduzili`)}&url=${encodeURIComponent(shareUrl)}`,
    );
  }

  private async copyTextToClipboard(value: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fall back to execCommand when clipboard permissions are unavailable.
    }

    const textArea = this.document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    this.document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return this.document.execCommand('copy');
    } catch {
      return false;
    } finally {
      this.document.body.removeChild(textArea);
    }
  }

  private openExternalShareUrl(url: string): void {
    this.document.defaultView?.open(url, '_blank', 'noopener,noreferrer');
  }

  private setBodyScrollLocked(isLocked: boolean): void {
    this.document.body.style.overflow = isLocked ? 'hidden' : '';
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

  openMessageVendorModal(): void {
    if (this.isOwnStore()) {
      this.appToastService.show({
        message: 'You cannot message your own store.',
      });
      return;
    }

    this.isMessageVendorModalOpen.set(true);
  }

  openRequestCallbackModal(): void {
    this.isRequestCallbackModalOpen.set(true);
  }

  openMakeOfferModal(): void {
    this.isMakeOfferModalOpen.set(true);
  }

  async viewStoreProfile(): Promise<void> {
    const storeId = this.store().id;
    if (!storeId) {
      return;
    }

    await this.router.navigate(['/stores', storeId]);
  }

  async startInAppConversation(): Promise<void> {
    if (this.isStartingConversation()) {
      return;
    }

    if (this.isOwnStore()) {
      this.appToastService.show({
        message: 'You cannot message your own store.',
      });
      this.isMessageVendorModalOpen.set(false);
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      await this.router.navigate(['/sign-in']);
      return;
    }

    const storeId = this.store().id;
    if (!storeId) {
      return;
    }

    this.isStartingConversation.set(true);

    try {
      const response = await firstValueFrom(this.messagesService.startConversation(storeId));
      const conversationId = this.readString(response['id']) ?? this.readString(response['chat_id']);

      this.isMessageVendorModalOpen.set(false);
      await this.router.navigate(['/chats'], {
        queryParams: conversationId ? { conversation: conversationId } : undefined,
      });
    } catch (error) {
      this.appToastService.show({
        message: this.extractErrorMessage(error) ?? 'We couldn’t open this chat right now. Please try again.',
      });
    } finally {
      this.isStartingConversation.set(false);
    }
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

  async toggleWishlist(closeMenu = false): Promise<void> {
    if (closeMenu) {
      this.closeListingActionsMenu();
    }

    if (this.isWishlistPending()) {
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      this.appToastService.show({
        message: 'Please sign in to add listings to your wishlist',
        imageSrc: this.product().images[0]?.src ?? undefined,
        imageAlt: this.product().name,
        durationMs: 1200,
      });
      setTimeout(() => {
        void this.router.navigate(['/sign-in']);
      }, 1200);
      return;
    }

    const productId = this.product().id;
    if (!productId) {
      return;
    }

    const wasSaved = this.isProductSaved();
    this.isWishlistPending.set(true);

    try {
      const response = await firstValueFrom(this.listingsService.toggleWishlist(productId));
      const nextIsSaved = this.resolveWishlistState(response, wasSaved);
      const nextSaveCount = this.resolveSaveCount(this.product().saves, wasSaved, nextIsSaved);

      if (nextIsSaved) {
        this.favoritesStateService.add(productId);
      } else {
        this.favoritesStateService.remove(productId);
      }

      this.product.update((product) => ({
        ...product,
        isSaved: nextIsSaved,
        saves: nextSaveCount,
      }));

      this.appToastService.show({
        message: nextIsSaved ? 'Added to Wishlist' : 'Removed from Wishlist',
        imageSrc: this.product().images[0]?.src ?? undefined,
        imageAlt: this.product().name,
      });
    } catch {
      this.appToastService.show({
        message: 'We couldn’t update your wishlist right now. Please try again.',
      });
    } finally {
      this.isWishlistPending.set(false);
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

    if (!this.authSession.isAuthenticated()) {
      void this.router.navigate(['/sign-in']);
      return;
    }

    if (this.isSubmittingCallbackRequest()) {
      return;
    }

    const formValue = this.requestCallbackForm.getRawValue();
    const phoneNumber = formValue.phoneNumber.trim();
    const buyerName = formValue.name.trim();

    if (!phoneNumber) {
      this.requestCallbackForm.controls.phoneNumber.markAsTouched();
      return;
    }

    this.isSubmittingCallbackRequest.set(true);

    void firstValueFrom(
      this.listingsService.createCallbackRequest({
        listing: this.product().id,
        phone_number: phoneNumber,
        message: buyerName ? `Requested by ${buyerName}` : '',
      }),
    )
      .then(() => {
        this.closeRequestCallbackModal();
        this.requestCallbackForm.reset({ name: buyerName, phoneNumber: '' });
        this.appToastService.show({
          message: 'Your callback request has been sent.',
        });
      })
      .catch(() => {
        this.appToastService.show({
          message: 'Your callback request couldn’t be sent right now. Please try again.',
        });
      })
      .finally(() => {
        this.isSubmittingCallbackRequest.set(false);
      });
  }

  submitOffer(): void {
    if (this.makeOfferForm.invalid) {
      this.makeOfferForm.markAllAsTouched();
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      void this.router.navigate(['/sign-in']);
      return;
    }

    if (this.isSubmittingOffer()) {
      return;
    }

    const amount = this.makeOfferForm.controls.amount.getRawValue().replace(/[^\d]/g, '');
    if (!amount) {
      this.makeOfferForm.controls.amount.markAsTouched();
      return;
    }

    this.isSubmittingOffer.set(true);

    void firstValueFrom(
      this.listingsService.createOffer({
        listing: this.product().id,
        offer_amount: amount,
      }),
    )
      .then(() => {
        this.closeMakeOfferModal();
        this.makeOfferForm.reset({ amount: '' });
        this.appToastService.show({
          message: 'Your offer has been sent.',
        });
      })
      .catch(() => {
        this.appToastService.show({
          message: 'Your offer couldn’t be sent right now. Please try again.',
        });
      })
      .finally(() => {
        this.isSubmittingOffer.set(false);
      });
  }

  handleOfferAmountInput(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const digitsOnly = input?.value.replace(/[^\d]/g, '') ?? '';
    this.makeOfferForm.controls.amount.setValue(digitsOnly, { emitEvent: true });
  }

  async submitReport(): Promise<void> {
    if (this.reportSubject() === 'listing') {
      if (this.reportForm.invalid) {
        this.reportForm.markAllAsTouched();
        return;
      }

      if (this.isSubmittingListingReport()) {
        return;
      }

      this.isSubmittingListingReport.set(true);

      try {
        await firstValueFrom(
          this.listingsService.createListingReport(this.product().id, {
            description: this.reportForm.controls.details.getRawValue().trim(),
          }),
        );
        this.closeReportModal();
        this.isReportSuccessModalOpen.set(true);
      } catch {
        this.appToastService.show({
          message: 'We couldn’t submit that report right now. Please try again.',
        });
      } finally {
        this.isSubmittingListingReport.set(false);
      }
      return;
    }

    const vendorId = this.store().id;
    const sellerReason = this.toSellerReportReason(this.selectedSellerReportReason());

    if (!vendorId || !sellerReason) {
      this.appToastService.show({
        message: 'We couldn’t submit that report right now. Please try again.',
      });
      return;
    }

    if (this.isSubmittingSellerReport()) {
      return;
    }

    this.isSubmittingSellerReport.set(true);

    try {
      await firstValueFrom(
        this.listingsService.createSellerReport(vendorId, {
          reason: sellerReason,
        }),
      );
      this.closeReportModal();
      this.isSellerReportSuccessModalOpen.set(true);
    } catch {
      this.appToastService.show({
        message: 'We couldn’t submit that report right now. Please try again.',
      });
    } finally {
      this.isSubmittingSellerReport.set(false);
    }
  }

  private resetSellerReportFlow(): void {
    this.sellerReportStep.set(1);
    this.selectedSellerReportReason.set(null);
  }

  private toSellerReportReason(reason: string | null): string | null {
    switch (reason) {
      case 'Suspected scam or fraud':
        return 'scam';
      case 'Seller is unresponsive after payment':
        return 'unresponsive';
      case 'Selling prohibited or illegal items':
        return 'prohibited';
      case 'Repeatedly listing sold/unavailable items':
        return 'spam';
      case 'Other reason':
        return 'other';
      default:
        return null;
    }
  }

  private async loadProductDetails(): Promise<void> {
    const id = this.productId();
    if (!id) {
      return;
    }
    this.isProductLoading.set(true);
    this.productLoadError.set(null);
    try {
      const record = await firstValueFrom(this.listingsService.getListingDetails(id));
      await this.applyProductDetails(record);
    } catch (error) {
      this.productLoadError.set(this.extractErrorMessage(error));
      this.moreFromSeller.set([]);
      this.relatedItems.set([]);
      this.reviews.set([]);
    } finally {
      this.isProductLoading.set(false);
    }
  }

  private async applyProductDetails(record: ListingsApiItem): Promise<void> {
    const storeInfo = this.readRecord(record['store_info']);
    const galleryImages = this.extractGalleryImages(record);
    const currentProduct = this.product();
    const currentStore = this.store();
    const productName = this.readString(record['title']) ?? 'Listing';
    const pricing = this.buildProductPricing(record);
    const description =
      this.readString(record['description']) ?? 'No description has been added for this listing yet.';
    const condition =
      this.formatCondition(record['condition']) ?? '';
    const lastUpdated =
      this.formatDate(record['updated_at'] ?? record['created_at']) ?? 'Recently updated';
    const saves =
      this.formatCount(record['save_count']) ??
      this.formatCount(record['saved']) ??
      currentProduct.saves;
    const listingId = this.readString(record['id']) ?? this.productId();
    const isSaved =
      this.readBoolean(record['is_saved']) ??
      this.favoritesStateService.isFavorited(listingId);
    const deliveryOptions =
      this.extractDeliveryOptions(record) ?? [];
    const storeName =
      this.readString(storeInfo?.['store_name']) ??
      this.readString(record['store_name']) ??
      this.readString(record['vendor_name']) ??
      'Store';
    const storeLocation =
      this.readString(storeInfo?.['location']) ??
      this.readString(record['store_location']) ??
      this.composeLocation(record) ??
      '';
    const callNumber =
      this.readString(storeInfo?.['whatsapp_number']) ??
      this.readString(storeInfo?.['call_number']) ??
      this.readString(record['whatsapp_number']) ??
      this.readString(record['call_number']) ??
      '';
    const joined =
      this.formatDate(storeInfo?.['date_joined'] ?? record['date_joined'] ?? record['created_at']) ??
      '';
    const bannerImage =
      this.resolveMediaUrl(
        this.readString(storeInfo?.['cover_image']) ??
          this.readString(storeInfo?.['banner_image']) ??
          this.readString(record['store_cover_image']) ??
          this.readString(record['cover_image']) ??
          this.readString(record['banner_image']),
      ) ?? '';
    const logoImage =
      this.resolveMediaUrl(
        this.readString(storeInfo?.['profile_photo']) ??
          this.readString(storeInfo?.['logo']) ??
          this.readString(storeInfo?.['avatar']) ??
          this.readString(record['store_logo']) ??
          this.readString(record['store_avatar']) ??
          this.readString(record['vendor_avatar']) ??
          this.readString(record['profile_photo']),
      ) ?? '';
    const relatedListings = this.extractRelatedListings(record['related_items']);
    const sellerListings = this.extractRelatedListings(
      record['more_from_seller'] ?? record['seller_listings'],
    );

    this.currentGalleryIndex.set(0);
    this.product.set({
      id: listingId,
      name: productName,
      price: pricing.price,
      oldPrice: pricing.oldPrice,
      discount: pricing.discount,
      hasDiscount: pricing.hasDiscount,
      lastUpdated,
      description,
      condition,
      saves,
      isSaved,
      deliveryOptions,
      images: galleryImages,
    });
    this.store.set({
      id:
        this.readString(storeInfo?.['id']) ??
        this.readString(record['vendor_id']) ??
        this.readString(record['store_id']) ??
        currentStore.id,
      ownerUserId:
        this.readString(storeInfo?.['user_id']) ??
        this.readString(this.readRecord(storeInfo?.['user'])?.['id']) ??
        this.readString(this.readRecord(record['user'])?.['id']) ??
        currentStore.ownerUserId,
      name: storeName,
      location: storeLocation,
      whatsappNumber: callNumber,
      followers:
        this.formatCount(storeInfo?.['followers_count'] ?? record['followers_count']) ??
        currentStore.followers,
      products:
        this.formatCount(storeInfo?.['products_count'] ?? record['products_count']) ??
        currentStore.products,
      rating:
        this.formatRating(
          storeInfo?.['average_rating'] ??
            storeInfo?.['store_rating'] ??
            record['average_rating'] ??
            record['store_rating'],
        ) ?? currentStore.rating,
      joined,
      isVerified:
        this.readBoolean(
          storeInfo?.['is_verified'] ??
            this.readRecord(record['user'])?.['is_verified'] ??
            record['is_verified'],
        ) ?? currentStore.isVerified,
      isFollowed: this.readBoolean(record['is_followed']) ?? currentStore.isFollowed,
      initials: this.buildInitials(storeName),
      accentFrom: currentStore.accentFrom,
      accentTo: currentStore.accentTo,
      logoImage,
      bannerImage,
    });

    if (sellerListings.length > 0) {
      this.moreFromSeller.set(sellerListings);
    }

    const storeId =
      this.readString(storeInfo?.['id']) ??
      this.readString(record['vendor_id']) ??
      this.readString(record['store_id']);

    if (storeId) {
      await Promise.all([
        this.loadVendorProfile(storeId),
        this.loadMoreFromSeller(storeId, this.readString(record['id']) ?? this.productId()),
        this.loadVendorReviews(storeId),
      ]);
    }

    if (relatedListings.length > 0) {
      this.relatedItems.set(relatedListings);
    }

    const categoryQuery =
      this.readString(record['category_id']) ??
      this.readString(record['category_slug']) ??
      this.readString(record['category']);
    if (categoryQuery) {
      await this.loadRelatedItems(categoryQuery, this.readString(record['id']) ?? this.productId());
    }
  }

  private async loadMoreFromSeller(storeId: string, currentListingId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.vendorsService.getVendorListings(storeId));
      const listings = this.extractVendorListingItems(response)
        .map((record, index) => this.toListingCard(record, index))
        .filter((listing): listing is Listing => listing !== null)
        .filter((listing) => listing.id !== currentListingId)
        .slice(0, 5);

      if (listings.length > 0) {
        this.moreFromSeller.set(listings);
      }
    } catch {
      this.moreFromSeller.set([]);
    }
  }

  private async loadVendorProfile(storeId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.vendorsService.getVendorDetails(storeId));
      this.applyVendorProfile(response);
    } catch {
      // The listing detail payload already contains enough store data to render the card.
    }
  }

  private applyVendorProfile(record: VendorRecord): void {
    const currentStore = this.store();
    const user = this.readRecord(record['user']);
    const storeName = this.readString(record['store_name']) ?? currentStore.name;
    const location =
      this.readString(record['location']) ??
      this.composeLocation(record) ??
      currentStore.location;
    const logoImage =
      this.resolveMediaUrl(
        this.readString(record['profile_photo']) ??
          this.readString(record['logo']) ??
          this.readString(record['avatar']) ??
          this.readString(user?.['avatar']),
      ) ?? currentStore.logoImage;
    const bannerImage =
      this.resolveMediaUrl(
        this.readString(record['cover_image']) ??
          this.readString(record['banner_image']),
      ) ?? currentStore.bannerImage;

    this.store.set({
      ...currentStore,
      id: this.readString(record['id']) ?? currentStore.id,
      ownerUserId:
        this.readString(record['user_id']) ??
        this.readString(user?.['id']) ??
        currentStore.ownerUserId,
      name: storeName,
      location,
      whatsappNumber:
        this.readString(record['whatsapp_number']) ??
        this.readString(record['call_number']) ??
        currentStore.whatsappNumber,
      followers: this.formatCount(record['followers_count']) ?? currentStore.followers,
      products: this.formatCount(record['products_count']) ?? currentStore.products,
      rating: this.formatRating(record['average_rating']) ?? currentStore.rating,
      joined: this.formatDate(record['date_joined']) ?? currentStore.joined,
      isVerified:
        this.readBoolean(record['is_verified']) ??
        this.readBoolean(user?.['is_verified']) ??
        currentStore.isVerified,
      isFollowed: this.readBoolean(record['is_followed']) ?? currentStore.isFollowed,
      initials: this.buildInitials(storeName),
      logoImage,
      bannerImage,
    });
  }

  private async loadRelatedItems(categoryQuery: string, currentListingId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.listingsService.getCategoryListings(categoryQuery));
      const listings = this.extractSearchListingItems(response)
        .map((record, index) => this.toListingCard(record, index))
        .filter((listing): listing is Listing => listing !== null)
        .filter((listing) => listing.id !== currentListingId)
        .slice(0, 5);

      if (listings.length > 0) {
        this.relatedItems.set(listings);
      }
    } catch {
      this.relatedItems.set([]);
    }
  }

  private async loadVendorReviews(storeId: string): Promise<void> {
    try {
      const response = await firstValueFrom(this.vendorsService.getVendorReviews(storeId));
      const reviews = this.extractVendorReviewItems(response)
        .map((review, index) => this.toReview(review, index))
        .filter((review): review is Review => review !== null);
      this.reviews.set(reviews);
    } catch {
      this.reviews.set([]);
    }
  }

  private extractVendorListingItems(response: VendorListingsResponse): readonly VendorListingRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.listings)) {
      return response.listings;
    }

    return [];
  }

  private extractSearchListingItems(response: ListingsSearchResponse): readonly ListingsApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.listings)) {
      return response.listings;
    }

    return [];
  }

  private extractVendorReviewItems(response: VendorReviewsResponse): VendorReviewRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.reviews)) {
      return response.reviews;
    }

    return [];
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

    return [];
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

  private toReview(record: VendorReviewRecord, index: number): Review | null {
    const reviewerRecord = this.readRecord(record['reviewer']);
    const author =
      this.readString(record['author']) ??
      this.readString(record['username']) ??
      this.readString(reviewerRecord?.['username']) ??
      this.readString(this.readRecord(record['user'])?.['username']) ??
      this.readString(record['full_name']) ??
      `Customer ${index + 1}`;
    const text =
      this.readString(record['text']) ??
      this.readString(record['comment']) ??
      this.readString(record['review']) ??
      this.readString(record['content']);
    const rating = this.clampRating(record['rating']);

    if (!text || rating === null) {
      return null;
    }

    return {
      author,
      avatar:
        this.resolveMediaUrl(this.readString(record['avatar'])) ??
        this.resolveMediaUrl(this.readString(reviewerRecord?.['avatar'])) ??
        this.resolveMediaUrl(this.readString(this.readRecord(record['user'])?.['avatar'])) ??
        undefined,
      rating,
      text,
      date: this.formatReviewDate(record['created_at']) ?? 'Recently',
      images: this.extractReviewImages(record),
      tags: this.extractReviewTags(record),
    };
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
    const price = this.readBoolean(record['is_free']) === true
      ? 'Free'
      : this.formatPrice(record['price']);
    const priceValue = this.readNumber(record['price']);
    const originalPriceValue = this.readNumber(record['original_price']);
    const hasDiscount =
      priceValue !== null &&
      originalPriceValue !== null &&
      originalPriceValue > priceValue;
    const discountValue =
      this.readNumber(record['discount_percentage']) ??
      (hasDiscount ? ((originalPriceValue - priceValue) / originalPriceValue) * 100 : null);

    if (!title || !price) {
      return null;
    }

    return {
      id: this.readString(record['id']) ?? `related-${index + 1}`,
      title,
      price,
      originalPrice: hasDiscount ? this.formatPrice(originalPriceValue) ?? undefined : undefined,
      discountBadge: hasDiscount ? this.formatDiscountBadge(discountValue) ?? undefined : undefined,
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

    return singleImage ? [singleImage] : [];
  }

  private formatPrice(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return `₦${new Intl.NumberFormat('en-NG').format(parsed)}`;
  }

  private buildProductPricing(record: ListingsApiItem): Pick<ProductDetails, 'price' | 'oldPrice' | 'discount' | 'hasDiscount'> {
    if (this.readBoolean(record['is_free']) === true) {
      return {
        price: 'Free',
        oldPrice: '',
        discount: '',
        hasDiscount: false,
      };
    }

    const priceValue = this.readNumber(record['price']);
    const originalPriceValue = this.readNumber(record['original_price']);
    const hasDiscount =
      priceValue !== null &&
      originalPriceValue !== null &&
      originalPriceValue > priceValue;
    const discountValue =
      this.readNumber(record['discount_percentage']) ??
      (hasDiscount ? ((originalPriceValue - priceValue) / originalPriceValue) * 100 : null);

    return {
      price: this.formatPrice(priceValue) ?? 'Price unavailable',
      oldPrice: hasDiscount ? this.formatPrice(originalPriceValue) ?? '' : '',
      discount: hasDiscount ? this.formatDiscountBadge(discountValue) ?? '' : '',
      hasDiscount,
    };
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

  private clampRating(value: unknown): number | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return Math.min(5, Math.max(1, Math.round(parsed)));
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

  private formatReviewDate(value: unknown): string | null {
    if (typeof value !== 'string' || value.trim().length === 0) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsed);
  }

  private reviewTimestamp(value: string): number {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private extractReviewTags(record: VendorReviewRecord): string[] | undefined {
    const value = record['tags'];
    if (!Array.isArray(value)) {
      return undefined;
    }

    const tags = value
      .map((tag) => {
        if (typeof tag === 'string') {
          return tag.trim();
        }

        const tagRecord = this.readRecord(tag);
        return this.readString(tagRecord?.['label']) ?? this.readString(tagRecord?.['name']);
      })
      .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0);

    return tags.length > 0 ? tags : undefined;
  }

  private extractReviewImages(record: VendorReviewRecord): string[] | undefined {
    const value = Array.isArray(record['photos']) ? record['photos'] : record['images'];
    if (!Array.isArray(value)) {
      return undefined;
    }

    const images = value
      .map((image) => {
        if (typeof image === 'string') {
          return this.resolveMediaUrl(image);
        }

        if (typeof image === 'object' && image !== null) {
          const imageRecord = image as Record<string, unknown>;
          return this.resolveMediaUrl(
            this.readString(imageRecord['image']) ??
              this.readString(imageRecord['url']) ??
              this.readString(imageRecord['src']),
          );
        }

        return null;
      })
      .filter((image): image is string => image !== null);

    return images.length > 0 ? images : undefined;
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

  private extractErrorMessage(error: unknown): string | null {
    if (!(error instanceof HttpErrorResponse)) {
      return null;
    }

    const errorPayload = this.readRecord(error.error);
    if (!errorPayload) {
      return null;
    }

    const detail = this.readString(errorPayload['detail']);
    if (detail) {
      return detail;
    }

    const message = this.readString(errorPayload['message']);
    if (message) {
      return message;
    }

    return null;
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

  private resolveWishlistState(
    response: ToggleWishlistResponse,
    previousState: boolean,
  ): boolean {
    if (!response || typeof response !== 'object') {
      return !previousState;
    }

    const explicitState = response['is_saved'];
    if (typeof explicitState === 'boolean') {
      return explicitState;
    }

    const nestedState =
      typeof response['data'] === 'object' && response['data'] !== null
        ? (response['data'] as Record<string, unknown>)['is_saved']
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

  private resolveSaveCount(
    currentValue: string,
    previousState: boolean,
    nextState: boolean,
  ): string {
    const currentCount = this.readNumber(currentValue);
    if (currentCount === null || previousState === nextState) {
      return currentValue;
    }

    const nextCount = nextState ? currentCount + 1 : Math.max(0, currentCount - 1);
    return this.formatCount(nextCount) ?? currentValue;
  }
}
