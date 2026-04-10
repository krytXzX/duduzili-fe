import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroPlus,
  heroMagnifyingGlass
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
      heroMagnifyingGlass
    })
  ],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-8">
      <!-- Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <h1 class="text-3xl font-black text-[#1A1C21] tracking-tight">My Stores</h1>
        
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
            <app-store-card [store]="store" class="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" [style.animation-delay]="($index * 100) + 'ms'"></app-store-card>
          }
        </div>
      } @else if (searchQuery()) {
        <!-- No Search Results -->
        <div class="flex flex-col items-center justify-center py-20 text-center scale-up-center animate-out fade-out duration-300">
          <div class="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ng-icon name="heroMagnifyingGlass" class="text-3xl text-gray-200"></ng-icon>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-1">No stores found</h3>
          <p class="text-gray-400 text-sm">We couldn't find any store matching "{{searchQuery()}}"</p>
        </div>
      } @else {
        <!-- Empty State -->
        <div class="bg-white border border-gray-50 rounded-[48px] p-20 flex flex-col items-center text-center shadow-xl shadow-gray-100/50 min-h-[550px] justify-center animate-in fade-in zoom-in-95 duration-700">
          <div class="mb-12 flex items-center justify-center">
            <img src="/assets/images/empty_state.svg" alt="Empty state" class="w-64 h-64">
          </div>
          <h3 class="text-3xl font-black text-[#1A1C21] mb-3 tracking-tight">You don't have any stores yet</h3>
          <p class="text-gray-400 mb-12 max-w-sm font-medium leading-relaxed text-lg">
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
