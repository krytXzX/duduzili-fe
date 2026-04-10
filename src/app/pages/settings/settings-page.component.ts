import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  heroAdjustmentsHorizontal,
  heroBell,
  heroDevicePhoneMobile,
  heroEnvelope,
  heroEye,
  heroLockClosed,
  heroShieldCheck,
} from '@ng-icons/heroicons/outline';
import { SettingsNavComponent, SettingsTab } from './components/settings-nav.component';
import {
  ProfileSettingsData,
  ProfileSettingsPanelComponent,
} from './components/profile-settings-panel.component';
import { SettingsActionModalComponent } from './components/settings-action-modal.component';
import {
  SettingsTwoFactorModalComponent,
} from './components/settings-two-factor-modal.component';
import { SettingsVerificationModalComponent } from './components/settings-verification-modal.component';

type ModalMode =
  | 'name'
  | 'email'
  | 'call-add'
  | 'call-update'
  | 'whatsapp-add'
  | 'whatsapp-update'
  | null;

type VerificationMode = 'email' | 'call' | 'whatsapp' | null;

@Component({
  selector: 'app-settings-page',
  imports: [
    CommonModule,
    NgIcon,
    SettingsNavComponent,
    ProfileSettingsPanelComponent,
    SettingsActionModalComponent,
    SettingsTwoFactorModalComponent,
    SettingsVerificationModalComponent,
  ],
  providers: [
    provideIcons({
      heroEye,
      heroLockClosed,
      heroShieldCheck,
      heroBell,
      heroAdjustmentsHorizontal,
      heroDevicePhoneMobile,
      heroEnvelope,
    }),
  ],
  template: `
    <div class="flex h-full flex-col rounded-[32px] border border-gray-100/60 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div class="border-b border-[#F0F0F2] px-8 py-6">
        <h1 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Account settings</h1>
      </div>

      <div class="flex-1 overflow-y-auto px-4 py-5 sm:px-8 sm:py-6">
        <div class="grid gap-8 xl:grid-cols-[200px_minmax(0,1fr)]">
          <app-settings-nav
            [activeTab]="activeTab()"
            (tabChange)="activeTab.set($event)"
          ></app-settings-nav>

          <div>
            @if (activeTab() === 'profile') {
              <app-profile-settings-panel
                [profile]="profile()"
                (action)="openModal($event)"
              ></app-profile-settings-panel>
            } @else if (activeTab() === 'security') {
              <section>
                <h2 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Security</h2>
                <p class="mt-1 text-[12px] font-medium text-[#A2A7B0]">
                  Update password and/or enable 2FA for enhanced account security
                </p>

                <div class="mt-8 max-w-[520px]">
                  <div class="flex items-center gap-8 border-b border-[#ECEEF3]">
                    <button
                      type="button"
                      (click)="securityTab.set('password')"
                      class="inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-semibold transition"
                      [class.border-[#6B5CF0]]="securityTab() === 'password'"
                      [class.text-[#6B5CF0]]="securityTab() === 'password'"
                      [class.border-transparent]="securityTab() !== 'password'"
                      [class.text-[#A2A7B0]]="securityTab() !== 'password'"
                    >
                      <ng-icon name="heroLockClosed" class="text-sm"></ng-icon>
                      Password
                    </button>

                    <button
                      type="button"
                      (click)="securityTab.set('2fa')"
                      class="inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-semibold transition"
                      [class.border-[#6B5CF0]]="securityTab() === '2fa'"
                      [class.text-[#6B5CF0]]="securityTab() === '2fa'"
                      [class.border-transparent]="securityTab() !== '2fa'"
                      [class.text-[#A2A7B0]]="securityTab() !== '2fa'"
                    >
                      <ng-icon name="heroShieldCheck" class="text-sm"></ng-icon>
                      2-Factor Authentication
                    </button>
                  </div>

                  @if (securityTab() === 'password') {
                    <div class="mt-8">
                      <h3 class="text-[18px] font-black tracking-tight text-[#1A1C21]">Change password</h3>

                      <div class="mt-5 space-y-6">
                        <div>
                          <label for="current-password" class="mb-2 block text-[13px] font-semibold text-[#6F747D]">
                            Enter current password
                          </label>
                          <input
                            id="current-password"
                            type="password"
                            [value]="currentPassword()"
                            class="w-full rounded-[12px] border border-[#E8EAF0] bg-white px-4 py-3 text-[13px] font-medium text-[#2A2D34] outline-none"
                          >
                        </div>

                        <div>
                          <label for="new-password" class="mb-2 block text-[13px] font-semibold text-[#6F747D]">
                            Enter new password
                          </label>
                          <div class="flex items-center gap-2 rounded-[12px] border border-[#6B5CF0] bg-white px-4 py-3">
                            <input
                              id="new-password"
                              [type]="showNewPassword() ? 'text' : 'password'"
                              [value]="newPassword()"
                              (input)="updateNewPassword($event)"
                              class="min-w-0 flex-1 bg-transparent text-[13px] font-medium text-[#2A2D34] outline-none"
                            >
                            <button
                              type="button"
                              (click)="showNewPassword.update(value => !value)"
                              class="text-[#969BA5] transition hover:text-[#6B5CF0]"
                              aria-label="Toggle password visibility"
                            >
                              <ng-icon name="heroEye" class="text-base"></ng-icon>
                            </button>
                          </div>

                          <div class="mt-3">
                            <p class="text-[12px] font-medium text-[#A2A7B0]">Password strength</p>
                            <div class="mt-2 flex gap-1.5">
                              @for (segment of passwordStrengthSegments(); track $index) {
                                <span class="h-1.5 w-8 rounded-full" [style.background]="segment"></span>
                              }
                            </div>
                          </div>

                          <div class="mt-4 flex flex-wrap gap-2">
                            @for (item of passwordChecks(); track item.label) {
                              <span
                                class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-medium"
                                [class.border-[#E4F3E8]]="item.passed"
                                [class.bg-[#F5FCF7]]="item.passed"
                                [class.text-[#6F747D]]="item.passed"
                                [class.border-[#ECEEF3]]="!item.passed"
                                [class.bg-white]="!item.passed"
                                [class.text-[#A7ACB5]]="!item.passed"
                              >
                                <span
                                  class="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
                                  [class.bg-[#32B34A]]="item.passed"
                                  [class.bg-[#D8DBE1]]="!item.passed"
                                >
                                  {{ item.passed ? '✓' : '×' }}
                                </span>
                                {{ item.label }}
                              </span>
                            }
                          </div>
                        </div>

                        <div>
                          <label for="confirm-password" class="mb-2 block text-[13px] font-semibold text-[#6F747D]">
                            Confirm new password
                          </label>
                          <input
                            id="confirm-password"
                            type="password"
                            [value]="confirmPassword()"
                            (input)="updateConfirmPassword($event)"
                            class="w-full rounded-[12px] border border-[#E8EAF0] bg-white px-4 py-3 text-[13px] font-medium text-[#2A2D34] outline-none"
                          >
                        </div>
                      </div>

                      <div class="mt-8 grid max-w-[406px] grid-cols-2 gap-3">
                        <button
                          type="button"
                          (click)="resetPasswordForm()"
                          class="rounded-full border border-[#E7EAF0] bg-white px-4 py-3 text-[13px] font-semibold text-[#2F333B] transition hover:bg-[#FAFAFC]"
                        >
                          Discard
                        </button>
                        <button
                          type="button"
                          class="rounded-full bg-[#6653E4] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
                        >
                          Update and logout
                        </button>
                      </div>
                    </div>
                  } @else {
                    <div class="mt-8 max-w-[520px]">
                      @if (!isTwoFactorEnabled()) {
                        <h3 class="text-[18px] font-black tracking-tight text-[#1A1C21]">
                          Select an authentication method
                        </h3>
                        <p class="mt-2 max-w-[470px] text-[13px] font-medium leading-6 text-[#8D929B]">
                          Turning this on will require an additional verification code when you log in from an untrusted device.
                        </p>

                        <div class="mt-6 space-y-5">
                          @for (method of authenticationMethods; track method.id) {
                            <button
                              type="button"
                              (click)="selectedAuthMethod.set(method.id)"
                              class="flex w-full items-start justify-between rounded-[20px] border px-4 py-5 text-left transition"
                              [class.border-[#8A7BF6]]="selectedAuthMethod() === method.id"
                              [class.bg-[#FAF8FF]]="selectedAuthMethod() === method.id"
                              [class.border-[#ECEEF3]]="selectedAuthMethod() !== method.id"
                              [class.bg-white]="selectedAuthMethod() !== method.id"
                            >
                              <div class="flex items-start gap-4">
                                <span class="flex h-10 w-10 items-center justify-center rounded-full border border-[#E7EAF0] bg-white text-[#A3A8B1]">
                                  <ng-icon [name]="method.icon" class="text-base"></ng-icon>
                                </span>
                                <div>
                                  <p class="text-[14px] font-semibold text-[#2A2D34]">
                                    {{ method.label }}
                                    @if (method.meta) {
                                      <span class="font-medium text-[#A3A8B1]">{{ method.meta }}</span>
                                    }
                                  </p>
                                  <p class="mt-1 max-w-[320px] text-[12px] font-medium leading-5 text-[#A3A8B1]">
                                    {{ method.description }}
                                  </p>
                                </div>
                              </div>

                              <span
                                class="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                                [class.border-[#6B5CF0]]="selectedAuthMethod() === method.id"
                                [class.border-[#D8DCE3]]="selectedAuthMethod() !== method.id"
                              >
                                @if (selectedAuthMethod() === method.id) {
                                  <span class="h-2.5 w-2.5 rounded-full bg-[#6B5CF0]"></span>
                                }
                              </span>
                            </button>
                          }
                        </div>

                        <button
                          type="button"
                          (click)="isTwoFactorModalOpen.set(true)"
                          class="mt-7 w-full rounded-full bg-[#6653E4] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(102,83,228,0.9)] transition hover:bg-[#5945DB]"
                        >
                          Turn on
                        </button>
                      } @else {
                        <h3 class="text-[18px] font-black tracking-tight text-[#1A1C21]">
                          Select an authentication method
                        </h3>
                        <p class="mt-2 max-w-[470px] text-[13px] font-medium leading-6 text-[#8D929B]">
                          Turning this on will require an additional verification code when you log in from an untrusted device.
                        </p>

                        <div class="mt-8 rounded-[22px] border border-[#8A7BF6] bg-[#FAF8FF] p-5">
                          <div class="flex items-start justify-between gap-4">
                            <div class="flex items-start gap-4">
                              <span class="flex h-12 w-12 items-center justify-center rounded-full border border-[#E7EAF0] bg-white text-[#A3A8B1]">
                                <ng-icon [name]="activeAuthMethodConfig().icon" class="text-lg"></ng-icon>
                              </span>
                              <div>
                                <div class="flex flex-wrap items-center gap-2">
                                  <p class="text-[14px] font-semibold text-[#2A2D34]">
                                    {{ activeAuthMethodConfig().label }}
                                    @if (activeAuthMethodConfig().meta) {
                                      <span class="font-medium text-[#A3A8B1]">{{ activeAuthMethodConfig().meta }}</span>
                                    }
                                  </p>
                                </div>
                                <p class="mt-2 max-w-[350px] text-[12px] font-medium leading-5 text-[#6D727C]">
                                  {{ activeAuthDescription() }}
                                </p>
                              </div>
                            </div>

                            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#E6FAEC] px-3 py-1 text-[12px] font-semibold text-[#2FB04A]">
                              <span class="flex h-4 w-4 items-center justify-center rounded-full bg-[#2FB04A] text-[10px] font-bold text-white">✓</span>
                              Active
                            </span>
                          </div>

                          <div class="mt-5 border-t border-[#E6E0FF] pt-4 text-[13px] font-medium text-[#8E939D]">
                            Enabled on February 7, 2026
                          </div>
                        </div>

                        <div class="mt-8 flex items-start gap-3 rounded-[18px] bg-[#FFFEF0] px-5 py-4">
                          <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">!</span>
                          <p class="max-w-[460px] text-[13px] font-semibold leading-6 text-[#9A9800]">
                            Keep your phone number secure. If you lose access, you may be locked out of your account
                          </p>
                        </div>

                        <button
                          type="button"
                          (click)="isTurnOffTwoFactorModalOpen.set(true)"
                          class="mt-10 w-full rounded-full bg-[#FF2A2A] px-4 py-3 text-[13px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(255,42,42,0.9)] transition hover:bg-[#F01B1B]"
                        >
                          Turn off
                        </button>
                      }
                    </div>
                  }
                </div>
              </section>
            } @else {
              <section>
                <h2 class="text-[20px] font-black tracking-tight text-[#1A1C21]">Notifications</h2>
                <p class="mt-1 text-[12px] font-medium text-[#A2A7B0]">
                  Choose what notifications you want to receive
                </p>

                <div class="mt-8 max-w-[560px]">
                  <div class="flex items-center gap-8 border-b border-[#ECEEF3]">
                    <button
                      type="button"
                      (click)="notificationsTab.set('method')"
                      class="inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-semibold transition"
                      [class.border-[#6B5CF0]]="notificationsTab() === 'method'"
                      [class.text-[#6B5CF0]]="notificationsTab() === 'method'"
                      [class.border-transparent]="notificationsTab() !== 'method'"
                      [class.text-[#A2A7B0]]="notificationsTab() !== 'method'"
                    >
                      <ng-icon name="heroBell" class="text-sm"></ng-icon>
                      Method
                    </button>

                    <button
                      type="button"
                      (click)="notificationsTab.set('preferences')"
                      class="inline-flex items-center gap-2 border-b-2 px-3 py-3 text-[13px] font-semibold transition"
                      [class.border-[#6B5CF0]]="notificationsTab() === 'preferences'"
                      [class.text-[#6B5CF0]]="notificationsTab() === 'preferences'"
                      [class.border-transparent]="notificationsTab() !== 'preferences'"
                      [class.text-[#A2A7B0]]="notificationsTab() !== 'preferences'"
                    >
                      <ng-icon name="heroAdjustmentsHorizontal" class="text-sm"></ng-icon>
                      Preferences
                    </button>
                  </div>

                  @if (notificationsTab() === 'method') {
                    <div class="mt-8 space-y-10">
                      @for (item of notificationMethods; track item.id) {
                        <div class="flex items-start justify-between gap-6">
                          <div>
                            <h3 class="text-[18px] font-semibold tracking-tight text-[#1A1C21]">{{ item.label }}</h3>
                            <p class="mt-1 text-[13px] font-medium text-[#8D929B]">{{ item.description }}</p>
                          </div>

                          <button
                            type="button"
                            (click)="toggleNotificationMethod(item.id)"
                            class="relative mt-1 h-7 w-12 rounded-full transition"
                            [class.bg-[#6B5CF0]]="isNotificationMethodEnabled(item.id)"
                            [class.bg-[#E6E8EC]]="!isNotificationMethodEnabled(item.id)"
                            [attr.aria-pressed]="isNotificationMethodEnabled(item.id)"
                          >
                            <span
                              class="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition"
                              [class.left-6]="isNotificationMethodEnabled(item.id)"
                              [class.left-1]="!isNotificationMethodEnabled(item.id)"
                            ></span>
                          </button>
                        </div>
                      }
                    </div>

                    <div class="mt-14 flex items-start gap-3 rounded-[18px] bg-[#FFFEF0] px-5 py-4">
                      <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">!</span>
                      <p class="max-w-[460px] text-[13px] font-semibold leading-6 text-[#B6AE00]">
                        Maximize your platform usage by leaving notification settings active
                      </p>
                    </div>
                  } @else {
                    <div class="mt-8">
                      <div class="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] items-center gap-4 border-b border-[#ECEEF3] pb-4">
                        <p class="text-[13px] font-medium text-[#7D828B]">Notify me about</p>
                        <p class="text-center text-[13px] font-medium text-[#7D828B]">SMS</p>
                        <p class="text-center text-[13px] font-medium text-[#7D828B]">Email</p>
                        <p class="text-center text-[13px] font-medium text-[#7D828B]">Push</p>
                      </div>

                      <div class="space-y-8 pt-5">
                        @for (item of notificationPreferenceCategories; track item.id) {
                          <div class="grid grid-cols-[minmax(0,1fr)_72px_72px_72px] items-start gap-4">
                            <div>
                              <h3 class="text-[18px] font-semibold tracking-tight text-[#1A1C21]">{{ item.label }}</h3>
                              <p class="mt-1 max-w-[420px] text-[13px] font-medium leading-7 text-[#8D929B]">
                                {{ item.description }}
                              </p>
                            </div>

                            @for (channel of notificationPreferenceChannels; track channel.id) {
                              <button
                                type="button"
                                (click)="toggleNotificationPreference(item.id, channel.id)"
                                class="mx-auto mt-1 flex h-5 w-5 items-center justify-center rounded-[6px] border text-[12px] font-bold transition"
                                [class.border-[#6B5CF0]]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.bg-[#6B5CF0]]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.text-white]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.border-[#D7DAE1]]="!isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.bg-white]="!isNotificationPreferenceEnabled(item.id, channel.id)"
                                [class.text-transparent]="!isNotificationPreferenceEnabled(item.id, channel.id)"
                                [attr.aria-pressed]="isNotificationPreferenceEnabled(item.id, channel.id)"
                                [attr.aria-label]="'Toggle ' + item.label + ' for ' + channel.label"
                              >
                                ✓
                              </button>
                            }
                          </div>
                        }
                      </div>

                      <div class="mt-10 flex items-start gap-3 rounded-[18px] bg-[#FFFEF0] px-5 py-4">
                        <span class="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EEE82C] text-[#6C6B00]">!</span>
                        <p class="max-w-[460px] text-[13px] font-semibold leading-6 text-[#B6AE00]">
                          Maximize your platform usage by leaving notification settings active
                        </p>
                      </div>
                    </div>
                  }
                </div>
              </section>
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
        (close)="modalMode.set(null)"
        (valueChange)="modalValue.set($event)"
        (confirm)="handleModalConfirm()"
      ></app-settings-action-modal>
    }

    @if (currentVerificationConfig(); as verification) {
      <app-settings-verification-modal
        [destination]="verification.destination"
        (close)="verificationMode.set(null)"
        (back)="handleVerificationBack()"
        (confirm)="completeVerification()"
      ></app-settings-verification-modal>
    }

    @if (isTwoFactorModalOpen()) {
      <app-settings-two-factor-modal
        [method]="selectedAuthMethod()"
        [destination]="twoFactorDestination()"
        (close)="isTwoFactorModalOpen.set(false)"
        (complete)="completeTwoFactorSetup()"
      ></app-settings-two-factor-modal>
    }

    @if (isTurnOffTwoFactorModalOpen()) {
      <div class="fixed inset-0 z-[220] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" (click)="isTurnOffTwoFactorModalOpen.set(false)">
        <div class="w-full max-w-[640px] overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-40px_rgba(19,27,45,0.45)]" (click)="$event.stopPropagation()">
          <div class="flex items-start justify-between gap-4 bg-white px-8 py-8">
            <div class="flex items-start gap-5">
              <div class="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-[#FCF7E4]">
                <div class="flex h-18 w-18 items-center justify-center rounded-full bg-[#F5E8AE] text-[34px] font-bold text-[#D1B700]">!</div>
              </div>
              <div class="pt-4">
                <h3 class="text-[22px] font-black tracking-tight text-[#1A1C21]">Turn off two-factor authentication?</h3>
                <p class="mt-4 max-w-[360px] text-[15px] font-medium leading-7 text-[#676C75]">
                  This will make your account less secure. You’ll only need your password to log in.
                </p>
              </div>
            </div>

            <button
              type="button"
              (click)="isTurnOffTwoFactorModalOpen.set(false)"
              class="flex h-10 w-10 items-center justify-center rounded-full bg-[#F7F7F8] text-[#525762] transition hover:bg-[#EFEFF2]"
              aria-label="Close disable 2FA modal"
            >
              ×
            </button>
          </div>

          <div class="flex justify-end gap-4 bg-[#FBFBFC] px-8 py-6">
            <button
              type="button"
              (click)="isTurnOffTwoFactorModalOpen.set(false)"
              class="rounded-full border border-[#E7EAF0] bg-white px-7 py-3 text-[13px] font-semibold text-[#2F333B] transition hover:bg-[#FAFAFC]"
            >
              Cancel
            </button>
            <button
              type="button"
              (click)="disableTwoFactor()"
              class="rounded-full bg-[#FF2A2A] px-7 py-3 text-[13px] font-semibold text-white shadow-[0_16px_32px_-18px_rgba(255,42,42,0.9)] transition hover:bg-[#F01B1B]"
            >
              Turn off
            </button>
          </div>
        </div>
      </div>
    }

    <div class="pointer-events-none fixed bottom-6 right-6 z-[230] flex flex-col gap-2">
      @for (toast of toasts(); track toast.id) {
        <div class="rounded-[10px] bg-[#111215] px-4 py-2.5 text-[11px] font-medium text-white shadow-lg">
          {{ toast.message }}
        </div>
      }
    </div>
  `,
  host: { class: 'block h-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPageComponent {
  readonly activeTab = signal<SettingsTab>('profile');
  readonly securityTab = signal<'password' | '2fa'>('password');
  readonly notificationsTab = signal<'method' | 'preferences'>('method');
  readonly currentPassword = signal('password123');
  readonly newPassword = signal('password');
  readonly confirmPassword = signal('');
  readonly showNewPassword = signal(false);
  readonly selectedAuthMethod = signal<'sms' | 'email' | 'app'>('sms');
  readonly isTwoFactorModalOpen = signal(false);
  readonly isTwoFactorEnabled = signal(false);
  readonly isTurnOffTwoFactorModalOpen = signal(false);
  readonly notificationSettings = signal({
    email: true,
    sms: false,
    push: true,
  });
  readonly notificationPreferences = signal({
    messages: { sms: true, email: true, push: true },
    listings: { sms: true, email: true, push: false },
    ads: { sms: true, email: true, push: true },
    buyerActivity: { sms: false, email: true, push: true },
    performance: { sms: true, email: false, push: true },
  });

  readonly profile = signal<ProfileSettingsData>({
    email: 'bryan@email.com',
    callNumber: '',
    whatsappNumber: '',
    firstName: 'Bryan Odjede',
  });

  readonly modalMode = signal<ModalMode>(null);
  readonly verificationMode = signal<VerificationMode>(null);
  readonly verificationReturnMode = signal<Exclude<ModalMode, 'name' | null> | null>(null);
  readonly modalValue = signal('');
  readonly toasts = signal<Array<{ id: number; message: string }>>([]);
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
      index < passedCount ? '#F0C529' : '#ECEEF3',
    );
  });
  readonly authenticationMethods = [
    {
      id: 'sms' as const,
      label: 'SMS code',
      meta: '(+234 816 *** 7454)',
      description: 'Use your mobile phone to receive a text message with an authentication code to enter when you log in.',
      icon: 'heroDevicePhoneMobile',
    },
    {
      id: 'email' as const,
      label: 'Email code',
      meta: '',
      description: 'Use your email to receive a verification code to enter when you log in.',
      icon: 'heroEnvelope',
    },
    {
      id: 'app' as const,
      label: 'Authenticator app',
      meta: '',
      description: 'Install an app to generate your verification code',
      icon: 'heroShieldCheck',
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
  readonly twoFactorDestination = computed(() => {
    switch (this.selectedAuthMethod()) {
      case 'email':
        return this.profile().email;
      case 'app':
        return 'your authenticator app';
      default:
        return '+234 816 *** 7454';
    }
  });
  readonly activeAuthMethodConfig = computed(
    () => this.authenticationMethods.find(method => method.id === this.selectedAuthMethod()) ?? this.authenticationMethods[0],
  );
  readonly activeAuthDescription = computed(() => {
    switch (this.selectedAuthMethod()) {
      case 'email':
        return 'Verification codes are sent to this email when logging in from a new device.';
      case 'app':
        return 'Verification codes are generated by your authenticator app when logging in from a new device.';
      default:
        return 'Verification codes are sent to this number when logging in from a new device.';
    }
  });

  readonly currentModalConfig = computed(() => {
    const profile = this.profile();

    switch (this.modalMode()) {
      case 'name':
        return {
          title: 'Update full name',
          description: 'Please update to the full name as it appears on your bank certificate.',
          fieldLabel: 'Full name',
          value: this.modalValue(),
          inputType: 'text' as const,
          confirmLabel: 'Update',
          showDropdown: true,
        };
      case 'call-add':
        return {
          title: 'Add call number',
          description: 'You’ll use this number for notifications, calls and recover your account when necessary',
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
          description: 'You’ll use this email for notifications, log in and recover your account',
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
          destination: '+234 816 939 7454',
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
        this.modalValue.set(profile.firstName);
        break;
      case 'edit-email':
        this.modalMode.set('email');
        this.modalValue.set(profile.email);
        break;
      case 'edit-call':
        this.modalMode.set(profile.callNumber ? 'call-update' : 'call-add');
        this.modalValue.set(profile.callNumber || '+234 816 939 7454');
        break;
      case 'edit-whatsapp':
        this.modalMode.set(profile.whatsappNumber ? 'whatsapp-update' : 'whatsapp-add');
        this.modalValue.set(profile.whatsappNumber || '+234 816 939 7454');
        break;
    }
  }

  handleModalConfirm(): void {
    switch (this.modalMode()) {
      case 'name':
        this.profile.update(profile => ({ ...profile, firstName: this.modalValue() }));
        this.showToast('Profile updated successfully');
        this.modalMode.set(null);
        break;
      case 'call-add':
        this.verificationReturnMode.set('call-add');
        this.verificationMode.set('call');
        this.modalMode.set(null);
        break;
      case 'whatsapp-add':
        this.verificationReturnMode.set('whatsapp-add');
        this.verificationMode.set('whatsapp');
        this.modalMode.set(null);
        break;
      case 'call-update':
        this.verificationReturnMode.set('call-update');
        this.verificationMode.set('call');
        this.modalMode.set(null);
        break;
      case 'whatsapp-update':
        this.verificationReturnMode.set('whatsapp-update');
        this.verificationMode.set('whatsapp');
        this.modalMode.set(null);
        break;
      case 'email':
        this.verificationReturnMode.set('email');
        this.verificationMode.set('email');
        this.modalMode.set(null);
        break;
      default:
        break;
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

  completeVerification(): void {
    switch (this.verificationMode()) {
      case 'email':
        this.profile.update(profile => ({ ...profile, email: this.modalValue() }));
        this.showToast('Profile updated successfully');
        break;
      case 'call':
        this.profile.update(profile => ({ ...profile, callNumber: this.modalValue() }));
        this.showToast(
          this.verificationReturnMode() === 'call-add'
            ? 'Phone number added successfully'
            : 'Phone number updated successfully',
        );
        break;
      case 'whatsapp':
        this.profile.update(profile => ({ ...profile, whatsappNumber: this.modalValue() }));
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
  }

  updateNewPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.newPassword.set(input.value);
  }

  updateConfirmPassword(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.confirmPassword.set(input.value);
  }

  resetPasswordForm(): void {
    this.currentPassword.set('password123');
    this.newPassword.set('password');
    this.confirmPassword.set('');
  }

  completeTwoFactorSetup(): void {
    this.isTwoFactorModalOpen.set(false);
    this.isTwoFactorEnabled.set(true);
    this.showToast('2-Factor Authentication enabled successfully');
  }

  disableTwoFactor(): void {
    this.isTurnOffTwoFactorModalOpen.set(false);
    this.isTwoFactorEnabled.set(false);
    this.showToast('2-Factor Authentication disabled successfully');
  }

  toggleNotificationMethod(method: 'email' | 'sms' | 'push'): void {
    this.notificationSettings.update(settings => ({
      ...settings,
      [method]: !settings[method],
    }));
  }

  isNotificationMethodEnabled(method: 'email' | 'sms' | 'push'): boolean {
    return this.notificationSettings()[method];
  }

  toggleNotificationPreference(
    category: 'messages' | 'listings' | 'ads' | 'buyerActivity' | 'performance',
    channel: 'sms' | 'email' | 'push',
  ): void {
    this.notificationPreferences.update(preferences => ({
      ...preferences,
      [category]: {
        ...preferences[category],
        [channel]: !preferences[category][channel],
      },
    }));
  }

  isNotificationPreferenceEnabled(
    category: 'messages' | 'listings' | 'ads' | 'buyerActivity' | 'performance',
    channel: 'sms' | 'email' | 'push',
  ): boolean {
    return this.notificationPreferences()[category][channel];
  }

  private showToast(message: string): void {
    const toast = { id: Date.now(), message };
    this.toasts.update(current => [...current, toast]);

    setTimeout(() => {
      this.toasts.update(current => current.filter(item => item.id !== toast.id));
    }, 2600);
  }
}
