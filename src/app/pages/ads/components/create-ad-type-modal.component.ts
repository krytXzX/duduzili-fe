import { ChangeDetectionStrategy, Component, computed, inject, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroXMark,
  heroChevronDown,
  heroMagnifyingGlass,
  heroExclamationTriangle,
  heroAdjustmentsHorizontal,
} from '@ng-icons/heroicons/outline';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

export type CreateAdType = 'listing' | 'store' | 'banner';

interface AdTypeOption {
  id: CreateAdType;
  title: string;
  badge: string;
  descriptionLeft: string[];
  descriptionRight: string[];
  artTone: string;
  cardTone: string;
}

interface ListingItem {
  id: string;
  kind: 'automobiles' | 'properties' | 'others';
  name: string;
  categoryLabel: string;
  price: string;
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

@Component({
  selector: 'app-create-ad-type-modal',
  imports: [CommonModule, NgIcon],
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
            <header class="px-5 pt-4">
              <div class="flex items-center justify-between text-[#1F2230]">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="close.emit()"
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#4A4F5E]"
                    aria-label="Close create ad"
                  >
                    <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                  </button>
                  <h1 class="text-[16px] font-medium">Create Ad</h1>
                </div>

                <button
                  type="button"
                  class="text-[11px] font-medium text-[#A3A7B4]"
                  disabled
                >
                  Preview
                </button>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6B5CF0]"></span>
                <span class="h-[2px] rounded-full bg-[#E8E8EC]"></span>
              </div>
            </header>

            <div class="flex-1 overflow-y-auto px-4 pt-5 pb-6">
              <h2 class="text-[16px] font-semibold leading-tight tracking-[-0.03em] text-[#232632]">Select Ad type</h2>
              <p class="mt-1 text-[11px] text-[#8F95A3]">
                Choose the type of advertisement you want to create
              </p>

              <div class="mt-4 space-y-4">
                @for (option of adTypeOptions; track option.id) {
                  <button
                    type="button"
                    (click)="selectedType.set(option.id)"
                    class="grid w-full grid-cols-[minmax(0,1fr)_86px] gap-3 rounded-[18px] border px-3 py-3 text-left transition"
                    [class.border-[#6B5CF0]]="selectedType() === option.id"
                    [class.bg-[#FBFAFF]]="selectedType() === option.id"
                    [class.border-[#EBEDF2]]="selectedType() !== option.id"
                  >
                    <div class="min-w-0">
                      <div class="flex items-start justify-between gap-3">
                        <h3 class="text-[15px] font-semibold text-[#21242D]">{{ option.title }}</h3>
                        <span class="shrink-0 rounded-full bg-[#F2F5A7] px-2 py-0.5 text-[9px] font-bold text-[#6A6B1F]">
                          {{ option.badge }}
                        </span>
                      </div>

                      <div class="mt-3 grid gap-2 text-[10px] leading-4 text-[#8E94A1]">
                        @for (item of option.descriptionLeft; track item) {
                          <div class="flex items-start gap-2">
                            <span class="mt-1.5 h-1 w-1 rounded-full bg-[#7C6AF3]"></span>
                            <span>{{ item }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <div class="relative h-[86px] overflow-hidden rounded-[16px]" [style.background]="option.artTone">
                      <div class="absolute inset-0 flex items-end justify-end p-3">
                        <div
                          class="relative h-[54px] w-[54px] rounded-[14px] border border-white/50 shadow-[0_18px_24px_-18px_rgba(0,0,0,0.25)]"
                          [style.background]="option.cardTone"
                        >
                          @switch (option.id) {
                            @case ('listing') {
                              <div class="absolute left-3 top-4 h-5 w-5 rounded-[7px] bg-[#6B5CF0]/90"></div>
                              <div class="absolute left-5 top-1 h-6 w-6 rounded-[7px] bg-[#FFD35B] rotate-[18deg]"></div>
                              <div class="absolute right-2.5 bottom-2.5 h-4 w-6 rounded-[8px] bg-white/85"></div>
                            }
                            @case ('store') {
                              <div class="absolute left-3 top-4 h-4 w-8 rounded-t-[8px] bg-[#FF8B31]"></div>
                              <div class="absolute left-3 top-8 h-5 w-8 rounded-b-[8px] bg-[#6DDA71]"></div>
                              <div class="absolute left-[17px] top-2 h-3 w-1.5 rounded bg-[#FF5C52]"></div>
                              <div class="absolute left-[23px] top-2 h-3 w-1.5 rounded bg-[#FFD35B]"></div>
                              <div class="absolute left-[29px] top-2 h-3 w-1.5 rounded bg-[#FF5C52]"></div>
                            }
                            @default {
                              <div class="absolute inset-x-2.5 top-3 h-6 rounded-[8px] bg-[#66C6FF]"></div>
                              <div class="absolute inset-x-4 top-5 h-7 rounded-[8px] bg-[#FFF1A5]"></div>
                              <div class="absolute left-4 top-8 h-3 w-3 rotate-[12deg] rounded-[4px] bg-white/85"></div>
                              <div class="absolute right-4 top-8 h-3 w-3 rounded-[4px] bg-[#FFB548]"></div>
                            }
                          }
                        </div>
                      </div>
                    </div>
                  </button>
                }
              </div>
            </div>

            <footer class="border-t border-[#F1F2F4] px-4 py-4">
              <button
                type="button"
                (click)="onPrimaryAction()"
                class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
              >
                Continue
              </button>
            </footer>
          } @else if (step() === 'configure-listing') {
            <header class="px-5 pt-4">
              <div class="flex items-center justify-between text-[#1F2230]">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="step.set('type')"
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#4A4F5E]"
                    aria-label="Back"
                  >
                    <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                  </button>
                  <h1 class="text-[16px] font-medium">Create Ad</h1>
                </div>

                <button
                  type="button"
                  class="text-[11px] font-medium text-[#A3A7B4]"
                  disabled
                >
                  Preview
                </button>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6B5CF0]"></span>
                <span class="h-[2px] rounded-full bg-[#6B5CF0]"></span>
              </div>
            </header>

            <div class="flex-1 overflow-y-auto px-4 pt-5 pb-6">
              <h2 class="text-[16px] font-semibold leading-tight tracking-[-0.03em] text-[#232632]">Select a Listing to promote</h2>
              <p class="mt-1 text-[11px] text-[#8F95A3]">
                Select a listing and set your promotion preferences
              </p>

              <section class="mt-5">
                <h3 class="text-[13px] font-semibold text-[#232632]">Choose listing category</h3>
                <div class="mt-3 flex flex-wrap gap-2.5">
                  @for (category of listingCategories; track category.id) {
                    <button
                      type="button"
                      (click)="selectedListingCategory.set(category.id)"
                      class="rounded-full border px-3 py-2 text-[11px] font-medium transition"
                      [class.border-[#6B5CF0]]="selectedListingCategory() === category.id"
                      [class.bg-[#FBFAFF]]="selectedListingCategory() === category.id"
                      [class.text-[#4F42A4]]="selectedListingCategory() === category.id"
                      [class.border-[#E7E9F0]]="selectedListingCategory() !== category.id"
                      [class.text-[#686E7A]]="selectedListingCategory() !== category.id"
                    >
                      {{ category.label }}
                    </button>
                  }
                </div>
              </section>

              <section class="mt-5">
                <h3 class="text-[13px] font-semibold text-[#232632]">Select listing to promote</h3>

                <div class="mt-3 flex items-start gap-3 rounded-[14px] bg-[#FFFBE5] px-4 py-3 text-[#59592E]">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                    <ng-icon name="heroExclamationTriangle" class="text-[12px]"></ng-icon>
                  </div>
                  <p class="text-[11px] font-medium leading-4">
                    Your listing will be promoted across Duduzili until it expires on 24 March, 2026.
                  </p>
                </div>

                <button
                  type="button"
                  (click)="openListingPicker()"
                  class="mt-4 flex w-full items-center justify-between rounded-[12px] border border-[#E7E9F0] bg-white px-4 py-3 text-left"
                >
                  <span class="text-[11px] text-[#A0A5B1]">{{ listingSelectionLabel() }}</span>
                  <ng-icon name="heroChevronDown" class="text-[14px] text-[#8D93A0]"></ng-icon>
                </button>

                @if (selectedListingCards().length > 0) {
                  <div class="mt-4 flex flex-wrap gap-2 rounded-[16px] bg-[#FAFAFC] p-3">
                    @for (listing of selectedListingCards(); track listing.id) {
                      <div class="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-2.5 py-1.5 shadow-[0_8px_16px_-14px_rgba(17,24,39,0.45)]">
                        <img [src]="listing.image" [alt]="listing.name" class="h-6 w-6 rounded-full object-cover">
                        <span class="max-w-[72px] truncate text-[10px] font-medium text-[#333843]">{{ listing.name }}</span>
                        <button
                          type="button"
                          (click)="toggleListingSelection(listing.id)"
                          class="text-[11px] text-[#7A808C]"
                          aria-label="Remove {{ listing.name }}"
                        >
                          ×
                        </button>
                      </div>
                    }
                  </div>
                }
              </section>
            </div>

            <footer class="border-t border-[#F1F2F4] px-4 py-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="step.set('type')"
                  class="rounded-full bg-[#F2F3F5] px-5 py-4 text-[14px] font-semibold text-[#2F333B]"
                >
                  Back
                </button>
                <button
                  type="button"
                  (click)="completeListingPromotion()"
                  class="rounded-full bg-[#6653E4] px-5 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  Promote Listing(s)
                </button>
              </div>
            </footer>
          } @else if (step() === 'mobile-listing-picker') {
            <div class="flex flex-1 flex-col">
              <header class="px-4 pt-4">
                <div class="h-1 w-14 rounded-full bg-[#E7E7EA] mx-auto"></div>

                <div class="mt-4 flex items-center justify-between gap-3 rounded-full bg-[#F6F7FA] px-4 py-3">
                  <div class="flex min-w-0 flex-1 items-center gap-2">
                    <ng-icon name="heroMagnifyingGlass" class="text-[14px] text-[#9EA4B0]"></ng-icon>
                    <input
                      type="text"
                      [value]="listingSearch()"
                      (input)="listingSearch.set(($any($event.target).value ?? '').toString())"
                      placeholder="Search"
                      class="w-full bg-transparent text-[12px] text-[#2A2D34] outline-none placeholder:text-[#AAB0BC]"
                    >
                  </div>

                  <button
                    type="button"
                    (click)="openStoreFilterSheet()"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#4B4F57]"
                    aria-label="Filter listings by store"
                  >
                    <ng-icon name="heroAdjustmentsHorizontal" class="text-[16px]"></ng-icon>
                  </button>
                </div>
              </header>

              <div class="flex-1 overflow-y-auto px-4 pt-4 pb-5">
                <div class="space-y-4">
                  @for (listing of mobilePickerListings(); track listing.id) {
                    <button
                      type="button"
                      (click)="toggleListingSelection(listing.id)"
                      class="flex w-full items-start gap-3 text-left"
                    >
                      <img [src]="listing.image" [alt]="listing.name" class="h-10 w-10 rounded-[10px] object-cover">

                      <div class="min-w-0 flex-1">
                        <p class="truncate text-[13px] font-medium text-[#262A33]">{{ listing.name }}</p>
                        <p class="mt-0.5 text-[10px] text-[#A1A6B1]">{{ listing.store }}</p>
                      </div>

                      <span
                        class="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-[5px] border"
                        [class.border-[#6B5CF0]]="selectedListingIds().includes(listing.id)"
                        [class.bg-[#6B5CF0]]="selectedListingIds().includes(listing.id)"
                        [class.border-[#D9DCE3]]="!selectedListingIds().includes(listing.id)"
                        [class.bg-white]="!selectedListingIds().includes(listing.id)"
                      >
                        @if (selectedListingIds().includes(listing.id)) {
                          <span class="text-[11px] font-bold text-white">✓</span>
                        }
                      </span>
                    </button>
                  }
                </div>
              </div>

              <footer class="border-t border-[#F1F2F4] px-4 py-4">
                <button
                  type="button"
                  (click)="closeListingPicker()"
                  class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  Choose {{ selectedListingIds().length }} listing{{ selectedListingIds().length === 1 ? '' : 's' }}
                </button>
              </footer>
            </div>
          } @else if (step() === 'configure-store') {
            <header class="px-5 pt-4">
              <div class="flex items-center justify-between text-[#1F2230]">
                <div class="flex items-center gap-3">
                  <button
                    type="button"
                    (click)="step.set('type')"
                    class="inline-flex h-6 w-6 items-center justify-center rounded-full text-[#4A4F5E]"
                    aria-label="Back"
                  >
                    <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                  </button>
                  <h1 class="text-[16px] font-medium">Create Ad</h1>
                </div>

                <button
                  type="button"
                  (click)="openStorePreview()"
                  class="text-[11px] font-medium text-[#1F2230] underline underline-offset-2"
                >
                  Preview
                </button>
              </div>

              <div class="mt-5 grid grid-cols-2 gap-2">
                <span class="h-[2px] rounded-full bg-[#6B5CF0]"></span>
                <span class="h-[2px] rounded-full bg-[#6B5CF0]"></span>
              </div>
            </header>

            <div class="flex-1 overflow-y-auto px-4 pt-5 pb-6">
              <h2 class="text-[16px] font-semibold leading-tight tracking-[-0.03em] text-[#232632]">Select a Store to promote</h2>
              <p class="mt-1 text-[11px] text-[#8F95A3]">
                Choose a store and set your promotion preferences
              </p>

              <section class="mt-5">
                <h3 class="text-[13px] font-semibold text-[#232632]">Select store to promote</h3>

                <div class="mt-3 flex items-start gap-3 rounded-[14px] bg-[#FFFBE5] px-4 py-3 text-[#59592E]">
                  <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                    <ng-icon name="heroExclamationTriangle" class="text-[12px]"></ng-icon>
                  </div>
                  <p class="text-[11px] font-medium leading-4">
                    Your store will be promoted across Duduzili until it expires on 24 March, 2026.
                  </p>
                </div>

                <div class="mt-4 space-y-3">
                  @for (store of stores; track store.id) {
                    <button
                      type="button"
                      (click)="selectedStoreId.set(store.id)"
                      class="flex w-full items-center gap-3 rounded-[16px] border bg-white px-3 py-3 text-left transition"
                      [class.border-[#6B5CF0]]="selectedStoreId() === store.id"
                      [class.bg-[#FBFAFF]]="selectedStoreId() === store.id"
                      [class.border-[#E8EAF0]]="selectedStoreId() !== store.id"
                    >
                      <img [src]="store.image" [alt]="store.name" class="h-12 w-12 rounded-full object-cover">

                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-1.5">
                          <p class="truncate text-[13px] font-semibold text-[#24262D]">{{ store.name }}</p>
                          <span class="h-2 w-2 rounded-full bg-[#6B5CF0]"></span>
                        </div>
                        <p class="mt-1 text-[10px] text-[#8A909A]">{{ store.activeListings }}</p>
                      </div>

                      <span
                        class="inline-flex h-5 w-5 items-center justify-center rounded-full border"
                        [class.border-[#6B5CF0]]="selectedStoreId() === store.id"
                        [class.bg-[#6B5CF0]]="selectedStoreId() === store.id"
                        [class.border-[#D9DCE3]]="selectedStoreId() !== store.id"
                        [class.bg-white]="selectedStoreId() !== store.id"
                      >
                        @if (selectedStoreId() === store.id) {
                          <span class="text-[11px] font-bold text-white">✓</span>
                        }
                      </span>
                    </button>
                  }
                </div>
              </section>
            </div>

            <footer class="border-t border-[#F1F2F4] px-4 py-4">
              <div class="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  (click)="step.set('type')"
                  class="rounded-full bg-[#F2F3F5] px-5 py-4 text-[14px] font-semibold text-[#2F333B]"
                >
                  Back
                </button>
                <button
                  type="button"
                  (click)="openStorePreview()"
                  class="rounded-full bg-[#6653E4] px-5 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  Promote store
                </button>
              </div>
            </footer>
          } @else if (step() === 'store-preview') {
            <div class="flex flex-1 flex-col bg-white">
              <div class="px-4 pt-3">
                <div class="mx-auto h-1 w-14 rounded-full bg-[#E7E7EA]"></div>

                <div class="relative mt-4 flex items-center justify-center">
                  <h2 class="text-[16px] font-semibold text-[#232632]">Preview</h2>
                  <button
                    type="button"
                    (click)="step.set('configure-store')"
                    class="absolute right-0 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF3] text-[#4A4F5E]"
                    aria-label="Close preview"
                  >
                    <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                  </button>
                </div>

                <p class="mt-1 text-center text-[11px] text-[#A3A7B4]">
                  This is how your store ad will appear to buyers
                </p>

                <div class="mt-5 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#7868F3] bg-white text-[#7868F3]"
                    aria-label="Desktop preview"
                  >
                    <span class="h-3 w-4 rounded-[3px] border-2 border-current"></span>
                  </button>
                  <button
                    type="button"
                    class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#7D8089]"
                    aria-label="Mobile preview"
                  >
                    <span class="h-4 w-2.5 rounded-[3px] border-2 border-current"></span>
                  </button>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto px-4 pt-4 pb-6">
                <div class="mx-auto w-full max-w-[290px] rounded-[24px] border border-[#ECEDEF] bg-white p-3 shadow-[0_22px_60px_-40px_rgba(19,27,45,0.35)]">
                  <div class="overflow-hidden rounded-[18px] border border-[#ECEDEF] bg-[#FCFCFD]">
                    <div class="flex items-center justify-between bg-[#1D1E22] px-3 py-1.5">
                      <div class="flex items-center gap-2">
                        <div class="h-2 w-2 rounded-full bg-white"></div>
                        <span class="text-[0.45rem] font-bold text-white">Duduzili</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="h-1.5 w-8 rounded-full bg-white/25"></div>
                        <div class="h-2.5 w-5 rounded-full bg-white"></div>
                      </div>
                    </div>

                    <div class="space-y-3 bg-white p-3">
                      <div class="grid grid-cols-5 gap-1.5 opacity-35 blur-[1.4px]">
                        @for (item of [1, 2, 3, 4, 5]; track item) {
                          <div class="space-y-1">
                            <div class="aspect-square rounded-[8px] bg-[#ECEEF2]"></div>
                            <div class="h-1 rounded-full bg-[#ECEEF2]"></div>
                            <div class="h-1 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                          </div>
                        }
                      </div>

                      <div>
                        <p class="mb-1.5 text-[0.42rem] font-bold text-[#7D8089]">Featured stores</p>
                        <div class="grid grid-cols-4 gap-1.5">
                          @for (store of stores; track store.id) {
                            <div class="space-y-1">
                              <div class="h-8 overflow-hidden rounded-[6px] bg-[#F5F7FB]">
                                <img [src]="store.image" [alt]="store.name" class="h-full w-full object-cover opacity-80">
                              </div>
                              <div class="h-1 w-7 rounded-full bg-[#E5E7EC]"></div>
                            </div>
                          }
                        </div>
                      </div>

                      <div class="grid grid-cols-[1.2fr_0.95fr] gap-3 pt-1">
                        <div>
                          <div class="flex items-center gap-1 text-[0.42rem] font-bold text-[#24262D]">
                            <div class="h-2 w-2 rounded-full bg-[#24262D]"></div>
                            Duduzili
                          </div>
                          <div class="mt-1.5 space-y-1 opacity-60">
                            <div class="h-1 w-20 rounded-full bg-[#E5E7EC]"></div>
                            <div class="h-1 w-16 rounded-full bg-[#E5E7EC]"></div>
                          </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2">
                          <div>
                            <p class="text-[0.42rem] font-bold text-[#24262D]">Social</p>
                            <div class="mt-1.5 space-y-1 opacity-60">
                              <div class="h-1 w-6 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1 w-6 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1 w-6 rounded-full bg-[#E5E7EC]"></div>
                            </div>
                          </div>
                          <div>
                            <p class="text-[0.42rem] font-bold text-[#24262D]">Resources</p>
                            <div class="mt-1.5 space-y-1 opacity-60">
                              <div class="h-1 w-7 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1 w-6 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1 w-5 rounded-full bg-[#E5E7EC]"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="h-8 rounded-b-[12px] bg-linear-to-r from-[#EFEAFF] via-[#F6F4FF] to-[#EDE8FF]"></div>
                    </div>
                  </div>
                </div>
              </div>

              <footer class="border-t border-[#F1F2F4] px-4 py-4">
                <button
                  type="button"
                  (click)="completeStorePromotion()"
                  class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  Promote store
                </button>
              </footer>
            </div>
          } @else if (step() === 'listing-success') {
            <div class="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div class="relative mb-8 h-32 w-24">
                <div class="absolute left-1/2 top-1/2 h-[104px] w-[66px] -translate-x-1/2 -translate-y-1/2 rounded-[15px] bg-[#5A5A5C] shadow-[0_18px_30px_-18px_rgba(0,0,0,0.45)]"></div>
                <div class="absolute left-1/2 top-1/2 h-[86px] w-[52px] -translate-x-1/2 -translate-y-1/2 rounded-[11px] bg-[#D7EEFF]"></div>
                <div class="absolute left-[29px] top-[20px] h-5 w-5 rounded-[6px] bg-white/90"></div>
                <div class="absolute left-[34px] top-[71px] h-3.5 w-16 rounded-full bg-[#5FD26D]"></div>
                <div class="absolute left-[34px] top-[88px] h-1.5 w-6 rounded-full bg-[#7F8A97]"></div>
                <div class="absolute right-[4px] top-[35px] h-[48px] w-[58px] rounded-[14px] bg-linear-to-b from-[#8E79F6] to-[#5B43D4] shadow-[0_18px_30px_-18px_rgba(91,67,212,0.7)]"></div>
                <div class="absolute right-[22px] top-[18px] h-7 w-2 rotate-[-42deg] rounded-full bg-[#FFD44B]"></div>
                <div class="absolute right-[15px] top-[41px] h-6 w-10 rounded-b-[12px] bg-[#7F5FE7]/70"></div>
              </div>

              <h2 class="text-[18px] font-semibold leading-tight tracking-[-0.03em] text-[#1A1C21]">
                Listing promotion is now active 🚀
              </h2>

              <p class="mt-3 text-[13px] leading-6 text-[#8F95A3]">
                Your {{ selectedListingIds().length }} listings are now promoted across Search, Categories, and
                Explore. Promotion ends on <span class="font-semibold text-[#4B4F57]">27 April 2026</span>.
              </p>

              <div class="mt-8 w-full space-y-3">
                <button
                  type="button"
                  (click)="resetListingFlow()"
                  class="w-full rounded-full bg-[#F2F3F5] px-6 py-4 text-[14px] font-semibold text-[#2F333B]"
                >
                  Create another Ad
                </button>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  View running Ads
                </button>
              </div>
            </div>
          } @else if (step() === 'store-success') {
            <div class="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <div class="relative mb-8 h-36 w-28">
                <div class="absolute left-1/2 top-[16px] h-8 w-9 -translate-x-1/2 rounded-t-[12px] bg-[#FF5A36]"></div>
                <div class="absolute left-1/2 top-[16px] flex -translate-x-1/2">
                  <span class="h-10 w-3.5 rounded-b-[10px] bg-[#FF5A36]"></span>
                  <span class="h-10 w-3.5 rounded-b-[10px] bg-[#FFB33C]"></span>
                  <span class="h-10 w-3.5 rounded-b-[10px] bg-[#FF5A36]"></span>
                  <span class="h-10 w-3.5 rounded-b-[10px] bg-[#FFB33C]"></span>
                  <span class="h-10 w-3.5 rounded-b-[10px] bg-[#FF5A36]"></span>
                </div>
                <div class="absolute left-1/2 top-[47px] h-[94px] w-[58px] -translate-x-1/2 rounded-[14px] bg-linear-to-b from-[#7D6A85] to-[#5F4F68]"></div>
                <div class="absolute left-1/2 top-[55px] h-[68px] w-[44px] -translate-x-1/2 rounded-[8px] bg-[#F7F0FF]"></div>
                <div class="absolute left-1/2 top-[82px] h-7 w-14 -translate-x-1/2 rounded-[6px] bg-linear-to-r from-[#FF7E66] to-[#D11F1F]"></div>
              </div>

              <h2 class="text-[18px] font-semibold leading-tight tracking-[-0.03em] text-[#1A1C21]">
                Store promotion is now active 🚀
              </h2>

              <p class="mt-3 text-[13px] leading-6 text-[#8F95A3]">
                Your store <span class="font-semibold text-[#4B4F57]">{{ selectedStoreName() }}</span> is now promoted
                across Duduzili. Promotion ends on <span class="font-semibold text-[#4B4F57]">27 April 2026</span>.
              </p>

              <div class="mt-8 w-full space-y-3">
                <button
                  type="button"
                  (click)="resetStoreFlow()"
                  class="w-full rounded-full bg-[#F2F3F5] px-6 py-4 text-[14px] font-semibold text-[#2F333B]"
                >
                  Create another Ad
                </button>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="w-full rounded-full bg-[#6653E4] px-6 py-4 text-[14px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                >
                  View running Ads
                </button>
              </div>
            </div>
          }

          @if (isStoreFilterOpen()) {
            <div class="pointer-events-none absolute inset-0 bg-black/15"></div>
            <div class="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-4 pt-3 pb-4 shadow-[0_-18px_48px_-24px_rgba(17,24,39,0.35)]">
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
                    <img [src]="store.image" [alt]="store.name" class="h-9 w-9 rounded-full object-cover">
                    <span class="min-w-0 flex-1 truncate text-[13px] font-medium text-[#232632]">{{ store.name }}</span>
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
        class="hidden h-full w-full p-3 md:flex"
        (click)="$event.stopPropagation()"
      >
        <div class="flex h-full w-full overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]">
          @if (step() !== 'listing-success' && step() !== 'store-success') {
            <aside class="hidden w-[220px] shrink-0 border-r border-[#F0F1F4] bg-white px-7 py-6 lg:block">
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
                <div class="flex items-center gap-3 text-[15px] font-semibold" [class.text-[#6B5CF0]]="step() === 'type'" [class.text-[#BABEC7]]="step() !== 'type'">
                  <span class="h-px w-6" [class.bg-[#6B5CF0]]="step() === 'type'" [class.bg-[#E4E6EB]]="step() !== 'type'"></span>
                  Ad type
                </div>
                <div class="flex items-center gap-3 text-[15px] font-medium" [class.text-[#6B5CF0]]="step() !== 'type'" [class.text-[#BABEC7]]="step() === 'type'">
                  <span class="h-px w-6" [class.bg-[#6B5CF0]]="step() !== 'type'" [class.bg-[#E4E6EB]]="step() === 'type'"></span>
                  Configure
                </div>
              </nav>
            </aside>
          }

          <div class="flex min-w-0 flex-1 flex-col">
            <header class="flex items-center gap-4 border-b border-[#F1F2F4] px-6 py-5 lg:hidden">
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

            <div class="flex-1 overflow-y-auto px-6 py-8 lg:px-10">
              <div class="mx-auto max-w-[980px]">
                @if (step() === 'type') {
                  <h2 class="text-[2rem] font-black tracking-tight text-[#24262D]">Select Ad type</h2>
                  <p class="mt-2 text-[15px] font-medium text-[#A1A6AF]">
                    Choose the type of advertisement you want to create
                  </p>

                  <div class="mt-8 space-y-6">
                    @for (option of adTypeOptions; track option.id) {
                      <button
                        type="button"
                        (click)="selectedType.set(option.id)"
                        class="grid w-full items-center gap-4 rounded-[24px] border bg-white px-4 py-4 text-left transition-all md:grid-cols-[minmax(0,1fr)_170px]"
                        [class.border-[#6B5CF0]]="selectedType() === option.id"
                        [class.bg-[#F9F7FF]]="selectedType() === option.id"
                        [class.shadow-[inset_0_0_0_1px_rgba(107,92,240,0.12)]]="selectedType() === option.id"
                        [class.border-[#E8EAF0]]="selectedType() !== option.id"
                      >
                        <div class="min-w-0 px-2 py-1">
                          <div class="flex items-start justify-between gap-4">
                            <h3 class="text-[19px] font-semibold tracking-tight text-[#22252C]">
                              {{ option.title }}
                            </h3>
                          </div>

                          <div class="mt-4 grid gap-3 text-[14px] font-medium text-[#9196A0] md:grid-cols-2">
                            <div class="space-y-2">
                              @for (item of option.descriptionLeft; track item) {
                                <div class="flex items-start gap-2">
                                  <span class="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#7C6AF3]"></span>
                                  <span>{{ item }}</span>
                                </div>
                              }
                            </div>
                            <div class="space-y-2">
                              @for (item of option.descriptionRight; track item) {
                                <div class="flex items-start gap-2">
                                  <span class="mt-[7px] h-1.5 w-1.5 rounded-full bg-[#7C6AF3]"></span>
                                  <span>{{ item }}</span>
                                </div>
                              }
                            </div>
                          </div>
                        </div>

                        <div class="relative ml-auto h-[110px] w-full max-w-[170px] overflow-hidden rounded-[22px]" [style.background]="option.artTone">
                          <span class="absolute right-2 top-2 rounded-full bg-[#EFF5A5] px-2.5 py-1 text-[10px] font-bold text-[#6A7414]">
                            {{ option.badge }}
                          </span>

                          <div class="absolute inset-0 flex items-end justify-end p-4">
                            <div
                              class="relative h-[74px] w-[74px] rounded-[18px] border border-white/45 shadow-[0_18px_24px_-18px_rgba(0,0,0,0.25)]"
                              [style.background]="option.cardTone"
                            >
                              @switch (option.id) {
                                @case ('listing') {
                                  <div class="absolute left-4 top-5 h-7 w-7 rounded-[8px] bg-[#6B5CF0]/90"></div>
                                  <div class="absolute left-8 top-2 h-8 w-8 rounded-[8px] bg-[#FFD35B] rotate-[18deg]"></div>
                                  <div class="absolute right-3 bottom-3 h-6 w-9 rounded-[10px] bg-white/85"></div>
                                }
                                @case ('store') {
                                  <div class="absolute left-4 top-6 h-5 w-10 rounded-t-[10px] bg-[#FF8B31]"></div>
                                  <div class="absolute left-4 top-10 h-7 w-10 rounded-b-[10px] bg-[#6DDA71]"></div>
                                  <div class="absolute left-[22px] top-4 h-4 w-2 rounded bg-[#FF5C52]"></div>
                                  <div class="absolute left-[30px] top-4 h-4 w-2 rounded bg-[#FFD35B]"></div>
                                  <div class="absolute left-[38px] top-4 h-4 w-2 rounded bg-[#FF5C52]"></div>
                                }
                                @default {
                                  <div class="absolute inset-x-3 top-4 h-8 rounded-[10px] bg-[#66C6FF]"></div>
                                  <div class="absolute inset-x-5 top-7 h-10 rounded-[10px] bg-[#FFF1A5]"></div>
                                  <div class="absolute left-7 top-11 h-4 w-4 rotate-[12deg] rounded-[4px] bg-white/85"></div>
                                  <div class="absolute right-7 top-11 h-4 w-4 rounded-[4px] bg-[#FFB548]"></div>
                                }
                              }
                            </div>
                          </div>
                        </div>
                      </button>
                    }
                  </div>
                } @else if (step() === 'configure-listing') {
                  <h2 class="text-[2rem] font-black tracking-tight text-[#24262D]">Select a Listing to promote</h2>
                  <p class="mt-2 text-[15px] font-medium text-[#A1A6AF]">
                    Select a listing and set your promotion preferences
                  </p>

                  <section class="mt-8">
                    <h3 class="text-[18px] font-bold tracking-tight text-[#24262D]">Choose listing category</h3>
                    <div class="mt-4 flex flex-wrap gap-3">
                      @for (category of listingCategories; track category.id) {
                        <button
                          type="button"
                          (click)="selectedListingCategory.set(category.id)"
                          class="rounded-[14px] border px-4 py-3 text-[15px] font-medium transition"
                          [class.border-[#6B5CF0]]="selectedListingCategory() === category.id"
                          [class.bg-[#F9F7FF]]="selectedListingCategory() === category.id"
                          [class.text-[#4F42A4]]="selectedListingCategory() === category.id"
                          [class.border-[#E8EAF0]]="selectedListingCategory() !== category.id"
                          [class.text-[#6B707A]]="selectedListingCategory() !== category.id"
                        >
                          {{ category.label }}
                        </button>
                      }
                    </div>
                  </section>

                  <section class="mt-9">
                    <h3 class="text-[18px] font-bold tracking-tight text-[#24262D]">Select listing to promote</h3>

                    <div class="mt-4 flex items-start gap-3 rounded-[16px] bg-[#FFFBE5] px-5 py-4 text-[#59592E]">
                      <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                        <ng-icon name="heroExclamationTriangle" class="text-sm"></ng-icon>
                      </div>
                      <p class="text-[14px] font-semibold">
                        Your listing will be promoted across Duduzili until it expires on 24 March, 2026.
                      </p>
                    </div>

                    <div class="mt-5 overflow-hidden rounded-[24px] border border-[#ECEEF3] bg-white">
                      <div class="flex flex-col gap-4 border-b border-[#F0F1F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                        <div class="flex flex-wrap gap-3">
                          @for (filter of tableFilters; track filter) {
                            <button
                              type="button"
                              class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#818692]"
                            >
                              {{ filter }}
                              <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                            </button>
                          }
                        </div>

                        <div class="relative w-full max-w-[280px]">
                          <ng-icon name="heroMagnifyingGlass" class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#B0B4BD]"></ng-icon>
                          <input
                            type="text"
                            placeholder="Search"
                            class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
                          >
                        </div>
                      </div>

                      <div class="overflow-x-auto">
                        <table class="w-full min-w-[780px]">
                          <thead class="border-b border-[#F0F1F4] bg-[#FAFAFB] text-left">
                            <tr class="text-[12px] font-semibold text-[#9BA0AA]">
                              <th class="px-4 py-4">Name</th>
                              <th class="px-4 py-4">Category</th>
                              <th class="px-4 py-4">Price</th>
                              <th class="px-4 py-4">Store</th>
                              <th class="px-4 py-4 text-center">Select</th>
                            </tr>
                          </thead>
                          <tbody>
                            @for (listing of filteredListings(); track listing.id) {
                              <tr class="border-b border-[#F3F4F7] last:border-b-0">
                                <td class="px-4 py-4">
                                  <div class="flex items-center gap-3">
                                    <img [src]="listing.image" [alt]="listing.name" class="h-10 w-10 rounded-[10px] object-cover">
                                    <span class="text-[14px] font-medium text-[#2A2D34]">{{ listing.name }}</span>
                                  </div>
                                </td>
                                <td class="px-4 py-4 text-[14px] font-medium text-[#666B74]">{{ listing.categoryLabel }}</td>
                                <td class="px-4 py-4 text-[14px] font-semibold text-[#2A2D34]">{{ listing.price }}</td>
                                <td class="px-4 py-4">
                                  <div class="flex items-center gap-2.5">
                                    <span class="flex h-8 w-8 items-center justify-center rounded-full text-[12px] font-bold text-white" [style.background]="listing.storeTone">
                                      {{ listing.storeInitial }}
                                    </span>
                                    <span class="text-[14px] font-medium text-[#545962]">{{ listing.store }}</span>
                                  </div>
                                </td>
                                <td class="px-4 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    class="h-4 w-4 rounded border-[#D2D6DE] text-[#6B5CF0] focus:ring-[#6B5CF0]/20"
                                    [checked]="selectedListingIds().includes(listing.id)"
                                    (change)="toggleListingSelection(listing.id)"
                                  >
                                </td>
                              </tr>
                            }
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </section>
                } @else if (step() === 'configure-store') {
                  <div class="grid gap-10 xl:grid-cols-[minmax(0,1fr)_360px]">
                    <section class="max-w-[720px]">
                      <h2 class="text-[2rem] font-black tracking-tight text-[#24262D]">Configure Store Ad</h2>
                      <p class="mt-2 text-[15px] font-medium text-[#A1A6AF]">
                        Promote your store to attract more customers
                      </p>

                      <section class="mt-8">
                        <h3 class="text-[18px] font-bold tracking-tight text-[#24262D]">Select store to promote</h3>

                        <div class="mt-4 flex items-start gap-3 rounded-[16px] bg-[#FFFBE5] px-5 py-4 text-[#59592E]">
                          <div class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                            <ng-icon name="heroExclamationTriangle" class="text-sm"></ng-icon>
                          </div>
                          <p class="text-[14px] font-semibold">
                            Your store will be promoted across Duduzili until it expires on 24 March, 2026.
                          </p>
                        </div>

                        <div class="mt-5 grid gap-4 sm:grid-cols-2">
                          @for (store of stores; track store.id) {
                            <button
                              type="button"
                              (click)="selectedStoreId.set(store.id)"
                              class="overflow-hidden rounded-[22px] border bg-white text-left transition-all"
                              [class.border-[#6B5CF0]]="selectedStoreId() === store.id"
                              [class.shadow-[inset_0_0_0_1px_rgba(107,92,240,0.12)]]="selectedStoreId() === store.id"
                              [class.border-[#E8EAF0]]="selectedStoreId() !== store.id"
                            >
                              <div class="relative h-[132px] overflow-hidden">
                                <img [src]="store.image" [alt]="store.name" class="h-full w-full object-cover">
                                <div class="absolute inset-0 bg-linear-to-t from-white via-white/30 to-transparent"></div>
                                <span
                                  class="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border-2 bg-white/90"
                                  [class.border-[#6B5CF0]]="selectedStoreId() === store.id"
                                  [class.border-white/60]="selectedStoreId() !== store.id"
                                >
                                  @if (selectedStoreId() === store.id) {
                                    <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                                  }
                                </span>
                              </div>

                              <div class="flex items-center gap-3 px-4 pb-4">
                                <span class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[20px] font-bold text-white shadow-[0_16px_24px_-18px_rgba(0,0,0,0.45)]" [style.background]="store.logoTone">
                                  {{ store.logoLabel }}
                                </span>
                                <div class="min-w-0">
                                  <div class="flex items-center gap-1.5">
                                    <p class="truncate text-[15px] font-semibold text-[#24262D]">{{ store.name }}</p>
                                    <span class="h-2 w-2 rounded-full bg-[#6B5CF0]"></span>
                                  </div>
                                  <p class="mt-1 text-[13px] font-medium text-[#8A909A]">{{ store.activeListings }}</p>
                                </div>
                              </div>
                            </button>
                          }
                        </div>
                      </section>
                    </section>

                    <aside class="flex flex-col rounded-[28px] bg-[#FAFAFB] p-5 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]">
                      <div>
                        <h3 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">Preview</h3>
                        <p class="mt-1 text-[13px] font-medium text-[#A3A6AE]">
                          This is how your store ad will appear to buyers
                        </p>
                      </div>

                      <div class="mt-7 flex justify-center gap-3">
                        <button
                          type="button"
                          class="flex h-11 w-11 items-center justify-center rounded-full border border-[#7868F3] bg-white text-[#7868F3]"
                        >
                          <span class="h-3.5 w-5 rounded-[3px] border-2 border-current"></span>
                        </button>
                        <button
                          type="button"
                          class="flex h-11 w-11 items-center justify-center rounded-full border border-[#DCDDDF] bg-white text-[#7D8089]"
                        >
                          <span class="h-5 w-3 rounded-[3px] border-2 border-current"></span>
                        </button>
                      </div>

                      <div class="mt-6 flex flex-1 items-center justify-center">
                        <div class="w-full max-w-[344px] rounded-[26px] bg-white p-4 shadow-[0_22px_60px_-40px_rgba(19,27,45,0.35)]">
                          <div class="overflow-hidden rounded-[20px] border border-[#ECEDEF] bg-[#FCFCFD]">
                            <div class="flex items-center justify-between bg-[#1D1E22] px-3 py-1.5">
                              <div class="flex items-center gap-2">
                                <div class="h-2.5 w-2.5 rounded-full bg-white"></div>
                                <span class="text-[0.5rem] font-bold text-white">Duduzili</span>
                              </div>
                              <div class="flex items-center gap-1">
                                <div class="h-1.5 w-10 rounded-full bg-white/25"></div>
                                <div class="h-3 w-6 rounded-full bg-white"></div>
                              </div>
                            </div>

                            <div class="space-y-4 bg-white p-3">
                              <div class="grid grid-cols-5 gap-2 opacity-35 blur-[1.4px]">
                                @for (item of [1, 2, 3, 4, 5]; track item) {
                                  <div class="space-y-1.5">
                                    <div class="aspect-square rounded-[10px] bg-[#ECEEF2]"></div>
                                    <div class="h-1.5 rounded-full bg-[#ECEEF2]"></div>
                                    <div class="h-1.5 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                                  </div>
                                }
                              </div>

                              <div>
                                <p class="mb-2 text-[0.48rem] font-bold text-[#7D8089]">Featured stores</p>
                                <div class="grid grid-cols-4 gap-2">
                                  @for (store of stores; track store.id) {
                                    <div class="space-y-1.5">
                                      <div class="h-10 overflow-hidden rounded-[8px] bg-[#F5F7FB]">
                                        <img [src]="store.image" [alt]="store.name" class="h-full w-full object-cover opacity-80">
                                      </div>
                                      <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                                    </div>
                                  }
                                </div>
                              </div>

                              <div class="grid grid-cols-[1.25fr_0.95fr] gap-4 pt-1">
                                <div>
                                  <div class="flex items-center gap-1.5 text-[0.48rem] font-bold text-[#24262D]">
                                    <div class="h-2.5 w-2.5 rounded-full bg-[#24262D]"></div>
                                    Duduzili
                                  </div>
                                  <div class="mt-2 space-y-1 opacity-60">
                                    <div class="h-1.5 w-24 rounded-full bg-[#E5E7EC]"></div>
                                    <div class="h-1.5 w-20 rounded-full bg-[#E5E7EC]"></div>
                                  </div>
                                </div>

                                <div class="grid grid-cols-2 gap-3">
                                  <div>
                                    <p class="text-[0.48rem] font-bold text-[#24262D]">Social</p>
                                    <div class="mt-2 space-y-1.5 opacity-60">
                                      <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                                      <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                                      <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                                    </div>
                                  </div>
                                  <div>
                                    <p class="text-[0.48rem] font-bold text-[#24262D]">Resources</p>
                                    <div class="mt-2 space-y-1.5 opacity-60">
                                      <div class="h-1.5 w-10 rounded-full bg-[#E5E7EC]"></div>
                                      <div class="h-1.5 w-9 rounded-full bg-[#E5E7EC]"></div>
                                      <div class="h-1.5 w-7 rounded-full bg-[#E5E7EC]"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div class="h-10 rounded-b-[14px] bg-linear-to-r from-[#EFEAFF] via-[#F6F4FF] to-[#EDE8FF]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </aside>
                  </div>
                } @else if (step() === 'listing-success') {
                  <div class="flex min-h-[640px] flex-col items-center justify-center px-6 text-center">
                    <div class="relative mb-8 h-36 w-32">
                      <div class="absolute left-1/2 top-1/2 h-[118px] w-[74px] -translate-x-1/2 -translate-y-1/2 rounded-[16px] bg-[#5A5A5C] shadow-[0_18px_30px_-18px_rgba(0,0,0,0.45)]"></div>
                      <div class="absolute left-1/2 top-1/2 h-[98px] w-[58px] -translate-x-1/2 -translate-y-1/2 rounded-[12px] bg-[#D7EEFF]"></div>
                      <div class="absolute left-[38px] top-[24px] h-6 w-6 rounded-[6px] bg-white/90"></div>
                      <div class="absolute left-[44px] top-[82px] h-4 w-18 rounded-full bg-[#5FD26D]"></div>
                      <div class="absolute left-[44px] top-[104px] h-1.5 w-6 rounded-full bg-[#7F8A97]"></div>
                      <div class="absolute right-[12px] top-[40px] h-[56px] w-[68px] rounded-[14px] bg-linear-to-b from-[#8E79F6] to-[#5B43D4] shadow-[0_18px_30px_-18px_rgba(91,67,212,0.7)]"></div>
                      <div class="absolute right-[34px] top-[22px] h-8 w-2 rotate-[-42deg] rounded-full bg-[#FFD44B]"></div>
                      <div class="absolute right-[24px] top-[48px] h-7 w-12 rounded-b-[12px] bg-[#7F5FE7]/70"></div>
                    </div>

                    <h2 class="text-[2rem] font-black tracking-tight text-[#1A1C21]">
                      Listing promotion is now active 🚀
                    </h2>

                    <p class="mt-3 max-w-[620px] text-[15px] font-medium leading-7 text-[#9297A1]">
                      Your {{ selectedListingIds().length }} listings are now promoted across Search, Categories,
                      and Explore. Promotion ends on <span class="font-semibold text-[#4B4F57]">27 April 2026</span>.
                    </p>

                    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        (click)="resetListingFlow()"
                        class="rounded-full bg-[#F2F3F5] px-7 py-3 text-[15px] font-semibold text-[#2F333B] transition hover:bg-[#E8EAF0] focus:outline-none focus:ring-4 focus:ring-gray-200"
                      >
                        Promote another listing
                      </button>
                      <button
                        type="button"
                        (click)="close.emit()"
                        class="rounded-full bg-[#6653E4] px-7 py-3 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
                      >
                        View running Ads
                      </button>
                    </div>
                  </div>
                } @else {
                  <div class="flex min-h-[640px] flex-col items-center justify-center px-6 text-center">
                    <div class="relative mb-8 h-40 w-32">
                      <div class="absolute left-1/2 top-[18px] h-9 w-10 -translate-x-1/2 rounded-t-[12px] bg-[#FF5A36]"></div>
                      <div class="absolute left-1/2 top-[18px] flex -translate-x-1/2">
                        <span class="h-11 w-4 rounded-b-[10px] bg-[#FF5A36]"></span>
                        <span class="h-11 w-4 rounded-b-[10px] bg-[#FFB33C]"></span>
                        <span class="h-11 w-4 rounded-b-[10px] bg-[#FF5A36]"></span>
                        <span class="h-11 w-4 rounded-b-[10px] bg-[#FFB33C]"></span>
                        <span class="h-11 w-4 rounded-b-[10px] bg-[#FF5A36]"></span>
                      </div>
                      <div class="absolute left-1/2 top-[52px] h-[102px] w-[62px] -translate-x-1/2 rounded-[14px] bg-linear-to-b from-[#7D6A85] to-[#5F4F68] shadow-[0_22px_30px_-18px_rgba(0,0,0,0.45)]"></div>
                      <div class="absolute left-1/2 top-[60px] h-[74px] w-[48px] -translate-x-1/2 rounded-[8px] bg-[#F7F0FF]"></div>
                      <div class="absolute left-1/2 top-[88px] h-8 w-14 -translate-x-1/2 rounded-[6px] bg-linear-to-r from-[#FF7E66] to-[#D11F1F] shadow-[0_16px_20px_-18px_rgba(209,31,31,0.7)]"></div>
                      <span class="absolute left-1/2 top-[97px] -translate-x-1/2 text-[10px] font-bold text-white">ACTIVE</span>
                      <div class="absolute left-1/2 top-[139px] h-3 w-7 -translate-x-1/2 rounded-full bg-[#75617D]"></div>
                    </div>

                    <h2 class="text-[2rem] font-black tracking-tight text-[#1A1C21]">
                      Store promotion is now active 🚀
                    </h2>

                    <p class="mt-3 max-w-[620px] text-[15px] font-medium leading-7 text-[#9297A1]">
                      Your store <span class="font-semibold text-[#4B4F57]">{{ selectedStoreName() }}</span> is now promoted across Duduzili.
                      Promotion ends on <span class="font-semibold text-[#4B4F57]">27 April 2026</span>.
                    </p>

                    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                      <button
                        type="button"
                        (click)="resetStoreFlow()"
                        class="rounded-full bg-[#F2F3F5] px-7 py-3 text-[15px] font-semibold text-[#2F333B] transition hover:bg-[#E8EAF0] focus:outline-none focus:ring-4 focus:ring-gray-200"
                      >
                        Create another Ad
                      </button>
                      <button
                        type="button"
                        (click)="close.emit()"
                        class="rounded-full bg-[#6653E4] px-7 py-3 text-[15px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
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
                <div class="mx-auto flex max-w-[980px] items-center justify-between">
                  @if (step() === 'configure-listing' || step() === 'configure-store') {
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

  readonly selectedType = signal<CreateAdType>('listing');
  readonly step = signal<'type' | 'configure-listing' | 'mobile-listing-picker' | 'configure-store' | 'store-preview' | 'listing-success' | 'store-success'>('type');
  readonly selectedListingCategory = signal<'automobiles' | 'properties' | 'others'>('others');
  readonly selectedListingIds = signal<string[]>(['listing-1', 'listing-2', 'listing-3', 'listing-4']);
  readonly selectedStoreId = signal('store-1');
  readonly listingSearch = signal('');
  readonly isStoreFilterOpen = signal(false);
  readonly mobileSelectedStoreIds = signal<string[]>([]);

  readonly tableFilters = ['Category', 'Store', 'Status'];

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
      categoryLabel: 'Phones & Laptops',
      price: '₦2,500,000.00',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-2',
      kind: 'others',
      name: 'Logitech ergonomic mouse',
      categoryLabel: 'Electronics',
      price: '₦2,500,000.00',
      store: 'Eden Organics',
      storeInitial: 'E',
      storeTone: 'linear-gradient(135deg, #09270B 0%, #52D86B 100%)',
      image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-3',
      kind: 'others',
      name: 'Nike sneaker',
      categoryLabel: 'Men’s fashion',
      price: '₦2,500,000.00',
      store: 'Amazing Fragrances',
      storeInitial: 'A',
      storeTone: 'linear-gradient(135deg, #FFC935 0%, #F39A00 100%)',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-4',
      kind: 'others',
      name: 'Bone straight wig',
      categoryLabel: 'Women’s fashion',
      price: '₦2,500,000.00',
      store: 'Personal account',
      storeInitial: 'P',
      storeTone: 'linear-gradient(135deg, #5D8FE9 0%, #D85F5F 100%)',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-5',
      kind: 'others',
      name: 'Sweatshirt',
      categoryLabel: 'Men’s fashion',
      price: '₦2,500,000.00',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-6',
      kind: 'others',
      name: 'RGB keyboard',
      categoryLabel: 'Electronics',
      price: '₦2,500,000.00',
      store: 'Personal account',
      storeInitial: 'P',
      storeTone: 'linear-gradient(135deg, #5D8FE9 0%, #D85F5F 100%)',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-7',
      kind: 'automobiles',
      name: 'Mercedes GLE',
      categoryLabel: 'Cars',
      price: '₦145,000,000.00',
      store: 'The Vine Collections',
      storeInitial: 'V',
      storeTone: 'linear-gradient(135deg, #4A8F67 0%, #F0C76C 100%)',
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=160&h=160&fit=crop',
    },
    {
      id: 'listing-8',
      kind: 'properties',
      name: '2-bedroom apartment',
      categoryLabel: 'Real estate',
      price: '₦25,000,000.00',
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

  readonly filteredListings = computed(() =>
    this.listings.filter(listing => listing.kind === this.selectedListingCategory()),
  );

  readonly mobilePickerListings = computed(() => {
    const query = this.listingSearch().trim().toLowerCase();
    const activeStoreFilters = this.mobileSelectedStoreIds();

    return this.filteredListings().filter(listing => {
      const matchesQuery =
        query.length === 0 ||
        listing.name.toLowerCase().includes(query) ||
        listing.store.toLowerCase().includes(query);
      const matchesStore =
        activeStoreFilters.length === 0 || activeStoreFilters.includes(this.storeIdForListing(listing.store));

      return matchesQuery && matchesStore;
    });
  });

  readonly selectedListingCards = computed(() =>
    this.listings.filter(listing => this.selectedListingIds().includes(listing.id)),
  );

  readonly mobileFilterStores = computed(() =>
    this.stores.filter(store =>
      this.filteredListings().some(listing => this.storeIdForListing(listing.store) === store.id),
    ),
  );

  readonly adTypeOptions: AdTypeOption[] = [
    {
      id: 'listing',
      title: 'Promote a Listing',
      badge: '8 promotions left',
      descriptionLeft: ['Get more views on your listing', 'Appear higher in search results'],
      descriptionRight: ['Reach buyers searching in your category', 'Increase chances of selling faster'],
      artTone: 'linear-gradient(135deg, #F1ECFF 0%, #E8F0FF 100%)',
      cardTone: 'linear-gradient(135deg, #DAD3FF 0%, #EEF2FF 100%)',
    },
    {
      id: 'store',
      title: 'Promote Your Store',
      badge: '2 promotions left',
      descriptionLeft: ['Feature your store to more buyers', 'Grow your followers/returning customers'],
      descriptionRight: ['Drive traffic to all your listings', 'Build credibility and brand awareness'],
      artTone: 'linear-gradient(135deg, #FFF7EA 0%, #FDEACB 100%)',
      cardTone: 'linear-gradient(135deg, #FFE2A9 0%, #FFF3D7 100%)',
    },
    {
      id: 'banner',
      title: 'Create a Banner Ad',
      badge: '1 promotion left',
      descriptionLeft: ['Display image or video banners on Duduzili', 'Direct buyers to your store or listing'],
      descriptionRight: ['Capture attention across high-traffic pages', 'Promote special offers or new products'],
      artTone: 'linear-gradient(135deg, #FFF0F8 0%, #F6E8FF 100%)',
      cardTone: 'linear-gradient(135deg, #FFD3EA 0%, #E5D9FF 100%)',
    },
  ];

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
      this.step.set('store-success');
      return;
    }

    this.completeListingPromotion();
  }

  toggleListingSelection(id: string): void {
    this.selectedListingIds.update(selected =>
      selected.includes(id) ? selected.filter(item => item !== id) : [...selected, id],
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
    this.mobileSelectedStoreIds.update(selected =>
      selected.includes(storeId) ? selected.filter(item => item !== storeId) : [...selected, storeId],
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
  }

  selectedStoreName(): string {
    return this.stores.find(store => store.id === this.selectedStoreId())?.name ?? 'The Vine Collections';
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
    return this.stores.find(store => store.name === storeName)?.id ?? 'store-3';
  }
}
