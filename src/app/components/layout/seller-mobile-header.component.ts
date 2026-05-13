import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-seller-mobile-header',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="flex h-[72px] items-center justify-between gap-4 px-5 lg:hidden">
      <a
        routerLink="/seller/listings"
        aria-label="Go to Duduzili home"
        class="block"
      >
        <img
          ngSrc="/assets/icons/seller-mobile-header-logo.svg"
          width="111"
          height="24"
          alt="Duduzili"
          priority
          class="h-6 w-auto object-contain"
        >
      </a>

      <img
        [ngSrc]="accountAvatarSrc()"
        width="36"
        height="36"
        [alt]="accountDisplayName()"
        class="h-9 w-9 rounded-full object-cover"
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SellerMobileHeaderComponent {
  private readonly authSession = inject(AuthSessionService);

  protected readonly fallbackAvatarSrc = '/assets/images/auth-avatar-fallback.svg';
  protected readonly currentUser = this.authSession.user;
  protected readonly accountAvatarSrc = computed(
    () => this.currentUser()?.avatar?.trim() || this.fallbackAvatarSrc,
  );
  protected readonly accountDisplayName = computed(() => {
    const user = this.currentUser();
    return user?.full_name?.trim() || user?.username?.trim() || 'Seller';
  });
}
