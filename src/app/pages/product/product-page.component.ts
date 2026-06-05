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
    SellerReportModalComponent,
  ],
  templateUrl: './product-page.component.html',
  host: {
    class: 'block h-full overflow-y-auto overflow-x-hidden bg-white text-[#1F1F1F]',
    '(document:keydown.escape)': 'handleOverlayEscape()',
  },
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

  readonly productId = this.route.snapshot.paramMap.get('id') ?? 'iphone-16-pro';
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
  readonly compactReviews = computed(() => this.reviews().slice(0, 2));
  readonly reviewAverage = computed(() => {
    const reviews = this.reviews();
    if (reviews.length === 0) {
      return '0.0';
    }

    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  });
  readonly reviewCountLabel = computed(() => {
    const count = this.reviews().length;
    return `${count} ${count === 1 ? 'rating' : 'ratings'}`;
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
    () => this.product().images[this.currentGalleryIndex()] ?? this.product().images[0],
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
    saves: '0',
    isSaved: false,
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
    ownerUserId: null,
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

    void this.loadProductDetails();

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

  galleryImageCountLabel(): string {
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

  async shareListingWithDevice(): Promise<void> {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: 'Unable to share listing right now.',
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
        message: 'Unable to share listing right now.',
      });
    }
  }

  async copyShareUrl(): Promise<void> {
    this.closeListingActionsMenu();

    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: 'Unable to share listing right now.',
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
      message: 'Unable to share listing right now.',
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
        message: this.extractErrorMessage(error) ?? 'Unable to start conversation right now.',
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
        imageSrc: this.product().images[0]?.src ?? '/assets/images/home-item-placeholder.png',
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
        imageSrc: this.product().images[0]?.src ?? '/assets/images/home-item-placeholder.png',
        imageAlt: this.product().name,
      });
    } catch {
      this.appToastService.show({
        message: 'Unable to update wishlist right now.',
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
          message: 'Unable to send callback request right now.',
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
          message: 'Unable to send offer right now.',
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
          message: 'Unable to submit listing report right now.',
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
        message: 'Unable to submit seller report right now.',
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
        message: 'Unable to submit seller report right now.',
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
    try {
      const record = await firstValueFrom(this.listingsService.getListingDetails(this.productId));
      await this.applyProductDetails(record);
    } catch {
      // Keep the existing fallback content when the detail request fails.
    }
  }

  private async applyProductDetails(record: ListingsApiItem): Promise<void> {
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
    const saves =
      this.formatCount(record['save_count']) ??
      this.formatCount(record['saved']) ??
      this.product().saves;
    const listingId = this.readString(record['id']) ?? this.productId;
    const isSaved =
      this.readBoolean(record['is_saved']) ??
      this.favoritesStateService.isFavorited(listingId);
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
      id: listingId,
      name: productName,
      price: formattedPrice,
      oldPrice: formattedOldPrice,
      discount: formattedDiscount,
      lastUpdated,
      description,
      condition,
      saves,
      isSaved,
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
      ownerUserId:
        this.readString(storeInfo?.['user_id']) ??
        this.readString(this.readRecord(storeInfo?.['user'])?.['id']) ??
        this.readString(this.readRecord(record['user'])?.['id']) ??
        this.store().ownerUserId,
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

    const storeId =
      this.readString(storeInfo?.['id']) ??
      this.readString(record['vendor_id']) ??
      this.readString(record['store_id']);

    if (storeId) {
      await this.loadMoreFromSeller(storeId, this.readString(record['id']) ?? this.productId);
      await this.loadVendorReviews(storeId);
    }

    if (relatedListings.length > 0) {
      this.relatedItems.set(relatedListings);
    }

    const categoryQuery =
      this.readString(record['category_id']) ??
      this.readString(record['category_slug']) ??
      this.readString(record['category']);
    if (categoryQuery) {
      await this.loadRelatedItems(categoryQuery, this.readString(record['id']) ?? this.productId);
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
      // Keep the current section state when seller listings cannot be loaded.
    }
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
      // Keep the current section state when related items cannot be loaded.
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
