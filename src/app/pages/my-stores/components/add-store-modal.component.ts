import { ChangeDetectionStrategy, Component, output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark, heroCamera, heroCheck } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-add-store-modal',
  imports: [CommonModule, ReactiveFormsModule, NgIcon],
  providers: [
    provideIcons({ heroXMark, heroCamera, heroCheck })
  ],
  template: `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" (click)="close.emit()">
      <div 
        class="bg-white rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col shadow-2xl transition-all animate-in zoom-in-95 slide-in-from-bottom-8 duration-500"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="p-10 pb-6 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 class="text-[28px] font-black text-[#1A1C21] tracking-tight">Add new store</h2>
          <button (click)="close.emit()" class="p-3 rounded-full hover:bg-gray-50 transition-colors text-gray-400 hover:text-gray-900 group">
            <ng-icon name="heroXMark" class="text-2xl group-hover:rotate-90 transition-transform duration-300"></ng-icon>
          </button>
        </div>

        <!-- Scrollable Content -->
        <div class="p-10 pt-0 space-y-12">
          <!-- General Info Section -->
          <section>
            <div class="mb-8">
              <h3 class="text-lg font-black text-[#1A1C21] mb-1">General information</h3>
              <p class="text-[13px] text-gray-400 font-medium">Fill in the basic info to set up your store</p>
            </div>

            <form [formGroup]="storeForm" class="space-y-6">
              <div>
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Store name</label>
                <input 
                  type="text" 
                  formControlName="name"
                  placeholder="Enter store name"
                  class="w-full bg-[#fcfcfc] border border-gray-100 rounded-2xl py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium placeholder:text-gray-300"
                >
              </div>

              <div>
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Location</label>
                <div class="relative group">
                  <select 
                    formControlName="location"
                    class="w-full bg-[#fcfcfc] border border-gray-100 rounded-2xl py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium appearance-none cursor-pointer placeholder:text-gray-300"
                  >
                    <option value="" disabled>Select location</option>
                    <option value="lagos">Lagos, Nigeria</option>
                    <option value="abuja">Abuja, Nigeria</option>
                    <option value="accra">Accra, Ghana</option>
                  </select>
                  <div class="absolute inset-y-0 right-6 flex items-center pointer-events-none text-gray-400 group-hover:text-purple-500 transition-colors">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Store category</label>
                <div class="flex flex-wrap gap-2">
                  @for (cat of categories; track cat) {
                    <button 
                      type="button"
                      (click)="toggleCategory(cat)"
                      class="px-5 py-2.5 rounded-full text-xs font-bold transition-all border select-none scale-100 active:scale-95"
                      [class.bg-purple-600]="isSelected(cat)"
                      [class.text-white]="isSelected(cat)"
                      [class.border-purple-600]="isSelected(cat)"
                      [class.bg-[#fcfcfc]]="!isSelected(cat)"
                      [class.text-gray-500]="!isSelected(cat)"
                      [class.border-gray-100]="!isSelected(cat)"
                      [class.hover:border-purple-200]="!isSelected(cat)"
                    >
                      @if (isSelected(cat)) {
                        <ng-icon name="heroCheck" class="mr-1 inline-block"></ng-icon>
                      }
                      {{cat}}
                    </button>
                  }
                </div>
              </div>

              <div>
                <label class="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">Phone number</label>
                <input 
                  type="tel" 
                  formControlName="phone"
                  placeholder="Enter phone number" 
                  class="w-full bg-[#fcfcfc] border border-gray-100 rounded-2xl py-4.5 px-6 text-sm focus:outline-none focus:ring-4 focus:ring-purple-50 focus:border-purple-200 transition-all font-medium font-mono placeholder:text-gray-300"
                >
              </div>
            </form>
          </section>

          <!-- Profile Photo Section -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-black text-[#1A1C21] mb-1">Profile photo</h3>
              <p class="text-[13px] text-gray-400 font-medium">Recommended size is 512 x 512</p>
            </div>
            <div 
              (click)="simulateUpload('profile')"
              class="w-28 h-28 rounded-full bg-[#fcfcfc] border-2 border-dashed border-gray-100 flex items-center justify-center cursor-pointer hover:bg-white hover:border-purple-200 transition-all group overflow-hidden relative shadow-inner"
            >
              @if (profilePreview()) {
                <img [src]="profilePreview()" class="w-full h-full object-cover animate-in fade-in zoom-in-75 duration-300">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ng-icon name="heroCamera" class="text-2xl text-white"></ng-icon>
                </div>
              } @else {
                <ng-icon name="heroCamera" class="text-3xl text-gray-300 group-hover:text-purple-400 group-hover:scale-110 transition-all"></ng-icon>
              }
            </div>
          </section>

          <!-- Cover Photo Section -->
          <section>
            <div class="mb-4">
              <h3 class="text-lg font-black text-[#1A1C21] mb-1">Cover photo</h3>
              <p class="text-[13px] text-gray-400 font-medium">Recommended size is 1024 x 1024</p>
            </div>
            <div 
              (click)="simulateUpload('cover')"
              class="w-full h-44 rounded-[32px] bg-[#fcfcfc] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-white hover:border-purple-200 transition-all group relative overflow-hidden"
            >
              @if (coverPreview()) {
                <img [src]="coverPreview()" class="absolute inset-0 w-full h-full object-cover animate-in fade-in duration-500">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button class="bg-white px-6 py-2.5 rounded-2xl text-sm font-black text-[#1A1C21] shadow-xl">Change Cover</button>
                </div>
              } @else {
                <div class="bg-white w-12 h-12 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-center group-hover:scale-110 group-hover:text-purple-500 transition-all duration-300">
                  <ng-icon name="heroCamera" class="text-2xl text-gray-300 group-hover:text-purple-400 transition-colors"></ng-icon>
                </div>
                <button class="bg-white px-6 py-2.5 rounded-2xl text-xs font-black text-[#1A1C21] shadow-sm border border-gray-100 group-hover:translate-y-[-2px] transition-transform">Upload</button>
                <span class="text-[11px] text-gray-400 font-black uppercase tracking-widest">JPEG, PNG only</span>
              }
            </div>
          </section>
        </div>

        <!-- Footer Actions -->
        <div class="p-10 pt-6 flex items-center gap-4 sticky bottom-0 bg-white/95 backdrop-blur-md z-10 border-t border-gray-50">
          <button (click)="close.emit()" class="flex-1 py-5 rounded-[24px] font-black text-gray-400 hover:text-gray-900 transition-all text-sm select-none">
            Back
          </button>
          <button 
            (click)="onSubmit()"
            [disabled]="!storeForm.valid"
            class="flex-1 py-5 rounded-[24px] font-black text-white bg-purple-600 hover:bg-purple-700 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none transition-all shadow-2xl shadow-purple-200 active:scale-[0.98] text-sm select-none"
          >
            Ready
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { scrollbar-gutter: stable; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: #eee; border-radius: 10px; }
    ::-webkit-scrollbar-thumb:hover { background: #ddd; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddStoreModalComponent {
  close = output<void>();
  submit = output<any>();

  private readonly fb = inject(FormBuilder);
  
  readonly categories = ['Electronics', 'Fashion', 'Home Decor', 'Beauty', 'Health', 'Travel', 'Food', 'Other'];
  readonly selectedCategories = signal<string[]>([]);
  readonly profilePreview = signal<string | null>(null);
  readonly coverPreview = signal<string | null>(null);

  storeForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    location: ['', [Validators.required]],
    categories: [[]],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+ ]+$/)]]
  });

  toggleCategory(cat: string) {
    this.selectedCategories.update(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
    this.storeForm.patchValue({ categories: this.selectedCategories() });
  }

  isSelected(cat: string): boolean {
    return this.selectedCategories().includes(cat);
  }

  simulateUpload(type: 'profile' | 'cover') {
    // Simulate a photo pick from Unsplash for visual feedback
    if (type === 'profile') {
      this.profilePreview.set(`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'}?w=200&h=200&fit=crop`);
    } else {
      this.coverPreview.set(`https://images.unsplash.com/photo-${Math.random() > 0.5 ? '1441986300917-64674bd600d8' : '1555529669-e69e7aa0ba9a'}?w=800&h=400&fit=crop`);
    }
  }

  onSubmit() {
    if (this.storeForm.valid) {
      this.submit.emit({
        ...this.storeForm.value,
        logo: this.profilePreview() || 'https://cdn-icons-png.flaticon.com/512/3233/3233483.png',
        banner: this.coverPreview() || 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&h=200&fit=crop'
      });
    }
  }
}
