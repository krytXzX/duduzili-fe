import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroArrowTopRightOnSquare, heroCheck, heroXMark } from '@ng-icons/heroicons/outline';

export type PromotionRequestStatus = 'pending' | 'declined' | 'approved';

export interface PromotionRequestModalData {
  id: string;
  adTitle: string;
  thumbnail: string;
  userName: string;
  userAvatar: string;
  destinationUrl: string;
  bannerType: 'Image' | 'Video';
  plan: string;
  activeUntil: string;
  dateRequested: string;
  status: PromotionRequestStatus;
  declineReason?: string;
}

@Component({
  selector: 'app-admin-promotion-request-modal',
  imports: [NgIcon, NgOptimizedImage],
  providers: [provideIcons({ heroArrowTopRightOnSquare, heroCheck, heroXMark })],
  template: `
    <div
      class="fixed inset-0 z-[220] flex items-center justify-center bg-black/20 p-4 backdrop-blur-[2px]"
      (click)="close.emit()"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="promotion-request-modal-title"
        class="max-h-[calc(100vh-2rem)] w-full max-w-[760px] overflow-y-auto rounded-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="promotion-request-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            Request details
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close request details modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <div class="mt-6 overflow-hidden rounded-[28px]">
          <img
            [ngSrc]="request().thumbnail"
            [alt]="request().adTitle"
            width="1392"
            height="768"
            class="aspect-[1.75] w-full object-cover"
          >
        </div>

        @if (request().status === 'declined' && request().declineReason) {
          <div class="mt-6 rounded-full bg-[#fffbdc] px-4 py-3 text-[15px] font-medium text-[#303030]">
            Reason: "{{ request().declineReason }}"
          </div>
        }

        <section class="mt-8 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
          <h3 class="text-[16px] font-medium text-[#8b8b8b]">Banner Ad details</h3>

          <div class="mt-6 grid gap-y-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <p class="text-[15px] text-[#8f8f8f]">User</p>
            <div class="flex items-center gap-3">
              <div class="h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
                <img
                  [ngSrc]="request().userAvatar"
                  [alt]="request().userName"
                  width="32"
                  height="32"
                  class="h-8 w-8 object-cover"
                >
              </div>
              <span class="text-[15px] font-medium text-[#222222]">{{ request().userName }}</span>
            </div>

            <p class="text-[15px] text-[#8f8f8f]">Ad Title</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ request().adTitle }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Destination URL</p>
            <a
              [href]="request().destinationUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex min-w-0 items-center gap-2 text-[15px] font-medium text-[#222222] hover:text-[#6254f3]"
            >
              <span class="truncate">{{ request().destinationUrl }}</span>
              <ng-icon name="heroArrowTopRightOnSquare" class="shrink-0 text-[16px]"></ng-icon>
            </a>

            <p class="text-[15px] text-[#8f8f8f]">Banner type</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ request().bannerType }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Plan</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ request().plan }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Active until</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ request().activeUntil }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Date requested</p>
            <p class="text-[15px] font-medium text-[#222222]">{{ request().dateRequested }}</p>

            <p class="text-[15px] text-[#8f8f8f]">Status</p>
            <p
              class="text-[15px] font-medium"
              [class.text-[#f39a22]]="request().status === 'pending'"
              [class.text-[#ff2d2d]]="request().status === 'declined'"
              [class.text-[#2ab83f]]="request().status === 'approved'"
            >
              {{ statusLabel() }}
            </p>
          </div>
        </section>

        @if (request().status === 'pending') {
          <div class="mt-14 flex flex-wrap justify-center gap-4">
            <button
              type="button"
              (click)="approve.emit(request().id)"
              class="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
            >
              <ng-icon name="heroCheck" class="text-[16px]"></ng-icon>
              Approve
            </button>

            <button
              type="button"
              (click)="decline.emit(request().id)"
              class="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#efefef]"
            >
              <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
              Decline
            </button>
          </div>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPromotionRequestModalComponent {
  readonly request = input.required<PromotionRequestModalData>();

  readonly close = output<void>();
  readonly approve = output<string>();
  readonly decline = output<string>();

  statusLabel(): string {
    switch (this.request().status) {
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending';
    }
  }
}
