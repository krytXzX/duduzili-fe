import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroChevronDown,
  heroMagnifyingGlass,
  heroExclamationTriangle,
  heroAdjustmentsHorizontal,
} from '@ng-icons/heroicons/outline';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../../components/ui/custom-dropdown.component';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';
import { SellerMonetizationService } from '../../../services/seller-monetization.service';
import { AppToastService } from '../../../services/app-toast.service';

export type CreateAdType = 'listing' | 'store' | 'banner';

interface AdTypeOption {
  id: CreateAdType;
  title: string;
  badge: string;
  descriptionLeft: string[];
  descriptionRight: string[];
  artTone: string;
  cardTone: string;
  disabled?: boolean;
}

interface ListingItem {
  id: string;
  kind: 'automobiles' | 'properties' | 'others';
  name: string;
  categoryKey: 'phones-laptops' | 'electronics' | 'mens-fashion' | 'womens-fashion' | 'cars' | 'real-estate';
  categoryLabel: string;
  price: string;
  storeKey: 'vine' | 'eden' | 'amazing' | 'personal';
  store: string;
  storeInitial: string;
  storeTone: string;
  image: string;
}

interface StoreItem {
  id: string;
  name: string;
  image: string;
  logoTone: string;
  logoLabel: string;
  activeListings: string;
}

interface StorePromotionOption {
  id: string;
  name: string;
  coverImage: string;
  logoImage: string;
  activeListings: string;
}

@Component({
  selector: 'app-create-ad-type-modal',
  imports: [CommonModule, NgOptimizedImage, NgIcon, CustomDropdownComponent],
  providers: [
    provideIcons({
      heroXMark,
      heroChevronDown,
      heroMagnifyingGlass,
      heroExclamationTriangle,
      heroAdjustmentsHorizontal,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[210] bg-black/20 backdrop-blur-[2px] animate-in fade-in duration-300"
      (click)="handleBackdropClick()"
    >
      <div class="h-full w-full md:hidden" (click)="$event.stopPropagation()">
        <div class="flex h-full flex-col bg-white">
          @if (step() === 'type') {
            <header class="px-4 pb-4 pt-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="close.emit()"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1A1B1D]"
                    aria-label="Close create ad"
                  >
                    <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
                  </button>
                  <span class="text-[16px] font-medium leading-6 text-[#1A1B1D]">Create Ad</span>
                </div>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6453D9]"></span>
                <span class="h-[2px] rounded-full bg-[#F0F0F0]"></span>
              </div>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              <h2 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Select Ad type</h2>
              <p class="mt-0.5 text-[14px] leading-6 text-[rgba(26,27,29,0.7)]">
                Choose the type of advertisement you want to create
              </p>

              <div class="mt-5 space-y-6">
                @for (option of adTypeOptions(); track option.id) {
                  <button
                    type="button"
                    (click)="selectAdType(option)"
                    [attr.title]="option.disabled ? 'Upgrade your plan to access this feature.' : null"
                    [class.opacity-50]="option.disabled"
                    class="relative block h-[158px] w-full overflow-hidden rounded-[24px] border bg-white px-[18px] pb-[18px] pt-[18px] text-left transition"
                    [attr.aria-pressed]="selectedType() === option.id"
                    [class.border-[#E8E8E8]]="selectedType() !== option.id"
                    [class.border-[#6453D9]]="selectedType() === option.id"
                    [style.background-color]="
                      selectedType() === option.id ? 'rgba(100,83,217,0.04)' : '#FFFFFF'
                    "
                    [style.border-width.px]="selectedType() === option.id ? 2 : 1"
                  >
                    <span
                      class="absolute right-2 top-2 rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                    >
                      {{ option.badge }}
                    </span>

                    <div class="relative z-10 max-w-[188px]">
                      <h3 class="text-[20px] font-medium leading-5 text-[#0D0D0D]">
                        {{ option.title }}
                      </h3>

                      <div class="mt-4 space-y-1">
                        @for (item of adTypeMobileDescription(option.id); track item) {
                          <div class="flex items-center gap-1 text-[12px] leading-5 text-[#878787]">
                            <span class="h-[5px] w-[5px] shrink-0 rounded-full bg-[#6A5AE0]"></span>
                            <span>{{ item }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <div
                      class="absolute bottom-[-9px] right-[-10px] flex h-[102px] w-[104px] items-center justify-center"
                    >
                      <div class="-rotate-[16deg]">
                        <div
                          class="relative h-[82px] w-[84px] overflow-hidden rounded-[19px]"
                          [style.background]="adTypeArtworkBackground(option.id)"
                        >
                          <img
                            [ngSrc]="adTypeArtwork(option.id)"
                            [alt]="option.title + ' preview'"
                            width="512"
                            height="512"
                            class="absolute left-1/2 top-1/2 h-[58px] w-[58px] -translate-x-1/2 -translate-y-1/2 object-contain"
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>

            <footer class="border-t border-[#EDEDED] bg-white px-5 pb-6 pt-[10px]">
              <button
                type="button"
                (click)="onPrimaryAction()"
                class="h-[52px] w-full rounded-full border border-white bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
              >
                Continue
              </button>
            </footer>
          } @else if (step() === 'configure-listing') {
            <header class="px-4 pb-4 pt-3">
              <div class="flex items-center gap-3">
                <button
                  type="button"
                  (click)="step.set('type')"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#1A1B1D]"
                  aria-label="Back"
                >
                  <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
                </button>
                <span class="text-[16px] font-medium leading-6 text-[#1A1B1D]">Create Ad</span>
              </div>

              <div class="mt-3 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6453D9]"></span>
                <span class="h-[2px] rounded-full bg-[#6453D9]"></span>
              </div>
            </header>

            <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
              <h2 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                Select a Listing to promote
              </h2>
              <p class="mt-0.5 text-[14px] leading-6 text-[rgba(26,27,29,0.7)]">
                Select a listing and set your promotion preferences
              </p>

              <section class="mt-9">
                <h3 class="text-[18px] font-semibold leading-[1.2] text-black">
                  Choose listing category
                </h3>
                <div class="mt-5 flex flex-wrap gap-3">
                  @for (category of listingCategories; track category.id) {
                    <button
                      type="button"
                      (click)="selectedListingCategory.set(category.id)"
                      class="flex items-center gap-2 rounded-[12px] border bg-[#FAFAFA] px-3 py-3 text-[14px] leading-5 text-[#1F1F1F] transition"
                      [class.border-[#EAEAEA]]="selectedListingCategory() !== category.id"
                      [class.border-[#6453D9]]="selectedListingCategory() === category.id"
                      [style.border-width.px]="selectedListingCategory() === category.id ? 1.5 : 1"
                      [style.background-color]="
                        selectedListingCategory() === category.id ? '#F9F7FF' : '#FAFAFA'
                      "
                    >
                      <span
                        class="inline-flex h-4 w-4 items-center justify-center rounded-full border"
                        [class.border-[#D9D9D9]]="selectedListingCategory() !== category.id"
                        [class.border-[#6453D9]]="selectedListingCategory() === category.id"
                      >
                        <span
                          class="h-2 w-2 rounded-full"
                          [class.bg-transparent]="selectedListingCategory() !== category.id"
                          [class.bg-[#6453D9]]="selectedListingCategory() === category.id"
                        ></span>
                      </span>
                      {{ category.label }}
                    </button>
                  }
                </div>
              </section>

              <section class="mt-10">
                <div class="space-y-3">
                  <h3 class="text-[18px] font-semibold leading-[1.2] text-black">
                    Select listing to promote
                  </h3>
                  <div
                    class="flex items-start gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#1F1F1F]"
                  >
                    <div
                      class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]"
                    >
                      <ng-icon name="heroExclamationTriangle" class="text-[12px]"></ng-icon>
                    </div>
                    <p class="text-[12px] font-medium leading-5">
                      Your listing will be promoted across Duduzili until it expires on 24 March,
                      2026.
                    </p>
                  </div>
                </div>

                <div class="mt-6 space-y-4">
                  <div>
                    <p class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]">
                      Select listing
                    </p>
                    <button
                      type="button"
                      (click)="openListingPicker()"
                      class="mt-2 flex h-12 w-full items-center justify-between rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-left"
                    >
                      <span class="text-[14px] tracking-[-0.14px] text-[rgba(13,13,13,0.4)]">
                        {{ selectedListingIds().length > 0 ? '' : 'Select listing' }}
                      </span>
                      <ng-icon name="heroChevronDown" class="text-[20px] text-[#1F1F1F]"></ng-icon>
                    </button>
                  </div>

                  <div class="rounded-[12px] bg-[#F9F9F9] p-3">
                    <div class="flex flex-wrap gap-3">
                      @for (listing of selectedListingCards(); track listing.id) {
                        <div
                          class="inline-flex items-center gap-[6px] rounded-full bg-white py-1 pl-1 pr-2"
                        >
                          <img
                            [ngSrc]="listing.image"
                            [alt]="listing.name"
                            width="48"
                            height="48"
                            class="h-6 w-6 rounded-full object-cover"
                          />
                          <span
                            class="max-w-[109px] truncate text-[12px] font-medium leading-5 text-[#0D0D0D]"
                          >
                            {{ listing.name }}
                          </span>
                          <button
                            type="button"
                            (click)="toggleListingSelection(listing.id)"
                            class="inline-flex h-5 w-5 items-center justify-center text-[#0D0D0D]"
                            aria-label="Remove {{ listing.name }}"
                          >
                            <ng-icon name="heroXMark" class="text-[14px]"></ng-icon>
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <footer class="border-t border-[#EDEDED] bg-white px-5 pb-6 pt-[10px]">
              <div class="grid grid-cols-[minmax(0,1fr)_205px] gap-[6px]">
                <button
                  type="button"
                  (click)="step.set('type')"
                  class="h-[52px] rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                >
                  Back
                </button>
                <button
                  type="button"
                  (click)="completeListingPromotion()"
                  class="h-[52px] rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  Promote Listing(s)
                </button>
              </div>
            </footer>
          } @else if (step() === 'mobile-listing-picker') {
            <div class="flex flex-1 flex-col overflow-hidden rounded-t-[36px] bg-white">
              <header class="relative px-4 pt-[11px]">
                <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>

                <button
                  type="button"
                  (click)="closeListingPicker()"
                  class="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#434455] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                  aria-label="Close listing picker"
                >
                  <ng-icon name="heroXMark" class="text-[22px]"></ng-icon>
                </button>

                <div class="mt-14 flex items-center gap-3">
                  <div
                    class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#FAFAFA] px-3"
                  >
                    <ng-icon
                      name="heroMagnifyingGlass"
                      class="text-[16px] text-[#777777]"
                    ></ng-icon>
                    <input
                      type="text"
                      [value]="listingSearch()"
                      (input)="listingSearch.set(($any($event.target).value ?? '').toString())"
                      placeholder="Search"
                      class="w-full bg-transparent text-[14px] text-[#141414] outline-none placeholder:text-[#777777]"
                    />
                  </div>

                  <button
                    type="button"
                    (click)="openStoreFilterSheet()"
                    class="inline-flex h-10 w-10 items-center justify-center text-[#141414]"
                    aria-label="Filter listings by store"
                  >
                    <ng-icon name="heroAdjustmentsHorizontal" class="text-[20px]"></ng-icon>
                  </button>
                </div>
              </header>

              <div class="flex-1 overflow-y-auto px-4 pb-5 pt-4">
                <div class="space-y-1">
                  @for (listing of mobilePickerListings(); track listing.id) {
                    <button
                      type="button"
                      (click)="toggleListingSelection(listing.id)"
                      class="flex w-full items-center justify-between rounded-[8px] py-2 text-left"
                    >
                      <div class="flex min-w-0 items-center gap-2">
                        <img
                          [ngSrc]="listing.image"
                          [alt]="listing.name"
                          width="40"
                          height="40"
                          class="h-10 w-10 rounded-[6px] object-cover"
                        />

                        <div class="min-w-0">
                          <p
                            class="truncate text-[16px] font-medium leading-6 text-[rgba(13,13,13,0.8)]"
                          >
                            {{ listing.name }}
                          </p>
                          <p class="mt-1 truncate text-[12px] leading-4 text-[#7F8081]">
                            {{ listing.store }}
                          </p>
                        </div>
                      </div>

                      <span
                        class="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border"
                        [class.border-[#E1E1E1]]="!selectedListingIds().includes(listing.id)"
                        [class.bg-white]="!selectedListingIds().includes(listing.id)"
                        [class.border-[#6453D9]]="selectedListingIds().includes(listing.id)"
                        [class.bg-[#6453D9]]="selectedListingIds().includes(listing.id)"
                      >
                        @if (selectedListingIds().includes(listing.id)) {
                          <span class="text-[11px] font-bold text-white">✓</span>
                        }
                      </span>
                    </button>
                  }
                </div>
              </div>

              <footer class="bg-white px-4 pb-6 pt-[11px]">
                <button
                  type="button"
                  (click)="closeListingPicker()"
                  class="h-[52px] w-full rounded-full border border-white bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8]"
                >
                  Choose {{ selectedListingIds().length }} listing{{
                    selectedListingIds().length === 1 ? '' : 's'
                  }}
                </button>
              </footer>
            </div>
          } @else if (step() === 'configure-store') {
            <header class="px-4 pb-4 pt-[10px]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="step.set('type')"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-[#1A1B1D]"
                    aria-label="Back"
                  >
                    <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
                  </button>
                  <h1 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">Create Ad</h1>
                </div>

                <button
                  type="button"
                  (click)="openStorePreview()"
                  class="text-[14px] font-medium leading-5 text-[#1A1B1D] underline underline-offset-2"
                >
                  Preview
                </button>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6453D9]"></span>
                <span class="h-[2px] rounded-full bg-[#6453D9]"></span>
              </div>
            </header>

            <div class="flex-1 overflow-y-auto px-5 pb-6 pt-4">
              <h2 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Configure Store Ad</h2>
              <p class="mt-0.5 text-[14px] leading-6 text-[rgba(26,27,29,0.7)]">
                Promote your store to attract more customers
              </p>

              <section class="mt-5">
                <h3 class="text-[18px] font-semibold leading-[1.2] text-black">
                  Select store to promote
                </h3>

                <div
                  class="mt-3 flex items-start gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#1F1F1F]"
                >
                  <div
                    class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]"
                  >
                    <ng-icon name="heroExclamationTriangle" class="text-[12px]"></ng-icon>
                  </div>
                  <p class="text-[12px] font-medium leading-5">
                    Your store will be promoted across Duduzili until it expires on 24 March, 2026.
                  </p>
                </div>

                <div class="mt-5 grid grid-cols-2 gap-2">
                  @for (store of mobileStorePromotionOptions; track store.id) {
                    <button
                      type="button"
                      (click)="selectedStoreId.set(store.id)"
                      class="relative overflow-hidden rounded-[13.746px] border bg-white text-left transition"
                      [class.border-[#6453D9]]="selectedStoreId() === store.id"
                      [style.border-width.px]="selectedStoreId() === store.id ? 2 : 0.573"
                      [class.border-[#EAEAEA]]="selectedStoreId() !== store.id"
                    >
                      <div class="relative h-[90px] overflow-hidden rounded-t-[11.455px]">
                        <img
                          [ngSrc]="store.coverImage"
                          [alt]="store.name"
                          width="171"
                          height="90"
                          class="h-full w-full object-cover"
                        />
                        <div
                          class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.54%,rgba(255,255,255,0.12)_40%,rgba(255,255,255,0.95)_93.47%)]"
                        ></div>
                        <span
                          class="absolute right-[9px] top-[8px] inline-flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white/20 backdrop-blur-[2px]"
                          [class.border-[#8F7AF8]]="selectedStoreId() === store.id"
                          [class.border-white/70]="selectedStoreId() !== store.id"
                          aria-hidden="true"
                        >
                          @if (selectedStoreId() === store.id) {
                            <span class="h-3 w-3 rounded-full bg-[#6453D9] shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"></span>
                          }
                        </span>
                      </div>

                      <div class="relative px-[10px] pb-[10px] pt-0">
                        <div class="-mt-[31px]">
                          <img
                            [ngSrc]="store.logoImage"
                            [alt]="store.name + ' logo'"
                            width="42"
                            height="42"
                            class="h-[42px] w-[42px] rounded-full border-[2.291px] border-white object-cover shadow-[0_4px_10px_rgba(0,0,0,0.12)]"
                          />
                        </div>

                        <div class="mt-2 space-y-[2px]">
                          <div class="flex items-center gap-[2px]">
                            <p class="truncate text-[12px] font-medium leading-[13.746px] text-[#1F1F1F]">
                              {{ store.name }}
                            </p>
                            <img
                              ngSrc="/assets/icons/store-filled-verify-mobile.svg"
                              width="12"
                              height="12"
                              alt=""
                              class="h-3 w-3 shrink-0"
                            />
                          </div>

                          <div class="flex items-center gap-[2px] text-[10px] text-[#959595]">
                            <span class="h-[10px] w-[10px] rounded-[3px] border border-[#B3B3B3]"></span>
                            <span>{{ store.activeListings }}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  }
                </div>
              </section>
            </div>

            <footer class="mt-auto border-t border-[#EDEDED] bg-white px-5 py-[12px]">
              <div class="grid grid-cols-[minmax(0,1fr)_205px] gap-[6px]">
                <button
                  type="button"
                  (click)="step.set('type')"
                  class="h-[52px] rounded-[82px] bg-[#F5F5F5] px-5 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                >
                  Back
                </button>
                <button
                  type="button"
                  (click)="completeStorePromotion()"
                  class="h-[52px] rounded-full border border-white bg-[#6453D9] px-5 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  Promote store
                </button>
              </div>
            </footer>
          } @else if (step() === 'store-preview') {
            <div class="flex flex-1 flex-col overflow-hidden rounded-t-[36px] bg-white">
              <div class="relative px-4 pt-[11px]">
                <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>

                <button
                  type="button"
                  (click)="step.set('configure-store')"
                  class="absolute right-4 top-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#4A4F5E] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                  aria-label="Close preview"
                >
                  <ng-icon name="heroXMark" class="text-[22px]"></ng-icon>
                </button>
              </div>

              <div class="flex-1 overflow-y-auto px-4 pb-8 pt-[54px]">
                <div class="mx-auto max-w-[334px]">
                  <div class="text-center">
                    <h2 class="text-[20px] font-semibold leading-7 text-[#1F1F1F]">Preview</h2>
                    <p class="mt-1 text-[14px] leading-5 text-[#959595]">
                      This is how your store ad will appear to buyers
                    </p>
                  </div>

                  <div class="mt-4 flex items-center justify-center gap-[7px]">
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#3D3D3D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                      aria-label="Desktop preview"
                    >
                      <span class="h-4 w-4 rounded-[3px] border border-current"></span>
                    </button>
                    <button
                      type="button"
                      class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#3D3D3D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                      aria-label="Mobile preview"
                    >
                      <span class="h-4 w-2.5 rounded-[3px] border border-current"></span>
                    </button>
                  </div>

                  <div
                    class="mt-4 h-[514px] overflow-hidden rounded-[12px] border border-[#EAEAEA] bg-[#FCFCFC] shadow-[0_12px_24px_rgba(192,192,192,0.25)]"
                  >
                    <div class="relative h-full overflow-hidden">
                      <div class="mx-auto w-[294px] rounded-[24px] bg-[#1A1A1A] px-[6px] py-[2px]">
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-[6px]">
                            <div class="h-[6px] w-[26px] rounded-full bg-white/90"></div>
                          </div>
                          <div class="flex items-center gap-1">
                            <div class="h-[4px] w-[58px] rounded-full bg-white/20"></div>
                            <div class="h-[8px] w-5 rounded-full bg-white"></div>
                          </div>
                        </div>
                      </div>

                      <div class="px-[17px] pb-0 pt-[18px]">
                        <div class="grid grid-cols-4 gap-[6px] opacity-35 blur-[4px]">
                          @for (item of [1, 2, 3, 4, 5, 6, 7, 8]; track item) {
                            <div class="space-y-[3px]">
                              <div class="aspect-[0.9] rounded-[6px] bg-[#EFEFEF]"></div>
                              <div class="h-[4px] rounded-full bg-[#EFEFEF]"></div>
                              <div class="h-[4px] w-2/3 rounded-full bg-[#EFEFEF]"></div>
                            </div>
                          }
                        </div>

                        <div class="mt-9">
                          <p class="text-[7px] font-medium text-[#2A2A2A]">Featured stores</p>
                          <div class="mt-[6px] grid grid-cols-4 gap-[6px]">
                            @for (store of mobileStorePromotionOptions; track store.id) {
                              <div class="overflow-hidden rounded-[6px] border border-[#F0F0F0] bg-white">
                                <img
                                  [ngSrc]="store.coverImage"
                                  [alt]="store.name"
                                  width="70"
                                  height="50"
                                  class="h-[50px] w-full object-cover"
                                />
                              </div>
                            }
                          </div>
                        </div>
                      </div>

                      <div class="absolute bottom-[58px] left-[24px] right-[24px] grid grid-cols-[1.05fr_1fr] gap-5">
                        <div>
                          <div class="h-[6px] w-[28px] rounded-full bg-[#36394A]"></div>
                          <div class="mt-[4px] h-[4px] w-[82px] rounded-full bg-[#BFC3CC]"></div>
                          <div class="mt-[3px] h-[4px] w-[72px] rounded-full bg-[#D7DAE0]"></div>

                          <div class="mt-[18px] flex items-start gap-[4px]">
                            <div class="h-9 w-9 rounded-[6px] bg-[#252525]"></div>
                            <div class="space-y-[4px]">
                              <div class="h-[16px] w-[70px] rounded-[4px] border border-[#D8D8D8] bg-white"></div>
                              <div class="h-[16px] w-[70px] rounded-[4px] border border-[#D8D8D8] bg-white"></div>
                            </div>
                          </div>

                          <div class="mt-[10px] h-[4px] w-[74px] rounded-full bg-[#D7DAE0]"></div>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                          <div class="space-y-[4px]">
                            <div class="h-[5px] w-[20px] rounded-full bg-[#36394A]"></div>
                            <div class="h-[4px] w-[28px] rounded-full bg-[#D7DAE0]"></div>
                            <div class="h-[4px] w-[22px] rounded-full bg-[#D7DAE0]"></div>
                            <div class="h-[4px] w-[24px] rounded-full bg-[#D7DAE0]"></div>
                          </div>
                          <div class="space-y-[4px]">
                            <div class="h-[5px] w-[28px] rounded-full bg-[#36394A]"></div>
                            <div class="h-[4px] w-[36px] rounded-full bg-[#D7DAE0]"></div>
                            <div class="h-[4px] w-[31px] rounded-full bg-[#D7DAE0]"></div>
                            <div class="h-[4px] w-[24px] rounded-full bg-[#D7DAE0]"></div>
                          </div>

                          <div class="col-span-2 mt-2 flex items-end justify-end gap-[4px]">
                            <div class="space-y-[3px]">
                              <div class="h-[5px] w-[74px] rounded-full bg-[#36394A]"></div>
                              <div class="h-[12px] w-[74px] rounded-[3px] border border-[#E6E6E8] bg-white"></div>
                            </div>
                            <div class="mb-[1px] h-[10px] w-[34px] rounded-full bg-[#6453D9]"></div>
                          </div>
                        </div>
                      </div>

                      <div
                        class="absolute bottom-0 left-0 right-0 h-[159px] bg-[linear-gradient(180deg,rgba(123,106,217,0)_32.621%,rgba(123,106,217,0.2)_100%),linear-gradient(90deg,#fff_0%,#fff_100%)]"
                      >
                        <div
                          class="absolute bottom-[-14px] left-1/2 -translate-x-1/2 text-center text-[68px] font-extrabold leading-none tracking-[3.4px] text-[#EFEEF9] opacity-90"
                        >
                          Duduzili
                        </div>
                      </div>

                      <div
                        class="pointer-events-none absolute inset-x-0 top-[30px] h-[205px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_48.984%,rgba(255,255,255,0)_100%)] backdrop-blur-[6px]"
                      ></div>
                      <div
                        class="pointer-events-none absolute right-0 top-[234px] h-[119px] w-[245px] bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.5)_48.984%,rgba(255,255,255,0)_100%)] backdrop-blur-[6px]"
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          } @else if (step() === 'listing-success') {
            <div class="flex flex-1 flex-col justify-center px-5 pb-6 text-center">
              <img
                ngSrc="assets/images/listing-success-mobile-figma.png"
                alt="Listing promotion success"
                width="512"
                height="512"
                class="mx-auto h-[150px] w-[179px] object-contain"
              />

              <h2 class="mt-11 text-[28px] font-semibold leading-[1.1] text-[#0D0D0D]">
                Listing promotion is now active 🚀
              </h2>

              <p class="mt-2 text-[16px] leading-6 text-[#747474]">
                Your
                <span class="font-medium text-[#101010]">
                  {{ ' ' + selectedListingIds().length + ' listings' }}
                </span>
                are now promoted across Search, Categories, and Explore. Promotion ends on
                <span class="font-medium text-[#010101]">27 April 2026.</span>
              </p>

              <div class="mt-11 w-full space-y-3">
                <button
                  type="button"
                  (click)="resetListingFlow()"
                  class="h-[52px] w-full rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                >
                  Create another Ad
                </button>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="h-[52px] w-full rounded-full border border-white bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  View running Ads
                </button>
              </div>
            </div>
          } @else if (step() === 'store-success') {
            <div class="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-6 text-center">
              <div class="relative h-[150px] w-[150px]">
                <div
                  class="absolute left-1/2 top-[18px] h-[30px] w-[40px] -translate-x-1/2 rounded-t-[10px] bg-[#FF6B42]"
                ></div>
                <div class="absolute left-1/2 top-[18px] flex -translate-x-1/2">
                  <span class="h-[36px] w-[12px] rounded-b-[12px] bg-[#FF5A36]"></span>
                  <span class="h-[36px] w-[12px] rounded-b-[12px] bg-[#FFB33C]"></span>
                  <span class="h-[36px] w-[12px] rounded-b-[12px] bg-[#FF3E28]"></span>
                  <span class="h-[36px] w-[12px] rounded-b-[12px] bg-[#FFB33C]"></span>
                  <span class="h-[36px] w-[12px] rounded-b-[12px] bg-[#FF6B42]"></span>
                </div>
                <div
                  class="absolute left-1/2 top-[44px] h-[92px] w-[84px] -translate-x-1/2 rounded-[10px] bg-linear-to-b from-[#8A798B] to-[#6C5A74]"
                ></div>
                <div
                  class="absolute left-1/2 top-[66px] h-[56px] w-[58px] -translate-x-1/2 rounded-[6px] bg-[#F7F1FF]"
                ></div>
                <div
                  class="absolute left-1/2 top-[76px] flex h-[30px] w-[59px] -translate-x-1/2 items-center justify-center gap-[3px] rounded-[5px] bg-[linear-gradient(291deg,#B20E0E_2.19%,#FF8989_97.71%)] px-[3px]"
                >
                  <span class="h-[5px] w-[5px] rounded-full bg-white/90"></span>
                  <span class="text-[11.75px] font-bold tracking-[0.01em] text-white">ACTIVE</span>
                </div>
                <div
                  class="absolute left-1/2 top-[120px] h-[10px] w-[20px] -translate-x-1/2 rounded-full border border-white/10 bg-[#75617D]"
                ></div>
              </div>

              <div class="mt-6 flex w-full max-w-[350px] flex-col items-center gap-2 text-center">
                <h2 class="text-[28px] font-semibold leading-[1.1] text-[#0D0D0D]">
                  Store promotion is now active 🚀
                </h2>

                <p class="text-[16px] leading-6 text-[#747474]">
                  Your store
                  <span class="font-medium text-[#121212]"> {{ selectedStoreName() }}</span> is now
                  promoted across Duduzili.
                  <br />
                  Promotion ends on
                  <span class="font-medium text-[#151515]"> 27 April 2026.</span>
                </p>
              </div>

              <div class="mt-11 w-full space-y-3">
                <button
                  type="button"
                  (click)="resetStoreFlow()"
                  class="h-[52px] w-full rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                >
                  Create another Ad
                </button>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="h-[52px] w-full rounded-full border border-white bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  View running Ads
                </button>
              </div>
            </div>
          }

          @if (isStoreFilterOpen()) {
            <div class="pointer-events-none absolute inset-0 bg-black/15"></div>
            <div
              class="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pt-3 pb-4 shadow-[0_-18px_48px_-24px_rgba(17,24,39,0.35)]"
            >
              <div class="mx-auto h-1 w-14 rounded-full bg-[#E7E7EA]"></div>

              <div class="mt-4 flex items-center justify-between">
                <h3 class="text-[15px] font-semibold text-[#222631]">Filter by Store</h3>
                <button
                  type="button"
                  (click)="closeStoreFilterSheet()"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#4A4F5E]"
                  aria-label="Close store filter"
                >
                  <ng-icon name="heroXMark" class="text-[15px]"></ng-icon>
                </button>
              </div>

              <div class="mt-4 space-y-4">
                @for (store of mobileFilterStores(); track store.id) {
                  <button
                    type="button"
                    (click)="toggleStoreFilter(store.id)"
                    class="flex w-full items-center gap-3 text-left"
                  >
                    <img
                      [ngSrc]="store.image"
                      [alt]="store.name"
                      width="36"
                      height="36"
                      loading="lazy"
                      class="h-9 w-9 rounded-full object-cover"
                    />
                    <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-[#232632]">{{
                      store.name
                    }}</span>
                    <span
                      class="inline-flex h-5 w-5 items-center justify-center rounded-[5px] border"
                      [class.border-[#6B5CF0]]="mobileSelectedStoreIds().includes(store.id)"
                      [class.bg-[#6B5CF0]]="mobileSelectedStoreIds().includes(store.id)"
                      [class.border-[#D9DCE3]]="!mobileSelectedStoreIds().includes(store.id)"
                      [class.bg-white]="!mobileSelectedStoreIds().includes(store.id)"
                    >
                      @if (mobileSelectedStoreIds().includes(store.id)) {
                        <span class="text-[11px] font-bold text-white">✓</span>
                      }
                    </span>
                  </button>
                }
              </div>

              <div class="mt-6">
                <button
                  type="button"
                  (click)="applyStoreFilters()"
                  class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  Apply filter
                </button>
              </div>
            </div>
          }
        </div>
      </div>

      <div
        class="hidden h-full w-full md:flex"
        [class.p-3]="step() !== 'type'"
        [class.p-0]="step() === 'type'"
        (click)="$event.stopPropagation()"
      >
        <div
          class="relative flex h-full w-full overflow-hidden bg-white"
          [class.rounded-[32px]]="step() !== 'type'"
          [style.box-shadow]="step() !== 'type' ? '0 30px 80px -40px rgba(19,27,45,0.45)' : 'none'"
        >
          @if (step() === 'type') {
            <div
              class="absolute inset-x-0 top-0 z-10 flex h-[70px] items-center bg-[rgba(255,255,255,0.8)] px-8 backdrop-blur-[2.5px]"
            >
              <div class="flex items-center gap-[30px]">
                <button
                  type="button"
                  (click)="close.emit()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F7] text-[#0D0D0D]"
                  aria-label="Close create ad modal"
                >
                  <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
                </button>
                <h1 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">Create Ad</h1>
              </div>
            </div>

            <div
              class="absolute inset-x-0 bottom-0 z-10 flex h-[70px] items-center bg-[rgba(255,255,255,0.8)] px-6 backdrop-blur-[2.5px]"
            >
              <div class="ml-auto">
                <button
                  type="button"
                  (click)="onPrimaryAction()"
                  class="h-10 rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  Continue
                </button>
              </div>
            </div>
          }
          @if (step() !== 'listing-success' && step() !== 'store-success') {
            @if (step() === 'type') {
              <aside class="hidden w-[170px] shrink-0 px-6 pt-20 lg:block">
                <nav class="space-y-[14px] pt-[2px]">
                  <div
                    class="flex items-center gap-2 text-[16px] font-semibold leading-6 text-[#0D0D0D]"
                  >
                    <span class="h-px w-7 bg-[#6453D9]"></span>
                    Ad type
                  </div>
                  <div
                    class="flex items-center gap-2 text-[16px] font-medium leading-6 text-[#0D0D0D] opacity-30"
                  >
                    <span class="h-px w-[11px] bg-[#0D0D0D]"></span>
                    Configure
                  </div>
                </nav>
              </aside>
            } @else if (step() === 'configure-listing') {
              <aside class="hidden w-[170px] shrink-0 px-6 pt-20 lg:block">
                <nav class="space-y-[14px] pt-[2px]">
                  <div
                    class="flex items-center gap-2 pl-3 text-[16px] font-medium leading-6 text-black"
                  >
                    <span
                      class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6453D9] text-[11px] text-white"
                    >
                      ✓
                    </span>
                    Ad type
                  </div>
                  <div
                    class="flex items-center gap-2 text-[16px] font-semibold leading-6 text-black"
                  >
                    <span class="h-px w-7 bg-[#6453D9]"></span>
                    Configure
                  </div>
                </nav>
              </aside>
            } @else {
              <aside
                class="hidden w-[220px] shrink-0 border-r border-[#F0F1F4] bg-white px-7 py-6 lg:block"
              >
                <div class="flex items-center gap-4">
                  <button
                    type="button"
                    (click)="close.emit()"
                    class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2] focus:outline-none focus:ring-4 focus:ring-gray-200"
                    aria-label="Close create ad modal"
                  >
                    <ng-icon name="heroXMark" class="text-lg"></ng-icon>
                  </button>
                  <h1 class="text-[1.45rem] font-bold tracking-tight text-[#24262D]">Create Ad</h1>
                </div>

                <nav class="mt-10 space-y-4">
                  <div
                    class="flex items-center gap-3 text-[15px] font-semibold"
                    [class.text-[#6B5CF0]]="step() === 'type'"
                    [class.text-[#BABEC7]]="step() !== 'type'"
                  >
                    <span
                      class="h-px w-6"
                      [class.bg-[#6B5CF0]]="step() === 'type'"
                      [class.bg-[#E4E6EB]]="step() !== 'type'"
                    ></span>
                    Ad type
                  </div>
                  <div
                    class="flex items-center gap-3 text-[15px] font-medium"
                    [class.text-[#6B5CF0]]="step() !== 'type'"
                    [class.text-[#BABEC7]]="step() === 'type'"
                  >
                    <span
                      class="h-px w-6"
                      [class.bg-[#6B5CF0]]="step() !== 'type'"
                      [class.bg-[#E4E6EB]]="step() === 'type'"
                    ></span>
                    Configure
                  </div>
                </nav>
              </aside>
            }
          }

          <div class="flex min-w-0 flex-1 flex-col">
            <header
              class="flex items-center gap-4 border-b border-[#F1F2F4] px-6 py-5 lg:hidden"
              [class.hidden]="step() === 'type'"
            >
              <button
                type="button"
                (click)="close.emit()"
                class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2] focus:outline-none focus:ring-4 focus:ring-gray-200"
                aria-label="Close create ad modal"
              >
                <ng-icon name="heroXMark" class="text-lg"></ng-icon>
              </button>
              <h1 class="text-[1.45rem] font-bold tracking-tight text-[#24262D]">Create Ad</h1>
            </header>

            <div
              class="flex-1 overflow-y-auto px-6 py-8 lg:px-10"
              [style.padding-bottom.px]="step() === 'type' ? 102 : null"
              [style.padding-top.px]="step() === 'type' ? 80 : null"
              [style.padding-right.px]="step() === 'type' ? 32 : null"
            >
              <div
                class="mx-auto max-w-[980px]"
                [style.max-width.px]="step() === 'type' ? 885 : null"
              >
                @if (step() === 'type') {
                  <h2 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">
                    Select Ad type
                  </h2>
                  <p class="mt-2 max-w-[552px] text-[16px] leading-6 text-[rgba(26,27,29,0.5)]">
                    Choose the type of advertisement you want to create
                  </p>

                  <div class="mt-8 space-y-8">
                    @for (option of adTypeOptions(); track option.id) {
                      <button
                        type="button"
                        (click)="selectAdType(option)"
                        [attr.title]="option.disabled ? 'Upgrade your plan to access this feature.' : null"
                        [class.opacity-50]="option.disabled"
                        class="relative block h-[146px] w-full overflow-hidden rounded-[24px] border bg-white px-[18px] py-[18px] text-left transition-all"
                        [attr.aria-pressed]="selectedType() === option.id"
                        [class.border-[#E8E8E8]]="selectedType() !== option.id"
                        [class.border-[#6453D9]]="selectedType() === option.id"
                        [style.background-color]="
                          selectedType() === option.id ? 'rgba(100,83,217,0.04)' : '#FFFFFF'
                        "
                        [style.border-width.px]="selectedType() === option.id ? 2 : 1"
                      >
                        <span
                          class="absolute right-2 top-2 rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[14px] font-medium leading-4 text-[#4E3E07]"
                        >
                          {{ option.badge }}
                        </span>

                        <div
                          class="relative z-10 flex h-full max-w-[599px] flex-col justify-center gap-[22px]"
                        >
                          <h3 class="text-[24px] font-medium leading-5 text-[#0D0D0D]">
                            {{ option.title }}
                          </h3>

                          <div class="flex gap-[74px]">
                            <div class="w-[234px] space-y-3">
                              @for (item of option.descriptionLeft; track item) {
                                <div
                                  class="flex items-center gap-1 text-[14px] leading-5 text-[#878787]"
                                >
                                  <span
                                    class="h-[5px] w-[5px] shrink-0 rounded-full bg-[#6A5AE0]"
                                  ></span>
                                  <span>{{ item }}</span>
                                </div>
                              }
                            </div>

                            <div class="w-[234px] space-y-3">
                              @for (item of option.descriptionRight; track item) {
                                <div
                                  class="flex items-center gap-1 text-[14px] leading-5 text-[#878787]"
                                >
                                  <span
                                    class="h-[5px] w-[5px] shrink-0 rounded-full bg-[#6A5AE0]"
                                  ></span>
                                  <span>{{ item }}</span>
                                </div>
                              }
                            </div>
                          </div>
                        </div>

                        <div
                          class="absolute right-[-4px] top-[31px] flex h-[173px] w-[176px] items-center justify-center"
                        >
                          <div class="-rotate-[16deg]">
                            <div
                              class="relative h-[139px] w-[143px] overflow-hidden rounded-[32px]"
                              [style.background]="adTypeArtworkBackground(option.id)"
                            >
                              <img
                                [ngSrc]="adTypeArtwork(option.id)"
                                [alt]="option.title + ' preview'"
                                width="512"
                                height="512"
                                class="absolute left-1/2 top-1/2 h-[100px] w-[100px] -translate-x-1/2 -translate-y-1/2 object-contain"
                              />
                            </div>
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                } @else if (step() === 'configure-listing') {
                  <h2 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">
                    Select a Listing to promote
                  </h2>
                  <p class="mt-2 max-w-[552px] text-[16px] leading-6 text-[rgba(26,27,29,0.5)]">
                    Select a listing and set your promotion preferences
                  </p>

                  <section class="mt-11">
                    <h3 class="text-[20px] font-semibold leading-[1.2] text-black">
                      Choose listing category
                    </h3>
                    <div class="mt-5 flex flex-wrap gap-3">
                      @for (category of listingCategories; track category.id) {
                        <button
                          type="button"
                          (click)="selectedListingCategory.set(category.id)"
                          class="flex items-center gap-2 rounded-[12px] border bg-[#FAFAFA] px-3 py-3 text-[16px] leading-5 text-[#1F1F1F] transition"
                          [class.border-[#EAEAEA]]="selectedListingCategory() !== category.id"
                          [class.border-[#6453D9]]="selectedListingCategory() === category.id"
                          [style.border-width.px]="
                            selectedListingCategory() === category.id ? 1.5 : 1
                          "
                          [style.background-color]="
                            selectedListingCategory() === category.id ? '#F9F7FF' : '#FAFAFA'
                          "
                        >
                          <span
                            class="inline-flex h-4 w-4 items-center justify-center rounded-full border"
                            [class.border-[#D9D9D9]]="selectedListingCategory() !== category.id"
                            [class.border-[#6453D9]]="selectedListingCategory() === category.id"
                          >
                            <span
                              class="h-2 w-2 rounded-full"
                              [class.bg-transparent]="selectedListingCategory() !== category.id"
                              [class.bg-[#6453D9]]="selectedListingCategory() === category.id"
                            ></span>
                          </span>
                          {{ category.label }}
                        </button>
                      }
                    </div>
                  </section>

                  <section class="mt-11">
                    <h3 class="text-[20px] font-semibold leading-[1.2] text-black">
                      Select listing to promote
                    </h3>

                    <div
                      class="mt-5 flex items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#1F1F1F]"
                    >
                      <div
                        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]"
                      >
                        <ng-icon name="heroExclamationTriangle" class="text-[12px]"></ng-icon>
                      </div>
                      <p class="text-[14px] font-medium leading-5">
                        Your listing will be promoted across Duduzili until it expires on 24 March,
                        2026.
                      </p>
                    </div>

                    <div
                      class="mt-5 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white"
                    >
                      <div class="flex items-center justify-between px-[15px] py-[19px]">
                        <div class="flex flex-wrap gap-2">
                          <app-custom-dropdown
                            [options]="desktopListingCategoryOptions"
                            [value]="desktopListingCategoryFilter()"
                            [ariaLabel]="'Filter promotion listings by category'"
                            [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                            [labelClass]="'truncate'"
                            [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                            [menuClass]="'min-w-[176px]'"
                            [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                            [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                            (valueChange)="desktopListingCategoryFilter.set($event)"
                          ></app-custom-dropdown>

                          <app-custom-dropdown
                            [options]="desktopListingStoreOptions"
                            [value]="desktopListingStoreFilter()"
                            [ariaLabel]="'Filter promotion listings by store'"
                            [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                            [labelClass]="'truncate'"
                            [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                            [menuClass]="'min-w-[176px]'"
                            [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                            [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                            (valueChange)="desktopListingStoreFilter.set($event)"
                          ></app-custom-dropdown>

                          <app-custom-dropdown
                            [options]="desktopListingSelectionOptions"
                            [value]="desktopListingSelectionFilter()"
                            [ariaLabel]="'Filter promotion listings by selection status'"
                            [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]'"
                            [labelClass]="'truncate'"
                            [iconClass]="'text-[rgba(26,27,29,0.5)]'"
                            [menuClass]="'min-w-[176px]'"
                            [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                            [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                            (valueChange)="desktopListingSelectionFilter.set($event)"
                          ></app-custom-dropdown>
                        </div>

                        <div class="relative w-[354px]">
                          <ng-icon
                            name="heroMagnifyingGlass"
                            class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#777777]"
                          ></ng-icon>
                          <input
                            type="text"
                            placeholder="Search"
                            class="h-10 w-full rounded-full bg-[#FAFAFA] pl-9 pr-4 text-[14px] font-normal text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                          />
                        </div>
                      </div>

                      <div class="overflow-x-auto">
                        <table class="w-full min-w-[996px]">
                          <thead class="border-y border-[#F4F4F4] bg-[#FAFAFA] text-left">
                            <tr class="text-[12px] font-medium text-[rgba(26,27,29,0.6)]">
                              <th class="px-4 py-[11px]">Name</th>
                              <th class="px-4 py-[11px]">Category</th>
                              <th class="px-4 py-[11px]">Price</th>
                              <th class="px-4 py-[11px]">Store</th>
                              <th class="px-4 py-[11px] text-center">Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (listing of filteredListings(); track listing.id) {
                              <tr class="border-b border-[#F0F0F0] last:border-b-0">
                                <td class="px-4 py-3">
                                  <div class="flex items-center gap-3">
                                    <img
                                      [ngSrc]="listing.image"
                                      [alt]="listing.name"
                                      width="40"
                                      height="40"
                                      class="h-10 w-10 rounded-[6px] object-cover"
                                    />
                                    <span class="text-[14px] font-medium text-[#1A1B1D]">{{
                                      listing.name
                                    }}</span>
                                  </div>
                                </td>
                                <td class="px-4 py-3 text-[14px] font-normal text-[#1A1B1D]">
                                  {{ listing.categoryLabel }}
                                </td>
                                <td class="px-4 py-3 text-[14px] font-medium text-[#1F1F1F]">
                                  {{ listing.price }}
                                </td>
                                <td class="px-4 py-3">
                                  <div class="flex items-center gap-2.5">
                                    @if (listingStoreAvatarImage(listing.store); as avatarImage) {
                                      <img
                                        [ngSrc]="avatarImage"
                                        [alt]="listing.store"
                                        width="32"
                                        height="32"
                                        class="h-8 w-8 rounded-full object-cover"
                                      />
                                    } @else {
                                      <span
                                        class="flex h-8 w-8 items-center justify-center rounded-full border-[1.73px] border-white text-[12px] font-bold text-white"
                                        [style.background]="listing.storeTone"
                                      >
                                        {{ listing.storeInitial }}
                                      </span>
                                    }
                                    <span class="text-[14px] font-normal text-[#1A1B1D]">{{
                                      listing.store
                                    }}</span>
                                  </div>
                                </td>
                                <td class="px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    (click)="toggleListingSelection(listing.id)"
                                    class="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border"
                                    [class.border-[#CCCCCC]]="
                                      !selectedListingIds().includes(listing.id)
                                    "
                                    [class.border-[#6453D9]]="
                                      selectedListingIds().includes(listing.id)
                                    "
                                    [class.bg-white]="!selectedListingIds().includes(listing.id)"
                                    [class.bg-[#6453D9]]="selectedListingIds().includes(listing.id)"
                                    [attr.aria-pressed]="selectedListingIds().includes(listing.id)"
                                    [attr.aria-label]="'Select ' + listing.name"
                                  >
                                    @if (selectedListingIds().includes(listing.id)) {
                                      <span class="text-[10px] font-bold text-white">✓</span>
                                    }
                                  </button>
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                } @else if (step() === 'configure-store') {
                  <div class="flex min-h-[720px] flex-col">
                    <div class="grid gap-14 xl:grid-cols-[580px_340px]">
                      <section class="w-full max-w-[580px]">
                        <h2 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">
                          Configure Store Ad
                        </h2>
                        <p class="mt-3 text-[16px] leading-6 text-[rgba(26,27,29,0.5)]">
                          Promote your store to attract more customers
                        </p>

                        <section class="mt-8">
                          <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                            Select store to promote
                          </h3>

                          <div
                            class="mt-5 flex items-center gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#1F1F1F]"
                          >
                            <div
                              class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]"
                            >
                              <ng-icon
                                name="heroExclamationTriangle"
                                class="text-[12px]"
                              ></ng-icon>
                            </div>
                            <p class="text-[14px] font-medium leading-5">
                              Your store will be promoted across Duduzili until it expires on 24
                              March, 2026.
                            </p>
                          </div>

                          <div class="mt-4 grid gap-5 sm:grid-cols-2">
                            @for (store of desktopStorePromotionOptions; track store.id) {
                              <button
                                type="button"
                                (click)="selectedStoreId.set(store.id)"
                                class="overflow-hidden rounded-[24px] border bg-white text-left transition"
                                [class.border-[#6453D9]]="selectedStoreId() === store.id"
                                [style.border-width.px]="selectedStoreId() === store.id ? 2 : 1"
                                [class.border-[#EAEAEA]]="selectedStoreId() !== store.id"
                              >
                                <div class="relative h-[158px] overflow-hidden rounded-t-[20px]">
                                  <img
                                    [ngSrc]="store.coverImage"
                                    [alt]="store.name"
                                    width="280"
                                    height="158"
                                    class="h-full w-full object-cover"
                                  />
                                  <div
                                    class="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0.54%,rgba(255,255,255,0.12)_39%,rgba(255,255,255,0.96)_93.47%)]"
                                  ></div>
                                  <span
                                    class="absolute right-[10px] top-[10px] inline-flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white/20 backdrop-blur-[2px]"
                                    [class.border-[#8E79F8]]="selectedStoreId() === store.id"
                                    [class.border-white/70]="selectedStoreId() !== store.id"
                                    aria-hidden="true"
                                  >
                                    @if (selectedStoreId() === store.id) {
                                      <span class="h-3 w-3 rounded-full bg-[#6453D9] shadow-[0_0_0_2px_rgba(255,255,255,0.55)]"></span>
                                    }
                                  </span>
                                </div>

                                <div class="relative px-[18px] pb-[18px] pt-0">
                                  <div class="-mt-[37px]">
                                    <img
                                      [ngSrc]="store.logoImage"
                                      [alt]="store.name + ' logo'"
                                      width="74"
                                      height="74"
                                      class="h-[74px] w-[74px] rounded-full border-4 border-white object-cover shadow-[0_8px_18px_rgba(0,0,0,0.12)]"
                                    />
                                  </div>

                                  <div class="mt-[7px] space-y-0.5">
                                    <div class="flex items-center gap-1">
                                      <p class="truncate text-[16px] font-medium leading-6 text-[#1F1F1F]">
                                        {{ store.name }}
                                      </p>
                                      <img
                                        ngSrc="/assets/icons/store-filled-verify-desktop.svg"
                                        width="14"
                                        height="14"
                                        alt=""
                                        class="h-[14px] w-[14px] shrink-0"
                                      />
                                    </div>

                                    <div class="flex items-center gap-1 text-[14px] text-[#777777]">
                                      <span class="h-[14px] w-[14px] rounded-[4px] border border-[#B3B3B3]"></span>
                                      <span>{{ store.activeListings }}</span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            }
                          </div>
                        </section>
                      </section>

                      <aside class="rounded-[28px] bg-[#FAFAFA] px-[11px] pb-5 pt-4">
                        <h3 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">Preview</h3>
                        <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                          This is how your store ad will appear to buyers
                        </p>

                        <div class="mt-[18px] flex items-center justify-center gap-3">
                          <button
                            type="button"
                            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E7E7] bg-white text-[#5B5B5B]"
                            aria-label="Desktop preview"
                          >
                            <span class="h-[14px] w-[18px] rounded-[4px] border border-current"></span>
                          </button>
                          <button
                            type="button"
                            class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E7E7] bg-white text-[#5B5B5B]"
                            aria-label="Mobile preview"
                          >
                            <span class="h-[16px] w-[9px] rounded-[3px] border border-current"></span>
                          </button>
                        </div>

                        <div class="mt-[14px] rounded-[22px] bg-white px-[14px] pb-[16px] pt-[12px]">
                          <div class="overflow-hidden rounded-[16px] border border-[#F1F1F1] bg-white">
                            <div class="flex items-center justify-between bg-[#1D1E22] px-3 py-[5px]">
                              <div class="flex items-center gap-2">
                                <div class="h-[6px] w-[6px] rounded-full bg-white"></div>
                                <span class="text-[6px] font-bold text-white">Duduzili</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <div class="h-[4px] w-[58px] rounded-full bg-white/25"></div>
                                <div class="h-[8px] w-[20px] rounded-full bg-white"></div>
                              </div>
                            </div>

                            <div class="bg-white px-3 pb-3 pt-[10px]">
                              <div class="grid grid-cols-4 gap-[10px] opacity-25 blur-[4px]">
                                @for (item of [1, 2, 3, 4, 5, 6, 7, 8]; track item) {
                                  <div class="space-y-1.5">
                                    <div class="aspect-[0.88] rounded-[8px] bg-[#ECECEC]"></div>
                                    <div class="h-[4px] rounded-full bg-[#ECECEC]"></div>
                                    <div class="h-[4px] w-2/3 rounded-full bg-[#ECECEC]"></div>
                                  </div>
                                }
                              </div>

                              <div class="mt-5">
                                <p class="text-[6px] font-semibold text-[#6E7076]">Featured stores</p>
                                <div class="mt-2 grid grid-cols-4 gap-[6px]">
                                  @for (store of desktopStorePromotionOptions; track store.id) {
                                    <div class="h-[32px] overflow-hidden rounded-[6px] bg-[#F5F7FB]">
                                      <img
                                        [ngSrc]="store.coverImage"
                                        [alt]="store.name"
                                        width="64"
                                        height="32"
                                        class="h-full w-full object-cover opacity-75"
                                      />
                                    </div>
                                  }
                                </div>
                              </div>

                              <div class="mt-5 grid grid-cols-[1.2fr_0.95fr] gap-4">
                                <div>
                                  <div class="h-[6px] w-12 rounded-full bg-[#1A1B1D]"></div>
                                  <div class="mt-2 space-y-1 opacity-45">
                                    <div class="h-[4px] w-20 rounded-full bg-[#DADCE2]"></div>
                                    <div class="h-[4px] w-12 rounded-full bg-[#DADCE2]"></div>
                                  </div>
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                  <div class="space-y-1.5 opacity-45">
                                    <div class="h-[5px] w-8 rounded-full bg-[#1A1B1D]"></div>
                                    <div class="h-[4px] w-6 rounded-full bg-[#DADCE2]"></div>
                                    <div class="h-[4px] w-6 rounded-full bg-[#DADCE2]"></div>
                                  </div>
                                  <div class="space-y-1.5 opacity-45">
                                    <div class="h-[5px] w-10 rounded-full bg-[#1A1B1D]"></div>
                                    <div class="h-[4px] w-7 rounded-full bg-[#DADCE2]"></div>
                                    <div class="h-[4px] w-6 rounded-full bg-[#DADCE2]"></div>
                                  </div>
                                </div>
                              </div>

                              <div
                                class="mt-4 h-[78px] rounded-b-[16px] bg-[linear-gradient(180deg,rgba(123,106,217,0)_32.62%,rgba(123,106,217,0.2)_100%),linear-gradient(90deg,#fff_0%,#fff_100%)]"
                              >
                                <div
                                  class="pt-4 text-center text-[40px] font-extrabold tracking-[2px] text-[#EFEAFD] shadow-[0_2px_4px_rgba(169,169,169,0.25)]"
                                >
                                  Duduzili
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </aside>
                    </div>

                  </div>
                } @else if (step() === 'listing-success') {
                  <div
                    class="flex min-h-[640px] flex-col items-center justify-center px-6 text-center"
                  >
                    <img
                      ngSrc="assets/images/listing-success-desktop-figma.png"
                      alt="Listing promotion success"
                      width="512"
                      height="512"
                      class="h-[180px] w-[180px] object-contain"
                    />

                    <div class="mt-6 flex max-w-[562px] flex-col items-center gap-3">
                      <h2 class="w-full text-[32px] font-semibold leading-[1.1] text-[#0D0D0D]">
                        Listing promotion is now active 🚀
                      </h2>

                      <p class="text-[16px] leading-6 text-[#747474]">
                        Your
                        <span class="font-medium text-[#252525]">
                          {{ ' ' + selectedListingIds().length + ' listings' }}
                        </span>
                        are now promoted across Search, Categories, and Explore.
                        <br />
                        Promotion ends on
                        <span class="font-medium text-[#040404]"> 27 April 2026.</span>
                      </p>
                    </div>

                    <div class="mt-8 flex items-center gap-2">
                      <button
                        type="button"
                        (click)="resetListingFlow()"
                        class="flex h-[44px] items-center justify-center rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A] transition hover:bg-[#ECECEC] focus:outline-none focus:ring-4 focus:ring-gray-200"
                      >
                        Promote another listing
                      </button>
                      <button
                        type="button"
                        (click)="close.emit()"
                        class="flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5E4ED1] focus:outline-none focus:ring-4 focus:ring-[#6453D9]/20"
                      >
                        View running Ads
                      </button>
                    </div>
                  </div>
                } @else {
                  <div
                    class="flex min-h-[640px] flex-col items-center justify-center px-6 text-center"
                  >
                    <div class="relative h-[180px] w-[180px]">
                      <div
                        class="absolute left-1/2 top-[24px] h-[36px] w-[48px] -translate-x-1/2 rounded-t-[12px] bg-[#FF6B42]"
                      ></div>
                      <div class="absolute left-1/2 top-[24px] flex -translate-x-1/2">
                        <span class="h-[44px] w-[14px] rounded-b-[14px] bg-[#FF5A36]"></span>
                        <span class="h-[44px] w-[14px] rounded-b-[14px] bg-[#FFB33C]"></span>
                        <span class="h-[44px] w-[14px] rounded-b-[14px] bg-[#FF3E28]"></span>
                        <span class="h-[44px] w-[14px] rounded-b-[14px] bg-[#FFB33C]"></span>
                        <span class="h-[44px] w-[14px] rounded-b-[14px] bg-[#FF6B42]"></span>
                      </div>
                      <div
                        class="absolute left-1/2 top-[54px] h-[110px] w-[84px] -translate-x-1/2 rounded-[14px] bg-linear-to-b from-[#8A798B] to-[#6C5A74]"
                      ></div>
                      <div
                        class="absolute left-1/2 top-[76px] h-[60px] w-[62px] -translate-x-1/2 rounded-[8px] bg-[#F7F1FF]"
                      ></div>
                      <div
                        class="absolute left-1/2 top-[90px] flex h-[36px] w-[71px] -translate-x-1/2 items-center justify-center gap-1 rounded-[6px] bg-[linear-gradient(291deg,#B20E0E_2.19%,#FF8989_97.71%)] px-1"
                      >
                        <span class="h-[6px] w-[6px] rounded-full bg-white/90"></span>
                        <span class="text-[14px] font-bold text-white">ACTIVE</span>
                      </div>
                      <div
                        class="absolute left-1/2 top-[156px] h-[10px] w-[28px] -translate-x-1/2 rounded-full border border-white/10 bg-[#75617D]"
                      ></div>
                    </div>

                    <div class="mt-8 flex w-full max-w-[546px] flex-col items-center gap-3">
                      <h2 class="w-full text-[32px] font-semibold leading-[1.1] text-[#0D0D0D]">
                        Store promotion is now active 🚀
                      </h2>

                      <p class="max-w-[536px] text-[16px] leading-6 text-[#747474]">
                        Your store
                        <span class="font-medium text-[#252525]"> {{ selectedStoreName() }}</span>
                        is now promoted across Duduzili.
                        <br />
                        Promotion ends on
                        <span class="font-medium text-[#040404]"> 27 April 2026.</span>
                      </p>
                    </div>

                    <div class="mt-8 flex items-center gap-2">
                      <button
                        type="button"
                        (click)="resetStoreFlow()"
                        class="flex h-[44px] items-center justify-center rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A] transition hover:bg-[#ECECEC] focus:outline-none focus:ring-4 focus:ring-gray-200"
                      >
                        Create another Ad
                      </button>
                      <button
                        type="button"
                        (click)="close.emit()"
                        class="flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5E4ED1] focus:outline-none focus:ring-4 focus:ring-[#6453D9]/20"
                      >
                        View running Ads
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>

            @if (step() !== 'listing-success' && step() !== 'store-success') {
              <footer class="border-t border-[#F1F2F4] px-6 py-5 lg:px-10">
                @if (step() === 'configure-listing') {
                  <div class="mx-auto flex max-w-[996px] items-center justify-end gap-2">
                    <button
                      type="button"
                      (click)="step.set('type')"
                      class="h-[44px] rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="completeListingPromotion()"
                      class="h-10 rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                    >
                      Promote Listing(s)
                    </button>
                  </div>
                } @else {
                  <div class="mx-auto flex max-w-[980px] items-center justify-between">
                    @if (step() === 'configure-store') {
                      <button
                        type="button"
                        (click)="step.set('type')"
                        class="rounded-full bg-[#F2F3F5] px-7 py-3 text-[15px] font-semibold text-[#2F333B] transition hover:bg-[#E8EAF0] focus:outline-none focus:ring-4 focus:ring-gray-200"
                      >
                        Back
                      </button>
                    } @else {
                      <span></span>
                    }

                    <button
                      type="button"
                      (click)="onPrimaryAction()"
                      class="rounded-full bg-[#6653E4] px-7 py-3 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
                    >
                      {{ primaryActionLabel() }}
                    </button>
                  </div>
                }
              </footer>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateAdTypeModalComponent {
  private readonly mobileOverlayService = inject(MobileOverlayService);

  readonly close = output<void>();
  readonly continue = output<CreateAdType>();
  readonly promoteListing = output<string[]>();
  readonly promoteStore = output<string>();

  readonly selectedType = signal<CreateAdType>('listing');
  readonly step = signal<
    | 'type'
    | 'configure-listing'
    | 'mobile-listing-picker'
    | 'configure-store'
    | 'store-preview'
    | 'listing-success'
    | 'store-success'
  >('type');
  readonly selectedListingCategory = signal<'automobiles' | 'properties' | 'others'>('others');
  readonly selectedListingIds = signal<string[]>([
    'listing-1',
    'listing-2',
    'listing-3',
    'listing-4',
  ]);
  readonly selectedStoreId = signal('store-promo-vine');
  readonly listingSearch = signal('');
  readonly isStoreFilterOpen = signal(false);
  readonly mobileSelectedStoreIds = signal<string[]>([]);
  readonly desktopListingCategoryFilter = signal<'all' | 'phones-laptops' | 'electronics' | 'mens-fashion' | 'womens-fashion' | 'cars' | 'real-estate'>('all');
  readonly desktopListingStoreFilter = signal<'all' | 'vine' | 'eden' | 'amazing' | 'personal'>('all');
  readonly desktopListingSelectionFilter = signal<'all' | 'selected' | 'not-selected'>('all');

  readonly listingCategories = [
    { id: 'automobiles' as const, label: 'Automobiles (1 left)' },
    { id: 'properties' as const, label: 'Properties (1 left)' },
    { id: 'others' as const, label: 'Others (6 left)' },
  ];

  readonly listings: ListingItem[] = [
    {
      id: 'listing-1',
      kind: 'others',
      name: 'Iphone 17 pro max',
      categoryKey: 'phones-laptops',
      categoryLabel: 'Phones & Laptops',
      price: '₦2,500,000.00',
      storeKey: 'vine',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'assets/images/listing-iphone-17-pro-max-figma.png',
    },
    {
      id: 'listing-2',
      kind: 'others',
      name: 'Logitech ergonomic mouse',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      price: '₦2,500,000.00',
      storeKey: 'eden',
      store: 'Eden Organics',
      storeInitial: 'E',
      storeTone: 'linear-gradient(135deg, #09270B 0%, #52D86B 100%)',
      image: 'assets/images/listing-logitech-mouse-figma.png',
    },
    {
      id: 'listing-3',
      kind: 'others',
      name: 'Nike sneaker',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      price: '₦2,500,000.00',
      storeKey: 'amazing',
      store: 'Amazing Fragrances',
      storeInitial: 'A',
      storeTone: 'linear-gradient(135deg, #FFC935 0%, #F39A00 100%)',
      image: 'assets/images/listing-nike-sneaker-figma.png',
    },
    {
      id: 'listing-4',
      kind: 'others',
      name: 'Bone straight wig',
      categoryKey: 'womens-fashion',
      categoryLabel: 'Women’s fashion',
      price: '₦2,500,000.00',
      storeKey: 'personal',
      store: 'Personal account',
      storeInitial: 'P',
      storeTone: 'linear-gradient(135deg, #5D8FE9 0%, #D85F5F 100%)',
      image: 'assets/images/listing-bone-straight-wig-figma.png',
    },
    {
      id: 'listing-5',
      kind: 'others',
      name: 'Sweatshirt',
      categoryKey: 'mens-fashion',
      categoryLabel: 'Men’s fashion',
      price: '₦2,500,000.00',
      storeKey: 'vine',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'assets/images/listing-sweatshirt-figma.png',
    },
    {
      id: 'listing-6',
      kind: 'others',
      name: 'RGB keyboard',
      categoryKey: 'electronics',
      categoryLabel: 'Electronics',
      price: '₦2,500,000.00',
      storeKey: 'personal',
      store: 'Personal account',
      storeInitial: 'P',
      storeTone: 'linear-gradient(135deg, #5D8FE9 0%, #D85F5F 100%)',
      image: 'assets/images/listing-rgb-keyboard-figma.png',
    },
    {
      id: 'listing-7',
      kind: 'automobiles',
      name: 'Mercedes GLE',
      categoryKey: 'cars',
      categoryLabel: 'Cars',
      price: '₦145,000,000.00',
      storeKey: 'vine',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-8',
      kind: 'properties',
      name: '2-bedroom apartment',
      categoryKey: 'real-estate',
      categoryLabel: 'Real estate',
      price: '₦25,000,000.00',
      storeKey: 'eden',
      store: 'Eden Organics',
      storeInitial: 'E',
      storeTone: 'linear-gradient(135deg, #09270B 0%, #52D86B 100%)',
      image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=160&h=160&fit=crop',
    },
  ];

  readonly stores: StoreItem[] = [
    {
      id: 'store-1',
      name: 'The Vine Collections',
      image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=640&h=360&fit=crop',
      logoTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      logoLabel: 'V',
      activeListings: '43 active listings',
    },
    {
      id: 'store-2',
      name: 'Eden Organics',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=640&h=360&fit=crop',
      logoTone: 'linear-gradient(135deg, #101713 0%, #83D95E 100%)',
      logoLabel: 'E',
      activeListings: '43 active listings',
    },
    {
      id: 'store-3',
      name: 'Personal account',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=640&h=360&fit=crop',
      logoTone: 'linear-gradient(135deg, #5D8FE9 0%, #D85F5F 100%)',
      logoLabel: 'P',
      activeListings: '43 active listings',
    },
    {
      id: 'store-4',
      name: 'Amazing Fragrances',
      image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=640&h=360&fit=crop',
      logoTone: 'linear-gradient(135deg, #FFC935 0%, #F39A00 100%)',
      logoLabel: 'A',
      activeListings: '43 active listings',
    },
  ];

  readonly desktopStorePromotionOptions: readonly StorePromotionOption[] = [
    {
      id: 'store-promo-vine',
      name: 'The Vine Collections',
      coverImage: '/assets/images/store-vine-cover-desktop.png',
      logoImage: '/assets/images/store-vine-logo-desktop.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-newage',
      name: 'New Age Properties',
      coverImage: '/assets/images/store-newage-cover-desktop.png',
      logoImage: '/assets/images/store-newage-logo-desktop.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-snap',
      name: 'Snap Thrifts',
      coverImage: '/assets/images/store-snap-cover-desktop.png',
      logoImage: '/assets/images/store-snap-logo-desktop.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-gomelon',
      name: 'goMelon',
      coverImage: '/assets/images/store-gomelon-cover-desktop.png',
      logoImage: '/assets/images/store-gomelon-logo-desktop.png',
      activeListings: '43 active listings',
    },
  ];

  readonly mobileStorePromotionOptions: readonly StorePromotionOption[] = [
    {
      id: 'store-promo-vine',
      name: 'The Vine Collections',
      coverImage: '/assets/images/store-vine-cover-mobile.png',
      logoImage: '/assets/images/store-vine-logo-mobile.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-eden',
      name: 'Eden Organics',
      coverImage: '/assets/images/store-eden-cover-mobile.png',
      logoImage: '/assets/images/store-eden-logo-mobile.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-snap',
      name: 'Snap Thrifts',
      coverImage: '/assets/images/store-snap-cover-mobile.png',
      logoImage: '/assets/images/store-snap-logo-mobile.png',
      activeListings: '43 active listings',
    },
    {
      id: 'store-promo-gomelon',
      name: 'goMelon',
      coverImage: '/assets/images/store-gomelon-cover-mobile.png',
      logoImage: '/assets/images/store-gomelon-logo-mobile.png',
      activeListings: '43 active listings',
    },
  ];

  readonly selectedPromotedStore = computed(
    () =>
      [
        ...this.desktopStorePromotionOptions,
        ...this.mobileStorePromotionOptions,
      ].find((store) => store.id === this.selectedStoreId()) ?? this.desktopStorePromotionOptions[0],
  );

  readonly filteredListings = computed(() =>
    this.listings.filter((listing) => {
      if (listing.kind !== this.selectedListingCategory()) {
        return false;
      }

      const matchesCategory =
        this.desktopListingCategoryFilter() === 'all'
        || listing.categoryKey === this.desktopListingCategoryFilter();
      const matchesStore =
        this.desktopListingStoreFilter() === 'all'
        || listing.storeKey === this.desktopListingStoreFilter();
      const matchesSelection =
        this.desktopListingSelectionFilter() === 'all'
        || (this.desktopListingSelectionFilter() === 'selected'
          && this.selectedListingIds().includes(listing.id))
        || (this.desktopListingSelectionFilter() === 'not-selected'
          && !this.selectedListingIds().includes(listing.id));

      return matchesCategory && matchesStore && matchesSelection;
    }),
  );

  readonly desktopListingCategoryOptions: readonly CustomDropdownOption<'all' | 'phones-laptops' | 'electronics' | 'mens-fashion' | 'womens-fashion' | 'cars' | 'real-estate'>[] = [
    { value: 'all', label: 'All categories' },
    { value: 'phones-laptops', label: 'Phones & Laptops' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'mens-fashion', label: 'Men’s fashion' },
    { value: 'womens-fashion', label: 'Women’s fashion' },
    { value: 'cars', label: 'Cars' },
    { value: 'real-estate', label: 'Real estate' },
  ];

  readonly desktopListingStoreOptions: readonly CustomDropdownOption<'all' | 'vine' | 'eden' | 'amazing' | 'personal'>[] = [
    { value: 'all', label: 'All stores' },
    { value: 'vine', label: 'The Vine Collections' },
    { value: 'eden', label: 'Eden Organics' },
    { value: 'amazing', label: 'Amazing Fragrances' },
    { value: 'personal', label: 'Personal account' },
  ];

  readonly desktopListingSelectionOptions: readonly CustomDropdownOption<'all' | 'selected' | 'not-selected'>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'selected', label: 'Selected' },
    { value: 'not-selected', label: 'Not selected' },
  ];

  readonly mobilePickerListings = computed(() => {
    const query = this.listingSearch().trim().toLowerCase();
    const activeStoreFilters = this.mobileSelectedStoreIds();

    return this.filteredListings().filter((listing) => {
      const matchesQuery =
        query.length === 0 ||
        listing.name.toLowerCase().includes(query) ||
        listing.store.toLowerCase().includes(query);
      const matchesStore =
        activeStoreFilters.length === 0 ||
        activeStoreFilters.includes(this.storeIdForListing(listing.store));

      return matchesQuery && matchesStore;
    });
  });

  readonly selectedListingCards = computed(() =>
    this.listings.filter((listing) => this.selectedListingIds().includes(listing.id)),
  );

  readonly mobileFilterStores = computed(() =>
    this.stores.filter((store) =>
      this.filteredListings().some((listing) => this.storeIdForListing(listing.store) === store.id),
    ),
  );

  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly appToastService = inject(AppToastService);

  selectAdType(option: AdTypeOption): void {
    if (option.disabled) {
      this.appToastService.show({
        message: 'Upgrade your plan to access this feature.',
      });
      return;
    }
    this.selectedType.set(option.id);
  }

  readonly adTypeOptions = computed(() => {
    const status = this.sellerMonetizationService.subscriptionStatus();
    const features = status?.features;

    const list: AdTypeOption[] = [];

    // 1. Promote a Listing
    const automobileLimit = features?.listing_promotions?.automobile;
    const propertyLimit = features?.listing_promotions?.property;
    const otherLimit = features?.listing_promotions?.other;
    const autoRemaining = (automobileLimit?.max ?? 0) - (automobileLimit?.used ?? 0);
    const propertyRemaining = (propertyLimit?.max ?? 0) - (propertyLimit?.used ?? 0);
    const otherRemaining = (otherLimit?.max ?? 0) - (otherLimit?.used ?? 0);
    const totalListingRemaining = autoRemaining + propertyRemaining + otherRemaining;
    const listingDisabled = !((automobileLimit?.max ?? 0) > 0 || (propertyLimit?.max ?? 0) > 0 || (otherLimit?.max ?? 0) > 0);

    list.push({
      id: 'listing',
      title: 'Promote a Listing',
      badge: listingDisabled ? 'Not supported on your plan' : `${totalListingRemaining} promotions left`,
      descriptionLeft: ['Get more views on your listing', 'Appear higher in search results'],
      descriptionRight: [
        'Reach buyers searching in your category',
        'Increase chances of selling faster',
      ],
      artTone: 'linear-gradient(135deg, #F1ECFF 0%, #E8F0FF 100%)',
      cardTone: 'linear-gradient(135deg, #DAD3FF 0%, #EEF2FF 100%)',
      disabled: listingDisabled,
    });

    // 2. Promote Your Store
    const storeLimit = features?.store_promotions;
    const storeRemaining = (storeLimit?.max ?? 0) - (storeLimit?.used ?? 0);
    const storeDisabled = !((storeLimit?.max ?? 0) > 0);

    list.push({
      id: 'store',
      title: 'Promote Your Store',
      badge: storeDisabled ? 'Not supported on your plan' : `${storeRemaining} promotions left`,
      descriptionLeft: [
        'Feature your store to more buyers',
        'Grow your followers/returning customers',
      ],
      descriptionRight: [
        'Drive traffic to all your listings',
        'Build credibility and brand awareness',
      ],
      artTone: 'linear-gradient(135deg, #FFF7EA 0%, #FDEACB 100%)',
      cardTone: 'linear-gradient(135deg, #FFE2A9 0%, #FFF3D7 100%)',
      disabled: storeDisabled,
    });

    // 3. Create a Banner Ad
    const imageBannerLimit = features?.banner_ads?.image;
    const videoBannerLimit = features?.banner_ads?.video;
    const bannerRemaining = ((imageBannerLimit?.max ?? 0) - (imageBannerLimit?.used ?? 0)) +
                            ((videoBannerLimit?.max ?? 0) - (videoBannerLimit?.used ?? 0));
    const bannerDisabled = !((imageBannerLimit?.max ?? 0) > 0 || (videoBannerLimit?.max ?? 0) > 0);

    list.push({
      id: 'banner',
      title: 'Create a Banner Ad',
      badge: bannerDisabled ? 'Not supported on your plan' : `${bannerRemaining} promotions left`,
      descriptionLeft: [
        'Display image or video banners on Duduzili',
        'Direct buyers to your store or listing',
      ],
      descriptionRight: [
        'Capture attention across high-traffic pages',
        'Promote special offers or new products',
      ],
      artTone: 'linear-gradient(135deg, #FFF0F8 0%, #F6E8FF 100%)',
      cardTone: 'linear-gradient(135deg, #FFD3EA 0%, #E5D9FF 100%)',
      disabled: bannerDisabled,
    });

    return list;
  });

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }

  handleBackdropClick(): void {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      this.close.emit();
    }
  }

  onPrimaryAction(): void {
    if (this.step() === 'type') {
      if (this.selectedType() === 'listing') {
        this.step.set('configure-listing');
        return;
      }

      if (this.selectedType() === 'store') {
        this.step.set('configure-store');
        return;
      }

      this.continue.emit(this.selectedType());
      return;
    }

    if (this.step() === 'configure-store') {
      this.promoteStore.emit(this.selectedStoreId());
      this.step.set('store-success');
      return;
    }

    this.completeListingPromotion();
  }

  toggleListingSelection(id: string): void {
    this.selectedListingIds.update((selected) =>
      selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id],
    );
  }

  openListingPicker(): void {
    this.step.set('mobile-listing-picker');
  }

  closeListingPicker(): void {
    this.step.set('configure-listing');
  }

  openStoreFilterSheet(): void {
    this.isStoreFilterOpen.set(true);
  }

  closeStoreFilterSheet(): void {
    this.isStoreFilterOpen.set(false);
  }

  toggleStoreFilter(storeId: string): void {
    this.mobileSelectedStoreIds.update((selected) =>
      selected.includes(storeId)
        ? selected.filter((item) => item !== storeId)
        : [...selected, storeId],
    );
  }

  applyStoreFilters(): void {
    this.isStoreFilterOpen.set(false);
  }

  completeListingPromotion(): void {
    this.promoteListing.emit(this.selectedListingIds());
    this.step.set('listing-success');
  }

  openStorePreview(): void {
    this.step.set('store-preview');
  }

  completeStorePromotion(): void {
    this.promoteStore.emit(this.selectedStoreId());
    this.step.set('store-success');
  }

  resetListingFlow(): void {
    this.step.set('type');
    this.selectedType.set('listing');
    this.listingSearch.set('');
    this.isStoreFilterOpen.set(false);
  }

  resetStoreFlow(): void {
    this.step.set('type');
    this.selectedType.set('store');
    this.selectedStoreId.set('store-promo-vine');
  }

  selectedStoreName(): string {
    return this.selectedPromotedStore().name;
  }

  adTypeArtwork(type: CreateAdType): string {
    switch (type) {
      case 'listing':
        return 'assets/images/create-ad-type-listing-figma.png';
      case 'store':
        return 'assets/images/create-ad-type-store-figma.png';
      default:
        return 'assets/images/create-ad-type-banner-figma.png';
    }
  }

  adTypeArtworkBackground(type: CreateAdType): string {
    switch (type) {
      case 'listing':
        return '#E9E9FF';
      case 'store':
        return '#FFEED7';
      default:
        return '#FFD7ED';
    }
  }

  adTypeMobileDescription(type: CreateAdType): string[] {
    switch (type) {
      case 'listing':
        return [
          'Get more views on your listing',
          'Appear higher in search results',
          'Reach buyers searching in your category',
          'Increase chances of selling faster',
        ];
      case 'store':
        return [
          'Feature your store to more buyers',
          'Drive traffic to all your listings',
          'Grow your followers/returning customers',
          'Build credibility and brand awareness',
        ];
      default:
        return [
          'Display image or video banners on Duduzili',
          'Capture attention across high-traffic pages',
          'Direct buyers to your store or listing',
          'Promote special offers or new products',
        ];
    }
  }

  listingStoreAvatarImage(storeName: string): string | null {
    switch (storeName) {
      case 'Eden Organics':
        return 'assets/images/store-eden-organics-figma.png';
      case 'Amazing Fragrances':
        return 'assets/images/store-amazing-fragrances-figma.png';
      case 'Personal account':
        return 'assets/images/store-personal-account-figma.png';
      default:
        return null;
    }
  }

  listingSelectionLabel(): string {
    return this.selectedListingIds().length > 0 ? 'Select listing' : 'Choose listing';
  }

  primaryActionLabel(): string {
    if (this.step() === 'type') {
      return 'Continue';
    }

    if (this.step() === 'configure-store') {
      return 'Promote store';
    }

    return 'Promote Listing(s)';
  }

  private storeIdForListing(storeName: string): string {
    return this.stores.find((store) => store.name === storeName)?.id ?? 'store-3';
  }
}
