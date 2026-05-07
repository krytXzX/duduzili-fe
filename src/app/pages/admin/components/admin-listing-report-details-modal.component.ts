import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowTopRightOnSquare,
  heroExclamationTriangle,
  heroXMark,
} from '@ng-icons/heroicons/outline';

export interface AdminListingReportDetails {
  id: string;
  listingId: string;
  listingTitle: string;
  listingImage: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerAvatar: string;
  reportedById: string;
  reportedByName: string;
  reportedByEmail: string;
  reportedByAvatar: string;
  dateReported: string;
  description: string;
  totalReports: number;
}

@Component({
  selector: 'app-admin-listing-report-details-modal',
  imports: [NgIcon, NgOptimizedImage, RouterLink],
  providers: [
    provideIcons({
      heroArrowTopRightOnSquare,
      heroExclamationTriangle,
      heroXMark,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-end justify-center bg-black/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="listing-report-modal-title"
        class="max-h-[85vh] w-full overflow-y-auto rounded-t-[28px] rounded-b-[28px] bg-white p-5 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-h-[calc(100vh-2rem)] sm:max-w-[760px] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="listing-report-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            Report details
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close report details modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <div class="mt-8">
          <p class="text-[15px] text-[#8b8b8b]">Reported listing:</p>

          <div class="mt-4 flex items-center gap-4">
            <div class="h-18 w-18 shrink-0 overflow-hidden rounded-[18px] bg-[#f3f3f3]">
              <img
                [ngSrc]="report().listingImage"
                [alt]="report().listingTitle"
                width="72"
                height="72"
                class="h-18 w-18 object-cover"
              >
            </div>

            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="truncate text-[18px] font-semibold text-[#202020]">{{ report().listingTitle }}</h3>
                <a
                  [routerLink]="['/admin/listings', report().listingId]"
                  class="inline-flex h-6 w-6 items-center justify-center text-[#4f5965] transition hover:text-[#202020]"
                  aria-label="Open listing details"
                >
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[18px]"></ng-icon>
                </a>
              </div>
            </div>
          </div>
        </div>

        <section class="mt-8 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
          <h3 class="text-[16px] font-medium text-[#8b8b8b]">General details</h3>

          <div class="mt-6 grid gap-y-5 sm:grid-cols-[170px_minmax(0,1fr)]">
            <p class="text-[15px] text-[#8f8f8f]">Seller</p>
            <div class="flex min-w-0 items-center gap-3">
              <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                <img
                  [ngSrc]="report().sellerAvatar"
                  [alt]="report().sellerName"
                  width="32"
                  height="32"
                  class="h-8 w-8 object-cover"
                >
              </div>
              <div class="flex min-w-0 items-center gap-2">
                <p class="truncate text-[15px] font-medium text-[#222222]">{{ report().sellerName }}</p>
                <a
                  [routerLink]="['/admin/users', report().sellerId]"
                  class="inline-flex h-5 w-5 items-center justify-center text-[#4f5965] transition hover:text-[#202020]"
                  aria-label="Open seller details"
                >
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[16px]"></ng-icon>
                </a>
              </div>
            </div>

            <p class="text-[15px] text-[#8f8f8f]">Reported by</p>
            <div class="flex min-w-0 items-center gap-3">
              <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                <img
                  [ngSrc]="report().reportedByAvatar"
                  [alt]="report().reportedByName"
                  width="32"
                  height="32"
                  class="h-8 w-8 object-cover"
                >
              </div>
              <div class="flex min-w-0 items-center gap-2">
                <p class="truncate text-[15px] font-medium text-[#222222]">{{ report().reportedByName }}</p>
                <a
                  [routerLink]="['/admin/users', report().reportedById]"
                  class="inline-flex h-5 w-5 items-center justify-center text-[#4f5965] transition hover:text-[#202020]"
                  aria-label="Open reporter details"
                >
                  <ng-icon name="heroArrowTopRightOnSquare" class="text-[16px]"></ng-icon>
                </a>
              </div>
            </div>

            <p class="text-[15px] text-[#8f8f8f]">Date reported</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ report().dateReported }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Description</p>
            <p class="text-[15px] leading-8 font-medium text-[#222222]">{{ report().description }}</p>
          </div>
        </section>

        <div class="mt-8 flex items-center gap-3 rounded-[18px] bg-[#fffbdc] px-4 py-4 text-[#44411c]">
          <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#d8d100] text-[#fffbdc]">
            <ng-icon name="heroExclamationTriangle" class="text-[16px]"></ng-icon>
          </div>
          <p class="text-[15px]">
            This item has been reported <span class="font-semibold">{{ report().totalReports }} times</span>
          </p>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminListingReportDetailsModalComponent {
  readonly report = input.required<AdminListingReportDetails>();

  readonly close = output<void>();
}
