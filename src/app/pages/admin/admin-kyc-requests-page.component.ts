import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
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

type KycStatus = 'pending approval' | 'approved' | 'declined';
type KycFilterId = 'all' | KycStatus;

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

interface AdminToast {
  id: number;
  message: string;
}

@Component({
  selector: 'app-admin-kyc-requests-page',
  imports: [
    NgIcon,
    NgOptimizedImage,
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
              (click)="activeFilter.set(card.id); currentPage.set(1)"
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
        </div>
      </div>

      <div class="hidden px-4 py-6 sm:px-6 lg:px-8 md:block">
        <div class="grid gap-3 md:grid-cols-4">
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
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Category</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Store</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>

              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-4 text-[14px] text-[#8a8a8a]"
              >
                <span>Status</span>
                <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
              </button>
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

      <div class="pointer-events-none fixed inset-x-0 bottom-6 z-[240] flex justify-center px-4">
        @for (toast of toasts(); track toast.id) {
          <div class="admin-toast-slide-up pointer-events-auto flex min-h-12 w-full max-w-[360px] items-center justify-between gap-4 rounded-[18px] bg-[#111111] px-6 py-4 text-white shadow-[0_24px_48px_-24px_rgba(0,0,0,0.85)]">
            <div class="flex items-center gap-3">
              <ng-icon name="heroCheckCircle" class="text-[18px] text-white"></ng-icon>
              <p class="text-[14px] font-medium text-white">{{ toast.message }}</p>
            </div>

            <button
              type="button"
              (click)="dismissToast(toast.id)"
              class="flex h-6 w-6 items-center justify-center rounded-full text-white/90 transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
            </button>
          </div>
        }
      </div>
    </section>
  `,
  styles: `
    .admin-toast-slide-up {
      animation: admin-toast-slide-up 220ms ease-out;
    }

    @keyframes admin-toast-slide-up {
      from {
        opacity: 0;
        transform: translateY(16px);
      }

      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminKycRequestsPageComponent {
  readonly mobileFilterIcon = '/assets/icons/admin-users/filter-tuning.svg';

  private readonly currentAdmin = {
    name: 'Bryan Odjede',
    avatar: '/assets/images/fashion_menswear_hero.png',
  };

  readonly filterCards: ReadonlyArray<KycFilterCard> = [
    { id: 'all', label: 'All' },
    { id: 'pending approval', label: 'Pending' },
    { id: 'approved', label: 'Approved' },
    { id: 'declined', label: 'Declined' },
  ];

  readonly activeFilter = signal<KycFilterId>('all');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedRequest = signal<AdminKycRequestDetails | null>(null);
  readonly approveRequestId = signal<string | null>(null);
  readonly declineRequestId = signal<string | null>(null);
  readonly toasts = signal<AdminToast[]>([]);

  readonly requests = signal<KycRequestRecord[]>([
    {
      id: 'kyc-1',
      userName: 'Francis Uche',
      email: 'uche@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      idType: `Driver's license`,
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: '06 May, 2024',
      status: 'pending approval',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/fashion_menswear_hero.png',
    },
    {
      id: 'kyc-2',
      userName: 'Mark Anthony',
      email: 'mark@email.com',
      avatar: '/assets/images/product_watch_luxury.png',
      idType: 'Passport',
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: '06 May, 2024',
      status: 'declined',
      declineReason: 'Document image is blurry',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/product_watch_luxury.png',
      reviewedByName: 'Bryan Odjede',
      reviewedByAvatar: '/assets/images/fashion_menswear_hero.png',
      reviewedAt: '24 February 2025, 02:45 pm',
    },
    {
      id: 'kyc-3',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      idType: 'Identity card',
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: '06 May, 2024',
      status: 'approved',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/product_sneakers_lifestyle.png',
      reviewedByName: 'Bryan Odjede',
      reviewedByAvatar: '/assets/images/fashion_menswear_hero.png',
      reviewedAt: '24 February 2025, 02:45 pm',
    },
    {
      id: 'kyc-4',
      userName: 'Francis Uche',
      email: 'uche@email.com',
      avatar: '/assets/images/fashion_menswear_hero.png',
      idType: `Driver's license`,
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: '06 May, 2024',
      status: 'pending approval',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/fashion_menswear_hero.png',
    },
    {
      id: 'kyc-5',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      idType: `Driver's license`,
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: 'Aug 4, 2025',
      status: 'declined',
      declineReason: 'Your documents are invalid, Kindly provide a valid documentation',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/product_sneakers_lifestyle.png',
      reviewedByName: 'Sharon Idemudia',
      reviewedByAvatar: '/assets/images/product_sneakers_lifestyle.png',
      reviewedAt: '24 February 2025, 02:45 pm',
    },
    {
      id: 'kyc-6',
      userName: 'Elle Adebisi',
      email: 'elle@email.com',
      avatar: '/assets/images/product_sneakers_lifestyle.png',
      idType: 'Identity card',
      issuingCountry: 'Nigeria',
      modeOfCapture: 'Photo upload',
      dateUploaded: '06 May, 2024',
      status: 'approved',
      frontImage: '/assets/images/product_watch_luxury.png',
      backImage: '/assets/images/product_keyboard_rgb.png',
      selfieImage: '/assets/images/product_sneakers_lifestyle.png',
      reviewedByName: 'Bryan Odjede',
      reviewedByAvatar: '/assets/images/fashion_menswear_hero.png',
      reviewedAt: '24 February 2025, 02:45 pm',
    },
  ]);

  readonly filteredRequests = computed(() => {
    const filter = this.activeFilter();
    const query = this.searchQuery().trim().toLowerCase();

    return this.requests().filter((record) => {
      const filterMatch = filter === 'all' || record.status === filter;
      const queryMatch =
        query === ''
        || record.userName.toLowerCase().includes(query)
        || record.email.toLowerCase().includes(query)
        || record.idType.toLowerCase().includes(query);

      return filterMatch && queryMatch;
    });
  });

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.filteredRequests().length / this.pageSize)));

  readonly paginatedRequests = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredRequests().slice(start, start + this.pageSize);
  });

  countByFilter(filter: KycFilterId): number {
    return this.requests().filter((record) => filter === 'all' || record.status === filter).length;
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

  goToPreviousPage(): void {
    this.currentPage.update((page) => Math.max(1, page - 1));
  }

  goToNextPage(): void {
    this.currentPage.update((page) => Math.min(this.totalPages(), page + 1));
  }

  openApproveModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.approveRequestId.set(requestId);
  }

  confirmApprove(requestId: string): void {
    this.updateRequestStatus(requestId, 'approved');
    this.approveRequestId.set(null);
    this.showToast('KYC request successfully approved');
  }

  openDeclineModal(requestId: string): void {
    this.selectedRequest.set(null);
    this.declineRequestId.set(requestId);
  }

  confirmDecline(payload: DeclineKycPayload): void {
    this.updateRequestStatus(payload.requestId, 'declined', payload.reason);
    this.declineRequestId.set(null);
    this.showToast('KYC request successfully declined');
  }

  dismissToast(toastId: number): void {
    this.toasts.update((current) => current.filter((toast) => toast.id !== toastId));
  }

  private updateRequestStatus(requestId: string, status: KycStatus, declineReason?: string): void {
    this.requests.update((records) =>
      records.map((record) =>
        record.id === requestId
          ? {
              ...record,
              status,
              declineReason: status === 'declined' ? declineReason ?? record.declineReason : undefined,
              reviewedByName: this.currentAdmin.name,
              reviewedByAvatar: this.currentAdmin.avatar,
              reviewedAt: '24 February 2025, 02:45 pm',
            }
          : record
      )
    );

    const selected = this.selectedRequest();
    if (selected?.id === requestId) {
      this.selectedRequest.set({
        ...selected,
        status,
        declineReason: status === 'declined' ? declineReason ?? selected.declineReason : undefined,
        reviewedByName: this.currentAdmin.name,
        reviewedByAvatar: this.currentAdmin.avatar,
        reviewedAt: '24 February 2025, 02:45 pm',
      });
    }
  }

  private showToast(message: string): void {
    const toast = { id: Date.now(), message };
    this.toasts.update((current) => [...current, toast]);

    setTimeout(() => {
      this.dismissToast(toast.id);
    }, 3000);
  }
}
