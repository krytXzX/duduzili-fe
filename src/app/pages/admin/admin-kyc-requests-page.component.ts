import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, signal } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { finalize, switchMap, tap } from 'rxjs';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  heroCheckCircle,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroClock,
  heroMagnifyingGlass,
  heroXMark,
  heroXCircle,
} from '@ng-icons/heroicons/outline';
import {
  AdminKycRequestDetailsModalComponent,
  AdminKycRequestDetails,
} from './components/admin-kyc-request-details-modal.component';
import { AdminApproveKycModalComponent } from './components/admin-approve-kyc-modal.component';
import {
  AdminDeclineKycModalComponent,
  DeclineKycPayload,
} from './components/admin-decline-kyc-modal.component';
import { AppToastService } from '../../services/app-toast.service';
import {
  AdminKycIdType,
  AdminKycQuery,
  AdminKycRecordResponse,
  AdminKycService,
  AdminKycStatus,
} from '../../services/admin-kyc.service';
import { AuthSessionService } from '../../services/auth-session.service';

type KycStatus = 'pending approval' | 'approved' | 'declined';
type KycFilterId = 'all' | KycStatus;
type KycCategoryFilter = 'all' | 'drivers_licence' | 'passport' | 'identity_card';
type KycRegionFilter = 'all' | 'nigeria';

interface KycFilterCard {
  id: KycFilterId;
  label: string;
}

interface KycRequestRecord {
  id: string;
  userName: string;
  email: string;
  avatar: string;
  idType: string;
  issuingCountry: string;
  modeOfCapture: string;
  dateUploaded: string;
  status: KycStatus;
  declineReason?: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  reviewedByName?: string;
  reviewedByAvatar?: string;
  reviewedAt?: string;
}

@Component({
  selector: 'app-admin-kyc-requests-page',
  imports: [
    NgIcon,
    NgOptimizedImage,
    CustomDropdownComponent,
    AdminKycRequestDetailsModalComponent,
    AdminApproveKycModalComponent,
    AdminDeclineKycModalComponent,
  ],
  providers: [
    provideIcons({
      heroCheckCircle,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroClock,
      heroMagnifyingGlass,
      heroXMark,
      heroXCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">KYC requests</h1>
      </header>

      <div class="px-5 pb-6 pt-5 md:hidden">
        <div class="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (card of filterCards; track card.id) {
            <button
              type="button"
              (click)="selectFilter(card.id)"
              class="h-[75px] min-w-[104px] rounded-[10px] border px-2.5 py-2 text-left transition-colors"
              [class.border-[#6254f3]]="activeFilter() === card.id"
              [class.bg-[#f9f9ff]]="activeFilter() === card.id"
              [class.border-transparent]="activeFilter() !== card.id"
              [class.bg-[#fafafa]]="activeFilter() !== card.id"
            >
              <p class="text-[12px] text-[rgba(26,27,29,0.5)]">{{ card.label }}</p>
              <p class="mt-2 text-[20px] font-semibold leading-none text-[#1a1b1d]">
                {{ countByFilter(card.id) < 10 ? '0' + countByFilter(card.id) : countByFilter(card.id) }}
              </p>
            </button>
          }
        </div>

        <div class="mt-6 flex items-center gap-2">
          <label class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full bg-[#fafafa] px-4 text-[#9c9c9c]">
            <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
            <input
              type="search"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search"
              class="min-w-0 flex-1 bg-transparent text-[14px] text-[#202020] outline-none placeholder:text-[#777777]"
            >
          </label>
          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
            aria-label="Filter requests"
          >
            <img [ngSrc]="mobileFilterIcon" alt="" width="24" height="24" class="h-6 w-6">
          </button>
        </div>

        <div class="mt-6">
          @if (isLoading()) {
            @for (_ of mobileSkeletonCards; track $index) {
              <div class="w-full border-b border-[#ebebeb] py-3">
                <div class="animate-pulse">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-2">
                      <div class="h-10 w-10 shrink-0 rounded-full bg-[#EEF2FF]"></div>
                      <div class="space-y-2">
                        <div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div>
                        <div class="h-3 w-32 rounded-full bg-[#EEF2FF]"></div>
                      </div>
                    </div>
                    <div class="h-6 w-24 rounded-[8px] bg-[#EEF2FF]"></div>
                  </div>

                  <div class="mt-4 space-y-2">
                    <div class="flex items-center justify-between gap-3">
                      <div class="h-3 w-14 rounded-full bg-[#EEF2FF]"></div>
                      <div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="h-3 w-28 rounded-full bg-[#EEF2FF]"></div>
                      <div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div>
                    </div>
                    <div class="flex items-center justify-between gap-3">
                      <div class="h-3 w-20 rounded-full bg-[#EEF2FF]"></div>
                      <div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div>
                    </div>
                  </div>
                </div>
              </div>
            }
          } @else {
            @for (record of paginatedRequests(); track record.id) {
            <button
              type="button"
              (click)="openRequestDetails(record)"
              class="w-full border-b border-[#ebebeb] py-3 text-left"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-2">
                  <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                    <img
                      [ngSrc]="record.avatar"
                      [alt]="record.userName"
                      width="40"
                      height="40"
                      class="h-10 w-10 object-cover"
                    >
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-[14px] font-medium text-[#1a1b1d]">{{ record.userName }}</p>
                    <p class="truncate text-[12px] font-medium text-[rgba(13,13,13,0.4)]">{{ record.email }}</p>
                  </div>
                </div>

                <span
                  class="inline-flex shrink-0 items-center gap-1 rounded-[8px] px-2 py-1 text-[12px] font-semibold"
                  [class.bg-[#f9f9f9]]="record.status === 'pending approval'"
                  [class.text-[#ee9c2e]]="record.status === 'pending approval'"
                  [class.bg-[#f3fbf9]]="record.status === 'approved'"
                  [class.text-[#25ad32]]="record.status === 'approved'"
                  [class.bg-[#fdf6fa]]="record.status === 'declined'"
                  [class.text-[#ff2524]]="record.status === 'declined'"
                >
                  <ng-icon [name]="statusIconName(record.status)" class="text-[14px]"></ng-icon>
                  {{ statusLabel(record.status) }}
                </span>
              </div>

              <div class="mt-4 space-y-2 text-[14px]">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[rgba(26,27,29,0.5)]">ID type</p>
                  <p class="font-medium text-[#1a1b1d]">{{ record.idType }}</p>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[rgba(26,27,29,0.5)]">Issuing country/region</p>
                  <p class="font-medium text-[#1a1b1d]">{{ record.issuingCountry }}</p>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <p class="text-[rgba(26,27,29,0.5)]">Date uploaded</p>
                  <p class="font-medium text-[#1a1b1d]">{{ record.dateUploaded }}</p>
                </div>
              </div>
            </button>
          }
          }
        </div>
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
        <div class="grid gap-3 md:grid-cols-4">
          @for (card of filterCards; track card.id) {
            <button
              type="button"
              (click)="selectFilter(card.id)"
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
                [options]="categoryOptions"
                [value]="categoryFilter()"
                ariaLabel="Select KYC category"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[180px]"
                (valueChange)="categoryFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="regionOptions"
                [value]="regionFilter()"
                ariaLabel="Select KYC region"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[180px]"
                (valueChange)="regionFilter.set($event); currentPage.set(1)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusOptions"
                [value]="statusFilter()"
                ariaLabel="Select KYC status"
                buttonClass="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
                iconClass="text-[#8a8a8a]"
                menuClass="min-w-[180px]"
                (valueChange)="selectStatus($event)"
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
            <table class="min-w-[1080px] w-full table-fixed">
              <thead>
                <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                  <th class="w-[230px] px-4 py-3 font-medium">User</th>
                  <th class="w-[220px] px-4 py-3 font-medium">ID type</th>
                  <th class="w-[210px] px-4 py-3 font-medium">Issuing country/region</th>
                  <th class="w-[160px] px-4 py-3 font-medium">Date uploaded</th>
                  <th class="w-[220px] px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                @if (isLoading()) {
                  @for (_ of tableSkeletonRows; track $index) {
                    <tr class="border-b border-[#efefef]">
                      <td class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div class="h-9 w-9 rounded-full bg-[#EEF2FF]"></div>
                          <div class="space-y-2">
                            <div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div>
                            <div class="h-3 w-28 rounded-full bg-[#EEF2FF]"></div>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4"><div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div></td>
                      <td class="px-4 py-4"><div class="h-4 w-28 rounded-full bg-[#EEF2FF]"></div></td>
                      <td class="px-4 py-4"><div class="h-4 w-24 rounded-full bg-[#EEF2FF]"></div></td>
                      <td class="px-4 py-4"><div class="h-6 w-24 rounded-full bg-[#EEF2FF]"></div></td>
                    </tr>
                  }
                } @else {
                  @for (record of paginatedRequests(); track record.id) {
                  <tr
                    class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                    (click)="openRequestDetails(record)"
                  >
                    <td class="px-4 py-4">
                      <div class="flex items-center gap-3">
                        <div class="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                          <img
                            [ngSrc]="record.avatar"
                            [alt]="record.userName"
                            width="36"
                            height="36"
                            class="h-9 w-9 object-cover"
                          >
                        </div>
                        <div class="min-w-0">
                          <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.userName }}</p>
                          <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.email }}</p>
                        </div>
                      </div>
                    </td>

                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.idType }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.issuingCountry }}</td>
                    <td class="px-4 py-4 text-[15px] text-[#303030]">{{ record.dateUploaded }}</td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
                        [class.text-[#f39a22]]="record.status === 'pending approval'"
                        [class.text-[#ff2d2d]]="record.status === 'declined'"
                        [class.text-[#2ab83f]]="record.status === 'approved'"
                      >
                        <ng-icon [name]="statusIconName(record.status)" class="text-[15px]"></ng-icon>
                        {{ statusLabel(record.status) }}
                      </span>
                    </td>
                  </tr>
                }
                }
              </tbody>
            </table>
          </div>
        </section>

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ paginatedRequests().length }} results</p>

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
        <app-admin-kyc-request-details-modal
          [request]="selectedRequest()!"
          (close)="selectedRequest.set(null)"
          (approve)="openApproveModal($event)"
          (decline)="openDeclineModal($event)"
        ></app-admin-kyc-request-details-modal>
      }

      @if (approveRequestId()) {
        <app-admin-approve-kyc-modal
          [requestId]="approveRequestId()!"
          (close)="approveRequestId.set(null)"
          (confirm)="confirmApprove($event)"
        ></app-admin-approve-kyc-modal>
      }

      @if (declineRequestId()) {
        <app-admin-decline-kyc-modal
          [requestId]="declineRequestId()!"
          (close)="declineRequestId.set(null)"
          (confirm)="confirmDecline($event)"
        ></app-admin-decline-kyc-modal>
      }

    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminKycRequestsPageComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appToastService = inject(AppToastService);
  private readonly adminKycService = inject(AdminKycService);
  private readonly authSession = inject(AuthSessionService);
  readonly mobileFilterIcon = '/assets/icons/admin-users/filter-tuning.svg';
  readonly categoryOptions: readonly CustomDropdownOption<KycCategoryFilter>[] = [
    { value: 'all', label: 'All categories' },
    { value: 'drivers_licence', label: "Driver's license" },
    { value: 'passport', label: 'Passport' },
    { value: 'identity_card', label: 'Identity card' },
  ];
  readonly regionOptions: readonly CustomDropdownOption<KycRegionFilter>[] = [
    { value: 'all', label: 'All regions' },
    { value: 'nigeria', label: 'Nigeria' },
  ];
  readonly statusOptions: readonly CustomDropdownOption<'all' | KycStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'pending approval', label: 'Pending approval' },
    { value: 'approved', label: 'Approved' },
    { value: 'declined', label: 'Declined' },
  ];

  private readonly currentAdmin = computed(() => ({
    name: this.authSession.user()?.full_name?.trim() || this.authSession.user()?.username || 'Admin reviewer',
    avatar: this.authSession.user()?.avatar || '/assets/images/fashion_menswear_hero.png',
  }));

  readonly filterCards: ReadonlyArray<KycFilterCard> = [
    { id: 'all', label: 'All' },
    { id: 'pending approval', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'declined', label: 'Declined' },
  ];

  readonly activeFilter = signal<KycFilterId>('all');
  readonly categoryFilter = signal<KycCategoryFilter>('all');
  readonly regionFilter = signal<KycRegionFilter>('all');
  readonly statusFilter = signal<'all' | KycStatus>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedRequest = signal<AdminKycRequestDetails | null>(null);
  readonly approveRequestId = signal<string | null>(null);
  readonly declineRequestId = signal<string | null>(null);
  readonly requests = signal<KycRequestRecord[]>([]);
  readonly totalResults = signal(0);
  readonly isLoading = signal(true);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalResults() / this.pageSize)));
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly counts = signal({ all: 0, pending: 0, approved: 0, rejected: 0 });
  readonly paginatedRequests = computed(() => this.requests());
  readonly mobileSkeletonCards = Array.from({ length: 4 });
  readonly tableSkeletonRows = Array.from({ length: 5 });

  private readonly query = computed<AdminKycQuery>(() => ({
    page: this.currentPage(),
    search: this.searchQuery().trim() || undefined,
    status: this.resolveBackendStatus(),
    id_type: (() => {
      const category = this.categoryFilter();
      return category === 'all' ? undefined : category;
    })(),
    country: this.regionFilter() === 'all' ? undefined : 'Nigeria',
  }));

  countByFilter(filter: KycFilterId): number {
    switch (filter) {
      case 'pending approval':
        return this.counts().pending;
      case 'approved':
        return this.counts().approved;
      case 'declined':
        return this.counts().rejected;
      default:
        return this.counts().all;
    }
  }

  constructor() {
    toObservable(this.query)
      .pipe(
        tap(() => this.isLoading.set(true)),
        switchMap((query) =>
          this.adminKycService.getRequests(query).pipe(finalize(() => this.isLoading.set(false))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.requests.set(response.results.map((record) => this.mapRecord(record)));
          this.totalResults.set(response.count);
          this.hasNextPage.set(Boolean(response.next));
          this.hasPreviousPage.set(Boolean(response.previous));
          this.counts.set(response.counts);
        },
        error: () => {
          this.requests.set([]);
          this.totalResults.set(0);
          this.hasNextPage.set(false);
          this.hasPreviousPage.set(false);
          this.counts.set({ all: 0, pending: 0, approved: 0, rejected: 0 });
          this.showToast('KYC requests aren’t available right now. Please try again shortly.');
        },
      });
  }

  openRequestDetails(record: KycRequestRecord): void {
    this.selectedRequest.set({ ...record });
  }

  statusLabel(status: KycStatus): string {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending approval';
    }
  }

  statusIconName(status: KycStatus): 'heroClock' | 'heroCheckCircle' | 'heroXCircle' {
    switch (status) {
      case 'approved':
        return 'heroCheckCircle';
      case 'declined':
        return 'heroXCircle';
      default:
        return 'heroClock';
    }
  }

  updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.currentPage.set(1);
  }

  selectFilter(filter: KycFilterId): void {
    this.activeFilter.set(filter);
    this.statusFilter.set(filter === 'all' ? 'all' : filter);
    this.currentPage.set(1);
  }

  selectStatus(status: 'all' | KycStatus): void {
    this.statusFilter.set(status);
    this.activeFilter.set(status === 'all' ? 'all' : status);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    if (!this.hasPreviousPage()) {
      return;
    }
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    if (!this.hasNextPage()) {
      return;
    }
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  openApproveModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.approveRequestId.set(requestId);
  }

  confirmApprove(requestId: string): void {
    this.adminKycService.approveRequest(requestId).subscribe({
      next: (response) => {
        const mapped = this.mapRecord(response);
        this.mergeUpdatedRequest(mapped);
        this.approveRequestId.set(null);
        this.showToast('KYC request successfully approved');
      },
      error: () => {
        this.showToast('That KYC request couldn’t be approved right now. Please try again.');
      },
    });
  }

  openDeclineModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.declineRequestId.set(requestId);
  }

  confirmDecline(payload: DeclineKycPayload): void {
    this.adminKycService.rejectRequest(payload.requestId, payload.reason).subscribe({
      next: (response) => {
        const mapped = this.mapRecord(response);
        this.mergeUpdatedRequest(mapped);
        this.declineRequestId.set(null);
        this.showToast('KYC request successfully declined');
      },
      error: () => {
        this.showToast('That KYC request couldn’t be declined right now. Please try again.');
      },
    });
  }

  private showToast(message: string): void {
    this.appToastService.show({ message, durationMs: 3000 });
  }

  private categoryKey(idType: string): KycCategoryFilter {
    const normalized = idType.toLowerCase();

    if (normalized.includes('driver')) {
      return 'drivers_licence';
    }

    if (normalized.includes('passport')) {
      return 'passport';
    }

    return 'identity_card';
  }

  private resolveBackendStatus(): AdminKycStatus | undefined {
    const effectiveStatus = this.statusFilter() !== 'all'
      ? this.statusFilter()
      : this.activeFilter() !== 'all'
        ? this.activeFilter()
        : 'all';

    switch (effectiveStatus) {
      case 'pending approval':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'declined':
        return 'rejected';
      default:
        return undefined;
    }
  }

  private mapRecord(record: AdminKycRecordResponse): KycRequestRecord {
    const currentAdmin = this.currentAdmin();
    return {
      id: String(record.id),
      userName: record.user_name,
      email: record.user_email,
      avatar: record.user_avatar || '/assets/images/fashion_menswear_hero.png',
      idType: record.id_type_label,
      issuingCountry: record.country,
      modeOfCapture: record.upload_method_label,
      dateUploaded: this.formatDate(record.submitted_at),
      status: this.mapStatus(record.status),
      declineReason: record.rejection_reason || undefined,
      frontImage: record.id_front,
      backImage: record.id_back || record.id_front,
      selfieImage: record.selfie,
      reviewedByName: record.status === 'pending' ? undefined : currentAdmin.name,
      reviewedByAvatar: record.status === 'pending' ? undefined : currentAdmin.avatar,
      reviewedAt: record.reviewed_at ? this.formatDateTime(record.reviewed_at) : undefined,
    };
  }

  private mergeUpdatedRequest(updated: KycRequestRecord): void {
    this.requests.update((records) => records.map((record) => record.id === updated.id ? updated : record));
    const selected = this.selectedRequest();
    if (selected?.id === updated.id) {
      this.selectedRequest.set({ ...updated });
    }
    this.counts.update((counts) => ({
      all: counts.all,
      pending: Math.max(0, counts.pending - (updated.status === 'pending approval' ? 0 : 1)),
      approved: counts.approved + (updated.status === 'approved' ? 1 : 0),
      rejected: counts.rejected + (updated.status === 'declined' ? 1 : 0),
    }));
  }

  private mapStatus(status: AdminKycStatus): KycStatus {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'declined';
      default:
        return 'pending approval';
    }
  }

  private formatDate(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '---';
    }
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(parsedDate);
  }

  private formatDateTime(value: string): string {
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return '---';
    }
    const date = new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(parsedDate);
    const time = new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(parsedDate).toLowerCase();
    return `${date}, ${time}`;
  }
}
