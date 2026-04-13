import { ChangeDetectionStrategy, Component, OnDestroy, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPencil, heroChevronDown } from '@ng-icons/heroicons/outline';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

@Component({
  selector: 'app-store-edit-side-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  providers: [
    provideIcons({ heroXMark, heroPencil, heroChevronDown })
  ],
  template: `
    <div class="fixed inset-0 z-100 flex items-center justify-center lg:justify-end p-4 lg:p-0 border-none shadow-none">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>

      <div class="fixed inset-x-0 bottom-0 top-3 rounded-t-[34px] bg-white px-4 pb-4 pt-3 shadow-2xl md:hidden">
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E7E8EE]"></div>

        <div class="mt-2 flex justify-end">
          <button (click)="close.emit()" class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]">
            <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
          </button>
        </div>

        <div class="mt-2 flex h-[calc(100%-3.25rem)] flex-col overflow-hidden text-[#202335]">
          <div class="flex-1 overflow-y-auto pb-4">
            <h2 class="text-[18px] font-semibold tracking-[-0.03em]">Edit store</h2>

            <form [formGroup]="editForm" class="mt-5 space-y-5">
              <section>
                <h3 class="text-[14px] font-semibold">General information</h3>
                <p class="mt-1 text-[10px] leading-4 text-[#8A8F9A]">Fill out general information about this store</p>

                <div class="mt-4 space-y-4">
                  <div>
                    <label class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">Store name</label>
                    <input type="text" formControlName="name" class="h-11 w-full rounded-[12px] border border-[#E6E8EE] bg-white px-3 text-[12px] outline-none">
                  </div>

                  <div>
                    <label class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">Location</label>
                    <div class="relative">
                      <select formControlName="location" class="h-11 w-full appearance-none rounded-[12px] border border-[#E6E8EE] bg-white px-3 pr-10 text-[12px] outline-none">
                        <option value="Ikeja, Lagos">Ikeja, Lagos</option>
                        <option value="Lekki, Lagos">Lekki, Lagos</option>
                        <option value="Island, Lagos">Island, Lagos</option>
                        <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                      </select>
                      <div class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#8A8F9A]">
                        <ng-icon name="heroChevronDown" class="text-[16px]"></ng-icon>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">WhatsApp Number</label>
                    <input type="tel" formControlName="whatsappNumber" class="h-11 w-full rounded-[12px] border border-[#E6E8EE] bg-white px-3 text-[12px] outline-none">
                  </div>

                  <div>
                    <label class="mb-1.5 block text-[10px] font-medium text-[#6D7280]">Call number</label>
                    <input type="tel" formControlName="callNumber" class="h-11 w-full rounded-[12px] border border-[#E6E8EE] bg-white px-3 text-[12px] outline-none">
                  </div>
                </div>
              </section>

              <section>
                <h3 class="text-[14px] font-semibold">Profile photo</h3>
                <p class="mt-1 text-[10px] leading-4 text-[#8A8F9A]">Recommended size: 100 x 100</p>

                <div class="mt-3 flex items-center gap-4">
                  <div class="h-16 w-16 overflow-hidden rounded-full border border-[#E6E8EE] bg-[#F7F8FA]">
                    <img [src]="store().logo" [alt]="store().name" class="h-full w-full object-cover">
                  </div>
                  <button type="button" class="inline-flex items-center gap-2 rounded-full border border-[#ECEEF4] bg-white px-4 py-2 text-[11px] font-medium text-[#202335] shadow-sm">
                    <ng-icon name="heroPencil" class="text-[14px]"></ng-icon>
                    Change
                  </button>
                </div>
              </section>
            </form>
          </div>

          <button (click)="onSubmit()" class="rounded-full bg-[#6F56F6] px-5 py-3 text-[12px] font-medium text-white shadow-[0_18px_30px_-18px_rgba(111,86,246,0.95)]">
            Save changes
          </button>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="relative hidden h-full w-full max-w-md bg-white shadow-2xl md:flex md:flex-col animate-in slide-in-from-right duration-300 fill-mode-both">
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all z-10">
          <ng-icon name="heroXMark" class="text-xl"></ng-icon>
        </button>

        <!-- Form content -->
        <div class="flex-1 overflow-y-auto p-8 pt-10">
          <h2 class="text-[28px] font-black text-[#1A1C21] mb-8">Edit store</h2>

          <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="space-y-10 pb-8">
            
            <!-- General Information -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold text-[#1A1C21] mb-1">General information</h3>
                <p class="text-sm text-gray-400 font-medium">Fill out general information about this store</p>
              </div>

              <div class="space-y-5">
                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 ml-1">Store name</label>
                  <input type="text" formControlName="name" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium shadow-sm">
                </div>

                <div class="space-y-2">
                  <label class="text-xs font-bold text-gray-500 ml-1">Location</label>
                  <div class="relative group">
                    <select formControlName="location" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium shadow-sm appearance-none cursor-pointer">
                      <option value="Ikeja, Lagos">Ikeja, Lagos</option>
                      <option value="Lekki, Lagos">Lekki, Lagos</option>
                      <option value="Island, Lagos">Island, Lagos</option>
                      <option value="Abuja, Nigeria">Abuja, Nigeria</option>
                    </select>
                    <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-500 ml-1">WhatsApp number</label>
                    <input type="tel" formControlName="whatsappNumber" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium shadow-sm">
                  </div>
                  <div class="space-y-2">
                    <label class="text-xs font-bold text-gray-500 ml-1">Call number</label>
                    <input type="tel" formControlName="callNumber" class="w-full bg-white border border-gray-100 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium shadow-sm">
                  </div>
                </div>
              </div>
            </div>

            <!-- Profile Photo -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold text-[#1A1C21] mb-1">Profile photo</h3>
                <p class="text-sm text-gray-400 font-medium tracking-tight">Recommended size: 100 x 100</p>
              </div>
              
              <div class="flex items-center gap-6">
                <div class="w-28 h-28 rounded-full overflow-hidden border border-gray-50 shadow-sm relative shrink-0">
                  <img [src]="store().logo" class="w-full h-full object-cover">
                </div>
                <button type="button" class="flex items-center gap-2 bg-white border border-gray-100 px-4 py-2.5 rounded-xl text-sm font-bold text-[#1A1C21] hover:bg-gray-50 transition-all shadow-sm">
                  <ng-icon name="heroPencil" class="text-base"></ng-icon>
                  Change
                </button>
              </div>
            </div>

            <!-- Cover Photo -->
            <div class="space-y-6">
              <div>
                <h3 class="text-lg font-bold text-[#1A1C21] mb-1">Cover photo</h3>
                <p class="text-sm text-gray-400 font-medium tracking-tight">Recommended size: 1080 x 90</p>
              </div>
              
              <div class="relative w-full h-40 rounded-2xl overflow-hidden border border-gray-50 shadow-sm">
                <img [src]="store().banner" class="w-full h-full object-cover">
                <div class="absolute top-4 right-4 animate-in fade-in duration-500">
                  <button type="button" class="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-[#1A1C21] hover:bg-white transition-all shadow-sm">
                    <ng-icon name="heroPencil" class="text-base"></ng-icon>
                    Change
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer Actions -->
        <div class="p-8 border-t border-gray-50 flex gap-4 bg-gray-50/30">
          <button (click)="close.emit()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-[#1A1C21] px-6 py-4 rounded-full font-bold transition-all">
            Cancel
          </button>
          <button (click)="onSubmit()" class="flex-1 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-4 rounded-full font-bold transition-all shadow-lg shadow-indigo-100 active:scale-95">
            Save changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    input::placeholder {
      color: #9CA3AF;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreEditSidePanelComponent implements OnDestroy {
  store = input.required<any>();
  close = output<void>();
  save = output<any>();
  private readonly mobileOverlayService = inject(MobileOverlayService);

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.mobileOverlayService.openMobileModal();
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      location: ['Ikeja, Lagos'],
      whatsappNumber: [''],
      callNumber: ['']
    });
  }

  ngOnInit() {
    if (this.store()) {
      this.editForm.patchValue({
        name: this.store().name,
        location: this.store().location || 'Ikeja, Lagos',
        whatsappNumber: this.store().whatsappNumber || '',
        callNumber: this.store().callNumber || ''
      });
    }
  }

  onSubmit() {
    if (this.editForm.valid) {
      this.save.emit(this.editForm.value);
    }
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
