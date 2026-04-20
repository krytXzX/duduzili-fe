import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

interface CallbackRecord {
  readonly id: string;
  readonly buyerName: string;
  readonly buyerAvatar: string;
  readonly phoneNumber: string;
  readonly listingName: string;
  readonly listingImage: string;
  readonly storeName: string;
  readonly storeImage: string;
  readonly storeUsesContain?: boolean;
  readonly dateRequested: string;
}

@Component({
  selector: 'app-callbacks-page',
  imports: [CommonModule, NgOptimizedImage, RouterLink],
  template: `
    <div class="flex h-full min-h-0 flex-col bg-white">
      <div class="hidden h-full min-h-0 md:flex md:flex-col">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-[1076px] flex-col pt-[93px]">
          <div class="flex min-h-0 flex-1 flex-col gap-[321px]">
            <section class="relative rounded-[16px] border border-[#F0F0F0] bg-white">
              <div class="flex items-center justify-between px-[15px] pb-[15px] pt-[15px]">
                <div class="flex items-start gap-2">
                  <button
                    type="button"
                    class="flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] px-3 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <span class="text-[14px] font-medium leading-5 text-[#36394A]">
                      <span class="text-[rgba(26,27,29,0.5)]">Store:</span> All
                    </span>
                    <img
                      ngSrc="/assets/icons/offers-chevron-down.svg"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                    />
                  </button>

                  <button
                    type="button"
                    class="flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] px-3 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <span class="text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)]">
                      Date requested
                    </span>
                    <img
                      ngSrc="/assets/icons/offers-chevron-down.svg"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                    />
                  </button>
                </div>

                <label
                  class="flex h-10 w-[224px] items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
                >
                  <img
                    ngSrc="/assets/icons/offers-search.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                  <input
                    type="search"
                    [value]="searchTerm()"
                    (input)="updateSearch($event)"
                    placeholder="Search"
                    class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                  />
                </label>
              </div>

              <div class="overflow-hidden rounded-[16px] border-t border-[#F0F0F0]">
                <div
                  class="grid grid-cols-[180px_150px_260px_205px_124px_72px] items-center bg-[#FAFAFA] px-6 py-[11px]"
                >
                  <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                    Buyer
                  </span>
                  <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                    Phone number
                  </span>
                  <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                    Listing
                  </span>
                  <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                    Store
                  </span>
                  <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                    Date requested
                  </span>
                  <span></span>
                </div>

                @for (request of filteredCallbacks(); track request.id) {
                  <button
                    type="button"
                    (click)="openDetails(request)"
                    class="grid grid-cols-[180px_150px_260px_205px_124px_72px] items-center border-b border-[#F0F0F0] px-6"
                    [class.border-b-0]="$last"
                  >
                    <div class="flex h-[74px] items-center gap-2">
                      <img
                        [ngSrc]="request.buyerAvatar"
                        width="32"
                        height="32"
                        [alt]="request.buyerName"
                        class="h-8 w-8 rounded-full object-cover"
                      />
                      <span class="text-[14px] font-medium leading-normal text-[#0D0D0D]">
                        {{ request.buyerName }}
                      </span>
                    </div>

                    <div class="flex h-[74px] items-center">
                      <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                        {{ request.phoneNumber }}
                      </span>
                    </div>

                    <div class="flex h-[74px] items-center gap-2">
                      <span
                        class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[6px] bg-[#EFEFEF]"
                      >
                        <img
                          [ngSrc]="request.listingImage"
                          width="40"
                          height="40"
                          [alt]="request.listingName"
                          class="h-10 w-10 object-cover"
                        />
                      </span>
                      <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                        {{ request.listingName }}
                      </span>
                    </div>

                    <div class="flex h-[74px] items-center gap-2">
                      <span
                        class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                        [class.bg-[#3D785F]]="request.storeName === 'The Vine Collections'"
                      >
                        <img
                          [ngSrc]="request.storeImage"
                          width="32"
                          height="32"
                          [alt]="request.storeName"
                          class="h-8 w-8"
                          [class.object-contain]="request.storeUsesContain"
                          [class.object-cover]="!request.storeUsesContain"
                        />
                      </span>
                      <span class="text-[14px] leading-normal text-[#1A1B1D]">
                        {{ request.storeName }}
                      </span>
                    </div>

                    <div class="flex h-[74px] items-center">
                      <span class="text-[14px] leading-normal text-[#1A1B1D]">
                        {{ request.dateRequested }}
                      </span>
                    </div>

                    <div class="flex h-[74px] items-center justify-end">
                      <span
                        class="flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA]"
                      >
                        <img
                          ngSrc="/assets/icons/callbacks-call-desktop.svg"
                          width="16"
                          height="16"
                          alt=""
                          class="h-4 w-4"
                        />
                      </span>
                    </div>
                  </button>
                }
              </div>
            </section>

            <div class="flex items-center justify-between">
              <p class="text-[16px] font-medium leading-normal text-[#1A1B1D]">
                {{ filteredCallbacks().length }}
                <span class="text-[rgba(26,27,29,0.5)]">results</span>
              </p>

              <div class="flex items-center gap-2 opacity-50">
                <div class="flex items-end gap-[5px]">
                  <button
                    type="button"
                    class="flex h-8 w-[44px] items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <img
                      ngSrc="/assets/icons/offers-chevron-left.svg"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                    />
                  </button>
                  <button
                    type="button"
                    class="flex h-8 w-[44px] items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <span class="text-[14px] font-medium leading-5 text-[#1A1B1D]">1</span>
                  </button>
                  <button
                    type="button"
                    class="flex h-8 w-[44px] items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <img
                      ngSrc="/assets/icons/offers-chevron-right.svg"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                    />
                  </button>
                </div>

                <span class="text-[16px] leading-normal text-[#1C1F1D]">of 12</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-[390px] px-5 pb-[120px] pt-4 md:hidden">
        <div class="flex items-center gap-2">
          <a
            routerLink="/requests"
            aria-label="Back to Requests"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]"
          >
            <img
              ngSrc="/assets/icons/offers-back-mobile.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
            />
          </a>

          <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Call back requests</h1>
        </div>

        <div class="mt-10 flex items-center gap-3">
          <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3">
            <img
              ngSrc="/assets/icons/offers-search-mobile.svg"
              width="16"
              height="16"
              alt=""
              class="h-4 w-4"
            />
            <input
              type="search"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              placeholder="Search"
              class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
            />
          </label>

          <button type="button" aria-label="Filter callback requests" class="shrink-0">
            <img
              ngSrc="/assets/icons/offers-filter-mobile.svg"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>
        </div>

        <div class="mt-6">
          @for (request of filteredCallbacks(); track request.id) {
            <button
              type="button"
              (click)="openDetails(request)"
              class="block w-full border-b border-[#EBEBEB] py-3 text-left"
            >
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-3">
                  <img
                    [ngSrc]="request.buyerAvatar"
                    width="36"
                    height="36"
                    [alt]="request.buyerName"
                    class="h-9 w-9 rounded-full object-cover"
                  />
                  <p class="text-[16px] font-medium leading-6 text-[rgba(13,13,13,0.8)]">
                    {{ request.buyerName }}
                  </p>
                </div>

                <span
                  class="flex h-10 w-[60px] items-center justify-center rounded-full border border-[#EAEAEA]"
                >
                  <img
                    ngSrc="/assets/icons/callbacks-call-mobile.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                  />
                </span>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center justify-between gap-4">
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Listing</span>
                  <span class="flex items-center gap-2">
                    <span
                      class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[4.2px] bg-[#EFEFEF]"
                    >
                      <img
                        [ngSrc]="request.listingImage"
                        width="28"
                        height="28"
                        [alt]="request.listingName"
                        class="h-7 w-7 object-cover"
                      />
                    </span>
                    <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                      {{ request.listingName }}
                    </span>
                  </span>
                </div>

                <div class="flex items-center justify-between gap-4">
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Phone number</span>
                  <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                    {{ request.phoneNumber }}
                  </span>
                </div>
              </div>
            </button>
          }
        </div>
      </div>

      @if (selectedRequest(); as request) {
        <div
          class="fixed inset-0 z-[110] bg-black/20"
          (click)="closeDetails()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed left-1/2 top-1/2 z-[120] hidden w-[420px] max-w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white px-8 pb-8 pt-8 shadow-[0_20px_60px_rgba(18,24,35,0.18)] md:block"
          aria-label="Request details"
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            (click)="closeDetails()"
            aria-label="Close request details"
            class="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <img
              ngSrc="/assets/icons/callbacks-request-close.svg"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>

          <h2 class="pr-16 text-[24px] font-semibold leading-8 text-[#1A1B1D]">Request details</h2>

          <div class="mt-6">
            <p class="text-[16px] leading-6 text-[rgba(13,13,13,0.5)]">Requested by:</p>

            <div class="mt-2 flex items-center gap-3">
              <img
                [ngSrc]="request.buyerAvatar"
                width="80"
                height="80"
                [alt]="request.buyerName"
                class="h-20 w-20 rounded-full object-cover"
              />
              <p class="text-[24px] font-medium leading-8 text-[#0D0D0D]">
                {{ request.buyerName }}
              </p>
            </div>
          </div>

          <a
            [href]="'tel:' + request.phoneNumber.replaceAll(' ', '')"
            [attr.aria-label]="'Call ' + request.buyerName"
            class="mt-5 inline-flex h-[52px] items-center gap-2 rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
          >
            <img
              ngSrc="/assets/icons/callbacks-request-call-white.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
            />
            <span>Call buyer</span>
          </a>

          <div class="mt-8 space-y-3">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Phone number</span>
              <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                {{ request.phoneNumber }}
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Listing</span>
              <span class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[4.2px] bg-[#EFEFEF]"
                >
                  <img
                    [ngSrc]="request.listingImage"
                    width="28"
                    height="28"
                    [alt]="request.listingName"
                    class="h-7 w-7 object-cover"
                  />
                </span>
                <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                  {{ request.listingName }}
                </span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Store</span>
              <span class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                  [class.bg-[#3D785F]]="request.storeName === 'The Vine Collections'"
                >
                  <img
                    [ngSrc]="request.storeImage"
                    width="28"
                    height="28"
                    [alt]="request.storeName"
                    class="h-7 w-7"
                    [class.object-contain]="request.storeUsesContain"
                    [class.object-cover]="!request.storeUsesContain"
                  />
                </span>
                <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                  {{ request.storeName }}
                </span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Date requested</span>
              <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                {{ request.dateRequested }}
              </span>
            </div>
          </div>
        </section>

        <section
          class="fixed inset-x-0 bottom-0 z-[120] rounded-t-[36px] bg-white px-4 pb-9 pt-[34px] md:hidden"
          aria-label="Request details"
          role="dialog"
          aria-modal="true"
        >
          <div
            class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB]"
          ></div>

          <button
            type="button"
            (click)="closeDetails()"
            aria-label="Close request details"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <img
              ngSrc="/assets/icons/callbacks-request-close.svg"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>

          <div class="mx-auto w-full max-w-[334px]">
            <h2 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Request details</h2>

            <div class="mt-6">
              <p class="text-[16px] leading-6 text-[rgba(13,13,13,0.5)]">Requested by:</p>

              <div class="mt-2 flex items-center gap-3">
                <img
                  [ngSrc]="request.buyerAvatar"
                  width="80"
                  height="80"
                  [alt]="request.buyerName"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <p class="text-[24px] font-medium leading-8 text-[#0D0D0D]">
                  {{ request.buyerName }}
                </p>
              </div>
            </div>

            <a
              [href]="'tel:' + request.phoneNumber.replaceAll(' ', '')"
              [attr.aria-label]="'Call ' + request.buyerName"
              class="mt-5 inline-flex h-[52px] items-center gap-2 rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              <img
                ngSrc="/assets/icons/callbacks-request-call-white.svg"
                width="20"
                height="20"
                alt=""
                class="h-5 w-5"
              />
              <span>Call buyer</span>
            </a>

            <div class="mt-8 space-y-3">
              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Phone number</span>
                <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                  {{ request.phoneNumber }}
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Listing</span>
                <span class="flex items-center gap-2">
                  <span
                    class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[4.2px] bg-[#EFEFEF]"
                  >
                    <img
                      [ngSrc]="request.listingImage"
                      width="28"
                      height="28"
                      [alt]="request.listingName"
                      class="h-7 w-7 object-cover"
                    />
                  </span>
                  <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                    {{ request.listingName }}
                  </span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Store</span>
                <span class="flex items-center gap-2">
                  <span
                    class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                    [class.bg-[#3D785F]]="request.storeName === 'The Vine Collections'"
                  >
                    <img
                      [ngSrc]="request.storeImage"
                      width="28"
                      height="28"
                      [alt]="request.storeName"
                      class="h-7 w-7"
                      [class.object-contain]="request.storeUsesContain"
                      [class.object-cover]="!request.storeUsesContain"
                    />
                  </span>
                  <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                    {{ request.storeName }}
                  </span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Date requested</span>
                <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                  {{ request.dateRequested }}
                </span>
              </div>
            </div>
          </div>
        </section>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbacksPageComponent implements OnDestroy {
  private readonly mobileOverlayService = inject(MobileOverlayService);

  readonly searchTerm = signal('');
  readonly selectedRequest = signal<CallbackRecord | null>(null);

  readonly callbacks = signal<readonly CallbackRecord[]>([
    {
      id: '1',
      buyerName: 'Halima Bala',
      buyerAvatar: '/assets/images/offers-buyer-halima.png',
      phoneNumber: '0816 939 7454',
      listingName: 'Iphone 17 pro max',
      listingImage: '/assets/images/offers-listing-iphone.png',
      storeName: 'The Vine Collections',
      storeImage: '/assets/icons/offers-store-vine.svg',
      storeUsesContain: true,
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '2',
      buyerName: 'Joseph Olamide',
      buyerAvatar: '/assets/images/offers-buyer-joseph.png',
      phoneNumber: '0816 939 7454',
      listingName: 'Logitech ergonomic mouse',
      listingImage: '/assets/images/offers-listing-mouse.png',
      storeName: 'Eden Organics',
      storeImage: '/assets/images/offers-store-eden.png',
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '3',
      buyerName: 'Kelechi Oduah',
      buyerAvatar: '/assets/images/offers-buyer-kelechi.png',
      phoneNumber: '0816 939 7454',
      listingName: 'Nike sneaker',
      listingImage: '/assets/images/offers-listing-sneaker.png',
      storeName: 'Amazing Fragrances',
      storeImage: '/assets/images/offers-store-amazing.png',
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '4',
      buyerName: 'Timipre Izuokumo',
      buyerAvatar: '/assets/images/offers-buyer-timipre.png',
      phoneNumber: '0816 939 7454',
      listingName: 'Bone straight wig',
      listingImage: '/assets/images/offers-listing-wig.png',
      storeName: 'Personal account',
      storeImage: '/assets/images/offers-store-personal.png',
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '5',
      buyerName: 'Amina Yusuf',
      buyerAvatar: '/assets/images/offers-buyer-halima.png',
      phoneNumber: '0816 939 7454',
      listingName: 'Iphone 17 pro max',
      listingImage: '/assets/images/offers-listing-iphone.png',
      storeName: 'The Vine Collections',
      storeImage: '/assets/icons/offers-store-vine.svg',
      storeUsesContain: true,
      dateRequested: '14 Feb, 2025',
    },
  ]);

  readonly filteredCallbacks = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.callbacks();
    }

    return this.callbacks().filter((request) =>
      [request.buyerName, request.listingName, request.storeName, request.phoneNumber].some(
        (value) => value.toLowerCase().includes(query),
      ),
    );
  });

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm.set(input?.value ?? '');
  }

  protected openDetails(request: CallbackRecord): void {
    if (!this.selectedRequest()) {
      this.mobileOverlayService.openMobileModal();
    }

    this.selectedRequest.set(request);
  }

  protected closeDetails(): void {
    if (this.selectedRequest()) {
      this.mobileOverlayService.closeMobileModal();
    }

    this.selectedRequest.set(null);
  }

  ngOnDestroy(): void {
    if (this.selectedRequest()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }
}
