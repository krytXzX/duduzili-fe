import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AddListingModalComponent } from '../../components/listings/add-listing-modal.component';
import { IdentityVerificationModalComponent } from '../../components/listings/identity-verification-modal.component';
import { VerificationDetailsModalComponent } from '../../components/listings/verification-details-modal.component';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import {
  ListingsApiItem,
  ListingsService,
  ManageListingsCategory,
  ManageListingsDeliveryOption,
  ManageListingsResponse,
  ManageListingsStore,
} from '../../services/listings.service';
import { environment } from '../../../environments/environment';
import { AuthSessionService } from '../../services/auth-session.service';

type ListingStatus = 'Available' | 'Sold' | 'Draft' | 'Paused' | 'Suspended';
type ListingFilter = 'All' | ListingStatus;
type ListingCategoryFilter = string;
type ListingStoreFilter = string;
type ListingStatusFilter = 'all' | ListingStatus;
type MobileFilterView = 'root' | 'store' | 'status';
type VerificationStatus = 'not_submitted' | 'pending' | 'under_review' | 'approved' | 'rejected';

type ListingRow = {
  id: string;
  name: string;
  categoryKey: string;
  category: string;
  priceWhole: string;
  priceFraction: string;
  storeKey: string;
  store: string;
  storeLogo: string;
  image: string;
  status: ListingStatus;
  promoted?: boolean;
};

type ListingStat = {
  key: ListingFilter;
  label: string;
  value: string;
};

type MobileStoreFilterOption = {
  readonly value: ListingStoreFilter;
  readonly label: string;
  readonly image: string;
};

type AddListingPickerOption = {
  readonly value: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly image?: string;
};

@Component({
  selector: 'app-listings-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
    CustomDropdownComponent,
    AddListingModalComponent,
    IdentityVerificationModalComponent,
    VerificationDetailsModalComponent,
  ],
  template: `
    <div class="min-h-full bg-white lg:-m-8 lg:min-h-[calc(100vh-8rem)] lg:rounded-[32px]">
      <section class="px-4 pb-8 pt-4 lg:px-0 lg:pb-0 lg:pt-0">
        <div class="hidden items-center justify-between border-b border-[#eeeeee] px-4 py-[14px] lg:flex">
          <h1 class="text-[24px] font-medium leading-normal text-[#0d0d0d]">Listings</h1>
          <button
            type="button"
            (click)="showAddListingModal.set(true)"
            class="inline-flex h-10 items-center gap-2 rounded-full border border-white bg-[#6453d9] px-5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5]"
          >
            <span class="text-lg leading-none">+</span>
            Sell item
          </button>
        </div>

        <div class="flex items-center justify-between pt-2 lg:hidden">
          <h1 class="text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1a1b1d]">Listings</h1>
          <button
            type="button"
            (click)="showAddListingModal.set(true)"
            class="inline-flex h-10 items-center gap-2 rounded-full border border-white bg-[#6453d9] px-4 text-base font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5]"
          >
            <span class="text-lg leading-none">+</span>
            Sell item
          </button>
        </div>

        @if (kycRequired()) {
          @if (showRejectedVerificationBanner()) {
            <div
              class="relative mt-6 min-h-[146px] overflow-hidden rounded-2xl border border-[#eeeefd] bg-[#fff5f5] px-[15px] py-4 shadow-[0_6px_12px_rgba(218,216,228,0.25)] [background-image:linear-gradient(171.22deg,rgba(255,161,161,0)_49.825%,rgba(255,161,161,0.2)_133.16%),linear-gradient(90deg,rgba(255,245,245,0.44)_0%,rgba(255,245,245,0.44)_100%)] lg:mx-4 lg:mt-7 lg:min-h-[122px] lg:border-[#f5e5e5] lg:px-[17px] lg:py-[18px]"
            >
              <div class="absolute left-[154px] top-[70px] h-[188px] w-[549px] rounded-full bg-[radial-gradient(circle,rgba(255,177,177,0.24)_0%,rgba(255,177,177,0.1)_35%,rgba(255,177,177,0)_72%)] lg:left-[234px]"></div>
              <div class="absolute right-[-18px] top-[35px] h-[123px] w-[193px] rounded-full bg-[radial-gradient(circle,rgba(255,208,208,0.22)_0%,rgba(255,208,208,0)_72%)]"></div>

              <div class="relative z-10 w-full lg:max-w-[355px]">
                <div class="flex max-w-[255px] flex-col items-start gap-3 lg:max-w-[355px]">
                  <div class="w-full">
                    <h2 class="text-[18px] font-medium leading-[24px] text-[#1f1f1f]">Verification failed</h2>
                    <p class="mt-0.5 text-[14px] font-normal leading-[20px] text-[#7b7979] lg:min-w-[495px] lg:max-w-[495px] lg:text-[#636363]">
                      Your documents are invalid. Kindly provide a valid documentation
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="openVerificationFlow()"
                    class="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium leading-[20px] text-black shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                  >
                    Verify my account
                    <img
                      src="/assets/icons/listings-verification-failed-arrow-right.svg"
                      alt=""
                      aria-hidden="true"
                      class="h-4 w-4"
                    />
                  </button>
                </div>
              </div>

              <div class="absolute right-[-6px] top-[53px] h-[80px] w-[80px] rotate-[21.22deg] lg:hidden">
                <img
                  src="/assets/images/listings-verification-failed-mobile-base.png"
                  alt=""
                  aria-hidden="true"
                  class="absolute inset-0 h-full w-full object-contain"
                />
                <img
                  src="/assets/images/listings-verification-failed-mobile-badge.png"
                  alt=""
                  aria-hidden="true"
                  class="absolute left-[3.5px] top-[18px] h-[35px] w-[36px]"
                />
              </div>

              <div class="absolute right-[34px] top-[4px] hidden h-[149px] w-[149px] rotate-[21.22deg] lg:block">
                <img
                  src="/assets/images/listings-verification-failed-desktop-base.png"
                  alt=""
                  aria-hidden="true"
                  class="absolute inset-0 h-[115px] w-[115px] object-contain"
                />
                <img
                  src="/assets/images/listings-verification-failed-desktop-badge.png"
                  alt=""
                  aria-hidden="true"
                  class="absolute left-[5px] top-[26px] h-[51px] w-[52px]"
                />
              </div>
            </div>
          } @else if (showApprovedVerificationBanner()) {
            <div
              class="relative mt-6 min-h-[146px] overflow-hidden rounded-2xl border border-[#e9f5e5] bg-[#fbfff8] px-[15px] py-4 shadow-[0_6px_12px_rgba(218,216,228,0.25)] [background-image:linear-gradient(174.53deg,rgba(177,255,161,0)_49.825%,rgba(168,255,161,0.2)_133.16%),linear-gradient(90deg,rgba(245,255,245,0.44)_0%,rgba(255,250,250,0.44)_100%)] lg:mx-4 lg:mt-7 lg:min-h-[122px] lg:px-[17px] lg:py-[18px]"
            >
              <div class="absolute left-[74px] top-[50px] h-[188px] w-[549px] rounded-full bg-[radial-gradient(circle,rgba(177,255,161,0.3)_0%,rgba(177,255,161,0.1)_35%,rgba(177,255,161,0)_72%)] lg:left-[234px] lg:top-[70px]"></div>
              <div class="absolute right-[-18px] top-[35px] h-[123px] w-[193px] rounded-full bg-[radial-gradient(circle,rgba(209,255,184,0.24)_0%,rgba(209,255,184,0)_72%)]"></div>

              <div class="relative z-10 w-full lg:max-w-[355px]">
                <div class="w-full max-w-[255px]">
                  <h2 class="inline-flex items-center gap-1 whitespace-nowrap text-[18px] font-medium leading-[24px] text-[#1f1f1f] lg:text-[20px]">
                    <span>You’re now a verified seller!</span>
                    <span aria-hidden="true">🎉</span>
                  </h2>
                  <p class="mt-0.5 max-w-[289px] text-[14px] font-normal leading-[20px] text-[#7b7979] lg:min-w-[495px] lg:max-w-[495px] lg:text-[16px] lg:text-[#636363]">
                    Your listings now show a verified badge.
                  </p>
                </div>
              </div>

              <img
                src="/assets/images/listings-verification-approved-mobile-illustration-clean.png"
                alt=""
                aria-hidden="true"
                class="absolute right-[-6px] top-[7px] h-[98px] w-[98px] rotate-[11.29deg] object-contain drop-shadow-[4.448px_4.448px_13.345px_rgba(55,55,55,0.25)] lg:hidden"
              />
              <img
                src="/assets/images/listings-verification-approved-desktop-illustration-clean.png"
                alt=""
                aria-hidden="true"
                class="absolute right-[10px] top-[-2px] hidden h-[169px] w-[169px] rotate-[11.29deg] object-contain drop-shadow-[4.448px_4.448px_13.345px_rgba(55,55,55,0.25)] lg:block"
              />

              <button
                type="button"
                (click)="dismissApprovedVerificationBanner()"
                class="absolute right-[5px] top-[5px] hidden h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_2.909px_5.818px_rgba(202,202,202,0.25)] lg:inline-flex"
                aria-label="Dismiss verified seller banner"
              >
                <img
                  ngSrc="/assets/icons/listings-verification-approved-close.svg"
                  width="18"
                  height="18"
                  alt=""
                  aria-hidden="true"
                  class="h-[18px] w-[18px]"
                />
              </button>
            </div>
          } @else if (isVerificationPendingReview()) {
            <div
              class="relative mt-6 min-h-[146px] overflow-hidden rounded-2xl border border-[#f5f5e5] bg-[#fffff5] px-[15px] py-4 shadow-[0_6px_12px_rgba(218,216,228,0.25)] [background-image:linear-gradient(171.22deg,rgba(252,255,161,0)_49.825%,rgba(252,255,161,0.2)_133.16%),linear-gradient(90deg,rgba(255,255,245,0.44)_0%,rgba(255,255,245,0.44)_100%)] lg:mx-4 lg:mt-7 lg:min-h-[122px] lg:px-[17px] lg:py-[18px]"
            >
              <div class="absolute left-[154px] top-[70px] h-[188px] w-[549px] rounded-full bg-[radial-gradient(circle,rgba(255,240,128,0.34)_0%,rgba(255,240,128,0.12)_35%,rgba(255,240,128,0)_72%)] lg:left-[234px]"></div>
              <div class="absolute right-[-18px] top-[35px] h-[123px] w-[193px] rounded-full bg-[radial-gradient(circle,rgba(183,234,109,0.24)_0%,rgba(183,234,109,0)_72%)]"></div>

              <div class="relative z-10 w-full lg:max-w-[355px]">
                <div class="flex max-w-[255px] flex-col items-start gap-3 lg:max-w-[355px]">
                  <div class="w-full">
                    <h2 class="text-[18px] font-medium leading-[24px] text-[#1f1f1f]">Verification under review</h2>
                    <p class="mt-0.5 text-[14px] font-normal leading-[20px] text-[#7b7979] lg:min-w-[495px] lg:max-w-[495px]">
                      Our team is reviewing your documents. You’ll be notified within 24–48 hours.
                    </p>
                  </div>

                  <button
                    type="button"
                    (click)="openVerificationFlow()"
                    class="inline-flex h-10 items-center justify-center rounded-full border border-[#eaeaea] bg-white px-5 text-[14px] font-medium leading-[20px] text-black shadow-[0_2px_6px_rgba(0,0,0,0.03)]"
                  >
                    View submission
                  </button>
                </div>
              </div>

              <img
                ngSrc="/assets/images/listings-verification-under-review-mobile-illustration.png"
                width="74"
                height="74"
                alt=""
                aria-hidden="true"
                class="absolute right-[12px] top-[67px] h-[74px] w-[74px] rotate-[8.21deg] object-contain drop-shadow-[5px_4px_8px_rgba(60,60,60,0.25)] lg:hidden"
              />
              <img
                ngSrc="/assets/images/listings-verification-under-review-desktop-illustration.png"
                width="116"
                height="116"
                alt=""
                aria-hidden="true"
                class="absolute right-[53px] top-[17px] hidden h-[116px] w-[116px] rotate-[8.21deg] object-contain drop-shadow-[5px_4px_8px_rgba(60,60,60,0.25)] lg:block"
              />
            </div>
          } @else {
            <div
              class="relative mt-6 overflow-hidden rounded-2xl border border-[#eeeefd] bg-[rgba(246,245,255,0.44)] px-[15px] py-4 shadow-[0_6px_12px_rgba(218,216,228,0.25)] lg:mx-4 lg:mt-7 lg:px-[17px] lg:py-[18px]"
            >
              <div class="absolute left-[154px] top-[70px] h-[188px] w-[690px] rounded-full bg-[radial-gradient(circle,rgba(133,121,255,0.12)_0%,rgba(133,121,255,0.04)_35%,rgba(133,121,255,0)_70%)]"></div>
              <div class="absolute right-[-12px] top-[38px] h-[126px] w-[126px] rounded-full bg-[radial-gradient(circle,rgba(180,171,255,0.22)_0%,rgba(180,171,255,0)_72%)] lg:right-[-18px] lg:top-[35px]"></div>

              <div class="relative z-10 flex items-center justify-between gap-3 lg:gap-6">
                <div class="min-w-0 lg:max-w-[355px]">
                  <h2 class="text-[18px] font-medium leading-6 text-[#1f1f1f]">Build trust. Get more buyers</h2>
                  <p class="mt-0.5 max-w-[240px] text-sm leading-7 text-[#7b7979] lg:max-w-none lg:leading-5">
                    Verified sellers rank higher and attract more inquiries.
                  </p>

                  <button
                    type="button"
                    (click)="openVerificationFlow()"
                    class="mt-3 inline-flex h-10 items-center gap-2 rounded-full border border-[#eaeaea] bg-white px-5 text-sm font-medium text-black shadow-[0_2px_6px_rgba(0,0,0,0.03)] lg:mt-4"
                  >
                    {{ isVerificationSubmitted() ? 'View submission' : 'Verify my account' }}
                    <span aria-hidden="true">→</span>
                  </button>
                </div>

                <img
                  [ngSrc]="verificationIllustration()"
                  width="152"
                  height="152"
                  alt=""
                  aria-hidden="true"
                  class="h-[116px] w-[116px] shrink-0 object-contain lg:h-[152px] lg:w-[152px]"
                />
              </div>
            </div>
          }
        }

        @if (hasListings()) {
        <div class="mt-6 lg:mx-4">
          <div class="no-scrollbar overflow-x-auto lg:overflow-visible">
            <div class="flex min-w-max gap-3 lg:grid lg:min-w-0 lg:grid-cols-6">
              @for (stat of stats(); track stat.key) {
                <button
                  type="button"
                  (click)="activeFilter.set(stat.key)"
                  class="relative h-[75px] w-[109px] overflow-hidden rounded-[10px] text-left lg:w-auto"
                  [class.bg-[rgba(100,83,217,0.05)]]="activeFilter() === stat.key"
                  [class.border-[1.5px]]="activeFilter() === stat.key"
                  [class.border-[#6453d9]]="activeFilter() === stat.key"
                  [class.bg-[#fafafa]]="activeFilter() !== stat.key"
                >
                  <span class="absolute left-[8.5px] top-[10px] text-xs text-[rgba(26,27,29,0.5)]">{{ stat.label }}</span>
                  <span class="absolute left-[8.5px] top-[34px] text-[20px] font-semibold text-[#1a1b1d]">{{ stat.value }}</span>
                </button>
              }
            </div>
          </div>
        </div>

        <div class="mt-5 flex items-center gap-3 lg:hidden">
          <label class="flex min-w-0 flex-1 items-center gap-2 rounded-full bg-[#fafafa] px-4 py-3">
            <img ngSrc="/assets/icons/listings-search-mobile.svg" alt="" width="16" height="16" class="h-4 w-4 opacity-70" aria-hidden="true" />
            <input
              type="search"
              placeholder="Search"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              class="min-w-0 flex-1 bg-transparent text-sm text-[#1a1b1d] outline-none placeholder:text-[#777]"
            />
          </label>

          <button
            type="button"
            (click)="openMobileFilterSheet()"
            class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f9f9f9] shadow-[0_0_0_1px_rgba(18,55,105,0.06)] transition-all duration-200 hover:bg-[#f1f1f4] active:scale-95"
            [attr.aria-label]="mobileFilterButtonLabel()"
          >
            <img ngSrc="/assets/icons/listings-filter-mobile.svg" alt="" width="18" height="18" class="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>

        @if (showMobileFilterSheet()) {
          <button
            type="button"
            class="fixed inset-0 z-[70] bg-black/35 lg:hidden"
            aria-label="Close listing filters"
            (click)="closeMobileFilterSheet()"
          ></button>

          <section
            class="fixed inset-x-0 bottom-0 z-[80] max-h-[calc(100svh-56px)] overflow-hidden rounded-t-[36px] bg-white shadow-[0_-28px_70px_-36px_rgba(20,20,20,0.55)] lg:hidden"
            role="dialog"
            aria-modal="true"
            [attr.aria-label]="mobileFilterTitle()"
          >
            <div class="mx-auto mt-[11px] h-1 w-[50px] rounded-full bg-[#ebebeb]"></div>

            <button
              type="button"
              class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[#1a1b1d] shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition-all hover:bg-[#f7f7f8] active:scale-95"
              aria-label="Close filters"
              (click)="closeMobileFilterSheet()"
            >
              <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            @if (mobileFilterView() !== 'root') {
              <button
                type="button"
                class="absolute left-4 top-[26px] inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#f4f4f4] text-[#1a1b1d] transition-all hover:bg-[#eeeeef] active:scale-95"
                aria-label="Back to filter categories"
                (click)="mobileFilterView.set('root')"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
            }

            <div class="flex max-h-[calc(100svh-80px)] flex-col px-4 pb-4 pt-14">
              @switch (mobileFilterView()) {
                @case ('root') {
                  <div class="flex min-h-[300px] flex-col">
                    <h2 class="text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#15162b]">Filter by</h2>

                    <div class="mt-4 space-y-6">
                      <div>
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded-lg bg-white py-3 text-left text-[14px] font-medium leading-5 text-[#1a1b1d] transition-colors hover:bg-[#fafafa]"
                          (click)="mobileFilterView.set('store')"
                        >
                          <span>{{ selectedStoreFilterLabel() }}</span>
                          <svg viewBox="0 0 24 24" class="h-5 w-5 text-[#1a1b1d]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 5l6 7-6 7" />
                          </svg>
                        </button>

                        @if (selectedStoreFilterChip(); as storeChip) {
                          <div class="mt-1 inline-flex h-11 max-w-full items-center gap-2 rounded-full bg-[#f9f9f9] py-1 pl-2 pr-4">
                            <img [ngSrc]="storeChip.image" [alt]="storeChip.label" width="24" height="24" class="h-6 w-6 rounded-full object-cover" />
                            <span class="truncate text-[14px] font-medium leading-6 text-[#1f1f1f]">{{ storeChip.label }}</span>
                            <button type="button" class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#1a1b1d] transition-colors hover:bg-[#eeeeef]" aria-label="Clear store filter" (click)="clearMobileStoreFilter()">
                              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                                <path d="M5 5l10 10M15 5 5 15" />
                              </svg>
                            </button>
                          </div>
                        }
                      </div>

                      <div>
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded-lg bg-white py-3 text-left text-[14px] font-medium leading-5 text-[#1a1b1d] transition-colors hover:bg-[#fafafa]"
                          (click)="mobileFilterView.set('status')"
                        >
                          <span>{{ selectedStatusFilterLabel() }}</span>
                          <svg viewBox="0 0 24 24" class="h-5 w-5 text-[#1a1b1d]" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 5l6 7-6 7" />
                          </svg>
                        </button>

                        @if (draftStatusFilter() !== 'all') {
                          <div class="mt-2 inline-flex h-11 items-center gap-2 rounded-full bg-[#f9f9f9] px-4 py-1">
                            <span class="text-[16px] leading-6 tracking-[-0.08px] text-[#1a1b1d]">{{ draftStatusFilter() }}</span>
                            <button type="button" class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[#1a1b1d] transition-colors hover:bg-[#eeeeef]" aria-label="Clear status filter" (click)="clearMobileStatusFilter()">
                              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                                <path d="M5 5l10 10M15 5 5 15" />
                              </svg>
                            </button>
                          </div>
                        }
                      </div>
                    </div>

                    <div class="mt-auto border-t border-transparent pt-8">
                      <button
                        type="button"
                        class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453d9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2a6ce8] transition-all hover:bg-[#5747ca] active:scale-[0.98]"
                        (click)="resetMobileFilters()"
                      >
                        Reset filters
                      </button>
                    </div>
                  </div>
                }

                @case ('store') {
                  <div class="flex min-h-[356px] flex-col">
                    <h2 class="text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#15162b]">Store</h2>

                    <div class="mt-4 max-h-[calc(100svh-250px)] overflow-y-auto pb-4">
                      @for (store of mobileStoreFilterOptions(); track store.value) {
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded-lg bg-white py-3 text-left transition-colors hover:bg-[#fafafa]"
                          (click)="draftStoreFilter.set(store.value)"
                        >
                          <span class="flex min-w-0 items-center gap-2">
                            <img [ngSrc]="store.image" [alt]="store.label" width="32" height="32" class="h-8 w-8 shrink-0 rounded-full object-cover" />
                            <span class="truncate text-[16px] font-medium leading-6 text-[#1f1f1f]">{{ store.label }}</span>
                          </span>
                          <span
                            class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded border"
                            [class.border-[#e1e1e1]]="draftStoreFilter() !== store.value"
                            [class.bg-[#6453d9]]="draftStoreFilter() === store.value"
                            [class.border-[#6453d9]]="draftStoreFilter() === store.value"
                            aria-hidden="true"
                          >
                            @if (draftStoreFilter() === store.value) {
                              <svg viewBox="0 0 20 20" class="h-4 w-4 text-white" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 10.5 8.5 14 15 6.5" />
                              </svg>
                            }
                          </span>
                        </button>
                      }
                    </div>

                    <div class="mt-auto pt-5">
                      <button
                        type="button"
                        class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453d9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2a6ce8] transition-all hover:bg-[#5747ca] active:scale-[0.98]"
                        (click)="applyMobileFilters()"
                      >
                        Apply filter
                      </button>
                    </div>
                  </div>
                }

                @case ('status') {
                  <div class="min-h-[300px]">
                    <h2 class="text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#15162b]">Status</h2>

                    <div class="mt-4 space-y-1">
                      @for (status of mobileStatusFilterOptions; track status.value) {
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded-lg bg-white py-3 text-left text-[14px] font-medium leading-5 text-[#1a1b1d] transition-colors hover:bg-[#fafafa]"
                          (click)="selectMobileStatusFilter(status.value)"
                        >
                          <span>{{ status.label }}</span>
                          @if (draftStatusFilter() === status.value) {
                            <span class="inline-flex h-5 w-5 items-center justify-center rounded bg-[#6453d9] text-white" aria-hidden="true">
                              <svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M5 10.5 8.5 14 15 6.5" />
                              </svg>
                            </span>
                          }
                        </button>
                      }
                    </div>
                  </div>
                }
              }
            </div>
          </section>
        }

        <div class="mt-5 hidden rounded-2xl border border-[#f0f0f0] bg-white lg:block">
          <div class="flex items-center justify-between px-[15px] py-[15px]">
            <div class="flex items-center gap-2">
              <app-custom-dropdown
                [options]="categoryFilterOptions()"
                [value]="categoryFilter()"
                [ariaLabel]="'Filter listings by category'"
                [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                [menuClass]="'min-w-[180px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="categoryFilter.set($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="storeFilterOptions()"
                [value]="storeFilter()"
                [ariaLabel]="'Filter listings by store'"
                [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                [menuClass]="'min-w-[180px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="storeFilter.set($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusFilterOptions"
                [value]="statusFilter()"
                [ariaLabel]="'Filter listings by status'"
                [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                [menuClass]="'min-w-[170px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="statusFilter.set($event)"
              ></app-custom-dropdown>
            </div>

            <label class="flex h-10 w-[224px] items-center gap-2 rounded-full bg-[#fafafa] px-3">
              <img ngSrc="/assets/icons/listings-search.svg" alt="" width="16" height="16" class="h-4 w-4 opacity-70" aria-hidden="true" />
              <input
                type="search"
                placeholder="Search"
                [value]="searchTerm()"
                (input)="updateSearch($event)"
                class="min-w-0 flex-1 bg-transparent text-sm text-[#1a1b1d] outline-none placeholder:text-[#777]"
              />
            </label>
          </div>

          <div class="border-t border-[#f4f4f4] bg-[#fafafa]">
            <div class="grid grid-cols-[1.7fr_1.15fr_1fr_1.5fr_1fr_56px] items-center px-[15px] py-[11px] text-xs font-medium text-[rgba(26,27,29,0.6)]">
              <!-- <span class="inline-block h-4 w-4 rounded border border-[#b8b8b8]"></span> -->
              <span>Name</span>
              <span>Category</span>
              <span>Price</span>
              <span>Store</span>
              <span>Status</span>
              <span></span>
            </div>
          </div>

          <div>
            @for (listing of filteredDesktopListings(); track listing.id) {
              <div class="grid grid-cols-[1.7fr_1.15fr_1fr_1.5fr_1fr_56px] items-center border-t border-[#f0f0f0] px-[15px] py-3 first:border-t-0">
                <!-- <span class="inline-block h-4 w-4 rounded border border-[#b8b8b8]"></span> -->

                <a [routerLink]="['/seller/listings', listing.id]" class="flex items-center gap-2 rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-[#efefef]">
                    <img [ngSrc]="listing.image" [alt]="listing.name" width="44" height="44" class="h-10 w-10 object-cover" />
                  </div>
                  <span class="text-sm font-medium text-[#1a1b1d]">{{ listing.name }}</span>
                </a>

                <a [routerLink]="['/seller/listings', listing.id]" class="text-sm text-[#1a1b1d] transition-colors hover:text-[#6453d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  {{ listing.category }}
                </a>

                <a [routerLink]="['/seller/listings', listing.id]" class="flex items-center text-sm font-medium text-[#1f1f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <img ngSrc="/assets/icons/listings-naira.svg" alt="" width="14" height="14" class="mr-0.5 h-[14px] w-[14px]" aria-hidden="true" />
                  {{ listing.priceWhole }}<span class="text-[rgba(31,31,31,0.5)]">{{ listing.priceFraction }}</span>
                </a>

                <a [routerLink]="['/seller/listings', listing.id]" class="flex items-center gap-2 rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#efefef]">
                    <img [ngSrc]="listing.storeLogo" [alt]="listing.store" width="32" height="32" class="h-8 w-8 object-cover" />
                  </div>
                  <span class="text-sm text-[#1a1b1d]">{{ listing.store }}</span>
                </a>

                <a [routerLink]="['/seller/listings', listing.id]" class="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]" [class]="desktopStatusClass(listing.status)">
                  <img [ngSrc]="statusIcon(listing.status)" alt="" width="14" height="14" class="h-[14px] w-[14px]" aria-hidden="true" />
                  {{ listing.status }}
                </a>

                <button type="button" class="ml-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]" [attr.aria-label]="'Promote ' + listing.name">
                  <span class="text-sm leading-none">🚀</span>
                </button>
              </div>
            }
          </div>
        </div>

        <div class="mt-4 space-y-0 lg:hidden">
          @for (listing of filteredMobileListings(); track listing.id) {
            <a [routerLink]="['/seller/listings', listing.id]" class="block border-b border-[#ebebeb] py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div class="flex h-11 w-11 items-center justify-center overflow-hidden rounded-[6.6px] bg-[#efefef]">
                    <img [ngSrc]="listing.image" [alt]="listing.name" width="44" height="44" class="h-11 w-11 object-cover" />
                  </div>
                  <div>
                    <h2 class="text-base font-medium leading-6 text-[rgba(13,13,13,0.8)]">{{ listing.name }}</h2>
                    @if (listing.promoted) {
                      <p class="mt-0.5 text-xs text-[#7f8081]"><span class="mr-1 text-[#1a1b1d]">🚀</span>Promoted</p>
                    }
                  </div>
                </div>

                <span class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold" [class]="mobileStatusClass(listing.status)">
                  <img [ngSrc]="statusIcon(listing.status)" alt="" width="14" height="14" class="h-[14px] w-[14px]" aria-hidden="true" />
                  {{ listing.status }}
                </span>
              </div>

              <div class="mt-4 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[rgba(26,27,29,0.5)]">Store</span>
                  <span class="text-sm font-medium text-[#1a1b1d]">{{ listing.store }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-sm text-[rgba(26,27,29,0.5)]">Amount</span>
                  <span class="flex items-center text-sm font-medium text-[#1f1f1f]">
                    <img ngSrc="/assets/icons/listings-naira.svg" alt="" width="14" height="14" class="mr-0.5 h-[14px] w-[14px]" aria-hidden="true" />
                    {{ mobileAmount(listing) }}
                  </span>
                </div>
              </div>
            </a>
          }
        </div>

        <div class="mt-6 hidden items-center justify-between px-4 pb-5 lg:flex">
          <p class="text-base font-medium text-[#1a1b1d]">{{ filteredDesktopListings().length }} <span class="text-[rgba(26,27,29,0.5)]">results</span></p>

          <div class="flex items-center gap-2 opacity-50">
            <button type="button" class="flex h-8 w-11 items-center justify-center rounded-lg border border-[#dfe1e7] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12)]" aria-label="Previous page">‹</button>
            <button type="button" class="flex h-8 w-11 items-center justify-center rounded-lg border border-[#dfe1e7] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12)]" aria-current="page">1</button>
            <button type="button" class="flex h-8 w-11 items-center justify-center rounded-lg border border-[#dfe1e7] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12)]" aria-label="Next page">›</button>
            <span class="text-base text-[#1c1f1d]">of 1</span>
          </div>
        </div>
        } @else {
        <div class="flex flex-col items-center pb-8 pt-[74px] text-center lg:px-6 lg:pb-12 lg:pt-10">
          @if (isLoading()) {
            <div class="text-[16px] font-medium text-[#6c6c6c]">Loading listings...</div>
          } @else if (errorMessage()) {
            <div class="max-w-[420px] text-[16px] leading-[1.4] text-[#D14343]">{{ errorMessage() }}</div>
          } @else {
          <div class="relative h-[142px] w-[168px] lg:h-[261px] lg:w-[309px]">
            <div class="absolute left-[1px] top-[9px] h-[133px] w-[168px] rounded-[11px] bg-[linear-gradient(181deg,rgba(255,255,255,0)_1.5%,#ffffff_90.4%)] lg:left-0 lg:top-[20px] lg:h-[242px] lg:w-[309px] lg:rounded-[18px]"></div>

            <div class="absolute left-0 top-[10px] h-[123px] w-[87px] rotate-[-17deg] rounded-[9px] border border-[#eaeaea] bg-white p-[1.5px] shadow-[0_10px_24px_rgba(202,202,202,0.18)] lg:left-[10px] lg:top-[19px] lg:h-[228px] lg:w-[152px] lg:rounded-[17px] lg:p-[2.8px] lg:shadow-[0_20px_44px_rgba(202,202,202,0.18)]">
              <div class="relative h-[85px] rounded-[8px] border border-[#eaeaea] bg-[#efefef] lg:h-[157px] lg:rounded-[14px]">
                <span class="absolute right-1.5 top-1 text-[7px] text-[#4f4f4f] lg:right-3 lg:top-2 lg:text-[13px]">♥</span>
              </div>
            </div>

            <div class="absolute right-0 top-[10px] h-[123px] w-[87px] rotate-[18deg] rounded-[9px] border border-[#eaeaea] bg-white p-[1.5px] shadow-[0_10px_24px_rgba(202,202,202,0.18)] lg:right-[8px] lg:top-[14px] lg:h-[228px] lg:w-[152px] lg:rounded-[17px] lg:p-[2.8px] lg:shadow-[0_20px_44px_rgba(202,202,202,0.18)]">
              <div class="relative h-[85px] rounded-[8px] border border-[#eaeaea] bg-[#efefef] lg:h-[157px] lg:rounded-[14px]">
                <span class="absolute right-1.5 top-1 text-[7px] text-[#4f4f4f] lg:right-3 lg:top-2 lg:text-[13px]">♥</span>
              </div>
            </div>

            <div class="absolute left-1/2 top-0 h-[124px] w-[87px] -translate-x-1/2 rounded-[9px] border border-[#eaeaea] bg-white p-[1.5px] shadow-[0_10px_24px_rgba(202,202,202,0.22)] lg:top-[7px] lg:h-[228px] lg:w-[152px] lg:rounded-[17px] lg:p-[2.8px] lg:shadow-[0_20px_44px_rgba(202,202,202,0.22)]">
              <div class="relative h-[85px] rounded-[8px] border border-[#eaeaea] bg-[#efefef] lg:h-[157px] lg:rounded-[14px]">
                <span class="absolute right-1.5 top-1 text-[7px] text-[#4f4f4f] lg:right-3 lg:top-2 lg:text-[13px]">♥</span>
                <div class="absolute inset-0 flex items-center justify-center text-[#b7b7b7]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-[27px] w-[27px] fill-current lg:h-[48px] lg:w-[48px]">
                    <path d="M19 5h-3.2l-1-1.35A2 2 0 0 0 13.2 3h-2.4a2 2 0 0 0-1.6.65L8.2 5H5a2 2 0 0 0-2 2v8.5A2.5 2.5 0 0 0 5.5 18h13a2.5 2.5 0 0 0 2.5-2.5V7a2 2 0 0 0-2-2Zm-7 9a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7Z" />
                  </svg>
                </div>
                <button
                  type="button"
                  class="absolute left-[6px] top-1/2 flex h-[9px] w-[9px] -translate-y-1/2 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[5px] text-[#777] lg:left-3 lg:h-[18px] lg:w-[18px] lg:text-[10px]"
                  aria-label="Previous preview"
                >
                  ‹
                </button>
                <button
                  type="button"
                  class="absolute right-[6px] top-1/2 flex h-[9px] w-[9px] -translate-y-1/2 items-center justify-center rounded-full border border-[#eaeaea] bg-white text-[5px] text-[#777] lg:right-3 lg:h-[18px] lg:w-[18px] lg:text-[10px]"
                  aria-label="Next preview"
                >
                  ›
                </button>
              </div>

              <div class="space-y-[3px] px-[3px] pt-[5px] lg:space-y-2 lg:px-[6px] lg:pt-[10px]">
                <div class="flex items-center justify-between gap-2 lg:gap-3">
                  <div class="h-[8px] w-[46px] rounded-full bg-[#d9d9d9] lg:h-[13px] lg:w-[81px]"></div>
                  <div class="h-[8px] w-[14px] rounded-full bg-[#f0f0f0] lg:h-[13px] lg:w-[24px]"></div>
                </div>
                <div class="h-[6px] w-[36px] rounded-full bg-[#d9d9d9] lg:h-[11px] lg:w-[64px]"></div>
                <div class="flex items-center gap-[3px] lg:gap-1.5">
                  <img ngSrc="/assets/icons/home-location.svg" alt="" width="5" height="5" class="h-[5px] w-[5px] opacity-50 lg:h-2 lg:w-2" aria-hidden="true" />
                  <div class="h-[5px] w-[24px] rounded-full bg-[#d9d9d9] lg:h-[8px] lg:w-[42px]"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-8 max-w-[350px] lg:max-w-[520px]">
            <h2 class="text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[#1a1b1d] lg:text-[40px] lg:tracking-[-0.04em]">Looks a little empty here 👀</h2>
            <p class="mt-2 text-[16px] leading-[1.2] text-[#6c6c6c] lg:mt-3">
              Add a listing so buyers can see what you’re offering and reach out.
            </p>
          </div>

          <button
            type="button"
            (click)="showAddListingModal.set(true)"
            class="mt-8 inline-flex h-[52px] items-center gap-2 rounded-full border border-white bg-[#6453d9] px-8 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] lg:mt-6 lg:h-12 lg:px-7 lg:text-[14px]"
          >
            <span class="text-[20px] leading-none lg:text-[18px]">+</span>
            Sell an item
          </button>
          }
        </div>
        }
      </section>

      @if (showAddListingModal()) {
        <app-add-listing-modal
          [categoryOptionsInput]="addListingCategoryOptions()"
          [storeOptionsInput]="addListingStoreOptions()"
          [deliveryOptionsInput]="addListingDeliveryOptions()"
          (listingPublished)="handleListingPublished()"
          (draftSaved)="handleDraftSaved()"
          (close)="showAddListingModal.set(false)"
        />
      }

      @if (showIdentityModal()) {
        <app-identity-verification-modal (close)="showIdentityModal.set(false)" />
      }

      @if (showVerificationDetailsModal()) {
        <app-verification-details-modal (close)="showVerificationDetailsModal.set(false)" />
      }
    </div>
  `,
  styles: `
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }

    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingsPageComponent {
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly listingsService = inject(ListingsService);
  private readonly authSession = inject(AuthSessionService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  protected readonly kycRequired = computed(() => this.authSession.kycRequired());

  protected readonly showAddListingModal = signal(false);
  protected readonly showIdentityModal = signal(false);
  protected readonly showVerificationDetailsModal = signal(false);
  protected readonly approvedVerificationBannerDismissed = signal(false);
  protected readonly isVerificationSubmitted = signal(false);
  protected readonly verificationStatus = signal<VerificationStatus>('not_submitted');
  protected readonly isLoading = signal(true);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly searchTerm = signal('');
  protected readonly activeFilter = signal<ListingFilter>('All');
  protected readonly categoryFilter = signal<ListingCategoryFilter>('all');
  protected readonly storeFilter = signal<ListingStoreFilter>('all');
  protected readonly statusFilter = signal<ListingStatusFilter>('all');
  protected readonly showMobileFilterSheet = signal(false);
  protected readonly mobileFilterView = signal<MobileFilterView>('root');
  protected readonly draftStoreFilter = signal<ListingStoreFilter>('all');
  protected readonly draftStatusFilter = signal<ListingStatusFilter>('all');
  private readonly manageListingCategories = signal<readonly ManageListingsCategory[]>([]);
  private readonly manageListingStores = signal<readonly ManageListingsStore[]>([]);
  private readonly manageListingDeliveryOptions = signal<readonly ManageListingsDeliveryOption[]>([]);

  protected readonly verificationIllustrationDesktop = '/assets/images/listings-verify-illustration-desktop-v2.png';
  protected readonly verificationIllustrationMobile = '/assets/images/listings-verify-illustration-mobile-v2.png';

  protected readonly hasListings = computed(() => this.listings().length > 0);
  protected readonly isVerificationPendingReview = computed(() => {
    const status = this.verificationStatus();
    return status === 'pending' || status === 'under_review';
  });
  protected readonly showApprovedVerificationBanner = computed(
    () => this.verificationStatus() === 'approved' && !this.approvedVerificationBannerDismissed(),
  );
  protected readonly showRejectedVerificationBanner = computed(
    () => this.verificationStatus() === 'rejected',
  );

  protected readonly stats = computed<ListingStat[]>(() => {
    const listings = this.listings();
    const countFor = (status: ListingStatus) => listings.filter((listing) => listing.status === status).length;

    return [
      { key: 'All', label: 'All', value: String(listings.length).padStart(2, '0') },
      { key: 'Available', label: 'Available', value: String(countFor('Available')).padStart(2, '0') },
      { key: 'Sold', label: 'Sold', value: String(countFor('Sold')).padStart(2, '0') },
      { key: 'Paused', label: 'Paused', value: String(countFor('Paused')).padStart(2, '0') },
      { key: 'Suspended', label: 'Suspended', value: String(countFor('Suspended')).padStart(2, '0') },
      { key: 'Draft', label: 'Draft', value: String(countFor('Draft')).padStart(2, '0') },
    ];
  });

  private readonly listings = signal<ListingRow[]>([]);

  protected readonly filteredDesktopListings = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.activeFilter();
    const categoryFilter = this.categoryFilter();
    const storeFilter = this.storeFilter();
    const statusFilter = this.statusFilter();

    return this.listings().filter((listing) => {
      const matchesFilter = filter === 'All' ? true : listing.status === filter;
      const matchesCategory = categoryFilter === 'all' || listing.categoryKey === categoryFilter;
      const matchesStore = storeFilter === 'all' || listing.storeKey === storeFilter;
      const matchesStatus = statusFilter === 'all' || listing.status === statusFilter;
      const haystack = `${listing.name} ${listing.category} ${listing.store}`.toLowerCase();
      const matchesSearch = term.length === 0 ? true : haystack.includes(term);
      return matchesFilter && matchesCategory && matchesStore && matchesStatus && matchesSearch;
    });
  });

  protected readonly categoryFilterOptions = computed<
    readonly CustomDropdownOption<ListingCategoryFilter>[]
  >(() => {
    const options = new Map<string, string>();

    for (const listing of this.listings()) {
      options.set(listing.categoryKey, listing.category);
    }

    return [
      { value: 'all', label: 'All categories' },
      ...Array.from(options.entries()).map(([value, label]) => ({ value, label })),
    ];
  });

  protected readonly storeFilterOptions = computed<
    readonly CustomDropdownOption<ListingStoreFilter>[]
  >(() => {
    const options = new Map<string, string>();

    for (const listing of this.listings()) {
      options.set(listing.storeKey, listing.store);
    }

    return [
      { value: 'all', label: 'All stores' },
      ...Array.from(options.entries()).map(([value, label]) => ({ value, label })),
    ];
  });

  protected readonly statusFilterOptions: readonly CustomDropdownOption<ListingStatusFilter>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'Available', label: 'Available' },
    { value: 'Sold', label: 'Sold' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  protected readonly mobileStatusFilterOptions: readonly CustomDropdownOption<ListingStatus>[] = [
    { value: 'Available', label: 'Available' },
    { value: 'Sold', label: 'Sold' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Suspended', label: 'Suspended' },
  ];

  protected readonly mobileStoreFilterOptions = computed<readonly MobileStoreFilterOption[]>(() => {
    const options = new Map<string, MobileStoreFilterOption>();

    for (const listing of this.listings()) {
      if (listing.storeKey === 'all') {
        continue;
      }

      options.set(listing.storeKey, {
        value: listing.storeKey,
        label: listing.store,
        image: listing.storeLogo,
      });
    }

    return Array.from(options.values());
  });

  protected readonly selectedStoreFilterChip = computed(() => {
    const selected = this.draftStoreFilter();
    if (selected === 'all') {
      return null;
    }

    return this.mobileStoreFilterOptions().find((store) => store.value === selected) ?? null;
  });

  protected readonly selectedStoreFilterLabel = computed(() => {
    const selectedStoreCount = this.draftStoreFilter() === 'all' ? 0 : 1;
    return selectedStoreCount > 0 ? 'Store' : `Store (${this.mobileStoreFilterOptions().length})`;
  });

  protected readonly selectedStatusFilterLabel = computed(() => {
    const selectedStatusCount = this.draftStatusFilter() === 'all' ? 0 : 1;
    return selectedStatusCount > 0 ? 'Status' : 'Status (1)';
  });

  protected readonly mobileFilterTitle = computed(() => {
    switch (this.mobileFilterView()) {
      case 'store':
        return 'Filter by store';
      case 'status':
        return 'Filter by listing status';
      default:
        return 'Filter listings';
    }
  });

  protected readonly mobileFilterButtonLabel = computed(() => {
    const activeFilters = Number(this.storeFilter() !== 'all') + Number(this.statusFilter() !== 'all');
    return activeFilters > 0 ? `Filter listings, ${activeFilters} active` : 'Filter listings';
  });

  protected readonly filteredMobileListings = computed(() => this.filteredDesktopListings().slice(0, 5));
  protected readonly addListingCategoryOptions = computed<readonly AddListingPickerOption[]>(() =>
    this.manageListingCategories().map((category) => ({
      value: String(category.id),
      label: category.name,
    })),
  );
  protected readonly addListingStoreOptions = computed<readonly AddListingPickerOption[]>(() =>
    this.manageListingStores().map((store, index) => ({
      value: this.readString(store['id']) ?? this.readString(store['store_id']) ?? `store-${index + 1}`,
      label:
        this.readString(store['store_name']) ??
        this.readString(store['name']) ??
        this.readString(store['vendor_name']) ??
        `Store ${index + 1}`,
      image:
        this.resolveMediaUrl(
          this.readString(store['profile_photo']) ??
            this.readString(store['logo']) ??
            this.readString(store['avatar']) ??
            this.readNestedString(store['user'], 'avatar'),
        ) ?? '/assets/images/dashboard-avatar-mobile.png',
    })),
  );
  protected readonly addListingDeliveryOptions = computed<readonly AddListingPickerOption[]>(() =>
    this.manageListingDeliveryOptions().map((option) => ({
      value: String(option.id),
      label: option.name,
    })),
  );

  constructor() {
    effect(() => {
      if (!this.mobileOverlayService.shouldOpenAddListing()) {
        return;
      }

      this.showAddListingModal.set(true);
      this.mobileOverlayService.consumeOpenAddListingRequest();
    });

    void this.loadListings();
  }

  protected verificationIllustration(): string {
    return this.verificationIllustrationMobile;
  }

  protected openVerificationFlow(): void {
    if (this.isVerificationSubmitted()) {
      this.showVerificationDetailsModal.set(true);
      return;
    }

    this.showIdentityModal.set(true);
  }

  protected dismissApprovedVerificationBanner(): void {
    this.approvedVerificationBannerDismissed.set(true);
  }

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  protected openMobileFilterSheet(): void {
    this.draftStoreFilter.set(this.storeFilter());
    this.draftStatusFilter.set(this.statusFilter());
    this.mobileFilterView.set('root');
    this.showMobileFilterSheet.set(true);
  }

  protected closeMobileFilterSheet(): void {
    this.showMobileFilterSheet.set(false);
    this.mobileFilterView.set('root');
  }

  protected applyMobileFilters(): void {
    this.storeFilter.set(this.draftStoreFilter());
    this.statusFilter.set(this.draftStatusFilter());
    this.closeMobileFilterSheet();
  }

  protected resetMobileFilters(): void {
    this.draftStoreFilter.set('all');
    this.draftStatusFilter.set('all');
    this.storeFilter.set('all');
    this.statusFilter.set('all');
    this.mobileFilterView.set('root');
  }

  protected clearMobileStoreFilter(): void {
    this.draftStoreFilter.set('all');
    this.storeFilter.set('all');
  }

  protected clearMobileStatusFilter(): void {
    this.draftStatusFilter.set('all');
    this.statusFilter.set('all');
  }

  protected selectMobileStatusFilter(status: ListingStatus): void {
    this.draftStatusFilter.set(status);
    this.statusFilter.set(status);
    this.mobileFilterView.set('root');
  }

  protected statusIcon(status: ListingStatus): string {
    switch (status) {
      case 'Available':
        return '/assets/icons/listings-status-available.svg';
      case 'Sold':
        return '/assets/icons/listings-status-sold.svg';
      case 'Draft':
        return '/assets/icons/listings-status-draft.svg';
      case 'Paused':
        return '/assets/icons/listings-status-paused.svg';
      case 'Suspended':
        return '/assets/icons/listings-status-suspended.svg';
    }
  }

  protected desktopStatusClass(status: ListingStatus): string {
    switch (status) {
      case 'Available':
        return 'bg-[#f9f9f9] text-[#ee9c2e]';
      case 'Sold':
        return 'bg-[#f3fbf9] text-[#25ad32]';
      case 'Draft':
        return 'bg-[#f4f4f4] text-[#5a5a5a]';
      case 'Paused':
        return 'bg-[#edf5ff] text-[#4787fe]';
      case 'Suspended':
        return 'bg-[#fdf6fa] text-[#ff2524]';
    }
  }

  protected mobileStatusClass(status: ListingStatus): string {
    return this.desktopStatusClass(status);
  }

  protected mobileAmount(listing: ListingRow): string {
    return `${listing.priceWhole}${listing.priceFraction}`;
  }

  protected handleDraftSaved(): void {
    this.showAddListingModal.set(false);
    void this.loadListings();
  }

  protected handleListingPublished(): void {
    void this.loadListings();
  }

  private async loadListings(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.listingsService.getManageListings());
      const items = this.extractListings(response);
      const mappedListings = items
        .map((item, index) => this.toListingRow(item, index))
        .filter((item): item is ListingRow => item !== null);

      this.applyVerificationState(response);
      this.manageListingCategories.set(this.extractCategories(response));
      this.manageListingStores.set(this.extractStores(response));
      this.manageListingDeliveryOptions.set(this.extractDeliveryOptions(response));
      this.listings.set(mappedListings);
    } catch {
      this.errorMessage.set('Your listings aren’t available right now. Please try again shortly.');
      this.approvedVerificationBannerDismissed.set(false);
      this.verificationStatus.set('not_submitted');
      this.isVerificationSubmitted.set(false);
      this.manageListingCategories.set([]);
      this.manageListingStores.set([]);
      this.manageListingDeliveryOptions.set([]);
      this.listings.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractListings(response: ManageListingsResponse): ListingsApiItem[] {
    if (!response || typeof response !== 'object') {
      return [];
    }

    return Array.isArray(response.all) ? response.all : [];
  }

  private extractCategories(response: ManageListingsResponse): readonly ManageListingsCategory[] {
    return Array.isArray(response.categories) ? response.categories : [];
  }

  private extractStores(response: ManageListingsResponse): readonly ManageListingsStore[] {
    return Array.isArray(response.stores) ? response.stores : [];
  }

  private extractDeliveryOptions(response: ManageListingsResponse): readonly ManageListingsDeliveryOption[] {
    return Array.isArray(response.delivery_options) ? response.delivery_options : [];
  }

  private applyVerificationState(response: ManageListingsResponse): void {
    const verification = this.readRecord(response.identity_verification);
    const status = this.normalizeVerificationStatus(this.readString(verification?.['status']));
    this.approvedVerificationBannerDismissed.set(false);
    this.verificationStatus.set(status);
    this.isVerificationSubmitted.set(status !== 'not_submitted');
  }

  private toListingRow(item: ListingsApiItem, index: number): ListingRow | null {
    const name =
      this.readString(item['title']) ??
      this.readString(item['name']) ??
      this.readString(item['listing_name']);
    const category = this.readString(item['category']) ?? 'Uncategorized';
    const price = this.readNumber(item['price']);
    const store = this.readString(item['store_name']) ?? this.readString(item['vendor_name']) ?? 'My store';

    if (!name || price === null) {
      return null;
    }

    const [priceWhole, priceFraction] = this.formatPriceParts(price);
    const storeKey = this.slugify(store || `store-${index + 1}`);

    return {
      id: this.readString(item['id']) ?? `listing-${index + 1}`,
      name,
      categoryKey: this.slugify(category),
      category,
      priceWhole,
      priceFraction,
      storeKey,
      store,
      storeLogo:
        this.resolveMediaUrl(this.readString(item['store_logo'])) ??
        this.resolveMediaUrl(this.readString(item['profile_photo'])) ??
        this.resolveMediaUrl(this.readString(item['store_profile_photo'])) ??
        '/assets/images/dashboard-avatar-mobile.png',
      image:
        this.resolveMediaUrl(this.readString(item['thumbnail'])) ??
        this.resolveMediaUrl(this.readString(item['image'])) ??
        '/assets/images/store-none-cover-desktop.png',
      status: this.normalizeStatus(item['status']),
      promoted: this.readBoolean(item['is_promoted']) ?? false,
    };
  }

  private normalizeStatus(value: unknown): ListingStatus {
    const status = this.readString(value)?.toLowerCase() ?? 'available';

    switch (status) {
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      case 'suspended':
        return 'Suspended';
      case 'published':
      case 'available':
      default:
        return 'Available';
    }
  }

  private formatPriceParts(price: number): [string, string] {
    const [whole = '0', fraction = '00'] = price.toFixed(2).split('.');
    return [new Intl.NumberFormat('en-NG').format(Number(whole)) + '.', fraction];
  }

  private resolveMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'unknown';
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
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

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private readNestedString(container: unknown, key: string): string | null {
    if (!container || typeof container !== 'object') {
      return null;
    }

    return this.readString((container as Record<string, unknown>)[key]);
  }

  private normalizeVerificationStatus(value: string | null): VerificationStatus {
    switch (value?.toLowerCase()) {
      case 'pending':
        return 'pending';
      case 'under_review':
        return 'under_review';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'not_submitted';
    }
  }
}
