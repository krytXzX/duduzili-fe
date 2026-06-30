import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { DomSanitizer, type SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroEllipsisHorizontal } from '@ng-icons/heroicons/outline';
import {
  ListingPromotionSelection,
  PromoteListingModalComponent,
} from '../../components/listings/promote-listing-modal.component';
import {
  ListingsApiItem,
  ListingsService,
  ManageListingsCategory,
  ManageListingsDeliveryOption,
  ManageListingsProductCondition,
  ManageListingsResponse,
  ManageListingsStore,
  PromotionPlanApiItem,
  UpdateListingRequest,
} from '../../services/listings.service';
import { AppToastService } from '../../services/app-toast.service';
import { environment } from '../../../environments/environment';
import { formatListingPricing } from '../../utils/listing-pricing';

type ListingTab = 'overview' | 'requests' | 'activities';
type ListingStatus = 'Available' | 'Paused' | 'Sold';

interface GalleryImage {
  id: string | null;
  type: 'image' | 'youtube';
  src: string;
  alt: string;
  embedUrl?: SafeResourceUrl;
  externalUrl?: string;
}

interface EditableGalleryImage {
  token: string;
  kind: 'existing' | 'pending';
  imageId: string | null;
  file?: File;
  previewUrl?: string;
  src: string;
  alt: string;
}

interface ListingRequest {
  id: string;
  buyer: string;
  avatar: string;
  message: string;
  time: string;
  sortTime: number;
  metaLabel: string;
  metaValue: string;
  status: 'New' | 'Responded' | 'Called';
}

interface ListingActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  actorAvatar: string | null;
}

interface ListingDetailItem {
  label: string;
  value: string;
}

interface ListingDetails {
  id: string;
  name: string;
  previewImage: string;
  lastUpdated: string;
  datePosted: string;
  location: string;
  price: string;
  originalPrice: string;
  discountBadge: string;
  description: string;
  status: ListingStatus;
  messages: number;
  views: string;
  saves: number;
  isPromoted: boolean;
  gallery: GalleryImage[];
  store: {
    id: string;
    name: string;
    logo: string;
    isVerified: boolean;
  };
}

interface StatusOption {
  label: string;
  value: ListingStatus;
  tone: 'available' | 'paused' | 'sold';
}

interface DeliveryOption {
  readonly id: string;
  readonly label: string;
  readonly kind: 'method' | 'range' | 'other';
}

interface TabItem {
  id: ListingTab;
  label: string;
  iconSrc: string;
}

interface ActionItem {
  id: MobileActionId;
  label: string;
  iconSrc?: string;
}

type MobileActionId = 'share' | 'edit' | 'pause' | 'resume' | 'delete';
type EditSectionId = 'media' | 'details' | 'delivery';

@Component({
  selector: 'app-listing-details-page',
  imports: [
    CommonModule,
    NgOptimizedImage,
    RouterLink,
    ReactiveFormsModule,
    PromoteListingModalComponent,
    NgIcon,
  ],
  providers: [provideIcons({ heroEllipsisHorizontal })],
  template: `
    <div class="mx-auto max-w-[1248px] px-4 pb-28 pt-4 md:px-0 md:pb-0 md:pt-0">
      <div class="md:hidden">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
          routerLink="/seller/listings"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7] text-[#202335]"
              aria-label="Back to listings"
            >
              <img
                ngSrc="/assets/icons/listing-details-back.svg"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </a>
            <div>
              <p class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">
                Listing details
              </p>
            </div>
          </div>

          <button
            type="button"
            (click)="desktopMenuOpen.set(true)"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7] text-[#202335]"
            aria-label="Open listing actions"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              class="h-5 w-5 fill-current"
              aria-hidden="true"
            >
              <circle cx="4" cy="10" r="1.6" />
              <circle cx="10" cy="10" r="1.6" />
              <circle cx="16" cy="10" r="1.6" />
            </svg>
          </button>
        </div>

        <section class="mt-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div
                class="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[10.8px] bg-[#EFEFEF]"
              >
                @if (listing().previewImage) {
                  <img
                    [ngSrc]="listing().previewImage"
                    [alt]="listing().name"
                    fill
                    priority
                    sizes="15vw"
                    class="object-cover"
                  />
                }
              </div>

              <div class="min-w-0 flex-1">
                <h1
                  class="truncate text-[18px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#1A1B1D]"
                >
                  {{ listing().name }}
                </h1>
                <p class="mt-1 text-[13px] leading-[1.2] text-[#777777]">
                  Last updated on: {{ listing().lastUpdated }}
                </p>
              </div>

              @if (listing().isPromoted) {
                <button
                  type="button"
                  (click)="showPromoteListingModal.set(true)"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#2D2D2D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                  aria-label="Promoted listing"
                >
                  <span class="text-[14px] leading-none" aria-hidden="true">🚀</span>
                </button>
              }
            </div>

            <div class="flex items-center gap-3">
              @if (!listing().isPromoted) {
                <button
                  type="button"
                  (click)="showPromoteListingModal.set(true)"
                  class="inline-flex h-12 items-center gap-2 rounded-full border border-white bg-[#6453D9] px-4 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  <img
                    ngSrc="/assets/icons/listing-details-tag-2.svg"
                    alt=""
                    width="14"
                    height="14"
                    class="h-[14px] w-[14px]"
                    aria-hidden="true"
                  />
                  Promote listing
                </button>
              }

              <button
                type="button"
                (click)="statusSheetOpen.set(true)"
                class="inline-flex h-12 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium text-[#000000]"
              >
                <span>
                  Status:
                  <span
                    class="font-medium"
                    [class.text-[#EE9C2E]]="listing().status === 'Available'"
                    [class.text-[#5E44EE]]="listing().status === 'Paused'"
                    [class.text-[#2F9E44]]="listing().status === 'Sold'"
                  >
                    {{ listing().status }}
                  </span>
                </span>
                <img
                  ngSrc="/assets/icons/listing-details-arrow-down.svg"
                  alt=""
                  width="14"
                  height="14"
                  class="h-[14px] w-[14px]"
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </section>

        <nav class="mt-6 flex items-center gap-6 overflow-x-auto border-b border-[#E8EAF0] pb-0">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="activeTab.set(tab.id)"
              class="relative flex shrink-0 items-center gap-2 pb-3 text-[13px] font-medium transition-colors"
              [class.text-[#6453D9]]="activeTab() === tab.id"
              [class.text-[#8A8F9A]]="activeTab() !== tab.id"
            >
              <img
                [ngSrc]="tab.iconSrc"
                alt=""
                width="16"
                height="16"
                class="h-4 w-4"
                aria-hidden="true"
              />
              {{ tab.label }}
              @if (activeTab() === tab.id) {
                <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#6453D9]"></span>
              }
            </button>
          }
        </nav>

        @if (activeTab() === 'overview') {
          <section class="space-y-6 pt-5">
            <div class="flex gap-3 overflow-x-auto pb-1">
              @for (image of listing().gallery; track image.alt; let index = $index) {
                @if (image.type === 'youtube' && image.embedUrl) {
                  <div class="flex h-[168px] w-[252px] shrink-0 items-center overflow-hidden rounded-[24px] bg-[#111111] p-2">
                    <iframe
                      [src]="image.embedUrl"
                      [title]="image.alt"
                      class="aspect-video w-full rounded-[18px]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    ></iframe>
                  </div>
                } @else {
                  <button
                    type="button"
                    (click)="handleGallerySelection(index)"
                    class="relative h-[168px] w-[152px] shrink-0 overflow-hidden rounded-[24px] bg-[#F3F4F7]"
                  >
                    <img
                      [ngSrc]="image.src"
                      [alt]="image.alt"
                      fill
                      sizes="42vw"
                      class="object-cover"
                    />
                  </button>
                }
              }
            </div>

            <div>
              <h2 class="text-[24px] font-semibold tracking-[-0.04em] text-[#202335]">
                {{ listing().name }}
              </h2>
              <p class="mt-2 text-[13px] text-[#707684]">{{ listing().location }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              @for (stat of overviewStats(); track stat.label) {
                <article class="rounded-[22px] border border-[#E9EBF0] bg-white px-4 py-4">
                  <p class="text-[11px] text-[#8A8F9A]">{{ stat.label }}</p>
                  <div
                    class="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#202335]"
                  >
                    @if (stat.iconSrc) {
                      <img
                        [ngSrc]="stat.iconSrc"
                        alt=""
                        width="16"
                        height="16"
                        class="h-4 w-4"
                        aria-hidden="true"
                      />
                    }
                    <span>{{ stat.value }}</span>
                  </div>
                </article>
              }
            </div>

            <section class="rounded-[24px] border border-[#E9EBF0] bg-white p-5">
              <div class="flex items-start justify-between gap-4 border-b border-[#ECEEF3] pb-5">
                <div>
                  <p class="text-[12px] text-[#8A8F9A]">Price</p>
                  <p class="mt-2 text-[28px] font-semibold tracking-[-0.04em] text-[#202335]">
                    {{ listing().price }}
                  </p>
                  @if (listing().originalPrice || listing().discountBadge) {
                    <div class="mt-2 flex flex-wrap items-center gap-2">
                      @if (listing().originalPrice) {
                        <span class="text-[13px] font-medium text-[#8A8F9A] line-through">
                          {{ listing().originalPrice }}
                        </span>
                      }
                      @if (listing().discountBadge) {
                        <span class="rounded-full bg-[#E9FF7C] px-2.5 py-1 text-[12px] font-semibold text-[#4E3E07]">
                          {{ listing().discountBadge }}
                        </span>
                      }
                    </div>
                  }
                </div>

                <button
                  type="button"
                  (click)="handleEditAction()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                  aria-label="Edit listing"
                >
                  <img
                    ngSrc="/assets/icons/listing-details-edit.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <div class="pt-5">
                <p class="mb-3 text-[12px] text-[#8A8F9A]">Store</p>
                <div class="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    (click)="openStoreDetails()"
                    [disabled]="!listing().store.id"
                    class="flex min-w-0 items-center gap-3 rounded-[16px] text-left transition hover:bg-[#F7F8FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6453D9] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                    [attr.aria-label]="'Open ' + listing().store.name + ' store details'"
                  >
                    <div
                      class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#EEF4F0]"
                    >
                      @if (listing().store.logo) {
                        <img
                          [ngSrc]="listing().store.logo"
                          [alt]="listing().store.name"
                          fill
                          sizes="12vw"
                          class="object-cover"
                        />
                      }
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="truncate text-[14px] font-semibold text-[#202335]">{{
                          listing().store.name
                        }}</span>
                        @if (listing().store.isVerified) {
                          <img
                            ngSrc="/assets/icons/listing-details-verify.svg"
                            alt=""
                            width="14"
                            height="14"
                            class="h-[14px] w-[14px]"
                            aria-hidden="true"
                          />
                        }
                      </div>
                      @if (listing().store.isVerified) {
                        <p class="mt-1 text-[11px] text-[#8A8F9A]">Verified store</p>
                      }
                    </div>
                  </button>

                  <button
                    type="button"
                    (click)="openStoreDetails()"
                    [disabled]="!listing().store.id"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                    aria-label="Open store"
                  >
                    <img
                      ngSrc="/assets/icons/listing-details-export.svg"
                      alt=""
                      width="20"
                      height="20"
                      class="h-5 w-5"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            </section>

            <section class="border-b border-[#ECEEF3] pb-6">
              <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">
                Description
              </h3>
              <p class="mt-3 text-[14px] leading-7 text-[#5E6472]">
                {{ listing().description }}
              </p>
            </section>

            <section>
              <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">
                General details
              </h3>
              <div class="mt-5 space-y-4">
                @for (detail of details(); track detail.label) {
                  <div class="flex items-start justify-between gap-5">
                    <span class="text-[13px] text-[#8A8F9A]">{{ detail.label }}</span>
                    <span
                      class="max-w-[60%] text-right text-[13px] font-medium leading-6 text-[#202335]"
                    >
                      {{ detail.value }}
                    </span>
                  </div>
                }
              </div>
            </section>
          </section>
        }

        @if (activeTab() === 'requests') {
          <section class="pt-5">
            @if (hasRequests()) {
              <div class="space-y-4">
                @for (request of requests(); track request.id) {
                  <article class="rounded-[22px] border border-[#E9EBF0] bg-white p-4">
                    <div class="flex items-start gap-3">
                      <div
                        class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]"
                      >
                        <img
                          [ngSrc]="request.avatar"
                          [alt]="request.buyer"
                          fill
                          sizes="12vw"
                          class="object-cover"
                        />
                      </div>

                      <div class="min-w-0 flex-1">
                        <div class="flex items-center gap-2">
                          <p class="truncate text-[14px] font-semibold text-[#202335]">
                            {{ request.buyer }}
                          </p>
                          <span
                            class="rounded-full px-2.5 py-1 text-[10px] font-medium"
                            [class.bg-[#EEFCEB]]="request.status === 'New'"
                            [class.text-[#2F9E44]]="request.status === 'New'"
                            [class.bg-[#F3F0FF]]="request.status === 'Responded'"
                            [class.text-[#5E44EE]]="request.status === 'Responded'"
                            [class.bg-[#EEF2FF]]="request.status === 'Called'"
                            [class.text-[#3751C7]]="request.status === 'Called'"
                          >
                            {{ request.status }}
                          </span>
                        </div>

                        <p class="mt-2 text-[13px] leading-6 text-[#5E6472]">
                          {{ request.message }}
                        </p>
                        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#8A8F9A]">
                          <span>{{ request.time }}</span>
                          <span>{{ request.metaLabel }}: {{ request.metaValue }}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            } @else {
              <div
                class="rounded-[24px] border border-dashed border-[#D9DCE3] bg-white px-6 py-12 text-center"
              >
                <p class="text-[15px] font-semibold text-[#202335]">No requests yet</p>
                <p class="mt-2 text-[13px] text-[#8A8F9A]">
                  Buyer messages and offers will appear here as soon as people start reaching out.
                </p>
              </div>
            }
          </section>
        }

        @if (activeTab() === 'activities') {
          <section class="pt-5">
            @if (hasActivities()) {
              <div class="space-y-4">
                @for (activity of activities(); track activity.id) {
                  <article class="rounded-[22px] border border-[#E9EBF0] bg-white p-4">
                    <div class="flex items-start gap-3">
                      @if (activity.actorAvatar) {
                        <div
                          class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]"
                        >
                          <img
                            [ngSrc]="activity.actorAvatar"
                            [alt]="activity.title"
                            fill
                            sizes="12vw"
                            class="object-cover"
                          />
                        </div>
                      } @else {
                        <div
                          class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#202335]"
                        >
                          <img
                            ngSrc="/assets/icons/listing-details-tab-activities.svg"
                            alt=""
                            width="18"
                            height="18"
                            class="h-[18px] w-[18px]"
                            aria-hidden="true"
                          />
                        </div>
                      }

                      <div class="min-w-0 flex-1">
                        <p class="text-[14px] font-semibold text-[#202335]">{{ activity.title }}</p>
                        <p class="mt-2 text-[13px] leading-6 text-[#5E6472]">
                          {{ activity.description }}
                        </p>
                        <p class="mt-3 text-[11px] text-[#8A8F9A]">{{ activity.time }}</p>
                      </div>
                    </div>
                  </article>
                }
              </div>
            } @else {
              <div
                class="rounded-[24px] border border-dashed border-[#D9DCE3] bg-white px-6 py-12 text-center"
              >
                <p class="text-[15px] font-semibold text-[#202335]">No activities yet</p>
                <p class="mt-2 text-[13px] text-[#8A8F9A]">
                  Status changes, edits, and promotions will appear here when data is available.
                </p>
              </div>
            }
          </section>
        }
      </div>

      <div class="hidden md:block">
        <nav class="mb-6 flex items-center gap-2 text-[14px] text-[#8A8F9A]">
        <a routerLink="/seller/listings" class="transition-colors hover:text-[#202335]">Listings</a>
          <span>/</span>
          <span class="font-medium text-[#202335]">Listing details</span>
        </nav>

        <section
          class="rounded-[32px] border border-[#E9EBF0] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(18,24,35,0.35)]"
        >
          <div class="flex items-start justify-between gap-6 border-b border-[#ECEEF3] pb-7">
            <div class="flex items-start gap-4">
              <div
                class="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[24px] bg-[#F3F4F7]"
              >
                @if (listing().previewImage) {
                  <img
                    [ngSrc]="listing().previewImage"
                    [alt]="listing().name"
                    fill
                    priority
                    sizes="8vw"
                    class="object-cover"
                  />
                }
              </div>

              <div class="pt-1">
                <div class="flex items-center gap-3">
                  <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#202335]">
                    {{ listing().name }}
                  </h1>
                  <span
                    class="inline-flex rounded-full px-4 py-1.5 text-[12px] font-medium"
                    [class]="statusBadgeClass()"
                  >
                    {{ listing().status }}
                  </span>
                </div>
                <p class="mt-2 text-[14px] text-[#8A8F9A]">
                  Last updated on: {{ listing().lastUpdated }}
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              @if (listing().status !== 'Sold') {
                <button
                  type="button"
                  (click)="showPromoteListingModal.set(true)"
                  class="inline-flex h-12 items-center gap-2 rounded-full bg-[#111111] px-5 text-[14px] font-semibold text-white"
                >
                  <span class="text-[16px] leading-none" aria-hidden="true">🚀</span>
                  Promote listing
                </button>
              }

              @if (listing().status !== 'Sold') {
                <div class="relative">
                  <button
                    type="button"
                    (click)="statusSheetOpen.set(true)"
                    class="inline-flex h-12 items-center gap-2 rounded-full border border-[#E4E7EC] bg-white px-5 text-[14px] font-medium text-[#202335]"
                  >
                    Status
                    <span class="font-semibold">{{ listing().status }}</span>
                    <img
                      ngSrc="/assets/icons/listing-details-arrow-down.svg"
                      alt=""
                      width="16"
                      height="16"
                      class="h-4 w-4"
                      aria-hidden="true"
                    />
                  </button>

                  @if (statusSheetOpen()) {
                    <div
                      class="absolute right-0 top-[calc(100%+12px)] z-20 hidden w-[296px] flex-col gap-4 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white p-3 shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)] md:flex"
                      role="menu"
                      aria-label="Update listing status"
                    >
                      <h3 class="text-[20px] font-medium leading-5 text-[rgba(13,13,13,0.87)]">
                        Update status
                      </h3>

                      <div class="flex flex-col gap-1">
                        @for (option of statusOptions; track option.value) {
                          <button
                            type="button"
                            (click)="handleStatusSelection(option.value)"
                            class="flex h-8 w-full items-center justify-between rounded-[8px] py-[10px] text-left"
                          >
                            <div class="flex items-center gap-[6px]">
                              @if (option.value === 'Available') {
                                <img
                                  ngSrc="/assets/icons/listing-details-status-desktop-available.svg"
                                  alt=""
                                  width="14"
                                  height="14"
                                  class="h-[14px] w-[14px]"
                                  aria-hidden="true"
                                />
                              }
                              @if (option.value === 'Paused') {
                                <img
                                  ngSrc="/assets/icons/listing-details-status-desktop-pause.svg"
                                  alt=""
                                  width="14"
                                  height="14"
                                  class="h-[14px] w-[14px]"
                                  aria-hidden="true"
                                />
                              }
                              @if (option.value === 'Sold') {
                                <img
                                  ngSrc="/assets/icons/listing-details-status-desktop-sold.svg"
                                  alt=""
                                  width="14"
                                  height="14"
                                  class="h-[14px] w-[14px]"
                                  aria-hidden="true"
                                />
                              }
                              <span
                                class="text-[14px] font-medium leading-5 text-[rgba(13,13,13,0.87)]"
                              >
                                {{ option.label }}
                              </span>
                            </div>

                            @if (listing().status === option.value) {
                              <span
                                class="inline-flex items-center rounded-full bg-[#F0F0F0] px-2 py-[2px] text-[12px] font-medium leading-4 text-[#1F1F1F]"
                              >
                                Current
                              </span>
                            }
                          </button>
                        }
                      </div>
                    </div>
                  }
                </div>
              }

              <div class="relative">
                <button
                  type="button"
                  (click)="toggleDesktopMenu()"
                  class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-[#202335]"
                  aria-label="Open listing actions"
                  [attr.aria-expanded]="desktopMenuOpen()"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    class="h-5 w-5 fill-current"
                    aria-hidden="true"
                  >
                    <circle cx="4" cy="10" r="1.6" />
                    <circle cx="10" cy="10" r="1.6" />
                    <circle cx="16" cy="10" r="1.6" />
                  </svg>
                </button>

                @if (desktopMenuOpen()) {
                  <div
                    class="absolute right-0 top-[calc(100%+12px)] z-20 flex w-[154px] flex-col gap-1 overflow-hidden rounded-[16px] border border-[#F0F0F0] bg-white p-[10px] shadow-[0_6.65px_5.32px_rgba(0,0,0,0.03),0_2.767px_2.214px_rgba(0,0,0,0.02)]"
                    role="menu"
                    aria-label="Listing actions"
                  >
                    @for (action of mobileActions(); track action.id) {
                      <button
                        type="button"
                        (click)="handleMobileAction(action.id)"
                        class="flex h-8 w-full items-center gap-[6px] rounded-[8px] px-2 py-[10px] text-left text-[14px] font-medium leading-5 transition hover:bg-[#F6F7FA]"
                        [class.text-[#FF3B30]]="action.id === 'delete'"
                        [class.text-[rgba(13,13,13,0.87)]]="action.id !== 'delete'"
                      >
                        @if (action.iconSrc) {
                          <img
                            [ngSrc]="action.iconSrc"
                            alt=""
                            width="14"
                            height="14"
                            class="h-[14px] w-[14px]"
                            aria-hidden="true"
                          />
                        }
                        <span>{{ action.label }}</span>
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          </div>

          <nav class="mt-7 flex items-center gap-8 border-b border-[#ECEEF3]">
            @for (tab of tabs; track tab.id) {
              <button
                type="button"
                (click)="activeTab.set(tab.id)"
                class="relative flex items-center gap-2 pb-4 text-[14px] font-medium transition-colors"
                [class.text-[#6453D9]]="activeTab() === tab.id"
                [class.text-[#8A8F9A]]="activeTab() !== tab.id"
              >
                <img
                  [ngSrc]="tab.iconSrc"
                  alt=""
                  width="16"
                  height="16"
                  class="h-4 w-4"
                  aria-hidden="true"
                />
                {{ tab.label }}
                @if (activeTab() === tab.id) {
                  <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#6453D9]"></span>
                }
              </button>
            }
          </nav>

          @if (activeTab() === 'overview') {
            <div class="space-y-8 pt-8">
              <div class="grid grid-cols-2 gap-3 xl:grid-cols-6">
                @for (image of listing().gallery; track image.alt; let index = $index) {
                  @if (image.type === 'youtube' && image.embedUrl) {
                    <div class="relative overflow-hidden rounded-[28px] bg-[#111111] p-2 xl:col-span-2">
                      <div class="flex aspect-video w-full items-center">
                        <iframe
                          [src]="image.embedUrl"
                          [title]="image.alt"
                          class="aspect-video w-full rounded-[20px]"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          referrerpolicy="strict-origin-when-cross-origin"
                          allowfullscreen
                        ></iframe>
                      </div>
                    </div>
                  } @else {
                    <button
                      type="button"
                      (click)="handleGallerySelection(index)"
                      class="relative overflow-hidden rounded-[28px] bg-[#F3F4F7]"
                    >
                      <div class="relative aspect-[0.92] w-full">
                        <img
                          [ngSrc]="image.src"
                          [alt]="image.alt"
                          fill
                          class="object-cover"
                        />
                      </div>
                    </button>
                  }
                }
              </div>

              <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_316px]">
                <div class="space-y-8">
                  <div>
                    <h2 class="text-[32px] font-semibold tracking-[-0.05em] text-[#202335]">
                      {{ listing().name }}
                    </h2>
                    <p class="mt-3 text-[15px] text-[#707684]">{{ listing().location }}</p>
                  </div>

                  <div
                    class="grid gap-4 rounded-[28px] border border-[#E9EBF0] bg-white p-5 md:grid-cols-4"
                  >
                    @for (stat of overviewStats(); track stat.label; let index = $index) {
                      <article
                        class="space-y-2 md:pl-0"
                        [class.md:border-l]="index > 0"
                        [class.md:border-[#ECEEF3]]="index > 0"
                        [class.md:pl-5]="index > 0"
                      >
                        <p class="text-[13px] text-[#8A8F9A]">{{ stat.label }}</p>
                        <div
                          class="flex items-center gap-2 text-[15px] font-semibold text-[#202335]"
                        >
                          @if (stat.iconSrc) {
                            <img
                              [ngSrc]="stat.iconSrc"
                              alt=""
                              width="18"
                              height="18"
                              class="h-[18px] w-[18px]"
                              aria-hidden="true"
                            />
                          }
                          <span>{{ stat.value }}</span>
                        </div>
                      </article>
                    }
                  </div>

                  <section class="border-b border-[#ECEEF3] pb-8">
                    <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">
                      Description
                    </h3>
                    <p class="mt-4 max-w-[720px] text-[15px] leading-8 text-[#5E6472]">
                      {{ listing().description }}
                    </p>
                  </section>

                  <section>
                    <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">
                      General details
                    </h3>
                    <div class="mt-6 grid gap-y-6 md:grid-cols-[220px_minmax(0,1fr)]">
                      @for (detail of details(); track detail.label) {
                        <div class="text-[15px] text-[#8A8F9A]">{{ detail.label }}</div>
                        <div class="text-[15px] font-medium leading-7 text-[#202335]">
                          {{ detail.value }}
                        </div>
                      }
                    </div>
                  </section>
                </div>

                <aside>
                  <section class="rounded-[28px] border border-[#E9EBF0] bg-white p-6">
                    <div class="border-b border-[#ECEEF3] pb-6">
                      <div class="flex items-start justify-between gap-4">
                        <div>
                          <p class="text-[13px] text-[#8A8F9A]">Price</p>
                          <p
                            class="mt-3 text-[34px] font-semibold tracking-[-0.05em] text-[#202335]"
                          >
                            {{ listing().price }}
                          </p>
                          @if (listing().originalPrice || listing().discountBadge) {
                            <div class="mt-2 flex flex-wrap items-center gap-2">
                              @if (listing().originalPrice) {
                                <span class="text-[14px] font-medium text-[#8A8F9A] line-through">
                                  {{ listing().originalPrice }}
                                </span>
                              }
                              @if (listing().discountBadge) {
                                <span class="rounded-full bg-[#E9FF7C] px-2.5 py-1 text-[12px] font-semibold text-[#4E3E07]">
                                  {{ listing().discountBadge }}
                                </span>
                              }
                            </div>
                          }
                        </div>

                        <button
                          type="button"
                          (click)="handleEditAction()"
                          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                          aria-label="Edit listing"
                        >
                          <img
                            ngSrc="/assets/icons/listing-details-edit.svg"
                            alt=""
                            width="20"
                            height="20"
                            class="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>

                    <div class="pt-6">
                      <p class="mb-4 text-[13px] text-[#8A8F9A]">Store</p>
                      <div class="flex items-center justify-between gap-4">
                        <button
                          type="button"
                          (click)="openStoreDetails()"
                          [disabled]="!listing().store.id"
                          class="flex min-w-0 items-center gap-3 rounded-[16px] text-left transition hover:bg-[#F7F8FB] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6453D9] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                          [attr.aria-label]="'Open ' + listing().store.name + ' store details'"
                        >
                          <div
                            class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EEF4F0]"
                          >
                            @if (listing().store.logo) {
                              <img
                                [ngSrc]="listing().store.logo"
                                [alt]="listing().store.name"
                                fill
                                sizes="5vw"
                                class="object-cover"
                              />
                            }
                          </div>

                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                              <span class="truncate text-[15px] font-semibold text-[#202335]">{{
                                listing().store.name
                              }}</span>
                              @if (listing().store.isVerified) {
                                <img
                                  ngSrc="/assets/icons/listing-details-verify.svg"
                                  alt=""
                                  width="14"
                                  height="14"
                                  class="h-[14px] w-[14px]"
                                  aria-hidden="true"
                                />
                              }
                            </div>
                            @if (listing().store.isVerified) {
                              <p class="mt-1 text-[12px] text-[#8A8F9A]">Verified store</p>
                            }
                          </div>
                        </button>

                        <button
                          type="button"
                          (click)="openStoreDetails()"
                          [disabled]="!listing().store.id"
                          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                          aria-label="Open store"
                        >
                          <img
                            ngSrc="/assets/icons/listing-details-export.svg"
                            alt=""
                            width="20"
                            height="20"
                            class="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  </section>
                </aside>
              </div>
            </div>
          }

          @if (activeTab() === 'requests') {
            <section class="pt-8">
              @if (hasRequests()) {
                <div class="space-y-4">
                  @for (request of requests(); track request.id) {
                    <article class="rounded-[24px] border border-[#E9EBF0] bg-white p-5">
                      <div class="flex items-start gap-4">
                        <div
                          class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]"
                        >
                          <img
                            [ngSrc]="request.avatar"
                            [alt]="request.buyer"
                            fill
                            sizes="5vw"
                            class="object-cover"
                          />
                        </div>

                        <div class="min-w-0 flex-1">
                          <div class="flex items-center gap-2">
                            <p class="text-[15px] font-semibold text-[#202335]">
                              {{ request.buyer }}
                            </p>
                            <span
                              class="rounded-full px-2.5 py-1 text-[10px] font-medium"
                              [class.bg-[#EEFCEB]]="request.status === 'New'"
                              [class.text-[#2F9E44]]="request.status === 'New'"
                              [class.bg-[#F3F0FF]]="request.status === 'Responded'"
                              [class.text-[#5E44EE]]="request.status === 'Responded'"
                              [class.bg-[#EEF2FF]]="request.status === 'Called'"
                              [class.text-[#3751C7]]="request.status === 'Called'"
                            >
                              {{ request.status }}
                            </span>
                          </div>

                          <p class="mt-2 max-w-[860px] text-[14px] leading-7 text-[#5E6472]">
                            {{ request.message }}
                          </p>
                          <div
                            class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#8A8F9A]"
                          >
                            <span>{{ request.time }}</span>
                            <span>{{ request.metaLabel }}: {{ request.metaValue }}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div
                  class="rounded-[28px] border border-dashed border-[#D9DCE3] bg-white px-8 py-16 text-center"
                >
                  <p class="text-[18px] font-semibold text-[#202335]">No requests yet</p>
                  <p class="mt-2 text-[14px] text-[#8A8F9A]">
                    Buyer messages and offers will appear here as soon as people start reaching out.
                  </p>
                </div>
              }
            </section>
          }

          @if (activeTab() === 'activities') {
            <section class="pt-8">
              @if (hasActivities()) {
                <div class="space-y-4">
                  @for (activity of activities(); track activity.id) {
                    <article class="rounded-[24px] border border-[#E9EBF0] bg-white p-5">
                      <div class="flex items-start gap-4">
                        @if (activity.actorAvatar) {
                          <div
                            class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]"
                          >
                            <img
                              [ngSrc]="activity.actorAvatar"
                              [alt]="activity.title"
                              fill
                              sizes="5vw"
                              class="object-cover"
                            />
                          </div>
                        } @else {
                          <div
                            class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#202335]"
                          >
                            <img
                              ngSrc="/assets/icons/listing-details-tab-activities.svg"
                              alt=""
                              width="18"
                              height="18"
                              class="h-[18px] w-[18px]"
                              aria-hidden="true"
                            />
                          </div>
                        }

                        <div class="min-w-0 flex-1">
                          <p class="text-[15px] font-semibold text-[#202335]">
                            {{ activity.title }}
                          </p>
                          <p class="mt-2 max-w-[860px] text-[14px] leading-7 text-[#5E6472]">
                            {{ activity.description }}
                          </p>
                          <p class="mt-4 text-[12px] text-[#8A8F9A]">{{ activity.time }}</p>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div
                  class="rounded-[28px] border border-dashed border-[#D9DCE3] bg-white px-8 py-16 text-center"
                >
                  <p class="text-[18px] font-semibold text-[#202335]">No activities yet</p>
                  <p class="mt-2 text-[14px] text-[#8A8F9A]">
                    Status changes, edits, and promotions will appear here when data is available.
                  </p>
                </div>
              }
            </section>
          }
        </section>
      </div>
    </div>

    @if (editSheetOpen()) {
      <button
        type="button"
        (click)="closeEditSheet()"
        class="fixed inset-0 z-40 bg-black/35"
        aria-label="Close edit listing"
      ></button>

      <section
        class="fixed inset-x-0 bottom-0 top-0 z-50 overflow-hidden rounded-t-[24px] bg-white md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Edit listing"
      >
        <form
          [formGroup]="editListingForm"
          class="flex h-full flex-col"
          (ngSubmit)="saveEditListing()"
        >
          <input
            #editImageInput
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            (change)="handleEditImageSelection($event)"
          />
          <div class="relative min-h-[72px] px-4 pb-4 pt-3">
            <div class="mx-auto h-1 w-[50px] rounded-full bg-[#E7E7E7]"></div>

            <button
              type="button"
              (click)="goBackInMobileEditFlow()"
              class="absolute left-4 top-[26px] inline-flex h-8 w-10 items-center justify-center rounded-[8px] bg-white"
              aria-label="Go back"
            >
              <img
                ngSrc="/assets/icons/listing-details-back.svg"
                alt=""
                width="20"
                height="20"
                class="h-5 w-5"
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              (click)="closeEditSheet()"
              class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              aria-label="Close edit listing"
            >
              <img
                ngSrc="/assets/icons/edit-listing-close.svg"
                alt=""
                width="24"
                height="24"
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 pb-6">
            @if (mobileEditStep() === 'media') {
              <div class="space-y-6">
                <div class="space-y-1">
                  <h2 class="text-[20px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]">
                    Add some photos of your listing
                  </h2>
                  <p class="text-[10px] leading-5 text-[rgba(26,27,29,0.5)]">
                    Hold and drag photo to rearrange
                  </p>
                </div>

                <div class="flex items-start gap-2 rounded-[12px] bg-[#F7F7F7] px-3 py-2">
                  <span class="pt-0.5 text-[16px]" aria-hidden="true">💡</span>
                  <p class="text-[12px] leading-5 text-[rgba(26,27,29,0.7)]">
                    Tip: Attaching high quality media improves your selling chances
                  </p>
                </div>

                <div class="space-y-2.5">
                  <div class="grid grid-cols-3 gap-2">
                    @if (editPrimaryGalleryImage(); as primaryImage) {
                      <div
                        class="relative h-[230px] overflow-hidden rounded-[18px] bg-[#F4F4F4] col-span-2"
                        >
                        <img
                          [src]="primaryImage.src"
                          [alt]="primaryImage.alt"
                          class="absolute inset-0 h-full w-full object-cover"
                        />
                        <div
                          class="absolute left-2 top-2 rounded-full bg-white px-2 py-1 text-[12px] font-medium text-[#1A1B1D]"
                        >
                          Main photo
                        </div>
                        <button
                          type="button"
                          (click)="openEditImagePicker(0)"
                          class="absolute right-2 top-2 inline-flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full bg-white text-[#1A1B1D] shadow-[0_4px_8px_rgba(15,23,42,0.08)]"
                          aria-label="Photo actions"
                        >
                          <ng-icon name="heroEllipsisHorizontal" class="text-[18px]" aria-hidden="true"></ng-icon>
                        </button>
                        <span
                          class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                        >
                          1
                        </span>
                        <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            (click)="removeEditImage(0)"
                            class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] text-[#D92D20]"
                            aria-label="Remove first listing image"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    } @else {
                      <button
                        type="button"
                        (click)="openEditImagePicker()"
                        class="relative h-[230px] overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4] col-span-2"
                        aria-label="Add listing photo 1"
                      >
                        <img
                          ngSrc="/assets/icons/edit-listing-add.svg"
                          alt=""
                          width="24"
                          height="24"
                          class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <span
                          class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                        >
                          1
                        </span>
                      </button>
                    }

                    <div class="flex h-[230px] flex-col gap-2 col-span-1">
                      @if (editSecondaryGalleryImage(); as secondaryImage) {
                        <div class="relative h-[111px] overflow-hidden rounded-[18px] bg-[#F4F4F4]">
                          <img
                            [src]="secondaryImage.src"
                            [alt]="secondaryImage.alt"
                            class="absolute inset-0 h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            (click)="openEditImagePicker(1)"
                            class="absolute right-2 top-2 inline-flex h-[31px] w-[31px] shrink-0 items-center justify-center rounded-full bg-white text-[#1A1B1D] shadow-[0_4px_8px_rgba(15,23,42,0.08)]"
                            aria-label="Photo actions"
                          >
                            <ng-icon name="heroEllipsisHorizontal" class="text-[18px]" aria-hidden="true"></ng-icon>
                          </button>
                          <span
                            class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                          >
                            2
                          </span>
                          <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                            <button
                              type="button"
                              (click)="removeEditImage(1)"
                              class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] text-[#D92D20]"
                              aria-label="Remove second listing image"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      }

                      @if (editSideAddSlot(); as sideSlot) {
                        <button
                          type="button"
                          (click)="openEditImagePicker()"
                          [disabled]="isGalleryFull()"
                          class="relative h-[111px] overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4] disabled:opacity-40"
                          [attr.aria-label]="'Add listing photo ' + sideSlot"
                        >
                          <img
                            ngSrc="/assets/icons/edit-listing-add.svg"
                            alt=""
                            width="24"
                            height="24"
                            class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                            aria-hidden="true"
                          />
                          <span
                            class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                          >
                            {{ sideSlot }}
                          </span>
                        </button>
                      }
                    </div>
                  </div>

                  <div class="grid grid-cols-3 gap-2">
                    @for (image of editRemainingGalleryImages(); track image.token; let index = $index) {
                      <div class="relative h-[111px] overflow-hidden rounded-[18px] bg-[#F4F4F4]">
                        <img
                          [src]="image.src"
                          [alt]="image.alt"
                          class="absolute inset-0 h-full w-full object-cover"
                        />
                        <span
                          class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                        >
                          {{ index + 3 }}
                        </span>
                        <div class="absolute bottom-1.5 left-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            (click)="removeEditImage(index + 2)"
                            class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[14px] text-[#D92D20]"
                            [attr.aria-label]="'Remove listing image ' + (index + 3)"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    }
                    @for (slot of editRemainingPlaceholderSlots(); track slot) {
                      <button
                        type="button"
                        (click)="openEditImagePicker()"
                        [disabled]="isGalleryFull()"
                        class="relative h-[111px] overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4] disabled:opacity-40"
                        [attr.aria-label]="'Add listing photo ' + slot"
                      >
                        <img
                          ngSrc="/assets/icons/edit-listing-add.svg"
                          alt=""
                          width="24"
                          height="24"
                          class="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2"
                          aria-hidden="true"
                        />
                        <span
                          class="absolute bottom-1.5 right-1.5 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-white text-[12px] font-medium text-[#2D2D2D]"
                        >
                          {{ slot }}
                        </span>
                      </button>
                    }
                  </div>
                </div>

                <label class="block space-y-1">
                  <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                    Embedded YouTube link (optional)
                  </span>
                  <input
                    type="url"
                    formControlName="embeddedVideo"
                    placeholder="Enter link to YouTube video"
                    class="h-12 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[rgba(13,13,13,0.3)]"
                  />
                </label>
              </div>
            }

            @if (mobileEditStep() === 'details') {
              <div class="space-y-6">
                <div class="space-y-0.5">
                  <h2 class="text-[20px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]">
                    Fill basic details about your listing
                  </h2>
                  <p class="text-[10px] leading-6 text-[rgba(26,27,29,0.5)]">
                    Add details about the item you want to list
                  </p>
                </div>

                <div class="space-y-6">
                  <label class="block space-y-1">
                    <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                      Item name
                    </span>
                    <input
                      type="text"
                      formControlName="name"
                      class="h-12 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none"
                    />
                  </label>

                  <label class="block space-y-1">
                    <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]"> Category </span>
                    <div class="relative">
                      <select
                        formControlName="category"
                        class="h-12 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[12px] text-[#0D0D0D] outline-none"
                      >
                        @for (category of editCategories(); track category) {
                          <option [value]="category">{{ category }}</option>
                        }
                      </select>
                      <img
                        ngSrc="/assets/icons/listing-details-arrow-down.svg"
                        alt=""
                        width="14"
                        height="14"
                        class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                        aria-hidden="true"
                      />
                    </div>
                  </label>

                  <div [class]="isRealEstateCategory() ? 'block' : 'grid grid-cols-[112px_minmax(0,1fr)] gap-6'">
                    @if (!isRealEstateCategory()) {
                      <label class="block space-y-1">
                        <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                          Condition
                        </span>
                        <div class="relative">
                          <select
                            formControlName="condition"
                            class="h-12 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[12px] text-[#0D0D0D] outline-none"
                          >
                            @for (condition of editConditions(); track condition) {
                              <option [value]="condition">{{ condition }}</option>
                            }
                          </select>
                          <img
                            ngSrc="/assets/icons/listing-details-arrow-down.svg"
                            alt=""
                            width="14"
                            height="14"
                            class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                            aria-hidden="true"
                          />
                        </div>
                      </label>
                    }

                    <label class="block space-y-1">
                      <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">Store</span>
                      <div class="relative">
                        <select
                          formControlName="store"
                          class="h-12 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[12px] text-[#0D0D0D] outline-none"
                        >
                          @for (store of editStores(); track store) {
                            <option [value]="store">{{ store }}</option>
                          }
                        </select>
                        <img
                          ngSrc="/assets/icons/listing-details-arrow-down.svg"
                          alt=""
                          width="14"
                          height="14"
                          class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                          aria-hidden="true"
                        />
                      </div>
                    </label>
                  </div>
                </div>

                <div class="space-y-4">
                  <div class="space-y-0.5">
                    <h3 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                      Add description
                    </h3>
                    <p class="text-[12px] leading-[18px] text-[rgba(26,27,29,0.5)]">
                      Describe the upgrades and standout features that will appeal to buyers
                    </p>
                  </div>

                  <label class="block space-y-1">
                    <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                      Description
                    </span>
                    <textarea
                      formControlName="description"
                      rows="5"
                      class="w-full rounded-[8px] border border-[#EAEAEA] px-3 py-3 text-[12px] leading-[18px] text-[#1F1F1F] outline-none"
                    ></textarea>
                  </label>
                </div>
              </div>
            }

            @if (mobileEditStep() === 'delivery') {
              <div class="space-y-6">
                <div class="space-y-0.5">
                  <h2 class="text-[20px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]">
                    Set your location and delivery preferences
                  </h2>
                </div>

                <div class="space-y-6">
                  <label class="block space-y-1.5">
                    <span class="text-[12px] leading-5 text-[rgba(26,27,29,0.5)]">Location</span>
                    <div class="relative">
                      <select
                        formControlName="location"
                        class="h-12 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[12px] text-[#0D0D0D] outline-none"
                      >
                        @for (location of editLocations(); track location) {
                          <option [value]="location">{{ location }}</option>
                        }
                      </select>
                      <img
                        ngSrc="/assets/icons/listing-details-arrow-down.svg"
                        alt=""
                        width="14"
                        height="14"
                        class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                        aria-hidden="true"
                      />
                    </div>
                  </label>

                  <div class="grid grid-cols-2 gap-6">
                    <label class="block space-y-1.5">
                      <span class="text-[12px] leading-5 text-[rgba(26,27,29,0.5)]">
                        WhatsApp number
                      </span>
                      <input
                        type="tel"
                        formControlName="whatsAppNumber"
                        class="h-12 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[12px] text-[#0D0D0D] outline-none"
                      />
                    </label>

                    <label class="block space-y-1.5">
                      <span class="text-[12px] leading-5 text-[rgba(26,27,29,0.5)]">
                        Call number
                      </span>
                      <input
                        type="tel"
                        formControlName="callNumber"
                        class="h-12 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[12px] text-[#0D0D0D] outline-none"
                      />
                    </label>
                  </div>

                  <div class="space-y-1.5">
                    <span class="text-[12px] leading-5 text-[rgba(26,27,29,0.5)]">
                      Delivery options
                    </span>
                    <div class="grid grid-cols-2 gap-3">
                      @for (option of mobileDeliveryOptions(); track option.id) {
                        <button
                          type="button"
                          (click)="handleMobileDeliveryOption(option.id)"
                          class="flex items-center gap-2 rounded-[10px] border px-3 py-3 text-left"
                          [class.border-[#6453D9]]="isMobileDeliveryOptionSelected(option.id)"
                          [class.bg-[#F9F7FF]]="isMobileDeliveryOptionSelected(option.id)"
                          [class.border-[#EAEAEA]]="!isMobileDeliveryOptionSelected(option.id)"
                          [class.bg-[#FAFAFA]]="!isMobileDeliveryOptionSelected(option.id)"
                        >
                          <span
                            class="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border"
                            [class.border-[#6453D9]]="isMobileDeliveryOptionSelected(option.id)"
                            [class.bg-[#6453D9]]="isMobileDeliveryOptionSelected(option.id)"
                            [class.border-[#D5D5D5]]="!isMobileDeliveryOptionSelected(option.id)"
                          >
                            @if (isMobileDeliveryOptionSelected(option.id)) {
                              <span
                                class="block h-[6px] w-[10px] rotate-[-45deg] border-b-2 border-l-2 border-white"
                              ></span>
                            }
                          </span>
                          <span class="text-[12px] leading-5 text-[#1F1F1F]">{{
                            option.label
                          }}</span>
                        </button>
                      }
                    </div>
                  </div>
                </div>

                <div class="space-y-4">
                  <h3 class="text-[20px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]">
                    How much are you selling for?
                  </h3>

                  <label class="block space-y-1.5">
                    <span class="text-[12px] leading-5 text-[rgba(26,27,29,0.5)]">Price</span>
                    <div
                      class="flex h-12 items-center rounded-[12px] border border-[#EFEFEF] bg-white px-3"
                    >
                      <span class="mr-2 text-[14px] text-[#8F8F8F]">₦</span>
                      <input
                        type="text"
                        formControlName="price"
                        class="w-full bg-transparent text-[12px] text-[#0D0D0D] outline-none"
                      />
                    </div>
                  </label>

                  <div class="space-y-5">
                    <div class="flex items-start justify-between gap-4">
                      <div class="max-w-[304px] space-y-1">
                        <p class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                          Accept offers from buyers
                        </p>
                        <p class="text-[12px] leading-5 text-[rgba(13,13,13,0.5)]">
                          Buyers can submit price offers for your review
                        </p>
                      </div>
                      <button
                        type="button"
                        (click)="toggleAcceptOffers()"
                        class="relative inline-flex h-5 w-8 rounded-full transition-colors"
                        [class.bg-[#6453D9]]="editAcceptOffersEnabled()"
                        [class.bg-[#DCDCDC]]="!editAcceptOffersEnabled()"
                        aria-label="Toggle accept offers"
                        [attr.aria-pressed]="editAcceptOffersEnabled()"
                      >
                        <span
                          class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                          [style.transform]="
                            editAcceptOffersEnabled() ? 'translateX(14px)' : 'translateX(2px)'
                          "
                        ></span>
                      </button>
                    </div>

                    <div class="flex items-start justify-between gap-4">
                      <div class="max-w-[316px] space-y-1">
                        <p class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                          List this item for free
                        </p>
                        <p class="text-[12px] leading-5 text-[rgba(13,13,13,0.5)]">
                          Give this item away for free
                        </p>
                      </div>
                      <button
                        type="button"
                        (click)="toggleFreeListing()"
                        class="relative inline-flex h-5 w-8 rounded-full transition-colors"
                        [class.bg-[#6453D9]]="editFreeListingEnabled()"
                        [class.bg-[#DCDCDC]]="!editFreeListingEnabled()"
                        aria-label="Toggle free listing"
                        [attr.aria-pressed]="editFreeListingEnabled()"
                      >
                        <span
                          class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                          [style.transform]="
                            editFreeListingEnabled() ? 'translateX(14px)' : 'translateX(2px)'
                          "
                        ></span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>

          <div
            class="border-t border-transparent bg-white px-4 pb-[calc(env(safe-area-inset-bottom)+20px)] pt-3"
          >
            <button
              type="submit"
              class="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
            >
              Save changes
            </button>
          </div>
        </form>
      </section>

      <section
        class="fixed inset-y-0 left-auto right-0 z-50 hidden w-[600px] overflow-hidden rounded-l-[16px] bg-white md:block"
        role="dialog"
        aria-modal="true"
        aria-label="Edit listing"
      >
        <div class="flex h-full flex-col">
          <header class="flex h-20 items-center justify-between px-6">
            <h2 class="text-[28px] font-semibold leading-10 tracking-[-0.03em] text-[#0D0D0D]">
              Edit listing
            </h2>

            <button
              type="button"
              (click)="closeEditSheet()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              aria-label="Close edit listing"
            >
              <img
                ngSrc="/assets/icons/edit-listing-close.svg"
                alt=""
                width="24"
                height="24"
                class="h-6 w-6"
                aria-hidden="true"
              />
            </button>
          </header>

          <form
            [formGroup]="editListingForm"
            class="flex min-h-0 flex-1 flex-col"
            (ngSubmit)="saveEditListing()"
          >
            <input
              #editImageInput
              type="file"
              accept="image/*"
              multiple
              class="hidden"
              (change)="handleEditImageSelection($event)"
            />
            <div class="min-h-0 flex-1 overflow-y-auto px-6 pb-8">
              <div class="space-y-6 pb-8">
                <section class="space-y-5">
                  <button
                    type="button"
                    (click)="toggleEditSection('media')"
                    class="flex w-full items-center justify-between rounded-[8px] bg-[#FAFAFA] px-3 py-[6px] text-left"
                    [attr.aria-expanded]="isEditSectionOpen('media')"
                  >
                    <span class="text-[16px] font-medium leading-5 text-[#0D0D0D]">Media</span>
                    <img
                      ngSrc="/assets/icons/listing-details-arrow-down.svg"
                      alt=""
                      width="20"
                      height="20"
                      class="h-5 w-5 transition-transform"
                      [class.rotate-180]="isEditSectionOpen('media')"
                      aria-hidden="true"
                    />
                  </button>

                  @if (isEditSectionOpen('media')) {
                    <div class="space-y-8">
                      <div class="space-y-3">
                        <div class="grid grid-cols-[minmax(0,1fr)_176px] gap-3">
                          @if (editPrimaryGalleryImage(); as primaryImage) {
                            <div
                              class="relative h-[363px] overflow-hidden rounded-[18px] bg-[#F4F4F4]"
                              >
                              <img
                                [src]="primaryImage.src"
                                [alt]="primaryImage.alt"
                                class="absolute inset-0 h-full w-full object-cover"
                              />

                              <div
                                class="absolute left-3 top-3 rounded-full border border-[#F1F1F1] bg-white px-3 py-[6px] text-[18px] font-medium leading-[30px] text-[#1A1B1D]"
                              >
                                Main photo
                              </div>

                              <button
                                type="button"
                                (click)="openEditImagePicker(0)"
                                class="absolute right-3 top-3 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1A1B1D] shadow-[0_6px_14px_rgba(15,23,42,0.08)]"
                                aria-label="Photo actions"
                              >
                                <ng-icon name="heroEllipsisHorizontal" class="text-[26px]" aria-hidden="true"></ng-icon>
                              </button>

                              <div
                                class="absolute bottom-4 right-5 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                              >
                                1
                              </div>
                              <div class="absolute bottom-4 left-4 flex items-center gap-2">
                                <button
                                  type="button"
                                  (click)="removeEditImage(0)"
                                  class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[18px] text-[#D92D20]"
                                  aria-label="Remove first listing image"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          } @else {
                            <button
                              type="button"
                              (click)="openEditImagePicker()"
                              class="relative h-[363px] overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4]"
                              aria-label="Add listing photo 1"
                            >
                              <img
                                ngSrc="/assets/icons/edit-listing-add.svg"
                                alt=""
                                width="37"
                                height="37"
                                class="absolute left-1/2 top-1/2 h-[37px] w-[37px] -translate-x-1/2 -translate-y-1/2"
                                aria-hidden="true"
                              />
                              <span
                                class="absolute bottom-3 right-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                              >
                                1
                              </span>
                            </button>
                          }

                          <div class="flex h-[363px] flex-col gap-3">
                            @if (editSecondaryGalleryImage(); as secondaryImage) {
                              <div
                                class="relative flex-1 overflow-hidden rounded-[18px] bg-[#F4F4F4]"
                                >
                                <img
                                  [src]="secondaryImage.src"
                                  [alt]="secondaryImage.alt"
                                  class="absolute inset-0 h-full w-full object-cover"
                                />

                                <button
                                  type="button"
                                  (click)="openEditImagePicker(1)"
                                  class="absolute right-3 top-3 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-[#1A1B1D] shadow-[0_6px_14px_rgba(15,23,42,0.08)]"
                                  aria-label="Photo actions"
                                >
                                  <ng-icon name="heroEllipsisHorizontal" class="text-[26px]" aria-hidden="true"></ng-icon>
                                </button>

                                <div
                                  class="absolute bottom-3 right-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                                >
                                  2
                                </div>
                                <div class="absolute bottom-3 left-3 flex items-center gap-2">
                                  <button
                                    type="button"
                                    (click)="removeEditImage(1)"
                                    class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[18px] text-[#D92D20]"
                                    aria-label="Remove second listing image"
                                  >
                                    ×
                                  </button>
                                </div>
                              </div>
                            }

                            @if (editSideAddSlot(); as sideSlot) {
                              <button
                                type="button"
                                (click)="openEditImagePicker()"
                                [disabled]="isGalleryFull()"
                                class="relative flex-1 overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4] disabled:opacity-40"
                                [attr.aria-label]="'Add listing photo ' + sideSlot"
                              >
                                <img
                                  ngSrc="/assets/icons/edit-listing-add.svg"
                                  alt=""
                                  width="37"
                                  height="37"
                                  class="absolute left-1/2 top-1/2 h-[37px] w-[37px] -translate-x-1/2 -translate-y-1/2"
                                  aria-hidden="true"
                                />
                                <span
                                  class="absolute bottom-3 right-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                                >
                                  {{ sideSlot }}
                                </span>
                              </button>
                            }
                          </div>
                        </div>

                        <div class="grid grid-cols-3 gap-3">
                          @for (image of editRemainingGalleryImages(); track image.token; let index = $index) {
                            <div
                              class="relative h-[175px] overflow-hidden rounded-[18px] bg-[#F4F4F4]"
                              >
                              <img
                                [src]="image.src"
                                [alt]="image.alt"
                                class="absolute inset-0 h-full w-full object-cover"
                              />
                              <span
                                class="absolute bottom-3 right-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                              >
                                {{ index + 3 }}
                              </span>
                              <div class="absolute bottom-3 left-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  (click)="removeEditImage(index + 2)"
                                  class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[18px] text-[#D92D20]"
                                  [attr.aria-label]="'Remove listing image ' + (index + 3)"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          }
                          @for (slot of editRemainingPlaceholderSlots(); track slot) {
                            <button
                              type="button"
                              (click)="openEditImagePicker()"
                              [disabled]="isGalleryFull()"
                              class="relative h-[175px] overflow-hidden rounded-[18px] border border-dashed border-[#CECECE] bg-[#F4F4F4] disabled:opacity-40"
                              [attr.aria-label]="'Add listing photo ' + slot"
                            >
                              <img
                                ngSrc="/assets/icons/edit-listing-add.svg"
                                alt=""
                                width="37"
                                height="37"
                                class="absolute left-1/2 top-1/2 h-[37px] w-[37px] -translate-x-1/2 -translate-y-1/2"
                                aria-hidden="true"
                              />
                              <span
                                class="absolute bottom-3 right-3 inline-flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white text-[13px] font-medium text-[#2D2D2D]"
                              >
                                {{ slot }}
                              </span>
                            </button>
                          }
                        </div>
                      </div>

                      <label class="block space-y-1">
                        <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                          Embedded video link (optional)
                        </span>
                        <input
                          type="url"
                          formControlName="embeddedVideo"
                          placeholder="Enter link to YouTube video"
                          class="h-10 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none placeholder:text-[rgba(13,13,13,0.3)]"
                        />
                      </label>
                    </div>
                  }
                </section>

                <section class="space-y-5">
                  <button
                    type="button"
                    (click)="toggleEditSection('details')"
                    class="flex w-full items-center justify-between rounded-[8px] bg-[#FAFAFA] px-3 py-[6px] text-left"
                    [attr.aria-expanded]="isEditSectionOpen('details')"
                  >
                    <span class="text-[16px] font-medium leading-5 text-[#0D0D0D]">Details</span>
                    <img
                      ngSrc="/assets/icons/listing-details-arrow-down.svg"
                      alt=""
                      width="20"
                      height="20"
                      class="h-5 w-5 transition-transform"
                      [class.rotate-180]="isEditSectionOpen('details')"
                      aria-hidden="true"
                    />
                  </button>

                  @if (isEditSectionOpen('details')) {
                    <div class="space-y-5">
                      <div class="space-y-0.5">
                        <h3 class="text-[24px] font-semibold leading-10 text-[#1A1B1D]">
                          Fill basic details about your listing
                        </h3>
                        <p class="text-[14px] leading-6 text-[rgba(26,27,29,0.7)]">
                          Add details about the item you want to list
                        </p>
                      </div>

                      <div class="space-y-6">
                        <label class="block space-y-1">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Item name
                          </span>
                          <input
                            type="text"
                            formControlName="name"
                            class="h-10 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none"
                          />
                        </label>

                        <label class="block space-y-1">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Category
                          </span>
                          <div class="relative">
                            <select
                              formControlName="category"
                              class="h-10 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[14px] text-[#0D0D0D] outline-none"
                            >
                              @for (category of editCategories(); track category) {
                                <option [value]="category">{{ category }}</option>
                              }
                            </select>
                            <img
                              ngSrc="/assets/icons/listing-details-arrow-down.svg"
                              alt=""
                              width="14"
                              height="14"
                              class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                              aria-hidden="true"
                            />
                          </div>
                        </label>

                        <div [class]="isRealEstateCategory() ? 'block' : 'grid grid-cols-[112px_minmax(0,1fr)] gap-6'">
                          @if (!isRealEstateCategory()) {
                            <label class="block space-y-1">
                              <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                                Condition
                              </span>
                              <div class="relative">
                                <select
                                  formControlName="condition"
                                  class="h-10 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[14px] text-[#0D0D0D] outline-none"
                                >
                                  @for (condition of editConditions(); track condition) {
                                    <option [value]="condition">{{ condition }}</option>
                                  }
                                </select>
                                <img
                                  ngSrc="/assets/icons/listing-details-arrow-down.svg"
                                  alt=""
                                  width="14"
                                  height="14"
                                  class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                                  aria-hidden="true"
                                />
                              </div>
                            </label>
                          }

                          <label class="block space-y-1">
                            <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">Store</span>
                            <div class="relative">
                              <select
                                formControlName="store"
                                class="h-10 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[14px] text-[#0D0D0D] outline-none"
                              >
                                @for (store of editStores(); track store) {
                                  <option [value]="store">{{ store }}</option>
                                }
                              </select>
                              <img
                                ngSrc="/assets/icons/listing-details-arrow-down.svg"
                                alt=""
                                width="14"
                                height="14"
                                class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                                aria-hidden="true"
                              />
                            </div>
                          </label>
                        </div>
                      </div>

                      <div class="space-y-5">
                        <div class="space-y-0.5">
                          <h3 class="text-[24px] font-semibold leading-10 text-[#1A1B1D]">
                            Add description
                          </h3>
                          <p class="text-[14px] leading-6 text-[rgba(26,27,29,0.7)]">
                            Describe the upgrades and standout features that will appeal to buyers
                            and make your listing more desirable.
                          </p>
                        </div>

                        <label class="block space-y-1.5">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Description
                          </span>
                          <textarea
                            formControlName="description"
                            rows="7"
                            class="w-full rounded-[8px] border border-[#EAEAEA] px-3 py-3 text-[14px] leading-5 text-[#1F1F1F] outline-none"
                          ></textarea>
                        </label>
                      </div>
                    </div>
                  }
                </section>

                <section class="space-y-5">
                  <button
                    type="button"
                    (click)="toggleEditSection('delivery')"
                    class="flex w-full items-center justify-between rounded-[8px] bg-[#FAFAFA] px-3 py-[6px] text-left"
                    [attr.aria-expanded]="isEditSectionOpen('delivery')"
                  >
                    <span class="text-[16px] font-medium leading-5 text-[#0D0D0D]">
                      Delivery & Pricing
                    </span>
                    <img
                      ngSrc="/assets/icons/listing-details-arrow-down.svg"
                      alt=""
                      width="20"
                      height="20"
                      class="h-5 w-5 transition-transform"
                      [class.rotate-180]="isEditSectionOpen('delivery')"
                      aria-hidden="true"
                    />
                  </button>

                  @if (isEditSectionOpen('delivery')) {
                    <div class="space-y-5">
                      <div class="space-y-0.5">
                        <h3 class="text-[24px] font-semibold leading-10 text-[#1A1B1D]">
                          Set your location and delivery preferences
                        </h3>
                      </div>

                      <div class="space-y-6">
                        <label class="block space-y-1.5">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Location
                          </span>
                          <div class="relative">
                            <select
                              formControlName="location"
                              class="h-10 w-full appearance-none rounded-[12px] border border-[#EFEFEF] bg-white px-3 pr-10 text-[14px] text-[#0D0D0D] outline-none"
                            >
                              @for (location of editLocations(); track location) {
                                <option [value]="location">{{ location }}</option>
                              }
                            </select>
                            <img
                              ngSrc="/assets/icons/listing-details-arrow-down.svg"
                              alt=""
                              width="14"
                              height="14"
                              class="pointer-events-none absolute right-3 top-1/2 h-[14px] w-[14px] -translate-y-1/2"
                              aria-hidden="true"
                            />
                          </div>
                        </label>

                        <div class="grid grid-cols-2 gap-6">
                          <label class="block space-y-1.5">
                            <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                              Your WhatsApp number
                            </span>
                            <input
                              type="tel"
                              formControlName="whatsAppNumber"
                              class="h-10 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none"
                            />
                          </label>

                          <label class="block space-y-1.5">
                            <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                              Your call number
                            </span>
                            <input
                              type="tel"
                              formControlName="callNumber"
                              class="h-10 w-full rounded-[12px] border border-[#EFEFEF] px-3 text-[14px] text-[#0D0D0D] outline-none"
                            />
                          </label>
                        </div>

                        <div class="space-y-1.5">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Delivery options
                          </span>
                          <div class="space-y-3">
                            <div class="grid grid-cols-3 gap-3">
                              @for (option of deliveryMethodOptions(); track option.id) {
                                <button
                                  type="button"
                                  (click)="toggleDeliveryMethod(option.id)"
                                  class="flex items-center gap-2 rounded-[12px] border p-3 text-left text-[16px] leading-5"
                                  [class.border-[#6453D9]]="isDeliveryMethodSelected(option.id)"
                                  [class.bg-[#F9F7FF]]="isDeliveryMethodSelected(option.id)"
                                  [class.border-[#EAEAEA]]="!isDeliveryMethodSelected(option.id)"
                                  [class.bg-[#FAFAFA]]="!isDeliveryMethodSelected(option.id)"
                                >
                                  <span
                                    class="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border"
                                    [class.border-[#6453D9]]="isDeliveryMethodSelected(option.id)"
                                    [class.bg-[#6453D9]]="isDeliveryMethodSelected(option.id)"
                                    [class.border-[#D5D5D5]]="!isDeliveryMethodSelected(option.id)"
                                  >
                                    @if (isDeliveryMethodSelected(option.id)) {
                                      <span
                                        class="block h-[6px] w-[10px] rotate-[-45deg] border-b-2 border-l-2 border-white"
                                      ></span>
                                    }
                                  </span>
                                  <span class="text-[#1F1F1F]">{{ option.label }}</span>
                                </button>
                              }
                            </div>

                            <div class="grid grid-cols-3 gap-3">
                              @for (option of deliveryRangeOptions(); track option.id) {
                                <button
                                  type="button"
                                  (click)="toggleDeliveryRange(option.id)"
                                  class="flex items-center gap-2 rounded-[12px] border p-3 text-left text-[16px] leading-5"
                                  [class.border-[#6453D9]]="isDeliveryRangeSelected(option.id)"
                                  [class.bg-[#F9F7FF]]="isDeliveryRangeSelected(option.id)"
                                  [class.border-[#EAEAEA]]="!isDeliveryRangeSelected(option.id)"
                                  [class.bg-[#FAFAFA]]="!isDeliveryRangeSelected(option.id)"
                                >
                                  <span
                                    class="inline-flex h-4 w-4 items-center justify-center rounded-[4px] border"
                                    [class.border-[#6453D9]]="isDeliveryRangeSelected(option.id)"
                                    [class.bg-[#6453D9]]="isDeliveryRangeSelected(option.id)"
                                    [class.border-[#D5D5D5]]="!isDeliveryRangeSelected(option.id)"
                                  >
                                    @if (isDeliveryRangeSelected(option.id)) {
                                      <span
                                        class="block h-[6px] w-[10px] rotate-[-45deg] border-b-2 border-l-2 border-white"
                                      ></span>
                                    }
                                  </span>
                                  <span class="text-[#1F1F1F]">{{ option.label }}</span>
                                </button>
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="space-y-5">
                        <h3 class="text-[24px] font-semibold leading-10 text-[#1A1B1D]">
                          How much are you selling for?
                        </h3>

                        <label class="block space-y-1.5">
                          <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                            Price
                          </span>
                          <div
                            class="flex h-10 items-center rounded-[12px] border border-[#EFEFEF] bg-white px-3"
                          >
                            <span class="mr-2 text-[14px] text-[#8F8F8F]">₦</span>
                            <input
                              type="text"
                              formControlName="price"
                              class="w-full bg-transparent text-[14px] text-[#0D0D0D] outline-none"
                            />
                          </div>
                        </label>

                        <div class="rounded-[12px]">
                          <div class="flex items-start justify-between gap-6">
                            <div class="max-w-[331px] space-y-1">
                              <p class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                                Add discount
                              </p>
                              <p class="text-[13px] leading-normal text-[rgba(13,13,13,0.5)]">
                                Let your buyers know if you are running a discount
                              </p>
                            </div>

                            <button
                              type="button"
                              (click)="toggleEditDiscount()"
                              class="relative inline-flex h-5 w-8 rounded-full transition-colors"
                              [class.bg-[#6453D9]]="editDiscountEnabled()"
                              [class.bg-[#DCDCDC]]="!editDiscountEnabled()"
                              aria-label="Toggle discount"
                              [attr.aria-pressed]="editDiscountEnabled()"
                            >
                              <span
                                class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                                [style.transform]="
                                  editDiscountEnabled() ? 'translateX(14px)' : 'translateX(2px)'
                                "
                              ></span>
                            </button>
                          </div>

                          @if (editDiscountEnabled()) {
                            <div class="mt-6 space-y-3">
                              <div class="flex gap-[6px]">
                                <div
                                  class="flex h-10 w-[113px] items-center justify-between rounded-[10px] border border-[#DEDEDE] bg-white px-3"
                                >
                                  <span class="text-[14px] text-[#1A1B1D]">Amount</span>
                                  <img
                                    ngSrc="/assets/icons/listing-details-arrow-down.svg"
                                    alt=""
                                    width="16"
                                    height="16"
                                    class="h-4 w-4"
                                    aria-hidden="true"
                                  />
                                </div>

                                <div
                                  class="flex h-10 flex-1 items-center rounded-[10px] border border-[#6453D9] bg-white px-3 shadow-[0_0_0_4px_rgba(1,140,205,0.05)]"
                                >
                                  <input
                                    type="text"
                                    formControlName="discountPrice"
                                    class="w-full bg-transparent text-[14px] text-[#1A1B1D] outline-none"
                                  />
                                  <span class="text-[14px] text-[#808080]">NGN</span>
                                </div>
                              </div>

                              <div class="grid grid-cols-2 gap-5">
                                <label class="block space-y-1.5">
                                  <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                                    Start date
                                  </span>
                                  <input
                                    type="date"
                                    formControlName="discountStartDate"
                                    class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] text-[#1A1B1D] outline-none"
                                  />
                                </label>

                                <label class="block space-y-1.5">
                                  <span class="text-[14px] font-medium leading-5 text-[#5A5A5A]">
                                    End date
                                  </span>
                                  <input
                                    type="date"
                                    formControlName="discountEndDate"
                                    class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] text-[#1A1B1D] outline-none"
                                  />
                                </label>
                              </div>

                              <div
                                class="flex items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[6px] text-[14px] font-medium text-[#A2A500]"
                              >
                                <span
                                  class="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#E8E39C] text-[12px] text-[#8C8F00]"
                                  aria-hidden="true"
                                >
                                  i
                                </span>
                                <span>
                                  Your listing price will go back to its default price after the end
                                  date
                                </span>
                              </div>
                            </div>
                          }
                        </div>

                        <div class="flex items-start justify-between gap-6">
                          <div class="max-w-[331px] space-y-1">
                            <p class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                              Accept offers from buyers
                            </p>
                            <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.5)]">
                              Buyers can submit price offers for your review
                            </p>
                          </div>

                          <button
                            type="button"
                            (click)="toggleAcceptOffers()"
                            class="relative inline-flex h-5 w-8 rounded-full transition-colors"
                            [class.bg-[#6453D9]]="editAcceptOffersEnabled()"
                            [class.bg-[#DCDCDC]]="!editAcceptOffersEnabled()"
                            aria-label="Toggle accept offers"
                            [attr.aria-pressed]="editAcceptOffersEnabled()"
                          >
                            <span
                              class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                              [style.transform]="
                                editAcceptOffersEnabled() ? 'translateX(14px)' : 'translateX(2px)'
                              "
                            ></span>
                          </button>
                        </div>

                        <div class="flex items-start justify-between gap-6">
                          <div class="max-w-[331px] space-y-1">
                            <p class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                              List this item for free
                            </p>
                            <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.5)]">
                              Give this item away for free
                            </p>
                          </div>

                          <button
                            type="button"
                            (click)="toggleFreeListing()"
                            class="relative inline-flex h-5 w-8 rounded-full transition-colors"
                            [class.bg-[#6453D9]]="editFreeListingEnabled()"
                            [class.bg-[#DCDCDC]]="!editFreeListingEnabled()"
                            aria-label="Toggle free listing"
                            [attr.aria-pressed]="editFreeListingEnabled()"
                          >
                            <span
                              class="absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform"
                              [style.transform]="
                                editFreeListingEnabled() ? 'translateX(14px)' : 'translateX(2px)'
                              "
                            ></span>
                          </button>
                        </div>
                      </div>
                    </div>
                  }
                </section>
              </div>
            </div>

            <footer class="mt-auto bg-white px-6 py-5">
              <div class="flex justify-end gap-2">
                <button
                  type="button"
                  (click)="closeEditSheet()"
                  class="inline-flex h-10 items-center justify-center rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium tracking-[-0.5px] text-[#05061A]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
                >
                  Save changes
                </button>
              </div>
            </footer>
          </form>
        </div>
      </section>
    }

    @if (desktopMenuOpen()) {
      <button
        type="button"
        (click)="closeAllMenus()"
        class="fixed inset-0 z-10 bg-black/0"
        aria-label="Close menu"
      ></button>
    }

    @if (desktopMenuOpen()) {
      <section
        class="fixed inset-x-0 bottom-0 z-20 rounded-t-[32px] bg-white px-4 pb-28 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Listing actions"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC]"></div>
        <h2 class="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">
          Listing actions
        </h2>

        <div class="mt-6 space-y-2">
          @for (action of mobileActions(); track action.id) {
            <button
              type="button"
              (click)="handleMobileAction(action.id)"
              class="flex w-full items-center gap-3 rounded-[20px] px-2 py-3 text-left text-[15px] font-medium"
              [class.text-[#FF3B30]]="action.id === 'delete'"
              [class.text-[#202335]]="action.id !== 'delete'"
            >
              @if (action.iconSrc) {
                <img
                  [ngSrc]="action.iconSrc"
                  alt=""
                  width="20"
                  height="20"
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

    @if (statusSheetOpen()) {
      <button
        type="button"
        (click)="statusSheetOpen.set(false)"
        class="fixed inset-0 z-30 bg-black/30 md:hidden"
        aria-label="Close status dialog"
      ></button>

      <section
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[36px] bg-white px-4 pb-28 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Update listing status"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC]"></div>

        <button
          type="button"
          (click)="statusSheetOpen.set(false)"
          class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          aria-label="Close status dialog"
        >
          <img
            ngSrc="/assets/icons/listing-details-status-close.svg"
            alt=""
            width="24"
            height="24"
            class="h-6 w-6"
            aria-hidden="true"
          />
        </button>

        <h2
          class="mt-[48px] text-[24px] font-semibold leading-[1.2] tracking-[-0.03em] text-[#15162B]"
        >
          Update status
        </h2>

        <div class="mt-4 space-y-4">
          @for (option of statusOptions; track option.value) {
            <button
              type="button"
              (click)="handleStatusSelection(option.value)"
              class="flex w-full items-center justify-between py-1 text-left"
            >
              <div class="flex items-center gap-[10px]">
                @if (option.value === 'Available') {
                  <img
                    ngSrc="/assets/icons/listing-details-status-available.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                @if (option.value === 'Paused') {
                  <img
                    ngSrc="/assets/icons/listing-details-status-pause.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                @if (option.value === 'Sold') {
                  <img
                    ngSrc="/assets/icons/listing-details-status-sold.svg"
                    alt=""
                    width="20"
                    height="20"
                    class="h-5 w-5"
                    aria-hidden="true"
                  />
                }
                <p class="text-[16px] font-medium leading-5 text-[rgba(13,13,13,0.87)]">
                  {{ option.label }}
                </p>
              </div>

              @if (listing().status === option.value) {
                <span
                  class="inline-flex items-center rounded-full bg-[#F0F0F0] px-3 py-1 text-[14px] font-medium leading-4 text-[#1F1F1F]"
                >
                  Current
                </span>
              }
            </button>
          }
        </div>
      </section>
    }

    @if (deleteSheetOpen()) {
      <button
        type="button"
        (click)="deleteSheetOpen.set(false)"
        class="fixed inset-0 z-30 bg-black/30"
        aria-label="Close delete dialog"
      ></button>

      <section
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[36px] bg-white px-4 pb-28 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Delete listing"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC] md:hidden"></div>

        <button
          type="button"
          (click)="deleteSheetOpen.set(false)"
          class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          aria-label="Close delete dialog"
        >
          <img
            ngSrc="/assets/icons/listing-details-delete-close.svg"
            alt=""
            width="24"
            height="24"
            class="h-6 w-6"
            aria-hidden="true"
          />
        </button>

        <div class="mt-[49px]">
          <div class="relative h-[120px] w-[122px] overflow-hidden md:h-14 md:w-14">
            <div class="absolute inset-0 rounded-full bg-[#FFF1F1]"></div>
            <div
              class="absolute left-1/2 top-1/2 h-[88px] w-[89px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD5D5]"
            ></div>
            <div
              class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
            >
              <img
                ngSrc="/assets/icons/listing-details-delete-trash.svg"
                alt=""
                width="54"
                height="54"
                class="h-[54px] w-[54px]"
                aria-hidden="true"
              />
            </div>
          </div>

          <h2
            class="mt-[6px] text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]"
          >
            Delete listing
          </h2>
          <p class="mt-[6px] max-w-[325px] text-[16px] leading-[24px] text-[#5A5A5A]">
            Are you sure you want to delete this listing? This action cannot be undone.
          </p>
        </div>

        <div class="mt-[70px]">
          <button
            type="button"
            (click)="confirmDeleteListing()"
            class="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#FF2524] text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A]"
          >
            Yes, delete
          </button>
        </div>
      </section>

      <section
        class="fixed left-1/2 top-1/2 z-40 hidden w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-[#F4F4F4] shadow-[0_20px_50px_-30px_rgba(18,24,35,0.45)] md:block"
        role="dialog"
        aria-modal="true"
        aria-label="Delete listing"
      >
        <div class="relative rounded-b-[15px] bg-white px-6 pb-[118px] pt-6">
          <button
            type="button"
            (click)="deleteSheetOpen.set(false)"
            class="absolute right-6 top-6 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F9F9]"
            aria-label="Close delete dialog"
          >
            <img
              ngSrc="/assets/icons/listing-details-delete-desktop-close.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6 -rotate-45"
              aria-hidden="true"
            />
          </button>

          <div class="flex flex-col gap-3">
            <div class="relative h-[120px] w-[122px]">
              <img
                ngSrc="/assets/images/listing-details-delete-desktop-circle.svg"
                alt=""
                width="121"
                height="120"
                class="absolute inset-0 h-[120px] w-[121px]"
                aria-hidden="true"
              />
              <img
                ngSrc="/assets/images/listing-details-delete-desktop-inner-circle.svg"
                alt=""
                width="89"
                height="88"
                class="absolute left-1/2 top-1/2 h-[88px] w-[89px] -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <div
                class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
              >
                <img
                  ngSrc="/assets/icons/listing-details-delete-desktop-trash.svg"
                  alt=""
                  width="54"
                  height="54"
                  class="h-[54px] w-[54px]"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <h2 class="text-[24px] font-semibold leading-normal text-[#0D0D0D]">
                Delete listing
              </h2>
              <p
                class="max-w-[430px] text-[16px] font-medium leading-[1.4] text-[rgba(13,13,13,0.7)]"
              >
                Are you sure you want to delete this listing? This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-start justify-end gap-4 px-[14px] pb-[15px] pt-[15px]">
          <button
            type="button"
            (click)="deleteSheetOpen.set(false)"
            class="inline-flex h-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#000000]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmDeleteListing()"
            class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#FF2524] px-5 text-[14px] font-medium text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A]"
          >
            Yes, delete
          </button>
        </div>
      </section>
    }

    @if (markSoldSheetOpen()) {
      <button
        type="button"
        (click)="markSoldSheetOpen.set(false)"
        class="fixed inset-0 z-30 bg-black/30"
        aria-label="Close mark sold dialog"
      ></button>

      <section
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[36px] bg-white px-4 pb-28 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Mark listing as sold"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC] md:hidden"></div>

        <button
          type="button"
          (click)="markSoldSheetOpen.set(false)"
          class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          aria-label="Close mark sold dialog"
        >
          <img
            ngSrc="/assets/icons/listing-details-sold-close.svg"
            alt=""
            width="24"
            height="24"
            class="h-6 w-6"
            aria-hidden="true"
          />
        </button>

        <div class="mt-[49px]">
          <div class="relative h-[120px] w-[122px] overflow-hidden">
            <div class="absolute inset-0 rounded-full bg-[#F8F4E4]"></div>
            <div
              class="absolute left-1/2 top-1/2 h-[88px] w-[89px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F1E19A]"
            ></div>
            <div
              class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
            >
              <img
                ngSrc="/assets/icons/listing-details-sold-danger.svg"
                alt=""
                width="54"
                height="54"
                class="h-[54px] w-[54px]"
                aria-hidden="true"
              />
            </div>
          </div>

          <h2
            class="mt-[6px] text-[24px] font-semibold leading-8 tracking-[-0.03em] text-[#1A1B1D]"
          >
            Mark this item as sold?
          </h2>
          <p class="mt-[6px] max-w-[325px] text-[16px] leading-[24px] text-[#5A5A5A]">
            This listing will be moved to your Sold items and removed from active listings. You
            won’t be able to mark it as available again.
          </p>
        </div>

        <div class="mt-[70px]">
          <button
            type="button"
            (click)="confirmMarkSold()"
            class="inline-flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[16px] font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8]"
          >
            Mark as sold
          </button>
        </div>
      </section>

      <section
        class="fixed left-1/2 top-1/2 z-40 hidden w-[500px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-[20px] bg-[#F4F4F4] shadow-[0_20px_50px_-30px_rgba(18,24,35,0.45)] md:block"
        role="dialog"
        aria-modal="true"
        aria-label="Mark listing as sold"
      >
        <div class="relative rounded-b-[15px] bg-white px-6 pb-[97px] pt-6">
          <button
            type="button"
            (click)="markSoldSheetOpen.set(false)"
            class="absolute right-[25px] top-[25px] inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F9F9F9]"
            aria-label="Close mark sold dialog"
          >
            <img
              ngSrc="/assets/icons/listing-details-delete-desktop-close.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6 -rotate-45"
              aria-hidden="true"
            />
          </button>

          <div class="flex flex-col gap-3">
            <div class="relative h-[120px] w-[122px]">
              <img
                ngSrc="/assets/images/listing-details-sold-desktop-circle.svg"
                alt=""
                width="121"
                height="120"
                class="absolute inset-0 h-[120px] w-[121px]"
                aria-hidden="true"
              />
              <img
                ngSrc="/assets/images/listing-details-sold-desktop-inner-circle.svg"
                alt=""
                width="89"
                height="88"
                class="absolute left-1/2 top-[16.57px] h-[88px] w-[89px] -translate-x-1/2"
                aria-hidden="true"
              />
              <div
                class="absolute left-1/2 top-1/2 h-[54px] w-[54px] -translate-x-1/2 -translate-y-1/2"
              >
                <img
                  ngSrc="/assets/icons/listing-details-sold-danger.svg"
                  alt=""
                  width="54"
                  height="54"
                  class="h-[54px] w-[54px]"
                  aria-hidden="true"
                />
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <h2 class="text-[24px] font-semibold leading-normal text-[#0D0D0D]">
                Mark this item as sold?
              </h2>
              <p
                class="max-w-[451px] text-[16px] font-medium leading-[1.4] text-[rgba(13,13,13,0.7)]"
              >
                This listing will be moved to your Sold items and removed from active listings. You
                won’t be able to mark it as available again.
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-start justify-end gap-4 px-[14px] pb-[15px] pt-[15px]">
          <button
            type="button"
            (click)="markSoldSheetOpen.set(false)"
            class="inline-flex h-10 items-center justify-center rounded-full border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium text-[#000000]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmMarkSold()"
            class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
          >
            Mark as sold
          </button>
        </div>
      </section>
    }

    @if (showPromoteListingModal()) {
      <app-promote-listing-modal
        [isSubmitting]="isPromotingListing()"
        (close)="showPromoteListingModal.set(false)"
        (promotionRequested)="handleListingPromotion($event)"
        (promoted)="markListingAsPromoted()"
      ></app-promote-listing-modal>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingDetailsPageComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly listingsService = inject(ListingsService);
  private readonly appToastService = inject(AppToastService);
  private readonly titleService = inject(Title);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private readonly fallbackEditCategories = [
    'Electronics/Phones & Tablets',
    'Electronics/Computers',
    'Fashion',
    'Home & Kitchen',
  ];
  private readonly fallbackEditConditions = ['Used', 'Brand new', 'Refurbished'];
  private readonly fallbackEditStores = ['The Vine Collections', 'Duduzili Store'];
  private readonly fallbackEditLocations: readonly string[] = [];
  protected readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  private readonly listingRecord = signal<ListingsApiItem | null>(null);
  private readonly manageListingsMetadata = signal<ManageListingsResponse | null>(null);
  private readonly promotionPlans = signal<PromotionPlanApiItem[]>([]);
  protected readonly activeTab = signal<ListingTab>('overview');
  protected readonly activeImageIndex = signal(0);
  protected readonly showPromoteListingModal = signal(false);
  protected readonly desktopMenuOpen = signal(false);
  protected readonly statusSheetOpen = signal(false);
  protected readonly deleteSheetOpen = signal(false);
  protected readonly markSoldSheetOpen = signal(false);
  protected readonly editSheetOpen = signal(false);
  protected readonly mobileEditStep = signal<EditSectionId>('media');
  protected readonly openEditSections = signal<EditSectionId[]>(['media']);
  protected readonly editDiscountEnabled = signal(false);
  protected readonly editAcceptOffersEnabled = signal(false);
  protected readonly editFreeListingEnabled = signal(false);
  protected readonly isSavingEdit = signal(false);
  protected readonly isUpdatingStatus = signal(false);
  protected readonly isDeletingListing = signal(false);
  protected readonly isPromotingListing = signal(false);
  protected readonly maxGalleryImages = 6;
  protected readonly selectedDeliveryMethods = signal<string[]>([]);
  protected readonly selectedDeliveryRanges = signal<string[]>([]);
  protected readonly editMediaPlaceholderSlots = [4, 5, 6] as const;
  private readonly editImageInput = viewChild<ElementRef<HTMLInputElement>>('editImageInput');
  private readonly editableGalleryImages = signal<EditableGalleryImage[]>([]);
  private readonly editImageReplaceIndex = signal<number | null>(null);
  protected readonly editCategories = computed(() => {
    const categories =
      this.manageListingsMetadata()
        ?.categories?.map((category) => category.name)
        .filter((name) => name.length > 0) ?? [];
    return categories.length > 0 ? categories : this.fallbackEditCategories;
  });
  protected readonly editConditions = computed(() => {
    const conditions =
      this.manageListingsMetadata()
        ?.product_conditions?.map((condition) => this.normalizeConditionLabel(condition.name))
        .filter((name) => name.length > 0) ?? [];
    return conditions.length > 0 ? conditions : this.fallbackEditConditions;
  });

  protected readonly editStores = computed(() => {
    const stores =
      this.manageListingsMetadata()
        ?.stores?.map((store) => this.readStoreName(store))
        .filter((name): name is string => typeof name === 'string' && name.length > 0) ?? [];
    return stores.length > 0 ? stores : this.fallbackEditStores;
  });
  protected readonly editLocations = computed(() => {
    const currentLocation = this.editListingForm.controls.location.getRawValue().trim();
    const metadataLocation = this.listing().location.trim();
    const options = [currentLocation, metadataLocation, ...this.fallbackEditLocations].filter(
      (value, index, values) => value.length > 0 && values.indexOf(value) === index,
    );
    return options;
  });
  private readonly deliveryOptions = computed<readonly DeliveryOption[]>(() =>
    (this.manageListingsMetadata()?.delivery_options ?? []).map((option) => ({
      id: String(option.id),
      label: option.name,
      kind: this.resolveDeliveryOptionKind(option),
    })),
  );
  protected readonly deliveryMethodOptions = computed<readonly DeliveryOption[]>(() =>
    this.deliveryOptions().filter((option) => option.kind === 'method'),
  );
  protected readonly deliveryRangeOptions = computed<readonly DeliveryOption[]>(() =>
    this.deliveryOptions().filter((option) => option.kind !== 'method'),
  );
  protected readonly mobileDeliveryOptions = computed(() => this.deliveryOptions());
  protected readonly editPrimaryGalleryImage = computed(() => this.editableGalleryImages()[0] ?? null);
  protected readonly editSecondaryGalleryImage = computed(() => this.editableGalleryImages()[1] ?? null);
  protected readonly editRemainingGalleryImages = computed(() => this.editableGalleryImages().slice(2, this.maxGalleryImages));
  protected readonly isGalleryFull = computed(() => this.editableGalleryImages().length >= this.maxGalleryImages);
  protected readonly editSideAddSlot = computed(() => {
    const visibleCount = this.editableGalleryImages().length;
    if (visibleCount < 2) {
      return 2;
    }

    return visibleCount < 3 ? 3 : null;
  });
  protected readonly editRemainingPlaceholderSlots = computed(() => {
    const visibleCount = this.editableGalleryImages().length;
    const startSlot = visibleCount < 2 ? 3 : Math.max(4, visibleCount + 1);
    return Array.from(
      { length: Math.max(0, this.maxGalleryImages - startSlot + 1) },
      (_, index) => startSlot + index,
    );
  });
  protected readonly editListingForm = this.formBuilder.nonNullable.group({
    name: '',
    category: '',
    condition: '',
    store: '',
    description: '',
    embeddedVideo: '',
    location: '',
    whatsAppNumber: '',
    callNumber: '',
    price: '',
    discountPrice: '',
    discountStartDate: '',
    discountEndDate: '',
  });
  protected readonly selectedCategoryValue = toSignal(
    this.editListingForm.controls.category.valueChanges,
    { initialValue: this.editListingForm.controls.category.getRawValue() },
  );
  protected readonly isRealEstateCategory = computed(() => {
    const name = this.selectedCategoryValue().toLowerCase();
    return (
      name.includes('real estate') ||
      name.includes('real-estate') ||
      name.includes('properties') ||
      name.includes('property') ||
      name.includes('land')
    );
  });

  protected readonly listing = signal<ListingDetails>({
    id: this.listingId(),
    name: 'Listing details',
    previewImage: '',
    lastUpdated: '--',
    datePosted: '--',
    location: '--',
    price: '--',
    originalPrice: '',
    discountBadge: '',
    description: 'Details will be added for this listing soon.',
    status: 'Available',
    messages: 0,
    views: '0',
    saves: 0,
    isPromoted: false,
    gallery: [],
    store: {
      id: '',
      name: 'Store details',
      logo: '',
      isVerified: false,
    },
  });

  protected readonly tabs: readonly TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      iconSrc: '/assets/icons/listing-details-tab-overview.svg',
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
  ] as const;

  protected readonly statusOptions: readonly StatusOption[] = [
    { label: 'Available', value: 'Available', tone: 'available' },
    { label: 'Pause', value: 'Paused', tone: 'paused' },
    { label: 'Sold', value: 'Sold', tone: 'sold' },
  ] as const;

  protected readonly details = computed<readonly ListingDetailItem[]>(() => {
    const record = this.listingRecord();
    const storeInfo = this.readRecord(record?.['store_info']);
    const detailEntries: ListingDetailItem[] = [
      {
        label: 'Category',
        value:
          this.readString(record?.['category']) ??
          this.readString(record?.['category_name']) ??
          'Electronics / Phones & Tablets',
      },
      {
        label: 'Condition',
        value: this.formatCondition(record?.['condition']) ?? 'Used',
      },
      {
        label: 'Location',
        value: this.listing().location,
      },
      {
        label: 'Delivery options',
        value: this.extractDeliveryOptions(record) ?? 'Nationwide',
      },
      {
        label: 'WhatsApp number',
        value:
          this.readString(storeInfo?.['whatsapp_number']) ??
          '08169397454',
      },
      {
        label: 'Call number',
        value:
          this.readString(storeInfo?.['call_number']) ??
          this.readString(storeInfo?.['whatsapp_number']) ??
          '08169397454',
      },
      {
        label: 'Accept offers',
        value: this.readBoolean(record?.['accept_offers']) === false ? 'No' : 'Yes',
      },
    ];

    return detailEntries;
  });

  protected readonly requests = signal<ListingRequest[]>([]);

  protected readonly activities = signal<ListingActivity[]>([]);

  protected readonly hasRequests = computed(() => this.requests().length > 0);
  protected readonly hasActivities = computed(() => this.activities().length > 0);

  protected readonly overviewStats = computed(() => [
    { label: 'Date posted', value: this.listing().datePosted, iconSrc: '' },
    {
      label: 'Messages',
      value: `${this.listing().messages}`,
      iconSrc: '/assets/icons/listing-details-messages.svg',
    },
    {
      label: 'Views',
      value: this.listing().views,
      iconSrc: '/assets/icons/listing-details-eye.svg',
    },
    {
      label: 'Saves',
      value: `${this.listing().saves}`,
      iconSrc: '/assets/icons/listing-details-heart.svg',
    },
  ]);

  protected readonly mobileActions = computed<readonly ActionItem[]>(() => {
    switch (this.listing().status) {
      case 'Paused':
        return [
          {
            id: 'edit',
            label: 'Edit listing',
            iconSrc: '/assets/icons/listing-details-action-edit.svg',
          },
          {
            id: 'resume',
            label: 'Resume listing',
            iconSrc: '/assets/icons/listing-details-action-pause.svg',
          },
          {
            id: 'delete',
            label: 'Delete listing',
            iconSrc: '/assets/icons/listing-details-action-delete.svg',
          },
        ];
      case 'Sold':
        return [
          {
            id: 'share',
            label: 'Share listing',
            iconSrc: '/assets/icons/listing-details-action-share.svg',
          },
          {
            id: 'edit',
            label: 'Edit listing',
            iconSrc: '/assets/icons/listing-details-action-edit.svg',
          },
          {
            id: 'delete',
            label: 'Delete listing',
            iconSrc: '/assets/icons/listing-details-action-delete.svg',
          },
        ];
      default:
        return [
          {
            id: 'share',
            label: 'Share listing',
            iconSrc: '/assets/icons/listing-details-action-share.svg',
          },
          {
            id: 'edit',
            label: 'Edit listing',
            iconSrc: '/assets/icons/listing-details-action-edit.svg',
          },
          {
            id: 'pause',
            label: 'Pause listing',
            iconSrc: '/assets/icons/listing-details-action-pause.svg',
          },
          {
            id: 'delete',
            label: 'Delete listing',
            iconSrc: '/assets/icons/listing-details-action-delete.svg',
          },
        ];
    }
  });

  protected statusBadgeClass(): string {
    return this.statusOptionBadgeClass(
      this.listing().status === 'Available'
        ? 'available'
        : this.listing().status === 'Paused'
          ? 'paused'
          : 'sold',
    );
  }

  protected statusOptionBadgeClass(tone: StatusOption['tone']): string {
    switch (tone) {
      case 'available':
        return 'bg-[#FFF7EA] text-[#F19A1A]';
      case 'paused':
        return 'bg-[#F3F0FF] text-[#5E44EE]';
      default:
        return 'bg-[#EEFCEB] text-[#2F9E44]';
    }
  }

  protected toggleDesktopMenu(): void {
    this.desktopMenuOpen.update((value) => !value);
  }

  protected closeAllMenus(): void {
    this.desktopMenuOpen.set(false);
    this.statusSheetOpen.set(false);
    this.deleteSheetOpen.set(false);
    this.markSoldSheetOpen.set(false);
  }

  protected isEditSectionOpen(section: EditSectionId): boolean {
    return this.openEditSections().includes(section);
  }

  protected toggleEditSection(section: EditSectionId): void {
    this.openEditSections.update((sections) =>
      sections.includes(section)
        ? sections.filter((item) => item !== section)
        : [...sections, section],
    );
  }

  protected goBackInMobileEditFlow(): void {
    const step = this.mobileEditStep();

    if (step === 'delivery') {
      this.mobileEditStep.set('details');
      return;
    }

    if (step === 'details') {
      this.mobileEditStep.set('media');
      return;
    }

    this.closeEditSheet();
  }

  protected isDeliveryMethodSelected(optionId: string): boolean {
    return this.selectedDeliveryMethods().includes(optionId);
  }

  protected toggleDeliveryMethod(optionId: string): void {
    this.selectedDeliveryMethods.update((selected) =>
      selected.includes(optionId)
        ? selected.filter((item) => item !== optionId)
        : [...selected, optionId],
    );
  }

  protected isDeliveryRangeSelected(optionId: string): boolean {
    return this.selectedDeliveryRanges().includes(optionId);
  }

  protected toggleDeliveryRange(optionId: string): void {
    this.selectedDeliveryRanges.update((selected) =>
      selected.includes(optionId)
        ? selected.filter((item) => item !== optionId)
        : [...selected, optionId],
    );
  }

  protected handleGallerySelection(index: number): void {
    this.activeImageIndex.set(index);
  }

  protected isMobileDeliveryOptionSelected(optionId: string): boolean {
    return this.isDeliveryMethodSelected(optionId) || this.isDeliveryRangeSelected(optionId);
  }

  protected handleMobileDeliveryOption(optionId: string): void {
    if (this.deliveryMethodOptions().some((option) => option.id === optionId)) {
      this.toggleDeliveryMethod(optionId);
      return;
    }

    this.toggleDeliveryRange(optionId);
  }

  protected toggleEditDiscount(): void {
    this.editDiscountEnabled.update((enabled) => !enabled);
  }

  protected toggleAcceptOffers(): void {
    this.editAcceptOffersEnabled.update((enabled) => !enabled);
  }

  protected toggleFreeListing(): void {
    this.editFreeListingEnabled.update((enabled) => !enabled);
  }

  ngOnDestroy(): void {
    this.clearEditableGalleryImages();
  }

  protected closeEditSheet(): void {
    this.resetEditableGalleryImages();
    this.editSheetOpen.set(false);
  }

  protected openEditImagePicker(replaceIndex: number | null = null): void {
    this.editImageReplaceIndex.set(replaceIndex);
    this.editImageInput()?.nativeElement.click();
  }

  protected handleEditImageSelection(event: Event): void {
    const input = event.target instanceof HTMLInputElement ? event.target : null;
    const files = Array.from(input?.files ?? []).filter((file) => file.type.startsWith('image/'));

    if (files.length === 0) {
      this.editImageReplaceIndex.set(null);
      if (input) {
        input.value = '';
      }
      return;
    }

    const replaceIndex = this.editImageReplaceIndex();
    const currentCount = this.editableGalleryImages().length;
    const isReplacing = replaceIndex !== null && replaceIndex >= 0 && replaceIndex < currentCount;
    const slotsRemaining = Math.max(0, this.maxGalleryImages - currentCount);
    const filesToAdd = files.slice(0, isReplacing ? slotsRemaining + 1 : slotsRemaining);

    if (filesToAdd.length === 0) {
      this.editImageReplaceIndex.set(null);
      if (input) input.value = '';
      return;
    }

    const nextImages = filesToAdd.map((file, index) => {
      const previewUrl = URL.createObjectURL(file);
      const token =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? `pending:${crypto.randomUUID()}`
          : `pending:${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;

      return {
        token,
        kind: 'pending' as const,
        imageId: null,
        file,
        previewUrl,
        src: previewUrl,
        alt: `${this.listing().name} new image ${currentCount + index + 1}`,
      };
    });

    this.editableGalleryImages.update((existing) => {
      if (!isReplacing || replaceIndex === null) {
        return [...existing, ...nextImages];
      }

      const target = existing[replaceIndex];
      if (target?.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      const [replacement, ...remainingNewImages] = nextImages;
      return [
        ...existing.slice(0, replaceIndex),
        replacement,
        ...existing.slice(replaceIndex + 1),
        ...remainingNewImages,
      ].slice(0, this.maxGalleryImages);
    });

    this.editImageReplaceIndex.set(null);
    if (input) {
      input.value = '';
    }
  }

  protected removeEditImage(index: number): void {
    this.editableGalleryImages.update((images) => {
      if (index < 0 || index >= images.length) {
        return images;
      }

      const target = images[index];
      if (target.previewUrl) {
        URL.revokeObjectURL(target.previewUrl);
      }

      return images.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  protected handleStatusSelection(status: ListingStatus): void {
    this.statusSheetOpen.set(false);

    if (status === 'Sold') {
      this.markSoldSheetOpen.set(true);
      return;
    }

    void this.updateListingStatus(status);
  }

  protected handleMobileAction(action: MobileActionId): void {
    this.desktopMenuOpen.set(false);

    if (action === 'delete') {
      this.deleteSheetOpen.set(true);
      return;
    }

    if (action === 'pause') {
      void this.updateListingStatus('Paused');
      return;
    }

    if (action === 'resume') {
      void this.updateListingStatus('Available');
      return;
    }

    if (action === 'edit') {
      this.handleEditAction();
      return;
    }
  }

  protected handleEditAction(): void {
    this.mobileEditStep.set('media');
    this.resetEditableGalleryImages();
    this.editSheetOpen.set(true);
  }

  protected openStoreDetails(): void {
    const storeId = this.listing().store.id;
    if (!storeId) {
      return;
    }

    void this.router.navigate(['/seller/my-stores', storeId]);
  }

  protected saveEditListing(): void {
    if (this.isSavingEdit()) {
      return;
    }

    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      const step = this.mobileEditStep();

      if (step === 'media') {
        this.mobileEditStep.set('details');
        return;
      }

      if (step === 'details') {
        this.mobileEditStep.set('delivery');
        return;
      }
    }

    const formValue = this.editListingForm.getRawValue();
    const payload = this.buildListingUpdateFormData(formValue);

    this.isSavingEdit.set(true);
    void firstValueFrom(this.listingsService.updateListing(this.listingId(), payload))
      .then(async () => {
        const refreshed = await firstValueFrom(
          this.listingsService.getListingDetails(this.listingId(), { forceRefresh: true }),
        );
        this.applyListingDetails(refreshed);
        this.resetEditableGalleryImages();
        this.editSheetOpen.set(false);
        this.appToastService.show({ message: 'Listing updated successfully.' });
      })
      .catch(() => {
        this.appToastService.show({ message: 'Your listing changes couldn’t be saved right now. Please try again.' });
      })
      .finally(() => {
        this.isSavingEdit.set(false);
      });
  }

  protected confirmDeleteListing(): void {
    if (this.isDeletingListing()) {
      return;
    }

    this.isDeletingListing.set(true);
    void firstValueFrom(this.listingsService.deleteListing(this.listingId()))
      .then(async () => {
        this.deleteSheetOpen.set(false);
        this.appToastService.show({ message: 'Listing deleted successfully.' });
        await this.router.navigateByUrl('/seller/listings');
      })
      .catch(() => {
        this.appToastService.show({ message: 'This listing couldn’t be deleted right now. Please try again.' });
      })
      .finally(() => {
        this.isDeletingListing.set(false);
      });
  }

  protected confirmMarkSold(): void {
    this.markSoldSheetOpen.set(false);
    void this.updateListingStatus('Sold');
  }

  protected markListingAsPromoted(): void {
    this.showPromoteListingModal.set(false);
    this.listing.update((listing) => ({ ...listing, isPromoted: true }));
  }

  protected handleListingPromotion(selection: ListingPromotionSelection): void {
    const plan = this.resolvePromotionPlan(selection.durationDays);
    if (!plan) {
      this.appToastService.show({
        message: 'That promotion option isn’t available right now. Please choose another one or try again later.',
      });
      return;
    }

    this.isPromotingListing.set(true);

    void firstValueFrom(
      this.listingsService.promoteListings({
        listing_ids: [this.listingId()],
        plan_id: plan.id,
        payment_method: selection.paymentMethod,
        confirm_deduction: selection.paymentMethod === 'wallet',
      }),
    )
      .then(async (response) => {
        const paymentUrl = this.readString(response['payment_url']);
        if (paymentUrl && typeof window !== 'undefined') {
          window.location.href = paymentUrl;
          return;
        }

        const refreshed = await firstValueFrom(this.listingsService.getListingDetails(this.listingId()));
        this.applyListingDetails(refreshed);
        this.markListingAsPromoted();
        this.appToastService.show({ message: 'Listing promoted successfully.' });
      })
      .catch((error: unknown) => {
        const responseRecord = this.readRecord(this.readRecord(error)?.['error']) ??
          this.readRecord(this.readRecord(error)?.['response']);
        const message =
          this.readString(responseRecord?.['detail']) ??
          this.readString(responseRecord?.['error']) ??
          this.readString(responseRecord?.['message']) ??
          'This listing couldn’t be promoted right now. Please try again.';
        this.appToastService.show({ message });
      })
      .finally(() => {
        this.isPromotingListing.set(false);
      });
  }

  constructor() {
    void this.loadManageListingsMetadata();
    void this.loadPromotionPlans();
    void this.loadListingDetails();
    void this.loadListingRequests();
    void this.loadListingActivities();
  }

  private async loadManageListingsMetadata(): Promise<void> {
    try {
      const response = await firstValueFrom(this.listingsService.getManageListings());
      this.manageListingsMetadata.set(response);
    } catch {
      // Keep the fallback edit options if metadata fails to load.
    }
  }

  private async loadPromotionPlans(): Promise<void> {
    try {
      const plans = await firstValueFrom(this.listingsService.getPromotionPlans());
      this.promotionPlans.set(Array.isArray(plans) ? plans : []);
    } catch {
      this.promotionPlans.set([]);
    }
  }

  private async loadListingDetails(): Promise<void> {
    try {
      const record = await firstValueFrom(this.listingsService.getListingDetails(this.listingId()));
      this.applyListingDetails(record);
    } catch {
      // Keep the existing mocked page content as the fallback state on request failure.
    }
  }

  private async loadListingRequests(): Promise<void> {
    try {
      const [offers, callbacks] = await Promise.all([
        firstValueFrom(this.listingsService.getListingOffers(this.listingId())),
        firstValueFrom(this.listingsService.getListingCallbackRequests(this.listingId())),
      ]);

      const requestItems = [
        ...offers.map((record) => this.mapOfferRequest(record)),
        ...callbacks.map((record) => this.mapCallbackRequest(record)),
      ]
        .filter((record): record is ListingRequest => record !== null)
        .sort((left, right) => right.sortTime - left.sortTime);

      this.requests.set(requestItems);
    } catch {
      this.requests.set([]);
    }
  }

  private async loadListingActivities(): Promise<void> {
    try {
      const response = await firstValueFrom(this.listingsService.getListingActivities(this.listingId()));
      const rawItems = Array.isArray(response)
        ? response
        : Array.isArray(response.results)
          ? response.results
          : Array.isArray(response.timeline)
            ? response.timeline
            : [];

      const mapped = rawItems
        .map((record) => this.mapListingActivity(record))
        .filter((item): item is ListingActivity => item !== null);

      this.activities.set(mapped);
    } catch {
      this.activities.set([]);
    }
  }

  private applyListingDetails(record: ListingsApiItem): void {
    this.listingRecord.set(record);

    const listingSummary = this.findManageListingSummary();
    const gallery = this.extractGalleryImages(record, listingSummary);
    const storeInfo = this.readRecord(record['store_info']);
    const pricing = formatListingPricing(record);
    const storeName =
      this.readString(storeInfo?.['store_name']) ??
      this.readString(record['store_name']) ??
      this.readString(record['vendor_name']) ??
      this.listing().store.name;
    const listingLocation = this.composeLocation(record) ?? this.listing().location;
    const createdAt = record['created_at'];
    const updatedAt = record['updated_at'] ?? createdAt;
    const originalPrice = this.formatPlainPrice(record['original_price'] ?? record['discount_price']);
    const acceptsOffers = this.readBoolean(record['accept_offers']);
    const isFree = this.readBoolean(record['is_free']);
    const youtubeLink = this.readString(record['youtube_link']);
    const deliverySelections = this.extractDeliverySelectionIds(record);

    this.activeImageIndex.set(0);
    this.listing.set({
      ...this.listing(),
      id: this.readString(record['id']) ?? this.listingId(),
      name: this.readString(record['title']) ?? this.listing().name,
      previewImage: gallery[0]?.src ?? this.listing().previewImage,
      lastUpdated: this.formatDate(updatedAt) ?? this.listing().lastUpdated,
      datePosted: this.formatDate(createdAt) ?? this.listing().datePosted,
      location: listingLocation,
      price: pricing.price || this.listing().price,
      originalPrice: pricing.originalPrice ?? '',
      discountBadge: pricing.discountBadge ?? '',
      description: this.readString(record['description']) ?? this.listing().description,
      status: this.mapListingStatus(record['status']),
      messages:
        this.readNumber(record['messages_count']) ??
        this.readNumber(record['inquiries_count']) ??
        this.listing().messages,
      views:
        this.formatCount(record['views_count']) ??
        this.formatCount(record['views']) ??
        this.listing().views,
      saves:
        this.readNumber(record['save_count']) ??
        this.readNumber(record['saves_count']) ??
        this.listing().saves,
      isPromoted: this.readBoolean(record['is_promoted']) ?? this.listing().isPromoted,
      gallery,
      store: {
        id:
          this.readIdentifier(storeInfo?.['id']) ??
          this.readIdentifier(record['vendor_id']) ??
          this.readIdentifier(record['store_id']) ??
          this.listing().store.id,
        name: storeName,
        logo:
          this.resolveMediaUrl(this.readString(storeInfo?.['profile_photo'])) ??
          this.resolveMediaUrl(this.readString(record['profile_photo'])) ??
          this.resolveMediaUrl(this.readString(record['store_profile_photo'])) ??
          this.resolveMediaUrl(this.readString(this.readRecord(record['user'])?.['avatar'])) ??
          this.listing().store.logo,
        isVerified:
          this.readBoolean(storeInfo?.['is_verified']) ??
          this.readBoolean(storeInfo?.['is_verified_seller']) ??
          this.readBoolean(storeInfo?.['verified']) ??
          this.readBoolean(this.readRecord(storeInfo?.['user'])?.['is_verified']) ??
          this.readBoolean(this.readRecord(record['user'])?.['is_verified']) ??
          this.readBoolean(record['is_verified']) ??
          this.readBoolean(record['is_verified_seller']) ??
          this.readBoolean(record['verified']) ??
          false,
      },
    });
    // Update browser tab title with the listing name
    const listingName = this.readString(record['title']);
    if (listingName) {
      this.titleService.setTitle(`${listingName} | Duduzili`);
    }

    this.editAcceptOffersEnabled.set(acceptsOffers ?? true);
    this.editFreeListingEnabled.set(isFree ?? false);
    this.editDiscountEnabled.set(originalPrice !== null);
    this.selectedDeliveryMethods.set(deliverySelections.methods);
    this.selectedDeliveryRanges.set(deliverySelections.ranges);

    this.editListingForm.patchValue({
      name: this.readString(record['title']) ?? this.editListingForm.controls.name.getRawValue(),
      category:
        this.readString(record['category']) ?? this.editListingForm.controls.category.getRawValue(),
      condition:
        this.formatCondition(record['condition']) ??
        this.editListingForm.controls.condition.getRawValue(),
      store: storeName,
      description:
        this.readString(record['description']) ??
        this.editListingForm.controls.description.getRawValue(),
      embeddedVideo: youtubeLink ?? this.editListingForm.controls.embeddedVideo.getRawValue(),
      location: listingLocation,
      whatsAppNumber:
        this.readString(storeInfo?.['whatsapp_number']) ??
        this.editListingForm.controls.whatsAppNumber.getRawValue(),
      callNumber:
        this.readString(storeInfo?.['call_number']) ??
        this.readString(storeInfo?.['whatsapp_number']) ??
        this.editListingForm.controls.callNumber.getRawValue(),
      price: this.formatPlainPrice(record['price']) ?? this.editListingForm.controls.price.getRawValue(),
      discountPrice: originalPrice ?? this.editListingForm.controls.discountPrice.getRawValue(),
    });

    if (!this.editSheetOpen()) {
      this.resetEditableGalleryImages();
    }
  }

  private mapOfferRequest(record: ListingsApiItem): ListingRequest | null {
    const buyerRecord = this.readRecord(record['buyer']);
    const buyerName =
      this.readString(buyerRecord?.['full_name']) ??
      this.readString(buyerRecord?.['username']) ??
      this.readString(record['buyer_name']);
    if (!buyerName) {
      return null;
    }

    const createdAt = this.readString(record['created_at']);
    return {
      id: `offer-${this.readString(record['id']) ?? crypto.randomUUID()}`,
      buyer: buyerName,
      avatar:
        this.resolveMediaUrl(this.readString(buyerRecord?.['avatar'])) ??
        '/assets/images/seller-menu-avatar.png',
      message:
        this.readString(record['message']) ??
        'A buyer sent you an offer for this listing.',
      time: this.formatDateTime(createdAt) ?? 'Recently',
      sortTime: this.toTimestamp(createdAt),
      metaLabel: 'Offer',
      metaValue: this.formatCurrency(record['offer_amount']) ?? 'N/A',
      status: this.mapRequestStatus(record['status']),
    };
  }

  private mapCallbackRequest(record: ListingsApiItem): ListingRequest | null {
    const buyerRecord = this.readRecord(record['buyer']);
    const buyerName =
      this.readString(buyerRecord?.['full_name']) ??
      this.readString(buyerRecord?.['username']) ??
      this.readString(record['buyer_name']);
    if (!buyerName) {
      return null;
    }

    const createdAt = this.readString(record['date_requested']) ?? this.readString(record['created_at']);
    const callbackMessage =
      this.readString(record['message']) ??
      `Requested a call back on ${this.readString(record['phone_number']) ?? 'their number'}.`;

    return {
      id: `callback-${this.readString(record['id']) ?? crypto.randomUUID()}`,
      buyer: buyerName,
      avatar:
        this.resolveMediaUrl(this.readString(buyerRecord?.['avatar'])) ??
        '/assets/images/seller-menu-avatar.png',
      message: callbackMessage,
      time: this.formatDateTime(createdAt) ?? 'Recently',
      sortTime: this.toTimestamp(createdAt),
      metaLabel: 'Phone',
      metaValue: this.readString(record['phone_number']) ?? 'N/A',
      status: this.mapRequestStatus(record['status']),
    };
  }

  private mapListingActivity(record: ListingsApiItem): ListingActivity | null {
    const title = this.readString(record['label']) ?? this.readString(record['title']);
    const description = this.readString(record['description']);
    const timestamp = this.readString(record['timestamp']) ?? this.readString(record['created_at']);

    if (!title || !description) {
      return null;
    }

    return {
      id:
        `${this.readString(record['activity_type']) ?? 'activity'}-${this.readString(record['id']) ?? crypto.randomUUID()}`,
      title,
      description,
      time: this.formatDateTime(timestamp) ?? 'Recently',
      actorAvatar: this.resolveMediaUrl(this.readString(record['actor_avatar'])),
    };
  }

  private extractGalleryImages(
    record: ListingsApiItem,
    listingSummary?: ListingsApiItem | null,
  ): GalleryImage[] {
    const youtubeItem = this.createYoutubeGalleryItem(record);
    const arrayCandidates = [
      record['images'],
      record['gallery'],
      record['photos'],
      record['media'],
    ];

    for (const candidate of arrayCandidates) {
      if (!Array.isArray(candidate)) {
        continue;
      }

      const images = candidate
        .map((entry, index) => {
          if (typeof entry === 'string') {
            const src = this.resolveMediaUrl(entry);
          return src
              ? { id: null, type: 'image', src, alt: `${this.listing().name} image ${index + 1}` }
              : null;
          }

          const entryRecord = this.readRecord(entry);
          if (!entryRecord) {
            return null;
          }

          const src =
            this.resolveMediaUrl(this.readString(entryRecord['image'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['url'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['src'])) ??
            this.resolveMediaUrl(this.readString(entryRecord['thumbnail']));

          if (!src) {
            return null;
          }

          return {
            id: this.readIdentifier(entryRecord['id']),
            type: 'image',
            src,
            alt:
              this.readString(entryRecord['alt']) ??
              `${this.listing().name} image ${index + 1}`,
          };
        })
        .filter((image): image is GalleryImage => image !== null);

      if (images.length > 0) {
        return this.appendYoutubeGalleryItem(images, youtubeItem);
      }
    }

    const fallbackImage =
      this.resolveMediaUrl(this.readString(record['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(record['image'])) ??
      this.resolveMediaUrl(this.readString(record['cover_image'])) ??
      this.resolveMediaUrl(this.readString(listingSummary?.['thumbnail'])) ??
      this.resolveMediaUrl(this.readString(listingSummary?.['image']));

    if (fallbackImage) {
      return this.appendYoutubeGalleryItem(
        [
          {
            id: null,
            type: 'image',
            src: fallbackImage,
            alt: this.readString(record['title']) ?? 'Listing image',
          },
        ],
        youtubeItem,
      );
    }

    return this.appendYoutubeGalleryItem(
      this.listing().gallery.filter((image) => image.type === 'image'),
      youtubeItem,
    );
  }

  private appendYoutubeGalleryItem(
    images: GalleryImage[],
    youtubeItem: GalleryImage | null,
  ): GalleryImage[] {
    if (!youtubeItem) {
      return images;
    }

    const hasSameVideo = images.some((image) => image.type === 'youtube' && image.externalUrl === youtubeItem.externalUrl);
    return hasSameVideo ? images : [...images, youtubeItem];
  }

  private createYoutubeGalleryItem(record: ListingsApiItem): GalleryImage | null {
    const rawUrl =
      this.readString(record['youtube_link']) ??
      this.readString(record['youtube_url']) ??
      this.readString(record['video_url']) ??
      this.readString(record['video']);
    if (!rawUrl) {
      return null;
    }

    const videoId = this.extractYoutubeVideoId(rawUrl);
    if (!videoId) {
      return null;
    }

    const title = this.readString(record['title']) ?? this.listing().name;
    return {
      id: null,
      type: 'youtube',
      src: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      alt: `${title} video`,
      embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube.com/embed/${videoId}`),
      externalUrl: rawUrl,
    };
  }

  private extractYoutubeVideoId(rawUrl: string): string | null {
    const value = rawUrl.trim();
    if (!value) {
      return null;
    }

    if (/^[A-Za-z0-9_-]{11}$/.test(value)) {
      return value;
    }

    try {
      const url = new URL(value);
      if (url.hostname.includes('youtu.be')) {
        return url.pathname.split('/').filter(Boolean)[0] ?? null;
      }
      if (url.searchParams.has('v')) {
        return url.searchParams.get('v');
      }

      const embedMatch = url.pathname.match(/\/(?:embed|shorts)\/([^/?#]+)/);
      return embedMatch?.[1] ?? null;
    } catch {
      const fallbackMatch = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
      return fallbackMatch?.[1] ?? null;
    }
  }

  private findManageListingSummary(): ListingsApiItem | null {
    const entries = this.manageListingsMetadata()?.all;
    if (!Array.isArray(entries)) {
      return null;
    }

    const match = entries.find((entry) => this.readString(entry['id']) === this.listingId());
    return match ?? null;
  }

  private extractDeliveryOptions(record: ListingsApiItem | null): string | null {
    if (!record) {
      return null;
    }

    const options = record['delivery_options'];
    if (Array.isArray(options)) {
      const parsedLabels: string[] = [];
      for (const item of options) {
        if (typeof item === 'string') {
          const trimmed = item.trim();
          if (trimmed) {
            parsedLabels.push(trimmed);
          }
        } else if (item && typeof item === 'object') {
          const recordItem = item as Record<string, unknown>;
          const name =
            this.readString(recordItem['name']) ??
            this.readString(recordItem['label']) ??
            this.readString(recordItem['title']);
          if (name) {
            parsedLabels.push(name);
          }
        }
      }
      if (parsedLabels.length > 0) {
        return parsedLabels.join(', ');
      }
    }

    const deliveryRange = this.readString(record['delivery_range']);
    const deliveryMethod = this.readString(record['delivery_method']);
    const labels = [deliveryMethod, deliveryRange].filter(
      (label): label is string => typeof label === 'string' && label.length > 0,
    );

    return labels.length > 0 ? labels.join(', ') : null;
  }

  private mapRequestStatus(value: unknown): ListingRequest['status'] {
    const status = this.readString(value)?.toLowerCase();
    if (status === 'accepted' || status === 'responded') {
      return 'Responded';
    }

    if (status === 'completed' || status === 'called') {
      return 'Called';
    }

    return 'New';
  }

  private extractDeliverySelectionIds(record: ListingsApiItem): {
    methods: string[];
    ranges: string[];
  } {
    const selectedIds = new Set<string>();
    const candidates = record['delivery_options'];

    if (Array.isArray(candidates)) {
      for (const option of candidates) {
        if (typeof option === 'string' && option.trim().length > 0) {
          selectedIds.add(this.slugify(option));
          continue;
        }

        const entryRecord = this.readRecord(option);
        const rawOptionId = entryRecord?.['id'];
        const optionId =
          typeof rawOptionId === 'number' || typeof rawOptionId === 'string'
            ? String(rawOptionId).trim()
            : null;
        const optionName =
          this.readString(entryRecord?.['name']) ??
          this.readString(entryRecord?.['label']) ??
          this.readString(entryRecord?.['option']);

        if (optionId) {
          selectedIds.add(optionId);
        }

        if (optionName) {
          selectedIds.add(this.slugify(optionName));
        }
      }
    }

    const methods = this.deliveryMethodOptions()
      .map((option) => option.id)
      .filter((id) => selectedIds.has(id));
    const ranges = this.deliveryRangeOptions()
      .map((option) => option.id)
      .filter((id) => selectedIds.has(id));

    return {
      methods,
      ranges,
    };
  }

  private resolvePromotionPlan(durationDays: number): PromotionPlanApiItem | null {
    return (
      this.promotionPlans().find(
        (plan) =>
          plan.status?.toLowerCase() === 'active' && plan.duration_days === durationDays,
      ) ?? null
    );
  }

  private async updateListingStatus(status: ListingStatus): Promise<void> {
    const backendStatus = this.toBackendStatus(status);
    if (!backendStatus || this.isUpdatingStatus()) {
      return;
    }

    this.isUpdatingStatus.set(true);

    try {
      await firstValueFrom(
        this.listingsService.updateListing(this.listingId(), { status: backendStatus }),
      );
      const refreshed = await firstValueFrom(this.listingsService.getListingDetails(this.listingId()));
      this.applyListingDetails(refreshed);
      this.appToastService.show({ message: `Listing status updated to ${status}.` });
    } catch {
      this.appToastService.show({ message: 'This listing status couldn’t be updated right now. Please try again.' });
    } finally {
      this.isUpdatingStatus.set(false);
    }
  }

  private buildListingUpdatePayload(
    formValue: ReturnType<typeof this.editListingForm.getRawValue>,
  ): UpdateListingRequest {
    const payload: UpdateListingRequest = {
      title: formValue.name.trim(),
      description: formValue.description.trim(),
      location: formValue.location.trim(),
      accept_offers: this.editAcceptOffersEnabled(),
      is_free: this.editFreeListingEnabled(),
      youtube_link: formValue.embeddedVideo.trim() || null,
    };

    const price = this.parsePlainPrice(formValue.price);
    if (price !== null) {
      payload.price = this.editFreeListingEnabled() ? 0 : price;
    }

    if (this.editDiscountEnabled() && !this.editFreeListingEnabled()) {
      payload.original_price = this.parsePlainPrice(formValue.discountPrice);
    } else {
      payload.original_price = null;
    }

    const categoryId = this.resolveCategoryId(formValue.category);
    if (categoryId !== null) {
      payload.category = categoryId;
    }

    const conditionValue = this.resolveConditionValue(formValue.condition);
    if (conditionValue) {
      payload.condition = conditionValue;
    }

    const storeId = this.resolveStoreId(formValue.store);
    if (storeId) {
      payload.store = storeId;
    }

    const deliveryOptionIds = this.resolveSelectedDeliveryOptionIds();
    if (deliveryOptionIds.length > 0) {
      payload.delivery_option_ids = deliveryOptionIds;
    }

    return payload;
  }

  private buildListingUpdateFormData(
    formValue: ReturnType<typeof this.editListingForm.getRawValue>,
  ): FormData {
    const payload = this.buildListingUpdatePayload(formValue);
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value === null || typeof value === 'undefined') {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          formData.append(key, String(item));
        });
        return;
      }

      formData.append(key, String(value));
    });

    this.editableGalleryImages().forEach((image) => {
      formData.append('image_order', image.token);
      if (image.kind === 'pending' && image.file) {
        formData.append('uploaded_image_keys', image.token);
        formData.append('uploaded_images', image.file);
      }
    });

    this.deletedEditableImageIds().forEach((imageId) => {
      formData.append('deleted_image_ids', imageId);
    });

    return formData;
  }

  private deletedEditableImageIds(): string[] {
    const currentExistingIds = new Set(
      this.editableGalleryImages()
        .filter((image) => image.kind === 'existing' && image.imageId !== null)
        .map((image) => String(image.imageId)),
    );

    return this.listing()
      .gallery.filter((image) => image.type === 'image')
      .map((image) => image.id)
      .filter((imageId): imageId is string => imageId !== null)
      .filter((imageId) => !currentExistingIds.has(String(imageId)));
  }

  private resetEditableGalleryImages(): void {
    this.clearEditableGalleryImages();
    this.editableGalleryImages.set(
      this.listing()
        .gallery.filter((image) => image.type === 'image')
        .map((image, index) => ({
          token: image.id ? `existing:${image.id}` : `existing:fallback-${index}`,
          kind: 'existing',
          imageId: image.id,
          src: image.src,
          alt: image.alt,
        })),
    );

    const input = this.editImageInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  private clearEditableGalleryImages(): void {
    this.editImageReplaceIndex.set(null);
    this.editableGalleryImages().forEach((image) => {
      if (image.previewUrl) {
        URL.revokeObjectURL(image.previewUrl);
      }
    });
    this.editableGalleryImages.set([]);

    const input = this.editImageInput()?.nativeElement;
    if (input) {
      input.value = '';
    }
  }

  private resolveCategoryId(categoryName: string): number | null {
    const categories = this.manageListingsMetadata()?.categories ?? [];
    const match = categories.find(
      (category) => category.name.trim().toLowerCase() === categoryName.trim().toLowerCase(),
    );
    return typeof match?.id === 'number' ? match.id : null;
  }

  private resolveConditionValue(conditionLabel: string): string | null {
    const metadataConditions = this.manageListingsMetadata()?.product_conditions ?? [];
    const normalizedLabel = conditionLabel.trim().toLowerCase();
    const metadataMatch = metadataConditions.find((condition) =>
      this.normalizeConditionLabel(condition.name).trim().toLowerCase() === normalizedLabel,
    );

    if (metadataMatch) {
      return metadataMatch.id;
    }

    if (normalizedLabel === 'brand new' || normalizedLabel === 'new') {
      return 'new';
    }

    if (normalizedLabel === 'used' || normalizedLabel === 'fairly used') {
      return 'used';
    }

    return this.readString(this.listingRecord()?.['condition']);
  }

  private resolveStoreId(storeName: string): string | null {
    const stores = this.manageListingsMetadata()?.stores ?? [];
    const match = stores.find(
      (store) =>
        this.readStoreName(store)?.trim().toLowerCase() === storeName.trim().toLowerCase(),
    );

    const rawId = match?.['id'];
    if (typeof rawId === 'string' && rawId.trim().length > 0) {
      return rawId.trim();
    }

    return typeof rawId === 'number' ? String(rawId) : null;
  }

  private resolveSelectedDeliveryOptionIds(): number[] {
    const deliveryOptions = this.manageListingsMetadata()?.delivery_options ?? [];
    const selectedLabels = new Set([
      ...this.selectedDeliveryMethods(),
      ...this.selectedDeliveryRanges(),
    ]);

    return deliveryOptions
      .filter((option) => selectedLabels.has(String(option.id)) || selectedLabels.has(this.slugify(option.name)))
      .map((option) => option.id);
  }

  private resolveDeliveryOptionKind(option: ManageListingsDeliveryOption): DeliveryOption['kind'] {
    const key = this.slugify(option.name);

    if (
      key.includes('pickup') ||
      key.includes('delivery') ||
      key.includes('public-location') ||
      key.includes('meetup')
    ) {
      return 'method';
    }

    if (
      key.includes('nation') ||
      key.includes('state') ||
      key.includes('international') ||
      key.includes('local')
    ) {
      return 'range';
    }

    return 'other';
  }

  private readStoreName(store: ManageListingsStore): string | null {
    return (
      this.readString(store['store_name']) ??
      this.readString(store['name']) ??
      this.readString(store['title'])
    );
  }

  private normalizeConditionLabel(value: string): string {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'new') {
      return 'Brand new';
    }

    if (normalized === 'used') {
      return 'Used';
    }

    return this.formatCondition(value) ?? value;
  }

  private parsePlainPrice(value: string): number | null {
    const sanitized = value.replace(/[^\d.]/g, '').trim();
    if (!sanitized) {
      return null;
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private slugify(value: string): string {
    return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }

  private toBackendStatus(status: ListingStatus): string | null {
    switch (status) {
      case 'Available':
        return 'published';
      case 'Paused':
        return 'paused';
      case 'Sold':
        return 'sold';
      default:
        return null;
    }
  }

  private mapListingStatus(value: unknown): ListingStatus {
    if (typeof value !== 'string') {
      return this.listing().status;
    }

    switch (value.trim().toLowerCase()) {
      case 'sold':
        return 'Sold';
      case 'paused':
      case 'pause':
        return 'Paused';
      default:
        return 'Available';
    }
  }

  private formatPlainPrice(value: unknown): string | null {
    const parsed = this.readNumber(value);
    if (parsed === null) {
      return null;
    }

    return new Intl.NumberFormat('en-NG').format(parsed);
  }

  private formatDate(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  private formatDateTime(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return new Intl.DateTimeFormat('en-NG', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  private formatCurrency(value: unknown): string | null {
    const amount = this.readNumber(value);
    if (amount === null) {
      return null;
    }

    return `₦${new Intl.NumberFormat('en-NG').format(amount)}`;
  }

  private formatCount(value: unknown): string | null {
    const parsed = this.readNumber(value);
    return parsed === null ? null : new Intl.NumberFormat('en-NG').format(parsed);
  }

  private formatCondition(value: unknown): string | null {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }

    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private composeLocation(record: ListingsApiItem): string | null {
    const location = this.readString(record['location']);
    if (location) {
      return location;
    }

    const city = this.readString(record['city']);
    const state = this.readString(record['state']);

    if (city && state && !city.includes(state)) {
      return `${city}, ${state}`;
    }

    return city ?? state ?? null;
  }

  private resolveMediaUrl(value: string | null | undefined): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readIdentifier(value: unknown): string | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    return this.readString(value);
  }

  private readNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(/,/g, '').trim());
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private toTimestamp(value: string | null): number {
    if (!value) {
      return 0;
    }

    const timestamp = new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : 0;
  }

  private readBoolean(value: unknown): boolean | null {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) {
        return true;
      }

      if (value === 0) {
        return false;
      }
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'verified'].includes(normalized)) {
        return true;
      }

      if (['false', '0', 'no', 'unverified', 'pending', 'rejected'].includes(normalized)) {
        return false;
      }
    }

    return null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }
}
