import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  heroCheckCircle,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroClock,
  heroMagnifyingGlass,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import {
  AdminPromotionRequestModalComponent,
  PromotionRequestModalData,
} from './components/admin-promotion-request-modal.component';
import {
  AdminDeclinePromotionModalComponent,
  DeclinePromotionPayload,
} from './components/admin-decline-promotion-modal.component';
import { AdminApprovePromotionModalComponent } from './components/admin-approve-promotion-modal.component';

type ApprovalStatus = 'pending' | 'declined' | 'approved';
type ApprovalFilterId = 'all' | ApprovalStatus;

interface ApprovalFilterCard {
  id: ApprovalFilterId;
  label: string;
}

interface ApprovalRecord {
  id: string;
  adTitle: string;
  thumbnail: string;
  userName: string;
  userAvatar: string;
  destinationUrl: string;
  bannerType: 'Image' | 'Video';
  plan: string;
  activeUntil: string;
  dateRequested: string;
  status: ApprovalStatus;
  declineReason?: string;
}

@Component({
  selector: 'app-admin-ads-approvals-page',
  imports: [NgIcon, NgOptimizedImage, CustomDropdownComponent, AdminPromotionRequestModalComponent, AdminDeclinePromotionModalComponent, AdminApprovePromotionModalComponent],
  providers: [
    provideIcons({
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroCheckCircle,
      heroClock,
      heroMagnifyingGlass,
      heroXCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[18px] font-medium tracking-[-0.04em] text-[#b3b3b3]">
          Ads management &gt; <span class="font-semibold text-[#202020]">Approvals</span>
        </h1>
      </header>

      <div class="px-4 pb-6 pt-5 md:hidden">
        <div class="grid grid-cols-3 gap-3">
          <button
            type="button"
            (click)="activeFilter.set('all'); currentPage.set(1)"
            class="rounded-[10px] border px-3 py-2 text-left"
            [class.border-[#6254f3]]="activeFilter() === 'all'"
            [class.bg-[#f9f9ff]]="activeFilter() === 'all'"
            [class.border-transparent]="activeFilter() !== 'all'"
            [class.bg-[#fafafa]]="activeFilter() !== 'all'"
          >
            <p class="text-[12px] text-[rgba(26,27,29,0.5)]">All</p>
            <p class="mt-1 text-[20px] font-semibold leading-none text-[#1a1b1d]">
              {{ countByFilter('all') < 10 ? '0' + countByFilter('all') : countByFilter('all') }}
            </p>
          </button>

          <button
            type="button"
            (click)="activeFilter.set('pending'); currentPage.set(1)"
            class="rounded-[10px] border px-3 py-2 text-left"
            [class.border-[#6254f3]]="activeFilter() === 'pending'"
            [class.bg-[#f9f9ff]]="activeFilter() === 'pending'"
            [class.border-transparent]="activeFilter() !== 'pending'"
            [class.bg-[#fafafa]]="activeFilter() !== 'pending'"
          >
            <p class="text-[12px] text-[rgba(26,27,29,0.5)]">Pending</p>
            <p class="mt-1 text-[24px] font-semibold leading-none text-[#8a8a8a]">
              {{ countByStatus('pending') < 10 ? '0' + countByStatus('pending') : countByStatus('pending') }}
            </p>
          </button>

          <button
            type="button"
            (click)="activeFilter.set('approved'); currentPage.set(1)"
            class="rounded-[10px] border px-3 py-2 text-left"
            [class.border-[#6254f3]]="activeFilter() === 'approved'"
            [class.bg-[#f9f9ff]]="activeFilter() === 'approved'"
            [class.border-transparent]="activeFilter() !== 'approved'"
            [class.bg-[#fafafa]]="activeFilter() !== 'approved'"
          >
            <p class="text-[12px] text-[rgba(26,27,29,0.5)]">Approved</p>
            <p class="mt-1 text-[24px] font-semibold leading-none text-[#8a8a8a]">
              {{ countByStatus('approved') < 10 ? '0' + countByStatus('approved') : countByStatus('approved') }}
            </p>
          </button>
        </div>

        <div class="mt-6 flex items-center gap-2">
          <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
            <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
            <input
              type="search"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search"
              class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
            >
          </label>
          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#ececec] bg-white"
            aria-label="Filter approvals"
          >
            <img [ngSrc]="mobileFilterIcon" alt="" width="18" height="18" class="h-[18px] w-[18px]">
          </button>
        </div>

        <div class="mt-4">
          @for (record of paginatedApprovals(); track record.id) {
            <button
              type="button"
              (click)="openRequestDetails(record)"
              class="w-full border-b border-[#ebebeb] py-3 text-left"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  <div class="h-[42px] w-[75px] shrink-0 overflow-hidden rounded-[7px] bg-[#f3f3f3]">
                    <img
                      [ngSrc]="record.thumbnail"
                      [alt]="record.adTitle"
                      width="75"
                      height="42"
                      class="h-[42px] w-[75px] object-cover"
                    >
                  </div>
                  <p class="truncate text-[14px] font-medium text-[#1a1b1d]">{{ record.adTitle }}</p>
                </div>

                <span
                  class="inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-semibold"
                  [class.bg-[#f9f9f9]]="record.status === 'pending'"
                  [class.text-[#ee9c2e]]="record.status === 'pending'"
                  [class.bg-[#fdf6fa]]="record.status === 'declined'"
                  [class.text-[#ff2524]]="record.status === 'declined'"
                  [class.bg-[#eefbf1]]="record.status === 'approved'"
                  [class.text-[#2ab83f]]="record.status === 'approved'"
                >
                  <ng-icon
                    [name]="statusIconName(record.status)"
                    class="text-[14px]"
                  ></ng-icon>
                  {{ statusLabel(record.status) }}
                </span>
              </div>

              <div class="mt-3 space-y-2 text-[14px]">
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[rgba(26,27,29,0.5)]">Banner type</p>
                  <p class="font-medium text-[#1a1b1d]">{{ record.bannerType }}</p>
                </div>
                <div class="flex items-center justify-between gap-2">
                  <p class="text-[rgba(26,27,29,0.5)]">Active until</p>
                  <p class="font-medium text-[#1a1b1d]">{{ record.activeUntil }}</p>
                </div>
              </div>
            </button>
          }
        </div>
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
        <div class="grid gap-3 md:grid-cols-3">
          @for (card of filterCards; track card.id) {
            <button
              type="button"
              (click)="activeFilter.set(card.id); currentPage.set(1)"
              class="rounded-[16px] border px-4 py-3 text-left transition-colors"
              [class.border-[#6254f3]]="activeFilter() === card.id"
              [class.bg-[#f9f9ff]]="activeFilter() === card.id"
              [class.border-transparent]="activeFilter() !== card.id"
              [class.bg-[#fafafa]]="activeFilter() !== card.id"
            >
              <p class="text-[14px] text-[#8b8b8b]">{{ card.label }}</p>
              <p class="mt-2 text-[18px] font-semibold text-[#303030]">
                {{ countByFilter(card.id) < 10 ? '0' + countByFilter(card.id) : countByFilter(card.id) }}
              </p>
            </button>
          }
        </div>

        <section class="mt-6 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex flex-col gap-4 border-b border-[#efefef] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="flex flex-wrap items-center gap-3">
              <app-custom-dropdown
                [options]="storeFilterOptions()"
                [value]="storeFilter()"
                [ariaLabel]="'Filter approvals by store'"
                [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#8A8A8A]'"
                [menuClass]="'min-w-[180px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="setStoreFilter($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusFilterOptions"
                [value]="statusFilter()"
                [ariaLabel]="'Filter approvals by status'"
                [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#8A8A8A]'"
                [menuClass]="'min-w-[170px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="setStatusFilter($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="activeUntilFilterOptions()"
                [value]="activeUntilFilter()"
                [ariaLabel]="'Filter approvals by active until date'"
                [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#8A8A8A]'"
                [menuClass]="'min-w-[176px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="setActiveUntilFilter($event)"
              ></app-custom-dropdown>
            </div>

            <label class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c] lg:max-w-[226px]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
              <input
                type="search"
                [value]="searchQuery()"
                (input)="updateSearchQuery($event)"
                placeholder="Search"
                class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#9c9c9c]"
              >
            </label>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-[1040px] w-full table-fixed">
              <thead>
                <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                  <th class="w-[250px] px-4 py-3 font-medium">Ad Title</th>
                  <th class="w-[160px] px-4 py-3 font-medium">Thumbnail</th>
                  <th class="w-[210px] px-4 py-3 font-medium">User</th>
                  <th class="w-[140px] px-4 py-3 font-medium">Banner type</th>
                  <th class="w-[150px] px-4 py-3 font-medium">Active until</th>
                  <th class="w-[130px] px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                @for (record of paginatedApprovals(); track record.id) {
                  <tr
                    class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                    (click)="openRequestDetails(record)"
                  >
                    <td class="px-4 py-4 text-[15px] font-medium text-[#222222]">{{ record.adTitle }}</td>

                    <td class="px-4 py-4">
                      <div class="h-9 w-[72px] overflow-hidden rounded-[8px] bg-[#f3f3f3]">
                        <img
                          [ngSrc]="record.thumbnail"
                          [alt]="record.adTitle"
                          width="72"
                          height="36"
                          class="h-9 w-[72px] object-cover"
                        >
                      </div>
                    </td>

                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                          <img
                            [ngSrc]="record.userAvatar"
                            [alt]="record.userName"
                            width="32"
                            height="32"
                            class="h-8 w-8 object-cover"
                          >
                        </div>
                        <span class="truncate text-[15px] text-[#3a3a3a]">{{ record.userName }}</span>
                      </div>
                    </td>

                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.bannerType }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.activeUntil }}</td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                        [class.text-[#f39a22]]="record.status === 'pending'"
                        [class.text-[#ff2d2d]]="record.status === 'declined'"
                        [class.text-[#2ab83f]]="record.status === 'approved'"
                      >
                        <ng-icon
                          [name]="statusIconName(record.status)"
                          class="text-[15px]"
                        ></ng-icon>
                        {{ statusLabel(record.status) }}
                      </span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ paginatedApprovals().length }} results</p>

          <div class="flex items-center gap-2 self-end">
            <button
              type="button"
              (click)="goToPreviousPage()"
              [disabled]="currentPage() === 1"
              class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#b3b3b3] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
            </button>

            <div class="flex h-9 min-w-10 items-center justify-center rounded-[10px] border border-[#ececec] px-3 text-[15px] text-[#707070]">
              {{ currentPage() }}
            </div>

            <button
              type="button"
              (click)="goToNextPage()"
              [disabled]="currentPage() === totalPages()"
              class="flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[#9a9a9a] transition hover:bg-[#fafafa] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ng-icon name="heroChevronRight" class="text-[16px]"></ng-icon>
            </button>

            <span class="ml-1 text-[15px] text-[#7d7d7d]">of {{ totalPages() }}</span>
          </div>
        </div>
      </div>

      @if (selectedRequest()) {
        <app-admin-promotion-request-modal
          [request]="selectedRequest()!"
          (close)="selectedRequest.set(null)"
          (approve)="openApproveModal($event)"
          (decline)="openDeclineModal($event)"
        ></app-admin-promotion-request-modal>
      }

      @if (approveRequestId()) {
        <app-admin-approve-promotion-modal
          [requestId]="approveRequestId()!"
          (close)="approveRequestId.set(null)"
          (confirm)="confirmApprove($event)"
        ></app-admin-approve-promotion-modal>
      }

      @if (declineRequestId()) {
        <app-admin-decline-promotion-modal
          [requestId]="declineRequestId()!"
          (close)="declineRequestId.set(null)"
          (confirm)="confirmDecline($event)"
        ></app-admin-decline-promotion-modal>
      }
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAdsApprovalsPageComponent {
  readonly mobileFilterIcon = '/assets/icons/admin-users/filter-tuning.svg';

  readonly filterCards: ReadonlyArray<ApprovalFilterCard> = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'declined', label: 'Rejected' },
  ];

  readonly activeFilter = signal<ApprovalFilterId>('all');
  readonly storeFilter = signal('all');
  readonly statusFilter = signal<'all' | ApprovalStatus>('all');
  readonly activeUntilFilter = signal('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedRequest = signal<PromotionRequestModalData | null>(null);
  readonly approveRequestId = signal<string | null>(null);
  readonly declineRequestId = signal<string | null>(null);

  readonly approvals = signal<ApprovalRecord[]>([
    {
      id: 'approval-1',
      adTitle: 'Christmas Sale Banner',
      thumbnail: '/assets/images/product_watch_luxury.png',
      userName: 'David Akins',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-1',
      bannerType: 'Image',
      plan: 'Pro',
      activeUntil: '12 May, 2026',
      dateRequested: '04 January, 2026',
      status: 'pending',
    },
    {
      id: 'approval-2',
      adTitle: 'Black Friday Deal',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      userName: 'Amaechi Justina',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-2',
      bannerType: 'Video',
      plan: 'Premium',
      activeUntil: '12 May, 2026',
      dateRequested: '06 January, 2026',
      status: 'declined',
    },
    {
      id: 'approval-3',
      adTitle: 'Ramadan Sales',
      thumbnail: '/assets/images/product_sneakers_lifestyle.png',
      userName: 'David Akins',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-3',
      bannerType: 'Image',
      plan: 'Pro',
      activeUntil: '12 May, 2026',
      dateRequested: '08 January, 2026',
      status: 'pending',
    },
    {
      id: 'approval-4',
      adTitle: 'Holiday Home Deals',
      thumbnail: '/assets/images/product_watch_luxury.png',
      userName: 'Amaechi Justina',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-4',
      bannerType: 'Image',
      plan: 'Premium',
      activeUntil: '17 May, 2026',
      dateRequested: '10 January, 2026',
      status: 'pending',
    },
    {
      id: 'approval-5',
      adTitle: 'Back to School Promo',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      userName: 'David Akins',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-5',
      bannerType: 'Video',
      plan: 'Pro',
      activeUntil: '18 May, 2026',
      dateRequested: '11 January, 2026',
      status: 'pending',
    },
    {
      id: 'approval-6',
      adTitle: 'Weekend Gadget Flash',
      thumbnail: '/assets/images/product_keyboard_rgb.png',
      userName: 'Amaechi Justina',
      userAvatar: '/assets/images/fashion_menswear_hero.png',
      destinationUrl: 'https://www.youtube.com/watch?v=promo-banner-6',
      bannerType: 'Image',
      plan: 'Premium',
      activeUntil: '21 May, 2026',
      dateRequested: '15 January, 2026',
      status: 'declined',
    },
  ]);

  readonly filteredApprovals = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.approvals().filter((record) => {
      const filterMatch = filter === 'all' || record.status === filter;
      const storeMatch = this.storeFilter() === 'all' || record.userName === this.storeFilter();
      const statusMatch = this.statusFilter() === 'all' || record.status === this.statusFilter();
      const activeUntilMatch = this.activeUntilFilter() === 'all' || record.activeUntil === this.activeUntilFilter();
      const queryMatch =
        query === ''
        || record.adTitle.toLowerCase().includes(query)
        || record.userName.toLowerCase().includes(query);

      return filterMatch && storeMatch && statusMatch && activeUntilMatch && queryMatch;
    });
  });

  readonly storeFilterOptions = computed<readonly CustomDropdownOption<string>[]>(() => [
    { value: 'all', label: 'All stores' },
    ...Array.from(new Set(this.approvals().map((record) => record.userName))).map((name) => ({
      value: name,
      label: name,
    })),
  ]);

  readonly statusFilterOptions: readonly CustomDropdownOption<'all' | ApprovalStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ];

  readonly activeUntilFilterOptions = computed<readonly CustomDropdownOption<string>[]>(() => [
    { value: 'all', label: 'All dates' },
    ...Array.from(new Set(this.approvals().map((record) => record.activeUntil))).map((date) => ({
      value: date,
      label: date,
    })),
  ]);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredApprovals().length / this.pageSize)));

  readonly paginatedApprovals = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredApprovals().slice(start, start + this.pageSize);
  });

  countByFilter(filter: ApprovalFilterId): number {
    return this.approvals().filter((record) => filter === 'all' || record.status === filter).length;
  }

  countByStatus(status: ApprovalStatus): number {
    return this.approvals().filter((record) => record.status === status).length;
  }

  openRequestDetails(record: ApprovalRecord): void {
    this.selectedRequest.set({ ...record });
  }

  openApproveModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.approveRequestId.set(requestId);
  }

  confirmApprove(requestId: string): void {
    this.updateRequestStatus(requestId, 'approved');
    this.approveRequestId.set(null);
  }

  openDeclineModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.declineRequestId.set(requestId);
  }

  confirmDecline(payload: DeclinePromotionPayload): void {
    this.updateRequestStatus(payload.requestId, 'declined', payload.reason);
    this.declineRequestId.set(null);
  }

  statusLabel(status: ApprovalStatus): string {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  }

  statusIconName(status: ApprovalStatus): 'heroClock' | 'heroXCircle' | 'heroCheckCircle' {
    if (status === 'pending') {
      return 'heroClock';
    }

    return status === 'approved' ? 'heroCheckCircle' : 'heroXCircle';
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  setStoreFilter(value: string): void {
    this.storeFilter.set(value);
    this.currentPage.set(1);
  }

  setStatusFilter(value: 'all' | ApprovalStatus): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  setActiveUntilFilter(value: string): void {
    this.activeUntilFilter.set(value);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  private updateRequestStatus(requestId: string, status: ApprovalStatus, declineReason?: string): void {
    this.approvals.update((records) =>
      records.map((record) =>
        record.id === requestId
          ? { ...record, status, declineReason: declineReason ?? record.declineReason }
          : record
      )
    );

    const selected = this.selectedRequest();
    if (selected?.id === requestId) {
      this.selectedRequest.set({ ...selected, status });
    }
  }
}
