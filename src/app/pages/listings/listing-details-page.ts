import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCalendarDays,
  heroChatBubbleLeftRight,
  heroChevronDown,
  heroChevronRight,
  heroEllipsisHorizontal,
  heroEye,
  heroMapPin,
  heroRocketLaunch,
  heroSquare3Stack3d,
  heroTag,
  heroHeart,
  heroArrowTopRightOnSquare,
  heroClipboardDocumentList,
} from '@ng-icons/heroicons/outline';
import { PromoteListingModalComponent } from '../../components/listings/promote-listing-modal.component';

interface SellerListingRequest {
  id: string;
  buyer: string;
  avatar: string;
  message: string;
  time: string;
  offer: string;
  status: 'New' | 'Responded';
}

interface SellerListingActivity {
  id: string;
  title: string;
  description: string;
  time: string;
}

@Component({
  selector: 'app-listing-details-page',
  imports: [CommonModule, NgOptimizedImage, NgIcon, RouterLink, PromoteListingModalComponent],
  providers: [
    provideIcons({
      heroCalendarDays,
      heroChatBubbleLeftRight,
      heroChevronDown,
      heroChevronRight,
      heroEllipsisHorizontal,
      heroEye,
      heroMapPin,
      heroRocketLaunch,
      heroSquare3Stack3d,
      heroTag,
      heroHeart,
      heroArrowTopRightOnSquare,
      heroClipboardDocumentList,
    }),
  ],
  template: `
    <div class="mx-auto max-w-7xl pb-12">
      <div class="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm md:p-8">
        <nav class="mb-6 flex items-center gap-2 text-sm text-gray-400">
          <a routerLink="/listings" class="transition-colors hover:text-purple-600">Listings</a>
          <span>/</span>
          <span class="font-medium text-gray-700">Listing details</span>
        </nav>

        <div class="mb-8 flex flex-col gap-6 border-b border-gray-100 pb-6 xl:flex-row xl:items-start xl:justify-between">
          <div class="flex items-start gap-4">
            <div class="relative h-14 w-14 overflow-hidden rounded-2xl bg-gray-100 shadow-sm">
              <img [src]="listing().previewImage" [alt]="listing().name" class="h-full w-full object-cover">
            </div>

            <div>
              <div class="flex flex-wrap items-center gap-3">
                <h1 class="text-[22px] font-semibold tracking-tight text-[#1A1C21] md:text-[24px]">
                  {{ listing().name }}
                </h1>
                @if (listing().isPromoted) {
                  <span class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-[#1A1C21] shadow-sm">
                    <span class="text-base leading-none">🚀</span>
                    Promoted
                  </span>
                }
              </div>
              <p class="mt-1 text-[15px] text-gray-400">Last updated on: {{ listing().lastUpdated }}</p>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              (click)="showPromoteListingModal.set(true)"
              class="inline-flex items-center gap-2 rounded-full bg-[#5E44EE] px-6 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(94,68,238,0.28)] transition-colors hover:bg-[#5036e1]"
            >
              <ng-icon name="heroRocketLaunch" class="text-base"></ng-icon>
              Promote listing
            </button>

            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-[#1A1C21] shadow-sm transition-colors hover:bg-gray-50"
            >
              <span>Status: <span class="font-medium text-[#F59E0B]">{{ listing().status }}</span></span>
              <ng-icon name="heroChevronDown" class="text-base text-gray-400"></ng-icon>
            </button>

            <button
              type="button"
              class="inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-700"
              aria-label="Listing actions"
            >
              <ng-icon name="heroEllipsisHorizontal" class="text-xl"></ng-icon>
            </button>
          </div>
        </div>

        <div class="mb-7 flex items-center gap-8 border-b border-gray-100">
          @for (tab of tabs; track tab.id) {
            <button
              type="button"
              (click)="activeTab.set(tab.id)"
              class="relative flex items-center gap-2 pb-4 text-[15px] font-medium transition-colors"
              [class.text-[#5E44EE]]="activeTab() === tab.id"
              [class.text-gray-400]="activeTab() !== tab.id"
            >
              <ng-icon [name]="tab.icon" class="text-base"></ng-icon>
              {{ tab.label }}
              @if (activeTab() === tab.id) {
                <span class="absolute bottom-[-1px] left-0 right-0 h-0.5 rounded-full bg-[#5E44EE]"></span>
              }
            </button>
          }
        </div>

        @if (activeTab() === 'overview') {
          <div class="space-y-8">
            <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              @for (image of listing().gallery; track image.src) {
                <button
                  type="button"
                  (click)="activeImage.set(image.src)"
                  class="relative overflow-hidden rounded-[22px] bg-[#F5F5F7] transition-all"
                  [class.ring-2]="activeImage() === image.src"
                  [class.ring-[#5E44EE]]="activeImage() === image.src"
                >
                  <div class="relative aspect-[1/1.15] w-full">
                    <img [src]="image.src" [alt]="image.alt" class="h-full w-full object-cover">
                  </div>
                </button>
              }
            </div>

            <div class="grid gap-8 xl:grid-cols-[minmax(0,1fr)_330px]">
              <div class="space-y-8">
                <div>
                  <h2 class="text-[26px] font-semibold tracking-tight text-[#1A1C21]">{{ listing().name }}</h2>
                  <div class="mt-2 flex items-center gap-2 text-[15px] text-gray-500">
                    <ng-icon name="heroMapPin" class="text-base"></ng-icon>
                    {{ listing().location }}
                  </div>
                </div>

                <div class="grid gap-4 rounded-[24px] border border-gray-100 p-5 md:grid-cols-4">
                  <div class="space-y-2">
                    <p class="text-[13px] text-gray-400">Date posted</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroCalendarDays" class="text-base text-gray-400"></ng-icon>
                      {{ listing().datePosted }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Messages</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroChatBubbleLeftRight" class="text-base text-gray-400"></ng-icon>
                      {{ listing().messages }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Views</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroEye" class="text-base text-gray-400"></ng-icon>
                      {{ listing().views }}
                    </div>
                  </div>
                  <div class="space-y-2 border-gray-100 md:border-l md:pl-5">
                    <p class="text-[13px] text-gray-400">Saves</p>
                    <div class="flex items-center gap-2 text-[15px] font-medium text-[#1A1C21]">
                      <ng-icon name="heroHeart" class="text-base text-gray-400"></ng-icon>
                      {{ listing().saves }}
                    </div>
                  </div>
                </div>

                <div class="border-b border-gray-100 pb-8">
                  <h3 class="mb-4 text-[17px] font-semibold text-[#1A1C21]">Description</h3>
                  <p class="max-w-3xl text-[15px] leading-8 text-gray-600">
                    {{ listing().description }}
                  </p>
                  <button type="button" class="mt-2 text-[15px] font-medium text-[#1A1C21] underline underline-offset-4">
                    Show more
                  </button>
                </div>

                <div>
                  <h3 class="mb-6 text-[17px] font-semibold text-[#1A1C21]">General details</h3>
                  <div class="grid gap-y-6 md:grid-cols-[220px_minmax(0,1fr)]">
                    @for (detail of details(); track detail.label) {
                      <div class="text-[15px] text-gray-400">{{ detail.label }}</div>
                      <div class="text-[15px] font-medium text-[#1A1C21]">{{ detail.value }}</div>
                    }
                  </div>
                </div>
              </div>

              <aside class="space-y-6">
                <div class="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm">
                  <div class="flex items-start justify-between border-b border-gray-100 pb-5">
                    <div>
                      <p class="mb-2 text-[13px] text-gray-400">Price</p>
                      <p class="text-[21px] font-semibold text-[#1A1C21]">₦{{ listing().price }}</p>
                    </div>
                    <button type="button" class="text-gray-500 transition-colors hover:text-gray-700" aria-label="Edit listing price">
                      <ng-icon name="heroTag" class="text-xl"></ng-icon>
                    </button>
                  </div>

                  <div class="pt-5">
                    <p class="mb-4 text-[13px] text-gray-400">Store</p>
                    <div class="flex items-center justify-between gap-4">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-[#E7F1EA]">
                          <img [src]="listing().store.logo" [alt]="listing().store.name" class="h-full w-full object-cover">
                        </div>
                        <div class="flex items-center gap-1.5">
                          <span class="text-[15px] font-medium text-[#1A1C21]">{{ listing().store.name }}</span>
                          <span class="text-[#5E44EE]">✦</span>
                        </div>
                      </div>
                      <button type="button" class="text-gray-500 transition-colors hover:text-gray-700" aria-label="Open store">
                        <ng-icon name="heroArrowTopRightOnSquare" class="text-xl"></ng-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        }

        @if (activeTab() === 'requests') {
          <div class="space-y-4">
            <div class="rounded-[24px] border border-gray-100 bg-[#FAFAFA] p-5">
              <h3 class="text-[17px] font-semibold text-[#1A1C21]">Buyer requests</h3>
              <p class="mt-1 text-[14px] text-gray-400">Incoming questions and offers for this listing.</p>
            </div>

            @for (request of requests(); track request.id) {
              <div class="rounded-[24px] border border-gray-100 p-5 transition-colors hover:bg-gray-50">
                <div class="flex items-start justify-between gap-4">
                  <div class="flex items-start gap-3">
                    <div class="h-11 w-11 overflow-hidden rounded-full bg-gray-100">
                      <img [src]="request.avatar" [alt]="request.buyer" class="h-full w-full object-cover">
                    </div>
                    <div>
                      <div class="flex items-center gap-2">
                        <p class="text-[15px] font-medium text-[#1A1C21]">{{ request.buyer }}</p>
                        <span
                          class="rounded-full px-2 py-1 text-[10px] font-medium"
                          [class.bg-[#EEFCEB]]="request.status === 'New'"
                          [class.text-[#2F9E44]]="request.status === 'New'"
                          [class.bg-[#F4F3FF]]="request.status === 'Responded'"
                          [class.text-[#5E44EE]]="request.status === 'Responded'"
                        >
                          {{ request.status }}
                        </span>
                      </div>
                      <p class="mt-1 text-[14px] leading-6 text-gray-500">{{ request.message }}</p>
                      <div class="mt-3 flex items-center gap-6 text-[13px] text-gray-400">
                        <span>{{ request.time }}</span>
                        <span>Offer: {{ request.offer }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            }
          </div>
        }

        @if (activeTab() === 'activities') {
          <div class="space-y-4">
            <div class="rounded-[24px] border border-gray-100 bg-[#FAFAFA] p-5">
              <h3 class="text-[17px] font-semibold text-[#1A1C21]">Listing activities</h3>
              <p class="mt-1 text-[14px] text-gray-400">Recent actions and changes made on this listing.</p>
            </div>

            @for (activity of activities(); track activity.id) {
              <div class="rounded-[24px] border border-gray-100 p-5 transition-colors hover:bg-gray-50">
                <div class="flex items-start gap-4">
                  <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F4F3FF] text-[#5E44EE]">
                    <ng-icon name="heroClipboardDocumentList" class="text-lg"></ng-icon>
                  </div>
                  <div>
                    <p class="text-[15px] font-medium text-[#1A1C21]">{{ activity.title }}</p>
                    <p class="mt-1 text-[14px] leading-6 text-gray-500">{{ activity.description }}</p>
                    <p class="mt-3 text-[13px] text-gray-400">{{ activity.time }}</p>
                  </div>
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>

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

  protected readonly listingId = computed(() => this.route.snapshot.paramMap.get('id') ?? '1');
  protected readonly activeTab = signal<'overview' | 'requests' | 'activities'>('overview');
  protected readonly showPromoteListingModal = signal(false);

  protected readonly listing = signal({
    id: this.listingId(),
    name: 'Iphone 17 pro max',
    previewImage: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=240&h=240&fit=crop',
    lastUpdated: '24 January, 2026',
    isPromoted: true,
    status: 'Available',
    location: 'Ikeja, Lagos',
    datePosted: '14 Feb, 2026',
    messages: 12,
    views: '3,990',
    saves: 200,
    price: '2,500,000',
    description: 'UK used iPhone 17, neatly used and fully working. Clean screen, smooth performance, and good battery health. No repairs, no issues. Minor signs of use. Battery health is strong and the device comes exactly as shown in the photos.',
    gallery: [
      {
        src: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=700&h=820&fit=crop',
        alt: 'Iphone front view',
      },
      {
        src: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=700&h=820&fit=crop',
        alt: 'Iphone camera close up',
      },
      {
        src: 'https://images.unsplash.com/photo-1603919114330-22c608149887?w=700&h=820&fit=crop',
        alt: 'Iphone in the box',
      },
      {
        src: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=700&h=820&fit=crop',
        alt: 'Iphone display image',
      },
      {
        src: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=700&h=820&fit=crop',
        alt: 'Iphone angled view',
      },
      {
        src: 'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=700&h=820&fit=crop',
        alt: 'Iphone side angle',
      },
    ],
    store: {
      name: 'The Vine Collections',
      logo: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    },
  });

  protected readonly activeImage = signal(this.listing().gallery[0].src);

  protected readonly tabs = [
    { id: 'overview' as const, label: 'Overview', icon: 'heroSquare3Stack3d' },
    { id: 'requests' as const, label: 'Requests', icon: 'heroChatBubbleLeftRight' },
    { id: 'activities' as const, label: 'Activities', icon: 'heroClipboardDocumentList' },
  ];

  protected readonly details = computed(() => [
    { label: 'Category', value: 'Electronics/Phones & Tablets' },
    { label: 'Condition', value: 'Used' },
    { label: 'Location', value: 'Ikeja, Lagos' },
    { label: 'Delivery options', value: 'Nationwide' },
    { label: 'WhatsApp number', value: '08169397454' },
    { label: 'Call number', value: '08169397454' },
    { label: 'Accept offers', value: 'Yes' },
  ]);

  protected readonly requests = signal<SellerListingRequest[]>([
    {
      id: 'r1',
      buyer: 'John Okafor',
      avatar: 'https://i.pravatar.cc/100?u=john-okafor',
      message: 'Hi, is this still available? I would like to know if you can do a better price.',
      time: 'Today, 7:50 pm',
      offer: '₦2,350,000',
      status: 'New',
    },
    {
      id: 'r2',
      buyer: 'Amaka Eze',
      avatar: 'https://i.pravatar.cc/100?u=amaka-eze',
      message: 'Can you deliver to Lekki tomorrow morning? I am interested and ready to pay immediately.',
      time: 'Yesterday, 5:12 pm',
      offer: '₦2,500,000',
      status: 'Responded',
    },
  ]);

  protected readonly activities = signal<SellerListingActivity[]>([
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

  protected markListingAsPromoted() {
    this.listing.update((listing) => ({
      ...listing,
      isPromoted: true,
    }));
  }
}
