import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroCheckBadge, 
  heroPlus, 
  heroFunnel, 
  heroMagnifyingGlass, 
  heroChevronLeft, 
  heroChevronRight,
  heroEllipsisVertical
} from '@ng-icons/heroicons/outline';
import { AddListingModalComponent } from '../../components/listings/add-listing-modal.component';
import { IdentityVerificationModalComponent } from '../../components/listings/identity-verification-modal.component';
import { VerificationDetailsModalComponent } from '../../components/listings/verification-details-modal.component';

interface Listing {
  id: string;
  name: string;
  category: string;
  price: number;
  store: string;
  status: 'Available' | 'Sold' | 'Draft' | 'Paused' | 'Suspended' | 'Expired';
  image: string;
}

@Component({
  selector: 'app-listings-page',
  imports: [CommonModule, NgIcon, NgOptimizedImage, RouterLink, AddListingModalComponent, IdentityVerificationModalComponent, VerificationDetailsModalComponent],
  providers: [
    provideIcons({ 
      heroCheckBadge, 
      heroPlus, 
      heroFunnel, 
      heroMagnifyingGlass, 
      heroChevronLeft, 
      heroChevronRight,
      heroEllipsisVertical
    })
  ],
  template: `
    <div class="max-w-6xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-[21px] font-bold text-gray-900">Listings</h1>
        <button (click)="showAddListingModal.set(true)" class="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-sm">
          <ng-icon name="heroPlus"></ng-icon>
          Sell item
        </button>
      </div>

      <!-- Trust Banner / Verification Under Review Banner -->
      @if (!isVerificationSubmitted()) {
        <div class="bg-linear-to-r from-purple-50 to-pink-50 rounded-3xl p-8 mb-8 flex items-center justify-between relative overflow-hidden border border-purple-100/50">
          <div class="relative z-10 max-w-md">
            <h2 class="text-[19px] font-bold text-gray-900 mb-2">Build trust. Get more buyers</h2>
            <p class="text-sm text-gray-600 mb-6 leading-relaxed">Verified sellers rank higher and attract more inquiries.</p>
            <button 
              (click)="showIdentityModal.set(true)"
              class="flex items-center gap-2 text-purple-600 font-bold hover:gap-3 transition-all group"
            >
              Verify my account 
              <span class="group-hover:translate-x-1 transition-transform">→</span>
            </button>
          </div>
          <div class="hidden md:block">
            <!-- Placeholder for verification illustration -->
            <div class="w-32 h-32 bg-white/50 rounded-2xl flex items-center justify-center shadow-sm backdrop-blur-sm border border-white">
               <ng-icon name="heroCheckBadge" class="text-6xl text-purple-600/20"></ng-icon>
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>
      } @else {
        <div class="bg-linear-to-r from-[#FFFBF0] to-[#FFF6DA] rounded-3xl p-8 mb-8 flex items-center justify-between relative overflow-hidden border border-yellow-100/50">
          <div class="relative z-10 max-w-lg">
            <h2 class="text-[19px] font-bold text-gray-900 mb-2">Verification under review</h2>
            <p class="text-sm text-gray-600 mb-6 leading-relaxed">Our team is reviewing your documents. You'll be notified within 24–48 hours.</p>
            <button 
              (click)="showVerificationDetailsModal.set(true)"
              class="bg-white text-gray-900 px-6 py-2.5 rounded-full text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 border border-gray-100"
            >
              View submission
            </button>
          </div>
          <div class="hidden md:block absolute right-0 top-0 bottom-0 w-1/3">
            <div class="relative h-full w-full">
               <img 
                 ngSrc="/Users/dev/.gemini/antigravity/brain/b80227d6-2ef9-4ea6-9af2-40360d55ea38/verification_under_review_illustration_1775037629662.png" 
                 width="240" 
                 height="240" 
                 class="absolute right-4 top-1/2 -translate-y-1/2 object-contain"
                 alt="Verification under review"
               >
            </div>
          </div>
          <!-- Decorative elements -->
          <div class="absolute -right-8 -bottom-8 w-48 h-48 bg-yellow-200/20 rounded-full blur-3xl"></div>
        </div>
      }

      <!-- Stats Grid -->
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        @for (stat of stats(); track stat.label) {
          <div 
            class="bg-white p-5 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all cursor-pointer group"
            [class.ring-2]="stat.active"
            [class.ring-purple-100]="stat.active"
          >
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{{stat.label}}</p>
            <p class="text-[21px] font-bold text-gray-900 group-hover:text-purple-600 transition-colors">{{stat.value}}</p>
          </div>
        }
      </div>

      <!-- Filters & Search -->
      <div class="bg-white p-4 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-4 mb-6 shadow-sm">
        <div class="flex flex-wrap gap-2 flex-1">
          <button class="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
            Categories
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
            Store
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
          <button class="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors flex items-center gap-2">
            Status
            <svg class="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
        <div class="relative w-full md:w-64">
          <div class="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <ng-icon name="heroMagnifyingGlass" class="text-gray-400"></ng-icon>
          </div>
          <input 
            type="text" 
            placeholder="Search" 
            class="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all"
          >
        </div>
      </div>

      <!-- Listings Content -->
      @if (listings().length > 0) {
        <div class="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <table class="w-full text-left">
            <thead>
              <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase tracking-widest font-semibold">
                <th class="px-6 py-4 w-12"><input type="checkbox" class="rounded border-gray-300"></th>
                <th class="px-6 py-4">Name</th>
                <th class="px-6 py-4">Category</th>
                <th class="px-6 py-4 text-right">Price</th>
                <th class="px-6 py-4">Store</th>
                <th class="px-6 py-4">Status</th>
                <th class="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (item of listings(); track item.id) {
                <tr 
                  (click)="viewListing(item.id)"
                  class="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                >
                  <td class="px-6 py-4" (click)="$event.stopPropagation()">
                    <input type="checkbox" class="rounded border-gray-300">
                  </td>
                  <td class="px-6 py-4">
                    <a [routerLink]="['/listings', item.id]" 
                       (click)="$event.stopPropagation()"
                       class="flex items-center gap-3 group/link">
                      <div class="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden relative shadow-sm group-hover:shadow-md transition-shadow">
                        <img [src]="item.image" [alt]="item.name" class="object-cover w-full h-full group-hover/link:scale-110 transition-transform duration-500">
                      </div>
                      <span class="text-sm font-semibold text-gray-900 group-hover/link:text-purple-600 transition-colors">{{item.name}}</span>
                    </a>
                  </td>
                  <td class="px-6 py-4 text-xs text-gray-500">{{item.category}}</td>
                  <td class="px-6 py-4 text-sm font-bold text-gray-900 text-right">₦{{item.price | number:'1.2-2'}}</td>
                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2">
                       <div class="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-[8px] font-bold text-purple-600 overflow-hidden">
                         {{item.store.charAt(0)}}
                       </div>
                       <span class="text-xs text-gray-600 font-medium">{{item.store}}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4">
                    <span 
                      class="px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit"
                      [class.bg-green-50]="item.status === 'Available'"
                      [class.text-green-600]="item.status === 'Available'"
                      [class.bg-purple-50]="item.status === 'Sold'"
                      [class.text-purple-600]="item.status === 'Sold'"
                      [class.bg-gray-50]="item.status === 'Draft'"
                      [class.text-gray-500]="item.status === 'Draft'"
                      [class.bg-red-50]="item.status === 'Suspended'"
                      [class.text-red-600]="item.status === 'Suspended'"
                      [class.bg-orange-50]="item.status === 'Expired' || item.status === 'Paused'"
                      [class.text-orange-600]="item.status === 'Expired' || item.status === 'Paused'"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                      {{item.status}}
                    </span>
                  </td>
                  <td class="px-6 py-4" (click)="$event.stopPropagation()">
                    <button class="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                      <ng-icon name="heroEllipsisVertical"></ng-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
          
          <!-- Pagination -->
          <div class="px-6 py-4 border-t border-gray-50 flex items-center justify-between">
            <span class="text-xs text-gray-400 font-medium">{{listings().length}} results</span>
            <div class="flex items-center gap-2">
              <button class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
                <ng-icon name="heroChevronLeft"></ng-icon>
              </button>
              <div class="flex items-center gap-1">
                <button class="w-6 h-6 rounded-md bg-purple-600 text-white text-xs font-bold leading-none">1</button>
              </div>
              <button class="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30" disabled>
                <ng-icon name="heroChevronRight"></ng-icon>
              </button>
              <span class="text-xs text-gray-400 ml-2">of 1</span>
            </div>
          </div>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="bg-white border border-gray-100 rounded-3xl p-16 flex flex-col items-center text-center shadow-sm">
          <div class="relative w-64 h-48 mb-8">
            <!-- Mock Illustration of empty listings -->
            <div class="absolute inset-0 bg-gray-50 rounded-2xl rotate-2 scale-95 opacity-50"></div>
            <div class="absolute inset-0 bg-gray-50 rounded-2xl -rotate-2 scale-95 opacity-50"></div>
            <div class="absolute inset-0 bg-white border border-gray-100 rounded-2xl flex flex-col items-center justify-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                 <ng-icon name="heroPlus" class="text-2xl text-gray-300"></ng-icon>
              </div>
              <div class="w-24 h-2 bg-gray-50 rounded-full"></div>
              <div class="w-16 h-2 bg-gray-50/50 rounded-full"></div>
            </div>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Looks a little empty here 👀</h3>
          <p class="text-sm text-gray-500 mb-8 max-w-sm">Add a listing so buyers can see what you're offering and reach out.</p>
          <button (click)="showAddListingModal.set(true)" class="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-md shadow-purple-200">
            <ng-icon name="heroPlus"></ng-icon>
            Sell an item
          </button>
        </div>
      }
    </div>
    @if (showAddListingModal()) {
      <app-add-listing-modal 
        (close)="showAddListingModal.set(false)"
        (save)="onPublishListing($event)"
      ></app-add-listing-modal>
    }
    @if (showIdentityModal()) {
      <app-identity-verification-modal
        (close)="showIdentityModal.set(false)"
        (submitted)="isVerificationSubmitted.set(true)"
      ></app-identity-verification-modal>
    }
    @if (showVerificationDetailsModal()) {
      <app-verification-details-modal
        (close)="showVerificationDetailsModal.set(false)"
      ></app-verification-details-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingsPageComponent {
  private readonly router = inject(Router);
  protected showAddListingModal = signal(false);
  protected showIdentityModal = signal(false);
  protected showVerificationDetailsModal = signal(false);
  protected isVerificationSubmitted = signal(false);

  protected viewListing(id: string): void {
    this.router.navigate(['/listings', id]);
  }
  protected readonly listings = signal<Listing[]>([
    {
      id: '1',
      name: 'Iphone 13 pro max',
      category: 'Phones & Laptops',
      price: 3500000.00,
      store: 'The Vine Collections',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=100&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Logitech ergonic mouse',
      category: 'Electronics',
      price: 50000.00,
      store: 'Eden Organics',
      status: 'Sold',
      image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop'
    },
    {
      id: '3',
      name: 'Nike variable',
      category: 'Men\'s fashion',
      price: 25000.00,
      store: 'Amazing Fragrances',
      status: 'Draft',
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'
    },
    {
      id: '4',
      name: 'Bone straight wig',
      category: 'Women\'s fashion',
      price: 150000.00,
      store: 'Personal account',
      status: 'Paused',
      image: 'https://images.unsplash.com/photo-1595475207225-428b4d490b92?w=100&h=100&fit=crop'
    },
    {
      id: '5',
      name: 'Maxwell',
      category: 'Automobiles',
      price: 1500000.00,
      store: 'Eden Organics',
      status: 'Sold',
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=100&h=100&fit=crop'
    },
    {
      id: '6',
      name: 'RGB keyboard',
      category: 'Electronics',
      price: 20000.00,
      store: 'Personal account',
      status: 'Suspended',
      image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=100&h=100&fit=crop'
    }
  ]);

  protected readonly stats = signal([
    { label: 'All', value: 65, active: true },
    { label: 'Available', value: '09', active: false },
    { label: 'Sold', value: '09', active: false },
    { label: 'Discount', value: '09', active: false },
    { label: 'Expanded', value: '03', active: false },
    { label: 'Draft', value: '03', active: false },
  ]);

  protected toggleEmpty(): void {
    if (this.listings().length > 0) {
      this.listings.set([]);
    } else {
      // Re-populate would go here, but for demo:
      location.reload();
    }
  }

  protected onPublishListing(data: any): void {
    const newItem: Listing = {
      id: (this.listings().length + 1).toString(),
      name: data.name,
      category: data.category,
      price: data.price,
      store: 'My Store',
      status: 'Available',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100&h=100&fit=crop'
    };
    this.listings.update(l => [newItem, ...l]);
    this.showAddListingModal.set(false);
  }
}
