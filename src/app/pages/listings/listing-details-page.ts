import { ChangeDetectionStrategy, Component, signal, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroChevronRight, 
  heroCheckBadge, 
  heroEllipsisVertical,
  heroEye,
  heroShare,
  heroSquare2Stack,
  heroMapPin,
  heroClock,
  heroChatBubbleLeftEllipsis,
  heroInformationCircle,
  heroArrowLeft
} from '@ng-icons/heroicons/outline';

interface Bid {
  id: string;
  user: string;
  amount: number;
  date: string;
  status: 'Processed' | 'Pending' | 'Declined';
  avatar: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-listing-details-page',
  imports: [CommonModule, NgIcon, NgOptimizedImage, RouterLink],
  providers: [
    provideIcons({ 
      heroChevronRight, 
      heroCheckBadge, 
      heroEllipsisVertical,
      heroEye,
      heroShare,
      heroSquare2Stack,
      heroMapPin,
      heroClock,
      heroChatBubbleLeftEllipsis,
      heroInformationCircle,
      heroArrowLeft
    })
  ],
  template: `
    <div class="max-w-6xl mx-auto pb-12">
      <!-- Header Section -->
      <header class="mb-10">
        <nav class="flex items-center gap-2 mb-4">
          <a routerLink="/listings" class="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-600 transition-colors">Listings</a>
          <ng-icon name="heroChevronRight" class="text-[8px] text-gray-300"></ng-icon>
          <span class="text-[10px] font-bold text-gray-900 uppercase tracking-widest">{{listing().name}}</span>
        </nav>

        <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="flex items-center gap-4">
            <h1 class="text-3xl font-extrabold text-gray-900 tracking-tight">{{listing().name}}</h1>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-black uppercase tracking-wider ring-1 ring-purple-100">
              <ng-icon name="heroCheckBadge" class="text-xs"></ng-icon>
              Featured
            </span>
          </div>
          <div class="flex items-center gap-3">
            <button class="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100">
              <ng-icon name="heroEye" class="text-lg"></ng-icon>
              Preview listing
            </button>
            <button class="p-3 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-600 shadow-sm">
              <ng-icon name="heroEllipsisVertical" class="text-xl"></ng-icon>
            </button>
          </div>
        </div>
      </header>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <!-- Left Content Area -->
        <div class="lg:col-span-8 space-y-10">
          
          <!-- Details View (Gallery + Tabs) -->
          @if (activeTab() === 'details') {
            <div class="space-y-10 animate-in fade-in duration-500">
              <!-- Gallery Section -->
              <div class="space-y-4">
                <div class="relative aspect-video bg-gray-50 rounded-4xl overflow-hidden group shadow-sm border border-gray-100 p-1">
                  <div class="relative w-full h-full rounded-[2.2rem] overflow-hidden">
                    <img 
                      [ngSrc]="activeImage()" 
                      [alt]="listing().name"
                      fill
                      class="object-cover transition-transform duration-1000 group-hover:scale-105"
                      priority
                    >
                  </div>
                </div>
                <div class="grid grid-cols-6 gap-3 pt-2">
                  @for (img of listing().images; track img) {
                    <button 
                      (click)="activeImage.set(img)"
                      class="aspect-square rounded-2xl overflow-hidden border-2 transition-all p-1 relative"
                      [class.border-purple-600]="activeImage() === img"
                      [class.border-transparent]="activeImage() !== img"
                      [class.bg-gray-50]="activeImage() !== img"
                    >
                      <div class="relative w-full h-full rounded-xl overflow-hidden">
                         <img [ngSrc]="img" fill class="object-cover" [alt]="listing().name">
                      </div>
                    </button>
                  }
                </div>
              </div>

              <!-- Product Info Tabs Section -->
              <div class="space-y-8">
                <div class="flex items-center gap-10 border-b border-gray-100">
                  <button 
                    (click)="activeTab.set('details')"
                    class="pb-5 text-sm font-black transition-all relative"
                    [class.text-purple-600]="activeTab() === 'details'"
                    [class.text-gray-400]="activeTab() !== 'details'"
                  >
                    Details
                    @if (activeTab() === 'details') {
                      <div class="absolute bottom-[-1px] left-0 right-0 h-1 bg-purple-600 rounded-full"></div>
                    }
                  </button>
                  <button 
                    (click)="activeTab.set('bids')"
                    class="pb-5 text-sm font-black transition-all relative flex items-center gap-2"
                    [class.text-purple-600]="activeTab() === 'bids'"
                    [class.text-gray-400]="activeTab() !== 'bids'"
                  >
                    Bids 
                    <span class="text-[10px] opacity-60">({{bids().length < 10 ? '0' + bids().length : bids().length}})</span>
                    @if (activeTab() === 'bids') {
                      <div class="absolute bottom-[-1px] left-0 right-0 h-1 bg-purple-600 rounded-full"></div>
                    }
                  </button>
                  <button 
                    (click)="activeTab.set('history')"
                    class="pb-5 text-sm font-black transition-all relative flex items-center gap-2"
                    [class.text-purple-600]="activeTab() === 'history'"
                    [class.text-gray-400]="activeTab() !== 'history'"
                  >
                    History
                    <span class="text-[10px] opacity-60">({{history().length < 10 ? '0' + history().length : history().length}})</span>
                    @if (activeTab() === 'history') {
                      <div class="absolute bottom-[-1px] left-0 right-0 h-1 bg-purple-600 rounded-full"></div>
                    }
                  </button>
                </div>

                <div class="space-y-10">
                  <div class="space-y-4">
                    <h3 class="text-lg font-extrabold text-gray-900 tracking-tight">Description</h3>
                    <p class="text-gray-500 leading-relaxed text-sm">
                      {{listing().description}}
                      <button class="text-purple-600 font-bold hover:underline inline-flex items-center ml-1">Read more</button>
                    </p>
                  </div>

                  <div class="space-y-4">
                    <h3 class="text-lg font-extrabold text-gray-900 tracking-tight">Specifications</h3>
                    <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                      @for (spec of specifications(); track spec.label) {
                        <div class="flex items-center justify-between px-8 py-5">
                          <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{spec.label}}</span>
                          <span class="text-sm font-bold text-gray-900">{{spec.value}}</span>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }

          <!-- Bids Tab View -->
          @if (activeTab() === 'bids') {
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <!-- Header copy from image -->
               <div class="flex items-center gap-10 border-b border-gray-100">
                  <button (click)="activeTab.set('details')" class="pb-5 text-sm font-black text-gray-400">Details</button>
                  <button class="pb-5 text-sm font-black text-purple-600 relative flex items-center gap-2">
                    Bids <span class="text-[10px] opacity-60">(04)</span>
                    <div class="absolute bottom-[-1px] left-0 right-0 h-1 bg-purple-600 rounded-full"></div>
                  </button>
                  <button (click)="activeTab.set('history')" class="pb-5 text-sm font-black text-gray-400 flex items-center gap-2">
                    History <span class="text-[10px] opacity-60">(02)</span>
                  </button>
               </div>

               <div class="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="bg-gray-50/50 text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                        <th class="px-8 py-5 w-20">S/N</th>
                        <th class="px-8 py-5">Name</th>
                        <th class="px-8 py-5 text-right">Offer (Net price)</th>
                        <th class="px-8 py-5">Date</th>
                        <th class="px-8 py-5">Status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      @for (bid of bids(); track bid.id; let i = $index) {
                        <tr class="group hover:bg-gray-50/50 transition-colors">
                          <td class="px-8 py-6 text-sm font-bold text-gray-400">{{i + 1 < 10 ? '0' + (i + 1) : i + 1}}</td>
                          <td class="px-8 py-6">
                            <div class="flex items-center gap-4">
                              <div class="w-9 h-9 rounded-full bg-gray-100 overflow-hidden ring-2 ring-gray-50 group-hover:ring-white transition-all">
                                <img [src]="bid.avatar" class="w-full h-full object-cover">
                              </div>
                              <span class="text-sm font-bold text-gray-900">{{bid.user}}</span>
                            </div>
                          </td>
                          <td class="px-8 py-6 text-sm font-black text-gray-900 text-right">₦{{bid.amount | number:'1.2-2'}}</td>
                          <td class="px-8 py-6 text-xs font-medium text-gray-400">{{bid.date}}</td>
                          <td class="px-8 py-6">
                            <div class="flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
                              [class.bg-green-50]="bid.status === 'Processed'"
                              [class.text-green-600]="bid.status === 'Processed'"
                              [class.bg-purple-50]="bid.status === 'Pending'"
                              [class.text-purple-600]="bid.status === 'Pending'"
                              [class.bg-red-50]="bid.status === 'Declined'"
                              [class.text-red-600]="bid.status === 'Declined'"
                            >
                               <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                               <span class="text-[10px] font-black uppercase tracking-wider">{{bid.status}}</span>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                  <div class="px-8 py-5 border-t border-gray-50 flex items-center justify-between">
                     <span class="text-xs text-gray-400 font-medium">1-4 of 4 bids</span>
                     <div class="flex items-center gap-4">
                        <button class="text-gray-300 cursor-not-allowed"><ng-icon name="heroArrowLeft"></ng-icon></button>
                        <button class="text-gray-300 cursor-not-allowed"><ng-icon name="heroChevronRight"></ng-icon></button>
                     </div>
                  </div>
               </div>
            </div>
          }

          <!-- History Tab View -->
          @if (activeTab() === 'history') {
            <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div class="flex items-center gap-10 border-b border-gray-100">
                  <button (click)="activeTab.set('details')" class="pb-5 text-sm font-black text-gray-400">Details</button>
                  <button (click)="activeTab.set('bids')" class="pb-5 text-sm font-black text-gray-400 flex items-center gap-2">
                    Bids <span class="text-[10px] opacity-60">(04)</span>
                  </button>
                  <button class="pb-5 text-sm font-black text-purple-600 relative flex items-center gap-2">
                    History <span class="text-[10px] opacity-60">(02)</span>
                    <div class="absolute bottom-[-1px] left-0 right-0 h-1 bg-purple-600 rounded-full"></div>
                  </button>
               </div>

               <div class="space-y-0 divide-y divide-gray-50">
                  @for (item of history(); track item.id) {
                    <div class="flex items-center gap-5 py-6 px-4 hover:bg-gray-50/50 rounded-2xl transition-all group">
                      <div class="w-12 h-12 rounded-full overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                        <img [src]="item.avatar" class="w-full h-full object-cover">
                      </div>
                      <div class="flex-1">
                        <p class="text-sm">
                          <span class="font-extrabold text-gray-900 group-hover:text-purple-600 transition-colors">{{item.user}}</span>
                          <span class="text-gray-500 ml-2">{{item.action}}</span>
                        </p>
                        <p class="text-xs font-medium text-gray-300 mt-1.5 uppercase tracking-wide">{{item.date}}</p>
                      </div>
                    </div>
                  }
               </div>
            </div>
          }
        </div>

        <!-- Sidebar Section -->
        <aside class="lg:col-span-4 space-y-8">
          
          <!-- Listing QR Code Card -->
          <div class="bg-white border border-gray-100 rounded-4xl p-8 shadow-sm space-y-8">
            <div class="flex items-center justify-between px-2">
              <h4 class="text-[10px] font-black text-gray-300 uppercase tracking-widest">Listing Code</h4>
              <button class="text-gray-300 hover:text-purple-600 transition-colors">
                <ng-icon name="heroSquare2Stack" class="text-lg"></ng-icon>
              </button>
            </div>
            <div class="flex justify-center">
              <div class="w-48 h-48 bg-gray-50/80 rounded-[2.5rem] flex items-center justify-center border border-dashed border-gray-200/50 p-4 transition-all hover:bg-white hover:shadow-xl hover:shadow-purple-500/5 group">
                <div class="p-5 bg-white rounded-[2rem] shadow-sm transform group-hover:scale-105 transition-transform duration-500">
                   <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=listing-123" width="110" height="110" alt="QR Code">
                </div>
              </div>
            </div>
            <div class="text-center">
              <p class="text-[10px] text-gray-300 font-bold uppercase tracking-widest mb-1.5">Scan to view listing on mobile</p>
              <p class="text-sm font-black text-gray-900 tracking-tight">#DUDU-2309-X</p>
            </div>
          </div>

          <!-- Price & Stock Card -->
          <div class="bg-black rounded-4xl p-10 text-white shadow-2xl shadow-purple-900/15 relative overflow-hidden group">
            <div class="relative z-10 space-y-8">
              <div class="space-y-2">
                <p class="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Price Tag</p>
                <h2 class="text-4xl font-extrabold tracking-tight">₦4,500,000</h2>
              </div>
              
              <div class="pt-8 border-t border-white/10 flex items-center justify-between">
                <div class="space-y-1">
                   <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest">Quantity</p>
                   <p class="text-sm font-black">120 Units</p>
                </div>
                <div class="text-right space-y-1">
                   <p class="text-[10px] font-bold text-white/30 uppercase tracking-widest text-right">Status</p>
                   <div class="flex items-center gap-2 justify-end">
                      <span class="w-1.5 h-1.5 rounded-full bg-green-400 shadow-sm shadow-green-400"></span>
                      <p class="text-sm font-black text-green-400 uppercase tracking-wider">Available</p>
                   </div>
                </div>
              </div>
            </div>
            <!-- Glow aesthetic -->
            <div class="absolute -right-16 -top-16 w-56 h-56 bg-purple-600/20 rounded-full blur-[80px] group-hover:bg-purple-600/30 transition-all duration-700"></div>
          </div>

          <!-- Seller Info Card -->
          <div class="bg-gray-50/50 border border-gray-100 rounded-4xl p-8 space-y-8 shadow-sm">
            <div class="flex items-center gap-5">
              <div class="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-purple-500/20 ring-4 ring-white">
                T
              </div>
              <div class="space-y-1.5">
                <h4 class="text-base font-black text-gray-900 tracking-tight leading-none">The Vine Collections</h4>
                <div class="flex items-center gap-2">
                  <div class="flex text-yellow-400 text-[10px] drop-shadow-sm">
                    ★ ★ ★ ★ ★
                  </div>
                  <span class="text-[10px] font-black text-gray-300 uppercase">(4.8)</span>
                </div>
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <button class="bg-white border border-gray-200 px-4 py-3.5 rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-widest hover:bg-gray-50 hover:shadow-sm transition-all">
                View store
              </button>
              <button class="bg-white border border-gray-200 px-4 py-3.5 rounded-2xl text-[10px] font-black text-gray-900 uppercase tracking-widest hover:bg-gray-50 hover:shadow-sm transition-all">
                Contact seller
              </button>
            </div>

            <div class="flex items-center gap-2.5 px-2">
               <ng-icon name="heroInformationCircle" class="text-xl text-gray-300"></ng-icon>
               <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Verified Business since 2022</span>
            </div>
          </div>

        </aside>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .animate-in {
      animation: animateIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes animateIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListingDetailsPageComponent {
  private readonly route = inject(ActivatedRoute);
  
  protected readonly listingId = computed(() => this.route.snapshot.paramMap.get('id'));
  
  protected readonly activeTab = signal<'details' | 'bids' | 'history'>('details');
  
  protected readonly listing = signal({
    name: 'Iphone 12 pro max',
    description: 'Ultimate power and sophisticated design collide in the iPhone 12 Pro Max, featuring a stunning 6.7-inch Super Retina XDR display, advanced A14 Bionic chip, and a pro-grade triple-camera system for breathtaking photos and Dolby Vision HDR video recording. This device offers everything you need for work and play.',
    images: [
      'https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1603919114330-22c608149887?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=1000&h=800&fit=crop',
      'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=1000&h=800&fit=crop'
    ],
    price: 4500000.00,
    quantity: 120,
    weight: '228g',
    status: 'Available',
    shipping: 'Pickup only',
    location: 'Ikeja, Lagos'
  });

  protected readonly activeImage = signal(this.listing().images[0]);

  protected readonly specifications = computed(() => [
    { label: 'Product Name', value: this.listing().name },
    { label: 'Price Tag', value: `₦${this.listing().price.toLocaleString()}` },
    { label: 'Quantity', value: `${this.listing().quantity} Units` },
    { label: 'Weight', value: this.listing().weight },
    { label: 'Status', value: this.listing().status },
    { label: 'Shipping type', value: this.listing().shipping },
    { label: 'Location', value: this.listing().location },
  ]);

  protected readonly bids = signal<Bid[]>([
    {
      id: '1',
      user: 'Ade Mike',
      amount: 4200000.00,
      date: '23 oct 2023 | 05:22pm',
      status: 'Processed',
      avatar: 'https://i.pravatar.cc/150?u=ade'
    },
    {
      id: '2',
      user: 'Joshua Davids',
      amount: 4200000.00,
      date: '23 oct 2023 | 05:22pm',
      status: 'Pending',
      avatar: 'https://i.pravatar.cc/150?u=joshua'
    },
    {
      id: '3',
      user: 'Abigail Jackson',
      amount: 4200000.00,
      date: '23 oct 2023 | 05:22pm',
      status: 'Declined',
      avatar: 'https://i.pravatar.cc/150?u=abigail'
    },
    {
      id: '4',
      user: 'Samuel Johnson',
      amount: 4200000.00,
      date: '23 oct 2023 | 05:22pm',
      status: 'Pending',
      avatar: 'https://i.pravatar.cc/150?u=samuel'
    }
  ]);

  protected readonly history = signal<Activity[]>([
    {
      id: '1',
      user: 'The Vine Collections',
      action: 'updated the price of the listing',
      date: '23 oct 2023 | 05:22pm',
      avatar: 'https://i.pravatar.cc/150?u=vine'
    },
    {
      id: '2',
      user: 'Admin',
      action: 'featured this listing',
      date: '22 oct 2023 | 11:15am',
      avatar: 'https://i.pravatar.cc/150?u=admin'
    }
  ]);
}
