import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroXMark, 
  heroPlus,
  heroChevronRight,
  heroChevronLeft,
  heroInformationCircle,
  heroCurrencyDollar,
  heroTruck,
  heroPhoto,
  heroCheckCircle,
  heroEllipsisHorizontal,
  heroCheck,
  heroChevronDown,
  heroDocumentDuplicate,
  heroMagnifyingGlass
} from '@ng-icons/heroicons/outline';
import { ListingCardComponent } from './listing-card.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import { ListingsService } from '../../services/listings.service';
import { AppToastService } from '../../services/app-toast.service';

export interface ListingData {
  name: string;
  category: string;
  condition: string;
  store: string;
  description: string;
  currency: string;
  price: number;
  originalPrice?: number;
  stock: number;
  shippingMethods: string[];
  images: string[];
}

type PickerKind = 'category' | 'condition' | 'store' | 'location';

type PickerOption = {
  readonly value: string;
  readonly label: string;
  readonly subtitle?: string;
  readonly image?: string;
};

@Component({
  selector: 'app-add-listing-modal',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, ListingCardComponent],
  providers: [
    provideIcons({ 
      heroXMark, 
      heroPlus,
      heroChevronRight,
      heroChevronLeft,
      heroInformationCircle,
      heroCurrencyDollar,
      heroTruck,
      heroPhoto,
      heroCheckCircle,
      heroEllipsisHorizontal,
      heroCheck,
      heroChevronDown,
      heroDocumentDuplicate,
      heroMagnifyingGlass
    })
  ],
  template: `
    <div class="fixed inset-0 z-50 bg-white flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500 overflow-hidden">

      <div class="shrink-0 border-b border-gray-100 bg-white md:hidden">
        <div class="flex items-center justify-between px-5 pb-4 pt-5">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="close.emit()"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
              aria-label="Close add listing flow"
            >
              <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
            </button>
            @if (currentStep() < 5) {
              <h1 class="text-[16px] font-medium text-[#2A2D34]">Add listing</h1>
            }
          </div>

          @if (currentStep() < 5) {
            <button
              type="button"
              (click)="saveDraft()"
              [disabled]="isSavingDraft() || isPublishing()"
              class="text-[14px] font-medium text-[#2A2D34] underline underline-offset-2 disabled:opacity-50 disabled:no-underline disabled:pointer-events-none"
            >
              {{ isSavingDraft() ? 'Saving...' : 'Save to drafts' }}
            </button>
          }
        </div>

        @if (currentStep() < 5) {
          <div class="grid grid-cols-4 gap-2 px-4 pb-3">
            @for (step of steps; track step.id) {
              <div
                class="h-[2px] rounded-full"
                [class.bg-[#6F56F6]]="step.id <= currentStep()"
                [class.bg-[#E5E7EB]]="step.id > currentStep()"
              ></div>
            }
          </div>
        }
      </div>

      <!-- Top Header Bar -->
      <div class="hidden h-20 items-center justify-between px-8 bg-white shrink-0 shadow-sm border-b border-gray-100 z-10 relative md:flex">
        <div class="flex items-center gap-6">
          <button 
            (click)="close.emit()" 
            class="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ng-icon name="heroXMark" class="text-xl text-gray-700"></ng-icon>
          </button>
          @if (currentStep() < 5) {
            <h1 class="text-xl font-bold text-[#1A1C21]">Add listing</h1>
          }
        </div>
        @if (currentStep() < 5) {
          <div>
            <button
              type="button"
              (click)="saveDraft()"
              [disabled]="isSavingDraft() || isPublishing()"
              class="px-5 py-2.5 rounded-full border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors tracking-tight disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
            >
              @if (isSavingDraft()) {
                <svg class="animate-spin h-4 w-4 text-gray-600 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              Save to drafts
            </button>
          </div>
        }
      </div>

      <!-- Main Columns Container -->
      <div class="flex-1 flex overflow-hidden">
        
        <!-- Left Sidebar Navigation -->
        @if (currentStep() < 5) {
          <div class="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col py-8 pl-8 overflow-y-auto hidden lg:flex">
            <nav class="space-y-6">
            @for (step of steps; track step.id; let i = $index) {
              <div 
                class="flex items-center gap-4 relative group cursor-pointer"
                (click)="currentStep.set(step.id)"
              >
                <!-- Pre-Step indicator: Completed, Active or Inactive -->
                @if (step.id < currentStep()) {
                   <div class="w-4 h-4 rounded-full bg-purple-600 flex items-center justify-center text-white shrink-0 shadow-sm ml-[-4px]">
                      <ng-icon name="heroCheck" class="text-[10px] stroke-[3]"></ng-icon>
                   </div>
                } @else if (step.id === currentStep()) {
                   <div class="w-4 h-[2px] bg-purple-600 shrink-0 ml-[-4px]"></div>
                } @else {
                   <div class="w-4 h-[2px] bg-gray-300 shrink-0 ml-[-4px]"></div>
                }

                <span 
                  class="text-[15px] font-medium transition-colors"
                  [class.text-[#1A1C21]]="step.id <= currentStep()"
                  [class.font-bold]="step.id === currentStep()"
                  [class.text-gray-400]="step.id > currentStep()"
                >
                  {{ step.name }}
                </span>
              </div>
            }
          </nav>
        </div>
        }

        <!-- Middle Column: Main Content Area -->
        <div class="flex-1 flex flex-col relative bg-white overflow-hidden">
          
          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto px-5 py-6 custom-scrollbar pb-32 md:px-8 md:py-10 md:pb-32 lg:px-16">
            <form [formGroup]="listingForm">

              <!-- STEP 1: Media -->
              @if (currentStep() === 1) {
                <div class="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:hidden">
                  <h2 class="text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Add some photos of your listing</h2>
                  <p class="text-[11px] font-medium text-[#8A8F9A]">Hold and drag photo to rearrange</p>

                  <div class="mt-7 rounded-[16px] bg-[#F8F8F9] px-4 py-3">
                    <p class="text-[11px] font-medium leading-5 text-[#5F6470]">
                      <span class="mr-1.5">💡</span>
                      <span class="font-semibold">Tip:</span> Attaching high quality media improves your selling chances
                    </p>
                  </div>

                  <div class="mt-7 grid grid-cols-3 gap-2.5">
                    <input
                      #mobileMainImageInput
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onMainImageSelected($event)"
                    >

                    <div
                      class="relative col-span-2 row-span-2 aspect-[1.1/1.22] overflow-hidden rounded-[18px] border border-[#ECEEF4] bg-[#F6F7FA]"
                      (click)="openFilePicker(mobileMainImageInput)"
                    >
                      @if (mainImage()) {
                        <img [src]="mainImage()" alt="" class="h-full w-full object-cover">
                        <div class="absolute left-2.5 top-2.5 rounded-full bg-white px-3 py-1 text-[10px] font-medium text-[#2A2D34] shadow-sm">
                          Main photo
                        </div>
                        <button
                          type="button"
                          class="absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-[#4C5160] shadow-sm"
                          (click)="openFilePicker(mobileMainImageInput, $event)"
                          aria-label="Edit main photo"
                        >
                          <ng-icon name="heroEllipsisHorizontal" class="text-[18px]"></ng-icon>
                        </button>
                        <div class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#4C5160] shadow-sm">
                          1
                        </div>
                      } @else {
                        <div class="flex h-full items-center justify-center text-[#2A2D34]">
                          <ng-icon name="heroPlus" class="text-[28px]"></ng-icon>
                        </div>
                      }
                    </div>

                    @for (slot of imageSlots(); track slot.id; let slotIndex = $index) {
                      <input
                        #mobileSlotInput
                        type="file"
                        accept="image/*"
                        class="hidden"
                        (change)="onAdditionalImageSelected(slot.index, $event)"
                      >

                      <div
                        class="relative aspect-square overflow-hidden rounded-[16px] border border-[#ECEEF4] bg-[#F6F7FA]"
                        (click)="openFilePicker(mobileSlotInput, $event)"
                      >
                        @if (slot.image) {
                          <img [src]="slot.image" alt="" class="h-full w-full object-cover">
                          <button
                            type="button"
                            class="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#4C5160] shadow-sm"
                            (click)="openFilePicker(mobileSlotInput, $event)"
                            aria-label="Edit additional photo"
                          >
                            <ng-icon name="heroEllipsisHorizontal" class="text-[16px]"></ng-icon>
                          </button>
                        } @else {
                          <div class="flex h-full items-center justify-center text-[#2A2D34]">
                            <ng-icon name="heroPlus" class="text-[24px]"></ng-icon>
                          </div>
                        }

                        <div class="absolute bottom-2 right-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-[#4C5160] shadow-sm">
                          {{ slot.position }}
                        </div>
                      </div>
                    }
                  </div>

                  <div class="mt-7 space-y-2">
                    <label class="text-[12px] font-medium text-[#5F6470]">Embedded YouTube link (optional)</label>
                    <input
                      type="text"
                      placeholder="Enter link to YouTube video"
                      class="w-full rounded-[14px] border border-[#DCDDE3] px-4 py-3.5 text-[12px] font-medium text-[#2A2D34] outline-none placeholder:text-[#B1B5BF]"
                    >
                  </div>
                </div>

                <div class="hidden max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:block">
                  <h2 class="text-[24px] font-black text-[#1A1C21] tracking-tight mb-2">Add some photos of your listing</h2>
                  <p class="text-sm font-medium text-gray-400 mb-8">Hold and drag photo to rearrange</p>

                  <!-- Tip Banner -->
                  <div class="bg-[#FAFAFA] border border-gray-100 rounded-xl p-3 inline-flex items-center gap-2 mb-8">
                    <span class="text-lg">💡</span>
                    <p class="text-[13px] font-bold text-gray-600"><span class="text-gray-800">Tip:</span> Attaching high quality media improves your selling chances</p>
                  </div>

                  <!-- Masonry Photo Grid -->
                  <div class="grid grid-cols-3 gap-4 mb-8">
                    <input
                      #mainImageInput
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onMainImageSelected($event)"
                    >
                    
                    <!-- Slot 1: Main Photo (Spans 2 rows, 2 cols) -->
                    <div
                      class="col-span-2 row-span-2 relative aspect-[4/5] bg-gray-50 rounded-[28px] border border-gray-100 overflow-hidden group cursor-pointer"
                      (click)="openFilePicker(mainImageInput)"
                    >
                      @if (mainImage()) {
                        <img [src]="mainImage()" class="w-full h-full object-cover">
                        <div class="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-[#1A1C21]">
                          Main photo
                        </div>
                        <button
                          type="button"
                          class="absolute top-4 right-4 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                          (click)="openFilePicker(mainImageInput, $event)"
                        >
                          <ng-icon name="heroEllipsisHorizontal" class="text-xl text-gray-700"></ng-icon>
                        </button>
                        <div class="absolute bottom-4 right-4 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center text-sm font-black text-gray-700">
                          1
                        </div>
                      } @else {
                        <div class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100/50 transition-colors">
                          <ng-icon name="heroPlus" class="text-4xl mb-2"></ng-icon>
                          <span class="text-sm font-bold text-gray-500">Add main image</span>
                        </div>
                      }
                    </div>

                    @for (slot of imageSlots(); track slot.id; let slotIndex = $index) {
                      <input
                        #slotInput
                        type="file"
                        accept="image/*"
                        class="hidden"
                        (change)="onAdditionalImageSelected(slot.index, $event)"
                      >
                      <div
                        class="relative aspect-square rounded-3xl overflow-hidden group cursor-pointer hover:bg-gray-100/50 transition-colors"
                        [class.bg-gray-50]="!!slot.image"
                        [class.border]="!!slot.image"
                        [class.border-gray-100]="!!slot.image"
                        [class.bg-[#F8F9FA]]="!slot.image"
                        [class.border-2]="!slot.image"
                        [class.border-dashed]="!slot.image"
                        [class.border-gray-200]="!slot.image"
                        [class.m-0.5]="slotIndex === 1 && !slot.image"
                        [class.mt-2]="slotIndex > 1"
                        (click)="openFilePicker(slotInput, $event)"
                      >
                        @if (slot.image) {
                          <img [src]="slot.image" class="w-full h-full object-cover">
                          <button
                            type="button"
                            class="absolute top-3 right-3 w-8 h-8 bg-white/95 backdrop-blur-sm rounded-full shadow-sm flex items-center justify-center hover:bg-white transition-colors"
                            (click)="openFilePicker(slotInput, $event)"
                          >
                            <ng-icon name="heroEllipsisHorizontal" class="text-lg text-gray-700"></ng-icon>
                          </button>
                        } @else {
                          <div class="absolute inset-0 flex items-center justify-center text-gray-400">
                            <ng-icon name="heroPlus" class="text-2xl text-gray-800"></ng-icon>
                          </div>
                        }
                        <div class="absolute bottom-2 right-2 w-6 h-6 bg-white shadow-sm rounded-full flex items-center justify-center text-[10px] font-black text-gray-600">
                          {{ slot.position }}
                        </div>
                      </div>
                    }
                  </div>

                  <!-- YouTube Link -->
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-[#1A1C21]">Embedded YouTube link (optional)</label>
                    <input 
                      type="text" 
                      placeholder="Enter link to YouTube video"
                      class="w-full bg-white border border-gray-100 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium placeholder:text-gray-300 shadow-sm"
                    >
                  </div>
                </div>
              }

              <!-- STEP 2: Details -->
              @if (currentStep() === 2) {
                <div class="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:hidden">
                  <h2 class="max-w-[260px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Fill basic details about your listing</h2>
                  <p class="mt-1 text-[11px] font-medium text-[#8A8F9A]">Add details about the item you want to list</p>

                  <div class="mt-8 space-y-6">
                    <div class="space-y-2">
                      <label class="text-[12px] font-medium text-[#3F4452]">Item name</label>
                      <input
                        type="text"
                        formControlName="name"
                        class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                      >
                    </div>

                    <div class="space-y-2 relative">
                      <label class="text-[12px] font-medium text-[#3F4452]">Category</label>
                      <button
                        type="button"
                        (click)="openPicker('category')"
                        class="flex w-full items-center justify-between rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-left text-[12px] font-medium text-[#202335] outline-none"
                      >
                        <span>{{ selectedCategoryLabel() || 'Select category' }}</span>
                        <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                      </button>
                    </div>

                    <div class="grid grid-cols-2 gap-5">
                      <div class="space-y-2 relative">
                        <label class="text-[12px] font-medium text-[#3F4452]">Condition</label>
                        <button
                          type="button"
                          (click)="openPicker('condition')"
                          class="flex w-full items-center justify-between rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-left text-[12px] font-medium text-[#202335] outline-none"
                        >
                          <span>{{ selectedConditionLabel() || 'Select condition' }}</span>
                          <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                        </button>
                      </div>

                      <div class="space-y-2 relative">
                        <label class="text-[12px] font-medium text-[#3F4452]">Store</label>
                        <button
                          type="button"
                          (click)="openPicker('store')"
                          class="flex w-full items-center justify-between rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-left text-[12px] font-medium text-[#202335] outline-none"
                        >
                          <span class="truncate">{{ selectedStoreLabel() || 'Select store' }}</span>
                          <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                        </button>
                      </div>
                    </div>

                    <div class="pt-3">
                      <h3 class="text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Add description</h3>
                      <p class="max-w-[320px] text-[11px] leading-5 text-[#8A8F9A]">Describe the upgrades and standout features that will appeal to buyers</p>

                      <div class="mt-5 space-y-2">
                        <label class="text-[12px] font-medium text-[#3F4452]">Description</label>
                        <textarea
                          formControlName="description"
                          rows="6"
                          class="w-full resize-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="hidden max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:block">
                  <h2 class="text-[24px] font-black text-[#1A1C21] tracking-tight mb-1">Fill basic details about your listing</h2>
                  <p class="text-[14px] text-gray-400 mb-8">Add details about the item you want to list</p>
                  
                  <div class="space-y-6">
                    <div class="space-y-2">
                      <label class="text-[13px] font-medium text-gray-700">Item name</label>
                      <input 
                        type="text" 
                        formControlName="name"
                        class="w-full bg-white border border-gray-100 rounded-xl p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-[#1A1C21]"
                      >
                    </div>

                    <div class="space-y-2 relative">
                      <label class="text-[13px] font-medium text-gray-700">Category</label>
                      <button
                        type="button"
                        (click)="openPicker('category')"
                        class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] shadow-sm transition-all"
                      >
                        <span>{{ selectedCategoryLabel() || 'Select category' }}</span>
                        <ng-icon name="heroChevronDown" class="text-[14px] stroke-[2] text-gray-400"></ng-icon>
                      </button>
                    </div>

                    <div class="space-y-2 relative">
                      <label class="text-[13px] font-medium text-gray-700">Condition</label>
                      <button
                        type="button"
                        (click)="openPicker('condition')"
                        class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] shadow-sm transition-all"
                      >
                        <span>{{ selectedConditionLabel() || 'Select condition' }}</span>
                        <ng-icon name="heroChevronDown" class="text-[14px] stroke-[2] text-gray-400"></ng-icon>
                      </button>
                    </div>

                    <div class="space-y-2 relative">
                      <label class="text-[13px] font-medium text-gray-700">Store</label>
                      <button
                        type="button"
                        (click)="openPicker('store')"
                        class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] shadow-sm transition-all"
                      >
                        <span>{{ selectedStoreLabel() || 'Select store' }}</span>
                        <ng-icon name="heroChevronDown" class="text-[14px] stroke-[2] text-gray-400"></ng-icon>
                      </button>
                    </div>

                    <div class="pt-8 mb-6">
                       <h3 class="text-[22px] font-black text-[#1A1C21] tracking-tight mb-2">Add description</h3>
                       <p class="text-[13px] text-gray-500 mb-6 leading-relaxed">Describe the upgrades and standout features that will appeal to buyers and make your listing more desirable.</p>
                       <div class="space-y-2">
                         <label class="text-[13px] font-medium text-gray-700">Description</label>
                         <textarea 
                           formControlName="description"
                           rows="5"
                           class="w-full bg-white border border-gray-100 rounded-xl p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-[#1A1C21] resize-none"
                         ></textarea>
                       </div>
                    </div>
                  </div>
                </div>
              }

              <!-- STEP 3: Delivery & Pricing -->
              @if (currentStep() === 3) {
                 <div class="mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:hidden">
                    <h2 class="max-w-[280px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Set your location and delivery preferences</h2>

                    <div class="mt-7 space-y-7">
                      <div class="space-y-5">
                        <div class="space-y-2 relative">
                          <label class="text-[12px] font-medium text-[#3F4452]">Location</label>
                          <button
                            type="button"
                            (click)="openPicker('location')"
                            class="flex w-full items-center justify-between rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-left text-[12px] font-medium text-[#202335] outline-none"
                          >
                            <span>{{ listingForm.value.location || 'Select location' }}</span>
                            <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                          </button>
                        </div>

                        <div class="grid grid-cols-2 gap-5">
                          <div class="space-y-2">
                            <label class="text-[12px] font-medium text-[#3F4452]">Your WhatsApp number</label>
                            <input
                              type="text"
                              formControlName="whatsappNumber"
                              class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                            >
                          </div>

                          <div class="space-y-2">
                            <label class="text-[12px] font-medium text-[#3F4452]">Your call number</label>
                            <input
                              type="text"
                              formControlName="callNumber"
                              class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                            >
                          </div>
                        </div>
                      </div>

                      <div class="space-y-3">
                        <label class="block text-[12px] font-medium text-[#3F4452]">Delivery options</label>
                        <div class="grid grid-cols-2 gap-3">
                          @for (opt of availableDeliveryOptions; track opt.id) {
                            <button
                              type="button"
                              (click)="toggleDeliveryOption(opt.id)"
                              class="flex items-center gap-2 rounded-[14px] border px-3 py-3 text-left transition-colors"
                              [class.border-[#6F56F6]]="isDeliveryOptionSelected(opt.id)"
                              [class.bg-[#F8F7FF]]="isDeliveryOptionSelected(opt.id)"
                              [class.text-[#2A2D34]]="isDeliveryOptionSelected(opt.id)"
                              [class.border-[#E1E3E8]]="!isDeliveryOptionSelected(opt.id)"
                              [class.bg-white]="!isDeliveryOptionSelected(opt.id)"
                              [class.text-[#2A2D34]]="!isDeliveryOptionSelected(opt.id)"
                            >
                              <span
                                class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border"
                                [class.border-[#6F56F6]]="isDeliveryOptionSelected(opt.id)"
                                [class.bg-[#6F56F6]]="isDeliveryOptionSelected(opt.id)"
                                [class.border-[#D4D7DE]]="!isDeliveryOptionSelected(opt.id)"
                                [class.bg-white]="!isDeliveryOptionSelected(opt.id)"
                              >
                                @if (isDeliveryOptionSelected(opt.id)) {
                                  <ng-icon name="heroCheck" class="text-[10px] text-white"></ng-icon>
                                }
                              </span>
                              <span class="text-[12px] font-medium">{{ opt.label }}</span>
                            </button>
                          }
                        </div>
                      </div>

                      <div class="pt-4">
                        <h3 class="text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">How much are you selling for?</h3>

                        <div class="mt-4 space-y-6">
                          <div class="space-y-2">
                            <label class="text-[12px] font-medium text-[#3F4452]">Price</label>
                            <div class="relative">
                              <input
                                type="number"
                                formControlName="price"
                                class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pl-9 text-[12px] font-medium text-[#202335] outline-none"
                              >
                              <span class="pointer-events-none absolute left-4 top-[14px] text-[12px] font-medium text-[#9BA0AA]">₦</span>
                            </div>
                          </div>

                          @if (listingForm.value.addDiscount) {
                            <div class="space-y-4 rounded-[16px] border border-[#E7DFFF] bg-[#FBFAFF] p-4">
                              <div class="space-y-2">
                                <label class="text-[12px] font-medium text-[#3F4452]">Discount price</label>
                                <div class="grid grid-cols-[108px_minmax(0,1fr)] gap-3">
                                  <div class="relative">
                                    <select
                                      formControlName="discountType"
                                      class="w-full appearance-none rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-9 text-[12px] font-medium text-[#202335] outline-none"
                                    >
                                      <option value="amount">Amount</option>
                                      <option value="percentage">Percentage</option>
                                    </select>
                                    <div class="pointer-events-none absolute right-3 top-[14px] text-[#8A8F9A]">
                                      <ng-icon name="heroChevronDown" class="text-[14px]"></ng-icon>
                                    </div>
                                  </div>

                                  <div class="relative">
                                    <input
                                      type="number"
                                      formControlName="discountPrice"
                                      class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 pr-12 text-[12px] font-medium text-[#202335] outline-none"
                                      [placeholder]="discountInputPlaceholder()"
                                    >
                                    <span class="pointer-events-none absolute right-4 top-[14px] text-[12px] font-medium text-[#9BA0AA]">
                                      {{ listingForm.value.discountType === 'percentage' ? '%' : 'NGN' }}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-2">
                                  <label class="text-[12px] font-medium text-[#3F4452]">Start date</label>
                                  <input
                                    type="date"
                                    formControlName="discountStartDate"
                                    class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                                  >
                                </div>

                                <div class="space-y-2">
                                  <label class="text-[12px] font-medium text-[#3F4452]">End date</label>
                                  <input
                                    type="date"
                                    formControlName="discountEndDate"
                                    class="w-full rounded-[14px] border border-[#DCDDE3] bg-white px-4 py-3.5 text-[12px] font-medium text-[#202335] outline-none"
                                  >
                                </div>
                              </div>

                              <div class="flex items-start gap-2 rounded-[14px] bg-[#FFFBEA] px-3 py-3 text-[#9A9300]">
                                <ng-icon name="heroInformationCircle" class="mt-0.5 shrink-0 text-[15px]"></ng-icon>
                                <p class="text-[11px] font-medium leading-5">
                                  Your listing price will go back to its default price after the end date
                                </p>
                              </div>
                            </div>
                          }

                          <div class="space-y-5">
                            <div class="flex items-start justify-between gap-4">
                              <div class="min-w-0">
                                <h4 class="text-[12px] font-medium text-[#202335]">Add discount</h4>
                                <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Let your buyers know if you are running a discount</p>
                              </div>
                              <button
                                type="button"
                                (click)="toggleBool('addDiscount')"
                                class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                                [class.bg-[#6F56F6]]="listingForm.value.addDiscount"
                                [class.bg-[#E4E6EB]]="!listingForm.value.addDiscount"
                              >
                                <span
                                  class="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                                  [class.translate-x-5]="listingForm.value.addDiscount"
                                ></span>
                              </button>
                            </div>

                            <div class="flex items-start justify-between gap-4">
                              <div class="min-w-0">
                                <h4 class="text-[12px] font-medium text-[#202335]">Accept offers from buyers</h4>
                                <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Buyers can submit price offers for your review</p>
                              </div>
                              <button
                                type="button"
                                (click)="toggleBool('acceptOffers')"
                                class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                                [class.bg-[#6F56F6]]="listingForm.value.acceptOffers"
                                [class.bg-[#E4E6EB]]="!listingForm.value.acceptOffers"
                              >
                                <span
                                  class="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                                  [class.translate-x-5]="listingForm.value.acceptOffers"
                                ></span>
                              </button>
                            </div>

                            <div class="flex items-start justify-between gap-4">
                              <div class="min-w-0">
                                <h4 class="text-[12px] font-medium text-[#202335]">List this item for free</h4>
                                <p class="mt-1 text-[11px] leading-5 text-[#8A8F9A]">Give this item away for free</p>
                              </div>
                              <button
                                type="button"
                                (click)="toggleBool('listForFree')"
                                class="relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors"
                                [class.bg-[#6F56F6]]="listingForm.value.listForFree"
                                [class.bg-[#E4E6EB]]="!listingForm.value.listForFree"
                              >
                                <span
                                  class="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow-sm transition-transform"
                                  [class.translate-x-5]="listingForm.value.listForFree"
                                ></span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>

                 <div class="hidden max-w-xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 md:block">
                    <h2 class="text-[24px] font-black text-[#1A1C21] tracking-tight mb-8">Set your location and delivery preferences</h2>
                    <div class="space-y-8">
                      <!-- Location block -->
                      <div class="space-y-6">
                        <div class="space-y-2 relative">
                          <label class="text-[13px] font-medium text-gray-700">Location</label>
                          <button
                             type="button"
                             (click)="openPicker('location')"
                             class="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] shadow-sm transition-all"
                          >
                            <span>{{ listingForm.value.location || 'Select location' }}</span>
                            <ng-icon name="heroChevronDown" class="text-[14px] stroke-[2] text-gray-400"></ng-icon>
                          </button>
                        </div>

                        <div class="grid grid-cols-2 gap-4">
                          <div class="space-y-2">
                            <label class="text-[13px] font-medium text-gray-700">Your WhatsApp number</label>
                            <input 
                              type="text" 
                              formControlName="whatsappNumber"
                              class="w-full bg-white border border-gray-100 rounded-xl p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-[#1A1C21] shadow-sm"
                            >
                          </div>
                          <div class="space-y-2">
                            <label class="text-[13px] font-medium text-gray-700">Your call number</label>
                            <input 
                              type="text" 
                              formControlName="callNumber"
                              class="w-full bg-white border border-gray-100 rounded-xl p-3.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-[#1A1C21] shadow-sm"
                            >
                          </div>
                        </div>
                      </div>

                      <!-- Delivery block -->
                      <div class="space-y-3">
                        <label class="text-[13px] font-medium text-gray-700 block">Delivery options</label>
                        <div class="grid grid-cols-3 gap-3">
                        @for (opt of availableDeliveryOptions; track opt.id) {
                          <div 
                             class="flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors"
                             [class.border-purple-600]="isDeliveryOptionSelected(opt.id)"
                             [class.bg-purple-50]="isDeliveryOptionSelected(opt.id)"
                             [class.border-gray-100]="!isDeliveryOptionSelected(opt.id)"
                             (click)="toggleDeliveryOption(opt.id)"
                          >
                             <div 
                                class="w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors"
                                [class.bg-purple-600]="isDeliveryOptionSelected(opt.id)"
                                [class.border-purple-600]="isDeliveryOptionSelected(opt.id)"
                                [class.border-gray-300]="!isDeliveryOptionSelected(opt.id)"
                             >
                                @if (isDeliveryOptionSelected(opt.id)) {
                                   <ng-icon name="heroCheck" class="text-[10px] text-white stroke-[3]"></ng-icon>
                                }
                             </div>
                             <span class="text-[13px] font-medium"
                               [class.text-purple-600]="isDeliveryOptionSelected(opt.id)"
                               [class.text-gray-500]="!isDeliveryOptionSelected(opt.id)"
                             >{{ opt.label }}</span>
                          </div>
                        }
                        </div>
                      </div>
                      
                      <div class="pt-6">
                        <h3 class="text-[22px] font-black text-[#1A1C21] tracking-tight mb-6">How much are you selling for?</h3>
                        
                        <div class="space-y-8">
                          <div class="space-y-2">
                            <label class="text-[13px] font-medium text-gray-700">Price</label>
                            <div class="relative">
                               <input 
                                 type="number" 
                                 formControlName="price"
                                 class="w-full bg-white border border-gray-100 rounded-xl p-3.5 pl-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all font-medium text-[#1A1C21] shadow-sm"
                               >
                               <span class="absolute left-4 top-[14px] text-[15px] font-medium text-gray-400 pointer-events-none">₦</span>
                            </div>
                          </div>

                          @if (listingForm.value.addDiscount) {
                            <div class="space-y-5 rounded-[20px] border border-purple-100 bg-[#FCFBFF] p-5">
                              <div class="space-y-2">
                                <label class="text-[13px] font-medium text-gray-700">Discount price</label>
                                <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
                                  <div class="relative">
                                    <select
                                      formControlName="discountType"
                                      class="w-full appearance-none rounded-xl border border-gray-100 bg-white p-3.5 pr-10 text-[15px] font-medium text-[#1A1C21] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                                    >
                                      <option value="amount">Amount</option>
                                      <option value="percentage">Percentage</option>
                                    </select>
                                    <div class="absolute right-4 top-[14px] pointer-events-none text-gray-400">
                                      <ng-icon name="heroChevronDown" class="text-[14px] stroke-[2]"></ng-icon>
                                    </div>
                                  </div>

                                  <div class="relative">
                                    <input
                                      type="number"
                                      formControlName="discountPrice"
                                      class="w-full rounded-xl border border-gray-100 bg-white p-3.5 pr-14 text-[15px] font-medium text-[#1A1C21] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                                      [placeholder]="discountInputPlaceholder()"
                                    >
                                    <span
                                      class="absolute right-4 top-[14px] text-[15px] font-medium text-gray-400 pointer-events-none"
                                    >
                                      {{ listingForm.value.discountType === 'percentage' ? '%' : 'NGN' }}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div class="grid grid-cols-2 gap-4">
                                <div class="space-y-2">
                                  <label class="text-[13px] font-medium text-gray-700">Start date</label>
                                  <div class="relative">
                                    <input
                                      type="date"
                                      formControlName="discountStartDate"
                                      class="w-full rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                                    >
                                  </div>
                                </div>

                                <div class="space-y-2">
                                  <label class="text-[13px] font-medium text-gray-700">End date</label>
                                  <div class="relative">
                                    <input
                                      type="date"
                                      formControlName="discountEndDate"
                                      class="w-full rounded-xl border border-gray-100 bg-white p-3.5 text-[15px] font-medium text-[#1A1C21] focus:outline-none focus:ring-2 focus:ring-purple-100 transition-all"
                                    >
                                  </div>
                                </div>
                              </div>

                              <div class="flex items-start gap-2 rounded-xl bg-[#FFFBEA] px-3 py-3 text-[#9A9300]">
                                <ng-icon name="heroInformationCircle" class="mt-0.5 text-[16px] shrink-0"></ng-icon>
                                <p class="text-[13px] font-medium leading-5">
                                  Your listing price will go back to its default price after the end date
                                </p>
                              </div>
                            </div>
                          }

                          <!-- Toggles -->
                          <div class="space-y-6">
                             <div class="flex items-center justify-between">
                               <div>
                                 <h4 class="text-[14px] font-bold text-[#1A1C21]">Add discount</h4>
                                 <p class="text-[13px] text-gray-400 mt-1">Let your buyers know if you are running a discount</p>
                               </div>
                               <button type="button" 
                                       (click)="toggleBool('addDiscount')"
                                       class="w-11 h-6 rounded-full relative transition-colors shadow-inner"
                                       [class.bg-purple-600]="listingForm.value.addDiscount"
                                       [class.bg-[#E5E7EB]]="!listingForm.value.addDiscount">
                                  <div class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                                       [class.translate-x-5]="listingForm.value.addDiscount"></div>
                               </button>
                             </div>

                             <div class="flex items-center justify-between">
                               <div>
                                 <h4 class="text-[14px] font-bold text-[#1A1C21]">Accept offers from buyers</h4>
                                 <p class="text-[13px] text-gray-400 mt-1">Buyers can submit price offers for your review</p>
                               </div>
                               <button type="button" 
                                       (click)="toggleBool('acceptOffers')"
                                       class="w-11 h-6 rounded-full relative transition-colors shadow-inner"
                                       [class.bg-purple-600]="listingForm.value.acceptOffers"
                                       [class.bg-[#E5E7EB]]="!listingForm.value.acceptOffers">
                                  <div class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                                       [class.translate-x-5]="listingForm.value.acceptOffers"></div>
                               </button>
                             </div>

                             <div class="flex items-center justify-between">
                               <div>
                                 <h4 class="text-[14px] font-bold text-[#1A1C21]">List this item for free</h4>
                                 <p class="text-[13px] text-gray-400 mt-1">Give this item away for free</p>
                               </div>
                               <button type="button" 
                                       (click)="toggleBool('listForFree')"
                                       class="w-11 h-6 rounded-full relative transition-colors shadow-inner"
                                       [class.bg-purple-600]="listingForm.value.listForFree"
                                       [class.bg-[#E5E7EB]]="!listingForm.value.listForFree">
                                  <div class="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full transition-transform shadow-sm"
                                       [class.translate-x-5]="listingForm.value.listForFree"></div>
                               </button>
                             </div>
                          </div>
                        </div>
                      </div>

                    </div>
                 </div>
              }
              
              @if (currentStep() === 4) {
                 <div class="mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:hidden">
                    <h2 class="max-w-[250px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Review your listing information</h2>
                    <p class="mt-1 text-[11px] font-medium text-[#8A8F9A]">Ensure all details are correct before listing</p>

                    <div class="mt-7 space-y-9">
                      <section>
                        <div class="mb-3 flex items-center justify-between gap-4">
                          <h3 class="text-[14px] font-medium text-[#202335]">Media</h3>
                          <button type="button" (click)="currentStep.set(1)" class="text-[12px] font-medium text-[#202335] underline underline-offset-2">Edit</button>
                        </div>

                        <div class="rounded-[18px] bg-[#FBFBFC] px-4 py-4">
                          <div class="grid grid-cols-[96px_minmax(0,1fr)] gap-x-4 gap-y-4">
                            <span class="text-[12px] font-medium text-[#8A8F9A]">Images</span>
                            <div class="grid grid-cols-2 gap-3">
                              @for (img of reviewImages().slice(0, 3); track img; let i = $index) {
                                <div class="relative aspect-square overflow-hidden rounded-[14px] border border-[#E7E9EF] bg-white">
                                  <img [src]="img" alt="" class="h-full w-full object-cover">
                                  @if (i === 1 && reviewImages().length > 3) {
                                    <div class="absolute inset-0 flex items-center justify-center bg-black/50 text-[12px] font-medium text-white">
                                      +{{ reviewImages().length - 2 }} others
                                    </div>
                                  }
                                </div>
                              }
                            </div>

                            <span class="text-[12px] font-medium leading-6 text-[#8A8F9A]">Embedded video link</span>
                            <div class="flex min-h-[92px] items-center justify-end">
                              @if (reviewImages()[1]) {
                                <div class="relative aspect-square w-[92px] overflow-hidden rounded-[14px] border border-[#E7E9EF] bg-white">
                                  <img [src]="reviewImages()[1]" alt="" class="h-full w-full object-cover">
                                  <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#202335] shadow-sm">
                                      ▶
                                    </div>
                                  </div>
                                </div>
                              } @else {
                                <span class="text-[12px] font-medium text-[#202335]">---</span>
                              }
                            </div>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div class="mb-3 flex items-center justify-between gap-4">
                          <h3 class="text-[14px] font-medium text-[#202335]">Details</h3>
                          <button type="button" (click)="currentStep.set(2)" class="text-[12px] font-medium text-[#202335] underline underline-offset-2">Edit</button>
                        </div>

                        <div class="rounded-[18px] bg-[#FBFBFC] px-4 py-4">
                          <div class="grid grid-cols-[110px_minmax(0,1fr)] gap-x-4 gap-y-3">
                            <span class="text-[12px] font-medium text-[#8A8F9A]">Item name</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ listingForm.value.name || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Category</span>
                            <span class="text-right text-[12px] font-medium leading-6 text-[#202335]">{{ selectedCategoryLabel() || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Condition</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ selectedConditionLabel() || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Store</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ selectedStoreLabel() || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Description</span>
                            <span class="text-right text-[12px] font-medium leading-6 text-[#202335]">{{ listingForm.value.description || '---' }}</span>
                          </div>
                        </div>
                      </section>

                      <section>
                        <div class="mb-3 flex items-center justify-between gap-4">
                          <h3 class="text-[14px] font-medium text-[#202335]">Delivery & Pricing</h3>
                          <button type="button" (click)="currentStep.set(3)" class="text-[12px] font-medium text-[#202335] underline underline-offset-2">Edit</button>
                        </div>

                        <div class="rounded-[18px] bg-[#FBFBFC] px-4 py-4">
                          <div class="grid grid-cols-[120px_minmax(0,1fr)] gap-x-4 gap-y-3">
                            <span class="text-[12px] font-medium text-[#8A8F9A]">Location</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ listingForm.value.location || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Delivery options</span>
                            <span class="text-right text-[12px] font-medium leading-6 text-[#202335]">{{ getSelectedDeliveryOptionNames() }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">WhatsApp number</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ listingForm.value.whatsappNumber || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Call number</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ listingForm.value.callNumber || '---' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Price</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">₦{{ (listingForm.value.price | number) || '0' }}</span>

                            <span class="text-[12px] font-medium text-[#8A8F9A]">Accept offers</span>
                            <span class="text-right text-[12px] font-medium text-[#202335]">{{ listingForm.value.acceptOffers ? 'Yes' : 'No' }}</span>
                          </div>
                        </div>
                      </section>
                    </div>
                 </div>

                 <div class="hidden max-w-3xl lg:max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-500 pb-32 md:block">
                    <h2 class="text-[24px] font-black text-[#1A1C21] tracking-tight mb-2">Review your listing information</h2>
                    <p class="text-[14px] text-gray-400 font-medium mb-10">Ensure all details are correct before listing</p>

                    <!-- Media Section -->
                    <div class="mb-10">
                       <div class="flex items-center justify-between mb-4">
                          <h3 class="text-[20px] font-black text-[#1A1C21]">Media</h3>
                          <button type="button" (click)="currentStep.set(1)" class="text-[14px] font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors">Edit</button>
                       </div>
                       <div class="bg-[#FAFAFA] rounded-[24px] p-8">
                          <div class="flex flex-col gap-8">
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0 mt-1">Images</span>
                                <div class="flex items-center gap-3">
                                   <!-- Show up to 4 images -->
                                   @for (img of reviewImages().slice(0, 4); track i; let i = $index) {
                                      <div class="relative w-[88px] h-[88px] rounded-[16px] overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                                         @if (img) {
                                            <img [src]="img" class="w-full h-full object-cover">
                                         } @else {
                                            <div class="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                                              <ng-icon name="heroPhoto"></ng-icon>
                                            </div>
                                         }
                                         @if (i === 3 && reviewImages().length > 4) {
                                            <div class="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[1px]">
                                               <span class="text-white font-bold text-[13px]">+{{ reviewImages().length - 3 }} others</span>
                                            </div>
                                         }
                                      </div>
                                   }
                                   @if (reviewImages().length === 0) {
                                      <span class="text-[15px] font-medium text-[#1A1C21] mt-1">---</span>
                                   }
                                </div>
                             </div>
                             <div class="flex items-center">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Embedded video link</span>
                                <span class="text-[15px] font-medium text-[#1A1C21]">---</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- Details Section -->
                    <div class="mb-10">
                       <div class="flex items-center justify-between mb-4">
                          <h3 class="text-[20px] font-black text-[#1A1C21]">Details</h3>
                          <button type="button" (click)="currentStep.set(2)" class="text-[14px] font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors">Edit</button>
                       </div>
                       <div class="bg-[#FAFAFA] rounded-[24px] p-8">
                          <div class="flex flex-col gap-6">
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Item name</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ listingForm.value.name || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Category</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ selectedCategoryLabel() || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Condition</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ selectedConditionLabel() || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Store</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ selectedStoreLabel() || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Description</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] leading-relaxed flex-1">{{ listingForm.value.description || '---' }}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    <!-- Delivery & Pricing Section -->
                    <div class="mb-10">
                       <div class="flex items-center justify-between mb-4">
                          <h3 class="text-[20px] font-black text-[#1A1C21]">Delivery & Pricing</h3>
                          <button type="button" (click)="currentStep.set(3)" class="text-[14px] font-medium text-gray-600 underline underline-offset-2 hover:text-gray-900 transition-colors">Edit</button>
                       </div>
                       <div class="bg-[#FAFAFA] rounded-[24px] p-8">
                          <div class="flex flex-col gap-6">
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Location</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ listingForm.value.location || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Delivery options</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">
                                   {{ getSelectedDeliveryOptionNames() }}
                                </span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">WhatsApp number</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ listingForm.value.whatsappNumber || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Call number</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">{{ listingForm.value.callNumber || '---' }}</span>
                             </div>
                             <div class="flex items-start">
                                <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Price</span>
                                <span class="text-[15px] font-medium text-[#1A1C21] flex-1">₦{{ (listingForm.value.price | number) || '0' }}</span>
                             </div>
                             @if (listingForm.value.addDiscount) {
                               <div class="flex items-start">
                                  <span class="text-[15px] text-gray-400 font-medium w-48 shrink-0">Discount</span>
                                  <span class="text-[15px] font-medium text-[#1A1C21] flex-1">
                                     {{ listingForm.value.discountType === 'percentage' ? ((listingForm.value.discountPrice || 0) + '%') : ('₦' + ((listingForm.value.discountPrice | number) || '0')) }}
                                     @if (listingForm.value.discountStartDate || listingForm.value.discountEndDate) {
                                       <span class="text-gray-400">
                                         ({{ listingForm.value.discountStartDate || 'No start date' }} - {{ listingForm.value.discountEndDate || 'No end date' }})
                                       </span>
                                     }
                                  </span>
                               </div>
                             }
                          </div>
                       </div>
                    </div>

                 </div>
              }

              <!-- STEP 5: Success -->
              @if (currentStep() === 5) {
                 <div class="mx-auto flex flex-col items-center py-10 text-center animate-in fade-in slide-in-from-bottom-8 duration-700 md:hidden">
                    <div class="relative mb-8 flex w-full justify-center">
                      <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                        <div class="absolute left-[18%] top-4 h-1 w-1 rounded-full bg-[#E85D75]"></div>
                        <div class="absolute left-[24%] top-10 h-1 w-1 rounded-full bg-[#6F56F6]"></div>
                        <div class="absolute left-[30%] top-6 h-1 w-1 rounded-full bg-[#40C057]"></div>
                        <div class="absolute left-[36%] top-12 h-1 w-1 rounded-full bg-[#4DABF7]"></div>
                        <div class="absolute left-[44%] top-3 h-1 w-1 rounded-full bg-[#FFD43B]"></div>
                        <div class="absolute left-[56%] top-8 h-1 w-1 rounded-full bg-[#DA77F2]"></div>
                        <div class="absolute right-[36%] top-5 h-1 w-1 rounded-full bg-[#40C057]"></div>
                        <div class="absolute right-[28%] top-10 h-1 w-1 rounded-full bg-[#4DABF7]"></div>
                        <div class="absolute right-[21%] top-4 h-1 w-1 rounded-full bg-[#E85D75]"></div>
                        <div class="absolute right-[16%] top-12 h-1 w-1 rounded-full bg-[#FFD43B]"></div>
                      </div>

                      <div class="relative z-10 w-[132px] rounded-[18px] bg-white p-2 shadow-[0_24px_38px_-28px_rgba(32,35,53,0.55)] ring-1 ring-[#ECEEF4]">
                        <div class="pointer-events-none scale-[0.78] origin-top-left">
                          <app-listing-card [listing]="previewListing()" [showFavorite]="false"></app-listing-card>
                        </div>
                      </div>
                    </div>

                    <h2 class="max-w-[280px] text-[18px] font-semibold leading-10 tracking-[-0.03em] text-[#202335]">Your listing is live on Duduzili 🎉</h2>
                    <p class="mt-1 text-[11px] font-medium text-[#8A8F9A]">You also boosted it for 7 days</p>

                    <div class="mt-8 grid w-full grid-cols-2 gap-3">
                      <button
                        type="button"
                        (click)="resetForm()"
                        class="inline-flex min-h-12 items-center justify-center rounded-full bg-[#F5F5F7] px-4 py-3 text-[14px] font-medium text-[#202335]"
                      >
                        Add another listing
                      </button>
                      <button
                        type="button"
                        (click)="close.emit()"
                        class="inline-flex min-h-12 items-center justify-center rounded-full bg-[#6F56F6] px-4 py-3 text-[14px] font-medium text-white shadow-[0_18px_28px_-18px_rgba(111,86,246,0.95)]"
                      >
                        View listing
                      </button>
                    </div>

                    <div class="mt-10 flex w-full items-center gap-3">
                      <div class="h-px flex-1 bg-[#ECEEF4]"></div>
                      <span class="text-[11px] font-medium text-[#B0B4BE]">OR SHARE VIA</span>
                      <div class="h-px flex-1 bg-[#ECEEF4]"></div>
                    </div>

                    <div class="mt-8 flex w-full items-center gap-3 rounded-full bg-[#F7F7F9] px-4 py-3">
                      <span class="min-w-0 flex-1 truncate text-left text-[12px] font-medium text-[#5F6470]">https://duduzili.com/listing001</span>
                      <button
                        type="button"
                        class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#E1E3E8] bg-white text-[#202335]"
                        aria-label="Copy link"
                      >
                        <ng-icon name="heroDocumentDuplicate" class="text-[18px]"></ng-icon>
                      </button>
                    </div>

                    <div class="mt-6 flex items-center justify-center gap-5">
                      <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F9] text-[#111111]" aria-label="Share on X">
                        <svg fill="currentColor" viewBox="0 0 24 24" class="h-5 w-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </button>
                      <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F9] text-[#25D366]" aria-label="Share on WhatsApp">
                        <svg fill="currentColor" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12.031 0A12.03 12.03 0 0 0 0 12.03c0 2.378.618 4.698 1.791 6.745L.044 24l5.345-1.401A11.97 11.97 0 0 0 12.03 24c6.643 0 12.03-5.385 12.03-12.029A12.03 12.03 0 0 0 12.031 0m6.417 17.15c-.266.75-1.554 1.432-2.158 1.503-.54.062-1.258.18-3.568-.781-2.8-1.168-4.576-4.01-4.714-4.195-.14-.184-1.127-1.503-1.127-2.864 0-1.362.706-2.031.956-2.28 0 0 .367-.369.832-.369.176 0 .332.006.464.012.214.011.5-.084.78.591.353.845 1.205 2.949 1.312 3.166.108.217.18.471.042.748-.138.277-.208.448-.415.698-.207.25-.436.56-.622.736-.208.196-.43.407-.197.808.233.4 1.034 1.705 2.222 2.766 1.528 1.365 2.8 1.789 3.197 1.957.398.17.632.146.868-.124.237-.27.994-1.159 1.261-1.556.265-.398.532-.332.895-.198.363.136 2.308 1.085 2.705 1.282.398.197.664.296.76.463.096.168.096.974-.17 1.725"/></svg>
                      </button>
                      <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F9] text-[#E4405F]" aria-label="Share on Instagram">
                        <svg fill="currentColor" viewBox="0 0 24 24" class="h-5 w-5"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.98-10.366a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
                      </button>
                      <button type="button" class="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F9] text-[#1877F2]" aria-label="Share on Facebook">
                        <svg fill="currentColor" viewBox="0 0 24 24" class="h-5 w-5"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </button>
                    </div>
                 </div>

                 <div class="hidden max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 text-center py-12 md:flex flex-col items-center">
                    
                    <!-- Confetti background container via absolute dots -->
                    <div class="relative w-full flex justify-center mb-10 mt-10">
                       <div class="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center translate-y-[-20px]">
                         <div class="absolute top-0 left-[30%] w-1.5 h-1.5 rounded-full bg-[#E4405F] rotate-12"></div>
                         <div class="absolute top-10 left-[28%] w-1 h-1 rounded-sm bg-[#1877F2] rotate-45"></div>
                         <div class="absolute top-4 right-[30%] w-1.5 h-1.5 bg-yellow-400 rotate-[30deg]"></div>
                         <div class="absolute top-16 right-[26%] w-1.5 h-1.5 rounded-full bg-[#25D366]"></div>
                         <div class="absolute top-8 left-[38%] w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                         <div class="absolute top-20 left-[20%] w-1.5 h-1.5 bg-[#E4405F] rotate-[60deg]"></div>
                         <div class="absolute top-6 right-[40%] w-1.5 h-1.5 rounded-full bg-[#1877F2]"></div>
                         <div class="absolute top-24 right-[20%] w-1 h-1 bg-yellow-400 rotate-12"></div>
                       </div>

                       <div class="relative z-10 w-64 transform transition-all hover:scale-105 duration-500 shadow-2xl rounded-[24px]">
                          <div class="pointer-events-none">
                             <app-listing-card [listing]="previewListing()" [showFavorite]="false"></app-listing-card>
                          </div>
                       </div>
                    </div>

                    <h2 class="text-[24px] font-black text-[#1A1C21] tracking-tight mb-2">Your listing is live on Duduzili 🎉</h2>
                    <p class="text-[14px] font-medium text-gray-400 mb-10">You also boosted it for 7 days</p>

                    <div class="flex items-center gap-4 mb-16 px-10 w-full max-w-[460px] mx-auto">
                       <button type="button" (click)="resetForm()" class="flex-1 bg-[#FAFAFA] hover:bg-gray-100 text-[#1A1C21] py-3.5 rounded-full font-bold transition-all text-[15px]">
                          Add another listing
                       </button>
                       <button type="button" (click)="close.emit()" class="flex-1 bg-[#5932EA] hover:bg-purple-700 text-white py-3.5 rounded-full font-bold transition-all text-[15px] shadow-sm">
                          View listing
                       </button>
                    </div>

                    <div class="relative w-full max-w-[380px] mx-auto mb-10 flex items-center justify-center">
                       <div class="absolute inset-0 flex items-center">
                          <div class="w-full border-t border-gray-100"></div>
                       </div>
                       <span class="bg-white px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest relative z-10">OR SHARE VIA</span>
                    </div>

                    <div class="flex items-center justify-center gap-3.5">
                       <!-- Link Copy -->
                       <div class="flex items-center justify-between border border-gray-100 rounded-full pl-5 pr-1.5 py-1.5 bg-[#FAFAFA] w-[260px]">
                          <span class="text-[11px] text-gray-500 truncate mt-0.5">https://duduzili.com/listing001</span>
                          <button type="button" class="flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1.5 hover:bg-gray-50 transition-colors">
                             <span class="text-[11px] font-bold text-[#1A1C21]">Copy link</span>
                             <ng-icon name="heroDocumentDuplicate" class="text-[12px] text-[#1A1C21]"></ng-icon>
                          </button>
                       </div>
                       
                       <!-- Social Icons -->
                       <button type="button" class="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <svg fill="currentColor" viewBox="0 0 24 24" class="w-[15px] h-[15px] text-[#1A1C21]"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                       </button>
                       <button type="button" class="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <svg fill="currentColor" viewBox="0 0 24 24" class="w-[18px] h-[18px] text-[#25D366]"><path d="M12.031 0A12.03 12.03 0 0 0 0 12.03c0 2.378.618 4.698 1.791 6.745L.044 24l5.345-1.401A11.97 11.97 0 0 0 12.03 24c6.643 0 12.03-5.385 12.03-12.029A12.03 12.03 0 0 0 12.031 0m6.417 17.15c-.266.75-1.554 1.432-2.158 1.503-.54.062-1.258.18-3.568-.781-2.8-1.168-4.576-4.01-4.714-4.195-.14-.184-1.127-1.503-1.127-2.864 0-1.362.706-2.031.956-2.28 0 0 .367-.369.832-.369.176 0 .332.006.464.012.214.011.5-.084.78.591.353.845 1.205 2.949 1.312 3.166.108.217.18.471.042.748-.138.277-.208.448-.415.698-.207.25-.436.56-.622.736-.208.196-.43.407-.197.808.233.4 1.034 1.705 2.222 2.766 1.528 1.365 2.8 1.789 3.197 1.957.398.17.632.146.868-.124.237-.27.994-1.159 1.261-1.556.265-.398.532-.332.895-.198.363.136 2.308 1.085 2.705 1.282.398.197.664.296.76.463.096.168.096.974-.17 1.725"/></svg>
                       </button>
                       <button type="button" class="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <svg fill="currentColor" viewBox="0 0 24 24" class="w-[18px] h-[18px] text-[#E4405F]"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm3.98-10.366a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z"/></svg>
                       </button>
                       <button type="button" class="w-10 h-10 rounded-full bg-[#FAFAFA] flex items-center justify-center hover:bg-gray-100 transition-colors">
                          <svg fill="currentColor" viewBox="0 0 24 24" class="w-[18px] h-[18px] text-[#1877F2]"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                       </button>
                    </div>

                 </div>
              }

            </form>
          </div>

          <!-- Bottom Floating Action Bar -->
          @if (currentStep() < 5) {
            <div class="absolute bottom-0 left-0 right-0 hidden p-8 bg-gradient-to-t from-white via-white to-transparent pointer-events-none md:flex auto justify-end gap-4">
            @if (currentStep() > 1) {
              <button 
                type="button"
                (click)="prevStep()"
                [disabled]="isPublishing() || isSavingDraft()"
                class="pointer-events-auto bg-[#F3F4F6] hover:bg-gray-200 text-[#1A1C21] px-8 py-3.5 rounded-full font-medium transition-all active:scale-95 text-[15px] disabled:opacity-50 disabled:pointer-events-none"
              >
                Back
              </button>
            }
            <button 
              type="button"
              (click)="currentStep() === 4 ? publish() : nextStep()" 
              [disabled]="isPublishing() || isSavingDraft()"
              class="pointer-events-auto bg-[#5932EA] hover:bg-purple-700 text-white px-8 py-3.5 rounded-full font-medium transition-all active:scale-95 text-[15px] shadow-sm disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              @if (currentStep() === 4 && isPublishing()) {
                <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              }
              {{ currentStep() === 4 ? 'List item' : 'Continue' }}
            </button>
          </div>
          }

          @if (currentStep() < 5) {
            <div class="absolute bottom-0 left-0 right-0 border-t border-[#ECEEF4] bg-white px-5 pb-6 pt-3 md:hidden">
              <div class="grid gap-3" [class.grid-cols-2]="currentStep() > 1">
                @if (currentStep() > 1) {
                  <button
                    type="button"
                    (click)="prevStep()"
                    [disabled]="isPublishing() || isSavingDraft()"
                    class="inline-flex min-h-14 items-center justify-center rounded-full border border-[#E7E9EF] bg-white px-6 py-4 text-[14px] font-medium text-[#202335] disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Back
                  </button>
                }

                <button
                  type="button"
                  (click)="currentStep() === 4 ? publish() : nextStep()"
                  [disabled]="isPublishing() || isSavingDraft()"
                  class="inline-flex min-h-14 items-center justify-center rounded-full bg-[#6F56F6] px-6 py-4 text-[14px] font-medium text-white shadow-[0_18px_28px_-18px_rgba(111,86,246,0.95)] disabled:opacity-50 disabled:pointer-events-none gap-2"
                >
                  @if (currentStep() === 4 && isPublishing()) {
                    <svg class="animate-spin h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  }
                  {{ currentStep() === 4 ? 'List item' : 'Continue' }}
                </button>
              </div>
            </div>
          }

        </div>

        <!-- Right Sidebar: Live Preview (Hidden on Review Step) -->
        @if (currentStep() < 4) {
          <div class="w-80 lg:w-[400px] shrink-0 bg-[#FAFAFA] border-l border-gray-100 flex flex-col pt-8 px-6 lg:px-10 overflow-y-auto hidden md:flex">
            <div class="mb-6">
              <h2 class="text-[20px] font-black text-[#1A1C21] mb-1">Preview</h2>
              <p class="text-xs font-medium text-gray-400">This is how your listing will appear to buyers</p>
            </div>

            <!-- Scale down the preview card slightly -->
            <div class="transform scale-[0.85] origin-top bg-white rounded-[24px] shadow-sm overflow-hidden p-2">
              <div class="pointer-events-none">
                <app-listing-card [listing]="previewListing()" [showFavorite]="false"></app-listing-card>
              </div>
            </div>
          </div>
        }

      </div>

      @if (activePicker(); as picker) {
        <button
          type="button"
          class="fixed inset-0 z-[70] bg-black/30"
          (click)="closePicker()"
          aria-label="Close picker"
        ></button>

        <section
          class="fixed inset-x-0 bottom-0 z-[80] rounded-t-[28px] bg-white px-4 pb-6 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)] md:hidden"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="pickerTitle()"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex items-center justify-between">
            <button
              type="button"
              (click)="closePicker()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
              aria-label="Close picker"
            >
              <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
            </button>
            <h3 class="text-[16px] font-semibold text-[#202335]">{{ pickerTitle() }}</h3>
            <span class="h-10 w-10"></span>
          </div>

          @if (pickerHasSearch()) {
            <label class="mt-5 flex items-center gap-2 rounded-[14px] border border-[#E1E3E8] bg-white px-4 py-3">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px] text-[#9BA0AA]"></ng-icon>
              <input
                type="search"
                [value]="pickerSearch()"
                (input)="pickerSearch.set($any($event.target).value)"
                [placeholder]="pickerSearchPlaceholder()"
                class="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#202335] outline-none placeholder:text-[#B1B5BF]"
              />
            </label>
          }

          <div class="mt-4 max-h-[52vh] overflow-y-auto">
            @for (option of filteredPickerOptions(); track option.value) {
              <button
                type="button"
                (click)="selectPickerOption(option.value)"
                class="flex w-full items-center justify-between gap-3 rounded-[14px] px-2 py-3 text-left hover:bg-[#F8F8FB]"
              >
                <span class="flex min-w-0 items-center gap-3">
                  @if (option.image) {
                    <img [src]="option.image" alt="" class="h-8 w-8 rounded-full object-cover" />
                  }
                  <span class="min-w-0">
                    <span class="block truncate text-[13px] font-medium text-[#202335]">{{ option.label }}</span>
                    @if (option.subtitle) {
                      <span class="block truncate text-[11px] text-[#8A8F9A]">{{ option.subtitle }}</span>
                    }
                  </span>
                </span>
                <ng-icon name="heroChevronRight" class="text-[16px] text-[#9BA0AA]"></ng-icon>
              </button>
            }
          </div>
        </section>

        <section
          class="fixed left-1/2 top-1/2 z-[80] hidden w-[min(540px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#ECEEF4] bg-white p-6 shadow-[0_20px_80px_rgba(32,35,53,0.18)] md:block"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="pickerTitle()"
        >
          <div class="flex items-center justify-between gap-4">
            <h3 class="text-[20px] font-semibold text-[#1A1C21]">{{ pickerTitle() }}</h3>
            <button
              type="button"
              (click)="closePicker()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7FA] text-[#2A2D34]"
              aria-label="Close picker"
            >
              <ng-icon name="heroXMark" class="text-[18px]"></ng-icon>
            </button>
          </div>

          @if (pickerHasSearch()) {
            <label class="mt-5 flex items-center gap-2 rounded-[14px] border border-[#E1E3E8] bg-white px-4 py-3">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px] text-[#9BA0AA]"></ng-icon>
              <input
                type="search"
                [value]="pickerSearch()"
                (input)="pickerSearch.set($any($event.target).value)"
                [placeholder]="pickerSearchPlaceholder()"
                class="min-w-0 flex-1 bg-transparent text-[14px] font-medium text-[#202335] outline-none placeholder:text-[#B1B5BF]"
              />
            </label>
          }

          <div class="mt-5 max-h-[420px] overflow-y-auto">
            @for (option of filteredPickerOptions(); track option.value) {
              <button
                type="button"
                (click)="selectPickerOption(option.value)"
                class="flex w-full items-center justify-between gap-4 rounded-[14px] px-3 py-3 text-left hover:bg-[#F8F8FB]"
              >
                <span class="flex min-w-0 items-center gap-3">
                  @if (option.image) {
                    <img [src]="option.image" alt="" class="h-10 w-10 rounded-full object-cover" />
                  }
                  <span class="min-w-0">
                    <span class="block truncate text-[14px] font-medium text-[#202335]">{{ option.label }}</span>
                    @if (option.subtitle) {
                      <span class="block truncate text-[12px] text-[#8A8F9A]">{{ option.subtitle }}</span>
                    }
                  </span>
                </span>
                <ng-icon name="heroChevronRight" class="text-[16px] text-[#9BA0AA]"></ng-icon>
              </button>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: #f1f1f1;
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: #e2e2e2;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddListingModalComponent implements OnDestroy {
  private fb = inject(FormBuilder);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly listingsService = inject(ListingsService);
  private readonly appToastService = inject(AppToastService);
  
  close = output<void>();
  save = output<ListingData>();
  draftSaved = output<void>();
  listingPublished = output<void>();
  readonly categoryOptionsInput = input<readonly PickerOption[]>([]);
  readonly storeOptionsInput = input<readonly PickerOption[]>([]);

  currentStep = signal(1);
  isPublishing = signal(false);
  isSavingDraft = signal(false);
  
  listingForm!: FormGroup;

  steps = [
    { id: 1, name: 'Media' },
    { id: 2, name: 'Details' },
    { id: 3, name: 'Delivery & Pricing' },
    { id: 4, name: 'Review' }
  ];

  readonly activePicker = signal<PickerKind | null>(null);
  readonly pickerSearch = signal('');

  readonly conditionOptions: readonly PickerOption[] = [
    { value: 'new', label: 'Brand new' },
    { value: 'used', label: 'Fairly used' },
  ];

  readonly locationOptions: readonly PickerOption[] = [
    { value: 'Ikeja, Lagos', label: 'Ikeja, Lagos', subtitle: 'Lagos State' },
    { value: 'Yaba, Lagos', label: 'Yaba, Lagos', subtitle: 'Lagos State' },
    { value: 'Lekki, Lagos', label: 'Lekki, Lagos', subtitle: 'Lagos State' },
    { value: 'Surulere, Lagos', label: 'Surulere, Lagos', subtitle: 'Lagos State' },
    { value: 'Asaba, Delta', label: 'Asaba, Delta', subtitle: 'Delta State' },
    { value: 'Warri, Delta', label: 'Warri, Delta', subtitle: 'Delta State' },
    { value: 'Abuja, FCT', label: 'Abuja, FCT', subtitle: 'Federal Capital Territory' },
    { value: 'Port Harcourt, Rivers', label: 'Port Harcourt, Rivers', subtitle: 'Rivers State' },
    { value: 'Enugu, Enugu', label: 'Enugu, Enugu', subtitle: 'Enugu State' },
    { value: 'Benin City, Edo', label: 'Benin City, Edo', subtitle: 'Edo State' },
  ];

  mainImage = signal<string | null>(null);
  additionalImages = signal<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);

  readonly categoryOptions = computed(() => this.categoryOptionsInput());
  readonly storeOptions = computed(() => this.storeOptionsInput());

  formValues: any;
  private createdObjectUrls = new Set<string>();
  private mainImageFile: File | null = null;
  private additionalImageFiles: Array<File | null> = [null, null, null, null, null];

  constructor() {
    this.mobileOverlayService.setAddListingOpen(true);
    this.listingForm = this.fb.group({
      name: ['', Validators.required],
      category: ['', Validators.required],
      condition: ['', Validators.required],
      store: ['', Validators.required],
      description: [''],
      youtubeLink: [''],
      location: ['', Validators.required],
      whatsappNumber: [''],
      callNumber: [''],
      deliveryOptions: [[] as string[], Validators.required],
      price: [null],
      addDiscount: [false],
      discountType: ['amount'],
      discountPrice: [null],
      discountStartDate: [''],
      discountEndDate: [''],
      acceptOffers: [false],
      listForFree: [false],
      images: [[] as string[]]
    });

    this.formValues = toSignal(this.listingForm.valueChanges, { initialValue: this.listingForm.value });
  }

  availableDeliveryOptions = [
    { id: 'buyer_pickup', label: 'Buyer pickup' },
    { id: 'seller_delivery', label: 'Seller delivery' },
    { id: 'public_location', label: 'Public location' },
    { id: 'nation_wide', label: 'Nation-wide' },
    { id: 'state_wide', label: 'State-wide' },
    { id: 'international', label: 'International' },
  ];

  imageSlots = computed(() =>
    this.additionalImages().map((image, index) => ({
      id: `slot-${index + 2}`,
      index,
      image,
      position: index + 2,
    })),
  );

  reviewImages = computed(() => [
    ...(this.mainImage() ? [this.mainImage()] : []),
    ...this.additionalImages().filter((image): image is string => !!image),
  ]);

  discountInputPlaceholder = computed(() =>
    this.formValues().discountType === 'percentage' ? '10' : '2,000,000',
  );

  filteredPickerOptions = computed(() => {
    const query = this.pickerSearch().trim().toLowerCase();
    const options = this.optionsForPicker(this.activePicker());

    if (!query) {
      return options;
    }

    return options.filter((option) =>
      option.label.toLowerCase().includes(query) ||
      option.subtitle?.toLowerCase().includes(query),
    );
  });

  previewListing = computed(() => {
     const form = this.formValues();
     const previewImages = this.reviewImages();
     const basePrice = Number(form.price) || 0;
     const hasDiscount = !!form.addDiscount && !!form.discountPrice && basePrice > 0;
     const discountValue = Number(form.discountPrice) || 0;
     const discountedPrice = hasDiscount
       ? form.discountType === 'percentage'
         ? Math.max(basePrice - (basePrice * discountValue) / 100, 0)
         : Math.max(discountValue, 0)
       : basePrice;

     return {
        id: 'preview',
        title: form.name || 'Untitled listing',
        price: `₦${discountedPrice.toLocaleString()}`,
        originalPrice: hasDiscount ? `₦${basePrice.toLocaleString()}` : undefined,
        discountBadge: hasDiscount && form.discountType === 'percentage' ? `-${discountValue}%` : undefined,
        images: previewImages.length > 0 ? previewImages : ['https://via.placeholder.com/400'],
        location: form.location || 'Location',
        timeAgo: 'Just now',
        isVerified: true
     } as any;
  });

  stepTitle = computed(() => {
    return this.steps.find(s => s.id === this.currentStep())?.name || 'Add Listing';
  });

  stepIcon = computed(() => {
    return 'heroPlus'; // Unused in new design but kept for safety
  });

  pickerTitle(): string {
    switch (this.activePicker()) {
      case 'category':
        return 'Choose a category';
      case 'condition':
        return 'Choose condition';
      case 'store':
        return 'Select a store';
      case 'location':
        return 'Select location';
      default:
        return 'Select option';
    }
  }

  pickerHasSearch(): boolean {
    return this.activePicker() !== 'condition';
  }

  pickerSearchPlaceholder(): string {
    switch (this.activePicker()) {
      case 'category':
        return 'Search category';
      case 'store':
        return 'Search stores';
      case 'location':
        return 'Search location';
      default:
        return 'Search';
    }
  }

  selectedCategoryLabel(): string {
    const currentValue = this.listingForm.value.category as string | null;
    return this.categoryOptions().find((option) => option.value === currentValue)?.label ?? '';
  }

  selectedStoreLabel(): string {
    const currentValue = this.listingForm.value.store as string | null;
    return this.storeOptions().find((option) => option.value === currentValue)?.label ?? '';
  }

  selectedConditionLabel(): string {
    const currentValue = this.listingForm.value.condition as string | null;
    return this.conditionOptions.find((option) => option.value === currentValue)?.label ?? '';
  }

  openPicker(kind: PickerKind): void {
    this.pickerSearch.set('');
    this.activePicker.set(kind);
  }

  closePicker(): void {
    this.pickerSearch.set('');
    this.activePicker.set(null);
  }

  selectPickerOption(value: string): void {
    const kind = this.activePicker();
    if (!kind) {
      return;
    }

    const controlName = kind === 'store' ? 'store' : kind;
    this.listingForm.patchValue({ [controlName]: value });
    this.closePicker();
  }

  nextStep() {
    if (this.currentStep() < 4) {
      this.currentStep.update(s => s + 1);
    }
  }

  ngOnDestroy() {
    this.mobileOverlayService.setAddListingOpen(false);
    this.revokeAllObjectUrls();
  }

  prevStep() {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  isDeliveryOptionSelected(id: string): boolean {
    const current = this.listingForm.get('deliveryOptions')?.value as string[];
    return current?.includes(id);
  }

  toggleDeliveryOption(id: string) {
    const current = this.listingForm.get('deliveryOptions')?.value as string[];
    if (current.includes(id)) {
      this.listingForm.patchValue({
        deliveryOptions: current.filter(m => m !== id)
      });
    } else {
      this.listingForm.patchValue({
        deliveryOptions: [...current, id]
      });
    }
  }

  toggleBool(field: string) {
    const nextValue = !this.listingForm.value[field];
    this.listingForm.patchValue({ [field]: nextValue });

    if (field === 'addDiscount' && !nextValue) {
      this.listingForm.patchValue({
        discountType: 'amount',
        discountPrice: null,
        discountStartDate: '',
        discountEndDate: '',
      });
    }
  }

  getSelectedDeliveryOptionNames(): string {
    const selectedIds = this.listingForm.get('deliveryOptions')?.value as string[] || [];
    if (!selectedIds.length) return '---';
    return selectedIds
      .map(id => this.availableDeliveryOptions.find(o => o.id === id)?.label)
      .filter(Boolean)
      .join(', ');
  }

  publish() {
    void this.publishListing();
  }

  saveDraft(): void {
    void this.persistDraft();
  }

  private async publishListing(): Promise<void> {
    if (this.isPublishing()) {
      return;
    }

    if (!this.listingForm.valid) {
      this.listingForm.markAllAsTouched();
      const invalidFields: string[] = [];
      const controls = this.listingForm.controls;

      if (controls['name'].invalid) invalidFields.push('Listing Title');
      if (controls['category'].invalid) invalidFields.push('Category');
      if (controls['condition'].invalid) invalidFields.push('Condition');
      if (controls['store'].invalid) invalidFields.push('Store');
      if (controls['location'].invalid) invalidFields.push('Location');
      if (controls['deliveryOptions'].invalid) invalidFields.push('Delivery Options');

      const message = invalidFields.length > 0
        ? `Please fill in the required fields: ${invalidFields.join(', ')}.`
        : 'Please fill in all required fields correctly.';

      this.appToastService.show({
        message,
        durationMs: 3500,
      });
      return;
    }

    this.isPublishing.set(true);

    try {
      await firstValueFrom(this.listingsService.createListing(this.buildCreateListingPayload()));
      this.listingPublished.emit();
      this.currentStep.set(5);
    } catch {
      this.appToastService.show({
        message: 'Your listing couldn’t be published right now. Please try again.',
        durationMs: 2600,
      });
    } finally {
      this.isPublishing.set(false);
    }
  }

  private async persistDraft(): Promise<void> {
    if (this.isSavingDraft()) {
      return;
    }

    if (!this.listingForm.valid) {
      this.listingForm.markAllAsTouched();
      const invalidFields: string[] = [];
      const controls = this.listingForm.controls;

      if (controls['name'].invalid) invalidFields.push('Listing Title');
      if (controls['category'].invalid) invalidFields.push('Category');
      if (controls['condition'].invalid) invalidFields.push('Condition');
      if (controls['store'].invalid) invalidFields.push('Store');
      if (controls['location'].invalid) invalidFields.push('Location');
      if (controls['deliveryOptions'].invalid) invalidFields.push('Delivery Options');

      const message = invalidFields.length > 0
        ? `Please complete the required fields before saving this draft: ${invalidFields.join(', ')}.`
        : 'Please complete the required listing details before saving this draft.';

      this.appToastService.show({
        message,
        durationMs: 3500,
      });
      return;
    }

    this.isSavingDraft.set(true);

    try {
      await firstValueFrom(this.listingsService.saveListingDraft(this.buildCreateListingPayload()));
      this.appToastService.show({
        message: 'Listing saved to drafts.',
        durationMs: 2200,
      });
      this.draftSaved.emit();
      this.close.emit();
    } catch {
      this.appToastService.show({
        message: 'Your draft couldn’t be saved right now. Please try again.',
        durationMs: 2600,
      });
    } finally {
      this.isSavingDraft.set(false);
    }
  }

  resetForm() {
     this.revokeAllObjectUrls();
     this.listingForm.reset();
     this.listingForm.patchValue({
       name: '',
       category: '',
       condition: '',
       store: '',
       description: '',
       youtubeLink: '',
       location: '',
       whatsappNumber: '',
       callNumber: '',
       deliveryOptions: [],
       price: null,
       addDiscount: false,
       discountType: 'amount',
       discountPrice: null,
       discountStartDate: '',
       discountEndDate: '',
       acceptOffers: false,
       listForFree: false,
       images: [],
     });
     this.mainImage.set(null);
     this.additionalImages.set([null, null, null, null, null]);
     this.mainImageFile = null;
     this.additionalImageFiles = [null, null, null, null, null];
     this.currentStep.set(1);
  }

  openFilePicker(input: HTMLInputElement, event?: Event) {
    event?.stopPropagation();
    input.click();
  }

  onMainImageSelected(event: Event) {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    const nextUrl = this.createObjectUrl(file);
    const previousUrl = this.mainImage();
    if (previousUrl) {
      this.revokeObjectUrl(previousUrl);
    }

    this.mainImage.set(nextUrl);
    this.mainImageFile = file;
    this.syncImagesToForm();
    this.resetFileInput(event);
  }

  onAdditionalImageSelected(index: number, event: Event) {
    const file = this.getSelectedFile(event);
    if (!file) {
      return;
    }

    const nextUrl = this.createObjectUrl(file);
    const previousUrl = this.additionalImages()[index];
    if (previousUrl) {
      this.revokeObjectUrl(previousUrl);
    }

    this.additionalImages.update((images) =>
      images.map((image, currentIndex) => currentIndex === index ? nextUrl : image),
    );
    this.additionalImageFiles[index] = file;
    this.syncImagesToForm();
    this.resetFileInput(event);
  }

  private getSelectedFile(event: Event): File | null {
    const input = event.target as HTMLInputElement | null;
    return input?.files?.[0] ?? null;
  }

  private resetFileInput(event: Event) {
    const input = event.target as HTMLInputElement | null;
    if (input) {
      input.value = '';
    }
  }

  private createObjectUrl(file: File): string {
    const url = URL.createObjectURL(file);
    this.createdObjectUrls.add(url);
    return url;
  }

  private revokeObjectUrl(url: string) {
    if (!this.createdObjectUrls.has(url)) {
      return;
    }

    URL.revokeObjectURL(url);
    this.createdObjectUrls.delete(url);
  }

  private revokeAllObjectUrls() {
    for (const url of this.createdObjectUrls) {
      URL.revokeObjectURL(url);
    }
    this.createdObjectUrls.clear();
  }

  private syncImagesToForm() {
    this.listingForm.patchValue(
      {
        images: this.reviewImages(),
      },
      { emitEvent: false },
    );
  }

  private buildCreateListingPayload(): FormData {
    const formValue = this.listingForm.getRawValue() as {
      name: string;
      category: string;
      condition: string;
      store: string;
      description: string;
      youtubeLink?: string;
      location: string;
      whatsappNumber: string;
      callNumber: string;
      deliveryOptions: string[];
      price: number | null;
      addDiscount: boolean;
      discountType: string;
      discountPrice: number | null;
      discountStartDate: string;
      discountEndDate: string;
      acceptOffers: boolean;
      listForFree: boolean;
    };

    const payload = new FormData();
    payload.append('title', formValue.name);
    payload.append('category', formValue.category);
    payload.append('condition', formValue.condition);
    payload.append('store', formValue.store);
    payload.append('description', formValue.description ?? '');
    payload.append('location', formValue.location);
    payload.append('whatsapp_number', formValue.whatsappNumber ?? '');
    payload.append('call_number', formValue.callNumber ?? '');
    payload.append('accept_offers', String(!!formValue.acceptOffers));
    payload.append('is_free', String(!!formValue.listForFree));

    if (formValue.price !== null && formValue.price !== undefined && !formValue.listForFree) {
      payload.append('price', String(formValue.price));
    }

    if (formValue.youtubeLink?.trim()) {
      payload.append('youtube_link', formValue.youtubeLink.trim());
    }

    for (const deliveryOption of formValue.deliveryOptions ?? []) {
      payload.append('delivery_options', deliveryOption);
    }

    if (formValue.addDiscount && formValue.discountPrice !== null && formValue.discountPrice !== undefined) {
      payload.append('discount_type', formValue.discountType);
      payload.append('discount_value', String(formValue.discountPrice));

      if (formValue.discountStartDate) {
        payload.append('discount_start_date', formValue.discountStartDate);
      }

      if (formValue.discountEndDate) {
        payload.append('discount_end_date', formValue.discountEndDate);
      }
    }

    if (this.mainImageFile) {
      payload.append('uploaded_images', this.mainImageFile);
    }

    for (const imageFile of this.additionalImageFiles) {
      if (imageFile) {
        payload.append('uploaded_images', imageFile);
      }
    }

    return payload;
  }

  private optionsForPicker(kind: PickerKind | null): readonly PickerOption[] {
    switch (kind) {
      case 'category':
        return this.categoryOptions();
      case 'condition':
        return this.conditionOptions;
      case 'store':
        return this.storeOptions();
      case 'location':
        return this.locationOptions;
      default:
        return [];
    }
  }
}
