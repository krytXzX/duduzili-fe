import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroArrowUpTray,
  heroComputerDesktop,
  heroDevicePhoneMobile,
  heroExclamationTriangle,
  heroPhoto,
  heroXMark,
} from '@ng-icons/heroicons/outline';

export interface CreateBannerAdPayload {
  title: string;
  destinationUrl: string;
  bannerType: 'image' | 'video';
  imagePreview: string | null;
}

@Component({
  selector: 'app-create-banner-ad-modal',
  imports: [CommonModule, ReactiveFormsModule, NgIcon, NgOptimizedImage],
  providers: [
    provideIcons({
      heroArrowUpTray,
      heroComputerDesktop,
      heroDevicePhoneMobile,
      heroExclamationTriangle,
      heroPhoto,
      heroXMark,
    }),
  ],
  template: `
    <div
      class="fixed inset-0 z-[200] flex bg-black/20 p-3 backdrop-blur-[2px] animate-in fade-in duration-300"
      (click)="close.emit()"
    >
      <div
        class="flex h-full w-full flex-col overflow-hidden rounded-[32px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
        (click)="$event.stopPropagation()"
      >
        <header class="flex items-center gap-5 border-b border-[#F1F2F4] bg-white px-6 py-5">
          <button
            type="button"
            (click)="close.emit()"
            class="flex h-11 w-11 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2] focus:outline-none focus:ring-4 focus:ring-gray-200"
            aria-label="Close create ad modal"
          >
            <ng-icon name="heroXMark" class="text-xl"></ng-icon>
          </button>

          <h1 class="text-[1.75rem] font-bold tracking-tight text-[#24262D]">Create Ad</h1>
        </header>

        <div class="flex-1 overflow-y-auto">
          <div
            class="mx-auto grid max-w-[1320px] gap-10 px-6 py-8 xl:grid-cols-[minmax(0,1fr)_360px] xl:px-10"
          >
            <section class="max-w-[720px]">
              <h2 class="text-[2.3rem] font-black tracking-tight text-[#24262D]">
                Configure Banner Ad
              </h2>

              <div class="mt-4 flex gap-3 rounded-[18px] bg-[#FFFBE5] px-5 py-4 text-[#5A5B33]">
                <div
                  class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]"
                >
                  <ng-icon name="heroExclamationTriangle" class="text-base"></ng-icon>
                </div>
                <div>
                  <p class="text-sm font-bold text-[#36361D]">Approval Required</p>
                  <p class="mt-1 max-w-xl text-sm font-medium leading-6 text-[#6F7154]">
                    All banner ads are reviewed by our team before going live to ensure quality and
                    compliance. Review typically takes 24-48 hours.
                  </p>
                </div>
              </div>

              <form [formGroup]="bannerForm" class="mt-8 space-y-8">
                <section>
                  <h3 class="text-[1.85rem] font-bold tracking-tight text-[#24262D]">
                    General information
                  </h3>

                  <div class="mt-5 space-y-5">
                    <div>
                      <label
                        for="banner-title"
                        class="mb-2 block text-sm font-semibold text-[#61656E]"
                        >Ad Title</label
                      >
                      <input
                        id="banner-title"
                        type="text"
                        formControlName="title"
                        placeholder="eg Christmas Sale Banner"
                        class="w-full rounded-[14px] border border-[#E7E8EC] bg-white px-4 py-3.5 text-sm font-medium text-[#24262D] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-4 focus:ring-[#7B6BF2]/10"
                      />
                    </div>

                    <div>
                      <label
                        for="destination-url"
                        class="mb-2 block text-sm font-semibold text-[#61656E]"
                      >
                        Destination URL
                        <span class="font-medium text-[#A3A6AE]"
                          >(where users will go when they click the banner)</span
                        >
                      </label>
                      <input
                        id="destination-url"
                        type="url"
                        formControlName="destinationUrl"
                        class="w-full rounded-[14px] border border-[#E7E8EC] bg-white px-4 py-3.5 text-sm font-medium text-[#24262D] outline-none transition placeholder:text-[#B3B6BE] focus:border-[#7B6BF2] focus:ring-4 focus:ring-[#7B6BF2]/10"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <h3 class="text-[1.85rem] font-bold tracking-tight text-[#24262D]">
                    Choose banner type
                  </h3>

                  <div class="mt-5 flex flex-col gap-3 sm:flex-row">
                    @for (option of bannerTypeOptions; track option.value) {
                      <label
                        class="flex min-w-[220px] cursor-pointer items-center gap-3 rounded-[14px] border px-4 py-4 transition"
                        [class.border-[#7868F3]]="bannerType() === option.value"
                        [class.bg-[#F7F5FF]]="bannerType() === option.value"
                        [class.text-[#4D447E]]="bannerType() === option.value"
                        [class.border-[#EAEBEF]]="bannerType() !== option.value"
                        [class.text-[#747986]]="bannerType() !== option.value"
                      >
                        <input
                          type="radio"
                          class="h-4 w-4 accent-[#7868F3]"
                          formControlName="bannerType"
                          [value]="option.value"
                        />
                        <span class="text-base font-medium">{{ option.label }}</span>
                      </label>
                    }
                  </div>
                </section>

                <section>
                  <div class="flex items-end justify-between gap-4">
                    <div>
                      <h3 class="text-[1.85rem] font-bold tracking-tight text-[#24262D]">
                        Banner image
                      </h3>
                      <p class="mt-1 text-sm font-medium text-[#7A7F8C]">
                        Recommended dimension: 1080 x 90
                      </p>
                    </div>
                  </div>

                  <div class="mt-5">
                    <input
                      #fileInput
                      type="file"
                      accept="image/png,image/jpeg"
                      class="sr-only"
                      (change)="onFileSelected($event)"
                    />

                    <button
                      type="button"
                      (click)="fileInput.click()"
                      class="flex min-h-[210px] w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-[#D8DBE2] bg-[#FBFBFC] px-6 py-10 text-center transition hover:border-[#B9B7F8] hover:bg-[#FBFAFF] focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                    >
                      @if (imagePreview()) {
                        <div class="flex w-full max-w-[460px] flex-col items-center gap-4">
                          <div
                            class="w-full overflow-hidden rounded-[18px] border border-[#E6E8ED] bg-white p-2 shadow-sm"
                          >
                            <img
                              [src]="imagePreview()!"
                              alt="Selected banner preview"
                              class="h-auto w-full rounded-[14px] object-cover"
                            />
                          </div>
                          <span
                            class="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#3A3D45] shadow-sm"
                          >
                            <ng-icon name="heroArrowUpTray" class="text-base"></ng-icon>
                            Change file
                          </span>
                        </div>
                      } @else {
                        <span
                          class="inline-flex items-center gap-2 rounded-full border border-[#E6E8ED] bg-white px-5 py-3 text-sm font-semibold text-[#3A3D45] shadow-sm"
                        >
                          <ng-icon name="heroArrowUpTray" class="text-base"></ng-icon>
                          Add file
                        </span>
                        <span class="mt-4 text-sm font-medium text-[#B0B4BD]"
                          >PNG, JPEG under 7MB</span
                        >
                      }
                    </button>
                  </div>
                </section>
              </form>
            </section>

            <aside
              class="flex flex-col rounded-[28px] bg-[#FAFAFB] p-5 shadow-[inset_0_0_0_1px_rgba(235,237,242,0.9)]"
            >
              <div>
                <h3 class="text-[1.8rem] font-bold tracking-tight text-[#24262D]">Preview</h3>
                <p class="mt-1 text-sm font-medium text-[#A3A6AE]">
                  This is how your banner ad will appear to buyers
                </p>
              </div>

              <div class="mt-7 flex justify-center gap-3">
                <button
                  type="button"
                  (click)="previewMode.set('desktop')"
                  [attr.aria-pressed]="previewMode() === 'desktop'"
                  class="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                  [class.border-[#DCDDDF]]="previewMode() !== 'desktop'"
                  [class.text-[#7D8089]]="previewMode() !== 'desktop'"
                  [class.border-[#7868F3]]="previewMode() === 'desktop'"
                  [class.text-[#7868F3]]="previewMode() === 'desktop'"
                >
                  <ng-icon name="heroComputerDesktop" class="text-lg"></ng-icon>
                </button>
                <button
                  type="button"
                  (click)="previewMode.set('mobile')"
                  [attr.aria-pressed]="previewMode() === 'mobile'"
                  class="flex h-11 w-11 items-center justify-center rounded-full border bg-white transition focus:outline-none focus:ring-4 focus:ring-[#7868F3]/10"
                  [class.border-[#DCDDDF]]="previewMode() !== 'mobile'"
                  [class.text-[#7D8089]]="previewMode() !== 'mobile'"
                  [class.border-[#7868F3]]="previewMode() === 'mobile'"
                  [class.text-[#7868F3]]="previewMode() === 'mobile'"
                >
                  <ng-icon name="heroDevicePhoneMobile" class="text-lg"></ng-icon>
                </button>
              </div>

              <div class="mt-6 flex flex-1 items-center justify-center">
                <div
                  class="rounded-[26px] bg-white p-4 shadow-[0_22px_60px_-40px_rgba(19,27,45,0.35)]"
                  [class.w-full]="previewMode() === 'desktop'"
                  [class.max-w-[344px]]="previewMode() === 'desktop'"
                  [class.w-[258px]]="previewMode() === 'mobile'"
                >
                  <div class="overflow-hidden rounded-[20px] border border-[#ECEDEF] bg-[#FCFCFD]">
                    <div
                      class="flex items-center justify-between bg-[#1D1E22] px-3 py-1.5"
                    >
                      <div class="flex items-center gap-2">
                        <div class="h-2.5 w-2.5 rounded-full bg-white"></div>
                        <span class="text-[0.5rem] font-bold text-white">Duduzili</span>
                      </div>
                      <div class="flex items-center gap-1">
                        <div class="h-1.5 w-10 rounded-full bg-white/25"></div>
                        <div class="h-3 w-6 rounded-full bg-white"></div>
                      </div>
                    </div>

                    <div class="space-y-4 bg-white p-3">
                      <div class="grid grid-cols-5 gap-2 opacity-35 blur-[1.4px]">
                        @for (item of skeletonItems; track item) {
                          <div class="space-y-1.5">
                            <div class="aspect-square rounded-[10px] bg-[#ECEEF2]"></div>
                            <div class="h-1.5 rounded-full bg-[#ECEEF2]"></div>
                            <div class="h-1.5 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                          </div>
                        }
                      </div>

                      <div class="grid grid-cols-5 gap-2 opacity-35 blur-[1.4px]">
                        @for (item of skeletonItems; track item) {
                          <div class="space-y-1.5">
                            <div class="aspect-square rounded-[10px] bg-[#ECEEF2]"></div>
                            <div class="h-1.5 rounded-full bg-[#ECEEF2]"></div>
                            <div class="h-1.5 w-2/3 rounded-full bg-[#ECEEF2]"></div>
                          </div>
                        }
                      </div>

                      <div class="overflow-hidden rounded-[10px] border border-[#ECEDEF] bg-white">
                        <div
                          class="relative aspect-[3.85/1] w-full"
                          [style.background]="previewBannerBackground()"
                        >
                          @if (imagePreview()) {
                            <img
                              [src]="imagePreview()!"
                              alt="Banner artwork preview"
                              class="absolute inset-0 h-full w-full object-cover"
                            />
                          } @else {
                            <div
                              class="absolute inset-y-0 left-0 flex w-[58%] flex-col justify-center px-3 text-white"
                            >
                              <span
                                class="text-[0.42rem] font-black uppercase tracking-[0.18em] opacity-85"
                                >Sponsored</span
                              >
                              <span class="mt-1 text-[0.9rem] font-black leading-none">{{
                                previewHeadline()
                              }}</span>
                              <span
                                class="mt-1 text-[0.5rem] font-semibold uppercase tracking-[0.1em] opacity-90"
                                >{{ previewSubline() }}</span
                              >
                            </div>
                            <div class="absolute bottom-2 right-2 flex gap-1">
                              <div class="h-6 w-6 rounded-[7px] bg-white/85"></div>
                              <div class="h-6 w-10 rounded-[7px] bg-[#FFCE48]"></div>
                            </div>
                          }

                          <div
                            class="absolute left-1.5 top-1.5 rounded-full bg-[#23252C]/70 px-1.5 py-0.5 text-[0.36rem] font-semibold text-white backdrop-blur-sm"
                          >
                            Sponsored
                          </div>
                        </div>

                        <div
                          class="flex items-center gap-3 px-2 py-1.5 text-[0.52rem] font-medium text-[#A3A6AE]"
                        >
                          <span class="inline-flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span>
                            1K
                          </span>
                          <span class="inline-flex items-center gap-1">
                            <span class="h-1.5 w-1.5 rounded-full bg-[#D0D4DC]"></span>
                            500
                          </span>
                        </div>
                      </div>

                      <div class="grid grid-cols-[1.25fr_0.95fr] gap-4 pt-1">
                        <div>
                          <div class="flex items-center gap-1.5 text-[0.48rem] font-bold text-[#24262D]">
                            <div class="h-2.5 w-2.5 rounded-full bg-[#24262D]"></div>
                            Duduzili
                          </div>
                          <div class="mt-2 space-y-1 opacity-60">
                            <div class="h-1.5 w-24 rounded-full bg-[#E5E7EC]"></div>
                            <div class="h-1.5 w-20 rounded-full bg-[#E5E7EC]"></div>
                          </div>
                          <div class="mt-3 flex items-end gap-2">
                            <div class="grid h-10 w-10 grid-cols-3 gap-[2px] rounded-[4px] border border-[#1F2024] bg-white p-[3px]">
                              @for (tile of qrTiles; track tile) {
                                <span [class]="tile"></span>
                              }
                            </div>
                            <div class="space-y-1">
                              <div class="h-3 w-16 rounded bg-[#1F2024]"></div>
                              <div class="h-3 w-16 rounded bg-[#E8EAEE]"></div>
                            </div>
                          </div>
                          <p class="mt-2 text-[0.38rem] font-medium uppercase tracking-[0.08em] text-[#A3A6AE]">
                            ©2024 Duduzili. All rights reserved
                          </p>
                        </div>

                        <div class="grid grid-cols-2 gap-3">
                          <div>
                            <p class="text-[0.48rem] font-bold text-[#24262D]">Social</p>
                            <div class="mt-2 space-y-1.5 opacity-60">
                              <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1.5 w-8 rounded-full bg-[#E5E7EC]"></div>
                            </div>
                          </div>
                          <div>
                            <p class="text-[0.48rem] font-bold text-[#24262D]">Resources</p>
                            <div class="mt-2 space-y-1.5 opacity-60">
                              <div class="h-1.5 w-10 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1.5 w-9 rounded-full bg-[#E5E7EC]"></div>
                              <div class="h-1.5 w-7 rounded-full bg-[#E5E7EC]"></div>
                            </div>
                          </div>
                          <div class="col-span-2 mt-1">
                            <div class="h-1.5 w-16 rounded-full bg-[#E5E7EC] opacity-60"></div>
                            <div class="mt-2 flex items-center gap-1.5">
                              <div class="h-3.5 flex-1 rounded bg-[#F5F6F8]"></div>
                              <div class="h-3.5 w-7 rounded-full bg-[#7B6BF2]"></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="relative h-12 overflow-hidden rounded-b-[14px]">
                        <img
                          ngSrc="assets/images/Duduzili.png"
                          alt="Duduzili footer artwork"
                          fill
                          class="object-cover object-top opacity-80"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>

        <footer class="border-t border-[#F1F2F4] bg-white px-6 py-5">
          <div class="mx-auto flex max-w-[1320px] justify-end gap-3">
            <button
              type="button"
              (click)="close.emit()"
              class="rounded-full bg-[#F2F3F5] px-6 py-3.5 text-sm font-bold text-[#454A54] transition hover:bg-[#E8E9ED] focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              Back
            </button>
            <button
              type="button"
              (click)="submitForm()"
              [disabled]="bannerForm.invalid"
              class="rounded-full bg-[#6B5BE7] px-7 py-3.5 text-sm font-bold text-white shadow-[0_16px_34px_-18px_rgba(107,91,231,0.9)] transition hover:bg-[#5F50DE] focus:outline-none focus:ring-4 focus:ring-[#6B5BE7]/20 disabled:cursor-not-allowed disabled:bg-[#D7D1FB] disabled:shadow-none"
            >
              Submit for approval
            </button>
          </div>
        </footer>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBannerAdModalComponent {
  readonly close = output<void>();
  readonly submit = output<CreateBannerAdPayload>();

  private readonly fb = inject(FormBuilder);

  readonly bannerTypeOptions = [
    { value: 'image', label: 'Image Ad (1 left)' },
    { value: 'video', label: 'Video Ad (1 left)' },
  ] as const;

  readonly skeletonItems = [1, 2, 3, 4, 5];
  readonly qrTiles = [
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-white',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
    'rounded-[1px] bg-[#1F2024]',
  ];
  readonly previewMode = signal<'desktop' | 'mobile'>('desktop');
  readonly imagePreview = signal<string | null>(null);

  readonly bannerForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    destinationUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/i)]],
    bannerType: this.fb.nonNullable.control<'image' | 'video'>('image', Validators.required),
  });

  readonly bannerType = computed(() => this.bannerForm.controls.bannerType.value);
  readonly previewHeadline = computed(() => {
    const title = this.bannerForm.controls.title.value.trim();
    return title ? this.truncate(title, 24) : 'Christmas Sale';
  });
  readonly previewSubline = computed(() =>
    this.bannerType() === 'video' ? 'Video banner ad' : 'Image banner ad',
  );
  readonly previewBannerBackground = computed(() =>
    this.bannerType() === 'video'
      ? 'linear-gradient(135deg, #5F7CFA 0%, #2E91FF 45%, #28C6F0 100%)'
      : 'linear-gradient(135deg, #FFCC4B 0%, #FF8C1A 42%, #F35B22 100%)',
  );

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.imagePreview.set(URL.createObjectURL(file));
  }

  submitForm(): void {
    if (this.bannerForm.invalid) {
      this.bannerForm.markAllAsTouched();
      return;
    }

    this.submit.emit({
      title: this.bannerForm.controls.title.value.trim(),
      destinationUrl: this.bannerForm.controls.destinationUrl.value.trim(),
      bannerType: this.bannerForm.controls.bannerType.value,
      imagePreview: this.imagePreview(),
    });
  }

  private truncate(value: string, maxLength: number): string {
    return value.length > maxLength ? `${value.slice(0, maxLength - 1)}...` : value;
  }
}
