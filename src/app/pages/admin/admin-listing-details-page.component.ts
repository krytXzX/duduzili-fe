import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpTray,
  heroCalendarDays,
  heroChatBubbleLeftRight,
  heroChevronDown,
  heroClipboardDocumentList,
  heroEye,
  heroFlag,
  heroHeart,
  heroMagnifyingGlass,
  heroMapPin,
  heroNoSymbol,
  heroPhone,
  heroSquare3Stack3d,
  heroTag,
} from '@ng-icons/heroicons/outline';

type AdminListingDetailTab = 'overview' | 'reports' | 'activities';
type AdminListingDetailStatus = 'Available' | 'Sold' | 'Paused' | 'Suspended';

interface AdminListingDetailReport {
  id: string;
  description: string;
  reporterName: string;
  reporterEmail: string;
  reporterInitials: string;
  reporterBackground: string;
  dateReported: string;
}

interface AdminListingDetailActivity {
  id: string;
  icon: string;
  title: string;
  description?: string;
  actorName: string;
  actorInitials: string;
  actorBackground: string;
  time: string;
}

interface AdminListingActivityGroup {
  id: string;
  label: string;
  activities: AdminListingDetailActivity[];
}

interface AdminListingDetailRecord {
  id: string;
  name: string;
  previewImage: string;
  lastUpdated: string;
  isPromoted: boolean;
  status: AdminListingDetailStatus;
  location: string;
  datePosted: string;
  messages: number;
  views: string;
  saves: number;
  price: string;
  description: string;
  gallery: Array<{ src: string; alt: string }>;
  store: {
    name: string;
    logo: string;
  };
}

@Component({
  selector: 'app-admin-listing-details-page',
  imports: [RouterLink, NgIcon],
  providers: [
    provideIcons({
      heroArrowUpTray,
      heroCalendarDays,
      heroChatBubbleLeftRight,
      heroChevronDown,
      heroClipboardDocumentList,
      heroEye,
      heroFlag,
      heroHeart,
      heroMagnifyingGlass,
      heroMapPin,
      heroNoSymbol,
      heroPhone,
      heroSquare3Stack3d,
      heroTag,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="flex-1 overflow-y-auto px-6 py-6 sm:px-8">
        <nav class="mb-6 flex items-center gap-2 text-[14px] font-medium text-[#A5A7AE]">
          <a routerLink="/admin/listings" class="transition hover:text-[#6B5CF0]">Listings</a>
          <span>/</span>
          <span class="text-[#6A6D75]">Listing details</span>
        </nav>

        <div class="mb-7 flex flex-col gap-6 border-b border-[#EEF0F4] pb-6 xl:flex-row xl:items-start xl:justify-between">
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
              <div class="mt-3">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold"
                  [class.bg-[#FFF5E8]]="listing().status === 'Available'"
                  [class.text-[#FF9800]]="listing().status === 'Available'"
                  [class.bg-[#EDF9EF]]="listing().status === 'Sold'"
                  [class.text-[#2FB04A]]="listing().status === 'Sold'"
                  [class.bg-[#EEF4FF]]="listing().status === 'Paused'"
                  [class.text-[#4C86F5]]="listing().status === 'Paused'"
                  [class.bg-[#FFF0F0]]="listing().status === 'Suspended'"
                  [class.text-[#FF4B4B]]="listing().status === 'Suspended'"
                >
                  <span
                    class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    [class.bg-[#FF9800]]="listing().status === 'Available'"
                    [class.bg-[#2FB04A]]="listing().status === 'Sold'"
                    [class.bg-[#4C86F5]]="listing().status === 'Paused'"
                    [class.bg-[#FF4B4B]]="listing().status === 'Suspended'"
                  >
                    {{ listingStatusMark() }}
                  </span>
                  {{ listing().status }}
                </span>
              </div>
            </div>
          </div>

          @if (listing().status !== 'Sold' && listing().status !== 'Paused') {
            <div class="flex flex-wrap items-center gap-3">
              <button
                type="button"
                (click)="handleSuspendAction()"
                class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#1A1C21] shadow-sm transition-colors hover:bg-gray-50"
              >
                <ng-icon name="heroNoSymbol" class="text-base"></ng-icon>
                {{ listing().status === 'Suspended' ? 'Restore listing' : 'Suspend listing' }}
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#1A1C21] shadow-sm transition-colors hover:bg-gray-50"
              >
                <ng-icon name="heroArrowUpTray" class="text-base"></ng-icon>
                Share listing
              </button>
            </div>
          }
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
                    <span class="text-gray-500">
                      <ng-icon name="heroTag" class="text-xl"></ng-icon>
                    </span>
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
                      <span class="text-gray-500">↗</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        } @else if (activeTab() === 'reports') {
          <div class="overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
            <div class="flex items-center justify-end border-b border-[#F1F2F4] px-4 py-4 sm:px-6">
              <label class="flex w-full max-w-[230px] items-center gap-3 rounded-full bg-[#FAFAFB] px-4 py-3 text-[15px] text-[#9AA0AA]">
                <ng-icon name="heroMagnifyingGlass" class="text-base text-[#A3A8B3]"></ng-icon>
                <input
                  type="search"
                  [value]="reportSearchQuery()"
                  (input)="updateReportSearchQuery(($any($event.target).value ?? '').toString())"
                  placeholder="Search"
                  class="w-full border-0 bg-transparent p-0 text-[15px] text-[#1A1C21] outline-none placeholder:text-[#A3A8B3]"
                >
              </label>
            </div>

            <div class="overflow-x-auto">
              <table class="min-w-full border-collapse">
                <thead>
                  <tr class="bg-[#FAFAFB] text-left text-[12px] font-semibold text-[#9AA0AA]">
                    <th class="px-4 py-4 sm:px-6">User</th>
                    <th class="px-4 py-4">Description</th>
                    <th class="px-4 py-4 sm:px-6">Date reported</th>
                  </tr>
                </thead>
                <tbody>
                  @for (report of filteredReports(); track report.id) {
                    <tr class="border-t border-[#F1F2F4] align-top">
                      <td class="px-4 py-6 sm:px-6">
                        <div class="flex min-w-[220px] items-center gap-3">
                          <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold text-white"
                            [style.background]="report.reporterBackground"
                          >
                            {{ report.reporterInitials }}
                          </span>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#1A1C21]">{{ report.reporterName }}</p>
                            <p class="truncate text-[13px] text-[#A3A8B3]">{{ report.reporterEmail }}</p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-6">
                        <p class="max-w-[640px] text-[15px] leading-8 text-[#4F5562]">
                          {{ report.description }}
                        </p>
                      </td>
                      <td class="px-4 py-6 sm:px-6">
                        <p class="min-w-[140px] text-[15px] font-medium text-[#353944]">{{ report.dateReported }}</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="flex items-center justify-between px-4 py-6 text-[15px] text-[#6F7480] sm:px-6">
              <span>{{ filteredReports().length }} results</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECEEF3] text-[#B0B5BF] transition hover:bg-[#F8F8FA]"
                  aria-label="Previous page"
                >
                  ‹
                </button>
                <span class="inline-flex h-9 min-w-9 items-center justify-center rounded-xl border border-[#ECEEF3] px-3 text-[#6F7480]">
                  1
                </span>
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#ECEEF3] text-[#A0A5AF] transition hover:bg-[#F8F8FA]"
                  aria-label="Next page"
                >
                  ›
                </button>
                <span>of 20</span>
              </div>
            </div>
          </div>
        } @else {
          <div class="space-y-8">
            <div class="text-[14px] font-medium text-[#8F949D]">2025</div>

            @for (group of groupedActivities(); track group.id) {
              <section class="space-y-6">
                <div class="flex items-center gap-3">
                  <span class="rounded-full bg-[#F6F7FA] px-4 py-2 text-[15px] font-medium text-[#8D929B]">
                    {{ group.label }}
                  </span>
                  <div class="h-px flex-1 bg-[#EEF0F4]"></div>
                  <button
                    type="button"
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#6A6D75] transition hover:bg-[#F8F8FA]"
                    aria-label="Toggle activity group"
                  >
                    <ng-icon name="heroChevronDown" class="text-base"></ng-icon>
                  </button>
                </div>

                <div class="space-y-0">
                  @for (activity of group.activities; track activity.id; let isLast = $last) {
                    <div class="flex gap-5">
                      <div class="flex w-10 flex-col items-center">
                        <span class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E7E9EE] bg-white text-[#9EA3AD]">
                          <ng-icon [name]="activity.icon" class="text-[18px]"></ng-icon>
                        </span>
                        @if (!isLast) {
                          <span class="mt-1 w-px flex-1 bg-[#E7E9EE]"></span>
                        }
                      </div>

                      <div class="min-w-0 flex-1 pb-7">
                        <h3 class="text-[15px] font-medium text-[#1A1C21]">{{ activity.title }}</h3>

                        @if (activity.description) {
                          <div class="mt-2 inline-flex max-w-full rounded-full bg-[#F6F7FA] px-4 py-2 text-[14px] text-[#666C77]">
                            {{ activity.description }}
                          </div>
                        }

                        <div class="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-[#A0A5AF]">
                          <span>by</span>
                          <span
                            class="flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                            [style.background]="activity.actorBackground"
                          >
                            {{ activity.actorInitials }}
                          </span>
                          <span class="font-medium text-[#4B5160]">{{ activity.actorName }}</span>
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

      @if (isSuspendModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-[2px]"
          (click)="closeSuspendModal()"
        >
          <div
            class="w-full max-w-[600px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_70px_-20px_rgba(0,0,0,0.35)]"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between p-6 pb-4 sm:p-8 sm:pb-5">
              <div class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#FBF7EA]">
                <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E2C319] text-[28px] font-bold text-white">
                  !
                </div>
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
              <h2 class="text-[22px] font-semibold tracking-tight text-[#1A1C21] sm:text-[24px]">
                Suspend listing?
              </h2>
              <p class="mt-4 max-w-[520px] text-[15px] leading-8 text-[#555B66]">
                This listing will be removed from public view. Provide a reason for the suspension so the seller can understand the issue.
              </p>

              <div class="mt-6">
                <label for="listing-suspension-reason" class="mb-3 block text-[15px] font-medium text-[#555B66]">
                  Why are you suspending?
                </label>
                <textarea
                  id="listing-suspension-reason"
                  [value]="suspensionReason()"
                  (input)="updateSuspensionReason(($any($event.target).value ?? '').toString())"
                  rows="4"
                  class="min-h-[140px] w-full resize-none rounded-[16px] border border-[#DEE2EA] px-4 py-4 text-[15px] text-[#1A1C21] outline-none transition focus:border-[#6B5CF0] focus:ring-2 focus:ring-[#6B5CF0]/15"
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
                (click)="confirmSuspension()"
                class="inline-flex items-center justify-center rounded-full bg-[#FF2F2F] px-6 py-3 text-[15px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(255,47,47,0.65)] transition hover:bg-[#EF2A2A]"
              >
                Yes, suspend
              </button>
            </div>
          </div>
        </div>
      }

      @if (isRestoreModalOpen()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-[2px]"
          (click)="closeRestoreModal()"
        >
          <div
            class="w-full max-w-[600px] overflow-hidden rounded-[28px] bg-white shadow-[0_20px_70px_-20px_rgba(0,0,0,0.35)]"
            (click)="$event.stopPropagation()"
          >
            <div class="flex items-start justify-between p-6 pb-4 sm:p-8 sm:pb-5">
              <div class="inline-flex h-24 w-24 items-center justify-center rounded-full bg-[#FBF7EA]">
                <div class="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#E2C319] text-[28px] font-bold text-white">
                  !
                </div>
              </div>
              <button
                type="button"
                (click)="closeRestoreModal()"
                class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F8F8FA] text-[28px] leading-none text-[#6A6D75] transition hover:bg-[#F1F2F5]"
                aria-label="Close lift suspension modal"
              >
                ×
              </button>
            </div>

            <div class="px-6 pb-8 sm:px-8">
              <h2 class="text-[22px] font-semibold tracking-tight text-[#1A1C21] sm:text-[24px]">
                Lift suspension?
              </h2>
              <p class="mt-4 max-w-[520px] text-[15px] leading-8 text-[#555B66]">
                This listing will be restored and made visible to buyers on the platform.
              </p>
            </div>

            <div class="flex items-center justify-end gap-3 bg-[#FBFBFC] px-6 py-4 sm:px-8">
              <button
                type="button"
                (click)="closeRestoreModal()"
                class="inline-flex items-center justify-center rounded-full border border-[#E7E9EE] bg-white px-6 py-3 text-[15px] font-medium text-[#1A1C21] transition hover:bg-[#F8F8FA]"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="confirmRestore()"
                class="inline-flex items-center justify-center rounded-full bg-[#6B5CF0] px-6 py-3 text-[15px] font-medium text-white shadow-[0_10px_24px_-12px_rgba(107,92,240,0.65)] transition hover:bg-[#5E44EE]"
              >
                Yes, lift suspension
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? 'iphone-17-pro-max');
  readonly activeTab = signal<AdminListingDetailTab>('overview');
  readonly listingStatusOverride = signal<AdminListingDetailStatus | null>(null);
  readonly reportSearchQuery = signal('');
  readonly isSuspendModalOpen = signal(false);
  readonly isRestoreModalOpen = signal(false);
  readonly suspensionReason = signal('');

  readonly listing = computed(() => {
    const listingKey = this.getListingKey(this.listingId());
    const baseListing = this.listings[listingKey];
    const override = this.listingStatusOverride();

    return override === null ? baseListing : { ...baseListing, status: override };
  });
  readonly activeImage = signal('/assets/images/image-1-1.jpg');

  readonly tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'heroSquare3Stack3d' },
    { id: 'reports' as const, label: 'Reports', icon: 'heroFlag' },
    { id: 'activities' as const, label: 'Activities', icon: 'heroClipboardDocumentList' },
  ];

  readonly details = computed(() => [
    { label: 'Category', value: 'Electronics/Phones & Tablets' },
    { label: 'Condition', value: 'Used' },
    { label: 'Location', value: 'Ikeja, Lagos' },
    { label: 'Delivery options', value: 'Nationwide' },
    { label: 'WhatsApp number', value: '08169397454' },
    { label: 'Call number', value: '08169397454' },
    { label: 'Accept offers', value: 'Yes' },
  ]);

  readonly reports = computed<AdminListingDetailReport[]>(() => [
    {
      id: 'r1',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      reporterName: 'Francis Uche',
      reporterEmail: 'uche@email.com',
      reporterInitials: 'FU',
      reporterBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      dateReported: '06 May, 2024',
    },
    {
      id: 'r2',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      reporterName: 'Mark Anthony',
      reporterEmail: 'mark@email.com',
      reporterInitials: 'MA',
      reporterBackground: 'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      dateReported: '06 May, 2024',
    },
    {
      id: 'r3',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      reporterName: 'Elle Adebisi',
      reporterEmail: 'elle@email.com',
      reporterInitials: 'EA',
      reporterBackground: 'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      dateReported: '06 May, 2024',
    },
  ]);

  readonly filteredReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();

    if (!query) {
      return this.reports();
    }

    return this.reports().filter((report) =>
      [report.reporterName, report.reporterEmail, report.description, report.dateReported]
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  });

  readonly activities = computed<AdminListingDetailActivity[]>(() => [
    {
      id: 'a1',
      icon: 'heroChatBubbleLeftRight',
      title: 'Message received',
      description: '“I’m interested. Can we negotiate on price?”',
      actorName: 'Sharon Idemudia',
      actorInitials: 'SI',
      actorBackground: 'linear-gradient(135deg, #FDA4AF 0%, #FB7185 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a2',
      icon: 'heroChatBubbleLeftRight',
      title: 'Message received',
      description: '“Hello is this item still available”',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a3',
      icon: 'heroTag',
      title: 'Offer received',
      description: 'They sent an offer of ₦2,000,000',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a4',
      icon: 'heroPhone',
      title: 'Call back request',
      description: 'They requested you call them back on 0816 939 7454',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a5',
      icon: 'heroPhone',
      title: 'Called you',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a6',
      icon: 'heroHeart',
      title: 'Added to wishlist',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a7',
      icon: 'heroEye',
      title: 'Viewed your listing',
      actorName: 'Joseph Olamide',
      actorInitials: 'JO',
      actorBackground: 'linear-gradient(135deg, #7CC1F3 0%, #4E87F5 100%)',
      time: '24 February 2025, 02:45 pm',
    },
    {
      id: 'a8',
      icon: 'heroTag',
      title: 'Product published',
      actorName: 'You',
      actorInitials: 'Y',
      actorBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      time: '24 January 2025, 02:45 pm',
    },
  ]);

  readonly groupedActivities = computed<AdminListingActivityGroup[]>(() => [
    {
      id: 'this-week',
      label: 'This week',
      activities: this.activities().slice(0, 5),
    },
    {
      id: 'january',
      label: 'January',
      activities: this.activities().slice(5),
    },
  ]);

  readonly listings: Record<string, AdminListingDetailRecord> = {
    'iphone-17-pro-max': {
      id: 'iphone-17-pro-max',
      name: 'Iphone 17 pro max',
      previewImage: '/assets/images/image-1-1.jpg',
      lastUpdated: '24 January, 2026',
      isPromoted: true,
      status: 'Available' as AdminListingDetailStatus,
      location: 'Ikeja, Lagos',
      datePosted: '14 Feb, 2026',
      messages: 12,
      views: '3,990',
      saves: 200,
      price: '2,500,000',
      description:
        'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Battery health is strong and the device comes exactly as shown in the photos.',
      gallery: [
        { src: '/assets/images/image-1-1.jpg', alt: 'Iphone front view' },
        { src: '/assets/images/image-3-1.jpg', alt: 'Iphone camera close up' },
        { src: '/assets/images/image-4-1.jpg', alt: 'Iphone in the box' },
        { src: '/assets/images/image-1-1.jpg', alt: 'Iphone display image' },
        { src: '/assets/images/image-1-1.jpg', alt: 'Iphone angled view' },
        { src: '/assets/images/image-3-1.jpg', alt: 'Iphone side angle' },
      ],
      store: {
        name: 'The Vine Collections',
        logo: '/assets/images/image-1-1.jpg',
      },
    },
    'logitech-mouse': {
      id: 'logitech-mouse',
      name: 'Logitech ergonomic mouse',
      previewImage: '/assets/images/hero_img_3.png',
      lastUpdated: '18 January, 2026',
      isPromoted: false,
      status: 'Sold' as AdminListingDetailStatus,
      location: 'Ikeja, Lagos',
      datePosted: '10 Feb, 2026',
      messages: 8,
      views: '1,450',
      saves: 76,
      price: '35,000',
      description: 'Neatly used ergonomic mouse in great condition with smooth tracking and excellent battery life.',
      gallery: [
        { src: '/assets/images/hero_img_3.png', alt: 'Mouse image' },
        { src: '/assets/images/hero_img_3.png', alt: 'Mouse close up' },
        { src: '/assets/images/hero_img_3.png', alt: 'Mouse side view' },
      ],
      store: {
        name: 'Eden Organics',
        logo: '/assets/images/hero_img_3.png',
      },
    },
  };

  constructor() {
    this.activeImage.set(this.listing().gallery[0]?.src ?? '/assets/images/image-1-1.jpg');
  }

  handleSuspendAction(): void {
    if (this.listing().status === 'Suspended') {
      this.isRestoreModalOpen.set(true);
      return;
    }

    this.isSuspendModalOpen.set(true);
  }

  closeSuspendModal(): void {
    this.isSuspendModalOpen.set(false);
    this.suspensionReason.set('');
  }

  updateSuspensionReason(value: string): void {
    this.suspensionReason.set(value);
  }

  confirmSuspension(): void {
    this.listingStatusOverride.set('Suspended');
    this.closeSuspendModal();
  }

  closeRestoreModal(): void {
    this.isRestoreModalOpen.set(false);
  }

  confirmRestore(): void {
    this.listingStatusOverride.set('Available');
    this.closeRestoreModal();
  }

  updateReportSearchQuery(value: string): void {
    this.reportSearchQuery.set(value);
  }

  private getListingKey(listingId: string): string {
    return listingId in this.listings ? listingId : 'iphone-17-pro-max';
  }

  listingStatusMark(): string {
    switch (this.listing().status) {
      case 'Available':
        return '•';
      case 'Sold':
        return '✓';
      case 'Paused':
        return '∥';
      case 'Suspended':
        return '⛔';
    }
  }
}
