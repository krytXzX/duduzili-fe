import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { Router } from '@angular/router';

export interface StoreItemCardData {
  id: string;
  title: string;
  image: string;
  price: string;
  originalPrice?: string;
  location: string;
  condition?: 'New' | 'Used';
  isVerified?: boolean;
  discount?: string;
  showCarousel?: boolean;
}

type StoreItemCardMode = 'desktop' | 'mobile';

@Component({
  selector: 'app-store-item-card',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <article
      [class]="articleClass()"
      [class.cursor-pointer]="isClickable()"
      [attr.role]="isClickable() ? 'link' : null"
      [attr.tabindex]="isClickable() ? '0' : null"
      (click)="onCardClick()"
      (keydown.enter)="onCardClick()"
      (keydown.space)="onCardActivateWithKeyboard($event)"
    >
      <div [class]="mediaClass()">
        <img
          [ngSrc]="item().image"
          [width]="imageWidth()"
          [height]="imageHeight()"
          [alt]="item().title"
          [class]="imageClass()"
        />
        <div
          class="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62.75%,rgba(0,0,0,0.5)_100%)]"
        ></div>

        @if (item().showCarousel) {
          <div [class]="carouselNavClass()">
            <button
              type="button"
              [class]="arrowButtonClass()"
              aria-label="Previous image"
              (click)="$event.stopPropagation()"
            >
              <img
                [ngSrc]="leftArrowIcon()"
                [width]="arrowIconSize()"
                [height]="arrowIconSize()"
                alt=""
                [class]="arrowIconClass()"
              />
            </button>
            <button
              type="button"
              [class]="arrowButtonClass()"
              aria-label="Next image"
              (click)="$event.stopPropagation()"
            >
              <img
                [ngSrc]="rightArrowIcon()"
                [width]="arrowIconSize()"
                [height]="arrowIconSize()"
                alt=""
                [class]="arrowIconClass()"
              />
            </button>
          </div>

          @if (mode() === 'desktop') {
            <div class="absolute bottom-[11px] left-1/2 flex -translate-x-1/2 gap-[3px]">
              <span class="h-1 w-[11px] rounded-full bg-white"></span>
              <span class="h-1 w-[4px] rounded-full bg-[#777777]"></span>
              <span class="h-1 w-[4px] rounded-full bg-[#777777]"></span>
            </div>
          }
        }

        @if (item().isVerified) {
          <div [class]="verifiedBadgeClass()">
            <img
              [ngSrc]="badgeIcon()"
              [width]="badgeIconSize()"
              [height]="badgeIconSize()"
              alt=""
              [class]="badgeIconClass()"
            />
            <span [class]="verifiedTextClass()">Verified</span>
          </div>
        }

        @if (item().discount) {
          <div [class]="discountClass()">
            {{ item().discount }}
          </div>
        }

        <button
          type="button"
          [class]="heartButtonClass()"
          aria-label="Save product"
          (click)="$event.stopPropagation()"
        >
          <img [ngSrc]="heartIcon()" width="24" height="24" alt="" class="h-6 w-6" />
        </button>
      </div>

      <div [class]="contentClass()">
        <div [class]="titleRowClass()">
          <h3 [class]="titleClass()">{{ item().title }}</h3>
          @if (item().condition) {
            <span [class]="conditionClass()">
              {{ item().condition }}
            </span>
          }
        </div>

        <div [class]="priceRowClass()">
          <span [class]="priceClass()">{{ item().price }}</span>
          @if (item().originalPrice) {
            <span [class]="originalPriceClass()">
              {{ item().originalPrice }}
            </span>
          }
        </div>

        <div [class]="locationRowClass()">
          <img
            [ngSrc]="locationIcon()"
            [width]="locationIconSize()"
            [height]="locationIconSize()"
            alt=""
            [class]="locationIconClass()"
          />
          <span>{{ item().location }}</span>
        </div>
      </div>
    </article>
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreItemCardComponent {
  private readonly router = inject(Router);

  readonly item = input.required<StoreItemCardData>();
  readonly mode = input<StoreItemCardMode>('desktop');
  readonly badgeIcon = input.required<string>();
  readonly heartIcon = input.required<string>();
  readonly locationIcon = input.required<string>();
  readonly leftArrowIcon = input.required<string>();
  readonly rightArrowIcon = input.required<string>();
  readonly routeCommands = input<readonly string[] | null>(null);

  protected articleClass(): string {
    return this.mode() === 'desktop'
      ? 'rounded-[24px] border border-[#EAEAEA] bg-white px-1 pb-[15px] pt-1'
      : 'rounded-[13.451px] border-[0.56px] border-[#EAEAEA] bg-white p-[2.242px] pb-[8.407px]';
  }

  protected mediaClass(): string {
    return this.mode() === 'desktop'
      ? 'relative overflow-hidden rounded-[20px]'
      : 'relative overflow-hidden rounded-[11.21px]';
  }

  protected imageClass(): string {
    return this.mode() === 'desktop'
      ? 'h-[264px] w-full object-cover'
      : 'h-[168px] w-full object-cover';
  }

  protected imageWidth(): number {
    return this.mode() === 'desktop' ? 185 : 167;
  }

  protected imageHeight(): number {
    return this.mode() === 'desktop' ? 264 : 168;
  }

  protected carouselNavClass(): string {
    return this.mode() === 'desktop'
      ? 'absolute inset-x-[12px] top-1/2 flex -translate-y-1/2 justify-between'
      : 'absolute inset-x-[6px] top-1/2 flex -translate-y-1/2 justify-between';
  }

  protected arrowButtonClass(): string {
    return this.mode() === 'desktop'
      ? 'inline-flex h-8 w-8 items-center justify-center rounded-full border-[0.8px] border-[#EAEAEA] bg-white shadow-[0_3.2px_6.4px_rgba(202,202,202,0.25)]'
      : 'inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2px_4px_rgba(202,202,202,0.25)]';
  }

  protected arrowIconSize(): number {
    return this.mode() === 'desktop' ? 16 : 10;
  }

  protected arrowIconClass(): string {
    return this.mode() === 'desktop' ? 'h-4 w-4' : 'h-[10px] w-[10px]';
  }

  protected verifiedBadgeClass(): string {
    return this.mode() === 'desktop'
      ? 'absolute left-3 top-3 inline-flex h-6 items-center gap-1 rounded-[8px] border border-[#EAEAEA] bg-white px-2'
      : 'absolute left-[6.73px] top-[6.73px] inline-flex h-[20px] items-center gap-[2.242px] rounded-[6px] border-[0.56px] border-[#EAEAEA] bg-white px-[4.484px]';
  }

  protected badgeIconSize(): number {
    return this.mode() === 'desktop' ? 14 : 12;
  }

  protected badgeIconClass(): string {
    return this.mode() === 'desktop' ? 'h-[14px] w-[14px]' : 'h-3 w-3';
  }

  protected verifiedTextClass(): string {
    return this.mode() === 'desktop'
      ? 'text-[12px] font-semibold leading-none text-black'
      : 'text-[10px] font-medium leading-none text-black';
  }

  protected discountClass(): string {
    return this.mode() === 'desktop'
      ? 'absolute left-3 top-[41px] inline-flex items-center rounded-[8px] bg-[#E9FF7C] px-[6px] py-[2px] text-[12px] font-medium text-[#4E3E07]'
      : 'absolute left-[6.76px] top-[29.76px] inline-flex items-center rounded-[8px] bg-[#E9FF7C] px-[6px] py-[2px] text-[12px] font-medium text-[#4E3E07]';
  }

  protected heartButtonClass(): string {
    return this.mode() === 'desktop'
      ? 'absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center'
      : 'absolute right-[8px] top-[8px] inline-flex h-6 w-6 items-center justify-center';
  }

  protected contentClass(): string {
    return this.mode() === 'desktop' ? 'space-y-1 px-1 pt-3' : 'space-y-2 px-[2.242px] pt-[8px]';
  }

  protected titleRowClass(): string {
    return 'flex items-start justify-between gap-2';
  }

  protected titleClass(): string {
    return this.mode() === 'desktop'
      ? 'text-[14px] leading-5 text-[#1F1F1F]'
      : 'text-[13px] leading-[11.21px] text-[#1F1F1F]';
  }

  protected conditionClass(): string {
    return 'inline-flex shrink-0 items-center rounded-[1000px] bg-[#F0F0F0] px-[6px] py-[2px] text-[10px] leading-none text-[#1F1F1F]';
  }

  protected priceRowClass(): string {
    return this.mode() === 'desktop'
      ? 'flex min-h-6 items-center gap-[6px]'
      : 'flex min-h-[14px] items-center gap-1';
  }

  protected priceClass(): string {
    return this.mode() === 'desktop'
      ? 'text-[16px] font-medium leading-6 text-[#1F1F1F]'
      : 'text-[14px] font-medium leading-[13.451px] text-[#1F1F1F]';
  }

  protected originalPriceClass(): string {
    return this.mode() === 'desktop'
      ? 'text-[12px] leading-6 text-[#888888] line-through'
      : 'text-[12px] leading-[24px] text-[#888888] line-through';
  }

  protected locationRowClass(): string {
    return this.mode() === 'desktop'
      ? 'flex items-center gap-1 text-[12px] text-[#959595]'
      : 'flex items-center gap-[2.242px] text-[10px] text-[#959595]';
  }

  protected locationIconSize(): number {
    return this.mode() === 'desktop' ? 12 : 10;
  }

  protected locationIconClass(): string {
    return this.mode() === 'desktop' ? 'h-3 w-3' : 'h-[10px] w-[10px]';
  }

  protected isClickable(): boolean {
    const routeCommands = this.routeCommands();
    return Array.isArray(routeCommands) && routeCommands.length > 0;
  }

  protected onCardClick(): void {
    const routeCommands = this.routeCommands();
    if (!routeCommands?.length) {
      return;
    }

    void this.router.navigate([...routeCommands]);
  }

  protected onCardActivateWithKeyboard(event: Event): void {
    event.preventDefault();
    this.onCardClick();
  }
}
