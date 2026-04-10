import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-verification-details-modal',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({ heroXMark })
  ],
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div 
        class="bg-white w-full max-w-xl max-h-[90vh] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col"
        (click)="$event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-8 py-6 flex items-center justify-between border-b border-gray-50 flex-none">
          <h2 class="text-[19px] font-semibold text-[#1A1C21] tracking-tight">
            Verification request details
          </h2>
          <button 
            (click)="close.emit()" 
            class="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <!-- Content Area -->
        <div class="flex-1 overflow-y-auto p-8">
          
          <!-- Summary Card -->
          <div class="border border-gray-100 rounded-2xl p-6 mb-8 shadow-xs">
            <h3 class="mb-6 text-[16px] font-semibold text-[#1A1C21]">Summary</h3>
            <div class="space-y-6">
              <div class="grid grid-cols-[180px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">ID type</span>
                <span class="text-[13px] font-medium text-[#1A1C21]">Driver's license</span>
              </div>
              <div class="grid grid-cols-[180px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Issuing country/region</span>
                <span class="text-[13px] font-medium text-[#1A1C21]">Nigeria</span>
              </div>
              <div class="grid grid-cols-[180px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Mode of capture</span>
                <span class="text-[13px] font-medium text-[#1A1C21]">Photo upload</span>
              </div>
              <div class="grid grid-cols-[180px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Date uploaded</span>
                <span class="text-[13px] font-medium text-[#1A1C21]">Aug 4, 2025</span>
              </div>
            </div>
          </div>

          <!-- Media Card -->
          <div class="border border-gray-100 rounded-2xl p-6 shadow-xs">
            <h3 class="mb-6 text-[16px] font-semibold text-[#1A1C21]">Media</h3>
            <div class="space-y-8">
              
              <!-- Front -->
              <div class="grid grid-cols-[100px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Front</span>
                <div class="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=250&fit=crop" 
                    alt="ID Front" 
                    class="object-cover w-full h-full"
                  >
                </div>
              </div>

              <!-- Back -->
              <div class="grid grid-cols-[100px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Back</span>
                <div class="relative w-48 h-32 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 shadow-sm flex items-center justify-center">
                  <img 
                    src="https://images.unsplash.com/photo-1628151015968-3a4429e9ef04?w=400&h=250&fit=crop" 
                    alt="ID Back" 
                    class="object-cover w-full h-full opacity-80"
                  >
                </div>
              </div>

              <!-- Selfie -->
              <div class="grid grid-cols-[100px_1fr] items-center gap-4">
                <span class="text-[13px] text-gray-400">Selfie</span>
                <div class="relative w-32 h-32 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                  <img 
                    src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=250&h=250&fit=crop" 
                    alt="Selfie" 
                    class="object-cover w-full h-full"
                  >
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VerificationDetailsModalComponent {
  close = output<void>();
}
