import { CommonModule, DOCUMENT, NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SellerReportModalComponent } from '../../components/product/seller-report-modal.component';
import { AppToastService } from '../../services/app-toast.service';
import { MobileOverlayService } from '../../services/mobile-overlay.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { ListingsService } from '../../services/listings.service';
import {
  MessageConversationApiItem,
  MessagesResponse,
  MessagesService,
  SellerStoreApiItem,
  SendMessageRequest,
} from '../../services/messages.service';
import { environment } from '../../../environments/environment';
import { WebsocketService, ChatWebsocketConnection } from '../../services/websocket.service';

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
  buyerId?: string;
  vendorId?: string;
  listingId?: string;
}

const EMPTY_CONVERSATION: Conversation = {
  id: '',
  name: '',
  preview: '',
  time: '',
  avatar: '/assets/images/chats-store-selector-personal.png',
  mobileAvatar: '/assets/images/chats-store-selector-personal.png',
  storeBadge: '/assets/images/chats-store-badge-desktop.png',
  mobileStoreBadge: '/assets/images/chats-store-badge-mobile.png',
};

interface MessageDetailsResponse extends Record<string, unknown> {
  listing?: unknown;
  vendor?: unknown;
  results?: readonly Record<string, unknown>[];
  messages?: readonly Record<string, unknown>[];
  data?: readonly Record<string, unknown>[];
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
  messageId?: string;
}

interface MessageMenuTarget extends ReplyTarget {
  messageId: string;
}

type DeleteIntent = 'chat' | 'messages';

type ConversationDetailsLoadOptions = {
  reconnectRealtime?: boolean;
  showLoading?: boolean;
  scrollToBottom?: boolean;
};

type ChatTextMessage = {
  id: string;
  kind: 'text';
  author: string;
  text?: string;
  image?: string;
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
  imports: [CommonModule, NgOptimizedImage, SellerReportModalComponent],
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

          @if (isSeller()) {
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

            <div class="mt-3 min-h-0 flex-1 overflow-y-auto pr-1 chats-scrollbar">
              @if (isLoadingConversations()) {
                <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#6C6C6C]">
                  Loading chats...
                </div>
              } @else if (conversationsError()) {
                <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#D14343]">
                  {{ conversationsError() }}
                </div>
              } @else if (!hasConversations()) {
                <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#6C6C6C]">
                  Your conversations will show up here once you start chatting.
                </div>
              } @else {
                <div class="space-y-1">
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
              }
            </div>
          </aside>

          <section
            class="grid min-h-0 min-w-0 flex-1 grid-rows-[83px_minmax(0,1fr)_auto] overflow-hidden rounded-[16px] border border-[#F1F1F1] bg-white"
          >
            @if (!hasConversations()) {
              <div class="col-span-full row-span-full flex min-h-0 items-center justify-center px-8 text-center text-[16px] text-[#6C6C6C]">
                Select a conversation once chats are available.
              </div>
            } @else {
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
                              (click)="viewActiveConversationProfile()"
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
                              (click)="openSellerReportPage()"
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
              #desktopMessagesScroller
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
                                class="relative rounded-[24px]"
                                [class.px-[18px]]="!!message.text"
                                [class.py-3]="!!message.text"
                                [class.p-1.5]="!message.text"
                                [class.bg-[#6453D9]]="message.outgoing"
                                [class.text-white]="message.outgoing"
                                [class.bg-[#F8F8F8]]="!message.outgoing"
                                [class.text-[#242424]]="!message.outgoing"
                                [class.opacity-30]="message.variant === 'faded'"
                                [class.ring-2]="isMessageSelected(message.id)"
                                [class.ring-white]="message.outgoing && isMessageSelected(message.id)"
                                [class.ring-[#6453D9]]="!message.outgoing && isMessageSelected(message.id)"
                                [class.ring-offset-2]="isMessageSelected(message.id)"
                                [class.ring-offset-[#6453D9]]="
                                  message.outgoing && isMessageSelected(message.id)
                                "
                                [class.ring-offset-white]="!message.outgoing && isMessageSelected(message.id)"
                                [class.shadow-[0_0_0_2px_rgba(100,83,217,0.18)]]="
                                  isMessageSelected(message.id)
                                "
                                (pointerdown)="onMessageLongPressStart($event, message.id, message.author, message.text || '')"
                                (pointerup)="onMessageLongPressEnd($event)"
                                (pointercancel)="onMessageLongPressCancel($event)"
                                (contextmenu)="openMessageMenuFromContext($event, message.id, message.author, message.text || '')"
                                (click)="toggleMessageSelection(message.id)"
                              >
                                @if (isMessageSelected(message.id)) {
                                  <span
                                    class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#6453D9] bg-white text-[13px] font-semibold leading-none text-[#6453D9]"
                                    aria-hidden="true"
                                  >
                                    ✓
                                  </span>
                                }
                                @if (message.image) {
                                  <div class="overflow-hidden rounded-[18px]" [class.mb-2]="!!message.text">
                                    <a [href]="message.image" target="_blank" rel="noopener noreferrer">
                                      <img [src]="message.image" alt="Shared image" class="max-h-[260px] max-w-full rounded-[18px] object-cover transition hover:opacity-90" />
                                    </a>
                                  </div>
                                }
                                @if (message.text) {
                                  <p class="text-[16px] leading-6">
                                    {{ message.text }}
                                  </p>
                                }
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
                <div class="flex items-start justify-between border-b border-[#EEEEEE] px-[15px] py-[8px]">
                  <div class="flex min-w-0 items-start gap-[8px]">
                    <span class="mt-0.5 h-8 w-px shrink-0 bg-[#6453D9]"></span>
                    <div class="min-w-0">
                      <p class="text-[13px] font-medium leading-4 text-[#6453D9]">
                        Replying to {{ activeReplyTarget()?.author }}
                      </p>
                      <p class="mt-1 line-clamp-1 text-[13px] leading-4 text-[#202020]">
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

              @if (selectedImagePreview(); as previewUrl) {
                <div class="flex items-center justify-between border-b border-[#EEEEEE] px-[15px] py-[8px]">
                  <div class="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[#EEEEEE] bg-[#F8F8F8]">
                    <img [src]="previewUrl" alt="Selected preview" class="h-full w-full object-cover" />
                    <button
                      type="button"
                      (click)="clearSelectedImage()"
                      aria-label="Remove image"
                      class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              }

              <div class="px-[15px] py-[8px]">
              <div class="flex min-h-[45px] items-center gap-5">
                <div class="flex items-center gap-3">
                  <button type="button" (click)="triggerImageUpload()" aria-label="Upload image">
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
                  class="relative flex min-h-[45px] min-w-0 flex-1 items-end rounded-[24px] border border-[#EDEDED] bg-[#F8F8F8] px-[13px] py-[6px]"
                >
                  <textarea
                    rows="1"
                    data-chat-draft="true"
                    [value]="draftMessage()"
                    (input)="updateDraftMessage($event)"
                    (keydown)="handleDraftComposerKeydown($event)"
                    placeholder="Type a message..."
                    class="max-h-[112px] w-full resize-none overflow-y-auto bg-transparent pr-10 text-[14px] leading-5 text-[#0D0D0D] outline-none placeholder:text-[rgba(13,13,13,0.4)]"
                  ></textarea>
                  @if (hasDraftMessage()) {
                    <button
                      type="button"
                      (click)="sendDraftMessage()"
                      [disabled]="isSendingMessage()"
                      class="absolute right-[8px] top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#6453D9] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Send message"
                    >
                      <img
                        [ngSrc]="assets.sendMobile"
                        width="18"
                        height="18"
                        alt=""
                        class="h-[18px] w-[18px]"
                      />
                    </button>
                  }
                </div>
              </div>
              <p class="mt-2 pr-1 text-right text-[11px] leading-4 text-[#8C8C92]">
                Press Shift+Enter for new line
              </p>
              </div>
            </footer>
            }
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

          <div [class.mt-6]="isSeller()" [class.mt-4]="!isSeller()">
            @if (isSeller()) {
              <button
                type="button"
                (click)="openStoreSelector()"
                class="flex h-12 w-full items-center justify-between rounded-[32px] border border-[#EAEAEA] bg-white px-2"
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
            }

            <div [class.mt-4]="isSeller()">
            @if (isLoadingConversations()) {
              <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#6C6C6C]">
                Loading chats...
              </div>
            } @else if (conversationsError()) {
              <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#D14343]">
                {{ conversationsError() }}
              </div>
            } @else if (!hasConversations()) {
              <div class="flex min-h-[220px] items-center justify-center text-center text-[14px] text-[#6C6C6C]">
                Your conversations will show up here once you start chatting.
              </div>
            } @else {
              <div class="space-y-1">
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
            }
            </div>
          </div>
        </section>
      }
    </div>

    @if (isMobileConversationOpen()) {
      <section
        class="fixed left-0 top-0 z-[95] flex h-dvh w-screen flex-col overflow-hidden bg-white md:hidden"
        [style.height.px]="mobileViewportHeight()"
        [style.top.px]="mobileViewportOffsetTop()"
      >
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
                  </div>
                </div>
              </div>

              <div class="flex shrink-0 items-center">
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
          #mobileMessagesScroller
          class="min-h-0 flex-1 overscroll-contain overflow-y-auto px-4 pb-8 pt-6 chats-scrollbar"
          (contextmenu)="suppressNativeContextMenu($event)"
          aria-live="polite"
        >
          @if (isLoadingConversationDetails() && activeConversationDays().length === 0) {
            <div class="space-y-5" aria-label="Loading messages">
              <div class="mx-auto h-4 w-20 animate-pulse rounded-full bg-[#EFEFEF]"></div>
              <div class="h-14 w-[72%] animate-pulse rounded-[24px] bg-[#F2F2F2]"></div>
              <div class="ml-auto h-16 w-[68%] animate-pulse rounded-[24px] bg-[#EAE7FF]"></div>
              <div class="h-12 w-[58%] animate-pulse rounded-[24px] bg-[#F2F2F2]"></div>
            </div>
          } @else if (conversationDetailsError()) {
            <div class="flex min-h-full items-center justify-center px-6 text-center">
              <p class="text-[14px] leading-5 text-[#6F6F6F]">
                {{ conversationDetailsError() }}
              </p>
            </div>
          } @else if (activeConversationDays().length === 0) {
            <div class="flex min-h-full items-center justify-center px-6 text-center">
              <p class="text-[14px] leading-5 text-[#6F6F6F]">
                No messages yet. Say hello to start the conversation.
              </p>
            </div>
          } @else {
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
                            class="relative rounded-[24px]"
                            [class.px-[14px]]="!!message.text"
                            [class.py-3]="!!message.text"
                            [class.p-1.5]="!message.text"
                            [class.bg-[#6453D9]]="message.outgoing"
                            [class.text-white]="message.outgoing"
                            [class.bg-[#F8F8F8]]="!message.outgoing"
                            [class.text-[#242424]]="!message.outgoing"
                            [class.opacity-30]="message.variant === 'faded'"
                            [class.ring-2]="isMessageSelected(message.id)"
                            [class.ring-white]="message.outgoing && isMessageSelected(message.id)"
                            [class.ring-[#6453D9]]="!message.outgoing && isMessageSelected(message.id)"
                            [class.ring-offset-2]="isMessageSelected(message.id)"
                            [class.ring-offset-[#6453D9]]="
                              message.outgoing && isMessageSelected(message.id)
                            "
                            [class.ring-offset-white]="!message.outgoing && isMessageSelected(message.id)"
                            [class.shadow-[0_0_0_2px_rgba(100,83,217,0.18)]]="
                              isMessageSelected(message.id)
                            "
                            (pointerdown)="onMessageLongPressStart($event, message.id, message.author, message.text || '')"
                            (pointerup)="onMessageLongPressEnd($event)"
                            (pointercancel)="onMessageLongPressCancel($event)"
                            (contextmenu)="openMessageMenuFromContext($event, message.id, message.author, message.text || '')"
                            (click)="toggleMessageSelection(message.id)"
                          >
                            @if (isMessageSelected(message.id)) {
                              <span
                                class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[#6453D9] bg-white text-[13px] font-semibold leading-none text-[#6453D9]"
                                aria-hidden="true"
                              >
                                ✓
                              </span>
                            }
                            @if (message.image) {
                              <div class="overflow-hidden rounded-[18px]" [class.mb-2]="!!message.text">
                                <a [href]="message.image" target="_blank" rel="noopener noreferrer">
                                  <img [src]="message.image" alt="Shared image" class="max-h-[220px] max-w-full rounded-[18px] object-cover" />
                                </a>
                              </div>
                            }
                            @if (message.text) {
                              <p class="text-[16px] leading-5">
                                {{ message.text }}
                              </p>
                            }
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
          }
        </div>

        <footer class="shrink-0 border-t border-[#EEEEEE] bg-white">
            @if (isReplyComposerOpen()) {
              <div class="flex items-start justify-between border-b border-[#EEEEEE] px-3 py-[6px]">
                <div class="flex min-w-0 items-start gap-[8px]">
                  <span class="mt-[2px] h-8 w-px shrink-0 bg-[#6453D9]"></span>
                  <div class="min-w-0">
                      <p class="text-[13px] font-medium leading-4 text-[#6453D9]">
                      Replying to {{ activeReplyTarget()?.author }}
                    </p>
                    <p class="mt-1 line-clamp-1 text-[13px] leading-4 text-[#202020]">
                      {{ activeReplyTarget()?.text }}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  (click)="closeReplyComposer()"
                  aria-label="Close reply preview"
                  class="ml-2 flex h-6 w-6 shrink-0 items-center justify-center"
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

            @if (selectedImagePreview(); as previewUrl) {
              <div class="flex items-center justify-between border-b border-[#EEEEEE] px-3 py-[6px]">
                <div class="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-lg border border-[#EEEEEE] bg-[#F8F8F8]">
                  <img [src]="previewUrl" alt="Selected preview" class="h-full w-full object-cover" />
                  <button
                    type="button"
                    (click)="clearSelectedImage()"
                    aria-label="Remove image"
                    class="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs"
                  >
                    ×
                  </button>
                </div>
              </div>
            }

            <div class="px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2">
            <div class="flex min-h-[46px] items-end gap-2">
                <button
                  type="button"
                  (click)="triggerImageUpload()"
                  aria-label="Upload image"
                  class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                >
                  <img
                    [ngSrc]="assets.galleryMobile"
                    width="24"
                    height="24"
                    alt=""
                    class="h-6 w-6"
                  />
                </button>

              <div
                class="flex min-h-[46px] min-w-0 flex-1 items-end rounded-[24px] border border-[#EDEDED] bg-[#F8F8F8] py-1 pl-[13px]"
                [class.pr-3]="!hasDraftMessage()"
                [class.pr-1]="hasDraftMessage()"
              >
                <textarea
                  rows="1"
                  data-chat-draft="true"
                  [value]="draftMessage()"
                  (input)="updateDraftMessage($event)"
                  (keydown)="handleDraftComposerKeydown($event)"
                  placeholder="Type a message..."
                  class="max-h-[112px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent py-[9px] text-[16px] leading-5 text-[#2D2D2D] outline-none placeholder:text-[rgba(13,13,13,0.4)]"
                ></textarea>

                @if (hasDraftMessage()) {
                  <button
                    type="button"
                    aria-label="Send message"
                    (click)="sendDraftMessage()"
                    [disabled]="isSendingMessage()"
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#6453D9] disabled:cursor-not-allowed disabled:opacity-50"
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
                (click)="viewActiveConversationProfile()"
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
                (click)="openSellerReportPage()"
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

    <input
      type="file"
      #imageInput
      class="hidden"
      accept="image/*"
      (change)="onImageSelected($event)"
    />

    <app-seller-report-modal
      [open]="isSellerReportModalOpen()"
      [step]="sellerReportStep()"
      [selectedReason]="selectedSellerReportReason()"
      [reasons]="sellerReportReasons"
      [form]="sellerReportForm"
      [isSubmitting]="isSubmittingSellerReport()"
      (closed)="closeSellerReportModal()"
      (back)="backSellerReportStep()"
      (reasonSelected)="selectSellerReportReason($event)"
      (advanced)="advanceSellerReportStep()"
      (submitted)="submitSellerReport()"
    />

    @if (isSellerReportSuccessModalOpen()) {
      <div
        class="fixed inset-0 z-[150] flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] md:items-center md:p-4"
        (click)="closeSellerReportSuccessModal()"
      >
        <div
          class="relative w-full rounded-t-[36px] bg-white px-4 pb-[42px] pt-3 shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)] md:max-w-[550px] md:rounded-[32px] md:px-4 md:pb-10 md:pt-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="seller-report-success-title"
          (click)="$event.stopPropagation()"
        >
          <div class="relative h-6 md:hidden">
            <div class="absolute left-1/2 top-2.5 h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB]"></div>
          </div>

          <button
            type="button"
            (click)="closeSellerReportSuccessModal()"
            class="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white text-[#434455] shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#FAFAFA] md:right-5 md:top-5"
            aria-label="Close seller report success modal"
          >
            <img
              ngSrc="/assets/icons/product-modal/seller-report-close.svg"
              alt=""
              width="24"
              height="24"
              class="h-6 w-6"
            />
          </button>

          <div class="mx-auto mt-10 flex w-full max-w-[334px] flex-col items-center gap-11 md:mt-[65px]">
            <div class="flex w-full flex-col items-center gap-4 text-center">
              <img
                ngSrc="/assets/images/product-modal/seller-report-success-hero.png"
                alt=""
                width="164"
                height="164"
                class="h-[164px] w-[164px] object-contain"
              />

              <div class="space-y-3">
                <h2
                  id="seller-report-success-title"
                  class="text-[24px] font-semibold leading-none text-[#15162B] md:text-[28px]"
                >
                  Thank you for keeping Duduzili safe
                </h2>
                <p class="text-[14px] leading-[1.5] tracking-[-0.5px] text-[#48484A]">
                  Our team will review this report and take the necessary steps.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="closeSellerReportSuccessModal()"
              class="flex h-[52px] w-full items-center justify-center rounded-[64px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5645cb]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly formBuilder = inject(FormBuilder);
  private readonly messagesService = inject(MessagesService);
  private readonly listingsService = inject(ListingsService);
  private readonly appToastService = inject(AppToastService);
  private readonly mobileOverlayService = inject(MobileOverlayService);
  private readonly authSession = inject(AuthSessionService);
  private readonly websocketService = inject(WebsocketService);
  private activeChatConnection: ChatWebsocketConnection | null = null;
  private activeConversationFallbackRefreshTimer: ReturnType<typeof setInterval> | null = null;
  private readonly apiOrigin = new URL(environment.apiUrl).origin;
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
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
  readonly isSeller = this.authSession.isSeller;
  readonly requestedConversationId = computed(
    () => this.queryParamMap().get('conversation')?.trim() ?? '',
  );
  readonly requestedBuyerId = computed(() => this.queryParamMap().get('buyer')?.trim() ?? '');
  readonly requestedVendorId = computed(() => this.queryParamMap().get('store')?.trim() ?? '');
  readonly requestedListingId = computed(() => this.queryParamMap().get('listing')?.trim() ?? '');
  readonly isClearChatConfirmOpen = signal(false);
  readonly isMessageMenuOpen = signal(false);
  readonly isProfileMenuOpen = signal(false);
  readonly activeReplyTarget = signal<ReplyTarget | null>(null);
  readonly messageMenuTarget = signal<MessageMenuTarget | null>(null);
  readonly messageMenuViewport = signal<'desktop' | 'mobile' | null>(null);
  readonly isReplyComposerOpen = computed(() => this.activeReplyTarget() !== null);
  readonly isStoreSelectorOpen = signal(false);
  readonly isSellerReportModalOpen = signal(false);
  readonly isSellerReportSuccessModalOpen = signal(false);
  readonly activeChatId = signal('');
  readonly draftMessage = signal('');
  readonly storeSearchTerm = signal('');
  readonly selectedStoreId = signal('');
  readonly selectedMessageIds = signal<readonly string[]>([]);
  readonly deletedMessageIds = signal<readonly string[]>([]);
  readonly desktopMessageMenuAnchor = signal<{ left: number; top: number } | null>(null);
  readonly deleteIntent = signal<DeleteIntent>('chat');
  readonly isSelectionMode = computed(() => this.selectedMessageIds().length > 0);
  readonly selectedMessageCount = computed(() => this.selectedMessageIds().length);
  readonly isLoadingConversations = signal(true);
  readonly conversationsError = signal<string | null>(null);
  readonly isLoadingConversationDetails = signal(false);
  readonly conversationDetailsError = signal<string | null>(null);
  readonly isSendingMessage = signal(false);
  readonly mobileViewportHeight = signal<number | null>(null);
  readonly mobileViewportOffsetTop = signal(0);
  readonly isDeletingMessages = signal(false);
  readonly isSubmittingSellerReport = signal(false);
  readonly hasConversations = computed(() => this.conversations().length > 0);
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
  readonly hasDraftMessage = computed(() => this.draftMessage().trim().length > 0 || this.selectedImageFile() !== null);
  readonly sellerReportStep = signal<1 | 2>(1);
  readonly selectedSellerReportReason = signal<string | null>(null);
  private longPressTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly mobileMessagesScroller =
    viewChild<ElementRef<HTMLDivElement>>('mobileMessagesScroller');
  private readonly desktopMessagesScroller =
    viewChild<ElementRef<HTMLDivElement>>('desktopMessagesScroller');
  private readonly imageInput =
    viewChild<ElementRef<HTMLInputElement>>('imageInput');
  private readonly browserWindow = this.document.defaultView;

  readonly selectedImageFile = signal<File | null>(null);
  readonly selectedImagePreview = signal<string | null>(null);
  private readonly updateMobileViewportHeight = (): void => {
    const viewportHeight =
      this.browserWindow?.visualViewport?.height ?? this.browserWindow?.innerHeight ?? null;
    this.mobileViewportHeight.set(viewportHeight);
    this.mobileViewportOffsetTop.set(this.browserWindow?.visualViewport?.offsetTop ?? 0);
  };

  readonly storeOptions = signal<readonly StoreOption[]>([]);

  readonly conversations = signal<Conversation[]>([]);
  readonly conversationVendorIds = signal<Record<string, string>>({});

  readonly conversationDays = signal<Record<string, readonly ChatDay[]>>({});
  readonly sellerReportForm = this.formBuilder.nonNullable.group({
    details: [''],
  });
  readonly sellerReportReasons = [
    'Suspected scam or fraud',
    'Seller is unresponsive after payment',
    'Selling prohibited or illegal items',
    'Repeatedly listing sold/unavailable items',
    'Other reason',
  ] as const;

  readonly selectedStoreLabel = computed(
    () =>
      this.storeOptions().find((store) => store.id === this.selectedStoreId())?.label ??
      'Select store',
  );

  readonly selectedStore = computed(
    () =>
      this.storeOptions().find((store) => store.id === this.selectedStoreId()) ??
      this.storeOptions()[0] ??
      { id: '', label: 'Select store', variant: 'store' as const },
  );

  readonly filteredStoreOptions = computed(() => {
    const query = this.storeSearchTerm().trim().toLowerCase();
    const storeOptions = this.storeOptions();

    if (!query) {
      return storeOptions;
    }

    return storeOptions.filter((store) =>
      [store.label, store.subtitle]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLowerCase().includes(query)),
    );
  });

  readonly activeDesktopConversation = computed(
    () =>
      this.conversations().find((conversation) => conversation.id === this.activeChatId()) ??
      this.conversations()[0] ??
      EMPTY_CONVERSATION,
  );

  readonly activeMobileConversation = computed(
    () =>
      this.conversations().find((conversation) => conversation.id === this.activeChatId()) ??
      this.conversations()[0] ??
      EMPTY_CONVERSATION,
  );

  readonly activeConversationDays = computed(() => {
    const days = this.conversationDays()[this.activeChatId()] ?? [];

    return days
      .map((day) => ({
        ...day,
        messages: day.messages.filter((message) => !this.isMessageDeleted(message.id)),
      }))
      .filter((day) => day.messages.length > 0);
  });

  constructor() {
    this.updateMobileViewportHeight();
    this.browserWindow?.visualViewport?.addEventListener(
      'resize',
      this.updateMobileViewportHeight,
    );
    this.browserWindow?.visualViewport?.addEventListener(
      'scroll',
      this.updateMobileViewportHeight,
    );
    this.browserWindow?.addEventListener('orientationchange', this.updateMobileViewportHeight);
    void this.initializePage();
  }

  protected openMobileConversation(chatId: string): void {
    this.activeChatId.set(chatId);
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.isStoreSelectorOpen.set(false);
    this.selectedMessageIds.set([]);
    this.clearSelectedImage();
    this.isMobileConversationOpen.set(true);

    if (!this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.openMobileModal();
      this.mobileConversationOverlayOpen = true;
    }

    this.scrollMessagesToBottom();
    void this.loadConversationDetails(chatId);
  }

  private async initializePage(): Promise<void> {
    if (this.isSeller()) {
      await this.loadSellerStores();
      return;
    }

    await this.loadBuyerConversations();
  }

  private async loadSellerStores(): Promise<void> {
    this.isLoadingConversations.set(true);
    this.conversationsError.set(null);

    try {
      const response = await firstValueFrom(this.messagesService.getSellerStores());
      const mappedStores = response
        .map((item, index) => this.toStoreOption(item, index))
        .filter((store): store is StoreOption => store !== null);
      const allStoresOption: StoreOption = {
        id: 'all',
        label: `All stores (${mappedStores.length})`,
        variant: 'all',
      };
      const selectableStores = [allStoresOption, ...mappedStores];

      this.storeOptions.set(selectableStores);

      const initialStoreId = selectableStores[0]?.id ?? '';
      this.selectedStoreId.set(initialStoreId);

      if (initialStoreId) {
        if (initialStoreId === 'all') {
          await this.loadSellerInboxConversations();
        } else {
          await this.loadSellerStoreConversations(initialStoreId);
        }
        return;
      }

      this.conversations.set([]);
      this.activeChatId.set('');
    } catch {
      this.conversations.set([]);
      this.activeChatId.set('');
      this.conversationsError.set('Your chats aren’t available right now. Please try again shortly.');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  private async loadBuyerConversations(): Promise<void> {
    this.isLoadingConversations.set(true);
    this.conversationsError.set(null);

    try {
      const response = await firstValueFrom(this.messagesService.getMessages());
      await this.applyConversationsResponse(response);
    } catch {
      this.conversations.set([]);
      this.activeChatId.set('');
      this.conversationsError.set('Your chats aren’t available right now. Please try again shortly.');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  private async loadSellerInboxConversations(): Promise<void> {
    this.isLoadingConversations.set(true);
    this.conversationsError.set(null);

    try {
      const response = await firstValueFrom(this.messagesService.getVendorInbox());
      await this.applyConversationsResponse(response);
    } catch {
      this.conversations.set([]);
      this.activeChatId.set('');
      this.conversationsError.set('Your chats aren’t available right now. Please try again shortly.');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  private async loadSellerStoreConversations(storeId: string): Promise<void> {
    this.isLoadingConversations.set(true);
    this.conversationsError.set(null);

    try {
      const response = await firstValueFrom(this.messagesService.getSellerStoreConversations(storeId));
      await this.applyConversationsResponse(response);
    } catch {
      this.conversations.set([]);
      this.activeChatId.set('');
      this.conversationsError.set('Your chats aren’t available right now. Please try again shortly.');
    } finally {
      this.isLoadingConversations.set(false);
    }
  }

  private async applyConversationsResponse(response: MessagesResponse): Promise<void> {
    const items = this.extractConversationItems(response);
    const mappedConversations = items
      .map((item, index) => this.toConversation(item, index))
      .filter((conversation): conversation is Conversation => conversation !== null);

    this.conversations.set(mappedConversations);

    if (mappedConversations.length === 0) {
      this.activeChatId.set('');
      return;
    }

    const requestedConversationId = this.requestedConversationId();
    const requestedBuyerId = this.requestedBuyerId();
    const requestedVendorId = this.requestedVendorId();
    const requestedListingId = this.requestedListingId();
    const currentActiveChatId = this.activeChatId();
    const requestedContextConversationId =
      requestedConversationId.length === 0
        ? mappedConversations.find((conversation) => {
            const matchesBuyer =
              requestedBuyerId.length === 0 || conversation.buyerId === requestedBuyerId;
            const matchesVendor =
              requestedVendorId.length === 0 || conversation.vendorId === requestedVendorId;
            const matchesListing =
              requestedListingId.length === 0 || conversation.listingId === requestedListingId;

            return matchesBuyer && matchesVendor && matchesListing;
          })?.id ?? ''
        : '';
    const nextActiveChatId = mappedConversations.some((conversation) => conversation.id === requestedConversationId)
      ? requestedConversationId
      : mappedConversations.some(
            (conversation) => conversation.id === requestedContextConversationId,
          )
        ? requestedContextConversationId
      : mappedConversations.some((conversation) => conversation.id === currentActiveChatId)
        ? currentActiveChatId
        : mappedConversations[0].id;
    this.activeChatId.set(nextActiveChatId);

    const isSpecificChatRequested =
      (requestedConversationId.length > 0 && mappedConversations.some((conversation) => conversation.id === requestedConversationId)) ||
      (requestedContextConversationId.length > 0 && mappedConversations.some((conversation) => conversation.id === requestedContextConversationId));

    if (isSpecificChatRequested) {
      this.isMobileConversationOpen.set(true);
      if (!this.mobileConversationOverlayOpen) {
        this.mobileOverlayService.openMobileModal();
        this.mobileConversationOverlayOpen = true;
      }
      this.scrollMessagesToBottom();
    }

    await this.loadConversationDetails(nextActiveChatId);
  }

  private extractConversationItems(response: MessagesResponse): MessageConversationApiItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.messages)) {
      return response.messages;
    }

    if (Array.isArray(response.conversations)) {
      return response.conversations;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  private toConversation(item: MessageConversationApiItem, index: number): Conversation | null {
    const id = this.readId(item['id']) ?? this.readId(item['chat_id']) ?? `conversation-${index + 1}`;
    const buyer = this.readRecord(item['buyer']);
    const lastMessage = this.readRecord(item['last_message']);
    const buyerName =
      this.readString(buyer?.['full_name']) ??
      this.readString(buyer?.['username']) ??
      this.readString(this.readRecord(item['other_user'])?.['full_name']) ??
      this.readString(this.readRecord(item['other_user'])?.['username']) ??
      this.readString(this.readRecord(item['user'])?.['full_name']) ??
      this.readString(this.readRecord(item['user'])?.['username']);
    const vendorName =
      this.readString(item['vendor_name']) ??
      this.readString(item['name']) ??
      this.readString(item['title']) ??
      this.readString(item['other_user_name']);
    const name = this.isSeller() ? buyerName ?? vendorName : vendorName ?? buyerName;
    const preview =
      this.readString(this.readRecord(item['last_message'])?.['body']) ??
      this.readString(item['preview']) ??
      this.readString(item['last_message']) ??
      this.readString(item['last_message_text']) ??
      this.readString(item['body']) ??
      'Start a conversation';

    if (!name) {
      return null;
    }

    const buyerAvatar =
      this.resolveMediaUrl(
        this.readString(buyer?.['avatar']) ??
          this.readString(this.readRecord(item['other_user'])?.['avatar']) ??
          this.readString(this.readRecord(item['user'])?.['avatar']),
      ) ?? '/assets/images/chats-store-selector-personal.png';
    const vendorAvatar =
      this.resolveMediaUrl(
        this.readString(item['vendor_photo']) ??
          this.readString(item['avatar']) ??
          this.readString(item['mobile_avatar']),
      ) ?? buyerAvatar;

    return {
      id,
      name,
      preview,
      time:
        this.relativeTimeFromDate(
          this.readString(item['updated_at']) ??
            this.readString(lastMessage?.['created_at']) ??
            this.readString(item['created_at']) ??
            this.readString(item['last_message_at']),
        ) ?? 'Recently',
      unreadCount: this.readNumber(item['unread_count']) ?? undefined,
      avatar: this.isSeller() ? buyerAvatar : vendorAvatar,
      mobileAvatar: this.isSeller() ? buyerAvatar : vendorAvatar,
      storeBadge:
        this.resolveMediaUrl(this.readString(item['store_badge'])) ??
        '/assets/images/chats-store-badge-desktop.png',
      mobileStoreBadge:
        this.resolveMediaUrl(this.readString(item['mobile_store_badge']) ?? this.readString(item['store_badge'])) ??
        '/assets/images/chats-store-badge-mobile.png',
      buyerId: this.readId(buyer?.['id']) ?? undefined,
      vendorId: this.readId(item['vendor']) ?? undefined,
      listingId: this.readId(item['listing']) ?? undefined,
    };
  }

  private resolveActiveConversation(): Conversation | null {
    const activeConversationId = this.activeChatId();

    if (activeConversationId) {
      const matchedConversation = this.conversations().find((conversation) => conversation.id === activeConversationId);
      if (matchedConversation) {
        return matchedConversation;
      }
    }

    return this.conversations()[0] ?? null;
  }

  private resetSellerReportFlow(): void {
    this.sellerReportStep.set(1);
    this.selectedSellerReportReason.set(null);
    this.sellerReportForm.reset({ details: '' });
  }

  private toSellerReportReason(reason: string | null): string | null {
    switch (reason) {
      case 'Suspected scam or fraud':
        return 'scam';
      case 'Seller is unresponsive after payment':
        return 'unresponsive';
      case 'Selling prohibited or illegal items':
        return 'prohibited';
      case 'Repeatedly listing sold/unavailable items':
        return 'spam';
      case 'Other reason':
        return 'other';
      default:
        return null;
    }
  }

  private toStoreOption(item: SellerStoreApiItem, index: number): StoreOption | null {
    const id = this.readId(item['id']) ?? `store-${index + 1}`;
    const label =
      this.readString(item['store_name']) ??
      this.readString(item['name']) ??
      this.readString(item['title']);

    if (!label) {
      return null;
    }

    const subtitle =
      this.readString(item['location']) ??
      this.composeLocationFromRecord(item) ??
      undefined;
    const avatar =
      this.resolveMediaUrl(
        this.readString(item['profile_photo']) ??
          this.readString(item['avatar']) ??
          this.readString(item['cover_image']),
      ) ?? undefined;

    return {
      id,
      label,
      subtitle,
      variant: avatar ? 'profile' : 'store',
      avatar,
    };
  }

  private async loadConversationDetails(
    chatId: string,
    options: ConversationDetailsLoadOptions = {},
  ): Promise<void> {
    const reconnectRealtime = options.reconnectRealtime ?? true;
    const showLoading = options.showLoading ?? true;
    const scrollToBottom = options.scrollToBottom ?? true;

    if (reconnectRealtime) {
      this.clearActiveConversationFallbackRefresh();
      if (this.activeChatConnection) {
        this.activeChatConnection.close();
        this.activeChatConnection = null;
      }
    }

    if (showLoading) {
      this.isLoadingConversationDetails.set(true);
      this.conversationDetailsError.set(null);
    }

    try {
      const response = await firstValueFrom(this.messagesService.getMessageDetails(chatId));
      const vendorId = this.readId(response['vendor']);
      const mappedDays = this.toConversationDays(response);

      if (vendorId) {
        this.conversationVendorIds.update((current) => ({
          ...current,
          [chatId]: vendorId,
        }));
      }

      this.conversationDays.update((current) => ({
        ...current,
        [chatId]: mappedDays,
      }));

      this.conversations.update((items) =>
        items.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                unreadCount: undefined,
              }
            : conversation,
        ),
      );
      if (scrollToBottom) {
        this.scrollMessagesToBottom();
      }

      if (reconnectRealtime) {
        this.connectRealtimeChat(chatId);
      }
    } catch {
      if (showLoading) {
        this.conversationDetailsError.set(
          'This conversation could not be loaded right now. Please try again.',
        );
      }
    } finally {
      if (showLoading) {
        this.isLoadingConversationDetails.set(false);
      }
    }
  }

  private connectRealtimeChat(chatId: string): void {
    const connection = this.websocketService.connectChat(chatId);
    this.activeChatConnection = connection;

    connection.messages$.subscribe({
      next: (data) => this.handleWebsocketMessage(chatId, data),
      error: () => {
        if (this.activeChatConnection === connection) {
          this.activeChatConnection = null;
          this.startActiveConversationFallbackRefresh(chatId);
        }
      },
      complete: () => {
        if (this.activeChatConnection === connection) {
          this.activeChatConnection = null;
          this.startActiveConversationFallbackRefresh(chatId);
        }
      },
    });

    connection.read();
  }

  private startActiveConversationFallbackRefresh(chatId: string): void {
    if (this.activeConversationFallbackRefreshTimer) {
      return;
    }

    this.activeConversationFallbackRefreshTimer = setInterval(() => {
      if (this.activeChatId() !== chatId) {
        this.clearActiveConversationFallbackRefresh();
        return;
      }

      void this.loadConversationDetails(chatId, {
        reconnectRealtime: false,
        showLoading: false,
        scrollToBottom: this.isActiveConversationNearBottom(),
      });
    }, 5000);
  }

  private clearActiveConversationFallbackRefresh(): void {
    if (!this.activeConversationFallbackRefreshTimer) {
      return;
    }

    clearInterval(this.activeConversationFallbackRefreshTimer);
    this.activeConversationFallbackRefreshTimer = null;
  }

  private handleWebsocketMessage(chatId: string, data: any): void {
    if (chatId !== this.activeChatId()) {
      return;
    }

    if (data.type === 'message') {
      const sender = data.sender || 'Unknown';
      const body = data.body || '';
      const imageUrl = this.resolveMediaUrl(this.readString(data.image));
      const messageId = data.message_id ? String(data.message_id) : `ws-${Date.now()}`;
      const senderId = this.readId(data.sender_id);
      const currentUserId = this.authSession.user()?.id;
      const outgoing = currentUserId !== undefined && senderId !== null ? String(currentUserId) === senderId : false;

      const currentDays = this.conversationDays()[chatId] ?? [];
      const messageExists = currentDays.some((day) =>
        day.messages.some((msg) => msg.id === messageId),
      );
      const shouldScrollAfterMessage = outgoing || this.isActiveConversationNearBottom();

      if (messageExists) {
        return;
      }

      const nextMessage: ChatTextMessage = {
        id: messageId,
        kind: 'text',
        author: outgoing ? 'You' : sender,
        text: body || undefined,
        image: imageUrl ?? undefined,
        outgoing,
      };

      if (currentDays.length === 0) {
        this.conversationDays.update((current) => ({
          ...current,
          [chatId]: [
            {
              id: `day-${Date.now()}`,
              label: 'Today',
              messages: [nextMessage],
            },
          ],
        }));
      } else {
        const lastDay = currentDays[currentDays.length - 1];
        const updatedDays = [
          ...currentDays.slice(0, -1),
          {
            ...lastDay,
            messages: [...lastDay.messages, nextMessage],
          },
        ];

        this.conversationDays.update((current) => ({
          ...current,
          [chatId]: updatedDays,
        }));
      }

      this.conversations.update((items) =>
        items.map((conversation) =>
          conversation.id === chatId
            ? {
                ...conversation,
                preview: body || 'Sent an image',
                time: 'Just now',
              }
            : conversation,
        ),
      );
      if (shouldScrollAfterMessage) {
        this.scrollMessagesToBottom();
      }
    }
  }

  private toConversationDays(response: MessageDetailsResponse): readonly ChatDay[] {
    const records = this.extractConversationDetailItems(response);
    if (records.length === 0) {
      return [];
    }

    const daysByLabel = new Map<string, ChatMessage[]>();

    for (const record of records) {
      const createdAt = this.readString(record['created_at']) ?? this.readString(record['timestamp']);
      const label = this.formatConversationDayLabel(createdAt);
      const sender = this.readString(record['sender']) ?? this.readString(record['author']) ?? 'Unknown';
      const body = this.readString(record['body']) ?? this.readString(record['text']) ?? this.readString(record['message']);
      const imageUrl = this.resolveMediaUrl(this.readString(record['image']));

      if (!body && !imageUrl) {
        continue;
      }

      const message: ChatTextMessage = {
        id: this.readId(record['id']) ?? `${label}-${daysByLabel.get(label)?.length ?? 0}`,
        kind: 'text',
        author: sender,
        text: body ?? undefined,
        image: imageUrl ?? undefined,
        outgoing: this.isOutgoingMessage(record, sender),
      };

      daysByLabel.set(label, [...(daysByLabel.get(label) ?? []), message]);
    }

    return Array.from(daysByLabel.entries()).map(([label, messages], index) => ({
      id: `day-${index + 1}`,
      label,
      messages,
    }));
  }

  private extractConversationDetailItems(response: MessageDetailsResponse): readonly Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.results)) {
      return response.results;
    }

    if (Array.isArray(response.messages)) {
      return response.messages;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    if (this.readString(response['body']) || this.readString(response['text']) || this.readString(response['message'])) {
      return [response];
    }

    return [];
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readId(value: unknown): string | null {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }

    const record = this.readRecord(value);
    if (record) {
      return (
        this.readId(record['id']) ??
        this.readId(record['pk']) ??
        this.readId(record['listing_id']) ??
        null
      );
    }

    return null;
  }

  private readNumber(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : null;
  }

  private composeLocationFromRecord(record: Record<string, unknown>): string | null {
    const city = this.readString(record['city']);
    const state = this.readString(record['state']);

    if (city && state) {
      return `${city}, ${state}`;
    }

    return city ?? state ?? null;
  }

  private isOutgoingMessage(record: Record<string, unknown>, sender: string): boolean {
    const explicitOutgoing = record['outgoing'];
    if (typeof explicitOutgoing === 'boolean') {
      return explicitOutgoing;
    }

    const currentUser = this.authSession.user();
    const authUsername = this.readString(currentUser?.username);
    const authUserId = currentUser?.id;
    const senderId = this.readNumber(record['sender_id']) ?? this.readNumber(this.readRecord(record['sender'])?.['id']);
    const senderUsername =
      this.readString(record['sender']) ??
      this.readString(record['author']) ??
      this.readString(this.readRecord(record['sender'])?.['username']) ??
      sender;

    if (typeof authUserId === 'number' && typeof senderId === 'number' && authUserId === senderId) {
      return true;
    }

    if (authUsername && senderUsername.toLowerCase() === authUsername.toLowerCase()) {
      return true;
    }

    return false;
  }

  private relativeTimeFromDate(value: string | null): string | null {
    if (!value) {
      return null;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return null;
    }

    const diffMilliseconds = Date.now() - parsedDate.getTime();
    const diffMinutes = Math.max(1, Math.floor(diffMilliseconds / (1000 * 60)));

    if (diffMinutes < 60) {
      return `${diffMinutes} min${diffMinutes === 1 ? '' : 's'} ago`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `${diffHours} hr${diffHours === 1 ? '' : 's'}`;
    }

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) {
      return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    return parsedDate.toLocaleDateString('en-NG', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private formatConversationDayLabel(value: string | null): string {
    if (!value) {
      return 'Today';
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
      return 'Today';
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const target = new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate()).getTime();
    const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    }

    if (diffDays === -1) {
      return 'Yesterday';
    }

    return parsedDate.toLocaleDateString('en-NG', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private resolveMediaUrl(value: string | null): string | null {
    if (!value) {
      return null;
    }

    if (/^(?:https?:)?\/\//.test(value) || value.startsWith('data:')) {
      return value;
    }

    const normalizedValue = value.startsWith('/') ? value : `/${value}`;
    return `${this.apiOrigin}${normalizedValue}`;
  }

  protected selectDesktopConversation(chatId: string): void {
    this.activeChatId.set(chatId);
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.isStoreSelectorOpen.set(false);
    this.selectedMessageIds.set([]);
    this.clearSelectedImage();
    void this.loadConversationDetails(chatId);
  }

  protected closeMobileConversation(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.deleteIntent.set('chat');
    this.messageMenuTarget.set(null);
    this.activeReplyTarget.set(null);
    this.selectedMessageIds.set([]);
    this.isMobileConversationOpen.set(false);

    if (this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.closeMobileModal();
      this.mobileConversationOverlayOpen = false;
    }
  }

  protected updateDraftMessage(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement | null;
    this.draftMessage.set(input?.value ?? '');
    this.resizeDraftComposer(input);
  }

  protected handleDraftComposerKeydown(event: KeyboardEvent): void {
    if (
      event.key === 'Enter' &&
      !event.shiftKey &&
      !event.altKey &&
      !event.ctrlKey &&
      !event.metaKey
    ) {
      event.preventDefault();
      void this.sendDraftMessage();
    }
  }

  protected async sendDraftMessage(): Promise<void> {
    const chatId = this.activeChatId();
    const body = this.draftMessage().trim();
    const imageFile = this.selectedImageFile();
    const localImagePreview = imageFile ? this.selectedImagePreview() : null;
    const optimisticMessageId = imageFile ? `local-${Date.now()}` : null;

    if (!chatId || (!body && !imageFile) || this.isSendingMessage()) {
      return;
    }

    this.isSendingMessage.set(true);

    let payload: SendMessageRequest | FormData;
    if (imageFile) {
      const formData = new FormData();
      if (body) {
        formData.append('body', body);
      }
      formData.append('image', imageFile);
      payload = formData;
    } else {
      payload = { body };
    }

    if (imageFile && optimisticMessageId) {
      this.appendOutgoingMessage(
        chatId,
        body,
        localImagePreview ?? undefined,
        optimisticMessageId,
        'faded',
      );
      this.draftMessage.set('');
      this.selectedImageFile.set(null);
      this.selectedImagePreview.set(null);
      this.activeReplyTarget.set(null);
      this.resetDraftComposerHeights();
      this.scrollMessagesToBottom();
    }

    try {
      const response = await firstValueFrom(this.messagesService.sendMessage(chatId, payload));
      const responseId = this.readId(response['id']) || `local-${Date.now()}`;
      const responseImage = this.readString(response['image']);
      const imageUrl = responseImage ? this.resolveMediaUrl(responseImage) : undefined;
      const responseBody = this.readString(response['body']) || '';

      if (optimisticMessageId) {
        if (this.messageExists(chatId, responseId)) {
          this.removeMessage(chatId, optimisticMessageId);
        } else {
          this.replaceMessage(chatId, optimisticMessageId, {
            id: responseId,
            text: responseBody || undefined,
            image: imageUrl || localImagePreview || undefined,
            variant: undefined,
          });
        }
      } else {
        this.appendOutgoingMessage(chatId, responseBody, imageUrl || undefined, responseId);
        this.draftMessage.set('');
        this.clearSelectedImage();
      }
      if (localImagePreview?.startsWith('blob:') && imageUrl) {
        URL.revokeObjectURL(localImagePreview);
      }
      this.activeReplyTarget.set(null);
      this.resetDraftComposerHeights();
      this.scrollMessagesToBottom();
    } catch {
      if (optimisticMessageId) {
        this.removeMessage(chatId, optimisticMessageId);
      }
      if (localImagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(localImagePreview);
      }
      this.appToastService.show({
        message: 'Your message could not be sent. Please try again.',
      });
    } finally {
      this.isSendingMessage.set(false);
    }
  }

  private resizeDraftComposer(element: HTMLInputElement | HTMLTextAreaElement | null): void {
    if (!(element instanceof HTMLTextAreaElement)) {
      return;
    }

    element.style.height = 'auto';
    element.style.height = `${Math.min(element.scrollHeight, 112)}px`;
  }

  private resetDraftComposerHeights(): void {
    const draftFields = this.document.querySelectorAll<HTMLTextAreaElement>('textarea[data-chat-draft="true"]');

    draftFields.forEach((field) => {
      field.style.height = 'auto';
    });
  }

  protected triggerImageUpload(): void {
    this.imageInput()?.nativeElement.click();
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.appToastService.show({ message: 'Please select an image file.' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.appToastService.show({ message: 'Image size should not exceed 10MB.' });
      return;
    }

    const currentPreview = this.selectedImagePreview();
    if (currentPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }

    this.selectedImageFile.set(file);
    this.selectedImagePreview.set(URL.createObjectURL(file));
    
    input.value = '';
  }

  protected clearSelectedImage(): void {
    const currentPreview = this.selectedImagePreview();
    if (currentPreview?.startsWith('blob:')) {
      URL.revokeObjectURL(currentPreview);
    }

    this.selectedImageFile.set(null);
    this.selectedImagePreview.set(null);
  }

  private focusDraftComposer(): void {
    globalThis.setTimeout(() => {
      const draftFields = Array.from(
        this.document.querySelectorAll<HTMLTextAreaElement>('textarea[data-chat-draft="true"]'),
      );
      const activeField =
        draftFields.find((field) => field.offsetParent !== null) ?? draftFields[0] ?? null;

      if (!activeField) {
        return;
      }

      activeField.focus();
      const length = activeField.value.length;
      activeField.setSelectionRange(length, length);
      this.resizeDraftComposer(activeField);
      this.scrollMessagesToBottom();
    }, 0);
  }

  private scrollMessagesToBottom(): void {
    this.browserWindow?.requestAnimationFrame(() => {
      this.browserWindow?.requestAnimationFrame(() => {
        this.scrollElementToBottom(this.desktopMessagesScroller()?.nativeElement ?? null);
        this.scrollElementToBottom(this.mobileMessagesScroller()?.nativeElement ?? null);
      });
    });
  }

  private scrollElementToBottom(element: HTMLElement | null): void {
    if (!element) {
      return;
    }

    element.scrollTop = element.scrollHeight;
  }

  private isActiveConversationNearBottom(): boolean {
    const scrollers: readonly (HTMLElement | null)[] = [
      this.desktopMessagesScroller()?.nativeElement ?? null,
      this.mobileMessagesScroller()?.nativeElement ?? null,
    ];

    return scrollers
      .filter((element): element is HTMLElement => element !== null)
      .some((element) => this.isElementNearBottom(element));
  }

  private isElementNearBottom(element: HTMLElement): boolean {
    const remainingScroll = element.scrollHeight - element.scrollTop - element.clientHeight;
    return remainingScroll <= 120;
  }

  protected openStoreSelector(): void {
    this.isClearChatConfirmOpen.set(false);
    this.isMessageMenuOpen.set(false);
    this.isProfileMenuOpen.set(false);
    this.messageMenuTarget.set(null);
    this.isStoreSelectorOpen.set(true);
  }

  private appendOutgoingMessage(
    chatId: string,
    body: string,
    imageUrl?: string,
    messageId?: string,
    variant?: ChatTextMessage['variant'],
  ): void {
    const resolvedMessageId = messageId || `local-${Date.now()}`;
    const currentDays = this.conversationDays()[chatId] ?? [];

    if (this.messageExists(chatId, resolvedMessageId)) {
      return;
    }

    const nextMessage: ChatTextMessage = {
      id: resolvedMessageId,
      kind: 'text',
      author: 'You',
      text: body || undefined,
      image: imageUrl || undefined,
      outgoing: true,
      variant,
    };

    if (currentDays.length === 0) {
      this.conversationDays.update((current) => ({
        ...current,
        [chatId]: [
          {
            id: `day-${Date.now()}`,
            label: 'Today',
            messages: [nextMessage],
          },
        ],
      }));
    } else {
      const lastDay = currentDays[currentDays.length - 1];
      const updatedDays = [
        ...currentDays.slice(0, -1),
        {
          ...lastDay,
          messages: [...lastDay.messages, nextMessage],
        },
      ];

      this.conversationDays.update((current) => ({
        ...current,
        [chatId]: updatedDays,
      }));
    }

    this.conversations.update((items) =>
      items.map((conversation) =>
        conversation.id === chatId
          ? {
              ...conversation,
              preview: body || 'Sent an image',
              time: 'Just now',
            }
          : conversation,
      ),
    );
  }

  private messageExists(chatId: string, messageId: string): boolean {
    const currentDays = this.conversationDays()[chatId] ?? [];
    return currentDays.some((day) =>
      day.messages.some((message) => message.id === messageId),
    );
  }

  private replaceMessage(
    chatId: string,
    messageId: string,
    replacement: Partial<ChatTextMessage> & Pick<ChatTextMessage, 'id'>,
  ): void {
    const currentDays = this.conversationDays()[chatId] ?? [];

    this.conversationDays.update((current) => ({
      ...current,
      [chatId]: currentDays.map((day) => ({
        ...day,
        messages: day.messages.map((message) => {
          if (message.id !== messageId || message.kind !== 'text') {
            return message;
          }

          return {
            ...message,
            ...replacement,
          };
        }),
      })),
    }));
  }

  private removeMessage(chatId: string, messageId: string): void {
    const currentDays = this.conversationDays()[chatId] ?? [];

    this.conversationDays.update((current) => ({
      ...current,
      [chatId]: currentDays
        .map((day) => ({
          ...day,
          messages: day.messages.filter((message) => message.id !== messageId),
        }))
        .filter((day) => day.messages.length > 0),
    }));
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

  protected async viewActiveConversationProfile(): Promise<void> {
    const conversation = this.resolveActiveConversation();
    const vendorId = conversation?.vendorId;

    this.closeProfileMenu();

    if (!vendorId) {
      return;
    }

    if (this.isSeller()) {
      await this.router.navigate(['/seller/my-stores', vendorId]);
      return;
    }

    await this.router.navigate(['/stores', vendorId]);
  }

  protected openSellerReportPage(): void {
    this.closeProfileMenu();
    this.isSellerReportModalOpen.set(true);
  }

  protected closeSellerReportModal(): void {
    this.isSellerReportModalOpen.set(false);
    this.resetSellerReportFlow();
  }

  protected closeSellerReportSuccessModal(): void {
    this.isSellerReportSuccessModalOpen.set(false);
    this.resetSellerReportFlow();
  }

  protected selectSellerReportReason(reason: string): void {
    this.selectedSellerReportReason.set(reason);
  }

  protected advanceSellerReportStep(): void {
    if (!this.selectedSellerReportReason()) {
      return;
    }

    this.sellerReportStep.set(2);
  }

  protected backSellerReportStep(): void {
    this.sellerReportStep.set(1);
  }

  protected async submitSellerReport(): Promise<void> {
    const activeConversation = this.resolveActiveConversation();
    const activeChatId = activeConversation?.id ?? '';
    const vendorId =
      activeConversation?.vendorId ??
      this.conversationVendorIds()[activeChatId] ??
      null;
    const sellerReason = this.toSellerReportReason(this.selectedSellerReportReason());

    if (!vendorId || !sellerReason) {
      this.appToastService.show({
        message: 'We couldn’t submit that report right now. Please try again.',
      });
      return;
    }

    if (this.isSubmittingSellerReport()) {
      return;
    }

    this.isSubmittingSellerReport.set(true);

    try {
      await firstValueFrom(
        this.listingsService.createSellerReport(vendorId, {
          reason: sellerReason,
        }),
      );
      this.isSellerReportModalOpen.set(false);
      this.isSellerReportSuccessModalOpen.set(true);
      this.resetSellerReportFlow();
    } catch {
      this.appToastService.show({
        message: 'We couldn’t submit that report right now. Please try again.',
      });
    } finally {
      this.isSubmittingSellerReport.set(false);
    }
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

  protected async confirmClearChat(): Promise<void> {
    if (this.deleteIntent() === 'messages') {
      if (this.isDeletingMessages()) {
        return;
      }

      const messageIds = this.selectedMessageIds();
      if (!messageIds.length) {
        return;
      }

      this.isDeletingMessages.set(true);

      try {
        await firstValueFrom(
          this.messagesService.bulkAction({
            action: 'delete',
            message_ids: messageIds,
          }),
        );

        this.deletedMessageIds.update((current) => [
          ...current,
          ...messageIds.filter((messageId) => !current.includes(messageId)),
        ]);
        this.exitSelectionMode();
        this.deleteIntent.set('chat');
        this.isClearChatConfirmOpen.set(false);
      } catch {
        this.appToastService.show({
          message: 'Those messages couldn’t be deleted right now. Please try again.',
        });
      } finally {
        this.isDeletingMessages.set(false);
      }

      return;
    }

    const conversationId = this.activeChatId() || this.resolveActiveConversation()?.id;
    if (!conversationId || this.isDeletingMessages()) {
      return;
    }

    this.isDeletingMessages.set(true);

    try {
      await firstValueFrom(this.messagesService.clearConversation(conversationId));

      this.conversationDays.update((current) => ({
        ...current,
        [conversationId]: [],
      }));
      this.deletedMessageIds.set([]);
      this.selectedMessageIds.set([]);
      this.activeReplyTarget.set(null);
      this.conversations.update((items) =>
        items.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                preview: 'No messages yet',
              }
            : conversation,
        ),
      );
      this.isClearChatConfirmOpen.set(false);
      this.deleteIntent.set('chat');
    } catch {
      this.appToastService.show({
        message: 'This chat couldn’t be cleared right now. Please try again.',
      });
    } finally {
      this.isDeletingMessages.set(false);
    }
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
    const anchor = this.resolveMenuAnchorFromTarget(event);
    this.longPressTimer = setTimeout(() => {
      this.openMessageMenu(messageId, author, text, anchor);
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

    this.activeReplyTarget.set({ author: target.author, text: target.text, messageId: target.messageId });
    this.closeMessageMenu();
    this.focusDraftComposer();
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

  protected async selectStore(storeId: string): Promise<void> {
    this.selectedStoreId.set(storeId);
    this.closeStoreSelector();
    this.clearActiveConversationFallbackRefresh();
    if (this.activeChatConnection) {
      this.activeChatConnection.close();
      this.activeChatConnection = null;
    }
    this.conversationDays.set({});
    this.deletedMessageIds.set([]);
    this.selectedMessageIds.set([]);
    this.activeReplyTarget.set(null);
    this.draftMessage.set('');
    this.clearSelectedImage();

    if (this.isSeller()) {
      if (storeId === 'all') {
        await this.loadSellerInboxConversations();
        return;
      }

      await this.loadSellerStoreConversations(storeId);
    }
  }

  protected updateStoreSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.storeSearchTerm.set(input?.value ?? '');
  }

  ngOnDestroy(): void {
    this.clearActiveConversationFallbackRefresh();
    if (this.activeChatConnection) {
      this.activeChatConnection.close();
      this.activeChatConnection = null;
    }
    this.clearLongPressTimer();
    this.browserWindow?.visualViewport?.removeEventListener(
      'resize',
      this.updateMobileViewportHeight,
    );
    this.browserWindow?.visualViewport?.removeEventListener(
      'scroll',
      this.updateMobileViewportHeight,
    );
    this.browserWindow?.removeEventListener(
      'orientationchange',
      this.updateMobileViewportHeight,
    );
    if (this.mobileConversationOverlayOpen) {
      this.mobileOverlayService.closeMobileModal();
      this.mobileConversationOverlayOpen = false;
    }
  }
}
