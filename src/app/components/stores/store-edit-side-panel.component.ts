import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroPencil } from '@ng-icons/heroicons/outline';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-store-edit-side-panel',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  providers: [
    provideIcons({ heroXMark, heroPencil })
  ],
  template: `
    <div class="fixed inset-0 z-100 flex items-center justify-center lg:justify-end p-4 lg:p-0 border-none shadow-none">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" (click)="close.emit()"></div>
      
      <!-- Side Panel -->
      <div class="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 fill-mode-both">
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute right-6 top-6 w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-all z-10">
          <ng-icon name="heroXMark" class="text-xl"></ng-icon>
        </button>

        <!-- Form content -->
        <div class="flex-1 overflow-y-auto p-8 pt-10">
          <h2 class="text-3xl font-black text-[#1A1C21] mb-8">Edit store</h2>

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
export class StoreEditSidePanelComponent {
  store = input.required<any>();
  close = output<void>();
  save = output<any>();

  editForm: FormGroup;

  constructor(private fb: FormBuilder) {
    console.log('StoreEditSidePanelComponent initialized');
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      location: ['Ikeja, Lagos'],
      whatsappNumber: [''],
      callNumber: ['']
    });
  }

  ngOnInit() {
    console.log('StoreEditSidePanelComponent ngOnInit');
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
}
