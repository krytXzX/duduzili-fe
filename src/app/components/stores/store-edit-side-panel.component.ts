import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

export interface EditableStoreProfile {
  name: string;
  location: string;
  logo: string;
  banner: string;
  whatsappNumber?: string;
  callNumber?: string;
}

export interface EditableStoreUpdate {
  name: string;
  location: string;
  whatsappNumber: string;
  callNumber: string;
}

@Component({
  selector: 'app-store-edit-side-panel',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage],
  template: `
    <div class="fixed inset-0 z-100">
      <button
        type="button"
        class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        aria-label="Close edit store modal"
        (click)="close.emit()"
      ></button>

      <div class="relative hidden h-full items-center justify-center px-6 lg:flex">
        <div
          class="relative h-[968px] w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_72px_rgba(18,24,35,0.18)]"
        >
          <header class="flex h-20 items-center justify-between px-6">
            <h2 class="text-[28px] font-semibold leading-10 text-[#0D0D0D]">Edit store</h2>
            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
              aria-label="Close edit store modal"
              (click)="close.emit()"
            >
              <img [ngSrc]="assets.closeDesktop" width="24" height="24" alt="" class="h-6 w-6" />
            </button>
          </header>

          <form
            [formGroup]="editForm"
            (ngSubmit)="onSubmit()"
            class="flex h-[calc(100%-80px)] flex-col"
          >
            <div class="flex-1 overflow-y-auto px-6 pb-8 pt-[10px]">
              <section class="space-y-6">
                <div class="space-y-[7px]">
                  <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                    General information
                  </h3>
                  <p class="text-[14px] leading-5 text-black/50">
                    Fill out general information about this store
                  </p>
                </div>

                <div class="space-y-5">
                  <label class="block space-y-2">
                    <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                      >Store name</span
                    >
                    <input
                      type="text"
                      formControlName="name"
                      class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none placeholder:text-[#0D0D0D] focus:border-[#6453D9]"
                    />
                  </label>

                  <label class="block space-y-2">
                    <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                      >Location</span
                    >
                    <span class="relative block">
                      <select
                        formControlName="location"
                        class="h-10 w-full appearance-none rounded-[8px] border border-[#EAEAEA] bg-white px-3 pr-10 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      >
                        @for (option of locations; track option) {
                          <option [value]="option">{{ option }}</option>
                        }
                      </select>
                      <img
                        [ngSrc]="assets.chevron"
                        width="20"
                        height="20"
                        alt=""
                        class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90"
                      />
                    </span>
                  </label>

                  <div class="grid grid-cols-2 gap-5">
                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >WhatsApp number</span
                      >
                      <input
                        type="tel"
                        formControlName="whatsappNumber"
                        class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Call number</span
                      >
                      <input
                        type="tel"
                        formControlName="callNumber"
                        class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>
                  </div>
                </div>
              </section>

              <section class="mt-8 space-y-3">
                <div class="space-y-1">
                  <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">Profile photo</h3>
                  <p class="text-[14px] leading-5 text-black/50">Recommended size: 100 x 100</p>
                </div>

                <div class="flex items-center gap-3">
                  <div
                    class="aspect-square h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[50%] border border-[#EAEAEA] bg-[#F9F9F9]"
                  >
                    <div
                      class="aspect-square h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[50%] border-4 border-white bg-[#3D785F]"
                    >
                      <img
                        [ngSrc]="profileImage()"
                        width="100"
                        height="100"
                        alt="{{ store().name }} logo"
                        class="aspect-square h-full w-full rounded-[50%] object-contain"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)]"
                  >
                    <img
                      [ngSrc]="assets.pencil"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    />
                    Change
                  </button>
                </div>
              </section>

              <section class="mt-8 space-y-3">
                <div class="space-y-1">
                  <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">Cover photo</h3>
                  <p class="text-[14px] leading-5 text-black/50">Recommended size: 1080 x 90</p>
                </div>

                <div
                  class="relative h-[138px] overflow-hidden rounded-[12px] border border-[#D8D8D8] bg-[#F9F9F9]"
                >
                  <img
                    [ngSrc]="coverImage()"
                    width="552"
                    height="138"
                    alt=""
                    class="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-2 inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)]"
                  >
                    <img
                      [ngSrc]="assets.pencil"
                      width="14"
                      height="14"
                      alt=""
                      class="h-[14px] w-[14px]"
                    />
                    Change
                  </button>
                </div>
              </section>
            </div>

            <footer class="flex h-20 items-center justify-end gap-2 px-[29px]">
              <button
                type="button"
                class="inline-flex h-10 items-center justify-center rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium leading-[22px] tracking-[-0.5px] text-[#05061A]"
                (click)="close.emit()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5]"
              >
                Save changes
              </button>
            </footer>
          </form>
        </div>
      </div>

      <div class="relative flex h-full items-end lg:hidden">
        <div
          class="relative max-h-[calc(100dvh-12px)] w-full overflow-hidden rounded-t-[36px] bg-white shadow-[0_-8px_32px_rgba(18,24,35,0.16)]"
        >
          <div class="flex justify-center pt-[11px]">
            <div class="h-1 w-[50px] rounded-full bg-[#EBEBEB]"></div>
          </div>

          <button
            type="button"
            class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
            aria-label="Close edit store modal"
            (click)="close.emit()"
          >
            <img [ngSrc]="assets.closeMobile" width="24" height="24" alt="" class="h-6 w-6" />
          </button>

          <form
            [formGroup]="editForm"
            (ngSubmit)="onSubmit()"
            class="flex max-h-[calc(100dvh-27px)] flex-col"
          >
            <div class="flex-1 overflow-y-auto px-4 pb-6 pt-[18px]">
              <div class="space-y-6">
                <h2 class="w-[303px] text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                  Edit store
                </h2>

                <section class="space-y-6">
                  <div class="space-y-[7px]">
                    <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                      General information
                    </h3>
                    <p class="text-[14px] leading-5 text-black/50">
                      Fill out general information about this store
                    </p>
                  </div>

                  <div class="space-y-5">
                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Store name</span
                      >
                      <input
                        type="text"
                        formControlName="name"
                        class="h-12 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Location</span
                      >
                      <span class="relative block">
                        <select
                          formControlName="location"
                          class="h-12 w-full appearance-none rounded-[8px] border border-[#EAEAEA] bg-white px-3 pr-10 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                        >
                          @for (option of locations; track option) {
                            <option [value]="option">{{ option }}</option>
                          }
                        </select>
                        <img
                          [ngSrc]="assets.chevron"
                          width="20"
                          height="20"
                          alt=""
                          class="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 rotate-90"
                        />
                      </span>
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >WhatsApp Number</span
                      >
                      <input
                        type="tel"
                        formControlName="whatsappNumber"
                        class="h-12 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Call number</span
                      >
                      <input
                        type="tel"
                        formControlName="callNumber"
                        class="h-12 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>
                  </div>
                </section>

                <section class="space-y-3">
                  <div class="space-y-1">
                    <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">
                      Profile photo
                    </h3>
                    <p class="text-[14px] leading-5 text-black/50">Recommended size: 100 x 100</p>
                  </div>

                  <div class="flex items-center gap-3">
                    <div
                      class="aspect-square h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[50%] border border-[#EAEAEA] bg-[#F9F9F9]"
                    >
                      <div
                        class="aspect-square h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[50%] border-4 border-white bg-[#3D785F]"
                      >
                        <img
                          [ngSrc]="profileImage()"
                          width="100"
                          height="100"
                          alt="{{ store().name }} logo"
                          class="aspect-square h-full w-full rounded-[50%] object-contain"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)]"
                    >
                      <img
                        [ngSrc]="assets.pencil"
                        width="14"
                        height="14"
                        alt=""
                        class="h-[14px] w-[14px]"
                      />
                      Change
                    </button>
                  </div>
                </section>

                <section class="space-y-3">
                  <div class="space-y-1">
                    <h3 class="text-[20px] font-semibold leading-6 text-[#0D0D0D]">Cover photo</h3>
                    <p class="text-[14px] leading-5 text-black/50">Recommended size: 1080 x 90</p>
                  </div>

                  <div
                    class="relative h-[138px] overflow-hidden rounded-[12px] border border-[#D8D8D8] bg-[#F9F9F9]"
                  >
                    <img
                      [ngSrc]="coverImage()"
                      width="334"
                      height="138"
                      alt=""
                      class="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      class="absolute right-2 top-2 inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)]"
                    >
                      <img
                        [ngSrc]="assets.pencil"
                        width="14"
                        height="14"
                        alt=""
                        class="h-[14px] w-[14px]"
                      />
                      Change
                    </button>
                  </div>
                </section>
              </div>
            </div>

            <div class="bg-white px-4 pb-[26px] pt-[11px]">
              <button
                type="submit"
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8]"
              >
                Save changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  host: {
    class: 'block',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreEditSidePanelComponent implements OnDestroy, OnInit {
  readonly store = input.required<EditableStoreProfile>();
  readonly close = output<void>();
  readonly save = output<EditableStoreUpdate>();

  protected readonly assets = {
    chevron: '/assets/icons/store-edit-chevron.svg',
    closeDesktop: '/assets/icons/store-edit-close-desktop.svg',
    closeMobile: '/assets/icons/store-edit-close-mobile.svg',
    cover: '/assets/images/store-edit-cover.jpg',
    logo: '/assets/images/store-edit-logo.png',
    pencil: '/assets/icons/store-edit-pencil.svg',
  } as const;

  protected readonly locations = [
    'Ikeja, Lagos',
    'Lekki, Lagos',
    'Yaba, Lagos',
    'Abuja, Nigeria',
  ] as const;

  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly fb = inject(FormBuilder);

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    location: ['Ikeja, Lagos', Validators.required],
    whatsappNumber: [''],
    callNumber: [''],
  });

  protected readonly profileImage = computed(() => this.store().logo || this.assets.logo);
  protected readonly coverImage = computed(() => this.store().banner || this.assets.cover);

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnInit(): void {
    const store = this.store();
    this.editForm.patchValue(
      {
        name: store.name,
        location: store.location || 'Ikeja, Lagos',
        whatsappNumber: store.whatsappNumber || '0816 939 7444',
        callNumber: store.callNumber || '0816 939 7444',
      },
      { emitEvent: false },
    );
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.save.emit(this.editForm.getRawValue());
    }
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
  }
}
