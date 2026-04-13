import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChatBubbleLeftRight,
  heroChevronDown,
  heroChevronRight,
  heroEllipsisHorizontal,
  heroEye,
  heroMapPin,
  heroRocketLaunch,
  heroSquare3Stack3d,
  heroTag,
  heroHeart,
  heroArrowTopRightOnSquare,
  heroClipboardDocumentList,
} from '@ng-icons/heroicons/outline';
import { PromoteListingModalComponent } from '../../components/listings/promote-listing-modal.component';

interface SellerListingRequest {
  id: string;
  buyer: string;
  avatar: string;
  message: string;
  time: string;
  offer: string;
  status: 'New' | 'Responded';
}

interface SellerListingActivity {
  id: string;
  title: string;
  description: string;
  time: string;
}

interface ListingStatusOption {
  label: string;
  value: 'Available' | 'Paused' | 'Sold';
}

@Component({
  selector: 'app-listing-details-page',
  imports: [CommonModule, NgOptimizedImage, NgIcon, RouterLink, PromoteListingModalComponent],
  providers: [
    provideIcons({
      heroCalendarDays,
      heroChatBubbleLeftRight,
      heroChevronDown,
      heroChevronRight,
      heroEllipsisHorizontal,
      heroEye,
      heroMapPin,
      heroRocketLaunch,
      heroSquare3Stack3d,
      heroTag,
      heroHeart,
      heroArrowTopRightOnSquare,
      heroClipboardDocumentList,
    }),
  ],
  template: `
    <div class="px-5 pb-10 pt-7 md:hidden">
      @if (isEditSheetOpen()) {
        <div
          class="fixed inset-0 z-[70] bg-black/20"
          (click)="closeEditSheet()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] max-h-[96vh] rounded-t-[34px] bg-white px-4 pb-24 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)]"
          aria-label="Edit listing"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex items-center justify-between gap-4">
            <h2 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Edit listing</h2>
            <button
              type="button"
              (click)="closeEditSheet()"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close edit listing"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="mt-5 max-h-[calc(96vh-150px)] space-y-3 overflow-y-auto pb-4">
            <section class="rounded-[16px] bg-[#FBFBFC] px-4 py-4">
              <button
                type="button"
                (click)="toggleEditSection('media')"
                class="flex w-full items-center justify-between gap-4 text-left"
              >
                <span class="text-[14px] font-medium text-[#202335]">Media</span>
                <ng-icon
                  name="heroChevronDown"
                  class="text-[18px] text-[#4D5260] transition-transform"
                  [class.rotate-180]="isEditSectionOpen('media')"
                ></ng-icon>
              </button>

              @if (isEditSectionOpen('media')) {
                <div class="mt-5">
                  <div class="grid grid-cols-3 gap-2.5">
                    <div class="relative col-span-2 row-span-2 aspect-[1.08/1.22] overflow-hidden rounded-[18px] border border-[#ECEEF4] bg-[#F6F7FA]">
                      <img [src]="listing().gallery[0].src" alt="" class="h-full w-full object-cover">
                      <div class="absolute left-2.5 top-2.5 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#2A2D34] shadow-sm">
                        Main photo
                      </div>
                      <button
                        type="button"
                        class="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#4C5160] shadow-sm"
                        aria-label="Edit main image"
                      >
                        <ng-icon name="heroEllipsisHorizontal" class="text-[18px]"></ng-icon>
                      </button>
                      <div class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#4C5160] shadow-sm">
                        1
                      </div>
                    </div>

                    <div class="relative aspect-square overflow-hidden rounded-[16px] border border-[#ECEEF4] bg-[#F6F7FA]">
                      <img [src]="listing().gallery[1].src" alt="" class="h-full w-full object-cover">
                      <button
                        type="button"
                        class="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#4C5160] shadow-sm"
                        aria-label="Edit second image"
                      >
                        <ng-icon name="heroEllipsisHorizontal" class="text-[16px]"></ng-icon>
                      </button>
                      <div class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#4C5160] shadow-sm">
                        2
                      </div>
                    </div>

                    @for (slot of [3,4,5,6]; track slot) {
                      <div class="relative aspect-square overflow-hidden rounded-[16px] border border-dashed border-[#DADDE5] bg-[#F8F9FB]">
                        <div class="flex h-full items-center justify-center text-[#2A2D34]">
                          <ng-icon name="heroPlus" class="text-[24px]"></ng-icon>
                        </div>
                        <div class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#4C5160] shadow-sm">
                          {{ slot }}
                        </div>
                      </div>
                    }
                  </div>

                  <div class="mt-6 space-y-2">
                    <label class="text-[12px] font-medium text-[#5F6470]">Embedded YouTube link (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter link to YouTube video"
                      class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none placeholder:text-[#B1B5BF]"
                    >
                  </div>
                </div>
              }
            </section>

            <section class="rounded-[16px] bg-[#FBFBFC] px-4 py-4">
              <button
                type="button"
                (click)="toggleEditSection('details')"
                class="flex w-full items-center justify-between gap-4 text-left"
              >
                <span class="text-[14px] font-medium text-[#202335]">Details</span>
                <ng-icon
                  name="heroChevronDown"
                  class="text-[18px] text-[#4D5260] transition-transform"
                  [class.rotate-180]="isEditSectionOpen('details')"
                ></ng-icon>
              </button>

              @if (isEditSectionOpen('details')) {
                <div class="mt-5 space-y-6">
                  <div>
                    <h3 class="max-w-[260px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Fill basic details about your listing</h3>
                    <p class="mt-1 text-[11px] font-medium text-[#8A8F9A]">Add details about the item you want to list</p>
                  </div>

                  <div class="space-y-6">
                    <div class="space-y-2">
                      <label class="text-[12px] font-medium text-[#3F4452]">Item name</label>
                      <input
                        type="text"
                        [value]="listing().name"
                        class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                      >
                    </div>

                    <div class="space-y-2 relative">
                      <label class="text-[12px] font-medium text-[#3F4452]">Category</label>
                      <select
                        class="w-full appearance-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-10 text-[12px] font-medium text-[#202335] outline-none"
                      >
                        <option>Electronics/Phones & Tablets</option>
                        <option>Fashion</option>
                        <option>Cars</option>
                      </select>
                      <div class="pointer-events-none absolute right-4 top-[38px] text-[#8A8F9A]">
                        <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-5">
                      <div class="space-y-2 relative">
                        <label class="text-[12px] font-medium text-[#3F4452]">Condition</label>
                        <select
                          class="w-full appearance-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-10 text-[12px] font-medium text-[#202335] outline-none"
                        >
                          <option>Used</option>
                          <option>New</option>
                        </select>
                        <div class="pointer-events-none absolute right-4 top-[38px] text-[#8A8F9A]">
                          <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                        </div>
                      </div>

                      <div class="space-y-2 relative">
                        <label class="text-[12px] font-medium text-[#3F4452]">Store</label>
                        <select
                          class="w-full appearance-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-10 text-[12px] font-medium text-[#202335] outline-none"
                        >
                          <option>The Vine Collections</option>
                          <option>Secondary Store</option>
                        </select>
                        <div class="pointer-events-none absolute right-4 top-[38px] text-[#8A8F9A]">
                          <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                        </div>
                      </div>
                    </div>

                    <div class="pt-1">
                      <h3 class="text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Add description</h3>
                      <p class="max-w-[320px] text-[11px] leading-5 text-[#8A8F9A]">Describe the upgrades and standout features that will appeal to buyers</p>

                      <div class="mt-5 space-y-2">
                        <label class="text-[12px] font-medium text-[#3F4452]">Description</label>
                        <textarea
                          rows="6"
                          class="w-full resize-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                        >{{ listing().description }}</textarea>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </section>

            <section class="rounded-[16px] bg-[#FBFBFC] px-4 py-4">
              <button
                type="button"
                (click)="toggleEditSection('delivery')"
                class="flex w-full items-center justify-between gap-4 text-left"
              >
                <span class="text-[14px] font-medium text-[#202335]">Delivery & Pricing</span>
                <ng-icon
                  name="heroChevronDown"
                  class="text-[18px] text-[#4D5260] transition-transform"
                  [class.rotate-180]="isEditSectionOpen('delivery')"
                ></ng-icon>
              </button>

              @if (isEditSectionOpen('delivery')) {
                <div class="mt-5 space-y-7">
                  <h3 class="max-w-[280px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Set your location and delivery preferences</h3>

                  <div class="space-y-5">
                    <div class="space-y-2 relative">
                      <label class="text-[12px] font-medium text-[#3F4452]">Location</label>
                      <select
                        class="w-full appearance-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-10 text-[12px] font-medium text-[#202335] outline-none"
                      >
                        <option>Ikeja, Lagos</option>
                      </select>
                      <div class="pointer-events-none absolute right-4 top-[38px] text-[#8A8F9A]">
                        <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                      </div>
                    </div>

                    <div class="grid grid-cols-2 gap-5">
                      <div class="space-y-2">
                        <label class="text-[12px] font-medium text-[#3F4452]">Your WhatsApp number</label>
                        <input
                          type="text"
                          value="08169397454"
                          class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                        >
                      </div>

                      <div class="space-y-2">
                        <label class="text-[12px] font-medium text-[#3F4452]">Your call number</label>
                        <input
                          type="text"
                          value="08169397454"
                          class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                        >
                      </div>
                    </div>
                  </div>

                  <div class="space-y-3">
                    <label class="block text-[12px] font-medium text-[#3F4452]">Delivery options</label>
                    <div class="grid grid-cols-2 gap-3">
                      @for (option of editDeliveryOptions; track option.label) {
                        <button
                          type="button"
                          class="flex items-center gap-2 rounded-[14px] border px-3 py-3 text-left transition-colors"
                          [class.border-[#6F56F6]]="option.selected"
                          [class.bg-[#F8F7FF]]="option.selected"
                          [class.border-[#E1E3E8]]="!option.selected"
                          [class.bg-white]="!option.selected"
                        >
                          <span
                            class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border"
                            [class.border-[#6F56F6]]="option.selected"
                            [class.bg-[#6F56F6]]="option.selected"
                            [class.border-[#D4D7DE]]="!option.selected"
                            [class.bg-white]="!option.selected"
                          >
                            @if (option.selected) {
                              <ng-icon name="heroCheck" class="text-[10px] text-white"></ng-icon>
                            }
                          </span>
                          <span class="text-[12px] font-medium text-[#202335]">{{ option.label }}</span>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="pt-4">
                    <h3 class="text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">How much are you selling for?</h3>

                    <div class="mt-4 space-y-6">
                      <div class="space-y-2">
                        <label class="text-[12px] font-medium text-[#3F4452]">Price</label>
                        <div class="relative">
                          <input
                            type="number"
                            value="2500000"
                            class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pl-9 text-[12px] font-medium text-[#202335] outline-none"
                          >
                          <span class="pointer-events-none absolute left-4 top-[14px] text-[12px] font-medium text-[#9BA0AA]">₦</span>
                        </div>
                      </div>

                      <div class="space-y-5">
                        <div class="flex items-start justify-between gap-4">
                          <div class="min-w-0">
                            <h4 class="text-[12px] font-medium text-[#202335]">Add discount</h4>
                            <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Let your buyers know if you are running a discount</p>
                          </div>
                          <button
                            type="button"
                            class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full bg-[#E4E6EB]"
                          >
                            <span class="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm"></span>
                          </button>
                        </div>

                        <div class="flex items-start justify-between gap-4">
                          <div class="min-w-0">
                            <h4 class="text-[12px] font-medium text-[#202335]">Accept offers from buyers</h4>
                            <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Buyers can submit price offers for your review</p>
                          </div>
                          <button
                            type="button"
                            class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full bg-[#E4E6EB]"
                          >
                            <span class="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm"></span>
                          </button>
                        </div>

                        <div class="flex items-start justify-between gap-4">
                          <div class="min-w-0">
                            <h4 class="text-[12px] font-medium text-[#202335]">List this item for free</h4>
                            <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Give this item away for free</p>
                          </div>
                          <button
                            type="button"
                            class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full bg-[#E4E6EB]"
                          >
                            <span class="absolute left-[2px] top-[2px] h-5 w-5 rounded-full bg-white shadow-sm"></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              }
            </section>
          </div>

          <div class="absolute inset-x-0 bottom-0 border-t border-[#ECEEF4] bg-white px-4 pb-6 pt-3">
            <button
              type="button"
              (click)="closeEditSheet()"
              class="inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#6F56F6] px-6 py-4 text-[15px] font-medium text-white shadow-[0_16px_28px_-18px_rgba(111,86,246,0.95)]"
            >
              Save changes
            </button>
          </div>
        </section>
      }

      @if (isMarkSoldSheetOpen()) {
        <div
          class="fixed inset-0 z-[70] bg-black/20"
          (click)="closeMarkSoldSheet()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[34px] bg-white px-4 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)]"
          aria-label="Mark listing as sold"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeMarkSoldSheet()"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close mark sold confirmation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="mt-6">
            <div class="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#FFF8E7]">
              <div class="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#F9EBAA] text-[#B79C00]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.492-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 10-2 0 1 1 0 002 0zm-1-6a.75.75 0 00-.75.75v3.5a.75.75 0 001.5 0v-3.5A.75.75 0 0010 7z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <h2 class="mt-5 max-w-[300px] text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Mark this item as sold?</h2>
            <p class="mt-3 max-w-[330px] text-[13px] leading-7 text-[#6B7280]">
              This listing will be moved to your Sold items and removed from active listings. You won’t be able to mark it as available again.
            </p>

            <button
              type="button"
              (click)="confirmMarkSold()"
              class="mt-10 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#6F56F6] px-6 py-4 text-[15px] font-medium text-white shadow-[0_16px_28px_-18px_rgba(111,86,246,0.95)]"
            >
              Mark as sold
            </button>
          </div>
        </section>
      }

      @if (isDeleteSheetOpen()) {
        <div
          class="fixed inset-0 z-[70] bg-black/20"
          (click)="closeDeleteSheet()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[34px] bg-white px-4 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)]"
          aria-label="Delete listing confirmation"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeDeleteSheet()"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close delete confirmation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="mt-6">
            <div class="flex h-[120px] w-[120px] items-center justify-center rounded-full bg-[#FFF1F1]">
              <div class="flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#FFD9D9] text-[#FF2B2B]">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M8.75 2.5a1.25 1.25 0 00-1.179.833L7.29 4.25H5.75a.75.75 0 000 1.5h.296l.74 8.144A2.25 2.25 0 009.03 16h1.94a2.25 2.25 0 002.244-2.106l.74-8.144h.296a.75.75 0 000-1.5H12.71l-.281-.917A1.25 1.25 0 0011.25 2.5h-2.5zm2.5 1.5h-2.5l-.077.25h2.654l-.077-.25zM9 8a.75.75 0 011.5 0v4.5A.75.75 0 019 12.5V8zm-2.25.75a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm5.25-.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V8z" clip-rule="evenodd"/>
                </svg>
              </div>
            </div>

            <h2 class="mt-5 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Delete listing</h2>
            <p class="mt-3 max-w-[320px] text-[13px] leading-7 text-[#6B7280]">
              Are you sure you want to delete this listing? This action cannot be undone.
            </p>

            <button
              type="button"
              (click)="confirmDeleteListing()"
              class="mt-10 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-[#FF2B2B] px-6 py-4 text-[15px] font-medium text-white shadow-[0_16px_28px_-18px_rgba(255,43,43,0.95)]"
            >
              Yes, delete
            </button>
          </div>
        </section>
      }

      @if (isStatusSheetOpen()) {
        <div
          class="fixed inset-0 z-[70] bg-black/20"
          (click)="closeStatusSheet()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[34px] bg-white px-4 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)]"
          aria-label="Update listing status"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeStatusSheet()"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close status sheet"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <h2 class="mt-3 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Update status</h2>

          <div class="mt-5 space-y-5 pb-2">
            @for (status of statusOptions; track status.value) {
              <button
                type="button"
                (click)="handleStatusSelection(status)"
                class="flex w-full items-center justify-between gap-4 text-left text-[#202335]"
              >
                <span class="flex items-center gap-3">
                  @if (status.value === 'Available') {
                    <ng-icon name="heroCalendarDays" class="text-[18px]"></ng-icon>
                  } @else if (status.value === 'Paused') {
                    <ng-icon name="heroSquare3Stack3d" class="text-[18px]"></ng-icon>
                  } @else {
                    <ng-icon name="heroCheck" class="text-[18px]"></ng-icon>
                  }
                  <span class="text-[16px] font-medium">{{ status.label }}</span>
                </span>

                @if (listing().status === status.value) {
                  <span class="rounded-full bg-[#F3F0EA] px-3 py-1 text-[12px] font-medium text-[#4D4F56]">Current</span>
                }
              </button>
            }
          </div>
        </section>
      }

      @if (isActionSheetOpen()) {
        <div
          class="fixed inset-0 z-[70] bg-black/20"
          (click)="closeActionSheet()"
          aria-hidden="true"
        ></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[34px] bg-white px-4 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)]"
          aria-label="Listing actions"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeActionSheet()"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close listing actions"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.22 4.22a.75.75 0 011.06 0L10 8.94l4.72-4.72a.75.75 0 111.06 1.06L11.06 10l4.72 4.72a.75.75 0 11-1.06 1.06L10 11.06l-4.72 4.72a.75.75 0 11-1.06-1.06L8.94 10 4.22 5.28a.75.75 0 010-1.06z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>

          <div class="mt-4 space-y-5 pb-2">
            @for (action of mobileActions(); track action.label) {
              <button
                type="button"
                (click)="handleMobileAction(action.id)"
                class="flex w-full items-center gap-3 text-left"
                [class.text-[#FF3B30]]="action.id === 'delete'"
                [class.text-[#202335]]="action.id !== 'delete'"
              >
                @if (action.id === 'share') {
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[18px]"></ng-icon>
                } @else if (action.id === 'edit') {
                  <ng-icon name="heroTag" class="text-[18px]"></ng-icon>
                } @else if (action.id === 'pause' || action.id === 'resume') {
                  <ng-icon name="heroSquare3Stack3d" class="text-[18px]"></ng-icon>
                } @else {
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M8.75 2.5a1.25 1.25 0 00-1.179.833L7.29 4.25H5.75a.75.75 0 000 1.5h.296l.74 8.144A2.25 2.25 0 009.03 16h1.94a2.25 2.25 0 002.244-2.106l.74-8.144h.296a.75.75 0 000-1.5H12.71l-.281-.917A1.25 1.25 0 0011.25 2.5h-2.5zm2.5 1.5h-2.5l-.077.25h2.654l-.077-.25zM9 8a.75.75 0 011.5 0v4.5A.75.75 0 019 12.5V8zm-2.25.75a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0v-3zm5.25-.75a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0V8z" clip-rule="evenodd"/>
                  </svg>
                }
                <span class="text-[16px] font-medium">{{ action.label }}</span>
              </button>
            }
          </div>
        </section>
      }

      <div class="flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <a
            routerLink="/listings"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F5F7] text-[#202335]"
            aria-label="Back to listings"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M11.78 4.22a.75.75 0 010 1.06L7.06 10l4.72 4.72a.75.75 0 11-1.06 1.06l-5.25-5.25a.75.75 0 010-1.06l5.25-5.25a.75.75 0 011.06 0z" clip-rule="evenodd"/>
            </svg>
          </a>
          <h1 class="text-[14px] font-semibold text-[#202335]">Listing details</h1>
        </div>

        <button
          type="button"
          (click)="openActionSheet()"
          class="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#202335]"
          aria-label="Listing actions"
        >
          <ng-icon name="heroEllipsisHorizontal" class="text-[20px]"></ng-icon>
        </button>
      </div>

      <div class="mt-7 flex items-start gap-3">
        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#F3F4F7]">
          <img [src]="listing().previewImage" [alt]="listing().name" class="h-full w-full object-cover">
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <h2 class="truncate text-[14px] font-semibold text-[#202335]">{{ listing().name }}</h2>
              <p class="mt-1 text-[11px] text-[#8A8F9A]">Last updated on: {{ listing().lastUpdated }}</p>
            </div>

            @if (listing().status === 'Available' || listing().status === 'Paused') {
              <button
                type="button"
                (click)="showPromoteListingModal.set(true)"
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E7E9EF] bg-white text-[#202335] shadow-[0_10px_20px_-22px_rgba(31,36,48,0.4)]"
                aria-label="Promote listing"
              >
                <ng-icon name="heroRocketLaunch" class="text-[16px]"></ng-icon>
              </button>
            }
          </div>
        </div>
      </div>

      @if (listing().status === 'Available' || listing().status === 'Paused') {
        <div class="mt-5 flex items-center gap-3">
          @if (listing().status === 'Available') {
            <button
              type="button"
              (click)="showPromoteListingModal.set(true)"
              class="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#6F56F6] px-5 py-3 text-[12px] font-medium text-white shadow-[0_18px_28px_-18px_rgba(111,86,246,0.95)]"
            >
              <ng-icon name="heroRocketLaunch" class="text-[14px]"></ng-icon>
              Promote listing
            </button>
          }

          <button
            type="button"
            (click)="openStatusSheet()"
            class="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#E7E9EF] bg-white px-5 py-3 text-[12px] font-medium text-[#202335] shadow-[0_10px_20px_-22px_rgba(31,36,48,0.4)]"
          >
            <span>Status:
              <span
                [class.text-[#F19A1A]]="listing().status === 'Available'"
                [class.text-[#5E44EE]]="listing().status === 'Paused'"
              >
                {{ listing().status }}
              </span>
            </span>
            <ng-icon name="heroChevronDown" class="text-[16px] text-[#8A8F9A]"></ng-icon>
          </button>
        </div>
      } @else if (listing().status === 'Sold') {
        <div class="mt-5">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#EEFCEB] px-3 py-1.5 text-[10px] font-medium text-[#2F9E44]">
            <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
            Sold
          </span>
        </div>
      } @else if (listing().status === 'Suspended') {
        <div class="mt-5 space-y-3">
          <span class="inline-flex items-center gap-1.5 rounded-full bg-[#FFF0F0] px-3 py-1.5 text-[10px] font-medium text-[#FF3B30]">
            <span class="inline-block h-2 w-2 rounded-full bg-current"></span>
            Suspended
          </span>

          <div class="rounded-[14px] bg-[#FFFBEA] px-4 py-3 text-[11px] leading-5 text-[#6B5C2E]">
            <span class="font-medium">Reason:</span> "{{ listing().suspensionReason }}"
          </div>
        </div>
      }

      <div class="mt-7 flex items-center gap-6 border-b border-[#EAECEF]">
        @for (tab of tabs; track tab.id) {
          <button
            type="button"
            (click)="activeTab.set(tab.id)"
            class="relative flex items-center gap-1.5 pb-3 text-[12px] font-medium transition-colors"
            [class.text-[#6F56F6]]="activeTab() === tab.id"
            [class.text-[#8A8F9A]]="activeTab() !== tab.id"
          >
            <ng-icon [name]="tab.icon" class="text-[14px]"></ng-icon>
            {{ tab.label }}
            @if (activeTab() === tab.id) {
              <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full bg-[#6F56F6]"></span>
            }
          </button>
        }
      </div>

      @if (activeTab() === 'overview') {
        <div class="mt-4 space-y-6">
          <div class="flex gap-3 overflow-x-auto pb-1">
            @for (image of listing().gallery; track image.src) {
              <button
                type="button"
                (click)="activeImage.set(image.src)"
                class="h-[156px] w-[145px] shrink-0 overflow-hidden rounded-[18px] bg-[#F4F5F8]"
                [class.ring-2]="activeImage() === image.src"
                [class.ring-[#6F56F6]]="activeImage() === image.src"
              >
                <img [src]="image.src" [alt]="image.alt" class="h-full w-full object-cover">
              </button>
            }
          </div>

          <div>
            <h2 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">{{ listing().name }}</h2>
            <p class="mt-1 text-[12px] text-[#8A8F9A]">{{ listing().location }}</p>
          </div>

          <div class="grid grid-cols-4 rounded-[18px] border border-[#E7E9EF] bg-white">
            <div class="px-3 py-3">
              <p class="text-[10px] text-[#8A8F9A]">Date posted</p>
              <p class="mt-1 text-[10px] font-medium text-[#202335]">{{ listing().datePosted }}</p>
            </div>
            <div class="border-l border-[#E7E9EF] px-3 py-3">
              <p class="text-[10px] text-[#8A8F9A]">Messages</p>
              <p class="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#202335]">
                <ng-icon name="heroChatBubbleLeftRight" class="text-[12px] text-[#8A8F9A]"></ng-icon>
                {{ listing().messages }}
              </p>
            </div>
            <div class="border-l border-[#E7E9EF] px-3 py-3">
              <p class="text-[10px] text-[#8A8F9A]">Views</p>
              <p class="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#202335]">
                <ng-icon name="heroEye" class="text-[12px] text-[#8A8F9A]"></ng-icon>
                {{ listing().views }}
              </p>
            </div>
            <div class="border-l border-[#E7E9EF] px-3 py-3">
              <p class="text-[10px] text-[#8A8F9A]">Saves</p>
              <p class="mt-1 flex items-center gap-1 text-[10px] font-medium text-[#202335]">
                <ng-icon name="heroHeart" class="text-[12px] text-[#8A8F9A]"></ng-icon>
                {{ listing().saves }}
              </p>
            </div>
          </div>

          <div class="rounded-[22px] border border-[#E7E9EF] bg-white">
            <div class="flex items-start justify-between border-b border-[#E7E9EF] px-4 py-4">
              <div>
                <p class="text-[12px] text-[#8A8F9A]">Price</p>
                <p class="mt-2 text-[18px] font-semibold text-[#202335]">₦{{ listing().price }}</p>
              </div>
              <button type="button" class="text-[#202335]" aria-label="Edit listing price">
                <ng-icon name="heroTag" class="text-[18px]"></ng-icon>
              </button>
            </div>

            <div class="px-4 py-4">
              <p class="mb-3 text-[12px] text-[#8A8F9A]">Store</p>
              <div class="flex items-center justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#E7F1EA]">
                    <img [src]="listing().store.logo" [alt]="listing().store.name" class="h-full w-full object-cover">
                  </div>
                  <div class="min-w-0 flex items-center gap-1.5">
                    <span class="truncate text-[13px] font-medium text-[#202335]">{{ listing().store.name }}</span>
                    <span class="text-[#6F56F6]">✦</span>
                  </div>
                </div>
                <button type="button" class="text-[#202335]" aria-label="Open store">
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[18px]"></ng-icon>
                </button>
              </div>
            </div>
          </div>

          <div class="border-b border-[#EAECEF] pb-6">
            <h3 class="text-[16px] font-semibold text-[#202335]">Description</h3>
            <p class="mt-3 text-[12px] leading-7 text-[#6B7280]">
              {{ listing().description }}
            </p>
            <button type="button" class="mt-2 text-[12px] font-medium text-[#202335] underline underline-offset-2">
              Show more
            </button>
          </div>

          <div>
            <h3 class="text-[16px] font-semibold text-[#202335]">General details</h3>
            <div class="mt-6 grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-4">
              @for (detail of details(); track detail.label) {
                <div class="text-[12px] text-[#8A8F9A]">{{ detail.label }}</div>
                <div class="text-right text-[12px] font-medium leading-6 text-[#202335]">{{ detail.value }}</div>
              }
            </div>
          </div>
        </div>
      }

      @if (activeTab() === 'requests') {
        <div class="mt-5 space-y-4">
          @for (request of requests(); track request.id) {
            <div class="rounded-[18px] border border-[#E7E9EF] bg-white p-4">
              <div class="flex items-start gap-3">
                <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gray-100">
                  <img [src]="request.avatar" [alt]="request.buyer" class="h-full w-full object-cover">
                </div>
                <div class="min-w-0">
                  <div class="flex items-center gap-2">
                    <p class="text-[13px] font-medium text-[#202335]">{{ request.buyer }}</p>
                    <span
                      class="rounded-full px-2 py-1 text-[9px] font-medium"
                      [class.bg-[#EEFCEB]]="request.status === 'New'"
                      [class.text-[#2F9E44]]="request.status === 'New'"
                      [class.bg-[#F4F3FF]]="request.status === 'Responded'"
                      [class.text-[#5E44EE]]="request.status === 'Responded'"
                    >
                      {{ request.status }}
                    </span>
                  </div>
                  <p class="mt-1 text-[12px] leading-6 text-[#6B7280]">{{ request.message }}</p>
                  <div class="mt-3 flex flex-wrap gap-4 text-[11px] text-[#8A8F9A]">
                    <span>{{ request.time }}</span>
                    <span>Offer: {{ request.offer }}</span>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (activeTab() === 'activities') {
        <div class="mt-5 space-y-4">
          @for (activity of activities(); track activity.id) {
            <div class="rounded-[18px] border border-[#E7E9EF] bg-white p-4">
              <div class="flex items-start gap-3">
                <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4F3FF] text-[#5E44EE]">
                  <ng-icon name="heroClipboardDocumentList" class="text-[16px]"></ng-icon>
                </div>
                <div>
                  <p class="text-[13px] font-medium text-[#202335]">{{ activity.title }}</p>
                  <p class="mt-1 text-[12px] leading-6 text-[#6B7280]">{{ activity.description }}</p>
                  <p class="mt-3 text-[11px] text-[#8A8F9A]">{{ activity.time }}</p>
                </div>
              </div>
            </div>
          }
        </div>
      }
    </div>

    <div class="mx-auto hidden max-w-7xl pb-12 md:block">
      <div class="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <nav class="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <a routerLink="/listings" class="transition-colors hover:text-purple-600">Listings</a>
          <span>/</span>
          <span class="font-medium text-gray-700">Listing details</span>
        </nav>

        <div class="mb-8 flex flex-col gap-6 border-b border-gray-100 pb-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="flex items-start gap-4">
            <div class="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <img [src]="listing().previewImage" [alt]="listing().name" class="h-full w-full object-cover">
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-[22px] font-semibold tracking-tight text-[#1A1C21] md:text-[24px]">
                  {{ listing().name }}
                </h1>
                @if (listing().isPromoted) {
                  <span class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1A1C21] shadow-sm">
                    <span class="text-base leading-none">🚀</span>
                    Promoted
                  </span>
                }
              </div>
              <p class="mt-1 text-[15px] text-gray-400">Last updated on: {{ listing().lastUpdated }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="showPromoteListingModal.set(true)"
              class="inline-flex items-center gap-2 rounded-full bg-[#5E44EE] px-6 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(94,68,238,0.28)] transition-colors hover:bg-[#5036e1]"
            >
              <ng-icon name="heroRocketLaunch" class="text-base"></ng-icon>
              Promote listing
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#1A1C21] shadow-sm transition-colors hover:bg-gray-50"
            >
              <span>Status: <span class="font-medium text-[#F59E0B]">{{ listing().status }}</span></span>
              <ng-icon name="heroChevronDown" class="text-base text-gray-400"></ng-icon>
            </button>

            <button
              type="button"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Listing actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-xl"></ng-icon>
            </button>
          </div>
        </div>

        <div class="mb-7 flex items-center gap-8 border-b border-gray-100">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="activeTab.set(tab.id)"
              class="relative flex items-center gap-2 pb-4 text-[15px] font-medium transition-colors"
              [class.text-[#5E44EE]]="activeTab() === tab.id"
              [class.text-gray-400]="activeTab() !== tab.id"
            >
              <ng-icon [name]="tab.icon" class="text-base"></ng-icon>
              {{ tab.label }}
              @if (activeTab() === tab.id) {
                <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full bg-[#5E44EE]"></span>
              }
            </button>
          }
        </div>

        @if (activeTab() === 'overview') {
          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              @for (image of listing().gallery; track image.src) {
                <button
                  type="button"
                  (click)="activeImage.set(image.src)"
                  class="relative overflow-hidden rounded-[22px] bg-[#F5F5F7] transition-all"
                  [class.ring-2]="activeImage() === image.src"
                  [class.ring-[#5E44EE]]="activeImage() === image.src"
                >
                  <div class="relative aspect-[1/1.15] w-full">
                    <img [src]="image.src" [alt]="image.alt" class="h-full w-full object-cover">
                  </div>
                </button>
              }
            </div>

            <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div class="space-y-8">
                <div>
                  <h2 class="text-[26px] font-semibold tracking-tight text-[#1A1C21]">{{ listing().name }}</h2>
                  <div class="mt-2 flex items-center gap-2 text-[15px] text-gray-500">
                    <ng-icon name="heroMapPin" class="text-base"></ng-icon>
                    {{ listing().location }}
                  </div>
                </div>

                <div class="grid gap-4 rounded-[24px] border border-gray-100 p-5 md:grid-cols-4">
                  <div class="space-y-2">
                    <p class="text-[13px] text-gray-400">Date posted</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroCalendarDays" class="text-base text-gray-400"></ng-icon>
                      {{ listing().datePosted }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Messages</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroChatBubbleLeftRight" class="text-base text-gray-400"></ng-icon>
                      {{ listing().messages }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Views</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroEye" class="text-base text-gray-400"></ng-icon>
                      {{ listing().views }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Saves</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroHeart" class="text-base text-gray-400"></ng-icon>
                      {{ listing().saves }}
                    </div>
                  </div>
                </div>

                <div class="border-b border-gray-100 pb-8">
                  <h3 class="mb-4 text-[17px] font-semibold text-[#1A1C21]">Description</h3>
                  <p class="max-w-3xl text-[15px] leading-8 text-gray-600">
                    {{ listing().description }}
                  </p>
                  <button type="button" class="mt-2 text-[15px] font-medium text-[#1A1C21] underline underline-offset-4">
                    Show more
                  </button>
                </div>

                <div>
                  <h3 class="mb-6 text-[17px] font-semibold text-[#1A1C21]">General details</h3>
                  <div class="grid gap-y-6 md:grid-cols-[220px_minmax(0,1fr)]">
                    @for (detail of details(); track detail.label) {
                      <div class="text-[15px] text-gray-400">{{ detail.label }}</div>
                      <div class="text-[15px] font-medium text-[#1A1C21]">{{ detail.value }}</div>
                    }
                  </div>
                </div>
              </div>

              <aside class="space-y-6">
                <div class="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div class="flex items-start justify-between border-b border-gray-100 pb-5">
                    <div>
                      <p class="mb-2 text-[13px] text-gray-400">Price</p>
                      <p class="text-[21px] font-semibold text-[#1A1C21]">₦{{ listing().price }}</p>
                    </div>
                    <button type="button" class="text-gray-500 transition-colors hover:text-gray-700" aria-label="Edit listing price">
                      <ng-icon name="heroTag" class="text-xl"></ng-icon>
                    </button>
                  </div>

                  <div class="pt-5">
                    <p class="mb-4 text-[13px] text-gray-400">Store</p>
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-[#E7F1EA]">
                          <img [src]="listing().store.logo" [alt]="listing().store.name" class="h-full w-full object-cover">
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="text-[15px] font-medium text-[#1A1C21]">{{ listing().store.name }}</span>
                          <span class="text-[#5E44EE]">✦</span>
                        </div>
                      </div>
                      <button type="button" class="text-gray-500 transition-colors hover:text-gray-700" aria-label="Open store">
                        <ng-icon name="heroArrowTopRightOnSquare" class="text-xl"></ng-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        }

        @if (activeTab() === 'requests') {
          <div class="space-y-4">
            <div class="rounded-[24px] border border-gray-100 bg-[#FAFAFA] p-5">
              <h3 class="text-[17px] font-semibold text-[#1A1C21]">Buyer requests</h3>
              <p class="mt-1 text-[14px] text-gray-400">Incoming questions and offers for this listing.</p>
            </div>

            @for (request of requests(); track request.id) {
              <div class="rounded-[24px] border border-gray-100 p-5 transition-colors hover:bg-gray-50">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div class="h-11 w-11 overflow-hidden rounded-full bg-gray-100">
                      <img [src]="request.avatar" [alt]="request.buyer" class="h-full w-full object-cover">
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="text-[15px] font-medium text-[#1A1C21]">{{ request.buyer }}</p>
                        <span
                          class="rounded-full px-2 py-1 text-[10px] font-medium"
                          [class.bg-[#EEFCEB]]="request.status === 'New'"
                          [class.text-[#2F9E44]]="request.status === 'New'"
                          [class.bg-[#F4F3FF]]="request.status === 'Responded'"
                          [class.text-[#5E44EE]]="request.status === 'Responded'"
                        >
                          {{ request.status }}
                        </span>
                      </div>
                      <p class="mt-1 text-[14px] leading-6 text-gray-500">{{ request.message }}</p>
                      <div class="mt-3 flex items-center gap-6 text-[13px] text-gray-400">
                        <span>{{ request.time }}</span>
                        <span>Offer: {{ request.offer }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'activities') {
          <div class="space-y-4">
            <div class="rounded-[24px] border border-gray-100 bg-[#FAFAFA] p-5">
              <h3 class="text-[17px] font-semibold text-[#1A1C21]">Listing activities</h3>
              <p class="mt-1 text-[14px] text-gray-400">Recent actions and changes made on this listing.</p>
            </div>

            @for (activity of activities(); track activity.id) {
              <div class="rounded-[24px] border border-gray-100 p-5 transition-colors hover:bg-gray-50">
                <div class="flex items-start gap-4">
                  <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F3FF] text-[#5E44EE]">
                    <ng-icon name="heroClipboardDocumentList" class="text-lg"></ng-icon>
                  </div>
                  <div>
                    <p class="text-[15px] font-medium text-[#1A1C21]">{{ activity.title }}</p>
                    <p class="mt-1 text-[14px] leading-6 text-gray-500">{{ activity.description }}</p>
                    <p class="mt-3 text-[13px] text-gray-400">{{ activity.time }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

    @if (showPromoteListingModal()) {
      <app-promote-listing-modal
        (close)="showPromoteListingModal.set(false)"
        (promoted)="markListingAsPromoted()"
      ></app-promote-listing-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected readonly activeTab = signal<'overview' | 'requests' | 'activities'>('overview');
  protected readonly showPromoteListingModal = signal(false);
  protected readonly isActionSheetOpen = signal(false);
  protected readonly isStatusSheetOpen = signal(false);
  protected readonly isDeleteSheetOpen = signal(false);
  protected readonly isMarkSoldSheetOpen = signal(false);
  protected readonly isEditSheetOpen = signal(false);
  protected readonly openEditSections = signal<Array<'media' | 'details' | 'delivery'>>(['media']);

  protected readonly listing = signal({
    id: this.listingId(),
    name: 'Iphone 17 pro max',
    previewImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=240&h=240&fit=crop',
    lastUpdated: '24 January, 2026',
    isPromoted: true,
    status: 'Available' as 'Available' | 'Paused' | 'Sold' | 'Suspended',
    location: 'Ikeja, Lagos',
    datePosted: '14 Feb, 2026',
    messages: 12,
    views: '3,990',
    saves: 200,
    price: '2,500,000',
    description: 'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Battery health is strong and the device comes exactly as shown in the photos.',
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=700&h=820&fit=crop',
        alt: 'Iphone front view',
      },
      {
        src: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&h=820&fit=crop',
        alt: 'Iphone camera close up',
      },
      {
        src: 'https://images.unsplash.com/photo-1603919114330-22c608149887?w=700&h=820&fit=crop',
        alt: 'Iphone in the box',
      },
      {
        src: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=700&h=820&fit=crop',
        alt: 'Iphone display image',
      },
      {
        src: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=700&h=820&fit=crop',
        alt: 'Iphone angled view',
      },
      {
        src: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=700&h=820&fit=crop',
        alt: 'Iphone side angle',
      },
    ],
    store: {
      name: 'The Vine Collections',
      logo: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    },
    suspensionReason: 'The title, description, or price appears misleading or incorrect.',
  });

  protected readonly activeImage = signal(this.listing().gallery[0].src);

  protected readonly tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'heroSquare3Stack3d' },
    { id: 'requests' as const, label: 'Requests', icon: 'heroChatBubbleLeftRight' },
    { id: 'activities' as const, label: 'Activities', icon: 'heroClipboardDocumentList' },
  ];

  protected readonly statusOptions: readonly ListingStatusOption[] = [
    { label: 'Available', value: 'Available' as const },
    { label: 'Pause', value: 'Paused' as const },
    { label: 'Sold', value: 'Sold' as const },
  ] as const;
  protected readonly editDeliveryOptions = [
    { label: 'Buyer pickup', selected: false },
    { label: 'Seller delivery', selected: true },
    { label: 'Public location', selected: false },
    { label: 'Nation-wide', selected: true },
    { label: 'State-wide', selected: false },
    { label: 'International', selected: false },
  ] as const;

  protected readonly details = computed(() => [
    { label: 'Category', value: 'Electronics/Phones & Tablets' },
    { label: 'Condition', value: 'Used' },
    { label: 'Location', value: 'Ikeja, Lagos' },
    { label: 'Delivery options', value: 'Nationwide' },
    { label: 'WhatsApp number', value: '08169397454' },
    { label: 'Call number', value: '08169397454' },
    { label: 'Accept offers', value: 'Yes' },
  ]);

  protected readonly requests = signal<SellerListingRequest[]>([
    {
      id: 'r1',
      buyer: 'John Okafor',
      avatar: 'https://i.pravatar.cc/100?u=john-okafor',
      message: 'Hi, is this still available? I would like to know if you can do a better price.',
      time: 'Today, 7:50 pm',
      offer: '₦2,350,000',
      status: 'New',
    },
    {
      id: 'r2',
      buyer: 'Amaka Eze',
      avatar: 'https://i.pravatar.cc/100?u=amaka-eze',
      message: 'Can you deliver to Lekki tomorrow morning? I am interested and ready to pay immediately.',
      time: 'Yesterday, 5:12 pm',
      offer: '₦2,500,000',
      status: 'Responded',
    },
  ]);

  protected readonly activities = signal<SellerListingActivity[]>([
    {
      id: 'a1',
      title: 'Listing promoted successfully',
      description: 'Your listing started running as a promoted ad across search and category pages.',
      time: '24 January, 2026 at 10:32 AM',
    },
    {
      id: 'a2',
      title: 'Price updated',
      description: 'You changed the listing price from ₦2,700,000 to ₦2,500,000.',
      time: '22 January, 2026 at 4:11 PM',
    },
    {
      id: 'a3',
      title: 'Listing created',
      description: 'This listing was published and made visible to buyers on Duduzili.',
      time: '14 February, 2026 at 9:08 AM',
    },
  ]);

  protected markListingAsPromoted() {
    this.listing.update((listing) => ({
      ...listing,
      isPromoted: true,
    }));
  }

  protected readonly mobileActions = computed(() => {
    switch (this.listing().status) {
      case 'Paused':
        return [
          { id: 'edit', label: 'Edit listing' },
          { id: 'resume', label: 'Resume listing' },
          { id: 'delete', label: 'Delete listing' },
        ] as const;
      case 'Sold':
        return [
          { id: 'edit', label: 'Edit listing' },
          { id: 'delete', label: 'Delete listing' },
        ] as const;
      case 'Suspended':
        return [
          { id: 'edit', label: 'Edit listing' },
        ] as const;
      default:
        return [
          { id: 'share', label: 'Share listing' },
          { id: 'edit', label: 'Edit listing' },
          { id: 'pause', label: 'Pause listing' },
          { id: 'delete', label: 'Delete listing' },
        ] as const;
    }
  });

  protected openActionSheet(): void {
    this.isActionSheetOpen.set(true);
  }

  protected closeActionSheet(): void {
    this.isActionSheetOpen.set(false);
  }

  protected openStatusSheet(): void {
    this.isStatusSheetOpen.set(true);
  }

  protected closeStatusSheet(): void {
    this.isStatusSheetOpen.set(false);
  }

  protected updateStatus(status: 'Available' | 'Paused' | 'Sold'): void {
    this.listing.update((listing) => ({
      ...listing,
      status,
    }));
    this.closeStatusSheet();
  }

  protected handleStatusSelection(status: ListingStatusOption): void {
    if (status.value === 'Sold') {
      this.closeStatusSheet();
      this.openMarkSoldSheet();
      return;
    }

    this.updateStatus(status.value);
  }

  protected openDeleteSheet(): void {
    this.closeActionSheet();
    this.isDeleteSheetOpen.set(true);
  }

  protected closeDeleteSheet(): void {
    this.isDeleteSheetOpen.set(false);
  }

  protected confirmDeleteListing(): void {
    this.closeDeleteSheet();
    void this.router.navigateByUrl('/listings');
  }

  protected openMarkSoldSheet(): void {
    this.closeActionSheet();
    this.isMarkSoldSheetOpen.set(true);
  }

  protected closeMarkSoldSheet(): void {
    this.isMarkSoldSheetOpen.set(false);
  }

  protected confirmMarkSold(): void {
    this.listing.update((listing) => ({
      ...listing,
      status: 'Sold',
    }));
    this.closeMarkSoldSheet();
  }

  protected handleMobileAction(action: 'share' | 'edit' | 'pause' | 'resume' | 'delete'): void {
    if (action === 'edit') {
      this.openEditSheet();
      return;
    }

    if (action === 'delete') {
      this.openDeleteSheet();
      return;
    }

    if (action === 'resume') {
      this.closeActionSheet();
      this.listing.update((listing) => ({
        ...listing,
        status: 'Available',
      }));
      return;
    }

    if (action === 'pause') {
      this.closeActionSheet();
      this.listing.update((listing) => ({
        ...listing,
        status: 'Paused',
      }));
      return;
    }

    this.closeActionSheet();
  }

  protected openEditSheet(): void {
    this.closeActionSheet();
    this.openEditSections.set(['media']);
    this.isEditSheetOpen.set(true);
  }

  protected closeEditSheet(): void {
    this.isEditSheetOpen.set(false);
  }

  protected isEditSectionOpen(section: 'media' | 'details' | 'delivery'): boolean {
    return this.openEditSections().includes(section);
  }

  protected toggleEditSection(section: 'media' | 'details' | 'delivery'): void {
    this.openEditSections.update((sections) =>
      sections.includes(section)
        ? sections.filter((item) => item !== section)
        : [...sections, section],
    );
  }
}
