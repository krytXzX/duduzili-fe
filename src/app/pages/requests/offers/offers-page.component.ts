import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroAdjustmentsHorizontal,
  heroChatBubbleOvalLeftEllipsis,
  heroChevronDown,
  heroChevronLeft,
  heroChevronRight,
  heroMagnifyingGlass,
  heroXMark,
} from '@ng-icons/heroicons/outline';
import { MobileOverlayService } from '../../../services/mobile-overlay.service';

interface Offer {
  id: string;
  buyer: {
    name: string;
    avatar: string;
  };
  offerAmount: number;
  listing: {
    name: string;
    image: string;
  };
  store: {
    name: string;
    logo: string;
  };
  dateRequested: string;
}

@Component({
  selector: 'app-offers-page',
  imports: [CommonModule, NgIcon, RouterLink],
  providers: [
    provideIcons({
      heroAdjustmentsHorizontal,
      heroChatBubbleOvalLeftEllipsis,
      heroChevronDown,
      heroChevronLeft,
      heroChevronRight,
      heroMagnifyingGlass,
      heroXMark,
    }),
  ],
  template: `
    <div class="flex h-full flex-col pt-0">
      <div class="mx-auto flex min-h-full w-full max-w-[420px] flex-col bg-[#F7F7FA] px-4 pt-4 pb-8 md:hidden">
        <div class="flex items-center justify-between gap-4">
          <a
            routerLink="/"
            aria-label="Go to Duduzili home"
            class="text-[22px] font-medium tracking-[-0.04em] text-[#6F56F6]"
          >
            Duduzili
          </a>

          <img
            src="/assets/images/image-1-1.jpg"
            width="44"
            height="44"
            alt="Profile picture"
            class="h-10 w-10 rounded-full object-cover"
          >
        </div>

        <div class="mt-7 flex items-center gap-3">
          <a
            routerLink="/requests"
            aria-label="Back to requests"
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F5F6FA] text-[#30313A]"
          >
            <ng-icon name="heroChevronLeft" class="text-[18px]"></ng-icon>
          </a>
          <h1 class="text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Offers</h1>
        </div>

        <div class="mt-5 flex items-center gap-3">
          <label class="relative min-w-0 flex-1">
            <span class="pointer-events-none absolute inset-y-0 left-3 inline-flex items-center text-[#B0B4BF]">
              <ng-icon name="heroMagnifyingGlass" class="text-[16px]"></ng-icon>
            </span>
            <input
              type="search"
              [value]="searchTerm()"
              (input)="updateSearch($event)"
              placeholder="Search"
              class="h-10 w-full rounded-full border border-transparent bg-[#F4F5F8] pl-10 pr-4 text-[13px] text-[#202335] outline-none transition placeholder:text-[#B0B4BF] focus:border-[#D8DAE5] focus:bg-white"
            >
          </label>

          <button
            type="button"
            class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4B5162]"
            aria-label="Filter offers"
          >
            <ng-icon name="heroAdjustmentsHorizontal" class="text-[18px]"></ng-icon>
          </button>
        </div>

        <div class="mt-3 flex-1 space-y-1.5">
          @for (offer of filteredOffers(); track offer.id) {
            <article class="rounded-[24px] bg-white px-3 py-3 shadow-[0_8px_24px_-24px_rgba(34,39,48,0.45)] ring-1 ring-[#F0F1F5]">
              <div class="flex items-start justify-between gap-3">
                <div class="flex min-w-0 items-center gap-3">
                  <img
                    [src]="offer.buyer.avatar"
                    [alt]="offer.buyer.name"
                    class="h-9 w-9 rounded-full object-cover"
                  >

                  <div class="min-w-0">
                    <p class="truncate text-[14px] font-medium text-[#242734]">{{ offer.buyer.name }}</p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="openDetails(offer)"
                  class="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4B5162]"
                  [attr.aria-label]="'Open offer from ' + offer.buyer.name"
                >
                  <ng-icon name="heroChatBubbleOvalLeftEllipsis" class="text-[15px]"></ng-icon>
                </button>
              </div>

              <div class="mt-3 grid grid-cols-[80px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 text-[11px]">
                <span class="text-[#B0B4BF]">Listing</span>
                <div class="flex min-w-0 items-center gap-2">
                  <img
                    [src]="offer.listing.image"
                    [alt]="offer.listing.name"
                    class="h-5 w-5 rounded object-cover"
                  >
                  <span class="truncate font-medium text-[#242734]">{{ offer.listing.name }}</span>
                </div>

                <span class="text-[#B0B4BF]">Offer amount</span>
                <span class="text-right text-[12px] font-medium text-[#242734]">{{ formatCurrency(offer.offerAmount) }}</span>
              </div>
            </article>
          }
        </div>
      </div>

      <div class="hidden h-full flex-col pt-0 md:flex">
        <div class="mb-8 flex items-center gap-2">
          <h1 class="text-[22px] tracking-tight text-gray-400">Requests</h1>
          <span class="text-[22px] font-light text-gray-300">></span>
          <h1 class="text-[22px] font-bold tracking-tight text-[#1A1C21]">Offers</h1>
        </div>

        <div class="flex grow flex-col rounded-[32px] border border-gray-100 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <div class="flex items-center justify-between border-b border-gray-50/80 p-6">
            <div class="flex items-center gap-3">
              <button class="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-500 transition-colors hover:bg-gray-50">
                Store: <span class="font-bold text-gray-900">All</span>
                <ng-icon name="heroChevronDown" class="ml-1 text-sm opacity-70"></ng-icon>
              </button>
              <button class="flex items-center gap-2 rounded-full border border-gray-200 px-5 py-2.5 text-[13px] font-semibold text-gray-500 transition-colors hover:bg-gray-50">
                Date requested
                <ng-icon name="heroChevronDown" class="ml-1 text-sm opacity-70"></ng-icon>
              </button>
            </div>

            <div class="relative">
              <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                <ng-icon name="heroMagnifyingGlass" class="text-lg"></ng-icon>
              </div>
              <input
                type="text"
                placeholder="Search"
                class="w-80 rounded-full bg-gray-50/80 py-2.5 pl-11 pr-4 text-sm font-medium text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-purple-100"
              >
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  <th class="px-6 py-5 font-bold">Buyer</th>
                  <th class="px-6 py-5 font-bold">Offer amount</th>
                  <th class="px-6 py-5 font-bold">Listing</th>
                  <th class="px-6 py-5 font-bold">Store</th>
                  <th class="px-6 py-5 font-bold">Date requested</th>
                  <th class="w-16 px-6 py-5"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                @for (offer of offers(); track offer.id) {
                  <tr class="group transition-colors hover:bg-gray-50/30">
                    <td class="whitespace-nowrap px-6 py-6">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-100">
                          <img [src]="offer.buyer.avatar" [alt]="offer.buyer.name" class="h-full w-full object-cover">
                        </div>
                        <span class="text-[14px] font-bold text-[#1A1C21]">{{ offer.buyer.name }}</span>
                      </div>
                    </td>

                    <td class="whitespace-nowrap px-6 py-6">
                      <span class="text-[14px] text-[#1A1C21]">
                        ₦<span class="font-bold">{{ offer.offerAmount | number:'1.0-0' }}</span><span class="text-sm text-gray-400">.00</span>
                      </span>
                    </td>

                    <td class="whitespace-nowrap px-6 py-6">
                      <div class="flex items-center gap-3">
                        <div class="h-10 w-10 overflow-hidden rounded-xl border border-gray-100 bg-gray-100">
                          <img [src]="offer.listing.image" [alt]="offer.listing.name" class="h-full w-full object-cover">
                        </div>
                        <span class="text-[14px] font-bold text-gray-700">{{ offer.listing.name }}</span>
                      </div>
                    </td>

                    <td class="whitespace-nowrap px-6 py-6">
                      <div class="flex items-center gap-2.5">
                        <div class="h-8 w-8 overflow-hidden rounded-full border border-gray-100 bg-gray-100">
                          <img [src]="offer.store.logo" [alt]="offer.store.name" class="h-full w-full object-cover">
                        </div>
                        <span class="text-[14px] font-medium text-gray-600">{{ offer.store.name }}</span>
                      </div>
                    </td>

                    <td class="whitespace-nowrap px-6 py-6">
                      <span class="text-[14px] font-medium text-[#1A1C21]">{{ offer.dateRequested }}</span>
                    </td>

                    <td class="whitespace-nowrap px-6 py-6 text-right">
                      <button class="flex h-[42px] w-[42px] items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-all hover:bg-gray-50 hover:text-[#1A1C21] focus:outline-none focus:ring-2 focus:ring-purple-100">
                        <ng-icon name="heroChatBubbleOvalLeftEllipsis" class="text-xl"></ng-icon>
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div class="flex flex-none items-center justify-between pt-8 pb-4">
          <div class="text-[15px] font-medium text-gray-400">
            <span class="font-black text-[#1A1C21]">5</span> results
          </div>

          <div class="flex items-center gap-3">
            <button class="group flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 focus:outline-none">
              <ng-icon name="heroChevronLeft" class="text-sm transition-transform group-active:-translate-x-0.5"></ng-icon>
            </button>

            <button class="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 font-bold text-[#1A1C21] shadow-sm transition-all hover:bg-gray-50 focus:outline-none">
              1
            </button>

            <button class="group flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 text-gray-400 transition-all hover:bg-gray-50 hover:text-gray-600 focus:outline-none">
              <ng-icon name="heroChevronRight" class="text-sm transition-transform group-active:translate-x-0.5"></ng-icon>
            </button>

            <span class="ml-2 text-[15px] font-medium text-gray-400">of 12</span>
          </div>
        </div>
      </div>

      @if (selectedOffer(); as offer) {
        <div class="fixed inset-0 z-[110] bg-black/20 backdrop-blur-[2px] md:hidden" (click)="closeDetails()" aria-hidden="true"></div>

        <section
          class="fixed inset-x-0 bottom-0 z-[120] rounded-t-[32px] bg-white px-4 pb-8 pt-3 shadow-[0_-20px_50px_-30px_rgba(18,24,35,0.4)] md:hidden"
          aria-label="Offer request details"
          role="dialog"
          aria-modal="true"
        >
          <div class="mx-auto h-1.5 w-14 rounded-full bg-[#E6E7EC]"></div>

          <div class="mt-2 flex justify-end">
            <button
              type="button"
              (click)="closeDetails()"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#ECEEF4] bg-white text-[#4D5260] shadow-[0_10px_24px_-22px_rgba(18,24,35,0.55)]"
              aria-label="Close request details"
            >
              <ng-icon name="heroXMark" class="text-[20px]"></ng-icon>
            </button>
          </div>

          <h2 class="mt-2 text-[20px] font-semibold tracking-[-0.03em] text-[#202335]">Request details</h2>

          <p class="mt-4 text-[11px] text-[#B0B4BF]">Requested by:</p>

          <div class="mt-2 flex items-center gap-3">
            <img [src]="offer.buyer.avatar" [alt]="offer.buyer.name" class="h-12 w-12 rounded-full object-cover">
            <span class="text-[15px] font-medium text-[#202335]">{{ offer.buyer.name }}</span>
          </div>

          <a
            routerLink="/messages"
            (click)="closeDetails()"
            class="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#6F56F6] px-5 text-[13px] font-medium text-white shadow-[0_18px_34px_-18px_rgba(111,86,246,0.92)]"
          >
            <ng-icon name="heroChatBubbleOvalLeftEllipsis" class="text-[15px]"></ng-icon>
            Message buyer
          </a>

          <div class="mt-6 space-y-4 border-t border-[#F0F1F5] pt-5">
            <div class="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 text-[11px]">
              <span class="text-[#B0B4BF]">Offer amount</span>
              <span class="text-right text-[12px] font-medium text-[#242734]">{{ formatCurrency(offer.offerAmount) }}</span>
            </div>

            <div class="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 text-[11px]">
              <span class="text-[#B0B4BF]">Listing</span>
              <div class="flex min-w-0 items-center justify-end gap-2">
                <img [src]="offer.listing.image" [alt]="offer.listing.name" class="h-5 w-5 rounded object-cover">
                <span class="truncate text-right text-[12px] font-medium text-[#242734]">{{ offer.listing.name }}</span>
              </div>
            </div>

            <div class="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 text-[11px]">
              <span class="text-[#B0B4BF]">Store</span>
              <div class="flex min-w-0 items-center justify-end gap-2">
                <img [src]="offer.store.logo" [alt]="offer.store.name" class="h-5 w-5 rounded-full object-cover">
                <span class="truncate text-right text-[12px] font-medium text-[#242734]">{{ offer.store.name }}</span>
              </div>
            </div>

            <div class="grid grid-cols-[96px_minmax(0,1fr)] items-start gap-3 text-[11px]">
              <span class="text-[#B0B4BF]">Date requested</span>
              <span class="text-right text-[12px] font-medium text-[#242734]">{{ offer.dateRequested }}</span>
            </div>
          </div>
        </section>
      }
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OffersPageComponent implements OnDestroy {
  private readonly mobileOverlayService = inject(MobileOverlayService);

  readonly searchTerm = signal('');
  readonly selectedOffer = signal<Offer | null>(null);
  readonly offers = signal<Offer[]>([
    {
      id: '1',
      buyer: {
        name: 'Halima Bala',
        avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1eb4ce?w=100&h=100&fit=crop',
      },
      offerAmount: 2500000,
      listing: {
        name: 'Iphone 17 pro max',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop',
      },
      store: {
        name: 'The Vine Collections',
        logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=100&h=100&fit=crop',
      },
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '2',
      buyer: {
        name: 'Joseph Olamide',
        avatar: 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop',
      },
      offerAmount: 2500000,
      listing: {
        name: 'Iphone 17 pro max',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop',
      },
      store: {
        name: 'The Vine Collections',
        logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=100&h=100&fit=crop',
      },
      dateRequested: '14 Feb, 2025',
    },
    {
      id: '3',
      buyer: {
        name: 'Kelechi Oduah',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&h=100&fit=crop',
      },
      offerAmount: 2500000,
      listing: {
        name: 'Iphone 17 pro max',
        image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100&h=100&fit=crop',
      },
      store: {
        name: 'The Vine Collections',
        logo: 'https://images.unsplash.com/photo-1620288627223-53302f4e8c74?w=100&h=100&fit=crop',
      },
      dateRequested: '14 Feb, 2025',
    },
  ]);

  readonly filteredOffers = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return this.offers();
    }

    return this.offers().filter((offer) =>
      [offer.buyer.name, offer.listing.name, offer.store.name].some((value) =>
        value.toLowerCase().includes(term),
      ),
    );
  });

  ngOnDestroy(): void {
    if (this.selectedOffer()) {
      this.mobileOverlayService.closeMobileModal();
    }
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.searchTerm.set(input?.value ?? '');
  }

  openDetails(offer: Offer): void {
    if (!this.selectedOffer()) {
      this.mobileOverlayService.openMobileModal();
    }
    this.selectedOffer.set(offer);
  }

  closeDetails(): void {
    if (this.selectedOffer()) {
      this.mobileOverlayService.closeMobileModal();
    }
    this.selectedOffer.set(null);
  }

  formatCurrency(amount: number): string {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
