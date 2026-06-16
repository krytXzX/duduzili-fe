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
  protected readonly promptLink = computed(() => (this.isSignIn() ? '/sign-up' : '/sign-in'));
  protected readonly desktopPromptText = computed(() =>
    this.isSignIn() ? "Don't have a Duduzili account?" : 'Already have a Duduzili account?',
  );
  protected readonly desktopPromptAction = computed(() =>
    this.isSignIn() ? 'Create a new account' : 'Log in',
  );
  protected readonly mobilePromptText = computed(() =>
    this.isSignIn() ? 'Don’t have an account?' : 'Already have an account?',
  );
  protected readonly mobilePromptAction = computed(() =>
    this.isSignIn() ? 'Sign up' : 'Log in',
  );

  protected readonly fullLogoUrl = iconAsset('auth-shell-logo-full.svg');
  protected readonly iconLogoUrl = iconAsset('auth-shell-logo-mark.svg');
  protected readonly markUrl = imageAsset('auth-shell-mark.svg');
  protected readonly heroSkyUrl = imageAsset('auth-shell-hero-sky.webp');
  protected readonly phoneImageUrl = imageAsset('auth-shell-hero-phone.webp');
  protected readonly storeCoverUrl = imageAsset('auth-shell-store-cover.webp');
  protected readonly heroImageUrl = imageAsset('auth-shell-hero-couple.webp');
  protected readonly productLikeUrl = iconAsset('auth-shell-card-heart.svg');
  protected readonly verifiedBadgeIconUrl = iconAsset('auth-shell-card-verified.svg');
  protected readonly arrowLeftUrl = iconAsset('auth-shell-card-arrow-left.svg');
  protected readonly arrowRightUrl = iconAsset('auth-shell-card-arrow-right.svg');
  protected readonly carouselDotsUrl = iconAsset('auth-shell-carousel-dots.svg');
  protected readonly nairaIconUrl = iconAsset('auth-shell-card-naira.svg');
  protected readonly locationIconUrl = iconAsset('auth-shell-card-location.svg');
  protected readonly storeAvatarUrl = imageAsset('auth-shell-store-avatar.webp');
  protected readonly storeVerifyUrl = iconAsset('auth-shell-store-verify.svg');
  protected readonly storeLocationUrl = iconAsset('auth-shell-store-location.svg');
}
