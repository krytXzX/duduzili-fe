import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { heroChevronRight } from '@ng-icons/heroicons/outline';
import { AddListingModalComponent } from '../../components/listings/add-listing-modal.component';
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
    StoreHeaderComponent,
    StoreTabsComponent,
    StoreProductsComponent,
    StoreReviewsComponent,
    StoreEditSidePanelComponent,
    AddListingModalComponent
  ],
  providers: [
    provideIcons({ heroChevronRight })
  ],
  template: `
    <div class="max-w-7xl mx-auto">
      @if (store(); as s) {
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
      }

      <!-- Side panel for editing -->
      @if (showEditModal()) {
        <app-store-edit-side-panel
          [store]="store()" 
          (close)="showEditModal.set(false)"
          (save)="onSaveStore($event)"
        ></app-store-edit-side-panel>
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

  activeTab = signal('listings');
  showEditModal = signal(false);
  showAddListingModal = signal(false);
  
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
}
