import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidClock } from '@ng-icons/font-awesome/solid';

interface HeroCarouselPair {
  tlSrc: string;
  trSrc: string;
  blSrc: string;
  brSrc: string;
}

interface HeroSearchStoreResult {
  name: string;
  location: string;
  logoSrc: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, NgIcon, NgOptimizedImage],
  templateUrl: './hero.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faSolidClock })],
})
export class HeroComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);

  readonly isSearchFocused = signal(false);
  readonly searchQuery = signal('');
  readonly recentSearches = signal([
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
  ]);
  readonly storeSearchResults: HeroSearchStoreResult[] = [
    {
      name: 'The iPhone Center',
      location: 'Ikeja, Lagos',
      logoSrc: 'assets/images/store-logo-vine.png',
    },
    {
      name: 'The iPhone Center',
      location: 'Ikeja, Lagos',
      logoSrc: 'assets/images/store-logo-vine.png',
    },
  ];
  readonly listingSearchResults = [
    'iPhone 17 pro max',
    'iPhone 17 pro max',
    'iPhone 17 pro max',
    'iPhone 17 pro max',
  ];
  readonly popularSearches = [
    'bags for men',
    'watch for men',
    'male accessories',
    'necklaces for men',
    'Toyota camry 2016 model',
    'Miniflat in Lagos',
    'shirt for men',
  ];
  readonly trimmedSearchQuery = computed(() => this.searchQuery().trim());
  readonly hasSearchResults = computed(() => this.trimmedSearchQuery().length > 0);

  readonly carouselGroups: HeroCarouselPair[] = [
    {
      tlSrc: 'assets/images/image-1-1.jpg',
      trSrc: 'assets/images/image-2-1.jpg',
      blSrc: 'assets/images/image-3-1.jpg',
      brSrc: 'assets/images/image-4-1.jpg',
    },
    {
      tlSrc: 'assets/images/image-1-1.jpg',
      trSrc: 'assets/images/image-2-1.jpg',
      blSrc: 'assets/images/image-3-1.jpg',
      brSrc: 'assets/images/image-4-1.jpg',
    },
    {
      tlSrc: 'assets/images/image-1-1.jpg',
      trSrc: 'assets/images/image-2-1.jpg',
      blSrc: 'assets/images/image-3-1.jpg',
      brSrc: 'assets/images/image-4-1.jpg',
    },
    {
      tlSrc: 'assets/images/image-1-1.jpg',
      trSrc: 'assets/images/image-2-1.jpg',
      blSrc: 'assets/images/image-3-1.jpg',
      brSrc: 'assets/images/image-4-1.jpg',
    },
  ];

  readonly activeGroupIndex = signal(0);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const intervalId = window.setInterval(() => {
      this.activeGroupIndex.update((index) => (index + 1) % this.carouselGroups.length);
    }, 3000);

    this.destroyRef.onDestroy(() => window.clearInterval(intervalId));
  }

  openSearchPanel(): void {
    this.isSearchFocused.set(true);
  }

  handleSearchFocusOut(event: FocusEvent, container: HTMLElement): void {
    const nextFocusedTarget = event.relatedTarget;

    if (nextFocusedTarget instanceof Node && container.contains(nextFocusedTarget)) {
      return;
    }

    this.isSearchFocused.set(false);
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  applySuggestion(suggestion: string): void {
    this.searchQuery.set(suggestion);
    this.isSearchFocused.set(true);
  }

  removeRecentSearch(search: string): void {
    this.recentSearches.update((items) => items.filter((item) => item !== search));
  }

  clearRecentSearches(): void {
    this.recentSearches.set([]);
  }

  runSearch(): void {
    const query = this.trimmedSearchQuery() || 'iPhone';
    void this.router.navigate(['/category'], { queryParams: { q: query } });
  }
}
