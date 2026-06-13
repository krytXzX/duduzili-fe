import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT, NgOptimizedImage } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { StoreCardComponent, type Store } from '../../components/stores/store-card.component';
import {
  CustomDropdownComponent,
  type CustomDropdownOption,
} from '../../components/ui/custom-dropdown.component';
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
import { AppToastService } from '../../services/app-toast.service';
import {
  AdminUserActivitiesResponse,
  AdminUserAdRecord,
  AdminUserAdsResponse,
  AdminUserDetailChartPoint,
  AdminUserDetailResponse,
  AdminUserDetailsService,
  AdminUserListingRecord,
  AdminUserListingsResponse,
  AdminUserReportRecord,
  AdminUserReviewRecord,
  AdminUserReviewsResponse,
  AdminUserStoreRecord,
  AdminUserTransactionRecord,
  AdminUserTransactionsResponse,
} from '../../services/admin-user-details.service';

type AdminUserDetailStatus = 'active' | 'suspended' | 'banned';
type AdminManagedListingStatus = 'available' | 'sold' | 'draft' | 'paused';
type AdminManagedListingCategory = 'all' | string;
type AdminManagedListingStore = 'all' | string;
type AdminManagedAdStatus = 'active' | 'paused' | 'expired';
type AdminManagedBannerStatus = 'active' | 'paused' | 'pending approval' | 'declined' | 'expired';
type AdminManagedAdsFilterStatus =
  | 'active'
  | 'paused'
  | 'pending approval'
  | 'declined'
  | 'expired';
type AdminManagedAdPlacement = 'promoted listings' | 'store promotions' | 'banner ads';
type AdminManagedAdCategory = string;
type AdminManagedPromotedListingCategory = string;
type AdminManagedPromotedListingPriceDisplay = 'naira-icon' | 'strikethrough-n' | 'text';
type MobilePromotedStore = Store & { status: AdminManagedAdStatus };
type AdminUserTransactionStatus = 'successful' | 'failed';
type AdminUserTransactionType = 'all' | 'wallet funding' | 'subscription payment';
type AdminUserTransactionDate = 'all' | string;
type AdminUserReportTab = 'profile' | 'listing';
type AdminUserOverviewRange = 'last-7-days' | 'last-30-days' | 'last-90-days';
type AdminUserListingReportCategory = 'all' | string;
type AdminUserListingReportStore = 'all' | string;
type AdminUserListingReportStatus = 'all' | string;
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
  avatar: string;
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
  categoryKey: string;
  categoryLabel: string;
  price: string;
  storeKey: string;
  storeName: string;
  storeBackground: string;
  status: AdminManagedListingStatus;
  boosted: boolean;
}

type MobileAdminListingStatus = 'available' | 'sold' | 'draft' | 'paused' | 'suspended';

interface MobileAdminListing {
  id: string;
  name: string;
  thumbnail: string;
  storeName: string;
  price: string;
  status: MobileAdminListingStatus;
  promoted: boolean;
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
  imageFit?: 'cover' | 'contain';
  imageBackground?: string;
  showImageGradient?: boolean;
  showImageDots?: boolean;
  imageControlMode?: 'both' | 'right';
  priceDisplay?: AdminManagedPromotedListingPriceDisplay;
}

interface AdminManagedPromotedListingCard {
  id: string;
  title: string;
  price: string;
  views: string;
  clicks: string;
  messages: string;
  calls: string;
  expiresOn: string;
  status: AdminManagedAdStatus;
  category: AdminManagedPromotedListingCategory;
  image: string;
  imageFit?: 'cover' | 'contain';
  imageBackground?: string;
  showImageGradient?: boolean;
  showImageDots?: boolean;
  imageControlMode?: 'both' | 'right';
  priceDisplay?: AdminManagedPromotedListingPriceDisplay;
  oldPrice?: string;
  discountLabel?: string;
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
  isVerified: boolean;
}

interface AdminUserTransaction {
  id: string;
  amount: string;
  type: Exclude<AdminUserTransactionType, 'all'>;
  date: string;
  dateKey: AdminUserTransactionDate;
  status: AdminUserTransactionStatus;
}

interface AdminUserMobileTransaction {
  id: string;
  amount: string;
  type: string;
  dateLabel: string;
  status: AdminUserTransactionStatus;
  icon: string;
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
  moreImagesLabel?: string;
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
  categoryKey: string;
  storeName: string;
  storeKey: string;
  storeIcon: string;
  reporterName: string;
  reporterEmail: string;
  reporterAvatar: string;
  status: string;
  description: string;
}

interface AdminUserActivity {
  id: string;
  kind: 'message' | 'offer' | 'callback' | 'call' | 'wishlist' | 'view' | 'published';
  title: string;
  detail?: string;
  actorName: string;
  actorAvatar: string;
  mobileActorAvatar?: string;
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
  imports: [
    RouterLink,
    NgIcon,
    NgOptimizedImage,
    StoreCardComponent,
    BannerPromotionCardComponent,
    CustomDropdownComponent,
  ],
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
    @if (isLoading() && !userDetailResponse()) {
      <div
        class="min-h-full bg-white p-4 lg:p-8"
        aria-busy="true"
        aria-label="Loading user details"
      >
        <div class="mx-auto max-w-[1500px] animate-pulse space-y-8">
          <div class="flex items-center gap-4">
            <div class="h-16 w-16 rounded-full bg-[#ECEEF3]"></div>
            <div class="space-y-3">
              <div class="h-5 w-48 rounded-full bg-[#ECEEF3]"></div>
              <div class="h-4 w-64 rounded-full bg-[#F3F4F6]"></div>
            </div>
          </div>
          <div class="h-12 w-full rounded-2xl bg-[#F3F4F6]"></div>
          <div class="grid gap-5 lg:grid-cols-3">
            <div class="h-64 rounded-3xl bg-[#F3F4F6] lg:col-span-2"></div>
            <div class="h-64 rounded-3xl bg-[#F3F4F6]"></div>
          </div>
        </div>
      </div>
    } @else if (userLoadFailed()) {
      <div class="flex min-h-[60vh] items-center justify-center bg-white p-6">
        <div class="max-w-md rounded-3xl border border-[#ECEEF3] p-8 text-center">
          <h1 class="text-xl font-semibold text-[#1A1B1D]">User details are unavailable</h1>
          <p class="mt-2 text-sm text-[#777B84]">Please check your connection and try again.</p>
          <button
            type="button"
            (click)="reloadUser()"
            class="mt-5 rounded-full bg-[#6453D9] px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    } @else {
      <section class="min-h-full bg-white px-3 pb-8 pt-0 lg:hidden">
        <div class="flex h-[45px] items-center justify-between">
          <a
            routerLink="/admin/users"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F4F4]"
            aria-label="Back to users"
          >
            <img
              ngSrc="/assets/icons/admin-user-details/arrow-left.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
              aria-hidden="true"
            />
          </a>

          <div class="relative">
            @if (isMobileUserActionsOpen()) {
              <button
                type="button"
                class="fixed inset-0 z-10 cursor-default"
                (click)="isMobileUserActionsOpen.set(false)"
                aria-label="Close user actions menu"
              ></button>
            }

            <button
              type="button"
              (click)="isMobileUserActionsOpen.set(!isMobileUserActionsOpen())"
              class="relative z-20 flex h-10 w-10 items-center justify-center rounded-full"
              aria-label="More actions"
              aria-haspopup="menu"
              [attr.aria-expanded]="isMobileUserActionsOpen()"
            >
              <img
                ngSrc="/assets/icons/admin-user-details/menu-dots.svg"
                width="24"
                height="24"
                alt=""
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>

            @if (isMobileUserActionsOpen()) {
              <div
                class="fixed right-3 top-[55px] z-20 flex w-[172px] flex-col gap-1 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white p-[10px] shadow-[0_6.65px_5.32px_0_rgba(0,0,0,0.03),0_2.767px_2.214px_0_rgba(0,0,0,0.02)]"
                role="menu"
                aria-label="User actions"
                (click)="$event.stopPropagation()"
              >
                <button
                  type="button"
                  [disabled]="isDownloadingUserData()"
                  class="flex h-8 items-center gap-1.5 rounded-[8px] bg-white px-2 text-left text-[14px] font-medium leading-5 text-[#292D32]"
                  [class.cursor-wait]="isDownloadingUserData()"
                  [class.opacity-60]="isDownloadingUserData()"
                  role="menuitem"
                  (click)="downloadUserData()"
                >
                  <img
                    ngSrc="/assets/icons/admin-user-details/menu-download.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-[14px] w-[14px] shrink-0"
                    aria-hidden="true"
                  />
                  {{ isDownloadingUserData() ? 'Preparing…' : 'Download data' }}
                </button>

                <button
                  type="button"
                  class="flex h-8 items-center gap-1.5 rounded-[8px] bg-white px-2 text-left text-[14px] font-medium leading-5 text-[#FF2524]"
                  role="menuitem"
                  (click)="handlePrimaryUserAction()"
                >
                  <img
                    ngSrc="/assets/icons/admin-user-details/menu-slash.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-[14px] w-[14px] shrink-0"
                    aria-hidden="true"
                  />
                  {{ primaryUserActionLabel() }}
                </button>

                <button
                  type="button"
                  class="flex h-8 items-center gap-1.5 rounded-[8px] bg-white px-2 text-left text-[14px] font-medium leading-5 text-[#FF2524]"
                  role="menuitem"
                  (click)="banUser()"
                >
                  <img
                    ngSrc="/assets/icons/admin-user-details/menu-trash.svg"
                    width="14"
                    height="14"
                    alt=""
                    class="h-[14px] w-[14px] shrink-0"
                    aria-hidden="true"
                  />
                  Ban user
                </button>
              </div>
            }
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-2">
          <div class="flex items-center gap-3">
            @if (user().avatar; as avatar) {
              <img
                [ngSrc]="avatar"
                width="60"
                height="60"
                [alt]="user().name"
                class="h-[60px] w-[60px] rounded-full object-cover"
              />
            } @else {
              <span
                class="flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-white"
                [style.background]="user().avatarBackground"
                aria-hidden="true"
              >
                {{ user().avatarInitials }}
              </span>
            }
            <div class="min-w-0">
              <h1 class="truncate text-[20px] font-semibold leading-8 text-[#1A1B1D]">
                {{ user().name }}
              </h1>
              <p class="truncate text-[14px] font-medium leading-5 text-[#0D0D0D]/40">
                {{ user().email }}
              </p>
            </div>
          </div>

          <span
            class="inline-flex h-6 w-fit items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
            [class.bg-[#F3FBF9]]="user().status === 'active'"
            [class.text-[#25AD32]]="user().status === 'active'"
            [class.bg-[#FFF0F0]]="user().status === 'suspended'"
            [class.text-[#FF2524]]="user().status === 'suspended'"
            [class.bg-[#FFF7ED]]="user().status === 'banned'"
            [class.text-[#C2410C]]="user().status === 'banned'"
          >
            <img
              ngSrc="/assets/icons/admin-user-details/tick-circle.svg"
              width="14"
              height="14"
              alt=""
              class="h-3.5 w-3.5"
              aria-hidden="true"
            />
            {{
              user().status === 'active'
                ? 'Active'
                : user().status === 'banned'
                  ? 'Banned'
                  : 'Suspended'
            }}
          </span>
        </div>

        <div
          class="-mx-3 mt-8 overflow-x-auto border-b border-[#EAEAEA] px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div class="flex w-max items-end">
            @for (tab of mobileTabs; track tab.id) {
              <button type="button" (click)="activeTab.set(tab.id)" class="flex flex-col gap-1.5">
                <span
                  class="flex items-center gap-1 rounded-lg px-3 py-1 text-[16px] font-medium leading-6"
                  [class.text-[#6453D9]]="activeTab() === tab.id"
                  [class.text-[#959595]]="activeTab() !== tab.id"
                >
                  <span
                    class="h-4 w-4"
                    [style.background-color]="activeTab() === tab.id ? '#6453D9' : '#959595'"
                    [style.-webkit-mask]="'url(' + tab.icon + ') center / contain no-repeat'"
                    [style.mask]="'url(' + tab.icon + ') center / contain no-repeat'"
                    aria-hidden="true"
                  ></span>
                  {{ tab.label }}
                </span>
                <span
                  class="h-0.5 rounded-full"
                  [class.bg-[#6453D9]]="activeTab() === tab.id"
                  [class.bg-transparent]="activeTab() !== tab.id"
                ></span>
              </button>
            }
          </div>
        </div>

        @if (activeTab() === 'overview') {
          <div class="mt-8 flex flex-col gap-4">
            <section class="overflow-hidden rounded-[20px] border border-[#EBEBEB] bg-white p-3">
              <app-custom-dropdown
                [options]="overviewRangeOptions"
                [value]="overviewRange()"
                [ariaLabel]="'Filter user overview range'"
                [buttonClass]="'inline-flex h-10 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium leading-5 text-black'"
                [labelClass]="'truncate'"
                [iconClass]="'text-[#777777]'"
                [menuClass]="'min-w-[152px]'"
                [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                (valueChange)="overviewRange.set($event)"
              ></app-custom-dropdown>

              <div class="mt-5">
                <p class="text-[14px] font-semibold leading-6 text-[#0D0D0D]/40">
                  Total sold items
                </p>
                <p class="mt-1 text-[32px] font-semibold leading-[1.2] text-[#1A1B1D]">
                  {{ user().totalSoldItems }}
                </p>
                <span
                  class="mt-2 inline-flex h-6 items-center gap-1 rounded-full bg-[#27A551]/[0.06] px-2 text-[12px] font-normal leading-4 text-[#27A551]"
                >
                  <img
                    ngSrc="/assets/icons/admin-user-details/arrow-up.svg"
                    width="12"
                    height="12"
                    alt=""
                    class="h-3 w-3"
                    aria-hidden="true"
                  />
                  {{ overviewGrowthLabel() }}
                </span>
              </div>

              <div class="mt-8 overflow-hidden">
                <div class="relative h-[172px] min-w-[520px]">
                  <div class="absolute left-0 top-0 text-[10px] text-[#0D0D0D]/40">
                    {{ overviewChartScaleMax() }}
                  </div>
                  <div class="absolute left-0 top-[76px] text-[10px] text-[#0D0D0D]/40">
                    {{ overviewChartScaleMid() }}
                  </div>
                  <div class="absolute bottom-[25px] left-0 text-[10px] text-[#0D0D0D]/40">0</div>
                  <div
                    class="absolute bottom-[42px] left-[34px] flex h-[139px] items-end gap-[22px]"
                  >
                    @for (month of mobileMonths(); track month.date) {
                      <div
                        class="w-4 rounded-t bg-gradient-to-b"
                        [class.from-[#6453D9]]="month.highlight"
                        [class.to-[#CFC8FD]]="month.highlight"
                        [class.from-[#DCD8F6]]="!month.highlight"
                        [class.to-[#EFEDFF]]="!month.highlight"
                        [class.opacity-100]="month.highlight"
                        [class.opacity-70]="!month.highlight"
                        [style.height.px]="month.height"
                      ></div>
                    }
                  </div>
                  <div
                    class="absolute bottom-0 left-[34px] flex gap-[19px] text-[10px] text-[#0D0D0D]/40"
                  >
                    @for (month of mobileMonths(); track month.date) {
                      <span class="w-5 text-center">{{ month.label }}</span>
                    }
                  </div>
                  @if (overviewChartHighlight(); as chartHighlight) {
                    <div
                      class="absolute left-[151px] top-[49px] flex h-8 items-center gap-2 rounded-[10px] bg-black px-2 text-[12px] text-white"
                    >
                      <span class="h-1.5 w-1.5 rounded-full bg-[#6453D9]"></span>
                      <span>{{ chartHighlight.label }}</span>
                      <span>{{ chartHighlight.value }}</span>
                    </div>
                  }
                </div>
              </div>
            </section>

            <section class="rounded-[24px] border border-[#EFEFEF] bg-white p-[15px] text-center">
              <p class="text-left text-[14px] font-medium text-[#0D0D0D]/50">Most viewed listing</p>
              <div
                class="mx-auto mt-[18px] w-[100px] rounded-[10px] border border-[#EAEAEA] bg-white p-0.5 shadow-[0_4.7px_4.7px_rgba(192,192,192,0.25)]"
              >
                <div class="rounded-[8px] border border-[#EAEAEA] bg-[#EFEFEF] p-2">
                  @if (user().mostViewedListingImage) {
                    <img
                      [ngSrc]="user().mostViewedListingImage"
                      alt="Most viewed listing"
                      width="82"
                      height="82"
                      loading="lazy"
                      class="h-[82px] w-[82px] object-cover"
                    />
                  }
                </div>
                <div class="px-0.5 py-1 text-left">
                  <div class="flex items-center justify-between gap-1">
                    <p class="truncate text-[6px] leading-[8.7px] text-[#1F1F1F]">
                      {{ user().mostViewedListingTitle }}
                    </p>
                  </div>
                </div>
              </div>
              <p
                class="mx-auto mt-5 max-w-[246px] text-[17px] font-medium leading-[1.3] text-[#0D0D0D]/50"
              >
                This item has been viewed
                <span class="text-[#0D0D0D]">{{ user().mostViewedListingCount }}</span> times
              </p>
            </section>

            <section class="rounded-[24px] border border-[#EFEFEF] bg-white p-[15px]">
              <p class="text-[14px] font-medium text-[#0D0D0D]/50">Listings distribution</p>
              <div class="mt-6 flex h-1 overflow-hidden rounded-full">
                <span class="w-[51%] bg-[#25AD32]"></span>
                <span class="w-[26%] bg-[#4787FE]"></span>
                <span class="flex-1 bg-[#EE9C2E]"></span>
              </div>
              <div class="mt-6 flex flex-col gap-6">
                @for (item of user().distribution; track item.label) {
                  <div class="flex items-center justify-between">
                    <span class="flex items-center gap-2.5 text-[14px] text-[#0D0D0D]/50">
                      <span class="h-3 w-3 rounded-full" [style.background]="item.color"></span>
                      {{ item.label }}
                    </span>
                    <span class="text-[14px] font-medium text-[#0D0D0D]">{{ item.value }}</span>
                  </div>
                }
              </div>
              <button
                type="button"
                class="mt-6 text-[14px] font-medium leading-5 text-[#6453D9] underline underline-offset-2"
              >
                View more
              </button>
            </section>

            <section class="rounded-[20px] border border-[#EBEBEB] bg-white px-4 py-5">
              <div class="mb-4 flex items-center gap-2">
                <img
                  ngSrc="/assets/icons/admin-user-details/user.svg"
                  width="16"
                  height="16"
                  alt=""
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                <h2 class="text-[16px] font-semibold leading-6 text-[#0D0D0D]">Details</h2>
              </div>
              <dl class="flex flex-col gap-4 text-[14px] leading-5">
                <div class="flex items-center justify-between gap-4">
                  <dt class="w-[140px] text-[#0D0D0D]/50">Date joined</dt>
                  <dd class="text-right text-[#0D0D0D]">{{ user().dateJoined }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="w-[140px] text-[#0D0D0D]/50">Last signed in</dt>
                  <dd class="text-right text-[#0D0D0D]">{{ user().lastSignedIn }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="w-[140px] text-[#0D0D0D]/50">Name</dt>
                  <dd class="text-right text-[#0D0D0D]">{{ user().name }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="w-[140px] text-[#0D0D0D]/50">Email</dt>
                  <dd class="text-right text-[#0D0D0D]">{{ user().email }}</dd>
                </div>
                <div class="flex items-center justify-between gap-4">
                  <dt class="w-[140px] text-[#0D0D0D]/50">Phone number</dt>
                  <dd class="text-right text-[#0D0D0D]">{{ user().phoneNumber }}</dd>
                </div>
              </dl>
            </section>
          </div>
        } @else if (activeTab() === 'listings') {
          <div class="mt-6 flex flex-col gap-6">
            <div class="flex items-center gap-3">
              <label class="relative block flex-1">
                <img
                  ngSrc="/assets/icons/admin-users/search.svg"
                  width="16"
                  height="16"
                  alt=""
                  class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  [value]="listingsSearchQuery()"
                  (input)="updateListingsSearchQuery($any($event.target).value)"
                  placeholder="Search"
                  class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-10 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
                />
              </label>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-black"
                aria-label="Filter listings"
              >
                <img
                  ngSrc="/assets/icons/admin-users/filter-tuning.svg"
                  width="22"
                  height="18"
                  alt=""
                  class="h-[18px] w-[22px]"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div class="flex flex-col">
              @for (listing of visibleMobileListings(); track listing.id) {
                <article class="border-b border-[#EBEBEB] py-3 first:pt-0">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <div
                        class="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-[6.6px] border border-[#F0F0F0] bg-[#EFEFEF]"
                      >
                        @if (listing.thumbnail) {
                          <img
                            [ngSrc]="listing.thumbnail"
                            [alt]="listing.name"
                            width="44"
                            height="44"
                            loading="lazy"
                            class="h-11 w-11 object-cover"
                          />
                        }
                      </div>

                      <div class="min-w-0">
                        <h2 class="truncate text-[16px] font-medium leading-6 text-[#0D0D0D]/80">
                          {{ listing.name }}
                        </h2>
                        @if (listing.promoted) {
                          <span
                            class="mt-1 inline-flex items-center gap-1 text-[12px] leading-4 text-[#7F8081]"
                          >
                            <span aria-hidden="true">🚀</span>
                            Promoted
                          </span>
                        }
                      </div>
                    </div>

                    <span
                      class="inline-flex h-6 shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-[12px] font-semibold leading-4"
                      [class.bg-[#F9F9F9]]="listing.status === 'available'"
                      [class.text-[#EE9C2E]]="listing.status === 'available'"
                      [class.bg-[#EDF9EF]]="listing.status === 'sold'"
                      [class.text-[#25AD32]]="listing.status === 'sold'"
                      [class.bg-[#F4F4F4]]="listing.status === 'draft'"
                      [class.text-[#5A5A5A]]="listing.status === 'draft'"
                      [class.bg-[#FDF6FA]]="listing.status === 'suspended'"
                      [class.text-[#FF2524]]="listing.status === 'suspended'"
                    >
                      @if (listing.status === 'available') {
                        <svg
                          class="h-3.5 w-3.5 shrink-0"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 12.8333C10.2217 12.8333 12.8333 10.2217 12.8333 7C12.8333 3.77834 10.2217 1.16667 7 1.16667C3.77834 1.16667 1.16667 3.77834 1.16667 7C1.16667 10.2217 3.77834 12.8333 7 12.8333Z"
                            fill="currentColor"
                          />
                          <path
                            d="M7 3.79166V7L8.75 8.75"
                            stroke="white"
                            stroke-width="1.1"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          />
                        </svg>
                      } @else if (listing.status === 'sold') {
                        <img
                          ngSrc="/assets/icons/admin-user-details/tick-circle.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      } @else if (listing.status === 'draft') {
                        <svg
                          class="h-3.5 w-3.5 shrink-0"
                          viewBox="0 0 14 14"
                          fill="none"
                          aria-hidden="true"
                        >
                          <rect
                            x="1.16667"
                            y="1.16667"
                            width="11.6667"
                            height="11.6667"
                            rx="2.33333"
                            fill="currentColor"
                          />
                          <path
                            d="M4.08334 4.66667H9.91667"
                            stroke="white"
                            stroke-width="1.1"
                            stroke-linecap="round"
                          />
                          <path
                            d="M4.08334 6.99999H9.91667"
                            stroke="white"
                            stroke-width="1.1"
                            stroke-linecap="round"
                          />
                          <path
                            d="M4.08334 9.33333H7.58334"
                            stroke="white"
                            stroke-width="1.1"
                            stroke-linecap="round"
                          />
                        </svg>
                      } @else {
                        <img
                          ngSrc="/assets/icons/admin-users/slash.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="h-3.5 w-3.5 shrink-0"
                          aria-hidden="true"
                        />
                      }
                      {{ mobileListingStatusLabel(listing.status) }}
                    </span>
                  </div>

                  <dl
                    class="mt-4 grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-3 text-[14px] leading-5"
                  >
                    <dt class="text-[#1A1B1D]/50">Store</dt>
                    <dd class="text-right font-medium text-[#1A1B1D]">{{ listing.storeName }}</dd>

                    <dt class="text-[#1A1B1D]/50">Amount</dt>
                    <dd class="text-right font-medium text-[#1A1B1D]">{{ listing.price }}</dd>
                  </dl>
                </article>
              }
            </div>
          </div>
        } @else if (activeTab() === 'stores') {
          <div class="mt-6 grid grid-cols-2 gap-2">
            @for (store of visibleMobileStores(); track store.id) {
              <article class="overflow-hidden rounded-[13.746px] border border-[#EAEAEA] bg-white">
                <div class="relative h-[90.5px] overflow-hidden rounded-t-[11.455px]">
                  @if (store.mobileCoverImage ?? store.coverImage; as mobileCoverImage) {
                    <img
                      [ngSrc]="mobileCoverImage"
                      [alt]="store.name"
                      width="173"
                      height="90"
                      loading="lazy"
                      class="h-full w-full object-cover"
                    />
                  }
                  <div
                    class="absolute inset-x-0 bottom-0 h-[56px] bg-[linear-gradient(179.79deg,rgba(255,255,255,0)_0.54%,#FFFFFF_93.47%)]"
                    aria-hidden="true"
                  ></div>
                </div>

                <div class="relative px-[10.88px] pb-[10px] pt-0">
                  <div
                    class="-mt-[49px] flex h-[42.385px] w-[42.385px] items-center justify-center overflow-hidden rounded-full border-[2.291px] border-white bg-white"
                    [class.bg-[#3D785F]]="store.id === 'vine-collections'"
                  >
                    @if (
                      store.mobileLogoImage ?? store.logoImage ?? store.logo;
                      as mobileLogoImage
                    ) {
                      <img
                        [ngSrc]="mobileLogoImage"
                        [alt]="store.name + ' logo'"
                        width="42"
                        height="42"
                        loading="lazy"
                        class="h-full w-full object-cover"
                      />
                    } @else {
                      <span class="text-[11px] font-semibold text-[#1F1F1F]">{{
                        storeInitials(store.name)
                      }}</span>
                    }
                  </div>

                  <div class="mt-2">
                    <div class="flex items-center gap-[2.3px]">
                      <h2
                        class="truncate text-[12px] font-medium leading-[13.746px] text-[#1F1F1F]"
                      >
                        {{ store.name }}
                      </h2>
                      @if (store.isVerified === true) {
                        <img
                          ngSrc="/assets/icons/admin-user-details/stores/verify.svg"
                          width="12"
                          height="12"
                          alt=""
                          class="h-3 w-3 shrink-0"
                          aria-hidden="true"
                        />
                      }
                    </div>

                    <div
                      class="mt-[2px] flex items-center gap-[2.24px] text-[10px] leading-[8.968px] text-[#959595]"
                    >
                      <img
                        ngSrc="/assets/icons/admin-user-details/stores/location.svg"
                        width="10"
                        height="10"
                        alt=""
                        class="h-[10px] w-[10px] shrink-0"
                        aria-hidden="true"
                      />
                      {{ store.location ?? store.metaLabel }}
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>
        } @else if (activeTab() === 'ads') {
          <div class="mt-6 flex flex-col gap-6">
            <section class="relative overflow-hidden rounded-[24px] bg-[#F3F1FF] px-4 pb-4 pt-4">
              <div class="relative z-10 flex items-start justify-between gap-4">
                <div>
                  <p class="text-[14px] leading-5 text-[#1F1F1F]">
                    {{ subscriptionSummary()?.planName ?? 'No active plan' }}
                  </p>
                  <p class="mt-3 text-[0px] leading-none text-[#1F1F1F]">
                    <span class="text-[32px] font-medium leading-8 tracking-[-0.04em]">{{
                      subscriptionSummary()?.price ?? '₦0'
                    }}</span>
                  </p>
                  <p class="mt-2 text-[12px] leading-4 text-[#0D0D0D]/70">
                    Expires on: {{ subscriptionSummary()?.activeUntil ?? '—' }}
                  </p>
                </div>

                <span
                  class="inline-flex h-7 shrink-0 items-center rounded-full bg-white px-2 text-[12px] font-medium leading-5 text-[#6453D9] shadow-[0_4px_8px_rgba(188,188,188,0.25)]"
                >
                  Current plan
                </span>
              </div>

              <img
                ngSrc="/assets/images/admin-user-details/ads/mobile/plan-star.png"
                width="96"
                height="96"
                alt=""
                class="pointer-events-none absolute bottom-[-10px] right-[-8px] h-24 w-24"
                aria-hidden="true"
              />
            </section>

            <div
              class="-mx-3 overflow-x-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              <div class="flex w-max items-center gap-5">
                @for (placement of adPlacementTabs; track placement.value) {
                  <button
                    type="button"
                    (click)="activeAdsPlacement.set(placement.value)"
                    class="text-[16px] font-medium leading-6 transition"
                    [class.text-[#0D0D0D]]="activeAdsPlacement() === placement.value"
                    [class.text-[#0D0D0D]/40]="activeAdsPlacement() !== placement.value"
                  >
                    {{ placement.label }}
                  </button>
                }
              </div>
            </div>

            <div class="flex flex-wrap gap-[10px]">
              @for (status of adStatusTabs(); track status.value) {
                <button
                  type="button"
                  (click)="activeAdsStatus.set(status.value)"
                  class="inline-flex h-10 items-center rounded-[16px] px-4 text-[12px] font-medium leading-4 transition"
                  [class.bg-[#1A1A1A]]="activeAdsStatus() === status.value"
                  [class.text-white]="activeAdsStatus() === status.value"
                  [class.bg-[#F4F4F4]]="activeAdsStatus() !== status.value"
                  [class.text-[#1A1A1A]]="activeAdsStatus() !== status.value"
                >
                  {{ status.label }} ({{ countUserAdsByStatus(status.value) }})
                </button>
              }
            </div>

            @if (activeAdsPlacement() === 'store promotions') {
              <div class="grid grid-cols-2 gap-2">
                @for (store of visibleMobilePromotedStores(); track store.id) {
                  <app-store-card [store]="store" [showFavorite]="false"></app-store-card>
                }
              </div>
            } @else if (activeAdsPlacement() === 'banner ads') {
              <div class="flex flex-col gap-[17.199px]">
                @for (banner of visibleBannerAds(); track banner.id) {
                  <app-banner-promotion-card
                    [card]="banner"
                    [compact]="true"
                  ></app-banner-promotion-card>
                }
              </div>
            } @else if (activeAdsPlacement() === 'promoted listings') {
              <div class="flex flex-col gap-8">
                @for (section of visibleMobilePromotedListingSections(); track section.category) {
                  <section>
                    <div class="mb-4 flex items-center justify-between gap-4">
                      <h2
                        class="text-[16px] font-medium leading-6 tracking-[-0.03em] text-[#1F1F1F]"
                      >
                        {{ section.label }}
                      </h2>

                      <span class="text-[12px] leading-6 text-[#959595]">
                        {{ section.items.length }} ads
                      </span>
                    </div>

                    <div class="grid grid-cols-2 gap-x-2 gap-y-4">
                      @for (ad of section.items; track ad.id) {
                        <article
                          class="overflow-hidden rounded-[13.451px] border-[0.561px] border-[#EAEAEA] bg-white p-[2.242px]"
                        >
                          <div
                            class="relative h-[159px] overflow-hidden rounded-[11.21px]"
                            [class.bg-[#BEBEBE]]="!ad.imageBackground"
                            [style.background]="ad.imageBackground ?? null"
                          >
                            @if (ad.image) {
                              <img
                                [ngSrc]="ad.image"
                                [alt]="ad.title"
                                width="167"
                                height="159"
                                loading="lazy"
                                class="h-full w-full"
                                [class.object-cover]="(ad.imageFit ?? 'cover') === 'cover'"
                                [class.object-contain]="(ad.imageFit ?? 'cover') === 'contain'"
                              />
                            }

                            @if (ad.showImageGradient) {
                              <div
                                class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62.75%,rgba(0,0,0,0.5)_100%)]"
                                aria-hidden="true"
                              ></div>
                            }

                            <span
                              class="absolute left-[6.73px] top-[6.73px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                            >
                              Active until: {{ ad.expiresOn }}
                            </span>

                            @if (ad.discountLabel) {
                              <span
                                class="absolute left-[6.73px] top-[28px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[10px] font-medium leading-3 text-[#4E3E07]"
                              >
                                {{ ad.discountLabel }}
                              </span>
                            }
                          </div>

                          <div class="flex flex-col gap-2 px-[2.242px] pb-[8.407px] pt-[6.726px]">
                            <h3 class="truncate text-[13px] leading-[11.21px] text-[#1F1F1F]">
                              {{ ad.title }}
                            </h3>

                            <div class="text-[14px] font-medium leading-[13.451px] text-[#1F1F1F]">
                              @if ((ad.priceDisplay ?? 'strikethrough-n') === 'strikethrough-n') {
                                <span class="line-through">N</span>{{ ad.price }}
                              } @else if ((ad.priceDisplay ?? 'strikethrough-n') === 'naira-icon') {
                                <span>₦</span>{{ ad.price }}
                                @if (ad.oldPrice) {
                                  <span class="ml-1 text-[12px] text-[#959595] line-through"
                                    >₦{{ ad.oldPrice }}</span
                                  >
                                }
                              } @else {
                                {{ ad.price }}
                              }
                            </div>

                            <div
                              class="flex items-center gap-[10px] text-[12px] leading-4 text-[#959595]"
                            >
                              <span class="inline-flex items-center gap-[2px]">
                                <img
                                  ngSrc="/assets/icons/admin-user-details/ads/eye.svg"
                                  width="12"
                                  height="12"
                                  alt=""
                                  class="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                {{ ad.views }}
                              </span>
                              <span class="inline-flex items-center gap-[2px]">
                                <img
                                  ngSrc="/assets/icons/admin-user-details/ads/click.svg"
                                  width="12"
                                  height="12"
                                  alt=""
                                  class="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                {{ ad.clicks }}
                              </span>
                              <span class="inline-flex items-center gap-[2px]">
                                <img
                                  ngSrc="/assets/icons/admin-user-details/ads/messages.svg"
                                  width="12"
                                  height="12"
                                  alt=""
                                  class="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                {{ ad.messages }}
                              </span>
                              <span class="inline-flex items-center gap-[2px]">
                                <img
                                  ngSrc="/assets/icons/admin-user-details/ads/call.svg"
                                  width="12"
                                  height="12"
                                  alt=""
                                  class="h-3 w-3 shrink-0"
                                  aria-hidden="true"
                                />
                                {{ ad.calls }}
                              </span>
                            </div>
                          </div>
                        </article>
                      }
                    </div>
                  </section>
                }
              </div>
            } @else {
              <div class="rounded-[20px] border border-dashed border-[#EAEAEA] p-8 text-center">
                <h2 class="text-[18px] font-semibold text-[#1A1B1D]">{{ activeAdsPlacement() }}</h2>
                <p class="mt-2 text-[14px] text-[#959595]">
                  This Ads placement is ready for the next pass.
                </p>
              </div>
            }
          </div>
        } @else if (activeTab() === 'transactions') {
          <div class="mt-8 flex flex-col gap-6">
            <section>
              <h2
                class="max-w-[350px] text-[32px] font-medium leading-[1.3] tracking-[-0.04em] text-[#414141]"
              >
                They currently have
                <span class="font-bold text-[#959595]">{{ walletBalance() }}</span>
                in their wallet
              </h2>
            </section>

            <section class="flex flex-col gap-6">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <h3 class="text-[16px] font-medium leading-5 text-[#4D4845]">
                    Transaction history
                  </h3>
                  <p class="mt-1 text-[12px] leading-4 text-[#928F8B]">
                    {{ transactionsTotal() }} total
                  </p>
                </div>
              </div>

              <div class="flex flex-col gap-6">
                @for (transaction of recentMobileTransactions(); track transaction.id) {
                  <article class="flex items-center gap-3">
                    <div
                      class="relative h-10 w-10 shrink-0 rounded-full border border-[#F4F4F2] bg-white"
                    >
                      <img
                        [ngSrc]="transaction.icon"
                        [alt]="transaction.type"
                        width="24"
                        height="24"
                        class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                      />
                      <span
                        class="absolute bottom-0 right-0 flex h-[19px] w-[19px] items-center justify-center rounded-full bg-white shadow-[0_3px_9px_rgba(172,172,172,0.25)]"
                      >
                        <img
                          ngSrc="/assets/icons/admin-user-details/transactions/transaction-direction-down.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="h-[14px] w-[14px]"
                          aria-hidden="true"
                        />
                      </span>
                    </div>

                    <div class="flex min-w-0 flex-1 items-start justify-between gap-4">
                      <div class="min-w-0">
                        <h4 class="truncate text-[14px] font-medium leading-5 text-[#4D4845]">
                          {{ transaction.type }}
                        </h4>
                        <p class="mt-1 truncate text-[12px] leading-4 text-[#928F8B]">
                          {{ transaction.dateLabel }}
                        </p>
                      </div>

                      <div class="text-right">
                        <p class="text-[14px] font-medium leading-5 text-[#215B44]">
                          {{ transaction.amount }}
                        </p>
                        <p
                          class="mt-1 text-[12px] leading-4"
                          [class.text-[#50BD5A]]="transaction.status === 'successful'"
                          [class.text-[#FF2524]]="transaction.status === 'failed'"
                        >
                          {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                        </p>
                      </div>
                    </div>
                  </article>
                }
              </div>
            </section>
          </div>
        } @else if (activeTab() === 'reviews') {
          <div class="mt-6 flex flex-col gap-8">
            <section class="rounded-[16px] bg-[#FAFAFA] px-3 py-[23px]">
              <div class="flex items-start justify-center gap-8">
                <div class="flex flex-col items-center gap-0.5">
                  <p class="text-center text-[0px] leading-none text-[#2D2D2D]">
                    <span class="text-[40px] font-semibold leading-[48px] tracking-[-0.04em]">{{
                      reviewAverage()
                    }}</span>
                    <span class="text-[20px] font-medium leading-6 text-[#BFBFBF]">/5</span>
                  </p>

                  <div
                    class="flex items-center gap-1 text-[20px] leading-5 text-[#D3DC35]"
                    [attr.aria-label]="reviewAverage() + ' out of 5 stars'"
                  >
                    @for (star of reviewStarsScale; track star) {
                      <span>★</span>
                    }
                  </div>
                </div>

                <div class="min-w-0 flex-1">
                  <h3 class="text-[16px] font-semibold leading-6 text-[#2D2D2D]">Overall rating</h3>

                  <div class="mt-1 flex flex-col gap-2">
                    @for (bar of ratingBreakdown(); track bar.stars) {
                      <div class="flex items-center gap-3">
                        <span
                          class="inline-flex min-w-[23px] items-center gap-0.5 text-[14px] leading-5 text-[#2D2D2D]"
                        >
                          {{ bar.stars }} <span class="text-[12px] text-[#D3DC35]">★</span>
                        </span>
                        <div class="h-[7px] w-[84px] overflow-hidden rounded-[16px] bg-[#EAEAEA]">
                          <div
                            class="h-full rounded-[16px] bg-[#2D2D2D]"
                            [style.width.%]="bar.percentage"
                          ></div>
                        </div>
                        <span class="w-[31px] text-center text-[14px] leading-5 text-[#959595]"
                          >{{ bar.percentage }}%</span
                        >
                      </div>
                    }
                  </div>
                </div>
              </div>
            </section>

            <section class="flex flex-col gap-7">
              <div class="flex items-center justify-between gap-4">
                <h2 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">
                  {{ reviewTotal() }} reviews
                </h2>

                <app-custom-dropdown
                  [options]="reviewSortOptions"
                  [value]="reviewSort()"
                  [ariaLabel]="'Sort user reviews'"
                  [buttonClass]="'inline-flex h-8 items-center gap-1 rounded-full border border-[#EAEAEA] bg-white px-2 text-[14px] font-normal leading-5 text-[#1A1B1D]'"
                  [labelClass]="'truncate'"
                  [iconClass]="'text-[#777777]'"
                  [menuClass]="'min-w-[156px]'"
                  [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                  [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                  (valueChange)="reviewSort.set($event)"
                ></app-custom-dropdown>
              </div>

              <div>
                <h3 class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                  This listing is great at..
                </h3>

                <div class="mt-3 flex flex-wrap gap-x-[7px] gap-y-[13px]">
                  @for (tag of mobileReviewTags(); track tag.label) {
                    <span
                      class="inline-flex items-center rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-3 py-2 text-[16px] font-medium leading-6 text-[#5A5A5A]"
                    >
                      {{ tag.label }} ({{ tag.count }})
                    </span>
                  }
                </div>
              </div>

              <div class="flex flex-col gap-8">
                @for (review of visibleMobileReviews(); track review.author + review.date) {
                  <article class="flex flex-col gap-[18px]">
                    <div class="flex flex-col gap-2">
                      <div class="flex items-center gap-2">
                        <div class="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                          @if (review.avatar) {
                            <img
                              [ngSrc]="review.avatar"
                              [alt]="review.author"
                              width="44"
                              height="44"
                              loading="lazy"
                              class="h-11 w-11 object-cover"
                            />
                          } @else {
                            <span
                              class="flex h-11 w-11 items-center justify-center rounded-full text-[12px] font-semibold text-[#1A1C21]"
                              [style.background]="avatarGradientForLabel(review.author)"
                            >
                              {{ initialsFromLabel(review.author) }}
                            </span>
                          }
                        </div>
                        <h4 class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                          {{ review.author }}
                        </h4>
                      </div>

                      <div class="flex items-center gap-2">
                        <div class="flex items-center gap-0.5">
                          @for (filled of reviewStars(review.rating); track $index) {
                            <span
                              class="text-[12px] leading-3"
                              [class.text-[#2D2D2D]]="filled"
                              [class.text-[#D9D9D9]]="!filled"
                              >★</span
                            >
                          }
                        </div>
                        <span class="text-[3px] leading-none text-[#8C8C8C]">●</span>
                        <span class="text-[14px] leading-5 text-[#8C8C8C]">{{ review.date }}</span>
                      </div>
                    </div>

                    <p class="text-[16px] leading-6 text-[#1F1F1F]">{{ review.text }}</p>

                    @if (review.images?.length) {
                      <div
                        class="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                      >
                        @for (image of review.images!; track $index) {
                          <div
                            class="relative h-[77.898px] w-[77.898px] shrink-0 overflow-hidden rounded-[10.653px] bg-[#E9E9E9]"
                          >
                            <img
                              [ngSrc]="image"
                              alt=""
                              width="78"
                              height="78"
                              loading="lazy"
                              class="h-full w-full object-cover"
                            />

                            @if ($last && review.moreImagesLabel) {
                              <div
                                class="absolute inset-0 flex items-center justify-center bg-black/50 text-[11.984px] font-medium leading-4 text-white"
                              >
                                {{ review.moreImagesLabel }}
                              </div>
                            }
                          </div>
                        }
                      </div>
                    }
                  </article>
                }
              </div>
            </section>
          </div>
        } @else if (activeTab() === 'reports') {
          <div class="mt-6 flex flex-col gap-4">
            <div class="flex items-center gap-5">
              <button
                type="button"
                (click)="activeReportTab.set('profile')"
                class="text-[20px] font-medium leading-6 transition"
                [class.text-[#1A1B1D]]="activeReportTab() === 'profile'"
                [class.text-[#0D0D0D]/40]="activeReportTab() !== 'profile'"
              >
                Profile reports
              </button>
              <button
                type="button"
                (click)="activeReportTab.set('listing')"
                class="text-[20px] font-medium leading-6 transition"
                [class.text-[#1A1B1D]]="activeReportTab() === 'listing'"
                [class.text-[#0D0D0D]/40]="activeReportTab() !== 'listing'"
              >
                Listing reports
              </button>
            </div>

            <label class="relative block">
              <img
                ngSrc="/assets/icons/admin-users/search.svg"
                width="16"
                height="16"
                alt=""
                class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                aria-hidden="true"
              />
              <input
                type="text"
                [value]="reportSearchQuery()"
                (input)="updateReportSearchQuery($any($event.target).value)"
                placeholder="Search"
                class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-11 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
              />
            </label>

            <div class="flex flex-col gap-4">
              @if (activeReportTab() === 'profile') {
                @for (report of visibleMobileProfileReports(); track report.id) {
                  <article class="border-b border-[#EBEBEB] py-3 first:pt-0">
                    <div class="flex items-start justify-between gap-3">
                      <div class="flex items-center gap-2">
                        <div
                          class="flex h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full bg-white"
                        >
                          @if (report.storeLogo) {
                            <img
                              [ngSrc]="report.storeLogo"
                              [alt]="report.storeName"
                              width="42"
                              height="42"
                              loading="lazy"
                              class="h-[42px] w-[42px] object-cover"
                            />
                          } @else {
                            <span class="text-[12px] font-semibold text-[#1A1C21]">{{
                              storeInitials(report.storeName)
                            }}</span>
                          }
                        </div>
                        <h2 class="text-[16px] font-medium leading-5 text-[#1A1B1D]">
                          {{ report.storeName }}
                        </h2>
                      </div>
                    </div>

                    <dl class="mt-4 flex flex-col gap-3">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reported by</dt>
                        <dd
                          class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#1A1B1D]"
                        >
                          @if (report.reporterAvatar) {
                            <img
                              [ngSrc]="report.reporterAvatar"
                              [alt]="report.reporterName"
                              width="24"
                              height="24"
                              loading="lazy"
                              class="h-6 w-6 rounded-full object-cover"
                            />
                          } @else {
                            <span
                              class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-[#1A1C21]"
                              [style.background]="avatarGradientForLabel(report.reporterName)"
                            >
                              {{ initialsFromLabel(report.reporterName) }}
                            </span>
                          }
                          {{ report.reporterName }}
                        </dd>
                      </div>

                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reason</dt>
                        <dd class="text-right text-[14px] font-medium leading-5 text-[#1A1B1D]">
                          {{ report.reason }}
                        </dd>
                      </div>

                      <div class="flex items-start justify-between gap-4">
                        <dt class="pt-px text-[14px] leading-5 text-[#1A1B1D]/50">Description</dt>
                        <dd
                          class="max-w-[215px] text-right text-[12px] leading-4 text-[#0D0D0D]/40"
                        >
                          {{ report.description }}
                        </dd>
                      </div>
                    </dl>
                  </article>
                }
              } @else {
                @for (report of visibleListingReports(); track report.id) {
                  <article class="border-b border-[#EBEBEB] py-3 first:pt-0">
                    <div class="flex items-start gap-2">
                      <div
                        class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[8px] border border-[#EAEAEA] bg-white"
                      >
                        @if (report.listingImage) {
                          <img
                            [ngSrc]="report.listingImage"
                            [alt]="report.listingName"
                            width="40"
                            height="40"
                            loading="lazy"
                            class="h-10 w-10 object-cover"
                          />
                        }
                      </div>
                      <div class="min-w-0 flex-1 pt-0.5">
                        <h2 class="truncate text-[16px] font-medium leading-5 text-[#1A1B1D]">
                          {{ report.listingName }}
                        </h2>
                      </div>
                    </div>

                    <dl class="mt-4 flex flex-col gap-3">
                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Reported by</dt>
                        <dd
                          class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#1A1B1D]"
                        >
                          @if (report.reporterAvatar) {
                            <img
                              [ngSrc]="report.reporterAvatar"
                              [alt]="report.reporterName"
                              width="24"
                              height="24"
                              loading="lazy"
                              class="h-6 w-6 rounded-full object-cover"
                            />
                          } @else {
                            <span
                              class="flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold text-[#1A1C21]"
                              [style.background]="avatarGradientForLabel(report.reporterName)"
                            >
                              {{ initialsFromLabel(report.reporterName) }}
                            </span>
                          }
                          {{ report.reporterName }}
                        </dd>
                      </div>

                      <div class="flex items-center justify-between gap-4">
                        <dt class="text-[14px] leading-5 text-[#1A1B1D]/50">Store</dt>
                        <dd
                          class="flex items-center gap-2 text-right text-[14px] font-medium leading-5 text-[#1A1B1D]"
                        >
                          @if (report.storeIcon) {
                            <img
                              [ngSrc]="report.storeIcon"
                              [alt]="report.storeName"
                              width="24"
                              height="24"
                              loading="lazy"
                              class="h-6 w-6 rounded-full object-cover"
                            />
                          } @else {
                            <span class="text-[12px] font-semibold text-[#1A1C21]">{{
                              storeInitials(report.storeName)
                            }}</span>
                          }
                          {{ report.storeName }}
                        </dd>
                      </div>

                      <div class="flex items-start justify-between gap-4">
                        <dt class="pt-px text-[14px] leading-5 text-[#1A1B1D]/50">Description</dt>
                        <dd
                          class="max-w-[215px] text-right text-[12px] leading-4 text-[#0D0D0D]/40"
                        >
                          {{ report.description }}
                        </dd>
                      </div>
                    </dl>
                  </article>
                }
              }
            </div>
          </div>
        } @else if (activeTab() === 'activities') {
          <div class="mt-6 flex flex-col gap-[15px]">
            @for (yearGroup of visibleActivityTimeline(); track yearGroup.year) {
              <section class="flex flex-col gap-4">
                <h2
                  class="text-[16px] font-medium leading-[1.2] tracking-[-0.02em] text-[#0D0D0D]/40"
                >
                  {{ yearGroup.year }}
                </h2>

                <div class="flex flex-col gap-8">
                  @for (group of yearGroup.groups; track group.label) {
                    <div class="flex flex-col gap-5">
                      <div class="flex items-center gap-2">
                        <span
                          class="inline-flex h-9 items-center rounded-full bg-[#FAFAFA] px-3 text-[16px] font-medium leading-6 text-[#1A1B1D]/50"
                        >
                          {{ group.label }}
                        </span>
                        <div class="flex min-w-0 flex-1 items-center gap-2">
                          <div class="h-px flex-1 bg-[#EBEBEB]"></div>
                          <img
                            ngSrc="/assets/icons/admin-user-details/arrow-down.svg"
                            width="16"
                            height="16"
                            alt=""
                            class="h-4 w-4"
                            aria-hidden="true"
                          />
                        </div>
                      </div>

                      <div class="flex flex-col gap-0">
                        @for (activity of group.items; track activity.id) {
                          <article class="grid grid-cols-[40px_minmax(0,1fr)] gap-3">
                            <div class="flex flex-col items-center">
                              <div
                                class="flex h-10 w-10 items-center justify-center rounded-full border border-[#EBEBEB] bg-white"
                              >
                                <img
                                  [ngSrc]="activityIcon(activity.kind)"
                                  alt=""
                                  width="18"
                                  height="18"
                                  class="h-[18px] w-[18px] opacity-50"
                                  aria-hidden="true"
                                />
                              </div>

                              @if (!$last) {
                                <span class="h-[43px] w-px bg-[#EBEBEB]"></span>
                              }
                            </div>

                            <div class="pb-8 last:pb-0">
                              <h3 class="text-[16px] leading-6 tracking-[-0.02em] text-[#0C0C0C]">
                                {{ activity.title }}
                              </h3>

                              @if (activity.detail) {
                                <div
                                  class="mt-2 inline-flex max-w-full rounded-full bg-[#FAFAFA] px-3 py-1.5 text-[14px] font-medium leading-5 text-[#1A1B1D]/70"
                                >
                                  {{ activity.detail }}
                                </div>
                              }

                              <div
                                class="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[14px] leading-5 text-[#0D0D0D]/40"
                              >
                                <span>by</span>
                                <span class="inline-flex items-center gap-1">
                                  @if (
                                    activity.mobileActorAvatar ?? activity.actorAvatar;
                                    as mobileActorAvatar
                                  ) {
                                    <img
                                      [ngSrc]="mobileActorAvatar"
                                      [alt]="activity.actorName"
                                      width="22"
                                      height="22"
                                      loading="lazy"
                                      class="h-[22px] w-[22px] rounded-full object-cover"
                                    />
                                  } @else {
                                    <span
                                      class="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-semibold text-[#1A1C21]"
                                      [style.background]="activity.actorBackground"
                                    >
                                      {{ activity.actorInitials }}
                                    </span>
                                  }
                                  <span class="text-[#1A1B1D]">{{ activity.actorName }}</span>
                                </span>
                                <span>{{ activity.timestamp }}</span>
                              </div>
                            </div>
                          </article>
                        }
                      </div>
                    </div>
                  }
                </div>
              </section>
            }
          </div>
        } @else {
          <div class="mt-8 rounded-[20px] border border-dashed border-[#EAEAEA] p-8 text-center">
            <h2 class="text-[18px] font-semibold text-[#1A1B1D]">{{ activeTabLabel() }}</h2>
            <p class="mt-2 text-[14px] text-[#959595]">
              This mobile tab is ready for the next pass.
            </p>
          </div>
        }
      </section>

      <div
        class="hidden h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] lg:flex"
      >
        <div class="px-6 py-6 sm:px-8">
          <div class="flex flex-wrap items-center gap-2 text-[14px] font-medium text-[#A5A7AE]">
            <a routerLink="/admin/users" class="transition hover:text-[#6B5CF0]">Users</a>
            <span>/</span>
            <span class="text-[#6A6D75]">User details</span>
          </div>

          <div
            class="mt-6 flex flex-col gap-5 border-b border-[#EEF0F4] pb-6 xl:flex-row xl:items-start xl:justify-between"
          >
            <div class="flex min-w-0 items-start gap-4">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-[18px] font-semibold text-[#1A1C21]"
                [style.background]="user().avatarBackground"
              >
                {{ user().avatarInitials }}
              </span>

              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-3">
                  <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#1A1C21]">
                    {{ user().name }}
                  </h1>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold"
                    [class.bg-[#EDF9EF]]="user().status === 'active'"
                    [class.text-[#2FB04A]]="user().status === 'active'"
                    [class.bg-[#FFF0F0]]="user().status === 'suspended'"
                    [class.text-[#FF4B4B]]="user().status === 'suspended'"
                    [class.bg-[#FFF7ED]]="user().status === 'banned'"
                    [class.text-[#C2410C]]="user().status === 'banned'"
                  >
                    <span
                      class="flex h-3.5 w-3.5 items-center justify-center rounded-full text-[9px] font-bold text-white"
                      [class.bg-[#2FB04A]]="user().status === 'active'"
                      [class.bg-[#FF4B4B]]="user().status === 'suspended'"
                      [class.bg-[#C2410C]]="user().status === 'banned'"
                    >
                      {{ user().status === 'active' ? '✓' : '!' }}
                    </span>
                    {{
                      user().status === 'active'
                        ? 'Active'
                        : user().status === 'banned'
                          ? 'Banned'
                          : 'Suspended'
                    }}
                  </span>
                </div>
                <p class="mt-1 text-[16px] font-medium text-[#8E9199]">{{ user().email }}</p>
              </div>
            </div>

            <div class="relative flex items-center gap-3 self-start">
              @if (isUserActionsOpen()) {
                <button
                  type="button"
                  class="fixed inset-0 z-10 cursor-default"
                  (click)="isUserActionsOpen.set(false)"
                  aria-label="Close user actions menu"
                ></button>
              }

              <button
                type="button"
                (click)="downloadUserData()"
                [disabled]="isDownloadingUserData()"
                class="inline-flex items-center gap-2 rounded-full border border-[#E7EAF0] bg-white px-5 py-3 text-[14px] font-medium text-[#2A2D34] transition hover:bg-[#FAFAFC]"
                [class.cursor-wait]="isDownloadingUserData()"
                [class.opacity-60]="isDownloadingUserData()"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-[#555A64]"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d="M10.75 3.5a.75.75 0 00-1.5 0v7.19L6.53 7.97a.75.75 0 10-1.06 1.06l4 4a.75.75 0 001.06 0l4-4a.75.75 0 10-1.06-1.06l-2.72 2.72V3.5z"
                  />
                  <path d="M4.75 14a.75.75 0 000 1.5h10.5a.75.75 0 000-1.5H4.75z" />
                </svg>
                {{ isDownloadingUserData() ? 'Preparing…' : 'Download data' }}
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
                  class="absolute right-0 top-[calc(100%+0.5rem)] z-20 flex w-[172px] flex-col gap-1 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white p-[10px] shadow-[0_6.65px_5.32px_0_rgba(0,0,0,0.03),0_2.767px_2.214px_0_rgba(0,0,0,0.02)]"
                  (click)="$event.stopPropagation()"
                >
                  <button
                    type="button"
                    (click)="handlePrimaryUserAction()"
                    class="flex h-8 w-full items-center gap-1.5 rounded-[8px] bg-white px-2 text-left text-[14px] font-medium leading-5 text-[#FF2524]"
                  >
                    <img
                      ngSrc="/assets/icons/admin-user-details/menu-slash.svg"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px] shrink-0"
                      aria-hidden="true"
                    />
                    {{ primaryUserActionLabel() }}
                  </button>
                  <button
                    type="button"
                    (click)="banUser()"
                    class="flex h-8 w-full items-center gap-1.5 rounded-[8px] bg-white px-2 text-left text-[14px] font-medium leading-5 text-[#FF2524]"
                  >
                    <img
                      ngSrc="/assets/icons/admin-user-details/menu-trash.svg"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px] shrink-0"
                      aria-hidden="true"
                    />
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
                  <span
                    class="h-4 w-4"
                    [style.background-color]="activeTab() === tab.id ? '#6B5CF0' : '#8E9199'"
                    [style.-webkit-mask]="'url(' + tab.icon + ') center / contain no-repeat'"
                    [style.mask]="'url(' + tab.icon + ') center / contain no-repeat'"
                    aria-hidden="true"
                  ></span>
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
                <section
                  class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6"
                >
                  <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p class="text-[13px] font-semibold text-[#A2A7B0]">Total sold items</p>
                      <h2 class="mt-1 text-[24px] font-semibold tracking-tight text-[#1A1C21]">
                        {{ user().totalSoldItems }}
                      </h2>
                      <span
                        class="mt-3 inline-flex rounded-full bg-[#EBF8EF] px-3 py-1 text-[12px] font-semibold text-[#2FB04A]"
                      >
                        {{ user().growthLabel }}
                      </span>
                    </div>

                    <app-custom-dropdown
                      [options]="overviewRangeOptions"
                      [value]="overviewRange()"
                      [ariaLabel]="'Filter user overview range'"
                      [buttonClass]="'inline-flex items-center gap-2 self-start rounded-full border border-[#E7EAF0] bg-white px-4 py-2.5 text-[14px] font-medium text-[#3F444C]'"
                      [labelClass]="'truncate'"
                      [iconClass]="'text-[#9BA0AA]'"
                      [menuClass]="'min-w-[152px]'"
                      [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                      [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                      (valueChange)="overviewRange.set($event)"
                    ></app-custom-dropdown>
                  </div>

                  <div class="mt-8">
                    <svg viewBox="0 0 900 320" class="h-auto w-full overflow-visible">
                      <g fill="#A8AEB8" font-size="12" font-weight="500">
                        <text x="8" y="258">0</text>
                        <text x="0" y="178">{{ overviewChartScaleMid() }}</text>
                        <text x="0" y="98">{{ overviewChartScaleMax() }}</text>
                      </g>

                      @for (month of months(); track month.date) {
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

                      @if (overviewChartHighlight(); as chartHighlight) {
                        <g transform="translate(286,78)">
                          <rect width="180" height="32" rx="10" fill="#090909"></rect>
                          <circle cx="14" cy="16" r="3" fill="#7A6AE6"></circle>
                          <text x="22" y="20" fill="#FFFFFF" font-size="12">
                            {{ chartHighlight.label }}
                          </text>
                          <text x="148" y="20" fill="#FFFFFF" font-size="12">
                            {{ chartHighlight.value }}
                          </text>
                        </g>
                      }
                    </svg>
                  </div>
                </section>

                <div class="grid gap-4 lg:grid-cols-2">
                  <section
                    class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6"
                  >
                    <p class="text-[13px] font-semibold text-[#A2A7B0]">Most viewed listing</p>

                    <div class="mt-6 flex flex-col items-center text-center">
                      <div
                        class="overflow-hidden rounded-[18px] border border-[#ECEEF3] bg-white shadow-[0_14px_28px_-22px_rgba(17,24,39,0.35)]"
                      >
                        <img
                          [ngSrc]="user().mostViewedListingImage"
                          [alt]="user().mostViewedListingTitle"
                          width="82"
                          height="112"
                          loading="lazy"
                          class="h-[112px] w-[82px] object-cover"
                        />
                      </div>

                      <p class="mt-6 text-[16px] font-medium leading-7 text-[#6C717B]">
                        This item has been viewed
                      </p>
                      <p class="text-[20px] font-semibold text-[#1A1C21]">
                        {{ user().mostViewedListingCount }} times
                      </p>
                    </div>
                  </section>

                  <section
                    class="rounded-[28px] border border-[#ECEEF3] bg-white p-4 shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)] sm:p-6"
                  >
                    <p class="text-[13px] font-semibold text-[#A2A7B0]">Listings distribution</p>

                    <div class="mt-5 overflow-hidden rounded-full bg-[#F2F4F8]">
                      <div class="flex h-1.5 w-full">
                        @for (item of user().distribution; track item.label) {
                          <span
                            class="h-full"
                            [style.background]="item.color"
                            [style.width.%]="distributionWidth(item.value)"
                          ></span>
                        }
                      </div>
                    </div>

                    <div class="mt-6 space-y-5">
                      @for (item of user().distribution; track item.label) {
                        <div class="flex items-center justify-between gap-4">
                          <div class="flex items-center gap-3">
                            <span
                              class="h-3 w-3 rounded-full"
                              [style.background]="item.color"
                            ></span>
                            <span class="text-[14px] font-medium text-[#7A808A]">{{
                              item.label
                            }}</span>
                          </div>
                          <span class="text-[14px] font-semibold text-[#454A53]">{{
                            item.value
                          }}</span>
                        </div>
                      }
                    </div>

                    <button
                      type="button"
                      class="mt-7 text-[15px] font-semibold text-[#6B5CF0] underline underline-offset-2"
                    >
                      View more
                    </button>
                  </section>
                </div>
              </div>

              <aside
                class="border-t border-[#EEF0F4] pt-4 xl:border-l xl:border-t-0 xl:pt-0 xl:pl-8"
              >
                <div class="border-b border-[#EEF0F4] pb-4">
                  <h2 class="flex items-center gap-2 text-[16px] font-semibold text-[#1A1C21]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-4 w-4 text-[#555A64]"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M10 3.5a3 3 0 110 6 3 3 0 010-6zM4.75 15a5.25 5.25 0 1110.5 0 .75.75 0 01-1.5 0 3.75 3.75 0 10-7.5 0 .75.75 0 01-1.5 0z"
                      />
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
            <div
              class="flex flex-col overflow-hidden rounded-[28px] border border-[#ECEEF3] bg-white shadow-[0_8px_30px_-28px_rgba(17,24,39,0.45)]"
            >
              <div
                class="flex flex-col gap-4 border-b border-[#F1F2F4] px-4 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div class="flex flex-wrap gap-3">
                  <app-custom-dropdown
                    [options]="listingsCategoryOptions()"
                    [value]="listingsCategoryFilter()"
                    ariaLabel="Select listing category"
                    buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    iconClass="text-[#80858F]"
                    menuClass="min-w-[190px]"
                    (valueChange)="listingsCategoryFilter.set($event)"
                  ></app-custom-dropdown>

                  <app-custom-dropdown
                    [options]="listingsStoreOptions()"
                    [value]="listingsStoreFilter()"
                    ariaLabel="Select listing store"
                    buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    iconClass="text-[#80858F]"
                    menuClass="min-w-[210px]"
                    (valueChange)="listingsStoreFilter.set($event)"
                  ></app-custom-dropdown>

                  <app-custom-dropdown
                    [options]="listingsStatusOptions"
                    [value]="listingsStatusFilter()"
                    ariaLabel="Select listing status"
                    buttonClass="inline-flex items-center gap-2 rounded-full border border-[#E8EAF0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#80858F]"
                    iconClass="text-[#80858F]"
                    menuClass="min-w-[170px]"
                    (valueChange)="listingsStatusFilter.set($event)"
                  ></app-custom-dropdown>
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
                  />
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
                      <tr
                        class="border-b border-[#F4F5F7] transition hover:bg-[#FAFAFC] last:border-b-0"
                      >
                        <td class="px-8 py-5">
                          <div class="flex items-center gap-3">
                            <img
                              [ngSrc]="listing.thumbnail"
                              [alt]="listing.name"
                              width="40"
                              height="40"
                              loading="lazy"
                              class="h-10 w-10 rounded-[10px] border border-[#ECEEF3] object-cover"
                            />
                            <p class="text-[14px] font-semibold text-[#2A2D34]">
                              {{ listing.name }}
                            </p>
                          </div>
                        </td>
                        <td class="px-4 py-5 text-[14px] font-medium text-[#555A64]">
                          {{ listing.categoryLabel }}
                        </td>
                        <td class="px-4 py-5 text-[14px] font-semibold text-[#2A2D34]">
                          ₦{{ listing.price }}
                        </td>
                        <td class="px-4 py-5">
                          <div class="flex items-center gap-3">
                            <span
                              class="flex h-9 w-9 items-center justify-center rounded-full text-[13px] font-semibold text-white"
                              [style.background]="listing.storeBackground"
                            >
                              {{ storeInitials(listing.storeName) }}
                            </span>
                            <span class="text-[14px] font-medium text-[#3F444C]">{{
                              listing.storeName
                            }}</span>
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

              <div class="mt-auto px-4 py-6 sm:px-8">
                <p class="text-[14px] font-semibold text-[#646A73]">
                  {{ listingsTotal() }} results
                </p>
              </div>
            </div>
          } @else if (activeTab() === 'stores') {
            <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              @for (store of visibleStores(); track store.id) {
                <article class="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white">
                  <div class="relative h-[158px] overflow-hidden rounded-t-[20px] p-[3px]">
                    <div class="relative h-full overflow-hidden rounded-t-[20px]">
                      @if (store.coverImage ?? store.banner; as desktopCoverImage) {
                        <img
                          [ngSrc]="desktopCoverImage"
                          [alt]="store.name"
                          width="263"
                          height="158"
                          loading="lazy"
                          class="h-full w-full object-cover"
                        />
                      }
                      <div
                        class="absolute inset-x-0 bottom-0 h-[99px] bg-[linear-gradient(179.75deg,rgba(255,255,255,0)_0.54%,#FFFFFF_93.47%)]"
                        aria-hidden="true"
                      ></div>

                      @if (store.activeUntil) {
                        <span
                          class="absolute left-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[14px] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                          aria-label="Boosted store"
                        >
                          🚀
                        </span>
                      }
                    </div>
                  </div>

                  <div class="relative px-[19px] pb-5 pt-0">
                    <div
                      class="-mt-[89px] flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white"
                      [class.bg-[#3D785F]]="store.id === 'vine-collections'"
                    >
                      @if (store.logoImage ?? store.logo; as desktopLogoImage) {
                        <img
                          [ngSrc]="desktopLogoImage"
                          [alt]="store.name + ' logo'"
                          width="74"
                          height="74"
                          loading="lazy"
                          class="h-full w-full object-cover"
                        />
                      } @else {
                        <span class="text-[18px] font-semibold text-[#1F1F1F]">{{
                          storeInitials(store.name)
                        }}</span>
                      }
                    </div>

                    <div class="mt-[7px]">
                      <div class="flex items-center gap-1">
                        <h2 class="truncate text-[16px] font-medium leading-6 text-[#1F1F1F]">
                          {{ store.name }}
                        </h2>
                        @if (store.isVerified === true) {
                          <img
                            ngSrc="/assets/icons/admin-user-details/stores/verify.svg"
                            width="14"
                            height="14"
                            alt=""
                            class="h-[14px] w-[14px] shrink-0"
                            aria-hidden="true"
                          />
                        }
                      </div>

                      <div
                        class="mt-1 flex items-center gap-1 text-[14px] leading-5 text-[#777777]"
                      >
                        <img
                          ngSrc="/assets/icons/admin-user-details/stores/location.svg"
                          width="14"
                          height="14"
                          alt=""
                          class="h-[14px] w-[14px] shrink-0"
                          aria-hidden="true"
                        />
                        {{ store.location ?? store.metaLabel }}
                      </div>
                    </div>
                  </div>
                </article>
              }
            </div>
          } @else if (activeTab() === 'ads') {
            <div>
              <section
                class="relative overflow-hidden rounded-[24px] bg-[#F3F1FF] px-[27px] pb-[25px] pt-[25px]"
              >
                <div class="relative z-10 flex items-start justify-between gap-6">
                  <div>
                    <p class="text-[15px] leading-[19px] text-[#1F1F1F]">
                      {{ subscriptionSummary()?.planName ?? 'No active plan' }}
                    </p>
                    <p class="mt-[16px] text-[0px] leading-none text-[#1F1F1F]">
                      <span class="text-[34px] font-medium leading-[34px] tracking-[-0.04em]">{{
                        subscriptionSummary()?.price ?? '₦0'
                      }}</span>
                    </p>
                    <p class="mt-1 text-[14px] leading-[17px] text-[#0D0D0D]/70">
                      Expires on: {{ subscriptionSummary()?.activeUntil ?? '—' }}
                    </p>
                  </div>

                  <span
                    class="inline-flex h-7 shrink-0 items-center rounded-full bg-white px-2 text-[12px] font-medium leading-5 text-[#6453D9] shadow-[0_4px_8px_rgba(188,188,188,0.25)]"
                  >
                    Current plan
                  </span>
                </div>

                <img
                  ngSrc="/assets/images/admin-user-details/ads/desktop/plan-star.png"
                  width="115"
                  height="115"
                  alt=""
                  class="pointer-events-none absolute bottom-[-18px] right-[-14px] h-[115px] w-[115px]"
                  aria-hidden="true"
                />
              </section>

              <div class="mt-6 flex flex-wrap items-center gap-5">
                @for (placement of adPlacementTabs; track placement.value) {
                  <button
                    type="button"
                    (click)="activeAdsPlacement.set(placement.value)"
                    class="text-[18px] font-medium leading-6 tracking-[-0.03em] transition"
                    [class.text-[#1F1F1F]]="activeAdsPlacement() === placement.value"
                    [class.text-[#0D0D0D]/40]="activeAdsPlacement() !== placement.value"
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
                    class="inline-flex h-10 items-center rounded-[16px] px-4 text-[12px] font-medium leading-4 transition"
                    [class.bg-[#1A1A1A]]="activeAdsStatus() === status.value"
                    [class.text-white]="activeAdsStatus() === status.value"
                    [class.bg-[#F4F4F6]]="activeAdsStatus() !== status.value"
                    [class.text-[#1A1A1A]]="activeAdsStatus() !== status.value"
                  >
                    {{ status.label }} ({{ countUserAdsByStatus(status.value) }})
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
                      <article
                        class="overflow-hidden rounded-[22px] border border-[#ECEEF3] bg-white shadow-[0_12px_24px_-24px_rgba(17,24,39,0.55)]"
                      >
                        <div class="relative m-1.5 overflow-hidden rounded-[20px]">
                          <img
                            [ngSrc]="store.banner"
                            [alt]="store.name"
                            width="407"
                            height="170"
                            loading="lazy"
                            class="h-[170px] w-full object-cover"
                          />

                          <div
                            class="absolute left-3 top-3 rounded-full bg-[#F2F5A7] px-2.5 py-1 text-[10px] font-bold text-[#6A6B1F]"
                          >
                            Active until: {{ store.expiresOn }}
                          </div>

                          <div
                            class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"
                          ></div>

                          <div
                            class="absolute bottom-4 left-4 flex h-[74px] w-[74px] items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-[0_14px_26px_-18px_rgba(17,24,39,0.45)]"
                          >
                            <img
                              [ngSrc]="store.logo"
                              [alt]="store.name"
                              width="74"
                              height="74"
                              loading="lazy"
                              class="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        <div class="px-4 pb-4 pt-1">
                          <div class="flex items-start gap-2">
                            <div class="min-w-0 flex-1">
                              <h3 class="truncate text-[13px] font-semibold text-[#2A2D34]">
                                {{ store.name }}
                                <span class="ml-1 text-[#5F55E8]">✦</span>
                              </h3>
                              <p class="mt-1 text-[13px] font-medium text-[#8E9199]">
                                {{ store.location }}
                              </p>
                            </div>
                          </div>

                          <div
                            class="mt-4 flex items-center gap-4 border-t border-[#F1F2F4] pt-3 text-[12px] font-medium text-[#A1A6AF]"
                          >
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
                    <div class="mb-4 flex items-center justify-between gap-6">
                      <h2
                        class="text-[18px] font-medium leading-6 tracking-[-0.03em] text-[#1F1F1F]"
                      >
                        {{ section.label }}
                      </h2>

                      <div class="flex items-center gap-3">
                        <span class="text-[14px] leading-6 text-[#959595]">
                          {{ section.items.length }} ads
                        </span>

                        @if (section.items.length > 1) {
                          <div class="flex items-center gap-[18px]">
                            <button
                              type="button"
                              class="flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#0D0D0D]/50 shadow-[0_2px_4px_rgba(202,202,202,0.18)]"
                              aria-label="Previous promoted listing"
                            >
                              <img
                                ngSrc="/assets/icons/admin-user-details/ads/arrow-left.svg"
                                width="12"
                                height="12"
                                alt=""
                                class="h-3 w-3"
                                aria-hidden="true"
                              />
                            </button>
                            <button
                              type="button"
                              class="flex h-8 w-8 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#0D0D0D]/50 shadow-[0_2px_4px_rgba(202,202,202,0.18)]"
                              aria-label="Next promoted listing"
                            >
                              <img
                                ngSrc="/assets/icons/admin-user-details/ads/arrow-right.svg"
                                width="12"
                                height="12"
                                alt=""
                                class="h-3 w-3"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        }
                      </div>
                    </div>

                    @if (section.category === 'other listings') {
                      <div class="relative">
                        <div
                          #promotedSectionScroller
                          class="flex gap-4 overflow-x-auto pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                        >
                          @for (ad of section.items; track ad.id) {
                            <article
                              class="w-[196.2px] shrink-0 overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white p-1"
                            >
                              <div
                                class="relative h-[224px] overflow-hidden rounded-[20px]"
                                [class.bg-[#BEBEBE]]="!ad.imageBackground"
                                [style.background]="ad.imageBackground ?? null"
                              >
                                @if (ad.image) {
                                  <img
                                    [ngSrc]="ad.image"
                                    [alt]="ad.title"
                                    width="188"
                                    height="224"
                                    loading="lazy"
                                    class="h-full w-full"
                                    [class.object-cover]="(ad.imageFit ?? 'cover') === 'cover'"
                                    [class.object-contain]="(ad.imageFit ?? 'cover') === 'contain'"
                                  />
                                }

                                @if (ad.showImageGradient) {
                                  <div
                                    class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62.75%,rgba(0,0,0,0.5)_100%)]"
                                    aria-hidden="true"
                                  ></div>
                                }

                                <div
                                  class="absolute left-[7px] top-[7px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                                >
                                  Active until: {{ ad.expiresOn }}
                                </div>

                                @if (ad.showImageDots) {
                                  <div
                                    class="absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-[3px]"
                                  >
                                    @for (dot of promotionCarouselDots; track dot) {
                                      <span
                                        class="block h-1 w-1 rounded-full"
                                        [class.bg-[#1F1F1F]]="dot === 1"
                                        [class.bg-[#D7D7D7]]="dot !== 1"
                                      ></span>
                                    }
                                  </div>
                                }

                                @if (ad.imageControlMode === 'both') {
                                  <div
                                    class="absolute inset-x-[11px] top-1/2 flex -translate-y-1/2 items-center justify-between"
                                  >
                                    <button
                                      type="button"
                                      class="flex h-6 w-6 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2.4px_4.8px_rgba(202,202,202,0.25)]"
                                      aria-label="Previous image"
                                    >
                                      <img
                                        ngSrc="/assets/icons/admin-user-details/ads/arrow-left.svg"
                                        width="12"
                                        height="12"
                                        alt=""
                                        class="h-3 w-3"
                                        aria-hidden="true"
                                      />
                                    </button>
                                    <button
                                      type="button"
                                      class="flex h-6 w-6 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2.4px_4.8px_rgba(202,202,202,0.25)]"
                                      aria-label="Next image"
                                    >
                                      <img
                                        ngSrc="/assets/icons/admin-user-details/ads/arrow-right.svg"
                                        width="12"
                                        height="12"
                                        alt=""
                                        class="h-3 w-3"
                                        aria-hidden="true"
                                      />
                                    </button>
                                  </div>
                                }
                              </div>

                              <div class="flex flex-col gap-1 px-2 pb-3 pt-3">
                                <h3 class="truncate text-[14px] leading-5 text-[#1F1F1F]">
                                  {{ ad.title }}
                                </h3>

                                <div
                                  class="flex items-center text-[16px] font-medium leading-6 text-[#1F1F1F]"
                                >
                                  @if ((ad.priceDisplay ?? 'strikethrough-n') === 'naira-icon') {
                                    <span class="mr-px">₦</span>{{ ad.price }}
                                  } @else if (
                                    (ad.priceDisplay ?? 'strikethrough-n') === 'strikethrough-n'
                                  ) {
                                    <span class="line-through">N</span>{{ ad.price }}
                                  } @else {
                                    {{ ad.price }}
                                  }
                                </div>

                                <div
                                  class="mt-1 flex flex-wrap items-center gap-[10px] text-[12px] leading-4 text-[#959595]"
                                >
                                  <span class="inline-flex items-center gap-[2px]">
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/eye.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {{ ad.views }}
                                  </span>
                                  <span class="inline-flex items-center gap-[2px]">
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/click.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {{ ad.clicks }}
                                  </span>
                                  <span class="inline-flex items-center gap-[2px]">
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/messages.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {{ ad.messages }}
                                  </span>
                                  <span class="inline-flex items-center gap-[2px]">
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/call.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3 shrink-0"
                                      aria-hidden="true"
                                    />
                                    {{ ad.calls }}
                                  </span>
                                </div>
                              </div>
                            </article>
                          }
                        </div>

                        @if (section.items.length > 1) {
                          <div
                            class="pointer-events-none absolute inset-y-0 right-0 w-[72px] bg-[linear-gradient(270deg,#FFFFFF_34.75%,rgba(255,255,255,0)_100%)]"
                          ></div>
                          <button
                            type="button"
                            (click)="scrollPromotedListings(promotedSectionScroller, 212)"
                            class="absolute right-[-11px] top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2.4px_4.8px_rgba(202,202,202,0.25)]"
                            aria-label="Scroll other listings"
                          >
                            <img
                              ngSrc="/assets/icons/admin-user-details/ads/arrow-right.svg"
                              width="12"
                              height="12"
                              alt=""
                              class="h-3 w-3"
                              aria-hidden="true"
                            />
                          </button>
                        }
                      </div>
                    } @else {
                      <div class="grid gap-4 xl:grid-cols-5">
                        @for (ad of section.items; track ad.id) {
                          <article
                            class="overflow-hidden rounded-[24px] border border-[#EAEAEA] bg-white p-1"
                          >
                            <div
                              class="relative h-[224px] overflow-hidden rounded-[20px]"
                              [class.bg-[#BEBEBE]]="!ad.imageBackground"
                              [style.background]="ad.imageBackground ?? null"
                            >
                              @if (ad.image) {
                                <img
                                  [ngSrc]="ad.image"
                                  [alt]="ad.title"
                                  width="188"
                                  height="224"
                                  loading="lazy"
                                  class="h-full w-full"
                                  [class.object-cover]="(ad.imageFit ?? 'cover') === 'cover'"
                                  [class.object-contain]="(ad.imageFit ?? 'cover') === 'contain'"
                                />
                              }

                              @if (ad.showImageGradient) {
                                <div
                                  class="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_62.75%,rgba(0,0,0,0.5)_100%)]"
                                  aria-hidden="true"
                                ></div>
                              }

                              <div
                                class="absolute left-[7px] top-[7px] rounded-[8px] bg-[#F1FFAC] px-[6px] py-[2px] text-[12px] font-medium leading-4 text-[#4E3E07]"
                              >
                                Active until: {{ ad.expiresOn }}
                              </div>

                              @if (ad.showImageDots) {
                                <div
                                  class="absolute bottom-[10px] left-1/2 flex -translate-x-1/2 items-center gap-[3px]"
                                >
                                  @for (dot of promotionCarouselDots; track dot) {
                                    <span
                                      class="block h-1 w-1 rounded-full"
                                      [class.bg-[#1F1F1F]]="dot === 1"
                                      [class.bg-[#D7D7D7]]="dot !== 1"
                                    ></span>
                                  }
                                </div>
                              }

                              @if (ad.imageControlMode === 'both') {
                                <div
                                  class="absolute inset-x-[11px] top-1/2 flex -translate-y-1/2 items-center justify-between"
                                >
                                  <button
                                    type="button"
                                    class="flex h-6 w-6 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2.4px_4.8px_rgba(202,202,202,0.25)]"
                                    aria-label="Previous image"
                                  >
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/arrow-left.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                  </button>
                                  <button
                                    type="button"
                                    class="flex h-6 w-6 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_2.4px_4.8px_rgba(202,202,202,0.25)]"
                                    aria-label="Next image"
                                  >
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/ads/arrow-right.svg"
                                      width="12"
                                      height="12"
                                      alt=""
                                      class="h-3 w-3"
                                      aria-hidden="true"
                                    />
                                  </button>
                                </div>
                              }
                            </div>

                            <div class="flex flex-col gap-1 px-2 pb-3 pt-3">
                              <h3 class="truncate text-[14px] leading-5 text-[#1F1F1F]">
                                {{ ad.title }}
                              </h3>

                              <div
                                class="flex items-center text-[16px] font-medium leading-6 text-[#1F1F1F]"
                              >
                                @if ((ad.priceDisplay ?? 'strikethrough-n') === 'naira-icon') {
                                  <span class="mr-px">₦</span>{{ ad.price }}
                                } @else if (
                                  (ad.priceDisplay ?? 'strikethrough-n') === 'strikethrough-n'
                                ) {
                                  <span class="line-through">N</span>{{ ad.price }}
                                } @else {
                                  {{ ad.price }}
                                }
                              </div>

                              <div
                                class="mt-1 flex flex-wrap items-center gap-[10px] text-[12px] leading-4 text-[#959595]"
                              >
                                <span class="inline-flex items-center gap-[2px]">
                                  <img
                                    ngSrc="/assets/icons/admin-user-details/ads/eye.svg"
                                    width="12"
                                    height="12"
                                    alt=""
                                    class="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {{ ad.views }}
                                </span>
                                <span class="inline-flex items-center gap-[2px]">
                                  <img
                                    ngSrc="/assets/icons/admin-user-details/ads/click.svg"
                                    width="12"
                                    height="12"
                                    alt=""
                                    class="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {{ ad.clicks }}
                                </span>
                                <span class="inline-flex items-center gap-[2px]">
                                  <img
                                    ngSrc="/assets/icons/admin-user-details/ads/messages.svg"
                                    width="12"
                                    height="12"
                                    alt=""
                                    class="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {{ ad.messages }}
                                </span>
                                <span class="inline-flex items-center gap-[2px]">
                                  <img
                                    ngSrc="/assets/icons/admin-user-details/ads/call.svg"
                                    width="12"
                                    height="12"
                                    alt=""
                                    class="h-3 w-3 shrink-0"
                                    aria-hidden="true"
                                  />
                                  {{ ad.calls }}
                                </span>
                              </div>
                            </div>
                          </article>
                        }
                      </div>
                    }
                  </section>
                }
              }
            </div>
          } @else if (activeTab() === 'transactions') {
            <div>
              <section>
                <h2
                  class="max-w-[468px] text-[40px] font-medium leading-[1.3] tracking-[-0.04em] text-[#414141]"
                >
                  They currently have
                  <span class="font-bold text-[#959595]">{{ walletBalance() }}</span>
                  in their wallet
                </h2>
              </section>

              <section class="mt-9">
                <h3 class="text-[20px] font-medium leading-6 text-[#0D0D0D]">
                  Transaction history
                </h3>

                <div class="mt-4 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
                  <div class="flex flex-col gap-4 border-b border-[#F0F0F0] px-[15px] py-[15px]">
                    <div class="flex flex-wrap gap-3">
                      <app-custom-dropdown
                        [options]="transactionTypeOptions"
                        [value]="transactionTypeFilter()"
                        ariaLabel="Select transaction type"
                        buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                        iconClass="text-[#1A1B1D]/50"
                        menuClass="min-w-[190px]"
                        (valueChange)="transactionTypeFilter.set($event)"
                      ></app-custom-dropdown>

                      <app-custom-dropdown
                        [options]="transactionDateOptions()"
                        [value]="transactionDateFilter()"
                        ariaLabel="Select transaction date"
                        buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                        iconClass="text-[#1A1B1D]/50"
                        menuClass="min-w-[150px]"
                        (valueChange)="transactionDateFilter.set($event)"
                      ></app-custom-dropdown>

                      <app-custom-dropdown
                        [options]="transactionStatusOptions"
                        [value]="transactionStatusFilter()"
                        ariaLabel="Select transaction status"
                        buttonClass="inline-flex h-8 items-center gap-2 rounded-full border border-[#EBEBEB] bg-white px-3 text-[14px] font-medium text-[#1A1B1D]/50 shadow-[0_0_0_1px_rgba(18,55,105,0.08)]"
                        iconClass="text-[#1A1B1D]/50"
                        menuClass="min-w-[150px]"
                        (valueChange)="transactionStatusFilter.set($event)"
                      ></app-custom-dropdown>
                    </div>
                  </div>

                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[760px]">
                      <thead class="border-b border-[#F0F0F0] bg-[#FAFAFA] text-left">
                        <tr class="text-[12px] font-medium text-[#1A1B1D]/60">
                          <th class="px-[35px] py-[11px]">Amount</th>
                          <th class="px-4 py-[11px]">Transaction type</th>
                          <th class="px-4 py-[11px]">Date</th>
                          <th class="px-4 py-[11px]">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (transaction of visibleTransactions(); track transaction.id) {
                          <tr class="border-b border-[#F0F0F0] last:border-b-0">
                            <td class="px-[35px] py-5 text-[14px] font-medium text-[#1F1F1F]">
                              {{ transaction.amount }}
                            </td>
                            <td class="px-4 py-5 text-[14px] font-normal capitalize text-[#1A1B1D]">
                              {{ transaction.type }}
                            </td>
                            <td class="px-4 py-5 text-[14px] font-normal text-[#1A1B1D]">
                              {{ transaction.date }}
                            </td>
                            <td class="px-4 py-5">
                              <span
                                class="inline-flex h-6 items-center gap-1 rounded-lg px-2 text-[12px] font-semibold leading-4"
                                [class.bg-[#F3FBF9]]="transaction.status === 'successful'"
                                [class.text-[#25AD32]]="transaction.status === 'successful'"
                                [class.bg-[#FDF6FA]]="transaction.status === 'failed'"
                                [class.text-[#FF2524]]="transaction.status === 'failed'"
                              >
                                @if (transaction.status === 'successful') {
                                  <img
                                    ngSrc="/assets/icons/admin-user-details/tick-circle.svg"
                                    width="14"
                                    height="14"
                                    alt=""
                                    class="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                } @else {
                                  <img
                                    ngSrc="/assets/icons/admin-users/slash.svg"
                                    width="14"
                                    height="14"
                                    alt=""
                                    class="h-3.5 w-3.5 shrink-0"
                                    aria-hidden="true"
                                  />
                                }
                                {{ transaction.status === 'successful' ? 'Successful' : 'Failed' }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>

                <div class="mt-6 flex items-center justify-between">
                  <p class="text-[16px] font-medium text-[#1A1B1D]">
                    {{ transactionsTotal() }}
                    <span class="text-[#1A1B1D]/50"> results</span>
                  </p>
                </div>
              </section>
            </div>
          } @else if (activeTab() === 'reviews') {
            <div class="pt-6">
              <div class="grid gap-8 xl:grid-cols-[261px_minmax(0,1fr)]">
                <div class="space-y-5">
                  <div class="rounded-[16px] bg-[#FAFAFA] px-6 py-[23px]">
                    <div class="mb-8 flex flex-col items-center gap-0.5">
                      <p class="text-center text-[0px] leading-none text-[#2D2D2D]">
                        <span class="text-[56px] font-semibold leading-[64px] tracking-[-0.04em]">{{
                          reviewAverage()
                        }}</span>
                        <span class="text-[28px] font-medium leading-10 text-[#BFBFBF]">/5</span>
                      </p>

                      <div
                        class="flex items-center gap-1 text-[23px] leading-[23px] text-[#D3DC35]"
                        [attr.aria-label]="reviewAverage() + ' out of 5 stars'"
                      >
                        @for (star of reviewStarsScale; track star) {
                          <span>★</span>
                        }
                      </div>
                    </div>

                    <p class="mb-1 text-[16px] font-semibold leading-6 text-[#2D2D2D]">
                      Overall rating
                    </p>

                    <div class="space-y-3">
                      @for (bar of ratingBreakdown(); track bar.stars) {
                        <div class="flex items-center gap-3">
                          <span
                            class="inline-flex w-[21px] items-center gap-0.5 text-[14px] leading-5 text-[#2D2D2D]"
                          >
                            {{ bar.stars }} <span class="text-[12px] text-[#2D2D2D]">★</span>
                          </span>
                          <div
                            class="h-[7px] w-[132px] overflow-hidden rounded-[16px] bg-[#EAEAEA]"
                          >
                            <div
                              class="h-full rounded-[16px] bg-[#2D2D2D]"
                              [style.width.%]="bar.percentage"
                            ></div>
                          </div>
                          <span class="flex-1 text-right text-[14px] leading-5 text-[#959595]"
                            >{{ bar.percentage }}%</span
                          >
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    class="mb-8 flex flex-col gap-7 md:flex-row md:items-start md:justify-between"
                  >
                    <div>
                      <h2 class="text-[20px] font-semibold leading-6 text-[#1F1F1F]">
                        {{ reviewTotal() }} reviews
                      </h2>
                      <p class="mt-7 text-[16px] font-medium leading-6 text-[#1F1F1F]">
                        This seller is great at..
                      </p>

                      <div class="mt-3 flex flex-wrap gap-3">
                        @for (tag of visibleReviewTags(); track tag.label) {
                          <div
                            class="rounded-full border border-[#EAEAEA] bg-[#F9F9F9] px-4 py-2 text-[16px] font-medium leading-6 text-[#5A5A5A]"
                          >
                            {{ tag.label }} ({{ tag.count }})
                          </div>
                        }
                      </div>
                    </div>

                    <app-custom-dropdown
                      [options]="reviewSortOptions"
                      [value]="reviewSort()"
                      [ariaLabel]="'Sort user reviews'"
                      [buttonClass]="'inline-flex h-8 items-center gap-2 self-start rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-normal leading-5 text-[#1A1B1D]'"
                      [labelClass]="'truncate'"
                      [iconClass]="'text-[#777777]'"
                      [menuClass]="'min-w-[156px]'"
                      [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                      [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                      (valueChange)="reviewSort.set($event)"
                    ></app-custom-dropdown>
                  </div>

                  <div class="space-y-8">
                    @for (review of visibleReviews(); track review.author + review.date) {
                      <article class="rounded-[24px] bg-white">
                        <div class="flex gap-4">
                          <div class="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6]">
                            @if (review.avatar) {
                              <img
                                [ngSrc]="review.avatar"
                                [alt]="review.author"
                                width="40"
                                height="40"
                                loading="lazy"
                                class="h-10 w-10 object-cover"
                              />
                            } @else {
                              <span
                                class="flex h-10 w-10 items-center justify-center rounded-full text-[11px] font-semibold text-[#1A1C21]"
                                [style.background]="avatarGradientForLabel(review.author)"
                              >
                                {{ initialsFromLabel(review.author) }}
                              </span>
                            }
                          </div>

                          <div class="min-w-0 flex-1">
                            <h3 class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                              {{ review.author }}
                            </h3>

                            <div class="mt-2 flex items-center gap-2">
                              <div class="flex items-center gap-0.5">
                                @for (filled of reviewStars(review.rating); track $index) {
                                  <span
                                    class="text-[12px] leading-3"
                                    [class.text-[#2D2D2D]]="filled"
                                    [class.text-[#D9D9D9]]="!filled"
                                    >★</span
                                  >
                                }
                              </div>
                              <span class="text-[3px] leading-none text-[#8C8C8C]">●</span>
                              <span class="text-[14px] leading-5 text-[#8C8C8C]">{{
                                review.date
                              }}</span>
                            </div>

                            <p class="mt-3 text-[16px] leading-6 text-[#1F1F1F]">
                              {{ review.text }}
                            </p>

                            @if (review.images?.length) {
                              <div class="mt-4 flex flex-wrap gap-3">
                                @for (image of review.images!; track $index) {
                                  <div
                                    class="relative h-[117px] w-[117px] overflow-hidden rounded-[16px] bg-[#E9E9E9]"
                                  >
                                    <img
                                      [ngSrc]="image"
                                      alt=""
                                      width="117"
                                      height="117"
                                      loading="lazy"
                                      class="h-full w-full object-cover"
                                    />

                                    @if ($last && review.moreImagesLabel) {
                                      <div
                                        class="absolute inset-0 flex items-center justify-center bg-black/50 text-[18px] font-medium leading-6 text-white"
                                      >
                                        {{ review.moreImagesLabel }}
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
              <div class="flex flex-wrap items-center gap-5 pb-6">
                <button
                  type="button"
                  (click)="activeReportTab.set('profile')"
                  class="text-[20px] font-medium leading-6 transition"
                  [class.text-[#1A1B1D]]="activeReportTab() === 'profile'"
                  [class.text-[#0D0D0D]/40]="activeReportTab() !== 'profile'"
                >
                  Profile reports
                </button>
                <button
                  type="button"
                  (click)="activeReportTab.set('listing')"
                  class="text-[20px] font-medium leading-6 transition"
                  [class.text-[#1A1B1D]]="activeReportTab() === 'listing'"
                  [class.text-[#0D0D0D]/40]="activeReportTab() !== 'listing'"
                >
                  Listing reports
                </button>
              </div>

              <div class="overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white">
                <div class="border-b border-[#F0F0F0] px-[15px] py-[15px]">
                  <div class="flex flex-wrap items-center justify-end gap-3">
                    @if (activeReportTab() === 'listing') {
                      <div class="mr-auto flex flex-wrap items-center gap-2">
                        <app-custom-dropdown
                          [options]="listingReportCategoryOptions()"
                          [value]="listingReportCategoryFilter()"
                          [ariaLabel]="'Filter listing reports by category'"
                          [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] leading-5 text-[#1A1B1D]'"
                          [labelClass]="'truncate'"
                          [iconClass]="'text-[#777777]'"
                          [menuClass]="'min-w-[176px]'"
                          [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                          [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                          (valueChange)="listingReportCategoryFilter.set($event)"
                        ></app-custom-dropdown>

                        <app-custom-dropdown
                          [options]="listingReportStoreOptions()"
                          [value]="listingReportStoreFilter()"
                          [ariaLabel]="'Filter listing reports by store'"
                          [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] leading-5 text-[#1A1B1D]'"
                          [labelClass]="'truncate'"
                          [iconClass]="'text-[#777777]'"
                          [menuClass]="'min-w-[176px]'"
                          [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                          [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                          (valueChange)="listingReportStoreFilter.set($event)"
                        ></app-custom-dropdown>

                        <app-custom-dropdown
                          [options]="listingReportStatusOptions()"
                          [value]="listingReportStatusFilter()"
                          [ariaLabel]="'Filter listing reports by status'"
                          [buttonClass]="'inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] leading-5 text-[#1A1B1D]'"
                          [labelClass]="'truncate'"
                          [iconClass]="'text-[#777777]'"
                          [menuClass]="'min-w-[176px]'"
                          [optionClass]="'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition hover:bg-[#F5F6FA]'"
                          [activeOptionClass]="'bg-[#F5F1FF] text-[#5932EA]'"
                          (valueChange)="listingReportStatusFilter.set($event)"
                        ></app-custom-dropdown>
                      </div>
                    }

                    <label class="relative block w-full max-w-[224px]">
                      <img
                        ngSrc="/assets/icons/admin-users/search.svg"
                        width="16"
                        height="16"
                        alt=""
                        class="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="text"
                        [value]="reportSearchQuery()"
                        (input)="updateReportSearchQuery($any($event.target).value)"
                        placeholder="Search"
                        class="h-10 w-full rounded-full bg-[#FAFAFA] py-2 pl-11 pr-4 text-[14px] text-[#1A1B1D] outline-none placeholder:text-[#777777] focus:ring-2 focus:ring-[#6453D9]/10"
                      />
                    </label>
                  </div>
                </div>

                @if (activeReportTab() === 'profile') {
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[980px]">
                      <thead class="border-b border-[#F0F0F0] bg-[#FAFAFA] text-left">
                        <tr class="text-[12px] font-medium text-[#1A1B1D]/60">
                          <th class="px-4 py-[11px]">Store</th>
                          <th class="px-4 py-[11px]">Reported by</th>
                          <th class="px-4 py-[11px]">Reason</th>
                          <th class="px-4 py-[11px]">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (report of visibleProfileReports(); track report.id) {
                          <tr class="border-b border-[#F0F0F0] last:border-b-0">
                            <td class="px-4 py-5">
                              <div class="flex items-center gap-3">
                                <div class="h-8 w-8 overflow-hidden rounded-full bg-[#F3F4F6]">
                                  @if (report.storeLogo) {
                                    <img
                                      [ngSrc]="report.storeLogo"
                                      [alt]="report.storeName"
                                      width="32"
                                      height="32"
                                      loading="lazy"
                                      class="h-8 w-8 object-cover"
                                    />
                                  } @else {
                                    <span class="text-[12px] font-semibold text-[#1A1C21]">{{
                                      storeInitials(report.storeName)
                                    }}</span>
                                  }
                                </div>
                                <span class="text-[14px] font-normal text-[#1A1B1D]">{{
                                  report.storeName
                                }}</span>
                              </div>
                            </td>
                            <td class="px-4 py-5">
                              <div class="flex items-center gap-3">
                                <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F6]">
                                  @if (report.reporterAvatar) {
                                    <img
                                      [ngSrc]="report.reporterAvatar"
                                      [alt]="report.reporterName"
                                      width="36"
                                      height="36"
                                      loading="lazy"
                                      class="h-9 w-9 object-cover"
                                    />
                                  } @else {
                                    <span
                                      class="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-[#1A1C21]"
                                      [style.background]="
                                        avatarGradientForLabel(report.reporterName)
                                      "
                                    >
                                      {{ initialsFromLabel(report.reporterName) }}
                                    </span>
                                  }
                                </div>
                                <div>
                                  <p class="text-[14px] font-medium leading-5 text-[#0D0D0D]">
                                    {{ report.reporterName }}
                                  </p>
                                  <p class="text-[12px] leading-4 text-[#8C8C8C]">
                                    {{ report.reporterEmail }}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-5 text-[14px] font-normal text-[#1A1B1D]">
                              {{ report.reason }}
                            </td>
                            <td class="px-4 py-5 text-[14px] leading-[1.2] text-[#0D0D0D]/70">
                              {{ report.description }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <div class="overflow-x-auto">
                    <table class="w-full min-w-[1120px]">
                      <thead class="border-b border-[#F0F0F0] bg-[#FAFAFA] text-left">
                        <tr class="text-[12px] font-medium text-[#1A1B1D]/60">
                          <th class="px-4 py-[11px]">Listing</th>
                          <th class="px-4 py-[11px]">Store</th>
                          <th class="px-4 py-[11px]">Reported by</th>
                          <th class="px-4 py-[11px]">Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        @for (report of visibleListingReports(); track report.id) {
                          <tr class="h-[90px] border-b border-[#F0F0F0] last:border-b-0">
                            <td class="px-4 py-[18px]">
                              <div class="flex items-center gap-3">
                                @if (report.listingImage) {
                                  <img
                                    [ngSrc]="report.listingImage"
                                    [alt]="report.listingName"
                                    width="40"
                                    height="40"
                                    loading="lazy"
                                    class="h-10 w-10 rounded-[8px] border border-[#EAEAEA] object-cover"
                                  />
                                }
                                <span class="text-[14px] font-normal leading-5 text-[#1A1B1D]">{{
                                  report.listingName
                                }}</span>
                              </div>
                            </td>
                            <td class="px-4 py-[18px]">
                              <div class="flex items-center gap-3">
                                <div class="h-8 w-8 overflow-hidden rounded-full bg-[#F3F4F6]">
                                  @if (report.storeIcon) {
                                    <img
                                      [ngSrc]="report.storeIcon"
                                      [alt]="report.storeName"
                                      width="32"
                                      height="32"
                                      loading="lazy"
                                      class="h-8 w-8 object-cover"
                                    />
                                  } @else {
                                    <span class="text-[12px] font-semibold text-[#1A1C21]">{{
                                      storeInitials(report.storeName)
                                    }}</span>
                                  }
                                </div>
                                <span class="text-[14px] font-normal leading-5 text-[#1A1B1D]">{{
                                  report.storeName
                                }}</span>
                              </div>
                            </td>
                            <td class="px-4 py-[18px]">
                              <div class="flex items-center gap-3">
                                <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F6]">
                                  @if (report.reporterAvatar) {
                                    <img
                                      [ngSrc]="report.reporterAvatar"
                                      [alt]="report.reporterName"
                                      width="36"
                                      height="36"
                                      loading="lazy"
                                      class="h-9 w-9 object-cover"
                                    />
                                  } @else {
                                    <span
                                      class="flex h-9 w-9 items-center justify-center rounded-full text-[11px] font-semibold text-[#1A1C21]"
                                      [style.background]="
                                        avatarGradientForLabel(report.reporterName)
                                      "
                                    >
                                      {{ initialsFromLabel(report.reporterName) }}
                                    </span>
                                  }
                                </div>
                                <div>
                                  <p class="text-[14px] font-medium leading-5 text-[#0D0D0D]">
                                    {{ report.reporterName }}
                                  </p>
                                  <p class="text-[12px] leading-4 text-[#8C8C8C]">
                                    {{ report.reporterEmail }}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td class="px-4 py-[18px] text-[14px] leading-[1.2] text-[#0D0D0D]/70">
                              {{ report.description }}
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                }
              </div>

              <div class="mt-6 flex items-center justify-between">
                <p class="text-[16px] font-medium text-[#1A1B1D]">
                  {{
                    activeReportTab() === 'profile' ? profileReportsTotal() : listingReportsTotal()
                  }}
                  <span class="text-[#1A1B1D]/50"> results</span>
                </p>
              </div>
            </div>
          } @else if (activeTab() === 'activities') {
            <div class="pt-6">
              @for (yearGroup of visibleActivityTimeline(); track yearGroup.year) {
                <section class="mb-10">
                  <h2
                    class="text-[16px] font-medium leading-[1.2] tracking-[-0.02em] text-[#0D0D0D]/40"
                  >
                    {{ yearGroup.year }}
                  </h2>

                  <div class="mt-[15px] space-y-8">
                    @for (group of yearGroup.groups; track group.label) {
                      <div>
                        <div class="mb-5 flex items-center gap-2">
                          <span
                            class="inline-flex h-8 items-center rounded-full bg-[#FAFAFA] px-3 text-[14px] font-medium leading-5 text-[#1A1B1D]/50"
                          >
                            {{ group.label }}
                          </span>
                          <div class="flex min-w-0 flex-1 items-center gap-2">
                            <div class="h-px flex-1 bg-[#EBEBEB]"></div>
                            <img
                              ngSrc="/assets/icons/admin-user-details/arrow-down.svg"
                              width="16"
                              height="16"
                              alt=""
                              class="h-4 w-4"
                              aria-hidden="true"
                            />
                          </div>
                        </div>

                        <div class="space-y-0">
                          @for (activity of group.items; track activity.id) {
                            <div class="grid grid-cols-[44px_minmax(0,1fr)] gap-[14px]">
                              <div class="flex flex-col items-center">
                                <span
                                  class="flex h-11 w-11 items-center justify-center rounded-full border border-[#EBEBEB] bg-white"
                                >
                                  <img
                                    [ngSrc]="activityIcon(activity.kind)"
                                    alt=""
                                    width="20"
                                    height="20"
                                    class="h-5 w-5 opacity-50"
                                    aria-hidden="true"
                                  />
                                </span>
                                @if (!$last) {
                                  <span class="mt-0 h-[78px] w-px bg-[#EBEBEB]"></span>
                                }
                              </div>

                              <div class="pb-[34px] pt-[2px] last:pb-0">
                                <div>
                                  <div class="flex items-start justify-between gap-4">
                                    <h3
                                      class="text-[14px] leading-[1.2] tracking-[-0.02em] text-[#0C0C0C]"
                                    >
                                      {{ activity.title }}
                                    </h3>
                                    <img
                                      ngSrc="/assets/icons/admin-user-details/activities/menu-dots.svg"
                                      width="16"
                                      height="16"
                                      alt=""
                                      class="h-4 w-4 opacity-0"
                                      aria-hidden="true"
                                    />
                                  </div>

                                  @if (activity.detail) {
                                    <div
                                      class="mt-[10px] inline-flex max-w-full rounded-full bg-[#FAFAFA] px-3 py-1 text-[12px] font-medium leading-5 text-[#1A1B1D]/70"
                                    >
                                      {{ activity.detail }}
                                    </div>
                                  }

                                  <div
                                    class="mt-[10px] flex flex-wrap items-center gap-x-[5px] gap-y-1 text-[12px] leading-5 text-[#0D0D0D]/40"
                                  >
                                    <span>by</span>
                                    <span class="inline-flex items-center gap-1">
                                      @if (activity.actorAvatar) {
                                        <img
                                          [ngSrc]="activity.actorAvatar"
                                          [alt]="activity.actorName"
                                          width="20"
                                          height="20"
                                          loading="lazy"
                                          class="h-5 w-5 rounded-full object-cover"
                                        />
                                      } @else {
                                        <span
                                          class="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-semibold text-[#1A1C21]"
                                          [style.background]="activity.actorBackground"
                                        >
                                          {{ activity.actorInitials }}
                                        </span>
                                      }
                                      <span class="text-[#1A1B1D]">{{ activity.actorName }}</span>
                                    </span>
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
            <div
              class="flex min-h-[420px] items-center justify-center rounded-[28px] border border-dashed border-[#E2E5EC] bg-[#FAFAFB] text-center"
            >
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
    }
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminUserDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly adminUserDetailsService = inject(AdminUserDetailsService);
  private readonly toast = inject(AppToastService);

  private readonly routeUserId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  private readonly hasRedirectedInvalidUserId = signal(false);
  private readonly userReloadTrigger = signal(0);

  readonly userId = computed(() => {
    const routeUserId = this.routeUserId().trim();
    return /^\d+$/.test(routeUserId) ? routeUserId : '';
  });

  readonly activeTab = signal<AdminUserDetailsTab>('overview');
  readonly isMobileUserActionsOpen = signal(false);
  readonly isUserActionsOpen = signal(false);
  readonly isDownloadingUserData = signal(false);
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
  readonly overviewRange = signal<AdminUserOverviewRange>('last-7-days');
  readonly reviewSort = signal<'most-recent' | 'highest-rated'>('most-recent');
  readonly activeReportTab = signal<AdminUserReportTab>('profile');
  readonly reportSearchQuery = signal('');
  readonly listingReportCategoryFilter = signal<AdminUserListingReportCategory>('all');
  readonly listingReportStoreFilter = signal<AdminUserListingReportStore>('all');
  readonly listingReportStatusFilter = signal<AdminUserListingReportStatus>('all');
  readonly isLoading = signal(false);
  readonly userLoadFailed = signal(false);
  readonly userDetailResponse = signal<AdminUserDetailResponse | null>(null);
  readonly listingRecords = signal<AdminManagedListing[]>([]);
  readonly allListingRecords = signal<AdminManagedListing[]>([]);
  readonly listingsTotal = signal(0);
  readonly storeRecords = signal<Store[]>([]);
  readonly mobileStoreRecords = signal<Store[]>([]);
  readonly promotedListingRecords = signal<AdminManagedPromotionListing[]>([]);
  readonly promotedStoreRecords = signal<AdminManagedStorePromotion[]>([]);
  readonly bannerAdRecords = signal<AdminManagedBannerAd[]>([]);
  readonly adStatusCounts = signal<Record<AdminManagedAdPlacement, Record<string, number>>>({
    'promoted listings': {},
    'store promotions': {},
    'banner ads': {},
  });
  readonly subscriptionSummary = signal<{
    planName: string;
    activeUntil: string;
    price: string;
  } | null>(null);
  readonly walletBalance = signal('₦0');
  readonly transactionsTotal = signal(0);
  readonly transactionRecords = signal<AdminUserTransaction[]>([]);

  readonly mobileTransactionRecords = signal<AdminUserMobileTransaction[]>([]);
  readonly reviewTagRecords = signal<AdminUserReviewTag[]>([]);
  readonly mobileReviewTagRecords = signal<AdminUserReviewTag[]>([]);
  readonly reviewRecords = signal<AdminUserReview[]>([]);
  readonly mobileReviewRecords = signal<AdminUserReview[]>([]);
  readonly reviewAverage = signal('0.00');
  readonly reviewTotal = signal(0);
  readonly ratingBreakdown = signal<Array<{ stars: number; percentage: number }>>([
    { stars: 5, percentage: 0 },
    { stars: 4, percentage: 0 },
    { stars: 3, percentage: 0 },
    { stars: 2, percentage: 0 },
    { stars: 1, percentage: 0 },
  ]);
  readonly profileReportRecords = signal<AdminProfileReport[]>([]);
  readonly mobileProfileReportRecords = signal<AdminProfileReport[]>([]);
  readonly listingReportRecords = signal<AdminListingReport[]>([]);
  readonly profileReportsTotal = signal(0);
  readonly listingReportsTotal = signal(0);
  readonly activityTimelineRecords = signal<AdminUserActivityYearGroup[]>([]);
  readonly overviewChartPoints = signal<AdminUserDetailChartPoint[]>([]);

  readonly user = computed(() => {
    const response = this.userDetailResponse();
    const baseUser = response ? this.mapUserDetail(response) : this.emptyUserDetail();
    const overriddenStatus = this.userStatusOverride();

    return overriddenStatus === null ? baseUser : { ...baseUser, status: overriddenStatus };
  });

  readonly userListings = computed(() => this.listingRecords());
  readonly visibleStores = computed(() => this.storeRecords());
  readonly visibleMobileStores = computed(() => this.mobileStoreRecords());
  readonly userTransactions = computed(() => this.transactionRecords());
  readonly mobileTransactions = computed(() => this.mobileTransactionRecords());

  readonly visibleListings = computed(() => {
    const query = this.listingsSearchQuery().trim().toLowerCase();

    return this.userListings().filter((listing) => {
      const categoryMatches =
        this.listingsCategoryFilter() === 'all' ||
        listing.categoryKey === this.listingsCategoryFilter();
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

  readonly mobileListings = computed(() =>
    this.listingRecords().map((listing) => this.mapMobileListing(listing)),
  );

  readonly visibleMobileListings = computed(() => {
    const query = this.listingsSearchQuery().trim().toLowerCase();
    const listings = this.mobileListings();

    return listings.filter(
      (listing) =>
        query === '' ||
        listing.name.toLowerCase().includes(query) ||
        listing.storeName.toLowerCase().includes(query),
    );
  });

  readonly visiblePromotedListingSections = computed(() => {
    return this.groupPromotedListings(
      this.promotedListingRecords().filter((listing) => listing.status === this.activeAdsStatus()),
    );
  });

  readonly mobilePromotedListings = computed(() =>
    this.promotedListingRecords().map((listing) => this.mapMobilePromotedListing(listing)),
  );

  readonly visibleMobilePromotedListingSections = computed(() => {
    return this.groupPromotedListings(
      this.mobilePromotedListings().filter((listing) => listing.status === this.activeAdsStatus()),
    );
  });

  readonly mobilePromotedStores = computed(() =>
    this.promotedStoreRecords().map((store) => this.mapMobilePromotedStore(store)),
  );

  readonly visibleMobilePromotedStores = computed(() =>
    this.mobilePromotedStores().filter((store) => store.status === this.activeAdsStatus()),
  );

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
        this.transactionDateFilter() === 'all' ||
        transaction.dateKey === this.transactionDateFilter();
      const matchesStatus =
        this.transactionStatusFilter() === 'all' ||
        transaction.status === this.transactionStatusFilter();

      return matchesType && matchesDate && matchesStatus;
    }),
  );

  readonly recentMobileTransactions = computed(() => this.mobileTransactions().slice(0, 3));
  readonly visibleReviewTags = computed(() => this.reviewTagRecords());
  readonly mobileReviewTags = computed(() => this.mobileReviewTagRecords());

  readonly visibleReviews = computed(() => {
    const reviews = [...this.reviewRecords()];

    if (this.reviewSort() === 'highest-rated') {
      return reviews.sort((a, b) => b.rating - a.rating);
    }

    return reviews;
  });

  readonly visibleMobileReviews = computed(() => {
    const reviews = [...this.mobileReviewRecords()];

    if (this.reviewSort() === 'highest-rated') {
      return reviews.sort((a, b) => b.rating - a.rating);
    }

    return reviews;
  });

  readonly visibleMobileProfileReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();
    const reports = this.mobileProfileReportRecords();

    return reports.filter(
      (report) =>
        query === '' ||
        report.storeName.toLowerCase().includes(query) ||
        report.reporterName.toLowerCase().includes(query) ||
        report.reason.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query),
    );
  });

  readonly visibleProfileReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();
    const reports = this.profileReportRecords();

    return reports.filter(
      (report) =>
        query === '' ||
        report.storeName.toLowerCase().includes(query) ||
        report.reporterName.toLowerCase().includes(query) ||
        report.reason.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query),
    );
  });

  readonly visibleListingReports = computed(() => {
    const query = this.reportSearchQuery().trim().toLowerCase();
    const reports = this.listingReportRecords();

    return reports.filter(
      (report) =>
        (this.listingReportCategoryFilter() === 'all' ||
          report.categoryKey === this.listingReportCategoryFilter()) &&
        (this.listingReportStoreFilter() === 'all' ||
          report.storeKey === this.listingReportStoreFilter()) &&
        (this.listingReportStatusFilter() === 'all' ||
          report.status === this.listingReportStatusFilter()) &&
        (query === '' ||
          report.listingName.toLowerCase().includes(query) ||
          report.storeName.toLowerCase().includes(query) ||
          report.reporterName.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query)),
    );
  });

  readonly visibleActivityTimeline = computed(() => this.activityTimelineRecords());

  readonly tabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: '/assets/icons/admin-user-details/info-circle.svg',
    },
    {
      id: 'listings' as const,
      label: 'Listings',
      icon: '/assets/icons/admin-user-details/box.svg',
    },
    { id: 'stores' as const, label: 'Stores', icon: '/assets/icons/admin-user-details/shop.svg' },
    { id: 'ads' as const, label: 'Ads', icon: '/assets/icons/admin-user-details/award.svg' },
    {
      id: 'transactions' as const,
      label: 'Transactions',
      icon: '/assets/icons/admin-user-details/moneys.svg',
    },
    { id: 'reviews' as const, label: 'Reviews', icon: '/assets/icons/admin-user-details/star.svg' },
    { id: 'reports' as const, label: 'Reports', icon: '/assets/icons/admin-user-details/flag.svg' },
    {
      id: 'activities' as const,
      label: 'Activities',
      icon: '/assets/icons/admin-user-details/document.svg',
    },
  ];
  readonly mobileTabs = [
    {
      id: 'overview' as const,
      label: 'Overview',
      icon: '/assets/icons/admin-user-details/info-circle.svg',
    },
    {
      id: 'listings' as const,
      label: 'Listings',
      icon: '/assets/icons/admin-user-details/box.svg',
    },
    { id: 'stores' as const, label: 'Stores', icon: '/assets/icons/admin-user-details/shop.svg' },
    { id: 'ads' as const, label: 'Ads', icon: '/assets/icons/admin-user-details/award.svg' },
    {
      id: 'transactions' as const,
      label: 'Transactions',
      icon: '/assets/icons/admin-user-details/moneys.svg',
    },
    { id: 'reviews' as const, label: 'Reviews', icon: '/assets/icons/admin-user-details/star.svg' },
    { id: 'reports' as const, label: 'Reports', icon: '/assets/icons/admin-user-details/flag.svg' },
    {
      id: 'activities' as const,
      label: 'Activities',
      icon: '/assets/icons/admin-user-details/document.svg',
    },
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

  readonly transactionTypeOptions: readonly CustomDropdownOption<AdminUserTransactionType>[] = [
    { value: 'all', label: 'All transaction types' },
    { value: 'wallet funding', label: 'Wallet funding' },
    { value: 'subscription payment', label: 'Subscription payment' },
  ];

  readonly transactionDateLabel = computed(() => {
    return this.transactionDateFilter() === 'all'
      ? 'Date'
      : this.formatDateLabel(this.transactionDateFilter());
  });

  readonly transactionDateOptions = computed<
    readonly CustomDropdownOption<AdminUserTransactionDate>[]
  >(() => {
    const uniqueDates = Array.from(
      new Set(this.transactionRecords().map((transaction) => transaction.date)),
    ).slice(0, 12);

    return [
      { value: 'all', label: 'All dates' },
      ...uniqueDates.map((date) => ({
        value: date,
        label: this.formatDateLabel(date),
      })),
    ];
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

  readonly transactionStatusOptions: readonly CustomDropdownOption<
    'all' | AdminUserTransactionStatus
  >[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'successful', label: 'Successful' },
    { value: 'failed', label: 'Failed' },
  ];
  readonly reviewStarsScale = [1, 2, 3, 4, 5] as const;
  readonly promotionCarouselDots = [0, 1, 2, 3] as const;

  readonly overviewRangeOptions: readonly CustomDropdownOption<AdminUserOverviewRange>[] = [
    { value: 'last-7-days', label: 'Last 7 days' },
    { value: 'last-30-days', label: 'Last 30 days' },
    { value: 'last-90-days', label: 'Last 90 days' },
  ];

  readonly reviewSortOptions: readonly CustomDropdownOption<'most-recent' | 'highest-rated'>[] = [
    { value: 'most-recent', label: 'Most recent' },
    { value: 'highest-rated', label: 'Highest rated' },
  ];

  readonly listingReportCategoryOptions = computed<
    readonly CustomDropdownOption<AdminUserListingReportCategory>[]
  >(() => [
    { value: 'all', label: 'All categories' },
    ...Array.from(
      new Map(
        this.listingReportRecords()
          .filter((report) => report.categoryKey.trim().length > 0)
          .map((report) => [
            report.categoryKey,
            { value: report.categoryKey, label: this.categorySlugToLabel(report.categoryKey) },
          ]),
      ).values(),
    ),
  ]);

  readonly listingReportStoreOptions = computed<
    readonly CustomDropdownOption<AdminUserListingReportStore>[]
  >(() => [
    { value: 'all', label: 'All stores' },
    ...Array.from(
      new Map(
        this.listingReportRecords()
          .filter((report) => report.storeKey.trim().length > 0)
          .map((report) => [report.storeKey, { value: report.storeKey, label: report.storeName }]),
      ).values(),
    ),
  ]);

  readonly listingReportStatusOptions = computed<
    readonly CustomDropdownOption<AdminUserListingReportStatus>[]
  >(() => [
    { value: 'all', label: 'All statuses' },
    ...Array.from(
      new Map(
        this.listingReportRecords()
          .filter((report) => report.status.trim().length > 0)
          .map((report) => [
            report.status,
            { value: report.status, label: this.formatReportStatus(report.status) },
          ]),
      ).values(),
    ),
  ]);

  readonly reviewSortLabel = computed(() =>
    this.reviewSort() === 'most-recent' ? 'Most recent' : 'Highest rated',
  );

  readonly filteredOverviewChartPoints = computed(() => {
    const allPoints = this.overviewChartPoints();
    if (allPoints.length === 0) {
      return [];
    }

    const sliceSize =
      this.overviewRange() === 'last-7-days'
        ? 7
        : this.overviewRange() === 'last-30-days'
          ? 30
          : 90;

    return allPoints.slice(-sliceSize);
  });

  readonly months = computed(() => {
    const chartPoints = this.filteredOverviewChartPoints();
    const desktopPoints =
      chartPoints.length <= 12
        ? chartPoints
        : chartPoints
            .filter((_, index) => index % Math.ceil(chartPoints.length / 12) === 0)
            .slice(-12);
    const maxCount = Math.max(...desktopPoints.map((point) => point.count), 1);

    return desktopPoints.map((point, index) => ({
      label: this.shortDateLabel(point.date),
      x: 34 + index * 74,
      height: Math.max(16, Math.round((point.count / maxCount) * 142)),
      highlight: index === desktopPoints.length - 1,
      value: point.count,
      date: point.date,
    }));
  });

  readonly mobileMonths = computed(() => {
    const chartPoints = this.filteredOverviewChartPoints();
    const mobilePoints =
      chartPoints.length <= 9
        ? chartPoints
        : chartPoints
            .filter((_, index) => index % Math.ceil(chartPoints.length / 9) === 0)
            .slice(-9);
    const maxCount = Math.max(...mobilePoints.map((point) => point.count), 1);

    return mobilePoints.map((point, index) => ({
      label: this.shortDateLabel(point.date).toUpperCase(),
      height: Math.max(18, Math.round((point.count / maxCount) * 112)),
      highlight: index === mobilePoints.length - 1,
      value: point.count,
      date: point.date,
    }));
  });

  readonly overviewSoldItemsCount = computed(() =>
    this.filteredOverviewChartPoints().reduce((sum, point) => sum + point.count, 0),
  );

  readonly overviewGrowthLabel = computed(() => {
    const currentPoints = this.filteredOverviewChartPoints();
    if (currentPoints.length === 0) {
      return '0% vs previous period';
    }

    const allPoints = this.overviewChartPoints();
    const currentWindow = currentPoints.length;
    const previousPoints = allPoints.slice(-(currentWindow * 2), -currentWindow);
    const currentTotal = currentPoints.reduce((sum, point) => sum + point.count, 0);
    const previousTotal = previousPoints.reduce((sum, point) => sum + point.count, 0);

    if (previousTotal === 0) {
      return currentTotal === 0 ? '0% vs previous period' : '100% vs previous period';
    }

    const delta = ((currentTotal - previousTotal) / previousTotal) * 100;
    return `${delta >= 0 ? '↑' : '↓'} ${Math.abs(delta).toFixed(0)}% vs previous period`;
  });

  readonly overviewChartHighlight = computed(() => {
    const points = this.filteredOverviewChartPoints();
    const point = points[points.length - 1] ?? null;
    if (!point) {
      return null;
    }

    return {
      label: this.formatDateLabel(point.date),
      value: point.count,
    };
  });

  readonly overviewChartScaleMax = computed(() => {
    const maxValue = Math.max(...this.filteredOverviewChartPoints().map((point) => point.count), 0);
    return maxValue === 0 ? 1 : maxValue;
  });

  readonly overviewChartScaleMid = computed(() => Math.round(this.overviewChartScaleMax() / 2));

  readonly listingsCategoryLabel = computed(() => {
    if (this.listingsCategoryFilter() === 'all') {
      return 'Category';
    }

    return (
      this.listingsCategoryOptions().find(
        (option) => option.value === this.listingsCategoryFilter(),
      )?.label ?? 'Category'
    );
  });

  readonly listingsCategoryOptions = computed<
    readonly CustomDropdownOption<AdminManagedListingCategory>[]
  >(() => [
    { value: 'all', label: 'All categories' },
    ...Array.from(
      new Map(
        this.allListingRecords()
          .filter((listing) => listing.categoryKey.trim().length > 0)
          .map((listing) => [
            listing.categoryKey,
            { value: listing.categoryKey, label: listing.categoryLabel },
          ]),
      ).values(),
    ),
  ]);

  readonly listingsStoreLabel = computed(() => {
    if (this.listingsStoreFilter() === 'all') {
      return 'Store';
    }

    return (
      this.listingsStoreOptions().find((option) => option.value === this.listingsStoreFilter())
        ?.label ?? 'Store'
    );
  });

  readonly listingsStoreOptions = computed<
    readonly CustomDropdownOption<AdminManagedListingStore>[]
  >(() => [
    { value: 'all', label: 'All stores' },
    ...this.storeRecords().map((store) => ({
      value: store.id,
      label: store.name,
    })),
  ]);

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

  readonly listingsStatusOptions: readonly CustomDropdownOption<
    'all' | AdminManagedListingStatus
  >[] = [
    { value: 'all', label: 'All statuses' },
    { value: 'available', label: 'Available' },
    { value: 'sold', label: 'Sold' },
    { value: 'draft', label: 'Draft' },
    { value: 'paused', label: 'Paused' },
  ];

  constructor() {
    effect(
      () => {
        const routeUserId = this.routeUserId().trim();
        if (!routeUserId || this.hasRedirectedInvalidUserId() || this.userId()) {
          return;
        }

        this.hasRedirectedInvalidUserId.set(true);
        this.toast.show({ message: 'That user could not be found.' });
        void this.router.navigate(['/admin/users']);
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId) {
          return;
        }

        this.userReloadTrigger();
        this.isLoading.set(true);
        this.userLoadFailed.set(false);
        const sub = this.adminUserDetailsService.getUser(userId).subscribe({
          next: (user) => {
            this.userDetailResponse.set(user);
            this.userStatusOverride.set(null);
            this.overviewChartPoints.set(user.sold_items_chart ?? []);
            this.isLoading.set(false);
            this.userLoadFailed.set(false);
          },
          error: (error: unknown) => {
            this.isLoading.set(false);
            this.resetBackendState();

            if (error instanceof HttpErrorResponse && error.status === 404) {
              this.toast.show({ message: 'That user could not be found.' });
              void this.router.navigate(['/admin/users']);
              return;
            }

            this.userLoadFailed.set(true);
            this.toast.show({
              message: 'That user isn’t available right now. Please try again shortly.',
            });
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'listings') {
          return;
        }

        const sub = this.adminUserDetailsService
          .getUserListings(userId, {
            category: this.listingsCategoryFilter(),
            store: this.listingsStoreFilter(),
            status: this.listingsStatusFilter(),
            search: this.listingsSearchQuery(),
          })
          .subscribe({
            next: (response) => {
              const listings = (response.results ?? []).map((listing) =>
                this.mapListingRecord(listing),
              );
              this.listingRecords.set(listings);
              this.listingsTotal.set(response.count ?? listings.length);

              if (
                this.listingsCategoryFilter() === 'all' &&
                this.listingsStoreFilter() === 'all' &&
                this.listingsStatusFilter() === 'all' &&
                this.listingsSearchQuery().trim() === ''
              ) {
                this.allListingRecords.set(listings);
              }
            },
            error: () => {
              this.listingRecords.set([]);
              this.listingsTotal.set(0);
            },
          });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'transactions') {
          return;
        }

        const sub = this.adminUserDetailsService
          .getUserTransactions(userId, {
            transactionType: this.transactionTypeFilter(),
            status: this.transactionStatusFilter(),
            date: this.transactionDateFilter(),
          })
          .subscribe({
            next: (response) => {
              this.walletBalance.set(this.formatCurrency(response.wallet_balance));
              const transactions = (response.results ?? []).map((transaction) =>
                this.mapTransactionRecord(transaction),
              );
              this.transactionsTotal.set(response.count ?? transactions.length);
              this.transactionRecords.set(transactions);
              this.mobileTransactionRecords.set(
                (response.results ?? []).map((transaction) =>
                  this.mapMobileTransactionRecord(transaction),
                ),
              );
            },
            error: () => {
              this.walletBalance.set('₦0');
              this.transactionsTotal.set(0);
              this.transactionRecords.set([]);
              this.mobileTransactionRecords.set([]);
            },
          });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'reviews') {
          return;
        }

        const ordering = this.reviewSort() === 'highest-rated' ? 'highest' : 'most_recent';
        const sub = this.adminUserDetailsService.getUserReviews(userId, ordering).subscribe({
          next: (response) => {
            this.reviewTagRecords.set(
              response.tags_summary.map((tag) => ({ label: tag.name, count: tag.usage_count })),
            );
            this.mobileReviewTagRecords.set(
              response.tags_summary.map((tag) => ({ label: tag.name, count: tag.usage_count })),
            );
            this.reviewAverage.set(response.average_rating.toFixed(2));
            this.reviewTotal.set(response.total);
            const reviews = (response.results ?? []).map((review) => this.mapReviewRecord(review));
            this.reviewRecords.set(reviews);
            this.mobileReviewRecords.set(reviews);
            this.ratingBreakdown.set(this.mapRatingBreakdown(response));
          },
          error: () => {
            this.reviewTagRecords.set([]);
            this.mobileReviewTagRecords.set([]);
            this.reviewRecords.set([]);
            this.mobileReviewRecords.set([]);
            this.reviewAverage.set('0.00');
            this.reviewTotal.set(0);
            this.ratingBreakdown.set([
              { stars: 5, percentage: 0 },
              { stars: 4, percentage: 0 },
              { stars: 3, percentage: 0 },
              { stars: 2, percentage: 0 },
              { stars: 1, percentage: 0 },
            ]);
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'reports') {
          return;
        }

        const sub = forkJoin({
          profile: this.adminUserDetailsService.getUserReports(
            userId,
            'profile',
            this.reportSearchQuery(),
          ),
          listing: this.adminUserDetailsService.getUserReports(
            userId,
            'listing',
            this.reportSearchQuery(),
          ),
        }).subscribe({
          next: ({ profile, listing }) => {
            this.profileReportsTotal.set(profile.count);
            this.listingReportsTotal.set(listing.count);
            const profileReports = (profile.results ?? []).map((report) =>
              this.mapProfileReport(report),
            );
            this.profileReportRecords.set(profileReports);
            this.mobileProfileReportRecords.set(profileReports);
            this.listingReportRecords.set(
              (listing.results ?? []).map((report) => this.mapListingReport(report)),
            );
          },
          error: () => {
            this.profileReportsTotal.set(0);
            this.listingReportsTotal.set(0);
            this.profileReportRecords.set([]);
            this.mobileProfileReportRecords.set([]);
            this.listingReportRecords.set([]);
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || (this.activeTab() !== 'stores' && this.activeTab() !== 'listings')) {
          return;
        }

        const sub = this.adminUserDetailsService.getUserStores(userId).subscribe({
          next: (response) => {
            this.storeRecords.set(
              (response.results ?? []).map((store) => this.mapStoreRecord(store)),
            );
            this.mobileStoreRecords.set(
              (response.results ?? []).map((store) => this.mapStoreRecord(store, true)),
            );
          },
          error: () => {
            this.storeRecords.set([]);
            this.mobileStoreRecords.set([]);
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'ads') {
          return;
        }

        const sub = this.adminUserDetailsService.getUserAds(userId).subscribe({
          next: (response) => {
            this.subscriptionSummary.set(this.mapSubscriptionSummary(response));
            this.promotedListingRecords.set(
              this.mapPromotedListingAds(response.promoted_listings.items),
            );
            this.promotedStoreRecords.set(
              this.mapStorePromotionAds(response.store_promotions.items),
            );
            this.bannerAdRecords.set(this.mapBannerAds(response.banner_ads.items));
            this.adStatusCounts.set({
              'promoted listings': response.promoted_listings.counts,
              'store promotions': response.store_promotions.counts,
              'banner ads': response.banner_ads.counts,
            });
          },
          error: () => {
            this.subscriptionSummary.set(null);
            this.promotedListingRecords.set([]);
            this.promotedStoreRecords.set([]);
            this.bannerAdRecords.set([]);
            this.adStatusCounts.set({
              'promoted listings': {},
              'store promotions': {},
              'banner ads': {},
            });
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );

    effect(
      (onCleanup) => {
        const userId = this.userId();
        if (!userId || this.activeTab() !== 'activities') {
          return;
        }

        const sub = this.adminUserDetailsService.getUserActivities(userId, 'all').subscribe({
          next: (response) => {
            this.activityTimelineRecords.set(this.mapActivitiesTimeline(response));
          },
          error: () => {
            this.activityTimelineRecords.set([]);
          },
        });

        onCleanup(() => sub.unsubscribe());
      },
      { allowSignalWrites: true },
    );
  }

  activeTabLabel(): string {
    return this.tabs.find((tab) => tab.id === this.activeTab())?.label ?? 'Overview';
  }

  reloadUser(): void {
    this.userReloadTrigger.update((value) => value + 1);
  }

  userPromotedListings(): AdminManagedPromotionListing[] {
    return this.promotedListingRecords();
  }

  userPromotedStores(): AdminManagedStorePromotion[] {
    return this.promotedStoreRecords();
  }

  userBannerAds(): AdminManagedBannerAd[] {
    return this.bannerAdRecords();
  }

  countUserAdsByStatus(status: AdminManagedAdsFilterStatus): number {
    const counts = this.adStatusCounts()[this.activeAdsPlacement()];
    return Number(counts?.[status] ?? 0);
  }

  private resetBackendState(): void {
    this.userDetailResponse.set(null);
    this.overviewChartPoints.set([]);
    this.listingRecords.set([]);
    this.allListingRecords.set([]);
    this.listingsTotal.set(0);
    this.storeRecords.set([]);
    this.mobileStoreRecords.set([]);
    this.promotedListingRecords.set([]);
    this.promotedStoreRecords.set([]);
    this.bannerAdRecords.set([]);
    this.adStatusCounts.set({
      'promoted listings': {},
      'store promotions': {},
      'banner ads': {},
    });
    this.subscriptionSummary.set(null);
    this.walletBalance.set('₦0');
    this.transactionsTotal.set(0);
    this.transactionRecords.set([]);
    this.mobileTransactionRecords.set([]);
    this.reviewTagRecords.set([]);
    this.mobileReviewTagRecords.set([]);
    this.reviewRecords.set([]);
    this.mobileReviewRecords.set([]);
    this.reviewAverage.set('0.00');
    this.reviewTotal.set(0);
    this.profileReportRecords.set([]);
    this.mobileProfileReportRecords.set([]);
    this.listingReportRecords.set([]);
    this.profileReportsTotal.set(0);
    this.listingReportsTotal.set(0);
    this.activityTimelineRecords.set([]);
    this.ratingBreakdown.set([
      { stars: 5, percentage: 0 },
      { stars: 4, percentage: 0 },
      { stars: 3, percentage: 0 },
      { stars: 2, percentage: 0 },
      { stars: 1, percentage: 0 },
    ]);
  }

  private emptyUserDetail(): UserDetail {
    return {
      id: '',
      name: 'User',
      email: '',
      avatar: '',
      avatarInitials: 'U',
      avatarBackground: 'linear-gradient(135deg, #E6E8ED 0%, #C6CCD6 100%)',
      status: 'active',
      dateJoined: '—',
      lastSignedIn: '—',
      phoneNumber: '—',
      totalSoldItems: '0',
      growthLabel: '0% vs previous period',
      mostViewedListingTitle: 'No listing yet',
      mostViewedListingImage: '',
      mostViewedListingCount: '0',
      distribution: [
        { label: 'Sold', value: '0', color: '#34B54A' },
        { label: 'Available', value: '0', color: '#4C86F5' },
        { label: 'Paused', value: '0', color: '#F3A233' },
      ],
    };
  }

  private mapUserDetail(response: AdminUserDetailResponse): UserDetail {
    const name = response.full_name?.trim() || response.email || 'User';
    const mostViewed = response.most_viewed_listing;
    const totalSoldItems = this.overviewSoldItemsCount();

    return {
      id: String(response.id),
      name,
      email: response.email,
      avatar: response.avatar ?? '',
      avatarInitials: this.initialsFromLabel(name),
      avatarBackground: this.avatarGradientForLabel(name),
      status: response.is_banned ? 'banned' : response.is_active ? 'active' : 'suspended',
      dateJoined: this.formatDateLabel(response.created_at),
      lastSignedIn: response.last_login ? this.formatDateLabel(response.last_login) : 'Never',
      phoneNumber: response.phone_number?.trim() || '—',
      totalSoldItems: this.formatInteger(totalSoldItems),
      growthLabel: this.overviewGrowthLabel(),
      mostViewedListingTitle: mostViewed?.title ?? 'No listing yet',
      mostViewedListingImage: mostViewed?.thumbnail ?? '',
      mostViewedListingCount: this.formatInteger(mostViewed?.views_count ?? 0),
      distribution: [
        {
          label: 'Sold',
          value: this.formatInteger(response.listing_distribution.sold),
          color: '#34B54A',
        },
        {
          label: 'Available',
          value: this.formatInteger(response.listing_distribution.available),
          color: '#4C86F5',
        },
        {
          label: 'Paused',
          value: this.formatInteger(response.listing_distribution.paused),
          color: '#F3A233',
        },
      ],
    };
  }

  private mapListingRecord(record: AdminUserListingRecord): AdminManagedListing {
    return {
      id: record.id,
      name: record.title,
      thumbnail: record.thumbnail ?? '',
      categoryKey: this.slugifyLabel(record.category),
      categoryLabel: record.category,
      price: this.formatCurrency(record.price),
      storeKey: record.store_id,
      storeName: record.store_name || record.vendor_name,
      storeBackground: this.avatarGradientForLabel(record.store_name || record.vendor_name),
      status: this.mapListingStatus(record.status),
      boosted: record.is_promoted,
    };
  }

  private mapMobileListing(listing: AdminManagedListing): MobileAdminListing {
    return {
      id: listing.id,
      name: listing.name,
      thumbnail: listing.thumbnail,
      storeName: listing.storeName,
      price: listing.price,
      status: listing.status,
      promoted: listing.boosted,
    };
  }

  private mapStoreRecord(record: AdminUserStoreRecord, mobile = false): Store {
    const base: Store = {
      id: record.id,
      name: record.store_name,
      description: record.store_bio,
      route: ['/admin/stores', record.id],
      location: record.location,
      coverImage: record.cover_image ?? undefined,
      mobileCoverImage: mobile ? (record.cover_image ?? undefined) : undefined,
      logoImage: record.profile_photo ?? undefined,
      mobileLogoImage: mobile ? (record.profile_photo ?? undefined) : undefined,
      followers: this.formatInteger(record.followers_count),
      isVerified: record.user?.is_verified ?? false,
      callNumber: record.call_number ?? undefined,
      alternateCallNumber: record.call_number_2 ?? undefined,
    };

    return base;
  }

  private mapSubscriptionSummary(
    response: AdminUserAdsResponse,
  ): { planName: string; activeUntil: string; price: string } | null {
    const subscription = response.subscription;
    if (!subscription) {
      return null;
    }

    return {
      planName: subscription.plan_name,
      activeUntil: this.formatDateLabel(subscription.active_until),
      price: this.formatCurrency(subscription.price),
    };
  }

  private mapPromotedListingAds(records: AdminUserAdRecord[]): AdminManagedPromotionListing[] {
    return records.map((record) => ({
      id: String(record.id),
      title: record.promoted_listing_title?.trim() || record.title,
      price: this.formatCurrency(record.promoted_listing_price ?? record.amount_paid),
      views: this.formatInteger(record.total_views),
      clicks: this.formatInteger(record.total_clicks),
      messages: this.formatInteger(record.total_messages ?? 0),
      calls: this.formatInteger(record.total_calls ?? 0),
      expiresOn: this.formatDateLabel(record.end_date),
      status: this.mapAdStatus(record.status),
      placement: 'promoted listings',
      category: record.promoted_listing_category?.trim() || 'Other listings',
      image: record.image ?? '',
    }));
  }

  private mapMobilePromotedListing(
    listing: AdminManagedPromotionListing,
  ): AdminManagedPromotedListingCard {
    return {
      id: listing.id,
      title: listing.title,
      price: listing.price,
      views: listing.views,
      clicks: listing.clicks,
      messages: listing.messages,
      calls: listing.calls,
      expiresOn: listing.expiresOn,
      status: listing.status,
      category: listing.category,
      image: listing.image,
    };
  }

  private groupPromotedListings<T extends { category: AdminManagedPromotedListingCategory }>(
    listings: T[],
  ): Array<{ category: string; label: string; items: T[] }> {
    const sections = new Map<string, T[]>();

    for (const listing of listings) {
      const category = listing.category.trim() || 'Other listings';
      sections.set(category, [...(sections.get(category) ?? []), listing]);
    }

    return Array.from(sections, ([category, items]) => ({
      category,
      label: category,
      items,
    }));
  }

  private mapStorePromotionAds(records: AdminUserAdRecord[]): AdminManagedStorePromotion[] {
    return records.map((record) => ({
      id: String(record.id),
      name: record.promoted_store_name ?? record.title,
      logo: record.promoted_store_image ?? '',
      banner: record.image ?? '',
      location: record.promoted_store_location?.trim() || 'Location unavailable',
      impressions: this.formatInteger(record.total_views),
      clicks: this.formatInteger(record.total_clicks),
      messages: this.formatInteger(record.total_messages ?? 0),
      expiresOn: this.formatDateLabel(record.end_date),
      status: this.mapAdStatus(record.status),
      isVerified: record.promoted_store_is_verified ?? false,
    }));
  }

  private mapMobilePromotedStore(store: AdminManagedStorePromotion): MobilePromotedStore {
    return {
      id: store.id,
      name: store.name,
      route: ['/admin/stores', store.id],
      location: store.location,
      mobileCoverImage: store.banner,
      mobileLogoImage: store.logo,
      status: store.status,
      isVerified: store.isVerified,
    };
  }

  private mapBannerAds(records: AdminUserAdRecord[]): AdminManagedBannerAd[] {
    return records.map((record) => ({
      id: String(record.id),
      title: record.title,
      subtitle: 'Banner campaign',
      primaryFigure: this.formatInteger(record.total_views),
      secondaryFigure: this.formatInteger(record.total_clicks),
      expiresOn: this.formatDateLabel(record.end_date),
      sponsorLabel: 'Sponsored',
      views: this.formatInteger(record.total_views),
      clicks: this.formatInteger(record.total_clicks),
      cardTone: '#E7E3FF',
      textTone: '#1A1C21',
      accentTone: '#6453D9',
      badgeTone: '#F1FFAC',
      imagePreview: record.image,
      route: ['/admin/ads/running'],
      showSponsorBadge: true,
      placement: 'banner ads',
      status: this.mapBannerStatus(record.status),
    }));
  }

  private mapTransactionRecord(record: AdminUserTransactionRecord): AdminUserTransaction {
    return {
      id: String(record.id),
      amount: this.formatCurrency(record.amount),
      type: this.mapTransactionType(record),
      date: this.formatDateTimeLabel(record.date),
      dateKey: record.date,
      status: record.status === 'failed' ? 'failed' : 'successful',
    };
  }

  private mapMobileTransactionRecord(
    record: AdminUserTransactionRecord,
  ): AdminUserMobileTransaction {
    const transactionType = this.mapTransactionType(record);
    return {
      id: String(record.id),
      amount: this.formatCurrency(record.amount),
      type: transactionType === 'wallet funding' ? 'Wallet funding' : 'Subscription payment',
      dateLabel: this.formatDateTimeLabel(record.date),
      status: record.status === 'failed' ? 'failed' : 'successful',
      icon:
        transactionType === 'wallet funding'
          ? '/assets/images/admin-user-details/transactions/wallet-funding-icon.png'
          : '/assets/images/admin-user-details/transactions/subscription-payment-icon.png',
    };
  }

  private mapReviewRecord(record: AdminUserReviewRecord): AdminUserReview {
    return {
      author: record.reviewer.full_name?.trim() || record.reviewer.username,
      avatar: record.reviewer.avatar ?? '',
      rating: record.rating,
      date: this.formatDateLabel(record.created_at),
      text: record.comment,
      images: record.photos.map((photo) => photo.image),
    };
  }

  private mapRatingBreakdown(
    response: AdminUserReviewsResponse,
  ): Array<{ stars: number; percentage: number }> {
    return [5, 4, 3, 2, 1].map((stars) => ({
      stars,
      percentage: Number(response.star_breakdown[String(stars)]?.percent ?? 0),
    }));
  }

  private mapProfileReport(record: AdminUserReportRecord): AdminProfileReport {
    return {
      id: String(record.id),
      storeName: record.store?.name ?? 'Personal account',
      storeLogo: record.store?.logo ?? '',
      reporterName: record.reported_by.name,
      reporterEmail: record.reported_by.email,
      reporterAvatar: record.reported_by.avatar ?? '',
      reason: record.reason,
      description: record.description,
    };
  }

  private mapListingReport(record: AdminUserReportRecord): AdminListingReport {
    return {
      id: String(record.id),
      listingName: record.listing?.title ?? 'Listing',
      listingImage: record.listing?.image ?? '',
      categoryKey: record.listing?.category_slug ?? '',
      storeName: record.store?.name ?? 'Store',
      storeKey: record.store?.id ?? '',
      storeIcon: record.store?.logo ?? '',
      reporterName: record.reported_by.name,
      reporterEmail: record.reported_by.email,
      reporterAvatar: record.reported_by.avatar ?? '',
      status: record.status,
      description: record.description,
    };
  }

  private mapActivitiesTimeline(
    response: AdminUserActivitiesResponse,
  ): AdminUserActivityYearGroup[] {
    const groupedByYear = new Map<string, Map<string, AdminUserActivity[]>>();

    for (const dayGroup of response.timeline ?? []) {
      for (const event of dayGroup.events) {
        const eventDate = new Date(event.timestamp);
        const year = String(eventDate.getFullYear());
        const monthLabel = eventDate.toLocaleDateString('en-US', { month: 'long' });
        const yearGroups = groupedByYear.get(year) ?? new Map<string, AdminUserActivity[]>();
        const monthEvents = yearGroups.get(monthLabel) ?? [];
        monthEvents.push({
          id: String(event.id ?? `${event.activity_type}-${event.timestamp}`),
          kind: this.activityKind(event.activity_type),
          title: event.label,
          detail: event.description,
          actorName: event.actor_name ?? 'System',
          actorAvatar: event.actor_avatar ?? '',
          mobileActorAvatar: event.actor_avatar ?? '',
          actorInitials: this.initialsFromLabel(event.actor_name ?? 'System'),
          actorBackground: this.avatarGradientForLabel(event.actor_name ?? 'System'),
          timestamp: this.formatDateTimeLabel(event.timestamp),
        });
        yearGroups.set(monthLabel, monthEvents);
        groupedByYear.set(year, yearGroups);
      }
    }

    return Array.from(groupedByYear.entries())
      .sort((left, right) => Number(right[0]) - Number(left[0]))
      .map(([year, monthGroups]) => ({
        year,
        groups: Array.from(monthGroups.entries()).map(([label, items]) => ({
          label,
          items,
        })),
      }));
  }

  private mapTransactionType(
    record: AdminUserTransactionRecord,
  ): Exclude<AdminUserTransactionType, 'all'> {
    const description = record.description.toLowerCase();
    return description.includes('subscription') ? 'subscription payment' : 'wallet funding';
  }

  private mapListingStatus(status: string): AdminManagedListingStatus {
    switch (status) {
      case 'published':
      case 'available':
        return 'available';
      case 'sold':
        return 'sold';
      case 'draft':
        return 'draft';
      default:
        return 'paused';
    }
  }

  private mapAdStatus(status: string): AdminManagedAdStatus {
    if (status === 'paused') {
      return 'paused';
    }
    if (status === 'expired') {
      return 'expired';
    }
    return 'active';
  }

  private mapBannerStatus(status: string): AdminManagedBannerStatus {
    switch (status) {
      case 'paused':
      case 'expired':
      case 'declined':
        return status;
      case 'pending':
        return 'pending approval';
      default:
        return 'active';
    }
  }

  private activityKind(type: string): AdminUserActivity['kind'] {
    switch (type) {
      case 'offer_received':
        return 'offer';
      case 'callback_request':
        return 'callback';
      case 'listing_published':
      case 'published':
        return 'published';
      case 'listing_view':
      case 'view':
        return 'view';
      case 'wishlist':
        return 'wishlist';
      default:
        return 'message';
    }
  }

  protected categorySlugToLabel(value: string): string {
    return value
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  protected slugifyLabel(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  protected formatReportStatus(value: string): string {
    return value
      .split(/[_-]/g)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  protected formatDateLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  protected formatDateTimeLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  protected shortDateLabel(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  protected formatInteger(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
  }

  protected formatCurrency(value: string | number): string {
    const numericValue = typeof value === 'number' ? value : Number(value);
    if (Number.isNaN(numericValue)) {
      return `₦${value}`;
    }

    return `₦${new Intl.NumberFormat('en-US').format(numericValue)}`;
  }

  protected initialsFromLabel(value: string): string {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return 'U';
    }

    return parts
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }

  protected avatarGradientForLabel(value: string): string {
    const gradients = [
      'linear-gradient(135deg, #F6B14B 0%, #F28D28 100%)',
      'linear-gradient(135deg, #D6D9E0 0%, #AEB6C7 100%)',
      'linear-gradient(135deg, #E7D9CC 0%, #C3A38E 100%)',
      'linear-gradient(135deg, #6AA7D8 0%, #2E4F78 100%)',
      'linear-gradient(135deg, #D9E7CC 0%, #8FA36C 100%)',
    ];
    const hash = Array.from(value).reduce((sum, character) => sum + character.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  }

  scrollPromotedListings(container: HTMLElement, distance: number): void {
    container.scrollBy({ left: distance, behavior: 'smooth' });
  }

  cycleListingsCategoryFilter(): void {
    const options = this.listingsCategoryOptions();
    const currentIndex = options.findIndex(
      (option) => option.value === this.listingsCategoryFilter(),
    );
    const nextOption = options[(currentIndex + 1 + options.length) % options.length];
    this.listingsCategoryFilter.set(nextOption?.value ?? 'all');
  }

  cycleListingsStoreFilter(): void {
    const options = this.listingsStoreOptions();
    const currentIndex = options.findIndex((option) => option.value === this.listingsStoreFilter());
    const nextOption = options[(currentIndex + 1 + options.length) % options.length];
    this.listingsStoreFilter.set(nextOption?.value ?? 'all');
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
    const options = this.transactionDateOptions();
    const currentIndex = options.findIndex(
      (option) => option.value === this.transactionDateFilter(),
    );
    const nextOption = options[(currentIndex + 1 + options.length) % options.length];
    this.transactionDateFilter.set(nextOption?.value ?? 'all');
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
    this.reviewSort.update((value) => (value === 'most-recent' ? 'highest-rated' : 'most-recent'));
  }

  updateListingsSearchQuery(value: string): void {
    this.listingsSearchQuery.set(value);
  }

  updateReportSearchQuery(value: string): void {
    this.reportSearchQuery.set(value);
  }

  downloadUserData(): void {
    this.isMobileUserActionsOpen.set(false);
    this.isUserActionsOpen.set(false);
    const userId = this.userId();
    if (!userId || this.isDownloadingUserData()) {
      return;
    }

    this.isDownloadingUserData.set(true);
    this.adminUserDetailsService.downloadUserData(userId).subscribe({
      next: (response) => {
        const objectUrl = URL.createObjectURL(response.body ?? new Blob([], { type: 'text/html' }));
        const downloadLink = this.document.createElement('a');
        downloadLink.href = objectUrl;
        downloadLink.download = `duduzili-user-${userId}-data.html`;
        downloadLink.style.display = 'none';
        this.document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(objectUrl);
        this.toast.show({ message: 'User data downloaded successfully.' });
        this.isDownloadingUserData.set(false);
      },
      error: () => {
        this.toast.show({ message: 'We couldn’t download this user’s data. Please try again.' });
        this.isDownloadingUserData.set(false);
      },
    });
  }

  deactivateUser(): void {
    this.isMobileUserActionsOpen.set(false);
    this.isUserActionsOpen.set(false);
    const userId = this.userId();
    if (!userId) {
      return;
    }

    this.adminUserDetailsService.suspendUser(userId).subscribe({
      next: () => {
        this.userStatusOverride.set('suspended');
        this.userDetailResponse.update((current) =>
          current ? { ...current, is_active: false } : current,
        );
        this.toast.show({ message: 'User suspended successfully.' });
      },
      error: () => {
        this.toast.show({
          message: 'That user couldn’t be deactivated right now. Please try again.',
        });
      },
    });
  }

  activateUser(): void {
    this.isMobileUserActionsOpen.set(false);
    this.isUserActionsOpen.set(false);
    const userId = this.userId();
    if (!userId) {
      return;
    }

    this.adminUserDetailsService.activateUser(userId).subscribe({
      next: () => {
        this.userStatusOverride.set('active');
        this.userDetailResponse.update((current) =>
          current ? { ...current, is_active: true, is_banned: false } : current,
        );
        this.toast.show({ message: 'User activated successfully.' });
      },
      error: () => {
        this.toast.show({
          message: 'That user couldn’t be activated right now. Please try again.',
        });
      },
    });
  }

  protected primaryUserActionLabel(): string {
    switch (this.user().status) {
      case 'active':
        return 'Deactivate user';
      case 'banned':
        return 'Unban user';
      case 'suspended':
      default:
        return 'Activate user';
    }
  }

  handlePrimaryUserAction(): void {
    if (this.user().status === 'active') {
      this.deactivateUser();
      return;
    }

    this.activateUser();
  }

  banUser(): void {
    this.isMobileUserActionsOpen.set(false);
    this.isUserActionsOpen.set(false);
    const userId = this.userId();
    if (!userId) {
      return;
    }

    this.adminUserDetailsService.banUser(userId).subscribe({
      next: () => {
        this.userStatusOverride.set('banned');
        this.userDetailResponse.update((current) =>
          current ? { ...current, is_active: false, is_banned: true } : current,
        );
        this.toast.show({ message: 'User banned successfully. Active sessions were revoked.' });
      },
      error: () => {
        this.toast.show({ message: 'That user couldn’t be banned right now. Please try again.' });
      },
    });
  }

  activityIcon(kind: AdminUserActivity['kind']): string {
    switch (kind) {
      case 'message':
        return '/assets/icons/admin-user-details/activities/message.svg';
      case 'offer':
        return '/assets/icons/admin-user-details/activities/offer.svg';
      case 'callback':
        return '/assets/icons/admin-user-details/activities/callback.svg';
      case 'call':
        return '/assets/icons/admin-user-details/activities/call.svg';
      case 'wishlist':
        return '/assets/icons/admin-user-details/activities/wishlist.svg';
      case 'view':
        return '/assets/icons/admin-user-details/activities/view.svg';
      case 'published':
        return '/assets/icons/admin-user-details/activities/published.svg';
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

  mobileListingStatusLabel(status: MobileAdminListingStatus): string {
    switch (status) {
      case 'available':
        return 'Available';
      case 'sold':
        return 'Sold';
      case 'draft':
        return 'Draft';
      case 'paused':
        return 'Paused';
      case 'suspended':
        return 'Suspended';
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
