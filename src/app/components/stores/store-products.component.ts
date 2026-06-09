import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ListingCardComponent, Listing } from '../listings/listing-card.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroPlus, heroChevronDown } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-store-products',
  standalone: true,
  imports: [CommonModule, ListingCardComponent, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({ heroPlus, heroChevronDown })
  ],
  template: `
    <div class="w-full">
      @if (products().length > 0) {
        <!-- Header: Count & Sort -->
        <div class="flex items-center justify-between mb-8 px-1">
          <h3 class="text-[21px] font-black text-[#1A1C21]">{{ products().length }} listings</h3>
          
          <div class="flex items-center gap-3">
            @if (isOwner()) {
              <button (click)="addListing.emit()" class="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all shadow-sm">
                <ng-icon name="heroPlus" class="text-base"></ng-icon>
                Add listing
              </button>
            }
            <button class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#1A1C21] hover:bg-gray-50 transition-all">
              Most recent
              <ng-icon name="heroChevronDown" class="text-gray-400"></ng-icon>
            </button>
          </div>
        </div>

        <!-- Filter Bubbles -->
        <div class="flex gap-2.5 mb-10 overflow-x-auto pb-2 scrollbar-hide px-1">
          @for (filter of filters; track filter) {
            <button 
              (click)="activeFilter.set(filter)"
              class="px-5 py-2.5 rounded-full text-[13px] font-bold transition-all whitespace-nowrap border"
              [class.bg-purple-600]="activeFilter() === filter"
              [class.hover:bg-purple-700]="activeFilter() === filter"
              [class.text-white]="activeFilter() === filter"
              [class.border-purple-600]="activeFilter() === filter"
              [class.bg-white]="activeFilter() !== filter"
              [class.hover:bg-gray-50]="activeFilter() !== filter"
              [class.text-[#1A1C21]]="activeFilter() !== filter"
              [class.border-gray-100]="activeFilter() !== filter"
            >
              {{ filter }}
              @if (filter === 'All products') {
                <span class="ml-0.5" [class.text-purple-200]="activeFilter() === filter" [class.text-gray-400]="activeFilter() !== filter">({{ products().length }})</span>
              }
            </button>
          }
        </div>

        <!-- Categorized Sections -->
        <div class="space-y-12">
          @for (category of categorizedProducts(); track category.name) {
            <div class="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 class="text-lg font-black text-[#1A1C21] mb-6 flex items-center gap-2">
                {{ category.name }}
                <span class="text-gray-400 font-bold">({{ category.items.length }})</span>
              </h2>
              
              <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                @for (product of category.items; track product.id) {
                  <app-listing-card [listing]="product" [listingRoute]="['/listings']" [showFavorite]="false"></app-listing-card>
                }
              </div>
            </div>
          }
        </div>

      } @else {
        <!-- Empty State -->
        <div class="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500">
          <div class="mb-8 flex items-center justify-center">
            <img ngSrc="/assets/images/empty_state.svg" width="192" height="192" alt="No products" class="w-48 h-48">
          </div>
          
          <h3 class="text-[21px] font-black text-[#1A1C21] mb-2 tracking-tight">Look at the empty space here</h3>
          <p class="text-gray-400 mb-8 max-w-xs text-[14px] font-medium">You don't have any products listing here for now.</p>
          
          @if (isOwner()) {
            <button (click)="addListing.emit()" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-2xl font-bold transition-all shadow-lg shadow-purple-100 active:scale-95 flex items-center gap-2">
              <ng-icon name="heroPlus" class="text-xl"></ng-icon>
              Add product
            </button>
          } @else {
            <p class="text-gray-400 text-sm">This store has no products yet.</p>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreProductsComponent {
  products = input<Listing[]>([]);
  isOwner = input<boolean>(false);
  addListing = output<void>();

  filters = ['All products', 'Mobiles', 'Cars', 'iPads', 'Wears', 'Accessories'];
  activeFilter = signal('All products');

  categorizedProducts = computed(() => {
    const all = this.products();
    const filter = this.activeFilter();
    
    // Simple mock grouping if categories aren't present
    // In real app, this would use a 'category' field on Listing
    const groups: { name: string; items: Listing[] }[] = [];
    
    // Grouping by keyword for demonstration
    const phones = all.filter(p => p.title.toLowerCase().includes('iphone') || (p as any).category === 'Mobiles');
    const misc = all.filter(p => !p.title.toLowerCase().includes('iphone') && (p as any).category !== 'Mobiles');
    
    if (phones.length > 0) groups.push({ name: 'Phones & Gadgets', items: phones });
    if (misc.length > 0) groups.push({ name: 'Other Listings', items: misc });
    
    return groups;
  });
}
