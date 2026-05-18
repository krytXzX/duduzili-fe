import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppToastService } from '../../services/app-toast.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { FavoritesStateService } from '../../services/favorites-state.service';
import { ListingsService, ToggleFavoriteResponse } from '../../services/listings.service';

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
  private readonly appToastService = inject(AppToastService);
  private readonly authSession = inject(AuthSessionService);
  private readonly favoritesStateService = inject(FavoritesStateService);
  private readonly listingsService = inject(ListingsService);
  private readonly router = inject(Router);

  listing = input.required<Listing>();
  listingRoute = input<string[]>(
    ['/product'],
  );
  showFavorite = input(true);
  favoriteFilled = input(false);
  favoriteChanged = output<{ id: string; isFavorited: boolean }>();
  removedInitiallyFavorited = signal(false);
  currentImageIndex = signal(0);
  isFavoritePending = signal(false);

  currentImage = computed(() => {
    const images = this.listing().images;
    if (!images || images.length === 0) return '';
    return images[this.currentImageIndex()];
  });

  isFavorited = computed(() =>
    (this.favoriteFilled() && !this.removedInitiallyFavorited())
    || this.favoritesStateService.isFavorited(this.listing().id),
  );

  async toggleFavorite(event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();

    if (this.isFavoritePending()) {
      return;
    }

    if (!this.authSession.isAuthenticated()) {
      this.appToastService.show({
        message: 'Please sign in to add listings to your wishlist',
        imageSrc: this.listing().images[0] ?? '/assets/images/home-item-placeholder.png',
        imageAlt: this.listing().title,
        durationMs: 1200,
      });
      setTimeout(() => {
        void this.router.navigate(['/sign-in']);
      }, 1200);
      return;
    }

    const wasFavorited = this.isFavorited();
    this.isFavoritePending.set(true);

    try {
      const response = await firstValueFrom(this.listingsService.toggleFavorite(this.listing().id));
      const nextIsFavorited = this.resolveFavoriteState(response, wasFavorited);

      if (nextIsFavorited) {
        this.removedInitiallyFavorited.set(false);
        this.favoritesStateService.add(this.listing().id);
        this.appToastService.show({
          message: 'Added to Wishlist',
          imageSrc: this.listing().images[0] ?? '/assets/images/home-item-placeholder.png',
          imageAlt: this.listing().title,
          actionLabel: 'Undo',
          action: () => this.favoritesStateService.remove(this.listing().id),
        });
        this.favoriteChanged.emit({ id: this.listing().id, isFavorited: true });
        return;
      }

      if (this.favoriteFilled()) {
        this.removedInitiallyFavorited.set(true);
      }

      this.favoritesStateService.remove(this.listing().id);
      this.appToastService.show({
        message: 'Removed from Wishlist',
        imageSrc: this.listing().images[0] ?? '/assets/images/home-item-placeholder.png',
        imageAlt: this.listing().title,
        actionLabel: 'Undo',
        action: () => this.favoritesStateService.add(this.listing().id),
      });
      this.favoriteChanged.emit({ id: this.listing().id, isFavorited: false });
    } finally {
      this.isFavoritePending.set(false);
    }
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

  private resolveFavoriteState(
    response: ToggleFavoriteResponse,
    previousState: boolean,
  ): boolean {
    if (!response || typeof response !== 'object') {
      return !previousState;
    }

    const explicitState = response['is_favorited'];
    if (typeof explicitState === 'boolean') {
      return explicitState;
    }

    const nestedState =
      typeof response['data'] === 'object' && response['data'] !== null
        ? (response['data'] as Record<string, unknown>)['is_favorited']
        : null;

    if (typeof nestedState === 'boolean') {
      return nestedState;
    }

    return !previousState;
  }
}
