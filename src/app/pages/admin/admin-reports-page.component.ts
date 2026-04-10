import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
  heroQueueList,
  heroUserCircle,
} from '@ng-icons/heroicons/outline';
import {
  AdminSellerReportDetails,
  AdminSellerReportDetailsModalComponent,
} from './components/admin-seller-report-details-modal.component';
import {
  AdminListingReportDetails,
  AdminListingReportDetailsModalComponent,
} from './components/admin-listing-report-details-modal.component';

type ReportsTab = 'reported sellers' | 'reported listings';

interface SellerReportRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerAvatar: string;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByAvatar: string;
  dateReported: string;
  reason: string;
  description: string;
  totalReports: number;
}

interface ListingReportRecord {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerAvatar: string;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByAvatar: string;
  dateReported: string;
  description: string;
  totalReports: number;
}

@Component({
  selector: 'app-admin-reports-page',
  imports: [NgIcon, NgOptimizedImage, AdminSellerReportDetailsModalComponent, AdminListingReportDetailsModalComponent],
  providers: [
    provideIcons({
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
      heroQueueList,
      heroUserCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <header class="border-b border-[#efefef] px-8 py-6">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Reports</h1>
      </header>

      <div class="px-4 py-6 sm:px-6 lg:px-8">
        <div class="border-b border-[#efefef]">
          <div class="flex items-center gap-8">
            <button
              type="button"
              (click)="activeTab.set('reported sellers'); currentPage.set(1)"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'reported sellers'"
              [class.text-[#6254f3]]="activeTab() === 'reported sellers'"
              [class.border-transparent]="activeTab() !== 'reported sellers'"
              [class.text-[#8b8b8b]]="activeTab() !== 'reported sellers'"
            >
              <ng-icon name="heroUserCircle" class="text-[16px]"></ng-icon>
              Reported Sellers
            </button>

            <button
              type="button"
              (click)="activeTab.set('reported listings'); currentPage.set(1)"
              class="flex items-center gap-2 border-b-2 px-1 py-4 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'reported listings'"
              [class.text-[#6254f3]]="activeTab() === 'reported listings'"
              [class.border-transparent]="activeTab() !== 'reported listings'"
              [class.text-[#8b8b8b]]="activeTab() !== 'reported listings'"
            >
              <ng-icon name="heroQueueList" class="text-[16px]"></ng-icon>
              Reported Listings
            </button>
          </div>
        </div>

        <section class="mt-6 overflow-hidden rounded-[20px] border border-[#e9e9e9] bg-white">
          <div class="flex justify-end border-b border-[#efefef] px-4 py-4">
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

          @if (activeTab() === 'reported sellers') {
            <div class="overflow-x-auto">
              <table class="min-w-[1120px] w-full table-fixed">
                <thead>
                  <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                    <th class="w-[190px] px-4 py-3 font-medium">Seller</th>
                    <th class="w-[180px] px-4 py-3 font-medium">Reported by</th>
                    <th class="w-[280px] px-4 py-3 font-medium">Reason</th>
                    <th class="w-[468px] px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>

                <tbody>
                  @for (record of paginatedSellerReports(); track record.id) {
                    <tr
                      class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                      (click)="openSellerReportDetails(record)"
                    >
                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.sellerAvatar"
                              [alt]="record.sellerName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            >
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.sellerName }}</p>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.sellerEmail }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.reportedByAvatar"
                              [alt]="record.reportedByName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            >
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.reportedByName }}</p>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.reportedByEmail }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-5 text-[15px] text-[#303030]">{{ record.reason }}</td>

                      <td class="px-4 py-5 text-[15px] leading-6 text-[#666666]">
                        <p class="line-clamp-3">{{ record.description }}</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <div class="overflow-x-auto">
              <table class="min-w-[1120px] w-full table-fixed">
                <thead>
                  <tr class="border-b border-[#efefef] bg-[#fafafa] text-left text-[13px] font-medium text-[#7d7d7d]">
                    <th class="w-[280px] px-4 py-3 font-medium">Listing</th>
                    <th class="w-[210px] px-4 py-3 font-medium">Seller</th>
                    <th class="w-[210px] px-4 py-3 font-medium">Reported by</th>
                    <th class="w-[420px] px-4 py-3 font-medium">Description</th>
                  </tr>
                </thead>

                <tbody>
                  @for (record of paginatedListingReports(); track record.id) {
                    <tr
                      class="cursor-pointer border-b border-[#efefef] transition-colors hover:bg-[#fcfcfc] last:border-b-0"
                      (click)="openListingReportDetails(record)"
                    >
                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-12 w-12 shrink-0 overflow-hidden rounded-[12px] bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.listingImage"
                              [alt]="record.listingTitle"
                              width="48"
                              height="48"
                              class="h-12 w-12 object-cover"
                            >
                          </div>
                          <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.listingTitle }}</p>
                        </div>
                      </td>

                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.sellerAvatar"
                              [alt]="record.sellerName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            >
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.sellerName }}</p>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.sellerEmail }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            <img
                              [ngSrc]="record.reportedByAvatar"
                              [alt]="record.reportedByName"
                              width="40"
                              height="40"
                              class="h-10 w-10 object-cover"
                            >
                          </div>
                          <div class="min-w-0">
                            <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.reportedByName }}</p>
                            <p class="truncate text-[13px] text-[#8b8b8b]">{{ record.reportedByEmail }}</p>
                          </div>
                        </div>
                      </td>

                      <td class="px-4 py-5 text-[15px] leading-6 text-[#666666]">
                        <p class="line-clamp-3">{{ record.description }}</p>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </section>

        <div class="mt-6 flex flex-col gap-4 text-[15px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between">
          <p>{{ visibleResultsCount() }} results</p>

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

      @if (selectedSellerReport()) {
        <app-admin-seller-report-details-modal
          [report]="selectedSellerReport()!"
          (close)="selectedSellerReport.set(null)"
        ></app-admin-seller-report-details-modal>
      }

      @if (selectedListingReport()) {
        <app-admin-listing-report-details-modal
          [report]="selectedListingReport()!"
          (close)="selectedListingReport.set(null)"
        ></app-admin-listing-report-details-modal>
      }
    </section>
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminReportsPageComponent {
  readonly activeTab = signal<ReportsTab>('reported sellers');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedSellerReport = signal<AdminSellerReportDetails | null>(null);
  readonly selectedListingReport = signal<AdminListingReportDetails | null>(null);

  readonly sellerReports = signal<SellerReportRecord[]>([
    {
      id: 'seller-report-1',
      sellerId: 'francis-uche',
      sellerName: 'Francis Uche',
      sellerEmail: 'uche@email.com',
      sellerAvatar: '/assets/images/fashion_menswear_hero.png',
      reportedById: 'mark-anthony',
      reportedByName: 'Mark Anthony',
      reportedByEmail: 'mark@email.com',
      reportedByAvatar: '/assets/images/product_watch_luxury.png',
      dateReported: '10 May, 2026',
      reason: 'Suspected scam or fraud',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      totalReports: 18,
    },
    {
      id: 'seller-report-2',
      sellerId: 'mark-anthony',
      sellerName: 'Mark Anthony',
      sellerEmail: 'mark@email.com',
      sellerAvatar: '/assets/images/product_watch_luxury.png',
      reportedById: 'mark-anthony',
      reportedByName: 'Mark Anthony',
      reportedByEmail: 'mark@email.com',
      reportedByAvatar: '/assets/images/product_watch_luxury.png',
      dateReported: '12 May, 2026',
      reason: 'Seller is unresponsive after payment',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      totalReports: 11,
    },
    {
      id: 'seller-report-3',
      sellerId: 'elle-adebisi',
      sellerName: 'Elle Adebisi',
      sellerEmail: 'elle@email.com',
      sellerAvatar: '/assets/images/product_sneakers_lifestyle.png',
      reportedById: 'david-akins',
      reportedByName: 'David Akins',
      reportedByEmail: 'david@email.com',
      reportedByAvatar: '/assets/images/fashion_menswear_hero.png',
      dateReported: '10 May, 2026',
      reason: 'Suspected scam or fraud',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 24,
    },
    {
      id: 'seller-report-4',
      sellerId: 'david-akins',
      sellerName: 'David Akins',
      sellerEmail: 'david@email.com',
      sellerAvatar: '/assets/images/product_keyboard_rgb.png',
      reportedById: 'elle-adebisi',
      reportedByName: 'Elle Adebisi',
      reportedByEmail: 'elle@email.com',
      reportedByAvatar: '/assets/images/product_sneakers_lifestyle.png',
      dateReported: '18 May, 2026',
      reason: 'Harassment or abusive behavior',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      totalReports: 9,
    },
    {
      id: 'seller-report-5',
      sellerId: 'bryan-odjede',
      sellerName: 'Bryan Odjede',
      sellerEmail: 'bryan@email.com',
      sellerAvatar: '/assets/images/fashion_menswear_hero.png',
      reportedById: 'francis-uche',
      reportedByName: 'Francis Uche',
      reportedByEmail: 'uche@email.com',
      reportedByAvatar: '/assets/images/fashion_menswear_hero.png',
      dateReported: '20 May, 2026',
      reason: 'Misleading product information',
      description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      totalReports: 6,
    },
  ]);

  readonly listingReports = signal<ListingReportRecord[]>([
    {
      id: 'listing-report-1',
      listingId: 'iphone-17-pro-max',
      listingTitle: 'Iphone 17 pro max',
      listingImage: '/assets/images/product_watch_luxury.png',
      sellerId: 'david-akins',
      sellerName: 'Francis Uche',
      sellerEmail: 'uche@email.com',
      sellerAvatar: '/assets/images/fashion_menswear_hero.png',
      reportedById: 'titi-ogunlesi',
      reportedByName: 'Titi Ogunlesi',
      reportedByEmail: 'titi@email.com',
      reportedByAvatar: '/assets/images/product_sneakers_lifestyle.png',
      dateReported: '10 May, 2026',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 6,
    },
    {
      id: 'listing-report-2',
      listingId: 'logitech-ergonomic-mouse',
      listingTitle: 'Logitech ergonomic mouse',
      listingImage: '/assets/images/product_sneakers.png',
      sellerId: 'mark-anthony',
      sellerName: 'Mark Anthony',
      sellerEmail: 'mark@email.com',
      sellerAvatar: '/assets/images/product_watch_luxury.png',
      reportedById: 'mark-anthony',
      reportedByName: 'Mark Anthony',
      reportedByEmail: 'mark@email.com',
      reportedByAvatar: '/assets/images/product_watch_luxury.png',
      dateReported: '10 May, 2026',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 4,
    },
    {
      id: 'listing-report-3',
      listingId: 'luxury-wristwatch',
      listingTitle: 'Luxury wristwatch',
      listingImage: '/assets/images/product_sneakers_lifestyle.png',
      sellerId: 'elle-adebisi',
      sellerName: 'Elle Adebisi',
      sellerEmail: 'elle@email.com',
      sellerAvatar: '/assets/images/product_sneakers_lifestyle.png',
      reportedById: 'elle-adebisi',
      reportedByName: 'Elle Adebisi',
      reportedByEmail: 'elle@email.com',
      reportedByAvatar: '/assets/images/product_sneakers_lifestyle.png',
      dateReported: '10 May, 2026',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 3,
    },
    {
      id: 'listing-report-4',
      listingId: 'luxury-wristwatch-2',
      listingTitle: 'Luxury Wristwatch',
      listingImage: '/assets/images/product_watch_luxury.png',
      sellerId: 'bryan-odjede',
      sellerName: 'Bryan Odjede',
      sellerEmail: 'bryan@email.com',
      sellerAvatar: '/assets/images/fashion_menswear_hero.png',
      reportedById: 'bryan-odjede',
      reportedByName: 'Bryan Odjede',
      reportedByEmail: 'bryan@email.com',
      reportedByAvatar: '/assets/images/fashion_menswear_hero.png',
      dateReported: '14 May, 2026',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 5,
    },
    {
      id: 'listing-report-5',
      listingId: 'sneakers',
      listingTitle: 'Sneakers',
      listingImage: '/assets/images/product_sneakers.png',
      sellerId: 'david-akins',
      sellerName: 'David Akins',
      sellerEmail: 'david@email.com',
      sellerAvatar: '/assets/images/product_keyboard_rgb.png',
      reportedById: 'david-akins',
      reportedByName: 'David Akins',
      reportedByEmail: 'david@email.com',
      reportedByAvatar: '/assets/images/product_keyboard_rgb.png',
      dateReported: '18 May, 2026',
      description: 'This item is no longer available, but the seller left it up for sale thereby misleading other buyers.',
      totalReports: 2,
    },
  ]);

  readonly filteredSellerReports = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.sellerReports().filter((record) =>
      query === ''
      || record.sellerName.toLowerCase().includes(query)
      || record.reportedByName.toLowerCase().includes(query)
      || record.reason.toLowerCase().includes(query)
    );
  });

  readonly filteredListingReports = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    return this.listingReports().filter((record) =>
      query === ''
      || record.listingTitle.toLowerCase().includes(query)
      || record.sellerName.toLowerCase().includes(query)
      || record.reportedByName.toLowerCase().includes(query)
      || record.description.toLowerCase().includes(query)
    );
  });

  readonly visibleResultsCount = computed(() =>
    this.activeTab() === 'reported sellers'
      ? this.paginatedSellerReports().length
      : this.paginatedListingReports().length
  );

  readonly totalPages = computed(() => {
    const totalItems =
      this.activeTab() === 'reported sellers'
        ? this.filteredSellerReports().length
        : this.filteredListingReports().length;

    return Math.max(1, Math.ceil(totalItems / this.pageSize));
  });

  readonly paginatedSellerReports = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredSellerReports().slice(start, start + this.pageSize);
  });

  readonly paginatedListingReports = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize;
    return this.filteredListingReports().slice(start, start + this.pageSize);
  });

  openSellerReportDetails(record: SellerReportRecord): void {
    this.selectedSellerReport.set({ ...record });
  }

  openListingReportDetails(record: ListingReportRecord): void {
    this.selectedListingReport.set({ ...record });
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
}
