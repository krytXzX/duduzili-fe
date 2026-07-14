import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule, Location, NgOptimizedImage } from '@angular/common';

type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="min-h-full bg-white pb-20">
      <!-- Title Header with Back Button (Mobile layout style matching design) -->
      <header class="mx-auto max-w-[390px] px-5 pt-6 md:max-w-5xl md:px-8">
        <div class="flex items-center gap-4">
          <button
            type="button"
            (click)="goBack()"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F4F6] text-[#1A1B1D] active:scale-95 transition-transform"
            aria-label="Go back"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2"
              stroke="currentColor"
              class="h-6 w-6"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 class="text-[24px] font-bold leading-8 text-[#1A1B1D]">FAQs</h1>
        </div>
      </header>

      <main class="mx-auto mt-6 w-full max-w-[390px] px-5 md:max-w-5xl md:px-8">
        <!-- Segmented Tab Picker (Buyers / Sellers) -->
        <div class="flex rounded-full bg-[#F4F4F6] p-1">
          <button
            type="button"
            (click)="setActiveTab('buyer')"
            [class.bg-[#6453D9]]="activeTab() === 'buyer'"
            [class.text-white]="activeTab() === 'buyer'"
            [class.text-[#8A8A8A]]="activeTab() !== 'buyer'"
            class="flex-1 py-3 text-center text-[16px] font-medium rounded-full transition-all duration-200"
          >
            Buyers
          </button>
          <button
            type="button"
            (click)="setActiveTab('seller')"
            [class.bg-[#6453D9]]="activeTab() === 'seller'"
            [class.text-white]="activeTab() === 'seller'"
            [class.text-[#8A8A8A]]="activeTab() !== 'seller'"
            class="flex-1 py-3 text-center text-[16px] font-medium rounded-full transition-all duration-200"
          >
            Sellers
          </button>
        </div>

        <!-- FAQ Items List -->
        <div class="mt-8 divide-y divide-[#EAEAEA]">
          @for (faq of activeFaqItems(); track faq.question; let index = $index) {
            <div class="py-4">
              <button
                type="button"
                (click)="selectFaq(faq, index)"
                class="flex w-full items-start justify-between text-left group"
              >
                <span class="flex items-center gap-3">
                  <!-- Help/Question Circle SVG Icon -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.8"
                    stroke="currentColor"
                    class="h-6 w-6 shrink-0 text-[#1F1F1F]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                    />
                  </svg>
                  <span class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                    {{ faq.question }}
                  </span>
                </span>

                <!-- Chevron Right / Down -->
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  [class.rotate-90]="expandedIndex() === index && windowWidth() >= 768"
                  class="h-4 w-4 shrink-0 text-[#8D93A0] transition-transform duration-200 mt-1"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>

              <!-- Accordion Answer Body (Desktop only) -->
              @if (expandedIndex() === index) {
                <div class="mt-3 pl-9 text-[15px] leading-6 text-[#4D5260] transition-all duration-300 hidden md:block">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>
      </main>

      <!-- Mobile Bottom Sheet overlay -->
      @if (isBottomSheetOpen()) {
        <!-- Backdrop -->
        <div
          class="fixed inset-0 z-50 bg-black/40 md:hidden animate-fade-in"
          (click)="closeBottomSheet()"
          aria-hidden="true"
        ></div>

        <!-- Sheet Panel -->
        <div
          class="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] rounded-t-[32px] bg-white px-6 pb-12 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 translate-y-0"
          role="dialog"
          aria-modal="true"
        >
          <!-- Drag Handle -->
          <div class="mx-auto h-1.5 w-12 rounded-full bg-[#EAEAEA]"></div>

          <!-- Close Button Header -->
          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeBottomSheet()"
              class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-sm transition active:scale-95"
              aria-label="Close bottom sheet"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.8"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="mt-2 flex items-start gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.8"
              stroke="currentColor"
              class="h-6 w-6 shrink-0 text-[#6453D9] mt-0.5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
              />
            </svg>
            <h2 class="text-[18px] font-semibold leading-6 text-[#1F1F1F] pr-10">
              {{ selectedFaq()?.question }}
            </h2>
          </div>

          <div class="mt-4 pl-9 text-[15px] leading-6 text-[#4D5260] overflow-y-auto max-h-[45vh]">
            {{ selectedFaq()?.answer }}
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPageComponent {
  private readonly location = inject(Location);

  readonly activeTab = signal<'buyer' | 'seller'>('buyer');
  readonly expandedIndex = signal<number | null>(null);
  readonly isBottomSheetOpen = signal<boolean>(false);
  readonly selectedFaq = signal<FaqItem | null>(null);

  protected readonly buyerFaqs: readonly FaqItem[] = [
    {
      question: 'Can I contact a seller directly?',
      answer: 'Yes, you can initiate a chat with any seller directly from the product details page using the chat or message buttons.',
    },
    {
      question: 'How do I add items to my wishlist?',
      answer: 'Click the heart icon on any product listing to add it to your wishlist. You can view all saved items from the wishlist tab.',
    },
  ];

  protected readonly sellerFaqs: readonly FaqItem[] = [
    {
      question: 'Do I pay to post an item?',
      answer: 'Posting basic listings is free. You can opt to promote or boost listings through ad packages to gain extra exposure.',
    },
    {
      question: 'How long do promoted ads run?',
      answer: 'The duration of promoted ads depends on the plan you select, ranging from weekly to monthly terms.',
    },
  ];

  setActiveTab(tab: 'buyer' | 'seller'): void {
    this.activeTab.set(tab);
    this.expandedIndex.set(null);
  }

  selectFaq(faq: FaqItem, index: number): void {
    // If we're on mobile/small screen (under md width), open the bottom sheet
    if (window.innerWidth < 768) {
      this.selectedFaq.set(faq);
      this.isBottomSheetOpen.set(true);
    } else {
      // Otherwise fallback to desktop inline accordion
      this.toggleAccordion(index);
    }
  }

  closeBottomSheet(): void {
    this.isBottomSheetOpen.set(false);
    this.selectedFaq.set(null);
  }

  toggleAccordion(index: number): void {
    this.expandedIndex.update((curr) => (curr === index ? null : index));
  }

  activeFaqItems(): readonly FaqItem[] {
    return this.activeTab() === 'buyer' ? this.buyerFaqs : this.sellerFaqs;
  }

  windowWidth(): number {
    return typeof window !== 'undefined' ? window.innerWidth : 1024;
  }

  goBack(): void {
    this.location.back();
  }
}
