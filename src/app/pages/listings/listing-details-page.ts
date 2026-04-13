import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowLeft,
  heroArrowTopRightOnSquare,
  heroCalendarDays,
  heroChatBubbleLeftRight,
  heroChevronDown,
  heroChevronRight,
  heroEllipsisHorizontal,
  heroEye,
  heroMapPin,
  heroPencilSquare,
  heroRocketLaunch,
  heroSquare3Stack3d,
  heroTrash,
  heroPause,
  heroPlay,
  heroClipboardDocumentList,
} from '@ng-icons/heroicons/outline';
import { PromoteListingModalComponent } from '../../components/listings/promote-listing-modal.component';

type ListingTab = 'overview' | 'requests' | 'activities';
type ListingStatus = 'Available' | 'Paused' | 'Sold';

interface GalleryImage {
  src: string;
  alt: string;
}

interface ListingRequest {
  id: string;
  buyer: string;
  avatar: string;
  message: string;
  time: string;
  offer: string;
  status: 'New' | 'Responded';
}

interface ListingActivity {
  id: string;
  title: string;
  description: string;
  time: string;
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
  description: string;
  status: ListingStatus;
  messages: number;
  views: string;
  saves: number;
  isPromoted: boolean;
  gallery: GalleryImage[];
  store: {
    name: string;
    logo: string;
  };
}

interface StatusOption {
  label: string;
  value: ListingStatus;
  tone: 'available' | 'paused' | 'sold';
}

type MobileActionId = 'share' | 'edit' | 'pause' | 'resume' | 'delete';

@Component({
  selector: 'app-listing-details-page',
  imports: [CommonModule, NgOptimizedImage, RouterLink, NgIcon, PromoteListingModalComponent],
  providers: [
    provideIcons({
      heroArrowLeft,
      heroArrowTopRightOnSquare,
      heroCalendarDays,
      heroChatBubbleLeftRight,
      heroChevronDown,
      heroChevronRight,
      heroClipboardDocumentList,
      heroEllipsisHorizontal,
      heroEye,
      heroMapPin,
      heroPause,
      heroPencilSquare,
      heroPlay,
      heroRocketLaunch,
      heroSquare3Stack3d,
      heroTrash,
    }),
  ],
  template: `
    <div class="mx-auto max-w-[1248px] px-4 pb-28 pt-4 md:px-0 md:pb-0 md:pt-0">
      <div class="md:hidden">
        <div class="flex items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <a
              routerLink="/listings"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7] text-[#202335]"
              aria-label="Back to listings"
            >
              <ng-icon name="heroArrowLeft" class="text-[18px]"></ng-icon>
            </a>
            <div>
              <p class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">Listing details</p>
            </div>
          </div>

          <button
            type="button"
            (click)="desktopMenuOpen.set(true)"
            class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F7] text-[#202335]"
            aria-label="Open listing actions"
          >
            <ng-icon name="heroEllipsisHorizontal" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <section class="mt-6">
          <div class="flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <div class="relative h-[54px] w-[54px] shrink-0 overflow-hidden rounded-[10.8px] bg-[#EFEFEF]">
              <img
                [ngSrc]="listing().previewImage"
                [alt]="listing().name"
                fill
                sizes="15vw"
                class="object-cover"
              />
              </div>

              <div class="min-w-0 flex-1">
                <h1 class="truncate text-[18px] font-semibold leading-[1.3] tracking-[-0.03em] text-[#1A1B1D]">
                    {{ listing().name }}
                </h1>
                <p class="mt-1 text-[13px] leading-[1.2] text-[#777777]">Last updated on: {{ listing().lastUpdated }}</p>
              </div>

              <button
                type="button"
                (click)="showPromoteListingModal.set(true)"
                class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#2D2D2D] shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                aria-label="Promote listing"
              >
                <ng-icon name="heroRocketLaunch" class="text-[14px]"></ng-icon>
              </button>
            </div>

            <div class="flex items-center gap-3">
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
                <ng-icon name="heroChevronDown" class="text-[14px] text-[#000000]"></ng-icon>
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
              [class.text-[#202335]]="activeTab() === tab.id"
              [class.text-[#8A8F9A]]="activeTab() !== tab.id"
            >
              <ng-icon [name]="tab.icon" class="text-[16px]"></ng-icon>
              {{ tab.label }}
              @if (activeTab() === tab.id) {
                <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#202335]"></span>
              }
            </button>
          }
        </nav>

        @if (activeTab() === 'overview') {
          <section class="space-y-6 pt-5">
            <div class="flex gap-3 overflow-x-auto pb-1">
              @for (image of listing().gallery; track image.alt; let index = $index) {
                <button
                  type="button"
                  (click)="activeImageIndex.set(index)"
                  class="relative h-[168px] w-[152px] shrink-0 overflow-hidden rounded-[24px] border bg-[#F3F4F7]"
                  [class.border-[#202335]]="activeImageIndex() === index"
                  [class.border-transparent]="activeImageIndex() !== index"
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
            </div>

            <div>
              <h2 class="text-[24px] font-semibold tracking-[-0.04em] text-[#202335]">{{ listing().name }}</h2>
              <div class="mt-2 flex items-center gap-2 text-[13px] text-[#707684]">
                <ng-icon name="heroMapPin" class="text-[16px]"></ng-icon>
                <span>{{ listing().location }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              @for (stat of overviewStats(); track stat.label) {
                <article class="rounded-[22px] border border-[#E9EBF0] bg-white px-4 py-4">
                  <p class="text-[11px] text-[#8A8F9A]">{{ stat.label }}</p>
                  <div class="mt-2 flex items-center gap-2 text-[14px] font-semibold text-[#202335]">
                    @if (stat.icon) {
                      <ng-icon [name]="stat.icon" class="text-[16px] text-[#8A8F9A]"></ng-icon>
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
                    <span class="text-[24px]">₦</span>{{ listing().price }}
                  </p>
                </div>

                <button
                  type="button"
                  (click)="handleEditAction()"
                  class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                  aria-label="Edit listing"
                >
                  <ng-icon name="heroPencilSquare" class="text-[18px]"></ng-icon>
                </button>
              </div>

              <div class="pt-5">
                <p class="mb-3 text-[12px] text-[#8A8F9A]">Store</p>
                <div class="flex items-center justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#EEF4F0]">
                      <img
                        [ngSrc]="listing().store.logo"
                        [alt]="listing().store.name"
                        fill
                        sizes="12vw"
                        class="object-cover"
                      />
                    </div>

                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5">
                        <span class="truncate text-[14px] font-semibold text-[#202335]">{{ listing().store.name }}</span>
                        <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#131A24] text-[10px] text-white">✓</span>
                      </div>
                      <p class="mt-1 text-[11px] text-[#8A8F9A]">Verified store</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                    aria-label="Open store"
                  >
                    <ng-icon name="heroArrowTopRightOnSquare" class="text-[18px]"></ng-icon>
                  </button>
                </div>
              </div>
            </section>

            <section class="border-b border-[#ECEEF3] pb-6">
              <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">Description</h3>
              <p class="mt-3 text-[14px] leading-7 text-[#5E6472]">
                {{ listing().description }}
              </p>
            </section>

            <section>
              <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">General details</h3>
              <div class="mt-5 space-y-4">
                @for (detail of details(); track detail.label) {
                  <div class="flex items-start justify-between gap-5">
                    <span class="text-[13px] text-[#8A8F9A]">{{ detail.label }}</span>
                    <span class="max-w-[60%] text-right text-[13px] font-medium leading-6 text-[#202335]">
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
                      <div class="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]">
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
                          <p class="truncate text-[14px] font-semibold text-[#202335]">{{ request.buyer }}</p>
                          <span
                            class="rounded-full px-2.5 py-1 text-[10px] font-medium"
                            [class.bg-[#EEFCEB]]="request.status === 'New'"
                            [class.text-[#2F9E44]]="request.status === 'New'"
                            [class.bg-[#F3F0FF]]="request.status === 'Responded'"
                            [class.text-[#5E44EE]]="request.status === 'Responded'"
                          >
                            {{ request.status }}
                          </span>
                        </div>

                        <p class="mt-2 text-[13px] leading-6 text-[#5E6472]">{{ request.message }}</p>
                        <div class="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-[#8A8F9A]">
                          <span>{{ request.time }}</span>
                          <span>Offer: {{ request.offer }}</span>
                        </div>
                      </div>
                    </div>
                  </article>
                }
              </div>
            } @else {
              <div class="rounded-[24px] border border-dashed border-[#D9DCE3] bg-white px-6 py-12 text-center">
                <p class="text-[15px] font-semibold text-[#202335]">No requests yet</p>
                <p class="mt-2 text-[13px] text-[#8A8F9A]">Buyer messages and offers will appear here when the backend returns data.</p>
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
                      <div class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#202335]">
                        <ng-icon name="heroClipboardDocumentList" class="text-[18px]"></ng-icon>
                      </div>

                      <div class="min-w-0 flex-1">
                        <p class="text-[14px] font-semibold text-[#202335]">{{ activity.title }}</p>
                        <p class="mt-2 text-[13px] leading-6 text-[#5E6472]">{{ activity.description }}</p>
                        <p class="mt-3 text-[11px] text-[#8A8F9A]">{{ activity.time }}</p>
                      </div>
                    </div>
                  </article>
                }
              </div>
            } @else {
              <div class="rounded-[24px] border border-dashed border-[#D9DCE3] bg-white px-6 py-12 text-center">
                <p class="text-[15px] font-semibold text-[#202335]">No activities yet</p>
                <p class="mt-2 text-[13px] text-[#8A8F9A]">Status changes, edits, and promotions will appear here when data is available.</p>
              </div>
            }
          </section>
        }
      </div>

      <div class="hidden md:block">
        <nav class="mb-6 flex items-center gap-2 text-[14px] text-[#8A8F9A]">
          <a routerLink="/listings" class="transition-colors hover:text-[#202335]">Listings</a>
          <span>/</span>
          <span class="font-medium text-[#202335]">Listing details</span>
        </nav>

        <section class="rounded-[32px] border border-[#E9EBF0] bg-white p-8 shadow-[0_20px_50px_-38px_rgba(18,24,35,0.35)]">
          <div class="flex items-start justify-between gap-6 border-b border-[#ECEEF3] pb-7">
            <div class="flex items-start gap-4">
              <div class="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[24px] bg-[#F3F4F7]">
                <img
                  [ngSrc]="listing().previewImage"
                  [alt]="listing().name"
                  fill
                  sizes="8vw"
                  class="object-cover"
                />
              </div>

              <div class="pt-1">
                <div class="flex items-center gap-3">
                  <h1 class="text-[22px] font-semibold tracking-[-0.04em] text-[#202335]">
                    {{ listing().name }}
                  </h1>
                  <span class="inline-flex rounded-full px-4 py-1.5 text-[12px] font-medium" [class]="statusBadgeClass()">
                    {{ listing().status }}
                  </span>
                </div>
                <p class="mt-2 text-[14px] text-[#8A8F9A]">Last updated on: {{ listing().lastUpdated }}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              @if (listing().status !== 'Sold') {
                <button
                  type="button"
                  (click)="showPromoteListingModal.set(true)"
                  class="inline-flex h-12 items-center gap-2 rounded-full bg-[#111111] px-5 text-[14px] font-semibold text-white"
                >
                  <ng-icon name="heroRocketLaunch" class="text-[16px]"></ng-icon>
                  Promote listing
                </button>
              }

              @if (listing().status !== 'Sold') {
                <button
                  type="button"
                  (click)="statusSheetOpen.set(true)"
                  class="inline-flex h-12 items-center gap-2 rounded-full border border-[#E4E7EC] bg-white px-5 text-[14px] font-medium text-[#202335]"
                >
                  Status
                  <span class="font-semibold">{{ listing().status }}</span>
                  <ng-icon name="heroChevronDown" class="text-[16px] text-[#8A8F9A]"></ng-icon>
                </button>
              }

              <div class="relative">
                <button
                  type="button"
                  (click)="toggleDesktopMenu()"
                  class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-[#202335]"
                  aria-label="Open listing actions"
                  [attr.aria-expanded]="desktopMenuOpen()"
                >
                  <ng-icon name="heroEllipsisHorizontal" class="text-[20px]"></ng-icon>
                </button>

                @if (desktopMenuOpen()) {
                  <div
                    class="absolute right-0 top-[calc(100%+12px)] z-20 w-[240px] rounded-[24px] border border-[#ECEEF3] bg-white p-3 shadow-[0_20px_40px_-30px_rgba(18,24,35,0.45)]"
                    role="menu"
                    aria-label="Listing actions"
                  >
                    @for (action of mobileActions(); track action.id) {
                      <button
                        type="button"
                        (click)="handleMobileAction(action.id)"
                        class="flex w-full items-center gap-3 rounded-[18px] px-3 py-3 text-left text-[14px] font-medium transition hover:bg-[#F6F7FA]"
                        [class.text-[#FF3B30]]="action.id === 'delete'"
                        [class.text-[#202335]]="action.id !== 'delete'"
                      >
                        <ng-icon [name]="action.icon" class="text-[18px]"></ng-icon>
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
                [class.text-[#202335]]="activeTab() === tab.id"
                [class.text-[#8A8F9A]]="activeTab() !== tab.id"
              >
                <ng-icon [name]="tab.icon" class="text-[16px]"></ng-icon>
                {{ tab.label }}
                @if (activeTab() === tab.id) {
                  <span class="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#202335]"></span>
                }
              </button>
            }
          </nav>

          @if (activeTab() === 'overview') {
            <div class="space-y-8 pt-8">
              <div class="grid grid-cols-2 gap-3 xl:grid-cols-6">
                @for (image of listing().gallery; track image.alt; let index = $index) {
                  <button
                    type="button"
                    (click)="activeImageIndex.set(index)"
                    class="relative overflow-hidden rounded-[28px] border bg-[#F3F4F7]"
                    [class.border-[#202335]]="activeImageIndex() === index"
                    [class.border-transparent]="activeImageIndex() !== index"
                  >
                    <div class="relative aspect-[0.92] w-full">
                      <img
                        [ngSrc]="image.src"
                        [alt]="image.alt"
                        fill
                        sizes="(min-width: 1280px) 14vw, 22vw"
                        class="object-cover"
                      />
                    </div>
                  </button>
                }
              </div>

              <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_316px]">
                <div class="space-y-8">
                  <div>
                    <h2 class="text-[32px] font-semibold tracking-[-0.05em] text-[#202335]">{{ listing().name }}</h2>
                    <div class="mt-3 flex items-center gap-2 text-[15px] text-[#707684]">
                      <ng-icon name="heroMapPin" class="text-[18px]"></ng-icon>
                      <span>{{ listing().location }}</span>
                    </div>
                  </div>

                  <div class="grid gap-4 rounded-[28px] border border-[#E9EBF0] bg-white p-5 md:grid-cols-4">
                    @for (stat of overviewStats(); track stat.label; let index = $index) {
                      <article class="space-y-2 md:pl-0" [class.md:border-l]="index > 0" [class.md:border-[#ECEEF3]]="index > 0" [class.md:pl-5]="index > 0">
                        <p class="text-[13px] text-[#8A8F9A]">{{ stat.label }}</p>
                        <div class="flex items-center gap-2 text-[15px] font-semibold text-[#202335]">
                          @if (stat.icon) {
                            <ng-icon [name]="stat.icon" class="text-[18px] text-[#8A8F9A]"></ng-icon>
                          }
                          <span>{{ stat.value }}</span>
                        </div>
                      </article>
                    }
                  </div>

                  <section class="border-b border-[#ECEEF3] pb-8">
                    <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">Description</h3>
                    <p class="mt-4 max-w-[720px] text-[15px] leading-8 text-[#5E6472]">
                      {{ listing().description }}
                    </p>
                  </section>

                  <section>
                    <h3 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">General details</h3>
                    <div class="mt-6 grid gap-y-6 md:grid-cols-[220px_minmax(0,1fr)]">
                      @for (detail of details(); track detail.label) {
                        <div class="text-[15px] text-[#8A8F9A]">{{ detail.label }}</div>
                        <div class="text-[15px] font-medium leading-7 text-[#202335]">{{ detail.value }}</div>
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
                          <p class="mt-3 text-[34px] font-semibold tracking-[-0.05em] text-[#202335]">
                            <span class="text-[30px]">₦</span>{{ listing().price }}
                          </p>
                        </div>

                        <button
                          type="button"
                          (click)="handleEditAction()"
                          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                          aria-label="Edit listing"
                        >
                          <ng-icon name="heroPencilSquare" class="text-[18px]"></ng-icon>
                        </button>
                      </div>
                    </div>

                    <div class="pt-6">
                      <p class="mb-4 text-[13px] text-[#8A8F9A]">Store</p>
                      <div class="flex items-center justify-between gap-4">
                        <div class="flex items-center gap-3">
                          <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#EEF4F0]">
                            <img
                              [ngSrc]="listing().store.logo"
                              [alt]="listing().store.name"
                              fill
                              sizes="5vw"
                              class="object-cover"
                            />
                          </div>

                          <div class="min-w-0">
                            <div class="flex items-center gap-1.5">
                              <span class="truncate text-[15px] font-semibold text-[#202335]">{{ listing().store.name }}</span>
                              <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#131A24] text-[10px] text-white">✓</span>
                            </div>
                            <p class="mt-1 text-[12px] text-[#8A8F9A]">Verified store</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#ECEEF3] bg-white text-[#202335]"
                          aria-label="Open store"
                        >
                          <ng-icon name="heroArrowTopRightOnSquare" class="text-[18px]"></ng-icon>
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
                        <div class="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-[#F3F4F7]">
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
                            <p class="text-[15px] font-semibold text-[#202335]">{{ request.buyer }}</p>
                            <span
                              class="rounded-full px-2.5 py-1 text-[10px] font-medium"
                              [class.bg-[#EEFCEB]]="request.status === 'New'"
                              [class.text-[#2F9E44]]="request.status === 'New'"
                              [class.bg-[#F3F0FF]]="request.status === 'Responded'"
                              [class.text-[#5E44EE]]="request.status === 'Responded'"
                            >
                              {{ request.status }}
                            </span>
                          </div>

                          <p class="mt-2 max-w-[860px] text-[14px] leading-7 text-[#5E6472]">{{ request.message }}</p>
                          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#8A8F9A]">
                            <span>{{ request.time }}</span>
                            <span>Offer: {{ request.offer }}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="rounded-[28px] border border-dashed border-[#D9DCE3] bg-white px-8 py-16 text-center">
                  <p class="text-[18px] font-semibold text-[#202335]">No requests yet</p>
                  <p class="mt-2 text-[14px] text-[#8A8F9A]">Buyer messages and offers will appear here when the backend returns data.</p>
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
                        <div class="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#F4F5F8] text-[#202335]">
                          <ng-icon name="heroClipboardDocumentList" class="text-[18px]"></ng-icon>
                        </div>

                        <div class="min-w-0 flex-1">
                          <p class="text-[15px] font-semibold text-[#202335]">{{ activity.title }}</p>
                          <p class="mt-2 max-w-[860px] text-[14px] leading-7 text-[#5E6472]">{{ activity.description }}</p>
                          <p class="mt-4 text-[12px] text-[#8A8F9A]">{{ activity.time }}</p>
                        </div>
                      </div>
                    </article>
                  }
                </div>
              } @else {
                <div class="rounded-[28px] border border-dashed border-[#D9DCE3] bg-white px-8 py-16 text-center">
                  <p class="text-[18px] font-semibold text-[#202335]">No activities yet</p>
                  <p class="mt-2 text-[14px] text-[#8A8F9A]">Status changes, edits, and promotions will appear here when data is available.</p>
                </div>
              }
            </section>
          }
        </section>
      </div>
    </div>

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
        class="fixed inset-x-0 bottom-0 z-20 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Listing actions"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC]"></div>
        <h2 class="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Listing actions</h2>

        <div class="mt-6 space-y-2">
          @for (action of mobileActions(); track action.id) {
            <button
              type="button"
              (click)="handleMobileAction(action.id)"
              class="flex w-full items-center gap-3 rounded-[20px] px-2 py-3 text-left text-[15px] font-medium"
              [class.text-[#FF3B30]]="action.id === 'delete'"
              [class.text-[#202335]]="action.id !== 'delete'"
            >
              <ng-icon [name]="action.icon" class="text-[18px]"></ng-icon>
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
        class="fixed inset-0 z-30 bg-black/30"
        aria-label="Close status dialog"
      ></button>

      <section
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:left-1/2 md:right-auto md:top-1/2 md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-6 md:pt-6"
        role="dialog"
        aria-modal="true"
        aria-label="Update listing status"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC] md:hidden"></div>
        <h2 class="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[#202335] md:mt-0">Update status</h2>
        <p class="mt-2 text-[13px] leading-6 text-[#8A8F9A]">Choose the current status for this listing.</p>

        <div class="mt-6 space-y-3">
          @for (option of statusOptions; track option.value) {
            <button
              type="button"
              (click)="handleStatusSelection(option.value)"
              class="flex w-full items-center justify-between rounded-[20px] border px-4 py-4 text-left transition hover:bg-[#F8F9FB]"
              [class.border-[#202335]]="listing().status === option.value"
              [class.border-[#E9EBF0]]="listing().status !== option.value"
            >
              <div>
                <p class="text-[14px] font-semibold text-[#202335]">{{ option.label }}</p>
                <p class="mt-1 text-[12px] text-[#8A8F9A]">
                  @if (option.value === 'Available') {Visible to buyers and accepting requests}
                  @if (option.value === 'Paused') {Hidden temporarily while you keep the listing}
                  @if (option.value === 'Sold') {Marks the listing as sold and closes new requests}
                </p>
              </div>

              <span class="inline-flex rounded-full px-3 py-1 text-[11px] font-medium" [class]="statusOptionBadgeClass(option.tone)">
                {{ option.label }}
              </span>
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
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:left-1/2 md:right-auto md:top-1/2 md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-6 md:pt-6"
        role="dialog"
        aria-modal="true"
        aria-label="Delete listing"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC] md:hidden"></div>
        <div class="mt-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#FFF1F0] text-[#FF3B30] md:mt-0">
          <ng-icon name="heroTrash" class="text-[20px]"></ng-icon>
        </div>
        <h2 class="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Delete listing?</h2>
        <p class="mt-2 text-[13px] leading-6 text-[#8A8F9A]">This action cannot be undone. The listing will be removed from your seller account.</p>

        <div class="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            (click)="deleteSheetOpen.set(false)"
            class="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-[14px] font-medium text-[#202335]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmDeleteListing()"
            class="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#FF3B30] text-[14px] font-semibold text-white"
          >
            Delete listing
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
        class="fixed inset-x-0 bottom-0 z-40 rounded-t-[32px] bg-white px-4 pb-8 pt-4 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.45)] md:left-1/2 md:right-auto md:top-1/2 md:w-[420px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[32px] md:px-6 md:pb-6 md:pt-6"
        role="dialog"
        aria-modal="true"
        aria-label="Mark listing as sold"
      >
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E5E7EC] md:hidden"></div>
        <h2 class="mt-4 text-[20px] font-semibold tracking-[-0.03em] text-[#202335] md:mt-0">Mark listing as sold?</h2>
        <p class="mt-2 text-[13px] leading-6 text-[#8A8F9A]">Buyers will still see the listing details, but new purchase requests will stop.</p>

        <div class="mt-6 flex flex-col gap-3 md:flex-row">
          <button
            type="button"
            (click)="markSoldSheetOpen.set(false)"
            class="inline-flex h-12 flex-1 items-center justify-center rounded-full border border-[#E4E7EC] bg-white text-[14px] font-medium text-[#202335]"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="confirmMarkSold()"
            class="inline-flex h-12 flex-1 items-center justify-center rounded-full bg-[#111111] text-[14px] font-semibold text-white"
          >
            Mark as sold
          </button>
        </div>
      </section>
    }

    @if (showPromoteListingModal()) {
      <app-promote-listing-modal
        (close)="showPromoteListingModal.set(false)"
        (promoted)="markListingAsPromoted()"
      ></app-promote-listing-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected readonly activeTab = signal<ListingTab>('overview');
  protected readonly activeImageIndex = signal(0);
  protected readonly showPromoteListingModal = signal(false);
  protected readonly desktopMenuOpen = signal(false);
  protected readonly statusSheetOpen = signal(false);
  protected readonly deleteSheetOpen = signal(false);
  protected readonly markSoldSheetOpen = signal(false);

  protected readonly listing = signal<ListingDetails>({
    id: this.listingId(),
    name: 'Iphone 17 pro max',
    previewImage: '/assets/images/listings-item-iphone.png',
    lastUpdated: '24 January, 2026',
    datePosted: '14 Feb, 2026',
    location: 'Ikeja, Lagos',
    price: '2,500,000',
    description:
      'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, strong battery health, and no repairs. Minor signs of use only. Everything shown in the gallery is included exactly as pictured.',
    status: 'Sold',
    messages: 12,
    views: '3,990',
    saves: 200,
    isPromoted: true,
    gallery: [
      { src: '/assets/images/listings-item-iphone.png', alt: 'Front view of iPhone 17 Pro Max' },
      { src: '/assets/images/listings-item-iphone.png', alt: 'Rear camera view of iPhone 17 Pro Max' },
      { src: '/assets/images/listings-item-iphone.png', alt: 'Angled view of iPhone 17 Pro Max' },
      { src: '/assets/images/listings-item-iphone.png', alt: 'Display close up of iPhone 17 Pro Max' },
      { src: '/assets/images/listings-item-iphone.png', alt: 'Side profile of iPhone 17 Pro Max' },
      { src: '/assets/images/listings-item-iphone.png', alt: 'Packaging shot of iPhone 17 Pro Max' },
    ],
    store: {
      name: 'The Vine Collections',
      logo: '/assets/images/seller-menu-avatar.png',
    },
  });

  protected readonly tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'heroSquare3Stack3d' },
    { id: 'requests' as const, label: 'Requests', icon: 'heroChatBubbleLeftRight' },
    { id: 'activities' as const, label: 'Activities', icon: 'heroClipboardDocumentList' },
  ] as const;

  protected readonly statusOptions: readonly StatusOption[] = [
    { label: 'Available', value: 'Available', tone: 'available' },
    { label: 'Pause', value: 'Paused', tone: 'paused' },
    { label: 'Sold', value: 'Sold', tone: 'sold' },
  ] as const;

  protected readonly details = computed<readonly ListingDetailItem[]>(() => [
    { label: 'Category', value: 'Electronics / Phones & Tablets' },
    { label: 'Condition', value: 'Used' },
    { label: 'Location', value: 'Ikeja, Lagos' },
    { label: 'Delivery options', value: 'Nationwide' },
    { label: 'WhatsApp number', value: '08169397454' },
    { label: 'Call number', value: '08169397454' },
    { label: 'Accept offers', value: 'Yes' },
  ]);

  protected readonly requests = signal<ListingRequest[]>([
    {
      id: 'r1',
      buyer: 'John Okafor',
      avatar: '/assets/images/seller-menu-avatar.png',
      message: 'Hi, is this still available? I would like to know if you can do a better price.',
      time: 'Today, 7:50 pm',
      offer: '₦2,350,000',
      status: 'New',
    },
    {
      id: 'r2',
      buyer: 'Amaka Eze',
      avatar: '/assets/images/seller-menu-avatar.png',
      message: 'Can you deliver to Lekki tomorrow morning? I am interested and ready to pay immediately.',
      time: 'Yesterday, 5:12 pm',
      offer: '₦2,500,000',
      status: 'Responded',
    },
  ]);

  protected readonly activities = signal<ListingActivity[]>([
    {
      id: 'a1',
      title: 'Listing promoted successfully',
      description: 'Your listing started running as a promoted ad across search and category pages.',
      time: '24 January, 2026 at 10:32 AM',
    },
    {
      id: 'a2',
      title: 'Price updated',
      description: 'You changed the listing price from ₦2,700,000 to ₦2,500,000.',
      time: '22 January, 2026 at 4:11 PM',
    },
    {
      id: 'a3',
      title: 'Listing created',
      description: 'This listing was published and made visible to buyers on Duduzili.',
      time: '14 February, 2026 at 9:08 AM',
    },
  ]);

  protected readonly hasRequests = computed(() => this.requests().length > 0);
  protected readonly hasActivities = computed(() => this.activities().length > 0);

  protected readonly overviewStats = computed(() => [
    { label: 'Date posted', value: this.listing().datePosted, icon: 'heroCalendarDays' },
    { label: 'Messages', value: `${this.listing().messages}`, icon: 'heroChatBubbleLeftRight' },
    { label: 'Views', value: this.listing().views, icon: 'heroEye' },
    { label: 'Saves', value: `${this.listing().saves}`, icon: '' },
  ]);

  protected readonly mobileActions = computed(() => {
    switch (this.listing().status) {
      case 'Paused':
        return [
          { id: 'edit' as const, label: 'Edit listing', icon: 'heroPencilSquare' },
          { id: 'resume' as const, label: 'Resume listing', icon: 'heroPlay' },
          { id: 'delete' as const, label: 'Delete listing', icon: 'heroTrash' },
        ];
      case 'Sold':
        return [
          { id: 'share' as const, label: 'Share listing', icon: 'heroArrowTopRightOnSquare' },
          { id: 'edit' as const, label: 'Edit listing', icon: 'heroPencilSquare' },
          { id: 'delete' as const, label: 'Delete listing', icon: 'heroTrash' },
        ];
      default:
        return [
          { id: 'share' as const, label: 'Share listing', icon: 'heroArrowTopRightOnSquare' },
          { id: 'edit' as const, label: 'Edit listing', icon: 'heroPencilSquare' },
          { id: 'pause' as const, label: 'Pause listing', icon: 'heroPause' },
          { id: 'delete' as const, label: 'Delete listing', icon: 'heroTrash' },
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

  protected handleStatusSelection(status: ListingStatus): void {
    this.statusSheetOpen.set(false);

    if (status === 'Sold') {
      this.markSoldSheetOpen.set(true);
      return;
    }

    this.listing.update((listing) => ({ ...listing, status }));
  }

  protected handleMobileAction(action: MobileActionId): void {
    this.desktopMenuOpen.set(false);

    if (action === 'delete') {
      this.deleteSheetOpen.set(true);
      return;
    }

    if (action === 'pause') {
      this.listing.update((listing) => ({ ...listing, status: 'Paused' }));
      return;
    }

    if (action === 'resume') {
      this.listing.update((listing) => ({ ...listing, status: 'Available' }));
      return;
    }

    if (action === 'edit') {
      this.handleEditAction();
      return;
    }
  }

  protected handleEditAction(): void {
    void this.router.navigateByUrl('/listings');
  }

  protected confirmDeleteListing(): void {
    this.deleteSheetOpen.set(false);
    void this.router.navigateByUrl('/listings');
  }

  protected confirmMarkSold(): void {
    this.markSoldSheetOpen.set(false);
    this.listing.update((listing) => ({ ...listing, status: 'Sold' }));
  }

  protected markListingAsPromoted(): void {
    this.showPromoteListingModal.set(false);
    this.listing.update((listing) => ({ ...listing, isPromoted: true }));
  }
}
