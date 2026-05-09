import { CommonModule, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
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
  subtitle?: string;
  variant: 'all' | 'store' | 'profile';
  avatar?: string;
}

interface ReplyTarget {
  author: string;
  text: string;
}

interface MessageMenuTarget extends ReplyTarget {
  messageId: string;
}

type DeleteIntent = 'chat' | 'messages';

type ChatTextMessage = {
  id: string;
  kind: 'text';
  author: string;
  text: string;
  outgoing: boolean;
  variant?: 'normal' | 'faded';
  replyLabel?: string;
  reaction?: string;
};

type ChatAttachmentsMessage = {
  id: string;
  kind: 'attachments';
  attachmentsDesktop: readonly string[];
  attachmentsMobile: readonly string[];
};

type ChatMessage = ChatTextMessage | ChatAttachmentsMessage;

type ChatDay = {
  id: string;
  label: string;
  messages: readonly ChatMessage[];
};

@Component({
  selector: 'app-messages-page',
  imports: [CommonModule, NgOptimizedImage],
  host: {
    class: 'block h-full min-h-0',
  },
  template: `
    <div
      class="hidden h-full min-h-0 md:block"
      (contextmenu)="suppressNativeContextMenu($event)"
      (selectstart)="suppressNativeContextMenu($event)"
      (dragstart)="suppressNativeContextMenu($event)"
    >
      <section class="mx-auto flex h-full min-h-0 max-w-[1060px] flex-col overflow-hidden">
        <header
          class="flex h-[69px] shrink-0 items-center justify-between border-b border-[#EEEEEE] px-4"
        >
          <h1 class="text-[24px] font-medium leading-normal text-[#0D0D0D]">Chats</h1>

          <div class="relative">
            <button
              type="button"
              (click)="openStoreSelector()"
              class="flex h-12 w-[296px] items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white px-2 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              aria-haspopup="listbox"
              [attr.aria-expanded]="isStoreSelectorOpen()"
            >
              <span class="flex items-center gap-2">
                <span class="relative h-8 w-[68px] shrink-0">
                  @if (selectedStore().variant === 'all') {
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
                  } @else if (selectedStore().variant === 'store') {
                    <span
                      class="absolute left-0 top-0 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#3D785F]"
                    >
                      <img
                        [ngSrc]="assets.selectorStoreIconDesktop"
                        width="21"
                        height="16"
                        alt=""
                        class="h-4 w-[21px]"
                      />
                    </span>
                  } @else {
                    <img
                      [ngSrc]="selectedStore().avatar ?? assets.storeSelectorPersonal"
                      width="32"
                      height="32"
                      alt=""
                      class="absolute left-0 top-0 h-8 w-8 rounded-full object-cover"
                    />
                  }
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

            @if (isStoreSelectorOpen()) {
              <button
                type="button"
                (click)="closeStoreSelector()"
                aria-label="Close store selector"
                class="fixed inset-0 z-[119] hidden md:block"
              ></button>

              <section
                class="absolute right-0 top-[calc(100%+12px)] z-[120] hidden w-[366px] rounded-[24px] border border-[#EAEAEA] bg-white p-4 shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:block"
                aria-label="Select store"
                role="listbox"
              >
                <label class="flex h-10 items-center gap-2 rounded-full bg-[#FAFAFA] px-3">
                  <img [ngSrc]="assets.searchDesktop" width="16" height="16" alt="" class="h-4 w-4" />
                  <input
                    type="text"
                    [value]="storeSearchTerm()"
                    (input)="updateStoreSearch($event)"
                    placeholder="Search stores"
                    class="w-full bg-transparent text-[14px] leading-5 text-[#0D0D0D] outline-none placeholder:text-[#777777]"
                  />
                </label>

                <div class="mt-4 space-y-4">
                  @for (store of filteredStoreOptions(); track store.id) {
                    <button
                      type="button"
                      (click)="selectStore(store.id)"
                      class="flex w-full items-center justify-between text-left"
                    >
                      <span class="flex min-w-0 items-center gap-2">
                        @if (store.variant === 'all') {
                          <span class="relative h-[19px] w-10 shrink-0">
                            <img
                              [ngSrc]="assets.selectorAvatarOne"
                              width="19"
                              height="19"
                              alt=""
                              class="absolute left-0 top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                            />
                            <img
                              [ngSrc]="assets.selectorAvatarTwo"
                              width="19"
                              height="19"
                              alt=""
                              class="absolute left-[7px] top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                            />
                            <img
                              [ngSrc]="assets.selectorAvatarThree"
                              width="19"
                              height="19"
                              alt=""
                              class="absolute left-[14px] top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                            />
                            <span
                              class="absolute left-[21px] top-0 flex h-[19px] w-[19px] items-center justify-center overflow-hidden rounded-full border border-white bg-[#3D785F]"
                            >
                              <img
                                [ngSrc]="assets.selectorStoreIconMobile"
                                width="12"
                                height="10"
                                alt=""
                                class="h-[10px] w-3"
                              />
                            </span>
                          </span>

                          <span class="text-[16px] font-medium leading-5 text-[#0D0D0D]">
                            {{ store.label }}
                          </span>
                        } @else {
                          <span
                            class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
                            [class.bg-[#3D785F]]="store.id === 'vine'"
                            [class.bg-white]="store.id === 'eden'"
                            [class.bg-[#F3F3F3]]="store.id === 'personal'"
                          >
                            @if (store.id === 'vine') {
                              <img
                                [ngSrc]="assets.selectorStoreIconMobile"
                                width="24"
                                height="18"
                                alt=""
                                class="h-[18px] w-6"
                              />
                            } @else {
                              <img
                                [ngSrc]="store.avatar ?? assets.storeSelectorEden"
                                width="40"
                                height="40"
                                alt=""
                                class="h-10 w-10 object-cover"
                              />
                            }
                          </span>

                          <span class="min-w-0">
                            <span class="block truncate text-[16px] font-medium leading-5 text-[#1A1B1D]">
                              {{ store.label }}
                            </span>
                            <span class="mt-1 block truncate text-[12px] leading-5 text-[#8C8C8C]">
                              {{ store.subtitle }}
                            </span>
                          </span>
                        }
                      </span>

                      <span class="flex h-6 w-6 shrink-0 items-center justify-center">
                        @if (selectedStoreId() === store.id) {
                          <img
                            [ngSrc]="assets.storeSelectorCheck"
                            width="24"
                            height="24"
                            alt=""
                            class="h-6 w-6"
                          />
                        }
                      </span>
                    </button>
                  }
                </div>
              </section>
            }
          </div>
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
                  (click)="selectDesktopConversation(chat.id)"
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
                  @if (isSelectionMode()) {
                    <div class="flex items-center justify-between gap-4 w-full">
                      <div>
                        <p class="text-[20px] font-medium leading-6 text-[#002F35]">
                          {{ selectedMessageCount() }} selected
                        </p>
                        <p class="mt-1 text-[14px] leading-5 text-[#9C9C9C]">
                          Tap messages to select or unselect them
                        </p>
                      </div>

                      <div class="flex items-center gap-1">
                        <button
                          type="button"
                          (click)="openDeleteMessagesConfirm()"
                          [disabled]="!selectedMessageCount()"
                          class="rounded-[40px] px-4 py-[10px] text-[14px] font-medium text-[#FF2524] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          (click)="exitSelectionMode()"
                          class="rounded-[40px] px-4 py-[10px] text-[14px] font-medium text-[#1A1B1D]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  } @else {
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

                    <div class="relative flex items-center gap-1">
                      <button type="button" class="rounded-[40px] p-[10px]">
                        <img
                          [ngSrc]="assets.searchDesktop"
                          width="24"
                          height="24"
                          alt=""
                          class="h-6 w-6"
                        />
                      </button>

                      <button
                        type="button"
                        (click)="openProfileMenu()"
                        class="rounded-[40px] p-[10px]"
                        aria-haspopup="dialog"
                        [attr.aria-expanded]="isProfileMenuOpen()"
                        aria-label="Open chat profile actions"
                      >
                        <img
                          [ngSrc]="assets.moreFigma"
                          width="20"
                          height="20"
                          alt=""
                          class="h-5 w-5"
                        />
                      </button>

                      @if (isProfileMenuOpen()) {
                        <button
                          type="button"
                          (click)="closeProfileMenu()"
                          aria-label="Close chat profile actions"
                          class="fixed inset-0 z-[129] hidden md:block"
                        ></button>

                        <section
                          class="absolute right-0 top-full z-[130] mt-2 hidden w-[220px] rounded-[20px] border border-[#F2F2F2] bg-white p-2 shadow-[0_20px_40px_rgba(0,0,0,0.08)] md:block"
                          aria-label="Chat profile actions"
                          role="dialog"
                          aria-modal="true"
                        >
                          <div class="space-y-1">
                            <button
                              type="button"
                              class="flex w-full items-center gap-[10px] rounded-[12px] px-3 py-3 text-left hover:bg-[#FAFAFA]"
                            >
                              <img
                                [ngSrc]="assets.profileMenuEye"
                                width="20"
                                height="20"
                                alt=""
                                class="h-5 w-5"
                              />
                              <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">
                                View profile
                              </span>
                            </button>

                            <button
                              type="button"
                              class="flex w-full items-center gap-[10px] rounded-[12px] px-3 py-3 text-left hover:bg-[#FFF7F7]"
                            >
                              <img
                                [ngSrc]="assets.profileMenuFlag"
                                width="20"
                                height="20"
                                alt=""
                                class="h-5 w-5"
                              />
                              <span class="text-[16px] font-medium leading-5 text-[#FF2524]">
                                Report seller
                              </span>
                            </button>

                            <button
                              type="button"
                              (click)="openClearChatConfirm()"
                              class="flex w-full items-center gap-[10px] rounded-[12px] px-3 py-3 text-left hover:bg-[#FFF7F7]"
                            >
                              <img
                                [ngSrc]="assets.profileMenuTrash"
                                width="20"
                                height="20"
                                alt=""
                                class="h-5 w-5"
                              />
                              <span class="text-[16px] font-medium leading-5 text-[#FF2524]">
                                Clear chat
                              </span>
                            </button>
                          </div>
                        </section>
                      }
                    </div>
                  }
              </div>
            </header>

            <div
              class="min-h-0 overflow-y-auto px-[23px] py-6 chats-scrollbar"
              (contextmenu)="suppressNativeContextMenu($event)"
            >
              <div class="space-y-6">
                @for (day of activeConversationDays(); track day.id) {
                  <section>
                    <p class="text-center text-[12px] leading-4 text-[#6F6F6F]">{{ day.label }}</p>

                    <div class="mt-6 space-y-4">
                      @for (message of day.messages; track message.id) {
                        @if (message.kind === 'text') {
                          <div
                            class="flex"
                            [class.justify-end]="message.outgoing"
                          >
                            <div class="max-w-[420px]">
                              @if (message.replyLabel) {
                                <div class="mb-2 flex items-start gap-2">
                                  <span class="mt-[2px] h-10 w-px bg-[#E2E2E2]"></span>
                                  <p class="text-[12px] leading-4 text-[#6F6F6F]">
                                    {{ message.replyLabel }}
                                  </p>
                                </div>
                              }

                              <div
                                class="rounded-[24px] px-[18px] py-3"
                                [class.bg-[#6453D9]]="message.outgoing"
                                [class.text-white]="message.outgoing"
                                [class.bg-[#F8F8F8]]="!message.outgoing"
                                [class.text-[#242424]]="!message.outgoing"
                                [class.opacity-30]="message.variant === 'faded'"
                                [class.ring-2]="isMessageSelected(message.id)"
                                [class.ring-[#C8BEFF]]="message.outgoing && isMessageSelected(message.id)"
                                [class.ring-[#6453D9]]="!message.outgoing && isMessageSelected(message.id)"
                                (pointerdown)="onMessageLongPressStart($event, message.id, message.author, message.text)"
                                (pointerup)="onMessageLongPressEnd($event)"
                                (pointercancel)="onMessageLongPressCancel($event)"
                                (contextmenu)="openMessageMenuFromContext($event, message.id, message.author, message.text)"
                                (click)="toggleMessageSelection(message.id)"
                              >
                                <p class="text-[16px] leading-6">
                                  {{ message.text }}
                                </p>
                              </div>

                              @if (message.reaction) {
                                <div class="mt-2 flex justify-end">
                                  <div class="rounded-[24px] border border-[#F5F5F5] bg-white px-3 py-1 shadow-[0_3px_8px_rgba(216,216,216,0.25)]">
                                    <span class="text-[16px] leading-6 text-[#9C9C9C]">{{ message.reaction }}</span>
                                  </div>
                                </div>
                              }
                            </div>
                          </div>
                        } @else {
                          <div class="pl-0">
                            <div class="relative h-[138px] w-[157px]">
                              <img
                                [ngSrc]="message.attachmentsDesktop[0]"
                                width="102"
                                height="114"
                                alt=""
                                class="absolute left-[4px] top-[11px] h-[114px] w-[102px] -rotate-[4.16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                              />
                              <img
                                [ngSrc]="message.attachmentsDesktop[1]"
                                width="102"
                                height="114"
                                alt=""
                                class="absolute left-[20px] top-[7px] h-[114px] w-[102px] rotate-[6deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                              />
                              <img
                                [ngSrc]="message.attachmentsDesktop[2]"
                                width="102"
                                height="114"
                                alt=""
                                class="absolute left-[34px] top-0 h-[114px] w-[102px] rotate-[16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                              />
                            </div>
                          </div>
                        }
                      }
                    </div>
                  </section>
                }

                @if (isMessageMenuOpen() && isDesktopMessageMenuOpen()) {
                  <section
                    class="fixed z-[150] hidden w-[220px] rounded-[16px] border border-[#F2F2F2] bg-white p-2 shadow-[0_18px_30px_rgba(0,0,0,0.12)] md:block"
                    [style.left.px]="desktopMessageMenuPosition().left"
                    [style.top.px]="desktopMessageMenuPosition().top"
                    aria-label="Message actions"
                    role="dialog"
                    aria-modal="true"
                  >
                    <button
                      type="button"
                      (click)="triggerReplyFromMenu()"
                      class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
                    >
                      <img
                        [ngSrc]="assets.messageMenuReply"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5"
                      />
                      <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Reply</span>
                    </button>

                    <button
                      type="button"
                      (click)="copyMessageFromMenu()"
                      class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
                    >
                      <img
                        [ngSrc]="assets.messageMenuCopy"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5"
                      />
                      <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Copy</span>
                    </button>

                    <button
                      type="button"
                      (click)="startSelectionFromMenu()"
                      class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
                    >
                      <img
                        [ngSrc]="assets.messageMenuDelete"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5"
                      />
                      <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Select messages</span>
                    </button>

                    <button
                      type="button"
                      (click)="deleteMessageFromMenu()"
                      class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
                    >
                      <img
                        [ngSrc]="assets.messageMenuDelete"
                        width="20"
                        height="20"
                        alt=""
                        class="h-5 w-5"
                      />
                      <span class="text-[16px] font-medium leading-5 text-[#FF2524]">Delete</span>
                    </button>
                  </section>
                }
              </div>
            </div>

            <footer class="border-t border-[#EEEEEE] bg-white">
              @if (isReplyComposerOpen()) {
                <div class="flex items-start justify-between border-b border-[#EEEEEE] px-[15px] py-[10px]">
                  <div class="flex min-w-0 items-start gap-[6px]">
                    <span class="mt-0.5 h-[35px] w-px bg-[#6453D9]"></span>
                    <div class="min-w-0">
                      <p class="text-[13px] font-medium leading-4 text-[#6453D9]">
                        Replying to {{ activeReplyTarget()?.author }}
                      </p>
                      <p class="mt-[3px] truncate text-[13px] leading-4 text-[#202020]">
                        {{ activeReplyTarget()?.text }}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="closeReplyComposer()"
                    aria-label="Close reply preview"
                    class="ml-4 flex h-6 w-6 shrink-0 items-center justify-center"
                  >
                    <img
                      [ngSrc]="assets.clearChatClose"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  </button>
                </div>
              }

              <div class="px-[15px] py-[8px]">
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
              </div>
            </footer>
          </section>
        </div>
      </section>
    </div>

    <div
      class="h-full md:hidden"
      (contextmenu)="suppressNativeContextMenu($event)"
      (selectstart)="suppressNativeContextMenu($event)"
      (dragstart)="suppressNativeContextMenu($event)"
    >
      @if (!isMobileConversationOpen()) {
        <section class="px-5 pb-28 pt-0">
          <div class="flex items-center justify-between">
            <h1 class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">Chats</h1>

            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-full bg-[#FAFAFA]"
            >
              <img [ngSrc]="assets.searchMobile" width="20" height="20" alt="" class="h-5 w-5" />
            </button>
          </div>

          <button
            type="button"
            (click)="openStoreSelector()"
            class="mt-6 flex h-12 w-full items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white px-2"
            aria-haspopup="dialog"
            [attr.aria-expanded]="isStoreSelectorOpen()"
          >
            <span class="flex items-center gap-2">
              <span class="relative h-8 w-[68px] shrink-0">
                @if (selectedStore().variant === 'all') {
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
                } @else if (selectedStore().variant === 'store') {
                  <span
                    class="absolute left-0 top-0 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#3D785F]"
                  >
                    <img
                      [ngSrc]="assets.selectorStoreIconMobile"
                      width="21"
                      height="16"
                      alt=""
                      class="h-4 w-[21px]"
                    />
                  </span>
                } @else {
                  <img
                    [ngSrc]="selectedStore().avatar ?? assets.storeSelectorPersonal"
                    width="32"
                    height="32"
                    alt=""
                    class="absolute left-0 top-0 h-8 w-8 rounded-full object-cover"
                  />
                }
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
      <section class="fixed left-0 top-0 z-[95] flex h-dvh w-screen flex-col overflow-hidden bg-white md:hidden">
        <header class="shrink-0 border-b border-[#EAEAEA] bg-white px-4 pt-0">
          @if (isSelectionMode()) {
            <div class="flex items-center justify-between gap-3 py-[14px]">
              <div class="min-w-0 flex-1">
                <p class="truncate text-[20px] font-medium leading-6 text-[#002F35]">
                  {{ selectedMessageCount() }} selected
                </p>
                <p class="mt-1 text-[13px] leading-4 text-[#9C9C9C]">
                  Tap messages to select or unselect them
                </p>
              </div>

              <div class="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  (click)="openDeleteMessagesConfirm()"
                  [disabled]="!selectedMessageCount()"
                  class="rounded-[40px] px-3 py-[10px] text-[14px] font-medium text-[#FF2524] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Delete
                </button>
                <button
                  type="button"
                  (click)="exitSelectionMode()"
                  class="rounded-[40px] px-3 py-[10px] text-[14px] font-medium text-[#1A1B1D]"
                >
                  Cancel
                </button>
              </div>
            </div>
          } @else {
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

              <div class="flex shrink-0 items-center">
                <button type="button" class="rounded-[40px] p-[10px]" aria-label="Search chat">
                  <img [ngSrc]="assets.searchMobile" width="20" height="20" alt="" class="h-5 w-5" />
                </button>

                <button
                  type="button"
                  (click)="openProfileMenu()"
                  class="rounded-[40px] p-[10px]"
                  aria-haspopup="dialog"
                  [attr.aria-expanded]="isProfileMenuOpen()"
                  aria-label="Open chat profile actions"
                >
                  <img [ngSrc]="assets.moreFigma" width="20" height="20" alt="" class="h-5 w-5" />
                </button>
              </div>
            </div>
          }
        </header>

        <div
          class="min-h-0 flex-1 overflow-y-auto px-4 pb-8 pt-6 chats-scrollbar"
          (contextmenu)="suppressNativeContextMenu($event)"
        >
          <div class="space-y-6">
            @for (day of activeConversationDays(); track day.id) {
              <section>
                <p class="text-center text-[12px] leading-4 text-[#6F6F6F]">{{ day.label }}</p>

                <div class="mt-6 space-y-4">
                  @for (message of day.messages; track message.id) {
                    @if (message.kind === 'text') {
                      <div
                        class="flex"
                        [class.justify-end]="message.outgoing"
                      >
                        <div class="max-w-[300px]">
                          @if (message.replyLabel) {
                            <div class="mb-2 flex items-start gap-2">
                              <span class="mt-[2px] h-10 w-px bg-[#E2E2E2]"></span>
                              <p class="text-[12px] leading-4 text-[#6F6F6F]">
                                {{ message.replyLabel }}
                              </p>
                            </div>
                          }

                          <div
                            class="rounded-[24px] px-[14px] py-3"
                            [class.bg-[#6453D9]]="message.outgoing"
                            [class.text-white]="message.outgoing"
                            [class.bg-[#F8F8F8]]="!message.outgoing"
                            [class.text-[#242424]]="!message.outgoing"
                            [class.opacity-30]="message.variant === 'faded'"
                            [class.ring-2]="isMessageSelected(message.id)"
                            [class.ring-[#C8BEFF]]="message.outgoing && isMessageSelected(message.id)"
                            [class.ring-[#6453D9]]="!message.outgoing && isMessageSelected(message.id)"
                            (pointerdown)="onMessageLongPressStart($event, message.id, message.author, message.text)"
                            (pointerup)="onMessageLongPressEnd($event)"
                            (pointercancel)="onMessageLongPressCancel($event)"
                            (contextmenu)="openMessageMenuFromContext($event, message.id, message.author, message.text)"
                            (click)="toggleMessageSelection(message.id)"
                          >
                            <p class="text-[16px] leading-5">
                              {{ message.text }}
                            </p>
                          </div>

                          @if (message.reaction) {
                            <div class="mt-2 flex justify-end">
                              <div class="rounded-[24px] border border-[#F5F5F5] bg-white px-3 py-1 shadow-[0_3px_8px_rgba(216,216,216,0.25)]">
                                <span class="text-[16px] leading-6 text-[#9C9C9C]">{{ message.reaction }}</span>
                              </div>
                            </div>
                          }
                        </div>
                      </div>
                    } @else {
                      <div class="pl-0">
                        <div class="relative h-[138px] w-[157px]">
                          <img
                            [ngSrc]="message.attachmentsMobile[0]"
                            width="102"
                            height="114"
                            alt=""
                            class="absolute left-[14px] top-[11px] h-[114px] w-[102px] -rotate-[4.18deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                          />
                          <img
                            [ngSrc]="message.attachmentsMobile[1]"
                            width="102"
                            height="114"
                            alt=""
                            class="absolute left-[20px] top-[7px] h-[114px] w-[102px] rotate-[6deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                          />
                          <img
                            [ngSrc]="message.attachmentsMobile[2]"
                            width="102"
                            height="114"
                            alt=""
                            class="absolute left-[28px] top-0 h-[114px] w-[102px] rotate-[16deg] rounded-[16px] border border-[#F2F2F2] object-cover shadow-[0_1px_5px_rgba(135,135,135,0.1),0_6px_9px_rgba(135,135,135,0.09),0_13px_12px_rgba(135,135,135,0.05)]"
                          />
                        </div>
                      </div>
                    }
                  }
                </div>
              </section>
            }
          </div>
        </div>

        <footer class="shrink-0 border-t border-[#EEEEEE] bg-white">
          @if (isRecordingVoice()) {
            <div class="px-[15px] py-[8px]">
              <div
                class="mx-auto flex h-[46px] w-full max-w-[350px] items-center rounded-full border border-[#EDEDED] bg-[#F8F8F8] px-[2.4px]"
              >
              <button
                type="button"
                aria-label="Cancel recording"
                (click)="stopVoiceRecording()"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white"
              >
                <img
                  [ngSrc]="assets.recordingCancelMobile"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6 -rotate-45"
                />
              </button>

              <span class="ml-[11px] text-[14px] font-medium leading-5 text-[#FF2524]">
                Recording...
              </span>

              <div class="ml-auto flex items-center gap-2 pr-[14px]">
                <span class="w-[33px] text-[14px] leading-5 text-[#666666]">0:06</span>
                <img
                  [ngSrc]="assets.recordingMicMobile"
                  width="20"
                  height="20"
                  alt=""
                  class="h-5 w-5"
                />
              </div>

              <button
                type="button"
                aria-label="Send voice note"
                (click)="stopVoiceRecording()"
                class="flex h-10 w-[58px] shrink-0 items-center justify-center rounded-full bg-[#6453D9]"
              >
                <img
                  [ngSrc]="assets.recordingSendMobile"
                  width="24"
                  height="24"
                  alt=""
                  class="h-6 w-6"
                />
              </button>
              </div>
            </div>
          } @else {
            @if (isReplyComposerOpen()) {
              <div class="flex items-start justify-between border-b border-[#EEEEEE] px-[7px] py-[7px]">
                <div class="flex min-w-0 items-start gap-[6px]">
                  <span class="mt-[2px] h-[35px] w-px bg-[#6453D9]"></span>
                  <div class="min-w-0">
                    <p class="text-[13px] font-medium leading-4 text-[#6453D9]">
                      Replying to {{ activeReplyTarget()?.author }}
                    </p>
                    <p class="mt-[3px] text-[13px] leading-4 text-[#202020]">
                      {{ activeReplyTarget()?.text }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="closeReplyComposer()"
                  aria-label="Close reply preview"
                  class="ml-3 flex h-6 w-6 shrink-0 items-center justify-center"
                >
                  <img
                    [ngSrc]="assets.clearChatClose"
                    width="24"
                    height="24"
                    alt=""
                    class="h-6 w-6"
                  />
                </button>
              </div>
            }

            <div class="px-[15px] py-[8px]">
            <div class="flex h-[46px] items-center gap-4">
              @if (!hasDraftMessage()) {
                <button type="button" aria-label="Open gallery" class="shrink-0">
                  <img
                    [ngSrc]="assets.galleryMobile"
                    width="24"
                    height="24"
                    alt=""
                    class="h-6 w-6"
                  />
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
                  <button
                    type="button"
                    aria-label="Record voice note"
                    (click)="startVoiceRecording()"
                    class="shrink-0"
                  >
                    <img [ngSrc]="assets.micMobile" width="24" height="24" alt="" class="h-6 w-6" />
                  </button>
                } @else {
                  <button
                    type="button"
                    aria-label="Send message"
                    class="flex h-10 w-[58px] shrink-0 items-center justify-center rounded-full bg-[#6453D9]"
                  >
                    <img
                      [ngSrc]="assets.sendMobile"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  </button>
                }
              </div>
            </div>
            </div>
          }
        </footer>
      </section>
    }

    @if (isProfileMenuOpen()) {
      <section
        class="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(13,13,13,0.18)] md:hidden"
        aria-label="Chat profile actions"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          (click)="closeProfileMenu()"
          aria-label="Close chat profile actions"
          class="absolute inset-0"
        ></button>

        <div class="relative z-[1] w-full rounded-t-[32px] bg-white pb-5">
          <div class="relative h-6 w-full">
            <div
              class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-[100px] bg-[#EBEBEB]"
            ></div>
          </div>

          <div class="absolute right-5 top-5">
            <button
              type="button"
              (click)="closeProfileMenu()"
              aria-label="Close profile menu"
              class="flex h-5 w-5 items-center justify-center"
            >
              <img
                [ngSrc]="assets.profileMenuClose"
                width="14"
                height="14"
                alt=""
                class="h-[14px] w-[14px]"
              />
            </button>
          </div>

          <div class="px-4 pt-5">
            <div class="space-y-2">
              <button
                type="button"
                class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
              >
                <img
                  [ngSrc]="assets.profileMenuEye"
                  width="20"
                  height="20"
                  alt=""
                  class="h-5 w-5"
                />
                <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">View profile</span>
              </button>

              <button
                type="button"
                class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
              >
                <img
                  [ngSrc]="assets.profileMenuFlag"
                  width="20"
                  height="20"
                  alt=""
                  class="h-5 w-5"
                />
                <span class="text-[16px] font-medium leading-5 text-[#FF2524]">Report seller</span>
              </button>

              <button
                type="button"
                (click)="openClearChatConfirm()"
                class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
              >
                <img
                  [ngSrc]="assets.profileMenuTrash"
                  width="20"
                  height="20"
                  alt=""
                  class="h-5 w-5"
                />
                <span class="text-[16px] font-medium leading-5 text-[#FF2524]">Clear chat</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    }

    @if (isMessageMenuOpen()) {
      <button
        type="button"
        (click)="closeMessageMenu()"
        aria-label="Close message actions"
        class="fixed inset-0 z-[149] hidden md:block"
      ></button>
    }

    @if (isMessageMenuOpen()) {
      <section
        class="fixed inset-0 z-[150] flex items-end justify-center bg-[rgba(13,13,13,0.18)] md:hidden"
        aria-label="Message actions"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          (click)="closeMessageMenu()"
          aria-label="Close message actions"
          class="absolute inset-0"
        ></button>

        <div class="relative z-[1] w-full rounded-t-[32px] bg-white px-4 pb-6 pt-7">
          <div
            class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-[100px] bg-[#EBEBEB]"
          ></div>

          <div class="mx-auto w-full max-w-[334px] space-y-2">
            <button
              type="button"
              (click)="triggerReplyFromMenu()"
              class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
            >
              <img [ngSrc]="assets.messageMenuReply" width="20" height="20" alt="" class="h-5 w-5" />
              <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Reply</span>
            </button>

            <button
              type="button"
              (click)="copyMessageFromMenu()"
              class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
            >
              <img [ngSrc]="assets.messageMenuCopy" width="20" height="20" alt="" class="h-5 w-5" />
              <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Copy</span>
            </button>

            <button
              type="button"
              (click)="startSelectionFromMenu()"
              class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
            >
              <img [ngSrc]="assets.messageMenuDelete" width="20" height="20" alt="" class="h-5 w-5" />
              <span class="text-[16px] font-medium leading-5 text-[#1A1B1D]">Select messages</span>
            </button>

            <button
              type="button"
              (click)="deleteMessageFromMenu()"
              class="flex w-full items-center gap-[10px] rounded-[8px] py-3 text-left"
            >
              <img
                [ngSrc]="assets.messageMenuDelete"
                width="20"
                height="20"
                alt=""
                class="h-5 w-5"
              />
              <span class="text-[16px] font-medium leading-5 text-[#FF2524]">Delete</span>
            </button>
          </div>
        </div>
      </section>
    }

    @if (isClearChatConfirmOpen()) {
      <section
        class="fixed inset-0 z-[140] hidden items-center justify-center bg-[rgba(13,13,13,0.18)] px-6 md:flex"
        aria-label="Clear chat confirmation"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          (click)="closeClearChatConfirm()"
          aria-label="Close clear chat confirmation"
          class="absolute inset-0"
        ></button>

        <div
          class="relative z-[1] w-full max-w-[460px] rounded-[36px] bg-white px-8 pb-8 pt-8 shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
        >
          <button
            type="button"
            (click)="closeClearChatConfirm()"
            aria-label="Close clear chat confirmation"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <img
              [ngSrc]="assets.clearChatClose"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>

          <div class="mx-auto max-w-[334px] pt-10 text-center">
            <div class="space-y-3">
              <h2 class="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#15162B]">
                {{ clearChatConfirmTitle() }}
              </h2>
              <p class="text-[14px] leading-[1.5] tracking-[-0.5px] text-[#48484A]">
                {{ clearChatConfirmDescription() }}
              </p>
            </div>

            <div class="mt-10 space-y-3">
              <button
                type="button"
                (click)="confirmClearChat()"
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A]"
              >
                {{ clearChatConfirmActionLabel() }}
              </button>

              <button
                type="button"
                (click)="closeClearChatConfirm()"
                class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F7F7F7] px-8 text-[16px] font-semibold leading-6 text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    }

    @if (isClearChatConfirmOpen()) {
      <section
        class="fixed inset-0 z-[140] flex items-end justify-center bg-[rgba(13,13,13,0.18)] md:hidden"
        aria-label="Clear chat confirmation"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          (click)="closeClearChatConfirm()"
          aria-label="Close clear chat confirmation"
          class="absolute inset-0"
        ></button>

        <div class="relative z-[1] w-full rounded-t-[36px] bg-white pb-9">
          <div class="relative h-6 w-full">
            <div
              class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-[100px] bg-[#EBEBEB]"
            ></div>
          </div>

          <button
            type="button"
            (click)="closeClearChatConfirm()"
            aria-label="Close clear chat confirmation"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <img
              [ngSrc]="assets.clearChatClose"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>

          <div class="mx-auto max-w-[334px] px-4 pt-[71px] text-center">
            <div class="space-y-3">
              <h2 class="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[#15162B]">
                {{ clearChatConfirmTitle() }}
              </h2>
              <p class="text-[14px] leading-[1.5] tracking-[-0.5px] text-[#48484A]">
                {{ clearChatConfirmDescription() }}
              </p>
            </div>

            <div class="mt-10 space-y-3">
              <button
                type="button"
                (click)="confirmClearChat()"
                class="flex h-[52px] w-full items-center justify-center rounded-full border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A]"
              >
                {{ clearChatConfirmActionLabel() }}
              </button>

              <button
                type="button"
                (click)="closeClearChatConfirm()"
                class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F7F7F7] px-8 text-[16px] font-semibold leading-6 text-black"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </section>
    }

    @if (isStoreSelectorOpen()) {
      <section
        class="fixed inset-0 z-[120] flex items-end justify-center bg-[rgba(13,13,13,0.18)] md:hidden"
        aria-label="Select store"
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          (click)="closeStoreSelector()"
          aria-label="Close store selector"
          class="absolute inset-0"
        ></button>

        <div class="relative z-[1] w-full rounded-t-[36px] bg-white px-4 pb-10 pt-20">
          <div
            class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB]"
          ></div>

          <button
            type="button"
            (click)="closeStoreSelector()"
            aria-label="Close store selector"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)]"
          >
            <img
              [ngSrc]="assets.storeSelectorClose"
              width="24"
              height="24"
              alt=""
              class="h-6 w-6"
            />
          </button>

          <label class="flex h-10 items-center gap-2 rounded-full bg-[#FAFAFA] px-3">
            <img [ngSrc]="assets.searchMobile" width="16" height="16" alt="" class="h-4 w-4" />
            <input
              type="text"
              [value]="storeSearchTerm()"
              (input)="updateStoreSearch($event)"
              placeholder="Search stores"
              class="w-full bg-transparent text-[14px] leading-5 text-[#0D0D0D] outline-none placeholder:text-[#777777]"
            />
          </label>

          <div class="mt-4 space-y-4">
            @for (store of filteredStoreOptions(); track store.id) {
              <button
                type="button"
                (click)="selectStore(store.id)"
                class="flex w-full items-center justify-between text-left"
              >
                <span class="flex min-w-0 items-center gap-2">
                  @if (store.variant === 'all') {
                    <span class="relative h-[19px] w-10 shrink-0">
                      <img
                        [ngSrc]="assets.selectorAvatarOne"
                        width="19"
                        height="19"
                        alt=""
                        class="absolute left-0 top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                      />
                      <img
                        [ngSrc]="assets.selectorAvatarTwo"
                        width="19"
                        height="19"
                        alt=""
                        class="absolute left-[7px] top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                      />
                      <img
                        [ngSrc]="assets.selectorAvatarThree"
                        width="19"
                        height="19"
                        alt=""
                        class="absolute left-[14px] top-0 h-[19px] w-[19px] rounded-full border border-white object-cover"
                      />
                      <span
                        class="absolute left-[21px] top-0 flex h-[19px] w-[19px] items-center justify-center overflow-hidden rounded-full border border-white bg-[#3D785F]"
                      >
                        <img
                          [ngSrc]="assets.selectorStoreIconMobile"
                          width="12"
                          height="10"
                          alt=""
                          class="h-[10px] w-3"
                        />
                      </span>
                    </span>

                    <span class="text-[16px] font-medium leading-5 text-[#0D0D0D]">
                      {{ store.label }}
                    </span>
                  } @else {
                    <span
                      class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full"
                      [class.bg-[#3D785F]]="store.id === 'vine'"
                      [class.bg-white]="store.id === 'eden'"
                      [class.bg-[#F3F3F3]]="store.id === 'personal'"
                    >
                      @if (store.id === 'vine') {
                        <img
                          [ngSrc]="assets.selectorStoreIconMobile"
                          width="24"
                          height="18"
                          alt=""
                          class="h-[18px] w-6"
                        />
                      } @else {
                        <img
                          [ngSrc]="store.avatar ?? assets.storeSelectorEden"
                          width="40"
                          height="40"
                          alt=""
                          class="h-10 w-10 object-cover"
                        />
                      }
                    </span>

                    <span class="min-w-0">
                      <span class="block truncate text-[16px] font-medium leading-5 text-[#1A1B1D]">
                        {{ store.label }}
                      </span>
                      <span class="mt-1 block truncate text-[12px] leading-5 text-[#8C8C8C]">
                        {{ store.subtitle }}
                      </span>
                    </span>
                  }
                </span>

                <span class="flex h-6 w-6 shrink-0 items-center justify-center">
                  @if (selectedStoreId() === store.id) {
                    <img
                      [ngSrc]="assets.storeSelectorCheck"
                      width="24"
                      height="24"
                      alt=""
                      class="h-6 w-6"
                    />
                  }
                </span>
              </button>
            }
          </div>
        </div>
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

      .chats-scrollbar {
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        user-select: none;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesPageComponent implements OnDestroy {
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
    clearChatClose: '/assets/icons/chats-clear-chat-close.svg',
    messageMenuCopy: '/assets/icons/chats-message-menu-copy.svg',
    messageMenuDelete: '/assets/icons/chats-message-menu-delete.svg',
    messageMenuReply: '/assets/icons/chats-message-menu-reply.svg',
    moreFigma: '/assets/icons/chats-more-mobile-figma.svg',
    menuDotsMobile: '/assets/icons/store-info-menu-dots.svg',
    profileMenuClose: '/assets/icons/chats-profile-menu-close.svg',
    profileMenuEye: '/assets/icons/chats-profile-menu-eye.svg',
    profileMenuFlag: '/assets/icons/chats-profile-menu-flag.svg',
    profileMenuTrash: '/assets/icons/chats-profile-menu-trash.svg',
    bryanBadgeDesktop: '/assets/icons/chats-bryan-badge-desktop.svg',
    bryanBadgeMobile: '/assets/icons/chats-bryan-badge-mobile.svg',
    micDesktop: '/assets/icons/chats-mic-desktop.svg',
    micMobile: '/assets/icons/chats-mic-mobile.svg',
    recordingCancelMobile: '/assets/icons/chats-recording-cancel-mobile.svg',
    recordingMicMobile: '/assets/icons/chats-recording-mic-mobile.svg',
    recordingSendMobile: '/assets/icons/chats-recording-send-mobile.svg',
    searchDesktop: '/assets/icons/chats-search-desktop.svg',
    searchMobile: '/assets/icons/chats-search-mobile.svg',
    selectorAvatarOne: '/assets/images/chats-store-selector-avatar-1.png',
    selectorAvatarThree: '/assets/images/chats-store-selector-avatar-3.png',
    selectorAvatarTwo: '/assets/images/chats-store-selector-avatar-2.png',
    storeSelectorCheck: '/assets/icons/chats-store-selector-check.svg',
    storeSelectorClose: '/assets/icons/chats-store-selector-close.svg',
    storeSelectorEden: '/assets/images/chats-store-selector-eden.png',
    storeSelectorPersonal: '/assets/images/chats-store-selector-personal.png',
    selectorStoreIconDesktop: '/assets/icons/chats-selector-store-icon-desktop.svg',
    selectorStoreIconMobile: '/assets/icons/chats-selector-store-icon-mobile.svg',
    sendMobile: '/assets/icons/chats-send-mobile.svg',
    storeBadgeMobile: '/assets/images/chats-store-badge-mobile.png',
  } as const;

  readonly isMobileConversationOpen = signal(false);
  readonly isClearChatConfirmOpen = signal(false);
  readonly isMessageMenuOpen = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly activeReplyTarget = signal<ReplyTarget | null>(null);
  readonly messageMenuTarget = signal<MessageMenuTarget | null>(null);
  readonly messageMenuViewport = signal<'desktop' | 'mobile' | null>(null);
  readonly isReplyComposerOpen = computed(() => this.activeReplyTarget() !== null);
  readonly isRecordingVoice = signal(false);
  readonly isStoreSelectorOpen = signal(false);
  readonly activeChatId = signal('2');
  readonly draftMessage = signal('');
  readonly storeSearchTerm = signal('');
  readonly selectedStoreId = signal('all');
  readonly selectedMessageIds = signal<readonly string[]>([]);
  readonly deletedMessageIds = signal<readonly string[]>([]);
  readonly desktopMessageMenuAnchor = signal<{ left: number; top: number } | null>(null);
  readonly deleteIntent = signal<DeleteIntent>('chat');
  readonly isSelectionMode = computed(() => this.selectedMessageIds().length > 0);
  readonly selectedMessageCount = computed(() => this.selectedMessageIds().length);
  readonly clearChatConfirmTitle = computed(() =>
    this.deleteIntent() === 'messages' ? 'Delete selected messages?' : 'Remove this chat?',
  );
  readonly clearChatConfirmDescription = computed(() =>
    this.deleteIntent() === 'messages'
      ? 'This will permanently remove the selected messages from this conversation.'
      : 'This will remove the chat from your inbox and erase the chat history. To stop receiving new messages from this seller, first report this seller, then delete the chat.',
  );
  readonly clearChatConfirmActionLabel = computed(() =>
    this.deleteIntent() === 'messages' ? 'Delete' : 'Remove',
  );
  readonly hasDraftMessage = computed(() => this.draftMessage().trim().length > 0);
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;

  readonly storeOptions: readonly StoreOption[] = [
    { id: 'all', label: 'All stores (4)', variant: 'all' },
    {
      id: 'vine',
      label: 'The Vine Collections',
      subtitle: 'Ikeja, Lagos',
      variant: 'store',
    },
    {
      id: 'eden',
      label: 'Eden Organics',
      subtitle: 'Warri, Delta',
      variant: 'profile',
      avatar: '/assets/images/chats-store-selector-eden.png',
    },
    {
      id: 'personal',
      label: 'Personal profile',
      subtitle: 'Bryan Odjede',
      variant: 'profile',
      avatar: '/assets/images/chats-store-selector-personal.png',
    },
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

  readonly conversationDays = signal<Record<string, readonly ChatDay[]>>({
    '1': this.createMockConversationDays(),
    '2': this.createMockConversationDays(),
    '3': this.createMockConversationDays(),
  });

  readonly selectedStoreLabel = computed(
    () =>
      this.storeOptions.find((store) => store.id === this.selectedStoreId())?.label ??
      'All stores (4)',
  );

  readonly selectedStore = computed(
    () =>
      this.storeOptions.find((store) => store.id === this.selectedStoreId()) ??
      this.storeOptions[0],
  );

  readonly filteredStoreOptions = computed(() => {
    const query = this.storeSearchTerm().trim().toLowerCase();

    if (!query) {
      return this.storeOptions;
    }

    return this.storeOptions.filter((store) =>
      [store.label, store.subtitle]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query)),
    );
  });

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

  readonly activeConversationDays = computed(() => {
    const days = this.conversationDays()[this.activeChatId()] ?? this.createMockConversationDays();

    return days
      .map((day) => ({
        ...day,
        messages: day.messages.filter((message) => !this.isMessageDeleted(message.id)),
      }))
      .filter((day) => day.messages.length > 0);
  });

  protected openMobileConversation(chatId: string): void {
    this.activeChatId.set(chatId);
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.isRecordingVoice.set(false);
    this.isStoreSelectorOpen.set(false);
    this.selectedMessageIds.set([]);
    this.isMobileConversationOpen.set(true);

    if (!this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.openMobileModal();
      this.mobileConversationOverlayOpen = true;
    }
  }

  protected selectDesktopConversation(chatId: string): void {
    this.activeChatId.set(chatId);
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.isRecordingVoice.set(false);
    this.isStoreSelectorOpen.set(false);
    this.selectedMessageIds.set([]);
  }

  protected closeMobileConversation(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.isRecordingVoice.set(false);
    this.selectedMessageIds.set([]);
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

  protected openStoreSelector(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.messageMenuTarget.set(null);
    this.isStoreSelectorOpen.set(true);
  }

  protected openProfileMenu(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isStoreSelectorOpen.set(false);
    this.messageMenuTarget.set(null);
    this.isProfileMenuOpen.set(true);
  }

  protected closeProfileMenu(): void {
    this.isProfileMenuOpen.set(false);
  }

  protected openClearChatConfirm(): void {
    this.deleteIntent.set('chat');
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isStoreSelectorOpen.set(false);
    this.messageMenuTarget.set(null);
    this.isClearChatConfirmOpen.set(true);
  }

  protected closeClearChatConfirm(): void {
    this.isClearChatConfirmOpen.set(false);
    this.deleteIntent.set('chat');
  }

  protected confirmClearChat(): void {
    if (this.deleteIntent() === 'messages') {
      this.deletedMessageIds.update((current) => [
        ...current,
        ...this.selectedMessageIds().filter((messageId) => !current.includes(messageId)),
      ]);
      this.exitSelectionMode();
      this.deleteIntent.set('chat');
      this.isClearChatConfirmOpen.set(false);
      return;
    }

    this.isClearChatConfirmOpen.set(false);
  }

  protected closeReplyComposer(): void {
    this.activeReplyTarget.set(null);
  }

  protected toggleMessageSelection(messageId: string): void {
    if (!this.isSelectionMode()) {
      return;
    }

    this.selectedMessageIds.update((current) =>
      current.includes(messageId)
        ? current.filter((currentMessageId) => currentMessageId !== messageId)
        : [...current, messageId],
    );
  }

  protected enterSelectionMode(messageId: string): void {
    this.closeMessageMenu();
    this.closeProfileMenu();
    this.closeStoreSelector();
    this.activeReplyTarget.set(null);
    this.isRecordingVoice.set(false);
    this.selectedMessageIds.set([messageId]);
  }

  protected exitSelectionMode(): void {
    this.selectedMessageIds.set([]);
  }

  protected openDeleteMessagesConfirm(): void {
    if (!this.selectedMessageIds().length) {
      return;
    }

    this.deleteIntent.set('messages');
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.isStoreSelectorOpen.set(false);
    this.isClearChatConfirmOpen.set(true);
  }

  protected onMessageLongPressStart(
    event: PointerEvent,
    messageId: string,
    author: string,
    text: string,
  ): void {
    this.clearLongPressTimer();
    this.longPressTimer = setTimeout(() => {
      this.openMessageMenu(messageId, author, text, this.resolveMenuAnchorFromTarget(event));
    }, 420);

    (event.currentTarget as HTMLElement | null)?.setPointerCapture(event.pointerId);
  }

  protected openMessageMenuFromContext(
    event: MouseEvent,
    messageId: string,
    author: string,
    text: string,
  ): void {
    event.preventDefault();
    this.clearLongPressTimer();
    this.openMessageMenu(messageId, author, text, { left: event.clientX, top: event.clientY });
  }

  protected onMessageLongPressEnd(event: PointerEvent): void {
    this.clearLongPressTimer();
    (event.currentTarget as HTMLElement | null)?.releasePointerCapture(event.pointerId);
  }

  protected onMessageLongPressCancel(event: PointerEvent): void {
    this.clearLongPressTimer();
    (event.currentTarget as HTMLElement | null)?.releasePointerCapture(event.pointerId);
  }

  protected closeMessageMenu(): void {
    this.isMessageMenuOpen.set(false);
    this.messageMenuTarget.set(null);
    this.desktopMessageMenuAnchor.set(null);
    this.messageMenuViewport.set(null);
  }

  protected triggerReplyFromMenu(): void {
    const target = this.messageMenuTarget();
    if (!target) {
      return;
    }

    this.activeReplyTarget.set({ author: target.author, text: target.text });
    this.closeMessageMenu();
  }

  protected async copyMessageFromMenu(): Promise<void> {
    const target = this.messageMenuTarget();
    if (!target) {
      return;
    }

    try {
      await navigator.clipboard.writeText(target.text);
    } catch {
      // Ignore clipboard errors when browser permissions are unavailable.
    }

    this.closeMessageMenu();
  }

  protected startSelectionFromMenu(): void {
    const target = this.messageMenuTarget();
    if (!target) {
      return;
    }

    this.enterSelectionMode(target.messageId);
  }

  protected deleteMessageFromMenu(): void {
    const target = this.messageMenuTarget();
    if (!target) {
      return;
    }

    this.enterSelectionMode(target.messageId);
    this.openDeleteMessagesConfirm();
  }

  protected isMessageMenuTarget(messageId: string): boolean {
    return this.messageMenuTarget()?.messageId === messageId;
  }

  protected isMessageSelected(messageId: string): boolean {
    return this.selectedMessageIds().includes(messageId);
  }

  protected isMessageDeleted(messageId: string): boolean {
    return this.deletedMessageIds().includes(messageId);
  }

  protected suppressNativeContextMenu(event: Event): void {
    event.preventDefault();
  }

  protected isDesktopMessageMenuOpen(): boolean {
    return this.isMessageMenuOpen() && this.messageMenuViewport() === 'desktop';
  }

  protected desktopMessageMenuPosition(): { left: number; top: number } {
    const anchor = this.desktopMessageMenuAnchor();
    if (!anchor) {
      return { left: 24, top: 180 };
    }

    return {
      left: Math.max(16, Math.min(anchor.left, window.innerWidth - 236)),
      top: Math.max(16, Math.min(anchor.top, window.innerHeight - 220)),
    };
  }

  private createMockConversationDays(): readonly ChatDay[] {
    return [
      {
        id: 'day-1',
        label: '09/01/2026',
        messages: [
          {
            id: 'top-incoming',
            kind: 'text',
            author: 'The Vine Collections',
            text: 'Hi just wanted to confirm, would you still be available for the date?',
            outgoing: false,
          },
          {
            id: 'top-outgoing',
            kind: 'text',
            author: 'You',
            text: 'Hi Mary 👋🏻. Yes, i’m still very active. Totally looking forward to meeting you',
            outgoing: true,
          },
        ],
      },
      {
        id: 'day-2',
        label: 'Today',
        messages: [
          {
            id: 'middle-faded-outgoing',
            kind: 'text',
            author: 'You',
            text: 'Hi Mary 👋🏻. Yes, i’m still very active. Totally looking forward to meeting you',
            outgoing: true,
            variant: 'faded',
            replyLabel: 'Replied to you',
          },
          {
            id: 'middle-incoming',
            kind: 'text',
            author: 'The Vine Collections',
            text: 'nice nice 😁🥰. Can i see some of the pictures or videos',
            outgoing: false,
            reaction: '👍',
          },
          {
            id: 'middle-outgoing',
            kind: 'text',
            author: 'You',
            text: 'Sure, here are some of the pictures.',
            outgoing: true,
          },
          {
            id: 'shared-attachments',
            kind: 'attachments',
            attachmentsDesktop: [
              this.assets.attachmentOneDesktop,
              this.assets.attachmentTwoDesktop,
              this.assets.attachmentThreeDesktop,
            ],
            attachmentsMobile: [
              this.assets.attachmentOneMobile,
              this.assets.attachmentTwoMobile,
              this.assets.attachmentThreeMobile,
            ],
          },
        ],
      },
    ];
  }

  private openMessageMenu(
    messageId: string,
    author: string,
    text: string,
    anchor: { left: number; top: number } | null,
  ): void {
    this.messageMenuTarget.set({ messageId, author, text });
    this.desktopMessageMenuAnchor.set(anchor);
    this.messageMenuViewport.set(window.innerWidth >= 768 ? 'desktop' : 'mobile');
    this.isMessageMenuOpen.set(true);
    this.isProfileMenuOpen.set(false);
    this.isStoreSelectorOpen.set(false);
    this.isClearChatConfirmOpen.set(false);
    this.isRecordingVoice.set(false);
  }

  private resolveMenuAnchorFromTarget(event: PointerEvent): { left: number; top: number } | null {
    const target = event.currentTarget as HTMLElement | null;
    if (!target || !target.isConnected || window.innerWidth < 768) {
      return null;
    }

    const bounds = target.getBoundingClientRect();
    return {
      left: bounds.right - 220,
      top: bounds.top + Math.min(bounds.height / 2, 56),
    };
  }

  private clearLongPressTimer(): void {
    if (this.longPressTimer !== null) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  protected closeStoreSelector(): void {
    this.isStoreSelectorOpen.set(false);
    this.storeSearchTerm.set('');
  }

  protected selectStore(storeId: string): void {
    this.selectedStoreId.set(storeId);
    this.closeStoreSelector();
  }

  protected updateStoreSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.storeSearchTerm.set(input?.value ?? '');
  }

  protected startVoiceRecording(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.messageMenuTarget.set(null);
    this.isRecordingVoice.set(true);
  }

  protected stopVoiceRecording(): void {
    this.isRecordingVoice.set(false);
  }

  ngOnDestroy(): void {
    this.clearLongPressTimer();
    if (this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.closeMobileModal();
      this.mobileConversationOverlayOpen = false;
    }
  }
}
