import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistToastService } from '../../services/wishlist-toast.service';

export interface Listing {
  id: string;
  images: string[];
  title: string;
  price: string;
  originalPrice?: string;
  discountBadge?: string;
  location: string;
  timeAgo: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './listing-card.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingCardComponent {
  private readonly wishlistToastService = inject(WishlistToastService);

  listing = input.required<Listing>();
  listingRoute = input<string[]>(
    ['/product'],
  );
  showFavorite = input(true);
  favoriteFilled = input(false);
  removedInitiallyFavorited = signal(false);
  currentImageIndex = signal(0);

  currentImage = computed(() => {
    const images = this.listing().images;
    if (!images || images.length === 0) return '';
    return images[this.currentImageIndex()];
  });

  isFavorited = computed(() =>
    (this.favoriteFilled() && !this.removedInitiallyFavorited())
    || this.wishlistToastService.isInWishlist(this.listing().id),
  );

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isFavorited()) {
      if (this.favoriteFilled()) {
        this.removedInitiallyFavorited.set(true);
      }

      this.wishlistToastService.removeFromWishlist(this.listing());
      return;
    }

    this.removedInitiallyFavorited.set(false);
    this.wishlistToastService.addToWishlist(this.listing());
  }

  nextImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const images = this.listing().images;
    if (images && images.length > 0) {
      this.currentImageIndex.update(idx => (idx + 1) % images.length);
    }
  }

  prevImage(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    const images = this.listing().images;
    if (images && images.length > 0) {
      this.currentImageIndex.update(idx => (idx - 1 + images.length) % images.length);
    }
  }
}
