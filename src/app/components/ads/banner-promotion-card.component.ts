import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface BannerPromotionCardData {
  id: string;
  title: string;
  subtitle: string;
  primaryFigure: string;
  secondaryFigure: string;
  expiresOn: string;
  sponsorLabel: string;
  views: string;
  clicks: string;
  cardTone: string;
  textTone: string;
  accentTone: string;
  badgeTone: string;
  imagePreview?: string | null;
  route?: readonly string[];
  showSponsorBadge?: boolean;
}

@Component({
  selector: 'app-banner-promotion-card',
  imports: [CommonModule, RouterLink, NgOptimizedImage],
  template: `
    <article
      [class]="compact()
        ? 'overflow-hidden rounded-[20.639px] border-[0.86px] border-[#EAEAEA] bg-white'
        : 'overflow-hidden rounded-[26px] border border-[#E8E8EC] bg-white shadow-[0_16px_40px_-30px_rgba(17,24,39,0.35)]'"
    >
      @if (card().route; as route) {
        <a [routerLink]="route" class="block">
          <ng-container [ngTemplateOutlet]="cardContent"></ng-container>
        </a>
      } @else {
        <ng-container [ngTemplateOutlet]="cardContent"></ng-container>
      }
    </article>

    <ng-template #cardContent>
      @if (compact()) {
        <div class="flex flex-col gap-[8.6px] p-[3.44px]">
          <div class="relative h-[192.629px] w-full overflow-hidden rounded-[20.639px]" [style.background]="card().cardTone">
            @if (card().imagePreview) {
              <img
                [ngSrc]="card().imagePreview ?? ''"
                width="343"
                height="193"
                alt=""
                class="absolute inset-0 h-full w-full object-cover"
              />
            }

            <div
              class="absolute left-[6.62px] top-[6.45px] rounded-[8px] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
              [style.background]="card().badgeTone"
            >
              Active until: {{ card().expiresOn }}
            </div>

            @if (card().showSponsorBadge ?? false) {
              <div class="absolute left-[17.2px] top-[154.79px] rounded-[859.951px] bg-black/50 px-[6.88px] py-[3.44px] text-[12.039px] font-medium leading-[13.759px] text-white backdrop-blur-[1.72px]">
                {{ card().sponsorLabel }}
              </div>
            }
          </div>

          <div class="flex items-center gap-[10px] px-4 pb-[12px] text-[14px] leading-4 text-[#959595]">
            <span class="inline-flex items-center gap-[2px]">
              <img
                ngSrc="/assets/icons/admin-user-details/ads/eye.svg"
                width="14"
                height="14"
                alt=""
                class="h-[14px] w-[14px] shrink-0"
                aria-hidden="true"
              />
              {{ card().views }}
            </span>
            <span class="inline-flex items-center gap-[2px]">
              <img
                ngSrc="/assets/icons/admin-user-details/ads/click.svg"
                width="14"
                height="14"
                alt=""
                class="h-[14px] w-[14px] shrink-0"
                aria-hidden="true"
              />
              {{ card().clicks }}
            </span>
          </div>
        </div>
      } @else {
        <div
          class="relative m-3 aspect-[1.72/1] overflow-hidden rounded-[24px]"
          [style.background]="card().cardTone"
        >
          @if (card().imagePreview) {
            <img
              [src]="card().imagePreview"
              alt=""
              class="absolute inset-0 h-full w-full object-cover"
            >
          }

          <div
            class="absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-[#6A6B1F] shadow-sm"
            [style.background]="card().badgeTone"
          >
            Active until: {{ card().expiresOn }}
          </div>

          @if (!card().imagePreview) {
            <div class="absolute left-4 top-16 h-16 w-16 rotate-[-18deg] rounded-[18px] bg-white/25 backdrop-blur-[2px]"></div>
            <div class="absolute left-[4.5rem] top-10 h-8 w-8 rounded-full bg-white/20"></div>
            <div class="absolute bottom-4 right-5 h-14 w-14 rotate-[18deg] rounded-[18px] bg-white/15"></div>
            <div class="absolute right-16 top-5 h-10 w-10 rounded-full bg-white/15"></div>

            <div class="relative z-10 flex h-full items-end justify-between px-5 py-5">
              <div class="max-w-[48%] text-left">
                <p class="text-[10px] font-black uppercase tracking-[0.24em]" [style.color]="card().textTone">
                  {{ card().subtitle }}
                </p>
                <h3 class="mt-2 text-[34px] font-black leading-[0.9]" [style.color]="card().textTone">
                  {{ card().primaryFigure }}
                </h3>
                <p class="mt-2 text-[12px] font-bold uppercase tracking-[0.16em]" [style.color]="card().textTone">
                  {{ card().title }}
                </p>
              </div>

              <div class="flex h-full w-[45%] items-center justify-center">
                <div class="relative h-[72%] w-full">
                  <div class="absolute inset-x-4 bottom-0 h-24 rounded-t-[28px] bg-[#F2E2C1]/90"></div>
                  <div class="absolute left-4 top-3 h-[4.5rem] w-[4.5rem] rotate-[-18deg] rounded-[22px] bg-white/85 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.65)]"></div>
                  <div class="absolute left-[42%] top-7 h-16 w-16 rotate-[12deg] rounded-[20px] bg-[#25282E]/85 shadow-[0_12px_24px_-14px_rgba(15,23,42,0.85)]"></div>
                  <div class="absolute right-5 top-1 h-10 w-10 rounded-full bg-white/90 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.55)]"></div>
                  <div
                    class="absolute bottom-7 right-1 h-12 w-20 rounded-[18px] shadow-[0_12px_24px_-16px_rgba(15,23,42,0.85)]"
                    [style.background]="card().accentTone"
                  ></div>
                </div>
              </div>
            </div>
          }

          @if (card().showSponsorBadge ?? true) {
            <div class="absolute bottom-4 left-4 rounded-full bg-[#23262D]/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
              {{ card().sponsorLabel }}
            </div>
          }

          <div class="absolute bottom-4 right-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#242730] shadow-sm">
            {{ card().secondaryFigure }}
          </div>
        </div>

        <div class="flex items-center gap-4 px-4 pb-4 text-[13px] font-medium text-[#A3A6AE]">
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-[#C7CBD3]"></span>
            {{ card().views }}
          </span>
          <span class="inline-flex items-center gap-1.5">
            <span class="h-2 w-2 rounded-full bg-[#C7CBD3]"></span>
            {{ card().clicks }}
          </span>
        </div>
      }
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerPromotionCardComponent {
  readonly card = input.required<BannerPromotionCardData>();
  readonly compact = input(false);
}
