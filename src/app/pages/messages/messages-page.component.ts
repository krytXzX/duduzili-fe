import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { MobileOverlayService } from '../../services/mobile-overlay.service';

interface Conversation {
  id: string;
  name: string;
  preview: string;
  time: string;
  unreadCount?: number;
  avatar: string;
  mobileAvatar?: string;
  storeBadge: string;
  mobileStoreBadge?: string;
}

interface StoreOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-messages-page',
  imports: [CommonModule, NgOptimizedImage],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div class="hidden h-full min-h-0 md:block">
      <section class="mx-auto flex h-full min-h-0 max-w-[1060px] flex-col overflow-hidden">
        <header
          class="flex h-[69px] shrink-0 items-center justify-between border-b border-[#EEEEEE] px-4"
        >
          <h1 class="text-[24px] font-medium leading-normal text-[#0D0D0D]">Chats</h1>

          @if (!isBuyerView()) {
            <button
              type="button"
              class="flex h-12 w-[296px] items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white px-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
            >
              <span class="flex items-center gap-2">
                <span class="relative h-8 w-[68px] shrink-0">
                  <img
                    [ngSrc]="assets.selectorAvatarOne"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-0 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <img
                    [ngSrc]="assets.selectorAvatarTwo"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-3 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <img
                    [ngSrc]="assets.selectorAvatarThree"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-6 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <span
                    class="absolute left-9 top-0 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="assets.selectorStoreIconDesktop"
                      width="21"
                      height="16"
                      alt=""
                      class="h-4 w-[21px]"
                    />
                  </span>
                </span>

                <span class="text-[14px] font-medium leading-5 text-[rgba(13,13,13,0.8)]">
                  {{ selectedStoreLabel() }}
                </span>
              </span>

              <span class="flex items-center gap-[10px]">
                <span class="h-[17px] w-px bg-[#E8E8E8]"></span>
                <span class="rounded-full bg-[#EDEDED] p-1">
                  <img [ngSrc]="assets.chevronDown" width="16" height="16" alt="" class="h-4 w-4" />
                </span>
              </span>
            </button>
          }
        </header>

        <div class="flex min-h-0 flex-1 items-stretch gap-8 px-6 pb-6 pt-6">
          <aside class="flex min-h-0 w-[296px] shrink-0 flex-col">
            <label class="flex h-10 items-center gap-2 rounded-full bg-[#FAFAFA] px-3">
              <img [ngSrc]="assets.searchDesktop" width="16" height="16" alt="" class="h-4 w-4" />
              <input
                type="text"
                placeholder="Search messages"
                class="w-full bg-transparent text-[14px] leading-5 text-[#0D0D0D] outline-none placeholder:text-[#777777]"
              />
            </label>

            <div class="mt-3 min-h-0 flex-1 space-y-1 overflow-y-auto pr-1 chats-scrollbar">
              @for (chat of conversations(); track chat.id) {
                <button
                  type="button"
                  (click)="activeChatId.set(chat.id)"
                  class="w-full rounded-[18px] px-3 py-4 text-left"
                  [class.bg-[#F6F6F6]]="activeChatId() === chat.id"
                >
                  <div class="flex items-center gap-[9px]">
                    <div class="relative h-12 w-12 shrink-0">
                      <img
                        [ngSrc]="chat.avatar"
                        width="48"
                        height="48"
                        [alt]="chat.name"
                        class="h-12 w-12 rounded-full object-cover"
                      />
                      <span
                        class="absolute left-7 top-7 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-[-1px_2px_4px_rgba(114,114,114,0.25)]"
                      >
                        <img
                          [ngSrc]="chat.storeBadge"
                          width="20"
                          height="20"
                          alt=""
                          class="h-5 w-5 object-cover"
                        />
                      </span>
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex items-center">
                        <div class="min-w-0 flex-1">
                          <p class="truncate text-[16px] font-semibold leading-6 text-[#002F35]">
                            {{ chat.name }}
                          </p>
                        </div>

                        <span
                          class="w-[104px] shrink-0 text-right text-[12px] leading-4"
                          [class.text-[#6453D9]]="chat.unreadCount"
                          [class.font-medium]="chat.unreadCount"
                          [class.text-[#6C6C6C]]="!chat.unreadCount"
                        >
                          {{ chat.time }}
                        </span>
                      </div>

                      <div class="mt-1 flex items-center gap-[19px]">
                        <p class="min-w-0 flex-1 truncate text-[14px] leading-5 text-[#7A7A7A]">
                          {{ chat.preview }}
                        </p>

                        @if (chat.unreadCount) {
                          <span
                            class="inline-flex h-5 min-w-[33px] items-center justify-center rounded-[12px] bg-[#6453D9] px-[6px] text-[12px] leading-4 text-white"
                          >
                            {{ chat.unreadCount }}
                          </span>
                        }
                      </div>
                    </div>
                  </div>
                </button>
              }
            </div>
          </aside>

          <section
            class="grid min-h-0 min-w-0 flex-1 grid-rows-[83px_minmax(0,1fr)_77px] overflow-hidden rounded-[16px] border border-[#F1F1F1] bg-white"
          >
            <header class="border-b border-[#EAEAEA] bg-white px-[23px] py-[12.5px]">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="relative h-[56px] w-[56px] shrink-0">
                    <img
                      [ngSrc]="activeDesktopConversation().avatar"
                      width="56"
                      height="56"
                      [alt]="activeDesktopConversation().name"
                      class="h-14 w-14 rounded-full object-cover"
                    />
                    <span
                      class="absolute bottom-0 left-[32px] flex h-[23px] w-[23px] items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-[-1px_2px_4px_rgba(114,114,114,0.25)]"
                    >
                      <img
                        [ngSrc]="activeDesktopConversation().storeBadge"
                        width="22"
                        height="22"
                        alt=""
                        class="h-[22px] w-[22px] object-cover"
                      />
                    </span>
                  </div>

                  <div>
                    <p class="text-[20px] font-medium leading-6 text-[#002F35]">
                      {{ activeDesktopConversation().name }}
                    </p>
                    <div class="mt-1 flex items-center gap-1">
                      <span class="h-1 w-1 rounded-full bg-[#BFBFBF]"></span>
                      <span class="text-[14px] leading-5 text-[#9C9C9C]"> Active 25 mins ago </span>
                    </div>
                  </div>
                </div>

                <button type="button" class="rounded-[40px] p-[10px]">
                  <img
                    [ngSrc]="assets.searchDesktop"
                    width="24"
                    height="24"
                    alt=""
                    class="h-6 w-6"
                  />
                </button>
              </div>
            </header>

            <div class="min-h-0 overflow-y-auto px-[23px] py-6 chats-scrollbar">
              <p class="text-center text-[12px] leading-4 text-[#6F6F6F]">20/02/2024</p>

              <div class="relative mt-6 h-[156px]">
                <div
                  class="absolute left-0 top-0 max-w-[420px] rounded-[24px] bg-[#F8F8F8] px-[18px] py-3"
                >
                  <p class="text-[16px] leading-6 text-[#242424]">
                    Good morning, yes i still have the iphone 17 pro max available
                  </p>
                </div>

                <div
                  class="absolute bottom-0 right-0 max-w-[420px] rounded-[24px] bg-[#6453D9] px-[18px] py-3"
                >
                  <p class="text-[16px] leading-6 text-white">
                    Good day👋🏻. Alright great, i want the orang one with 3 cameras delivered this
                    weekend
                  </p>
                </div>
              </div>

              <p class="mt-6 text-center text-[12px] leading-4 text-[#6F6F6F]">Today</p>

              <div class="relative mt-6 h-[312px]">
                <p
                  class="absolute left-[95px] top-0 -translate-x-full text-[12px] leading-4 text-[#6F6F6F]"
                >
                  Replied to you
                </p>

                <span class="absolute left-[7px] top-[18px] h-[65px] w-px bg-[#E2E2E2]"></span>

                <div
                  class="absolute right-[183px] top-[25px] max-w-[420px] rounded-[24px] bg-[#6453D9] px-[18px] py-3 opacity-30"
                >
                  <p class="text-[16px] leading-6 text-white">
                    Good day👋🏻. Alright great, i want the orang one with 3 cameras delivered this
                    weekend
                  </p>
                </div>

                <div
                  class="absolute left-0 top-[84px] max-w-[420px] rounded-[24px] bg-[#F8F8F8] px-[18px] py-3"
                >
                  <p class="text-[16px] leading-6 text-[#262626]">
                    That’s no problem at all. We can meet at a place of your choosing
                  </p>
                </div>

                <div
                  class="absolute left-[173px] top-[168px] max-w-[420px] rounded-[24px] bg-[#6453D9] px-[18px] py-3"
                >
                  <p class="text-[16px] leading-6 text-white">
                    Alright. Pls send me some pictures of the phone
                  </p>
                </div>

                <div class="absolute left-0 top-[228px] h-[138px] w-[157px]">
                  <img
                    [ngSrc]="assets.attachmentOneDesktop"
                    width="102"
                    height="114"
                    alt=""
                    class="absolute left-[4px] top-[11px] h-[114px] w-[102px] -rotate-[4.16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                  />
                  <img
                    [ngSrc]="assets.attachmentTwoDesktop"
                    width="102"
                    height="114"
                    alt=""
                    class="absolute left-[20px] top-[7px] h-[114px] w-[102px] rotate-[6deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                  />
                  <img
                    [ngSrc]="assets.attachmentThreeDesktop"
                    width="102"
                    height="114"
                    alt=""
                    class="absolute left-[34px] top-0 h-[114px] w-[102px] rotate-[16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                  />
                </div>
              </div>
            </div>

            <footer class="border-t border-[#EEEEEE] bg-white px-[15px] py-[8px]">
              <div class="flex items-center gap-5">
                <div class="flex items-center gap-3">
                  <button type="button">
                    <img
                      [ngSrc]="assets.galleryDesktop"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  </button>
                  <button type="button">
                    <img
                      [ngSrc]="assets.emojiDesktop"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  </button>
                </div>

                <div
                  class="relative flex h-[45px] min-w-0 flex-1 items-center rounded-full border border-[#EDEDED] bg-[#F8F8F8] px-[13px]"
                >
                  <input
                    type="text"
                    placeholder="Type a message..."
                    class="w-full bg-transparent pr-10 text-[14px] leading-5 text-[#0D0D0D] outline-none placeholder:text-[rgba(13,13,13,0.4)]"
                  />
                  <button type="button" class="absolute right-[11px] top-1/2 -translate-y-1/2">
                    <img
                      [ngSrc]="assets.micDesktop"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  </button>
                </div>
              </div>
            </footer>
          </section>
        </div>
      </section>
    </div>

    <div class="h-full md:hidden">
      @if (!isMobileConversationOpen()) {
        <section class="px-5 pb-28 pt-[14px]">
          <div class="flex items-center justify-between">
            <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Chats</h1>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAFA]"
            >
              <img [ngSrc]="assets.searchMobile" width="20" height="20" alt="" class="h-5 w-5" />
            </button>
          </div>

          @if (!isBuyerView()) {
            <button
              type="button"
              class="mt-6 flex h-12 w-full items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white px-2"
            >
              <span class="flex items-center gap-2">
                <span class="relative h-8 w-[68px] shrink-0">
                  <img
                    [ngSrc]="assets.selectorAvatarOne"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-0 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <img
                    [ngSrc]="assets.selectorAvatarTwo"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-3 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <img
                    [ngSrc]="assets.selectorAvatarThree"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-6 top-0 h-8 w-8 rounded-full border border-white object-cover"
                  />
                  <span
                    class="absolute left-9 top-0 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-white bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="assets.selectorStoreIconMobile"
                      width="21"
                      height="16"
                      alt=""
                      class="h-4 w-[21px]"
                    />
                  </span>
                </span>

                <span class="text-[14px] font-medium leading-5 text-[rgba(13,13,13,0.8)]">
                  {{ selectedStoreLabel() }}
                </span>
              </span>

              <span class="flex items-center gap-[10px]">
                <span class="h-[17px] w-px bg-[#E8E8E8]"></span>
                <span class="rounded-full bg-[#EDEDED] p-1">
                  <img [ngSrc]="assets.chevronDown" width="16" height="16" alt="" class="h-4 w-4" />
                </span>
              </span>
            </button>
          }

          <div class="mt-4 space-y-1">
            @for (chat of conversations(); track chat.id) {
              <button
                type="button"
                (click)="openMobileConversation(chat.id)"
                class="w-full py-4 text-left"
              >
                <div class="flex items-center gap-[9px]">
                  <div class="relative h-12 w-12 shrink-0">
                    <img
                      [ngSrc]="chat.mobileAvatar ?? chat.avatar"
                      width="48"
                      height="48"
                      [alt]="chat.name"
                      class="h-12 w-12 rounded-full object-cover"
                    />
                    <span
                      class="absolute left-7 top-7 flex h-5 w-5 items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-[-1px_2px_4px_rgba(114,114,114,0.25)]"
                    >
                      <img
                        [ngSrc]="chat.mobileStoreBadge ?? assets.storeBadgeMobile"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5 object-cover"
                      />
                    </span>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex items-center">
                      <p
                        class="min-w-0 flex-1 truncate text-[16px] font-semibold leading-6 text-[#002F35]"
                      >
                        {{ chat.name }}
                      </p>
                      <span
                        class="w-[104px] shrink-0 text-right text-[12px] leading-4"
                        [class.text-[#6453D9]]="chat.unreadCount"
                        [class.font-medium]="chat.unreadCount"
                        [class.text-[#6C6C6C]]="!chat.unreadCount"
                      >
                        {{ chat.time }}
                      </span>
                    </div>

                    <div class="mt-1 flex items-center gap-[19px]">
                      <p class="min-w-0 flex-1 truncate text-[14px] leading-5 text-[#7A7A7A]">
                        {{ chat.preview }}
                      </p>

                      @if (chat.unreadCount) {
                        <span
                          class="inline-flex h-5 min-w-[33px] items-center justify-center rounded-[12px] bg-[#6453D9] px-[6px] text-[12px] leading-4 text-white"
                        >
                          {{ chat.unreadCount }}
                        </span>
                      }
                    </div>
                  </div>
                </div>
              </button>
            }
          </div>
        </section>
      }
    </div>

    @if (isMobileConversationOpen()) {
      <section class="fixed inset-0 z-[95] bg-white md:hidden">
        <header class="border-b border-[#EAEAEA] bg-white px-4 pt-[47px]">
          <div class="flex items-center gap-3 py-[14px]">
            <div class="flex min-w-0 flex-1 items-center">
              <button
                type="button"
                (click)="closeMobileConversation()"
                class="shrink-0 rounded-[40px] p-[10px]"
                aria-label="Go back"
              >
                <img [ngSrc]="assets.backMobile" width="20" height="20" alt="" class="h-5 w-5" />
              </button>

              <div class="ml-1 flex min-w-0 items-center gap-2">
                <div class="relative h-[46px] w-[46px] shrink-0">
                  <img
                    [ngSrc]="
                      activeMobileConversation().mobileAvatar ?? activeMobileConversation().avatar
                    "
                    width="46"
                    height="46"
                    [alt]="activeMobileConversation().name"
                    class="h-[46px] w-[46px] rounded-full object-cover"
                  />
                  <span
                    class="absolute bottom-0 left-[27px] flex h-[19px] w-[19px] items-center justify-center overflow-hidden rounded-full border border-white bg-white shadow-[-1px_2px_4px_rgba(114,114,114,0.25)]"
                  >
                    <img
                      [ngSrc]="
                        activeMobileConversation().mobileStoreBadge ?? assets.storeBadgeMobile
                      "
                      width="19"
                      height="19"
                      alt=""
                      class="h-[19px] w-[19px] object-cover"
                    />
                  </span>
                </div>

                <div class="min-w-0">
                  <p class="truncate text-[20px] font-medium leading-6 text-[#002F35]">
                    {{ activeMobileConversation().name }}
                  </p>
                  <div class="mt-1 flex items-center gap-1">
                    <span class="h-1 w-1 rounded-full bg-[#BFBFBF]"></span>
                    <span class="text-[14px] leading-5 text-[#9C9C9C]">Active 25 mins ago</span>
                  </div>
                </div>
              </div>
            </div>

            <button type="button" class="shrink-0 rounded-[40px] p-[10px]">
              <img [ngSrc]="assets.searchMobile" width="20" height="20" alt="" class="h-5 w-5" />
            </button>
          </div>
        </header>

        <div class="h-[calc(100vh-193px)] overflow-y-auto px-4 pb-8 pt-6 chats-scrollbar">
          <p class="text-center text-[12px] leading-4 text-[#6F6F6F]">09/01/2026</p>

          <div class="relative mt-6 h-[164px]">
            <div
              class="absolute left-0 top-0 max-w-[280px] rounded-[24px] bg-[#F8F8F8] px-[14px] py-3"
            >
              <p class="text-[16px] leading-5 text-[#242424]">
                Good morning, yes i still have the iphone 17 pro max available
              </p>
            </div>

            <div
              class="absolute right-0 top-20 max-w-[300px] rounded-[24px] bg-[#6453D9] px-[14px] py-3"
            >
              <p class="text-[16px] leading-5 text-white">
                Good day👋🏻. Alright great, i want the orang one with 3 cameras delivered this
                weekend
              </p>
            </div>
          </div>

          <p class="mt-6 text-center text-[12px] leading-4 text-[#6F6F6F]">Today</p>

          <div class="relative mt-6 h-[380px]">
            <p class="absolute left-[7px] top-0 text-[12px] leading-4 text-[#6F6F6F]">
              Replied to you
            </p>
            <span class="absolute left-[1px] top-[18px] h-[65px] w-px bg-[#E2E2E2]"></span>

            <div
              class="absolute right-[52px] top-[25px] w-[280px] rounded-[24px] bg-[#6453D9] px-[14px] py-3 opacity-30"
            >
              <p class="text-[16px] leading-5 text-white">
                Good day👋🏻. Alright great, i want the orang one with 3 cameras delivered this
                weekend
              </p>
            </div>

            <div
              class="absolute left-3 top-[82px] w-[280px] rounded-[24px] bg-[#F8F8F8] px-[14px] py-3"
            >
              <p class="text-[16px] leading-5 text-[#262626]">
                That’s no problem at all. We can meet at a place of your choosing
              </p>
            </div>

            <div
              class="absolute right-[19px] top-[130px] rounded-[24px] border border-[#F5F5F5] bg-white px-3 py-1 shadow-[0_3px_8px_rgba(216,216,216,0.25)]"
            >
              <span class="text-[16px] leading-6 text-[#9C9C9C]">👍</span>
            </div>

            <div
              class="absolute left-[58px] top-[170px] max-w-[300px] rounded-[24px] bg-[#6453D9] px-[14px] py-3"
            >
              <p class="text-[16px] leading-5 text-white">
                Alright. Pls send me some pictures of the phone
              </p>
            </div>

            <div class="absolute left-[-9px] top-[242px] h-[138px] w-[157px]">
              <img
                [ngSrc]="assets.attachmentOneMobile"
                width="102"
                height="114"
                alt=""
                class="absolute left-[14px] top-[11px] h-[114px] w-[102px] -rotate-[4.18deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
              />
              <img
                [ngSrc]="assets.attachmentTwoMobile"
                width="102"
                height="114"
                alt=""
                class="absolute left-[20px] top-[7px] h-[114px] w-[102px] rotate-[6deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
              />
              <img
                [ngSrc]="assets.attachmentThreeMobile"
                width="102"
                height="114"
                alt=""
                class="absolute left-[28px] top-0 h-[114px] w-[102px] rotate-[16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
              />
            </div>
          </div>
        </div>

        <footer
          class="absolute inset-x-0 bottom-0 border-t border-[#EEEEEE] bg-white px-[15px] py-[8px]"
        >
          <div class="flex h-[46px] items-center gap-4">
            @if (!hasDraftMessage()) {
              <button type="button" class="shrink-0">
                <img [ngSrc]="assets.galleryMobile" width="24" height="24" alt="" class="h-6 w-6" />
              </button>
            }

            <div
              class="flex h-[46px] min-w-0 flex-1 items-center rounded-full border border-[#EDEDED] bg-[#F8F8F8] pl-[13px]"
              [class.pr-[13px]]="!hasDraftMessage()"
              [class.pr-1]="hasDraftMessage()"
            >
              <input
                type="text"
                [value]="draftMessage()"
                (input)="updateDraftMessage($event)"
                placeholder="Type a message..."
                class="min-w-0 flex-1 bg-transparent text-[14px] leading-5 text-[#2D2D2D] outline-none placeholder:text-[rgba(13,13,13,0.4)]"
              />

              @if (!hasDraftMessage()) {
                <button type="button" class="shrink-0">
                  <img [ngSrc]="assets.micMobile" width="24" height="24" alt="" class="h-6 w-6" />
                </button>
              } @else {
                <button
                  type="button"
                  class="flex h-10 w-[58px] shrink-0 items-center justify-center rounded-full bg-[#6453D9]"
                >
                  <img [ngSrc]="assets.sendMobile" width="24" height="24" alt="" class="h-6 w-6" />
                </button>
              }
            </div>
          </div>
        </footer>
      </section>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .chats-scrollbar::-webkit-scrollbar {
        width: 4px;
      }

      .chats-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }

      .chats-scrollbar::-webkit-scrollbar-thumb {
        background: #e5e5e5;
        border-radius: 999px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPageComponent implements OnDestroy {
  private readonly router = inject(Router);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private mobileConversationOverlayOpen = false;

  readonly assets = {
    attachmentOneDesktop: '/assets/images/chats-attachment-1-desktop.png',
    attachmentOneMobile: '/assets/images/chats-attachment-1-mobile.png',
    attachmentThreeDesktop: '/assets/images/chats-attachment-3-desktop.png',
    attachmentThreeMobile: '/assets/images/chats-attachment-3-mobile.png',
    attachmentTwoDesktop: '/assets/images/chats-attachment-2-desktop.png',
    attachmentTwoMobile: '/assets/images/chats-attachment-2-mobile.png',
    backMobile: '/assets/icons/chats-back-mobile.svg',
    bryanAvatarDesktop: '/assets/images/chats-bryan-avatar-desktop.png',
    bryanAvatarMobile: '/assets/images/chats-bryan-avatar-mobile.png',
    chatsAvatarDesktop: '/assets/images/chats-angela-avatar-desktop.png',
    chatsAvatarMobile: '/assets/images/chats-angela-avatar-mobile.png',
    chevronDown: '/assets/icons/chats-chevron-down.svg',
    ediriAvatarDesktop: '/assets/images/chats-ediri-avatar-desktop.png',
    ediriAvatarMobile: '/assets/images/chats-ediri-avatar-mobile.png',
    emojiDesktop: '/assets/icons/chats-emoji-desktop.svg',
    galleryDesktop: '/assets/icons/chats-gallery-desktop.svg',
    galleryMobile: '/assets/icons/chats-gallery-mobile.svg',
    bryanBadgeDesktop: '/assets/icons/chats-bryan-badge-desktop.svg',
    bryanBadgeMobile: '/assets/icons/chats-bryan-badge-mobile.svg',
    micDesktop: '/assets/icons/chats-mic-desktop.svg',
    micMobile: '/assets/icons/chats-mic-mobile.svg',
    searchDesktop: '/assets/icons/chats-search-desktop.svg',
    searchMobile: '/assets/icons/chats-search-mobile.svg',
    selectorAvatarOne: '/assets/images/chats-selector-avatar-1.png',
    selectorAvatarThree: '/assets/images/chats-store-badge-desktop.png',
    selectorAvatarTwo: '/assets/images/chats-selector-avatar-2.png',
    selectorStoreIconDesktop: '/assets/icons/chats-selector-store-icon-desktop.svg',
    selectorStoreIconMobile: '/assets/icons/chats-selector-store-icon-mobile.svg',
    sendMobile: '/assets/icons/chats-send-mobile.svg',
    storeBadgeMobile: '/assets/images/chats-store-badge-mobile.png',
  } as const;

  readonly isMobileConversationOpen = signal(false);
  readonly activeChatId = signal('2');
  readonly draftMessage = signal('');
  readonly selectedStoreId = signal('all');
  readonly isBuyerView = computed(() => this.router.url.startsWith('/buyer'));
  readonly hasDraftMessage = computed(() => this.draftMessage().trim().length > 0);

  readonly storeOptions: readonly StoreOption[] = [
    { id: 'all', label: 'All stores (4)' },
    { id: 'vine', label: 'The Vine Collections' },
    { id: 'personal', label: 'Personal profile' },
  ];

  readonly conversations = signal<Conversation[]>([
    {
      id: '1',
      name: 'Bryan Odjede',
      preview: 'I’m glad you like the perfume',
      time: '15 hrs',
      unreadCount: 148,
      avatar: '/assets/images/chats-bryan-avatar-desktop.png',
      mobileAvatar: '/assets/images/chats-bryan-avatar-mobile.png',
      storeBadge: '/assets/icons/chats-bryan-badge-desktop.svg',
      mobileStoreBadge: '/assets/icons/chats-bryan-badge-mobile.svg',
    },
    {
      id: '2',
      name: 'Angela Ugorji',
      preview: 'That’s no problem at all. We can meet at Co...',
      time: 'Just now',
      avatar: '/assets/images/chats-angela-avatar-desktop.png',
      mobileAvatar: '/assets/images/chats-angela-avatar-mobile.png',
      storeBadge: '/assets/images/chats-store-badge-desktop.png',
      mobileStoreBadge: '/assets/images/chats-store-badge-mobile.png',
    },
    {
      id: '3',
      name: 'Ediri Oghenemaro',
      preview: 'Can we meet on Thursday?',
      time: '20/02/2024',
      avatar: '/assets/images/chats-ediri-avatar-desktop.png',
      mobileAvatar: '/assets/images/chats-ediri-avatar-mobile.png',
      storeBadge: '/assets/images/chats-store-badge-desktop.png',
      mobileStoreBadge: '/assets/images/chats-store-badge-mobile.png',
    },
  ]);

  readonly selectedStoreLabel = computed(
    () =>
      this.storeOptions.find((store) => store.id === this.selectedStoreId())?.label ??
      'All stores (4)',
  );

  readonly activeDesktopConversation = computed(
    () =>
      this.conversations().find((conversation) => conversation.id === this.activeChatId()) ??
      this.conversations()[1],
  );

  readonly activeMobileConversation = computed(
    () =>
      this.conversations().find((conversation) => conversation.id === this.activeChatId()) ??
      this.conversations()[1],
  );

  protected openMobileConversation(chatId: string): void {
    this.activeChatId.set(chatId);
    this.isMobileConversationOpen.set(true);

    if (!this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.openMobileModal();
      this.mobileConversationOverlayOpen = true;
    }
  }

  protected closeMobileConversation(): void {
    this.isMobileConversationOpen.set(false);

    if (this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.closeMobileModal();
      this.mobileConversationOverlayOpen = false;
    }
  }

  protected updateDraftMessage(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.draftMessage.set(input?.value ?? '');
  }

  ngOnDestroy(): void {
    if (this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.closeMobileModal();
      this.mobileConversationOverlayOpen = false;
    }
  }
}
