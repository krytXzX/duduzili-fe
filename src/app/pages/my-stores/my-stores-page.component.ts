import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPlus,
  heroMagnifyingGlass,
  heroChevronRight
} from '@ng-icons/heroicons/outline';
import { StoreCardComponent, Store } from '../../components/stores/store-card.component';
import { AddStoreModalComponent } from './components/add-store-modal.component';
import { SuccessModalComponent } from './components/success-modal.component';

@Component({
  selector: 'app-my-stores-page',
  imports: [CommonModule, NgIcon, StoreCardComponent, AddStoreModalComponent, SuccessModalComponent],
  providers: [
    provideIcons({
      heroPlus,
      heroMagnifyingGlass,
      heroChevronRight
    })
  ],
  template: `
    <div class="px-5 pb-10 pt-7 md:hidden">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">My Stores</h1>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F6F7FA] text-[#6B7280]"
            aria-label="Search stores"
          >
            <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
          </button>
          <button
            type="button"
            (click)="isAddingStore.set(true)"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#202335] shadow-[0_10px_20px_-22px_rgba(31,36,48,0.45)]"
            aria-label="Add store"
          >
            <ng-icon name="heroPlus" class="text-[16px]"></ng-icon>
          </button>
        </div>
      </div>

      @if (filteredStores().length > 0) {
        <div class="mt-5 grid grid-cols-2 gap-3">
          @for (store of filteredStores(); track store.id) {
            <app-store-card [store]="store" [showFavorite]="false"></app-store-card>
          }
        </div>
      } @else {
        <section class="flex min-h-[calc(100vh-260px)] flex-col items-center justify-center pb-8 pt-10 text-center">
          <div class="relative mb-8 h-[150px] w-[190px]">
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

          <h2 class="text-[18px] font-medium leading-8 tracking-[-0.03em] text-[#202335]">You don’t have any stores yet</h2>
          <p class="mt-2 max-w-[260px] text-[11px] leading-5 text-[#7A7F8C]">
            Create a dedicated store to organize your listings, gain followers, and increase buyer trust
          </p>

          <button
            type="button"
            (click)="isAddingStore.set(true)"
            class="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#6F56F6] px-6 py-3 text-[12px] font-medium text-white shadow-[0_18px_30px_-18px_rgba(111,86,246,0.95)]"
          >
            <ng-icon name="heroPlus"></ng-icon>
            Create your first store
          </button>
        </section>
      }
    </div>

    <div class="mx-auto hidden max-w-6xl px-4 py-8 md:block">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <h1 class="text-[28px] font-black text-[#1A1C21] tracking-tight">My Stores</h1>
        
        <div class="flex items-center gap-4 flex-1 md:justify-end">
          <div class="relative w-full md:w-80 group">
            <div class="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <ng-icon name="heroMagnifyingGlass" class="text-gray-400 group-focus-within:text-purple-500 transition-colors"></ng-icon>
            </div>
            <input 
              type="text" 
              [value]="searchQuery()"
              (input)="updateSearch($event)"
              placeholder="Store name" 
              class="w-full bg-white border border-gray-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all shadow-sm placeholder:text-gray-300 font-medium"
            >
          </div>
          <button (click)="isAddingStore.set(true)" class="flex items-center gap-2 bg-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 active:scale-95 whitespace-nowrap">
            <ng-icon name="heroPlus" class="text-lg"></ng-icon>
            Add store
          </button>
        </div>
      </div>

      @if (filteredStores().length > 0) {
        <!-- Grid State -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (store of filteredStores(); track store.id) {
            <app-store-card [store]="store" [showFavorite]="false" class="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" [style.animation-delay]="($index * 100) + 'ms'"></app-store-card>
          }
        </div>
      } @else if (searchQuery()) {
        <!-- No Search Results -->
        <div class="flex flex-col items-center justify-center py-20 text-center scale-up-center animate-out fade-out duration-300">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ng-icon name="heroMagnifyingGlass" class="text-3xl text-gray-200"></ng-icon>
          </div>
          <h3 class="text-[19px] font-bold text-gray-900 mb-1">No stores found</h3>
          <p class="text-gray-400 text-sm">We couldn't find any store matching "{{searchQuery()}}"</p>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="bg-white border border-gray-50 rounded-[48px] p-20 flex flex-col items-center text-center shadow-xl shadow-gray-100/50 min-h-[550px] justify-center animate-in fade-in zoom-in-95 duration-700">
          <div class="mb-12 flex items-center justify-center">
            <img src="/assets/images/empty_state.svg" alt="Empty state" class="w-64 h-64">
          </div>
          <h3 class="text-[25px] font-black text-[#1A1C21] mb-3 tracking-tight">You don't have any stores yet</h3>
          <p class="text-gray-400 mb-12 max-w-sm font-medium leading-relaxed text-[15px]">
            Create a store and start selling or listing your products for buyers to find you.
          </p>
          <button (click)="isAddingStore.set(true)" class="group flex items-center gap-3 bg-purple-600 text-white px-10 py-5 rounded-[24px] font-bold hover:bg-purple-700 transition-all shadow-2xl shadow-purple-200 active:scale-95">
            <ng-icon name="heroPlus" class="text-xl group-hover:rotate-90 transition-transform duration-300"></ng-icon>
            Create a new store
          </button>
        </div>
      }
    </div>

    @if (isAddingStore()) {
      <app-add-store-modal 
        (close)="isAddingStore.set(false)"
        (submit)="onStoreSubmit($event)"
      ></app-add-store-modal>
    }

    @if (isSuccess()) {
      <app-success-modal 
        [storeName]="latestCreatedStoreName()"
        (ok)="isSuccess.set(false)"
        (addAnother)="onAddAnother()"
      ></app-success-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
      background-color: #fcfcfc;
      min-height: 100vh;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MyStoresPageComponent {
  readonly stores = signal<Store[]>([
    {
      id: '1',
      name: 'Eden Organics',
      logo: 'https://cdn-icons-png.flaticon.com/512/1047/1047648.png',
      banner: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=200&fit=crop',
      // items: '12',
      // categoryIcon: 'https://cdn-icons-png.flaticon.com/512/1047/1047648.png',
      followers: '23.4k'
    },
    {
      id: '2',
      name: 'The Vine Collections',
      logo: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
      banner: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=200&fit=crop',
      // items: '08',
      // categoryIcon: 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
      followers: '23.4k'
    },
    {
      id: '3',
      name: 'Amazing Fragrances',
      logo: 'https://cdn-icons-png.flaticon.com/512/3126/3126040.png',
      banner: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=200&fit=crop',
      // items: '05',
      // categoryIcon: 'https://cdn-icons-png.flaticon.com/512/3126/3126040.png',
      followers: '23.4k'
    },
    {
      id: '4',
      name: 'The Gift Shop',
      logo: 'https://cdn-icons-png.flaticon.com/512/2813/2813401.png',
      banner: 'https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=400&h=200&fit=crop',
      // items: '15',
      // categoryIcon: 'https://cdn-icons-png.flaticon.com/512/2813/2813401.png',
      followers: '23.4k'
    }
  ]);

  readonly searchQuery = signal('');
  readonly isAddingStore = signal(false);
  readonly isSuccess = signal(false);
  readonly latestCreatedStoreName = signal('The Vine Collections');

  readonly filteredStores = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.stores();
    return this.stores().filter(s => s.name.toLowerCase().includes(query));
  });

  updateSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  onStoreSubmit(formData: any) {
    const newStore: Store = {
      id: Math.random().toString(36).substring(7),
      name: formData.name,
      logo: formData.logo,
      banner: formData.banner,
      followers: "0",
      isVerified: false
    };

    this.stores.update(prev => [newStore, ...prev]);
    this.isAddingStore.set(false);
    this.latestCreatedStoreName.set(formData.name);
    
    // Small delay to allow the modal to disappear before showing success
    setTimeout(() => {
      this.isSuccess.set(true);
    }, 300);
  }

  onAddAnother() {
    this.isSuccess.set(false);
    this.isAddingStore.set(true);
  }
}
