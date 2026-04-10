import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroChevronDown, 
  heroMagnifyingGlass, 
  heroPhone,
  heroChevronLeft,
  heroChevronRight
} from '@ng-icons/heroicons/outline';

interface CallbackRequest {
  id: string;
  buyer: {
    name: string;
    avatar: string;
  };
  phoneNumber: string;
  listing: {
    name: string;
    image: string;
  };
  store: {
    name: string;
    logo: string;
  };
  dateRequested: string;
}

@Component({
  selector: 'app-callbacks-page',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({
      heroChevronDown,
      heroMagnifyingGlass,
      heroPhone,
      heroChevronLeft,
      heroChevronRight
    })
  ],
  template: `
    <div class="h-full flex flex-col pt-0">
      
      <!-- Header -->
      <div class="flex items-center gap-2 mb-8">
        <h1 class="text-[28px] text-gray-400 tracking-tight">Requests</h1>
        <span class="text-[28px] text-gray-300 font-light">></span>
        <h1 class="text-[28px] font-bold text-[#1A1C21] tracking-tight">Call back requests</h1>
      </div>

      <!-- Main Card -->
      <div class="bg-white rounded-[32px] border border-gray-100 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col grow">
        
        <!-- Filters Toolbar -->
        <div class="flex items-center justify-between p-6 border-b border-gray-50/80">
          <div class="flex items-center gap-3">
            <button class="px-5 py-2.5 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-colors">
              Store: <span class="text-gray-900 font-bold">All</span>
              <ng-icon name="heroChevronDown" class="text-sm ml-1 opacity-70"></ng-icon>
            </button>
            <button class="px-5 py-2.5 rounded-full border border-gray-200 text-[13px] font-semibold text-gray-500 flex items-center gap-2 hover:bg-gray-50 transition-colors">
              Date requested
              <ng-icon name="heroChevronDown" class="text-sm ml-1 opacity-70"></ng-icon>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <ng-icon name="heroMagnifyingGlass" class="text-lg"></ng-icon>
            </div>
            <input 
              type="text" 
              placeholder="Search" 
              class="w-80 bg-gray-50/80 text-gray-900 text-sm font-medium rounded-full outline-none py-2.5 pl-11 pr-4 focus:ring-2 focus:ring-purple-100 focus:bg-white transition-all placeholder:text-gray-400"
            >
          </div>
        </div>

        <!-- Data Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead>
              <tr class="border-b border-gray-50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th class="px-6 py-5 font-bold">Buyer</th>
                <th class="px-6 py-5 font-bold">Phone number</th>
                <th class="px-6 py-5 font-bold">Listing</th>
                <th class="px-6 py-5 font-bold">Store</th>
                <th class="px-6 py-5 font-bold">Date requested</th>
                <th class="px-6 py-5 w-16"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              @for (request of callbacks(); track request.id) {
                <tr class="hover:bg-gray-50/30 transition-colors group">
                  <!-- Buyer -->
                  <td class="px-6 py-6 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-gray-100 overflow-hidden ring-1 ring-gray-100">
                        <img [src]="request.buyer.avatar" [alt]="request.buyer.name" class="w-full h-full object-cover">
                      </div>
                      <span class="text-[15px] font-bold text-[#1A1C21]">{{ request.buyer.name }}</span>
                    </div>
                  </td>
                  
                  <!-- Phone Number -->
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="text-[15px] text-[#1A1C21] font-medium">{{ request.phoneNumber }}</span>
                  </td>

                  <!-- Listing -->
                  <td class="px-6 py-6 whitespace-nowrap">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden border border-gray-100">
                        <img [src]="request.listing.image" [alt]="request.listing.name" class="w-full h-full object-cover">
                      </div>
                      <span class="text-[14px] font-bold text-gray-700">{{ request.listing.name }}</span>
                    </div>
                  </td>

                  <!-- Store -->
                  <td class="px-6 py-6 whitespace-nowrap">
                    <div class="flex items-center gap-2.5">
                      <div class="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                        <img [src]="request.store.logo" [alt]="request.store.name" class="w-full h-full object-cover">
                      </div>
                      <span class="text-[14px] font-medium text-gray-600">{{ request.store.name }}</span>
                    </div>
                  </td>

                  <!-- Date Requested -->
                  <td class="px-6 py-6 whitespace-nowrap">
                    <span class="text-[14px] text-[#1A1C21] font-medium">{{ request.dateRequested }}</span>
                  </td>

                  <!-- Actions -->
                  <td class="px-6 py-6 whitespace-nowrap text-right">
                    <button class="w-[42px] h-[42px] rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#1A1C21] transition-all focus:outline-none focus:ring-2 focus:ring-purple-100">
                      <ng-icon name="heroPhone" class="text-[18px]"></ng-icon>
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Footer Pagination -->
      <div class="flex flex-none items-center justify-between pt-8 pb-4">
        <!-- Results count -->
        <div class="text-[15px] text-gray-400 font-medium">
          <span class="font-black text-[#1A1C21]">5</span> results
        </div>

        <!-- Pagination Controls -->
        <div class="flex items-center gap-3">
          <button class="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all focus:outline-none group">
            <ng-icon name="heroChevronLeft" class="text-sm group-active:-translate-x-0.5 transition-transform"></ng-icon>
          </button>
          
          <button class="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-[#1A1C21] font-bold shadow-sm hover:bg-gray-50 transition-all focus:outline-none">
            1
          </button>
          
          <button class="w-10 h-10 rounded-2xl border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all focus:outline-none group">
            <ng-icon name="heroChevronRight" class="text-sm group-active:translate-x-0.5 transition-transform"></ng-icon>
          </button>
          
          <span class="text-[15px] text-gray-400 font-medium ml-2">
            of 12
          </span>
        </div>
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CallbacksPageComponent {
  
  protected readonly callbacks = signal<CallbackRequest[]>([
    {
      id: '1',
      buyer: {
        name: 'Halima Bala',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb4ce?w=100&h=100&fit=crop'
      },
      phoneNumber: '0816 939 7454',
      listing: {
        name: 'Iphone 17 pro max',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop'
      },
      store: {
        name: 'The Vine Collections',
        logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=100&h=100&fit=crop'
      },
      dateRequested: '14 Feb, 2025'
    },
    {
      id: '2',
      buyer: {
        name: 'Joseph Olamide',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop'
      },
      phoneNumber: '0816 939 7454',
      listing: {
        name: 'Logitech ergonomic mouse',
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100&h=100&fit=crop'
      },
      store: {
        name: 'Eden Organics',
        logo: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100&h=100&fit=crop'
      },
      dateRequested: '14 Feb, 2025'
    },
    {
      id: '3',
      buyer: {
        name: 'Kelechi Oduah',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop'
      },
      phoneNumber: '0816 939 7454',
      listing: {
        name: 'Nike sneaker',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100&h=100&fit=crop'
      },
      store: {
        name: 'Amazing Fragrances',
        logo: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=100&h=100&fit=crop'
      },
      dateRequested: '14 Feb, 2025'
    },
    {
      id: '4',
      buyer: {
        name: 'Timipre Izuokumo',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop'
      },
      phoneNumber: '0816 939 7454',
      listing: {
        name: 'Bone straight wig',
        image: 'https://images.unsplash.com/photo-1595475207225-428b4d490b92?w=100&h=100&fit=crop'
      },
      store: {
        name: 'Personal account',
        logo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
      },
      dateRequested: '14 Feb, 2025'
    }
  ]);
}
