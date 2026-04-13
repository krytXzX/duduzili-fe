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
  heroGlobeAlt,
  heroMagnifyingGlassMinus,
  heroMagnifyingGlassPlus,
  heroWallet,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

export interface CreateBannerAdPayload {
  title: string;
  destinationUrl: string;
  bannerType: 'image' | 'video';
  imagePreview: string | null;
  planId?: string;
}

interface BoostingPlan {
  id: string;
  label: string;
  price: string;
  unit: string;
  billing: string;
  savings?: string;
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
      heroGlobeAlt,
      heroMagnifyingGlassMinus,
      heroMagnifyingGlassPlus,
      heroWallet,
      heroXMark,
    }),
  ],
  template: `
    <div class="fixed inset-0 z-[200] md:bg-black/20 md:p-3 md:backdrop-blur-[2px]" (click)="handleBackdropClick()">
      <div class="h-full w-full md:flex md:items-center md:justify-center">
        <div
          class="flex h-full w-full flex-col overflow-hidden bg-white md:max-h-[92vh] md:max-w-[1280px] md:rounded-[32px] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          (click)="$event.stopPropagation()"
        >
          <div class="flex h-full flex-col md:hidden">
            @switch (step()) {
              @case (1) {
                <div class="flex min-h-0 flex-1 flex-col">
                  <header class="flex items-center justify-between px-4 pb-4 pt-5">
                    <button
                      type="button"
                      (click)="close.emit()"
                      class="inline-flex items-center gap-2 text-[13px] font-medium text-[#202335]"
                      aria-label="Close create ad modal"
                    >
                      <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                      Create Ad
                    </button>

                    <button
                      type="button"
                      (click)="openPreview()"
                      class="text-[11px] font-medium text-[#202335]"
                    >
                      Preview
                    </button>
                  </header>

                  <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
                    <h1 class="text-[15px] font-semibold tracking-[-0.03em] text-[#202335]">Configure Banner Ad</h1>

                    <div class="mt-3 flex gap-3 rounded-[12px] bg-[#FFF8D9] px-3 py-3 text-[#5A5B33]">
                      <div class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                        <ng-icon name="heroExclamationTriangle" class="text-[13px]"></ng-icon>
                      </div>
                      <div>
                        <p class="text-[10px] font-semibold text-[#36361D]">Approval Required</p>
                        <p class="mt-1 text-[10px] leading-4 text-[#6F7154]">
                          All banner ads are reviewed by the Duduzili team before going live.
                        </p>
                      </div>
                    </div>

                    <form [formGroup]="bannerForm" class="mt-4 space-y-5">
                      <section>
                        <h2 class="text-[12px] font-semibold text-[#202335]">General information</h2>

                        <div class="mt-3 space-y-3">
                          <div>
                            <label for="mobile-banner-title" class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">Ad Title</label>
                            <input
                              id="mobile-banner-title"
                              type="text"
                              formControlName="title"
                              placeholder="eg Christmas Sale Banner"
                              class="h-10 w-full rounded-[10px] border border-[#E7E8EC] bg-white px-3 text-[12px] text-[#202335] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-2 focus:ring-[#7B6BF2]/10"
                            >
                          </div>

                          <div>
                            <label for="mobile-destination-url" class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">
                              Destination URL
                              <span class="font-normal text-[#A3A6AE]">(where users will go when they click the banner)</span>
                            </label>
                            <input
                              id="mobile-destination-url"
                              type="url"
                              formControlName="destinationUrl"
                              class="h-10 w-full rounded-[10px] border border-[#E7E8EC] bg-white px-3 text-[12px] text-[#202335] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-2 focus:ring-[#7B6BF2]/10"
                            >
                          </div>
                        </div>
                      </section>

                      <section>
                        <h2 class="text-[12px] font-semibold text-[#202335]">Choose banner type</h2>

                        <div class="mt-3 grid grid-cols-2 gap-2">
                          @for (option of bannerTypeOptions; track option.value) {
                            <label
                              class="flex cursor-pointer items-center gap-2 rounded-[10px] border px-2.5 py-2 text-[10px] transition"
                              [class.border-[#7868F3]]="bannerType() === option.value"
                              [class.bg-[#F7F5FF]]="bannerType() === option.value"
                              [class.text-[#4D447E]]="bannerType() === option.value"
                              [class.border-[#EAEBEF]]="bannerType() !== option.value"
                              [class.text-[#747986]]="bannerType() !== option.value"
                            >
                              <input
                                type="radio"
                                class="h-3.5 w-3.5 accent-[#7868F3]"
                                formControlName="bannerType"
                                [value]="option.value"
                              >
                              <span>{{ option.label }}</span>
                            </label>
                          }
                        </div>
                      </section>

                      <section>
                        <h2 class="text-[12px] font-semibold text-[#202335]">Banner image</h2>
                        <p class="mt-1 text-[10px] text-[#A3A6AE]">Recommended dimension: 1080 x 90</p>

                        <div class="mt-3">
                          <input
                            #mobileFileInput
                            type="file"
                            accept="image/png,image/jpeg"
                            class="sr-only"
                            (change)="onFileSelected($event)"
                          >

                          <button
                            type="button"
                            (click)="mobileFileInput.click()"
                            class="flex min-h-[104px] w-full flex-col items-center justify-center rounded-[12px] border border-dashed border-[#D8DBE2] bg-[#FBFBFC] px-4 py-5 text-center transition hover:border-[#B9B7F8] hover:bg-[#FBFAFF] focus:outline-none focus:ring-2 focus:ring-[#7868F3]/10"
                          >
                            @if (imagePreview()) {
                              <div class="flex w-full max-w-[240px] flex-col items-center gap-3">
                                <div class="w-full overflow-hidden rounded-[12px] border border-[#E6E8ED] bg-white p-1.5 shadow-sm">
                                  <img [src]="imagePreview()!" alt="Selected banner preview" class="h-auto w-full rounded-[10px] object-cover">
                                </div>
                                <span class="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-medium text-[#3A3D45] shadow-sm">
                                  <ng-icon name="heroArrowUpTray" class="text-[13px]"></ng-icon>
                                  Change file
                                </span>
                              </div>
                            } @else {
                              <span class="inline-flex items-center gap-2 rounded-full border border-[#E6E8ED] bg-white px-4 py-2 text-[11px] font-medium text-[#3A3D45] shadow-sm">
                                <ng-icon name="heroArrowUpTray" class="text-[13px]"></ng-icon>
                                Add file
                              </span>
                              <span class="mt-2 text-[10px] text-[#B0B4BD]">PNG, JPEG under 7MB</span>
                            }
                          </button>
                        </div>
                      </section>
                    </form>
                  </div>

                  <footer class="flex items-center gap-3 border-t border-[#F1F2F4] px-4 py-3">
                    <button
                      type="button"
                      (click)="close.emit()"
                      class="flex-1 rounded-full bg-[#F2F3F5] px-4 py-3 text-[12px] font-medium text-[#454A54]"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      (click)="submitForm()"
                      [disabled]="bannerForm.invalid"
                      class="flex-1 rounded-full bg-[#6B5BE7] px-4 py-3 text-[12px] font-medium text-white shadow-[0_16px_34px_-18px_rgba(107,91,231,0.9)] disabled:cursor-not-allowed disabled:bg-[#D7D1FB] disabled:shadow-none"
                    >
                      Promote banner
                    </button>
                  </footer>
                </div>
              }

              @case (2) {
                <div class="flex min-h-0 flex-1 flex-col">
                  <header class="flex items-center justify-between px-4 pb-4 pt-5">
                    <button
                      type="button"
                      (click)="step.set(1)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
                      aria-label="Back to create ad form"
                    >
                      <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
                    </button>

                    <span class="text-[13px] font-medium text-[#202335]">Preview</span>

                    <button
                      type="button"
                      (click)="close.emit()"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260]"
                      aria-label="Close preview"
                    >
                      <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                    </button>
                  </header>

                  <div class="flex flex-1 flex-col items-center justify-center px-4 pb-6 pt-2">
                    <p class="text-[10px] text-[#A3A6AE]">This is how your banner ad will appear to buyers</p>

                    <div class="mt-6 flex items-center gap-5 text-[#707583]">
                      <button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7ED]">
                        <ng-icon name="heroMagnifyingGlassMinus" class="text-[13px]"></ng-icon>
                      </button>
                      <button type="button" class="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#E5E7ED]">
                        <ng-icon name="heroMagnifyingGlassPlus" class="text-[13px]"></ng-icon>
                      </button>
                    </div>

                    <div class="mt-6 w-[210px] overflow-hidden rounded-[24px] border border-[#ECEEF4] bg-white p-2 shadow-[0_18px_40px_-28px_rgba(31,36,48,0.3)]">
                      <div class="overflow-hidden rounded-[18px] border border-[#ECEDEF] bg-[#FCFCFD]">
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

                          <div class="overflow-hidden rounded-[10px] border border-[#ECEDEF] bg-white">
                            <div class="relative aspect-[3.85/1] w-full" [style.background]="previewBannerBackground()">
                              @if (imagePreview()) {
                                <img [src]="imagePreview()!" alt="Banner artwork preview" class="absolute inset-0 h-full w-full object-cover">
                              } @else {
                                <div class="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-center px-2 text-white">
                                  <span class="text-[0.3rem] font-black uppercase tracking-[0.18em] opacity-85">Sponsored</span>
                                  <span class="mt-0.5 text-[0.58rem] font-black leading-none">{{ previewHeadline() }}</span>
                                  <span class="mt-1 text-[0.34rem] font-semibold uppercase tracking-[0.1em] opacity-90">{{ previewSubline() }}</span>
                                </div>
                              }

                              <div class="absolute left-1 top-1 rounded-full bg-[#23252C]/70 px-1.5 py-0.5 text-[0.28rem] font-semibold text-white backdrop-blur-sm">
                                Sponsored
                              </div>
                            </div>

                            <div class="flex items-center gap-3 px-2 py-1 text-[0.42rem] font-medium text-[#A3A6AE]">
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

                          <div class="h-9 rounded-t-[10px] bg-[linear-gradient(180deg,#F2F0FF_0%,#EFEAFF_45%,#E5DEFF_100%)] opacity-80"></div>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="step.set(3)"
                      class="mt-8 w-full rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              }

              @case (3) {
                <div class="relative flex min-h-0 flex-1 flex-col overflow-y-auto bg-[linear-gradient(180deg,#B5A9FF_0%,#EEE9FF_24%,#FFFFFF_42%)] px-4 pb-4 pt-4">
                  <button
                    type="button"
                    (click)="step.set(1)"
                    class="absolute left-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1A1C21]"
                    aria-label="Back to form"
                  >
                    <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
                  </button>

                  <button
                    type="button"
                    (click)="close.emit()"
                    class="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-[#1A1C21]"
                    aria-label="Close plan selection"
                  >
                    <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                  </button>

                  <div class="pt-10 text-center">
                    <h2 class="text-[16px] font-semibold leading-tight tracking-[-0.03em] text-[#17181D]">
                      Choose a boosting plan to proceed🚀
                    </h2>
                    <p class="mt-2 text-[11px] text-[#7F828B]">Give your banner more visibility</p>
                  </div>

                  <div class="mt-6 space-y-3">
                    @for (plan of boostingPlans; track plan.id) {
                      <button
                        type="button"
                        (click)="selectedPlanId.set(plan.id)"
                        class="relative flex w-full items-start justify-between rounded-[16px] border bg-white px-4 py-3 text-left"
                        [class.border-[#6955F2]]="selectedPlanId() === plan.id"
                        [class.shadow-[0_16px_38px_-28px_rgba(105,85,242,0.8)]]="selectedPlanId() === plan.id"
                        [class.border-[#E7E8EC]]="selectedPlanId() !== plan.id"
                      >
                        <div>
                          <h3 class="text-[13px] font-medium text-[#1B1D23]">{{ plan.label }}</h3>
                          <p class="mt-1 text-[10px] text-[#8B8F98]">{{ plan.billing }}</p>
                        </div>

                        <div class="text-right">
                          @if (plan.savings) {
                            <span class="mb-2 inline-flex rounded-full bg-[#F1F7AA] px-1.5 py-0.5 text-[8px] font-semibold text-[#6A7414]">
                              Save {{ plan.savings }}
                            </span>
                          }
                          <div class="text-[13px] font-medium text-[#1B1D23]">{{ plan.price }}</div>
                        </div>
                      </button>
                    }
                  </div>

                  <button
                    type="button"
                    (click)="goToPaymentStep()"
                    class="mt-6 w-full rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                  >
                    Proceed
                  </button>
                </div>
              }

              @case (4) {
                <div class="flex min-h-0 flex-1 flex-col">
                  <header class="flex items-center justify-between px-4 pb-4 pt-5">
                    <button
                      type="button"
                      (click)="step.set(3)"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
                      aria-label="Back to plan selection"
                    >
                      <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
                    </button>

                    <div class="h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

                    <button
                      type="button"
                      (click)="close.emit()"
                      class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260]"
                      aria-label="Close payment"
                    >
                      <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
                    </button>
                  </header>

                  <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-5">
                    <div class="rounded-[18px] bg-[#FAFAFB] p-4 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]">
                      <h2 class="text-[15px] font-semibold leading-tight tracking-[-0.03em] text-[#1A1C21]">{{ selectedPlanSummary().title }}</h2>
                      <p class="mt-1 text-[10px] text-[#8B8F98]">{{ selectedPlanSummary().billing }}</p>

                      <div class="mt-4 space-y-3 border-t border-[#E3E5EA] pt-4 text-[11px] text-[#595E68]">
                        <div class="flex items-center justify-between gap-4">
                          <span>Weekly subscription</span>
                          <span>{{ selectedPlanSummary().subscriptionAmount }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4">
                          <span>VAT (7.5%)</span>
                          <span>{{ selectedPlanSummary().vatAmount }}</span>
                        </div>
                        <div class="flex items-center justify-between gap-4 text-[12px] font-semibold text-[#1A1C21]">
                          <span>Total due today</span>
                          <span>{{ selectedPlanSummary().totalAmount }}</span>
                        </div>
                      </div>

                      <label class="mt-4 flex cursor-pointer items-center gap-2 text-[10px] text-[#424750]">
                        <input
                          type="checkbox"
                          [checked]="isRecurring()"
                          (change)="isRecurring.set(!isRecurring())"
                          class="h-3.5 w-3.5 rounded border-[#D3D6DE] text-[#6955F2] focus:ring-[#6955F2]/20"
                        >
                        <span>Mark this payment as recurring</span>
                      </label>
                    </div>

                    <div class="mt-6">
                      <h3 class="text-[13px] font-medium text-[#1A1C21]">Select your payment method</h3>

                      <div class="mt-3 space-y-3">
                        <button
                          type="button"
                          (click)="selectedPaymentId.set('wallet')"
                          class="flex w-full items-start justify-between rounded-[14px] border px-3 py-3 text-left"
                          [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'"
                          [class.bg-[#F8F6FF]]="selectedPaymentId() === 'wallet'"
                          [class.border-[#E6E7EB]]="selectedPaymentId() !== 'wallet'"
                        >
                          <div class="flex items-start gap-2.5">
                            <ng-icon name="heroWallet" class="mt-0.5 text-[16px] text-[#272A31]"></ng-icon>
                            <p class="text-[11px] font-medium text-[#1A1C21]">Wallet (Balance: N250,000)</p>
                          </div>
                          <span class="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border" [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'" [class.border-[#D9DBE2]]="selectedPaymentId() !== 'wallet'">
                            @if (selectedPaymentId() === 'wallet') {
                              <span class="h-2 w-2 rounded-full bg-[#6955F2]"></span>
                            }
                          </span>
                        </button>

                        <button
                          type="button"
                          (click)="selectedPaymentId.set('online')"
                          class="flex w-full items-start justify-between rounded-[14px] border px-3 py-3 text-left"
                          [class.border-[#6955F2]]="selectedPaymentId() === 'online'"
                          [class.bg-[#F8F6FF]]="selectedPaymentId() === 'online'"
                          [class.border-[#E6E7EB]]="selectedPaymentId() !== 'online'"
                        >
                          <div class="flex items-start gap-2.5">
                            <ng-icon name="heroGlobeAlt" class="mt-0.5 text-[16px] text-[#272A31]"></ng-icon>
                            <p class="text-[11px] font-medium text-[#1A1C21]">Online</p>
                          </div>
                          <span class="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full border" [class.border-[#6955F2]]="selectedPaymentId() === 'online'" [class.border-[#D9DBE2]]="selectedPaymentId() !== 'online'">
                            @if (selectedPaymentId() === 'online') {
                              <span class="h-2 w-2 rounded-full bg-[#6955F2]"></span>
                            }
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      type="button"
                      (click)="completePayment()"
                      class="mt-7 w-full rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                    >
                      Confirm and pay
                    </button>

                    <p class="mt-4 text-[9px] leading-4 text-[#6D727C]">
                      By clicking on Confirm and pay, you accept the <span class="text-[#6653E4]">Terms of Use</span>,
                      confirm that you will abide by the Safety Tips and declare that this posting does not include any Prohibited Items.
                    </p>
                  </div>
                </div>
              }

              @default {
                <div class="flex flex-1 flex-col items-center justify-center px-5 py-10 text-center">
                  <div class="relative mb-7 h-28 w-32 overflow-hidden rounded-[18px] bg-linear-to-b from-[#86E0FF] via-[#F8FBFF] to-[#E8E5FF] shadow-[0_22px_40px_-30px_rgba(33,41,67,0.55)]">
                    <div class="flex items-center gap-1 px-3 py-2">
                      <span class="h-2.5 w-2.5 rounded-full bg-[#FF6B57]"></span>
                      <span class="h-2.5 w-2.5 rounded-full bg-[#FFBF2F]"></span>
                      <span class="h-2.5 w-2.5 rounded-full bg-[#28C840]"></span>
                    </div>
                    <div class="absolute left-2 top-[44%] text-2xl text-[#C4BDD8]">‹</div>
                    <div class="absolute right-2 top-[44%] text-2xl text-[#C4BDD8]">›</div>
                    <div class="absolute left-1/2 top-[46%] h-12 w-[70px] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-linear-to-br from-[#FFE787] via-[#FFC33C] to-[#FFB300] shadow-[0_10px_18px_-12px_rgba(60,35,0,0.45)]">
                      <div class="absolute left-1/2 top-[42%] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rotate-[12deg] rounded-[6px] bg-white/80"></div>
                    </div>
                    <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                      <span class="h-3 w-3 rounded-full bg-[#A59BBE] shadow-inner"></span>
                      <span class="h-3 w-3 rounded-full bg-[#C8C0D8] shadow-inner"></span>
                      <span class="h-3 w-3 rounded-full bg-[#A59BBE] shadow-inner"></span>
                    </div>
                  </div>

                  <h2 class="text-[15px] font-semibold leading-tight tracking-[-0.03em] text-[#1A1C21]">Banner submitted for review</h2>

                  <p class="mt-4 text-[11px] leading-5 text-[#8E929B]">
                    Your banner ad has been submitted and is awaiting approval from the Duduzili team.
                    Once approved, it will start appearing across the platform.
                  </p>

                  <div class="mt-8 flex w-full flex-col gap-3">
                    <button
                      type="button"
                      (click)="resetFlow()"
                      class="rounded-full bg-[#F3F3F5] px-5 py-3 text-[12px] font-medium text-[#353A43]"
                    >
                      Create another Ad
                    </button>
                    <button
                      type="button"
                      (click)="finishAndClose()"
                      class="rounded-full bg-[#6653E4] px-5 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)]"
                    >
                      View running Ads
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <div class="hidden h-full flex-col md:flex">
            @if (step() === 1) {
              <header class="flex items-center gap-5 border-b border-[#F1F2F4] bg-white px-6 py-5">
                <button
                  type="button"
                  (click)="close.emit()"
                  class="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2] focus:outline-none focus:ring-4 focus:ring-gray-200"
                  aria-label="Close create ad modal"
                >
                  <ng-icon name="heroXMark" class="text-xl"></ng-icon>
                </button>

                <h1 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">Create Ad</h1>
              </header>

              <div class="flex-1 overflow-y-auto">
                <div class="mx-auto grid max-w-[1320px] gap-10 px-6 py-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:px-10">
                  <section class="max-w-[720px]">
                    <h2 class="text-[2rem] font-black tracking-tight text-[#24262D]">Configure Banner Ad</h2>

                    <div class="mt-4 flex gap-3 rounded-[18px] bg-[#FFFBE5] px-5 py-4 text-[#5A5B33]">
                      <div class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">
                        <ng-icon name="heroExclamationTriangle" class="text-base"></ng-icon>
                      </div>
                      <div>
                        <p class="text-[13px] font-bold text-[#36361D]">Approval Required</p>
                        <p class="mt-1 max-w-xl text-[13px] font-medium leading-6 text-[#6F7154]">
                          All banner ads are reviewed by our team before going live to ensure quality and compliance.
                          Review typically takes 24-48 hours.
                        </p>
                      </div>
                    </div>

                    <form [formGroup]="bannerForm" class="mt-8 space-y-8">
                      <section>
                        <h3 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">General information</h3>

                        <div class="mt-5 space-y-5">
                          <div>
                            <label for="banner-title" class="mb-2 block text-sm font-semibold text-[#61656E]">Ad Title</label>
                            <input
                              id="banner-title"
                              type="text"
                              formControlName="title"
                              placeholder="eg Christmas Sale Banner"
                              class="w-full rounded-[14px] border border-[#E7E8EC] bg-white px-4 py-3.5 text-sm font-medium text-[#24262D] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-4 focus:ring-[#7B6BF2]/10"
                            >
                          </div>

                          <div>
                            <label for="destination-url" class="mb-2 block text-sm font-semibold text-[#61656E]">
                              Destination URL
                              <span class="font-medium text-[#A3A6AE]">(where users will go when they click the banner)</span>
                            </label>
                            <input
                              id="destination-url"
                              type="url"
                              formControlName="destinationUrl"
                              class="w-full rounded-[14px] border border-[#E7E8EC] bg-white px-4 py-3.5 text-sm font-medium text-[#24262D] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-4 focus:ring-[#7B6BF2]/10"
                            >
                          </div>
                        </div>
                      </section>

                      <section>
                        <h3 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">Choose banner type</h3>

                        <div class="mt-5 flex flex-col gap-3 sm:flex-row">
                          @for (option of bannerTypeOptions; track option.value) {
                            <label
                              class="flex min-w-[220px] cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-4 transition"
                              [class.border-[#7868F3]]="bannerType() === option.value"
                              [class.bg-[#F7F5FF]]="bannerType() === option.value"
                              [class.text-[#4D447E]]="bannerType() === option.value"
                              [class.border-[#EAEBEF]]="bannerType() !== option.value"
                              [class.text-[#747986]]="bannerType() !== option.value"
                            >
                              <input type="radio" class="h-4 w-4 accent-[#7868F3]" formControlName="bannerType" [value]="option.value">
                              <span class="text-[15px] font-medium">{{ option.label }}</span>
                            </label>
                          }
                        </div>
                      </section>

                      <section>
                        <div>
                          <h3 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">Banner image</h3>
                          <p class="mt-1 text-[13px] font-medium text-[#7A7F8C]">Recommended dimension: 1080 x 90</p>
                        </div>

                        <div class="mt-5">
                          <input
                            #fileInput
                            type="file"
                            accept="image/png,image/jpeg"
                            class="sr-only"
                            (change)="onFileSelected($event)"
                          >

                          <button
                            type="button"
                            (click)="fileInput.click()"
                            class="flex min-h-[210px] w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-[#D8DBE2] bg-[#FBFBFC] px-6 py-10 text-center transition hover:border-[#B9B7F8] hover:bg-[#FBFAFF] focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                          >
                            @if (imagePreview()) {
                              <div class="flex w-full max-w-[460px] flex-col items-center gap-4">
                                <div class="w-full overflow-hidden rounded-[18px] border border-[#E6E8ED] bg-white p-2 shadow-sm">
                                  <img [src]="imagePreview()!" alt="Selected banner preview" class="h-auto w-full rounded-[14px] object-cover">
                                </div>
                                <span class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3A3D45] shadow-sm">
                                  <ng-icon name="heroArrowUpTray" class="text-base"></ng-icon>
                                  Change file
                                </span>
                              </div>
                            } @else {
                              <span class="inline-flex items-center gap-2 rounded-full border border-[#E6E8ED] bg-white px-5 py-3 text-sm font-semibold text-[#3A3D45] shadow-sm">
                                <ng-icon name="heroArrowUpTray" class="text-base"></ng-icon>
                                Add file
                              </span>
                              <span class="mt-4 text-sm font-medium text-[#B0B4BD]">PNG, JPEG under 7MB</span>
                            }
                          </button>
                        </div>
                      </section>
                    </form>
                  </section>

                  <aside class="flex flex-col rounded-[28px] bg-[#FAFAFB] p-5 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]">
                    <div>
                      <h3 class="text-[1.55rem] font-bold tracking-tight text-[#24262D]">Preview</h3>
                      <p class="mt-1 text-[13px] font-medium text-[#A3A6AE]">This is how your banner ad will appear to buyers</p>
                    </div>

                    <div class="mt-7 flex justify-center gap-3">
                      <button
                        type="button"
                        (click)="previewMode.set('desktop')"
                        [attr.aria-pressed]="previewMode() === 'desktop'"
                        class="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                        [class.border-[#7868F3]]="previewMode() === 'desktop'"
                        [class.text-[#7868F3]]="previewMode() === 'desktop'"
                        [class.border-[#DCDDDF]]="previewMode() !== 'desktop'"
                        [class.text-[#7D8089]]="previewMode() !== 'desktop'"
                      >
                        <ng-icon name="heroComputerDesktop" class="text-lg"></ng-icon>
                      </button>
                      <button
                        type="button"
                        (click)="previewMode.set('mobile')"
                        [attr.aria-pressed]="previewMode() === 'mobile'"
                        class="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                        [class.border-[#7868F3]]="previewMode() === 'mobile'"
                        [class.text-[#7868F3]]="previewMode() === 'mobile'"
                        [class.border-[#DCDDDF]]="previewMode() !== 'mobile'"
                        [class.text-[#7D8089]]="previewMode() !== 'mobile'"
                      >
                        <ng-icon name="heroDevicePhoneMobile" class="text-lg"></ng-icon>
                      </button>
                    </div>

                    <div class="mt-6 flex flex-1 items-center justify-center">
                      <div
                        class="rounded-[26px] bg-white p-4 shadow-[0_22px_60px_-40px_rgba(19,27,45,0.35)]"
                        [class.w-full]="previewMode() === 'desktop'"
                        [class.max-w-[344px]]="previewMode() === 'desktop'"
                        [class.w-[258px]]="previewMode() === 'mobile'"
                      >
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
                              @for (item of skeletonItems; track item) {
                                <div class="space-y-1.5">
                                  <div class="aspect-square rounded-[10px] bg-[#ECEEF2]"></div>
                                  <div class="h-1.5 rounded-full bg-[#ECEEF2]"></div>
                                  <div class="h-1.5 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                                </div>
                              }
                            </div>

                            <div class="overflow-hidden rounded-[10px] border border-[#ECEDEF] bg-white">
                              <div class="relative aspect-[3.85/1] w-full" [style.background]="previewBannerBackground()">
                                @if (imagePreview()) {
                                  <img [src]="imagePreview()!" alt="Banner artwork preview" class="absolute inset-0 h-full w-full object-cover">
                                } @else {
                                  <div class="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-center px-3 text-white">
                                    <span class="text-[0.42rem] font-black uppercase tracking-[0.18em] opacity-85">Sponsored</span>
                                    <span class="mt-1 text-[0.9rem] font-black leading-none">{{ previewHeadline() }}</span>
                                    <span class="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] opacity-90">{{ previewSubline() }}</span>
                                  </div>
                                }

                                <div class="absolute left-1.5 top-1.5 rounded-full bg-[#23252C]/70 px-1.5 py-0.5 text-[0.36rem] font-semibold text-white backdrop-blur-sm">
                                  Sponsored
                                </div>
                              </div>

                              <div class="flex items-center gap-3 px-2 py-1.5 text-[0.52rem] font-medium text-[#A3A6AE]">
                                <span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span>1K</span>
                                <span class="inline-flex items-center gap-1"><span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span>500</span>
                              </div>
                            </div>

                            <div class="relative h-12 overflow-hidden rounded-b-[14px]">
                              <img ngSrc="assets/images/Duduzili.png" alt="Duduzili footer artwork" fill class="object-cover object-top opacity-80">
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </aside>
                </div>
              </div>

              <footer class="border-t border-[#F1F2F4] bg-white px-6 py-5">
                <div class="mx-auto flex max-w-[1320px] justify-end gap-3">
                  <button type="button" (click)="close.emit()" class="rounded-full bg-[#F2F3F5] px-6 py-3.5 text-sm font-bold text-[#454A54] transition hover:bg-[#E8E9ED] focus:outline-none focus:ring-4 focus:ring-gray-200">
                    Back
                  </button>
                  <button
                    type="button"
                    (click)="submitForm()"
                    [disabled]="bannerForm.invalid"
                    class="rounded-full bg-[#6B5BE7] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(107,91,231,0.9)] transition hover:bg-[#5F50DE] focus:outline-none focus:ring-4 focus:ring-[#6B5BE7]/20 disabled:cursor-not-allowed disabled:bg-[#D7D1FB] disabled:shadow-none"
                  >
                    Submit for approval
                  </button>
                </div>
              </footer>
            } @else if (step() === 3) {
              <div class="relative flex h-full flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div class="relative bg-linear-to-b from-[#B5A9FF] via-[#EEE9FF] to-white px-10 pb-18 pt-10 text-center">
                  <button
                    type="button"
                    (click)="close.emit()"
                    class="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full text-[#1A1C21] transition hover:bg-white/60 focus:outline-none focus:ring-4 focus:ring-white/40"
                  >
                    <ng-icon name="heroXMark" class="text-2xl"></ng-icon>
                  </button>

                  <div class="mx-auto max-w-xl pt-16">
                    <h2 class="text-[2rem] font-black leading-[1.02] tracking-tight text-[#17181D]">Choose a boosting plan to proceed🚀</h2>
                    <p class="mt-3 text-[0.95rem] font-medium text-[#7F828B]">Give your banner more visibility</p>
                  </div>
                </div>

                <div class="flex-1 overflow-y-auto px-10 pb-12">
                  <div class="-mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    @for (plan of boostingPlans; track plan.id) {
                      <button
                        type="button"
                        (click)="selectedPlanId.set(plan.id)"
                        class="flex min-h-[225px] flex-col justify-between rounded-[26px] border bg-white p-6 text-left transition-all"
                        [class.border-[#6955F2]]="selectedPlanId() === plan.id"
                        [class.bg-[#F8F6FF]]="selectedPlanId() === plan.id"
                        [class.shadow-[0_16px_38px_-28px_rgba(105,85,242,0.8)]]="selectedPlanId() === plan.id"
                        [class.border-[#E7E8EC]]="selectedPlanId() !== plan.id"
                      >
                        <div>
                          <h3 class="text-[1rem] font-semibold tracking-tight text-[#1B1D23]">{{ plan.label }}</h3>
                        </div>

                        <div>
                          @if (plan.savings) {
                            <span class="mb-4 inline-flex rounded-full bg-[#F1F7AA] px-2.5 py-1 text-xs font-semibold text-[#6A7414]">Save {{ plan.savings }}</span>
                          }

                          <div class="flex items-baseline gap-1 text-[#1B1D23]">
                            <span class="text-[1.8rem] font-black leading-none">{{ plan.price }}</span>
                            <span class="text-[0.875rem] font-medium text-[#8B8F98]">/{{ plan.unit }}</span>
                          </div>
                          <p class="mt-1 text-[0.875rem] font-medium text-[#666B74]">{{ plan.billing }}</p>
                        </div>
                      </button>
                    }
                  </div>

                  <div class="mt-16 flex justify-center">
                    <button
                      type="button"
                      (click)="goToPaymentStep()"
                      class="w-full max-w-[460px] rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </div>
            } @else if (step() === 4) {
              <div class="grid h-full gap-6 p-8 lg:grid-cols-[minmax(0,1fr)_480px]">
                <section class="min-w-0 pt-4">
                  <h2 class="text-[1.8rem] font-bold tracking-tight text-[#1A1C21]">Select your payment method</h2>

                  <div class="mt-8 space-y-4">
                    <button
                      type="button"
                      (click)="selectedPaymentId.set('wallet')"
                      class="flex w-full items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                      [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'"
                      [class.bg-[#F8F6FF]]="selectedPaymentId() === 'wallet'"
                      [class.border-[#E6E7EB]]="selectedPaymentId() !== 'wallet'"
                    >
                      <div class="flex items-start gap-3">
                        <span class="mt-0.5 text-[#272A31]"><ng-icon name="heroWallet" class="text-lg"></ng-icon></span>
                        <p class="text-[0.95rem] font-medium text-[#1A1C21]">Wallet (Balance: N250,000)</p>
                      </div>
                      <span class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border" [class.border-[#6955F2]]="selectedPaymentId() === 'wallet'" [class.border-[#D9DBE2]]="selectedPaymentId() !== 'wallet'">
                        @if (selectedPaymentId() === 'wallet') {
                          <span class="h-2.5 w-2.5 rounded-full bg-[#6955F2]"></span>
                        }
                      </span>
                    </button>

                    <button
                      type="button"
                      (click)="selectedPaymentId.set('online')"
                      class="flex w-full items-start justify-between rounded-[16px] border px-4 py-3.5 text-left transition"
                      [class.border-[#6955F2]]="selectedPaymentId() === 'online'"
                      [class.bg-[#F8F6FF]]="selectedPaymentId() === 'online'"
                      [class.border-[#E6E7EB]]="selectedPaymentId() !== 'online'"
                    >
                      <div class="flex items-start gap-3">
                        <span class="mt-0.5 text-[#272A31]"><ng-icon name="heroGlobeAlt" class="text-lg"></ng-icon></span>
                        <p class="text-[0.95rem] font-medium text-[#1A1C21]">Online</p>
                      </div>
                      <span class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border" [class.border-[#6955F2]]="selectedPaymentId() === 'online'" [class.border-[#D9DBE2]]="selectedPaymentId() !== 'online'">
                        @if (selectedPaymentId() === 'online') {
                          <span class="h-2.5 w-2.5 rounded-full bg-[#6955F2]"></span>
                        }
                      </span>
                    </button>
                  </div>
                </section>

                <aside class="relative rounded-[28px] bg-[#FAFAFB] p-8 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]">
                  <button
                    type="button"
                    (click)="close.emit()"
                    class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-[#1A1C21] transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-gray-200"
                  >
                    <ng-icon name="heroXMark" class="text-xl"></ng-icon>
                  </button>

                  <h3 class="pr-14 text-[2.65rem] font-medium leading-none tracking-tight text-[#1A1C21]">{{ selectedPlanSummary().title }}</h3>
                  <p class="mt-3 text-[0.95rem] font-medium text-[#8B8F98]">{{ selectedPlanSummary().billing }}</p>

                  <div class="mt-8 h-px bg-[#E3E5EA]"></div>

                  <div class="mt-8 space-y-4 text-[0.95rem] text-[#595E68]">
                    <div class="flex items-center justify-between gap-4">
                      <span>Weekly subscription</span>
                      <span>{{ selectedPlanSummary().subscriptionAmount }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4">
                      <span>VAT (7.5%)</span>
                      <span>{{ selectedPlanSummary().vatAmount }}</span>
                    </div>
                    <div class="flex items-center justify-between gap-4 pt-2 text-[1.05rem] font-semibold text-[#1A1C21]">
                      <span>Total due today</span>
                      <span>{{ selectedPlanSummary().totalAmount }}</span>
                    </div>
                  </div>

                  <div class="mt-8 h-px bg-[#E3E5EA]"></div>

                  <label class="mt-8 flex cursor-pointer items-center gap-3 text-[0.95rem] font-medium text-[#424750]">
                    <input type="checkbox" [checked]="isRecurring()" (change)="isRecurring.set(!isRecurring())" class="h-4 w-4 rounded border-[#D3D6DE] text-[#6955F2] focus:ring-[#6955F2]/20">
                    <span>Mark this payment as recurring</span>
                  </label>

                  <button
                    type="button"
                    (click)="completePayment()"
                    class="mt-16 w-full rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20"
                  >
                    Confirm and pay
                  </button>

                  <p class="mt-10 text-[0.875rem] leading-6 text-[#6D727C]">
                    By clicking on Confirm and pay, you accept the
                    <span class="text-[#6653E4]">Terms of Use</span>, confirm that you will abide by the
                    Safety Tips and declare that this posting does not include any Prohibited Items.
                  </p>
                </aside>
              </div>
            } @else {
              <div class="flex h-full flex-col items-center justify-center px-6 py-10 text-center animate-in fade-in zoom-in-95 duration-300">
                <div class="relative mb-8 h-36 w-40 overflow-hidden rounded-[18px] bg-linear-to-b from-[#86E0FF] via-[#F8FBFF] to-[#E8E5FF] shadow-[0_22px_40px_-30px_rgba(33,41,67,0.55)]">
                  <div class="flex items-center gap-1 px-3 py-2">
                    <span class="h-3 w-3 rounded-full bg-[#FF6B57]"></span>
                    <span class="h-3 w-3 rounded-full bg-[#FFBF2F]"></span>
                    <span class="h-3 w-3 rounded-full bg-[#28C840]"></span>
                  </div>
                  <div class="absolute left-3 top-14 text-4xl text-[#C4BDD8]">‹</div>
                  <div class="absolute right-3 top-14 text-4xl text-[#C4BDD8]">›</div>
                  <div class="absolute left-1/2 top-[46%] h-16 w-[88px] -translate-x-1/2 -translate-y-1/2 rounded-[8px] bg-linear-to-br from-[#FFE787] via-[#FFC33C] to-[#FFB300] shadow-[0_10px_18px_-12px_rgba(60,35,0,0.45)]">
                    <div class="absolute left-1/2 top-[42%] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rotate-[12deg] rounded-[6px] bg-white/80"></div>
                  </div>
                  <div class="absolute bottom-6 left-6 h-1.5 w-7 rounded-full bg-white/75"></div>
                  <div class="absolute bottom-3 left-6 flex gap-2">
                    <span class="h-4 w-4 rounded-full bg-[#A59BBE] shadow-inner"></span>
                    <span class="h-4 w-4 rounded-full bg-[#C8C0D8] shadow-inner"></span>
                    <span class="h-4 w-4 rounded-full bg-[#A59BBE] shadow-inner"></span>
                  </div>
                </div>

                <h2 class="text-[2rem] font-black tracking-tight text-[#1A1C21]">Banner submitted for review</h2>

                <p class="mt-4 max-w-[620px] text-[0.95rem] font-medium leading-7 text-[#8E929B]">
                  Your banner ad has been submitted and is awaiting approval from the Duduzili team.
                  Once approved, it will start appearing across the platform.
                </p>

                <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <button type="button" (click)="resetFlow()" class="rounded-full bg-[#F3F3F5] px-6 py-3.5 text-sm font-semibold text-[#353A43] transition hover:bg-[#E9EAF0] focus:outline-none focus:ring-4 focus:ring-gray-200">
                    Create another Ad
                  </button>
                  <button type="button" (click)="finishAndClose()" class="rounded-full bg-[#6653E4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB] focus:outline-none focus:ring-4 focus:ring-[#6653E4]/20">
                    View running Ads
                  </button>
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
  readonly submit = output<CreateBannerAdPayload>();

  private readonly fb = inject(FormBuilder);
  private readonly mobileOverlayService = inject(MobileOverlayService);

  readonly bannerTypeOptions = [
    { value: 'image', label: 'Image Ad (1 left)' },
    { value: 'video', label: 'Video Ad (1 left)' },
  ] as const;

  readonly boostingPlans: BoostingPlan[] = [
    { id: '1-day', label: 'Promote for 1 day', price: '₦100', unit: 'day', billing: 'Billed daily' },
    { id: '7-days', label: 'Promote for 7 days', price: '₦500', unit: 'week', billing: 'Billed weekly' },
    { id: '14-days', label: 'Promote for 14 days', price: '₦700', unit: 'bi-weekly', billing: 'Billed bi-weekly', savings: '20%' },
    { id: '30-days', label: 'Promote for 30 days', price: '₦1,000', unit: 'month', billing: 'Billed every six months', savings: '60%' },
  ];

  readonly skeletonItems = [1, 2, 3, 4];
  readonly step = signal(1);
  readonly selectedPlanId = signal('14-days');
  readonly selectedPaymentId = signal<'wallet' | 'online'>('wallet');
  readonly isRecurring = signal(false);
  readonly previewMode = signal<'desktop' | 'mobile'>('desktop');
  readonly imagePreview = signal<string | null>(null);

  readonly bannerForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    destinationUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    bannerType: this.fb.nonNullable.control<'image' | 'video'>('image', Validators.required),
  });

  readonly bannerType = computed(() => this.bannerForm.controls.bannerType.value);
  readonly previewHeadline = computed(() => {
    const title = this.bannerForm.controls.title.value.trim();
    return title ? this.truncate(title, 20) : 'Christmas Sale';
  });
  readonly previewSubline = computed(() =>
    this.bannerType() === 'video' ? 'Video banner ad' : 'Image banner ad',
  );
  readonly previewBannerBackground = computed(() =>
    this.bannerType() === 'video'
      ? 'linear-gradient(135deg, #5F7CFA 0%, #2E91FF 45%, #28C6F0 100%)'
      : 'linear-gradient(135deg, #FFCC4B 0%, #FF8A1F 42%, #F35B22 100%)',
  );
  readonly selectedPlanSummary = computed(() => {
    switch (this.selectedPlanId()) {
      case '1-day':
        return {
          title: 'Promote for 1 day',
          billing: 'Billed daily',
          subscriptionAmount: '₦100.00',
          vatAmount: '₦0.00',
          totalAmount: '₦100.00',
        };
      case '7-days':
        return {
          title: 'Promote for 7 days',
          billing: 'Billed weekly',
          subscriptionAmount: '₦500.00',
          vatAmount: '₦0.00',
          totalAmount: '₦500.00',
        };
      case '30-days':
        return {
          title: 'Promote for 30 days',
          billing: 'Billed every six months',
          subscriptionAmount: '₦1,000.00',
          vatAmount: '₦75.00',
          totalAmount: '₦1,075.00',
        };
      default:
        return {
          title: 'Promote for 14 days',
          billing: 'Billed weekly',
          subscriptionAmount: '₦1,000.00',
          vatAmount: '₦0.00',
          totalAmount: '₦1,075.00',
        };
    }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imagePreview.set(URL.createObjectURL(file));
  }

  openPreview(): void {
    this.step.set(2);
  }

  submitForm(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      return;
    }

    this.step.set(3);
  }

  goToPaymentStep(): void {
    this.step.set(4);
  }

  completePayment(): void {
    this.step.set(5);
  }

  finishAndClose(): void {
    if (this.bannerForm.invalid) {
      this.step.set(1);
      this.bannerForm.markAllAsTouched();
      return;
    }

    this.submit.emit({
      title: this.bannerForm.controls.title.value.trim(),
      destinationUrl: this.bannerForm.controls.destinationUrl.value.trim(),
      bannerType: this.bannerForm.controls.bannerType.value,
      imagePreview: this.imagePreview(),
      planId: this.selectedPlanId(),
    });
  }

  resetFlow(): void {
    this.bannerForm.reset({
      title: '',
      destinationUrl: '',
      bannerType: 'image',
    });
    this.imagePreview.set(null);
    this.previewMode.set('desktop');
    this.selectedPlanId.set('14-days');
    this.selectedPaymentId.set('wallet');
    this.isRecurring.set(false);
    this.step.set(1);
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
  }
}
