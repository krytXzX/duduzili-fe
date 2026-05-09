import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

interface OfferRecord {
  readonly id: string;
  readonly buyerName: string;
  readonly buyerAvatar: string;
  readonly listingName: string;
  readonly listingImage: string;
  readonly storeName: string;
  readonly storeImage: string;
  readonly storeUsesContain?: boolean;
  readonly offerAmount: number;
  readonly dateRequested: string;
}

@Component({
  selector: 'app-offers-page',
  imports: [NgOptimizedImage, RouterLink],
  template: `
    <div class="flex h-full min-h-0 flex-col bg-white md:bg-[#FFFEFD]">
      <div class="hidden h-full min-h-0 md:flex md:flex-col">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-[1076px] flex-col">
          <div class="flex min-h-0 flex-1 flex-col pb-3">
            <section
              class="mb-6 flex h-16 items-center rounded-t-[32px] border-b border-[#EEEEEE] bg-white px-4"
              aria-label="Offers breadcrumb"
            >
              <h1 class="text-[24px] font-medium leading-normal text-[#0D0D0D]">
                <span class="text-[rgba(13,13,13,0.3)]">Requests &gt; </span>
                <span>Offers</span>
              </h1>
            </section>

            <section
              class="overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white shadow-[0_1px_0_rgba(0,0,0,0.01)]"
            >
              <div class="flex items-center justify-between gap-6 px-[15px] pb-[15px] pt-[15px]">
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
                  class="flex h-10 w-full max-w-[224px] items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
                >
                  <span class="sr-only">Search offers</span>
                  <img
                    ngSrc="/assets/icons/offers-search-desktop-figma.svg"
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
                    aria-label="Search offers"
                    class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                  />
                </label>
              </div>

              <div class="max-h-[520px] overflow-auto border-t border-[#F0F0F0]">
                <div class="min-w-[996px]">
                  <div
                    class="grid grid-cols-[180px_150px_260px_205px_124px_77px] items-center bg-[#FAFAFA] px-[23px] py-[11px]"
                  >
                    <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                      Buyer
                    </span>
                    <span class="text-[12px] font-medium leading-normal text-[rgba(26,27,29,0.6)]">
                      Offer amount
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
                    <span aria-hidden="true"></span>
                  </div>

                  @for (offer of filteredOffers(); track offer.id) {
                    <button
                      type="button"
                      (click)="openDetails(offer)"
                      class="grid w-full grid-cols-[180px_150px_260px_205px_124px_77px] items-center border-b border-[#F0F0F0] px-6 text-left transition hover:bg-[#FFFCF7]"
                      [class.border-b-0]="$last"
                    >
                    <div class="flex min-h-[74px] items-center gap-2">
                      <img
                        [ngSrc]="offer.buyerAvatar"
                        width="32"
                        height="32"
                        [alt]="offer.buyerName"
                        class="h-8 w-8 rounded-full object-cover"
                      />
                      <span class="text-[14px] font-medium leading-normal text-[#0D0D0D]">
                        {{ offer.buyerName }}
                      </span>
                    </div>

                    <div class="flex min-h-[74px] items-center">
                      <span
                        class="flex items-center text-[14px] font-medium leading-5 text-[#1F1F1F]"
                      >
                        <img
                          ngSrc="/assets/icons/offers-naira-figma.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="mr-[1px] h-[14px] w-[14px]"
                        />
                        {{ amountWhole(offer.offerAmount)
                        }}<span class="text-[rgba(31,31,31,0.5)]">{{ amountFraction() }}</span>
                      </span>
                    </div>

                    <div class="flex min-h-[74px] items-center gap-2">
                      <span
                        class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[6px] border border-[#F0F0F0] bg-[#EFEFEF]"
                      >
                        <img
                          [ngSrc]="offer.listingImage"
                          width="40"
                          height="40"
                          [alt]="offer.listingName"
                          class="h-10 w-10 object-cover"
                        />
                      </span>
                      <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                        {{ offer.listingName }}
                      </span>
                    </div>

                    <div class="flex min-h-[74px] items-center gap-2">
                      <span
                        class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full"
                        [class.bg-[#3D785F]]="offer.storeName === 'The Vine Collections'"
                      >
                        <img
                          [ngSrc]="offer.storeImage"
                          width="32"
                          height="32"
                          [alt]="offer.storeName"
                          class="h-8 w-8"
                          [class.object-contain]="offer.storeUsesContain"
                          [class.object-cover]="!offer.storeUsesContain"
                        />
                      </span>
                      <span class="text-[14px] leading-normal text-[#1A1B1D]">
                        {{ offer.storeName }}
                      </span>
                    </div>

                    <div class="flex min-h-[74px] items-center">
                      <span class="text-[14px] leading-normal text-[#1A1B1D]">
                        {{ offer.dateRequested }}
                      </span>
                    </div>

                    <div class="flex min-h-[74px] items-center justify-end">
                      <span
                        class="flex h-10 w-[52px] items-center justify-center rounded-full border border-[#EAEAEA] bg-white"
                      >
                        <img
                          ngSrc="/assets/icons/offers-message-figma.svg"
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
              </div>
            </section>

            <div class="flex items-center justify-between">
              <p class="text-[16px] font-medium leading-normal text-[#1A1B1D]">
                {{ filteredOffers().length }} <span class="text-[rgba(26,27,29,0.5)]">results</span>
              </p>

              <div class="flex items-center gap-2 opacity-50">
                <div class="flex items-end gap-[5px]">
                  <button
                    type="button"
                    aria-label="Previous page"
                    class="flex h-8 w-[38px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
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
                    aria-current="page"
                    class="flex h-8 w-[33px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <span class="text-[14px] font-medium leading-5 text-[#1A1B1D]">1</span>
                  </button>
                  <button
                    type="button"
                    aria-label="Next page"
                    class="flex h-8 w-[38px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
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

      <div class="mx-auto w-full max-w-[390px] md:hidden">
        <div class="flex h-[54px] items-center px-5">
          <div class="flex items-center gap-2">
            <a
              routerLink="/requests"
              aria-label="Back to Requests"
              class="flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]"
            >
              <img
                ngSrc="/assets/icons/offers-back-mobile-figma.svg"
                width="20"
                height="20"
                alt=""
                class="h-5 w-5"
              />
            </a>
            <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Offers</h1>
          </div>
        </div>

        <div class="bg-white px-5 pb-10 pt-5">
          <div class="flex items-center gap-3">
            <label
              class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
            >
              <span class="sr-only">Search offers</span>
              <img
                ngSrc="/assets/icons/offers-search-mobile-figma.svg"
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
                aria-label="Search offers"
                class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
              />
            </label>

            <button
              type="button"
              aria-label="Filter offers"
              class="flex h-6 w-6 items-center justify-center shrink-0"
            >
              <img
                ngSrc="/assets/icons/offers-filter-mobile-figma.svg"
                width="22"
                height="18"
                alt=""
                class="h-[18px] w-[22px]"
              />
            </button>
          </div>

          <div class="mt-6">
            @for (offer of filteredOffers(); track offer.id) {
              <button
                type="button"
                (click)="openDetails(offer)"
                class="block w-full border-b border-[#EBEBEB] py-3 text-left"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <img
                      [ngSrc]="offer.buyerAvatar"
                      width="36"
                      height="36"
                      [alt]="offer.buyerName"
                      class="h-9 w-9 rounded-full object-cover"
                    />
                    <p class="text-[16px] font-medium leading-6 text-[rgba(13,13,13,0.8)]">
                      {{ offer.buyerName }}
                    </p>
                  </div>

                  <span
                    class="flex h-10 w-[54px] items-center justify-center rounded-full border border-[#EAEAEA] bg-white"
                  >
                    <img
                      ngSrc="/assets/icons/offers-message-figma.svg"
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
                          [ngSrc]="offer.listingImage"
                          width="28"
                          height="28"
                          [alt]="offer.listingName"
                          class="h-7 w-7 object-cover"
                        />
                      </span>
                      <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                        {{ offer.listingName }}
                      </span>
                    </span>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                    <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]"
                      >Offer amount</span
                    >
                    <span
                      class="flex items-center text-[14px] font-medium leading-5 text-[#1F1F1F]"
                    >
                      <img
                        ngSrc="/assets/icons/offers-naira-figma.svg"
                        width="14"
                        height="14"
                        alt=""
                        class="mr-[1px] h-[14px] w-[14px]"
                      />
                      {{ amountWhole(offer.offerAmount)
                      }}<span class="text-[rgba(31,31,31,0.5)]">{{ amountFraction() }}</span>
                    </span>
                  </div>
                </div>
              </button>
            }
          </div>
        </div>
      </div>

      @if (selectedOffer(); as offer) {
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
              ngSrc="/assets/icons/offers-request-close.svg"
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
                [ngSrc]="offer.buyerAvatar"
                width="80"
                height="80"
                [alt]="offer.buyerName"
                class="h-20 w-20 rounded-full object-cover"
              />
              <p class="text-[24px] font-medium leading-8 text-[#0D0D0D]">{{ offer.buyerName }}</p>
            </div>
          </div>

          <a
            routerLink="/seller/messages"
            (click)="closeDetails()"
            class="mt-5 inline-flex h-[52px] items-center gap-2 rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
          >
            <img
              ngSrc="/assets/icons/offers-request-message-white.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
            />
            <span>Message buyer</span>
          </a>

          <div class="mt-8 space-y-3">
            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Offer amount</span>
              <span class="flex items-center text-[14px] font-medium leading-5 text-[#1F1F1F]">
                <img
                  ngSrc="/assets/icons/offers-naira-figma.svg"
                  width="14"
                  height="14"
                  alt=""
                  class="mr-[1px] h-[14px] w-[14px]"
                />
                {{ amountWhole(offer.offerAmount)
                }}<span class="text-[rgba(31,31,31,0.5)]">{{ amountFraction() }}</span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Listing</span>
              <span class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[4.2px] bg-[#EFEFEF]"
                >
                  <img
                    [ngSrc]="offer.listingImage"
                    width="28"
                    height="28"
                    [alt]="offer.listingName"
                    class="h-7 w-7 object-cover"
                  />
                </span>
                <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                  {{ offer.listingName }}
                </span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Store</span>
              <span class="flex items-center gap-2">
                <span
                  class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                  [class.bg-[#3D785F]]="offer.storeName === 'The Vine Collections'"
                >
                  <img
                    [ngSrc]="offer.storeImage"
                    width="28"
                    height="28"
                    [alt]="offer.storeName"
                    class="h-7 w-7"
                    [class.object-contain]="offer.storeUsesContain"
                    [class.object-cover]="!offer.storeUsesContain"
                  />
                </span>
                <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                  {{ offer.storeName }}
                </span>
              </span>
            </div>

            <div class="flex items-center justify-between gap-4">
              <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Date requested</span>
              <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                {{ offer.dateRequested }}
              </span>
            </div>
          </div>
        </section>

        <section
          class="fixed inset-x-0 bottom-0 z-[120] rounded-t-[36px] bg-white px-4 pt-[34px] md:hidden"
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
              ngSrc="/assets/icons/offers-request-close.svg"
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
                  [ngSrc]="offer.buyerAvatar"
                  width="80"
                  height="80"
                  [alt]="offer.buyerName"
                  class="h-20 w-20 rounded-full object-cover"
                />
                <p class="text-[24px] font-medium leading-8 text-[#0D0D0D]">
                  {{ offer.buyerName }}
                </p>
              </div>
            </div>

            <a
              routerLink="/seller/messages"
              (click)="closeDetails()"
              class="mt-5 inline-flex h-[52px] items-center gap-2 rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              <img
                ngSrc="/assets/icons/offers-request-message-white.svg"
                width="20"
                height="20"
                alt=""
                class="h-5 w-5"
              />
              <span>Message buyer</span>
            </a>

            <div class="mt-8 space-y-3">
              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Offer amount</span>
                <span class="flex items-center text-[14px] font-medium leading-5 text-[#1F1F1F]">
                  <img
                    ngSrc="/assets/icons/offers-naira-figma.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="mr-[1px] h-[14px] w-[14px]"
                  />
                  {{ amountWhole(offer.offerAmount)
                  }}<span class="text-[rgba(31,31,31,0.5)]">{{ amountFraction() }}</span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Listing</span>
                <span class="flex items-center gap-2">
                  <span
                    class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-[4.2px] bg-[#EFEFEF]"
                  >
                    <img
                      [ngSrc]="offer.listingImage"
                      width="28"
                      height="28"
                      [alt]="offer.listingName"
                      class="h-7 w-7 object-cover"
                    />
                  </span>
                  <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                    {{ offer.listingName }}
                  </span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Store</span>
                <span class="flex items-center gap-2">
                  <span
                    class="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full"
                    [class.bg-[#3D785F]]="offer.storeName === 'The Vine Collections'"
                  >
                    <img
                      [ngSrc]="offer.storeImage"
                      width="28"
                      height="28"
                      [alt]="offer.storeName"
                      class="h-7 w-7"
                      [class.object-contain]="offer.storeUsesContain"
                      [class.object-cover]="!offer.storeUsesContain"
                    />
                  </span>
                  <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">
                    {{ offer.storeName }}
                  </span>
                </span>
              </div>

              <div class="flex items-center justify-between gap-4">
                <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Date requested</span>
                <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                  {{ offer.dateRequested }}
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
export class OffersPageComponent implements OnDestroy {
  private readonly mobileOverlayService = inject(MobileOverlayService);

  readonly searchTerm = signal('');
  readonly selectedOffer = signal<OfferRecord | null>(null);

  readonly offers = signal<readonly OfferRecord[]>([
    {
      id: '1',
      buyerName: 'Halima Bala',
      buyerAvatar: '/assets/images/offers-buyer-halima.png',
      listingName: 'Iphone 17 pro max',
      listingImage: '/assets/images/offers-listing-iphone.png',
      storeName: 'The Vine Collections',
      storeImage: '/assets/icons/offers-store-vine.svg',
      storeUsesContain: true,
      offerAmount: 2500000,
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '2',
      buyerName: 'Joseph Olamide',
      buyerAvatar: '/assets/images/offers-buyer-joseph.png',
      listingName: 'Logitech ergonomic mouse',
      listingImage: '/assets/images/offers-listing-mouse.png',
      storeName: 'Eden Organics',
      storeImage: '/assets/images/offers-store-eden.png',
      offerAmount: 2500000,
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '3',
      buyerName: 'Kelechi Oduah',
      buyerAvatar: '/assets/images/offers-buyer-kelechi.png',
      listingName: 'Nike sneaker',
      listingImage: '/assets/images/offers-listing-sneaker.png',
      storeName: 'Amazing Fragrances',
      storeImage: '/assets/images/offers-store-amazing.png',
      offerAmount: 2500000,
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '4',
      buyerName: 'Timipre Izuokumo',
      buyerAvatar: '/assets/images/offers-buyer-timipre.png',
      listingName: 'Bone straight wig',
      listingImage: '/assets/images/offers-listing-wig.png',
      storeName: 'Personal account',
      storeImage: '/assets/images/offers-store-personal.png',
      offerAmount: 2500000,
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '5',
      buyerName: 'Amina Yusuf',
      buyerAvatar: '/assets/images/offers-buyer-halima.png',
      listingName: 'Iphone 17 pro max',
      listingImage: '/assets/images/offers-listing-iphone.png',
      storeName: 'The Vine Collections',
      storeImage: '/assets/icons/offers-store-vine.svg',
      storeUsesContain: true,
      offerAmount: 2500000,
      dateRequested: '14 Feb, 2025',
    },
  ]);

  readonly filteredOffers = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();

    if (!query) {
      return this.offers();
    }

    return this.offers().filter((offer) =>
      [offer.buyerName, offer.listingName, offer.storeName].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  });

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm.set(input?.value ?? '');
  }

  protected openDetails(offer: OfferRecord): void {
    if (!this.selectedOffer()) {
      this.mobileOverlayService.openMobileModal();
    }

    this.selectedOffer.set(offer);
  }

  protected closeDetails(): void {
    if (this.selectedOffer()) {
      this.mobileOverlayService.closeMobileModal();
    }

    this.selectedOffer.set(null);
  }

  protected amountWhole(amount: number): string {
    return amount.toLocaleString('en-NG') + '.';
  }

  protected amountFraction(): string {
    return '00';
  }

  ngOnDestroy(): void {
    if (this.selectedOffer()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }
}
