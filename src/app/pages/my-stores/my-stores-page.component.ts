import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { StoreCardComponent, Store } from '../../components/stores/store-card.component';
import { AddStoreModalComponent } from './components/add-store-modal.component';
import { SuccessModalComponent } from './components/success-modal.component';
import { AppModeService } from '../../services/app-mode.service';
import { MyStoresResponse, VendorRecord, VendorsService } from '../../services/vendors.service';
import { environment } from '../../../environments/environment';

interface NewStoreFormData {
  readonly name: string;
  readonly description: string;
  readonly logo: string;
  readonly banner: string;
  readonly callNumber?: string;
  readonly alternateCallNumber?: string;
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

      @if (filteredStores().length > 0) {
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
      } @else if (isLoading()) {
        <div class="flex flex-1 items-center justify-center px-5 pb-10 pt-[134px] text-center md:px-4 md:pb-0 md:pt-[72px] lg:px-0">
          <p class="text-[16px] font-medium text-[#6c6c6c] md:text-[18px]">Loading your stores...</p>
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
          <div class="w-full max-w-[350px] md:max-w-[740px]">
            <div
              class="relative mx-auto h-[141.902px] w-[168px] md:h-[260.999px] md:w-[309px]"
              aria-hidden="true"
            >
              <div class="absolute left-[-6.684px] top-[16.395px] flex h-[143.613px] w-[119.341px] items-center justify-center md:left-[-12.293px] md:top-[30.154px] md:h-[264.145px] md:w-[219.503px]">
                <div class="rotate-[-17.02deg]">
                  <div class="flex h-[123.566px] w-[86.99px] flex-col gap-[3.042px] rounded-[9.125px] border border-[#eaeaea] bg-white px-[1.521px] pb-[5.703px] pt-[1.521px] shadow-[0_4px_12px_rgba(199,199,199,0.18)] md:h-[227.273px] md:w-[160px] md:gap-[5.594px] md:rounded-[16.783px] md:px-[2.797px] md:pb-[10.49px] md:pt-[2.797px]">
                    <div class="relative h-[85.165px] overflow-hidden rounded-[7.604px] border border-[#eaeaea] bg-[#efefef] md:h-[156.643px] md:rounded-[13.986px]">
                      <img [ngSrc]="emptyHeartIconUrl" alt="" width="16" height="16" class="absolute right-[4.562px] top-[4.562px] h-[9.125px] w-[9.125px] md:right-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[16.783px]" />
                      <div class="absolute left-[4.563px] top-[4.562px] h-[9.125px] w-[30.927px] rounded-[4.352px] bg-white md:left-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[56.776px] md:rounded-[8px]"></div>
                      <div class="absolute left-1/2 top-1/2 flex w-[74.52px] -translate-x-1/2 -translate-y-1/2 items-center justify-between md:w-[137.063px]">
                        <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                          <img [ngSrc]="emptyArrowLeftIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                        </span>
                        <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                          <img [ngSrc]="emptyArrowRightIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                        </span>
                      </div>
                      <div class="absolute left-1/2 top-1/2 flex h-[26.614px] w-[26.614px] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[48.951px] md:w-[48.951px]">
                        <img [ngSrc]="emptyImageIconUrl" alt="" width="49" height="49" class="h-full w-full" />
                      </div>
                      <div class="absolute bottom-[6.844px] left-1/2 flex -translate-x-1/2 gap-[1.14px] md:bottom-[11.19px] md:gap-[2.1px]">
                        @for (dot of dots; track dot) {
                          <span class="h-[1.521px] w-[1.521px] rounded-full bg-[#d9d9d9] md:h-[2.797px] md:w-[2.797px]"></span>
                        }
                      </div>
                    </div>

                    <div class="mt-[4.563px] px-[1.521px] text-left md:mt-[8.392px] md:px-[2.797px]">
                      <div class="flex items-center justify-between">
                        <span class="h-[7.604px] w-[46.004px] rounded-[38px] bg-[#d9d9d9] md:h-[13.986px] md:w-[84.615px] md:rounded-[69.93px]"></span>
                        <span class="h-[8.521px] w-[16.083px] rounded-[999px] bg-[#f0f0f0] md:h-[14.797px] md:w-[29.189px]"></span>
                      </div>
                      <span class="mt-[1.521px] block h-[6.083px] w-[36.119px] rounded-[30px] bg-[#d9d9d9] md:mt-[2.797px] md:h-[11.189px] md:w-[66.434px] md:rounded-[69.93px]"></span>
                      <div class="mt-[1.521px] flex items-center gap-[1.521px] md:mt-[2.797px] md:gap-[2.797px]">
                        <img [ngSrc]="emptyLocationIconUrl" alt="" width="8" height="8" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                        <span class="h-[4.562px] w-[23.953px] rounded-[30px] bg-[#d9d9d9] md:h-[8.392px] md:w-[44.056px] md:rounded-[69.93px]"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="absolute left-[90.027px] top-[-9.265px] flex h-[145.063px] w-[122.287px] items-center justify-center md:left-[165.586px] md:top-[-17.041px] md:h-[266.812px] md:w-[224.92px]">
                <div class="rotate-[18.88deg]">
                  <div class="flex h-[123.566px] w-[86.99px] flex-col gap-[3.042px] rounded-[9.125px] border border-[#eaeaea] bg-white px-[1.521px] pb-[5.703px] pt-[1.521px] shadow-[0_4px_12px_rgba(199,199,199,0.18)] md:h-[227.273px] md:w-[160px] md:gap-[5.594px] md:rounded-[16.783px] md:px-[2.797px] md:pb-[10.49px] md:pt-[2.797px]">
                    <div class="relative h-[85.165px] overflow-hidden rounded-[7.604px] border border-[#eaeaea] bg-[#efefef] md:h-[156.643px] md:rounded-[13.986px]">
                      <img [ngSrc]="emptyHeartIconUrl" alt="" width="16" height="16" class="absolute right-[4.562px] top-[4.562px] h-[9.125px] w-[9.125px] md:right-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[16.783px]" />
                      <div class="absolute left-[4.563px] top-[4.562px] h-[9.125px] w-[32.216px] rounded-[4.352px] bg-white md:left-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[59.153px] md:rounded-[8px]"></div>
                      <div class="absolute left-1/2 top-1/2 flex w-[73.464px] -translate-x-1/2 -translate-y-1/2 items-center justify-between md:w-[135.122px]">
                        <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                          <img [ngSrc]="emptyArrowLeftIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                        </span>
                        <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                          <img [ngSrc]="emptyArrowRightIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                        </span>
                      </div>
                      <div class="absolute left-1/2 top-1/2 flex h-[33.793px] w-[33.793px] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[48.951px] md:w-[48.951px]">
                        <img [ngSrc]="emptyImageIconUrl" alt="" width="49" height="49" class="h-full w-full" />
                      </div>
                      <div class="absolute bottom-[6.844px] left-1/2 flex -translate-x-1/2 gap-[1.14px] md:bottom-[11.19px] md:gap-[2.1px]">
                        @for (dot of dots; track dot) {
                          <span class="h-[1.931px] w-[1.931px] rounded-full bg-[#d9d9d9] md:h-[3.552px] md:w-[3.552px]"></span>
                        }
                      </div>
                    </div>

                    <div class="mt-[4.563px] px-[1.521px] text-left md:mt-[8.392px] md:px-[2.797px]">
                      <div class="flex items-center justify-between">
                        <span class="h-[7.604px] w-[45.991px] rounded-[38px] bg-[#d9d9d9] md:h-[13.986px] md:w-[84.59px] md:rounded-[69.93px]"></span>
                        <span class="h-[8.521px] w-[17.975px] rounded-[999px] bg-[#f0f0f0] md:h-[14.797px] md:w-[32.406px]"></span>
                      </div>
                      <span class="mt-[1.521px] block h-[6.083px] w-[36.145px] rounded-[30px] bg-[#d9d9d9] md:mt-[2.797px] md:h-[11.189px] md:w-[66.481px] md:rounded-[69.93px]"></span>
                      <div class="mt-[1.521px] flex items-center gap-[1.521px] md:mt-[2.797px] md:gap-[2.797px]">
                        <img [ngSrc]="emptyLocationIconUrl" alt="" width="8" height="8" class="h-[5.793px] w-[5.793px] md:h-[8.392px] md:w-[8.392px]" />
                        <span class="h-[4.562px] w-[24.141px] rounded-[30px] bg-[#d9d9d9] md:h-[8.392px] md:w-[44.402px] md:rounded-[69.93px]"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="absolute left-[35.442px] top-[-2.577px] z-10 flex h-[123.566px] w-[86.99px] flex-col gap-[3.042px] rounded-[9.125px] border border-[#eaeaea] bg-white px-[1.521px] pb-[5.703px] pt-[1.521px] shadow-[0_4px_12px_rgba(199,199,199,0.18)] md:left-[65.186px] md:top-[-4.741px] md:h-[227.273px] md:w-[160px] md:gap-[5.594px] md:rounded-[16.783px] md:px-[2.797px] md:pb-[10.49px] md:pt-[2.797px]">
                <div class="relative h-[85.165px] overflow-hidden rounded-[7.604px] border border-[#eaeaea] bg-[#efefef] md:h-[156.643px] md:rounded-[13.986px]">
                  <img [ngSrc]="emptyHeartIconUrl" alt="" width="16" height="16" class="absolute right-[4.562px] top-[4.562px] h-[9.125px] w-[9.125px] md:right-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[16.783px]" />
                  <div class="absolute left-[4.563px] top-[4.562px] h-[9.125px] w-[30.927px] rounded-[4.352px] bg-white md:left-[7.69px] md:top-[7.69px] md:h-[16.783px] md:w-[56.776px] md:rounded-[8px]"></div>
                  <div class="absolute left-1/2 top-1/2 flex w-[74.52px] -translate-x-1/2 -translate-y-1/2 items-center justify-between md:w-[137.063px]">
                    <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                      <img [ngSrc]="emptyArrowLeftIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                    </span>
                    <span class="inline-flex h-[9.125px] w-[9.125px] items-center justify-center rounded-full border border-[#eaeaea] bg-white shadow-[0_1px_3px_rgba(202,202,202,0.25)] md:h-[16.783px] md:w-[16.783px]">
                      <img [ngSrc]="emptyArrowRightIconUrl" alt="" width="5" height="5" class="h-[4.562px] w-[4.562px] md:h-[8.392px] md:w-[8.392px]" />
                    </span>
                  </div>
                  <div class="absolute left-1/2 top-1/2 flex h-[26.614px] w-[26.614px] -translate-x-1/2 -translate-y-1/2 items-center justify-center md:h-[48.951px] md:w-[48.951px]">
                    <img [ngSrc]="emptyImageIconUrl" alt="" width="49" height="49" class="h-full w-full" />
                  </div>
                  <div class="absolute bottom-[6.844px] left-1/2 flex -translate-x-1/2 gap-[1.14px] md:bottom-[11.19px] md:gap-[2.1px]">
                    @for (dot of dots; track dot) {
                      <span class="h-[1.521px] w-[1.521px] rounded-full bg-[#d9d9d9] md:h-[2.797px] md:w-[2.797px]"></span>
                    }
                  </div>
                </div>

                <div class="mt-[4.563px] px-[1.521px] text-left md:mt-[8.392px] md:px-[2.797px]">
                  <div class="flex items-center justify-between">
                    <span class="h-[7.604px] w-[46.216px] rounded-[38px] bg-[#d9d9d9] md:h-[13.986px] md:w-[85.004px] md:rounded-[69.93px]"></span>
                    <span class="h-[8.521px] w-[17.873px] rounded-[999px] bg-[#f0f0f0] md:h-[14.797px] md:w-[32.241px]"></span>
                  </div>
                  <span class="mt-[1.521px] block h-[6.083px] w-[36.318px] rounded-[30px] bg-[#d9d9d9] md:mt-[2.797px] md:h-[11.189px] md:w-[66.8px] md:rounded-[69.93px]"></span>
                  <div class="mt-[1.521px] flex items-center gap-[1.521px] md:mt-[2.797px] md:gap-[2.797px]">
                    <img [ngSrc]="emptyLocationIconUrl" alt="" width="8" height="8" class="h-[5.698px] w-[5.698px] md:h-[8.392px] md:w-[8.392px]" />
                    <span class="h-[4.562px] w-[24.239px] rounded-[30px] bg-[#d9d9d9] md:h-[8.392px] md:w-[44.583px] md:rounded-[69.93px]"></span>
                  </div>
                </div>
              </div>

              <div class="absolute left-0 top-[9.243px] h-[132.66px] w-[168px] rounded-[10.874px] bg-[linear-gradient(181.41deg,rgba(255,255,255,0)_1.51%,#ffffff_90.4%)] md:top-[17px] md:h-[244px] md:w-[309px] md:rounded-[20px]"></div>
            </div>

            <div class="mt-[32px] flex flex-col items-center gap-[32px] md:mt-[24px]">
              <div class="flex flex-col items-center gap-2">
                <h2 class="max-w-[330px] text-[24px] leading-[1.2] font-medium tracking-[-0.03em] text-[#1a1b1d] md:max-w-none md:text-[28px]">
                  You don’t have any stores yet
                </h2>
                <p class="max-w-[350px] text-[16px] leading-[1.2] text-[#6c6c6c] md:max-w-[740px] md:text-[18px]">
                  Create a dedicated store to organize your listings, gain followers, and increase buyer trust
                </p>
              </div>

              <button
                type="button"
                class="inline-flex h-[52px] items-center justify-center gap-2 rounded-[64px] border border-white bg-[#6453d9] px-5 text-[16px] leading-5 font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] transition-[transform,box-shadow,filter] duration-200 hover:-translate-y-px hover:brightness-[1.03] hover:shadow-[0_8px_20px_rgba(81,35,173,0.3),0_0_0_1px_#6b5bd5] md:h-10 md:px-5 md:text-[14px]"
                (click)="isAddingStore.set(true)"
              >
                <img [ngSrc]="addLinearIconUrl" alt="" width="18" height="18" class="h-[18px] w-[18px]" aria-hidden="true" />
                <span>Create your first store</span>
              </button>
            </div>
          </div>
        </div>
      }
    </section>

    @if (isAddingStore()) {
      <app-add-store-modal
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
  private readonly appMode = inject(AppModeService);
  private readonly apiOrigin = new URL(environment.apiUrl).origin;

  protected readonly searchIconUrl = '/assets/icons/my-stores-search.svg';
  protected readonly addOutlineIconUrl = '/assets/icons/my-stores-add-outline.svg';
  protected readonly addLinearIconUrl = '/assets/icons/my-stores-add-linear.svg';
  protected readonly emptyImageIconUrl = '/assets/icons/my-stores-empty-image.svg';
  protected readonly emptyHeartIconUrl = '/assets/icons/my-stores-empty-heart.svg';
  protected readonly emptyArrowLeftIconUrl = '/assets/icons/my-stores-empty-arrow-left.svg';
  protected readonly emptyArrowRightIconUrl = '/assets/icons/my-stores-empty-arrow-right.svg';
  protected readonly emptyLocationIconUrl = '/assets/icons/my-stores-empty-location.svg';
  protected readonly dots = [1, 2, 3, 4] as const;

  protected readonly stores = signal<Store[]>([
    {
      id: 'my-store-1',
      name: 'The Vine Collections',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-vine-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-vine-cover-mobile.png',
      logoImage: '/assets/images/store-vine-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-vine-logo-mobile.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-1'],
    },
    {
      id: 'my-store-2',
      name: 'Eden Organics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-eden-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-eden-cover-mobile.png',
      logoImage: '/assets/images/store-eden-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-eden-logo-mobile.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-2'],
    },
    {
      id: 'my-store-3',
      name: 'Snap Thrifts',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-snap-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-snap-cover-mobile.png',
      logoImage: '/assets/images/store-snap-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-snap-logo-mobile.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-3'],
    },
    {
      id: 'my-store-4',
      name: 'goMelon',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-gomelon-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-gomelon-cover-mobile.png',
      logoImage: '/assets/images/store-gomelon-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-gomelon-logo-mobile.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-4'],
    },
    {
      id: 'my-store-5',
      name: 'Amazing Fragrances',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-amazing-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-amazing-cover-desktop.png',
      logoImage: '/assets/images/store-amazing-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-amazing-logo-desktop.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-5'],
    },
    {
      id: 'my-store-6',
      name: 'New Age Properties',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-newage-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-newage-cover-desktop.png',
      logoImage: '/assets/images/store-newage-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-newage-logo-desktop.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-6'],
    },
    {
      id: 'my-store-7',
      name: 'Swift Wears',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-swift-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-swift-cover-desktop.png',
      logoImage: '/assets/images/store-swift-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-swift-logo-desktop.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-7'],
    },
    {
      id: 'my-store-8',
      name: 'None Electronics',
      location: 'Ikeja, Lagos',
      coverImage: '/assets/images/store-none-cover-desktop.png',
      mobileCoverImage: '/assets/images/store-none-cover-desktop.png',
      logoImage: '/assets/images/store-none-logo-desktop.png',
      mobileLogoImage: '/assets/images/store-none-logo-desktop.png',
      isVerified: true,
      route: ['/seller/my-stores', 'my-store-8'],
    },
  ]);
  protected readonly searchQuery = signal('');
  protected readonly isAddingStore = signal(false);
  protected readonly isSuccess = signal(false);
  protected readonly isLoading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly latestCreatedStoreName = signal('The Vine Collections');
  protected readonly hasStores = computed(() => this.stores().length > 0);

  protected readonly filteredStores = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();

    if (!query) {
      return this.stores();
    }

    return this.stores().filter((store) => store.name.toLowerCase().includes(query));
  });

  constructor() {
    if (this.appMode.isBackendEnabled()) {
      void this.loadMyStores();
    }
  }

  protected openStoreSearch(): void {
    // Reserved for the shell-aligned mobile search interaction.
  }

  protected updateSearchQuery(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
  }

  protected onStoreSubmit(formData: NewStoreFormData): void {
    const newStore: Store = {
      id: crypto.randomUUID(),
      name: formData.name,
      description: formData.description,
      logo: formData.logo,
      banner: formData.banner,
      location: 'Ikeja, Lagos',
      callNumber: formData.callNumber,
      alternateCallNumber: formData.alternateCallNumber,
      followers: '0',
      isVerified: false,
      route: ['/seller/my-stores'],
    };

    this.stores.update((previousStores) => [newStore, ...previousStores]);
    this.isAddingStore.set(false);
    this.latestCreatedStoreName.set(formData.name);

    setTimeout(() => {
      this.isSuccess.set(true);
    }, 300);
  }

  protected onAddAnother(): void {
    this.isSuccess.set(false);
    this.isAddingStore.set(true);
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
      this.errorMessage.set('We could not load your stores right now.');
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
        ) ?? '/assets/images/store-none-cover-desktop.png',
      mobileCoverImage:
        this.resolveMediaUrl(
          this.readString(store['cover_image']) ??
            this.readString(store['banner']) ??
            this.readString(store['image']),
        ) ?? '/assets/images/store-none-cover-desktop.png',
      logoImage:
        this.resolveMediaUrl(
          this.readString(store['profile_photo']) ??
            this.readString(store['logo']) ??
            this.readNestedString(store['user'], 'avatar'),
        ) ?? '/assets/images/dashboard-avatar-mobile.png',
      mobileLogoImage:
        this.resolveMediaUrl(
          this.readString(store['profile_photo']) ??
            this.readString(store['logo']) ??
            this.readNestedString(store['user'], 'avatar'),
        ) ?? '/assets/images/dashboard-avatar-mobile.png',
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
