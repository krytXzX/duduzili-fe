import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

type AdminListingDetailTab = 'overview' | 'reports' | 'requests' | 'activities';
type AdminListingDetailStatus = 'Available' | 'Sold' | 'Paused' | 'Suspended';

interface ListingGalleryItem {
  id: string;
  src: string;
  alt: string;
}

interface ListingMetric {
  id: string;
  label: string;
  value: string;
  iconSrc?: string;
}

interface ListingDetailRow {
  label: string;
  value: string;
}

interface ListingRequest {
  id: string;
  buyer: string;
  avatarSrc: string;
  requestType: string;
  dateRequested: string;
  time: string;
  actionIconSrc: string;
  actionLabel: string;
}

interface ListingReport {
  id: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatarSrc: string;
  description: string;
  dateReported: string;
}

interface ListingActivity {
  id: string;
  iconSrc: string;
  title: string;
  description?: string;
  actorName: string;
  actorAvatarSrc: string;
  time: string;
}

interface ListingActivityGroup {
  id: string;
  label: string;
  activities: ListingActivity[];
}

interface ListingTabItem {
  id: AdminListingDetailTab;
  label: string;
  iconSrc: string;
  activeIconSrc?: string;
}

interface MobileListingAction {
  id: 'share' | 'suspend' | 'lift';
  label: string;
  iconSrc?: string;
  danger?: boolean;
}

interface ListingStore {
  name: string;
  logo: string;
  verified: boolean;
}

interface AdminListingDetailRecord {
  id: string;
  name: string;
  previewImage: string;
  lastUpdated: string;
  isPromoted: boolean;
  status: AdminListingDetailStatus;
  suspensionReason?: string;
  location: string;
  datePosted: string;
  messages: number;
  views: string;
  saves: number;
  price: string;
  description: string;
  gallery: ListingGalleryItem[];
  mobileGallery: ListingGalleryItem[];
  store: ListingStore;
}

@Component({
  selector: 'app-admin-listing-details-page',
  imports: [RouterLink, NgOptimizedImage],
  template: `
    <section class="flex h-full flex-col bg-white lg:hidden">
      <div class="flex items-center justify-between px-5 pb-4 pt-4">
        <div class="flex items-center gap-3">
          <a
            routerLink="/admin/listings"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F3]"
            aria-label="Back to listings"
          >
            <img
              ngSrc="/assets/icons/listing-details-back.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
              aria-hidden="true"
            />
          </a>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-[#000000]">Listing details</h1>
        </div>

        <button
          type="button"
          (click)="mobileActionsOpen.set(true)"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F3F3]"
          aria-label="Open listing actions"
          [attr.aria-expanded]="mobileActionsOpen()"
        >
          <span class="flex items-center gap-[3px]" aria-hidden="true">
            <span class="h-[3px] w-[3px] rounded-full bg-[#1A1B1D]"></span>
            <span class="h-[3px] w-[3px] rounded-full bg-[#1A1B1D]"></span>
            <span class="h-[3px] w-[3px] rounded-full bg-[#1A1B1D]"></span>
          </span>
        </button>
      </div>

      @if (mobileActionsOpen()) {
        <button
          type="button"
          (click)="closeMobileActions()"
          class="fixed inset-0 z-[60] bg-black/20"
          aria-label="Close listing actions"
        ></button>

        <section
          class="fixed inset-x-3 bottom-0 z-[70] rounded-[36px] bg-white px-4 pb-10 pt-[11px] shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Listing actions"
        >
          <div class="relative h-10">
            <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
            <button
              type="button"
              (click)="closeMobileActions()"
              class="absolute right-0 top-[5px] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              aria-label="Close listing actions"
            >
              <img
                ngSrc="/assets/icons/admin-listing-details/mobile-actions/close.svg"
                width="24"
                height="24"
                alt=""
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="mt-4 space-y-1">
            @for (action of mobileActions(); track action.id) {
              <button
                type="button"
                (click)="handleMobileAction(action.id)"
                class="flex h-8 w-full items-center gap-[10px] rounded-[8px] px-2 py-[10px] text-left text-[16px] font-medium leading-5"
                [class.text-[#0D0D0D]/87]="!action.danger"
                [class.text-[#FF2524]]="action.danger"
              >
                @if (action.iconSrc) {
                  <img
                    [ngSrc]="action.iconSrc"
                    width="20"
                    height="20"
                    alt=""
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                <span>{{ action.label }}</span>
              </button>
            }
          </div>
        </section>
      }

      <div class="flex-1 overflow-y-auto px-5 pb-0">
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-3">
            <div class="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[10.8px] bg-[#EFEFEF]">
              <img
                [ngSrc]="listing().previewImage"
                [alt]="listing().name"
                width="54"
                height="54"
                class="h-[54px] w-[54px] object-cover"
              />
            </div>

            <div class="min-w-0 flex-1">
              <h2 class="truncate text-[18px] font-semibold leading-[1.3] text-[#1A1B1D]">
                {{ listing().name }}
              </h2>
              <p class="mt-1 text-[13px] leading-[1.2] text-[#777777]">
                Last updated on: {{ listing().lastUpdated }}
              </p>
            </div>
          </div>

          <span
            class="inline-flex h-6 w-fit items-center gap-1 rounded-[8px] px-2 text-[12px] font-semibold leading-4"
            [class.bg-[#F9F9F9]]="effectiveStatus() === 'Available'"
            [class.text-[#EE9C2E]]="effectiveStatus() === 'Available'"
            [class.bg-[#FDF6FA]]="effectiveStatus() === 'Suspended'"
            [class.text-[#FF2524]]="effectiveStatus() === 'Suspended'"
            [class.bg-[#F3FBF9]]="effectiveStatus() === 'Sold'"
            [class.text-[#25AD32]]="effectiveStatus() === 'Sold'"
            [class.bg-[#EEF4FF]]="effectiveStatus() === 'Paused'"
            [class.text-[#4787FE]]="effectiveStatus() === 'Paused'"
          >
            <img
              [ngSrc]="statusIcon(effectiveStatus())"
              width="14"
              height="14"
              alt=""
              class="h-[14px] w-[14px]"
              aria-hidden="true"
            />
            {{ effectiveStatus() }}
          </span>

          @if (effectiveStatus() === 'Suspended' && effectiveSuspensionReason()) {
            <div class="rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[14px] font-medium leading-5 text-[#1F1F1F]">
              Reason: “{{ effectiveSuspensionReason() }}”
            </div>
          }
        </div>

        <nav class="mt-6 overflow-x-auto border-b border-[#EAEAEA] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div class="flex min-w-max items-end gap-6">
            @for (tab of mobileTabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                class="flex flex-col items-start gap-[6px]"
              >
                <span class="flex items-center gap-1 rounded-[8px] px-3 py-1 text-[16px] font-medium leading-6"
                  [class.text-[#6453D9]]="activeTab() === tab.id"
                  [class.text-[#959595]]="activeTab() !== tab.id"
                >
                  <img
                    [ngSrc]="activeTab() === tab.id && tab.activeIconSrc ? tab.activeIconSrc : tab.iconSrc"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                  {{ tab.label }}
                </span>
                <span class="h-[2px] w-full rounded-[25px]"
                  [class.bg-[#6453D9]]="activeTab() === tab.id"
                  [class.bg-transparent]="activeTab() !== tab.id"
                ></span>
              </button>
            }
          </div>
        </nav>

        @if (activeTab() === 'overview') {
          <div class="pt-[18px]">
            <div class="flex gap-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              @for (image of listing().mobileGallery; track image.id) {
                <div class="h-[157px] w-[102px] shrink-0 overflow-hidden bg-[#EFEFEF] first:rounded-l-[16.79px] last:rounded-r-[16.79px]">
                  <img
                    [ngSrc]="image.src"
                    [alt]="image.alt"
                    width="102"
                    height="157"
                    class="h-[157px] w-[102px] object-cover"
                  />
                </div>
              }
            </div>

            <div class="mt-[18px]">
              <h3 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D]">{{ listing().name }}</h3>
              <p class="mt-[6px] text-[14px] text-[#1A1B1D]/50">{{ listing().location }}</p>
            </div>

            <div class="mt-4 grid grid-cols-4 rounded-[12px] border border-[#F0F0F0] bg-white px-3 py-2">
              @for (metric of mobileMetrics; track metric.id; let isLast = $last) {
                <div class="flex flex-col gap-2" [class.border-r]="!isLast" [class.border-[#EAEAEA]]="!isLast" [class.pr-2]="!isLast" [class.pl-2]="$index > 0">
                  <p class="text-[11px] leading-[1.1] tracking-[-0.165px] text-[#1A1B1D]/50">{{ metric.label }}</p>
                  <div class="flex items-center gap-1">
                    @if (metric.iconSrc) {
                      <img [ngSrc]="metric.iconSrc" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
                    }
                    <span class="text-[14px] font-medium leading-normal text-[#1A1B1D]">{{ metric.value }}</span>
                  </div>
                </div>
              }
            </div>

            <article class="mt-4 rounded-[24px] border border-[#F3F3F3] bg-[#FBFBFB] p-4">
              <div>
                <p class="text-[12px] leading-4 text-[#0C0C0C]/50">Price</p>
                <p class="mt-2 text-[18px] font-medium leading-6 text-[#1F1F1F]">₦{{ listing().price }}</p>
              </div>

              <div class="mt-[21px] border-t border-[#EAEAEA] pt-[21px]">
                <p class="text-[14px] leading-4 text-[#0C0C0C]/50">Store</p>
                <div class="mt-2 flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-2">
                    <div class="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#3D785F]">
                      <img
                        [ngSrc]="listing().store.logo"
                        [alt]="listing().store.name"
                        width="32"
                        height="32"
                        class="h-8 w-8 object-cover"
                      />
                    </div>
                    <div class="flex min-w-0 items-center gap-1">
                      <span class="truncate text-[16px] font-medium leading-6 text-[#1F1F1F]">{{ listing().store.name }}</span>
                      @if (listing().store.verified) {
                        <img
                          ngSrc="/assets/icons/listing-details-verify.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="h-[14px] w-[14px] shrink-0"
                          aria-hidden="true"
                        />
                      }
                    </div>
                  </div>

                  <img
                    ngSrc="/assets/icons/listing-details-export.svg"
                    width="20"
                    height="20"
                    alt=""
                    class="h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </article>

            <section class="mt-8 border-b border-[#E0E0E0] pb-5">
              <h4 class="text-[18px] font-semibold leading-[1.2] text-[#1A1B1D]">Description</h4>
              <p class="mt-3 text-[14px] leading-[1.4] text-[#1A1B1D]/50">
                {{ listing().description }}
              </p>
              <button type="button" class="mt-2 text-[14px] font-medium leading-[1.5] text-[#1A1B1D] underline underline-offset-2">
                Show more
              </button>
            </section>

            <section class="mt-8 pb-3">
              <h4 class="text-[18px] font-semibold leading-[1.2] text-[#1A1B1D]">General details</h4>
              <div class="mt-3 space-y-1 text-[16px] leading-normal">
                @for (detail of details; track detail.label) {
                  <div class="flex items-center justify-between gap-4 py-[6px]">
                    <dt class="shrink-0 text-[#1A1B1D]/50">{{ detail.label }}</dt>
                    <dd class="max-w-[209px] text-right font-medium text-[#1A1B1D]">{{ detail.value }}</dd>
                  </div>
                }
              </div>
            </section>
          </div>
        } @else if (activeTab() === 'requests') {
          <div class="pt-6">
            <div class="flex items-center gap-3">
              <label class="relative min-w-0 flex-1">
                <img
                  ngSrc="/assets/icons/listing-details-search.svg"
                  width="16"
                  height="16"
                  alt=""
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value=""
                  placeholder="Search"
                  class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                >
              </label>
              <button type="button" class="inline-flex h-6 w-6 items-center justify-center" aria-label="Filter requests">
                <img
                  ngSrc="/assets/icons/admin-listing-details/reports/mobile-filter.svg"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="mt-6 space-y-0">
            @for (request of requests; track request.id) {
              <article class="border-b border-[#EBEBEB] py-3 last:border-b-0">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                      <img
                        [ngSrc]="request.avatarSrc"
                        [alt]="request.buyer"
                        width="36"
                        height="36"
                        class="h-9 w-9 object-cover"
                      />
                    </div>
                    <div class="min-w-0">
                      <h4 class="truncate text-[16px] font-medium leading-6 text-[#0D0D0D]/80">{{ request.buyer }}</h4>
                    </div>
                  </div>
                  <button type="button" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white" [attr.aria-label]="request.actionLabel">
                    <img
                      [ngSrc]="request.actionIconSrc"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <div class="mt-4 space-y-3 text-[14px] leading-5">
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-[#1A1B1D]/50">Request type</span>
                    <span class="text-right font-medium text-[#1A1B1D]">{{ request.requestType }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-4">
                    <span class="text-[#1A1B1D]/50">Date requested</span>
                    <span class="text-right font-medium text-[#1A1B1D]">{{ request.dateRequested }}</span>
                  </div>
                </div>
              </article>
            }
            </div>
          </div>
        } @else if (activeTab() === 'reports') {
          <div class="overflow-hidden px-5 pb-8 pt-7">
            <div class="overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
              <div class="flex items-center justify-end px-[15px] py-[15px]">
                <label class="relative block w-full max-w-[224px]">
                  <img
                    ngSrc="/assets/icons/listing-details-search.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value=""
                    placeholder="Search"
                    class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777]"
                  >
                </label>
              </div>

              <table class="w-full border-collapse">
                <thead>
                  <tr class="h-10 border border-[#F4F4F4] bg-[#FAFAFA] text-left text-[12px] font-medium text-[#1A1B1D]/60">
                    <th class="px-[15px] py-[11px]">User</th>
                    <th class="px-[15px] py-[11px]">Description</th>
                    <th class="px-[15px] py-[11px]">Date reported</th>
                  </tr>
                </thead>
                <tbody>
                  @for (report of reports; track report.id) {
                    <tr class="h-[90px] border-b border-[#F0F0F0] align-middle last:border-b-0">
                      <td class="px-4 py-[25px]">
                        <div class="flex items-center gap-2">
                          <div class="relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
                            <img
                              [ngSrc]="report.reporterAvatarSrc"
                              [alt]="report.reporterName"
                              width="36"
                              height="36"
                              class="h-9 w-9 object-cover"
                            />
                          </div>
                          <div class="w-[124px] min-w-0">
                            <p class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]">{{ report.reporterName }}</p>
                            <p class="truncate text-[12px] leading-4 text-[#8C8C8C]">{{ report.reporterEmail }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-[25px]">
                        <p class="w-[541px] max-w-[541px] text-[14px] leading-5 text-[#0D0D0D]/80">{{ report.description }}</p>
                      </td>
                      <td class="px-4 py-[25px] text-[14px] leading-normal text-[#1A1B1D]">{{ report.dateReported }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mt-6 flex items-center justify-between">
              <p class="text-[16px] font-medium text-[#1A1B1D]">5 <span class="text-[#1A1B1D]/50">results</span></p>
              <div class="flex items-center gap-2 opacity-50">
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                  <span class="text-[#1A1B1D]">‹</span>
                </div>
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] text-[14px] font-medium text-[#1A1B1D]">1</div>
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                  <span class="text-[#1A1B1D]">›</span>
                </div>
                <span class="text-[16px] text-[#1C1F1D]">of 20</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="space-y-[15px] pt-6">
            <p class="text-[16px] font-medium leading-[1.2] tracking-[-0.32px] text-[#0D0D0D]/40">2025</p>
            @for (group of activityGroups; track group.id) {
              <section class="space-y-8">
                <div class="flex items-center gap-2">
                  <span class="rounded-full bg-[#FAFAFA] px-3 py-[6px] text-[14px] font-medium leading-5 text-[#1A1B1D]/50">{{ group.label }}</span>
                  <span class="h-px flex-1 bg-[#EDEDED]"></span>
                  <img
                    ngSrc="/assets/icons/admin-listing-details/activities/chevron-down.svg"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </div>

                <div class="space-y-0">
                  @for (activity of group.activities; track activity.id; let isLast = $last) {
                    <div class="flex gap-2">
                      <div class="flex w-9 flex-col items-center">
                        <span class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EBEBEB] bg-white">
                          <img [ngSrc]="activity.iconSrc" width="16" height="16" alt="" class="h-4 w-4 opacity-50" aria-hidden="true" />
                        </span>
                        @if (!isLast) {
                          <span class="mt-1 w-px flex-1 bg-[#EDEDED]"></span>
                        }
                      </div>

                      <div class="min-w-0 flex-1 pb-8">
                        <h4 class="text-[14px] leading-[1.2] tracking-[-0.28px] text-[#0C0C0C]">{{ activity.title }}</h4>
                        @if (activity.description) {
                          <div class="mt-6 flex items-center justify-between gap-2">
                            <span class="h-[35px] w-px bg-[#EDEDED]"></span>
                            <span class="inline-flex rounded-[32px] bg-[#FAFAFA] px-3 py-1 text-[12px] font-medium leading-5 text-[#1A1B1D]/70">
                            {{ activity.description }}
                            </span>
                          </div>
                        }

                        <div class="mt-[10px] flex flex-wrap items-center gap-[5px] text-[12px] text-[#0D0D0D]/40">
                          <span>by</span>
                          <div class="relative h-5 w-5 overflow-hidden rounded-full border-2 border-white">
                            <img [ngSrc]="activity.actorAvatarSrc" [alt]="activity.actorName" width="20" height="20" class="h-5 w-5 object-cover" />
                          </div>
                          <span class="text-[#1A1B1D]">{{ activity.actorName }}</span>
                          <span>{{ activity.time }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        }

      </div>
    </section>

    <section class="hidden h-full flex-col overflow-hidden rounded-[24px] border border-[#F4F4F4] bg-white lg:flex">
      <div class="flex-1 overflow-y-auto">
        <div class="border-b border-[#EAEAEA] px-5 py-[14px] text-[14px] leading-5">
          <a routerLink="/admin/listings" class="text-[#959595]">Listings</a>
          <span class="px-2 text-[#959595]">/</span>
          <span class="text-[#1F1F1F]">Listing details</span>
        </div>

        <div class="relative border-b border-[#EAEAEA] px-5 pb-0 pt-7">
          <div class="flex items-start justify-between gap-6">
            <div>
              <div class="flex items-center gap-3">
                <div class="relative h-[60px] w-[60px] overflow-hidden rounded-[12px] bg-[#EFEFEF]">
                  <img
                    [ngSrc]="listing().previewImage"
                    [alt]="listing().name"
                    width="60"
                    height="60"
                    class="h-[60px] w-[60px] object-cover"
                  />
                </div>
                <div>
                  <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">{{ listing().name }}</h1>
                  <p class="mt-[6px] text-[14px] leading-5 text-[#777777]">Last updated on: {{ listing().lastUpdated }}</p>
                </div>
              </div>

              <span
                class="mt-3 inline-flex h-6 items-center gap-1 rounded-[8px] px-2 text-[12px] font-semibold leading-4"
                [class.bg-[#F9F9F9]]="effectiveStatus() === 'Available'"
                [class.text-[#EE9C2E]]="effectiveStatus() === 'Available'"
                [class.bg-[#FDF6FA]]="effectiveStatus() === 'Suspended'"
                [class.text-[#FF2524]]="effectiveStatus() === 'Suspended'"
                [class.bg-[#F3FBF9]]="effectiveStatus() === 'Sold'"
                [class.text-[#25AD32]]="effectiveStatus() === 'Sold'"
                [class.bg-[#EEF4FF]]="effectiveStatus() === 'Paused'"
                [class.text-[#4787FE]]="effectiveStatus() === 'Paused'"
              >
                <img
                  [ngSrc]="desktopStatusIcon(effectiveStatus())"
                  width="14"
                  height="14"
                  alt=""
                  class="h-[14px] w-[14px]"
                  aria-hidden="true"
                />
                {{ effectiveStatus() }}
              </span>

              @if (effectiveStatus() === 'Suspended' && effectiveSuspensionReason()) {
                <div class="mt-3 w-full rounded-[16px] bg-[rgba(255,254,218,0.76)] px-[10px] py-[11px] text-[14px] font-medium leading-5 text-[#1F1F1F]">
                  Reason: “{{ effectiveSuspensionReason() }}”
                </div>
              }
            </div>

            <div class="flex items-center gap-3 pt-[4px]">
              @if (effectiveStatus() === 'Suspended') {
                <button
                  type="button"
                  (click)="isLiftSuspensionOpen.set(true)"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  Lift suspension
                </button>
              } @else {
                <button
                  type="button"
                  (click)="isSuspendModalOpen.set(true)"
                  class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#000000]"
                >
                  <img
                    ngSrc="/assets/icons/listing-details-action-pause.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-[14px] w-[14px]"
                    aria-hidden="true"
                  />
                  Suspend listing
                </button>

                <button
                  type="button"
                  class="inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#000000]"
                >
                  <img
                    ngSrc="/assets/icons/listing-details-action-share.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-[14px] w-[14px]"
                    aria-hidden="true"
                  />
                  Share listing
                </button>
              }
            </div>
          </div>

          <button
            type="button"
            class="absolute left-[328px] top-[72px] inline-flex h-8 items-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#2D2D2D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            🚀 Promoted
          </button>

          <nav class="mt-7 flex items-end gap-0 border-b border-[#EAEAEA]">
            @for (tab of desktopTabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                class="flex flex-col items-start gap-[6px]"
              >
                <span class="flex items-center gap-1 rounded-[8px] px-3 py-1 text-[16px] font-medium leading-6"
                  [class.text-[#6453D9]]="activeTab() === tab.id"
                  [class.text-[#959595]]="activeTab() !== tab.id"
                >
                  <img
                    [ngSrc]="activeTab() === tab.id && tab.activeIconSrc ? tab.activeIconSrc : tab.iconSrc"
                    width="16"
                    height="16"
                    alt=""
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                  {{ tab.label }}
                </span>
                <span class="h-[2px] w-full rounded-[25px]"
                  [class.bg-[#6453D9]]="activeTab() === tab.id"
                  [class.bg-transparent]="activeTab() !== tab.id"
                ></span>
              </button>
            }
          </nav>
        </div>

        @if (activeTab() === 'overview') {
          <div class="px-[43px] pb-10 pt-7">
            <div class="grid grid-cols-6 gap-3">
              @for (image of listing().gallery; track image.id; let isFirst = $first; let isLast = $last) {
                <div
                  class="h-[187px] overflow-hidden bg-[#EFEFEF]"
                  [class.rounded-l-[20px]]="isFirst"
                  [class.rounded-r-[20px]]="isLast"
                >
                  <img
                    [ngSrc]="image.src"
                    [alt]="image.alt"
                    width="167"
                    height="187"
                    class="h-[187px] w-full object-cover"
                  />
                </div>
              }
            </div>

            <div class="mt-10 grid grid-cols-[minmax(0,626px)_325px] justify-between gap-[111px]">
              <div>
                <div>
                  <h2 class="text-[32px] font-semibold leading-10 text-[#1A1B1D]">{{ listing().name }}</h2>
                  <p class="mt-[6px] text-[20px] leading-6 text-[#1A1B1D]/70">{{ listing().location }}</p>
                </div>

                <div class="mt-6 grid grid-cols-4 rounded-[16px] border border-[#F0F0F0] bg-white px-6 py-3">
                  @for (metric of desktopMetrics; track metric.id; let isLast = $last) {
                    <div class="flex flex-col gap-[6px]" [class.border-r]="!isLast" [class.border-[#EAEAEA]]="!isLast" [class.pr-6]="!isLast" [class.pl-6]="$index > 0">
                      <p class="text-[14px] leading-5 text-[#1A1B1D]/50">{{ metric.label }}</p>
                      <div class="flex items-center gap-1">
                        @if (metric.iconSrc) {
                          <img [ngSrc]="metric.iconSrc" width="20" height="20" alt="" class="h-5 w-5" aria-hidden="true" />
                        }
                        <span class="text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ metric.value }}</span>
                      </div>
                    </div>
                  }
                </div>

                <section class="mt-[50px] border-b border-[#E0E0E0] pb-6">
                  <h3 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Description</h3>
                  <p class="mt-3 text-[16px] leading-6 text-[#1A1B1D]/80">{{ listing().description }}</p>
                  <button type="button" class="mt-2 text-[16px] font-medium leading-5 text-[#2D2D2D] underline underline-offset-2">
                    Show more
                  </button>
                </section>

                <section class="mt-8">
                  <h3 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">General details</h3>
                  <dl class="mt-3 space-y-2 text-[16px] leading-6">
                    @for (detail of details; track detail.label) {
                      <div class="flex items-center justify-between py-[6px]">
                        <dt class="text-[#1A1B1D]/50">{{ detail.label }}</dt>
                        <dd class="w-[325px] font-medium text-[#1A1B1D]">{{ detail.value }}</dd>
                      </div>
                    }
                  </dl>
                </section>
              </div>

              <aside class="rounded-[24px] border border-[#F3F3F3] bg-[#FBFBFB] p-5">
                <div>
                  <p class="text-[14px] leading-4 text-[#0C0C0C]/50">Price</p>
                  <p class="mt-2 text-[20px] font-medium leading-6 text-[#1F1F1F]">₦{{ listing().price }}</p>
                </div>

                <div class="mt-[21px] border-t border-[#EAEAEA] pt-[21px]">
                  <p class="text-[14px] leading-4 text-[#0C0C0C]/50">Store</p>
                  <div class="mt-2 flex items-center justify-between gap-4">
                    <div class="flex min-w-0 items-center gap-2">
                      <div class="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#3D785F]">
                        <img
                          [ngSrc]="listing().store.logo"
                          [alt]="listing().store.name"
                          width="32"
                          height="32"
                          class="h-8 w-8 object-cover"
                        />
                      </div>
                      <div class="flex min-w-0 items-center gap-1">
                        <span class="truncate text-[16px] font-medium leading-6 text-[#1F1F1F]">{{ listing().store.name }}</span>
                        @if (listing().store.verified) {
                          <img
                            ngSrc="/assets/icons/listing-details-verify.svg"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px] shrink-0"
                            aria-hidden="true"
                          />
                        }
                      </div>
                    </div>

                    <img
                      ngSrc="/assets/icons/listing-details-export.svg"
                      width="20"
                      height="20"
                      alt=""
                      class="h-5 w-5 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        } @else if (activeTab() === 'reports') {
          <div class="overflow-hidden px-5 pb-8 pt-7">
            <div class="overflow-hidden rounded-[16px] border border-[#ECEEF3] bg-white">
              <table class="w-full border-collapse">
                <thead>
                  <tr class="bg-[#FAFAFB] text-left text-[12px] font-medium text-[#9AA0AA]">
                    <th class="px-6 py-4">User</th>
                    <th class="px-6 py-4">Description</th>
                    <th class="px-6 py-4">Date reported</th>
                  </tr>
                </thead>
                <tbody>
                  @for (report of reports; track report.id) {
                    <tr class="border-t border-[#F1F2F4] align-top">
                      <td class="px-6 py-6">
                        <div class="flex items-center gap-3">
                          <div class="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                            <img
                              [ngSrc]="report.reporterAvatarSrc"
                              [alt]="report.reporterName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            />
                          </div>
                          <div>
                            <p class="text-[15px] font-medium text-[#1A1C21]">{{ report.reporterName }}</p>
                            <p class="text-[13px] text-[#A3A8B3]">{{ report.reporterEmail }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-6 py-6 text-[15px] leading-8 text-[#4F5562]">{{ report.description }}</td>
                      <td class="px-6 py-6 text-[15px] font-medium text-[#353944]">{{ report.dateReported }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        } @else {
          <div class="px-[172px] pb-8 pt-[27px]">
            <div class="space-y-[15px] max-w-[764px]">
              <p class="text-[16px] font-medium leading-[1.2] tracking-[-0.32px] text-[#0D0D0D]/40">2025</p>
              @for (group of activityGroups; track group.id) {
                <section class="space-y-8">
                  <div class="flex items-center gap-2">
                    <span class="rounded-full bg-[#FAFAFA] px-3 py-[6px] text-[14px] font-medium leading-5 text-[#1A1B1D]/50">{{ group.label }}</span>
                    <span class="h-px flex-1 bg-[#EDEDED]"></span>
                    <img
                      ngSrc="/assets/icons/admin-listing-details/activities/chevron-down.svg"
                      width="16"
                      height="16"
                      alt=""
                      class="h-4 w-4"
                      aria-hidden="true"
                    />
                  </div>
                  <div>
                    @for (activity of group.activities; track activity.id; let isLast = $last) {
                      <div class="flex gap-[14px]">
                        <div class="flex w-11 flex-col items-center">
                          <span class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EBEBEB] bg-white">
                            <img [ngSrc]="activity.iconSrc" width="20" height="20" alt="" class="h-5 w-5 opacity-50" aria-hidden="true" />
                          </span>
                          @if (!isLast) {
                            <span class="mt-2 w-px flex-1 bg-[#EDEDED]"></span>
                          }
                        </div>

                        <div class="min-w-0 flex-1 pb-8">
                          <h3 class="text-[14px] leading-[1.2] tracking-[-0.28px] text-[#0C0C0C]">{{ activity.title }}</h3>
                          @if (activity.description) {
                            <div class="mt-6 flex items-center justify-between gap-3 max-w-[467px]">
                              <span class="h-[35px] w-px bg-[#EDEDED]"></span>
                              <span class="inline-flex rounded-[32px] bg-[#FAFAFA] px-3 py-1 text-[12px] font-medium leading-5 text-[#1A1B1D]/70">{{ activity.description }}</span>
                            </div>
                          }

                          <div class="mt-[10px] flex flex-wrap items-center gap-[5px] text-[12px] text-[#0D0D0D]/40 tracking-[-0.24px]">
                            <span>by</span>
                            <div class="relative h-5 w-5 overflow-hidden rounded-full border-2 border-white">
                              <img [ngSrc]="activity.actorAvatarSrc" [alt]="activity.actorName" width="20" height="20" class="h-5 w-5 object-cover" />
                            </div>
                            <span class="text-[#1A1B1D]">{{ activity.actorName }}</span>
                            <span>{{ activity.time }}</span>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </section>
              }
            </div>
          </div>
        }
      </div>
    </section>

    @if (isSuspendModalOpen()) {
      <button
        type="button"
        (click)="closeSuspendModal()"
        class="fixed inset-0 z-[60] bg-black/20 lg:hidden"
        aria-label="Close suspend listing sheet"
      ></button>

      <section
        class="fixed inset-x-3 bottom-0 z-[70] rounded-[36px] bg-[#F4F4F4] px-4 pb-6 pt-[11px] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Suspend listing"
      >
        <div class="relative h-10">
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
          <button
            type="button"
            (click)="closeSuspendModal()"
            class="absolute right-0 top-[5px] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
            aria-label="Close suspend listing sheet"
          >
            <img
              ngSrc="/assets/icons/admin-listing-details/mobile-actions/close.svg"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="mt-[18px]">
          <div class="inline-flex h-[120px] w-[121px] items-center justify-center rounded-full bg-[#EBEBEB]">
            <div class="inline-flex h-[88px] w-[89px] items-center justify-center rounded-full bg-[#E3D8B4]">
              <img
                ngSrc="/assets/icons/settings/two-factor-warning.svg"
                width="54"
                height="54"
                alt=""
                class="h-[54px] w-[54px]"
                aria-hidden="true"
              />
            </div>
          </div>

          <h2 class="mt-[6px] text-[24px] font-semibold leading-8 text-[#1A1B1D]">Suspend listing?</h2>
          <p class="mt-[6px] text-[16px] leading-6 text-[#5A5A5A]">
            This listing will be removed from public view. Provide a reason for the suspension so the seller can understand the issue.
          </p>
        </div>

        <div class="mt-8">
          <label for="suspend-reason-mobile" class="text-[14px] font-medium leading-5 text-[#5A5A5A]">Why are you suspending?</label>
          <textarea
            id="suspend-reason-mobile"
            [value]="suspendReasonInput()"
            (input)="updateSuspendReason($any($event.target).value)"
            class="mt-[6px] h-[102px] w-full resize-none rounded-[10px] border border-[#E6E6E8] bg-white px-3 py-2 text-[16px] leading-6 text-[#252628] outline-none placeholder:text-[#A3A3A3]"
          ></textarea>
        </div>

        <button
          type="button"
          (click)="confirmSuspendListing()"
          class="mt-[34px] flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A]"
        >
          Yes, suspend
        </button>
      </section>

      <div class="fixed inset-0 z-50 hidden items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-[2px] lg:flex" (click)="closeSuspendModal()">
        <div class="w-full max-w-[600px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_70px_-20px_rgba(0,0,0,0.35)]" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between p-6 pb-4 sm:p-8 sm:pb-5">
            <div class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#FBF7EA]">
              <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E2C319] text-[28px] font-bold text-white">!</div>
            </div>
            <button
              type="button"
              (click)="closeSuspendModal()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F8F8FA] text-[28px] leading-none text-[#6A6D75] transition hover:bg-[#F1F2F5]"
              aria-label="Close suspend listing modal"
            >
              ×
            </button>
          </div>

          <div class="px-6 pb-8 sm:px-8">
            <h2 class="text-[22px] font-semibold tracking-tight text-[#1A1C21] sm:text-[24px]">Suspend listing?</h2>
            <p class="mt-4 max-w-[520px] text-[15px] leading-8 text-[#555B66]">
              This listing will be removed from public view. Provide a reason for the suspension so the seller can understand the issue.
            </p>
          </div>

          <div class="flex items-center justify-end gap-3 bg-[#FBFBFC] px-6 py-4 sm:px-8">
            <button
              type="button"
              (click)="closeSuspendModal()"
              class="inline-flex items-center justify-center rounded-full border border-[#E7E9EE] bg-white px-6 py-3 text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F8F8FA]"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmSuspendListing()"
              class="inline-flex items-center justify-center rounded-full bg-[#FF2F2F] px-6 py-3 text-[15px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(255,47,47,0.65)] transition hover:bg-[#EF2A2A]"
            >
              Yes, suspend
            </button>
          </div>
        </div>
      </div>
    }

    @if (isLiftSuspensionOpen()) {
      <button
        type="button"
        (click)="closeLiftSuspension()"
        class="fixed inset-0 z-[60] bg-black/20 lg:hidden"
        aria-label="Close lift suspension sheet"
      ></button>

      <section
        class="fixed inset-x-3 bottom-0 z-[70] rounded-[36px] bg-[#F4F4F4] px-4 pb-6 pt-[11px] lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Lift suspension"
      >
        <div class="relative h-10">
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
          <button
            type="button"
            (click)="closeLiftSuspension()"
            class="absolute right-0 top-[5px] inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
            aria-label="Close lift suspension sheet"
          >
            <img
              ngSrc="/assets/icons/admin-listing-details/mobile-actions/close.svg"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
              aria-hidden="true"
            />
          </button>
        </div>

        <div class="mt-[18px]">
          <div class="inline-flex h-[120px] w-[121px] items-center justify-center rounded-full bg-[#EBEBEB]">
            <div class="inline-flex h-[88px] w-[89px] items-center justify-center rounded-full bg-[#E3D8B4]">
              <img
                ngSrc="/assets/icons/settings/two-factor-warning.svg"
                width="54"
                height="54"
                alt=""
                class="h-[54px] w-[54px]"
                aria-hidden="true"
              />
            </div>
          </div>

          <h2 class="mt-[6px] text-[24px] font-semibold leading-8 text-[#1A1B1D]">Lift suspension?</h2>
          <p class="mt-[6px] text-[16px] leading-6 text-[#5A5A5A]">
            This listing will be restored and made visible to buyers on the platform.
          </p>
        </div>

        <button
          type="button"
          (click)="confirmLiftSuspension()"
          class="mt-[34px] flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
        >
          Yes, lift suspension
        </button>
      </section>

      <div class="fixed inset-0 z-50 hidden items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-[2px] lg:flex" (click)="closeLiftSuspension()">
        <div class="w-full max-w-[600px] overflow-hidden rounded-[20px] bg-[#F4F4F4] shadow-[0_20px_70px_-20px_rgba(0,0,0,0.35)]" (click)="$event.stopPropagation()">
          <div class="rounded-b-[15px] bg-white px-6 pb-6 pt-6 sm:px-8">
            <div class="flex justify-end">
              <button
                type="button"
                (click)="closeLiftSuspension()"
                class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F9F9]"
                aria-label="Close lift suspension modal"
              >
                <img
                  ngSrc="/assets/icons/admin-listing-details/mobile-actions/close.svg"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="mt-2">
              <div class="inline-flex h-[120px] w-[121px] items-center justify-center rounded-full bg-[#EBEBEB]">
                <div class="inline-flex h-[88px] w-[89px] items-center justify-center rounded-full bg-[#E3D8B4]">
                  <img
                    ngSrc="/assets/icons/settings/two-factor-warning.svg"
                    width="54"
                    height="54"
                    alt=""
                    class="h-[54px] w-[54px]"
                    aria-hidden="true"
                  />
                </div>
              </div>

              <h2 class="mt-3 text-[40px] font-semibold leading-[1.2] tracking-[-0.64px] text-[#0D0D0D]">Lift suspension?</h2>
              <p class="mt-3 text-[16px] font-medium leading-[1.4] text-[#0D0D0D]/70">
                This listing will be restored and made visible to buyers on the platform.
              </p>
            </div>
          </div>

          <div class="flex items-center justify-end gap-4 px-[14px] pb-[15px] pt-4">
            <button
              type="button"
              (click)="closeLiftSuspension()"
              class="inline-flex h-10 items-center justify-center rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-black"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="confirmLiftSuspension()"
              class="inline-flex h-10 items-center justify-center rounded-[64px] border border-white bg-[#6453D9] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              Yes, lift suspension
            </button>
          </div>
        </div>
      </div>
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? 'iphone-17-pro-max');
  readonly activeTab = signal<AdminListingDetailTab>('overview');
  readonly isSuspendModalOpen = signal(false);
  readonly isLiftSuspensionOpen = signal(false);
  readonly mobileActionsOpen = signal(false);
  readonly suspendReasonInput = signal('');
  readonly statusOverrides = signal<Record<string, AdminListingDetailStatus>>({});
  readonly reasonOverrides = signal<Record<string, string>>({});

  readonly mobileActions = computed<MobileListingAction[]>(() => {
    if (this.effectiveStatus() === 'Suspended') {
      return [
        {
          id: 'lift',
          label: 'Lift suspension',
        },
      ];
    }

    return [
      {
        id: 'share',
        label: 'Share listing',
        iconSrc: '/assets/icons/admin-listing-details/mobile-actions/share-listing.svg',
      },
      {
        id: 'suspend',
        label: 'Suspend listing',
        iconSrc: '/assets/icons/admin-listing-details/mobile-actions/suspend-listing.svg',
        danger: true,
      },
    ];
  });

  readonly desktopTabs: ListingTabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      iconSrc: '/assets/icons/listing-details-tab-overview.svg',
      activeIconSrc: '/assets/icons/listing-details-tab-overview.svg',
    },
    {
      id: 'reports',
      label: 'Reports',
      iconSrc: '/assets/icons/listing-details-tab-requests.svg',
    },
    {
      id: 'activities',
      label: 'Activities',
      iconSrc: '/assets/icons/listing-details-tab-activities.svg',
    },
  ];

  readonly mobileTabs: ListingTabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      iconSrc: '/assets/icons/listing-details-tab-overview.svg',
      activeIconSrc: '/assets/icons/listing-details-tab-overview.svg',
    },
    {
      id: 'requests',
      label: 'Requests',
      iconSrc: '/assets/icons/listing-details-tab-requests.svg',
    },
    {
      id: 'activities',
      label: 'Activities',
      iconSrc: '/assets/icons/listing-details-tab-activities.svg',
    },
  ];

  readonly listing = computed(() => {
    const listingKey = this.listingId();
    return this.listings[listingKey] ?? this.listings['iphone-17-pro-max'];
  });

  readonly effectiveStatus = computed<AdminListingDetailStatus>(() => {
    const listingKey = this.listing().id;
    return this.statusOverrides()[listingKey] ?? this.listing().status;
  });

  readonly effectiveSuspensionReason = computed<string | null>(() => {
    const listingKey = this.listing().id;
    const overrideReason = this.reasonOverrides()[listingKey];
    if (overrideReason !== undefined) {
      return overrideReason || null;
    }
    return this.listing().suspensionReason ?? null;
  });

  readonly desktopMetrics: ListingMetric[] = [
    { id: 'date', label: 'Date posted', value: '14  Feb, 2026', iconSrc: '/assets/icons/admin-listing-details/available/calendar.svg' },
    { id: 'messages', label: 'Messages', value: '12', iconSrc: '/assets/icons/listing-details-messages.svg' },
    { id: 'views', label: 'Views', value: '3,990', iconSrc: '/assets/icons/listing-details-eye.svg' },
    { id: 'saves', label: 'Saves', value: '200', iconSrc: '/assets/icons/listing-details-heart.svg' },
  ];

  readonly mobileMetrics: ListingMetric[] = [
    { id: 'date', label: 'Date posted', value: '14 Feb, 2026' },
    { id: 'messages', label: 'Messages', value: '12', iconSrc: '/assets/icons/listing-details-messages.svg' },
    { id: 'views', label: 'Views', value: '3,990', iconSrc: '/assets/icons/listing-details-eye.svg' },
    { id: 'saves', label: 'Saves', value: '200', iconSrc: '/assets/icons/listing-details-heart.svg' },
  ];

  readonly details: ListingDetailRow[] = [
    { label: 'Category', value: 'Electronics/Phones & Tablets' },
    { label: 'Condition', value: 'Used' },
    { label: 'Location', value: 'Ikeja, Lagos' },
    { label: 'Delivery options', value: 'Nationwide' },
    { label: 'WhatsApp number', value: '08169397454' },
    { label: 'Call number', value: '08169397454' },
    { label: 'Accept offers', value: 'Yes' },
  ];

  readonly requests: ListingRequest[] = [
    {
      id: 'request-1',
      buyer: 'Halima Bala',
      avatarSrc: '/assets/images/admin-listing-details/reports/mobile/halima-bala.png',
      requestType: 'Offer (N2,000,000)',
      dateRequested: '14  Feb, 2025',
      time: '24 February 2025, 02:45 pm',
      actionIconSrc: '/assets/icons/admin-listing-details/reports/mobile/messages.svg',
      actionLabel: 'Message Halima Bala',
    },
    {
      id: 'request-2',
      buyer: 'Joseph Olamide',
      avatarSrc: '/assets/images/admin-listing-details/reports/mobile/joseph-olamide.png',
      requestType: 'Call back (08169397454)',
      dateRequested: '14  Feb, 2025',
      time: '24 February 2025, 02:45 pm',
      actionIconSrc: '/assets/icons/admin-listing-details/reports/mobile/call-calling.svg',
      actionLabel: 'Call Joseph Olamide',
    },
    {
      id: 'request-3',
      buyer: 'Kelechi Oduah',
      avatarSrc: '/assets/images/admin-listing-details/reports/mobile/kelechi-oduah.png',
      requestType: 'Offer (N2,000,000)',
      dateRequested: '14  Feb, 2025',
      time: '24 February 2025, 02:45 pm',
      actionIconSrc: '/assets/icons/admin-listing-details/reports/mobile/messages.svg',
      actionLabel: 'Message Kelechi Oduah',
    },
  ];

  readonly reports: ListingReport[] = [
    {
      id: 'report-1',
      reporterName: 'Francis Uche',
      reporterEmail: 'uche@email.com',
      reporterAvatarSrc: '/assets/images/admin-listing-details/reports/desktop/francis-uche.png',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      dateReported: '06 May, 2024',
    },
    {
      id: 'report-2',
      reporterName: 'Mark Anthony',
      reporterEmail: 'mark@email.com',
      reporterAvatarSrc: '/assets/images/admin-listing-details/reports/desktop/mark-anthony.png',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      dateReported: '06 May, 2024',
    },
    {
      id: 'report-3',
      reporterName: 'Elle Adebisi',
      reporterEmail: 'elle@email.com',
      reporterAvatarSrc: '/assets/images/admin-listing-details/reports/desktop/elle-adebisi.png',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      dateReported: '06 May, 2024',
    },
  ];

  readonly activityGroups: ListingActivityGroup[] = [
    {
      id: 'this-week',
      label: 'This week',
      activities: [
        {
          id: 'activity-1',
          iconSrc: '/assets/icons/admin-listing-details/activities/message-received.svg',
          title: 'Message received',
          description: '“Hello is this item still available”',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
        {
          id: 'activity-2',
          iconSrc: '/assets/icons/admin-listing-details/activities/offer-received.svg',
          title: 'Offer received',
          description: 'They sent an offer of N2,000,000',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
        {
          id: 'activity-3',
          iconSrc: '/assets/icons/admin-listing-details/activities/call-back-request.svg',
          title: 'Call back request',
          description: 'They requested you call them back on 0816 939 7454',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
        {
          id: 'activity-4',
          iconSrc: '/assets/icons/admin-listing-details/activities/called-you.svg',
          title: 'Called you',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
      ],
    },
    {
      id: 'january',
      label: 'January',
      activities: [
        {
          id: 'activity-5',
          iconSrc: '/assets/icons/admin-listing-details/activities/added-to-wishlist.svg',
          title: 'Added to wishlist',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
        {
          id: 'activity-6',
          iconSrc: '/assets/icons/admin-listing-details/activities/viewed-your-listing.svg',
          title: 'Viewed your listing',
          actorName: 'Joseph Olamide',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/joseph-olamide.png',
          time: '24 February 2025, 02:45 pm',
        },
        {
          id: 'activity-7',
          iconSrc: '/assets/icons/admin-listing-details/activities/product-published.svg',
          title: 'Product published',
          actorName: 'You',
          actorAvatarSrc: '/assets/images/admin-listing-details/activities/you.png',
          time: '24 January 2025, 02:45 pm',
        },
      ],
    },
  ];

  readonly listings: Record<string, AdminListingDetailRecord> = {
    'iphone-17-pro-max': {
      id: 'iphone-17-pro-max',
      name: 'Iphone 17 pro max',
      previewImage: '/assets/images/admin-listing-details/available/desktop/iphone-1.png',
      lastUpdated: '24 January, 2026',
      isPromoted: true,
      status: 'Available',
      location: 'Ikeja, Lagos',
      datePosted: '14 Feb, 2026',
      messages: 12,
      views: '3,990',
      saves: 200,
      price: '2,500,000',
      description:
        'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Bat..',
      gallery: [
        { id: 'desktop-1', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view' },
        { id: 'desktop-2', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'desktop-3', src: '/assets/images/admin-listing-details/available/desktop/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'desktop-4', src: '/assets/images/admin-listing-details/available/desktop/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'desktop-5', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'desktop-6', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      mobileGallery: [
        { id: 'mobile-1', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view' },
        { id: 'mobile-2', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'mobile-3', src: '/assets/images/admin-listing-details/available/mobile/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'mobile-4', src: '/assets/images/admin-listing-details/available/mobile/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'mobile-5', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'mobile-6', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      store: {
        name: 'The Vine Collections',
        logo: '/assets/images/admin-listing-details/available/store/the-vine-collections.png',
        verified: true,
      },
    },
    'nike-sneaker': {
      id: 'nike-sneaker',
      name: 'Iphone 17 pro max',
      previewImage: '/assets/images/admin-listing-details/available/desktop/iphone-1.png',
      lastUpdated: '24 January, 2026',
      isPromoted: false,
      status: 'Suspended',
      suspensionReason: 'The title, description, or price appears misleading or incorrect.',
      location: 'Ikeja, Lagos',
      datePosted: '14 Feb, 2026',
      messages: 12,
      views: '3,990',
      saves: 200,
      price: '2,500,000',
      description:
        'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Bat..',
      gallery: [
        { id: 'desktop-suspended-1', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view' },
        { id: 'desktop-suspended-2', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'desktop-suspended-3', src: '/assets/images/admin-listing-details/available/desktop/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'desktop-suspended-4', src: '/assets/images/admin-listing-details/available/desktop/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'desktop-suspended-5', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'desktop-suspended-6', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      mobileGallery: [
        { id: 'mobile-suspended-1', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view' },
        { id: 'mobile-suspended-2', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'mobile-suspended-3', src: '/assets/images/admin-listing-details/available/mobile/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'mobile-suspended-4', src: '/assets/images/admin-listing-details/available/mobile/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'mobile-suspended-5', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'mobile-suspended-6', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      store: {
        name: 'The Vine Collections',
        logo: '/assets/images/admin-listing-details/available/store/the-vine-collections.png',
        verified: true,
      },
    },
    'nike-sneaker-mobile': {
      id: 'nike-sneaker-mobile',
      name: 'Iphone 17 pro max',
      previewImage: '/assets/images/admin-listing-details/available/mobile/iphone-1.png',
      lastUpdated: '24 January, 2026',
      isPromoted: false,
      status: 'Suspended',
      suspensionReason: 'The title, description, or price appears misleading or incorrect.',
      location: 'Ikeja, Lagos',
      datePosted: '14 Feb, 2026',
      messages: 12,
      views: '3,990',
      saves: 200,
      price: '2,500,000',
      description:
        'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Bat..',
      gallery: [
        { id: 'desktop-suspended-mobile-1', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view' },
        { id: 'desktop-suspended-mobile-2', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'desktop-suspended-mobile-3', src: '/assets/images/admin-listing-details/available/desktop/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'desktop-suspended-mobile-4', src: '/assets/images/admin-listing-details/available/desktop/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'desktop-suspended-mobile-5', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'desktop-suspended-mobile-6', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      mobileGallery: [
        { id: 'mobile-suspended-mobile-1', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view' },
        { id: 'mobile-suspended-mobile-2', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'mobile-suspended-mobile-3', src: '/assets/images/admin-listing-details/available/mobile/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'mobile-suspended-mobile-4', src: '/assets/images/admin-listing-details/available/mobile/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'mobile-suspended-mobile-5', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'mobile-suspended-mobile-6', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      store: {
        name: 'The Vine Collections',
        logo: '/assets/images/admin-listing-details/available/store/the-vine-collections.png',
        verified: true,
      },
    },
    'maserati-mobile': {
      id: 'maserati-mobile',
      name: 'Iphone 17 pro max',
      previewImage: '/assets/images/admin-listing-details/available/mobile/iphone-1.png',
      lastUpdated: '24 January, 2026',
      isPromoted: false,
      status: 'Suspended',
      suspensionReason: 'The title, description, or price appears misleading or incorrect.',
      location: 'Ikeja, Lagos',
      datePosted: '14 Feb, 2026',
      messages: 12,
      views: '3,990',
      saves: 200,
      price: '2,500,000',
      description:
        'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Bat..',
      gallery: [
        { id: 'desktop-suspended-maserati-1', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view' },
        { id: 'desktop-suspended-maserati-2', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'desktop-suspended-maserati-3', src: '/assets/images/admin-listing-details/available/desktop/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'desktop-suspended-maserati-4', src: '/assets/images/admin-listing-details/available/desktop/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'desktop-suspended-maserati-5', src: '/assets/images/admin-listing-details/available/desktop/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'desktop-suspended-maserati-6', src: '/assets/images/admin-listing-details/available/desktop/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      mobileGallery: [
        { id: 'mobile-suspended-maserati-1', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view' },
        { id: 'mobile-suspended-maserati-2', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view' },
        { id: 'mobile-suspended-maserati-3', src: '/assets/images/admin-listing-details/available/mobile/iphone-3.png', alt: 'Iphone package contents' },
        { id: 'mobile-suspended-maserati-4', src: '/assets/images/admin-listing-details/available/mobile/iphone-4.png', alt: 'Iphone angled view' },
        { id: 'mobile-suspended-maserati-5', src: '/assets/images/admin-listing-details/available/mobile/iphone-1.png', alt: 'Iphone front view duplicate' },
        { id: 'mobile-suspended-maserati-6', src: '/assets/images/admin-listing-details/available/mobile/iphone-2.png', alt: 'Iphone rear view duplicate' },
      ],
      store: {
        name: 'The Vine Collections',
        logo: '/assets/images/admin-listing-details/available/store/the-vine-collections.png',
        verified: true,
      },
    },
  };

  handleMobileAction(actionId: MobileListingAction['id']): void {
    this.mobileActionsOpen.set(false);

    if (actionId === 'suspend') {
      this.suspendReasonInput.set('');
      this.isSuspendModalOpen.set(true);
      return;
    }

    if (actionId === 'lift') {
      this.isLiftSuspensionOpen.set(true);
    }
  }

  statusIcon(status: AdminListingDetailStatus): string {
    switch (status) {
      case 'Suspended':
        return '/assets/icons/listing-details-status-close.svg';
      case 'Sold':
        return '/assets/icons/listing-details-status-sold.svg';
      case 'Paused':
        return '/assets/icons/listing-details-status-pause.svg';
      default:
        return '/assets/icons/listing-details-status-available.svg';
    }
  }

  desktopStatusIcon(status: AdminListingDetailStatus): string {
    switch (status) {
      case 'Suspended':
        return '/assets/icons/listing-details-status-close.svg';
      case 'Sold':
        return '/assets/icons/listing-details-status-desktop-sold.svg';
      case 'Paused':
        return '/assets/icons/listing-details-status-desktop-pause.svg';
      default:
        return '/assets/icons/listing-details-status-desktop-available.svg';
    }
  }

  closeMobileActions(): void {
    this.mobileActionsOpen.set(false);
  }

  closeSuspendModal(): void {
    this.isSuspendModalOpen.set(false);
    this.suspendReasonInput.set('');
  }

  closeLiftSuspension(): void {
    this.isLiftSuspensionOpen.set(false);
  }

  updateSuspendReason(value: string): void {
    this.suspendReasonInput.set(value);
  }

  confirmSuspendListing(): void {
    const listingKey = this.listing().id;
    const reason = this.suspendReasonInput().trim() || 'The title, description, or price appears misleading or incorrect.';

    this.statusOverrides.update((current) => ({ ...current, [listingKey]: 'Suspended' }));
    this.reasonOverrides.update((current) => ({ ...current, [listingKey]: reason }));

    this.isSuspendModalOpen.set(false);
    this.suspendReasonInput.set('');
  }

  confirmLiftSuspension(): void {
    const listingKey = this.listing().id;
    this.statusOverrides.update((current) => ({ ...current, [listingKey]: 'Available' }));
    this.reasonOverrides.update((current) => ({ ...current, [listingKey]: '' }));
    this.isLiftSuspensionOpen.set(false);
  }
}
