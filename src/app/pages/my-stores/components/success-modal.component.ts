import { ChangeDetectionStrategy, Component, OnDestroy, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

@Component({
  selector: 'app-success-modal',
  imports: [CommonModule],
  template: `
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity">
      <div class="fixed inset-x-0 bottom-0 top-3 rounded-t-[34px] bg-white px-4 pb-5 pt-3 shadow-2xl md:hidden">
        <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E7E8EE]"></div>

        <div class="flex h-full flex-col items-center justify-center px-4 pb-10 text-center text-[#202335]">
          <div class="relative mb-8 h-32 w-32">
            <div class="absolute inset-0 rounded-full bg-yellow-50 blur-2xl opacity-60"></div>
            <div class="relative z-10 flex h-full flex-col items-center justify-center">
              <div class="mb-[-4px] rounded bg-red-500 px-2 py-0.5 text-[10px] font-black text-white shadow-sm">STORE</div>
              <div class="relative h-16 w-24 overflow-hidden rounded-t-lg border-b-2 border-yellow-500 bg-yellow-400">
                <div class="absolute inset-x-4 bottom-0 top-4 rounded bg-sky-200"></div>
              </div>
              <div class="h-3 w-28 rounded-b-lg bg-[#8C4B2B] shadow-md"></div>
            </div>
          </div>

          <h2 class="text-[18px] font-semibold leading-7 tracking-[-0.03em]">Store created successfully</h2>
          <p class="mt-3 max-w-[250px] text-[11px] leading-5 text-[#8A8F9A]">
            You have successfully created <span class="font-medium text-[#202335]">{{ storeName() }}</span>
          </p>

          <div class="mt-8 flex w-full items-center gap-3">
            <button (click)="addAnother.emit()" class="flex-1 rounded-full bg-[#F3F4F7] px-4 py-3 text-[12px] font-medium text-[#202335]">
              Add another store
            </button>
            <button (click)="ok.emit()" class="flex-1 rounded-full bg-[#6F56F6] px-4 py-3 text-[12px] font-medium text-white shadow-[0_18px_30px_-18px_rgba(111,86,246,0.95)]">
              Done
            </button>
          </div>
        </div>
      </div>

      <div 
        class="hidden w-full max-w-sm flex-col items-center rounded-[32px] bg-white p-8 text-center shadow-2xl transition-all scale-100 md:flex"
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
export class SuccessModalComponent implements OnDestroy {
  storeName = input('The Vine Collections');
  ok = output<void>();
  addAnother = output<void>();
  private readonly mobileOverlayService = inject(MobileOverlayService);

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
