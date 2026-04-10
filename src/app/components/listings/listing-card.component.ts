import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Listing {
  id: string;
  images: string[];
  title: string;
  price: string;
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
  listing = input.required<Listing>();
  isFavorite = signal(false);
  currentImageIndex = signal(0);

  currentImage = computed(() => {
    const images = this.listing().images;
    if (!images || images.length === 0) return '';
    return images[this.currentImageIndex()];
  });

  toggleFavorite(event: Event) {
    event.stopPropagation();
    this.isFavorite.update((v: boolean) => !v);
  }

  nextImage(event: Event) {
    event.stopPropagation();
    const images = this.listing().images;
    if (images && images.length > 0) {
      this.currentImageIndex.update(idx => (idx + 1) % images.length);
    }
  }

  prevImage(event: Event) {
    event.stopPropagation();
    const images = this.listing().images;
    if (images && images.length > 0) {
      this.currentImageIndex.update(idx => (idx - 1 + images.length) % images.length);
    }
  }
}
