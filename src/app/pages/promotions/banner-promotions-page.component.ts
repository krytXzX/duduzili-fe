import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlus } from '@ng-icons/heroicons/outline';
import { CreateBannerAdModalComponent, CreateBannerAdPayload } from './components/create-banner-ad-modal.component';
import { BannerPromotionCardComponent, BannerPromotionCardData } from '../../components/ads/banner-promotion-card.component';

type PromotionStatus = 'active' | 'paused' | 'pending approval' | 'declined' | 'expired';

interface PromotionTab {
  label: string;
  value: PromotionStatus;
}

interface BannerPromotion extends BannerPromotionCardData {
  status: PromotionStatus;
}

@Component({
  selector: 'app-banner-promotions-page',
  imports: [CommonModule, NgIcon, NgOptimizedImage, CreateBannerAdModalComponent, BannerPromotionCardComponent],
  providers: [
    provideIcons({
      heroPlus
    })
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex flex-col gap-5 border-b border-[#F0F0F2] px-4 py-5 sm:px-8 sm:py-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Banner promotions</h1>

        <button
          type="button"
          (click)="isCreateModalOpen.set(true)"
          class="inline-flex items-center justify-center gap-2 self-start rounded-full bg-[#6E5AE6] px-5 py-3 text-[13px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(110,90,230,0.8)] transition hover:bg-[#614DDE] focus:outline-none focus:ring-4 focus:ring-[#6E5AE6]/20"
        >
          <ng-icon name="heroPlus" class="text-base"></ng-icon>
          Promote banner
        </button>
      </div>

      @if (promotions().length > 0) {
        <div class="flex-1 px-4 py-5 sm:px-8 sm:py-6">
          <div class="mb-6 flex flex-wrap gap-3">
            @for (tab of tabs; track tab.value) {
              <button
                type="button"
                (click)="activeTab.set(tab.value)"
                [attr.aria-pressed]="activeTab() === tab.value"
                [class]="activeTab() === tab.value
                  ? 'rounded-full bg-[#1F2024] px-4 py-2 text-[13px] font-semibold text-white transition focus:outline-none focus:ring-4 focus:ring-[#1F2024]/10'
                  : 'rounded-full bg-[#F5F5F6] px-4 py-2 text-[13px] font-semibold text-[#3C4047] transition hover:bg-[#ECECEF] focus:outline-none focus:ring-4 focus:ring-gray-200'"
              >
                {{ tab.label }}({{ countByStatus(tab.value) }})
              </button>
            }
          </div>

          @if (visiblePromotions().length > 0) {
            <div class="grid max-w-4xl gap-5 xl:grid-cols-2">
              @for (promotion of visiblePromotions(); track promotion.id) {
                <app-banner-promotion-card [card]="promotion"></app-banner-promotion-card>
              }
            </div>
          } @else {
            <div class="flex min-h-[320px] items-center justify-center rounded-[28px] border border-dashed border-[#E2E3E7] bg-[#FAFAFB] px-6 text-center">
              <div>
                <h2 class="text-[19px] font-bold text-[#1A1C21]">No {{ activeTab() }} banners yet</h2>
                <p class="mt-2 text-[13px] font-medium text-[#8A8F98]">Switch tabs or promote a new banner to populate this section.</p>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="flex flex-1 flex-col items-center justify-center p-12 text-center">
          <div class="relative mb-8 aspect-[4/3] w-full max-w-md">
            <img
              ngSrc="assets/images/empty_state.svg"
              alt="No banner promotions"
              fill
              class="object-contain"
              priority
            >
          </div>

          <h2 class="mb-3 text-[24px] font-bold tracking-tight text-[#1A1C21]">
            You don't have any running banner promotions
          </h2>

          <p class="mb-10 text-[15px] font-medium text-gray-500">
            Upgrade plan to post banners
          </p>

          <button
            type="button"
            (click)="isCreateModalOpen.set(true)"
            class="inline-flex items-center gap-2 rounded-full bg-[#7B5EE4] px-8 py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#6849D6] hover:shadow-md hover:shadow-purple-500/20 focus:outline-none focus:ring-4 focus:ring-purple-500/20"
          >
            <ng-icon name="heroPlus" class="text-xl"></ng-icon>
            Promote banner
          </button>
        </div>
      }
    </div>

    @if (isCreateModalOpen()) {
      <app-create-banner-ad-modal
        (close)="isCreateModalOpen.set(false)"
        (submit)="onCreateBannerAd($event)"
      ></app-create-banner-ad-modal>
    }
  `,
  host: {
    class: 'block h-full'
  },
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BannerPromotionsPageComponent {
  readonly tabs: PromotionTab[] = [
    { label: 'Active', value: 'active' },
    { label: 'Paused', value: 'paused' },
    { label: 'Pending approval', value: 'pending approval' },
    { label: 'Declined', value: 'declined' },
    { label: 'Expired', value: 'expired' }
  ];

  readonly promotions = signal<BannerPromotion[]>([
    {
      id: 'promo-1',
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
      id: 'promo-2',
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
      id: 'promo-3',
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
      id: 'promo-4',
      status: 'pending approval',
      title: 'Home office essentials',
      subtitle: 'Pending review',
      primaryFigure: '35',
      secondaryFigure: 'Awaiting approval',
      expiresOn: '30 May, 2025',
      sponsorLabel: 'Reviewing',
      views: '320',
      clicks: '64',
      cardTone: 'linear-gradient(135deg, #BFE9F0 0%, #77D3E7 45%, #2CB6D7 100%)',
      textTone: '#103340',
      accentTone: 'linear-gradient(135deg, #0A657B 0%, #12A1BF 100%)',
      badgeTone: '#EAF6A2',
      route: ['/ads/running', 'banner-4'],
    },
    {
      id: 'promo-5',
      status: 'declined',
      title: 'Beauty launch',
      subtitle: 'Needs update',
      primaryFigure: '20',
      secondaryFigure: 'Fix artwork',
      expiresOn: '11 May, 2025',
      sponsorLabel: 'Declined',
      views: '210',
      clicks: '40',
      cardTone: 'linear-gradient(135deg, #FFD9DF 0%, #FFA5B2 50%, #FF7A92 100%)',
      textTone: '#5B1630',
      accentTone: 'linear-gradient(135deg, #8F163C 0%, #D93663 100%)',
      badgeTone: '#FFF1A8',
      route: ['/ads/running', 'banner-5'],
    },
    {
      id: 'promo-6',
      status: 'expired',
      title: 'Lifestyle refresh',
      subtitle: 'Campaign ended',
      primaryFigure: '15',
      secondaryFigure: 'Run again',
      expiresOn: '03 May, 2025',
      sponsorLabel: 'Expired',
      views: '890',
      clicks: '271',
      cardTone: 'linear-gradient(135deg, #F8EECF 0%, #EEDB9B 50%, #E0C776 100%)',
      textTone: '#4A3610',
      accentTone: 'linear-gradient(135deg, #9D7B1A 0%, #CFAF48 100%)',
      badgeTone: '#F1F5B0',
      route: ['/ads/running', 'banner-6'],
    }
  ]);

  readonly activeTab = signal<PromotionStatus>('active');
  readonly isCreateModalOpen = signal(false);

  readonly visiblePromotions = computed(() =>
    this.promotions().filter((promotion) => promotion.status === this.activeTab())
  );

  countByStatus(status: PromotionStatus): number {
    return this.promotions().filter((promotion) => promotion.status === status).length;
  }

  onCreateBannerAd(payload: CreateBannerAdPayload): void {
    const cardTone = payload.bannerType === 'video'
      ? 'linear-gradient(135deg, #5F7CFA 0%, #2E91FF 45%, #28C6F0 100%)'
      : 'linear-gradient(135deg, #FFCC4B 0%, #FF8C1A 42%, #F35B22 100%)';

    this.promotions.update((promotions) => [
      {
        id: `promo-${Date.now()}`,
        status: 'pending approval',
        title: payload.title,
        subtitle: payload.bannerType === 'video' ? 'Video banner' : 'Image banner',
        primaryFigure: payload.bannerType === 'video' ? 'HD' : 'NEW',
        secondaryFigure: 'Awaiting approval',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Reviewing',
        views: '0',
        clicks: '0',
        cardTone,
        textTone: '#FFFFFF',
        accentTone: 'linear-gradient(135deg, #21252F 0%, #4F5B74 100%)',
        badgeTone: '#EAF6A2',
        imagePreview: payload.imagePreview
      },
      ...promotions
    ]);

    this.activeTab.set('pending approval');
    this.isCreateModalOpen.set(false);
  }
}
