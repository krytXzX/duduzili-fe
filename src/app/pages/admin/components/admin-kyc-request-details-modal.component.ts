import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroCheck,
  heroCheckCircle,
  heroClock,
  heroDocumentText,
  heroInformationCircle,
  heroXCircle,
  heroXMark,
} from '@ng-icons/heroicons/outline';

export type AdminKycRequestStatus = 'pending approval' | 'approved' | 'declined';

export interface AdminKycRequestDetails {
  id: string;
  userName: string;
  email: string;
  avatar: string;
  idType: string;
  issuingCountry: string;
  modeOfCapture: string;
  dateUploaded: string;
  status: AdminKycRequestStatus;
  declineReason?: string;
  frontImage: string;
  backImage: string;
  selfieImage: string;
  reviewedByName?: string;
  reviewedByAvatar?: string;
  reviewedAt?: string;
}

type DetailsTab = 'overview' | 'activities';

@Component({
  selector: 'app-admin-kyc-request-details-modal',
  imports: [NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroCheck,
      heroCheckCircle,
      heroClock,
      heroDocumentText,
      heroInformationCircle,
      heroXCircle,
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
        aria-labelledby="kyc-request-modal-title"
        class="max-h-[90vh] w-full max-w-[760px] overflow-y-auto rounded-t-[26px] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] sm:max-h-[calc(100vh-2rem)] sm:rounded-[26px] sm:p-8"
        (click)="$event.stopPropagation()"
      >
        <div class="flex items-start justify-between gap-4">
          <h2 id="kyc-request-modal-title" class="text-[2rem] font-semibold tracking-[-0.04em] text-[#202020]">
            KYC request details
          </h2>

          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#626262] shadow-[0_8px_18px_-14px_rgba(0,0,0,0.35)] transition hover:bg-[#fafafa]"
            aria-label="Close KYC request modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>
        </div>

        <div class="mt-8">
          <p class="text-[15px] text-[#8b8b8b]">Requested by:</p>

          <div class="mt-4 flex flex-wrap items-center gap-4">
            <div class="h-18 w-18 shrink-0 overflow-hidden rounded-full bg-[#f3f3f3]">
              <img
                [ngSrc]="request().avatar"
                [alt]="request().userName"
                width="72"
                height="72"
                class="h-18 w-18 object-cover"
              >
            </div>

            <div>
              <h3 class="text-[18px] font-semibold text-[#202020]">{{ request().userName }}</h3>
              <p class="mt-1 text-[15px] text-[#8b8b8b]">{{ request().email }}</p>
            </div>

            <span
              class="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[14px] font-medium"
              [class.bg-[#fff6e8]]="request().status === 'pending approval'"
              [class.bg-[#eefbf1]]="request().status === 'approved'"
              [class.bg-[#fff1f1]]="request().status === 'declined'"
              [class.text-[#f39a22]]="request().status === 'pending approval'"
              [class.text-[#2ab83f]]="request().status === 'approved'"
              [class.text-[#ff2d2d]]="request().status === 'declined'"
            >
              <ng-icon [name]="statusIconName()" class="text-[15px]"></ng-icon>
              {{ statusLabel() }}
            </span>
          </div>

          @if (request().status === 'declined' && request().declineReason) {
            <div class="mt-5 rounded-full bg-[#fffbdc] px-4 py-3 text-[15px] font-medium text-[#303030]">
              Reason: "{{ request().declineReason }}"
            </div>
          }
        </div>

        @if (request().status === 'pending approval') {
          <div class="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              (click)="approve.emit(request().id)"
              class="inline-flex min-w-[126px] items-center justify-center gap-2 rounded-full bg-[#6653e4] px-6 py-3 text-[15px] font-medium text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945db]"
            >
              <ng-icon name="heroCheck" class="text-[16px]"></ng-icon>
              Approve
            </button>

            <button
              type="button"
              (click)="decline.emit(request().id)"
              class="inline-flex min-w-[126px] items-center justify-center gap-2 rounded-full bg-[#f5f5f5] px-6 py-3 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-[#efefef]"
            >
              <ng-icon name="heroXMark" class="text-[16px]"></ng-icon>
              Decline
            </button>
          </div>
        }

        <div class="mt-8 border-b border-[#efefef]">
          <div class="flex items-center gap-8">
            <button
              type="button"
              (click)="activeTab.set('overview')"
              class="flex items-center gap-2 border-b-2 px-1 py-3 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'overview'"
              [class.text-[#6254f3]]="activeTab() === 'overview'"
              [class.border-transparent]="activeTab() !== 'overview'"
              [class.text-[#8b8b8b]]="activeTab() !== 'overview'"
            >
              <ng-icon name="heroInformationCircle" class="text-[16px]"></ng-icon>
              Overview
            </button>

            <button
              type="button"
              (click)="activeTab.set('activities')"
              class="flex items-center gap-2 border-b-2 px-1 py-3 text-[15px] font-medium transition-colors"
              [class.border-[#6254f3]]="activeTab() === 'activities'"
              [class.text-[#6254f3]]="activeTab() === 'activities'"
              [class.border-transparent]="activeTab() !== 'activities'"
              [class.text-[#8b8b8b]]="activeTab() !== 'activities'"
            >
              <ng-icon name="heroDocumentText" class="text-[16px]"></ng-icon>
              Activities
            </button>
          </div>
        </div>

        @if (activeTab() === 'overview') {
          <section class="mt-8 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
            <h3 class="text-[16px] font-medium text-[#8b8b8b]">Summary</h3>

            <div class="mt-6 grid gap-y-5 sm:grid-cols-[220px_minmax(0,1fr)]">
              <p class="text-[15px] text-[#8f8f8f]">ID type</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ request().idType }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Issuing country/region</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ request().issuingCountry }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Mode of capture</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ request().modeOfCapture }}</p>

              <p class="text-[15px] text-[#8f8f8f]">Date uploaded</p>
              <p class="text-[15px] font-medium text-[#222222]">{{ request().dateUploaded }}</p>
            </div>
          </section>

          <section class="mt-6 rounded-[24px] border border-[#e9e9e9] px-5 py-5">
            <h3 class="text-[16px] font-medium text-[#8b8b8b]">Media</h3>

            <div class="mt-6 grid gap-y-6 sm:grid-cols-[100px_minmax(0,1fr)]">
              <p class="text-[15px] text-[#8f8f8f]">Front</p>
              <div class="h-22 w-[128px] overflow-hidden rounded-[12px] bg-[#f3f3f3]">
                <img
                  [ngSrc]="request().frontImage"
                  alt="Front ID"
                  width="128"
                  height="88"
                  class="h-22 w-[128px] object-cover"
                >
              </div>

              <p class="text-[15px] text-[#8f8f8f]">Back</p>
              <div class="h-22 w-[128px] overflow-hidden rounded-[12px] bg-[#f3f3f3]">
                <img
                  [ngSrc]="request().backImage"
                  alt="Back ID"
                  width="128"
                  height="88"
                  class="h-22 w-[128px] object-cover"
                >
              </div>

              <p class="text-[15px] text-[#8f8f8f]">Selfie</p>
              <div class="h-22 w-[84px] overflow-hidden rounded-[12px] bg-[#f3f3f3]">
                <img
                  [ngSrc]="request().selfieImage"
                  alt="Selfie"
                  width="84"
                  height="88"
                  class="h-22 w-[84px] object-cover"
                >
              </div>
            </div>
          </section>
        } @else {
          <section class="mt-8">
            <div class="space-y-10">
              <div class="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
                <div class="relative flex justify-center">
                  <div class="flex h-11 w-11 items-center justify-center rounded-full border border-[#ececec] bg-white text-[#8b8b8b]">
                    <ng-icon [name]="statusIconName()" class="text-[18px]"></ng-icon>
                  </div>
                  <div class="absolute left-1/2 top-11 h-12 w-px -translate-x-1/2 bg-[#e9e9e9]"></div>
                </div>

                <div class="pt-1">
                  <p class="text-[15px] font-medium text-[#202020]">{{ activityTitle() }}</p>

                  @if (request().status === 'pending approval') {
                    <p class="mt-1 text-[15px] text-[#b1b1b1]">---</p>
                  } @else {
                    <div class="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[#9a9a9a]">
                      <span>by</span>
                      <div class="h-6 w-6 overflow-hidden rounded-full bg-[#f3f3f3]">
                        <img
                          [ngSrc]="reviewerAvatar()"
                          [alt]="reviewerName()"
                          width="24"
                          height="24"
                          class="h-6 w-6 object-cover"
                        >
                      </div>
                      <span class="font-medium text-[#4d4d4d]">{{ reviewerName() }}</span>
                      <span>{{ reviewTimestamp() }}</span>
                    </div>
                  }
                </div>
              </div>

              <div class="grid grid-cols-[44px_minmax(0,1fr)] gap-4">
                <div class="flex justify-center">
                  <div class="flex h-11 w-11 items-center justify-center rounded-full border border-[#ececec] bg-white text-[#8b8b8b]">
                    <ng-icon name="heroDocumentText" class="text-[18px]"></ng-icon>
                  </div>
                </div>

                <div class="pt-1">
                  <p class="text-[15px] font-medium text-[#202020]">KYC submitted</p>
                  <div class="mt-2 flex flex-wrap items-center gap-2 text-[14px] text-[#9a9a9a]">
                    <span>by</span>
                    <div class="h-6 w-6 overflow-hidden rounded-full bg-[#f3f3f3]">
                      <img
                        [ngSrc]="request().avatar"
                        [alt]="request().userName"
                        width="24"
                        height="24"
                        class="h-6 w-6 object-cover"
                      >
                    </div>
                    <span class="font-medium text-[#4d4d4d]">{{ request().userName }}</span>
                    <span>{{ request().dateUploaded }}, 02:45 pm</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminKycRequestDetailsModalComponent {
  readonly request = input.required<AdminKycRequestDetails>();

  readonly close = output<void>();
  readonly approve = output<string>();
  readonly decline = output<string>();

  readonly activeTab = signal<DetailsTab>('overview');

  constructor() {
    effect(() => {
      this.request().id;
      this.activeTab.set('overview');
    });
  }

  readonly statusLabel = computed(() => {
    switch (this.request().status) {
      case 'approved':
        return 'Approved';
      case 'declined':
        return 'Declined';
      default:
        return 'Pending approval';
    }
  });

  readonly statusIconName = computed(() => {
    switch (this.request().status) {
      case 'approved':
        return 'heroCheckCircle';
      case 'declined':
        return 'heroXCircle';
      default:
        return 'heroClock';
    }
  });

  readonly activityTitle = computed(() => {
    switch (this.request().status) {
      case 'approved':
        return 'KYC approved';
      case 'declined':
        return 'KYC declined';
      default:
        return 'Pending approval';
    }
  });

  readonly reviewerName = computed(() => this.request().reviewedByName ?? 'Bryan Odjede');
  readonly reviewerAvatar = computed(() => this.request().reviewedByAvatar ?? '/assets/images/fashion_menswear_hero.png');
  readonly reviewTimestamp = computed(() => this.request().reviewedAt ?? this.request().dateUploaded);
}
