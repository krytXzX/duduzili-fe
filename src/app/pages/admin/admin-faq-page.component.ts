import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

type AdminFaqItem = {
  readonly title: string;
  readonly userType: 'Buyers' | 'Sellers';
  readonly lastUpdated: string;
  readonly authorName: string;
  readonly authorEmail: string;
  readonly authorAvatar: string;
  readonly status: 'Published' | 'Draft' | 'Archived';
};

@Component({
  selector: 'app-admin-faq-page',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  template: `
    <div class="space-y-8 p-6 lg:p-8">
      <!-- Top header layout -->
      <div class="flex items-center justify-between">
        <h1 class="text-[32px] font-bold text-[#1A1C21]">FAQs</h1>
        <button
          type="button"
          class="rounded-[20px] bg-[#6453D9] px-6 py-3 text-[14px] font-semibold text-white shadow-sm hover:bg-[#5C4AD0] transition active:scale-95"
        >
          Create FAQ
        </button>
      </div>

      <!-- Overview Cards row -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:gap-6">
        <div
          (click)="setActiveFilter('all')"
          [class.border-[#6453D9]]="activeFilter() === 'all'"
          [class.ring-2]="activeFilter() === 'all'"
          [class.ring-[#6453D9]/10]="activeFilter() === 'all'"
          class="cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-5 transition hover:bg-gray-50"
        >
          <p class="text-[12px] font-medium text-gray-400">All articles</p>
          <p class="mt-2 text-[28px] font-bold text-[#1A1C21]">65</p>
        </div>

        <div
          (click)="setActiveFilter('Published')"
          [class.border-[#6453D9]]="activeFilter() === 'Published'"
          [class.ring-2]="activeFilter() === 'Published'"
          [class.ring-[#6453D9]/10]="activeFilter() === 'Published'"
          class="cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-5 transition hover:bg-gray-50"
        >
          <p class="text-[12px] font-medium text-gray-400">Published</p>
          <p class="mt-2 text-[28px] font-bold text-[#1A1C21]">09</p>
        </div>

        <div
          (click)="setActiveFilter('Draft')"
          [class.border-[#6453D9]]="activeFilter() === 'Draft'"
          [class.ring-2]="activeFilter() === 'Draft'"
          [class.ring-[#6453D9]/10]="activeFilter() === 'Draft'"
          class="cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-5 transition hover:bg-gray-50"
        >
          <p class="text-[12px] font-medium text-gray-400">Draft</p>
          <p class="mt-2 text-[28px] font-bold text-[#1A1C21]">03</p>
        </div>

        <div
          (click)="setActiveFilter('Archived')"
          [class.border-[#6453D9]]="activeFilter() === 'Archived'"
          [class.ring-2]="activeFilter() === 'Archived'"
          [class.ring-[#6453D9]/10]="activeFilter() === 'Archived'"
          class="cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-5 transition hover:bg-gray-50"
        >
          <p class="text-[12px] font-medium text-gray-400">Archived</p>
          <p class="mt-2 text-[28px] font-bold text-[#1A1C21]">03</p>
        </div>
      </div>

      <!-- Search and filters layout card -->
      <div class="rounded-[24px] border border-gray-100 bg-white p-5 shadow-xs">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <!-- Filters Dropdowns -->
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 transition active:scale-95"
            >
              Author
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-3 w-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 transition active:scale-95"
            >
              User type
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-3 w-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full max-w-[280px]">
            <span class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              class="h-10 w-full rounded-full bg-[#FAFAFC] pl-10 pr-4 text-xs font-medium text-[#1A1C21] outline-none placeholder:text-gray-400 border border-transparent focus:border-gray-200"
            />
          </div>
        </div>

        <!-- Table Viewport -->
        <div class="mt-6 overflow-x-visible">
          <table class="w-full min-w-[800px] border-collapse text-left text-xs text-gray-500">
            <thead>
              <tr class="border-b border-[#F5F5F7] text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                <th class="pb-3 pr-4 font-semibold">Title</th>
                <th class="pb-3 px-4 font-semibold">User type</th>
                <th class="pb-3 px-4 font-semibold">Last updated</th>
                <th class="pb-3 px-4 font-semibold">Author</th>
                <th class="pb-3 px-4 font-semibold">Status</th>
                <th class="pb-3 pl-4 font-semibold w-10"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F5F5F7]">
              @for (item of filteredFaqItems(); track item.title; let index = $index) {
                <tr class="align-middle hover:bg-[#FAFAFC]/50 transition-colors">
                  <td class="py-4 pr-4 text-[14px] font-semibold text-[#1A1C21] max-w-[280px] truncate">
                    {{ item.title }}
                  </td>
                  <td class="py-4 px-4 text-gray-600 font-medium">{{ item.userType }}</td>
                  <td class="py-4 px-4 text-gray-600 font-medium">{{ item.lastUpdated }}</td>
                  <td class="py-4 px-4">
                    <div class="flex items-center gap-2">
                      <img
                        [src]="item.authorAvatar"
                        alt=""
                        width="32"
                        height="32"
                        class="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p class="text-[13px] font-semibold text-[#1A1C21] leading-none mb-0.5">{{ item.authorName }}</p>
                        <p class="text-[11px] text-gray-400 leading-none">{{ item.authorEmail }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="py-4 px-4">
                    @switch (item.status) {
                      @case ('Published') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-semibold text-[#25AD31]">
                          <span class="h-1.5 w-1.5 rounded-full bg-[#25AD31]"></span>
                          Published
                        </span>
                      }
                      @case ('Draft') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-[#F4F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5E]">
                          <span class="h-1.5 w-1.5 rounded-full bg-[#5E5E5E]"></span>
                          Draft
                        </span>
                      }
                      @case ('Archived') {
                        <span class="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[11px] font-semibold text-[#1969FE]">
                          <span class="h-1.5 w-1.5 rounded-full bg-[#1969FE]"></span>
                          Archived
                        </span>
                      }
                    }
                  </td>
                  <td class="py-4 pl-4 text-right relative">
                    <button
                      type="button"
                      (click)="toggleMenu(index); $event.stopPropagation()"
                      class="text-gray-400 hover:text-gray-600 active:scale-95 transition"
                      aria-label="Actions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-5 w-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </button>

                    <!-- Popup Dropdown Menu -->
                    @if (openMenuIndex() === index) {
                      <!-- Backdrop to close -->
                      <div class="fixed inset-0 z-10" (click)="closeMenu()"></div>

                      <div
                        class="absolute right-4 mt-2 w-40 rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 text-left z-20"
                      >
                        <p class="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">Menu</p>
                        
                        <div class="space-y-1">
                          <!-- Edit (Always shown) -->
                          <button
                            type="button"
                            (click)="closeMenu()"
                            class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 21.75a.75.75 0 0 1-.528.22H3.75a.75.75 0 0 1-.75-.75V18.16a.75.75 0 0 1 .22-.528L16.862 4.487Zm0 0L19.5 7.125" />
                            </svg>
                            Edit
                          </button>

                          <!-- Archive (Published only) -->
                          @if (item.status === 'Published') {
                            <button
                              type="button"
                              (click)="closeMenu()"
                              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                              </svg>
                              Archive
                            </button>
                          }

                          <!-- Publish (Archived only) -->
                          @if (item.status === 'Archived') {
                            <button
                              type="button"
                              (click)="closeMenu()"
                              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z" />
                              </svg>
                              Publish
                            </button>
                          }

                          <!-- Delete (Always shown) -->
                          <button
                            type="button"
                            (click)="closeMenu()"
                            class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#FF3B30] hover:bg-red-50/50 transition"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="h-4 w-4">
                              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </div>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination Footer -->
      <div class="flex items-center justify-between text-xs text-gray-500 pt-4">
        <span><strong class="text-gray-800">5</strong> results</span>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-1">
            <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition active:scale-95" disabled>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-3.5 w-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
            </button>
            <input type="text" value="1" class="h-8 w-8 rounded-lg border border-gray-200 text-center font-medium text-gray-700 outline-none" readonly />
            <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition active:scale-95">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="h-3.5 w-3.5"><path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
            </button>
          </div>
          <span>of 20</span>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFaqPageComponent {
  readonly activeFilter = signal<string>('all');
  readonly openMenuIndex = signal<number | null>(null);

  toggleMenu(index: number): void {
    this.openMenuIndex.update((curr) => (curr === index ? null : index));
  }

  closeMenu(): void {
    this.openMenuIndex.set(null);
  }

  protected readonly faqsList: readonly AdminFaqItem[] = [
    {
      title: 'Can I contact a seller directly?',
      userType: 'Buyers',
      lastUpdated: '06 May, 2024',
      authorName: 'Francis Uche',
      authorEmail: 'uche@email.com',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'Published',
    },
    {
      title: 'Do I pay to post an item?',
      userType: 'Sellers',
      lastUpdated: '06 May, 2024',
      authorName: 'Mark Anthony',
      authorEmail: 'mark@email.com',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'Draft',
    },
    {
      title: 'Can I contact a seller directly?',
      userType: 'Buyers',
      lastUpdated: '06 May, 2024',
      authorName: 'Elle Adebisi',
      authorEmail: 'elle@email.com',
      authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      status: 'Archived',
    },
  ];

  setActiveFilter(status: string): void {
    this.activeFilter.set(status);
  }

  filteredFaqItems(): readonly AdminFaqItem[] {
    const filter = this.activeFilter();
    if (filter === 'all') {
      return this.faqsList;
    }
    return this.faqsList.filter((item) => item.status === filter);
  }
}
