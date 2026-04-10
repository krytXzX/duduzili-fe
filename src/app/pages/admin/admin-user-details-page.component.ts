import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { StoreCardComponent, type Store } from '../../components/stores/store-card.component';
import {
  BannerPromotionCardComponent,
  type BannerPromotionCardData,
} from '../../components/ads/banner-promotion-card.component';
import {
  heroCalendarDays,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroEllipsisHorizontal,
  heroMagnifyingGlass,
} from '@ng-icons/heroicons/outline';

type AdminUserDetailStatus = 'active' | 'suspended';
type AdminManagedListingStatus = 'available' | 'sold' | 'draft' | 'paused';
type AdminManagedListingCategory =
  | 'all'
  | 'phones-laptops'
  | 'electronics'
  | 'mens-fashion'
  | 'womens-fashion'
  | 'automobiles';
type AdminManagedListingStore =
  | 'all'
  | 'vine'
  | 'eden'
  | 'amazing'
  | 'personal';
type AdminManagedAdStatus = 'active' | 'paused' | 'expired';
type AdminManagedBannerStatus =
  | 'active'
  | 'paused'
  | 'pending approval'
  | 'declined'
  | 'expired';
type AdminManagedAdsFilterStatus =
  | 'active'
  | 'paused'
  | 'pending approval'
  | 'declined'
  | 'expired';
type AdminManagedAdPlacement = 'promoted listings' | 'store promotions' | 'banner ads';
type AdminManagedAdCategory = 'other listings' | 'automobile listings' | 'property listings';
type AdminUserTransactionStatus = 'successful' | 'failed';
type AdminUserTransactionType = 'all' | 'wallet funding' | 'subscription payment';
type AdminUserTransactionDate = 'all' | 'feb-2025' | 'mar-2025';
type AdminUserReportTab = 'profile' | 'listing';
type AdminUserDetailsTab =
  | 'overview'
  | 'listings'
  | 'stores'
  | 'ads'
  | 'transactions'
  | 'reviews'
  | 'reports'
  | 'activities';

interface UserDetail {
  id: string;
  name: string;
  email: string;
  avatarInitials: string;
  avatarBackground: string;
  status: AdminUserDetailStatus;
  dateJoined: string;
  lastSignedIn: string;
  phoneNumber: string;
  totalSoldItems: string;
  growthLabel: string;
  mostViewedListingTitle: string;
  mostViewedListingImage: string;
  mostViewedListingCount: string;
  distribution: Array<{ label: string; value: string; color: string }>;
}

interface AdminManagedListing {
  id: string;
  name: string;
  thumbnail: string;
  categoryKey: Exclude<AdminManagedListingCategory, 'all'>;
  categoryLabel: string;
  price: string;
  storeKey: Exclude<AdminManagedListingStore, 'all'>;
  storeName: string;
  storeBackground: string;
  status: AdminManagedListingStatus;
  boosted: boolean;
}

interface AdminManagedPromotionListing {
  id: string;
  title: string;
  price: string;
  views: string;
  clicks: string;
  messages: string;
  calls: string;
  expiresOn: string;
  status: AdminManagedAdStatus;
  placement: AdminManagedAdPlacement;
  category: AdminManagedAdCategory;
  image: string;
}

interface AdminManagedBannerAd extends BannerPromotionCardData {
  status: AdminManagedBannerStatus;
  placement: 'banner ads';
}

interface AdminManagedStorePromotion {
  id: string;
  name: string;
  logo: string;
  banner: string;
  location: string;
  impressions: string;
  clicks: string;
  messages: string;
  expiresOn: string;
  status: AdminManagedAdStatus;
}

interface AdminUserTransaction {
  id: string;
  amount: string;
  type: Exclude<AdminUserTransactionType, 'all'>;
  date: string;
  dateKey: AdminUserTransactionDate;
  status: AdminUserTransactionStatus;
}

interface AdminUserReviewTag {
  label: string;
  count: number;
}

interface AdminUserReview {
  author: string;
  avatar: string;
  rating: number;
  date: string;
  text: string;
  images?: string[];
}

interface AdminProfileReport {
  id: string;
  storeName: string;
  storeLogo: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar: string;
  reason: string;
  description: string;
}

interface AdminListingReport {
  id: string;
  listingName: string;
  listingImage: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar: string;
  reason: string;
  description: string;
}

interface AdminUserActivity {
  id: string;
  kind: 'message' | 'offer' | 'callback' | 'call' | 'wishlist' | 'view' | 'published';
  title: string;
  detail?: string;
  actorName: string;
  actorInitials: string;
  actorBackground: string;
  timestamp: string;
}

interface AdminUserActivityMonthGroup {
  label: string;
  items: AdminUserActivity[];
}

interface AdminUserActivityYearGroup {
  year: string;
  groups: AdminUserActivityMonthGroup[];
}

@Component({
  selector: 'app-admin-user-details-page',
  imports: [RouterLink, NgIcon, StoreCardComponent, BannerPromotionCardComponent],
  providers: [
    provideIcons({
      heroCalendarDays,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroEllipsisHorizontal,
      heroMagnifyingGlass,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="px-6 py-6 sm:px-8">
        <div class="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#A5A7AE]">
          <a routerLink="/admin/users" class="transition hover:text-[#6B5CF0]">Users</a>
          <span>/</span>
          <span class="text-[#6A6D75]">User details</span>
        </div>

        <div class="mt-6 flex flex-col gap-5 border-b border-[#EEF0F4] pb-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="flex min-w-0 items-start gap-4">
            <span
              class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-[#1A1C21]"
              [style.background]="user().avatarBackground"
            >
              {{ user().avatarInitials }}
            </span>

            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#1A1C21]">{{ user().name }}</h1>
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold"
                  [class.bg-[#EDF9EF]]="user().status === 'active'"
                  [class.text-[#2FB04A]]="user().status === 'active'"
                  [class.bg-[#FFF0F0]]="user().status === 'suspended'"
                  [class.text-[#FF4B4B]]="user().status === 'suspended'"
                >
                  <span
                    class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                    [class.bg-[#2FB04A]]="user().status === 'active'"
                    [class.bg-[#FF4B4B]]="user().status === 'suspended'"
                  >
                    {{ user().status === 'active' ? '✓' : '!' }}
                  </span>
                  {{ user().status === 'active' ? 'Active' : 'Suspended' }}
                </span>
              </div>
              <p class="mt-1 text-[16px] font-medium text-[#8E9199]">{{ user().email }}</p>
            </div>
          </div>

          <div class="relative flex items-center gap-3 self-start">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-[#E7EAF0] bg-white px-5 py-3 text-[14px] font-medium text-[#2A2D34] transition hover:bg-[#FAFAFC]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#555A64]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10.75 3.5a.75.75 0 00-1.5 0v7.19L6.53 7.97a.75.75 0 10-1.06 1.06l4 4a.75.75 0 001.06 0l4-4a.75.75 0 10-1.06-1.06l-2.72 2.72V3.5z"/><path d="M4.75 14a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z"/>
              </svg>
              Download data
            </button>

            <button
              type="button"
              (click)="isUserActionsOpen.set(!isUserActionsOpen())"
              class="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7EAF0] bg-white text-[#6A6D75] transition hover:bg-[#FAFAFC]"
              aria-label="More actions"
              [attr.aria-expanded]="isUserActionsOpen()"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-lg"></ng-icon>
            </button>

            @if (isUserActionsOpen()) {
              <div
                class="absolute right-0 top-[calc(100%+0.5rem)] z-20 min-w-[180px] overflow-hidden rounded-[18px] border border-[#ECEEF3] bg-white py-2 shadow-[0_20px_40px_-28px_rgba(17,24,39,0.45)]"
              >
                <button
                  type="button"
                  (click)="deactivateUser()"
                  class="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] font-medium text-[#FF4B4B] transition hover:bg-[#FFF7F7]"
                >
                  <span class="text-[15px]">⊘</span>
                  Deactivate user
                </button>
                <button
                  type="button"
                  (click)="banUser()"
                  class="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] font-medium text-[#FF4B4B] transition hover:bg-[#FFF7F7]"
                >
                  <span class="text-[15px]">🗑</span>
                  Ban user
                </button>
              </div>
            }
          </div>
        </div>

        <div class="mt-5 flex flex-wrap items-center gap-6 border-b border-[#EEF0F4]">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              class="relative pb-4 text-[14px] font-medium transition"
              [class.text-[#6B5CF0]]="activeTab() === tab.id"
              [class.text-[#8E9199]]="activeTab() !== tab.id"
              (click)="activeTab.set(tab.id)"
            >
              <span class="inline-flex items-center gap-2">
                <span class="text-[16px]">{{ tab.icon }}</span>
                {{ tab.label }}
              </span>
              @if (activeTab() === tab.id) {
                <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#6B5CF0]"></span>
              }
            </button>
          }
        </div>
      </div>

      <div class="flex-1 overflow-y-auto px-4 pb-6 sm:px-8">
        @if (activeTab() === 'overview') {
          <div class="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div class="space-y-4">
              <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
                <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p class="text-[13px] font-semibold text-[#A2A7B0]">Total sold items</p>
                    <h2 class="mt-1 text-[24px] font-semibold tracking-tight text-[#1A1C21]">{{ user().totalSoldItems }}</h2>
                    <span class="mt-3 inline-flex rounded-full bg-[#EBF8EF] px-3 py-1 text-[12px] font-semibold text-[#2FB04A]">
                      {{ user().growthLabel }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="inline-flex items-center gap-2 self-start rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[14px] font-medium text-[#3F444C]"
                  >
                    <ng-icon name="heroCalendarDays" class="text-base"></ng-icon>
                    Last 7 days
                    <ng-icon name="heroChevronDown" class="text-sm text-[#9BA0AA]"></ng-icon>
                  </button>
                </div>

                <div class="mt-8">
                  <svg viewBox="0 0 900 320" class="h-auto w-full overflow-visible">
                    <g fill="#A8AEB8" font-size="12" font-weight="500">
                      <text x="8" y="258">0</text>
                      <text x="0" y="178">250</text>
                      <text x="0" y="98">500</text>
                    </g>

                    @for (month of months; track month.label) {
                      <g>
                        <rect
                          [attr.x]="month.x"
                          [attr.y]="240 - month.height"
                          width="38"
                          [attr.height]="month.height"
                          rx="6"
                          [attr.fill]="month.highlight ? '#7A6AE6' : '#DCD9F7'"
                          [attr.opacity]="month.highlight ? '1' : '0.75'"
                        ></rect>
                        <text
                          [attr.x]="month.x + 9"
                          y="274"
                          fill="#A8AEB8"
                          font-size="12"
                          font-weight="500"
                        >
                          {{ month.label }}
                        </text>
                      </g>
                    }

                    <g transform="translate(286,78)">
                      <rect width="136" height="32" rx="10" fill="#090909"></rect>
                      <circle cx="14" cy="16" r="3" fill="#7A6AE6"></circle>
                      <text x="22" y="20" fill="#FFFFFF" font-size="12">Aug 2025</text>
                      <text x="102" y="20" fill="#FFFFFF" font-size="12">128</text>
                    </g>
                  </svg>
                </div>
              </section>

              <div class="grid gap-4 lg:grid-cols-2">
                <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
                  <p class="text-[13px] font-semibold text-[#A2A7B0]">Most viewed listing</p>

                  <div class="mt-6 flex flex-col items-center text-center">
                    <div class="overflow-hidden rounded-[18px] border border-[#ECEEF3] bg-white shadow-[0_14px_28px_-22px_rgba(17,24,39,0.35)]">
                      <img
                        [src]="user().mostViewedListingImage"
                        [alt]="user().mostViewedListingTitle"
                        class="h-[112px] w-[82px] object-cover"
                      >
                    </div>

                    <p class="mt-6 text-[16px] font-medium leading-7 text-[#6C717B]">This item has been viewed</p>
                    <p class="text-[20px] font-semibold text-[#1A1C21]">{{ user().mostViewedListingCount }} times</p>
                  </div>
                </section>

                <section class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6">
                  <p class="text-[13px] font-semibold text-[#A2A7B0]">Listings distribution</p>

                  <div class="mt-5 overflow-hidden rounded-full bg-[#F2F4F8]">
                    <div class="flex h-1.5 w-full">
                      @for (item of user().distribution; track item.label) {
                        <span class="h-full" [style.background]="item.color" [style.width.%]="distributionWidth(item.value)"></span>
                      }
                    </div>
                  </div>

                  <div class="mt-6 space-y-5">
                    @for (item of user().distribution; track item.label) {
                      <div class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                          <span class="h-3 w-3 rounded-full" [style.background]="item.color"></span>
                          <span class="text-[14px] font-medium text-[#7A808A]">{{ item.label }}</span>
                        </div>
                        <span class="text-[14px] font-semibold text-[#454A53]">{{ item.value }}</span>
                      </div>
                    }
                  </div>

                  <button type="button" class="mt-7 text-[15px] font-semibold text-[#6B5CF0] underline underline-offset-2">
                    View more
                  </button>
                </section>
              </div>
            </div>

            <aside class="border-t border-[#EEF0F4] pt-4 xl:border-l xl:border-t-0 xl:pt-0 xl:pl-8">
              <div class="border-b border-[#EEF0F4] pb-4">
                <h2 class="flex items-center gap-2 text-[16px] font-semibold text-[#1A1C21]">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#555A64]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 3.5a3 3 0 110 6 3 3 0 010-6zM4.75 15a5.25 5.25 0 1110.5 0 .75.75 0 01-1.5 0 3.75 3.75 0 10-7.5 0 .75.75 0 01-1.5 0z"/>
                  </svg>
                  Details
                </h2>
              </div>

              <dl class="grid grid-cols-[auto_1fr] gap-x-8 gap-y-5 pt-4 text-[15px]">
                <dt class="font-medium text-[#8E9199]">Date joined</dt>
                <dd class="font-medium text-[#1A1C21]">{{ user().dateJoined }}</dd>

                <dt class="font-medium text-[#8E9199]">Last signed in</dt>
                <dd class="font-medium text-[#1A1C21]">{{ user().lastSignedIn }}</dd>

                <dt class="font-medium text-[#8E9199]">Name</dt>
                <dd class="font-medium text-[#1A1C21]">{{ user().name }}</dd>

                <dt class="font-medium text-[#8E9199]">Email</dt>
                <dd class="font-medium text-[#1A1C21]">{{ user().email }}</dd>

                <dt class="font-medium text-[#8E9199]">Phone number</dt>
                <dd class="font-medium text-[#1A1C21]">{{ user().phoneNumber }}</dd>
              </dl>
            </aside>
          </div>
        } @else if (activeTab() === 'listings') {
          <div class="flex flex-col overflow-hidden rounded-[28px] border border-[#ECEEF3] bg-white shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)]">
            <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div class="flex flex-wrap gap-3">
                <button
                  type="button"
                  (click)="cycleListingsCategoryFilter()"
                  class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                >
                  {{ listingsCategoryLabel() }}
                  <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                </button>

                <button
                  type="button"
                  (click)="cycleListingsStoreFilter()"
                  class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                >
                  {{ listingsStoreLabel() }}
                  <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                </button>

                <button
                  type="button"
                  (click)="cycleListingsStatusFilter()"
                  class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                >
                  {{ listingsStatusLabel() }}
                  <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                </button>
              </div>

              <label class="relative block w-full max-w-[250px]">
                <ng-icon
                  name="heroMagnifyingGlass"
                  class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
                ></ng-icon>
                <input
                  type="text"
                  [value]="listingsSearchQuery()"
                  (input)="updateListingsSearchQuery($any($event.target).value)"
                  placeholder="Search"
                  class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
                >
              </label>
            </div>

            <div class="overflow-x-auto">
              <table class="w-full min-w-[1000px]">
                <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                  <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                    <th class="px-8 py-4">Name</th>
                    <th class="px-4 py-4">Category</th>
                    <th class="px-4 py-4">Price</th>
                    <th class="px-4 py-4">Store</th>
                    <th class="px-4 py-4">Status</th>
                    <th class="px-4 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  @for (listing of visibleListings(); track listing.id) {
                    <tr class="border-b border-[#F4F5F7] transition hover:bg-[#FAFAFC] last:border-b-0">
                      <td class="px-8 py-5">
                        <div class="flex items-center gap-3">
                          <img
                            [src]="listing.thumbnail"
                            [alt]="listing.name"
                            class="h-10 w-10 rounded-[10px] border border-[#ECEEF3] object-cover"
                          >
                          <p class="text-[14px] font-semibold text-[#2A2D34]">{{ listing.name }}</p>
                        </div>
                      </td>
                      <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ listing.categoryLabel }}</td>
                      <td class="px-4 py-5 text-[14px] font-semibold text-[#2A2D34]">₦{{ listing.price }}</td>
                      <td class="px-4 py-5">
                        <div class="flex items-center gap-3">
                          <span
                            class="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                            [style.background]="listing.storeBackground"
                          >
                            {{ storeInitials(listing.storeName) }}
                          </span>
                          <span class="text-[14px] font-medium text-[#3F444C]">{{ listing.storeName }}</span>
                        </div>
                      </td>
                      <td class="px-4 py-5">
                        <span
                          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                          [class.bg-[#FFF5E8]]="listing.status === 'available'"
                          [class.text-[#FF9800]]="listing.status === 'available'"
                          [class.bg-[#EDF9EF]]="listing.status === 'sold'"
                          [class.text-[#2FB04A]]="listing.status === 'sold'"
                          [class.bg-[#F2F4F8]]="listing.status === 'draft'"
                          [class.text-[#7A808A]]="listing.status === 'draft'"
                          [class.bg-[#EEF4FF]]="listing.status === 'paused'"
                          [class.text-[#4C86F5]]="listing.status === 'paused'"
                        >
                          <span
                            class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                            [class.bg-[#FF9800]]="listing.status === 'available'"
                            [class.bg-[#2FB04A]]="listing.status === 'sold'"
                            [class.bg-[#7A808A]]="listing.status === 'draft'"
                            [class.bg-[#4C86F5]]="listing.status === 'paused'"
                          >
                            {{ listingStatusMark(listing.status) }}
                          </span>
                          {{ listingStatusLabelText(listing.status) }}
                        </span>
                      </td>
                      <td class="px-4 py-5 text-right">
                        @if (listing.boosted) {
                          <button
                            type="button"
                            class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[15px] shadow-[0_8px_16px_-14px_rgba(17,24,39,0.35)] transition hover:bg-[#FAFAFC]"
                            aria-label="Boosted listing"
                          >
                            🚀
                          </button>
                        } @else {
                          <span class="inline-flex h-9 w-9"></span>
                        }
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mt-auto flex items-center justify-between px-4 py-6 sm:px-8">
              <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleListings().length }} results</p>

              <div class="flex items-center gap-2 text-[14px] font-medium text-[#B2B7C0]">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                >
                  <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                </button>
                <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                  1
                </span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                >
                  <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                </button>
                <span class="ml-2">of 1</span>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'stores') {
          <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            @for (store of visibleStores(); track store.id) {
              <div class="relative">
                @if (store.activeUntil) {
                  <span
                    class="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[14px] shadow-[0_10px_18px_-14px_rgba(17,24,39,0.5)]"
                    aria-label="Boosted store"
                  >
                    🚀
                  </span>
                }

                <app-store-card [store]="store" [showFavorite]="false"></app-store-card>
              </div>
            }
          </div>
        } @else if (activeTab() === 'ads') {
          <div>
            <section class="rounded-[28px] border border-[#ECEEF3] bg-[#F6F4FF] px-6 py-6 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)]">
              <div class="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p class="text-[15px] font-medium text-[#2A2D34]">Pro</p>
                  <p class="mt-4 text-[18px] font-semibold text-[#9A9DA5]">
                    <span class="text-[30px] font-semibold tracking-[-0.04em] text-[#1A1C21]">₦1,000</span>/week
                  </p>
                  <p class="mt-1 text-[14px] font-medium text-[#555A64]">Expires on: 23 December, 2027</p>
                </div>

                <div class="flex items-start justify-between gap-4 lg:min-w-[240px]">
                  <span class="rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-[#6B5CF0] shadow-[0_10px_24px_-20px_rgba(17,24,39,0.5)]">
                    Current plan
                  </span>
                  <span class="text-[72px] leading-none">📣</span>
                </div>
              </div>
            </section>

            <div class="mt-6 flex flex-wrap items-center gap-8">
              @for (placement of adPlacementTabs; track placement.value) {
                <button
                  type="button"
                  (click)="activeAdsPlacement.set(placement.value)"
                  class="text-[18px] font-medium tracking-[-0.03em] transition"
                  [class.text-[#1F2024]]="activeAdsPlacement() === placement.value"
                  [class.text-[#989DA7]]="activeAdsPlacement() !== placement.value"
                >
                  {{ placement.label }}
                </button>
              }
            </div>

            <div class="mt-8 flex flex-wrap gap-3">
              @for (status of adStatusTabs(); track status.value) {
                <button
                  type="button"
                  (click)="activeAdsStatus.set(status.value)"
                  class="rounded-full px-4 py-2 text-[13px] font-semibold transition"
                  [class.bg-[#1F2024]]="activeAdsStatus() === status.value"
                  [class.text-white]="activeAdsStatus() === status.value"
                  [class.bg-[#F4F4F6]]="activeAdsStatus() !== status.value"
                  [class.text-[#4B4F57]]="activeAdsStatus() !== status.value"
                >
                  {{ status.label }}({{ countUserAdsByStatus(status.value) }})
                </button>
              }
            </div>

            @if (activeAdsPlacement() === 'banner ads') {
              <section class="mt-8">
                <div class="grid max-w-4xl gap-5 xl:grid-cols-2">
                  @for (banner of visibleBannerAds(); track banner.id) {
                    <app-banner-promotion-card [card]="banner"></app-banner-promotion-card>
                  }
                </div>
              </section>
            } @else if (activeAdsPlacement() === 'store promotions') {
              <section class="mt-8">
                <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                  @for (store of visiblePromotedStores(); track store.id) {
                    <article class="overflow-hidden rounded-[22px] border border-[#ECEEF3] bg-white shadow-[0_12px_24px_-24px_rgba(17,24,39,0.55)]">
                      <div class="relative m-1.5 overflow-hidden rounded-[20px]">
                        <img [src]="store.banner" [alt]="store.name" class="h-[170px] w-full object-cover">

                        <div class="absolute left-3 top-3 rounded-full bg-[#F2F5A7] px-2.5 py-1 text-[10px] font-bold text-[#6A6B1F]">
                          Active until: {{ store.expiresOn }}
                        </div>

                        <div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"></div>

                        <div class="absolute bottom-4 left-4 flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_14px_26px_-18px_rgba(17,24,39,0.45)]">
                          <img [src]="store.logo" [alt]="store.name" class="h-full w-full object-cover">
                        </div>
                      </div>

                      <div class="px-4 pb-4 pt-1">
                        <div class="flex items-start gap-2">
                          <div class="min-w-0 flex-1">
                            <h3 class="truncate text-[13px] font-semibold text-[#2A2D34]">
                              {{ store.name }}
                              <span class="ml-1 text-[#5F55E8]">✦</span>
                            </h3>
                            <p class="mt-1 text-[13px] font-medium text-[#8E9199]">{{ store.location }}</p>
                          </div>
                        </div>

                        <div class="mt-4 flex items-center gap-4 border-t border-[#F1F2F4] pt-3 text-[12px] font-medium text-[#A1A6AF]">
                          <span class="inline-flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-[#C7CBD3]"></span>
                            {{ store.impressions }}
                          </span>
                          <span class="inline-flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-[#C7CBD3]"></span>
                            {{ store.clicks }}
                          </span>
                          <span class="inline-flex items-center gap-1.5">
                            <span class="h-2 w-2 rounded-full bg-[#C7CBD3]"></span>
                            {{ store.messages }}
                          </span>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              </section>
            } @else {
              @for (section of visiblePromotedListingSections(); track section.category) {
                <section class="mt-8">
                  <div class="mb-4 flex items-center justify-between">
                    <h2 class="text-[18px] font-semibold tracking-[-0.03em] text-[#23262D]">{{ section.label }}</h2>

                    <div class="flex items-center gap-3">
                      <button type="button" class="text-[13px] font-semibold text-[#30343B]">
                        View all (3,341)
                      </button>
                      <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                      >
                        <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                      </button>
                      <button
                        type="button"
                        class="flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF3] text-[#A0A4AD] transition hover:bg-[#F8F8FA]"
                      >
                        <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                      </button>
                    </div>
                  </div>

                  <div class="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
                    @for (ad of section.items; track ad.id) {
                      <article class="overflow-hidden rounded-[20px] border border-[#ECEEF3] bg-white shadow-[0_12px_24px_-24px_rgba(17,24,39,0.55)]">
                        <div class="relative m-2 aspect-[0.92] overflow-hidden rounded-[18px]">
                          <img [src]="ad.image" [alt]="ad.title" class="h-full w-full object-cover">
                          <div class="absolute left-2 top-2 rounded-full bg-[#F2F5A7] px-2 py-1 text-[10px] font-bold text-[#6A6B1F]">
                            Active until: {{ ad.expiresOn }}
                          </div>

                          @if (section.category === 'other listings' && ($first || $last) && section.items.length > 1) {
                            <button
                              type="button"
                              class="absolute left-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#7F838C] shadow-sm"
                            >
                              <ng-icon name="heroChevronLeft" class="text-xs"></ng-icon>
                            </button>
                            <button
                              type="button"
                              class="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#7F838C] shadow-sm"
                            >
                              <ng-icon name="heroChevronRight" class="text-xs"></ng-icon>
                            </button>
                          }
                        </div>

                        <div class="px-3 pb-3">
                          <h3 class="line-clamp-1 text-[13px] font-medium text-[#2A2D34]">{{ ad.title }}</h3>
                          <p class="mt-1 text-[15px] font-semibold text-[#2A2D34]">{{ ad.price }}</p>

                          <div class="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-[#ADB1B9]">
                            <span class="inline-flex items-center gap-1">
                              <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                              {{ ad.views }}
                            </span>
                            <span class="inline-flex items-center gap-1">
                              <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                              {{ ad.clicks }}
                            </span>
                            <span class="inline-flex items-center gap-1">
                              <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                              {{ ad.messages }}
                            </span>
                            <span class="inline-flex items-center gap-1">
                              <span class="h-1.5 w-1.5 rounded-full bg-[#D2D6DE]"></span>
                              {{ ad.calls }}
                            </span>
                          </div>
                        </div>
                      </article>
                    }
                  </div>
                </section>
              }
            }
            </div>
        } @else if (activeTab() === 'transactions') {
          <div>
            <section>
              <h2 class="max-w-[460px] text-[34px] font-medium leading-[1.2] tracking-tight text-[#2A2D34]">
                They currently have
                <span class="font-black text-[#8E939D]">₦0.00</span>
                in their wallet
              </h2>
            </section>

            <section class="mt-12">
              <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#1A1C21]">Transaction history</h3>

              <div class="mt-4 overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
                <div class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div class="flex flex-wrap gap-3">
                    <button
                      type="button"
                      (click)="cycleTransactionTypeFilter()"
                      class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    >
                      {{ transactionTypeLabel() }}
                      <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                    </button>

                    <button
                      type="button"
                      (click)="cycleTransactionDateFilter()"
                      class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    >
                      {{ transactionDateLabel() }}
                      <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                    </button>

                    <button
                      type="button"
                      (click)="cycleTransactionStatusFilter()"
                      class="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    >
                      {{ transactionStatusLabel() }}
                      <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                    </button>
                  </div>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full min-w-[760px]">
                    <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                      <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                        <th class="px-8 py-4">Amount</th>
                        <th class="px-4 py-4">Transaction type</th>
                        <th class="px-4 py-4">Date</th>
                        <th class="px-4 py-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (transaction of visibleTransactions(); track transaction.id) {
                        <tr class="border-b border-[#F4F5F7] last:border-b-0">
                          <td class="px-8 py-5 text-[14px] font-semibold text-[#555A64]">{{ transaction.amount }}</td>
                          <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ transaction.type }}</td>
                          <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">{{ transaction.date }}</td>
                          <td class="px-4 py-5">
                            <span
                              class="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold"
                              [class.bg-[#EDF9EF]]="transaction.status === 'successful'"
                              [class.text-[#2FB04A]]="transaction.status === 'successful'"
                              [class.bg-[#FFF0F0]]="transaction.status === 'failed'"
                              [class.text-[#FF4B4B]]="transaction.status === 'failed'"
                            >
                              <span
                                class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                                [class.bg-[#2FB04A]]="transaction.status === 'successful'"
                                [class.bg-[#FF4B4B]]="transaction.status === 'failed'"
                              >
                                {{ transaction.status === 'successful' ? '✓' : '!' }}
                              </span>
                              {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                            </span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mt-6 flex items-center justify-between px-2">
                <p class="text-[14px] font-semibold text-[#646A73]">{{ visibleTransactions().length }} results</p>

                <div class="flex items-center gap-2 text-[14px] font-medium text-[#B2B7C0]">
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                  >
                    <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                  </button>
                  <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                    1
                  </span>
                  <button
                    type="button"
                    class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                  >
                    <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                  </button>
                  <span class="ml-2">of 1</span>
                </div>
              </div>
            </section>
          </div>
        } @else if (activeTab() === 'reviews') {
          <div class="pt-6">
            <div class="grid gap-8 xl:grid-cols-[260px_minmax(0,1fr)]">
              <div class="space-y-5">
                <div class="rounded-[28px] bg-[#FCFCFD] p-6">
                  <div class="mb-4 flex items-end gap-2">
                    <span class="text-[58px] font-semibold leading-none text-[#1A1C21]">4.57</span>
                    <span class="mb-1 text-[22px] font-semibold text-[#C8CBD4]">/5</span>
                  </div>

                  <div class="mb-6 flex items-center gap-2 text-[#D3DC35]">
                    @for (star of [1, 2, 3, 4, 5]; track star) {
                      <span class="text-[20px]">★</span>
                    }
                  </div>

                  <p class="mb-4 text-[16px] font-semibold text-[#1A1C21]">Overall rating</p>

                  <div class="space-y-3">
                    @for (bar of ratingBreakdown; track bar.stars) {
                      <div class="flex items-center gap-3">
                        <span class="w-7 text-[15px] font-medium text-[#1A1C21]">{{ bar.stars }} ★</span>
                        <div class="h-[6px] flex-1 overflow-hidden rounded-full bg-[#ECEEF4]">
                          <div
                            class="h-full rounded-full bg-[#3A3C43]"
                            [style.width.%]="bar.percentage"
                          ></div>
                        </div>
                        <span class="w-9 text-right text-[15px] text-[#8C8C92]">{{ bar.percentage }}%</span>
                      </div>
                    }
                  </div>
                </div>
              </div>

              <div>
                <div class="mb-7 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 class="text-[18px] font-semibold text-[#1A1C21]">215 reviews</h2>
                    <p class="mt-8 text-[18px] font-medium text-[#1A1C21]">This seller is great at..</p>

                    <div class="mt-4 flex flex-wrap gap-3">
                      @for (tag of reviewTagsByUser[userId()] ?? reviewTagsByUser['francis-uche']; track tag.label) {
                        <div class="rounded-full border border-[#E6E8EF] px-4 py-2 text-[15px] text-[#4B5563]">
                          {{ tag.label }} ({{ tag.count }})
                        </div>
                      }
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="toggleReviewSort()"
                    class="flex items-center gap-2 self-start rounded-full border border-[#E6E8EF] bg-white px-4 py-2.5 text-[15px] font-medium text-[#1A1C21]"
                  >
                    {{ reviewSortLabel() }}
                    <ng-icon name="heroChevronDown" class="text-[16px] text-[#8C8C92]"></ng-icon>
                  </button>
                </div>

                <div class="space-y-8">
                  @for (review of visibleReviews(); track review.author + review.date) {
                    <article class="rounded-[24px] bg-white">
                      <div class="flex gap-4">
                        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                          <img [src]="review.avatar" [alt]="review.author" class="h-full w-full object-cover" />
                        </div>

                        <div class="min-w-0 flex-1">
                          <h3 class="text-[16px] font-medium text-[#1A1C21]">{{ review.author }}</h3>

                          <div class="mt-2 flex items-center gap-2">
                            <div class="flex items-center gap-1 text-[#3A3C43]">
                              @for (filled of reviewStars(review.rating); track $index) {
                                <span class="text-[13px]" [class.text-[#3A3C43]]="filled" [class.text-[#E5E7EB]]="!filled">★</span>
                              }
                            </div>
                            <span class="text-[11px] text-[#D1D5DB]">•</span>
                            <span class="text-[14px] text-[#8C8C92]">{{ review.date }}</span>
                          </div>

                          <p class="mt-3 text-[15px] leading-8 text-[#2F3138]">{{ review.text }}</p>

                          @if (review.images?.length) {
                            <div class="mt-4 flex flex-wrap gap-3">
                              @for (image of review.images!.slice(0, 6); track $index) {
                                <div class="relative h-28 w-28 overflow-hidden rounded-[18px] bg-[#F3F4F6]">
                                  <img [src]="image" alt="" class="h-full w-full object-cover" />

                                  @if ($index === 5 && review.images!.length > 6) {
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/45 text-[28px] font-semibold text-white">
                                      +{{ review.images!.length - 5 }}
                                    </div>
                                  }
                                </div>
                              }
                            </div>
                          }
                        </div>
                      </div>
                    </article>
                  }
                </div>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'reports') {
          <div class="pt-6">
            <div class="flex flex-wrap items-center gap-8 border-b border-[#EEF0F4] pb-5">
              <button
                type="button"
                (click)="activeReportTab.set('profile')"
                class="text-[18px] font-medium tracking-[-0.03em] transition"
                [class.text-[#1A1C21]]="activeReportTab() === 'profile'"
                [class.text-[#A0A4AD]]="activeReportTab() !== 'profile'"
              >
                Profile reports
              </button>
              <button
                type="button"
                (click)="activeReportTab.set('listing')"
                class="text-[18px] font-medium tracking-[-0.03em] transition"
                [class.text-[#1A1C21]]="activeReportTab() === 'listing'"
                [class.text-[#A0A4AD]]="activeReportTab() !== 'listing'"
              >
                Listing reports
              </button>
            </div>

            <div class="mt-6 overflow-hidden rounded-[26px] border border-[#ECEEF3] bg-white">
              <div class="flex items-center justify-end border-b border-[#F1F2F4] px-4 py-4">
                <label class="relative block w-full max-w-[250px]">
                  <ng-icon
                    name="heroMagnifyingGlass"
                    class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#A2A7B0]"
                  ></ng-icon>
                  <input
                    type="text"
                    [value]="reportSearchQuery()"
                    (input)="updateReportSearchQuery($any($event.target).value)"
                    placeholder="Search"
                    class="w-full rounded-full bg-[#FAFAFB] py-3 pl-11 pr-4 text-[14px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B5BAC4] focus:ring-2 focus:ring-[#6B5CF0]/10"
                  >
                </label>
              </div>

              @if (activeReportTab() === 'profile') {
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[980px]">
                    <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                      <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                        <th class="px-4 py-4">Store</th>
                        <th class="px-4 py-4">Reported by</th>
                        <th class="px-4 py-4">Reason</th>
                        <th class="px-4 py-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (report of visibleProfileReports(); track report.id) {
                        <tr class="border-b border-[#F4F5F7] last:border-b-0">
                          <td class="px-4 py-5">
                            <div class="flex items-center gap-3">
                              <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F6]">
                                <img [src]="report.storeLogo" [alt]="report.storeName" class="h-full w-full object-cover" />
                              </div>
                              <span class="text-[14px] font-medium text-[#2A2D34]">{{ report.storeName }}</span>
                            </div>
                          </td>
                          <td class="px-4 py-5">
                            <div class="flex items-center gap-3">
                              <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F6]">
                                <img [src]="report.reporterAvatar" [alt]="report.reporterName" class="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p class="text-[14px] font-semibold text-[#2A2D34]">{{ report.reporterName }}</p>
                                <p class="text-[13px] font-medium text-[#8E9199]">{{ report.reporterEmail }}</p>
                              </div>
                            </div>
                          </td>
                          <td class="px-4 py-5 text-[14px] font-medium text-[#2A2D34]">{{ report.reason }}</td>
                          <td class="px-4 py-5 text-[14px] leading-7 text-[#5E636D]">{{ report.description }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              } @else {
                <div class="overflow-x-auto">
                  <table class="w-full min-w-[980px]">
                    <thead class="border-b border-[#F1F2F4] bg-[#FAFAFB] text-left">
                      <tr class="text-[12px] font-semibold text-[#9AA0AA]">
                        <th class="px-4 py-4">Listing</th>
                        <th class="px-4 py-4">Reported by</th>
                        <th class="px-4 py-4">Reason</th>
                        <th class="px-4 py-4">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      @for (report of visibleListingReports(); track report.id) {
                        <tr class="border-b border-[#F4F5F7] last:border-b-0">
                          <td class="px-4 py-5">
                            <div class="flex items-center gap-3">
                              <img [src]="report.listingImage" [alt]="report.listingName" class="h-10 w-10 rounded-[10px] border border-[#ECEEF3] object-cover" />
                              <span class="text-[14px] font-medium text-[#2A2D34]">{{ report.listingName }}</span>
                            </div>
                          </td>
                          <td class="px-4 py-5">
                            <div class="flex items-center gap-3">
                              <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F6]">
                                <img [src]="report.reporterAvatar" [alt]="report.reporterName" class="h-full w-full object-cover" />
                              </div>
                              <div>
                                <p class="text-[14px] font-semibold text-[#2A2D34]">{{ report.reporterName }}</p>
                                <p class="text-[13px] font-medium text-[#8E9199]">{{ report.reporterEmail }}</p>
                              </div>
                            </div>
                          </td>
                          <td class="px-4 py-5 text-[14px] font-medium text-[#2A2D34]">{{ report.reason }}</td>
                          <td class="px-4 py-5 text-[14px] leading-7 text-[#5E636D]">{{ report.description }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              }
            </div>

            <div class="mt-6 flex items-center justify-between px-2">
              <p class="text-[14px] font-semibold text-[#646A73]">
                {{ activeReportTab() === 'profile' ? visibleProfileReports().length : visibleListingReports().length }} results
              </p>

              <div class="flex items-center gap-2 text-[14px] font-medium text-[#B2B7C0]">
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                >
                  <ng-icon name="heroChevronLeft" class="text-sm"></ng-icon>
                </button>
                <span class="flex h-8 min-w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white px-3 text-[#7A808A]">
                  1
                </span>
                <button
                  type="button"
                  class="flex h-8 w-8 items-center justify-center rounded-[10px] border border-[#ECEEF3] bg-white transition hover:bg-[#FAFAFC]"
                >
                  <ng-icon name="heroChevronRight" class="text-sm"></ng-icon>
                </button>
                <span class="ml-2">of 20</span>
              </div>
            </div>
          </div>
        } @else if (activeTab() === 'activities') {
          <div class="pt-6">
            @for (yearGroup of visibleActivityTimeline(); track yearGroup.year) {
              <section class="mb-10">
                <h2 class="text-[18px] font-medium text-[#8E9199]">{{ yearGroup.year }}</h2>

                <div class="mt-5 space-y-8">
                  @for (group of yearGroup.groups; track group.label) {
                    <div>
                      <div class="mb-6 flex items-center gap-4">
                        <span class="rounded-full bg-[#F7F7F8] px-4 py-2 text-[14px] font-medium text-[#8A8F98]">
                          {{ group.label }}
                        </span>
                        <div class="h-px flex-1 bg-[#EEF0F4]"></div>
                        <button type="button" class="flex h-7 w-7 items-center justify-center rounded-full text-[#8A8F98]">
                          <ng-icon name="heroChevronDown" class="text-sm"></ng-icon>
                        </button>
                      </div>

                      <div class="space-y-1">
                        @for (activity of group.items; track activity.id) {
                          <div class="grid grid-cols-[42px_minmax(0,1fr)] gap-4">
                            <div class="flex flex-col items-center">
                              <span class="flex h-11 w-11 items-center justify-center rounded-full border border-[#E8EAF0] bg-white text-[18px] text-[#8E9199]">
                                {{ activityIcon(activity.kind) }}
                              </span>
                              @if (!$last) {
                                <span class="mt-1 h-16 w-px bg-[#E9ECF2]"></span>
                              }
                            </div>

                            <div class="pb-5">
                              <div class="pt-1">
                                <h3 class="text-[14px] font-medium text-[#1F2024]">{{ activity.title }}</h3>

                                @if (activity.detail) {
                                  <div class="mt-3 inline-flex max-w-full rounded-full bg-[#F5F6F8] px-4 py-2 text-[13px] font-medium text-[#676C75]">
                                    {{ activity.detail }}
                                  </div>
                                }

                                <div class="mt-3 flex flex-wrap items-center gap-2 text-[13px] text-[#A0A4AD]">
                                  <span>by</span>
                                  <span
                                    class="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full text-[9px] font-semibold text-white"
                                    [style.background]="activity.actorBackground"
                                  >
                                    {{ activity.actorInitials }}
                                  </span>
                                  <span class="font-medium text-[#42464D]">{{ activity.actorName }}</span>
                                  <span>{{ activity.timestamp }}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        } @else {
          <div class="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-[#E2E5EC] bg-[#FAFAFB] text-center">
            <div>
              <h2 class="text-[18px] font-semibold text-[#1A1C21]">{{ activeTabLabel() }}</h2>
              <p class="mt-2 text-[14px] font-medium text-[#8E9199]">
                This tab is ready for the next pass.
              </p>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);

  readonly userId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? 'francis-uche')),
    { initialValue: 'francis-uche' },
  );

  readonly activeTab = signal<AdminUserDetailsTab>('overview');
  readonly isUserActionsOpen = signal(false);
  readonly userStatusOverride = signal<AdminUserDetailStatus | null>(null);
  readonly activeAdsPlacement = signal<AdminManagedAdPlacement>('promoted listings');
  readonly activeAdsStatus = signal<AdminManagedAdsFilterStatus>('active');
  readonly listingsCategoryFilter = signal<AdminManagedListingCategory>('all');
  readonly listingsStoreFilter = signal<AdminManagedListingStore>('all');
  readonly listingsStatusFilter = signal<'all' | AdminManagedListingStatus>('all');
  readonly listingsSearchQuery = signal('');
  readonly transactionTypeFilter = signal<AdminUserTransactionType>('all');
  readonly transactionDateFilter = signal<AdminUserTransactionDate>('all');
  readonly transactionStatusFilter = signal<'all' | AdminUserTransactionStatus>('all');
  readonly reviewSort = signal<'most-recent' | 'highest-rated'>('most-recent');
  readonly activeReportTab = signal<AdminUserReportTab>('profile');
  readonly reportSearchQuery = signal('');

  readonly user = computed(() => {
    const id = this.userId();
    const baseUser = this.users[id] ?? this.users['francis-uche'];
    const overriddenStatus = this.userStatusOverride();

    return overriddenStatus === null ? baseUser : { ...baseUser, status: overriddenStatus };
  });

  readonly userListings = computed(() => this.listingsByUser[this.userId()] ?? this.listingsByUser['francis-uche']);
  readonly visibleStores = computed(() => this.storesByUser[this.userId()] ?? this.storesByUser['francis-uche']);
  readonly userTransactions = computed(() => this.transactionsByUser[this.userId()] ?? this.transactionsByUser['francis-uche']);

  readonly visibleListings = computed(() => {
    const query = this.listingsSearchQuery().trim().toLowerCase();

    return this.userListings().filter((listing) => {
      const categoryMatches =
        this.listingsCategoryFilter() === 'all' || listing.categoryKey === this.listingsCategoryFilter();
      const storeMatches =
        this.listingsStoreFilter() === 'all' || listing.storeKey === this.listingsStoreFilter();
      const statusMatches =
        this.listingsStatusFilter() === 'all' || listing.status === this.listingsStatusFilter();
      const searchMatches =
        query === '' ||
        listing.name.toLowerCase().includes(query) ||
        listing.categoryLabel.toLowerCase().includes(query) ||
        listing.storeName.toLowerCase().includes(query);

      return categoryMatches && storeMatches && statusMatches && searchMatches;
    });
  });

  readonly visiblePromotedListingSections = computed(() => {
    const filtered = this.userPromotedListings().filter(
      (listing) =>
        listing.placement === 'promoted listings' && listing.status === this.activeAdsStatus(),
    );

    return [
      { category: 'other listings' as const, label: 'Other listings', items: filtered.filter((item) => item.category === 'other listings') },
      { category: 'automobile listings' as const, label: 'Automobile listings', items: filtered.filter((item) => item.category === 'automobile listings') },
      { category: 'property listings' as const, label: 'Property listings', items: filtered.filter((item) => item.category === 'property listings') },
    ].filter((section) => section.items.length > 0);
  });

  readonly visiblePromotedStores = computed(() =>
    this.userPromotedStores().filter(
      (store) =>
        this.activeAdsPlacement() === 'store promotions' && store.status === this.activeAdsStatus(),
    ),
  );

  readonly visibleBannerAds = computed(() =>
    this.userBannerAds().filter(
      (banner) =>
        this.activeAdsPlacement() === 'banner ads' && banner.status === this.activeAdsStatus(),
    ),
  );

  readonly visibleTransactions = computed(() =>
    this.userTransactions().filter((transaction) => {
      const matchesType =
        this.transactionTypeFilter() === 'all' || transaction.type === this.transactionTypeFilter();
      const matchesDate =
        this.transactionDateFilter() === 'all' || transaction.dateKey === this.transactionDateFilter();
      const matchesStatus =
        this.transactionStatusFilter() === 'all' || transaction.status === this.transactionStatusFilter();

      return matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly visibleReviews = computed(() => {
    const reviews = [...(this.reviewsByUser[this.userId()] ?? this.reviewsByUser['francis-uche'])];

    if (this.reviewSort() === 'highest-rated') {
      return reviews.sort((a, b) => b.rating - a.rating);
    }

    return reviews;
  });

  readonly visibleProfileReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();
    const reports = this.profileReportsByUser[this.userId()] ?? this.profileReportsByUser['francis-uche'];

    return reports.filter((report) =>
      query === ''
      || report.storeName.toLowerCase().includes(query)
      || report.reporterName.toLowerCase().includes(query)
      || report.reason.toLowerCase().includes(query)
      || report.description.toLowerCase().includes(query),
    );
  });

  readonly visibleListingReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();
    const reports = this.listingReportsByUser[this.userId()] ?? this.listingReportsByUser['francis-uche'];

    return reports.filter((report) =>
      query === ''
      || report.listingName.toLowerCase().includes(query)
      || report.reporterName.toLowerCase().includes(query)
      || report.reason.toLowerCase().includes(query)
      || report.description.toLowerCase().includes(query),
    );
  });

  readonly visibleActivityTimeline = computed(() =>
    this.activitiesByUser[this.userId()] ?? this.activitiesByUser['francis-uche'],
  );

  readonly tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'ℹ️' },
    { id: 'listings' as const, label: 'Listings', icon: '📦' },
    { id: 'stores' as const, label: 'Stores', icon: '🏬' },
    { id: 'ads' as const, label: 'Ads', icon: '📸' },
    { id: 'transactions' as const, label: 'Transactions', icon: '💳' },
    { id: 'reviews' as const, label: 'Reviews', icon: '☆' },
    { id: 'reports' as const, label: 'Reports', icon: '⚑' },
    { id: 'activities' as const, label: 'Activities', icon: '🧾' },
  ];

  readonly adPlacementTabs = [
    { value: 'promoted listings' as const, label: 'Promoted Listings' },
    { value: 'store promotions' as const, label: 'Store Promotions' },
    { value: 'banner ads' as const, label: 'Banner Ads' },
  ];

  readonly adStatusTabs = computed(() => {
    if (this.activeAdsPlacement() === 'banner ads') {
      return [
        { value: 'active' as const, label: 'Active' },
        { value: 'paused' as const, label: 'Paused' },
        { value: 'pending approval' as const, label: 'Pending approval' },
        { value: 'declined' as const, label: 'Declined' },
        { value: 'expired' as const, label: 'Expired' },
      ];
    }

    return [
      { value: 'active' as const, label: 'Active' },
      { value: 'paused' as const, label: 'Paused' },
      { value: 'expired' as const, label: 'Expired' },
    ];
  });

  readonly transactionTypeLabel = computed(() => {
    switch (this.transactionTypeFilter()) {
      case 'wallet funding':
        return 'Wallet funding';
      case 'subscription payment':
        return 'Subscription payment';
      default:
        return 'Transaction type';
    }
  });

  readonly transactionDateLabel = computed(() => {
    switch (this.transactionDateFilter()) {
      case 'feb-2025':
        return 'Feb 2025';
      case 'mar-2025':
        return 'Mar 2025';
      default:
        return 'Date';
    }
  });

  readonly transactionStatusLabel = computed(() => {
    switch (this.transactionStatusFilter()) {
      case 'successful':
        return 'Successful';
      case 'failed':
        return 'Failed';
      default:
        return 'Status';
    }
  });

  readonly reviewSortLabel = computed(() =>
    this.reviewSort() === 'most-recent' ? 'Most recent' : 'Highest rated',
  );

  readonly months = [
    { label: 'Jan', x: 34, height: 90, highlight: false },
    { label: 'Feb', x: 108, height: 64, highlight: false },
    { label: 'Mar', x: 182, height: 38, highlight: false },
    { label: 'Apr', x: 256, height: 58, highlight: false },
    { label: 'May', x: 330, height: 128, highlight: true },
    { label: 'Jun', x: 404, height: 62, highlight: false },
    { label: 'Jul', x: 478, height: 90, highlight: false },
    { label: 'Aug', x: 552, height: 92, highlight: false },
    { label: 'Sep', x: 626, height: 62, highlight: false },
    { label: 'Oct', x: 700, height: 68, highlight: false },
    { label: 'Nov', x: 774, height: 54, highlight: false },
    { label: 'Dec', x: 848, height: 92, highlight: false },
  ];

  readonly users: Record<string, UserDetail> = {
    'francis-uche': {
      id: 'francis-uche',
      name: 'Francis Uche',
      email: 'uche@gmail.com',
      avatarInitials: 'FU',
      avatarBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      status: 'active',
      dateJoined: 'Apr 15, 2024',
      lastSignedIn: 'Apr 15, 2024',
      phoneNumber: '+234 816 939 7454',
      totalSoldItems: '100,500',
      growthLabel: '↑ 28% vs last month',
      mostViewedListingTitle: 'iPhone 17 pro max',
      mostViewedListingImage: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=220&h=260&fit=crop',
      mostViewedListingCount: '34,002',
      distribution: [
        { label: 'Sold', value: '2,000,000', color: '#34B54A' },
        { label: 'Available', value: '1,200,000', color: '#4C86F5' },
        { label: 'Paused', value: '800,000', color: '#F3A233' },
      ],
    },
    'mark-anthony': {
      id: 'mark-anthony',
      name: 'Mark Anthony',
      email: 'mark@gmail.com',
      avatarInitials: 'MA',
      avatarBackground: 'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      status: 'suspended',
      dateJoined: 'May 06, 2024',
      lastSignedIn: 'Jan 02, 2026',
      phoneNumber: '+234 816 939 7454',
      totalSoldItems: '84,320',
      growthLabel: '↑ 14% vs last month',
      mostViewedListingTitle: 'Logitech ergonomic mouse',
      mostViewedListingImage: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=220&h=260&fit=crop',
      mostViewedListingCount: '19,482',
      distribution: [
        { label: 'Sold', value: '1,500,000', color: '#34B54A' },
        { label: 'Available', value: '950,000', color: '#4C86F5' },
        { label: 'Paused', value: '420,000', color: '#F3A233' },
      ],
    },
    'elle-adebisi': {
      id: 'elle-adebisi',
      name: 'Elle Adebisi',
      email: 'elle@gmail.com',
      avatarInitials: 'EA',
      avatarBackground: 'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      status: 'active',
      dateJoined: 'May 06, 2024',
      lastSignedIn: 'Jan 02, 2026',
      phoneNumber: '+234 816 939 7454',
      totalSoldItems: '57,240',
      growthLabel: '↑ 9% vs last month',
      mostViewedListingTitle: 'RGB keyboard',
      mostViewedListingImage: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=220&h=260&fit=crop',
      mostViewedListingCount: '22,610',
      distribution: [
        { label: 'Sold', value: '800,000', color: '#34B54A' },
        { label: 'Available', value: '680,000', color: '#4C86F5' },
        { label: 'Paused', value: '210,000', color: '#F3A233' },
      ],
    },
  };

  readonly listingsByUser: Record<string, AdminManagedListing[]> = {
    'francis-uche': [
      {
        id: 'iphone-17-pro-max',
        name: 'iPhone 17 pro max',
        thumbnail: '/assets/images/image-1-1.jpg',
        categoryKey: 'phones-laptops',
        categoryLabel: 'Phones & Laptops',
        price: '2,500,000.00',
        storeKey: 'vine',
        storeName: 'The Vine Collections',
        storeBackground: 'linear-gradient(135deg, #5FAE79 0%, #3D8F5F 100%)',
        status: 'available',
        boosted: true,
      },
      {
        id: 'logitech-ergonomic-mouse',
        name: 'Logitech ergonomic mouse',
        thumbnail: '/assets/images/hero_img_3.png',
        categoryKey: 'electronics',
        categoryLabel: 'Electronics',
        price: '2,500,000.00',
        storeKey: 'eden',
        storeName: 'Eden Organics',
        storeBackground: 'linear-gradient(135deg, #132816 0%, #23B14D 100%)',
        status: 'sold',
        boosted: false,
      },
      {
        id: 'nike-sneaker',
        name: 'Nike sneaker',
        thumbnail: '/assets/images/product_sneakers.png',
        categoryKey: 'mens-fashion',
        categoryLabel: 'Men’s fashion',
        price: '2,500,000.00',
        storeKey: 'amazing',
        storeName: 'Amazing Fragrances',
        storeBackground: 'linear-gradient(135deg, #FFC738 0%, #F2A700 100%)',
        status: 'draft',
        boosted: false,
      },
      {
        id: 'bone-straight-wig',
        name: 'Bone straight wig',
        thumbnail: '/assets/images/image-2-1.jpg',
        categoryKey: 'womens-fashion',
        categoryLabel: 'Women’s fashion',
        price: '2,500,000.00',
        storeKey: 'personal',
        storeName: 'Personal account',
        storeBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
        status: 'paused',
        boosted: true,
      },
      {
        id: 'maserati',
        name: 'Maserati',
        thumbnail: '/assets/images/fashion_menswear.png',
        categoryKey: 'automobiles',
        categoryLabel: 'Automobiles',
        price: '2,500,000.00',
        storeKey: 'eden',
        storeName: 'Eden Organics',
        storeBackground: 'linear-gradient(135deg, #132816 0%, #23B14D 100%)',
        status: 'sold',
        boosted: true,
      },
      {
        id: 'rgb-keyboard',
        name: 'RGB keyboard',
        thumbnail: '/assets/images/product_keyboard_rgb.png',
        categoryKey: 'electronics',
        categoryLabel: 'Electronics',
        price: '2,500,000.00',
        storeKey: 'personal',
        storeName: 'Personal account',
        storeBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
        status: 'draft',
        boosted: false,
      },
      {
        id: 'sweatshirt',
        name: 'Sweatshirt',
        thumbnail: '/assets/images/fashion_menswear_hero.png',
        categoryKey: 'mens-fashion',
        categoryLabel: 'Men’s fashion',
        price: '2,500,000.00',
        storeKey: 'vine',
        storeName: 'The Vine Collections',
        storeBackground: 'linear-gradient(135deg, #5FAE79 0%, #3D8F5F 100%)',
        status: 'sold',
        boosted: false,
      },
    ],
    'mark-anthony': [
      {
        id: 'office-chair',
        name: 'Ergonomic chair',
        thumbnail: '/assets/images/hero_img_4.png',
        categoryKey: 'electronics',
        categoryLabel: 'Electronics',
        price: '120,000.00',
        storeKey: 'eden',
        storeName: 'Eden Organics',
        storeBackground: 'linear-gradient(135deg, #132816 0%, #23B14D 100%)',
        status: 'available',
        boosted: true,
      },
    ],
    'elle-adebisi': [
      {
        id: 'kitchen-utensils',
        name: 'Kitchen utensils',
        thumbnail: '/assets/images/product_watch_luxury.png',
        categoryKey: 'womens-fashion',
        categoryLabel: 'Women’s fashion',
        price: '85,000.00',
        storeKey: 'amazing',
        storeName: 'Amazing Fragrances',
        storeBackground: 'linear-gradient(135deg, #FFC738 0%, #F2A700 100%)',
        status: 'available',
        boosted: false,
      },
    ],
  };

  readonly storesByUser: Record<string, Store[]> = {
    'francis-uche': [
      {
        id: 'vine-collections',
        name: 'The Vine Collections',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/image-4-1.jpg',
        followers: '2.5k',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        activeUntil: '24 May, 2025',
        route: ['/admin/users', 'francis-uche'],
      },
      {
        id: 'new-age-properties',
        name: 'New Age Properties',
        logo: '/assets/images/logo-dark-fill.svg',
        banner: '/assets/images/hero-bg.png',
        followers: '1.8k',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        route: ['/admin/users', 'francis-uche'],
      },
      {
        id: 'snap-thrifts',
        name: 'Snap Thrifts',
        logo: '/assets/images/id_type_icons_3d.png',
        banner: '/assets/images/fashion_menswear_hero.png',
        followers: '980',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        activeUntil: '24 May, 2025',
        route: ['/admin/users', 'francis-uche'],
      },
      {
        id: 'gomelon',
        name: 'goMelon',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/hero_img_3.png',
        followers: '1.1k',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        route: ['/admin/users', 'francis-uche'],
      },
    ],
    'mark-anthony': [
      {
        id: 'eden-organics',
        name: 'Eden Organics',
        logo: '/assets/images/logo-dark-fill.svg',
        banner: '/assets/images/hero_img_4.png',
        followers: '760',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        route: ['/admin/users', 'mark-anthony'],
      },
    ],
    'elle-adebisi': [
      {
        id: 'amazing-fragrances',
        name: 'Amazing Fragrances',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/product_watch_luxury.png',
        followers: '620',
        isVerified: true,
        metaLabel: 'Ikeja, Lagos',
        route: ['/admin/users', 'elle-adebisi'],
      },
    ],
  };

  readonly promotedStoresByUser: Record<string, AdminManagedStorePromotion[]> = {
    'francis-uche': [
      {
        id: 'vine-collections-promoted',
        name: 'The Vine Collections',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/image-4-1.jpg',
        location: 'Ikeja, Lagos',
        impressions: '1K',
        clicks: '500',
        messages: '41',
        expiresOn: '24 May, 2025',
        status: 'active',
      },
      {
        id: 'new-age-properties-promoted',
        name: 'New Age Properties',
        logo: '/assets/images/logo-dark-fill.svg',
        banner: '/assets/images/hero-bg.png',
        location: 'Ikeja, Lagos',
        impressions: '1K',
        clicks: '500',
        messages: '41',
        expiresOn: '24 May, 2025',
        status: 'active',
      },
      {
        id: 'snap-thrifts-promoted',
        name: 'Snap Thrifts',
        logo: '/assets/images/id_type_icons_3d.png',
        banner: '/assets/images/fashion_menswear_hero.png',
        location: 'Ikeja, Lagos',
        impressions: '1K',
        clicks: '500',
        messages: '41',
        expiresOn: '24 May, 2025',
        status: 'active',
      },
      {
        id: 'gomelon-promoted',
        name: 'goMelon',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/hero_img_3.png',
        location: 'Ikeja, Lagos',
        impressions: '1K',
        clicks: '500',
        messages: '41',
        expiresOn: '24 May, 2025',
        status: 'active',
      },
      {
        id: 'paused-store-promoted',
        name: 'Paused Store',
        logo: '/assets/images/logo-light-fill.svg',
        banner: '/assets/images/image-2-1.jpg',
        location: 'Ikeja, Lagos',
        impressions: '540',
        clicks: '90',
        messages: '7',
        expiresOn: '24 May, 2025',
        status: 'paused',
      },
      {
        id: 'expired-store-promoted',
        name: 'Expired Store',
        logo: '/assets/images/logo-dark-fill.svg',
        banner: '/assets/images/product_watch_luxury.png',
        location: 'Ikeja, Lagos',
        impressions: '320',
        clicks: '44',
        messages: '2',
        expiresOn: '24 May, 2025',
        status: 'expired',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly promotedListingsByUser: Record<string, AdminManagedPromotionListing[]> = {
    'francis-uche': [
      {
        id: 'ad-iphone-17-pro-max',
        title: 'iPhone 17 pro max',
        price: '₦2,500,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/image-1-1.jpg',
      },
      {
        id: 'ad-logitech-mouse',
        title: 'Logitech ergonomic mouse',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/hero_img_3.png',
      },
      {
        id: 'ad-rgb-keyboard',
        title: 'RGB keyboard',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/product_keyboard_rgb.png',
      },
      {
        id: 'ad-iphone-x',
        title: 'Iphone X (64 gig)',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/image-3-1.jpg',
      },
      {
        id: 'ad-chair',
        title: 'Ergonomic chair',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/hero_img_4.png',
      },
      {
        id: 'ad-maserati',
        title: 'Masarati',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'automobile listings',
        image: '/assets/images/fashion_menswear.png',
      },
      {
        id: 'ad-nike-sneaker',
        title: 'Nike sneaker',
        price: '₦35,000',
        views: '1K',
        clicks: '500',
        messages: '41',
        calls: '8',
        expiresOn: '24 May, 2025',
        status: 'active',
        placement: 'promoted listings',
        category: 'property listings',
        image: '/assets/images/product_sneakers.png',
      },
      {
        id: 'ad-paused-item',
        title: 'Paused listing',
        price: '₦20,000',
        views: '540',
        clicks: '90',
        messages: '7',
        calls: '1',
        expiresOn: '24 May, 2025',
        status: 'paused',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/image-2-1.jpg',
      },
      {
        id: 'ad-expired-item',
        title: 'Expired listing',
        price: '₦20,000',
        views: '300',
        clicks: '45',
        messages: '5',
        calls: '0',
        expiresOn: '24 May, 2025',
        status: 'expired',
        placement: 'promoted listings',
        category: 'other listings',
        image: '/assets/images/product_watch_luxury.png',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly bannerAdsByUser: Record<string, AdminManagedBannerAd[]> = {
    'francis-uche': [
      {
        id: 'banner-super-shopping',
        title: 'Super Shopping Day',
        subtitle: 'Holiday sale',
        primaryFigure: '99',
        secondaryFigure: 'Up to 70%',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '1K',
        clicks: '500',
        cardTone: 'linear-gradient(135deg, #FF8B2C 0%, #FF5F29 55%, #FF4B3A 100%)',
        textTone: '#FFFFFF',
        accentTone: '#1E4CFF',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/image-1-1.jpg',
        placement: 'banner ads',
        status: 'active',
      },
      {
        id: 'banner-prime-day',
        title: 'Prime Day Deals',
        subtitle: 'Electronics',
        primaryFigure: '76',
        secondaryFigure: 'Save big',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '1K',
        clicks: '500',
        cardTone: 'linear-gradient(135deg, #6FC3FF 0%, #3E8FFF 100%)',
        textTone: '#FFFFFF',
        accentTone: '#FFD44D',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/hero_img_3.png',
        placement: 'banner ads',
        status: 'active',
      },
      {
        id: 'banner-paused',
        title: 'Paused banner',
        subtitle: 'Promo',
        primaryFigure: '50',
        secondaryFigure: 'Off',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '320',
        clicks: '81',
        cardTone: 'linear-gradient(135deg, #DDE3F7 0%, #C9D4F2 100%)',
        textTone: '#FFFFFF',
        accentTone: '#5E6C84',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/image-4-1.jpg',
        placement: 'banner ads',
        status: 'paused',
      },
      {
        id: 'banner-pending',
        title: 'Pending banner',
        subtitle: 'Promo',
        primaryFigure: '35',
        secondaryFigure: 'Review',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '420',
        clicks: '91',
        cardTone: 'linear-gradient(135deg, #F4E6FF 0%, #E1CCFF 100%)',
        textTone: '#FFFFFF',
        accentTone: '#7A6AE6',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/fashion_menswear_hero.png',
        placement: 'banner ads',
        status: 'pending approval',
      },
      {
        id: 'banner-declined',
        title: 'Declined banner',
        subtitle: 'Promo',
        primaryFigure: '10',
        secondaryFigure: 'Review',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '180',
        clicks: '22',
        cardTone: 'linear-gradient(135deg, #FFE2E2 0%, #FFCACA 100%)',
        textTone: '#FFFFFF',
        accentTone: '#FF6B6B',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/image-2-1.jpg',
        placement: 'banner ads',
        status: 'declined',
      },
      {
        id: 'banner-expired',
        title: 'Expired banner',
        subtitle: 'Promo',
        primaryFigure: '20',
        secondaryFigure: 'Ends',
        expiresOn: '24 May, 2025',
        sponsorLabel: 'Sponsored',
        views: '200',
        clicks: '33',
        cardTone: 'linear-gradient(135deg, #ECECF3 0%, #D7DBE6 100%)',
        textTone: '#FFFFFF',
        accentTone: '#7F8DA8',
        badgeTone: '#F2F5A7',
        imagePreview: '/assets/images/product_watch_luxury.png',
        placement: 'banner ads',
        status: 'expired',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly transactionsByUser: Record<string, AdminUserTransaction[]> = {
    'francis-uche': [
      {
        id: 'tx-1',
        amount: '₦25,000.00',
        type: 'wallet funding',
        date: '14 Feb, 2025',
        dateKey: 'feb-2025',
        status: 'successful',
      },
      {
        id: 'tx-2',
        amount: '₦25,000.00',
        type: 'subscription payment',
        date: '14 Feb, 2025',
        dateKey: 'feb-2025',
        status: 'successful',
      },
      {
        id: 'tx-3',
        amount: '₦25,000.00',
        type: 'wallet funding',
        date: '14 Feb, 2025',
        dateKey: 'feb-2025',
        status: 'failed',
      },
      {
        id: 'tx-4',
        amount: '₦25,000.00',
        type: 'subscription payment',
        date: '14 Feb, 2025',
        dateKey: 'feb-2025',
        status: 'successful',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly reviewTagsByUser: Record<string, AdminUserReviewTag[]> = {
    'francis-uche': [
      { label: 'Timely response', count: 16 },
      { label: 'Safety', count: 7 },
      { label: 'Credibility', count: 7 },
      { label: 'Manners', count: 7 },
      { label: 'Hospitality', count: 7 },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly reviewsByUser: Record<string, AdminUserReview[]> = {
    'francis-uche': [
      {
        author: 'Mary Jane',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        rating: 5,
        date: 'August 14, 2025',
        text: 'Contacted the seller. Went to their office to purchase the item and their hospitality was okay. Truly reliable. And he’s a funny man 😂',
      },
      {
        author: 'Apeli Obubra',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140051.png',
        rating: 4,
        date: 'August 14, 2025',
        text: 'Straightforward guy! easy transaction great goods',
      },
      {
        author: 'Ibiso Amiesimaka',
        avatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
        rating: 4,
        date: 'August 14, 2025',
        text: 'infact it was amazing if everyone is like this Nigeria will be better than this i advice everybody that wants to by laptop should call this man',
        images: [
          '/assets/images/hero_img_3.png',
          '/assets/images/image-4-1.jpg',
          '/assets/images/product_keyboard_rgb.png',
          '/assets/images/product_watch_luxury.png',
          '/assets/images/fashion_menswear_hero.png',
          '/assets/images/image-1-1.jpg',
        ],
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly profileReportsByUser: Record<string, AdminProfileReport[]> = {
    'francis-uche': [
      {
        id: 'profile-report-1',
        storeName: 'The Vine Collections',
        storeLogo: '/assets/images/logo-light-fill.svg',
        reporterName: 'Mark Anthony',
        reporterEmail: 'mark@email.com',
        reporterAvatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
        reason: 'Suspected scam or fraud',
        description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      },
      {
        id: 'profile-report-2',
        storeName: 'Eden Organics',
        storeLogo: '/assets/images/logo-dark-fill.svg',
        reporterName: 'Mark Anthony',
        reporterEmail: 'mark@email.com',
        reporterAvatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
        reason: 'Seller is unresponsive after payment',
        description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      },
      {
        id: 'profile-report-3',
        storeName: 'Personal account',
        storeLogo: '/assets/images/image-2-1.jpg',
        reporterName: 'Mark Anthony',
        reporterEmail: 'mark@email.com',
        reporterAvatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
        reason: 'Selling prohibited or illegal items',
        description: 'Description. Description. Description. Description. Description. Description. Description. Description. Description. Description. Description.',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly listingReportsByUser: Record<string, AdminListingReport[]> = {
    'francis-uche': [
      {
        id: 'listing-report-1',
        listingName: 'iPhone 17 pro max',
        listingImage: '/assets/images/image-1-1.jpg',
        reporterName: 'Elle Adebisi',
        reporterEmail: 'elle@email.com',
        reporterAvatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        reason: 'Listing unavailable',
        description: 'Buyer reported this listing as unavailable and requested that the seller inventory be reviewed.',
      },
      {
        id: 'listing-report-2',
        listingName: 'RGB keyboard',
        listingImage: '/assets/images/product_keyboard_rgb.png',
        reporterName: 'Mary Jane',
        reporterEmail: 'mary@email.com',
        reporterAvatar: 'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
        reason: 'Misleading description',
        description: 'The listing content appears inaccurate compared to the item that was delivered.',
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly activitiesByUser: Record<string, AdminUserActivityYearGroup[]> = {
    'francis-uche': [
      {
        year: '2025',
        groups: [
          {
            label: 'This week',
            items: [
              {
                id: 'a1',
                kind: 'message',
                title: 'Message received',
                detail: '“I’m interested. Can we negotiate on price?”',
                actorName: 'Sharon Idemudia',
                actorInitials: 'SI',
                actorBackground: 'linear-gradient(135deg, #F4B38A 0%, #E75E43 100%)',
                timestamp: '24 February 2025, 02:45 pm',
              },
              {
                id: 'a2',
                kind: 'message',
                title: 'Message received',
                detail: '“Hello is the item still available”',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 February 2025, 02:45 pm',
              },
              {
                id: 'a3',
                kind: 'offer',
                title: 'Offer received',
                detail: 'They sent an offer of ₦2,000,000',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 February 2025, 02:45 pm',
              },
              {
                id: 'a4',
                kind: 'callback',
                title: 'Call back request',
                detail: 'They requested you call them back on 0816 939 7454',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 February 2025, 02:45 pm',
              },
              {
                id: 'a5',
                kind: 'call',
                title: 'Called you',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 February 2025, 02:45 pm',
              },
            ],
          },
          {
            label: 'January',
            items: [
              {
                id: 'a6',
                kind: 'wishlist',
                title: 'Added to wishlist',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 January 2025, 02:45 pm',
              },
              {
                id: 'a7',
                kind: 'view',
                title: 'Viewed your listing',
                actorName: 'Joseph Olamide',
                actorInitials: 'JO',
                actorBackground: 'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
                timestamp: '24 January 2025, 02:45 pm',
              },
              {
                id: 'a8',
                kind: 'published',
                title: 'Product published',
                actorName: 'You',
                actorInitials: 'YO',
                actorBackground: 'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
                timestamp: '24 January 2025, 02:45 pm',
              },
            ],
          },
        ],
      },
    ],
    'mark-anthony': [],
    'elle-adebisi': [],
  };

  readonly listingsCategoryLabel = computed(() => {
    switch (this.listingsCategoryFilter()) {
      case 'phones-laptops':
        return 'Phones & Laptops';
      case 'electronics':
        return 'Electronics';
      case 'mens-fashion':
        return 'Men’s fashion';
      case 'womens-fashion':
        return 'Women’s fashion';
      case 'automobiles':
        return 'Automobiles';
      default:
        return 'Category';
    }
  });

  readonly listingsStoreLabel = computed(() => {
    switch (this.listingsStoreFilter()) {
      case 'vine':
        return 'The Vine Collections';
      case 'eden':
        return 'Eden Organics';
      case 'amazing':
        return 'Amazing Fragrances';
      case 'personal':
        return 'Personal account';
      default:
        return 'Store';
    }
  });

  readonly listingsStatusLabel = computed(() => {
    switch (this.listingsStatusFilter()) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      default:
        return 'Status';
    }
  });

  activeTabLabel(): string {
    return this.tabs.find((tab) => tab.id === this.activeTab())?.label ?? 'Overview';
  }

  userPromotedListings(): AdminManagedPromotionListing[] {
    return this.promotedListingsByUser[this.userId()] ?? this.promotedListingsByUser['francis-uche'];
  }

  userPromotedStores(): AdminManagedStorePromotion[] {
    return this.promotedStoresByUser[this.userId()] ?? this.promotedStoresByUser['francis-uche'];
  }

  userBannerAds(): AdminManagedBannerAd[] {
    return this.bannerAdsByUser[this.userId()] ?? this.bannerAdsByUser['francis-uche'];
  }

  countUserAdsByStatus(status: AdminManagedAdsFilterStatus): number {
    if (this.activeAdsPlacement() === 'store promotions') {
      return status === 'active' || status === 'paused' || status === 'expired'
        ? this.userPromotedStores().filter((store) => store.status === status).length
        : 0;
    }

    if (this.activeAdsPlacement() === 'banner ads') {
      return this.userBannerAds().filter((banner) => banner.status === status).length;
    }

    return status === 'active' || status === 'paused' || status === 'expired'
      ? this.userPromotedListings().filter((listing) => listing.status === status).length
      : 0;
  }

  cycleListingsCategoryFilter(): void {
    this.listingsCategoryFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'phones-laptops';
        case 'phones-laptops':
          return 'electronics';
        case 'electronics':
          return 'mens-fashion';
        case 'mens-fashion':
          return 'womens-fashion';
        case 'womens-fashion':
          return 'automobiles';
        default:
          return 'all';
      }
    });
  }

  cycleListingsStoreFilter(): void {
    this.listingsStoreFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'vine';
        case 'vine':
          return 'eden';
        case 'eden':
          return 'amazing';
        case 'amazing':
          return 'personal';
        default:
          return 'all';
      }
    });
  }

  cycleListingsStatusFilter(): void {
    this.listingsStatusFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'available';
        case 'available':
          return 'sold';
        case 'sold':
          return 'draft';
        case 'draft':
          return 'paused';
        default:
          return 'all';
      }
    });
  }

  cycleTransactionTypeFilter(): void {
    this.transactionTypeFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'wallet funding';
        case 'wallet funding':
          return 'subscription payment';
        default:
          return 'all';
      }
    });
  }

  cycleTransactionDateFilter(): void {
    this.transactionDateFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'feb-2025';
        case 'feb-2025':
          return 'mar-2025';
        default:
          return 'all';
      }
    });
  }

  cycleTransactionStatusFilter(): void {
    this.transactionStatusFilter.update((value) => {
      switch (value) {
        case 'all':
          return 'successful';
        case 'successful':
          return 'failed';
        default:
          return 'all';
      }
    });
  }

  toggleReviewSort(): void {
    this.reviewSort.update((value) => value === 'most-recent' ? 'highest-rated' : 'most-recent');
  }

  updateListingsSearchQuery(value: string): void {
    this.listingsSearchQuery.set(value);
  }

  updateReportSearchQuery(value: string): void {
    this.reportSearchQuery.set(value);
  }

  deactivateUser(): void {
    this.userStatusOverride.set('suspended');
    this.isUserActionsOpen.set(false);
  }

  banUser(): void {
    this.userStatusOverride.set('suspended');
    this.isUserActionsOpen.set(false);
  }

  activityIcon(kind: AdminUserActivity['kind']): string {
    switch (kind) {
      case 'message':
        return '✉';
      case 'offer':
        return '💲';
      case 'callback':
        return '📞';
      case 'call':
        return '📞';
      case 'wishlist':
        return '♡';
      case 'view':
        return '◉';
      case 'published':
        return '🏷';
    }
  }

  distributionWidth(value: string): number {
    const numericValue = Number(value.replace(/,/g, ''));
    const total = this.user().distribution.reduce(
      (sum, item) => sum + Number(item.value.replace(/,/g, '')),
      0,
    );

    return total === 0 ? 0 : (numericValue / total) * 100;
  }

  readonly ratingBreakdown = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 9 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ];

  reviewStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }

  listingStatusLabelText(status: AdminManagedListingStatus): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
    }
  }

  listingStatusMark(status: AdminManagedListingStatus): string {
    switch (status) {
      case 'available':
        return '•';
      case 'sold':
        return '✓';
      case 'draft':
        return '■';
      case 'paused':
        return '‖';
    }
  }

  storeInitials(name: string): string {
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }
}
