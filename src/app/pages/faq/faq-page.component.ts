import { CommonModule, Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { BuyerDashboardNavbarComponent } from '../../components/layout/buyer-dashboard-navbar.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';
import { PublicHomeNavbarComponent } from '../../components/layout/public-home-navbar.component';
import { CleanSpacesPipe } from '../../pipes/clean-spaces-pipe';
import { AuthSessionService } from '../../services/auth-session.service';
import { FAQItem, FaqService } from '../../services/faq.service';

@Component({
  selector: 'app-faq-page',
  standalone: true,
  imports: [
    CommonModule,
    HomeFooterComponent,
    BuyerDashboardNavbarComponent,
    PublicHomeNavbarComponent,
    MobileBottomNavComponent,
    CleanSpacesPipe,
  ],
  template: `
    @if (isAuthenticated()) {
      <app-buyer-dashboard-navbar class="w-full" />
    } @else {
      <app-public-home-navbar class="w-full" />
    }

    <div
      [class]="
        isAuthenticated() ? 'min-h-screen bg-white pb-24' : 'min-h-screen bg-white pb-24 lg:pt-20'
      "
    >
      <!-- Title Header with Back Button (Mobile layout style matching design) -->
      <header class="mx-auto max-w-97.5 px-5 pt-6 md:max-w-7xl md:px-25 md:pt-13.25">
        <div class="flex items-center gap-4">
          <!-- Back button only visible on mobile -->
          <button
            type="button"
            (click)="goBack()"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#F4F4F6] text-[#1A1B1D] active:scale-95 transition-transform md:hidden"
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
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </button>
          <h1 class="text-[24px] font-bold leading-8 text-[#1A1B1D] md:hidden">FAQs</h1>
        </div>
      </header>

      <main
        class="mx-auto mt-6 w-full max-w-full px-5 md:max-w-7xl md:mt-16 md:px-2.5 md:grid md:grid-cols-2 md:gap-20"
      >
        <!-- Desktop Left Title Column -->
        <div class="hidden md:block">
          <h2
            class="text-[44px] font-bold tracking-tight text-[#1A1B1D] leading-[1.2] max-w-[320px]"
          >
            Frequently Asked Questions
          </h2>
        </div>

        <div>
          <!-- Segmented Tab Picker (Buyers / Sellers) -->
          <div class="flex rounded-full bg-[#F4F4F6] p-1 md:max-w-105 md:mb-10">
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
          <div class="mt-8 divide-y divide-[#EAEAEA] md:mt-0">
            @for (faq of activeFaqItems(); track faq.id || $index; let index = $index) {
              <div class="py-5">
                <button
                  type="button"
                  (click)="selectFaq(faq, index)"
                  class="flex w-full items-start justify-between text-left group gap-4"
                >
                  <span class="flex items-center gap-3">
                    <!-- Help/Question Circle SVG Icon (Only visible on mobile) -->
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.8"
                      stroke="currentColor"
                      class="h-6 w-6 shrink-0 text-[#1F1F1F] md:hidden"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                      />
                    </svg>
                    <span
                      class="text-[16px] font-medium leading-6 text-[#1F1F1F] md:text-[20px] md:leading-7 md:font-semibold"
                    >
                      {{ faq.title }}
                    </span>
                  </span>

                  <!-- Mobile Arrow or Desktop Circular Arrow -->
                  <div class="md:hidden">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-4 w-4 shrink-0 text-[#8D93A0]"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </div>

                  <div
                    class="hidden md:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F4F4F6] text-[#8D93A0] group-hover:bg-[#EAEAEF] transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      [class.rotate-180]="expandedIndex() === index"
                      class="h-4 w-4 transition-transform duration-200"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </div>
                </button>

                <!-- Accordion Answer Body (Desktop only) -->
                @if (expandedIndex() === index) {
                  <div
                    class="mt-3 text-[15px] leading-6 text-[#4D5260] transition-all duration-300 hidden md:block md:text-[16px] md:leading-7 md:mt-4 md:text-[#5D5D5D] max-w-155 w-full whitespace-normal! wrap-break-word! min-w-0"
                    [innerHTML]="faq.content | cleanSpaces"
                  ></div>
                }
              </div>
            }
          </div>
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
          class="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] rounded-t-4xl bg-white px-6 pb-12 pt-4 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] md:hidden transition-transform duration-300 translate-y-0"
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
              {{ selectedFaq()?.title }}
            </h2>
          </div>

          <div
            class="mt-4 text-[15px] leading-6 text-[#4D5260] overflow-x-auto max-h-[70vh] w-full whitespace-normal! wrap-break-word! min-w-0"
            [innerHTML]="selectedFaq()?.content && (selectedFaq()!.content | cleanSpaces)"
          ></div>
        </div>
      }

      <!-- Footer (Desktop only) -->
      <app-home-footer class="hidden md:block mt-24" />
    </div>

    @if (isAuthenticated()) {
      <app-mobile-bottom-nav variant="buyer" />
    }
  `,
  host: { class: 'block h-full overflow-auto bg-white' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPageComponent implements OnInit {
  private readonly location = inject(Location);
  private readonly authSession = inject(AuthSessionService);
  private readonly faqService = inject(FaqService);

  readonly isAuthenticated = this.authSession.isAuthenticated;
  readonly activeTab = signal<'buyer' | 'seller'>('buyer');
  readonly expandedIndex = signal<number | null>(null);
  readonly isBottomSheetOpen = signal<boolean>(false);
  readonly selectedFaq = signal<FAQItem | null>(null);

  readonly buyerFaqs = signal<FAQItem[]>([]);
  readonly sellerFaqs = signal<FAQItem[]>([]);

  ngOnInit(): void {
    this.loadFaqs();
  }

  private loadFaqs(): void {
    // Fetch published buyer FAQs
    this.faqService.getFaqs({ status: 'Published', user_type: 'Buyers' }).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data as any).results || [];
        this.buyerFaqs.set(list);
      },
      error: (err) => console.error('Failed to load buyer FAQs', err),
    });

    // Fetch published seller FAQs
    this.faqService.getFaqs({ status: 'Published', user_type: 'Sellers' }).subscribe({
      next: (data) => {
        const list = Array.isArray(data) ? data : (data as any).results || [];
        this.sellerFaqs.set(list);
      },
      error: (err) => console.error('Failed to load seller FAQs', err),
    });
  }

  setActiveTab(tab: 'buyer' | 'seller'): void {
    this.activeTab.set(tab);
    this.expandedIndex.set(null);
  }

  selectFaq(faq: FAQItem, index: number): void {
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

  activeFaqItems(): FAQItem[] {
    return this.activeTab() === 'buyer' ? this.buyerFaqs() : this.sellerFaqs();
  }

  windowWidth(): number {
    return typeof window !== 'undefined' ? window.innerWidth : 1024;
  }

  goBack(): void {
    this.location.back();
  }
}
