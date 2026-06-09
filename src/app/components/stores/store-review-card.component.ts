import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface StoreReviewCardData {
  author: string;
  avatar: string;
  rating: number;
  text: string;
  desktopDate: string;
  mobileDate: string;
  galleryImages?: string[];
  galleryOverflowCount?: number;
}

type StoreReviewCardMode = 'desktop' | 'mobile';

@Component({
  selector: 'app-store-review-card',
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <article [class]="articleClass()">
      <div [class]="headerStackClass()">
        <div class="flex items-center gap-2">
          <div [class]="avatarClass()">
            <img
              [ngSrc]="review().avatar"
              [width]="avatarSize()"
              [height]="avatarSize()"
              [alt]="review().author"
              [attr.loading]="imageLoading()"
              [sizes]="avatarSizes()"
              class="h-full w-full object-cover"
            />
          </div>

          <div>
            <h3 [class]="authorClass()">{{ review().author }}</h3>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <img [ngSrc]="starsImage()" width="60" height="12" alt="" class="h-3 w-[60px]" />
          <span class="h-[3px] w-[3px] rounded-full bg-[#BFBFBF]"></span>
          <span [class]="metaClass()">{{ reviewDate() }}</span>
        </div>
      </div>

      <p [class]="bodyClass()">{{ review().text }}</p>

      @if (review().galleryImages?.length) {
        <div class="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div [class]="galleryRowClass()">
            @for (image of review().galleryImages; track image; let last = $last) {
              <div [class]="galleryItemClass()">
                <img
                  [ngSrc]="image"
                  [width]="galleryImageSize()"
                  [height]="galleryImageSize()"
                  alt=""
                  [attr.loading]="imageLoading()"
                  [sizes]="gallerySizes()"
                  class="h-full w-full object-cover"
                />

                @if (last && review().galleryOverflowCount) {
                  <div class="absolute inset-0 bg-black/50"></div>
                  <span [class]="galleryOverflowClass()">+{{ review().galleryOverflowCount }}</span>
                }
              </div>
            }
          </div>
        </div>
      }
    </article>
  `,
  host: {
    class: 'block w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreReviewCardComponent {
  readonly review = input.required<StoreReviewCardData>();
  readonly mode = input<StoreReviewCardMode>('desktop');
  readonly imageLoading = input<'lazy' | 'eager' | 'auto'>('lazy');
  readonly starsImage = input.required<string>();

  protected articleClass(): string {
    return this.mode() === 'desktop' ? 'space-y-3' : 'space-y-[18px]';
  }

  protected headerStackClass(): string {
    return this.mode() === 'desktop' ? 'flex flex-col gap-1' : 'flex flex-col gap-2';
  }

  protected avatarClass(): string {
    const size = this.avatarSize();
    return `overflow-hidden rounded-full ${size === 40 ? 'h-10 w-10' : 'h-11 w-11'}`;
  }

  protected avatarSize(): number {
    return this.mode() === 'desktop' ? 40 : 44;
  }

  protected avatarSizes(): string {
    return this.mode() === 'desktop' ? '40px' : '44px';
  }

  protected authorClass(): string {
    return 'text-[16px] font-medium leading-6 text-[#0D0D0D]';
  }

  protected metaClass(): string {
    return 'text-[14px] leading-5 text-[#8C8C8C]';
  }

  protected bodyClass(): string {
    return this.mode() === 'desktop'
      ? 'text-[16px] leading-6 text-[#1F1F1F]'
      : 'text-[16px] leading-6 text-[#1F1F1F]';
  }

  protected galleryRowClass(): string {
    return this.mode() === 'desktop' ? 'flex w-max gap-3' : 'flex w-max gap-2';
  }

  protected galleryItemClass(): string {
    return this.mode() === 'desktop'
      ? 'relative h-[117px] w-[117px] overflow-hidden rounded-2xl bg-[#E9E9E9]'
      : 'relative h-[78px] w-[78px] overflow-hidden rounded-[10.653px] bg-[#E9E9E9]';
  }

  protected galleryImageSize(): number {
    return this.mode() === 'desktop' ? 117 : 78;
  }

  protected gallerySizes(): string {
    return this.mode() === 'desktop' ? '117px' : '78px';
  }

  protected galleryOverflowClass(): string {
    return this.mode() === 'desktop'
      ? 'absolute inset-0 flex items-center justify-center text-[18px] font-medium leading-6 text-white'
      : 'absolute inset-0 flex items-center justify-center text-[12px] font-medium leading-4 text-white';
  }

  protected reviewDate(): string {
    return this.mode() === 'desktop' ? this.review().desktopDate : this.review().mobileDate;
  }
}
