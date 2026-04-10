import { CommonModule, isPlatformBrowser, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidClock } from '@ng-icons/font-awesome/solid';

interface HeroCarouselPair {
  tlSrc: string;
  trSrc: string;
  blSrc: string;
  brSrc: string;
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
}
