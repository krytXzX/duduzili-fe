import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { Review } from '../../components/product/review-card.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NavbarComponent,
    ListingCardComponent,
    FooterComponent
  ],
  templateUrl: './product-page.component.html',
  host: { class: 'block h-full overflow-auto bg-[#F9FAFB]' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly isMessageVendorModalOpen = signal(false);
  readonly isCallVendorModalOpen = signal(false);
  readonly isRequestCallbackModalOpen = signal(false);
  readonly isMakeOfferModalOpen = signal(false);
  readonly isReportUnavailableModalOpen = signal(false);
  readonly isReportUnavailableSuccessModalOpen = signal(false);
  readonly isReportSellerReasonModalOpen = signal(false);
  readonly isReportSellerDetailsModalOpen = signal(false);
  readonly isReportSellerSuccessModalOpen = signal(false);
  readonly isListingActionsMenuOpen = signal(false);
  readonly compactReviews = computed(() => this.reviews().slice(0, 2));
  readonly formattedOfferValue = computed(() => {
    const value = this.makeOfferForm.controls.amount.value ?? '';
    const digitsOnly = value.replace(/[^\d]/g, '');

    if (!digitsOnly) {
      return '0.00';
    }

    return new Intl.NumberFormat('en-NG').format(Number(digitsOnly));
  });

  readonly requestCallbackForm = this.formBuilder.nonNullable.group({
    name: ['Bryan Odjede', [Validators.required]],
    phoneNumber: ['', [Validators.required]],
  });

  readonly makeOfferForm = this.formBuilder.nonNullable.group({
    amount: ['', [Validators.required]],
  });

  readonly reportUnavailableForm = this.formBuilder.nonNullable.group({
    details: [''],
  });

  readonly reportSellerReasonForm = this.formBuilder.nonNullable.group({
    reason: ['', [Validators.required]],
  });

  readonly reportSellerDetailsForm = this.formBuilder.nonNullable.group({
    details: ['', [Validators.required]],
  });

  product = signal({
    id: 'p1',
    name: 'Iphone 16 pro',
    price: '₦2,500,000',
    oldPrice: '₦35,000',
    discount: '24%',
    postedDate: '04 January 2025',
    description: 'UK used iPhone 16 pro, activated and fully working. Good battery health.',
    condition: 'Used',
    views: '12k',
    images: [
      '/assets/images/product_watch_luxury.png', // Main
      '/assets/images/product_keyboard_rgb.png',
      '/assets/images/product_sneakers_lifestyle.png',
      '/assets/images/fashion_menswear_hero.png',
      '/assets/images/product_watch_luxury.png'
    ],
    deliveryOptions: [
        'Better delivery',
        'Pickup shop',
        'State location'
    ]
  });

  currentGalleryIndex = signal(0);
  currentReviewIndex = signal(0);
  
  currentMainImage = computed(() => this.product().images[this.currentGalleryIndex()]);

  store = signal({
    name: 'The Vine Collections',
    location: 'Ikeja, Lagos',
    whatsappNumber: '08169397454',
    followers: '2.5K',
    products: '143',
    rating: '4.8',
    joined: '11 Feb 2024',
    isVerified: true,
    logo: '/assets/images/product_keyboard_rgb.png',
    banner: '/assets/images/product_keyboard_rgb.png'
  });

  reviews = signal<Review[]>([
    { rating: 5, text: "I've bought items from this vendor and they had great customer service.", author: "Olakunle Joshua", date: "4 days ago" },
    { rating: 5, text: "The product was exactly as described. Very happy!", author: "Sarah Adams", date: "1 week ago" },
    { rating: 4, text: "Delivery was a bit slow, but the item is perfect. Recommended seller.", author: "Michael Chen", date: "2 weeks ago" },
    { rating: 5, text: "Best tech shop in Lagos. Genuine products only.", author: "Blessing Okoro", date: "1 month ago" }
  ]);

  moreFromSeller = signal<Listing[]>([
    { id: 'ms1', title: 'Logitech mouse', price: '₦35,000', location: 'Lagos', timeAgo: '5 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'ms2', title: 'iPhone 17 pro max', price: '₦2,500,000', location: 'Lagos', timeAgo: '12 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: 'ms3', title: 'RGB keyboard', price: '₦35,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 'ms4', title: 'Oversized Hoodie', price: '₦12,000', location: 'Lagos', timeAgo: '20 mins ago', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 'ms5', title: 'iPhone X (64 gb)', price: '₦35,000', location: 'Lagos', timeAgo: '2 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
  ]);

  relatedItems = signal<Listing[]>([
    { id: 're1', title: 'Tie', price: '₦5,000', location: 'Lagos', timeAgo: '2 mins ago', isVerified: true, images: ['/assets/images/fashion_menswear_hero.png'] },
    { id: 're2', title: 'McLaren', price: '₦200M', location: 'Lagos', timeAgo: '10 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: 're3', title: 'The fragrance', price: '₦55,000', location: 'Lagos', timeAgo: '15 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
    { id: 're4', title: 'Watch for men', price: '₦25,000', location: 'Lagos', timeAgo: '25 mins ago', isVerified: true, images: ['/assets/images/product_watch_luxury.png'] },
    { id: 're5', title: 'The fragrance', price: '₦55,000', location: 'Lagos', timeAgo: '30 mins ago', isVerified: true, images: ['/assets/images/product_keyboard_rgb.png'] },
  ]);

  setGalleryIndex(index: number) {
    this.currentGalleryIndex.set(index);
  }

  nextImage() {
    this.currentGalleryIndex.update(idx => (idx + 1) % this.product().images.length);
  }

  prevImage() {
    this.currentGalleryIndex.update(idx => (idx - 1 + this.product().images.length) % this.product().images.length);
  }

  nextReview() {
    this.currentReviewIndex.update(idx => (idx + 1) % this.reviews().length);
  }

  prevReview() {
    this.currentReviewIndex.update(idx => (idx - 1 + this.reviews().length) % this.reviews().length);
  }

  whatsappLink(): string {
    return `https://wa.me/234${this.store().whatsappNumber.replace(/^0/, '')}`;
  }

  toggleListingActionsMenu(): void {
    this.isListingActionsMenuOpen.update((value) => !value);
  }

  closeListingActionsMenu(): void {
    this.isListingActionsMenuOpen.set(false);
  }

  shareListing(): void {
    this.closeListingActionsMenu();
  }

  reportListingUnavailable(): void {
    this.closeListingActionsMenu();
    this.isReportUnavailableModalOpen.set(true);
  }

  reportSeller(): void {
    this.closeListingActionsMenu();
    this.isReportSellerReasonModalOpen.set(true);
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
  }

  submitOffer(): void {
    if (this.makeOfferForm.invalid) {
      this.makeOfferForm.markAllAsTouched();
      return;
    }

    this.closeMakeOfferModal();
  }

  closeReportUnavailableModal(): void {
    this.isReportUnavailableModalOpen.set(false);
  }

  closeReportUnavailableSuccessModal(): void {
    this.isReportUnavailableSuccessModalOpen.set(false);
  }

  submitUnavailableReport(): void {
    this.closeReportUnavailableModal();
    this.isReportUnavailableSuccessModalOpen.set(true);
    this.reportUnavailableForm.reset({ details: '' });
  }

  closeReportSellerReasonModal(): void {
    this.isReportSellerReasonModalOpen.set(false);
  }

  closeReportSellerDetailsModal(): void {
    this.isReportSellerDetailsModalOpen.set(false);
  }

  closeReportSellerSuccessModal(): void {
    this.isReportSellerSuccessModalOpen.set(false);
  }

  goToReportSellerDetails(): void {
    if (this.reportSellerReasonForm.invalid) {
      this.reportSellerReasonForm.markAllAsTouched();
      return;
    }

    this.closeReportSellerReasonModal();
    this.isReportSellerDetailsModalOpen.set(true);
  }

  backToReportSellerReason(): void {
    this.closeReportSellerDetailsModal();
    this.isReportSellerReasonModalOpen.set(true);
  }

  submitSellerReport(): void {
    if (this.reportSellerDetailsForm.invalid) {
      this.reportSellerDetailsForm.markAllAsTouched();
      return;
    }

    this.closeReportSellerDetailsModal();
    this.isReportSellerSuccessModalOpen.set(true);
    this.reportSellerReasonForm.reset({ reason: '' });
    this.reportSellerDetailsForm.reset({ details: '' });
  }

  phoneCallLink(): string {
    return `tel:${this.store().whatsappNumber}`;
  }
}
