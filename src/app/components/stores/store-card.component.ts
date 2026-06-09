import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Store {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  banner?: string;
  followers?: string;
  isVerified?: boolean;
  metaLabel?: string;
  activeUntil?: string;
  route?: readonly string[];
  location?: string;
  coverImage?: string;
  mobileCoverImage?: string;
  logoImage?: string;
  mobileLogoImage?: string;
  callNumber?: string;
  alternateCallNumber?: string;
}

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './store-card.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreCardComponent {
  store = input.required<Store>();
  showFavorite = input(true);
  priority = input(false);
  imageLoading = input<'lazy' | 'eager' | 'auto'>('lazy');

  protected readonly route = computed(() => this.store().route ?? ['/my-stores', this.store().id]);
  protected readonly desktopCoverImage = computed(() => this.store().coverImage ?? this.store().banner ?? '');
  protected readonly mobileCoverImage = computed(
    () => this.store().mobileCoverImage ?? this.desktopCoverImage(),
  );
  protected readonly desktopLogoImage = computed(
    () => this.store().logoImage ?? this.store().logo ?? '',
  );
  protected readonly mobileLogoImage = computed(
    () => this.store().mobileLogoImage ?? this.desktopLogoImage(),
  );
  protected readonly locationLabel = computed(
    () => this.store().location ?? this.store().metaLabel ?? this.store().followers ?? '',
  );
  protected readonly hasLocation = computed(() => this.locationLabel().trim().length > 0);
  protected readonly isVerified = computed(() => this.store().isVerified ?? true);
  protected readonly imageLoadingMode = computed(() =>
    this.priority() ? 'eager' : this.imageLoading(),
  );

  protected isDataUrl(value: string): boolean {
    return value.startsWith('data:') || value.startsWith('blob:');
  }
}
