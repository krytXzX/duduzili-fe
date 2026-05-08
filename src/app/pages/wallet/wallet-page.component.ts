import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';

type WalletStatus = 'successful' | 'failed';
type WalletTransactionType = 'all' | 'wallet funding' | 'subscription payment';
type WalletDateFilter = 'all' | 'feb-2025' | 'mar-2025';

interface WalletTransaction {
  amount: string;
  type: Exclude<WalletTransactionType, 'all'>;
  date: string;
  dateKey: Exclude<WalletDateFilter, 'all'>;
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
            routerLink="/more"
            aria-label="Back to more"
            class="inline-flex items-center gap-2 text-black"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="none">
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
            <img [ngSrc]="assets.addIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]">
            Fund wallet
          </button>
        </div>

        <div class="mt-12">
          <h1 class="max-w-[350px] text-[32px] font-medium leading-[1.3] text-[#414141]">
            You currently have
            <span class="font-bold text-[#959595] line-through">N</span><span class="font-bold text-[#959595]">0.00</span>
            in your wallet
          </h1>
        </div>

        <section class="mt-8">
          <div class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-[16px] font-medium leading-5 text-[#4D4845]">Transaction history</h2>
              <p class="mt-1 text-[12px] leading-4 text-[#928F8B]">23 total</p>
            </div>

            <a
              href="#"
              class="text-[16px] font-medium leading-5 text-[#6453D9] underline underline-offset-2"
            >
              See all
            </a>
          </div>

          <div class="mt-6 space-y-6">
            @for (transaction of mobileTransactions; track transaction.title + transaction.date) {
              <article class="flex items-center gap-3">
                <div class="relative h-10 w-10 shrink-0 rounded-full border border-[#F4F4F2] bg-white">
                  <img
                    [ngSrc]="transaction.icon"
                    width="24"
                    height="24"
                    alt=""
                    class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                  >
                  <span
                    class="absolute left-[21px] top-[21px] inline-flex h-[22px] w-[22px] items-center justify-center overflow-hidden rounded-full bg-white shadow-[0_3px_9px_rgba(172,172,172,0.25)]"
                  >
                    <img
                      [ngSrc]="assets.mobileDirectionIcon"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    >
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
            <h1 class="max-w-[468px] pt-[21px] text-[40px] font-medium leading-[1.3] text-[#414141]">
              You currently have
              <span class="font-bold text-[#959595] line-through">N</span><span class="font-bold text-[#959595]">0.00</span>
              in your wallet
            </h1>

            <button
              type="button"
              (click)="openFundWallet()"
              class="inline-flex h-12 shrink-0 items-center gap-2 rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              <img [ngSrc]="assets.addIcon" width="18" height="18" alt="" class="h-[18px] w-[18px]">
              Fund wallet
            </button>
          </div>

          <section class="mt-9">
            <h2 class="text-[20px] font-medium leading-[1.2] text-[#0D0D0D]">Transaction history</h2>

            <div class="mt-4 rounded-[16px] border border-[#F0F0F0] bg-white">
              <div class="flex items-center justify-between px-[15px] py-[15px]">
                <div class="flex flex-wrap gap-2">
                  <app-custom-dropdown
                    [options]="transactionTypeOptions"
                    [value]="transactionType()"
                    ariaLabel="Select transaction type"
                    buttonClass="inline-flex h-8 items-center gap-2 rounded-[32px] border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.5)] shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                    iconClass="text-[rgba(26,27,29,0.5)]"
                    menuClass="min-w-[190px]"
                    (valueChange)="transactionType.set($event)"
                  ></app-custom-dropdown>

                  <app-custom-dropdown
                    [options]="dateFilterOptions"
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
                <div class="grid grid-cols-[1.1fr_1.35fr_1fr_0.9fr] gap-6 px-[35px] py-[11px] text-[12px] font-medium leading-[normal] text-[rgba(26,27,29,0.6)]">
                  <span>Amount</span>
                  <span>Transaction type</span>
                  <span>Date</span>
                  <span>Status</span>
                </div>
              </div>

              <div>
                @for (transaction of visibleTransactions(); track transaction.amount + transaction.type + transaction.date) {
                  <div
                    class="grid min-h-[60px] grid-cols-[1.1fr_1.35fr_1fr_0.9fr] gap-6 items-center border-t border-[#F0F0F0] px-[35px] py-4 text-[14px] leading-5 text-[#1A1B1D] first:border-t-0"
                  >
                    <span class="font-medium">{{ transaction.amount }}</span>
                    <span>{{ transaction.type === 'wallet funding' ? 'Wallet funding' : 'Subscription payment' }}</span>
                    <span>{{ transaction.date }}</span>
                    <span>
                      <span [class]="statusBadgeClass(transaction.status)">
                        <img
                          [ngSrc]="transaction.status === 'successful' ? assets.successIcon : assets.failedIcon"
                          width="14"
                          height="14"
                          alt=""
                          class="h-[14px] w-[14px]"
                        >
                        {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                      </span>
                    </span>
                  </div>
                }
              </div>
            </div>
          </section>
        </div>

        <div class="mt-auto flex items-center justify-between px-4 pb-4 pt-10 text-[16px] leading-[normal]">
          <p class="text-[#1A1B1D]">5 <span class="text-[rgba(26,27,29,0.5)]">results</span></p>

          <div class="flex items-center gap-2 text-[#1C1F1D] opacity-50">
            <div class="flex items-end gap-[5px]">
              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                aria-label="Previous page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="none">
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
                1
              </span>

              <button
                type="button"
                class="inline-flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]"
                aria-label="Next page"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="none">
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

            <span>of 12</span>
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
                <img [ngSrc]="assets.fundWalletCloseIcon" width="24" height="24" alt="" class="h-6 w-6">
              </button>
            </div>

            <div class="px-6 pb-6">
              <div class="space-y-6">
                <section class="overflow-hidden rounded-[16px] bg-white p-3">
                  <div class="flex items-start justify-between gap-4">
                    <div class="max-w-[292px]">
                      <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.7)]">
                        Transfer to the account details below and your wallet will be funded instantly
                        <span aria-hidden="true"> ⚡️</span>
                      </p>

                      <div class="mt-[22px] space-y-[26px]">
                        <div class="flex items-center gap-3">
                          <div class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                            <img [ngSrc]="assets.fundWalletHashtagIcon" width="24" height="24" alt="" class="h-6 w-6">
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Account number</p>
                            <div class="mt-0.5 flex items-center gap-1.5">
                              <p class="text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[#1A1B1D]">
                                {{ fundWallet.accountNumber }}
                              </p>
                              <button
                                type="button"
                                (click)="copyAccountNumber()"
                                [attr.aria-label]="hasCopiedAccount() ? 'Account number copied' : 'Copy account number'"
                                class="inline-flex h-7 w-7 items-center justify-center rounded-full"
                              >
                                <img [ngSrc]="assets.fundWalletCopyIcon" width="20" height="20" alt="" class="h-5 w-5">
                              </button>
                            </div>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <div class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                            <img [ngSrc]="assets.fundWalletBankIcon" width="24" height="24" alt="" class="h-6 w-6">
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Bank name</p>
                            <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                              {{ fundWallet.bankName }}
                            </p>
                          </div>
                        </div>

                        <div class="flex items-center gap-3">
                          <div class="flex h-12 w-12 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                            <img [ngSrc]="assets.fundWalletUserIcon" width="24" height="24" alt="" class="h-6 w-6">
                          </div>

                          <div>
                            <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Name</p>
                            <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                              {{ fundWallet.accountName }}
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
                    >
                  </div>
                </section>

                <div class="flex items-center justify-center gap-6">
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.8)]">OR</span>
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                </div>

                <button
                  type="button"
                  class="flex h-[67px] w-full items-center justify-between rounded-[16px] bg-white px-[6px] py-[6px] text-left"
                >
                  <span class="flex items-center gap-3">
                    <span class="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                      <img
                        [ngSrc]="assets.fundWalletPayOnlineImage"
                        width="42"
                        height="42"
                        alt=""
                        class="h-[42px] w-[42px] object-contain"
                      >
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
                  >
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
                <img [ngSrc]="assets.fundWalletCloseIcon" width="24" height="24" alt="" class="h-6 w-6">
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
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                          <img [ngSrc]="assets.fundWalletHashtagIcon" width="24" height="24" alt="" class="h-6 w-6">
                        </div>

                        <div class="min-w-0">
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Account number</p>
                          <div class="mt-0.5 flex items-center gap-1.5">
                            <p class="truncate text-[24px] font-medium leading-[1.2] tracking-[-0.03em] text-[#1A1B1D]">
                              {{ fundWallet.accountNumber }}
                            </p>
                            <button
                              type="button"
                              (click)="copyAccountNumber()"
                              [attr.aria-label]="hasCopiedAccount() ? 'Account number copied' : 'Copy account number'"
                              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                            >
                              <img [ngSrc]="assets.fundWalletCopyIcon" width="20" height="20" alt="" class="h-5 w-5">
                            </button>
                          </div>
                        </div>
                      </div>

                      <div class="flex items-center gap-3">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                          <img [ngSrc]="assets.fundWalletBankIcon" width="24" height="24" alt="" class="h-6 w-6">
                        </div>

                        <div>
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Bank name</p>
                          <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                            {{ fundWallet.bankName }}
                          </p>
                        </div>
                      </div>

                      <div class="flex items-center gap-3">
                        <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                          <img [ngSrc]="assets.fundWalletUserIcon" width="24" height="24" alt="" class="h-6 w-6">
                        </div>

                        <div>
                          <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.5)]">Name</p>
                          <p class="mt-0.5 text-[16px] font-medium leading-6 text-[#1A1B1D]">
                            {{ fundWallet.accountName }}
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
                    >
                  </div>
                </section>

                <div class="flex items-center justify-center gap-6">
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                  <span class="text-[14px] leading-5 text-[rgba(26,27,29,0.8)]">OR</span>
                  <span class="h-px w-[100px] bg-[#E1E1E1]"></span>
                </div>

                <button
                  type="button"
                  class="flex h-[67px] w-full items-center justify-between rounded-[16px] bg-white px-[6px] py-[6px] text-left"
                >
                  <span class="flex items-center gap-3">
                    <span class="flex h-[55px] w-[55px] items-center justify-center rounded-[10px] bg-[#F6F6F6]">
                      <img
                        [ngSrc]="assets.fundWalletPayOnlineImage"
                        width="42"
                        height="42"
                        alt=""
                        class="h-[42px] w-[42px] object-contain"
                      >
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
                  >
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
  readonly transactionTypeOptions: readonly CustomDropdownOption<WalletTransactionType>[] = [
    { value: 'all', label: 'All transaction types' },
    { value: 'wallet funding', label: 'Wallet funding' },
    { value: 'subscription payment', label: 'Subscription payment' },
  ];
  readonly dateFilterOptions: readonly CustomDropdownOption<WalletDateFilter>[] = [
    { value: 'all', label: 'All dates' },
    { value: 'feb-2025', label: 'Feb 2025' },
    { value: 'mar-2025', label: 'Mar 2025' },
  ];
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

  readonly fundWallet = {
    accountNumber: '3105500602',
    bankName: 'Wema Bank',
    accountName: 'Bryan Odjede',
  } as const;

  readonly transactions = signal<WalletTransaction[]>([
    {
      amount: '₦25,000.00',
      type: 'wallet funding',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      amount: '₦25,000.00',
      type: 'subscription payment',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
    {
      amount: '₦25,000.00',
      type: 'wallet funding',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'failed',
    },
    {
      amount: '₦25,000.00',
      type: 'subscription payment',
      date: '14 Feb, 2025',
      dateKey: 'feb-2025',
      status: 'successful',
    },
  ]);

  readonly mobileTransactions: readonly MobileWalletTransaction[] = [
    {
      icon: '/assets/images/wallet-mobile-funding.png',
      title: 'Wallet funding',
      date: 'Today',
      amount: '₦16,500',
      status: 'successful',
    },
    {
      icon: '/assets/images/wallet-mobile-subscription.png',
      title: 'Subscription payment',
      date: 'Yesterday',
      amount: '₦2,000',
      status: 'failed',
    },
    {
      icon: '/assets/images/wallet-mobile-funding.png',
      title: 'Wallet funding',
      date: 'June 7, 2:30PM',
      amount: '₦5,000',
      status: 'successful',
    },
  ];

  readonly transactionType = signal<WalletTransactionType>('all');
  readonly dateFilter = signal<WalletDateFilter>('all');
  readonly statusFilter = signal<'all' | WalletStatus>('all');
  readonly isFundWalletOpen = signal(false);
  readonly hasCopiedAccount = signal(false);

  readonly visibleTransactions = computed(() =>
    this.transactions().filter(transaction => {
      const matchesType = this.transactionType() === 'all' || transaction.type === this.transactionType();
      const matchesDate = this.dateFilter() === 'all' || transaction.dateKey === this.dateFilter();
      const matchesStatus = this.statusFilter() === 'all' || transaction.status === this.statusFilter();
      return matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly transactionTypeLabel = computed(() => {
    switch (this.transactionType()) {
      case 'wallet funding':
        return 'Wallet funding';
      case 'subscription payment':
        return 'Subscription payment';
      default:
        return 'Transaction type';
    }
  });

  readonly dateFilterLabel = computed(() => {
    switch (this.dateFilter()) {
      case 'feb-2025':
        return 'Feb 2025';
      case 'mar-2025':
        return 'Mar 2025';
      default:
        return 'Date';
    }
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

  cycleTransactionType(): void {
    const order: WalletTransactionType[] = ['all', 'wallet funding', 'subscription payment'];
    const currentIndex = order.indexOf(this.transactionType());
    this.transactionType.set(order[(currentIndex + 1) % order.length]);
  }

  cycleDateFilter(): void {
    const order: WalletDateFilter[] = ['all', 'feb-2025', 'mar-2025'];
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
  }

  closeFundWallet(): void {
    this.hasCopiedAccount.set(false);
    this.isFundWalletOpen.set(false);
  }

  copyAccountNumber(): void {
    void globalThis.navigator?.clipboard?.writeText(this.fundWallet.accountNumber);
    this.hasCopiedAccount.set(true);
  }

  statusBadgeClass(status: WalletStatus): string {
    if (status === 'successful') {
      return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#F3FBF9] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#25AD32]';
    }

    return 'inline-flex h-6 items-center gap-1 rounded-[8px] bg-[#FDF6FA] px-2 py-[6px] text-[12px] font-semibold leading-4 text-[#FF2524]';
  }
}
