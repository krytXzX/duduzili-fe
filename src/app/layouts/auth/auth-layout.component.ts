import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

const imageAsset = (fileName: string) => `/assets/images/${fileName}`;
const iconAsset = (fileName: string) => `/assets/icons/${fileName}`;

@Component({
  selector: 'app-auth-layout',
  imports: [NgOptimizedImage, RouterLink, RouterOutlet],
  templateUrl: './auth-layout.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block h-full min-h-screen bg-white',
  },
})
export class AuthLayoutComponent {
  private readonly router = inject(Router);

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.router.url),
    ),
    { initialValue: this.router.url },
  );

  protected readonly isSignIn = computed(
    () => this.url().includes('/sign-in') || this.url().includes('/two-factor'),
  );
  protected readonly showAccountPrompt = computed(() => !this.url().includes('/admin/invite'));

  protected readonly fullLogoUrl = iconAsset('home-logo-dark.svg');
  protected readonly iconLogoUrl = imageAsset('logo-dark-fill.svg');
  protected readonly markUrl = imageAsset('mark-image.svg');
  protected readonly heroSkyUrl = imageAsset('hero-sky-bg.png');
  protected readonly phoneImageUrl = imageAsset('listings-item-iphone.png');
  protected readonly storeBannerUrl = imageAsset('store-banner.png');
  protected readonly heroImageUrl = imageAsset('hero-image.png');
  protected readonly productLikeUrl = iconAsset('home-heart-outline.svg');
  protected readonly verifiedBadgeIconUrl = iconAsset('home-verified-medal.svg');
  protected readonly nairaIconUrl = iconAsset('listings-naira.svg');
}
