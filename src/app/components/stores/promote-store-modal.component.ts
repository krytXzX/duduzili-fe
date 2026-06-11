import { ChangeDetectionStrategy, Component, output, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { 
  heroXMark, 
  heroRocketLaunch, 
  heroWallet, 
  heroGlobeAlt, 
  heroCheck 
} from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-promote-store-modal',
  standalone: true,
  imports: [CommonModule, NgIcon, DecimalPipe],
  providers: [
    provideIcons({ 
      heroXMark, 
      heroStarSolid, 
      heroRocketLaunch, 
      heroWallet, 
      heroGlobeAlt, 
      heroCheck 
    })
  ],
  template: `
    <div class="fixed inset-0 z-100 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/20 backdrop-blur-[2px]" (click)="close.emit()"></div>
      
      <!-- Modal Container -->
      <div 
        class="relative bg-white rounded-[32px] overflow-hidden animate-in fade-in zoom-in-95 duration-300 shadow-2xl transition-all"
        [class.w-full]="step() > 1"
        [style.max-width]="modalMaxWidth()"
      >
        
        <!-- STEP 1: Confirmation -->
        @if (step() === 1) {
           <div class="p-10 pt-16 flex flex-col items-center text-center">
              <button 
                (click)="close.emit()"
                class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white border border-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all shadow-sm hover:bg-gray-50 active:scale-95 duration-200"
              >
                <ng-icon name="heroXMark" class="text-xl"></ng-icon>
              </button>

              <!-- Icon Section -->
              <div class="relative mb-10">
                <div class="w-32 h-32 rounded-full bg-yellow-50/50 flex items-center justify-center">
                  <div class="w-24 h-24 rounded-full bg-yellow-100/50 flex items-center justify-center">
                     <div class="w-16 h-16 rounded-[20px] bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-100">
                        <ng-icon name="heroStarSolid" class="text-white text-2xl"></ng-icon>
                     </div>
                  </div>
                </div>
              </div>

              <h2 class="text-[24px] font-bold text-[#1A1C21] tracking-tight mb-4 leading-tight">
                You have <span class="font-black">2/4</span> store promotion left
              </h2>

              <p class="text-[15px] font-medium text-gray-400 leading-relaxed px-2 mb-10">
                Promoting this would mean, kinikan kinikan and more kinikan. You get?
              </p>

              <div class="flex items-center justify-center gap-3 w-full">
                 <button 
                   (click)="close.emit()"
                   class="flex-1 px-8 py-4 rounded-full bg-white border border-gray-100 text-[#1A1C21] font-bold text-[15px] hover:bg-gray-50 transition-all active:scale-95 duration-200"
                 >
                   Cancel
                 </button>
                 <button 
                   (click)="goToStep(2)"
                   class="flex-2 px-8 py-4 rounded-full bg-[#5932EA] text-white font-bold text-[15px] shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all hover:bg-[#4a27c9] active:scale-95 duration-200 whitespace-nowrap"
                 >
                   Yes, promote store
                 </button>
              </div>
           </div>
        }

        <!-- STEP 2: Choose Plan -->
        @if (step() === 2) {
           <div class="flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
              <!-- Header Gradient -->
              <div class="relative h-44 bg-linear-to-b from-purple-100/50 to-transparent flex flex-col items-center justify-center text-center px-10">
                 <button 
                    (click)="close.emit()"
                    class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all shadow-sm hover:bg-gray-50 active:scale-95 duration-200"
                 >
                    <ng-icon name="heroXMark" class="text-xl"></ng-icon>
                 </button>

                 <h2 class="text-[28px] lg:text-[30px] font-black text-[#1A1C21] tracking-tight mb-2">
                    Choose a boosting plan to proceed 🚀
                 </h2>
                 <p class="text-gray-400 font-medium">Give your store more visibility</p>
              </div>

              <!-- Plan Cards Grid -->
              <div class="px-10 pb-10">
                 <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                    @for (plan of plans; track plan.id) {
                       <div 
                          class="group relative h-64 bg-white border rounded-[28px] p-8 cursor-pointer transition-all hover:border-purple-600/50 active:scale-[0.98] duration-200 flex flex-col justify-between"
                          [class.border-purple-600]="selectedPlanId() === plan.id"
                          [class.bg-purple-50/20]="selectedPlanId() === plan.id"
                          [class.border-gray-100]="selectedPlanId() !== plan.id"
                          [class.shadow-xl]="selectedPlanId() === plan.id"
                          [class.shadow-purple-100/50]="selectedPlanId() === plan.id"
                          (click)="selectedPlanId.set(plan.id)"
                       >
                          <div>
                             <h3 class="text-[17px] font-bold text-[#1A1C21] mb-6 group-hover:text-purple-600 transition-colors">
                                {{ plan.label }}
                             </h3>
                             @if (plan.savings) {
                                <div class="inline-flex px-2 py-0.5 rounded-md bg-[#EEF5D3] text-[#A7C93E] text-[10px] font-bold mb-4">
                                   Save {{ plan.savings }}
                                </div>
                             }
                          </div>

                          <div class="flex flex-col">
                             <div class="flex items-baseline gap-1">
                                <span class="text-[21px] font-black text-[#1A1C21]">₦{{ plan.price | number }}</span>
                                <span class="text-gray-400 text-[13px] font-medium">/{{ plan.unit }}</span>
                             </div>
                             <p class="text-xs font-bold text-gray-300 mt-1">Billed {{ plan.billedFrequency }}</p>
                          </div>
                       </div>
                    }
                 </div>

                 <div class="flex justify-center">
                    <button 
                       (click)="goToStep(3)"
                       class="w-full max-w-sm py-4 bg-[#5932EA] text-white font-bold text-[15px] rounded-full shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all hover:bg-[#4a27c9] active:scale-95 duration-200"
                    >
                       Proceed
                    </button>
                 </div>
              </div>
           </div>
        }

        <!-- STEP 3: Payment Selection -->
        @if (step() === 3) {
           <div class="flex animate-in fade-in slide-in-from-right-4 duration-500">
              <!-- Left Sidebar: Payment Methods -->
              <div class="flex-1 p-10 pr-6">
                 <h2 class="text-[21px] font-bold text-[#1A1C21] mb-8">Select your payment method</h2>
                 
                 <div class="space-y-4">
                    <!-- Wallet Item -->
                     <div 
                        class="flex items-center justify-between p-6 rounded-[24px] border cursor-pointer transition-all hover:border-purple-600/50 active:scale-[0.98] duration-200"
                        [class.border-purple-600]="selectedPaymentId() === 'wallet'"
                        [class.bg-purple-50/10]="selectedPaymentId() === 'wallet'"
                        [class.border-gray-100]="selectedPaymentId() !== 'wallet'"
                        (click)="selectedPaymentId.set('wallet')"
                     >
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-600">
                             <ng-icon name="heroWallet" class="text-lg"></ng-icon>
                          </div>
                          <div class="flex flex-col">
                             <span class="text-[15px] font-bold text-[#1A1C21]">Wallet</span>
                             <span class="text-xs font-medium text-gray-400 mt-0.5">(Balance: ₦250,000)</span>
                          </div>
                       </div>
                       <div 
                          class="w-5 h-5 rounded-full border flex items-center justify-center"
                          [class.border-purple-600]="selectedPaymentId() === 'wallet'"
                          [class.border-gray-200]="selectedPaymentId() !== 'wallet'"
                       >
                          @if (selectedPaymentId() === 'wallet') {
                             <div class="w-2.5 h-2.5 bg-purple-600 rounded-full"></div>
                          }
                       </div>
                    </div>

                    <!-- Online Item -->
                     <div 
                        class="flex items-center justify-between p-6 rounded-[24px] border cursor-pointer transition-all hover:border-purple-600/50 active:scale-[0.98] duration-200"
                        [class.border-purple-600]="selectedPaymentId() === 'online'"
                        [class.bg-purple-50/10]="selectedPaymentId() === 'online'"
                        [class.border-gray-100]="selectedPaymentId() !== 'online'"
                        (click)="selectedPaymentId.set('online')"
                     >
                       <div class="flex items-center gap-4">
                          <div class="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-600">
                             <ng-icon name="heroGlobeAlt" class="text-lg"></ng-icon>
                          </div>
                          <span class="text-[15px] font-bold text-[#1A1C21]">Online</span>
                       </div>
                       <div 
                          class="w-5 h-5 rounded-full border flex items-center justify-center"
                          [class.border-purple-600]="selectedPaymentId() === 'online'"
                          [class.border-gray-200]="selectedPaymentId() !== 'online'"
                       >
                          @if (selectedPaymentId() === 'online') {
                             <div class="w-2.5 h-2.5 bg-purple-600 rounded-full"></div>
                          }
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Right Pane: Summary Card -->
              <div class="w-[440px] p-8 m-4 bg-[#FAFAFA] rounded-[32px] relative flex flex-col justify-between">
                 <button 
                    (click)="close.emit()"
                    class="absolute top-6 right-6 w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all shadow-sm hover:bg-gray-50 active:scale-95 duration-200"
                 >
                    <ng-icon name="heroXMark" class="text-xl"></ng-icon>
                 </button>

                 <div class="flex-1">
                    <h3 class="text-[28px] font-black text-[#1A1C21] mt-4 mb-2">Feature for 7 days</h3>
                    <p class="text-[15px] font-medium text-gray-400 mb-8">Billed monthly</p>

                    <!-- Divider -->
                    <div class="h-px w-full bg-gray-200 mb-8"></div>

                    <div class="space-y-6">
                       <div class="flex items-center justify-between">
                          <span class="text-[15px] font-medium text-gray-400">Weekly subscription</span>
                          <span class="text-[15px] font-bold text-[#1A1C21]">₦1,000.00</span>
                       </div>
                       <div class="flex items-center justify-between">
                          <span class="text-[15px] font-medium text-gray-400">VAT (7.5%)</span>
                          <span class="text-[15px] font-bold text-[#1A1C21]">₦75.00</span>
                       </div>
                       <div class="flex items-center justify-between pt-4">
                          <span class="text-[20px] font-black text-[#1A1C21]">Total due today</span>
                          <span class="text-[20px] font-black text-[#1A1C21]">₦1,075.00</span>
                       </div>
                    </div>

                    <!-- Recurrence Checkbox -->
                    <div class="flex items-center gap-3 mt-12">
                       <div class="w-5 h-5 rounded border border-gray-200 bg-white flex items-center justify-center cursor-pointer">
                          <!-- Hidden mock checkbox -->
                       </div>
                       <span class="text-[13px] font-bold text-gray-600">Mark this payment as recurring</span>
                    </div>
                 </div>

                 <div class="mt-12">
                    <button 
                       (click)="confirm()"
                       class="w-full py-4 bg-[#5932EA] text-white font-bold text-[15px] rounded-full shadow-lg shadow-purple-100 hover:shadow-purple-200 transition-all hover:bg-[#4a27c9] active:scale-95 duration-200 flex items-center justify-center gap-2 mb-6"
                    >
                       Confirm and pay
                    </button>
                    <p class="text-[10px] font-bold text-gray-400 leading-relaxed text-center px-4">
                       By clicking on Confirm and pay, you accept the <span class="text-purple-600 underline">Terms of Use</span>, confirm that you will abide by the Safety Tips and declare that this posting does not include any Prohibited Items.
                    </p>
                 </div>
              </div>
           </div>
        }

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
export class PromoteStoreModalComponent {
  close = output<void>();
  promote = output<void>();

  step = signal(1);
  selectedPlanId = signal('7days');
  selectedPaymentId = signal('wallet');

  plans = [
    { id: '1day', label: 'Promote for 1 day', price: 100, unit: 'day', billedFrequency: 'daily' },
    { id: '7days', label: 'Promote for 7 days', price: 500, unit: 'week', billedFrequency: 'weekly' },
    { id: '14days', label: 'Promote for 14 days', price: 700, unit: 'bi-weekly', billedFrequency: 'bi-weekly', savings: '20%' },
    { id: '30days', label: 'Promote for 30 days', price: 1000, unit: 'month', billedFrequency: 'monthly', savings: '50%' }
  ];

  modalMaxWidth = computed(() => {
    switch (this.step()) {
       case 1: return '440px';
       case 2: return '860px';
       case 3: return '1000px';
       default: return '440px';
    }
  });

  goToStep(s: number) {
     this.step.set(s);
  }

  confirm() {
    console.log('Payment confirmed/Store promoted');
    this.close.emit();
  }
}
