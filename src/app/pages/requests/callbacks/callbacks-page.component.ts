import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroChevronRight } from '@ng-icons/heroicons/outline';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';
import {
  CustomDropdownComponent,
  type CustomDropdownOption,
} from '../../../components/ui/custom-dropdown.component';
import {
  SellerRequestsService,
  type SellerCallbackRecord,
  type SellerCallbacksResponse,
} from '../../../services/seller-requests.service';

type CallbackStoreFilter = 'all' | string;
type CallbackDateFilter = 'newest' | 'oldest';

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
  readonly dateRequestedAt: number | null;
}

@Component({
  selector: 'app-callbacks-page',
  imports: [NgIcon, NgOptimizedImage, RouterLink, CustomDropdownComponent],
  providers: [provideIcons({ heroChevronLeft, heroChevronRight })],
  template: `
    <div class="flex h-full min-h-0 flex-col bg-white md:bg-[#FFFEFD]">
      <div class="hidden h-full min-h-0 md:flex md:flex-col">
        <div class="mx-auto flex h-full min-h-0 w-full max-w-[1076px] flex-col">
          <div class="flex min-h-0 flex-1 flex-col pb-3">
            <section
              class="mb-6 flex h-16 items-center rounded-t-[32px] border-b border-[#EEEEEE] bg-white px-4"
              aria-label="Call back requests breadcrumb"
            >
              <h1 class="text-[24px] font-medium leading-normal text-[#0D0D0D]">
                <span class="text-[rgba(13,13,13,0.3)]">Requests &gt; </span>
                <span>Call back requests</span>
              </h1>
            </section>

            <section
              class="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white shadow-[0_1px_0_rgba(0,0,0,0.01)]"
            >
              <div class="flex items-center justify-between gap-6 px-[15px] pb-[15px] pt-[15px]">
                <div class="flex items-start gap-2">
                  <app-custom-dropdown
                    [options]="storeFilterOptions()"
                    [value]="selectedStoreFilter()"
                    ariaLabel="Filter callback requests by store"
                    [buttonClass]="dropdownButtonClass"
                    [labelClass]="dropdownLabelClass"
                    [iconClass]="dropdownIconClass"
                    [menuClass]="dropdownMenuClass"
                    [optionClass]="dropdownOptionClass"
                    [activeOptionClass]="dropdownActiveOptionClass"
                    (valueChange)="updateStoreFilter($event)"
                  />

                  <app-custom-dropdown
                    [options]="dateFilterOptions"
                    [value]="selectedDateFilter()"
                    ariaLabel="Sort callback requests by date requested"
                    [buttonClass]="dropdownButtonClass"
                    [labelClass]="dropdownLabelClass"
                    [iconClass]="dropdownIconClass"
                    [menuClass]="dropdownMenuClass"
                    [optionClass]="dropdownOptionClass"
                    [activeOptionClass]="dropdownActiveOptionClass"
                    (valueChange)="updateDateFilter($event)"
                  />
                </div>

                <label
                  class="flex h-10 w-full max-w-[224px] items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
                >
                  <span class="sr-only">Search callback requests</span>
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
                    aria-label="Search callback requests"
                    class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                  />
                </label>
              </div>

              <div class="min-h-0 flex-1 overflow-auto border-t border-[#F0F0F0]">
                <div class="min-w-[944px]">
                  <div
                    class="grid grid-cols-[180px_150px_208px_205px_124px_77px] items-center bg-[#FAFAFA] px-[23px] py-[11px]"
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
                    <span aria-hidden="true"></span>
                  </div>

                  @if (isLoading()) {
                    @for (row of [1, 2, 3, 4, 5, 6]; track row) {
                      <div
                        class="grid grid-cols-[180px_150px_208px_205px_124px_77px] items-center border-b border-[#F0F0F0] px-6"
                      >
                        <div class="flex min-h-[74px] items-center gap-2">
                          <div class="h-8 w-8 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                          <div class="h-4 w-24 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>

                        <div class="flex min-h-[74px] items-center">
                          <div class="h-4 w-24 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>

                        <div class="flex min-h-[74px] items-center gap-2">
                          <div class="h-10 w-10 animate-pulse rounded-[6px] bg-[#EEF2FF]"></div>
                          <div class="h-4 w-32 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>

                        <div class="flex min-h-[74px] items-center gap-2">
                          <div class="h-8 w-8 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                          <div class="h-4 w-28 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>

                        <div class="flex min-h-[74px] items-center">
                          <div class="h-4 w-20 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>

                        <div class="flex min-h-[74px] items-center justify-end">
                          <div class="h-10 w-[52px] animate-pulse rounded-full bg-[#EEF2FF]"></div>
                        </div>
                      </div>
                    }
                  } @else {
                    @for (request of filteredCallbacks(); track request.id) {
                      <button
                        type="button"
                        (click)="openDetails(request)"
                        class="grid w-full grid-cols-[180px_150px_208px_205px_124px_77px] items-center border-b border-[#F0F0F0] px-6 text-left transition hover:bg-[#FFFCF7]"
                        [class.border-b-0]="$last"
                      >
                      <div class="flex min-h-[74px] items-center gap-2">
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

                      <div class="flex min-h-[74px] items-center">
                        <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                          {{ request.phoneNumber }}
                        </span>
                      </div>

                      <div class="flex min-h-[74px] items-center gap-2">
                        <span
                          class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-[6px] border border-[#F0F0F0] bg-[#EFEFEF]"
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

                      <div class="flex min-h-[74px] items-center gap-2">
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

                      <div class="flex min-h-[74px] items-center">
                        <span class="text-[14px] leading-normal text-[#1A1B1D]">
                          {{ request.dateRequested }}
                        </span>
                      </div>

                      <div class="flex min-h-[74px] items-center justify-end">
                        <span
                          class="flex h-10 w-[52px] items-center justify-center rounded-full border border-[#EAEAEA] bg-white"
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
                  }
                </div>
              </div>
            </section>

            <div class="flex items-center justify-between">
              <p class="text-[16px] font-medium leading-normal text-[#1A1B1D]">
                {{ visibleResultsCount() }}
                <span class="text-[rgba(26,27,29,0.5)]">results</span>
              </p>

              <div class="flex items-center gap-2 opacity-50">
                <div class="flex items-end gap-[5px]">
                  <button
                    type="button"
                    (click)="goToPreviousPage()"
                    [disabled]="!hasPreviousPage()"
                    aria-label="Previous page"
                    class="flex h-8 w-[38px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ng-icon name="heroChevronLeft" class="text-[16px] text-[#1A1B1D]"></ng-icon>
                  </button>
                  <button
                    type="button"
                    aria-current="page"
                    class="flex h-8 w-[33px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                  >
                    <span class="text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ currentPage() }}</span>
                  </button>
                  <button
                    type="button"
                    (click)="goToNextPage()"
                    [disabled]="!hasNextPage()"
                    aria-label="Next page"
                    class="flex h-8 w-[38px] items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ng-icon name="heroChevronRight" class="text-[16px] text-[#1A1B1D]"></ng-icon>
                  </button>
                </div>

                <span class="text-[16px] leading-normal text-[#1C1F1D]">of {{ totalPages() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mx-auto w-full max-w-[390px] md:hidden">
        <div class="flex h-[54px] items-center px-5">
          <div class="flex items-center gap-2">
            <a
            routerLink="/seller/requests"
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

            <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Call back requests</h1>
          </div>
        </div>

        <div class="bg-white px-5 pb-10 pt-5">
          <div class="flex items-center gap-3">
            <label
              class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
            >
              <span class="sr-only">Search callback requests</span>
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
                aria-label="Search callback requests"
                class="w-full bg-transparent text-[14px] leading-5 text-[#1A1B1D] outline-none placeholder:text-[#777777]"
              />
            </label>

            <button
              type="button"
              aria-label="Filter callback requests"
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
            @if (isLoading()) {
              @for (item of [1, 2, 3, 4]; track item) {
                <div class="border-b border-[#EBEBEB] py-3">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-3">
                      <div class="h-9 w-9 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                      <div class="h-5 w-28 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                    </div>

                    <div class="h-10 w-[54px] animate-pulse rounded-full bg-[#EEF2FF]"></div>
                  </div>

                  <div class="mt-4 space-y-3">
                    <div class="flex items-center justify-between gap-4">
                      <div class="h-4 w-12 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                      <div class="flex items-center gap-2">
                        <div class="h-7 w-7 animate-pulse rounded-[4.2px] bg-[#EEF2FF]"></div>
                        <div class="h-4 w-28 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                      </div>
                    </div>

                    <div class="flex items-center justify-between gap-4">
                      <div class="h-4 w-24 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                      <div class="h-4 w-24 animate-pulse rounded-full bg-[#EEF2FF]"></div>
                    </div>
                  </div>
                </div>
              }
            } @else {
              @for (request of filteredCallbacks(); track request.id) {
                <button
                  type="button"
                  (click)="openDetails(request)"
                  class="block w-full border-b border-[#EBEBEB] py-3 text-left"
                >
                  <div class="flex items-center justify-between">
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
                      class="flex h-10 w-[54px] items-center justify-center rounded-full border border-[#EAEAEA] bg-white"
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
                      <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]"
                        >Phone number</span
                      >
                      <span class="text-[14px] font-medium leading-5 text-[#1F1F1F]">
                        {{ request.phoneNumber }}
                      </span>
                    </div>
                  </div>
                </button>
              }
            }
          </div>
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
  private readonly sellerRequestsService = inject(SellerRequestsService);

  readonly searchTerm = signal('');
  readonly selectedRequest = signal<CallbackRecord | null>(null);
  readonly selectedStoreFilter = signal<CallbackStoreFilter>('all');
  readonly selectedDateFilter = signal<CallbackDateFilter>('newest');
  readonly currentPage = signal(1);
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly dropdownButtonClass =
    'flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] px-3 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]';
  readonly dropdownLabelClass = 'text-[14px] font-medium leading-5 text-[#36394A]';
  readonly dropdownIconClass = 'text-[#36394A]';
  readonly dropdownMenuClass = 'min-w-[220px]';
  readonly dropdownOptionClass =
    'flex w-full items-center rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F7F7FA]';
  readonly dropdownActiveOptionClass = 'bg-[#F7F7FA] text-[#1A1B1D]';
  readonly dateFilterOptions: readonly CustomDropdownOption<CallbackDateFilter>[] = [
    { value: 'newest', label: 'Date requested: Newest first' },
    { value: 'oldest', label: 'Date requested: Oldest first' },
  ] as const;

  readonly callbacks = signal<readonly CallbackRecord[]>([]);
  readonly isLoading = signal(false);

  readonly filteredCallbacks = computed(() => {
    const query = this.searchTerm().trim().toLowerCase();
    const storeFilter = this.selectedStoreFilter();
    const matches = this.callbacks().filter((request) => {
      const matchesQuery =
        !query ||
        [request.buyerName, request.listingName, request.storeName, request.phoneNumber].some(
          (value) => value.toLowerCase().includes(query),
        );
      const matchesStore = storeFilter === 'all' || request.storeName === storeFilter;
      return matchesQuery && matchesStore;
    });

    return [...matches].sort((left, right) => {
      const leftTime = left.dateRequestedAt ?? 0;
      const rightTime = right.dateRequestedAt ?? 0;
      return this.selectedDateFilter() === 'oldest' ? leftTime - rightTime : rightTime - leftTime;
    });
  });
  readonly visibleResultsCount = computed(() => this.filteredCallbacks().length);
  readonly storeFilterOptions = computed<readonly CustomDropdownOption<CallbackStoreFilter>[]>(
    () => {
      const names = Array.from(
        new Set(
          this.callbacks()
            .map((request) => request.storeName.trim())
            .filter((storeName) => storeName.length > 0),
        ),
      ).sort((left, right) => left.localeCompare(right));

      return [
        { value: 'all', label: 'Store: All' },
        ...names.map((storeName) => ({
          value: storeName,
          label: `Store: ${storeName}`,
        })),
      ];
    },
  );
  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalResults() / this.sellerRequestsService.getPageSize())),
  );

  constructor() {
    void this.loadCallbacks();
  }

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm.set(input?.value ?? '');
  }

  protected updateStoreFilter(value: CallbackStoreFilter): void {
    this.selectedStoreFilter.set(value);
  }

  protected updateDateFilter(value: CallbackDateFilter): void {
    this.selectedDateFilter.set(value);
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

  private async loadCallbacks(): Promise<void> {
    await this.loadCallbacksPage(this.currentPage());
  }

  protected goToPreviousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }

    void this.loadCallbacksPage(this.currentPage() - 1);
  }

  protected goToNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }

    void this.loadCallbacksPage(this.currentPage() + 1);
  }

  private async loadCallbacksPage(page: number): Promise<void> {
    this.isLoading.set(true);

    try {
      const response = await firstValueFrom(this.sellerRequestsService.getReceivedCallbacks(page));
      const items = this.extractCallbackRecords(response);
      this.callbacks.set(items.map((record, index) => this.mapCallbackRecord(record, index)));
      this.applyPagination(response, page, items.length);
    } catch {
      this.callbacks.set([]);
      this.totalResults.set(0);
      this.currentPage.set(1);
      this.hasNextPage.set(false);
      this.hasPreviousPage.set(false);
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractCallbackRecords(response: SellerCallbacksResponse): SellerCallbackRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.callbacks)) {
      return response.callbacks;
    }

    return [];
  }

  private applyPagination(response: SellerCallbacksResponse, page: number, itemCount: number): void {
    if (Array.isArray(response)) {
      this.totalResults.set(itemCount);
      this.currentPage.set(1);
      this.hasNextPage.set(false);
      this.hasPreviousPage.set(false);
      return;
    }

    const count = this.readNumber(response.count) ?? itemCount;
    this.totalResults.set(count);
    this.currentPage.set(page);
    this.hasNextPage.set(typeof response.next === 'string' && response.next.trim().length > 0);
    this.hasPreviousPage.set(
      typeof response.previous === 'string' && response.previous.trim().length > 0,
    );
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private mapCallbackRecord(record: SellerCallbackRecord, index: number): CallbackRecord {
    const buyer = this.readRecord(record['buyer']);

    return {
      id: this.readId(record['id']) ?? `callback-${index + 1}`,
      buyerName:
        this.readString(record['buyer_name']) ??
        this.readString(buyer?.['full_name']) ??
        this.readString(buyer?.['username']) ??
        `Buyer ${index + 1}`,
      buyerAvatar: '/assets/images/offers-buyer-halima.png',
      phoneNumber: this.readString(record['phone_number']) ?? '---',
      listingName:
        this.readString(record['product_name']) ??
        this.readString(record['listing_title']) ??
        `Listing ${index + 1}`,
      listingImage: '/assets/images/offers-listing-iphone.png',
      storeName: this.readString(record['store_name']) ?? 'Store',
      storeImage: '/assets/icons/offers-store-vine.svg',
      storeUsesContain: true,
      dateRequested: this.formatDate(this.readString(record['date_requested'])) ?? '---',
      dateRequestedAt: this.readTimestamp(record['date_requested']),
    };
  }

  private readTimestamp(value: unknown): number | null {
    const raw = this.readString(value);
    if (!raw) {
      return null;
    }

    const parsed = new Date(raw).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }

  private formatDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsed);
  }

  private readId(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return null;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
  }

  ngOnDestroy(): void {
    if (this.selectedRequest()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }
}
