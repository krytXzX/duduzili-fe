import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { FaqService, FAQItem } from '../../services/faq.service';

@Component({
  selector: 'app-admin-faq-page',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    @if (!isEditing()) {
      <div class="space-y-6 p-4 lg:p-8">
        <!-- Top header layout -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F6] text-gray-600 transition active:scale-95 md:hidden"
              aria-label="Back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2.5"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 19.5 8.25 12l7.5-7.5"
                />
              </svg>
            </button>
            <h1 class="text-[24px] md:text-[32px] font-bold text-[#1A1C21]">FAQs</h1>
          </div>
          <button
            type="button"
            (click)="startEditing()"
            class="flex h-9 w-9 md:h-12 md:w-auto items-center justify-center rounded-full md:rounded-[20px] bg-[#6453D9] text-white shadow-sm hover:bg-[#5C4AD0] transition active:scale-95 md:px-6"
            title="Create FAQ"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="2.5"
              stroke="currentColor"
              class="h-5 w-5 md:hidden"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span class="hidden md:inline text-[14px] font-semibold">Create FAQ</span>
          </button>
        </div>

        <!-- Overview Cards row -->
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-none md:grid md:grid-cols-4 lg:gap-6">
          <div
            (click)="setActiveFilter('all')"
            [class.border-[#6453D9]]="activeFilter() === 'all'"
            [class.ring-2]="activeFilter() === 'all'"
            [class.ring-[#6453D9]/10]="activeFilter() === 'all'"
            class="min-w-[130px] flex-1 cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-4 transition hover:bg-gray-50"
          >
            <p class="text-[11px] md:text-[12px] font-medium text-gray-400">All FAQs</p>
            <p class="mt-2 text-[20px] md:text-[28px] font-bold text-[#1A1C21]">
              {{ faqsList() ? faqsList().length : 0 }}
            </p>
          </div>

          <div
            (click)="setActiveFilter('Published')"
            [class.border-[#6453D9]]="activeFilter() === 'Published'"
            [class.ring-2]="activeFilter() === 'Published'"
            [class.ring-[#6453D9]/10]="activeFilter() === 'Published'"
            class="min-w-[130px] flex-1 cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-4 transition hover:bg-gray-50"
          >
            <p class="text-[11px] md:text-[12px] font-medium text-gray-400">Published</p>
            <p class="mt-2 text-[20px] md:text-[28px] font-bold text-[#1A1C21]">
              {{ getFaqCountByStatus('Published') }}
            </p>
          </div>

          <div
            (click)="setActiveFilter('Draft')"
            [class.border-[#6453D9]]="activeFilter() === 'Draft'"
            [class.ring-2]="activeFilter() === 'Draft'"
            [class.ring-[#6453D9]/10]="activeFilter() === 'Draft'"
            class="min-w-[130px] flex-1 cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-4 transition hover:bg-gray-50"
          >
            <p class="text-[11px] md:text-[12px] font-medium text-gray-400">Draft</p>
            <p class="mt-2 text-[20px] md:text-[28px] font-bold text-[#1A1C21]">
              {{ getFaqCountByStatus('Draft') }}
            </p>
          </div>

          <div
            (click)="setActiveFilter('Archived')"
            [class.border-[#6453D9]]="activeFilter() === 'Archived'"
            [class.ring-2]="activeFilter() === 'Archived'"
            [class.ring-[#6453D9]/10]="activeFilter() === 'Archived'"
            class="min-w-[130px] flex-1 cursor-pointer rounded-[16px] border border-gray-100 bg-[#F9FAFC] p-4 transition hover:bg-gray-50"
          >
            <p class="text-[11px] md:text-[12px] font-medium text-gray-400">Archived</p>
            <p class="mt-2 text-[20px] md:text-[28px] font-bold text-[#1A1C21]">
              {{ getFaqCountByStatus('Archived') }}
            </p>
          </div>
        </div>

        <!-- Search and filters layout card -->
        <div
          class="rounded-[20px] md:rounded-[24px] border border-gray-100 bg-white p-4 md:p-5 shadow-xs"
        >
          <div class="flex flex-row items-center justify-between gap-4">
            <!-- Search Input -->
            <div class="relative flex-1 max-w-full md:max-w-[280px]">
              <span
                class="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2"
                  stroke="currentColor"
                  class="h-4 w-4"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.602 10.602Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search"
                class="h-10 w-full rounded-full bg-[#FAFAFC] pl-10 pr-4 text-xs font-medium text-[#1A1C21] outline-none placeholder:text-gray-400 border border-transparent focus:border-gray-200"
              />
            </div>

            <!-- Mobile Settings Filter Toggle icon -->
            <button
              type="button"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAFAFC] text-gray-600 border border-gray-100 md:hidden"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="h-4 w-4"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75"
                />
              </svg>
            </button>

            <!-- Filters Dropdowns (Desktop only) -->
            <div class="hidden md:flex items-center gap-3">
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 transition active:scale-95"
              >
                Author
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="h-3 w-3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-xs hover:bg-gray-50 transition active:scale-95"
              >
                User type
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="h-3 w-3"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m19.5 8.25-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Desktop Table Layout (hidden on mobile) -->
          <div class="hidden md:block mt-6 overflow-x-visible">
            <table class="w-full min-w-[800px] border-collapse text-left text-xs text-gray-500">
              <thead>
                <tr
                  class="border-b border-[#F5F5F7] text-[11px] font-semibold uppercase tracking-wider text-gray-400"
                >
                  <th class="pb-3 pr-4 font-semibold">Title</th>
                  <th class="pb-3 px-4 font-semibold">User type</th>
                  <th class="pb-3 px-4 font-semibold">Last updated</th>
                  <th class="pb-3 px-4 font-semibold">Author</th>
                  <th class="pb-3 px-4 font-semibold">Status</th>
                  <th class="pb-3 pl-4 font-semibold w-10"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#F5F5F7]">
                @for (item of filteredFaqItems(); track item.id || $index; let index = $index) {
                  <tr class="align-middle hover:bg-[#FAFAFC]/50 transition-colors">
                    <td
                      class="py-4 pr-4 text-[14px] font-semibold text-[#1A1C21] max-w-[280px] truncate"
                    >
                      {{ item.title }}
                    </td>
                    <td class="py-4 px-4 text-gray-600 font-medium">{{ item.user_type }}</td>
                    <td class="py-4 px-4 text-gray-600 font-medium">
                      {{ item.updated_at | date: 'dd MMM, yyyy' }}
                    </td>
                    <td class="py-4 px-4">
                      <div class="flex items-center gap-2">
                        <img
                          [src]="
                            item.author_avatar ||
                            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                          "
                          alt=""
                          width="32"
                          height="32"
                          class="h-8 w-8 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <p class="text-[13px] font-semibold text-[#1A1C21] leading-none mb-0.5">
                            {{ item.author_name || 'Admin User' }}
                          </p>
                          <p class="text-[11px] text-gray-400 leading-none">
                            {{ item.author_email || 'admin@duduzili.com' }}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="py-4 px-4">
                      @switch (item.status) {
                        @case ('Published') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-semibold text-[#25AD31]"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-[#25AD31]"></span>
                            Published
                          </span>
                        }
                        @case ('Draft') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#F4F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5E]"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-[#5E5E5E]"></span>
                            Draft
                          </span>
                        }
                        @case ('Archived') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[11px] font-semibold text-[#1969FE]"
                          >
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
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          class="h-5 w-5"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                          />
                        </svg>
                      </button>

                      <!-- Desktop Popup Dropdown Menu -->
                      @if (openMenuIndex() === index) {
                        <!-- Backdrop to close -->
                        <div class="fixed inset-0 z-10" (click)="closeMenu()"></div>

                        <div
                          class="absolute right-4 mt-2 w-40 rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 text-left z-20"
                        >
                          <p
                            class="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                          >
                            Menu
                          </p>

                          <div class="space-y-1">
                            <button
                              type="button"
                              (click)="closeMenu(); startEditing(item)"
                              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                class="h-4 w-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 21.75a.75.75 0 0 1-.528.22H3.75a.75.75 0 0 1-.75-.75V18.16a.75.75 0 0 1 .22-.528L16.862 4.487Zm0 0L19.5 7.125"
                                />
                              </svg>
                              Edit
                            </button>

                            @if (item.status === 'Published') {
                              <button
                                type="button"
                                (click)="closeMenu(); archiveFaqItem(item)"
                                class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="2"
                                  stroke="currentColor"
                                  class="h-4 w-4"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                                  />
                                </svg>
                                Archive
                              </button>
                            }

                            @if (item.status === 'Archived') {
                              <button
                                type="button"
                                (click)="closeMenu(); publishFaqItem(item)"
                                class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke-width="2"
                                  stroke="currentColor"
                                  class="h-4 w-4"
                                >
                                  <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                                  />
                                </svg>
                                Publish
                              </button>
                            }

                            <button
                              type="button"
                              (click)="closeMenu(); deleteFaqItem(item)"
                              class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#FF3B30] hover:bg-red-50/50 transition"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke-width="2"
                                stroke="currentColor"
                                class="h-4 w-4"
                              >
                                <path
                                  stroke-linecap="round"
                                  stroke-linejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
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

          <!-- Mobile Cards Layout List (hidden on desktop) -->
          <div class="block md:hidden mt-4 space-y-4">
            @for (item of filteredFaqItems(); track item.id || $index; let index = $index) {
              <div class="border-b border-[#F5F5F7] pb-4 space-y-3">
                <div class="flex items-start justify-between gap-4">
                  <h3 class="text-[15px] font-bold text-[#1A1C21] leading-snug">
                    {{ item.title }}
                  </h3>
                  <button
                    type="button"
                    (click)="toggleMenu(index); $event.stopPropagation()"
                    class="text-gray-400 hover:text-gray-600 p-1"
                    aria-label="Actions"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      class="h-5 w-5"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                  </button>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium">User type</span>
                  <span class="text-[#1A1C21] font-semibold">{{ item.user_type }}</span>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium font-semibold">Last updated</span>
                  <span class="text-[#1A1C21] font-semibold">{{
                    item.updated_at | date: 'dd MMM, yyyy'
                  }}</span>
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium">Status</span>
                  @switch (item.status) {
                    @case ('Published') {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-0.5 text-[11px] font-semibold text-[#25AD31]"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-[#25AD31]"></span>
                        Published
                      </span>
                    }
                    @case ('Draft') {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-[#F4F4F6] px-2.5 py-0.5 text-[11px] font-semibold text-[#5E5E5E]"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-[#5E5E5E]"></span>
                        Draft
                      </span>
                    }
                    @case ('Archived') {
                      <span
                        class="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-0.5 text-[11px] font-semibold text-[#1969FE]"
                      >
                        <span class="h-1.5 w-1.5 rounded-full bg-[#1969FE]"></span>
                        Archived
                      </span>
                    }
                  }
                </div>

                <div class="flex justify-between items-center text-xs">
                  <span class="text-gray-400 font-medium">Author</span>
                  <div class="flex items-center gap-1.5">
                    <img
                      [src]="
                        item.author_avatar ||
                        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
                      "
                      alt=""
                      width="20"
                      height="20"
                      class="h-5 w-5 rounded-full object-cover shrink-0"
                    />
                    <span class="text-[#1A1C21] font-semibold">{{
                      item.author_name || 'Admin User'
                    }}</span>
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Mobile Bottom Sheet Action Sheet Modal -->
        @for (item of filteredFaqItems(); track item.id || $index; let index = $index) {
          @if (openMenuIndex() === index) {
            <!-- Backdrop layer -->
            <div
              (click)="closeMenu()"
              class="fixed inset-0 bg-black/40 z-50 md:hidden transition-opacity duration-300"
            ></div>

            <!-- Bottomsheet content panel -->
            <div
              class="fixed bottom-0 left-0 right-0 rounded-t-[24px] bg-white p-6 shadow-2xl z-55 md:hidden transform translate-y-0 transition-transform duration-300 ease-out"
            >
              <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>
              <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">Menu</p>

              <div class="space-y-2">
                <!-- Edit -->
                <button
                  type="button"
                  (click)="closeMenu(); startEditing(item)"
                  class="flex w-full items-center gap-3.5 rounded-xl border border-gray-100 px-4 py-3.5 text-[14px] font-semibold text-[#1F1F1F] bg-white active:bg-gray-50 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="h-5 w-5 text-gray-400"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 21.75a.75.75 0 0 1-.528.22H3.75a.75.75 0 0 1-.75-.75V18.16a.75.75 0 0 1 .22-.528L16.862 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                  Edit
                </button>

                <!-- Archive (Published status) -->
                @if (item.status === 'Published') {
                  <button
                    type="button"
                    (click)="closeMenu(); archiveFaqItem(item)"
                    class="flex w-full items-center gap-3.5 rounded-xl border border-gray-100 px-4 py-3.5 text-[14px] font-semibold text-[#1F1F1F] bg-white active:bg-gray-50 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-5 w-5 text-gray-400"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 5.25v13.5m-7.5-13.5v13.5"
                      />
                    </svg>
                    Archive
                  </button>
                }

                <!-- Publish (Archived status) -->
                @if (item.status === 'Archived') {
                  <button
                    type="button"
                    (click)="closeMenu(); publishFaqItem(item)"
                    class="flex w-full items-center gap-3.5 rounded-xl border border-gray-100 px-4 py-3.5 text-[14px] font-semibold text-[#1F1F1F] bg-white active:bg-gray-50 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-5 w-5 text-gray-400"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                      />
                    </svg>
                    Publish
                  </button>
                }

                <!-- Delete -->
                <button
                  type="button"
                  (click)="closeMenu(); deleteFaqItem(item)"
                  class="flex w-full items-center gap-3.5 rounded-xl border border-red-50 px-4 py-3.5 text-[14px] font-semibold text-[#FF3B30] bg-red-50/10 active:bg-red-50 transition"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    class="h-5 w-5 text-[#FF3B30]"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          }
        }
      </div>
    } @else {
      <!-- FAQ Editor Screen layout -->
      <div class="flex min-h-screen flex-col bg-white">
        <!-- Editor Topbar -->
        <header class="flex h-16 items-center justify-between border-b border-[#F5F5F7] px-6">
          <div class="flex items-center gap-4">
            <button
              type="button"
              (click)="stopEditing()"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F4F6] text-[#4D5260] transition active:scale-95"
              aria-label="Cancel editing"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="2"
                stroke="currentColor"
                class="h-5 w-5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
            <span class="text-[16px] font-bold text-[#1A1C21]">Editor</span>
          </div>

          <div class="flex items-center gap-3">
            <!-- Sidebar toggle button in header when closed -->
            @if (!showSidebar()) {
              <button
                type="button"
                (click)="toggleSidebar()"
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F6] text-[#0F2942] transition active:scale-95"
                aria-label="Show settings details sidebar"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.58073 7.70833C4.23555 7.70833 3.95573 7.98816 3.95573 8.33333C3.95573 8.67851 4.23555 8.95833 4.58073 8.95833H9.58073C9.92591 8.95833 10.2057 8.67851 10.2057 8.33333C10.2057 7.98816 9.92591 7.70833 9.58073 7.70833H4.58073Z"
                    fill="#141414"
                    fill-opacity="0.5"
                  />
                  <path
                    d="M4.78906 11.6667C4.78906 11.3215 5.06889 11.0417 5.41406 11.0417H8.7474C9.09257 11.0417 9.3724 11.3215 9.3724 11.6667C9.3724 12.0118 9.09257 12.2917 8.7474 12.2917H5.41406C5.06889 12.2917 4.78906 12.0118 4.78906 11.6667Z"
                    fill="#141414"
                    fill-opacity="0.5"
                  />
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M8.28372 1.875C6.75226 1.87499 5.53922 1.87498 4.58988 2.00261C3.61286 2.13397 2.82207 2.41073 2.19843 3.03437C1.5748 3.65801 1.29803 4.4488 1.16668 5.42582C1.03904 6.37516 1.03905 7.58818 1.03906 9.11964V10.8803C1.03905 12.4118 1.03904 13.6248 1.16668 14.5742C1.29803 15.5512 1.5748 16.342 2.19843 16.9656C2.82207 17.5893 3.61286 17.866 4.58988 17.9974C5.53922 18.125 6.75223 18.125 8.28368 18.125H11.7111C11.9729 18.125 12.2255 18.125 12.469 18.1244C12.4784 18.1248 12.4879 18.125 12.4974 18.125C12.5081 18.125 12.5188 18.1247 12.5294 18.1242C13.6827 18.1206 14.6313 18.1014 15.4049 17.9974C16.3819 17.866 17.1727 17.5893 17.7964 16.9656C18.42 16.342 18.6968 15.5512 18.8281 14.5742C18.9558 13.6248 18.9557 12.4118 18.9557 10.8804V9.11966C18.9557 7.58821 18.9558 6.37515 18.8281 5.42582C18.6968 4.4488 18.42 3.65801 17.7964 3.03437C17.1727 2.41073 16.3819 2.13397 15.4049 2.00261C14.6313 1.89861 13.6827 1.87936 12.5294 1.8758C12.5188 1.87527 12.5081 1.875 12.4974 1.875C12.4879 1.875 12.4784 1.87521 12.469 1.87563C12.2255 1.875 11.973 1.875 11.7111 1.875H8.28372ZM11.8724 3.12502C11.8038 3.125 11.7344 3.125 11.6641 3.125H8.33073C6.74171 3.125 5.61282 3.12633 4.75644 3.24147C3.91803 3.35419 3.43499 3.56558 3.08232 3.91825C2.72964 4.27093 2.51825 4.75397 2.40553 5.59237C2.29039 6.44876 2.28906 7.57765 2.28906 9.16667V10.8333C2.28906 12.4224 2.29039 13.5512 2.40553 14.4076C2.51825 15.246 2.72964 15.7291 3.08232 16.0817C3.43499 16.4344 3.91803 16.6458 4.75644 16.7585C5.61282 16.8737 6.74171 16.875 8.33073 16.875H11.6641C11.7344 16.875 11.8038 16.875 11.8724 16.875L11.8724 3.12502ZM13.1224 16.8702C13.9838 16.8612 14.6709 16.8348 15.2384 16.7585C16.0768 16.6458 16.5598 16.4344 16.9125 16.0817C17.2652 15.7291 17.4765 15.246 17.5893 14.4076C17.7044 13.5512 17.7057 12.4224 17.7057 10.8333V9.16667C17.7057 7.57765 17.7044 6.44876 17.5893 5.59237C17.4765 4.75397 17.2652 4.27093 16.9125 3.91825C16.5598 3.56558 16.0768 3.35419 15.2384 3.24147C14.6709 3.16517 13.9838 3.13885 13.1224 3.12977L13.1224 16.8702Z"
                    fill="#141414"
                    fill-opacity="0.5"
                  />
                </svg>
              </button>
            }
            <div class="relative">
              <button
                type="button"
                (click)="toggleEditorMenu(); $event.stopPropagation()"
                class="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F4F4F6] text-gray-600 transition active:scale-95"
                aria-label="More options"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="2.5"
                  stroke="currentColor"
                  class="h-5 w-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                  />
                </svg>
              </button>

              <!-- Editor Action Menu Desktop popup -->
              <div class="hidden md:block">
                @if (isEditorMenuOpen()) {
                  <!-- Backdrop to close -->
                  <div class="fixed inset-0 z-10" (click)="closeEditorMenu()"></div>

                  <div
                    class="absolute right-0 mt-2 w-48 rounded-[20px] bg-white p-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-gray-100 text-left z-20"
                  >
                    <p
                      class="px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400"
                    >
                      Menu
                    </p>

                    <div class="space-y-1">
                      <button
                        type="button"
                        (click)="closeEditorMenu(); saveDraft()"
                        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#1F1F1F] hover:bg-gray-50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="h-4 w-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                          />
                        </svg>
                        Save to drafts
                      </button>

                      <button
                        type="button"
                        (click)="closeEditorMenu(); stopEditing()"
                        class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-semibold text-[#FF3B30] hover:bg-red-50/50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="h-4 w-4"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>

              <!-- Editor Action Menu Mobile bottomsheet -->
              <div class="md:hidden">
                @if (isEditorMenuOpen()) {
                  <div (click)="closeEditorMenu()" class="fixed inset-0 bg-black/40 z-50"></div>
                  <div
                    class="fixed bottom-0 left-0 right-0 rounded-t-[24px] bg-white p-6 shadow-2xl z-55 text-left"
                  >
                    <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>
                    <p class="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-4">
                      Menu
                    </p>

                    <div class="space-y-2">
                      <button
                        type="button"
                        (click)="closeEditorMenu(); saveDraft()"
                        class="flex w-full items-center gap-3.5 rounded-xl border border-gray-100 px-4 py-3.5 text-[14px] font-semibold text-[#1F1F1F] bg-white active:bg-gray-50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="h-5 w-5 text-gray-400"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                          />
                        </svg>
                        Save to drafts
                      </button>

                      <button
                        type="button"
                        (click)="closeEditorMenu(); stopEditing()"
                        class="flex w-full items-center gap-3.5 rounded-xl border border-red-50 px-4 py-3.5 text-[14px] font-semibold text-[#FF3B30] bg-red-50/10 active:bg-red-50 transition"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2"
                          stroke="currentColor"
                          class="h-5 w-5 text-[#FF3B30]"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
            <button
              type="button"
              (click)="publishFaq()"
              class="rounded-full bg-[#6453D9] px-5 py-2 text-[13px] font-bold text-white shadow-sm hover:bg-[#5C4AD0] transition active:scale-95"
            >
              Publish
            </button>
          </div>
        </header>

        <!-- Editor Work Area (Split Panel Layout) -->
        <div class="flex flex-1 min-h-0">
          <!-- Text Editing Panel (Left Column) -->
          <main class="flex-1 p-10 flex flex-col">
            <div class="max-w-[700px] flex-1 flex flex-col space-y-6">
              <input
                type="text"
                placeholder="Untitled article"
                [value]="editorTitle()"
                (input)="editorTitle.set($any($event.target).value)"
                class="w-full text-[40px] font-extrabold tracking-tight text-[#1A1C21] outline-none placeholder:text-[#BBB]"
              />

              <!-- Quill Rich Text Editor -->
              <quill-editor
                #quillEditor
                theme="bubble"
                class="w-full flex-1 text-[16px] text-[#4D5260] [&_.ql-tooltip]:z-50 [&_.ql-editor]:p-0 [&_.ql-editor]:outline-none [&_.ql-editor]:text-[16px] [&_.ql-editor]:leading-relaxed"
                placeholder="Type anything..."
                [modules]="quillModules"
                [ngModel]="editorContent()"
                (ngModelChange)="editorContent.set($any($event))"
              ></quill-editor>
            </div>
          </main>

          <!-- Details Settings Panel (Right Sidebar on Desktop, Bottomsheet on Mobile) -->
          <!-- Desktop aside panel -->
          @if (showSidebar()) {
            <aside
              class="hidden md:block w-[320px] border-l border-[#F5F5F7] bg-white p-6 overflow-y-auto shrink-0"
            >
              <div class="flex items-center justify-between border-b border-[#F5F5F7] pb-4">
                <h3 class="text-[18px] font-bold text-[#0F2942]">Details</h3>
                <button
                  type="button"
                  (click)="toggleSidebar()"
                  class="text-[#0F2942] hover:opacity-80"
                  aria-label="Hide settings details sidebar"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.58073 7.70833C4.23555 7.70833 3.95573 7.98816 3.95573 8.33333C3.95573 8.67851 4.23555 8.95833 4.58073 8.95833H9.58073C9.92591 8.95833 10.2057 8.67851 10.2057 8.33333C10.2057 7.98816 9.92591 7.70833 9.58073 7.70833H4.58073Z"
                      fill="#141414"
                      fill-opacity="0.5"
                    />
                    <path
                      d="M4.78906 11.6667C4.78906 11.3215 5.06889 11.0417 5.41406 11.0417H8.7474C9.09257 11.0417 9.3724 11.3215 9.3724 11.6667C9.3724 12.0118 9.09257 12.2917 8.7474 12.2917H5.41406C5.06889 12.2917 4.78906 12.0118 4.78906 11.6667Z"
                      fill="#141414"
                      fill-opacity="0.5"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M8.28372 1.875C6.75226 1.87499 5.53922 1.87498 4.58988 2.00261C3.61286 2.13397 2.82207 2.41073 2.19843 3.03437C1.5748 3.65801 1.29803 4.4488 1.16668 5.42582C1.03904 6.37516 1.03905 7.58818 1.03906 9.11964V10.8803C1.03905 12.4118 1.03904 13.6248 1.16668 14.5742C1.29803 15.5512 1.5748 16.342 2.19843 16.9656C2.82207 17.5893 3.61286 17.866 4.58988 17.9974C5.53922 18.125 6.75223 18.125 8.28368 18.125H11.7111C11.9729 18.125 12.2255 18.125 12.469 18.1244C12.4784 18.1248 12.4879 18.125 12.4974 18.125C12.5081 18.125 12.5188 18.1247 12.5294 18.1242C13.6827 18.1206 14.6313 18.1014 15.4049 17.9974C16.3819 17.866 17.1727 17.5893 17.7964 16.9656C18.42 16.342 18.6968 15.5512 18.8281 14.5742C18.9558 13.6248 18.9557 12.4118 18.9557 10.8804V9.11966C18.9557 7.58821 18.9558 6.37515 18.8281 5.42582C18.6968 4.4488 18.42 3.65801 17.7964 3.03437C17.1727 2.41073 16.3819 2.13397 15.4049 2.00261C14.6313 1.89861 13.6827 1.87936 12.5294 1.8758C12.5188 1.87527 12.5081 1.875 12.4974 1.875C12.4879 1.875 12.4784 1.87521 12.469 1.87563C12.2255 1.875 11.973 1.875 11.7111 1.875H8.28372ZM11.8724 3.12502C11.8038 3.125 11.7344 3.125 11.6641 3.125H8.33073C6.74171 3.125 5.61282 3.12633 4.75644 3.24147C3.91803 3.35419 3.43499 3.56558 3.08232 3.91825C2.72964 4.27093 2.51825 4.75397 2.40553 5.59237C2.29039 6.44876 2.28906 7.57765 2.28906 9.16667V10.8333C2.28906 12.4224 2.29039 13.5512 2.40553 14.4076C2.51825 15.246 2.72964 15.7291 3.08232 16.0817C3.43499 16.4344 3.91803 16.6458 4.75644 16.7585C5.61282 16.8737 6.74171 16.875 8.33073 16.875H11.6641C11.7344 16.875 11.8038 16.875 11.8724 16.875L11.8724 3.12502ZM13.1224 16.8702C13.9838 16.8612 14.6709 16.8348 15.2384 16.7585C16.0768 16.6458 16.5598 16.4344 16.9125 16.0817C17.2652 15.7291 17.4765 15.246 17.5893 14.4076C17.7044 13.5512 17.7057 12.4224 17.7057 10.8333V9.16667C17.7057 7.57765 17.7044 6.44876 17.5893 5.59237C17.4765 4.75397 17.2652 4.27093 16.9125 3.91825C16.5598 3.56558 16.0768 3.35419 15.2384 3.24147C14.6709 3.16517 13.9838 3.13885 13.1224 3.12977L13.1224 16.8702Z"
                      fill="#141414"
                      fill-opacity="0.5"
                    />
                  </svg>
                </button>
              </div>

              <div class="mt-6 space-y-6">
                <!-- Who's this FAQ for? settings block -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm font-semibold text-[#1A1C21]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-4 w-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    Who's this FAQ for?
                  </div>
                  <p class="text-[12px] leading-5 text-gray-400">
                    Choose whether this FAQ is tailored for buyers or sellers.
                  </p>

                  <!-- Select Box wrapper -->
                  <div class="space-y-1.5">
                    <label class="text-[11px] font-semibold text-gray-400">User type</label>
                    <div class="relative">
                      <button
                        type="button"
                        (click)="toggleUserTypeMenu(); $event.stopPropagation()"
                        class="flex h-10 w-full items-center justify-between rounded-lg border border-[#EAEAEF] bg-white px-3 text-xs font-semibold text-[#1A1C21] outline-none"
                      >
                        <span>{{ selectedUserType() }}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          [class.rotate-180]="isUserTypeMenuOpen()"
                          class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </button>

                      <!-- Desktop User Type Selector Dropdown Menu -->
                      @if (isUserTypeMenuOpen()) {
                        <div
                          class="hidden md:block fixed inset-0 z-10"
                          (click)="closeUserTypeMenu()"
                        ></div>
                        <div
                          class="hidden md:block absolute left-0 right-0 mt-1 rounded-lg border border-gray-100 bg-white py-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] z-20"
                        >
                          <button
                            type="button"
                            (click)="selectUserType('Buyers')"
                            [class.bg-gray-50]="selectedUserType() === 'Buyers'"
                            class="flex w-full px-3 py-2 text-left text-xs font-semibold text-[#1A1C21] hover:bg-gray-50 transition"
                          >
                            Buyers
                          </button>
                          <button
                            type="button"
                            (click)="selectUserType('Sellers')"
                            [class.bg-gray-50]="selectedUserType() === 'Sellers'"
                            class="flex w-full px-3 py-2 text-left text-xs font-semibold text-[#1A1C21] hover:bg-gray-50 transition"
                          >
                            Sellers
                          </button>
                        </div>
                      }
                    </div>
                  </div>
                </div>
              </div>

              <!-- Collapsible Data settings section -->
              <div class="border-t border-[#F5F5F7] pt-5 mt-5">
                <button
                  type="button"
                  (click)="toggleDataAccordion()"
                  class="flex w-full items-center justify-between text-sm font-semibold text-[#1A1C21]"
                >
                  <span class="flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-4 w-4 text-gray-500"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                      />
                    </svg>
                    Data
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    [class.rotate-180]="isDataAccordionOpen()"
                    class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>

                @if (isDataAccordionOpen()) {
                  <div class="mt-4 space-y-4 text-xs font-semibold text-gray-500">
                    <!-- Status -->
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">Status</span>
                      @switch (editorStatus()) {
                        @case ('Published') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-semibold text-[#25AD31]"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-[#25AD31]"></span>
                            Published
                          </span>
                        }
                        @case ('Draft') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#F4F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5E]"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-[#5E5E5E]"></span>
                            Draft
                          </span>
                        }
                        @case ('Archived') {
                          <span
                            class="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[11px] font-semibold text-[#1969FE]"
                          >
                            <span class="h-1.5 w-1.5 rounded-full bg-[#1969FE]"></span>
                            Archived
                          </span>
                        }
                      }
                    </div>

                    <!-- Created -->
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">Created</span>
                      <span class="text-[#1A1C21]">{{
                        editorCreatedAt() ? (editorCreatedAt() | date: 'dd MMM, yyyy') : 'Just now'
                      }}</span>
                    </div>

                    <!-- Created by -->
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">Created by</span>
                      <div class="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                          alt=""
                          width="24"
                          height="24"
                          class="h-6 w-6 rounded-full object-cover"
                        />
                        <span class="text-[#1A1C21]">{{ editorAuthorName() }}</span>
                      </div>
                    </div>

                    <!-- Last updated -->
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">Last updated</span>
                      <span class="text-[#1A1C21]">{{
                        editorCreatedAt() ? (editorCreatedAt() | date: 'dd MMM, yyyy') : 'Just now'
                      }}</span>
                    </div>

                    <!-- Last updated by -->
                    <div class="flex items-center justify-between">
                      <span class="text-gray-400">Last updated by</span>
                      <div class="flex items-center gap-2">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                          alt=""
                          width="24"
                          height="24"
                          class="h-6 w-6 rounded-full object-cover"
                        />
                        <span class="text-[#1A1C21]">{{ editorAuthorName() }}</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            </aside>
          }

          <!-- Mobile Details Settings Bottom Sheet overlay -->
          @if (showSidebar()) {
            <div (click)="toggleSidebar()" class="fixed inset-0 bg-black/40 z-50 md:hidden"></div>
            <div
              class="fixed bottom-0 left-0 right-0 rounded-t-[24px] bg-white p-6 shadow-2xl z-55 md:hidden text-left"
            >
              <div class="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5"></div>
              <div class="flex items-center justify-between mb-6">
                <h3 class="text-[18px] font-bold text-[#1A1C21]">Details</h3>
                <button type="button" (click)="toggleSidebar()" class="text-gray-400 p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2.5"
                    stroke="currentColor"
                    class="h-5 w-5"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div class="space-y-6">
                <!-- Who's this FAQ for? settings block -->
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-sm font-semibold text-[#1A1C21]">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      class="h-4 w-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                    Who's this FAQ for?
                  </div>
                  <p class="text-[12px] leading-5 text-gray-400">
                    Choose whether this FAQ is tailored for buyers or sellers.
                  </p>

                  <!-- Select Box wrapper -->
                  <div class="space-y-1.5">
                    <label class="text-[11px] font-semibold text-gray-400">User type</label>
                    <div class="relative">
                      <button
                        type="button"
                        (click)="toggleUserTypeMenu(); $event.stopPropagation()"
                        class="flex h-10 w-full items-center justify-between rounded-lg border border-[#EAEAEF] bg-white px-3 text-xs font-semibold text-[#1A1C21] outline-none"
                      >
                        <span>{{ selectedUserType() }}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="2.5"
                          stroke="currentColor"
                          class="h-3.5 w-3.5 text-gray-400"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Collapsible Data settings section -->
                <div class="border-t border-[#F5F5F7] pt-5 mt-5">
                  <button
                    type="button"
                    (click)="toggleDataAccordion()"
                    class="flex w-full items-center justify-between text-sm font-semibold text-[#1A1C21]"
                  >
                    <span class="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="2"
                        stroke="currentColor"
                        class="h-4 w-4 text-gray-500"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                        />
                      </svg>
                      Data
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2.5"
                      stroke="currentColor"
                      [class.rotate-180]="isDataAccordionOpen()"
                      class="h-3.5 w-3.5 text-gray-400 transition-transform duration-200"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m19.5 8.25-7.5 7.5-7.5-7.5"
                      />
                    </svg>
                  </button>

                  @if (isDataAccordionOpen()) {
                    <div class="mt-4 space-y-4 text-xs font-semibold text-gray-500">
                      <div class="flex items-center justify-between">
                        <span class="text-gray-400">Status</span>
                        @switch (editorStatus()) {
                          @case ('Published') {
                            <span
                              class="inline-flex items-center gap-1 rounded-full bg-[#E8F8EE] px-2.5 py-1 text-[11px] font-semibold text-[#25AD31]"
                            >
                              <span class="h-1.5 w-1.5 rounded-full bg-[#25AD31]"></span>
                              Published
                            </span>
                          }
                          @case ('Draft') {
                            <span
                              class="inline-flex items-center gap-1 rounded-full bg-[#F4F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#5E5E5E]"
                            >
                              <span class="h-1.5 w-1.5 rounded-full bg-[#5E5E5E]"></span>
                              Draft
                            </span>
                          }
                          @case ('Archived') {
                            <span
                              class="inline-flex items-center gap-1 rounded-full bg-[#EAF2FE] px-2.5 py-1 text-[11px] font-semibold text-[#1969FE]"
                            >
                              <span class="h-1.5 w-1.5 rounded-full bg-[#1969FE]"></span>
                              Archived
                            </span>
                          }
                        }
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-gray-400">Created</span>
                        <span class="text-[#1A1C21]">{{
                          editorCreatedAt()
                            ? (editorCreatedAt() | date: 'dd MMM, yyyy')
                            : 'Just now'
                        }}</span>
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-gray-400">Created by</span>
                        <div class="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                            alt=""
                            width="24"
                            height="24"
                            class="h-6 w-6 rounded-full object-cover"
                          />
                          <span class="text-[#1A1C21]">{{ editorAuthorName() }}</span>
                        </div>
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-gray-400">Last updated</span>
                        <span class="text-[#1A1C21]">{{
                          editorCreatedAt()
                            ? (editorCreatedAt() | date: 'dd MMM, yyyy')
                            : 'Just now'
                        }}</span>
                      </div>

                      <div class="flex items-center justify-between">
                        <span class="text-gray-400">Last updated by</span>
                        <div class="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
                            alt=""
                            width="24"
                            height="24"
                            class="h-6 w-6 rounded-full object-cover"
                          />
                          <span class="text-[#1A1C21]">{{ editorAuthorName() }}</span>
                        </div>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminFaqPageComponent implements OnInit {
  private readonly faqService = inject(FaqService);

  readonly activeFilter = signal<string>('all');
  readonly openMenuIndex = signal<number | null>(null);
  readonly isEditing = signal<boolean>(false);
  readonly isUserTypeMenuOpen = signal<boolean>(false);
  readonly selectedUserType = signal<'Buyers' | 'Sellers'>('Buyers');
  readonly showSidebar = signal<boolean>(false);
  readonly isEditorMenuOpen = signal<boolean>(false);
  readonly isDataAccordionOpen = signal<boolean>(true);

  // Editor fields
  readonly editorTitle = signal<string>('');
  readonly editorContent = signal<string>('');
  readonly activeEditingId = signal<number | null>(null);
  readonly editorStatus = signal<'Published' | 'Draft' | 'Archived'>('Draft');
  readonly editorCreatedAt = signal<string | null>(null);
  readonly editorAuthorName = signal<string>('Amaka Chibuzor');

  readonly faqsList = signal<FAQItem[]>([]);

  readonly quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ header: 1 }, { header: 2 }],
      [{ list: 'bullet' }],
      ['link'],
      ['clean'],
    ],
  };

  ngOnInit(): void {
    this.loadFaqs();
  }

  loadFaqs(): void {
    this.faqService.getFaqs().subscribe({
      next: (faqs) => {
        console.log('Backend FAQs raw response:', faqs);
        // If paginated, Django REST Framework returns { results: [...] } instead of direct array
        const list = Array.isArray(faqs) ? faqs : (faqs as any).results || [];
        console.log('Resolved FAQ list:', list);
        this.faqsList.set(list);
      },
      error: (err) => console.error('Failed to load FAQs', err),
    });
  }

  toggleDataAccordion(): void {
    this.isDataAccordionOpen.update((v) => !v);
  }

  toggleSidebar(): void {
    this.showSidebar.update((v) => !v);
  }

  toggleEditorMenu(): void {
    this.isEditorMenuOpen.update((v) => !v);
  }

  closeEditorMenu(): void {
    this.isEditorMenuOpen.set(false);
  }

  toggleUserTypeMenu(): void {
    this.isUserTypeMenuOpen.update((v) => !v);
  }

  closeUserTypeMenu(): void {
    this.isUserTypeMenuOpen.set(false);
  }

  selectUserType(type: 'Buyers' | 'Sellers'): void {
    this.selectedUserType.set(type);
    this.closeUserTypeMenu();
  }

  startEditing(faq?: FAQItem): void {
    if (faq) {
      this.activeEditingId.set(faq.id || null);
      this.editorTitle.set(faq.title);
      this.editorContent.set(faq.content);
      this.selectedUserType.set(faq.user_type);
      this.editorStatus.set(faq.status);
      this.editorCreatedAt.set(faq.created_at || null);
      this.editorAuthorName.set(faq.author_name || 'Admin User');
    } else {
      this.activeEditingId.set(null);
      this.editorTitle.set('');
      this.editorContent.set('');
      this.selectedUserType.set('Buyers');
      this.editorStatus.set('Draft');
      this.editorCreatedAt.set(null);
      this.editorAuthorName.set('Admin User');
    }
    this.showSidebar.set(false);
    this.isEditing.set(true);
  }

  stopEditing(): void {
    this.showSidebar.set(false);
    this.isEditing.set(false);
    this.activeEditingId.set(null);
  }

  saveDraft(): void {
    this.submitFaq('Draft');
  }

  publishFaq(): void {
    this.submitFaq('Published');
  }

  private submitFaq(status: 'Published' | 'Draft' | 'Archived'): void {
    const payload: FAQItem = {
      title: this.editorTitle() || 'Untitled FAQ',
      content: this.editorContent(),
      user_type: this.selectedUserType(),
      status: status,
    };

    const editId = this.activeEditingId();
    if (editId !== null) {
      this.faqService.updateFaq(editId, payload).subscribe({
        next: () => {
          this.loadFaqs();
          this.stopEditing();
        },
        error: (err) => console.error('Failed to update FAQ', err),
      });
    } else {
      this.faqService.createFaq(payload).subscribe({
        next: () => {
          this.loadFaqs();
          this.stopEditing();
        },
        error: (err) => console.error('Failed to create FAQ', err),
      });
    }
  }

  archiveFaqItem(faq: FAQItem): void {
    if (!faq.id) return;
    this.faqService.updateFaq(faq.id, { status: 'Archived' }).subscribe({
      next: () => this.loadFaqs(),
      error: (err) => console.error('Failed to archive FAQ', err),
    });
  }

  publishFaqItem(faq: FAQItem): void {
    if (!faq.id) return;
    this.faqService.updateFaq(faq.id, { status: 'Published' }).subscribe({
      next: () => this.loadFaqs(),
      error: (err) => console.error('Failed to publish FAQ', err),
    });
  }

  deleteFaqItem(faq: FAQItem): void {
    if (!faq.id) return;
    this.faqService.deleteFaq(faq.id).subscribe({
      next: () => this.loadFaqs(),
      error: (err) => console.error('Failed to delete FAQ', err),
    });
  }

  toggleMenu(index: number): void {
    this.openMenuIndex.update((curr) => (curr === index ? null : index));
  }

  closeMenu(): void {
    this.openMenuIndex.set(null);
  }

  setActiveFilter(status: string): void {
    this.activeFilter.set(status);
  }

  filteredFaqItems(): readonly FAQItem[] {
    const list = this.faqsList();
    if (!list || !Array.isArray(list)) {
      return [];
    }
    const filter = this.activeFilter();
    if (filter === 'all') {
      return list;
    }
    return list.filter((item) => item.status === filter);
  }

  getFaqCountByStatus(status: 'Published' | 'Draft' | 'Archived'): number {
    const list = this.faqsList();
    if (!list || !Array.isArray(list)) {
      return 0;
    }
    return list.filter((item) => item.status === status).length;
  }
}
