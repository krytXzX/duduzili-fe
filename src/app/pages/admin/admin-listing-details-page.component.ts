import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { AppToastService } from '../../services/app-toast.service';
import { ShareListingModalComponent } from '../../components/listings/share-listing-modal.component';
import {
  AdminListingDetailActivityResponse,
  AdminListingDetailResponse,
  AdminListingDetailsService,
} from '../../services/admin-listing-details.service';

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
  imports: [RouterLink, NgOptimizedImage, ShareListingModalComponent],
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

        @if (effectiveStatus() !== 'Sold') {
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
        }
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
            [class.bg-[#F3FBF9]]="effectiveStatus() === 'Paused'"
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
              <p class="text-[16px] font-medium text-[#1A1B1D]">{{ reports.length }} <span class="text-[#1A1B1D]/50">results</span></p>
              <div class="flex items-center gap-2 opacity-50">
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                  <span class="text-[#1A1B1D]">‹</span>
                </div>
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] text-[14px] font-medium text-[#1A1B1D]">1</div>
                <div class="inline-flex h-8 w-11 items-center justify-center rounded-[8px] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                  <span class="text-[#1A1B1D]">›</span>
                </div>
                <span class="text-[16px] text-[#1C1F1D]">of 1</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="space-y-[15px] pt-6">
            <p class="text-[16px] font-medium leading-[1.2] tracking-[-0.32px] text-[#0D0D0D]/40">{{ activityYearLabel }}</p>
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
                [class.bg-[#F3FBF9]]="effectiveStatus() === 'Paused'"
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
              } @else if (effectiveStatus() === 'Paused') {
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
              } @else if (effectiveStatus() !== 'Sold') {
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
              <p class="text-[16px] font-medium leading-[1.2] tracking-[-0.32px] text-[#0D0D0D]/40">{{ activityYearLabel }}</p>
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
            #suspendReasonMobileInput
            id="suspend-reason-mobile"
            [value]="suspendReasonInput()"
            (input)="updateSuspendReason(suspendReasonMobileInput.value)"
            class="mt-[6px] h-[102px] w-full resize-none rounded-[10px] border border-[#E6E6E8] bg-white px-3 py-2 text-[16px] leading-6 text-[#252628] outline-none placeholder:text-[#A3A3A3]"
          ></textarea>
        </div>

        <button
          type="button"
          (click)="confirmSuspendListing()"
          [disabled]="!canConfirmSuspendListing()"
          class="mt-[34px] flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A] disabled:cursor-not-allowed disabled:border-[#F6C4C4] disabled:bg-[#F3A3A3] disabled:shadow-none"
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

            <div class="mt-8">
              <label for="suspend-reason-desktop" class="text-[14px] font-medium leading-5 text-[#5A5A5A]">Why are you suspending?</label>
              <textarea
                #suspendReasonDesktopInput
                id="suspend-reason-desktop"
                [value]="suspendReasonInput()"
                (input)="updateSuspendReason(suspendReasonDesktopInput.value)"
                class="mt-[6px] h-[138px] w-full resize-none rounded-[16px] border border-[#E6E6E8] bg-white px-4 py-3 text-[15px] leading-6 text-[#252628] outline-hidden placeholder:text-[#A3A3A3] focus:border-[#6453D9]"
              ></textarea>
            </div>
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
              [disabled]="!canConfirmSuspendListing()"
              class="inline-flex items-center justify-center rounded-full bg-[#FF2F2F] px-6 py-3 text-[15px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(255,47,47,0.65)] transition hover:bg-[#EF2A2A] disabled:cursor-not-allowed disabled:bg-[#F3A3A3] disabled:shadow-none"
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

    <app-share-listing-modal [(isOpen)]="isShareListingModalOpen" [listingName]="listing().name" />
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminListingDetailsService = inject(AdminListingDetailsService);
  private readonly toast = inject(AppToastService);

  private readonly fallbackPreviewImage = '/assets/images/admin-listing-details/available/desktop/iphone-1.png';
  private readonly fallbackGalleryImage = '/assets/images/admin-listing-details/available/mobile/iphone-1.png';
  private readonly fallbackStoreLogo = '/assets/images/admin-listing-details/available/store/the-vine-collections.png';
  private readonly fallbackRequestAvatar = '/assets/images/admin-listing-details/reports/mobile/joseph-olamide.png';
  private readonly fallbackReportAvatar = '/assets/images/admin-listing-details/reports/desktop/mark-anthony.png';
  private readonly fallbackActivityAvatar = '/assets/images/admin-listing-details/activities/you.png';

  readonly listingId = signal('');
  readonly activeTab = signal<AdminListingDetailTab>('overview');
  readonly isSuspendModalOpen = signal(false);
  readonly isLiftSuspensionOpen = signal(false);
  readonly isShareListingModalOpen = signal(false);
  readonly mobileActionsOpen = signal(false);
  readonly suspendReasonInput = signal('');
  readonly isLoading = signal(true);
  readonly isActionInFlight = signal(false);
  readonly canConfirmSuspendListing = computed(() => this.suspendReasonInput().trim().length > 0);

  readonly listing = signal<AdminListingDetailRecord>({
    id: '',
    name: 'Loading listing...',
    previewImage: this.fallbackPreviewImage,
    lastUpdated: '—',
    isPromoted: false,
    status: 'Available',
    suspensionReason: undefined,
    location: '—',
    datePosted: '—',
    messages: 0,
    views: '0',
    saves: 0,
    price: '0',
    description: '—',
    gallery: [{ id: 'gallery-fallback', src: this.fallbackPreviewImage, alt: 'Listing image' }],
    mobileGallery: [{ id: 'gallery-fallback-mobile', src: this.fallbackGalleryImage, alt: 'Listing image' }],
    store: {
      name: 'Store',
      logo: this.fallbackStoreLogo,
      verified: false,
    },
  });

  private readonly detailsState = signal<ListingDetailRow[]>([]);
  private readonly desktopMetricsState = signal<ListingMetric[]>([]);
  private readonly mobileMetricsState = signal<ListingMetric[]>([]);
  private readonly requestsState = signal<ListingRequest[]>([]);
  private readonly reportsState = signal<ListingReport[]>([]);
  private readonly activityGroupsState = signal<ListingActivityGroup[]>([]);
  private readonly activityYearState = signal(String(new Date().getFullYear()));

  readonly mobileActions = computed<MobileListingAction[]>(() => {
    if (this.effectiveStatus() === 'Suspended') {
      return [{ id: 'lift', label: 'Lift suspension' }];
    }

    if (this.effectiveStatus() === 'Paused') {
      return [
        {
          id: 'suspend',
          label: 'Suspend listing',
          iconSrc: '/assets/icons/admin-listing-details/mobile-actions/suspend-listing.svg',
          danger: true,
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

  constructor() {
    this.route.paramMap
      .pipe(
        map((paramMap) => paramMap.get('id') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((listingId) => {
        if (!listingId) {
          return;
        }

        this.listingId.set(listingId);
        this.loadListing(listingId);
      });
  }

  get desktopMetrics(): ListingMetric[] {
    return this.desktopMetricsState();
  }

  get mobileMetrics(): ListingMetric[] {
    return this.mobileMetricsState();
  }

  get details(): ListingDetailRow[] {
    return this.detailsState();
  }

  get requests(): ListingRequest[] {
    return this.requestsState();
  }

  get reports(): ListingReport[] {
    return this.reportsState();
  }

  get activityGroups(): ListingActivityGroup[] {
    return this.activityGroupsState();
  }

  get activityYearLabel(): string {
    return this.activityYearState();
  }

  readonly effectiveStatus = computed<AdminListingDetailStatus>(() => this.listing().status);

  readonly effectiveSuspensionReason = computed<string | null>(() => this.listing().suspensionReason ?? null);

  private loadListing(id: string): void {
    this.isLoading.set(true);

    this.adminListingDetailsService.getListing(id).subscribe({
      next: (response) => {
        this.applyListingResponse(response);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.toast.show({ message: 'This listing isn’t available right now. Please try again shortly.' });
      },
    });
  }

  private applyListingResponse(response: AdminListingDetailResponse): void {
    const previewImage = this.safeImage(response.preview_image, this.fallbackPreviewImage);
    const gallery = this.mapGallery(response.gallery, previewImage);
    const mobileGallery = gallery.length > 0 ? gallery : [{ id: 'mobile-fallback', src: this.fallbackGalleryImage, alt: response.title }];
    const createdDateLabel = this.formatDate(response.created_at);
    const updatedDateLabel = this.formatDate(response.updated_at);
    const savesCount = this.toInteger(response.saves_count);
    const messagesCount = this.toInteger(response.messages_count);
    const viewsCount = this.toInteger(response.views_count);
    const priceValue = this.formatInteger(this.toInteger(response.price));

    this.listing.set({
      id: response.id,
      name: response.title,
      previewImage,
      lastUpdated: updatedDateLabel,
      isPromoted: response.is_promoted,
      status: response.status,
      suspensionReason: response.suspension_reason ?? undefined,
      location: response.location || '—',
      datePosted: createdDateLabel,
      messages: messagesCount,
      views: this.formatInteger(viewsCount),
      saves: savesCount,
      price: priceValue,
      description: response.description?.trim() || '—',
      gallery,
      mobileGallery,
      store: {
        name: response.store.name,
        logo: this.safeImage(response.store.logo, this.fallbackStoreLogo),
        verified: response.store.verified,
      },
    });

    this.desktopMetricsState.set([
      { id: 'date', label: 'Date posted', value: createdDateLabel, iconSrc: '/assets/icons/admin-listing-details/available/calendar.svg' },
      { id: 'messages', label: 'Messages', value: this.formatInteger(messagesCount), iconSrc: '/assets/icons/listing-details-messages.svg' },
      { id: 'views', label: 'Views', value: this.formatInteger(viewsCount), iconSrc: '/assets/icons/listing-details-eye.svg' },
      { id: 'saves', label: 'Saves', value: this.formatInteger(savesCount), iconSrc: '/assets/icons/listing-details-heart.svg' },
    ]);

    this.mobileMetricsState.set([
      { id: 'date', label: 'Date posted', value: createdDateLabel },
      { id: 'messages', label: 'Messages', value: this.formatInteger(messagesCount), iconSrc: '/assets/icons/listing-details-messages.svg' },
      { id: 'views', label: 'Views', value: this.formatInteger(viewsCount), iconSrc: '/assets/icons/listing-details-eye.svg' },
      { id: 'saves', label: 'Saves', value: this.formatInteger(savesCount), iconSrc: '/assets/icons/listing-details-heart.svg' },
    ]);

    this.detailsState.set(response.details.map((detail) => ({
      label: detail.label,
      value: detail.value || '—',
    })));

    this.requestsState.set(
      response.requests.map((request) => ({
        id: request.id,
        buyer: request.buyer,
        avatarSrc: this.safeImage(request.avatar_src, this.fallbackRequestAvatar),
        requestType: request.request_type,
        dateRequested: request.date_requested,
        time: request.time,
        actionIconSrc:
          request.action_type === 'call'
            ? '/assets/icons/admin-listing-details/reports/mobile/call-calling.svg'
            : '/assets/icons/admin-listing-details/reports/mobile/messages.svg',
        actionLabel:
          request.action_type === 'call' ? `Call ${request.buyer}` : `Message ${request.buyer}`,
      })),
    );

    this.reportsState.set(
      response.reports.map((report) => ({
        id: report.id,
        reporterName: report.reporter_name,
        reporterEmail: report.reporter_email,
        reporterAvatarSrc: this.safeImage(report.reporter_avatar_src, this.fallbackReportAvatar),
        description: report.description,
        dateReported: report.date_reported,
      })),
    );

    this.activityGroupsState.set(this.groupActivities(response.activities));
    this.activityYearState.set(this.resolveActivityYear(response.activities));
  }

  private mapGallery(
    gallery: AdminListingDetailResponse['gallery'],
    previewImage: string,
  ): ListingGalleryItem[] {
    const items = gallery
      .map((item, index) => ({
        id: item.id,
        src: this.safeImage(item.src, previewImage),
        alt: item.alt || `Listing image ${index + 1}`,
      }))
      .filter((item, index, collection) => collection.findIndex((entry) => entry.id === item.id) === index);

    return items.length > 0
      ? items
      : [{ id: 'gallery-fallback', src: previewImage, alt: 'Listing image' }];
  }

  private groupActivities(activities: AdminListingDetailActivityResponse[]): ListingActivityGroup[] {
    const grouped = new Map<string, ListingActivity[]>();

    for (const activity of activities) {
      const timestamp = new Date(activity.timestamp);
      const label = this.activityGroupLabel(timestamp);
      const current = grouped.get(label) ?? [];
      current.push({
        id: activity.id,
        iconSrc: this.activityIcon(activity.activity_type),
        title: activity.title,
        description: activity.description ?? undefined,
        actorName: activity.actor_name,
        actorAvatarSrc: this.safeImage(activity.actor_avatar_src, this.fallbackActivityAvatar),
        time: activity.time,
      });
      grouped.set(label, current);
    }

    return Array.from(grouped.entries()).map(([label, groupActivities], index) => ({
      id: `${label}-${index}`,
      label,
      activities: groupActivities,
    }));
  }

  private activityGroupLabel(timestamp: Date): string {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(timestamp.getFullYear(), timestamp.getMonth(), timestamp.getDate());
    const diffDays = Math.floor((today.getTime() - target.getTime()) / 86400000);

    if (diffDays <= 6) {
      return 'This week';
    }

    return timestamp.toLocaleString('en-US', {
      month: 'long',
    });
  }

  private resolveActivityYear(activities: AdminListingDetailActivityResponse[]): string {
    const firstTimestamp = activities[0]?.timestamp;
    if (!firstTimestamp) {
      return String(new Date().getFullYear());
    }

    return String(new Date(firstTimestamp).getFullYear());
  }

  private activityIcon(activityType: string): string {
    switch (activityType) {
      case 'message':
        return '/assets/icons/admin-listing-details/activities/message-received.svg';
      case 'offer':
        return '/assets/icons/admin-listing-details/activities/offer-received.svg';
      case 'callback':
        return '/assets/icons/admin-listing-details/activities/call-back-request.svg';
      case 'wishlist':
        return '/assets/icons/admin-listing-details/activities/added-to-wishlist.svg';
      case 'view':
        return '/assets/icons/admin-listing-details/activities/viewed-your-listing.svg';
      case 'published':
        return '/assets/icons/admin-listing-details/activities/product-published.svg';
      default:
        return '/assets/icons/admin-listing-details/activities/viewed-your-listing.svg';
    }
  }

  private safeImage(src: string | null | undefined, fallback: string): string {
    const value = src?.trim();
    return value ? value : fallback;
  }

  private formatDate(value: string): string {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '—';
    }

    return parsed.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private toInteger(value: number | string): number {
    const numeric = typeof value === 'number' ? value : Number(value.replace(/,/g, ''));
    return Number.isFinite(numeric) ? numeric : 0;
  }

  private formatInteger(value: number): string {
    return new Intl.NumberFormat('en-NG').format(value);
  }

  handleMobileAction(actionId: MobileListingAction['id']): void {
    this.mobileActionsOpen.set(false);

    if (actionId === 'share') {
      this.isShareListingModalOpen.set(true);
      return;
    }

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
    if (this.isActionInFlight()) {
      return;
    }

    this.isSuspendModalOpen.set(false);
    this.suspendReasonInput.set('');
  }

  closeLiftSuspension(): void {
    if (this.isActionInFlight()) {
      return;
    }

    this.isLiftSuspensionOpen.set(false);
  }

  updateSuspendReason(value: string): void {
    this.suspendReasonInput.set(value);
  }

  confirmSuspendListing(): void {
    if (!this.canConfirmSuspendListing() || this.isActionInFlight()) {
      return;
    }

    const listingId = this.listing().id;
    const reason = this.suspendReasonInput().trim();
    if (!listingId) {
      return;
    }

    this.isActionInFlight.set(true);

    this.adminListingDetailsService.suspendListing(listingId, reason).subscribe({
      next: (response) => {
        this.listing.update((current) => ({
          ...current,
          status: response.status,
          suspensionReason: response.suspension_reason ?? undefined,
        }));
        this.isActionInFlight.set(false);
        this.isSuspendModalOpen.set(false);
        this.suspendReasonInput.set('');
        this.toast.show({ message: 'Listing suspended successfully.' });
      },
      error: () => {
        this.isActionInFlight.set(false);
        this.toast.show({ message: 'That listing couldn’t be suspended right now. Please try again.' });
      },
    });
  }

  confirmLiftSuspension(): void {
    const listingId = this.listing().id;
    if (!listingId || this.isActionInFlight()) {
      return;
    }

    this.isActionInFlight.set(true);

    this.adminListingDetailsService.liftSuspension(listingId).subscribe({
      next: (response) => {
        this.listing.update((current) => ({
          ...current,
          status: response.status,
          suspensionReason: undefined,
        }));
        this.isActionInFlight.set(false);
        this.isLiftSuspensionOpen.set(false);
        this.toast.show({ message: 'Listing suspension lifted successfully.' });
      },
      error: () => {
        this.isActionInFlight.set(false);
        this.toast.show({ message: 'That listing couldn’t be restored right now. Please try again.' });
      },
    });
  }
}
