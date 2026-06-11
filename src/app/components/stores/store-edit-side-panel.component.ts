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
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomDropdownComponent, type CustomDropdownOption } from '../ui/custom-dropdown.component';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

export interface EditableStoreProfile {
  name: string;
  description?: string;
  location: string;
  logo: string;
  banner: string;
  whatsappNumber?: string;
  callNumber?: string;
  alternateCallNumber?: string;
}

export interface EditableStoreUpdate {
  name: string;
  description: string;
  location: string;
  whatsappNumber: string;
  callNumber: string;
  alternateCallNumber: string;
  profilePhotoFile?: File;
  coverPhotoFile?: File;
}

@Component({
  selector: 'app-store-edit-side-panel',
  imports: [CommonModule, ReactiveFormsModule, NgOptimizedImage, CustomDropdownComponent],
  template: `
    <div class="fixed inset-0 z-100">
      <button
        type="button"
        class="absolute inset-0 bg-black/20 backdrop-blur-[2px]"
        aria-label="Close edit store modal"
        (click)="close.emit()"
      ></button>

      <div
        class="relative hidden h-full items-center justify-center overflow-y-auto px-6 py-6 lg:flex"
      >
        <div
          class="relative flex max-h-[calc(100dvh-48px)] w-full max-w-[600px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_72px_rgba(18,24,35,0.18)]"
        >
          <header class="flex h-20 items-center justify-between px-6">
            <h2 class="text-[28px] font-semibold leading-10 text-[#0D0D0D]">Edit store</h2>
            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
              aria-label="Close edit store modal"
              (click)="close.emit()"
            >
              <img [ngSrc]="assets.closeDesktop" width="24" height="24" alt="" class="h-6 w-6" />
            </button>
          </header>

          <form [formGroup]="editForm" (ngSubmit)="onSubmit()" class="flex min-h-0 flex-1 flex-col">
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
                    <app-custom-dropdown
                      [options]="locationOptions"
                      [value]="selectedLocation()"
                      ariaLabel="Select store location"
                      [fullWidth]="true"
                      [buttonClass]="desktopLocationDropdownButtonClass"
                      [labelClass]="locationDropdownLabelClass"
                      [iconClass]="locationDropdownIconClass"
                      [menuClass]="locationDropdownMenuClass"
                      [optionClass]="locationDropdownOptionClass"
                      [activeOptionClass]="locationDropdownActiveOptionClass"
                      (valueChange)="updateLocation($event)"
                    />
                  </label>

                  <label class="block space-y-2">
                    <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                      >Description</span
                    >
                    <textarea
                      formControlName="description"
                      rows="4"
                      class="min-h-[96px] w-full resize-none rounded-[8px] border border-[#EAEAEA] px-3 py-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none placeholder:text-[#0D0D0D]/40 focus:border-[#6453D9]"
                      placeholder="Tell buyers a little about this store"
                    ></textarea>
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
                        >Call number 1</span
                      >
                      <input
                        type="tel"
                        formControlName="callNumber"
                        class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>
                  </div>

                  <label class="block space-y-2">
                    <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                      >Call number 2</span
                    >
                    <input
                      type="tel"
                      formControlName="alternateCallNumber"
                      placeholder="Optional"
                      class="h-10 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none placeholder:text-[#0D0D0D]/40 focus:border-[#6453D9]"
                    />
                  </label>
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

                  <input
                    #profilePhotoInputDesktop
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onProfilePhotoSelected($event)"
                  />
                  <button
                    type="button"
                    class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                    (click)="profilePhotoInputDesktop.click()"
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
                  <input
                    #coverPhotoInputDesktop
                    type="file"
                    accept="image/*"
                    class="hidden"
                    (change)="onCoverPhotoSelected($event)"
                  />
                  <button
                    type="button"
                    class="absolute right-2 top-2 inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                    (click)="coverPhotoInputDesktop.click()"
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
                class="inline-flex h-10 items-center justify-center rounded-[82px] bg-[#F5F5F5] px-6 text-[16px] font-medium leading-[22px] tracking-[-0.5px] text-[#05061A] transition-all duration-200 hover:bg-[#ebebeb] active:scale-95"
                (click)="close.emit()"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="inline-flex h-10 items-center justify-center rounded-full border border-white bg-[#6453D9] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6B5BD5] transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
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
            class="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
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
                      <app-custom-dropdown
                        [options]="locationOptions"
                        [value]="selectedLocation()"
                        ariaLabel="Select store location"
                        [fullWidth]="true"
                        [buttonClass]="mobileLocationDropdownButtonClass"
                        [labelClass]="locationDropdownLabelClass"
                        [iconClass]="locationDropdownIconClass"
                        [menuClass]="locationDropdownMenuClass"
                        [optionClass]="locationDropdownOptionClass"
                        [activeOptionClass]="locationDropdownActiveOptionClass"
                        (valueChange)="updateLocation($event)"
                      />
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
                        >Description</span
                      >
                      <textarea
                        formControlName="description"
                        rows="4"
                        class="min-h-[112px] w-full resize-none rounded-[8px] border border-[#EAEAEA] px-3 py-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none placeholder:text-[#0D0D0D]/40 focus:border-[#6453D9]"
                        placeholder="Tell buyers a little about this store"
                      ></textarea>
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Call number 1</span
                      >
                      <input
                        type="tel"
                        formControlName="callNumber"
                        class="h-12 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none focus:border-[#6453D9]"
                      />
                    </label>

                    <label class="block space-y-2">
                      <span class="text-[14px] font-medium leading-[1.2] text-[#5A5A5A]"
                        >Call number 2</span
                      >
                      <input
                        type="tel"
                        formControlName="alternateCallNumber"
                        placeholder="Optional"
                        class="h-12 w-full rounded-[8px] border border-[#EAEAEA] px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none placeholder:text-[#0D0D0D]/40 focus:border-[#6453D9]"
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

                    <input
                      #profilePhotoInputMobile
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onProfilePhotoSelected($event)"
                    />
                    <button
                      type="button"
                      class="inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                      (click)="profilePhotoInputMobile.click()"
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
                    <input
                      #coverPhotoInputMobile
                      type="file"
                      accept="image/*"
                      class="hidden"
                      (change)="onCoverPhotoSelected($event)"
                    />
                    <button
                      type="button"
                      class="absolute right-2 top-2 inline-flex h-8 items-center gap-2 rounded-full border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-black shadow-[0_4px_8px_rgba(123,123,123,0.25)] transition-all duration-200 hover:bg-gray-50 active:scale-95"
                      (click)="coverPhotoInputMobile.click()"
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
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#6453D9] text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition-all duration-200 hover:bg-[#5342c6] active:scale-95"
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
  private readonly defaultLocation = 'Ikeja, Lagos';

  protected readonly assets = {
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
  protected readonly locationOptions: readonly CustomDropdownOption[] = this.locations.map(
    (location) => ({
      value: location,
      label: location,
    }),
  );
  protected readonly selectedLocation = signal<string>(this.defaultLocation);
  protected readonly desktopLocationDropdownButtonClass =
    'flex h-10 w-full items-center justify-between rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none transition-all duration-200 hover:bg-gray-50 active:scale-95';
  protected readonly mobileLocationDropdownButtonClass =
    'flex h-12 w-full items-center justify-between rounded-[8px] border border-[#EAEAEA] bg-white px-3 text-[14px] tracking-[-0.14px] text-[#0D0D0D] outline-none transition-all duration-200 hover:bg-gray-50 active:scale-95';
  protected readonly locationDropdownLabelClass = 'truncate text-left';
  protected readonly locationDropdownIconClass = 'text-[#0D0D0D]';
  protected readonly locationDropdownMenuClass = 'w-[min(100vw-32px,420px)]';
  protected readonly locationDropdownOptionClass =
    'w-full rounded-[14px] px-4 py-3 text-left text-[14px] text-[#1A1B1D] transition-all hover:bg-[#F5F6FA] active:scale-[0.98] duration-200';
  protected readonly locationDropdownActiveOptionClass = 'bg-[#F5F1FF] text-[#5932EA]';

  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly fb = inject(FormBuilder);

  // Tracks selected File objects and their local preview URLs
  private readonly selectedProfilePhotoFile = signal<File | null>(null);
  private readonly selectedCoverPhotoFile = signal<File | null>(null);
  private profilePhotoObjectUrl: string | null = null;
  private coverPhotoObjectUrl: string | null = null;

  protected readonly editForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    location: ['Ikeja, Lagos', Validators.required],
    whatsappNumber: [''],
    callNumber: [''],
    alternateCallNumber: [''],
  });

  // Show local preview if a file was selected, otherwise fall back to the store's current image
  protected readonly profileImage = computed(() => {
    if (this.selectedProfilePhotoFile()) {
      return this.profilePhotoObjectUrl ?? (this.store().logo || this.assets.logo);
    }
    return this.store().logo || this.assets.logo;
  });

  protected readonly coverImage = computed(() => {
    if (this.selectedCoverPhotoFile()) {
      return this.coverPhotoObjectUrl ?? (this.store().banner || this.assets.cover);
    }
    return this.store().banner || this.assets.cover;
  });

  constructor() {
    this.mobileOverlayService.openMobileModal();
  }

  ngOnInit(): void {
    const store = this.store();
    const selectedLocation =
      this.locations.find((location) => location === store.location) ?? this.defaultLocation;
    this.selectedLocation.set(selectedLocation);
    this.editForm.patchValue(
      {
        name: store.name,
        description: store.description || '',
        location: selectedLocation,
        whatsappNumber: store.whatsappNumber || '0816 939 7444',
        callNumber: store.callNumber || '0816 939 7444',
        alternateCallNumber: store.alternateCallNumber || '',
      },
      { emitEvent: false },
    );
  }

  onProfilePhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Revoke previous object URL to avoid memory leaks
    if (this.profilePhotoObjectUrl) {
      URL.revokeObjectURL(this.profilePhotoObjectUrl);
    }
    this.profilePhotoObjectUrl = URL.createObjectURL(file);
    this.selectedProfilePhotoFile.set(file);
  }

  onCoverPhotoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    // Revoke previous object URL to avoid memory leaks
    if (this.coverPhotoObjectUrl) {
      URL.revokeObjectURL(this.coverPhotoObjectUrl);
    }
    this.coverPhotoObjectUrl = URL.createObjectURL(file);
    this.selectedCoverPhotoFile.set(file);
  }

  updateLocation(value: string): void {
    this.selectedLocation.set(value);
    this.editForm.controls.location.setValue(value);
    this.editForm.controls.location.markAsDirty();
    this.editForm.controls.location.markAsTouched();
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.save.emit({
        ...this.editForm.getRawValue(),
        profilePhotoFile: this.selectedProfilePhotoFile() ?? undefined,
        coverPhotoFile: this.selectedCoverPhotoFile() ?? undefined,
      });
    }
  }

  ngOnDestroy(): void {
    this.mobileOverlayService.closeMobileModal();
    // Clean up object URLs
    if (this.profilePhotoObjectUrl) URL.revokeObjectURL(this.profilePhotoObjectUrl);
    if (this.coverPhotoObjectUrl) URL.revokeObjectURL(this.coverPhotoObjectUrl);
  }
}
