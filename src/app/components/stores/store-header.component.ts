import { ChangeDetectionStrategy, Component, input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroCheckBadge, 
  heroChatBubbleLeftEllipsis, 
  heroUserPlus, 
  heroPencil, 
  heroEllipsisHorizontal, 
  heroPlus,
  heroMapPin,
  heroStar,
  heroRocketLaunch,
  heroPencilSquare,
  heroEllipsisHorizontalCircle,
  heroArrowTrendingUp
} from '@ng-icons/heroicons/outline';
import { heroRocketLaunchSolid, heroStarSolid } from '@ng-icons/heroicons/solid';
import { PromoteStoreModalComponent } from './promote-store-modal.component';

@Component({
  selector: 'app-store-header',
  standalone: true,
  imports: [CommonModule, NgIcon, PromoteStoreModalComponent],
  providers: [
    provideIcons({ 
      heroCheckBadge, 
      heroChatBubbleLeftEllipsis, 
      heroUserPlus, 
      heroPencil, 
      heroEllipsisHorizontal, 
      heroPlus,
      heroMapPin,
      heroStar,
      heroRocketLaunch,
      heroRocketLaunchSolid,
      heroStarSolid,
      heroPencilSquare,
      heroEllipsisHorizontalCircle,
      heroArrowTrendingUp
    })
  ],
  template: `
    <div class="relative w-full rounded-[32px] overflow-hidden bg-white shadow-sm mb-6 pb-6">
      <!-- Banner Section -->
      <div class="relative h-64 w-full bg-gray-100">
        <img [src]="banner()" alt="Store Banner" class="w-full h-full object-cover">
        <!-- Smooth Bottom Gradient Fade -->
        <div class="absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-white via-white/80 to-transparent"></div>
        
        <!-- Logo/Avatar (Overlapping) -->
        <div class="absolute bottom-[-40px] left-8 w-36 h-36 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-xl z-20">
          <img [src]="logo()" alt="Store Logo" class="w-full h-full object-cover">
        </div>
      </div>

      <!-- Content Section -->
      <div class="px-8 mt-12 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <!-- Left Side: Title, Badges, Location -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-1">
            <h1 class="text-3xl font-bold text-[#1A1C21] tracking-tight">{{ name() }}</h1>
            @if (isVerified()) {
              <ng-icon name="heroCheckBadge" class="text-purple-600 text-xl"></ng-icon>
            }
            
            <!-- Promoted Badge -->
            <div class="flex items-center gap-1.5 px-3 py-1 bg-white border border-gray-100 rounded-full shadow-xs">
              <ng-icon name="heroRocketLaunchSolid" class="text-xs text-orange-400"></ng-icon>
              <span class="text-[10px] font-bold text-gray-800 uppercase tracking-widest">Promoted</span>
            </div>
          </div>

          <div class="flex items-center gap-1.5 text-gray-400 mb-6">
            <ng-icon name="heroMapPin" class="text-sm"></ng-icon>
            <span class="text-xs font-semibold">{{ location() }}</span>
          </div>

          <!-- Stats Bar -->
          <div class="flex items-center">
            <div class="flex flex-col pr-8 border-r border-gray-100">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Followers</span>
              <span class="text-lg font-black text-[#1A1C21] leading-tight">{{ followers() }}</span>
            </div>
            
            <div class="flex flex-col px-8 border-r border-gray-100">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Listings</span>
              <span class="text-lg font-black text-[#1A1C21] leading-tight">{{ products() }}</span>
            </div>
            
            <div class="flex flex-col px-8 border-r border-gray-100">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rating</span>
              <div class="flex items-center gap-1">
                <span class="text-lg font-black text-[#1A1C21] leading-tight">{{ rating() }}</span>
                <ng-icon name="heroStarSolid" class="text-yellow-400 text-sm mb-1"></ng-icon>
              </div>
            </div>
            
            <div class="flex flex-col pl-8">
              <span class="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date created</span>
              <span class="text-lg font-black text-[#1A1C21] leading-tight">{{ dateCreated() }}</span>
            </div>
          </div>
        </div>

        <!-- Right Side: Action Buttons -->
        <div class="flex items-center gap-3 self-center lg:self-start">
          @if (isOwner()) {
            <!-- Promote Store Button -->
            <button 
              (click)="showPromoteModal.set(true)"
              class="flex items-center gap-2 px-6 py-3.5 bg-linear-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all"
            >
              <ng-icon name="heroArrowTrendingUp" class="text-lg"></ng-icon>
              Promote store
            </button>

            <!-- Edit Store Button -->
            <button (click)="onEdit()" class="flex items-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-[#1A1C21] rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all">
              <ng-icon name="heroPencilSquare" class="text-lg"></ng-icon>
              Edit store
            </button>
          }

          <!-- More Options -->
          <button class="w-12 h-12 flex items-center justify-center rounded-full bg-white border border-gray-100 text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all">
            <ng-icon name="heroEllipsisHorizontal" class="text-2xl"></ng-icon>
          </button>
        </div>
      </div>
    </div>

    @if (showPromoteModal()) {
      <app-promote-store-modal 
        (close)="showPromoteModal.set(false)"
        (promote)="onPromote()"
      ></app-promote-store-modal>
    }
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreHeaderComponent {
  banner = input.required<string>();
  logo = input.required<string>();
  name = input.required<string>();
  location = input<string>('Lagos, Nigeria');
  isVerified = input<boolean>(false);
  products = input<string>('0');
  sales = input<string>('0');
  followers = input<string>('0');
  rating = input<string>('5.0');
  dateCreated = input<string>('Joined 2024');
  isOwner = input<boolean>(false);
  
  showPromoteModal = signal(false);
  
  @Output() edit = new EventEmitter<void>();
  @Output() sellItem = new EventEmitter<void>();

  onEdit() {
    this.edit.emit();
  }

  onSell() {
    this.sellItem.emit();
  }

  onPromote() {
    console.log('Promoting store...');
    this.showPromoteModal.set(false);
  }
}



