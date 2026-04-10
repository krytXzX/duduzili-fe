import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlus, heroChevronLeft, heroChevronRight } from '@ng-icons/heroicons/outline';
import { CreateBannerAdModalComponent } from '../promotions/components/create-banner-ad-modal.component';
import { CreateAdType, CreateAdTypeModalComponent } from './components/create-ad-type-modal.component';
import { Store, StoreCardComponent } from '../../components/stores/store-card.component';
import { BannerPromotionCardComponent, BannerPromotionCardData } from '../../components/ads/banner-promotion-card.component';

type AdPlacement = 'promoted listings' | 'store promotions' | 'banner ads';
type AdStatus = 'active' | 'paused' | 'expired';
type ListingCategory = 'other listings' | 'automobile listings' | 'property listings';

interface SummaryStat {
  label: string;
  value: string;
}

interface BannerRunningAd extends BannerPromotionCardData {
  status: AdStatus;
}

interface RunningAd {
  id: string;
  title: string;
  price: string;
  views: string;
  clicks: string;
  saves: string;
  expiresOn: string;
  status: AdStatus;
  placement: AdPlacement;
  category: ListingCategory;
  image: string;
  subtitle?: string;
  logoLabel?: string;
  logoTone?: string;
}

@Component({
  selector: 'app-running-ads-page',
  imports: [
    CommonModule,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
    StoreCardComponent,
    BannerPromotionCardComponent,
    CreateBannerAdModalComponent,
    CreateAdTypeModalComponent,
  ],
  providers: [provideIcons({ heroPlus, heroChevronLeft, heroChevronRight })],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex items-center justify-between border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Ads &gt; Running Ads</h1>

        <button
          type="button"
          (click)="isCreateAdTypeModalOpen.set(true)"
          class="inline-flex items-center gap-2 rounded-full bg-[#6653E4] px-5 py-3 text-[13px] font-semibold text-white shadow-[0_14px_28px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
        >
          <ng-icon name="heroPlus" class="text-sm"></ng-icon>
          Create Ad
        </button>
      </div>

      <div class="flex-1 overflow-y-auto px-8 py-6">
        <div class="grid gap-4 rounded-[18px] border border-[#EFF0F4] bg-white px-5 py-4 md:grid-cols-2 xl:grid-cols-6">
          @for (stat of summaryStats; track stat.label) {
            <div class="border-[#EFF0F4] md:border-r last:border-r-0 md:pr-5">
              <p class="text-[11px] font-medium text-[#A0A4AD]">{{ stat.label }}</p>
              <p class="mt-1 text-[13px] font-semibold text-[#2B2F36]">{{ stat.value }}</p>
            </div>
          }
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-5 border-b border-[#F0F0F2] pb-4">
          @for (tab of placementTabs; track tab.value) {
            <button
              type="button"
              (click)="activePlacement.set(tab.value)"
              class="inline-flex items-center gap-1.5 text-[13px] font-semibold transition"
              [class.text-[#6C5CE7]]="activePlacement() === tab.value"
              [class.text-[#9CA1AA]]="activePlacement() !== tab.value"
            >
              <span
                class="h-2 w-2 rounded-full"
                [class.bg-[#6C5CE7]]="activePlacement() === tab.value"
                [class.bg-[#D4D8E1]]="activePlacement() !== tab.value"
              ></span>
              {{ tab.label }}
            </button>
          }
        </div>

        @if (hasVisibleContent()) {
          <div class="mt-4 flex flex-wrap gap-3">
            @for (tab of statusTabs; track tab.value) {
              <button
                type="button"
                (click)="activeStatus.set(tab.value)"
                class="rounded-full px-4 py-2 text-[13px] font-semibold transition"
                [class.bg-[#1F2024]]="activeStatus() === tab.value"
                [class.text-white]="activeStatus() === tab.value"
                [class.bg-[#F4F4F6]]="activeStatus() !== tab.value"
                [class.text-[#4B4F57]]="activeStatus() !== tab.value"
              >
                {{ tab.label }}({{ countByStatus(tab.value) }})
              </button>
            }
          </div>

          @if (activePlacement() === 'banner ads') {
            <section class="mt-8">
              <div class="grid max-w-4xl gap-5 xl:grid-cols-2">
                @for (banner of visibleBannerAds(); track banner.id) {
                  <app-banner-promotion-card [card]="banner"></app-banner-promotion-card>
                }
              </div>
            </section>
          } @else if (activePlacement() === 'store promotions') {
            <section class="mt-8">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-[18px] font-bold tracking-tight text-[#23262D]">Featured stores</h2>

                <div class="flex items-center gap-3">
                  <button type="button" class="text-[13px] font-semibold text-[#4B4F57]">
                    View all (28)
                  </button>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                  >
                    <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                  </button>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                  >
                    <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                  </button>
                </div>
              </div>

              <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                @for (store of promotedStores(); track store.id) {
                  <app-store-card [store]="store" [showFavorite]="false"></app-store-card>
                }
              </div>
            </section>
          } @else {
            @for (section of sectionedAds(); track section.category) {
              <section class="mt-8">
                <div class="mb-4 flex items-center justify-between">
                  <h2 class="text-[18px] font-bold tracking-tight text-[#23262D]">{{ section.label }}</h2>

                  @if ($index === 0) {
                    <div class="flex items-center gap-3">
                      <button type="button" class="text-[13px] font-semibold text-[#4B4F57]">
                        View all (3,341)
                      </button>
                      <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                      >
                        <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                      </button>
                      <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                      >
                        <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                      </button>
                    </div>
                  }
                </div>

                <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                  @for (ad of section.items; track ad.id) {
                    <article
                      [routerLink]="['/ads/running', ad.id]"
                      class="cursor-pointer overflow-hidden rounded-[20px] border border-[#ECEEF3] bg-white shadow-[0_12px_24px_-24px_rgba(17,24,39,0.55)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_32px_-24px_rgba(17,24,39,0.4)]"
                    >
                      <div class="relative m-2 aspect-[0.92] overflow-hidden rounded-[18px]">
                        <img [src]="ad.image" [alt]="ad.title" class="h-full w-full object-cover">
                        <div class="absolute left-2 top-2 rounded-full bg-[#F2F5A7] px-2 py-1 text-[10px] font-bold text-[#6A6B1F]">
                          Active until {{ ad.expiresOn }}
                        </div>

                        @if (section.items.length > 1 && ($first || $last) && section.category === 'other listings') {
                          <button
                            type="button"
                            class="absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#7F838C] shadow-sm"
                          >
                            <ng-icon name="heroChevronLeft" class="text-xs"></ng-icon>
                          </button>
                          <button
                            type="button"
                            class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#7F838C] shadow-sm"
                          >
                            <ng-icon name="heroChevronRight" class="text-xs"></ng-icon>
                          </button>
                        }
                      </div>

                      <div class="px-3 pb-3">
                        <h3 class="line-clamp-1 text-[13px] font-medium text-[#2A2D34]">{{ ad.title }}</h3>
                        <p class="mt-1 text-[15px] font-semibold text-[#2A2D34]">{{ ad.price }}</p>

                        <div class="mt-2 flex items-center gap-3 text-[11px] font-medium text-[#ADB1B9]">
                          <span class="inline-flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                            {{ ad.views }}
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                            {{ ad.clicks }}
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                            {{ ad.saves }}
                          </span>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              </section>
            }
          }
        } @else {
          <div class="flex min-h-[560px] flex-col items-center justify-center px-6 text-center">
            <div class="relative mb-10 h-[240px] w-full max-w-[340px] opacity-70">
              <img
                ngSrc="assets/images/empty_state.svg"
                alt="No running ads"
                fill
                class="object-contain"
                priority
              >
            </div>

            <h2 class="text-[24px] font-bold tracking-tight text-[#24262D]">
              {{ emptyStateTitle() }}
            </h2>

            <p class="mt-2 text-[15px] font-medium text-[#9297A1]">
              {{ emptyStateDescription() }}
            </p>

            <button
              type="button"
              class="mt-8 rounded-full bg-[#F2F3F5] px-7 py-3 text-[15px] font-semibold text-[#2F333B] transition hover:bg-[#E8EAF0] focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              {{ emptyStateActionLabel() }}
            </button>
          </div>
        }
      </div>
    </div>

    @if (isCreateAdTypeModalOpen()) {
      <app-create-ad-type-modal
        (close)="isCreateAdTypeModalOpen.set(false)"
        (continue)="handleCreateAdTypeSelection($event)"
      ></app-create-ad-type-modal>
    }

    @if (isCreateBannerModalOpen()) {
      <app-create-banner-ad-modal
        (close)="isCreateBannerModalOpen.set(false)"
        (submit)="isCreateBannerModalOpen.set(false)"
      ></app-create-banner-ad-modal>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunningAdsPageComponent {
  readonly summaryStats: SummaryStat[] = [
    { label: 'Current plan', value: 'Enterprise' },
    { label: 'Automobile listings', value: 'Unlimited' },
    { label: 'Property listings', value: 'Unlimited' },
    { label: 'Other listings', value: 'Unlimited' },
    { label: 'Store', value: 'Unlimited' },
    { label: 'Banner', value: '3/5 left' },
  ];

  readonly placementTabs = [
    { label: 'Promoted Listings', value: 'promoted listings' as const },
    { label: 'Store Promotions', value: 'store promotions' as const },
    { label: 'Banner Ads', value: 'banner ads' as const },
  ];

  readonly statusTabs = [
    { label: 'Active', value: 'active' as const },
    { label: 'Paused', value: 'paused' as const },
    { label: 'Expired', value: 'expired' as const },
  ];

  readonly activePlacement = signal<AdPlacement>('promoted listings');
  readonly activeStatus = signal<AdStatus>('active');
  readonly isCreateAdTypeModalOpen = signal(false);
  readonly isCreateBannerModalOpen = signal(false);

  readonly bannerAds = signal<BannerRunningAd[]>([
    {
      id: 'banner-1',
      status: 'active',
      title: 'Super shopping day',
      subtitle: 'Flash sale',
      primaryFigure: '99',
      secondaryFigure: 'RM9.99',
      expiresOn: '24 May, 2025',
      sponsorLabel: 'Sponsored',
      views: '1K',
      clicks: '500',
      cardTone: 'linear-gradient(135deg, #FFD95A 0%, #FF8A1F 42%, #F75A1D 100%)',
      textTone: '#FFFFFF',
      accentTone: 'linear-gradient(135deg, #2244E8 0%, #3A6AF0 100%)',
      badgeTone: '#EAF6A2',
      imagePreview: 'assets/images/image-1-1.jpg',
      route: ['/ads/running', 'banner-1'],
    },
    {
      id: 'banner-2',
      status: 'active',
      title: 'Save up to',
      subtitle: 'Starts July 8',
      primaryFigure: '76',
      secondaryFigure: 'Prime day deals',
      expiresOn: '24 May, 2025',
      sponsorLabel: 'Sponsored',
      views: '1K',
      clicks: '500',
      cardTone: 'linear-gradient(135deg, #6AB5FF 0%, #3292FF 52%, #1E79F2 100%)',
      textTone: '#FDFEFE',
      accentTone: 'linear-gradient(135deg, #FF9B22 0%, #FFCF59 100%)',
      badgeTone: '#DDEB94',
      imagePreview: 'assets/images/image-2-1.jpg',
      route: ['/ads/running', 'banner-2'],
    },
    {
      id: 'banner-3',
      status: 'paused',
      title: 'Weekend gadget drop',
      subtitle: 'Paused campaign',
      primaryFigure: '48',
      secondaryFigure: 'Restart anytime',
      expiresOn: '18 May, 2025',
      sponsorLabel: 'Paused',
      views: '650',
      clicks: '112',
      cardTone: 'linear-gradient(135deg, #D8DCE5 0%, #B2B8C7 100%)',
      textTone: '#2A303A',
      accentTone: 'linear-gradient(135deg, #5F6A7E 0%, #8F99AD 100%)',
      badgeTone: '#EEF1AF',
      imagePreview: 'assets/images/image-3-1.jpg',
      route: ['/ads/running', 'banner-3'],
    },
    {
      id: 'banner-4',
      status: 'expired',
      title: 'Back to school deals',
      subtitle: 'Campaign ended',
      primaryFigure: '54',
      secondaryFigure: 'Create again',
      expiresOn: '19 April, 2025',
      sponsorLabel: 'Expired',
      views: '1.8K',
      clicks: '612',
      cardTone: 'linear-gradient(135deg, #D7EEFF 0%, #A6D7FF 55%, #7ABFFF 100%)',
      textTone: '#11314A',
      accentTone: 'linear-gradient(135deg, #2B6CB9 0%, #5AA7FF 100%)',
      badgeTone: '#EDF5AE',
      route: ['/ads/running', 'banner-4'],
    },
  ]);

  readonly ads = signal<RunningAd[]>([
    {
      id: 'other-1',
      title: 'Iphone 17 pro max',
      price: '₦2,500,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&h=700&fit=crop',
    },
    {
      id: 'other-2',
      title: 'Logitech ergonomic mouse',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=600&h=700&fit=crop',
    },
    {
      id: 'other-3',
      title: 'RGB keyboard',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=600&h=700&fit=crop',
    },
    {
      id: 'other-4',
      title: 'Iphone X (64 gig)',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=700&fit=crop',
    },
    {
      id: 'other-5',
      title: 'Ergonomic chair',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=700&fit=crop',
    },
    {
      id: 'auto-1',
      title: 'Maserati',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'automobile listings',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=600&h=700&fit=crop',
    },
    {
      id: 'property-1',
      title: 'Nike sneaker',
      price: '₦35,000',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 May, 2025',
      status: 'active',
      placement: 'promoted listings',
      category: 'property listings',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=700&fit=crop',
    },
    {
      id: 'other-paused',
      title: 'Standing lamp',
      price: '₦58,000',
      views: '840',
      clicks: '210',
      saves: '16',
      expiresOn: '11 Jun, 2025',
      status: 'paused',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=700&fit=crop',
    },
    {
      id: 'other-expired',
      title: 'Wireless headset',
      price: '₦45,000',
      views: '1.2K',
      clicks: '380',
      saves: '28',
      expiresOn: '03 Mar, 2025',
      status: 'expired',
      placement: 'promoted listings',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=700&fit=crop',
    },
    {
      id: 'store-1',
      title: 'The Vine Collections',
      price: '',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 March, 2026',
      status: 'active',
      placement: 'store promotions',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=640&h=360&fit=crop',
      subtitle: '43 active listings',
      logoLabel: 'V',
      logoTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
    },
    {
      id: 'store-2',
      title: 'New Age Properties',
      price: '',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 March, 2026',
      status: 'active',
      placement: 'store promotions',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&h=360&fit=crop',
      subtitle: '43 active listings',
      logoLabel: 'N',
      logoTone: 'linear-gradient(135deg, #101713 0%, #83D95E 100%)',
    },
    {
      id: 'store-3',
      title: 'Snap Thrifts',
      price: '',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '24 March, 2026',
      status: 'paused',
      placement: 'store promotions',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=640&h=360&fit=crop',
      subtitle: '43 active listings',
      logoLabel: 'S',
      logoTone: 'linear-gradient(135deg, #3DBF6C 0%, #62D68A 100%)',
    },
    {
      id: 'store-4',
      title: 'goMelon',
      price: '',
      views: '1K',
      clicks: '500',
      saves: '41',
      expiresOn: '03 March, 2026',
      status: 'expired',
      placement: 'store promotions',
      category: 'other listings',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=640&h=360&fit=crop',
      subtitle: '43 active listings',
      logoLabel: 'g',
      logoTone: 'linear-gradient(135deg, #FF7B2F 0%, #FFB266 100%)',
    },
  ]);

  readonly filteredAds = computed(() =>
    this.ads().filter(
      ad => ad.placement === this.activePlacement() && ad.status === this.activeStatus(),
    ),
  );

  readonly sectionedAds = computed(() => {
    const sections: Array<{ category: ListingCategory; label: string; items: RunningAd[] }> = [
      { category: 'other listings', label: 'Other listings', items: [] },
      { category: 'automobile listings', label: 'Automobile listings', items: [] },
      { category: 'property listings', label: 'Property listings', items: [] },
    ];

    return sections
      .map(section => ({
        ...section,
        items: this.filteredAds().filter(ad => ad.category === section.category),
      }))
      .filter(section => section.items.length > 0);
  });

  readonly visibleBannerAds = computed(() =>
    this.bannerAds().filter(ad => ad.status === this.activeStatus()),
  );

  readonly hasVisibleContent = computed(() =>
    this.activePlacement() === 'banner ads'
      ? this.visibleBannerAds().length > 0
      : this.filteredAds().length > 0,
  );

  readonly promotedStores = computed<Store[]>(() =>
    this.filteredAds().map(ad => ({
      id: ad.id,
      name: ad.title,
      logo: this.storeLogoMap[ad.id] ?? 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
      banner: ad.image,
      followers: '0',
      metaLabel: ad.subtitle ?? '43 active listings',
      activeUntil: ad.expiresOn,
      isVerified: true,
      route: ['/ads/running', ad.id],
    })),
  );

  private readonly storeLogoMap: Record<string, string> = {
    'store-1': 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    'store-2': 'https://cdn-icons-png.flaticon.com/512/1047/1047648.png',
    'store-3': 'https://cdn-icons-png.flaticon.com/512/2813/2813401.png',
    'store-4': 'https://cdn-icons-png.flaticon.com/512/3126/3126040.png',
  };

  readonly emptyStateTitle = computed(() => {
    switch (this.activePlacement()) {
      case 'store promotions':
        return 'You can’t feature stores on the Free plan';
      case 'banner ads':
        return 'You don’t have any running banner ads';
      default:
        return 'You don’t have any running promoted listings';
    }
  });

  readonly emptyStateDescription = computed(() => {
    switch (this.activePlacement()) {
      case 'store promotions':
        return 'Upgrade plan to feature your store(s)';
      case 'banner ads':
        return 'Create a banner ad to start promoting placements here.';
      default:
        return 'Create an ad to start promoting your listings here.';
    }
  });

  readonly emptyStateActionLabel = computed(() =>
    this.activePlacement() === 'store promotions' ? 'Upgrade plan' : 'Create Ad',
  );

  countByStatus(status: AdStatus): number {
    if (this.activePlacement() === 'banner ads') {
      return this.bannerAds().filter(ad => ad.status === status).length;
    }

    return this.ads().filter(ad => ad.placement === this.activePlacement() && ad.status === status).length;
  }

  handleCreateAdTypeSelection(type: CreateAdType): void {
    this.isCreateAdTypeModalOpen.set(false);

    switch (type) {
      case 'banner':
        this.activePlacement.set('banner ads');
        this.isCreateBannerModalOpen.set(true);
        break;
      case 'store':
        this.activePlacement.set('store promotions');
        this.activeStatus.set('active');
        break;
      default:
        this.activePlacement.set('promoted listings');
        this.activeStatus.set('active');
        break;
    }
  }

}
