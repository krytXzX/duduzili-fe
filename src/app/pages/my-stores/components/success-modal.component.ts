import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-modal',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div 
        class="bg-white rounded-[32px] w-full max-w-sm p-8 flex flex-col items-center text-center shadow-2xl transition-all scale-100"
      >
        <div class="mb-6 relative w-48 h-48 flex items-center justify-center">
          <!-- Illustration of a store sign -->
          <div class="absolute inset-0 bg-yellow-50 rounded-full blur-2xl opacity-50 scale-75"></div>
          <div class="relative z-10 flex flex-col items-center">
            <div class="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm mb-[-4px] z-20">STORE</div>
            <div class="w-24 h-16 bg-yellow-400 rounded-t-lg relative border-b-2 border-yellow-500 overflow-hidden">
               <div class="absolute inset-0 flex">
                 <div class="flex-1 border-r border-yellow-500/30"></div>
                 <div class="flex-1 border-r border-yellow-500/30"></div>
                 <div class="flex-1 border-r border-yellow-500/30"></div>
               </div>
            </div>
            <div class="w-28 h-6 bg-purple-700 rounded-b-lg shadow-md border-t border-purple-800"></div>
            <div class="w-16 h-2 bg-gray-100 rounded-full mt-4 blur-[1px]"></div>
          </div>
        </div>

        <h2 class="text-[21px] font-black text-gray-900 mb-2">Store created successfully</h2>
        <p class="text-[13px] text-gray-400 font-medium leading-relaxed mb-10">
          Your store is successfully created and has been published.
        </p>

        <div class="flex items-center gap-3 w-full">
          <button (click)="addAnother.emit()" class="flex-1 py-4 rounded-2xl font-bold text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-gray-600 transition-all">
            Add another
          </button>
          <button (click)="ok.emit()" class="flex-1 py-4 rounded-2xl font-bold text-white bg-purple-600 hover:bg-purple-700 transition-all shadow-lg shadow-purple-100 active:scale-95">
            OK
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SuccessModalComponent {
  ok = output<void>();
  addAnother = output<void>();
}
