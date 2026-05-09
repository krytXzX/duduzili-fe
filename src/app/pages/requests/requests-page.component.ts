import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MobileBottomNavComponent } from '../../components/layout/mobile-bottom-nav.component';

type RequestItem = {
  readonly label: string;
  readonly route: string;
  readonly iconSrc: string;
};

@Component({
  selector: 'app-requests-page',
  imports: [NgOptimizedImage, RouterLink, MobileBottomNavComponent],
  template: `
    <div class="min-h-full bg-white pb-[120px] md:bg-transparent md:pb-0">
      <div class="mx-auto w-full max-w-[390px] px-5 pt-4 md:hidden">
        <div class="flex items-center gap-2">
          <a
            routerLink="/seller/more"
            aria-label="Back to More"
            class="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F3F3]"
          >
            <img
              ngSrc="/assets/icons/requests-back-mobile.svg"
              width="20"
              height="20"
              alt=""
              class="h-5 w-5"
            />
          </a>
          <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Requests</h1>
        </div>

        <div class="mt-[34px] space-y-5">
          @for (item of requestItems; track item.label) {
            <a [routerLink]="item.route" class="flex items-center justify-between">
              <span class="flex items-center gap-3">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#383838]">
                  <img
                    [ngSrc]="item.iconSrc"
                    width="15"
                    height="15"
                    alt=""
                    class="h-[14.5px] w-[14.5px]"
                  />
                </span>

                <span class="text-[16px] font-medium leading-5 text-[rgba(13,13,13,0.8)]">
                  {{ item.label }}
                </span>
              </span>

              <img
                ngSrc="/assets/icons/requests-chevron-right-mobile.svg"
                width="16"
                height="16"
                alt=""
                class="h-4 w-4"
              />
            </a>
          }
        </div>
      </div>

      <app-mobile-bottom-nav
        variant="seller"
        listingsRoute="/seller/listings"
        [listingsActivePaths]="['/seller/listings']"
        messagesRoute="/seller/messages"
        [messagesActivePaths]="['/seller/messages']"
        storesRoute="/seller/my-stores"
        [storesActivePaths]="['/seller/my-stores']"
        moreRoute="/seller/more"
        [moreActivePaths]="['/seller/more']"
        createButtonRoute="/seller/listings"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestsPageComponent {
  readonly requestItems: readonly RequestItem[] = [
    {
      label: 'Offers',
      route: '/seller/requests/offers',
      iconSrc: '/assets/icons/requests-offers-mobile.svg',
    },
    {
      label: 'Call back requests',
      route: '/seller/requests/callbacks',
      iconSrc: '/assets/icons/requests-callbacks-mobile.svg',
    },
  ];
}
