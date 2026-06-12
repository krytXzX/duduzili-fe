import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { StoreCardComponent, Store } from '../../components/stores/store-card.component';
import { AddStoreModalComponent } from './components/add-store-modal.component';
import { SuccessModalComponent } from './components/success-modal.component';
import { AppToastService } from '../../services/app-toast.service';
import { MyStoresResponse, VendorRecord, VendorsService } from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

interface NewStoreFormData {
  readonly name: string;
  readonly description: string;
  readonly location: string;
  readonly whatsappNumber: string;
  readonly callNumber: string;
  readonly alternateCallNumber: string;
  readonly logo: string;
  readonly banner: string;
  readonly profileFile: File | null;
  readonly coverFile: File | null;
}

@Component({
  selector: 'app-my-stores-page',
  imports: [NgOptimizedImage, StoreCardComponent, AddStoreModalComponent, SuccessModalComponent],
  template: `
    <section class="flex min-h-full flex-col bg-white md:bg-transparent">
      <div class="flex h-[54px] items-center justify-between px-5 md:hidden">
        <h1 class="text-[24px] leading-8 font-medium tracking-[-0.03em] text-[#1a1b1d]">My Stores</h1>

        <div class="flex items-center gap-[6px]">
          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-transparent transition-colors hover:bg-[#f5f5f7]"
            aria-label="Search stores"
            (click)="openStoreSearch()"
          >
            <img [ngSrc]="searchIconUrl" alt="" width="20" height="20" class="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f7f7] transition-colors hover:bg-[#efeff2]"
            aria-label="Add new store"
            (click)="isAddingStore.set(true)"
          >
            <span class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(31,36,48,0.08)]">
              <img [ngSrc]="addOutlineIconUrl" alt="" width="24" height="24" class="h-6 w-6" aria-hidden="true" />
            </span>
          </button>
        </div>
      </div>

      @if (hasStores()) {
        <div class="px-5 pb-1 pt-2 md:hidden">
          <label class="relative block">
            <img
              [ngSrc]="searchIconUrl"
              alt=""
              width="18"
              height="18"
              class="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-40"
              aria-hidden="true"
            />
            <input
              type="text"
              [value]="searchQuery()"
              (input)="updateSearchQuery($event)"
              placeholder="Search your stores"
              class="h-11 w-full rounded-full border border-[#f1f1f3] bg-[#f7f7f7] pl-11 pr-4 text-[14px] text-[#1a1b1d] outline-none placeholder:text-[#8d8d95]"
            />
          </label>
        </div>
      }

      <div class="mx-auto hidden w-full max-w-[1108px] md:block">
        @if (stores().length > 0) {
          <div class="flex h-[69px] items-center justify-between gap-4 px-4 lg:px-0">
            <h1 class="shrink-0 text-[28px] leading-[1.2] font-medium tracking-[-0.03em] text-[#1a1b1d]">
              My Stores
            </h1>

            <div class="flex flex-1 items-center justify-end gap-4">
              <label class="relative block w-full max-w-[354px]">
                <img
                  [ngSrc]="searchIconUrl"
                  alt=""
                  width="18"
                  height="18"
                  class="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 opacity-40"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  [value]="searchQuery()"
                  (input)="updateSearchQuery($event)"
                  placeholder="Search your stores"
                  class="h-10 w-full rounded-full bg-[#f7f7f7] pl-10 pr-4 text-[14px] text-[#1a1b1d] outline-none placeholder:text-[#8d8d95]"
                />
              </label>

              <button
                type="button"
                class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453d9] px-5 text-[14px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_8px_20px_rgba(81,35,173,0.3),0_0_0_1px_#6b5bd5]"
                (click)="isAddingStore.set(true)"
              >
                <img [ngSrc]="addLinearIconUrl" alt="" width="18" height="18" class="h-[18px] w-[18px]" aria-hidden="true" />
                <span>Add new store</span>
              </button>
            </div>
          </div>
        } @else {
          <div class="flex h-[69px] items-center justify-between px-4 lg:px-0">
            <h1 class="text-[28px] leading-[1.2] font-medium tracking-[-0.03em] text-[#1a1b1d]">My Stores</h1>

            <button
              type="button"
              class="inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453d9] px-5 text-[14px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_8px_20px_rgba(81,35,173,0.3),0_0_0_1px_#6b5bd5]"
              (click)="isAddingStore.set(true)"
            >
              <img [ngSrc]="addLinearIconUrl" alt="" width="18" height="18" class="h-[18px] w-[18px]" aria-hidden="true" />
              <span>Add new store</span>
            </button>
          </div>
        }
      </div>

      @if (isLoading()) {
        <div class="px-5 pb-24 pt-4 md:px-4 md:pb-10 md:pt-7 lg:px-0">
          <div class="mx-auto max-w-[1108px]">
            <div class="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-2 md:gap-x-6 md:gap-y-8 xl:grid-cols-4">
              @for (placeholder of loadingPlaceholders; track placeholder) {
                <div class="overflow-hidden rounded-[13.746px] border border-[#eaeaea] bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] lg:rounded-[24px]">
                  <div class="h-[90.5px] animate-pulse rounded-t-[13.746px] bg-[#f3f4f6] lg:h-[158px] lg:rounded-t-[24px]"></div>
                  <div class="px-[10px] pb-[10px] pt-[8px] lg:px-4 lg:pb-[14px] lg:pt-[12px]">
                    <div class="h-3.5 w-2/3 animate-pulse rounded-full bg-[#f3f4f6]"></div>
                    <div class="mt-3 h-3 w-1/2 animate-pulse rounded-full bg-[#f3f4f6]"></div>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else if (filteredStores().length > 0) {
        <div class="px-5 pb-24 pt-4 md:px-4 md:pb-10 md:pt-7 lg:px-0">
          <div class="mx-auto max-w-[1108px]">
            <div class="grid grid-cols-2 gap-x-3 gap-y-4 md:grid-cols-2 md:gap-x-6 md:gap-y-8 xl:grid-cols-4">
              @for (store of filteredStores(); track store.id; let index = $index) {
                <app-store-card [store]="store" [showFavorite]="false" [priority]="index === 0" />
              }
            </div>
          </div>
        </div>
      } @else if (stores().length > 0) {
        <div class="flex flex-1 items-center justify-center px-5 pb-10 pt-5 text-center md:px-4 md:pb-0 md:pt-8 lg:px-0">
          <div class="rounded-[24px] border border-[#efefef] bg-white px-6 py-10 shadow-[0_6px_24px_rgba(0,0,0,0.03)]">
            <h2 class="text-[18px] leading-6 font-medium text-[#1a1b1d]">No stores found</h2>
            <p class="mt-2 max-w-[320px] text-[14px] leading-5 text-[#6c6c6c]">
              Try a different search term to find one of your stores.
            </p>
          </div>
        </div>
      } @else if (errorMessage()) {
        <div class="flex flex-1 items-center justify-center px-5 pb-10 pt-[134px] text-center md:px-4 md:pb-0 md:pt-[72px] lg:px-0">
          <div class="max-w-[360px] rounded-[24px] border border-[#efefef] bg-white px-6 py-10 shadow-[0_6px_24px_rgba(0,0,0,0.03)]">
            <h2 class="text-[18px] leading-6 font-medium text-[#1a1b1d]">We couldn’t load your stores</h2>
            <p class="mt-2 text-[14px] leading-5 text-[#6c6c6c]">{{ errorMessage() }}</p>
          </div>
        </div>
      } @else {
        <div class="flex flex-1 flex-col items-center px-5 pb-10 pt-[134px] text-center md:px-4 md:pb-0 md:pt-[72px] lg:px-0">
          <div class="max-w-[420px] rounded-[24px] border border-[#efefef] bg-white px-6 py-10 shadow-[0_6px_24px_rgba(0,0,0,0.03)] md:max-w-[520px]">
            <h2 class="text-[18px] leading-6 font-medium text-[#1a1b1d]">You don’t have any stores yet</h2>
            <p class="mt-2 text-[14px] leading-5 text-[#6c6c6c]">
              Create your first store to start organizing listings, building trust, and attracting more buyers.
            </p>
            <button
              type="button"
              class="mt-6 inline-flex h-10 items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453d9] px-5 text-[14px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_8px_20px_rgba(81,35,173,0.3),0_0_0_1px_#6b5bd5]"
              (click)="isAddingStore.set(true)"
            >
              <img [ngSrc]="addLinearIconUrl" alt="" width="18" height="18" class="h-[18px] w-[18px]" aria-hidden="true" />
              <span>Create your first store</span>
            </button>
          </div>
        </div>
      }
    </section>

    @if (isAddingStore()) {
      <app-add-store-modal
        [isSubmitting]="isSubmittingStore()"
        (close)="isAddingStore.set(false)"
        (submit)="onStoreSubmit($event)"
      />
    }

    @if (isSuccess()) {
      <app-success-modal
        [storeName]="latestCreatedStoreName()"
        (ok)="isSuccess.set(false)"
        (addAnother)="onAddAnother()"
      />
    }
  `,
  host: {
    class: 'block h-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MyStoresPageComponent {
  private readonly vendorsService = inject(VendorsService);
  private readonly appToastService = inject(AppToastService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  protected readonly searchIconUrl = '/assets/icons/my-stores-search.svg';
  protected readonly addOutlineIconUrl = '/assets/icons/my-stores-add-outline.svg';
  protected readonly addLinearIconUrl = '/assets/icons/my-stores-add-linear.svg';
  protected readonly loadingPlaceholders = [1, 2, 3, 4] as const;
  protected readonly stores = signal<Store[]>([]);
  protected readonly searchQuery = signal('');
  protected readonly isAddingStore = signal(false);
  protected readonly isSubmittingStore = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly latestCreatedStoreName = signal<string | null>(null);
  protected readonly hasStores = computed(() => this.stores().length > 0);

  protected readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.stores();
    }

    return this.stores().filter((store) => store.name.toLowerCase().includes(query));
  });

  constructor() {
    void this.loadMyStores();
  }

  protected openStoreSearch(): void {
    // Reserved for the shell-aligned mobile search interaction.
  }

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  protected onStoreSubmit(formData: NewStoreFormData): void {
    void this.createStore(formData);
  }

  protected onAddAnother(): void {
    this.isSuccess.set(false);
    this.isAddingStore.set(true);
  }

  private async createStore(formData: NewStoreFormData): Promise<void> {
    if (this.isSubmittingStore()) {
      return;
    }
    this.isSubmittingStore.set(true);
    try {
      const response = await firstValueFrom(this.vendorsService.createStore(this.buildCreateStorePayload(formData)));
      this.isAddingStore.set(false);
      this.latestCreatedStoreName.set(this.readString(response['store_name']) ?? formData.name);
      this.isSuccess.set(true);
      void this.loadMyStores();
    } catch {
      this.appToastService.show({
        message: 'Your store couldn’t be created right now. Please try again.',
        durationMs: 2800,
      });
    } finally {
      this.isSubmittingStore.set(false);
    }
  }

  private async loadMyStores(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const response = await firstValueFrom(this.vendorsService.getMyStores());
      const mappedStores = this.extractStores(response)
        .map((store, index) => this.toStoreCard(store, index))
        .filter((store): store is Store => store !== null);

      this.stores.set(mappedStores);
    } catch {
      this.errorMessage.set('Your stores aren’t available right now. Please try again shortly.');
      this.stores.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private extractStores(response: MyStoresResponse): VendorRecord[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (Array.isArray(response.stores)) {
      return response.stores;
    }

    if (Array.isArray(response.vendors)) {
      return response.vendors;
    }

    return [];
  }

  private toStoreCard(store: VendorRecord, index: number): Store | null {
    const id = this.readString(store['id']) ?? this.readString(store['store_id']) ?? `my-store-${index + 1}`;
    const name =
      this.readString(store['store_name']) ??
      this.readString(store['name']) ??
      this.readString(store['vendor_name']);

    if (!name) {
      return null;
    }

    return {
      id,
      name,
      description:
        this.readString(store['store_bio']) ??
        this.readString(store['description']) ??
        undefined,
      location:
        this.readString(store['location']) ??
        this.buildLocation(store) ??
        undefined,
      coverImage:
        this.resolveMediaUrl(
          this.readString(store['cover_image']) ??
            this.readString(store['banner']) ??
            this.readString(store['image']),
        ) ?? undefined,
      mobileCoverImage:
        this.resolveMediaUrl(
          this.readString(store['cover_image']) ??
            this.readString(store['banner']) ??
            this.readString(store['image']),
        ) ?? undefined,
      logoImage:
        this.resolveMediaUrl(
          this.readString(store['profile_photo']) ??
            this.readString(store['logo']) ??
            this.readNestedString(store['user'], 'avatar'),
        ) ?? undefined,
      mobileLogoImage:
        this.resolveMediaUrl(
          this.readString(store['profile_photo']) ??
            this.readString(store['logo']) ??
            this.readNestedString(store['user'], 'avatar'),
        ) ?? undefined,
      isVerified:
        this.readBoolean(store['is_verified']) ??
        this.readNestedBoolean(store['user'], 'is_verified') ??
        false,
      callNumber:
        this.readString(store['call_number']) ??
        undefined,
      alternateCallNumber:
        this.readString(store['whatsapp_number']) ??
        undefined,
      route: ['/seller/my-stores', id],
    };
  }

  private buildCreateStorePayload(formData: NewStoreFormData): FormData {
    const payload = new FormData();
    payload.append('store_name', formData.name);
    payload.append('store_bio', formData.description);
    payload.append('location', formData.location);
    payload.append('whatsapp_number', formData.whatsappNumber);
    payload.append('call_number', formData.callNumber);

    if (formData.alternateCallNumber.trim()) {
      payload.append('call_number_2', formData.alternateCallNumber.trim());
    }

    if (formData.profileFile) {
      payload.append('profile_photo', formData.profileFile);
    }

    if (formData.coverFile) {
      payload.append('cover_image', formData.coverFile);
    }

    return payload;
  }

  private resolveMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.startsWith('/')) {
      return `${this.apiOrigin}${value}`;
    }

    return `${this.apiOrigin}/${value}`;
  }

  private buildLocation(store: VendorRecord): string | null {
    const city = this.readString(store['city']);
    const state = this.readString(store['state']);

    if (city && state) {
      return `${city}, ${state}`;
    }

    return city ?? state ?? null;
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }

  private readNestedString(container: unknown, key: string): string | null {
    if (!container || typeof container !== 'object') {
      return null;
    }

    return this.readString((container as Record<string, unknown>)[key]);
  }

  private readNestedBoolean(container: unknown, key: string): boolean | null {
    if (!container || typeof container !== 'object') {
      return null;
    }

    return this.readBoolean((container as Record<string, unknown>)[key]);
  }
}
