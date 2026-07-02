import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpTray,
  heroChevronLeft,
  heroComputerDesktop,
  heroDevicePhoneMobile,
  heroExclamationTriangle,
  heroMagnifyingGlassMinus,
  heroMagnifyingGlassPlus,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';
import { SellerMonetizationService } from '../../../services/seller-monetization.service';
import { AppToastService } from '../../../services/app-toast.service';

export interface CreateBannerAdPayload {
  title: string;
  destinationUrl: string;
  bannerType: 'image' | 'video';
  imagePreview: string | null;
  mediaFile: File | null;
}

@Component({
  selector: 'app-create-banner-ad-modal',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroArrowUpTray,
      heroChevronLeft,
      heroComputerDesktop,
      heroDevicePhoneMobile,
      heroExclamationTriangle,
      heroMagnifyingGlassMinus,
      heroMagnifyingGlassPlus,
      heroXMark,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[200] md:bg-black/20 md:p-3 md:backdrop-blur-[2px]"
      (click)="handleBackdropClick()"
    >
      <div class="h-full w-full md:flex md:items-center md:justify-center">
        <div
          class="flex h-full w-full flex-col overflow-hidden bg-white md:rounded-[32px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          [class.md:h-[760px]]="step() === 1"
          [class.md:max-h-[760px]]="step() === 1"
          [class.md:max-h-[92vh]]="step() !== 1"
          [class.md:max-w-[1440px]]="step() === 1"
          [class.md:max-w-[1280px]]="step() !== 1"
          (click)="$event.stopPropagation()"
        >
          <div class="flex h-full flex-col md:hidden">
            @switch (step()) {
              @case (1) {
                <div class="flex min-h-0 flex-1 flex-col">
                  <header class="shrink-0 flex items-center justify-between px-4 pb-3 pt-3.5">
                    <button
                      type="button"
                      (click)="close.emit()"
                      class="inline-flex items-center gap-2 text-left text-[#1A1B1D] transition-all hover:text-black active:scale-95 duration-200"
                      aria-label="Close create ad modal"
                    >
                      <span
                        class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] transition duration-200 hover:bg-[#EAEAEA]"
                      >
                        <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
                      </span>
                      <span class="text-[16px] font-medium leading-6">Create Ad</span>
                    </button>

                    <button
                      type="button"
                      (click)="openPreview()"
                      class="text-[14px] font-medium leading-5 text-[#1A1B1D] underline underline-offset-[3px] transition hover:text-[#6453D9] active:scale-95 duration-200"
                    >
                      Preview
                    </button>
                  </header>

                  <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6 pt-2">
                    <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                      Configure Banner Ad
                    </h1>

                    <div
                      class="mt-4 flex gap-2 rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#5A5B33]"
                    >
                      <img
                        [ngSrc]="createBannerInfoIcon"
                        width="24"
                        height="24"
                        alt=""
                        class="mt-0.5 h-6 w-6 shrink-0 self-start object-contain"
                      />
                      <div>
                        <p class="text-[14px] font-medium leading-5 text-[#212103]">
                          Approval Required
                        </p>
                        <p class="mt-1 text-[12px] leading-[18px] text-[#373737]">
                          All banner ads are reviewed by the Duduzili team before going live.
                        </p>
                      </div>
                    </div>

                    <form [formGroup]="bannerForm" class="mt-6 space-y-9">
                      <section>
                        <h2 class="text-[18px] font-semibold leading-[21.6px] text-[#000000]">
                          General information
                        </h2>

                        <div class="mt-5 space-y-5">
                          <div>
                            <label
                              for="mobile-banner-title"
                              class="mb-2 block text-[14px] font-medium leading-[16.8px] text-[#5A5A5A]"
                              >Ad Title</label
                            >
                            <input
                              id="mobile-banner-title"
                              type="text"
                              formControlName="title"
                              placeholder="e.g Christmas Sale Banner"
                              class="h-12 w-full rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] text-[#0D0D0D] outline-none transition placeholder:tracking-[-0.01em] placeholder:text-[rgba(13,13,13,0.4)] focus:border-[#6453D9] focus:ring-2 focus:ring-[#6453D9]/10"
                            />
                          </div>

                          <div>
                            <label
                              for="mobile-destination-url"
                              class="mb-2 block text-[14px] font-medium leading-[16.8px] text-[#5A5A5A]"
                            >
                              Destination URL
                              <span class="font-normal text-[#8F8F8F]"
                                >(where users will go when they click the banner)</span
                              >
                            </label>
                            <input
                              id="mobile-destination-url"
                              type="url"
                              formControlName="destinationUrl"
                              class="h-12 w-full rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] text-[#0D0D0D] outline-none transition focus:border-[#6453D9] focus:ring-2 focus:ring-[#6453D9]/10"
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <h2 class="text-[18px] font-semibold leading-[21.6px] text-[#000000]">
                          Choose banner type
                        </h2>

                        <div class="mt-5 flex flex-wrap gap-3">
                          @for (option of bannerTypeOptions; track option.value) {
                            <label
                              (click)="setBannerType(option.value)"
                              class="flex min-w-[151px] cursor-pointer items-center gap-2 rounded-[12px] border px-3 py-3 transition hover:border-[#6453D9]/60 hover:bg-[#F9F7FF]/50 active:scale-[0.98] duration-200"
                              [class.border-[#6453D9]]="selectedBannerType() === option.value"
                              [class.bg-[#F9F7FF]]="selectedBannerType() === option.value"
                              [class.border-[#EAEAEA]]="selectedBannerType() !== option.value"
                              [class.bg-[#FAFAFA]]="selectedBannerType() !== option.value"
                              [style.border-width.px]="
                                selectedBannerType() === option.value ? 1.5 : 1
                              "
                            >
                              <input
                                type="radio"
                                class="sr-only"
                                formControlName="bannerType"
                                [value]="option.value"
                                [checked]="selectedBannerType() === option.value"
                              />
                              <span
                                class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                                [class.border-[#6453D9]]="selectedBannerType() === option.value"
                                [class.border-[#D9D9D9]]="selectedBannerType() !== option.value"
                              >
                                @if (selectedBannerType() === option.value) {
                                  <span class="h-2 w-2 rounded-full bg-[#6453D9]"></span>
                                }
                              </span>
                              <span class="text-[14px] leading-5 text-[#1F1F1F]">{{
                                option.label
                              }}</span>
                            </label>
                          }
                        </div>
                      </section>

                      <section>
                        <h2 class="text-[18px] font-semibold leading-6 text-[#0D0D0D]">
                          {{ bannerTypeUploadLabel() }}
                        </h2>
                        <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.8)]">
                          {{ bannerTypeUploadRecommendation() }}
                        </p>

                        <div class="mt-5">
                          <input
                            #mobileFileInput
                            type="file"
                            [accept]="bannerTypeUploadAccept()"
                            class="sr-only"
                            (change)="onFileSelected($event)"
                          />

                          <button
                            type="button"
                            (click)="mobileFileInput.click()"
                            [disabled]="isSubmitting()"
                            class="flex min-h-[126px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#D8D8D8] bg-[#F9F9F9] px-4 py-5 text-center transition hover:border-[#B9B7F8] hover:bg-[#FBFAFF] focus:outline-none focus:ring-2 focus:ring-[#7868F3]/10 active:scale-[0.99] duration-200 disabled:opacity-75 disabled:pointer-events-none"
                          >
                            @if (imagePreview()) {
                              <div class="flex w-full max-w-[240px] flex-col items-center gap-3">
                                <div
                                  class="w-full overflow-hidden rounded-[12px] border border-[#E6E8ED] bg-white p-1.5 shadow-sm"
                                >
                                  <img
                                    [src]="imagePreview()!"
                                    alt="Selected banner preview"
                                    class="h-auto w-full rounded-[10px] object-cover"
                                  />
                                </div>
                                <span
                                  class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-[#000000] shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                                >
                                  <img
                                    [ngSrc]="bannerTypeUploadIcon()"
                                    width="14"
                                    height="14"
                                    alt=""
                                  />
                                  Change file
                                </span>
                              </div>
                            } @else {
                              <span
                                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-[#000000] shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                              >
                                <img
                                  [ngSrc]="bannerTypeUploadIcon()"
                                  width="14"
                                  height="14"
                                  alt=""
                                />
                                Add file
                              </span>
                              <span class="mt-3 text-[12px] tracking-[-0.01em] text-[#848484]">{{
                                bannerTypeUploadHelper()
                              }}</span>
                            }
                          </button>
                        </div>
                      </section>
                    </form>
                  </div>

                  <footer class="sticky bottom-0 z-10 shrink-0 border-t border-[#EDEDED] bg-white px-5 py-[10px] shadow-[0_-12px_32px_-28px_rgba(15,23,42,0.45)]">
                    <div class="flex items-center gap-2">
                      <button
                        type="button"
                        (click)="close.emit()"
                        [disabled]="isSubmitting()"
                        class="h-[52px] min-w-0 flex-1 rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.031em] text-[#05061A] transition hover:bg-[#EAEAEA] active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        (click)="submitForm()"
                        [disabled]="bannerForm.invalid || !selectedMediaFile() || isSubmitting()"
                        class="h-[52px] w-[205px] rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium text-white shadow-[0_4px_12px_0_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5341C6] hover:shadow-[0_6px_16px_0_rgba(81,35,173,0.45),0_0_0_1px_#6B5BD5] active:scale-95 duration-200 disabled:cursor-not-allowed disabled:bg-[#D7D1FB] disabled:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                      >
                        @if (isSubmitting()) {
                          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        }
                        Submit for approval
                      </button>
                    </div>
                  </footer>
                </div>
              }

              @case (2) {
                <div class="flex min-h-0 flex-1 flex-col">
                  <header class="flex items-center justify-between px-4 pb-4 pt-5">
                    <button
                      type="button"
                      (click)="step.set(1)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A] transition hover:bg-[#E8EAEE] active:scale-95 duration-200"
                      aria-label="Back to create ad form"
                    >
                      <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
                    </button>

                    <span class="text-[13px] font-medium text-[#202335]">Preview</span>

                    <button
                      type="button"
                      (click)="close.emit()"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] transition hover:bg-[#F5F6FA] active:scale-95 duration-200"
                      aria-label="Close preview"
                    >
                      <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                    </button>
                  </header>

                  <div class="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-2">
                    <p class="text-[10px] text-[#A3A6AE]">
                      This is how your banner ad will appear to buyers
                    </p>

                    <div class="mt-6 flex items-center gap-5 text-[#707583]">
                      <button
                        type="button"
                        class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7ED] bg-white transition hover:bg-[#F5F6FA] active:scale-95 duration-200"
                      >
                        <ng-icon name="heroMagnifyingGlassMinus" class="text-[13px]"></ng-icon>
                      </button>
                      <button
                        type="button"
                        class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7ED] bg-white transition hover:bg-[#F5F6FA] active:scale-95 duration-200"
                      >
                        <ng-icon name="heroMagnifyingGlassPlus" class="text-[13px]"></ng-icon>
                      </button>
                    </div>

                    <div
                      class="mt-6 w-[210px] overflow-hidden rounded-[24px] border border-[#ECEEF4] bg-white p-2 shadow-[0_18px_40px_-28px_rgba(31,36,48,0.3)]"
                    >
                      <div
                        class="overflow-hidden rounded-[18px] border border-[#ECEDEF] bg-[#FCFCFD]"
                      >
                        <div class="flex items-center justify-between bg-[#1D1E22] px-2.5 py-1">
                          <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
                          <div class="h-1.5 w-14 rounded-full bg-white/25"></div>
                          <div class="h-2 w-4 rounded-full bg-white"></div>
                        </div>

                        <div class="space-y-3 bg-white p-2">
                          <div class="grid grid-cols-4 gap-1.5 opacity-35 blur-[1px]">
                            @for (item of skeletonItems; track item) {
                              <div class="space-y-1">
                                <div class="aspect-square rounded-[6px] bg-[#ECEEF2]"></div>
                                <div class="h-1 rounded-full bg-[#ECEEF2]"></div>
                              </div>
                            }
                          </div>

                          <div
                            class="overflow-hidden rounded-[10px] border border-[#ECEDEF] bg-white"
                          >
                            <div
                              class="relative aspect-[3.85/1] w-full"
                              [style.background]="previewBannerBackground()"
                            >
                              @if (imagePreview()) {
                                <img
                                  [src]="imagePreview()!"
                                  alt="Banner artwork preview"
                                  class="absolute inset-0 h-full w-full object-cover"
                                />
                              } @else {
                                <div
                                  class="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-center px-2 text-white"
                                >
                                  <span
                                    class="text-[0.3rem] font-black uppercase tracking-[0.18em] opacity-85"
                                    >Sponsored</span
                                  >
                                  <span class="mt-0.5 text-[0.58rem] font-black leading-none">{{
                                    previewHeadline()
                                  }}</span>
                                  <span
                                    class="mt-1 text-[0.34rem] font-semibold uppercase tracking-[0.1em] opacity-90"
                                    >{{ previewSubline() }}</span
                                  >
                                </div>
                              }

                              <div
                                class="absolute left-1 top-1 rounded-full bg-[#23252C]/70 px-1.5 py-0.5 text-[0.28rem] font-semibold text-white backdrop-blur-sm"
                              >
                                Sponsored
                              </div>
                            </div>

                            <div
                              class="flex items-center gap-3 px-2 py-1 text-[0.42rem] font-medium text-[#A3A6AE]"
                            >
                              <span class="inline-flex items-center gap-1">
                                <span class="h-1 w-1 rounded-full bg-[#D0D4DC]"></span>
                                1K
                              </span>
                              <span class="inline-flex items-center gap-1">
                                <span class="h-1 w-1 rounded-full bg-[#D0D4DC]"></span>
                                500
                              </span>
                            </div>
                          </div>

                          <div
                            class="h-9 rounded-t-[10px] bg-[linear-gradient(180deg,#F2F0FF_0%,#EFEAFF_45%,#E5DEFF_100%)] opacity-80"
                          ></div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="submitForm()"
                      [disabled]="isSubmitting()"
                      class="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5642D3] hover:shadow-[0_18px_36px_-14px_rgba(102,83,228,1.0)] active:scale-95 duration-200 disabled:pointer-events-none disabled:opacity-50"
                    >
                      @if (isSubmitting()) {
                        <svg class="-ml-1 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      Submit for approval
                    </button>
                  </div>
                </div>
              }

              @default {
                <div class="flex flex-1 items-center justify-center px-5 py-10 text-center">
                  <div class="w-full max-w-[350px]">
                    <img
                      [ngSrc]="bannerReviewSuccessMobileImage"
                      width="150"
                      height="150"
                      alt="Banner submitted for review"
                      class="mx-auto h-[150px] w-[150px]"
                    />

                    <h2 class="mt-6 text-[28px] font-semibold leading-[1.1] text-[#0D0D0D]">
                      Banner submitted for review
                    </h2>

                    <p class="mt-2 text-[16px] leading-6 text-[#747474]">
                      Your banner ad has been submitted and is awaiting approval from the Duduzili
                      team. Once approved, it will start appearing across the platform.
                    </p>

                    <div class="mt-11 flex w-full flex-col gap-3">
                      <button
                        type="button"
                        (click)="resetFlow()"
                        [disabled]="isSubmitting()"
                        class="h-[52px] rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.031em] text-[#05061A] transition hover:bg-[#EAEAEA] active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                      >
                        Create another Ad
                      </button>
                      <button
                        type="button"
                        (click)="finishAndClose()"
                        [disabled]="isSubmitting()"
                        class="h-[52px] rounded-[64px] border border-white bg-[#6453D9] px-6 text-[16px] font-medium text-white shadow-[0_4px_12px_0_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5341C6] active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none gap-2 inline-flex items-center justify-center"
                      >
                        @if (isSubmitting()) {
                          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        }
                        View running Ads
                      </button>
                    </div>
                  </div>
                </div>
              }
            }
          </div>

          <div class="hidden h-full flex-col md:flex">
            @if (step() === 1) {
              <header
                class="shrink-0 flex items-center gap-[30px] bg-white/80 px-8 py-[15px] backdrop-blur-[2.5px]"
              >
                <button
                  type="button"
                  (click)="close.emit()"
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F5F5] text-[#0D0D0D] transition hover:bg-[#EFEFF2] active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  aria-label="Close create ad modal"
                >
                  <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
                </button>

                <h1 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">Create Ad</h1>
              </header>

              <div class="min-h-0 flex-1 overflow-y-auto">
                <div
                  class="mx-auto grid min-h-full max-w-[1220px] grid-cols-[minmax(0,1fr)_360px] gap-8 px-8 py-[10px] xl:grid-cols-[552px_400px] xl:gap-12 xl:px-12 2xl:grid-cols-[552px_476px] 2xl:gap-[72px] 2xl:px-20"
                >
                  <section class="min-w-0 pt-[22px]">
                    <h2 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">
                      Configure Banner Ad
                    </h2>

                    <div
                      class="mt-3 flex gap-2 rounded-[12px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[#5A5B33]"
                    >
                      <img
                        [ngSrc]="createBannerInfoIcon"
                        width="28"
                        height="28"
                        alt=""
                        class="mt-0.5 h-7 w-7 shrink-0 self-start object-contain"
                      />
                      <div>
                        <p class="text-[16px] font-medium leading-5 text-[#212103]">
                          Approval Required
                        </p>
                        <p class="mt-1 max-w-[480px] text-[14px] leading-5 text-[#373737]">
                          All banner ads are reviewed by our team before going live to ensure
                          quality and compliance. Review typically takes 24-48 hours.
                        </p>
                      </div>
                    </div>

                    <form [formGroup]="bannerForm" class="mt-8 space-y-8">
                      <section>
                        <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                          General information
                        </h3>

                        <div class="mt-5 space-y-5">
                          <div>
                            <label
                              for="banner-title"
                              class="mb-2 block text-[14px] font-medium leading-[16.8px] text-[#5A5A5A]"
                              >Ad Title</label
                            >
                            <input
                              id="banner-title"
                              type="text"
                              formControlName="title"
                              placeholder="e.g Christmas Sale Banner"
                              class="h-10 w-full rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] text-[#0D0D0D] outline-none transition placeholder:tracking-[-0.01em] placeholder:text-[rgba(13,13,13,0.4)] focus:border-[#6453D9] focus:ring-2 focus:ring-[#6453D9]/10"
                            />
                          </div>

                          <div>
                            <label
                              for="destination-url"
                              class="mb-2 block text-[14px] font-medium leading-[16.8px] text-[#5A5A5A]"
                            >
                              Destination URL
                              <span class="font-normal text-[#8F8F8F]"
                                >(where users will go when they click the banner)</span
                              >
                            </label>
                            <input
                              id="destination-url"
                              type="url"
                              formControlName="destinationUrl"
                              class="h-10 w-full rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] text-[#0D0D0D] outline-none transition focus:border-[#6453D9] focus:ring-2 focus:ring-[#6453D9]/10"
                            />
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 class="text-[20px] font-semibold leading-6 text-[#000000]">
                          Choose banner type
                        </h3>

                        <div class="mt-5 flex gap-3">
                          @for (option of bannerTypeOptions; track option.value) {
                            <label
                              (click)="setBannerType(option.value)"
                              class="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[12px] px-3 py-3 transition hover:border-[#6453D9]/60 hover:bg-[#F9F7FF]/50 active:scale-[0.98] duration-200"
                              [class.border-[#6453D9]]="selectedBannerType() === option.value"
                              [class.bg-[#F9F7FF]]="selectedBannerType() === option.value"
                              [class.border]="selectedBannerType() !== option.value"
                              [class.border-[#EAEAEA]]="selectedBannerType() !== option.value"
                              [class.bg-[#FAFAFA]]="selectedBannerType() !== option.value"
                              [style.border-width.px]="
                                selectedBannerType() === option.value ? 1.5 : 1
                              "
                            >
                              <input
                                type="radio"
                                class="sr-only"
                                formControlName="bannerType"
                                [value]="option.value"
                                [checked]="selectedBannerType() === option.value"
                              />
                              <span
                                class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                                [class.border-[#6453D9]]="selectedBannerType() === option.value"
                                [class.border-[#D9D9D9]]="selectedBannerType() !== option.value"
                              >
                                @if (selectedBannerType() === option.value) {
                                  <span class="h-2 w-2 rounded-full bg-[#6453D9]"></span>
                                }
                              </span>
                              <span class="truncate text-[16px] leading-5 text-[#1F1F1F]">{{
                                option.label
                              }}</span>
                            </label>
                          }
                        </div>
                      </section>

                      <section>
                        <div>
                          <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                            {{ bannerTypeUploadLabel() }}
                          </h3>
                          <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.8)]">
                            {{ bannerTypeUploadRecommendation() }}
                          </p>
                        </div>

                        <div class="mt-5">
                          <input
                            #fileInput
                            type="file"
                            [accept]="bannerTypeUploadAccept()"
                            class="sr-only"
                            (change)="onFileSelected($event)"
                          />

                          <button
                            type="button"
                            (click)="fileInput.click()"
                            [disabled]="isSubmitting()"
                            class="flex min-h-[138px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#D8D8D8] bg-[#F9F9F9] px-6 py-10 text-center transition hover:border-[#B9B7F8] hover:bg-[#FBFAFF] focus:outline-none focus:ring-2 focus:ring-[#7868F3]/10 active:scale-[0.99] duration-200 disabled:opacity-75 disabled:pointer-events-none"
                          >
                            @if (imagePreview()) {
                              <div class="flex w-full max-w-[460px] flex-col items-center gap-4">
                                <div
                                  class="w-full overflow-hidden rounded-[18px] border border-[#E6E8ED] bg-white p-2 shadow-sm"
                                >
                                  <img
                                    [src]="imagePreview()!"
                                    alt="Selected banner preview"
                                    class="h-auto w-full rounded-[14px] object-cover"
                                  />
                                </div>
                                <span
                                  class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-[#000000] shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                                >
                                  <img
                                    [ngSrc]="bannerTypeUploadIcon()"
                                    width="14"
                                    height="14"
                                    alt=""
                                  />
                                  Change file
                                </span>
                              </div>
                            } @else {
                              <span
                                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-[#000000] shadow-[0_4px_8px_0_rgba(202,202,202,0.25)]"
                              >
                                <img
                                  [ngSrc]="bannerTypeUploadIcon()"
                                  width="14"
                                  height="14"
                                  alt=""
                                />
                                Add file
                              </span>
                              <span class="mt-3 text-[12px] tracking-[-0.01em] text-[#848484]">{{
                                bannerTypeUploadHelper()
                              }}</span>
                            }
                          </button>
                        </div>
                      </section>
                    </form>
                  </section>

                  <aside class="flex min-w-0 flex-col rounded-[24px] bg-[#F8F8F8] px-4 py-4">
                    <div>
                      <h3 class="text-[20px] font-semibold leading-7 text-[#1F1F1F]">Preview</h3>
                      <p class="mt-0.5 text-[14px] leading-5 text-[#959595]">
                        This is how your banner ad will appear to buyers
                      </p>
                    </div>

                    <div class="mt-4 flex justify-center gap-[7px]">
                      <button
                        type="button"
                        (click)="previewMode.set('desktop')"
                        [attr.aria-pressed]="previewMode() === 'desktop'"
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_8px_0_rgba(202,202,202,0.25)] transition hover:bg-gray-50 active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                        [class.border]="previewMode() === 'desktop'"
                        [class.border-[#EAEAEA]]="previewMode() === 'desktop'"
                      >
                        <img [ngSrc]="createBannerMonitorIcon" width="16" height="16" alt="" />
                      </button>
                      <button
                        type="button"
                        (click)="previewMode.set('mobile')"
                        [attr.aria-pressed]="previewMode() === 'mobile'"
                        class="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_4px_8px_0_rgba(202,202,202,0.25)] transition hover:bg-gray-50 active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                        [class.border]="previewMode() === 'mobile'"
                        [class.border-[#EAEAEA]]="previewMode() === 'mobile'"
                      >
                        <img [ngSrc]="createBannerMobileIcon" width="16" height="16" alt="" />
                      </button>
                    </div>

                    <div class="mt-4 flex flex-1 items-center justify-center">
                      <div
                        class="rounded-[12px] bg-[#FCFCFC] p-3 shadow-[0_12px_24px_0_rgba(192,192,192,0.25)]"
                        [class.w-full]="previewMode() === 'desktop'"
                        [class.max-w-[320px]]="previewMode() === 'desktop'"
                        [class.xl:max-w-[342px]]="previewMode() === 'desktop'"
                        [class.w-[242px]]="previewMode() === 'mobile'"
                      >
                        <div
                          class="overflow-hidden rounded-[12px] border border-[#ECEDEF] bg-[#FCFCFD]"
                        >
                          <div class="flex items-center justify-between bg-[#1D1E22] px-3 py-1.5">
                            <div class="flex items-center gap-2">
                              <div class="h-2.5 w-2.5 rounded-full bg-white"></div>
                              <span class="text-[0.45rem] font-bold text-white">Duduzili</span>
                            </div>
                            <div class="flex items-center gap-1">
                              <div class="h-1.5 w-10 rounded-full bg-white/25"></div>
                              <div class="h-3 w-6 rounded-full bg-white"></div>
                            </div>
                          </div>

                          <div class="space-y-3 bg-white p-3">
                            <div class="grid grid-cols-4 gap-2 opacity-35 blur-[1.4px]">
                              @for (item of skeletonItems; track item) {
                                <div class="space-y-1.5">
                                  <div class="aspect-square rounded-[10px] bg-[#ECEEF2]"></div>
                                  <div class="h-1.5 rounded-full bg-[#ECEEF2]"></div>
                                  <div class="h-1.5 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                                </div>
                              }
                            </div>

                            <div
                              class="overflow-hidden rounded-[10px] border border-[#ECEDEF] bg-white"
                            >
                              <div
                                class="relative aspect-[3.85/1] w-full"
                                [style.background]="previewBannerBackground()"
                              >
                                @if (imagePreview()) {
                                  <img
                                    [src]="imagePreview()!"
                                    alt="Banner artwork preview"
                                    class="absolute inset-0 h-full w-full object-cover"
                                  />
                                } @else {
                                  <div
                                    class="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-center px-3 text-white"
                                  >
                                    <span
                                      class="text-[0.42rem] font-black uppercase tracking-[0.18em] opacity-85"
                                      >Sponsored</span
                                    >
                                    <span class="mt-1 text-[0.9rem] font-black leading-none">{{
                                      previewHeadline()
                                    }}</span>
                                    <span
                                      class="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] opacity-90"
                                      >{{ previewSubline() }}</span
                                    >
                                  </div>
                                }

                                <div
                                  class="absolute left-1.5 top-1.5 rounded-full bg-[#23252C]/70 px-1.5 py-0.5 text-[0.36rem] font-semibold text-white backdrop-blur-sm"
                                >
                                  Sponsored
                                </div>
                              </div>

                              <div
                                class="flex items-center gap-3 px-2 py-1.5 text-[0.52rem] font-medium text-[#A3A6AE]"
                              >
                                <span class="inline-flex items-center gap-1"
                                  ><span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span
                                  >1K</span
                                >
                                <span class="inline-flex items-center gap-1"
                                  ><span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span
                                  >500</span
                                >
                              </div>
                            </div>

                            <div class="grid grid-cols-3 gap-1.5">
                              <img
                                ngSrc="assets/images/banner-promotions-card-orange.png"
                                width="95"
                                height="53"
                                alt=""
                                class="h-auto w-full rounded-[6px] object-cover"
                              />
                              <img
                                ngSrc="assets/images/banner-promotions-card-blue.png"
                                width="95"
                                height="53"
                                alt=""
                                class="h-auto w-full rounded-[6px] object-cover"
                              />
                              <img
                                ngSrc="assets/images/banner-promotions-card-orange.png"
                                width="95"
                                height="53"
                                alt=""
                                class="h-auto w-full rounded-[6px] object-cover opacity-75"
                              />
                            </div>

                            <div class="relative h-16 overflow-hidden rounded-b-[14px]">
                              <img
                                ngSrc="assets/images/Duduzili.png"
                                alt="Duduzili footer artwork"
                                fill
                                class="object-cover object-top opacity-80"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <footer class="sticky bottom-0 z-10 shrink-0 border-t border-[#EDEDED] bg-white/90 px-6 py-[13px] shadow-[0_-12px_32px_-28px_rgba(15,23,42,0.45)] backdrop-blur-[2.5px]">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    (click)="close.emit()"
                    [disabled]="isSubmitting()"
                    class="h-11 rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.031em] text-[#05061A] transition hover:bg-[#E8E9ED] active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-gray-200 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    (click)="submitForm()"
                    [disabled]="bannerForm.invalid || !selectedMediaFile() || isSubmitting()"
                    class="h-10 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_0_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5F50DE] hover:shadow-[0_6px_16px_0_rgba(81,35,173,0.45),0_0_0_1px_#6B5BD5] active:scale-95 duration-200 focus:outline-none focus:ring-4 focus:ring-[#6B5BE7]/20 disabled:cursor-not-allowed disabled:bg-[#D7D1FB] disabled:shadow-none disabled:opacity-50 disabled:pointer-events-none inline-flex items-center justify-center gap-2"
                  >
                    @if (isSubmitting()) {
                      <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    Submit for approval
                  </button>
                </div>
              </footer>
            } @else {
              <div
                class="flex h-full flex-col items-center justify-center px-6 py-10 text-center animate-in fade-in zoom-in-95 duration-300"
              >
                <div class="flex flex-col items-center gap-8">
                  <div class="flex flex-col items-center gap-6">
                    <img
                      [ngSrc]="bannerReviewSuccessDesktopImage"
                      width="180"
                      height="180"
                      alt="Banner submitted for review"
                      class="h-[180px] w-[180px]"
                    />

                    <div class="flex flex-col items-center gap-3">
                      <h2 class="w-[546px] text-[32px] font-semibold leading-[1.1] text-[#0D0D0D]">
                        Banner submitted for review
                      </h2>
                      <p class="w-[562px] text-[16px] leading-6 text-[#747474]">
                        Your banner ad has been submitted and is awaiting approval from the Duduzili
                        team. Once approved, it will start appearing across the platform.
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="resetFlow()"
                      [disabled]="isSubmitting()"
                      class="h-11 rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.031em] text-[#05061A] transition hover:bg-[#EAEAEA] active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none"
                    >
                      Create another Ad
                    </button>
                    <button
                      type="button"
                      (click)="finishAndClose()"
                      [disabled]="isSubmitting()"
                      class="h-10 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_0_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition hover:bg-[#5341C6] hover:shadow-[0_6px_16px_0_rgba(81,35,173,0.45),0_0_0_1px_#6B5BD5] active:scale-95 duration-200 disabled:opacity-50 disabled:pointer-events-none gap-2 inline-flex items-center justify-center"
                    >
                      @if (isSubmitting()) {
                        <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      }
                      View running Ads
                    </button>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBannerAdModalComponent implements OnDestroy {
  readonly close = output<void>();
  readonly success = output<void>();
  readonly isSubmitting = signal(false);
  readonly hasCreated = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly appToastService = inject(AppToastService);

  readonly bannerTypeOptions = [
    { value: 'image', label: 'Image Ad (1 left)' },
    { value: 'video', label: 'Video Ad (1 left)' },
  ] as const;

  readonly skeletonItems = [1, 2, 3, 4];
  readonly step = signal(1);
  readonly previewMode = signal<'desktop' | 'mobile'>('desktop');
  readonly imagePreview = signal<string | null>(null);
  readonly selectedMediaFile = signal<File | null>(null);
  readonly createBannerInfoIcon = 'assets/icons/banner-create-info.svg';
  readonly createBannerGalleryAddIcon = 'assets/icons/banner-create-gallery-add.svg';
  readonly createBannerVideoAddIcon = 'assets/icons/banner-create-video-add.svg';
  readonly createBannerMonitorIcon = 'assets/icons/banner-create-monitor.svg';
  readonly createBannerMobileIcon = 'assets/icons/banner-create-mobile.svg';
  readonly createBannerRadioSelectedIcon = 'assets/icons/banner-create-radio-selected.svg';
  readonly createBannerRadioUnselectedIcon = 'assets/icons/banner-create-radio-unselected.svg';
  readonly bannerReviewSuccessDesktopImage = 'assets/images/banner-review-success-desktop.png';
  readonly bannerReviewSuccessMobileImage = 'assets/images/banner-review-success-mobile.png';

  readonly bannerForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    destinationUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    bannerType: this.fb.nonNullable.control<'image' | 'video'>('image', Validators.required),
  });

  readonly selectedBannerType = signal<'image' | 'video'>('image');
  readonly previewHeadline = computed(() => {
    const title = this.bannerForm.controls.title.value.trim();
    return title ? this.truncate(title, 20) : 'Christmas Sale';
  });
  readonly bannerTypeUploadLabel = computed(() =>
    this.selectedBannerType() === 'video' ? 'Banner video' : 'Banner image',
  );
  readonly bannerTypeUploadRecommendation = computed(() =>
    this.selectedBannerType() === 'video'
      ? 'Recommended size: 1080 x 90'
      : 'Recommended dimension: 1080 x 90',
  );
  readonly bannerTypeUploadHelper = computed(() =>
    this.selectedBannerType() === 'video' ? 'MP4, GIF under 7MB' : 'PNG, JPEG under 7MB',
  );
  readonly bannerTypeUploadAccept = computed(() =>
    this.selectedBannerType() === 'video' ? 'video/mp4,image/gif' : 'image/png,image/jpeg',
  );
  readonly bannerTypeUploadIcon = computed(() =>
    this.selectedBannerType() === 'video'
      ? this.createBannerVideoAddIcon
      : this.createBannerGalleryAddIcon,
  );
  readonly previewSubline = computed(() =>
    this.selectedBannerType() === 'video' ? 'Video banner ad' : 'Image banner ad',
  );
  readonly previewBannerBackground = computed(() =>
    this.selectedBannerType() === 'video'
      ? 'linear-gradient(135deg, #5F7CFA 0%, #2E91FF 45%, #28C6F0 100%)'
      : 'linear-gradient(135deg, #FFCC4B 0%, #FF8A1F 42%, #F35B22 100%)',
  );
  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }

  handleBackdropClick(): void {
    if (this.isSubmitting()) {
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      this.finishAndClose();
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedMediaFile.set(file);
    this.imagePreview.set(URL.createObjectURL(file));
  }

  setBannerType(value: 'image' | 'video'): void {
    this.selectedBannerType.set(value);
    this.bannerForm.controls.bannerType.setValue(value);
    this.bannerForm.controls.bannerType.markAsDirty();
    this.bannerForm.controls.bannerType.markAsTouched();
  }

  openPreview(): void {
    this.step.set(2);
  }

  submitForm(): void {
    if (this.bannerForm.invalid || !this.selectedMediaFile()) {
      this.bannerForm.markAllAsTouched();
      return;
    }

    if (this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    this.sellerMonetizationService
      .createBannerAd({
        title: this.bannerForm.controls.title.value.trim(),
        destinationUrl: this.bannerForm.controls.destinationUrl.value.trim(),
        bannerType: this.bannerForm.controls.bannerType.value,
        mediaFile: this.selectedMediaFile()!,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.hasCreated.set(true);
          this.step.set(5);
          this.appToastService.show({ message: 'Banner ad submitted for review.' });
        },
        error: (error: unknown) => {
          this.isSubmitting.set(false);
          this.appToastService.show({
            message:
              this.readErrorMessage(error) ??
              'That banner ad couldn’t be created right now. Please try again.',
          });
        },
      });
  }

  private readErrorMessage(error: unknown): string | null {
    if (!error || typeof error !== 'object') {
      return null;
    }
    const errorRecord = error as Record<string, unknown>;
    const response = errorRecord['error'];
    if (typeof response === 'string') {
      return response.trim() || null;
    }
    if (!response || typeof response !== 'object') {
      return null;
    }
    const responseRecord = response as Record<string, unknown>;
    const detail = responseRecord['detail'];
    const message = responseRecord['message'] ?? responseRecord['error'];
    const value = typeof detail === 'string' ? detail : typeof message === 'string' ? message : null;
    return value?.trim() || null;
  }

  finishAndClose(): void {
    if (this.hasCreated()) {
      this.success.emit();
    }
    this.close.emit();
  }

  resetFlow(): void {
    this.bannerForm.reset({
      title: '',
      destinationUrl: '',
      bannerType: 'image',
    });
    this.selectedBannerType.set('image');
    this.imagePreview.set(null);
    this.selectedMediaFile.set(null);
    this.previewMode.set('desktop');
    this.hasCreated.set(false);
    this.step.set(1);
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
  }
}
