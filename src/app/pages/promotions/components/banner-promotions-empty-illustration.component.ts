import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-banner-promotions-empty-illustration',
  imports: [NgOptimizedImage],
  template: `
    <div [class]="containerClass()">
      <div
        class="absolute left-0 top-0 h-[261px] w-[309px] origin-top-left"
        [style.transform]="scaleTransform()"
      >
        <div
          class="absolute left-[-12.29px] top-[-16.67px] h-[227.273px] w-[160px] rotate-[-17.02deg]"
        >
          <div class="opacity-[0.72]">
            <div
              class="flex h-[227.273px] w-[160px] flex-col gap-[8.392px] rounded-[16.783px] border-[0.699px] border-[#EAEAEA] bg-white px-[2.797px] pb-[10.49px] pt-[2.797px]"
            >
              <div
                class="relative h-[156.643px] overflow-hidden rounded-[13.986px] border-[0.699px] border-[#EAEAEA] bg-[#EFEFEF]"
              >
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-heart.svg"
                  width="17"
                  height="17"
                  alt=""
                  class="absolute right-[7.69px] top-[7.69px] h-[16.783px] w-[16.783px]"
                />
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-image.svg"
                  width="49"
                  height="49"
                  alt=""
                  class="absolute left-1/2 top-1/2 h-[48.951px] w-[48.951px] -translate-x-1/2 -translate-y-1/2"
                />
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-dots.svg"
                  width="17"
                  height="3"
                  alt=""
                  class="absolute left-1/2 top-[146.15px] h-[2.797px] w-[17.483px] -translate-x-1/2"
                />
              </div>

              <div class="flex flex-col gap-[2.797px] px-[2.797px]">
                <div class="flex items-center justify-between">
                  <div class="h-[13.986px] w-[84.615px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                  <div
                    class="flex h-[11.189px] items-center rounded-[699.301px] bg-[#F0F0F0] px-[5.594px]"
                  >
                    <span class="text-[8.392px] leading-[11.189px] text-transparent">New</span>
                  </div>
                </div>
                <div class="h-[11.189px] w-[66.434px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                <div class="flex items-center gap-[2.797px]">
                  <img
                    ngSrc="/assets/icons/banner-promotions-empty-location.svg"
                    width="8"
                    height="8"
                    alt=""
                    class="h-[8.392px] w-[8.392px]"
                  />
                  <div class="h-[8.392px] w-[44.056px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="absolute left-[92.06px] top-[-17.04px] h-[227.273px] w-[160px] rotate-[18.88deg]"
        >
          <div class="opacity-[0.72]">
            <div
              class="flex h-[227.273px] w-[160px] flex-col gap-[8.392px] rounded-[16.783px] border-[0.699px] border-[#EAEAEA] bg-white px-[2.797px] pb-[10.49px] pt-[2.797px]"
            >
              <div
                class="relative h-[156.643px] overflow-hidden rounded-[13.986px] border-[0.699px] border-[#EAEAEA] bg-[#EFEFEF]"
              >
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-heart.svg"
                  width="17"
                  height="17"
                  alt=""
                  class="absolute right-[7.69px] top-[7.69px] h-[16.783px] w-[16.783px]"
                />
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-image.svg"
                  width="49"
                  height="49"
                  alt=""
                  class="absolute left-1/2 top-1/2 h-[48.951px] w-[48.951px] -translate-x-1/2 -translate-y-1/2"
                />
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-dots.svg"
                  width="17"
                  height="3"
                  alt=""
                  class="absolute left-1/2 top-[146.15px] h-[2.797px] w-[17.483px] -translate-x-1/2"
                />
              </div>

              <div class="flex flex-col gap-[2.797px] px-[2.797px]">
                <div class="flex items-center justify-between">
                  <div class="h-[13.986px] w-[84.615px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                  <div
                    class="flex h-[11.189px] items-center rounded-[699.301px] bg-[#F0F0F0] px-[5.594px]"
                  >
                    <span class="text-[8.392px] leading-[11.189px] text-transparent">New</span>
                  </div>
                </div>
                <div class="h-[11.189px] w-[66.434px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                <div class="flex items-center gap-[2.797px]">
                  <img
                    ngSrc="/assets/icons/banner-promotions-empty-location.svg"
                    width="8"
                    height="8"
                    alt=""
                    class="h-[8.392px] w-[8.392px]"
                  />
                  <div class="h-[8.392px] w-[44.056px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="absolute left-[65.19px] top-[-4.74px] h-[227.273px] w-[160px]">
          <div class="opacity-[0.72]">
            <div
              class="flex h-[227.273px] w-[160px] flex-col gap-[8.392px] rounded-[16.783px] border-[0.699px] border-[#EAEAEA] bg-white px-[2.797px] pb-[10.49px] pt-[2.797px]"
            >
              <div
                class="relative h-[156.643px] overflow-hidden rounded-[13.986px] border-[0.699px] border-[#EAEAEA] bg-[#EFEFEF]"
              >
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-heart.svg"
                  width="17"
                  height="17"
                  alt=""
                  class="absolute right-[7.69px] top-[7.69px] h-[16.783px] w-[16.783px]"
                />

                <div
                  class="absolute left-1/2 top-1/2 flex w-[137.063px] -translate-x-1/2 -translate-y-1/2 items-center justify-between"
                >
                  <span
                    class="flex h-[16.783px] w-[16.783px] items-center justify-center rounded-full border-[0.42px] border-[#EAEAEA] bg-white shadow-[0px_1.678px_3.357px_rgba(202,202,202,0.25)]"
                  >
                    <img
                      ngSrc="/assets/icons/banner-promotions-empty-arrow-left.svg"
                      width="8"
                      height="8"
                      alt=""
                      class="h-[8.392px] w-[8.392px]"
                    />
                  </span>
                  <span
                    class="flex h-[16.783px] w-[16.783px] items-center justify-center rounded-full border-[0.42px] border-[#EAEAEA] bg-white shadow-[0px_1.678px_3.357px_rgba(202,202,202,0.25)]"
                  >
                    <img
                      ngSrc="/assets/icons/banner-promotions-empty-arrow-right.svg"
                      width="8"
                      height="8"
                      alt=""
                      class="h-[8.392px] w-[8.392px]"
                    />
                  </span>
                </div>

                <img
                  ngSrc="/assets/icons/banner-promotions-empty-image.svg"
                  width="49"
                  height="49"
                  alt=""
                  class="absolute left-1/2 top-1/2 h-[48.951px] w-[48.951px] -translate-x-1/2 -translate-y-1/2"
                />
                <img
                  ngSrc="/assets/icons/banner-promotions-empty-dots.svg"
                  width="17"
                  height="3"
                  alt=""
                  class="absolute left-1/2 top-[146.15px] h-[2.797px] w-[17.483px] -translate-x-1/2"
                />
              </div>

              <div class="flex flex-col gap-[2.797px] px-[2.797px]">
                <div class="flex items-center justify-between">
                  <div class="h-[13.986px] w-[84.615px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                  <div
                    class="flex h-[11.189px] items-center rounded-[699.301px] bg-[#F0F0F0] px-[5.594px]"
                  >
                    <span class="text-[8.392px] leading-[11.189px] text-transparent">New</span>
                  </div>
                </div>
                <div class="h-[11.189px] w-[66.434px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                <div class="flex items-center gap-[2.797px]">
                  <img
                    ngSrc="/assets/icons/banner-promotions-empty-location.svg"
                    width="8"
                    height="8"
                    alt=""
                    class="h-[8.392px] w-[8.392px]"
                  />
                  <div class="h-[8.392px] w-[44.056px] rounded-[69.93px] bg-[#D9D9D9]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          class="absolute left-0 top-[17px] h-[244px] w-[309px] rounded-[20px]"
          style="background: linear-gradient(181.409675deg, rgba(255, 255, 255, 0) 1.5111%, #ffffff 90.395%);"
        ></div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BannerPromotionsEmptyIllustrationComponent {
  readonly variant = input<'desktop' | 'mobile'>('desktop');

  protected containerClass(): string {
    return this.variant() === 'mobile'
      ? 'relative h-[141.902px] w-[168px]'
      : 'relative h-[260.999px] w-[309px]';
  }

  protected scaleTransform(): string {
    return this.variant() === 'mobile' ? 'scale(0.543689)' : 'scale(1)';
  }
}
