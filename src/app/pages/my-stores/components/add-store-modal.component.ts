import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  output,
  signal,
} from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MobileOverlayService } from '../../../services/mobile-overlay.service';

export interface AddStoreFormValue {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly whatsappNumber: string;
  readonly callNumber: string;
  readonly logo: string;
  readonly banner: string;
}

@Component({
  selector: 'app-add-store-modal',
  imports: [ReactiveFormsModule, NgOptimizedImage],
  template: `
    <div
      class="fixed inset-0 z-50 bg-black/40 backdrop-blur-[4px] md:flex md:items-center md:justify-center md:p-4"
      (click)="close.emit()"
    >
      <div
        class="fixed inset-x-0 bottom-0 top-3 flex max-h-[calc(100dvh-0.75rem)] flex-col overflow-x-hidden overflow-y-hidden rounded-t-[36px] bg-white md:relative md:top-auto md:max-h-[90vh] md:w-full md:max-w-[600px] md:rounded-[16px]"
        (click)="$event.stopPropagation()"
      >
        <div
          class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#ebebeb] md:hidden"
        ></div>

        <div class="flex min-h-0 flex-1 flex-col">
          <div
            class="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-8 pt-[34px] md:px-6 md:pb-0 md:pt-6"
          >
            <div class="mx-auto w-full md:w-[552px]">
              <div class="flex items-center justify-between gap-4">
                <h2
                  class="text-[24px] leading-8 font-semibold tracking-[-0.03em] text-[#1a1b1d] md:text-[28px] md:leading-10 md:text-[#0d0d0d]"
                >
                  Add new store
                </h2>

                <button
                  type="button"
                  class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
                  aria-label="Close add store flow"
                  (click)="close.emit()"
                >
                  <img
                    [ngSrc]="closeIconUrl"
                    alt=""
                    width="24"
                    height="24"
                    class="h-6 w-6"
                    aria-hidden="true"
                  />
                </button>
              </div>

              <section class="mt-6 md:mt-8">
                <div class="flex flex-col gap-[7px]">
                  <h3 class="text-[20px] leading-6 font-semibold text-[#0d0d0d]">
                    General information
                  </h3>
                  <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.5)]">
                    Fill out general information about this store
                  </p>
                </div>

                <form [formGroup]="storeForm" class="mt-6 space-y-5 md:mt-6 md:space-y-5">
                  <div class="space-y-2">
                    <label
                      class="block text-[14px] leading-[1.2] font-medium text-[#5a5a5a]"
                      for="store-name"
                    >
                      Store name
                    </label>
                    <input
                      id="store-name"
                      type="text"
                      formControlName="name"
                      class="h-12 w-full rounded-[8px] border border-[#eaeaea] px-3 text-[14px] tracking-[-0.01em] text-[#0d0d0d] outline-none placeholder:text-[rgba(13,13,13,0.4)] md:h-10"
                    />
                  </div>

                  <div class="space-y-2">
                    <label
                      class="block text-[14px] leading-[1.2] font-medium text-[#5a5a5a]"
                      for="store-location"
                    >
                      Location
                    </label>
                    <div class="relative">
                      <select
                        id="store-location"
                        formControlName="location"
                        class="h-12 w-full appearance-none rounded-[8px] border border-[#eaeaea] bg-white px-3 pr-10 text-[14px] tracking-[-0.01em] text-[#0d0d0d] outline-none md:h-10"
                      >
                        <option value="" disabled>Select location</option>
                        @for (location of locations; track location) {
                          <option [value]="location">{{ location }}</option>
                        }
                      </select>

                      <img
                        [ngSrc]="chevronIconUrl"
                        alt=""
                        width="10"
                        height="10"
                        class="pointer-events-none absolute right-3 top-1/2 shrink-0 -translate-y-1/2 object-contain rotate-[-90deg]"
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <div class="space-y-2">
                    <label
                      class="block text-[14px] leading-[1.2] font-medium text-[#5a5a5a]"
                      for="store-description"
                    >
                      Description
                    </label>
                    <textarea
                      id="store-description"
                      formControlName="description"
                      rows="4"
                      class="min-h-[112px] w-full resize-none rounded-[8px] border border-[#eaeaea] px-3 py-3 text-[14px] tracking-[-0.01em] text-[#0d0d0d] outline-none placeholder:text-[rgba(13,13,13,0.4)] md:min-h-[96px]"
                      placeholder="Tell buyers a little about this store"
                    ></textarea>
                  </div>

                  <div class="grid gap-5 md:grid-cols-2 md:gap-5">
                    <div class="space-y-2">
                      <label
                        class="block text-[14px] leading-[1.2] font-medium text-[#5a5a5a]"
                        for="store-whatsapp"
                      >
                        WhatsApp number
                      </label>
                      <input
                        id="store-whatsapp"
                        type="tel"
                        formControlName="whatsappNumber"
                        class="h-12 w-full rounded-[8px] border border-[#eaeaea] px-3 text-[14px] tracking-[-0.01em] text-[#0d0d0d] outline-none placeholder:text-[rgba(13,13,13,0.4)] md:h-10"
                      />
                    </div>

                    <div class="space-y-2">
                      <label
                        class="block text-[14px] leading-[1.2] font-medium text-[#5a5a5a]"
                        for="store-call"
                      >
                        Call number
                      </label>
                      <input
                        id="store-call"
                        type="tel"
                        formControlName="callNumber"
                        class="h-12 w-full rounded-[8px] border border-[#eaeaea] px-3 text-[14px] tracking-[-0.01em] text-[#0d0d0d] outline-none placeholder:text-[rgba(13,13,13,0.4)] md:h-10"
                      />
                    </div>
                  </div>
                </form>
              </section>

              <section class="mt-8 md:mt-8">
                <div class="flex flex-col gap-1">
                  <h3 class="text-[20px] leading-6 font-semibold text-[#0d0d0d]">Profile photo</h3>
                  <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.5)]">
                    Recommended size: 100 x 100
                  </p>
                </div>

                <input
                  #profileInput
                  type="file"
                  accept="image/png,image/jpeg"
                  class="hidden"
                  (change)="onFileSelected($event, 'profile')"
                />

                <button
                  type="button"
                  class="relative mt-3 inline-flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border border-[#eaeaea] bg-[#f9f9f9]"
                  (click)="profileInput.click()"
                  aria-label="Upload profile photo"
                >
                  @if (profilePreview(); as profilePreview) {
                    <img
                      [src]="profilePreview"
                      alt="Store profile preview"
                      class="h-full w-full object-cover"
                    />
                  } @else {
                    <img
                      [ngSrc]="imagePlaceholderIconUrl"
                      alt=""
                      width="50"
                      height="50"
                      class="h-[50px] w-[50px]"
                      aria-hidden="true"
                    />
                  }

                  <span
                    class="absolute bottom-0 right-0 inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_2.67px_5.339px_rgba(202,202,202,0.25)]"
                  >
                    <img
                      [ngSrc]="plusIconUrl"
                      alt=""
                      width="16"
                      height="16"
                      class="h-4 w-4 rotate-[-45deg]"
                      aria-hidden="true"
                    />
                  </span>
                </button>
              </section>

              <section class="mt-8 md:mt-8">
                <div class="flex flex-col gap-1">
                  <h3 class="text-[20px] leading-6 font-semibold text-[#0d0d0d]">Cover photo</h3>
                  <p class="text-[14px] leading-5 text-[rgba(13,13,13,0.5)]">
                    Recommended size: 1080 x 90
                  </p>
                </div>

                <input
                  #coverInput
                  type="file"
                  accept="image/png,image/jpeg"
                  class="hidden"
                  (change)="onFileSelected($event, 'cover')"
                />

                <button
                  type="button"
                  class="relative mt-3 flex h-[138px] w-full items-center justify-center overflow-hidden rounded-[12px] border border-dashed border-[#d8d8d8] bg-[#f9f9f9]"
                  (click)="coverInput.click()"
                  aria-label="Upload cover photo"
                >
                  @if (coverPreview(); as coverPreview) {
                    <img
                      [src]="coverPreview"
                      alt="Store cover preview"
                      class="absolute inset-0 h-full w-full object-cover"
                    />
                  }

                  <span class="relative z-10 flex flex-col items-center gap-2">
                    <span
                      class="inline-flex h-10 items-center justify-center rounded-[64px] border border-[#eaeaea] bg-white px-5 text-[14px] leading-5 font-medium text-black"
                    >
                      Add file
                    </span>
                    <span
                      class="text-center text-[12px] leading-[1.2] tracking-[-0.01em] text-[#848484]"
                    >
                      PNG, JPEG under 2MB
                    </span>
                  </span>
                </button>
              </section>

              <div class="hidden h-[1px] w-full bg-[#efefef] md:mt-8 md:block"></div>
            </div>
          </div>

          <div class="shrink-0 bg-white px-4 pb-[14px] pt-[11px] md:hidden">
            <button
              type="button"
              class="flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#6453d9] text-[16px] leading-6 font-medium text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2a6ce8] disabled:opacity-50"
              [disabled]="storeForm.invalid"
              (click)="onSubmit()"
            >
              Add store
            </button>
          </div>

          <div class="hidden h-20 items-center justify-end gap-2 bg-white px-[29px] md:flex">
            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-[82px] bg-[#f5f5f5] px-6 text-[16px] leading-[22px] font-medium tracking-[-0.03em] text-[#05061a]"
              (click)="close.emit()"
            >
              Cancel
            </button>

            <button
              type="button"
              class="inline-flex h-10 items-center justify-center rounded-[64px] border border-white bg-[#6453d9] px-5 text-[14px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] disabled:opacity-50"
              [disabled]="storeForm.invalid"
              (click)="onSubmit()"
            >
              Add store
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      select {
        background-image: none;
      }

      ::-webkit-scrollbar {
        width: 6px;
      }

      ::-webkit-scrollbar-thumb {
        background: rgba(13, 13, 13, 0.12);
        border-radius: 999px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddStoreModalComponent implements OnDestroy {
  readonly close = output<void>();
  readonly submit = output<AddStoreFormValue>();

  protected readonly closeIconUrl = '/assets/icons/my-stores-add-close.svg';
  protected readonly chevronIconUrl = '/assets/icons/my-stores-add-chevron.svg';
  protected readonly imagePlaceholderIconUrl = '/assets/icons/my-stores-add-image-placeholder.svg';
  protected readonly plusIconUrl = '/assets/icons/my-stores-add-plus.svg';
  protected readonly locations = [
    'Ikeja, Lagos',
    'Lekki, Lagos',
    'Abuja, FCT',
    'Port Harcourt, Rivers',
  ] as const;

  protected readonly profilePreview = signal<string | null>(null);
  protected readonly coverPreview = signal<string | null>(null);

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly mobileOverlayService = inject(MobileOverlayService);

  protected readonly storeForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    location: ['', Validators.required],
    whatsappNumber: ['', [Validators.required, Validators.pattern(/^[0-9+() -]{7,}$/)]],
    callNumber: ['', [Validators.required, Validators.pattern(/^[0-9+() -]{7,}$/)]],
  });

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  protected onFileSelected(event: Event, type: 'profile' | 'cover'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : null;

      if (!result) {
        return;
      }

      if (type === 'profile') {
        this.profilePreview.set(result);
      } else {
        this.coverPreview.set(result);
      }
    };

    reader.readAsDataURL(file);
    input.value = '';
  }

  protected onSubmit(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    const formValue = this.storeForm.getRawValue();

    this.submit.emit({
      ...formValue,
      logo: this.profilePreview() ?? '/assets/images/store-vine-logo-desktop.png',
      banner: this.coverPreview() ?? '/assets/images/store-vine-cover-desktop.png',
    });
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
