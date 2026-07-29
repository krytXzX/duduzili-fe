import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroXMark } from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';
import { Router } from '@angular/router';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import { SellerMonetizationService } from '../../services/seller-monetization.service';

interface ListingBoostPlan {
  id: '1-day' | '7-days' | '14-days' | '30-days';
  label: string;
  price: string;
  unit: string;
  billing: string;
  subscriptionAmount: string;
  vatAmount: string;
  totalAmount: string;
  summaryTitle: string;
  summaryBilling: string;
  savings?: string;
}

interface StoreBoostPlan {
  id: '1-day' | '7-days' | '14-days' | '30-days';
  label: string;
  price: string;
  unit: string;
  billing: string;
  mobilePrice: string;
  mobileBilling: string;
  desktopSavings?: string;
  mobileSavings?: string;
  desktopSummaryTitle: string;
  desktopSummaryBilling: string;
  mobileSummaryTitle: string;
  mobileSummaryBilling: string;
  subscriptionAmount: string;
  desktopVatAmount: string;
  mobileVatAmount: string;
  totalAmount: string;
}

interface StorePaymentMethod {
  id: 'wallet' | 'online';
  label: string;
  desktopIcon: string;
  mobileIcon: string;
}

export interface ListingPromotionSelection {
  durationDays: number;
}

@Component({
  selector: 'app-promote-listing-modal',
  imports: [CommonModule, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({ heroXMark, heroStarSolid, heroChevronLeft }),
  ],
  template: `
    <div class="fixed inset-0 z-[220] flex items-center justify-center p-4" (click)="close.emit()">
      <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>
      @if (promoteTarget() === 'store') {
        @if (storeStep() === 'confirm') {
          <div
            class="relative hidden w-full max-w-[500px] overflow-hidden rounded-[20px] bg-[#F4F4F4] shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:block"
            (click)="$event.stopPropagation()"
          >
            <div class="rounded-b-[15px] bg-white px-6 pb-[127px] pt-6">
              <button
                type="button"
                (click)="close.emit()"
                class="absolute right-6 top-6 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                aria-label="Close promote store flow"
              >
                <img
                  [ngSrc]="storeAssets.closeDesktop"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                />
              </button>

              <div class="flex flex-col items-start gap-3">
                <div class="relative h-[120px] w-[121px] overflow-hidden">
                  <img
                    [ngSrc]="storeAssets.ringOuterDesktop"
                    width="121"
                    height="120"
                    alt=""
                    class="absolute inset-0 h-full w-full"
                  />
                  <img
                    [ngSrc]="storeAssets.ringInnerDesktop"
                    width="89"
                    height="88"
                    alt=""
                    class="absolute left-1/2 top-4 h-[88px] w-[89px] -translate-x-1/2"
                  />
                  <img
                    [ngSrc]="storeAssets.awardDesktop"
                    width="54"
                    height="54"
                    alt=""
                    class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
                  />
                </div>

                <div class="w-full space-y-3">
                  <h2 class="text-[24px] font-semibold leading-normal text-[#0D0D0D]">
                    You have <span class="text-[36px]">2</span
                    ><span class="text-[28px] text-black/50">/4</span>
                    store promotion left
                  </h2>
                  <p class="max-w-[420px] text-[16px] font-medium leading-[1.4] text-black/70">
                    Promoting this would mean, kinikan kinikan and more kinikan. You get?
                  </p>
                </div>
              </div>
            </div>

            <div class="absolute bottom-[15px] right-[13.5px] flex items-start justify-end gap-4">
              <button
                type="button"
                (click)="close.emit()"
                class="inline-flex h-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-black transition-all duration-200 hover:bg-gray-50 active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="storeStep.set('plan')"
                class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
              >
                Yes, promote store
              </button>
            </div>
          </div>

          <div
            class="relative h-[calc(100vh-1.5rem)] w-full max-w-[375px] overflow-hidden rounded-[36px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:hidden"
            (click)="$event.stopPropagation()"
          >
            <div class="flex justify-center pt-[11px]">
              <div class="h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
            </div>

            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
              aria-label="Close promote store flow"
            >
              <img
                [ngSrc]="storeAssets.closeMobile"
                width="24"
                height="24"
                alt=""
                class="h-6 w-6"
              />
            </button>

            <div class="px-4 pb-[89px] pt-[30px]">
              <div class="flex flex-col items-start gap-[6px]">
                <div class="relative h-[120px] w-[121px] overflow-hidden">
                  <img
                    [ngSrc]="storeAssets.ringOuterMobile"
                    width="121"
                    height="120"
                    alt=""
                    class="absolute inset-0 h-full w-full"
                  />
                  <img
                    [ngSrc]="storeAssets.ringInnerMobile"
                    width="89"
                    height="88"
                    alt=""
                    class="absolute left-1/2 top-4 h-[88px] w-[89px] -translate-x-1/2"
                  />
                  <img
                    [ngSrc]="storeAssets.awardMobile"
                    width="54"
                    height="54"
                    alt=""
                    class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
                  />
                </div>

                <h2 class="w-[323px] text-[24px] font-semibold leading-normal text-[#0D0D0D]">
                  You have <span class="text-[36px]">4</span
                  ><span class="text-[28px] text-black/50">/100</span>
                  store promotion left
                </h2>
                <p class="w-full text-[16px] leading-6 text-[#5A5A5A]">
                  Promoting this would mean, kinikan kinikan and more kinikan. You get?
                </p>
              </div>
            </div>

            <div class="absolute bottom-0 left-0 w-full bg-white px-4 pb-[26px] pt-[11px]">
              <button
                type="button"
                (click)="storeStep.set('plan')"
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
              >
                Yes, promote store
              </button>
            </div>
          </div>
        } @else if (storeStep() === 'plan') {
          <div
            class="relative hidden w-full max-w-[1024px] overflow-hidden rounded-[32px] border border-[#D7D7D7] bg-white shadow-[0_0_12px_4px_rgba(180,180,180,0.17)] md:block"
            (click)="$event.stopPropagation()"
          >
            <div
              class="absolute inset-x-0 top-0 h-[199px] rounded-t-[24px] bg-[linear-gradient(180deg,#ACA0F9_0%,rgba(255,255,255,0)_100%)]"
            ></div>

            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-[11px] top-[11px] inline-flex h-[57px] w-[57px] items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Close promote store plan picker"
            >
              <img
                [ngSrc]="storeAssets.planCloseDesktop"
                width="40"
                height="40"
                alt=""
                class="h-10 w-10 -rotate-45"
              />
            </button>

            <div class="px-[39px] pb-[73px] pt-[109px]">
              <div class="mx-auto w-[510px] text-center">
                <h2 class="text-[36px] font-semibold leading-[1.1] text-[#0D0D0D]">
                  Choose a boosting plan to proceed 🚀
                </h2>
                <p class="mt-2 text-[16px] leading-6 text-[#747474]">
                  Give your store more visibility
                </p>
              </div>

              <div class="mt-[94px] grid grid-cols-4 gap-[18px]">
                @for (plan of storePlans; track plan.id) {
                  <button
                    type="button"
                    (click)="selectedStorePlanId.set(plan.id)"
                    class="relative flex h-[225px] flex-col justify-between rounded-[20px] border px-[18px] pb-[18px] pt-[18px] text-left transition-all duration-200 hover:border-[#6453D9]/50 active:scale-[0.98]"
                    [class.bg-[rgba(100,83,217,0.04)]]="selectedStorePlanId() === plan.id"
                    [class.border-2]="selectedStorePlanId() === plan.id"
                    [class.border-[#6453D9]]="selectedStorePlanId() === plan.id"
                    [class.border-[#E4E4E4]]="selectedStorePlanId() !== plan.id"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <p class="max-w-[224px] text-[20px] font-medium leading-5 text-[#0D0D0D]">
                        {{ plan.label }}
                      </p>

                      @if (selectedStorePlanId() === plan.id) {
                        <span class="relative mt-px h-4 w-4 shrink-0">
                          <img
                            [ngSrc]="storeAssets.planCheckFilled"
                            width="16"
                            height="16"
                            alt=""
                            class="absolute inset-0 h-4 w-4"
                          />
                          <img
                            [ngSrc]="storeAssets.planCheckFilledCenter"
                            width="10"
                            height="10"
                            alt=""
                            class="absolute inset-[3px] h-[10px] w-[10px]"
                          />
                        </span>
                      } @else {
                        <span class="relative mt-px h-4 w-4 shrink-0 opacity-0">
                          <img
                            [ngSrc]="storeAssets.planCheckOutline"
                            width="16"
                            height="16"
                            alt=""
                            class="absolute inset-0 h-4 w-4"
                          />
                          <img
                            [ngSrc]="storeAssets.planCheckOutlineCenter"
                            width="10"
                            height="10"
                            alt=""
                            class="absolute inset-[3px] h-[10px] w-[10px]"
                          />
                        </span>
                      }
                    </div>

                    <div class="space-y-1 leading-none">
                      @if (plan.desktopSavings) {
                        <span [class]="desktopSavingsClass(plan)">
                          {{ plan.desktopSavings }}
                        </span>
                      }
                      <p class="text-[28px] font-medium leading-[1.2] text-[#1F1F1F]">
                        {{ plan.price
                        }}<span class="text-[18px] text-[#939393]">/{{ plan.unit }}</span>
                      </p>
                      <p class="text-[14px] leading-[1.2] text-[#1B1B1B]">{{ plan.billing }}</p>
                    </div>
                  </button>
                }
              </div>

              <div class="mt-[66px] flex justify-center">
                <button
                  type="button"
                  (click)="submitStorePromotion()"
                  [disabled]="isSubmitting()"
                  class="flex h-10 w-[445px] items-center justify-center rounded-full border border-white bg-[#6453D9] text-[14px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] disabled:opacity-50 disabled:pointer-events-none gap-2 transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
                >
                  @if (isSubmitting()) {
                    <svg class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ isSubmitting() ? 'Processing...' : 'Promote store' }}
                </button>
              </div>
            </div>
          </div>

          <div
            class="relative h-[calc(100vh-1.5rem)] w-full max-w-[375px] overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:hidden"
            (click)="$event.stopPropagation()"
          >
            <div
              class="absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#83A0FF_0%,rgba(255,255,255,0)_100%)]"
            ></div>

            <button
              type="button"
              (click)="close.emit()"
              class="absolute right-0 top-3 flex h-10 w-10 items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Close promote store plan picker"
            >
              <img
                [ngSrc]="storeAssets.planCloseMobileBg"
                width="40"
                height="40"
                alt=""
                class="absolute inset-0 h-10 w-10"
              />
              <img
                [ngSrc]="storeAssets.planCloseMobile"
                width="24"
                height="24"
                alt=""
                class="relative h-6 w-6 -rotate-45"
              />
            </button>

            <div class="px-4 pb-[89px] pt-[84px]">
              <div class="mx-auto w-[266px] text-center">
                <h2 class="text-[24px] font-medium leading-[1.1] text-[#1A1B1D]">
                  Choose a boosting plan to proceed 🚀
                </h2>
                <p class="mt-1 text-[14px] leading-5 text-[#979797]">
                  Give your store more visibility
                </p>
              </div>

              <div class="mt-10 space-y-5">
                @for (plan of storePlans; track plan.id) {
                  <button
                    type="button"
                    (click)="selectedStorePlanId.set(plan.id)"
                    class="relative flex h-[84px] w-full items-center justify-between rounded-[20px] border px-[14px] text-left transition-all duration-200 hover:border-[#357FF6]/50 active:scale-[0.98]"
                    [class.bg-[#FAFAFF]]="selectedStorePlanId() === plan.id"
                    [class.border-2]="selectedStorePlanId() === plan.id"
                    [class.border-[#357FF6]]="selectedStorePlanId() === plan.id"
                    [class.border-[#E5E5E5]]="selectedStorePlanId() !== plan.id"
                  >
                    <div class="space-y-1">
                      <p class="text-[20px] font-medium leading-5 text-[#272727]">
                        {{ plan.label }}
                      </p>
                      <p class="text-[16px] leading-5 text-[#979797]">{{ plan.mobileBilling }}</p>
                    </div>

                    <p class="text-[16px] font-medium leading-5 text-[#272727]">
                      {{ plan.mobilePrice }}
                    </p>

                    @if (plan.mobileSavings) {
                      <span [class]="mobileSavingsClass(plan)">{{ plan.mobileSavings }}</span>
                    }
                  </button>
                }
              </div>
            </div>

            <div class="absolute bottom-0 right-0 w-full bg-white px-4 pb-[26px] pt-[11px]">
              <button
                type="button"
                (click)="submitStorePromotion()"
                [disabled]="isSubmitting()"
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] disabled:opacity-50 disabled:pointer-events-none gap-2 transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isSubmitting() ? 'Processing...' : 'Promote store' }}
              </button>
            </div>
          </div>
        } @else {
        }
      } @else {
        <div
          class="relative h-[calc(100vh-1.5rem)] w-full max-w-[375px] overflow-hidden rounded-[30px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:hidden"
          (click)="$event.stopPropagation()"
        >
          @if (step() === 'confirm') {
            <div class="flex h-full flex-col px-4 pb-4 pt-3">
              <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E7E8EE]"></div>

              <div class="mt-2 flex justify-end">
                <button
                  type="button"
                  (click)="close.emit()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                  [attr.aria-label]="'Close promote ' + targetLabel() + ' flow'"
                >
                  <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
                </button>
              </div>

              <div class="flex flex-1 flex-col justify-center px-2 text-[#202335]">
                <div
                  class="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-[#F8F6EE]"
                >
                  <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#FFF2BD]">
                    <div
                      class="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#D0B21F] text-white"
                    >
                      <ng-icon name="heroStarSolid" class="text-[22px]"></ng-icon>
                    </div>
                  </div>
                </div>

                <h2 class="mt-7 text-[17px] font-semibold leading-7 tracking-[-0.03em]">
                  @if (hasQuota()) {
                    You have <span class="font-black">{{ quotaString() }}</span> {{ targetLabel() }} promotion left
                  } @else {
                    You have reached your promotion limit
                  }
                </h2>

                <p class="mt-3 text-[11px] leading-5 text-[#8A8F9A]">
                  @if (hasQuota()) {
                    Promoting this would mean, kinikan kinikan and more kinikan. You get?
                  } @else {
                    Please upgrade your plan to continue promoting your {{ targetLabel() }}s.
                  }
                </p>
              </div>

              @if (hasQuota()) {
                <button
                  type="button"
                  (click)="step.set('plan')"
                  class="rounded-full bg-[#6653E4] px-5 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
                >
                  {{ confirmActionLabel() }}
                </button>
              } @else {
                <button
                  type="button"
                  (click)="handleUpgradePlan()"
                  class="rounded-full bg-[#111111] px-5 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(17,17,17,0.9)] transition-all duration-200 hover:bg-[#222222] active:scale-95"
                >
                  Upgrade Plan
                </button>
              }
            </div>
          }

          @if (step() === 'plan') {
            <div class="flex h-full flex-col px-4 pb-4 pt-3">
              <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E7E8EE]"></div>

              <div class="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  (click)="step.set('confirm')"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F6F7FA] text-[#4D5260] transition-all duration-200 hover:bg-[#e8e8e8] active:scale-95"
                  aria-label="Go back"
                >
                  <ng-icon name="heroChevronLeft" class="text-[20px]"></ng-icon>
                </button>
                <button
                  type="button"
                  (click)="close.emit()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                  [attr.aria-label]="'Close promote ' + targetLabel() + ' flow'"
                >
                  <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
                </button>
              </div>

              <div class="flex-1 overflow-y-auto pb-4 pt-6 text-[#202335]">
                <div
                  class="rounded-[24px] bg-[linear-gradient(180deg,#B5A9FF_0%,#EEE9FF_42%,#FFFFFF_100%)] px-5 pb-6 pt-6"
                >
                  <h2 class="text-center text-[17px] font-semibold leading-7 tracking-[-0.03em]">
                    Choose a boosting plan to proceed🚀
                  </h2>
                  <p class="mt-1 text-center text-[11px] leading-5 text-[#8A8F9A]">
                    {{ planSubtitle() }}
                  </p>

                  <div class="mt-5 space-y-3">
                    @for (plan of plans; track plan.id) {
                      <button
                        type="button"
                        (click)="selectedPlanId.set(plan.id)"
                        class="relative flex w-full items-center justify-between rounded-[16px] border bg-white px-4 py-4 text-left transition-all duration-200 hover:border-[#6955F2]/50 active:scale-[0.98]"
                        [class.border-[#6955F2]]="selectedPlanId() === plan.id"
                        [class.border-[#E7E8EC]]="selectedPlanId() !== plan.id"
                      >
                        <div>
                          <p class="text-[12px] font-medium text-[#1B1D23]">{{ plan.label }}</p>
                          <p class="mt-1 text-[10px] text-[#8B8F98]">{{ plan.billing }}</p>
                        </div>
                        <span class="text-[12px] font-medium text-[#1B1D23]">{{ plan.price }}</span>

                        @if (plan.savings) {
                          <span
                            class="absolute right-2 top-[-9px] rounded-full bg-[#F1F7AA] px-2 py-0.5 text-[8px] font-semibold text-[#6A7414]"
                          >
                            Save {{ plan.savings }}
                          </span>
                        }
                      </button>
                    }
                  </div>
                </div>
              </div>

              <button
                type="button"
                (click)="submitListingPromotion()"
                [disabled]="isSubmitting()"
                class="rounded-full bg-[#6653E4] px-5 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                }
                {{ isSubmitting() ? 'Processing...' : 'Promote listing' }}
              </button>
            </div>
          }

          @if (step() === 'success') {
            <div class="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
              <div class="mb-8 text-[72px] leading-none">🛒</div>
              <h2 class="text-[18px] font-semibold leading-7 tracking-[-0.03em] text-[#1A1C21]">
                {{ successTitle() }}
              </h2>
              <p class="mt-3 text-[11px] leading-5 text-[#8E929B]">
                {{ successDescription() }}
              </p>

              <div class="mt-8 grid w-full grid-cols-1 gap-3">
                <button
                  type="button"
                  (click)="resetFlow()"
                  class="rounded-full bg-[#F3F3F5] px-6 py-3 text-[12px] font-medium text-[#353A43] transition-all duration-200 hover:bg-[#e4e4e6] active:scale-95"
                >
                  {{ repeatActionLabel() }}
                </button>
                <button
                  type="button"
                  (click)="finishAndClose()"
                  class="rounded-full bg-[#6653E4] px-6 py-3 text-[12px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
                >
                  View running Ads
                </button>
              </div>
            </div>
          }
        </div>

        <div
          class="relative hidden overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:block"
          [class.w-full]="step() !== 'confirm'"
          [style.max-width]="modalWidth()"
          (click)="$event.stopPropagation()"
        >
          @if (step() === 'confirm') {
            <div class="p-10 pt-16 text-center">
              <button
                type="button"
                (click)="close.emit()"
                class="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:text-gray-600 active:scale-95"
              >
                <ng-icon name="heroXMark" class="text-xl"></ng-icon>
              </button>

              <div class="mb-10 flex justify-center">
                <div class="flex h-32 w-32 items-center justify-center rounded-full bg-[#F8F6EE]">
                  <div class="flex h-24 w-24 items-center justify-center rounded-full bg-[#FFF2BD]">
                    <div
                      class="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#D0B21F] text-white shadow-lg shadow-yellow-100"
                    >
                      <ng-icon name="heroStarSolid" class="text-2xl"></ng-icon>
                    </div>
                  </div>
                </div>
              </div>

              <h2 class="text-[24px] font-semibold leading-tight tracking-tight text-[#1A1C21]">
                @if (hasQuota()) {
                  You have <span class="font-black">{{ quotaString() }}</span> {{ targetLabel() }} promotion left
                } @else {
                  You have reached your promotion limit
                }
              </h2>

              <p class="mx-auto mt-5 max-w-[420px] text-[15px] leading-7 text-gray-500">
                @if (hasQuota()) {
                  Promoting this would mean, kinikan kinikan and more kinikan. You get?
                } @else {
                  Please upgrade your plan to continue promoting your {{ targetLabel() }}s.
                }
              </p>

              <div class="mt-12 flex items-center justify-center gap-3">
                <button
                  type="button"
                  (click)="close.emit()"
                  class="rounded-full border border-gray-100 bg-white px-8 py-4 text-[15px] font-medium text-[#1A1C21] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                >
                  Cancel
                </button>
                @if (hasQuota()) {
                  <button
                    type="button"
                    (click)="step.set('plan')"
                    class="rounded-full bg-[#6653E4] px-8 py-4 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
                  >
                    {{ confirmActionLabel() }}
                  </button>
                } @else {
                  <button
                    type="button"
                    (click)="handleUpgradePlan()"
                    class="rounded-full bg-[#111111] px-8 py-4 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(17,17,17,0.9)] transition-all duration-200 hover:bg-[#222222] active:scale-95"
                  >
                    Upgrade Plan
                  </button>
                }
              </div>
            </div>
          }

          @if (step() === 'plan') {
            <div
              class="relative flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <div
                class="relative bg-linear-to-b from-[#B5A9FF] via-[#EEE9FF] to-white px-10 pb-18 pt-10 text-center"
              >
                <button
                  type="button"
                  (click)="close.emit()"
                  class="absolute right-8 top-8 flex h-10 w-10 items-center justify-center rounded-full text-[#1A1C21] transition-all duration-200 hover:bg-white/60 hover:scale-105 active:scale-95"
                >
                  <ng-icon name="heroXMark" class="text-2xl"></ng-icon>
                </button>

                <div class="mx-auto max-w-xl pt-16">
                  <h2 class="text-[2rem] font-black leading-[1.02] tracking-tight text-[#17181D]">
                    Choose a boosting plan to proceed🚀
                  </h2>
                  <p class="mt-3 text-[0.95rem] font-medium text-[#7F828B]">
                    {{ planSubtitle() }}
                  </p>
                </div>
              </div>

              <div class="flex-1 overflow-y-auto px-10 pb-12">
                <div class="-mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  @for (plan of plans; track plan.id) {
                    <button
                      type="button"
                      (click)="selectedPlanId.set(plan.id)"
                      class="flex min-h-[225px] flex-col justify-between rounded-[26px] border bg-white p-6 text-left transition-all hover:border-[#6955F2]/50 active:scale-[0.98]"
                      [class.border-[#6955F2]]="selectedPlanId() === plan.id"
                      [class.bg-[#F8F6FF]]="selectedPlanId() === plan.id"
                      [class.shadow-[0_16px_38px_-28px_rgba(105,85,242,0.8)]]="
                        selectedPlanId() === plan.id
                      "
                      [class.border-[#E7E8EC]]="selectedPlanId() !== plan.id"
                    >
                      <div>
                        <h3 class="text-[1rem] font-semibold tracking-tight text-[#1B1D23]">
                          {{ plan.label }}
                        </h3>
                      </div>

                      <div>
                        @if (plan.savings) {
                          <span
                            class="mb-4 inline-flex rounded-full bg-[#F1F7AA] px-2.5 py-1 text-xs font-semibold text-[#6A7414]"
                          >
                            Save {{ plan.savings }}
                          </span>
                        }

                        <div class="flex items-baseline gap-1 text-[#1B1D23]">
                          <span class="text-[1.8rem] font-black leading-none">{{
                            plan.price
                          }}</span>
                          <span class="text-[0.875rem] font-medium text-[#8B8F98]"
                            >/{{ plan.unit }}</span
                          >
                        </div>
                        <p class="mt-1 text-[0.875rem] font-medium text-[#666B74]">
                          {{ plan.billing }}
                        </p>
                      </div>
                    </button>
                  }
                </div>

                <div class="mt-16 flex justify-center">
                  <button
                    type="button"
                    (click)="submitListingPromotion()"
                    [disabled]="isSubmitting()"
                    class="w-full max-w-[460px] rounded-full bg-[#6653E4] px-8 py-4 text-[1rem] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
                  >
                    @if (isSubmitting()) {
                      <svg class="animate-spin h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    }
                    {{ isSubmitting() ? 'Processing...' : 'Promote listing' }}
                  </button>
                </div>
              </div>
            </div>
          }

          @if (step() === 'success') {
            <div
              class="flex h-full flex-col items-center justify-center px-6 py-12 text-center animate-in fade-in zoom-in-95 duration-300"
            >
              <div class="mb-10 text-[92px] leading-none">🛒</div>
              <h2 class="text-[2rem] font-black tracking-tight text-[#1A1C21]">
                {{ successTitle() }}
              </h2>
              <p class="mt-4 max-w-[620px] text-[0.95rem] font-medium leading-7 text-[#8E929B]">
                {{ successDescription() }}
                Promotion ends on 27 April 2026.
              </p>

              <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  (click)="resetFlow()"
                  class="rounded-full bg-[#F3F3F5] px-6 py-3.5 text-sm font-semibold text-[#353A43] transition-all duration-200 hover:bg-[#E9EAF0] active:scale-95"
                >
                  {{ repeatActionLabel() }}
                </button>
                <button
                  type="button"
                  (click)="finishAndClose()"
                  class="rounded-full bg-[#6653E4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition-all duration-200 hover:bg-[#5542cc] active:scale-95"
                >
                  View running Ads
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromoteListingModalComponent implements OnDestroy {
  promoteTarget = input<'listing' | 'store'>('listing');
  isSubmitting = input(false);
  close = output<void>();
  promoted = output<void>();
  promotionRequested = output<ListingPromotionSelection>();
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  private readonly router = inject(Router);

  protected readonly storeAssets = {
    awardDesktop: '/assets/icons/promote-store-award-desktop.svg',
    awardMobile: '/assets/icons/promote-store-award-mobile.svg',
    closeDesktop: '/assets/icons/promote-store-close-desktop.svg',
    closeMobile: '/assets/icons/promote-store-close-mobile.svg',
    planCheckFilled: '/assets/icons/promote-store-plan-check-filled.svg',
    planCheckFilledCenter: '/assets/images/promote-store-plan-check-filled-center.svg',
    planCheckOutline: '/assets/icons/promote-store-plan-check-outline.svg',
    planCheckOutlineCenter: '/assets/images/promote-store-plan-check-outline-center.svg',
    planCloseDesktop: '/assets/icons/promote-store-plan-close-desktop.svg',
    planCloseMobile: '/assets/icons/promote-store-plan-close-mobile.svg',
    planCloseMobileBg: '/assets/images/promote-store-plan-close-mobile-bg.svg',
    ringInnerDesktop: '/assets/images/promote-store-ring-inner-desktop.svg',
    ringInnerMobile: '/assets/images/promote-store-ring-inner-mobile.svg',
    ringOuterDesktop: '/assets/images/promote-store-ring-outer-desktop.svg',
    ringOuterMobile: '/assets/images/promote-store-ring-outer-mobile.svg',
  } as const;

  readonly storeStep = signal<'confirm' | 'plan'>('confirm');
  readonly selectedStorePlanId = signal<StoreBoostPlan['id']>('7-days');
  readonly step = signal<'confirm' | 'plan' | 'success'>('confirm');
  readonly selectedPlanId = signal<ListingBoostPlan['id']>('7-days');

  readonly storePlans: StoreBoostPlan[] = [
    {
      id: '1-day',
      label: 'Boost for 1 day',
      price: '₦100',
      unit: 'day',
      billing: 'billed daily',
      mobilePrice: '₦100',
      mobileBilling: 'billed daily',
      desktopSummaryTitle: 'Feature for 1 day',
      desktopSummaryBilling: 'Billed daily',
      mobileSummaryTitle: 'Promote for 1 day',
      mobileSummaryBilling: 'Billed daily',
      subscriptionAmount: '₦100.00',
      desktopVatAmount: '₦7.50',
      mobileVatAmount: '₦7.50',
      totalAmount: '₦107.50',
    },
    {
      id: '7-days',
      label: 'Boost for 7 days',
      price: '₦500',
      unit: 'week',
      billing: 'billed weekly',
      mobilePrice: '₦500',
      mobileBilling: 'billed weekly',
      desktopSummaryTitle: 'Feature for 7 days',
      desktopSummaryBilling: 'Billed monthly',
      mobileSummaryTitle: 'Promote for 7 days',
      mobileSummaryBilling: 'Billed weekly',
      subscriptionAmount: '₦1,000.00',
      desktopVatAmount: '₦75.00',
      mobileVatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
    },
    {
      id: '14-days',
      label: 'Boost for 14 days',
      price: '₦700',
      unit: 'bi-weekly',
      billing: 'billed bi-weekly',
      mobilePrice: '₦700',
      mobileBilling: 'billed bi-weekly',
      desktopSavings: 'Save 20%',
      mobileSavings: 'Save 20%',
      desktopSummaryTitle: 'Feature for 14 days',
      desktopSummaryBilling: 'Billed bi-weekly',
      mobileSummaryTitle: 'Promote for 14 days',
      mobileSummaryBilling: 'Billed weekly',
      subscriptionAmount: '₦1,000.00',
      desktopVatAmount: '₦52.50',
      mobileVatAmount: '₦0.00',
      totalAmount: '₦1,075.00',
    },
    {
      id: '30-days',
      label: 'Boost for 30 days',
      price: '₦1,000',
      unit: 'month',
      billing: 'billed monthly',
      mobilePrice: '₦1,000',
      mobileBilling: 'billed every six months',
      desktopSavings: 'Save 50%',
      mobileSavings: 'Save 60%',
      desktopSummaryTitle: 'Feature for 30 days',
      desktopSummaryBilling: 'Billed monthly',
      mobileSummaryTitle: 'Promote for 30 days',
      mobileSummaryBilling: 'Billed every six months',
      subscriptionAmount: '₦1,000.00',
      desktopVatAmount: '₦75.00',
      mobileVatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
    },
  ];

  readonly plans: ListingBoostPlan[] = [
    {
      id: '1-day',
      label: 'Promote for 1 day',
      price: '₦100',
      unit: 'day',
      billing: 'Billed daily',
      subscriptionAmount: '₦100.00',
      vatAmount: '₦7.50',
      totalAmount: '₦107.50',
      summaryTitle: 'Feature for 1 day',
      summaryBilling: 'Billed daily',
    },
    {
      id: '7-days',
      label: 'Promote for 7 days',
      price: '₦500',
      unit: 'week',
      billing: 'Billed weekly',
      subscriptionAmount: '₦1,000.00',
      vatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
      summaryTitle: 'Feature for 7 days',
      summaryBilling: 'Billed monthly',
    },
    {
      id: '14-days',
      label: 'Promote for 14 days',
      price: '₦700',
      unit: 'bi-weekly',
      billing: 'Billed bi-weekly',
      subscriptionAmount: '₦700.00',
      vatAmount: '₦52.50',
      totalAmount: '₦752.50',
      summaryTitle: 'Feature for 14 days',
      summaryBilling: 'Billed bi-weekly',
      savings: '20%',
    },
    {
      id: '30-days',
      label: 'Promote for 30 days',
      price: '₦1,000',
      unit: 'month',
      billing: 'Billed monthly',
      subscriptionAmount: '₦1,000.00',
      vatAmount: '₦75.00',
      totalAmount: '₦1,075.00',
      summaryTitle: 'Feature for 30 days',
      summaryBilling: 'Billed monthly',
      savings: '50%',
    },
  ];

  readonly selectedPlan = computed(
    () => this.plans.find((plan) => plan.id === this.selectedPlanId()) ?? this.plans[1],
  );
  readonly selectedStorePlan = computed(
    () =>
      this.storePlans.find((plan) => plan.id === this.selectedStorePlanId()) ?? this.storePlans[1],
  );

  readonly modalWidth = computed(() => {
    switch (this.step()) {
      case 'confirm':
        return '560px';
      case 'plan':
        return '1120px';
      default:
        return '760px';
    }
  });

  readonly targetLabel = computed(() => (this.promoteTarget() === 'store' ? 'store' : 'listing'));
  readonly remainingQuota = computed(() => {
    const status = this.sellerMonetizationService.subscriptionStatus();
    if (!status || !status.features) return 0;

    if (this.promoteTarget() === 'store') {
      const store = status.features.store_promotions;
      if (!store) return 0;
      return store.remaining ?? Math.max(0, store.max - store.used);
    } else {
      const listings = status.features.listing_promotions;
      if (!listings) return 0;
      const max = (listings.automobile?.max ?? 0) + (listings.property?.max ?? 0) + (listings.other?.max ?? 0);
      const used = (listings.automobile?.used ?? 0) + (listings.property?.used ?? 0) + (listings.other?.used ?? 0);
      return Math.max(0, max - used);
    }
  });

  readonly hasQuota = computed(() => this.remainingQuota() > 0);

  readonly quotaString = computed(() => {
    const status = this.sellerMonetizationService.subscriptionStatus();
    if (!status || !status.features) return '0/0';

    if (this.promoteTarget() === 'store') {
      const store = status.features.store_promotions;
      if (!store) return '0/0';
      const max = store.max;
      return `${this.remainingQuota()}/${max}`;
    } else {
      const listings = status.features.listing_promotions;
      if (!listings) return '0/0';
      const max = (listings.automobile?.max ?? 0) + (listings.property?.max ?? 0) + (listings.other?.max ?? 0);
      return `${this.remainingQuota()}/${max}`;
    }
  });

  readonly confirmTitle = computed(() => `You have ${this.quotaString()} ${this.targetLabel()} promotion left`);
  readonly confirmActionLabel = computed(() => `Yes, promote ${this.targetLabel()}`);
  readonly planSubtitle = computed(() =>
    this.promoteTarget() === 'store'
      ? 'Give your store more visibility'
      : 'Give your listing more visibility',
  );
  readonly successTitle = computed(() =>
    this.promoteTarget() === 'store'
      ? 'Store promotion is now active 🚀'
      : 'Listing promotion is now active 🚀',
  );
  readonly successDescription = computed(() =>
    this.promoteTarget() === 'store'
      ? 'Your store is now promoted across Search, Categories, and Explore.'
      : 'Your listing is now promoted across Search, Categories, and Explore.',
  );
  readonly repeatActionLabel = computed(() =>
    this.promoteTarget() === 'store' ? 'Promote another store' : 'Promote another listing',
  );

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  protected desktopSavingsClass(plan: StoreBoostPlan): string {
    if (plan.id === '14-days') {
      return 'inline-flex rounded-[100px] bg-[#F1FFAC] px-2 py-1 text-[12px] font-medium leading-none text-[#4E3E07]';
    }

    if (plan.id === '30-days') {
      return 'inline-flex rounded-[100px] bg-[#F1FFAC] px-2 py-1 text-[12px] font-medium leading-none text-[#4E3E07]';
    }

    return '';
  }

  protected mobileSavingsClass(plan: StoreBoostPlan): string {
    if (plan.id === '14-days') {
      return 'absolute right-3 top-[-10px] inline-flex rounded-[100px] bg-[#F1FFAC] px-2 py-1 text-[12px] font-medium leading-none text-[#4E3E07]';
    }

    if (plan.id === '30-days') {
      return 'absolute right-3 top-[-10px] inline-flex rounded-[100px] bg-[#EAEAEA] px-2 py-1 text-[12px] font-semibold leading-none text-[#0D0D0D]';
    }

    return '';
  }

  resetFlow() {
    this.storeStep.set('confirm');
    this.selectedStorePlanId.set('7-days');
    this.selectedPlanId.set('7-days');
    this.step.set('confirm');
  }

  finishAndClose() {
    this.promoted.emit();
    this.close.emit();
  }

  protected submitListingPromotion() {
    if (this.isSubmitting()) {
      return;
    }

    this.promotionRequested.emit({
      durationDays: this.durationFromPlanId(this.selectedPlanId()),
    });
  }

  protected handleUpgradePlan(): void {
    this.close.emit();
    void this.router.navigate(['/seller/ads/plans']);
  }

  submitStorePromotion() {
    if (this.isSubmitting()) {
      return;
    }

    this.promotionRequested.emit({
      durationDays: this.durationFromPlanId(this.selectedStorePlanId()),
    });
  }

  private durationFromPlanId(planId: string): number {
    switch (planId) {
      case '1-day':
        return 1;
      case '14-days':
        return 14;
      case '30-days':
        return 30;
      default:
        return 7;
    }
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
