import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import {
  heroArrowLeft,
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
import {
  AdminListingReportRecordResponse,
  AdminReportsService,
  AdminSellerReportRecordResponse,
  type AdminReportsTab,
} from '../../services/admin-reports.service';

type ReportsTab = 'reported sellers' | 'reported listings';

interface SellerReportRecord {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerAvatar: string | null;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByAvatar: string | null;
  dateReported: string;
  reason: string;
  description: string;
  totalReports: number;
}

interface ListingReportRecord {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string | null;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerAvatar: string | null;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByAvatar: string | null;
  dateReported: string;
  description: string;
  totalReports: number;
}

@Component({
  selector: 'app-admin-reports-page',
  imports: [RouterLink, NgIcon, AdminSellerReportDetailsModalComponent, AdminListingReportDetailsModalComponent],
  providers: [
    provideIcons({
      heroArrowLeft,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
      heroQueueList,
      heroUserCircle,
    }),
  ],
  template: `
    <section class="min-h-full rounded-[32px] bg-white">
      <div class="flex h-[54px] items-center px-5 lg:hidden">
        <a routerLink="/admin/more" class="flex items-center gap-2">
          <span class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3]">
            <ng-icon name="heroArrowLeft" class="text-[20px] text-black"></ng-icon>
          </span>
          <span class="text-[20px] font-semibold leading-[1.2] text-black">Reports</span>
        </a>
      </div>

      <header class="hidden border-b border-[#efefef] px-8 py-6 lg:block">
        <h1 class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">Reports</h1>
      </header>

      <div class="px-5 py-6 sm:px-6 lg:px-8 lg:py-6">
        <div class="mx-auto max-w-[350px] lg:mx-0 lg:max-w-none">
          <div class="border-b border-[#efefef]">
            <div class="flex items-center overflow-hidden">
            <button
              type="button"
              (click)="activeTab.set('reported sellers'); currentPage.set(1)"
              class="flex min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-3 py-3 text-[16px] font-medium leading-6 transition-colors lg:w-auto lg:flex-none lg:justify-start lg:gap-2 lg:px-1 lg:py-4 lg:text-[15px]"
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
              class="flex min-w-0 flex-1 items-center justify-center gap-1 border-b-2 px-3 py-3 text-[16px] font-medium leading-6 transition-colors lg:w-auto lg:flex-none lg:justify-start lg:gap-2 lg:px-1 lg:py-4 lg:text-[15px]"
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

          <section class="mt-4 bg-white lg:mt-6 lg:overflow-hidden lg:rounded-[20px] lg:border lg:border-[#e9e9e9]">
            <div class="flex justify-end py-3 lg:border-b lg:border-[#efefef] lg:px-4 lg:py-4">
              <label class="flex h-10 w-full items-center gap-2 rounded-full bg-[#fafafa] px-3 text-[#9c9c9c] lg:max-w-[226px] lg:px-4">
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
              <div class="hidden overflow-x-auto lg:block">
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
                            @if (record.sellerAvatar) {
                              <img
                                [src]="record.sellerAvatar"
                                [alt]="record.sellerName"
                                width="40"
                                height="40"
                                class="h-10 w-10 object-cover"
                              >
                            } @else {
                              <div class="flex h-10 w-10 items-center justify-center bg-[#E8EAED] text-[13px] font-semibold text-[#4B5563]">
                                {{ initialsFromLabel(record.sellerName) }}
                              </div>
                            }
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
                            @if (record.reportedByAvatar) {
                              <img
                                [src]="record.reportedByAvatar"
                                [alt]="record.reportedByName"
                                width="40"
                                height="40"
                                class="h-10 w-10 object-cover"
                              >
                            } @else {
                              <div class="flex h-10 w-10 items-center justify-center bg-[#E8EAED] text-[13px] font-semibold text-[#4B5563]">
                                {{ initialsFromLabel(record.reportedByName) }}
                              </div>
                            }
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

              <div class="lg:hidden">
                @for (record of paginatedSellerReports(); track record.id) {
                  <button
                    type="button"
                    class="block w-full border-b border-[#ebebeb] py-3 text-left last:border-b-0"
                    (click)="openSellerReportDetails(record)"
                  >
                    <div class="flex items-center gap-2">
                      <div class="flex h-[42px] w-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white">
                        @if (record.sellerAvatar) {
                          <img
                            [src]="record.sellerAvatar"
                            [alt]="record.sellerName"
                            width="42"
                            height="42"
                            class="h-[42px] w-[42px] rounded-full object-cover"
                          >
                        } @else {
                          <div class="flex h-[42px] w-[42px] items-center justify-center rounded-full bg-[#E8EAED] text-[13px] font-semibold text-[#4B5563]">
                            {{ initialsFromLabel(record.sellerName) }}
                          </div>
                        }
                      </div>
                      <h2 class="text-[16px] font-medium leading-5 text-[#1A1B1D]">{{ record.sellerName }}</h2>
                    </div>

                    <dl class="mt-4 flex flex-col gap-3">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reported by</dt>
                        <dd class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#0D0D0D]">
                          @if (record.reportedByAvatar) {
                            <img
                              [src]="record.reportedByAvatar"
                              [alt]="record.reportedByName"
                              width="24"
                              height="24"
                              class="h-6 w-6 rounded-full object-cover"
                            >
                          } @else {
                            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EAED] text-[10px] font-semibold text-[#4B5563]">
                              {{ initialsFromLabel(record.reportedByName) }}
                            </div>
                          }
                          <span>{{ record.reportedByName }}</span>
                        </dd>
                      </div>

                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reason</dt>
                        <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ record.reason }}</dd>
                      </div>

                      <div class="flex items-start justify-between gap-4">
                        <dt class="pt-px text-[14px] leading-5 text-[#1A1B1D]/50">Description</dt>
                        <dd class="max-w-[215px] text-right text-[12px] leading-4 text-[#0D0D0D]/40">{{ record.description }}</dd>
                      </div>
                    </dl>
                  </button>
                }
              </div>
            } @else {
              <div class="hidden overflow-x-auto lg:block">
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
                            @if (record.listingImage) {
                              <img
                                [src]="record.listingImage"
                                [alt]="record.listingTitle"
                                width="48"
                                height="48"
                                class="h-12 w-12 object-cover"
                              >
                            } @else {
                              <div class="flex h-12 w-12 items-center justify-center bg-[#E8EAED] text-[14px] font-semibold text-[#4B5563]">
                                {{ initialsFromLabel(record.listingTitle) }}
                              </div>
                            }
                          </div>
                          <p class="truncate text-[15px] font-medium text-[#222222]">{{ record.listingTitle }}</p>
                        </div>
                      </td>

                      <td class="px-4 py-5 align-top">
                        <div class="flex items-center gap-3">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                            @if (record.sellerAvatar) {
                              <img
                                [src]="record.sellerAvatar"
                                [alt]="record.sellerName"
                                width="40"
                                height="40"
                                class="h-10 w-10 object-cover"
                              >
                            } @else {
                              <div class="flex h-10 w-10 items-center justify-center bg-[#E8EAED] text-[13px] font-semibold text-[#4B5563]">
                                {{ initialsFromLabel(record.sellerName) }}
                              </div>
                            }
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
                            @if (record.reportedByAvatar) {
                              <img
                                [src]="record.reportedByAvatar"
                                [alt]="record.reportedByName"
                                width="40"
                                height="40"
                                class="h-10 w-10 object-cover"
                              >
                            } @else {
                              <div class="flex h-10 w-10 items-center justify-center bg-[#E8EAED] text-[13px] font-semibold text-[#4B5563]">
                                {{ initialsFromLabel(record.reportedByName) }}
                              </div>
                            }
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

              <div class="lg:hidden">
                @for (record of paginatedListingReports(); track record.id) {
                  <button
                    type="button"
                    class="block w-full border-b border-[#ebebeb] py-3 text-left last:border-b-0"
                    (click)="openListingReportDetails(record)"
                  >
                    <div class="flex items-center gap-2">
                      <div class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[6px] bg-[#efefef]">
                        @if (record.listingImage) {
                          <img
                            [src]="record.listingImage"
                            [alt]="record.listingTitle"
                            width="40"
                            height="40"
                            class="h-10 w-10 object-cover"
                          >
                        } @else {
                          <div class="flex h-10 w-10 items-center justify-center bg-[#E8EAED] text-[12px] font-semibold text-[#4B5563]">
                            {{ initialsFromLabel(record.listingTitle) }}
                          </div>
                        }
                      </div>
                      <h2 class="text-[16px] font-medium leading-5 text-[#1A1B1D]">{{ record.listingTitle }}</h2>
                    </div>

                    <dl class="mt-4 flex flex-col gap-3">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reported by</dt>
                        <dd class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#0D0D0D]">
                          @if (record.reportedByAvatar) {
                            <img
                              [src]="record.reportedByAvatar"
                              [alt]="record.reportedByName"
                              width="24"
                              height="24"
                              class="h-6 w-6 rounded-full object-cover"
                            >
                          } @else {
                            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EAED] text-[10px] font-semibold text-[#4B5563]">
                              {{ initialsFromLabel(record.reportedByName) }}
                            </div>
                          }
                          <span>{{ record.reportedByName }}</span>
                        </dd>
                      </div>

                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Store</dt>
                        <dd class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#0D0D0D]">
                          @if (record.sellerAvatar) {
                            <img
                              [src]="record.sellerAvatar"
                              [alt]="record.sellerName"
                              width="24"
                              height="24"
                              class="h-6 w-6 rounded-full object-cover"
                            >
                          } @else {
                            <div class="flex h-6 w-6 items-center justify-center rounded-full bg-[#E8EAED] text-[10px] font-semibold text-[#4B5563]">
                              {{ initialsFromLabel(record.sellerName) }}
                            </div>
                          }
                          <span>{{ record.sellerName }}</span>
                        </dd>
                      </div>

                      <div class="flex items-start justify-between gap-4">
                        <dt class="pt-px text-[14px] leading-5 text-[#1A1B1D]/50">Description</dt>
                        <dd class="max-w-[215px] text-right text-[12px] leading-4 text-[#0D0D0D]/60">{{ record.description }}</dd>
                      </div>
                    </dl>
                  </button>
                }
              </div>
            }
          </section>
        </div>

        <div class="mt-5 hidden flex-col gap-4 text-[14px] text-[#4d4d4d] sm:flex-row sm:items-center sm:justify-between sm:text-[15px] lg:flex">
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly adminReportsService = inject(AdminReportsService);

  readonly activeTab = signal<ReportsTab>('reported sellers');
  readonly searchQuery = signal('');
  readonly currentPage = signal(1);
  readonly pageSize = 5;
  readonly selectedSellerReport = signal<AdminSellerReportDetails | null>(null);
  readonly selectedListingReport = signal<AdminListingReportDetails | null>(null);
  readonly sellerReports = signal<SellerReportRecord[]>([]);
  readonly listingReports = signal<ListingReportRecord[]>([]);
  readonly totalResults = signal(0);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly sellerReportsCount = signal(0);
  readonly listingReportsCount = signal(0);

  readonly visibleResultsCount = computed(() =>
    this.activeTab() === 'reported sellers'
      ? this.paginatedSellerReports().length
      : this.paginatedListingReports().length
  );

  readonly totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalResults() / this.pageSize));
  });

  readonly filteredSellerReports = computed(() => this.sellerReports());
  readonly filteredListingReports = computed(() => this.listingReports());

  readonly paginatedSellerReports = computed(() => this.filteredSellerReports());

  readonly paginatedListingReports = computed(() => this.filteredListingReports());

  private readonly activeReportType = computed<AdminReportsTab>(() =>
    this.activeTab() === 'reported listings' ? 'listing' : 'seller'
  );

  private readonly reportsQuery = computed(() => ({
    type: this.activeReportType(),
    page: this.currentPage(),
    search: this.searchQuery().trim(),
  }));

  constructor() {
    toObservable(this.reportsQuery)
      .pipe(
        debounceTime(150),
        distinctUntilChanged((previous, current) =>
          previous.type === current.type
          && previous.page === current.page
          && previous.search === current.search
        ),
        switchMap((query) => this.adminReportsService.getReports(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.totalResults.set(response.count ?? 0);
        this.hasNextPage.set(response.next !== null);
        this.hasPreviousPage.set(response.previous !== null);
        this.sellerReportsCount.set(response.counts?.reported_sellers ?? 0);
        this.listingReportsCount.set(response.counts?.reported_listings ?? 0);

        if (response.type === 'listing') {
          this.listingReports.set(
            (response.results as AdminListingReportRecordResponse[]).map((record) =>
              this.mapListingReport(record)
            )
          );
          this.sellerReports.set([]);
        } else {
          this.sellerReports.set(
            (response.results as AdminSellerReportRecordResponse[]).map((record) =>
              this.mapSellerReport(record)
            )
          );
          this.listingReports.set([]);
        }
      });
  }

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

  private mapSellerReport(record: AdminSellerReportRecordResponse): SellerReportRecord {
    return {
      id: record.id,
      sellerId: String(record.seller_id),
      sellerName: record.seller_name,
      sellerEmail: record.seller_email,
      sellerAvatar: record.seller_avatar,
      reportedById: String(record.reported_by_id),
      reportedByName: record.reported_by_name,
      reportedByEmail: record.reported_by_email,
      reportedByAvatar: record.reported_by_avatar,
      dateReported: this.formatDate(record.date_reported),
      reason: record.reason,
      description: record.description,
      totalReports: record.total_reports,
    };
  }

  private mapListingReport(record: AdminListingReportRecordResponse): ListingReportRecord {
    return {
      id: record.id,
      listingId: String(record.listing_id),
      listingTitle: record.listing_title,
      listingImage: record.listing_image,
      sellerId: String(record.seller_id),
      sellerName: record.seller_name,
      sellerEmail: record.seller_email,
      sellerAvatar: record.seller_avatar,
      reportedById: String(record.reported_by_id),
      reportedByName: record.reported_by_name,
      reportedByEmail: record.reported_by_email,
      reportedByAvatar: record.reported_by_avatar,
      dateReported: this.formatDate(record.date_reported),
      description: record.description,
      totalReports: record.total_reports,
    };
  }

  private formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  protected initialsFromLabel(label: string): string {
    const parts = label
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2);

    if (parts.length === 0) {
      return 'NA';
    }

    return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
  }
}
