import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronLeft, heroChevronRight, heroPencil, heroStar, heroChevronDown } from '@ng-icons/heroicons/outline';
import { AddListingModalComponent } from '../../components/listings/add-listing-modal.component';
import { PromoteListingModalComponent } from '../../components/listings/promote-listing-modal.component';
import { ListingCardComponent } from '../../components/listings/listing-card.component';
import { Listing } from '../../components/listings/listing-card.component';
import { Review } from '../../components/product/review-card.component';
import { StoreEditSidePanelComponent } from '../../components/stores/store-edit-side-panel.component';
import { StoreHeaderComponent } from '../../components/stores/store-header.component';
import { StoreProductsComponent } from '../../components/stores/store-products.component';
import { StoreReviewsComponent } from '../../components/stores/store-reviews.component';
import { StoreTabsComponent } from '../../components/stores/store-tabs.component';

@Component({
  selector: 'app-store-details-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIcon,
    ListingCardComponent,
    PromoteListingModalComponent,
    StoreHeaderComponent,
    StoreTabsComponent,
    StoreProductsComponent,
    StoreReviewsComponent,
    StoreEditSidePanelComponent,
    AddListingModalComponent
  ],
  providers: [
    provideIcons({ heroChevronRight, heroChevronLeft, heroPencil, heroStar, heroChevronDown })
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      @if (store(); as s) {
        <div class="md:hidden">
          <div class="flex items-center gap-3 px-5 pt-2">
            <a routerLink="/my-stores" class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F6F7FA] text-[#202335]">
              <ng-icon name="heroChevronLeft" class="text-[16px]"></ng-icon>
            </a>
            <h1 class="text-[18px] font-semibold tracking-[-0.03em] text-[#202335]">Store information</h1>
          </div>

          <section class="px-5 pt-5 text-[#202335]">
            <div class="overflow-hidden rounded-[18px] border border-[#ECEEF4] bg-white shadow-[0_10px_20px_-22px_rgba(31,36,48,0.4)]">
              <div class="h-[64px] overflow-hidden bg-[#F4F5F8]">
                <img [src]="s.banner" [alt]="s.name" class="h-full w-full object-cover">
              </div>

              <div class="relative px-4 pb-4">
                <div class="flex items-end justify-between gap-3">
                  <div class="relative -mt-6 h-14 w-14 overflow-hidden rounded-full border-4 border-white bg-white shadow-sm">
                    <img [src]="s.logo" [alt]="s.name" class="h-full w-full object-cover">
                  </div>

                  <div class="mt-3 flex items-center gap-2">
                    <button type="button" (click)="openEditModal()" class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-sm">
                      <ng-icon name="heroPencil" class="text-[14px]"></ng-icon>
                    </button>
                    <button type="button" (click)="showPromoteStoreModal.set(true)" class="rounded-full bg-[#6F56F6] px-4 py-2 text-[11px] font-medium text-white shadow-[0_16px_24px_-18px_rgba(111,86,246,0.95)]">
                      Promote
                    </button>
                  </div>
                </div>

                <div class="mt-2">
                  <div class="flex items-center gap-1">
                    <h2 class="text-[15px] font-medium">{{ s.name }}</h2>
                    @if (s.isVerified) {
                      <span class="text-[13px] text-blue-500">●</span>
                    }
                  </div>
                  <p class="mt-1 text-[10px] text-[#8A8F9A]">Ikeja, Lagos</p>
                </div>

                <div class="mt-4 grid grid-cols-4 gap-3 border-t border-[#EEF0F4] pt-3 text-center">
                  <div>
                    <p class="text-[9px] text-[#8A8F9A]">Followers</p>
                    <p class="mt-1 text-[11px] font-medium">{{ s.followers }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-[#8A8F9A]">Products</p>
                    <p class="mt-1 text-[11px] font-medium">{{ s.products }}</p>
                  </div>
                  <div>
                    <p class="text-[9px] text-[#8A8F9A]">Rating</p>
                    <p class="mt-1 text-[11px] font-medium">{{ s.rating }} <span class="text-yellow-400">★</span></p>
                  </div>
                  <div>
                    <p class="text-[9px] text-[#8A8F9A]">Date joined</p>
                    <p class="mt-1 text-[11px] font-medium">{{ s.dateCreated }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-5 flex items-center gap-5 border-b border-[#ECEEF4] text-[12px]">
              <button type="button" (click)="activeTab.set('listings')" class="border-b-2 pb-3 font-medium"
                [class.border-[#6F56F6]]="activeTab() === 'listings'"
                [class.text-[#6F56F6]]="activeTab() === 'listings'"
                [class.border-transparent]="activeTab() !== 'listings'"
                [class.text-[#8A8F9A]]="activeTab() !== 'listings'">
                Products
              </button>
              <button type="button" (click)="activeTab.set('reviews')" class="border-b-2 pb-3 font-medium"
                [class.border-[#6F56F6]]="activeTab() === 'reviews'"
                [class.text-[#6F56F6]]="activeTab() === 'reviews'"
                [class.border-transparent]="activeTab() !== 'reviews'"
                [class.text-[#8A8F9A]]="activeTab() !== 'reviews'">
                Reviews
              </button>
            </div>

            @if (activeTab() === 'listings') {
              @if (products().length === 0) {
                <section class="flex min-h-[420px] flex-col items-center justify-center pb-8 pt-8 text-center">
                  <div class="relative mb-6 h-[150px] w-[190px]">
                    <div class="absolute left-5 top-7 h-[96px] w-[72px] rotate-[-16deg] rounded-[18px] bg-white/70 shadow-[0_16px_30px_-26px_rgba(25,30,40,0.35)] ring-1 ring-[#F1F2F6]"></div>
                    <div class="absolute right-5 top-7 h-[96px] w-[72px] rotate-[16deg] rounded-[18px] bg-white/70 shadow-[0_16px_30px_-26px_rgba(25,30,40,0.35)] ring-1 ring-[#F1F2F6]"></div>
                    <div class="absolute left-1/2 top-2 flex h-[110px] w-[84px] -translate-x-1/2 flex-col rounded-[20px] bg-white shadow-[0_20px_36px_-30px_rgba(25,30,40,0.45)] ring-1 ring-[#ECEEF4]">
                      <div class="flex items-start justify-between px-3 pt-3">
                        <div class="h-2 w-8 rounded-full bg-[#F0F1F5]"></div>
                        <span class="text-[10px] text-[#2B2D36]">♥</span>
                      </div>
                      <div class="mt-2 flex flex-1 items-center justify-center">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F3F4F8] text-[#B6BAC6]">
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path d="M10 10a3 3 0 100-6 3 3 0 000 6zm-6 6.25A4.25 4.25 0 018.25 12h3.5A4.25 4.25 0 0116 16.25V17H4v-.75z"/>
                          </svg>
                        </div>
                      </div>
                      <div class="space-y-2 px-4 pb-4">
                        <div class="h-1.5 rounded-full bg-[#F0F1F5]"></div>
                        <div class="mx-auto h-1.5 w-10 rounded-full bg-[#F5F6F9]"></div>
                      </div>
                    </div>
                  </div>

                  <h2 class="text-[18px] font-medium leading-8 tracking-[-0.03em] text-[#202335]">Looks a little empty here 👀</h2>
                  <p class="mt-2 max-w-[260px] text-[11px] leading-5 text-[#7A7F8C]">
                    Add a listing so buyers can see what you’re selling and reach out.
                  </p>

                  <button type="button" (click)="showAddListingModal.set(true)" class="mt-6 rounded-full bg-[#6F56F6] px-6 py-3 text-[12px] font-medium text-white shadow-[0_18px_30px_-18px_rgba(111,86,246,0.95)]">
                    Sell an item
                  </button>
                </section>
              } @else {
                <div class="mt-4 flex gap-2 overflow-x-auto pb-2">
                  @for (filter of mobileStoreFilters(); track filter) {
                    <button type="button" class="whitespace-nowrap rounded-full px-4 py-2 text-[11px] font-medium"
                      [class.bg-[#202335]]="mobileStoreFilter() === filter"
                      [class.text-white]="mobileStoreFilter() === filter"
                      [class.bg-[#F3F4F7]]="mobileStoreFilter() !== filter"
                      [class.text-[#202335]]="mobileStoreFilter() !== filter"
                      (click)="mobileStoreFilter.set(filter)">
                      {{ filter }}
                    </button>
                  }
                </div>

                <div class="mt-4 space-y-6">
                  @for (group of mobileProductGroups(); track group.name) {
                    <section>
                      <div class="mb-3 flex items-center justify-between">
                        <h3 class="text-[13px] font-medium">{{ group.name }}</h3>
                        <button type="button" class="inline-flex items-center gap-1 text-[10px] font-medium text-[#202335]">
                          View all ({{ group.items.length }})
                          <ng-icon name="heroChevronRight" class="text-[12px]"></ng-icon>
                        </button>
                      </div>

                      <div class="grid grid-cols-2 gap-3">
                        @for (product of group.items; track product.id) {
                          <app-listing-card [listing]="product" [listingRoute]="['/listings']" [showFavorite]="false"></app-listing-card>
                        }
                      </div>
                    </section>
                  }
                </div>
              }
            }

            @if (activeTab() === 'reviews') {
              <section class="space-y-5 pt-4">
                <div class="rounded-[18px] bg-white p-4 shadow-[0_10px_20px_-22px_rgba(31,36,48,0.4)]">
                  <div class="grid grid-cols-[auto_1fr] gap-4">
                    <div>
                      <p class="text-[28px] font-semibold leading-none">4.57<span class="text-[18px] text-[#B4B8C2]">/5</span></p>
                      <div class="mt-2 flex gap-1 text-yellow-400">
                        @for (star of [1,2,3,4,5]; track star) {
                          <ng-icon name="heroStar" class="fill-current text-[12px]"></ng-icon>
                        }
                      </div>
                    </div>
                    <div>
                      <p class="text-[11px] font-medium">Overall rating</p>
                      <div class="mt-2 space-y-2">
                        @for (bar of reviewDistribution; track bar.stars) {
                          <div class="grid grid-cols-[18px_1fr_26px] items-center gap-2 text-[9px] text-[#8A8F9A]">
                            <span>{{ bar.stars }} ★</span>
                            <div class="h-1.5 rounded-full bg-[#EEF0F4]">
                              <div class="h-1.5 rounded-full bg-[#202335]" [style.width.%]="bar.percentage"></div>
                            </div>
                            <span>{{ bar.percentage }}%</span>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <h3 class="text-[13px] font-medium">215 reviews</h3>
                  <button type="button" class="inline-flex items-center gap-1 rounded-full bg-[#F3F4F7] px-3 py-2 text-[10px] font-medium text-[#202335]">
                    Most recent
                    <ng-icon name="heroChevronDown" class="text-[12px]"></ng-icon>
                  </button>
                </div>

                <div>
                  <p class="text-[11px] font-medium">This listing is great at..</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    @for (tag of reviewTags; track tag.label) {
                      <span class="rounded-full bg-[#F7F8FA] px-3 py-2 text-[10px] text-[#5F6470]">
                        {{ tag.label }} ({{ tag.count }})
                      </span>
                    }
                  </div>
                </div>

                <div class="space-y-5 pb-8">
                  @for (review of reviews(); track review.author) {
                    <article class="border-b border-[#ECEEF4] pb-4">
                      <div class="flex items-center gap-3">
                        <div class="h-9 w-9 overflow-hidden rounded-full bg-[#F3F4F7]">
                          <img [src]="review.avatar || fallbackAvatar" [alt]="review.author" class="h-full w-full object-cover">
                        </div>
                        <div>
                          <h4 class="text-[12px] font-medium">{{ review.author }}</h4>
                          <div class="mt-1 flex items-center gap-2 text-[9px] text-[#8A8F9A]">
                            <span>{{ review.date }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="mt-2 flex gap-1 text-[#202335]">
                        @for (filled of reviewStars(review.rating); track $index) {
                          <span class="text-[10px]">{{ filled ? '★' : '☆' }}</span>
                        }
                      </div>

                      <p class="mt-3 text-[11px] leading-5 text-[#4C5160]">{{ review.text }}</p>

                      @if (review.images?.length) {
                        <div class="mt-3 flex gap-2 overflow-x-auto">
                          @for (image of review.images; track image) {
                            <img [src]="image" alt="" class="h-12 w-12 rounded-[10px] object-cover">
                          }
                        </div>
                      }
                    </article>
                  }
                </div>
              </section>
            }
          </section>
        </div>

        <div class="hidden md:block">
        <!-- Breadcrumbs -->
        <nav class="flex items-center gap-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-6 px-1">
          <a routerLink="/my-stores" class="hover:text-purple-600 transition-colors">My Stores</a>
          <span class="text-gray-300">/</span>
          <span class="text-gray-900">{{ s.name }}</span>
        </nav>

        <app-store-header 
          [banner]="s.banner" 
          [logo]="s.logo" 
          [name]="s.name" 
          [isVerified]="s.isVerified"
          [products]="s.products"
          [followers]="s.followers"
          [rating]="s.rating"
          [dateCreated]="s.dateCreated"
          [isOwner]="isOwner()"
          (edit)="openEditModal()"
          (sellItem)="showAddListingModal.set(true)"
        ></app-store-header>

        <app-store-tabs 
          [activeTab]="activeTab()" 
          (tabChange)="activeTab.set($event)"
        ></app-store-tabs>

        <div class="mt-8 transition-all duration-300">
          @switch (activeTab()) {
            @case ('listings') {
              <app-store-products 
                [products]="products()" 
                [isOwner]="isOwner()" 
                (addListing)="showAddListingModal.set(true)"
              ></app-store-products>
            }
            @case ('reviews') {
              <app-store-reviews [averageRating]="s.rating" [reviews]="reviews()"></app-store-reviews>
            }
            @case ('feed') {
               <div class="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
                  <div class="mb-6 flex items-center justify-center">
                     <img src="/assets/images/empty_state.svg" alt="Empty state" class="w-40 h-40">
                  </div>
                  <h3 class="text-[19px] font-bold text-gray-900 mb-1">No feed items yet</h3>
                  <p class="text-gray-400 text-[13px]">Stay tuned for updates from {{ s.name }}</p>
               </div>
            }
          }
        </div>
        </div>
      }

      <!-- Side panel for editing -->
      @if (showEditModal()) {
        <app-store-edit-side-panel
          [store]="store()" 
          (close)="showEditModal.set(false)"
          (save)="onSaveStore($event)"
        ></app-store-edit-side-panel>
      }

      @if (showPromoteStoreModal()) {
        <app-promote-listing-modal
          promoteTarget="store"
          (close)="showPromoteStoreModal.set(false)"
          (promoted)="showPromoteStoreModal.set(false)"
        ></app-promote-listing-modal>
      }

      <!-- Modal for adding listings -->
      @if (showAddListingModal()) {
        <app-add-listing-modal 
          (close)="showAddListingModal.set(false)"
          (save)="onPublishListing($event)"
        ></app-add-listing-modal>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreDetailsDashboardComponent {
  private route = inject(ActivatedRoute);
  protected readonly fallbackAvatar = 'https://i.pravatar.cc/150?u=fallback-reviewer';

  activeTab = signal('listings');
  showEditModal = signal(false);
  showAddListingModal = signal(false);
  showPromoteStoreModal = signal(false);
  mobileStoreFilter = signal('All');
  
  isOwner = signal(true);

  store = signal<any>({
    id: '1',
    name: 'The Vine Collections',
    logo: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
    banner: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&h=400&fit=crop',
    isVerified: true,
    products: '1,456',
    sales: '10.2k',
    followers: '2.5k',
    rating: '4.8',
    dateCreated: '16 Feb, 2024',
    whatsappNumber: '+2348012345678',
    callNumber: '+2348012345678',
    location: 'Ikeja, Lagos',
    email: 'contact@vinecollections.com'
  });

  products = signal<Listing[]>([
    {
      id: 'p1',
      title: 'iPhone 15 Pro Max - 256GB - Blue Titanium',
      price: '₦1,850,000',
      images: ['https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop'],
      location: 'Ikeja, Lagos',
      timeAgo: '2 hours ago',
      isVerified: true,
      category: 'Mobiles'
    } as any,
    {
      id: 'p2',
      title: 'iPhone 14 Pro - 128GB - Deep Purple',
      price: '₦1,250,000',
      images: ['https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=400&h=400&fit=crop'],
      location: 'Ikeja, Lagos',
      timeAgo: '5 hours ago',
      isVerified: true,
      category: 'Mobiles'
    } as any,
    {
      id: 'p3',
      title: 'iPad Pro 12.9 M2 Chip - 512GB',
      price: '₦1,450,000',
      images: ['https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop'],
      location: 'Ikeja, Lagos',
      timeAgo: '1 day ago',
      category: 'iPads'
    } as any,
    {
      id: 'p4',
      title: 'Mercedes Benz GLE 450 - 2024 Model',
      price: '₦145,000,000',
      images: ['https://images.unsplash.com/photo-1614162692292-7ac56d777ac1?w=400&h=400&fit=crop'],
      location: 'Ikeja, Lagos',
      timeAgo: '3 hours ago',
      isVerified: true,
      category: 'Cars'
    } as any,
    {
      id: 'p5',
      title: 'Toyota Camry XSE - 2023 Model',
      price: '₦45,000,000',
      images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=400&fit=crop'],
      location: 'Victoria Island, Lagos',
      timeAgo: '1 day ago',
      category: 'Cars'
    } as any
  ]);


  reviews = signal<Review[]>([
    {
      author: 'Amaka Eze',
      avatar: 'https://i.pravatar.cc/150?u=amaka',
      rating: 5,
      text: 'I bought the iPhone 15 Pro Max from this store and the experience was seamless. The packaging was top-notch and the delivery was faster than expected. Communication with the vendor was also very professional.',
      date: 'August 14, 2025',
      images: [
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1696426319110-388902506b72?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1695200388933-722102143cc9?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1695653422718-97d25c1abc19?w=400&h=400&fit=crop'
      ]
    },
    {
      author: 'Tunde Afolayan',
      avatar: 'https://i.pravatar.cc/150?u=tunde',
      rating: 4,
      text: 'Good pricing and quality products. Happy with my purchase.',
      date: 'July 28, 2025'
    }
  ]);

  protected readonly mobileStoreFilters = computed(() => {
    const categories = Array.from(
      new Set(this.products().map((product) => ((product as Listing & { category?: string }).category ?? 'Other'))),
    );

    return ['All', ...categories];
  });

  protected readonly mobileProductGroups = computed(() => {
    const selectedFilter = this.mobileStoreFilter();
    const items = selectedFilter === 'All'
      ? this.products()
      : this.products().filter((product) => ((product as Listing & { category?: string }).category ?? 'Other') === selectedFilter);

    const grouped = new Map<string, Listing[]>();
    for (const product of items) {
      const category = ((product as Listing & { category?: string }).category ?? 'Other');
      const existing = grouped.get(category) ?? [];
      existing.push(product);
      grouped.set(category, existing);
    }

    return Array.from(grouped.entries()).map(([name, groupedItems]) => ({
      name,
      items: groupedItems,
    }));
  });

  protected readonly reviewDistribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 9 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 },
  ] as const;

  protected readonly reviewTags = [
    { label: 'Fast response', count: 16 },
    { label: 'Friendly', count: 7 },
    { label: 'Smooth transaction', count: 7 },
    { label: 'On-time delivery', count: 7 },
    { label: 'Honest pricing', count: 7 },
  ] as const;

  constructor() {}

  openEditModal() {
    this.showEditModal.set(true);
  }

  onSaveStore(updatedStore: any) {
    this.store.update(prev => ({ ...prev, ...updatedStore }));
    this.showEditModal.set(false);
  }

  onPublishListing(data: any) {
    const newProduct: Listing = {
      id: 'p' + (this.products().length + 1),
      title: data.name,
      price: data.currency === 'NGN' ? `₦${data.price.toLocaleString()}` : `$${data.price.toLocaleString()}`,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop'],
      location: this.store().location,
      timeAgo: 'Just now',
      isVerified: true
    };
    this.products.update(p => [newProduct, ...p]);
    this.showAddListingModal.set(false);
  }

  protected reviewStars(rating: number): boolean[] {
    return Array.from({ length: 5 }, (_, index) => index < rating);
  }
}
