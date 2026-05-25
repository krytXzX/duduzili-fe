import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { CustomDropdownComponent, type CustomDropdownOption } from '../../components/ui/custom-dropdown.component';
import {
  AdminListingsService,
  type AdminListingRecordResponse,
  type AdminListingsStatus,
  type AdminListingsSummaryFilter,
} from '../../services/admin-listings.service';

type AdminListingsCategory = 'all' | string;
type AdminListingsStore = 'all' | string;

interface AdminListingRecord {
  id: string;
  name: string;
  thumbnail: string | null;
  categoryKey: string;
  categoryLabel: string;
  priceWhole: string;
  priceDecimal: string;
  storeKey: string;
  storeName: string;
  storeAvatar: string | null;
  status: AdminListingsStatus;
  boosted: boolean;
}

@Component({
  selector: 'app-admin-listings-page',
  imports: [NgOptimizedImage, CustomDropdownComponent],
  host: { class: 'block h-full' },
  template: `
    <section class="flex h-full flex-col bg-white lg:hidden">
      <div class="px-5 pb-[120px] pt-6">
        <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Listings</h1>

        <div class="mt-6 flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          @for (card of mobileSummaryCards(); track card.value) {
            <button
              type="button"
              (click)="setSummaryFilter(card.value)"
              class="h-[75px] min-w-[152px] rounded-[10px] border px-[10px] text-left transition"
              [class.border-[1.5px]]="summaryStatusFilter() === card.value"
              [class.border-[#6453D9]]="summaryStatusFilter() === card.value"
              [class.bg-[#6453D9]/[0.05]]="summaryStatusFilter() === card.value"
              [class.border-transparent]="summaryStatusFilter() !== card.value"
              [class.bg-[#FAFAFA]]="summaryStatusFilter() !== card.value"
            >
              <p class="text-[12px] leading-none text-[#1A1B1D]/50">{{ card.label }}</p>
              <p class="mt-4 text-[20px] font-semibold leading-none text-[#1A1B1D]" [class.text-[#1A1B1D]/50]="summaryStatusFilter() !== card.value">
                {{ formatCount(card.amount) }}
              </p>
            </button>
          }
        </div>

        <div class="mt-6 flex items-center gap-3">
          <label class="relative block min-w-0 flex-1">
            <img
              ngSrc="/assets/icons/admin-listings/search.svg"
              width="16"
              height="16"
              alt=""
              class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearchQuery($any($event.target).value)"
              placeholder="Search"
              class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
            >
          </label>

          <app-custom-dropdown
            [options]="statusOptions"
            [value]="statusFilter()"
            ariaLabel="Filter listings by status"
            align="right"
            buttonClass="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white p-0"
            labelClass="sr-only"
            iconClass="text-[#1A1B1D]"
            menuClass="min-w-[170px]"
            (valueChange)="selectStatus($event)"
          ></app-custom-dropdown>
        </div>

        <div class="mt-4 flex flex-col gap-0">
          @if (mobileListings().length === 0) {
            <p class="py-8 text-[14px] font-medium text-[#8E9199]">No listings match the current filters.</p>
          } @else {
            @for (listing of mobileListings(); track listing.id) {
              <article class="border-b border-[#EBEBEB] py-3" (click)="openListing(listing.id)">
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="h-11 w-11 shrink-0 overflow-hidden rounded-[6.6px] border border-[#F0F0F0] bg-[#EFEFEF]">
                      @if (listing.thumbnail) {
                        <img [src]="listing.thumbnail" [alt]="listing.name" class="h-11 w-11 object-cover" />
                      }
                    </div>

                    <div class="min-w-0">
                      <h2 class="truncate text-[16px] font-medium leading-6 text-[#0D0D0D]/80">{{ listing.name }}</h2>
                      @if (listing.boosted) {
                        <div class="mt-1 inline-flex items-center gap-1 text-[12px] leading-4 text-[#7F8081]">
                          <span class="text-[#1A1B1D]">🚀</span>
                          <span>Promoted</span>
                        </div>
                      }
                    </div>
                  </div>

                  <span
                    class="inline-flex h-6 shrink-0 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                    [class.bg-[#F9F9F9]]="listing.status === 'available'"
                    [class.text-[#EE9C2E]]="listing.status === 'available'"
                    [class.bg-[#F3FBF9]]="listing.status === 'sold'"
                    [class.text-[#25AD32]]="listing.status === 'sold'"
                    [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                    [class.text-[#4787FE]]="listing.status === 'paused'"
                    [class.bg-[#FDF6FA]]="listing.status === 'suspended'"
                    [class.text-[#FF2524]]="listing.status === 'suspended'"
                  >
                    <img [ngSrc]="statusIcon(listing.status)" width="14" height="14" alt="" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {{ statusText(listing.status) }}
                  </span>
                </div>

                <dl class="mt-4 flex flex-col gap-3">
                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Store</dt>
                    <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ listing.storeName }}</dd>
                  </div>

                  <div class="flex items-center justify-between gap-4">
                    <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Amount</dt>
                    <dd class="text-right text-[14px] font-medium leading-5 text-[#1F1F1F]">
                      ₦{{ listing.priceWhole }}<span class="text-[#1F1F1F]/50">.{{ listing.priceDecimal }}</span>
                    </dd>
                  </div>
                </dl>
              </article>
            }
          }
        </div>
      </div>
    </section>

    <section class="hidden h-full flex-col bg-white lg:flex">
      <div class="flex h-full flex-col px-4 pb-6 pt-6 xl:px-6">
        <h1 class="text-[24px] font-medium leading-none text-[#0D0D0D]">Listings</h1>

        <div class="mt-6 flex items-center gap-3">
          @for (card of desktopSummaryCards(); track card.value) {
            <button
              type="button"
              (click)="setSummaryFilter(card.value)"
              class="h-[75px] flex-1 rounded-[10px] px-[10px] text-left transition"
              [class.border-[1.5px]]="summaryStatusFilter() === card.value"
              [class.border-[#6453D9]]="summaryStatusFilter() === card.value"
              [class.bg-[#6453D9]/[0.05]]="summaryStatusFilter() === card.value"
              [class.bg-[#FAFAFA]]="summaryStatusFilter() !== card.value"
            >
              <p class="text-[12px] leading-none text-[#1A1B1D]/50">{{ card.label }}</p>
              <p class="mt-4 text-[24px] font-semibold leading-none text-[#1A1B1D]" [class.text-[#1A1B1D]/50]="summaryStatusFilter() !== card.value">
                {{ formatCount(card.amount) }}
              </p>
            </button>
          }
        </div>

        <div class="mt-6 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
          <div class="flex items-center justify-between px-4 py-4">
            <div class="flex flex-wrap items-center gap-2">
              <app-custom-dropdown
                [options]="categoryOptions()"
                [value]="categoryFilter()"
                ariaLabel="Select listing category"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[#1A1B1D]/50"
                menuClass="min-w-[190px]"
                (valueChange)="selectCategory($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="storeOptions()"
                [value]="storeFilter()"
                ariaLabel="Select listing store"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[#1A1B1D]/50"
                menuClass="min-w-[210px]"
                (valueChange)="selectStore($event)"
              ></app-custom-dropdown>

              <app-custom-dropdown
                [options]="statusOptions"
                [value]="statusFilter()"
                ariaLabel="Select listing status"
                buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                iconClass="text-[#1A1B1D]/50"
                menuClass="min-w-[170px]"
                (valueChange)="selectStatus($event)"
              ></app-custom-dropdown>
            </div>

            <label class="relative block w-full max-w-[224px]">
              <img
                ngSrc="/assets/icons/admin-listings/search.svg"
                width="16"
                height="16"
                alt=""
                class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                [value]="searchQuery()"
                (input)="updateSearchQuery($any($event.target).value)"
                placeholder="Search"
                class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
              >
            </label>
          </div>

          <div class="min-h-0 flex-1 overflow-x-auto">
            <table class="w-full min-w-[1020px]">
              <thead class="border-y border-[#F4F4F4] bg-[#FAFAFA] text-left">
                <tr class="text-[12px] font-medium text-[#1A1B1D]/60">
                  <th class="px-4 py-[11px]">Name</th>
                  <th class="px-4 py-[11px]">Category</th>
                  <th class="px-4 py-[11px]">Price</th>
                  <th class="px-4 py-[11px]">Store/User</th>
                  <th class="px-4 py-[11px]">Status</th>
                  <th class="px-4 py-[11px]"></th>
                </tr>
              </thead>
              <tbody>
                @if (desktopListings().length === 0) {
                  <tr>
                    <td colspan="6" class="px-4 py-10 text-center text-[14px] font-medium text-[#8E9199]">
                      No listings match the current filters.
                    </td>
                  </tr>
                } @else {
                  @for (listing of desktopListings(); track listing.id) {
                    <tr class="cursor-pointer border-b border-[#F0F0F0] hover:bg-[#FCFCFD]" (click)="openListing(listing.id)">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="h-10 w-10 overflow-hidden rounded-[6px] border border-[#F0F0F0] bg-[#EFEFEF]">
                            @if (listing.thumbnail) {
                              <img [src]="listing.thumbnail" [alt]="listing.name" class="h-10 w-10 object-cover" />
                            }
                          </div>
                          <p class="text-[14px] font-medium leading-5 text-[#1A1B1D]">{{ listing.name }}</p>
                        </div>
                      </td>
                      <td class="px-4 py-3 text-[14px] leading-5 text-[#1A1B1D]">{{ listing.categoryLabel }}</td>
                      <td class="px-4 py-3 text-[14px] font-medium leading-5 text-[#1F1F1F]">
                        ₦{{ listing.priceWhole }}<span class="text-[#1F1F1F]/50">.{{ listing.priceDecimal }}</span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <div class="h-8 w-8 overflow-hidden rounded-full border-[1.73px] border-white bg-white">
                            @if (listing.storeAvatar) {
                              <img [src]="listing.storeAvatar" [alt]="listing.storeName" class="h-8 w-8 object-cover" />
                            }
                          </div>
                          <span class="text-[14px] leading-5 text-[#1A1B1D]">{{ listing.storeName }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                          [class.bg-[#F9F9F9]]="listing.status === 'available'"
                          [class.text-[#EE9C2E]]="listing.status === 'available'"
                          [class.bg-[#F3FBF9]]="listing.status === 'sold'"
                          [class.text-[#25AD32]]="listing.status === 'sold'"
                          [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                          [class.text-[#4787FE]]="listing.status === 'paused'"
                          [class.bg-[#FDF6FA]]="listing.status === 'suspended'"
                          [class.text-[#FF2524]]="listing.status === 'suspended'"
                        >
                          <img [ngSrc]="statusIcon(listing.status)" width="14" height="14" alt="" class="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          {{ statusText(listing.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-3 text-right">
                        @if (listing.boosted) {
                          <span class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[14px] shadow-[0_4px_8px_rgba(202,202,202,0.25)]">
                            🚀
                          </span>
                        }
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>

          <div class="flex items-center justify-between px-4 py-6">
            <p class="text-[16px] font-medium text-[#1A1B1D]">
              {{ totalResults() }}
              <span class="text-[#1A1B1D]/50"> results</span>
            </p>

            <div class="flex items-center gap-2 text-[16px] text-[#1C1F1D]/50">
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] disabled:opacity-40"
                (click)="goToPreviousPage()"
                [disabled]="!hasPreviousPage()"
              >
                <img ngSrc="/assets/icons/admin-user-details/chevron-left.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>
              <span class="flex h-8 min-w-8 items-center justify-center rounded-[8px] bg-white px-3 text-[14px] font-medium text-[#1A1B1D] shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)]">
                {{ currentPage() }}
              </span>
              <button
                type="button"
                class="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white shadow-[0_1px_2px_rgba(42,59,81,0.12),0_0_0_1px_rgba(18,55,105,0.08)] disabled:opacity-40"
                (click)="goToNextPage()"
                [disabled]="!hasNextPage()"
              >
                <img ngSrc="/assets/icons/admin-user-details/chevron-right.svg" width="16" height="16" alt="" class="h-4 w-4" aria-hidden="true" />
              </button>
              <span class="ml-2">of {{ totalPages() }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingsPageComponent {
  private readonly router = inject(Router);
  private readonly adminListingsService = inject(AdminListingsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly summaryStatusFilter = signal<AdminListingsSummaryFilter>('all');
  readonly categoryFilter = signal<AdminListingsCategory>('all');
  readonly storeFilter = signal<AdminListingsStore>('all');
  readonly statusFilter = signal<'all' | AdminListingsStatus>('all');
  readonly searchQuery = signal('');
  readonly listings = signal<AdminListingRecord[]>([]);
  readonly totalResults = signal(0);
  readonly currentPage = signal(1);
  readonly totalPages = signal(1);
  readonly hasNextPage = signal(false);
  readonly hasPreviousPage = signal(false);
  readonly counts = signal<Record<AdminListingsSummaryFilter, number>>({
    all: 0,
    available: 0,
    sold: 0,
    paused: 0,
    suspended: 0,
  });
  readonly availableCategories = signal<Array<{ slug: string; name: string }>>([]);
  readonly availableStores = signal<Array<{ id: string; store_name: string }>>([]);

  readonly categoryOptions = computed<readonly CustomDropdownOption<AdminListingsCategory>[]>(() => [
    { value: 'all', label: 'All categories' },
    ...this.availableCategories().map((category) => ({
      value: category.slug,
      label: category.name,
    })),
  ]);

  readonly storeOptions = computed<readonly CustomDropdownOption<AdminListingsStore>[]>(() => [
    { value: 'all', label: 'All stores' },
    ...this.availableStores().map((store) => ({
      value: store.id,
      label: store.store_name,
    })),
  ]);

  readonly statusOptions: readonly CustomDropdownOption<'all' | AdminListingsStatus>[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'paused', label: 'Paused' },
    { value: 'suspended', label: 'Suspended' },
  ];

  readonly desktopSummaryCards = computed(() => [
    { label: 'All', value: 'all' as const, amount: this.counts().all },
    { label: 'Available', value: 'available' as const, amount: this.counts().available },
    { label: 'Sold', value: 'sold' as const, amount: this.counts().sold },
    { label: 'Paused', value: 'paused' as const, amount: this.counts().paused },
  ]);

  readonly mobileSummaryCards = computed(() => [
    ...this.desktopSummaryCards(),
    { label: 'Suspended', value: 'suspended' as const, amount: this.counts().suspended },
  ]);

  readonly desktopListings = computed(() => this.listings());
  readonly mobileListings = computed(() => this.listings());

  private readonly requestQuery = computed(() => ({
    page: this.currentPage(),
    search: this.searchQuery(),
    category: this.categoryFilter(),
    store: this.storeFilter(),
    status: this.statusFilter() === 'all' ? this.summaryStatusFilter() : this.statusFilter(),
  }));

  constructor() {
    toObservable(this.requestQuery)
      .pipe(
        debounceTime(150),
        distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
        switchMap((query) => this.adminListingsService.getListings(query)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((response) => {
        this.listings.set(response.results.map((record) => this.mapRecord(record)));
        this.totalResults.set(response.count ?? response.results.length);
        this.hasNextPage.set(Boolean(response.next));
        this.hasPreviousPage.set(Boolean(response.previous));
        this.totalPages.set(Math.max(1, Math.ceil((response.count ?? response.results.length) / 5)));
        this.counts.set({
          all: response.counts?.all ?? 0,
          available: response.counts?.available ?? 0,
          sold: response.counts?.sold ?? 0,
          paused: response.counts?.paused ?? 0,
          suspended: response.counts?.suspended ?? 0,
        });
        this.availableCategories.set(response.categories ?? []);
        this.availableStores.set(response.stores ?? []);
      });
  }

  setSummaryFilter(value: AdminListingsSummaryFilter): void {
    this.summaryStatusFilter.set(value);
    if (value !== 'all') {
      this.statusFilter.set('all');
    }
    this.currentPage.set(1);
  }

  selectCategory(value: AdminListingsCategory): void {
    this.categoryFilter.set(value);
    this.currentPage.set(1);
  }

  selectStore(value: AdminListingsStore): void {
    this.storeFilter.set(value);
    this.currentPage.set(1);
  }

  selectStatus(value: 'all' | AdminListingsStatus): void {
    this.statusFilter.set(value);
    this.currentPage.set(1);
  }

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
    this.currentPage.set(1);
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage()) {
      this.currentPage.update((page) => Math.max(1, page - 1));
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage()) {
      this.currentPage.update((page) => page + 1);
    }
  }

  openListing(id: string): void {
    void this.router.navigate(['/admin/listings', id]);
  }

  statusText(status: AdminListingsStatus): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'paused':
        return 'Paused';
      case 'suspended':
        return 'Suspended';
    }
  }

  statusIcon(status: AdminListingsStatus): string {
    switch (status) {
      case 'available':
        return '/assets/icons/admin-listings/status-available.svg';
      case 'sold':
        return '/assets/icons/admin-listings/status-sold.svg';
      case 'paused':
        return '/assets/icons/admin-listings/status-paused.svg';
      case 'suspended':
        return '/assets/icons/admin-listings/status-suspended.svg';
    }
  }

  protected formatCount(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  private mapRecord(record: AdminListingRecordResponse): AdminListingRecord {
    const amount = record.price ?? '0';
    const [priceWhole, priceDecimal = '00'] = amount.split('.');
    return {
      id: record.id,
      name: record.title,
      thumbnail: record.thumbnail,
      categoryKey: record.category_slug ?? 'uncategorized',
      categoryLabel: record.category_label ?? 'Uncategorized',
      priceWhole: this.formatCount(Number(priceWhole.replace(/,/g, '')) || 0),
      priceDecimal,
      storeKey: record.id,
      storeName: record.store_name || 'Personal account',
      storeAvatar: record.store_avatar,
      status: this.mapStatus(record.status),
      boosted: record.is_promoted,
    };
  }

  private mapStatus(status: string): AdminListingsStatus {
    switch (status) {
      case 'published':
        return 'available';
      case 'sold':
        return 'sold';
      case 'paused':
        return 'paused';
      default:
        return 'suspended';
    }
  }
}
