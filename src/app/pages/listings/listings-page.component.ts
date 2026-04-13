import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AddListingModalComponent } from '../../components/listings/add-listing-modal.component';
import { IdentityVerificationModalComponent } from '../../components/listings/identity-verification-modal.component';
import { VerificationDetailsModalComponent } from '../../components/listings/verification-details-modal.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

type ListingStatus = 'Available' | 'Sold' | 'Draft' | 'Paused' | 'Suspended';
type ListingFilter = 'All' | ListingStatus;

type ListingRow = {
  id: string;
  name: string;
  category: string;
  priceWhole: string;
  priceFraction: string;
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

@Component({
  selector: 'app-listings-page',
  imports: [
    NgOptimizedImage,
    RouterLink,
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

        <div
          class="relative mt-6 overflow-hidden rounded-2xl border border-[#eeeefd] bg-[rgba(246,245,255,0.44)] px-[15px] py-4 shadow-[0_6px_12px_rgba(218,216,228,0.25)] lg:mx-4 lg:mt-7 lg:px-[17px] lg:py-[18px]"
        >
          <div class="absolute left-[154px] top-[70px] h-[188px] w-[690px] rounded-full bg-[radial-gradient(circle,rgba(133,121,255,0.12)_0%,rgba(133,121,255,0.04)_35%,rgba(133,121,255,0)_70%)]"></div>
          <div class="absolute right-[-12px] top-[38px] h-[126px] w-[126px] rounded-full bg-[radial-gradient(circle,rgba(180,171,255,0.22)_0%,rgba(180,171,255,0)_70%)] lg:right-[-18px] lg:top-[35px]"></div>

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

        @if (hasListings()) {
        <div class="mt-6 lg:mx-4">
          <div class="no-scrollbar overflow-x-auto lg:overflow-visible">
            <div class="flex min-w-max gap-3 lg:grid lg:min-w-0 lg:grid-cols-6">
              @for (stat of stats; track stat.key) {
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

          <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full" aria-label="Filter listings">
            <img ngSrc="/assets/icons/listings-filter-mobile.svg" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-5 hidden rounded-2xl border border-[#f0f0f0] bg-white lg:block">
          <div class="flex items-center justify-between px-[15px] py-[15px]">
            <div class="flex items-center gap-2">
              <button type="button" class="inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]">
                Category
                <img ngSrc="/assets/icons/home-chevron-down.svg" alt="" width="16" height="16" class="h-4 w-4 opacity-70" aria-hidden="true" />
              </button>
              <button type="button" class="inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]">
                Store
                <img ngSrc="/assets/icons/home-chevron-down.svg" alt="" width="16" height="16" class="h-4 w-4 opacity-70" aria-hidden="true" />
              </button>
              <button type="button" class="inline-flex h-8 items-center gap-2 rounded-full border border-[#ebebeb] px-3 text-sm text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]">
                Status
                <img ngSrc="/assets/icons/home-chevron-down.svg" alt="" width="16" height="16" class="h-4 w-4 opacity-70" aria-hidden="true" />
              </button>
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
            <div class="grid grid-cols-[40px_1.7fr_1.15fr_1fr_1.5fr_1fr_56px] items-center px-[15px] py-[11px] text-xs font-medium text-[rgba(26,27,29,0.6)]">
              <span class="inline-block h-4 w-4 rounded border border-[#b8b8b8]"></span>
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
              <div class="grid grid-cols-[40px_1.7fr_1.15fr_1fr_1.5fr_1fr_56px] items-center border-t border-[#f0f0f0] px-[15px] py-3 first:border-t-0">
                <span class="inline-block h-4 w-4 rounded border border-[#b8b8b8]"></span>

                <a [routerLink]="['/listings', listing.id]" class="flex items-center gap-2 rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <div class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-md bg-[#efefef]">
                    <img [ngSrc]="listing.image" [alt]="listing.name" width="44" height="44" class="h-10 w-10 object-cover" />
                  </div>
                  <span class="text-sm font-medium text-[#1a1b1d]">{{ listing.name }}</span>
                </a>

                <a [routerLink]="['/listings', listing.id]" class="text-sm text-[#1a1b1d] transition-colors hover:text-[#6453d9] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  {{ listing.category }}
                </a>

                <a [routerLink]="['/listings', listing.id]" class="flex items-center text-sm font-medium text-[#1f1f1f] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <img ngSrc="/assets/icons/listings-naira.svg" alt="" width="14" height="14" class="mr-0.5 h-[14px] w-[14px]" aria-hidden="true" />
                  {{ listing.priceWhole }}<span class="text-[rgba(31,31,31,0.5)]">{{ listing.priceFraction }}</span>
                </a>

                <a [routerLink]="['/listings', listing.id]" class="flex items-center gap-2 rounded-[10px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
                  <div class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#efefef]">
                    <img [ngSrc]="listing.storeLogo" [alt]="listing.store" width="32" height="32" class="h-8 w-8 object-cover" />
                  </div>
                  <span class="text-sm text-[#1a1b1d]">{{ listing.store }}</span>
                </a>

                <a [routerLink]="['/listings', listing.id]" class="inline-flex w-fit items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]" [class]="desktopStatusClass(listing.status)">
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
            <a [routerLink]="['/listings', listing.id]" class="block border-b border-[#ebebeb] py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]">
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
        </div>
        }
      </section>

      @if (showAddListingModal()) {
        <app-add-listing-modal (close)="showAddListingModal.set(false)" />
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

  protected readonly showAddListingModal = signal(false);
  protected readonly showIdentityModal = signal(false);
  protected readonly showVerificationDetailsModal = signal(false);
  protected readonly isVerificationSubmitted = signal(false);
  protected readonly searchTerm = signal('');
  protected readonly activeFilter = signal<ListingFilter>('All');

  protected readonly verificationIllustrationDesktop = '/assets/images/listings-verify-illustration-desktop-v2.png';
  protected readonly verificationIllustrationMobile = '/assets/images/listings-verify-illustration-mobile-v2.png';

  protected readonly hasListings = computed(() => this.listings().length > 0);

  protected readonly stats: ListingStat[] = [
    { key: 'All', label: 'All', value: '65' },
    { key: 'Available', label: 'Available', value: '09' },
    { key: 'Sold', label: 'Sold', value: '09' },
    { key: 'Paused', label: 'Paused', value: '09' },
    { key: 'Suspended', label: 'Suspended', value: '03' },
    { key: 'Draft', label: 'Draft', value: '03' },
  ];

  private readonly listings = signal<ListingRow[]>([
    {
      id: 'iphone-17',
      name: 'Iphone 17 pro max',
      category: 'Phones & Laptops',
      priceWhole: '2,500,000.',
      priceFraction: '00',
      store: 'The Vine Collections',
      storeLogo: '/assets/images/store-vine-logo-desktop.png',
      image: '/assets/images/listings-item-iphone.png',
      status: 'Available',
      promoted: true,
    },
    {
      id: 'mouse',
      name: 'Logitech ergonomic mouse',
      category: 'Electronics',
      priceWhole: '150,000.',
      priceFraction: '00',
      store: 'Eden Organics',
      storeLogo: '/assets/images/store-eden-logo-desktop.png',
      image: '/assets/images/listings-item-mouse.png',
      status: 'Sold',
      promoted: true,
    },
    {
      id: 'sneaker',
      name: 'Nike sneaker',
      category: 'Men’s fashion',
      priceWhole: '150,000.',
      priceFraction: '00',
      store: 'Amazing Fragrances',
      storeLogo: '/assets/images/store-amazing-logo-desktop.png',
      image: '/assets/images/listings-item-sneaker.png',
      status: 'Draft',
    },
    {
      id: 'wig',
      name: 'Bone straight wig',
      category: 'Women’s fashion',
      priceWhole: '150,000.',
      priceFraction: '00',
      store: 'Personal account',
      storeLogo: '/assets/images/dashboard-avatar-mobile.png',
      image: '/assets/images/listings-item-wig.png',
      status: 'Paused',
      promoted: true,
    },
    {
      id: 'maserati',
      name: 'Maserati',
      category: 'Automobiles',
      priceWhole: '150,000.',
      priceFraction: '00',
      store: 'The Vine Collections',
      storeLogo: '/assets/images/store-vine-logo-desktop.png',
      image: '/assets/images/listings-item-maserati.png',
      status: 'Suspended',
    },
    {
      id: 'keyboard',
      name: 'RGB keyboard',
      category: 'Electronics',
      priceWhole: '2,500,000.',
      priceFraction: '00',
      store: 'Personal account',
      storeLogo: '/assets/images/dashboard-avatar-mobile.png',
      image: '/assets/images/store-none-cover-desktop.png',
      status: 'Suspended',
    },
    {
      id: 'sweatshirt',
      name: 'Sweatshirt',
      category: 'Men’s fashion',
      priceWhole: '2,500,000.',
      priceFraction: '00',
      store: 'The Vine Collections',
      storeLogo: '/assets/images/store-vine-logo-desktop.png',
      image: '/assets/images/store-swift-cover-desktop.png',
      status: 'Sold',
    },
  ]);

  protected readonly filteredDesktopListings = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.activeFilter();

    return this.listings().filter((listing) => {
      const matchesFilter = filter === 'All' ? true : listing.status === filter;
      const haystack = `${listing.name} ${listing.category} ${listing.store}`.toLowerCase();
      const matchesSearch = term.length === 0 ? true : haystack.includes(term);
      return matchesFilter && matchesSearch;
    });
  });

  protected readonly filteredMobileListings = computed(() => this.filteredDesktopListings().slice(0, 5));

  constructor() {
    effect(() => {
      if (!this.mobileOverlayService.shouldOpenAddListing()) {
        return;
      }

      this.showAddListingModal.set(true);
      this.mobileOverlayService.consumeOpenAddListingRequest();
    });
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

  protected updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
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
}
