import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { Listing, ListingCardComponent } from '../../components/listings/listing-card.component';
import { FooterComponent } from '../../components/layout/footer.component';
import { Review, ReviewCardComponent } from '../../components/product/review-card.component';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [
    CommonModule,
    NavbarComponent,
    ListingCardComponent,
    FooterComponent,
    ReviewCardComponent
  ],
  templateUrl: './product-page.component.html',
  host: { class: 'block h-full overflow-auto bg-[#F9FAFB]' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPageComponent {
  product = signal({
    id: 'p1',
    name: 'Iphone 16 pro',
    price: '₦2,500,000',
    oldPrice: '₦35,000',
    discount: '24%',
    postedDate: '04 January 2025',
    description: 'UK used iPhone 16 pro, activated and fully working. Good battery health.',
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
}
