import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroChevronRight as heroChevronRightOutline } from '@ng-icons/heroicons/outline';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SettingsNavComponent, SettingsTab } from './components/settings-nav.component';
import {
  ProfileSettingsData,
  ProfileSettingsPanelComponent,
} from './components/profile-settings-panel.component';
import { SettingsActionModalComponent } from './components/settings-action-modal.component';
import { AuthFlowService } from '../../services/auth-flow.service';
import { AppToastService } from '../../services/app-toast.service';
import {
  SettingsTwoFactorModalComponent,
  TwoFactorMethod,
} from './components/settings-two-factor-modal.component';
import { SettingsVerificationModalComponent } from './components/settings-verification-modal.component';
import { AdminLocationsSettingsPanelComponent } from './components/admin-locations-settings-panel.component';
import {
  AuthService,
  AuthUser,
  ChangePasswordRequest,
  ProfileResponse,
  TwoFactorSetupResponse,
  UpdateProfileRequest,
} from '../../services/auth.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { AdminSettingsService } from '../../services/admin-settings.service';

type ModalMode =
  | 'name'
  | 'email'
  | 'call-add'
  | 'call-update'
  | 'whatsapp-add'
  | 'whatsapp-update'
  | null;

type VerificationMode = 'email' | 'call' | 'whatsapp' | null;

type AuthenticationMethodConfig = {
  id: TwoFactorMethod;
  label: string;
  meta: string;
  description: string;
  activeDescription: string;
  warningMessage: string;
  iconSrc: string;
};

type NotificationChannelId = 'sms' | 'email' | 'push';
type NotificationPreferenceCategoryId = 'messages' | 'listings' | 'ads' | 'buyerActivity' | 'performance';
type NotificationChannelSettings = Record<NotificationChannelId, boolean>;
type NotificationPreferenceSettings = Record<
  NotificationPreferenceCategoryId,
  NotificationChannelSettings
>;

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    NgIcon,
    NgOptimizedImage,
    RouterLink,
    SettingsNavComponent,
    ProfileSettingsPanelComponent,
    SettingsActionModalComponent,
    SettingsTwoFactorModalComponent,
    SettingsVerificationModalComponent,
    AdminLocationsSettingsPanelComponent,
  ],
  providers: [provideIcons({ heroChevronRightOutline })],
  template: `
    <div class="min-h-full bg-white md:hidden">
      @if (mobileSettingsStep() === 'menu') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-5 pb-32">
          <div class="flex h-[54px] items-center gap-3">
            <a
              [routerLink]="mobileBackRoute()"
              class="inline-flex h-8 w-11 items-center justify-center rounded-full bg-[#F3F3F3] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              aria-label="Back to more"
            >
              <img ngSrc="/assets/icons/settings/mobile-back.svg" width="20" height="20" alt="" aria-hidden="true">
            </a>
            <h1 class="text-[20px] font-semibold leading-[1.2] text-black">Account settings</h1>
          </div>

          <div class="mt-5 flex flex-col gap-5">
            @for (item of mobileMenuItems(); track item.id) {
              <button
                type="button"
                (click)="openMobileMenuItem(item.id)"
                class="flex w-full items-center justify-between gap-4 text-left text-[rgba(13,13,13,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              >
                <span class="flex items-center gap-3">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030]">
                    <img [ngSrc]="item.iconSrc" width="15" height="15" alt="" aria-hidden="true">
                  </span>
                  <span class="text-[16px] font-medium leading-5">{{ item.label }}</span>
                </span>
                <ng-icon name="heroChevronRightOutline" class="text-[16px] text-[rgba(13,13,13,0.8)]"></ng-icon>
              </button>
            }
          </div>

          <div class="my-9 h-px bg-[#EDEDED]"></div>

          <button
            type="button"
            (click)="isLogoutConfirmOpen.set(true)"
            class="flex w-full items-center justify-between gap-4 text-left text-[rgba(13,13,13,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030]">
                <img ngSrc="/assets/icons/settings/mobile-logout.svg" width="15" height="15" alt="" aria-hidden="true">
              </span>
              <span class="text-[16px] font-medium leading-5">Logout</span>
            </span>
            <ng-icon name="heroChevronRightOutline" class="text-[16px] text-[rgba(13,13,13,0.8)]"></ng-icon>
          </button>

          <div class="my-8 flex items-center gap-2">
            <span class="h-px flex-1 bg-[#EFEFEF]"></span>
            <span class="inline-flex items-center gap-2 text-[14px] font-medium leading-5 text-[#A2A2A2]">
              <img ngSrc="/assets/icons/settings/mobile-danger.svg" width="16" height="16" alt="" aria-hidden="true">
              Danger zone
            </span>
            <span class="h-px flex-1 bg-[#EFEFEF]"></span>
          </div>

          <button
            type="button"
            (click)="isDeleteAccountConfirmOpen.set(true)"
            class="flex w-full items-center justify-between gap-4 text-left text-[rgba(13,13,13,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
          >
            <span class="flex items-center gap-3">
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-[#303030]">
                <img ngSrc="/assets/icons/settings/mobile-trash.svg" width="15" height="15" alt="" aria-hidden="true">
              </span>
              <span class="text-[16px] font-medium leading-5">Delete account</span>
            </span>
            <ng-icon name="heroChevronRightOutline" class="text-[16px] text-[rgba(13,13,13,0.8)]"></ng-icon>
          </button>
        </div>
      } @else if (mobileSettingsStep() === 'profile') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-4 pb-32 pt-0">
          <header class="relative -mx-4 h-[146px] px-4">
            <div class="flex h-[45px] items-center gap-4">
              <button
                type="button"
                (click)="mobileSettingsStep.set('menu')"
                class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                aria-label="Back to account settings"
              >
                <svg class="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M12.5 15 7.5 10l5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <p class="text-[20px] font-semibold leading-[1.2] text-black">Account settings</p>
            </div>

            <div class="absolute bottom-0 left-4 right-4">
              <h1 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D]">Profile settings</h1>
              <p class="mt-2 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                Manage your account preferences and personal information.
              </p>
            </div>
          </header>

          <app-profile-settings-panel
            [profile]="profile()"
            mode="details-only"
            (action)="openModal($event)"
            (avatarChange)="onAvatarChange($event)"
          ></app-profile-settings-panel>
        </div>
      } @else if (mobileSettingsStep() === 'security') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-5 pb-56 pt-0">
          <header>
            <div class="flex h-[45px] items-center">
              <button
                type="button"
                (click)="mobileSettingsStep.set('menu')"
                class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                aria-label="Back to account settings"
              >
                <img ngSrc="/assets/icons/settings/security-back.svg" width="20" height="20" alt="" aria-hidden="true">
              </button>
            </div>

            <div class="mt-4">
              <h1 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D]">Security</h1>
              <p class="mt-2 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                Update password and/or enable 2FA for enhanced account security
              </p>
            </div>
          </header>

          <div class="mt-[33px]">
            <div class="flex h-[43px] items-center border-b border-[#EAEAEA]">
              <button
                type="button"
                (click)="securityTab.set('password')"
                class="inline-flex h-full items-center gap-2 border-b-2 px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.6)] transition"
                [class.border-[#6453D9]]="securityTab() === 'password'"
                [class.text-[#6453D9]]="securityTab() === 'password'"
                [class.border-transparent]="securityTab() !== 'password'"
              >
                <img ngSrc="/assets/icons/settings/security-lock.svg" width="16" height="16" alt="" aria-hidden="true">
                Password
              </button>

              <button
                type="button"
                (click)="securityTab.set('2fa')"
                class="inline-flex h-full items-center gap-2 border-b-2 px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.6)] transition"
                [class.border-[#6453D9]]="securityTab() === '2fa'"
                [class.text-[#6453D9]]="securityTab() === '2fa'"
                [class.border-transparent]="securityTab() !== '2fa'"
              >
                <img ngSrc="/assets/icons/settings/security-key.svg" width="16" height="16" alt="" aria-hidden="true">
                2-Factor Auth
              </button>
            </div>

            @if (securityTab() === 'password') {
              <div class="mt-[31px]">
                <h2 class="text-[20px] font-semibold leading-7 text-[#1A1B1D]">Change password</h2>

                <div class="mt-[29px] space-y-[31px]">
                  <div>
                    <label for="mobile-current-password" class="mb-[7px] block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                      Enter current password
                    </label>
                    <input
                      id="mobile-current-password"
                      type="password"
                      [value]="currentPassword()"
                      (input)="updateCurrentPassword($event)"
                      class="h-11 w-full rounded-lg border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                    >
                  </div>

                  <div>
                    <label for="mobile-new-password" class="mb-[7px] block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                      Enter new password
                    </label>
                    <div class="flex h-11 items-center gap-2 rounded-lg border border-[#6453D9] bg-white px-4">
                      <input
                        id="mobile-new-password"
                        [type]="showNewPassword() ? 'text' : 'password'"
                        [value]="newPassword()"
                        (input)="updateNewPassword($event)"
                        class="min-w-0 flex-1 bg-transparent text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none"
                      >
                      <button
                        type="button"
                        (click)="showNewPassword.update(value => !value)"
                        class="inline-flex h-5 w-5 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9]"
                        aria-label="Toggle password visibility"
                      >
                        <img ngSrc="/assets/icons/settings/security-eye.svg" width="20" height="20" alt="" aria-hidden="true">
                      </button>
                    </div>

                    <div class="mt-[15px] flex items-center justify-between gap-4">
                      <p class="text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">Password strength</p>
                      <div class="flex gap-1.5">
                        @for (segment of passwordStrengthSegments(); track $index) {
                          <span class="h-1 w-10 rounded-full" [style.background]="segment"></span>
                        }
                      </div>
                    </div>

                    <div class="mt-[15px] flex flex-wrap gap-2">
                      @for (item of passwordChecks(); track item.label) {
                        <span class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#F3F3F3] bg-white px-3 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                          <img
                            [ngSrc]="item.passed ? '/assets/icons/settings/security-check.svg' : '/assets/icons/settings/security-close-circle.svg'"
                            width="16"
                            height="16"
                            alt=""
                            aria-hidden="true"
                          >
                          {{ item.label }}
                        </span>
                      }
                    </div>
                  </div>

                  <div>
                    <label for="mobile-confirm-password" class="mb-[7px] block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                      Confirm new password
                    </label>
                    <input
                      id="mobile-confirm-password"
                      type="password"
                      [value]="confirmPassword()"
                      (input)="updateConfirmPassword($event)"
                      class="h-11 w-full rounded-lg border border-[#EAEAEA] bg-white px-4 text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                    >
                  </div>
                </div>
              </div>
            } @else if (!isTwoFactorEnabled()) {
              <div class="mt-6">
                <div>
                  <h2 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">Select an authentication method</h2>
                  <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.6)]">
                    Turning this on will require an additional verification code when you log in from an untrusted device.
                  </p>
                </div>

                <div class="mt-7 flex flex-col gap-5">
                  @for (method of authenticationMethods; track method.id) {
                    <button
                      type="button"
                      (click)="selectedAuthMethod.set(method.id)"
                      class="relative h-[103px] w-full rounded-[20px] border bg-white text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                      [class.border-[#357FF6]]="selectedAuthMethod() === method.id"
                      [class.border-2]="selectedAuthMethod() === method.id"
                      [class.bg-[#F9F7FF]]="selectedAuthMethod() === method.id"
                      [class.border-[#EBEBEB]]="selectedAuthMethod() !== method.id"
                      [attr.aria-pressed]="selectedAuthMethod() === method.id"
                    >
                      <span class="absolute left-2.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                        <img [ngSrc]="method.iconSrc" width="24" height="24" alt="" aria-hidden="true">
                      </span>
                      <span class="absolute left-[70px] right-[42px] top-1/2 flex -translate-y-1/2 flex-col gap-1">
                        <span class="text-[16px] font-medium leading-6 text-[#0D0D0D]">
                          {{ method.label }}
                          @if (method.meta) {
                            <span class="font-normal text-[rgba(13,13,13,0.5)]">{{ method.meta }}</span>
                          }
                        </span>
                        <span class="text-[12px] leading-4 text-[rgba(13,13,13,0.5)]">{{ method.description }}</span>
                      </span>
                      <span
                        class="absolute right-2.5 top-[29px] flex h-5 w-5 items-center justify-center rounded-full border bg-white"
                        [class.border-[#357FF6]]="selectedAuthMethod() === method.id"
                        [class.border-[#DADADA]]="selectedAuthMethod() !== method.id"
                      >
                        @if (selectedAuthMethod() === method.id) {
                          <span class="h-3 w-3 rounded-full bg-[#357FF6]"></span>
                        }
                      </span>
                    </button>
                  }
                </div>
              </div>
            } @else {
              <div class="mt-6">
                <div>
                  <h2 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">Select an authentication method</h2>
                  <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.6)]">
                    Turning this on will require an additional verification code when you log in from an untrusted device.
                  </p>
                </div>

                @if (activeAuthMethodConfig(); as method) {
                  <div class="mt-7 flex flex-col gap-4">
                    <section
                      class="rounded-[20px] border-2 border-[#357FF6] bg-[rgba(249,248,255,0.74)] px-4 py-4"
                      [attr.aria-label]="method.label + ' is active'"
                    >
                      <div class="flex items-center justify-between gap-4">
                        <span class="inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-[#DFFDF5] px-2">
                          <img
                            ngSrc="/assets/icons/settings/two-factor-active-badge.svg"
                            width="14"
                            height="14"
                            alt=""
                            aria-hidden="true"
                          >
                          <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">Active</span>
                        </span>

                        <span class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                          <img [ngSrc]="method.iconSrc" width="24" height="24" alt="" aria-hidden="true">
                        </span>
                      </div>

                      <div class="mt-[18px]">
                        <p class="text-[18px] font-medium leading-7 text-[#0D0D0D]">
                          {{ method.label }}
                          @if (method.meta) {
                            <span>{{ ' ' + method.meta }}</span>
                          }
                        </p>
                        <p class="mt-2 max-w-[301px] text-[14px] leading-4 text-[rgba(13,13,13,0.6)]">
                          {{ method.activeDescription }}
                        </p>
                      </div>

                      <div class="mt-4 h-px bg-[#DFDFDF]"></div>

                      <p class="mt-[14px] text-[13px] leading-4 text-[#828282]">
                        Enabled on {{ twoFactorEnabledDate() }}
                      </p>
                    </section>

                    <div class="flex items-start gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                      <img
                        ngSrc="/assets/icons/settings/two-factor-warning.svg"
                        width="24"
                        height="24"
                        alt=""
                        aria-hidden="true"
                        class="mt-0.5 shrink-0"
                      >
                      <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                        {{ method.warningMessage }}
                      </p>
                    </div>
                  </div>
                }
              </div>
            }
          </div>

          @if (securityTab() === 'password') {
            <div class="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white px-5 pb-24 pt-3">
              <button
                type="button"
                (click)="submitPasswordChange()"
                [disabled]="isPasswordSubmitting()"
                class="h-[52px] w-full rounded-[100px] bg-[#6453D9] text-[14px] font-semibold leading-5 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.opacity-70]="isPasswordSubmitting()"
              >
                {{ isPasswordSubmitting() ? 'Updating...' : 'Update and logout' }}
              </button>
              <button
                type="button"
                (click)="resetPasswordForm()"
                class="mt-3 h-[52px] w-full rounded-[100px] bg-[#F4F4F4] text-[14px] font-semibold leading-5 text-[rgba(26,27,29,0.8)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              >
                Discard changes
              </button>
            </div>
          } @else if (!isTwoFactorEnabled()) {
            <div class="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white px-5 pb-24 pt-3">
              <button
                type="button"
                (click)="beginTwoFactorSetup()"
                [disabled]="isTwoFactorSubmitting()"
                class="h-[52px] w-full rounded-[100px] border border-white bg-[#6453D9] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.opacity-70]="isTwoFactorSubmitting()"
              >
                {{ isTwoFactorSubmitting() ? 'Preparing...' : 'Confirm and update' }}
              </button>
            </div>
          } @else {
            <div class="fixed bottom-0 left-1/2 z-20 w-full max-w-[390px] -translate-x-1/2 bg-white px-5 pb-24 pt-3">
              <button
                type="button"
                (click)="isTurnOffTwoFactorModalOpen.set(true)"
                class="h-[52px] w-full rounded-[64px] border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              >
                Turn off 2FA
              </button>
            </div>
          }
        </div>
      } @else if (mobileSettingsStep() === 'notifications') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-5 pb-24 pt-0">
          <header>
            <div class="flex h-[45px] items-center">
              <button
                type="button"
                (click)="mobileSettingsStep.set('menu')"
                class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                aria-label="Back to account settings"
              >
                <img ngSrc="/assets/icons/settings/security-back.svg" width="20" height="20" alt="" aria-hidden="true">
              </button>
            </div>

            <div class="mt-4">
              <h1 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D]">Notifications</h1>
              <p class="mt-2 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                Choose how and when you want to receive notifications
              </p>
            </div>
          </header>

          <div class="mt-[33px]">
            <div class="flex h-[43px] items-center border-b border-[#EAEAEA]">
              <button
                type="button"
                (click)="notificationsTab.set('method')"
                class="inline-flex h-full items-center gap-1.5 border-b-2 px-3 text-[14px] font-medium leading-5 transition"
                [class.border-[#6453D9]]="notificationsTab() === 'method'"
                [class.text-[#6453D9]]="notificationsTab() === 'method'"
                [class.border-transparent]="notificationsTab() !== 'method'"
                [class.text-[#959595]]="notificationsTab() !== 'method'"
              >
                <img
                  [ngSrc]="notificationsTab() === 'method' ? '/assets/icons/settings/notifications-tab-method.svg' : '/assets/icons/settings/settings-nav-notifications.svg'"
                  width="16"
                  height="16"
                  alt=""
                  aria-hidden="true"
                >
                Method
              </button>

              <button
                type="button"
                (click)="notificationsTab.set('preferences')"
                class="inline-flex h-full items-center gap-1.5 border-b-2 px-3 text-[14px] font-medium leading-5 transition"
                [class.border-[#6453D9]]="notificationsTab() === 'preferences'"
                [class.text-[#6453D9]]="notificationsTab() === 'preferences'"
                [class.border-transparent]="notificationsTab() !== 'preferences'"
                [class.text-[#959595]]="notificationsTab() !== 'preferences'"
              >
                <img ngSrc="/assets/icons/settings/notifications-tab-preferences.svg" width="16" height="16" alt="" aria-hidden="true">
                Preferences
              </button>
            </div>

            @if (notificationsTab() === 'method') {
              <div class="mt-7 space-y-8">
                @for (item of notificationMethods; track item.id) {
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0 flex-1">
                      <h2 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ item.label }}</h2>
                      <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">{{ item.description }}</p>
                    </div>

                    <button
                      type="button"
                      (click)="toggleNotificationMethod(item.id)"
                      class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                      [class.bg-[#6453D9]]="isNotificationMethodEnabled(item.id)"
                      [class.bg-[#ECECEC]]="!isNotificationMethodEnabled(item.id)"
                      [attr.aria-pressed]="isNotificationMethodEnabled(item.id)"
                      [attr.aria-label]="'Toggle ' + item.label"
                    >
                      <span
                        class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                        [class.left-[14px]]="isNotificationMethodEnabled(item.id)"
                        [class.left-0.5]="!isNotificationMethodEnabled(item.id)"
                      ></span>
                    </button>
                  </div>
                }
              </div>

              <div class="mt-10 flex items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                <img
                  ngSrc="/assets/icons/settings/two-factor-warning.svg"
                  width="24"
                  height="24"
                  alt=""
                  aria-hidden="true"
                  class="shrink-0"
                >
                <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                  Maximize your platform usage by leaving notification settings active
                </p>
              </div>
            } @else {
              <div class="mt-[26px]">
                <div class="space-y-[26px]">
                  @for (item of notificationPreferenceCategories; track item.id) {
                    <button
                      type="button"
                      (click)="mobilePreferenceCategory.set(item.id)"
                      class="flex w-full items-start justify-between gap-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                    >
                      <span class="min-w-0 flex-1 pr-3">
                        <span class="block text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ item.label }}</span>
                        <span class="mt-1 block text-[14px] leading-[1.35] text-[rgba(26,27,29,0.6)]">{{ item.description }}</span>
                      </span>

                      <ng-icon
                        name="heroChevronRightOutline"
                        class="mt-2 shrink-0 text-[16px] text-[rgba(13,13,13,0.8)]"
                      ></ng-icon>
                    </button>
                  }
                </div>

                <div class="mt-[34px] flex items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                  <img
                    ngSrc="/assets/icons/settings/two-factor-warning.svg"
                    width="24"
                    height="24"
                    alt=""
                    aria-hidden="true"
                    class="shrink-0"
                  >
                  <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                    Maximize your platform usage by leaving notification settings active
                  </p>
                </div>
              </div>
            }
          </div>
        </div>
      } @else if (mobileSettingsStep() === 'platform') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-5 pb-32 pt-0">
          <header>
            <div class="flex h-[45px] items-center">
              <button
                type="button"
                (click)="mobileSettingsStep.set('menu')"
                class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                aria-label="Back to account settings"
              >
                <img ngSrc="/assets/icons/settings/security-back.svg" width="20" height="20" alt="" aria-hidden="true">
              </button>
            </div>

            <div class="mt-4">
              <h1 class="text-[25px] font-semibold leading-[1.2] text-[#1A1B1D]">Platform</h1>
              <p class="mt-2 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                Manage marketplace-wide KYC and subscription availability settings.
              </p>
            </div>
          </header>

          <div class="mt-8 rounded-[20px] border border-[#EFEFEF] bg-white px-5 py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <h2 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">Require KYC for posting</h2>
                <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                  Turn this on when sellers must verify their identity before creating or publishing listings.
                  Turn it off to let users post without KYC, while keeping existing verification badges and records intact.
                </p>
              </div>

              <button
                type="button"
                (click)="toggleKycRequirement()"
                [disabled]="isPlatformSettingSubmitting()"
                class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.bg-[#6453D9]]="isKycRequired()"
                [class.bg-[#ECECEC]]="!isKycRequired()"
                [class.opacity-70]="isPlatformSettingSubmitting()"
                [attr.aria-pressed]="isKycRequired()"
                aria-label="Toggle KYC requirement"
              >
                <span
                  class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                  [class.left-[14px]]="isKycRequired()"
                  [class.left-0.5]="!isKycRequired()"
                ></span>
              </button>
            </div>

            <p class="mt-4 text-[12px] leading-[1.5] text-[rgba(26,27,29,0.55)]">
              Current status:
              <span class="font-medium text-[#1A1B1D]">
                {{
                  isKycRequired()
                    ? 'KYC is required before sellers can post listings.'
                    : 'KYC is optional; sellers can post listings without verification.'
                }}
              </span>
            </p>
          </div>

          <div class="mt-4 rounded-[20px] border border-[#EFEFEF] bg-white px-5 py-5">
            <div class="flex items-start justify-between gap-4">
              <div class="min-w-0 flex-1">
                <h2 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">Enable subscriptions across the app</h2>
                <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                  Turn this on to allow sellers to buy subscription plans and use paid promotion features.
                  Turn it off to block plan purchases and hide promoted placements such as sponsored listings, store promotions, and banner ads.
                </p>
              </div>

              <button
                type="button"
                (click)="toggleSubscriptionsEnabled()"
                [disabled]="isPlatformSettingSubmitting()"
                class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.bg-[#6453D9]]="isSubscriptionsEnabled()"
                [class.bg-[#ECECEC]]="!isSubscriptionsEnabled()"
                [class.opacity-70]="isPlatformSettingSubmitting()"
                [attr.aria-pressed]="isSubscriptionsEnabled()"
                aria-label="Toggle subscriptions availability"
              >
                <span
                  class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                  [class.left-[14px]]="isSubscriptionsEnabled()"
                  [class.left-0.5]="!isSubscriptionsEnabled()"
                ></span>
              </button>
            </div>

            <p class="mt-4 text-[12px] leading-[1.5] text-[rgba(26,27,29,0.55)]">
              Current status:
              <span class="font-medium text-[#1A1B1D]">
                {{
                  isSubscriptionsEnabled()
                    ? 'Subscriptions and paid promotions are available.'
                    : 'Subscriptions are disabled; paid promotions are hidden and purchases are blocked.'
                }}
              </span>
            </p>
          </div>
        </div>
      } @else if (mobileSettingsStep() === 'locations') {
        <div class="mx-auto min-h-screen w-full max-w-[390px] px-5 pb-32 pt-0">
          <header>
            <div class="flex h-[45px] items-center">
              <button
                type="button"
                (click)="mobileSettingsStep.set('menu')"
                class="inline-flex h-8 w-10 items-center justify-center rounded-full bg-[#F4F4F4] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                aria-label="Back to account settings"
              >
                <img ngSrc="/assets/icons/settings/security-back.svg" width="20" height="20" alt="" aria-hidden="true">
              </button>
            </div>
          </header>

          <app-admin-locations-settings-panel></app-admin-locations-settings-panel>
        </div>
      }
    </div>

    <div class="hidden h-full flex-col rounded-[32px] bg-white md:flex">
      <header class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-semibold leading-[1.2] text-[#1A1B1D]">Account settings</h1>
      </header>

      <div class="flex-1 overflow-y-auto px-4 py-5">
        <div class="grid items-start gap-12 xl:grid-cols-[261px_579px] xl:gap-[115px]">
          <app-settings-nav
            [activeTab]="activeTab()"
            [showPlatformTab]="isAdminSettingsView()"
            (tabChange)="activeTab.set($event)"
          ></app-settings-nav>

          <div>
            @if (activeTab() === 'profile') {
              <app-profile-settings-panel
                [profile]="profile()"
                (action)="openModal($event)"
                (avatarChange)="onAvatarChange($event)"
                (deleteRequest)="isDeleteAccountConfirmOpen.set(true)"
              ></app-profile-settings-panel>
            } @else if (activeTab() === 'security') {
              <section class="w-full max-w-[545px]">
                <h2 class="text-[28px] font-semibold leading-10 text-[#1A1B1D]">Security</h2>
                <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                  Update password and/or enable 2FA for enhanced account security
                </p>

                <div class="mt-8 max-w-[468px]">
                  <div class="flex h-10 items-center border-b border-[#EAEAEA]">
                    <button
                      type="button"
                      (click)="securityTab.set('password')"
                      class="inline-flex h-full items-center gap-2 border-b-2 px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.6)] transition"
                      [class.border-[#6453D9]]="securityTab() === 'password'"
                      [class.text-[#6453D9]]="securityTab() === 'password'"
                      [class.border-transparent]="securityTab() !== 'password'"
                    >
                      <img ngSrc="/assets/icons/settings/security-lock.svg" width="16" height="16" alt="" aria-hidden="true">
                      Password
                    </button>

                    <button
                      type="button"
                      (click)="securityTab.set('2fa')"
                      class="inline-flex h-full items-center gap-2 border-b-2 px-3 text-[14px] font-medium leading-5 text-[rgba(26,27,29,0.6)] transition"
                      [class.border-[#6453D9]]="securityTab() === '2fa'"
                      [class.text-[#6453D9]]="securityTab() === '2fa'"
                      [class.border-transparent]="securityTab() !== '2fa'"
                    >
                      <img ngSrc="/assets/icons/settings/security-key.svg" width="16" height="16" alt="" aria-hidden="true">
                      2-Factor Authentication
                    </button>
                  </div>

                  @if (securityTab() === 'password') {
                    <div class="mt-8">
                      <h3 class="text-[20px] font-semibold leading-7 text-[#1A1B1D]">Change password</h3>

                      <div class="mt-8 space-y-8">
                        <div>
                          <label for="current-password" class="mb-2 block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                            Enter current password
                          </label>
                          <input
                            id="current-password"
                            type="password"
                            [value]="currentPassword()"
                            (input)="updateCurrentPassword($event)"
                            class="h-8 w-full rounded-lg border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                          >
                        </div>

                        <div>
                          <label for="new-password" class="mb-2 block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                            Enter new password
                          </label>
                          <div class="flex h-8 items-center gap-2 rounded-lg border border-[#6453D9] bg-white px-3">
                            <input
                              id="new-password"
                              [type]="showNewPassword() ? 'text' : 'password'"
                              [value]="newPassword()"
                              (input)="updateNewPassword($event)"
                              class="min-w-0 flex-1 bg-transparent text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none"
                            >
                            <button
                              type="button"
                              (click)="showNewPassword.update(value => !value)"
                              class="inline-flex h-5 w-5 items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6453D9]"
                              aria-label="Toggle password visibility"
                            >
                              <img ngSrc="/assets/icons/settings/security-eye.svg" width="20" height="20" alt="" aria-hidden="true">
                            </button>
                          </div>

                          <div class="mt-4 flex items-center justify-between gap-4">
                            <p class="text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">Password strength</p>
                            <div class="flex gap-1.5">
                              @for (segment of passwordStrengthSegments(); track $index) {
                                <span class="h-1 w-10 rounded-full" [style.background]="segment"></span>
                              }
                            </div>
                          </div>

                          <div class="mt-4 flex flex-wrap gap-2">
                            @for (item of passwordChecks(); track item.label) {
                              <span class="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#F3F3F3] bg-white px-3 text-[12px] leading-normal text-[rgba(26,27,29,0.6)]">
                                <img
                                  [ngSrc]="item.passed ? '/assets/icons/settings/security-check.svg' : '/assets/icons/settings/security-close-circle.svg'"
                                  width="16"
                                  height="16"
                                  alt=""
                                  aria-hidden="true"
                                >
                                {{ item.label }}
                              </span>
                            }
                          </div>
                        </div>

                        <div>
                          <label for="confirm-password" class="mb-2 block text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                            Confirm new password
                          </label>
                          <input
                            id="confirm-password"
                            type="password"
                            [value]="confirmPassword()"
                            (input)="updateConfirmPassword($event)"
                            class="h-8 w-full rounded-lg border border-[#EAEAEA] bg-white px-3 text-[14px] font-medium leading-5 text-[#1A1B1D] outline-none focus:border-[#6453D9]"
                          >
                        </div>
                      </div>

                      <div class="mt-8 grid max-w-[406px] grid-cols-2 gap-3">
                        <button
                          type="button"
                          (click)="resetPasswordForm()"
                          class="h-10 rounded-full border border-[#EAEAEA] bg-white px-4 text-[14px] font-semibold leading-5 text-[rgba(26,27,29,0.8)] transition hover:bg-[#FAFAFC] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          (click)="submitPasswordChange()"
                          [disabled]="isPasswordSubmitting()"
                          class="h-10 rounded-full bg-[#6453D9] px-4 text-[14px] font-semibold leading-5 text-white transition hover:bg-[#5945DB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                          [class.opacity-70]="isPasswordSubmitting()"
                        >
                          {{ isPasswordSubmitting() ? 'Updating...' : 'Update and logout' }}
                        </button>
                      </div>
                    </div>
                  } @else if (!isTwoFactorEnabled()) {
                    <div class="mt-8 w-full">
                      <div>
                        <h3 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">
                          Select an authentication method
                        </h3>
                        <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.6)]">
                          Turning this on will require an additional verification code when you log in from an untrusted device.
                        </p>
                      </div>

                      <div class="mt-8 flex flex-col gap-6">
                        @for (method of authenticationMethods; track method.id) {
                          <button
                            type="button"
                            (click)="selectedAuthMethod.set(method.id)"
                            class="relative h-[103px] w-full rounded-[20px] border bg-white text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                            [class.border-[#6453D9]]="selectedAuthMethod() === method.id"
                            [class.bg-[#F9F7FF]]="selectedAuthMethod() === method.id"
                            [class.border-[#EBEBEB]]="selectedAuthMethod() !== method.id"
                            [attr.aria-pressed]="selectedAuthMethod() === method.id"
                          >
                            <span class="absolute left-[15px] top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                              <img [ngSrc]="method.iconSrc" width="24" height="24" alt="" aria-hidden="true">
                            </span>
                            <span class="absolute left-[79px] right-[58px] top-1/2 flex -translate-y-1/2 flex-col gap-1">
                              <span class="text-[16px] font-medium leading-6 text-[#1F1F1F]">
                                {{ method.label }}
                                @if (method.meta) {
                                  <span class="font-normal text-[#959595]">{{ method.meta }}</span>
                                }
                              </span>
                              <span class="text-[12px] leading-4 text-[#959595]">{{ method.description }}</span>
                            </span>
                            <span
                              class="absolute right-[15px] top-[28px] flex h-5 w-5 items-center justify-center rounded-full border bg-white"
                              [class.border-[#6453D9]]="selectedAuthMethod() === method.id"
                              [class.border-[#DADADA]]="selectedAuthMethod() !== method.id"
                            >
                              @if (selectedAuthMethod() === method.id) {
                                <span class="h-3 w-3 rounded-full bg-[#6453D9]"></span>
                              }
                            </span>
                          </button>
                        }
                      </div>

                      <button
                        type="button"
                        (click)="beginTwoFactorSetup()"
                        [disabled]="isTwoFactorSubmitting()"
                        class="mt-8 h-10 w-full rounded-[64px] border border-white bg-[#6453D9] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_8px_rgba(81,35,173,0.4),0_0_0_1px_#2A6CE8] transition hover:bg-[#5945DB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                        [class.opacity-70]="isTwoFactorSubmitting()"
                      >
                        {{ isTwoFactorSubmitting() ? 'Preparing...' : 'Turn on' }}
                      </button>
                    </div>
                  } @else {
                    <div class="mt-8 w-full">
                      <div>
                        <h3 class="text-[20px] font-semibold leading-7 text-[#0D0D0D]">
                          Select an authentication method
                        </h3>
                        <p class="mt-1 text-[14px] leading-5 text-[rgba(13,13,13,0.6)]">
                          Turning this on will require an additional verification code when you log in from an untrusted device.
                        </p>
                      </div>

                      @if (activeAuthMethodConfig(); as method) {
                        <div class="mt-8 flex flex-col gap-6">
                          <section
                            class="relative min-h-[147px] rounded-[20px] border border-[#6453D9] bg-[#F9F7FF] px-[15px] pb-[15px] pt-[21px]"
                            [attr.aria-label]="method.label + ' is active'"
                          >
                            <span class="absolute right-[15px] top-[15px] inline-flex h-6 shrink-0 items-center gap-1 rounded-full bg-[#DFFDF5] px-2">
                              <img
                                ngSrc="/assets/icons/settings/two-factor-active-badge.svg"
                                width="14"
                                height="14"
                                alt=""
                                aria-hidden="true"
                              >
                              <span class="text-[12px] font-semibold leading-4 text-[#25AD32]">Active</span>
                            </span>

                            <div class="flex items-start gap-5">
                              <span class="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#E6E6E6] bg-white">
                                <img [ngSrc]="method.iconSrc" width="24" height="24" alt="" aria-hidden="true">
                              </span>
                              <div class="min-w-0 flex-1 pr-[72px]">
                                <p class="text-[18px] font-medium leading-6 text-[#1F1F1F]">
                                  {{ method.label }}
                                  @if (method.meta) {
                                    <span class="font-normal text-[#959595]">{{ ' ' + method.meta }}</span>
                                  }
                                </p>
                                <p class="mt-1 max-w-[318px] text-[13px] leading-4 text-[rgba(13,13,13,0.6)]">
                                  {{ method.activeDescription }}
                                </p>

                                <div class="mt-4 h-px bg-[#DFDFDF]"></div>

                                <p class="mt-4 text-[13px] leading-4 text-[#828282]">
                                  Enabled on {{ twoFactorEnabledDate() }}
                                </p>
                              </div>
                            </div>
                          </section>

                          <div class="flex items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                            <img
                              ngSrc="/assets/icons/settings/two-factor-warning.svg"
                              width="24"
                              height="24"
                              alt=""
                              aria-hidden="true"
                              class="shrink-0"
                            >
                            <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                              {{ method.warningMessage }}
                            </p>
                          </div>

                          <button
                            type="button"
                            (click)="isTurnOffTwoFactorModalOpen.set(true)"
                            class="h-10 w-full rounded-[64px] border border-white bg-[#FF2524] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A] transition hover:bg-[#F32322] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                          >
                            Turn off
                          </button>
                        </div>
                      }
                    </div>
                  }
                </div>
              </section>
            } @else if (activeTab() === 'notifications') {
              <section class="w-full max-w-[679px]">
                <h2 class="text-[28px] font-semibold leading-10 text-[#1A1B1D]">Notifications</h2>
                <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                  Choose what notifications you want to receive
                </p>

                <div class="mt-8 max-w-[629px]">
                  <div class="flex items-center border-b border-[#EAEAEA]">
                    <button
                      type="button"
                      (click)="notificationsTab.set('method')"
                      class="inline-flex items-center gap-1.5 border-b-2 px-3 py-1 text-[16px] font-medium leading-6 transition"
                      [class.border-[#6453D9]]="notificationsTab() === 'method'"
                      [class.text-[#6453D9]]="notificationsTab() === 'method'"
                      [class.border-transparent]="notificationsTab() !== 'method'"
                      [class.text-[#959595]]="notificationsTab() !== 'method'"
                    >
                      <img
                        [ngSrc]="notificationsTab() === 'method' ? '/assets/icons/settings/notifications-tab-method.svg' : '/assets/icons/settings/settings-nav-notifications.svg'"
                        width="16"
                        height="16"
                        alt=""
                        aria-hidden="true"
                      >
                      Method
                    </button>

                    <button
                      type="button"
                      (click)="notificationsTab.set('preferences')"
                      class="inline-flex items-center gap-1.5 border-b-2 px-3 py-1 text-[16px] font-medium leading-6 transition"
                      [class.border-[#6453D9]]="notificationsTab() === 'preferences'"
                      [class.text-[#6453D9]]="notificationsTab() === 'preferences'"
                      [class.border-transparent]="notificationsTab() !== 'preferences'"
                      [class.text-[#959595]]="notificationsTab() !== 'preferences'"
                    >
                      <img ngSrc="/assets/icons/settings/notifications-tab-preferences.svg" width="16" height="16" alt="" aria-hidden="true">
                      Preferences
                    </button>
                  </div>

                  @if (notificationsTab() === 'method') {
                    <div class="mt-8 w-[545px] space-y-6">
                      @for (item of notificationMethods; track item.id) {
                        <div class="flex items-start justify-between gap-6">
                          <div class="min-w-0 flex-1">
                            <h3 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ item.label }}</h3>
                            <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">{{ item.description }}</p>
                          </div>

                          <button
                            type="button"
                            (click)="toggleNotificationMethod(item.id)"
                            class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                            [class.bg-[#6453D9]]="isNotificationMethodEnabled(item.id)"
                            [class.bg-[#ECECEC]]="!isNotificationMethodEnabled(item.id)"
                            [attr.aria-pressed]="isNotificationMethodEnabled(item.id)"
                            [attr.aria-label]="'Toggle ' + item.label"
                          >
                            <span
                              class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                              [class.left-[14px]]="isNotificationMethodEnabled(item.id)"
                              [class.left-0.5]="!isNotificationMethodEnabled(item.id)"
                            ></span>
                          </button>
                        </div>
                      }
                    </div>

                    <div class="mt-14 flex w-[545px] items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                      <img
                        ngSrc="/assets/icons/settings/two-factor-warning.svg"
                        width="24"
                        height="24"
                        alt=""
                        aria-hidden="true"
                        class="shrink-0"
                      >
                      <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                        Maximize your platform usage by leaving notification settings active
                      </p>
                    </div>
                  } @else {
                    <div class="mt-8 w-[629px] max-w-full">
                      <div class="grid grid-cols-[minmax(0,1fr)_74px_74px_74px] items-center gap-x-[28px] border-b border-[#EFEFEF] pb-[10px]">
                        <p class="text-[13px] font-medium leading-5 text-[#7D828B]">Notify me about</p>
                        <p class="text-center text-[13px] font-medium leading-5 text-[#7D828B]">SMS</p>
                        <p class="text-center text-[13px] font-medium leading-5 text-[#7D828B]">Email</p>
                        <p class="text-center text-[13px] font-medium leading-5 text-[#7D828B]">Push</p>
                      </div>

                      <div class="space-y-[20px] pt-[16px]">
                        @for (item of notificationPreferenceCategories; track item.id) {
                          <div class="grid grid-cols-[minmax(0,1fr)_74px_74px_74px] items-start gap-x-[28px]">
                            <div class="min-w-0 pr-2">
                              <h3 class="text-[16px] font-medium leading-6 text-[#1A1B1D]">{{ item.label }}</h3>
                              <p class="mt-[2px] text-[14px] leading-[1.35] text-[rgba(26,27,29,0.6)]">
                                {{ item.description }}
                              </p>
                            </div>

                            @for (channel of notificationPreferenceChannels; track channel.id) {
                              <button
                                type="button"
                                (click)="toggleNotificationPreference(item.id, channel.id)"
                                class="mx-auto mt-[2px] flex h-[16px] w-[16px] items-center justify-center rounded-[4px] border transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                                [class.border-[#6B5CF0]]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.bg-[#6B5CF0]]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.border-[#D5D5D5]]="!isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.bg-white]="!isNotificationPreferenceEnabled(item.id, channel.id)"
                                [attr.aria-pressed]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [attr.aria-label]="'Toggle ' + item.label + ' for ' + channel.label"
                              >
                                @if (isNotificationPreferenceEnabled(item.id, channel.id)) {
                                  <svg class="h-[10px] w-[10px]" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                                    <path
                                      d="M2.2 5.2 4.1 7l3.7-4"
                                      stroke="white"
                                      stroke-width="1.4"
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                    />
                                  </svg>
                                }
                              </button>
                            }
                          </div>
                        }
                      </div>

                      <div class="mt-[26px] flex w-[505px] max-w-full items-center gap-2 rounded-[12px] bg-[rgba(250,250,250,0.8)] px-[10px] py-[11px]">
                        <img
                          ngSrc="/assets/icons/settings/two-factor-warning.svg"
                          width="24"
                          height="24"
                          alt=""
                          aria-hidden="true"
                          class="shrink-0"
                        >
                        <p class="text-[14px] font-medium leading-5 text-[#A2A500]">
                          Maximize your platform usage by leaving notification settings active
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </section>
            } @else if (activeTab() === 'platform' && isAdminSettingsView()) {
              <section class="w-full max-w-[545px]">
                <h2 class="text-[28px] font-semibold leading-10 text-[#1A1B1D]">Platform</h2>
                <p class="mt-1 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                  Manage marketplace-wide KYC and subscription availability settings.
                </p>

                <div class="mt-8 rounded-[20px] border border-[#EFEFEF] bg-white px-5 py-6">
                  <div class="flex items-start justify-between gap-6">
                    <div class="min-w-0 flex-1">
                      <h3 class="text-[20px] font-semibold leading-7 text-[#1A1B1D]">Require KYC for posting</h3>
                      <p class="mt-2 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                        Turn this on when sellers must verify their identity before creating or publishing listings.
                        Turn it off to let users post without KYC, while keeping existing verification badges and records intact.
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="toggleKycRequirement()"
                      [disabled]="isPlatformSettingSubmitting()"
                      class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                      [class.bg-[#6453D9]]="isKycRequired()"
                      [class.bg-[#ECECEC]]="!isKycRequired()"
                      [class.opacity-70]="isPlatformSettingSubmitting()"
                      [attr.aria-pressed]="isKycRequired()"
                      aria-label="Toggle KYC requirement"
                    >
                      <span
                        class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                        [class.left-[14px]]="isKycRequired()"
                        [class.left-0.5]="!isKycRequired()"
                      ></span>
                    </button>
                  </div>

                  <div class="mt-5 rounded-[12px] bg-[#FAFAFA] px-4 py-3">
                    <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                      Current status:
                      <span class="font-medium text-[#1A1B1D]">
                        {{
                          isKycRequired()
                            ? 'KYC is required before sellers can post listings.'
                            : 'KYC is optional; sellers can post listings without verification.'
                        }}
                      </span>
                    </p>
                  </div>
                </div>

                <div class="mt-4 rounded-[20px] border border-[#EFEFEF] bg-white px-5 py-6">
                  <div class="flex items-start justify-between gap-6">
                    <div class="min-w-0 flex-1">
                      <h3 class="text-[20px] font-semibold leading-7 text-[#1A1B1D]">Enable subscriptions across the app</h3>
                      <p class="mt-2 text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                        Turn this on to allow sellers to buy subscription plans and use paid promotion features.
                        Turn it off to block plan purchases and hide promoted placements such as sponsored listings, store promotions, and banner ads.
                      </p>
                    </div>

                    <button
                      type="button"
                      (click)="toggleSubscriptionsEnabled()"
                      [disabled]="isPlatformSettingSubmitting()"
                      class="relative mt-1 h-5 w-8 shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                      [class.bg-[#6453D9]]="isSubscriptionsEnabled()"
                      [class.bg-[#ECECEC]]="!isSubscriptionsEnabled()"
                      [class.opacity-70]="isPlatformSettingSubmitting()"
                      [attr.aria-pressed]="isSubscriptionsEnabled()"
                      aria-label="Toggle subscriptions availability"
                    >
                      <span
                        class="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)] transition"
                        [class.left-[14px]]="isSubscriptionsEnabled()"
                        [class.left-0.5]="!isSubscriptionsEnabled()"
                      ></span>
                    </button>
                  </div>

                  <div class="mt-5 rounded-[12px] bg-[#FAFAFA] px-4 py-3">
                    <p class="text-[14px] leading-5 text-[rgba(26,27,29,0.6)]">
                      Current status:
                      <span class="font-medium text-[#1A1B1D]">
                        {{
                          isSubscriptionsEnabled()
                            ? 'Subscriptions and paid promotions are available.'
                            : 'Subscriptions are disabled; paid promotions are hidden and purchases are blocked.'
                        }}
                      </span>
                    </p>
                  </div>
                </div>
              </section>
            } @else if (activeTab() === 'locations' && isAdminSettingsView()) {
              <app-admin-locations-settings-panel></app-admin-locations-settings-panel>
            }
          </div>
        </div>
      </div>
    </div>

    @if (currentModalConfig(); as modal) {
      <app-settings-action-modal
        [title]="modal.title"
        [description]="modal.description"
        [fieldLabel]="modal.fieldLabel"
        [value]="modal.value"
        [inputType]="modal.inputType"
        [confirmLabel]="modal.confirmLabel"
        [showDropdown]="modal.showDropdown"
        [isLoading]="isProfileSubmitting()"
        (close)="modalMode.set(null)"
        (valueChange)="modalValue.set($event)"
        (confirm)="handleModalConfirm()"
      ></app-settings-action-modal>
    }

    @if (currentVerificationConfig(); as verification) {
      <app-settings-verification-modal
        [destination]="verification.destination"
        [isLoading]="isProfileSubmitting()"
        [isResending]="isVerificationResending()"
        (close)="verificationMode.set(null)"
        (back)="handleVerificationBack()"
        (confirm)="completeVerification($event)"
        (resend)="resendVerificationCode()"
      ></app-settings-verification-modal>
    }

    @if (isTwoFactorModalOpen()) {
      <app-settings-two-factor-modal
        [method]="selectedAuthMethod()"
        [destination]="twoFactorDestination()"
        [qrCode]="twoFactorQrCode()"
        [manualSecret]="twoFactorManualSecret()"
        [isSubmitting]="isTwoFactorSubmitting()"
        (close)="isTwoFactorModalOpen.set(false)"
        (complete)="completeTwoFactorSetup($event)"
      ></app-settings-two-factor-modal>
    }

    @if (isTurnOffTwoFactorModalOpen()) {
      <div
        class="fixed inset-0 z-[220] flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
        (click)="isTurnOffTwoFactorModalOpen.set(false)"
      >
        <div
          class="relative w-full overflow-hidden rounded-t-[36px] bg-white shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:max-w-[500px] md:rounded-[20px] md:bg-[#F4F4F4] md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="turn-off-2fa-title"
          (click)="$event.stopPropagation()"
        >
          <div class="absolute left-1/2 top-[11px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#EBEBEB] md:hidden"></div>

          <button
            type="button"
            (click)="isTurnOffTwoFactorModalOpen.set(false)"
            class="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[#EAEAEA] bg-white shadow-[0_4px_8px_rgba(202,202,202,0.25)] transition hover:bg-[#F8F8F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D] md:right-6 md:top-6 md:h-8 md:w-8 md:border-0 md:bg-[#F9F9F9] md:shadow-none"
            aria-label="Close disable 2FA modal"
          >
            <img ngSrc="/assets/icons/settings/modal-close.svg" width="24" height="24" alt="" aria-hidden="true">
          </button>

          <div class="bg-white px-4 pb-6 pt-[85px] md:rounded-b-[15px] md:px-6 md:pb-[46px] md:pt-6">
            <div class="flex flex-col items-start gap-3 md:w-[451px]">
              <div class="relative h-[120px] w-[121.5px] shrink-0">
                <div class="absolute inset-0 rounded-full bg-[#F7F4EE]"></div>
                <div class="absolute left-1/2 top-[16.5px] h-[87.5px] w-[88.6px] -translate-x-1/2 rounded-full bg-[#FDF6D7]"></div>
                <img
                  ngSrc="/assets/icons/settings/two-factor-warning.svg"
                  width="54"
                  height="54"
                  alt=""
                  aria-hidden="true"
                  class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
              </div>

              <div class="w-full">
                <h3 id="turn-off-2fa-title" class="text-[24px] font-semibold leading-8 text-[#1A1B1D] md:text-[24px] md:leading-normal md:text-[#0D0D0D]">
                  Turn off two-factor authentication?
                </h3>
                <p class="mt-3 max-w-[325px] text-[16px] leading-6 text-[#5A5A5A] md:mt-3 md:max-w-[451px] md:font-medium md:leading-[1.4] md:text-[rgba(13,13,13,0.7)]">
                  This will make your account less secure. You’ll only need your password to log in.
                </p>
              </div>
            </div>
          </div>

          <div class="bg-white px-4 pb-8 pt-[10px] md:flex md:justify-end md:gap-4 md:bg-transparent md:px-[13.5px] md:pb-[15px] md:pt-4">
            <div class="flex flex-col gap-3 md:hidden">
              <button
                type="button"
                (click)="disableTwoFactor()"
                [disabled]="isTwoFactorSubmitting()"
                class="h-[52px] w-full rounded-[64px] border border-white bg-[#FF2524] px-5 text-[16px] font-medium leading-6 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.opacity-70]="isTwoFactorSubmitting()"
              >
                Turn off
              </button>
              <button
                type="button"
                (click)="isTurnOffTwoFactorModalOpen.set(false)"
                class="h-[52px] w-full rounded-[64px] bg-[#F7F7F7] px-8 text-[16px] font-medium leading-6 text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              >
                Cancel
              </button>
            </div>

            <div class="hidden items-start justify-end gap-4 md:flex">
              <button
                type="button"
                (click)="isTurnOffTwoFactorModalOpen.set(false)"
                class="h-10 rounded-[64px] border border-[#EAEAEA] bg-white px-5 text-[14px] font-medium leading-5 text-black transition hover:bg-[#FAFAFA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="disableTwoFactor()"
                [disabled]="isTwoFactorSubmitting()"
                class="h-10 rounded-[64px] border border-white bg-[#FF2524] px-5 text-[14px] font-medium leading-5 text-white shadow-[0_4px_8px_rgba(173,35,35,0.4),0_0_0_1px_#E82A2A] transition hover:bg-[#F32322] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                [class.opacity-70]="isTwoFactorSubmitting()"
              >
                Turn off
              </button>
            </div>
          </div>
        </div>
      </div>
    }

    @if (isLogoutConfirmOpen()) {
      <div
        class="fixed inset-0 z-[220] flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
        (click)="isLogoutConfirmOpen.set(false)"
      >
        <div
          class="relative w-full overflow-hidden rounded-t-[36px] bg-white px-4 pb-8 pt-3 shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:max-w-[430px] md:rounded-[24px] md:px-6 md:pb-10 md:pt-8 md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-confirm-title"
          (click)="$event.stopPropagation()"
        >
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#E3E3E3] md:hidden"></div>

          <div class="mt-[26px] flex flex-col items-center text-center md:mt-0">
            <div class="relative h-[121px] w-[121px]">
              <div class="absolute inset-0 rounded-full bg-[#FFF1F1]"></div>
              <div class="absolute left-1/2 top-[15px] h-[91px] w-[91px] -translate-x-1/2 rounded-full bg-[#FFD9D9]"></div>
              <div class="absolute left-1/2 top-[35px] flex h-[52px] w-[52px] -translate-x-1/2 items-center justify-center rounded-[18px] bg-[#FF3131] shadow-[0_10px_24px_rgba(255,49,49,0.18)]">
                <svg class="h-7 w-7" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M14 5.25c.62 0 1.2.33 1.51.86l7.16 12.33c.62 1.06-.15 2.38-1.36 2.38H6.69c-1.21 0-1.98-1.32-1.36-2.38l7.16-12.33c.31-.53.89-.86 1.51-.86Z"
                    fill="white"
                    fill-opacity="0.22"
                  />
                  <path
                    d="M14 9.15v5.95"
                    stroke="white"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <circle cx="14" cy="18.25" r="1.4" fill="white"/>
                </svg>
              </div>
            </div>

            <h3 id="logout-confirm-title" class="mt-[14px] text-[24px] font-semibold leading-8 text-[#1F2230]">
              Are you sure?
            </h3>
            <p class="mt-3 max-w-[320px] text-[16px] leading-[1.2] text-[#5E5E5E] md:max-w-[332px]">
              Logging out will temporarily hide all your personal data, including matches and dates. To see again, simply log back in to your account.
            </p>
          </div>

          <div class="mt-8 space-y-3 md:mt-9">
            <button
              type="button"
              (click)="confirmLogout()"
              class="flex h-[52px] w-full items-center justify-center rounded-full border border-[#FF7B7B] bg-[linear-gradient(180deg,#FF6B73_0%,#FF5E67_100%)] px-5 text-[16px] font-semibold leading-6 text-white shadow-[0_6px_16px_rgba(255,95,103,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E67] focus-visible:ring-offset-2 md:h-11"
            >
              Log out
            </button>
            <button
              type="button"
              (click)="isLogoutConfirmOpen.set(false)"
              class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F5F5F5] px-5 text-[16px] font-semibold leading-6 text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D] md:h-11"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    }

    @if (isDeleteAccountConfirmOpen()) {
      <div
        class="fixed inset-0 z-[220] flex items-end justify-center bg-black/40 p-0 md:items-center md:p-4"
        (click)="isDeleteAccountConfirmOpen.set(false)"
      >
        <div
          class="relative w-full overflow-hidden rounded-t-[36px] bg-white px-4 pb-8 pt-3 shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)] md:max-w-[470px] md:rounded-[24px] md:px-6 md:pb-10 md:pt-8 md:shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-confirm-title"
          (click)="$event.stopPropagation()"
        >
          <div class="mx-auto h-1 w-[50px] rounded-full bg-[#E3E3E3] md:hidden"></div>

          <div class="mt-[22px] md:mt-0">
            <div class="relative h-[105px] w-[105px] md:h-[112px] md:w-[112px]">
              <div class="absolute inset-0 rounded-full bg-[#FFF1F1]"></div>
              <div class="absolute left-1/2 top-[12px] h-[80px] w-[80px] -translate-x-1/2 rounded-full bg-[#FFD9D9] md:top-[14px] md:h-[84px] md:w-[84px]"></div>
              <div class="absolute left-1/2 top-[31px] flex h-[46px] w-[46px] -translate-x-1/2 items-center justify-center rounded-[16px] bg-[#FF3131] shadow-[0_10px_24px_rgba(255,49,49,0.18)] md:top-[33px] md:h-[48px] md:w-[48px]">
                <svg class="h-6 w-6" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                  <path
                    d="M14 9.15v5.95"
                    stroke="white"
                    stroke-width="2.2"
                    stroke-linecap="round"
                  />
                  <circle cx="14" cy="18.25" r="1.4" fill="white"/>
                </svg>
              </div>
            </div>

            <h3 id="delete-account-confirm-title" class="mt-4 max-w-[290px] text-[24px] font-semibold leading-[1.15] text-[#1F2230] md:max-w-[360px]">
              Delete your Duduzili account?
            </h3>

            <div class="mt-6">
              <p class="text-[16px] leading-6 text-[#595959]">What’s going to happen:</p>
              <ul class="mt-4 list-disc space-y-4 pl-5 text-[16px] leading-[1.2] text-[#595959] marker:text-[#353535]">
                <li>Your account will be <span class="font-semibold text-[#2D2D2D]">deactivated immediately.</span></li>
                <li>It will be reactivated if you login <span class="font-semibold text-[#2D2D2D]">within 30 days.</span></li>
                <li>If you don’t login after 30 days, your data will be <span class="font-semibold text-[#2D2D2D]">permanently deleted.</span></li>
              </ul>
            </div>
          </div>

          <div class="mt-9 space-y-3">
            <button
              type="button"
              (click)="confirmDeleteAccount()"
              class="flex h-[52px] w-full items-center justify-center rounded-full border border-[#FF7B7B] bg-[linear-gradient(180deg,#FF6B73_0%,#FF5E67_100%)] px-5 text-[16px] font-semibold leading-6 text-white shadow-[0_6px_16px_rgba(255,95,103,0.32)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5E67] focus-visible:ring-offset-2"
            >
              Yes, delete my account
            </button>
            <button
              type="button"
              (click)="isDeleteAccountConfirmOpen.set(false)"
              class="flex h-[52px] w-full items-center justify-center rounded-full bg-[#F5F5F5] px-5 text-[16px] font-semibold leading-6 text-[#171717] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            >
              I changed my mind
            </button>
          </div>
        </div>
      </div>
    }

    @if (mobilePreferenceCategory(); as categoryId) {
      <div
        class="fixed inset-0 z-[220] flex items-end justify-center bg-black/40 p-0 md:hidden"
        (click)="mobilePreferenceCategory.set(null)"
      >
        <div
          class="relative w-full overflow-hidden rounded-t-[36px] bg-white pb-1 shadow-[0_-24px_70px_-42px_rgba(19,27,45,0.45)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notification-preference-sheet-title"
          (click)="$event.stopPropagation()"
        >
          <div class="absolute left-1/2 top-[10px] h-1 w-[50px] -translate-x-1/2 rounded-full bg-[#E3E3E3]"></div>

          <button
            type="button"
            (click)="mobilePreferenceCategory.set(null)"
            class="absolute right-4 top-[18px] z-10 flex h-[48px] w-[48px] items-center justify-center rounded-full border border-[#EFEFEF] bg-white shadow-[0_5px_14px_rgba(0,0,0,0.08)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
            aria-label="Close notification preference sheet"
          >
            <img ngSrc="/assets/icons/settings/modal-close.svg" width="24" height="24" alt="" aria-hidden="true">
          </button>

          <div class="px-4 pb-10 pt-[84px]">
            @if (mobilePreferenceCategoryConfig(); as category) {
              <div>
                <h3 id="notification-preference-sheet-title" class="text-[24px] font-semibold leading-8 text-[#1A1B1D]">
                  {{ category.label }}
                </h3>
                <p class="mt-[6px] text-[16px] font-normal leading-6 text-[#666666]">
                  {{ mobilePreferenceIntro(category) }}
                </p>

                <div class="mt-[28px] space-y-[24px]">
                  @for (channel of notificationPreferenceChannels; track channel.id) {
                    <div class="flex items-center justify-between gap-4">
                      <span class="flex min-w-0 items-center gap-4">
                        <span class="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full bg-[#F7F7F7]">
                          @switch (channel.id) {
                            @case ('sms') {
                              <svg class="h-5 w-5 text-[#1F1F1F]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <path d="M10 15.5c3.866 0 7-2.686 7-6s-3.134-6-7-6-7 2.686-7 6c0 1.59.72 3.036 1.896 4.105L4.5 16.5l2.653-1.326A8.073 8.073 0 0 0 10 15.5Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            }
                            @case ('email') {
                              <svg class="h-5 w-5 text-[#1F1F1F]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <rect x="3.25" y="5.25" width="13.5" height="9.5" rx="2.5" stroke="currentColor" stroke-width="1.4"/>
                                <path d="m5 7 5 4 5-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>
                            }
                            @default {
                              <svg class="h-5 w-5 text-[#1F1F1F]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                                <rect x="5.25" y="4.25" width="9.5" height="11.5" rx="2.75" stroke="currentColor" stroke-width="1.4"/>
                                <path d="M12.75 4.75h1.25a1.75 1.75 0 0 1 1.75 1.75V7.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                                <circle cx="12.75" cy="7.25" r="1.15" fill="currentColor"/>
                              </svg>
                            }
                          }
                        </span>

                        <span class="text-[17px] font-normal leading-6 text-[#444444]">
                          {{ channel.label }}
                        </span>
                      </span>

                      <button
                        type="button"
                        (click)="toggleNotificationPreference(category.id, channel.id)"
                        class="relative h-[20px] w-[34px] shrink-0 rounded-full transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1A1B1D]"
                        [class.bg-[#6453D9]]="isNotificationPreferenceEnabled(category.id, channel.id)"
                        [class.bg-[#ECECEC]]="!isNotificationPreferenceEnabled(category.id, channel.id)"
                        [attr.aria-pressed]="isNotificationPreferenceEnabled(category.id, channel.id)"
                        [attr.aria-label]="'Toggle ' + channel.label + ' notifications for ' + category.label"
                      >
                        <span
                          class="absolute top-[2px] h-[16px] w-[16px] rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.16)] transition"
                          [class.left-[16px]]="isNotificationPreferenceEnabled(category.id, channel.id)"
                          [class.left-[2px]]="!isNotificationPreferenceEnabled(category.id, channel.id)"
                        ></span>
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }

  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  private readonly router = inject(Router);
  private readonly authFlow = inject(AuthFlowService);
  private readonly appToastService = inject(AppToastService);
  private readonly authService = inject(AuthService);
  private readonly authSession = inject(AuthSessionService);
  private readonly adminSettingsService = inject(AdminSettingsService);
  protected readonly mobileBackRoute = computed(() => {
    const currentUrl = this.router.url.split('?')[0] ?? this.router.url;

    if (currentUrl.startsWith('/seller/')) {
      return '/seller/more';
    }

    if (currentUrl.startsWith('/admin/')) {
      return '/admin/more';
    }

    return '/more';
  });
  readonly activeTab = signal<SettingsTab>('profile');
  readonly mobileSettingsStep = signal<'menu' | 'profile' | 'security' | 'notifications' | 'platform' | 'locations'>('menu');
  readonly securityTab = signal<'password' | '2fa'>('password');
  readonly notificationsTab = signal<'method' | 'preferences'>('method');
  readonly currentPassword = signal('');
  readonly newPassword = signal('');
  readonly confirmPassword = signal('');
  readonly showNewPassword = signal(false);
  readonly selectedAuthMethod = signal<TwoFactorMethod>('sms');
  readonly isTwoFactorModalOpen = signal(false);
  readonly isTwoFactorEnabled = signal(false);
  readonly isTurnOffTwoFactorModalOpen = signal(false);
  readonly isPasswordSubmitting = signal(false);
  readonly isTwoFactorSubmitting = signal(false);
  readonly isNotificationSubmitting = signal(false);
  readonly isPlatformSettingSubmitting = signal(false);
  readonly isLogoutConfirmOpen = signal(false);
  readonly isDeleteAccountConfirmOpen = signal(false);
  readonly mobilePreferenceCategory = signal<NotificationPreferenceCategoryId | null>(null);
  readonly twoFactorEnabledDate = signal('');
  readonly twoFactorQrCode = signal<string | null>(null);
  readonly twoFactorManualSecret = signal<string | null>(null);
  readonly isKycRequired = signal(true);
  readonly isSubscriptionsEnabled = signal(true);
  readonly notificationSettings = signal<NotificationChannelSettings>({
    email: true,
    sms: false,
    push: true,
  });
  readonly notificationPreferences = signal<NotificationPreferenceSettings>({
    messages: { sms: true, email: true, push: true },
    listings: { sms: true, email: true, push: false },
    ads: { sms: true, email: true, push: true },
    buyerActivity: { sms: false, email: true, push: true },
    performance: { sms: true, email: false, push: true },
  });

  readonly profile = signal<ProfileSettingsData>({
    email: '',
    callNumber: '',
    whatsappNumber: '',
    fullName: '',
    avatar: null,
  });

  readonly modalMode = signal<ModalMode>(null);
  readonly isProfileSubmitting = signal(false);
  readonly isVerificationResending = signal(false);
  readonly verificationMode = signal<VerificationMode>(null);
  readonly verificationReturnMode = signal<Exclude<ModalMode, 'name' | null> | null>(null);
  readonly modalValue = signal('');
  readonly passwordChecks = computed(() => {
    const password = this.newPassword();

    return [
      { label: 'Lowercase letters', passed: /[a-z]/.test(password) },
      { label: 'Uppercase letters', passed: /[A-Z]/.test(password) },
      { label: 'Number', passed: /\d/.test(password) },
      { label: '8 characters minimum', passed: password.length >= 8 },
    ];
  });

  readonly passwordStrengthSegments = computed(() => {
    const passedCount = this.passwordChecks().filter(item => item.passed).length;

    return Array.from({ length: 4 }, (_, index) =>
      index < passedCount ? '#FCD53F' : '#F0F0F0',
    );
  });
  readonly authenticationMethods: AuthenticationMethodConfig[] = [
    {
      id: 'sms',
      label: 'SMS code',
      meta: '',
      description: 'Use your mobile phone to receive a text message with an authentication code to enter when you log in.',
      activeDescription: 'Verification codes are sent to this number when logging in from a new device.',
      warningMessage: 'Keep your phone number secure. If you lose access, you may be locked out of your account',
      iconSrc: '/assets/icons/settings/two-factor-call.svg',
    },
    {
      id: 'email',
      label: 'Email code',
      meta: '',
      description: 'Use your email to receive a verification code to enter when you log in.',
      activeDescription: 'Verification codes are sent to your email when logging in from a new device.',
      warningMessage: 'Keep your email access secure. If you lose access, you may be locked out of your account',
      iconSrc: '/assets/icons/settings/two-factor-sms.svg',
    },
    {
      id: 'app',
      label: 'Authenticator app',
      meta: '',
      description: 'Install an app to generate your verification code',
      activeDescription: 'Verification codes are sent to your authenticator app when logging in from a new device.',
      warningMessage: 'Keep your phone number secure. If you lose access, you may be locked out of your account',
      iconSrc: '/assets/icons/settings/two-factor-shield.svg',
    },
  ];
  readonly notificationMethods = [
    {
      id: 'email' as const,
      label: 'Email notifications',
      description: 'Receive notifications via email',
    },
    {
      id: 'sms' as const,
      label: 'SMS notifications',
      description: 'Receive notifications via SMS',
    },
    {
      id: 'push' as const,
      label: 'Push notifications',
      description: 'Get real-time updates and alerts directly on your device',
    },
  ];
  readonly notificationPreferenceChannels = [
    { id: 'sms' as const, label: 'SMS' },
    { id: 'email' as const, label: 'Email' },
    { id: 'push' as const, label: 'Push' },
  ];
  readonly notificationPreferenceCategories = [
    {
      id: 'messages' as const,
      label: 'Messages',
      description: 'Get updates on new messages, replies, and ongoing conversations with buyers',
    },
    {
      id: 'listings' as const,
      label: 'Listings',
      description: 'Stay informed about your listings, including status changes, reports, and performance updates',
    },
    {
      id: 'ads' as const,
      label: 'Ads & Promotions',
      description: 'Get notified when your ads are approved, go live, are rejected, or about to expire',
    },
    {
      id: 'buyerActivity' as const,
      label: 'Buyer Activity',
      description: 'Know when buyers save your listings, follow your store, or show interest',
    },
    {
      id: 'performance' as const,
      label: 'Performance',
      description: 'Receive summaries and insights on how your listings and ads are performing',
    },
  ];
  readonly isAdminSettingsView = computed(() => this.router.url.split('?')[0]?.startsWith('/admin/') ?? false);
  readonly mobileMenuItems = computed(() => {
    const items: Array<{ id: SettingsTab; label: string; iconSrc: string }> = [
      { id: 'profile', label: 'Profile settings', iconSrc: '/assets/icons/settings/mobile-profile.svg' },
      { id: 'security', label: 'Security', iconSrc: '/assets/icons/settings/mobile-security.svg' },
      { id: 'notifications', label: 'Notifications', iconSrc: '/assets/icons/settings/mobile-notifications.svg' },
    ];

    if (this.isAdminSettingsView()) {
      items.push({
        id: 'platform',
        label: 'Platform',
        iconSrc: '/assets/icons/settings/mobile-security.svg',
      });
      items.push({
        id: 'locations',
        label: 'Locations',
        iconSrc: '/assets/icons/settings/settings-nav-profile.svg',
      });
    }

    return items;
  });

  constructor() {
    void this.loadProfile();
    void this.loadTwoFactorStatus();
    if (this.isAdminSettingsView()) {
      void this.loadAdminSiteConfiguration();
    }
  }

  openMobileMenuItem(tab: SettingsTab): void {
    this.activeTab.set(tab);

    if (tab === 'profile') {
      this.mobileSettingsStep.set('profile');
      return;
    }

    if (tab === 'security') {
      this.securityTab.set('password');
      this.mobileSettingsStep.set('security');
      return;
    }

    if (tab === 'platform') {
      this.mobileSettingsStep.set('platform');
      return;
    }

    if (tab === 'locations') {
      this.mobileSettingsStep.set('locations');
      return;
    }

    this.notificationsTab.set('method');
    this.mobileSettingsStep.set('notifications');
  }

  readonly twoFactorDestination = computed(() => {
    switch (this.selectedAuthMethod()) {
      case 'email':
        return this.profile().email;
      case 'app':
        return 'your authenticator app';
      default:
        return this.profile().callNumber || 'your phone number';
    }
  });
  readonly activeAuthMethodConfig = computed(
    () => this.authenticationMethods.find(method => method.id === this.selectedAuthMethod()) ?? this.authenticationMethods[0],
  );
  readonly mobilePreferenceCategoryConfig = computed(
    () =>
      this.notificationPreferenceCategories.find(category => category.id === this.mobilePreferenceCategory()) ?? null,
  );

  readonly currentModalConfig = computed(() => {
    const profile = this.profile();

    switch (this.modalMode()) {
      case 'name':
        return {
          title: 'Update full name',
          description: 'Please update to the full name as it appears on your birth certificate.',
          fieldLabel: 'Full name',
          value: this.modalValue(),
          inputType: 'text' as const,
          confirmLabel: 'Update',
          showDropdown: true,
        };
      case 'call-add':
        return {
          title: 'Add call number',
          description: 'You’ll use this number to get notifications, calls and recover your account when necessary. We’ll send you a code to confirm this.',
          fieldLabel: 'Phone number',
          value: this.modalValue(),
          inputType: 'tel' as const,
          confirmLabel: 'Add number',
          showDropdown: true,
        };
      case 'call-update':
        return {
          title: 'Update call number',
          description: 'You’ll use this number to get notifications, calls and recover your account when necessary',
          fieldLabel: 'Phone number',
          value: this.modalValue(),
          inputType: 'tel' as const,
          confirmLabel: 'Continue',
          showDropdown: true,
        };
      case 'whatsapp-add':
        return {
          title: 'Add WhatsApp number',
          description: 'You’ll use this number to receive WhatsApp messages from buyers',
          fieldLabel: 'Phone number',
          value: this.modalValue(),
          inputType: 'tel' as const,
          confirmLabel: 'Add number',
          showDropdown: true,
        };
      case 'whatsapp-update':
        return {
          title: 'Update WhatsApp number',
          description: 'You’ll use this number to receive WhatsApp messages from buyers',
          fieldLabel: 'Phone number',
          value: this.modalValue(),
          inputType: 'tel' as const,
          confirmLabel: 'Continue',
          showDropdown: true,
        };
      case 'email':
        return {
          title: 'Update email',
          description: 'You’ll use this email to get notifications, sign in and recover your account when necessary',
          fieldLabel: 'Email',
          value: this.modalValue() || profile.email,
          inputType: 'email' as const,
          confirmLabel: 'Continue',
          showDropdown: true,
        };
      default:
        return null;
    }
  });

  readonly currentVerificationConfig = computed(() => {
    switch (this.verificationMode()) {
      case 'email':
        return {
          destination: this.modalValue(),
        };
      case 'call':
      case 'whatsapp':
        return {
          destination: this.modalValue(),
        };
      default:
        return null;
    }
  });

  openModal(action: 'edit-name' | 'edit-email' | 'edit-call' | 'edit-whatsapp'): void {
    const profile = this.profile();

    switch (action) {
      case 'edit-name':
        this.modalMode.set('name');
        this.modalValue.set(profile.fullName);
        break;
      case 'edit-email':
        this.modalMode.set('email');
        this.modalValue.set(profile.email);
        break;
      case 'edit-call':
        this.modalMode.set(profile.callNumber ? 'call-update' : 'call-add');
        this.modalValue.set(profile.callNumber);
        break;
      case 'edit-whatsapp':
        this.modalMode.set(profile.whatsappNumber ? 'whatsapp-update' : 'whatsapp-add');
        this.modalValue.set(profile.whatsappNumber);
        break;
    }
  }

  async handleModalConfirm(): Promise<void> {
    this.isProfileSubmitting.set(true);
    try {
      switch (this.modalMode()) {
        case 'name':
          if (!(await this.persistProfileChanges({ full_name: this.modalValue() }))) {
            return;
          }

          this.showToast('Profile updated successfully');
          this.modalMode.set(null);
          break;
        case 'call-add':
          if (!(await this.persistProfileChanges({ phone_number: this.modalValue() }))) {
            return;
          }

          this.verificationReturnMode.set('call-add');
          this.verificationMode.set('call');
          this.modalMode.set(null);
          break;
        case 'whatsapp-add':
          if (!(await this.persistProfileChanges({ whatsapp_number: this.modalValue() }))) {
            return;
          }

          this.verificationReturnMode.set('whatsapp-add');
          this.verificationMode.set('whatsapp');
          this.modalMode.set(null);
          break;
        case 'call-update':
          if (!(await this.persistProfileChanges({ phone_number: this.modalValue() }))) {
            return;
          }

          this.verificationReturnMode.set('call-update');
          this.verificationMode.set('call');
          this.modalMode.set(null);
          break;
        case 'whatsapp-update':
          if (!(await this.persistProfileChanges({ whatsapp_number: this.modalValue() }))) {
            return;
          }

          this.verificationReturnMode.set('whatsapp-update');
          this.verificationMode.set('whatsapp');
          this.modalMode.set(null);
          break;
        case 'email':
          if (!(await this.persistProfileChanges({ email: this.modalValue() }))) {
            return;
          }

          this.verificationReturnMode.set('email');
          this.verificationMode.set('email');
          this.modalMode.set(null);
          break;
        default:
          break;
      }
    } finally {
      this.isProfileSubmitting.set(false);
    }
  }

  handleVerificationBack(): void {
    switch (this.verificationMode()) {
      case 'email':
        this.modalMode.set('email');
        break;
      case 'call':
        this.modalMode.set(
          this.verificationReturnMode() === 'call-add' ? 'call-add' : 'call-update',
        );
        break;
      case 'whatsapp':
        this.modalMode.set(
          this.verificationReturnMode() === 'whatsapp-add' ? 'whatsapp-add' : 'whatsapp-update',
        );
        break;
      default:
        break;
    }

    this.verificationMode.set(null);
    this.verificationReturnMode.set(null);
  }

  async completeVerification(otpCode: string): Promise<void> {
    this.isProfileSubmitting.set(true);
    try {
      if (!(await this.confirmProfileOtp(otpCode))) {
        return;
      }

      switch (this.verificationMode()) {
        case 'email':
          await this.refreshProfileFromBackend();
          this.showToast('Profile updated successfully');
          break;
        case 'call':
          await this.refreshProfileFromBackend();
          this.showToast(
            this.verificationReturnMode() === 'call-add'
              ? 'Phone number added successfully'
              : 'Phone number updated successfully',
          );
          break;
        case 'whatsapp':
          await this.refreshProfileFromBackend();
          this.showToast(
            this.verificationReturnMode() === 'whatsapp-add'
              ? 'Phone number added successfully'
              : 'Phone number updated successfully',
          );
          break;
        default:
          break;
      }

      this.verificationMode.set(null);
      this.verificationReturnMode.set(null);
    } finally {
      this.isProfileSubmitting.set(false);
    }
  }

  async resendVerificationCode(): Promise<void> {
    if (this.isVerificationResending() || this.isProfileSubmitting()) {
      return;
    }

    const payload = this.currentVerificationPayload();
    if (!payload) {
      this.showToast('We couldn’t resend the code right now. Please try again.');
      return;
    }

    this.isVerificationResending.set(true);
    try {
      await firstValueFrom(this.authService.updateProfile(payload));
      this.showToast('We sent a new verification code.');
    } catch (error: unknown) {
      this.showToast(this.extractSettingsErrorMessage(error, 'We couldn’t resend the code right now. Please try again.'));
    } finally {
      this.isVerificationResending.set(false);
    }
  }

  updateNewPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newPassword.set(input.value);
  }

  updateCurrentPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.currentPassword.set(input.value);
  }

  updateConfirmPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmPassword.set(input.value);
  }

  resetPasswordForm(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
  }

  async submitPasswordChange(): Promise<void> {
    if (this.isPasswordSubmitting()) {
      return;
    }

    const payload: ChangePasswordRequest = {
      old_password: this.currentPassword().trim(),
      new_password: this.newPassword(),
      confirm_password: this.confirmPassword(),
    };

    if (!payload.old_password || !payload.new_password || !payload.confirm_password) {
      this.showToast('Please complete all password fields.');
      return;
    }

    this.isPasswordSubmitting.set(true);
    try {
      await firstValueFrom(this.authService.changePassword(payload));
      this.resetPasswordForm();
      this.showToast('Password updated successfully');
      await this.authFlow.logout();
    } catch (error: unknown) {
      this.showToast(this.extractSettingsErrorMessage(error, 'Your password couldn’t be updated right now. Please try again.'));
    } finally {
      this.isPasswordSubmitting.set(false);
    }
  }

  async beginTwoFactorSetup(): Promise<void> {
    if (this.isTwoFactorSubmitting()) {
      return;
    }

    this.isTwoFactorSubmitting.set(true);
    try {
      const method = this.toTwoFactorApiMethod(this.selectedAuthMethod());
      const payload = {
        method,
        phone_number: method === 'sms' ? this.profile().callNumber : undefined,
      };
      const response = await firstValueFrom(this.authService.setupTwoFactor(payload));
      this.twoFactorQrCode.set(response.qr_code ?? null);
      this.twoFactorManualSecret.set(response.secret ?? null);
      this.isTwoFactorModalOpen.set(true);
    } catch (error: unknown) {
      this.showToast(this.extractSettingsErrorMessage(error, 'We couldn’t start two-factor setup right now. Please try again.'));
    } finally {
      this.isTwoFactorSubmitting.set(false);
    }
  }

  async completeTwoFactorSetup(code: string): Promise<void> {
    if (this.isTwoFactorSubmitting()) {
      return;
    }

    this.isTwoFactorSubmitting.set(true);
    try {
      const response = await firstValueFrom(this.authService.enableTwoFactor({ code }));
      this.isTwoFactorModalOpen.set(false);
      this.isTwoFactorEnabled.set(true);
      this.twoFactorEnabledDate.set(this.formatEnabledDate(response.enabled_at));
      this.showToast('2-Factor Authentication enabled successfully');
    } catch (error: unknown) {
      this.showToast(this.extractSettingsErrorMessage(error, 'We couldn’t verify that two-factor code right now. Please try again.'));
    } finally {
      this.isTwoFactorSubmitting.set(false);
    }
  }

  async disableTwoFactor(): Promise<void> {
    if (this.isTwoFactorSubmitting()) {
      return;
    }

    this.isTwoFactorSubmitting.set(true);
    try {
      await firstValueFrom(this.authService.disableTwoFactor());
      this.isTurnOffTwoFactorModalOpen.set(false);
      this.isTwoFactorEnabled.set(false);
      this.twoFactorEnabledDate.set('');
      this.showToast('2-Factor Authentication disabled successfully');
    } catch (error: unknown) {
      this.showToast(this.extractSettingsErrorMessage(error, 'We couldn’t turn off two-factor authentication right now. Please try again.'));
    } finally {
      this.isTwoFactorSubmitting.set(false);
    }
  }

  async toggleNotificationMethod(method: NotificationChannelId): Promise<void> {
    const previousSettings = this.notificationSettings();
    const nextSettings: NotificationChannelSettings = {
      ...previousSettings,
      [method]: !previousSettings[method],
    };

    this.notificationSettings.set(nextSettings);
    const didPersist = await this.persistNotificationSettings({
      notification_channels: nextSettings,
    });

    if (!didPersist) {
      this.notificationSettings.set(previousSettings);
    }
  }

  isNotificationMethodEnabled(method: 'email' | 'sms' | 'push'): boolean {
    return this.notificationSettings()[method];
  }

  mobilePreferenceIntro(category: { label: string }): string {
    return `Notify me about ${category.label.toLowerCase()} via:`;
  }

  async toggleNotificationPreference(
    category: NotificationPreferenceCategoryId,
    channel: NotificationChannelId,
  ): Promise<void> {
    const previousPreferences = this.notificationPreferences();
    const nextPreferences: NotificationPreferenceSettings = {
      ...previousPreferences,
      [category]: {
        ...previousPreferences[category],
        [channel]: !previousPreferences[category][channel],
      },
    };

    this.notificationPreferences.set(nextPreferences);
    const didPersist = await this.persistNotificationSettings({
      notification_preferences: nextPreferences,
    });

    if (!didPersist) {
      this.notificationPreferences.set(previousPreferences);
    }
  }

  async confirmLogout(): Promise<void> {
    this.isLogoutConfirmOpen.set(false);
    await this.authFlow.logout();
  }

  confirmDeleteAccount(): void {
    this.isDeleteAccountConfirmOpen.set(false);
    this.showToast('Account deactivated successfully');
    void this.router.navigate(['/sign-in']);
  }

  async toggleKycRequirement(): Promise<void> {
    if (!this.isAdminSettingsView() || this.isPlatformSettingSubmitting()) {
      return;
    }

    const previousValue = this.isKycRequired();
    const nextValue = !previousValue;

    this.isKycRequired.set(nextValue);

    this.isPlatformSettingSubmitting.set(true);
    try {
      const response = await firstValueFrom(
        this.adminSettingsService.updateSiteConfiguration({ kyc_required: nextValue }),
      );
      this.isKycRequired.set(response.kyc_required);
      this.showToast(`KYC requirement ${response.kyc_required ? 'enabled' : 'disabled'} successfully`);
    } catch {
      this.isKycRequired.set(previousValue);
      this.showToast('The KYC setting couldn’t be updated right now. Please try again.');
    } finally {
      this.isPlatformSettingSubmitting.set(false);
    }
  }

  async toggleSubscriptionsEnabled(): Promise<void> {
    if (!this.isAdminSettingsView() || this.isPlatformSettingSubmitting()) {
      return;
    }

    const previousValue = this.isSubscriptionsEnabled();
    const nextValue = !previousValue;

    this.isSubscriptionsEnabled.set(nextValue);

    this.isPlatformSettingSubmitting.set(true);
    try {
      const response = await firstValueFrom(
        this.adminSettingsService.updateSiteConfiguration({ subscriptions_enabled: nextValue }),
      );
      this.isSubscriptionsEnabled.set(response.subscriptions_enabled);
      this.showToast(`Subscriptions ${response.subscriptions_enabled ? 'enabled' : 'disabled'} successfully`);
    } catch {
      this.isSubscriptionsEnabled.set(previousValue);
      this.showToast('The subscription setting couldn’t be updated right now. Please try again.');
    } finally {
      this.isPlatformSettingSubmitting.set(false);
    }
  }

  isNotificationPreferenceEnabled(
    category: NotificationPreferenceCategoryId,
    channel: NotificationChannelId,
  ): boolean {
    return this.notificationPreferences()[category][channel];
  }

  private showToast(message: string): void {
    this.appToastService.show({ message, durationMs: 2600 });
  }

  private async loadAdminSiteConfiguration(): Promise<void> {
    if (!this.isAdminSettingsView()) {
      return;
    }

    try {
      const response = await firstValueFrom(this.adminSettingsService.getSiteConfiguration());
      this.isKycRequired.set(response.kyc_required);
      this.isSubscriptionsEnabled.set(response.subscriptions_enabled);
    } catch {
      this.isKycRequired.set(true);
      this.isSubscriptionsEnabled.set(true);
    }
  }

  private async loadProfile(): Promise<void> {
    try {
      const response = await firstValueFrom(this.authService.getProfile());
      this.authSession.initializeFromProfile(response);
      this.hydrateProfileFromUser(this.resolveProfileUser(response));
    } catch {
      this.hydrateProfileFromUser(this.authSession.user());
    }
  }

  private async loadTwoFactorStatus(): Promise<void> {
    try {
      const response = await firstValueFrom(this.authService.getTwoFactorStatus());
      this.syncTwoFactorStatus(response);
    } catch {
      this.isTwoFactorEnabled.set(false);
      this.twoFactorEnabledDate.set('');
    }
  }

  private hydrateProfileFromUser(user: AuthUser | null): void {
    if (!user) {
      return;
    }

    const phoneNumber = user.phone_number?.trim() ?? '';
    const whatsappNumber = user.whatsapp_number?.trim() ?? '';
    const fullName = user.full_name?.trim() ?? '';

    this.profile.set({
      email: user.email,
      callNumber: phoneNumber,
      whatsappNumber,
      fullName,
      avatar: user.avatar,
    });
    this.notificationSettings.set(this.normalizeNotificationChannels(user.notification_channels));
    this.notificationPreferences.set(
      this.normalizeNotificationPreferences(user.notification_preferences),
    );
  }

  private async persistProfileChanges(payload: UpdateProfileRequest | FormData): Promise<boolean> {
    try {
      const response = await firstValueFrom(this.authService.updateProfile(payload));
      this.authSession.initializeFromProfile(response);
      this.hydrateProfileFromUser(this.resolveProfileUser(response));
      return true;
    } catch {
      this.showToast('Your profile couldn’t be updated right now. Please try again.');
      return false;
    }
  }

  async onAvatarChange(file: File): Promise<void> {
    const formData = new FormData();
    formData.append('avatar', file);

    const success = await this.persistProfileChanges(formData);
    if (success) {
      this.showToast('Profile photo updated successfully.');
    }
  }

  private async persistNotificationSettings(
    payload: Pick<UpdateProfileRequest, 'notification_channels' | 'notification_preferences'>,
  ): Promise<boolean> {
    if (this.isNotificationSubmitting()) {
      return false;
    }

    this.isNotificationSubmitting.set(true);
    try {
      const response = await firstValueFrom(this.authService.updateProfile(payload));
      this.authSession.initializeFromProfile(response);
      this.hydrateProfileFromUser(this.resolveProfileUser(response));
      return true;
    } catch {
      this.showToast('Your notification settings couldn’t be updated right now. Please try again.');
      return false;
    } finally {
      this.isNotificationSubmitting.set(false);
    }
  }

  private async confirmProfileOtp(otpCode: string): Promise<boolean> {
    const verificationType = this.currentVerificationType();
    if (!verificationType) {
      return false;
    }

    try {
      await firstValueFrom(
        this.authService.verifyProfileOtp({
          type: verificationType,
          otp_code: otpCode,
        }),
      );
      return true;
    } catch {
      this.showToast('We couldn’t verify that code right now. Please try again.');
      return false;
    }
  }

  private async refreshProfileFromBackend(): Promise<void> {
    try {
      const response = await firstValueFrom(this.authService.getProfile());
      this.authSession.initializeFromProfile(response);
      this.hydrateProfileFromUser(this.resolveProfileUser(response));
    } catch {
      // Keep the optimistic profile state if the refresh request fails.
    }
  }

  private syncTwoFactorStatus(response: {
    is_enabled: boolean;
    method?: 'sms' | 'email' | 'authenticator' | null;
    enabled_at?: string | null;
    phone_number?: string | null;
  }): void {
    this.isTwoFactorEnabled.set(response.is_enabled === true);
    this.twoFactorEnabledDate.set(this.formatEnabledDate(response.enabled_at));
    this.twoFactorQrCode.set(null);
    this.twoFactorManualSecret.set(null);

    const method = this.fromTwoFactorApiMethod(response.method);
    if (method) {
      this.selectedAuthMethod.set(method);
    }

    const phoneNumber = this.readString(response.phone_number);
    if (phoneNumber) {
      this.profile.update((profile) => ({
        ...profile,
        callNumber: profile.callNumber || phoneNumber,
      }));
    }
  }

  private currentVerificationType(): 'phone' | 'whatsapp' | 'email' | null {
    switch (this.verificationMode()) {
      case 'call':
        return 'phone';
      case 'whatsapp':
        return 'whatsapp';
      case 'email':
        return 'email';
      default:
        return null;
    }
  }

  private currentVerificationPayload(): UpdateProfileRequest | null {
    const value = this.modalValue().trim();
    if (!value) {
      return null;
    }

    switch (this.verificationMode()) {
      case 'call':
        return { phone_number: value };
      case 'whatsapp':
        return { whatsapp_number: value };
      case 'email':
        return { email: value };
      default:
        return null;
    }
  }

  private toTwoFactorApiMethod(method: TwoFactorMethod): 'sms' | 'email' | 'authenticator' {
    switch (method) {
      case 'app':
        return 'authenticator';
      case 'email':
        return 'email';
      default:
        return 'sms';
    }
  }

  private fromTwoFactorApiMethod(method: 'sms' | 'email' | 'authenticator' | null | undefined): TwoFactorMethod | null {
    switch (method) {
      case 'authenticator':
        return 'app';
      case 'email':
        return 'email';
      case 'sms':
        return 'sms';
      default:
        return null;
    }
  }

  private formatEnabledDate(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return new Intl.DateTimeFormat('en-NG', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  }

  private normalizeNotificationChannels(value: unknown): NotificationChannelSettings {
    const record = this.readRecord(value);
    return {
      email: this.readBoolean(record?.['email']) ?? true,
      sms: this.readBoolean(record?.['sms']) ?? false,
      push: this.readBoolean(record?.['push']) ?? true,
    };
  }

  private normalizeNotificationPreferences(value: unknown): NotificationPreferenceSettings {
    const record = this.readRecord(value);
    return {
      messages: this.normalizeNotificationChannelGroup(record?.['messages'], {
        sms: true,
        email: true,
        push: true,
      }),
      listings: this.normalizeNotificationChannelGroup(record?.['listings'], {
        sms: true,
        email: true,
        push: false,
      }),
      ads: this.normalizeNotificationChannelGroup(record?.['ads'], {
        sms: true,
        email: true,
        push: true,
      }),
      buyerActivity: this.normalizeNotificationChannelGroup(record?.['buyerActivity'], {
        sms: false,
        email: true,
        push: true,
      }),
      performance: this.normalizeNotificationChannelGroup(record?.['performance'], {
        sms: true,
        email: false,
        push: true,
      }),
    };
  }

  private normalizeNotificationChannelGroup(
    value: unknown,
    fallback: NotificationChannelSettings,
  ): NotificationChannelSettings {
    const record = this.readRecord(value);
    return {
      sms: this.readBoolean(record?.['sms']) ?? fallback.sms,
      email: this.readBoolean(record?.['email']) ?? fallback.email,
      push: this.readBoolean(record?.['push']) ?? fallback.push,
    };
  }

  private extractSettingsErrorMessage(error: unknown, fallback: string): string {
    if (typeof error !== 'object' || error === null) {
      return fallback;
    }

    const errorRecord = error as Record<string, unknown>;
    const responseError =
      typeof errorRecord['error'] === 'object' && errorRecord['error'] !== null
        ? (errorRecord['error'] as Record<string, unknown>)
        : null;

    const detail = this.readString(responseError?.['detail']);
    if (detail) {
      return detail;
    }

    const code = this.readString(responseError?.['code']);
    if (code) {
      return code;
    }

    for (const key of ['old_password', 'new_password', 'confirm_password', 'phone_number'] as const) {
      const values = this.readStringArray(responseError?.[key]);
      if (values.length > 0) {
        return values[0];
      }
    }

    return fallback;
  }

  private resolveProfileUser(response: ProfileResponse): AuthUser | null {
    if (this.isAuthUser(response)) {
      return response;
    }

    return this.isAuthUser(response.user) ? response.user : null;
  }

  private isAuthUser(value: unknown): value is AuthUser {
    if (!value || typeof value !== 'object') {
      return false;
    }

    const candidate = value as Partial<AuthUser>;
    return (
      typeof candidate.id === 'number'
      && typeof candidate.username === 'string'
      && typeof candidate.email === 'string'
    );
  }

  private readString(value: unknown): string | null {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
  }

  private readStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
  }

  private readRecord(value: unknown): Record<string, unknown> | null {
    return typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : null;
  }

  private readBoolean(value: unknown): boolean | null {
    return typeof value === 'boolean' ? value : null;
  }
}
