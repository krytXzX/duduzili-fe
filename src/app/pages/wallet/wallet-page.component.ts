import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  CustomDropdownComponent,
  type CustomDropdownOption,
} from '../../components/ui/custom-dropdown.component';
import { AppToastService } from '../../services/app-toast.service';
import {
  SellerMonetizationService,
  type WalletTransactionRecord,
} from '../../services/seller-monetization.service';

type WalletStatus = 'successful' | 'failed';
type WalletTransactionType =
  | 'all'
  | 'wallet funding'
  | 'subscription payment'
  | 'ad promotion'
  | 'other';
type WalletDateFilter = 'all' | string;

interface WalletTransaction {
  id: string;
  amount: string;
  type: Exclude<WalletTransactionType, 'all'>;
  date: string;
  dateKey: string;
  status: WalletStatus;
}

interface MobileWalletTransaction {
  icon: string;
  title: string;
  date: string;
  amount: string;
  status: WalletStatus;
}

@Component({
  selector: 'app-wallet-page',
  imports: [NgOptimizedImage, RouterLink, CustomDropdownComponent],
  template: `
    <div class="md:hidden">
      <div class="px-5 pb-28">
        <div class="flex h-[54px] items-center justify-between gap-4">
          <a
            routerLink="/seller/more"
            aria-label="Back to more"
            class="inline-flex items-center gap-2 text-black"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M11.5 5L6.5 10L11.5 15"
                  stroke="#141414"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </span>
            <span class="text-[20px] font-semibold leading-6 tracking-[-0.03em] text-black">
              Wallet
            </span>
          </a>

          <button
            type="button"
            (click)="openFundWallet()"
            class="inline-flex h-10 items-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-4 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
          >
            <img [ngSrc]="assets.addIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]" />
            Fund wallet
          </button>
        </div>

        <div class="mt-12">
          <h1 class="max-w-[350px] text-[32px] font-medium leading-[1.3] text-[#414141]">
            You currently have
            <span class="font-bold text-[#959595]">{{ formattedWalletBalance() }}</span>
            in your wallet
          </h1>
        </div>

        <section class="mt-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[16px] font-medium leading-5 text-[#4D4845]">Transaction history</h2>
              <p class="mt-1 text-[12px] leading-4 text-[#928F8B]">
                {{ transactions().length }} total
              </p>
            </div>

            @if (visibleTransactions().length > 5) {
              <button
                type="button"
                (click)="toggleAllMobileTransactions()"
                class="rounded px-1 text-[16px] font-medium leading-5 text-[#6453D9] underline underline-offset-2 transition hover:text-[#5140C9] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453D9]"
                [attr.aria-expanded]="showAllMobileTransactions()"
                aria-controls="mobile-wallet-transactions"
              >
                {{ showAllMobileTransactions() ? 'Show less' : 'See all' }}
              </button>
            }
          </div>

          <div id="mobile-wallet-transactions" class="mt-6 space-y-6">
            @for (transaction of mobileTransactions(); track transaction.title + transaction.date) {
              <article class="flex items-center gap-3">
                <div
                  class="relative h-10 w-10 shrink-0 rounded-full border border-[#F4F4F2] bg-white"
                >
                  <img
                    [ngSrc]="transaction.icon"
                    width="24"
                    height="24"
                    alt=""
                    class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                  />
                  <span
                    class="absolute left-[21px] top-[21px] inline-flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_3px_9px_rgba(172,172,172,0.25)]"
                  >
                    <img
                      [ngSrc]="assets.mobileDirectionIcon"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    />
                  </span>
                </div>

                <div class="flex min-w-0 flex-1 items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="truncate text-[14px] font-medium leading-5 text-[#4D4845]">
                      {{ transaction.title }}
                    </p>
                    <p class="mt-1 text-[12px] leading-4 text-[#928F8B]">{{ transaction.date }}</p>
                  </div>

                  <div class="text-right">
                    <p class="text-[14px] font-medium leading-5 text-[#215B44]">
                      {{ transaction.amount }}
                    </p>
                    <p
                      class="mt-1 text-[12px] leading-4"
                      [class.text-[#50BD5A]]="transaction.status === 'successful'"
                      [class.text-[#FF2524]]="transaction.status === 'failed'"
                    >
                      {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                    </p>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    </div>

    <div class="hidden h-full md:block">
      <div class="flex h-full flex-col rounded-[24px] bg-white">
        <div class="px-4 pb-0 pt-[72px]">
          <div class="flex items-start justify-between gap-6">
            <h1
              class="max-w-[468px] pt-[21px] text-[40px] font-medium leading-[1.3] text-[#414141]"
            >
              You currently have
              <span class="font-bold text-[#959595]">{{ formattedWalletBalance() }}</span>
              in your wallet
            </h1>

            <button
              type="button"
              (click)="openFundWallet()"
              class="inline-flex h-12 shrink-0 items-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              <img
                [ngSrc]="assets.addIcon"
                width="18"
                height="18"
                alt=""
                class="h-[18px] w-[18px]"
              />
              Fund wallet
            </button>
          </div>

          <section class="mt-9">
            <h2 class="text-[20px] font-medium leading-[1.2] text-[#0D0D0D]">
              Transaction history
            </h2>

            <div class="mt-4 rounded-[16px] border border-[#F0F0F0] bg-white">
              <div class="flex items-center justify-between px-[15px] py-[15px]">
                <div class="flex flex-wrap gap-2">
                  <app-custom-dropdown
                    [options]="transactionTypeOptions()"
                    [value]="transactionType()"
                    ariaLabel="Select transaction type"
                    buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                    iconClass="text-[rgba(26,27,29,0.5)]"
                    menuClass="min-w-[190px]"
                    (valueChange)="transactionType.set($event)"
                  ></app-custom-dropdown>

                  <app-custom-dropdown
                    [options]="dateFilterOptions()"
                    [value]="dateFilter()"
                    ariaLabel="Select transaction date"
                    buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                    iconClass="text-[rgba(26,27,29,0.5)]"
                    menuClass="min-w-[150px]"
                    (valueChange)="dateFilter.set($event)"
                  ></app-custom-dropdown>

                  <app-custom-dropdown
                    [options]="statusFilterOptions"
                    [value]="statusFilter()"
                    ariaLabel="Select transaction status"
                    buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                    iconClass="text-[rgba(26,27,29,0.5)]"
                    menuClass="min-w-[150px]"
                    (valueChange)="statusFilter.set($event)"
                  ></app-custom-dropdown>
                </div>
              </div>

              <div class="border-t border-[#F4F4F4] bg-[#FAFAFA]">
                <div
                  class="grid grid-cols-[1.1fr_1.35fr_1fr_0.9fr] gap-6 px-[35px] py-[11px] text-[12px] font-medium leading-[normal] text-[rgba(26,27,29,0.6)]"
                >
                  <span>Amount</span>
                  <span>Transaction type</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>
              </div>

              <div>
                @for (
                  transaction of visibleTransactions();
                  track transaction.amount + transaction.type + transaction.date
                ) {
                  <div
                    class="grid min-h-[60px] grid-cols-[1.1fr_1.35fr_1fr_0.9fr] gap-6 items-center border-t border-[#F0F0F0] px-[35px] py-4 text-[14px] leading-5 text-[#1A1B1D] first:border-t-0"
                  >
                    <span class="font-medium">{{ transaction.amount }}</span>
                    <span>{{
                      transaction.type === 'wallet funding'
                        ? 'Wallet funding'
                        : 'Subscription payment'
                    }}</span>
                    <span>{{ transaction.date }}</span>
                    <span>
                      <span [class]="statusBadgeClass(transaction.status)">
                        <img
                          [ngSrc]="
                            transaction.status === 'successful'
                              ? assets.successIcon
                              : assets.failedIcon
                          "
                          width="14"
                          height="14"
                          alt=""
                          class="h-[14px] w-[14px]"
                        />
                        {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                      </span>
                    </span>
                  </div>
                }
              </div>
            </div>
          </section>
        </div>

        <div
          class="mt-auto flex items-center justify-between px-4 pb-4 pt-10 text-[16px] leading-[normal]"
        >
          <p class="text-[#1A1B1D]">
            {{ totalResults() }} <span class="text-[rgba(26,27,29,0.5)]">results</span>
          </p>

          <div class="flex items-center gap-2 text-[#1C1F1D] opacity-50">
            <div class="flex items-end gap-[5px]">
              <button
                type="button"
                (click)="previousPage()"
                [disabled]="!hasPreviousPage()"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                aria-label="Previous page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M11.5 5L6.5 10L11.5 15"
                    stroke="#1C1F1D"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>

              <span
                class="inline-flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-white px-[14px] text-[14px] font-medium shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
              >
                {{ currentPage() }}
              </span>

              <button
                type="button"
                (click)="nextPage()"
                [disabled]="!hasNextPage()"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                aria-label="Next page"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="none"
                >
                  <path
                    d="M8.5 5L13.5 10L8.5 15"
                    stroke="#1C1F1D"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </button>
            </div>

            <span>of {{ totalPages() }}</span>
          </div>
        </div>
      </div>
    </div>

    @if (isFundWalletOpen()) {
      <div
        class="fixed inset-0 z-[220] bg-black/20 backdrop-blur-[2px]"
        (click)="closeFundWallet()"
      >
        <div class="hidden h-full items-center justify-center p-6 md:flex">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-fund-title-desktop"
            class="w-full max-w-[550px] rounded-[16px] bg-[#FAFAFA] shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-center justify-between px-6 pb-5 pt-5">
              <h2
                id="wallet-fund-title-desktop"
                class="text-[24px] font-bold leading-5 tracking-[-0.03em] text-[#0D0D0D]"
              >
                Fund wallet
              </h2>

              <button
                type="button"
                (click)="closeFundWallet()"
                aria-label="Close fund wallet modal"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              >
                <img
                  [ngSrc]="assets.fundWalletCloseIcon"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                />
              </button>
            </div>

            <div class="px-6 pb-6">
              <div class="space-y-6">
                <section class="overflow-hidden rounded-[16px] bg-white p-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="max-w-[292px]">
                      <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.7)]">
                        Transfer to the account details below and your wallet will be funded
                        instantly
                        <span aria-hidden="true"> ⚡️</span>
                      </p>

                      <div class="mt-[22px] space-y-[26px]">
                        <div class="flex items-center gap-3">
                          <div
                            class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                          >
                            <img
                              [ngSrc]="assets.fundWalletHashtagIcon"
                              width="24"
                              height="24"
                              alt=""
                              class="h-6 w-6"
                            />
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                              Account number
                            </p>
                            <div class="mt-0.5 flex items-center gap-1.5">
                              <p
                                class="text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[#1A1B1D]"
                              >
                                {{ fundWalletDetails().accountNumber || 'Loading...' }}
                              </p>
                              <button
                                type="button"
                                (click)="copyAccountNumber()"
                                [attr.aria-label]="
                                  hasCopiedAccount()
                                    ? 'Account number copied'
                                    : 'Copy account number'
                                "
                                class="inline-flex h-7 w-7 items-center justify-center rounded-full"
                              >
                                <img
                                  [ngSrc]="assets.fundWalletCopyIcon"
                                  width="20"
                                  height="20"
                                  alt=""
                                  class="h-5 w-5"
                                />
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <div
                            class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                          >
                            <img
                              [ngSrc]="assets.fundWalletBankIcon"
                              width="24"
                              height="24"
                              alt=""
                              class="h-6 w-6"
                            />
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Bank name</p>
                            <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                              {{ fundWalletDetails().bankName || 'Loading...' }}
                            </p>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <div
                            class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                          >
                            <img
                              [ngSrc]="assets.fundWalletUserIcon"
                              width="24"
                              height="24"
                              alt=""
                              class="h-6 w-6"
                            />
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Name</p>
                            <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                              {{ fundWalletDetails().accountName || 'Loading...' }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <img
                      [ngSrc]="assets.fundWalletIllustration"
                      width="184"
                      height="184"
                      alt=""
                      class="mt-[44px] h-[184px] w-[184px] shrink-0 object-contain"
                    />
                  </div>
                </section>

                <div class="flex items-center justify-center gap-6">
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.8)]">OR</span>
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                </div>

                <div class="flex flex-col gap-2 text-left">
                  <label class="text-[14px] font-medium text-[rgba(26,27,29,0.7)]" for="fund-amount-desktop">
                    Amount to fund (₦)
                  </label>
                  <input
                    id="fund-amount-desktop"
                    type="number"
                    [value]="fundAmount()"
                    (input)="onFundAmountChange($event)"
                    min="100"
                    placeholder="Enter amount (e.g. 5000)"
                    class="h-[44px] w-full rounded-[12px] border border-[#efefef] bg-white px-3 text-[14px] text-[#1A1B1D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]"
                  />
                </div>

                <button
                  type="button"
                  (click)="payOnline()"
                  class="flex h-[67px] w-full items-center justify-between rounded-[16px] bg-white px-[6px] py-[6px] text-left"
                >
                  <span class="flex items-center gap-3">
                    <span
                      class="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                    >
                      <img
                        [ngSrc]="assets.fundWalletPayOnlineImage"
                        width="42"
                        height="42"
                        alt=""
                        class="h-[42px] w-[42px] object-contain"
                      />
                    </span>

                    <span class="block">
                      <span class="block text-[16px] font-medium leading-6 text-[#1A1B1D]">
                        Pay online
                      </span>
                      <span class="block text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                        Fund your wallet via Paystack
                      </span>
                    </span>
                  </span>

                  <img
                    [ngSrc]="assets.fundWalletArrowRightIcon"
                    width="20"
                    height="20"
                    alt=""
                    class="mr-4 h-5 w-5"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>

        <div class="flex h-full items-end md:hidden">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wallet-fund-title-mobile"
            class="w-full rounded-t-[36px] bg-[#FAFAFA] px-4 pb-[calc(env(safe-area-inset-bottom)+24px)] pt-[11px]"
            (click)="$event.stopPropagation()"
          >
            <div class="relative">
              <span class="mx-auto block h-1 w-[50px] rounded-full bg-[#EBEBEB]"></span>

              <button
                type="button"
                (click)="closeFundWallet()"
                aria-label="Close fund wallet bottom sheet"
                class="absolute right-0 top-[5px] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              >
                <img
                  [ngSrc]="assets.fundWalletCloseIcon"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                />
              </button>
            </div>

            <div class="mt-10">
              <h2
                id="wallet-fund-title-mobile"
                class="text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]"
              >
                Fund wallet
              </h2>

              <div class="mt-5 space-y-6">
                <section class="overflow-hidden rounded-[16px] bg-white p-3">
                  <p class="max-w-[306px] text-[14px] leading-5 text-[rgba(13,13,13,0.7)]">
                    Transfer to the account details below and your wallet will be funded instantly
                    <span aria-hidden="true"> ⚡️</span>
                  </p>

                  <div class="mt-[22px] flex items-end justify-between gap-4">
                    <div class="min-w-0 flex-1 space-y-[26px]">
                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                        >
                          <img
                            [ngSrc]="assets.fundWalletHashtagIcon"
                            width="24"
                            height="24"
                            alt=""
                            class="h-6 w-6"
                          />
                        </div>

                        <div class="min-w-0">
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                            Account number
                          </p>
                          <div class="mt-0.5 flex items-center gap-1.5">
                            <p
                              class="truncate text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[#1A1B1D]"
                            >
                              {{ fundWalletDetails().accountNumber || 'Loading...' }}
                            </p>
                            <button
                              type="button"
                              (click)="copyAccountNumber()"
                              [attr.aria-label]="
                                hasCopiedAccount() ? 'Account number copied' : 'Copy account number'
                              "
                              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                            >
                              <img
                                [ngSrc]="assets.fundWalletCopyIcon"
                                width="20"
                                height="20"
                                alt=""
                                class="h-5 w-5"
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                        >
                          <img
                            [ngSrc]="assets.fundWalletBankIcon"
                            width="24"
                            height="24"
                            alt=""
                            class="h-6 w-6"
                          />
                        </div>

                        <div>
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Bank name</p>
                          <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                            {{ fundWalletDetails().bankName || 'Loading...' }}
                          </p>
                        </div>
                      </div>

                      <div class="flex items-center gap-3">
                        <div
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                        >
                          <img
                            [ngSrc]="assets.fundWalletUserIcon"
                            width="24"
                            height="24"
                            alt=""
                            class="h-6 w-6"
                          />
                        </div>

                        <div>
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Name</p>
                          <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                            {{ fundWalletDetails().accountName || 'Loading...' }}
                          </p>
                        </div>
                      </div>
                    </div>

                    <img
                      [ngSrc]="assets.fundWalletIllustration"
                      width="146"
                      height="146"
                      alt=""
                      class="mb-[-12px] h-[146px] w-[146px] shrink-0 object-contain"
                    />
                  </div>
                </section>

                <div class="flex items-center justify-center gap-6">
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.8)]">OR</span>
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                </div>

                <div class="flex flex-col gap-2 text-left">
                  <label class="text-[14px] font-medium text-[rgba(26,27,29,0.7)]" for="fund-amount-mobile">
                    Amount to fund (₦)
                  </label>
                  <input
                    id="fund-amount-mobile"
                    type="number"
                    [value]="fundAmount()"
                    (input)="onFundAmountChange($event)"
                    min="100"
                    placeholder="Enter amount (e.g. 5000)"
                    class="h-[44px] w-full rounded-[12px] border border-[#efefef] bg-white px-3 text-[14px] text-[#1A1B1D] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]"
                  />
                </div>

                <button
                  type="button"
                  (click)="payOnline()"
                  class="flex h-[67px] w-full items-center justify-between rounded-[16px] bg-white px-[6px] py-[6px] text-left"
                >
                  <span class="flex items-center gap-3">
                    <span
                      class="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] bg-[#F6F6F6]"
                    >
                      <img
                        [ngSrc]="assets.fundWalletPayOnlineImage"
                        width="42"
                        height="42"
                        alt=""
                        class="h-[42px] w-[42px] object-contain"
                      />
                    </span>

                    <span class="block">
                      <span class="block text-[16px] font-medium leading-6 text-[#1A1B1D]">
                        Pay online
                      </span>
                      <span class="block text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">
                        Fund your wallet via Paystack
                      </span>
                    </span>
                  </span>

                  <img
                    [ngSrc]="assets.fundWalletArrowRightIcon"
                    width="16"
                    height="16"
                    alt=""
                    class="mr-2 h-4 w-4"
                  />
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletPageComponent {
  private readonly appToastService = inject(AppToastService);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);
  readonly statusFilterOptions: readonly CustomDropdownOption<'all' | WalletStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
  ];
  readonly assets = {
    successIcon: '/assets/icons/wallet-status-success.svg',
    failedIcon: '/assets/icons/wallet-status-failed.svg',
    arrowDownIcon: '/assets/icons/wallet-mobile-direction.svg',
    addIcon: '/assets/icons/wallet-add.svg',
    mobileDirectionIcon: '/assets/icons/wallet-mobile-direction.svg',
    mobileFundingIcon: '/assets/images/wallet-mobile-funding.png',
    mobileSubscriptionIcon: '/assets/images/wallet-mobile-subscription.png',
    fundWalletCloseIcon: '/assets/icons/wallet-fund-close.svg',
    fundWalletHashtagIcon: '/assets/icons/wallet-fund-hashtag.svg',
    fundWalletCopyIcon: '/assets/icons/wallet-fund-copy.svg',
    fundWalletBankIcon: '/assets/icons/wallet-fund-bank.svg',
    fundWalletUserIcon: '/assets/icons/wallet-fund-user.svg',
    fundWalletArrowRightIcon: '/assets/icons/wallet-fund-arrow-right.svg',
    fundWalletIllustration: '/assets/images/wallet-fund-illustration.png',
    fundWalletPayOnlineImage: '/assets/images/wallet-fund-pay-online.png',
  } as const;

  readonly fundWalletDetails = signal({
    accountNumber: '',
    bankName: '',
    accountName: '',
  });
  readonly fundAmount = signal<number>(5000);
  readonly walletBalance = signal('0.00');
  readonly transactions = signal<WalletTransaction[]>([]);

  readonly transactionType = signal<WalletTransactionType>('all');
  readonly dateFilter = signal<WalletDateFilter>('all');
  readonly statusFilter = signal<'all' | WalletStatus>('all');
  readonly isFundWalletOpen = signal(false);
  readonly hasCopiedAccount = signal(false);
  readonly isLoadingTransactions = signal(false);
  readonly isLoadingFundWalletDetails = signal(false);
  readonly isFundingOnline = signal(false);
  readonly showAllMobileTransactions = signal(false);
  readonly currentPage = signal(1);
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);

  readonly transactionTypeOptions = computed<
    readonly CustomDropdownOption<WalletTransactionType>[]
  >(() => [
    { value: 'all', label: 'All transaction types' },
    { value: 'wallet funding', label: 'Wallet funding' },
    { value: 'subscription payment', label: 'Subscription payment' },
    { value: 'ad promotion', label: 'Ad promotion' },
    { value: 'other', label: 'Other' },
  ]);

  readonly dateFilterOptions = computed<readonly CustomDropdownOption<WalletDateFilter>[]>(() => {
    const monthEntries = Array.from(
      new Map(
        this.transactions().map((transaction) => [
          transaction.dateKey,
          {
            value: transaction.dateKey,
            label: this.formatMonthLabel(transaction.dateKey),
          },
        ]),
      ).values(),
    );

    return [{ value: 'all', label: 'All dates' }, ...monthEntries];
  });

  readonly visibleTransactions = computed(() =>
    this.transactions().filter((transaction) => {
      const matchesType =
        this.transactionType() === 'all' || transaction.type === this.transactionType();
      const matchesDate = this.dateFilter() === 'all' || transaction.dateKey === this.dateFilter();
      const matchesStatus =
        this.statusFilter() === 'all' || transaction.status === this.statusFilter();
      return matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly mobileTransactions = computed<readonly MobileWalletTransaction[]>(() =>
    this.visibleTransactions()
      .slice(0, this.showAllMobileTransactions() ? undefined : 5)
      .map((transaction) => ({
        icon:
          transaction.type === 'subscription payment'
            ? this.assets.mobileSubscriptionIcon
            : this.assets.mobileFundingIcon,
        title: this.transactionTypeText(transaction.type),
        date: transaction.date,
        amount: transaction.amount,
        status: transaction.status,
      })),
  );

  readonly formattedWalletBalance = computed(() => this.formatCurrency(this.walletBalance()));
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalResults() / 5)));

  readonly transactionTypeLabel = computed(() => {
    switch (this.transactionType()) {
      case 'wallet funding':
        return 'Wallet funding';
      case 'subscription payment':
        return 'Subscription payment';
      case 'ad promotion':
        return 'Ad promotion';
      case 'other':
        return 'Other';
      default:
        return 'Transaction type';
    }
  });

  readonly dateFilterLabel = computed(() => {
    return this.dateFilter() === 'all' ? 'Date' : this.formatMonthLabel(this.dateFilter());
  });

  readonly statusFilterLabel = computed(() => {
    switch (this.statusFilter()) {
      case 'successful':
        return 'Successful';
      case 'failed':
        return 'Failed';
      default:
        return 'Status';
    }
  });

  constructor() {
    this.loadWalletTransactions();
  }

  toggleAllMobileTransactions(): void {
    this.showAllMobileTransactions.update((showAll) => !showAll);
  }

  previousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }
    this.currentPage.update((page) => Math.max(1, page - 1));
    this.loadWalletTransactions();
  }

  nextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }
    this.currentPage.update((page) => page + 1);
    this.loadWalletTransactions();
  }

  cycleTransactionType(): void {
    const order: WalletTransactionType[] = [
      'all',
      'wallet funding',
      'subscription payment',
      'ad promotion',
      'other',
    ];
    const currentIndex = order.indexOf(this.transactionType());
    this.transactionType.set(order[(currentIndex + 1) % order.length]);
  }

  cycleDateFilter(): void {
    const order: WalletDateFilter[] = this.dateFilterOptions().map((option) => option.value);
    const currentIndex = order.indexOf(this.dateFilter());
    this.dateFilter.set(order[(currentIndex + 1) % order.length]);
  }

  cycleStatusFilter(): void {
    const order: Array<'all' | WalletStatus> = ['all', 'successful', 'failed'];
    const currentIndex = order.indexOf(this.statusFilter());
    this.statusFilter.set(order[(currentIndex + 1) % order.length]);
  }

  openFundWallet(): void {
    this.hasCopiedAccount.set(false);
    this.isFundWalletOpen.set(true);
    this.loadVirtualAccountDetails();
  }

  closeFundWallet(): void {
    this.hasCopiedAccount.set(false);
    this.isFundWalletOpen.set(false);
  }

  copyAccountNumber(): void {
    const accountNumber = this.fundWalletDetails().accountNumber;
    if (!accountNumber) {
      return;
    }
    void globalThis.navigator?.clipboard?.writeText(accountNumber);
    this.hasCopiedAccount.set(true);
    this.appToastService.show({ message: 'Account number copied', durationMs: 2200 });
  }

  payOnline(): void {
    const amount = this.fundAmount();
    if (!amount || amount < 100) {
      this.appToastService.show({ message: 'Please enter a valid amount (minimum ₦100)' });
      return;
    }

    if (this.isFundingOnline()) {
      return;
    }

    this.isFundingOnline.set(true);
    this.sellerMonetizationService
      .fundWallet({ mode: 'paystack', amount, payment_type: 'wallet_funding' })
      .subscribe({
        next: (response) => {
          const accessCode = response.data?.access_code;
          const reference = response.data?.reference;
          const paymentUrl = response.data?.authorization_url;

          if (accessCode) {
            this.loadPaystackScript().then(() => {
              this.isFundingOnline.set(false);
              this.closeFundWallet();
              this.openPaystackPopup(accessCode);
            }).catch((err) => {
              console.error(err);
              if (paymentUrl) {
                globalThis.location?.assign(paymentUrl);
              } else {
                this.isFundingOnline.set(false);
                this.appToastService.show({
                  message: 'Online funding isn’t available right now. Please try again.',
                });
              }
            });
            return;
          }

          if (paymentUrl) {
            this.isFundingOnline.set(false);
            globalThis.location?.assign(paymentUrl);
            return;
          }

          this.isFundingOnline.set(false);
          this.appToastService.show({
            message: 'Online funding isn’t available right now. Please try again.',
          });
        },
        error: () => {
          this.isFundingOnline.set(false);
          this.appToastService.show({
            message: 'Online funding isn’t available right now. Please try again.',
          });
        },
      });
  }

  onFundAmountChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = Number(input.value);
    this.fundAmount.set(val);
  }

  private loadPaystackScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).PaystackPop) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Paystack Inline SDK'));
      document.body.appendChild(script);
    });
  }

  private openPaystackPopup(accessCode: string): void {
    const handler = (window as any).PaystackPop.setup({
      access_code: accessCode,
      callback: (response: any) => {
        console.log('Paystack callback response:', response);
        this.appToastService.show({
          message: 'Payment successful! Wallet balance will update shortly.',
          durationMs: 3500,
        });
        setTimeout(() => {
          this.currentPage.set(1);
          this.loadWalletTransactions();
        }, 2000);
      },
      onClose: () => {
        this.appToastService.show({ message: 'Payment cancelled' });
      },
    });
    handler.openIframe();
  }

  private loadWalletTransactions(): void {
    this.isLoadingTransactions.set(true);
    this.sellerMonetizationService.getWalletTransactions({ page: this.currentPage() }).subscribe({
      next: (response) => {
        this.isLoadingTransactions.set(false);
        this.walletBalance.set(response.wallet_balance || '0.00');
        const records = Array.isArray(response.results) ? response.results : [];
        this.transactions.set(records.map((record) => this.mapWalletTransaction(record)));
        this.totalResults.set(typeof response.count === 'number' ? response.count : records.length);
        this.hasNextPage.set(Boolean(response.next));
        this.hasPreviousPage.set(Boolean(response.previous));
      },
      error: () => {
        this.isLoadingTransactions.set(false);
        this.transactions.set([]);
        this.totalResults.set(0);
        this.hasNextPage.set(false);
        this.hasPreviousPage.set(false);
      },
    });
  }

  private loadVirtualAccountDetails(): void {
    if (this.fundWalletDetails().accountNumber || this.isLoadingFundWalletDetails()) {
      return;
    }

    this.isLoadingFundWalletDetails.set(true);
    this.sellerMonetizationService.fundWallet({ mode: 'virtual_account' }).subscribe({
      next: (response) => {
        this.isLoadingFundWalletDetails.set(false);
        this.fundWalletDetails.set({
          accountNumber: response.account_number ?? '',
          bankName: response.bank_name ?? '',
          accountName: response.account_name ?? '',
        });
      },
      error: () => {
        this.isLoadingFundWalletDetails.set(false);
        this.appToastService.show({
          message: 'Your wallet details aren’t available right now. Please try again shortly.',
        });
      },
    });
  }

  private mapWalletTransaction(record: WalletTransactionRecord): WalletTransaction {
    const type = this.mapWalletTransactionType(record.normalized_type);
    return {
      id: String(record.id),
      amount: this.formatCurrency(record.amount),
      type,
      date: this.formatTransactionDate(record.date),
      dateKey: this.toMonthKey(record.date),
      status: record.status === 'failed' ? 'failed' : 'successful',
    };
  }

  private mapWalletTransactionType(
    normalizedType: WalletTransactionRecord['normalized_type'],
  ): Exclude<WalletTransactionType, 'all'> {
    switch (normalizedType) {
      case 'subscription_payment':
        return 'subscription payment';
      case 'ad_promotion':
        return 'ad promotion';
      case 'other':
        return 'other';
      default:
        return 'wallet funding';
    }
  }

  private formatCurrency(amount: string): string {
    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount)) {
      return `₦${amount}`;
    }
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 2,
    }).format(numericAmount);
  }

  private formatTransactionDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }
    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  private toMonthKey(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'unknown';
    }
    return `${parsedDate.getFullYear()}-${String(parsedDate.getMonth() + 1).padStart(2, '0')}`;
  }

  private formatMonthLabel(monthKey: string): string {
    if (!monthKey || monthKey === 'unknown') {
      return 'Unknown';
    }

    const [year, month] = monthKey.split('-');
    const monthIndex = Number(month) - 1;
    const yearNumber = Number(year);
    if (
      !Number.isInteger(monthIndex) ||
      !Number.isInteger(yearNumber) ||
      monthIndex < 0 ||
      monthIndex > 11
    ) {
      return monthKey;
    }

    return new Intl.DateTimeFormat('en-NG', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(yearNumber, monthIndex, 1));
  }

  private transactionTypeText(type: Exclude<WalletTransactionType, 'all'>): string {
    switch (type) {
      case 'subscription payment':
        return 'Subscription payment';
      case 'ad promotion':
        return 'Ad promotion';
      case 'other':
        return 'Other transaction';
      default:
        return 'Wallet funding';
    }
  }

  statusBadgeClass(status: WalletStatus): string {
    if (status === 'successful') {
      return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#25AD32]';
    }

    return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#FDF6FA] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#FF2524]';
  }
}
