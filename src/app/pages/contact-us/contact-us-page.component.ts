import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AppToastComponent } from '../../components/common/app-toast.component';
import { HomeFooterComponent } from '../../components/layout/home-footer.component';
import { AppToastService } from '../../services/app-toast.service';

@Component({
  selector: 'app-contact-us-page',
  imports: [NgOptimizedImage, ReactiveFormsModule, RouterLink, HomeFooterComponent, AppToastComponent],
  template: `
    <main class="min-h-screen overflow-x-hidden overflow-y-auto bg-[#fcfcfc] text-[#252525]">
      <header class="relative z-40 hidden px-2 pt-4 lg:block">
        <div class="mx-auto flex max-w-[1440px] justify-center px-8">
          <div
            class="flex w-full max-w-[1238px] items-center justify-between rounded-full bg-[#1a1a1a] px-6 py-[9px] shadow-[0_12px_28px_rgba(0,0,0,0.14)]"
          >
            <div class="flex items-center gap-6">
              <a
                routerLink="/"
                class="flex items-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]"
                aria-label="Go to Duduzili homepage"
              >
                <img
                  ngSrc="/assets/icons/home-logo-light.svg"
                  alt="Duduzili"
                  width="112"
                  height="26"
                  priority
                  class="h-[26px] w-auto"
                />
              </a>

              <button
                type="button"
                class="flex h-10 items-center justify-between gap-3 rounded-full bg-[#2f2f2f] py-1 pl-3 pr-1 text-white transition hover:bg-[#3a3a3a] active:scale-[0.98]"
                aria-label="Current location: All of Nigeria"
              >
                <span class="flex items-center gap-1 text-sm font-semibold tracking-[0.01em]">
                  <img
                    ngSrc="/assets/icons/home-location.svg"
                    alt=""
                    width="16"
                    height="16"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                  All of Nigeria
                </span>
                <span class="flex h-8 w-10 items-center justify-center rounded-full bg-[#515151]">
                  <img
                    ngSrc="/assets/icons/home-chevron-down.svg"
                    alt=""
                    width="16"
                    height="16"
                    class="h-4 w-4"
                    aria-hidden="true"
                  />
                </span>
              </button>
            </div>

            <nav class="flex items-center gap-0.5 text-sm text-white" aria-label="Primary navigation">
              <a routerLink="/" class="rounded-full px-3.5 py-2.5 font-medium transition hover:bg-white/10 active:scale-[0.98]">Sell item</a>
              <a routerLink="/sign-in" class="rounded-full px-3.5 py-2.5 font-medium transition hover:bg-white/10 active:scale-[0.98]">Sign in</a>
              <a
                routerLink="/sign-up"
                class="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-3 text-[#1d1d1d] transition hover:bg-[#f3f3f3] active:scale-[0.98]"
              >
                <span class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#dbe5ff]">
                  <svg aria-hidden="true" viewBox="0 0 24 24" class="h-6 w-6 fill-[#8da7ff]">
                    <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.14 0-7.5 2.52-7.5 5.63V21h15v-1.12c0-3.11-3.36-5.63-7.5-5.63Z" />
                  </svg>
                </span>
                <span class="text-base font-medium">Sign up</span>
              </a>
            </nav>
          </div>
        </div>
      </header>

      <header class="relative z-40 flex items-center justify-between px-5 py-[18px] lg:hidden">
        <a routerLink="/" class="block" aria-label="Go to Duduzili homepage">
          <img
            ngSrc="/assets/icons/home-header-logo-mobile.svg"
            alt="Duduzili"
            width="111"
            height="24"
            priority
            class="h-6 w-auto"
          />
        </a>
        <a
          routerLink="/sign-in"
          class="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[#dbe5ff] transition hover:scale-105 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6453d9]"
          aria-label="Sign in"
        >
          <img
            ngSrc="/assets/images/auth-avatar-fallback.svg"
            alt=""
            width="36"
            height="36"
            class="h-full w-full"
            aria-hidden="true"
          />
        </a>
      </header>

      <section class="relative mx-auto min-h-[726px] max-w-[1440px] px-5 pb-12 pt-8 lg:min-h-[875px] lg:px-[100px] lg:pb-0 lg:pt-[46px]">
        <div class="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block" aria-hidden="true">
          <img
            ngSrc="/assets/images/contact/contact-phone-art.png"
            alt=""
            width="1536"
            height="1024"
            priority
            sizes="100vw"
            class="absolute left-[91px] top-[12px] h-[900px] w-[1349px] max-w-none object-cover"
          />
        </div>

        <div class="relative z-10 mx-auto flex w-full max-w-[576px] flex-col items-center lg:ml-auto lg:mr-0 lg:items-start">
          <h1 class="text-center text-[32px] font-semibold leading-[1.08] tracking-[-0.05em] text-[#252525] lg:text-left lg:text-[64px]">
            <span class="block">Got questions?</span>
            <span class="mt-1 flex flex-wrap items-center justify-center gap-3 lg:justify-start lg:gap-4">
              <span>We&rsquo;re here</span>
              <span class="inline-flex h-[38px] w-[54px] rotate-[-5deg] overflow-hidden rounded-[12px] border-[3px] border-white bg-[#f1f1f1] shadow-[0_8px_22px_rgba(0,0,0,0.10)] lg:h-[59px] lg:w-[83px] lg:rounded-[18px] lg:border-[4px]">
                <img
                  ngSrc="/assets/images/contact/contact-handshake-small.jpg"
                  alt=""
                  width="220"
                  height="147"
                  class="h-full w-full object-cover"
                  aria-hidden="true"
                />
              </span>
              <span>to help.</span>
            </span>
          </h1>

          <form
            class="mt-10 w-full rounded-[20px] border border-[#ececec] bg-[#f9f9f9] px-4 py-6 shadow-[0_0_18px_6px_rgba(220,220,220,0.25)] lg:mt-[54px] lg:px-6 lg:py-6"
            [formGroup]="contactForm"
            (ngSubmit)="submitContactForm()"
            novalidate
          >
            <div class="space-y-5">
              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#262626]">Name</span>
                <input
                  type="text"
                  formControlName="name"
                  autocomplete="name"
                  placeholder="Enter your name"
                  class="h-[52px] w-full rounded-[12px] border border-[#ececec] bg-white px-4 text-base text-[#252525] outline-none transition placeholder:text-[#a8a8a8] hover:border-[#d9d6f4] focus:border-[#6453d9] focus:ring-4 focus:ring-[#6453d9]/10"
                  [attr.aria-invalid]="isInvalid('name')"
                  aria-describedby="contact-name-error"
                />
                @if (isInvalid('name')) {
                  <p id="contact-name-error" class="mt-2 text-sm text-[#bf2c2c]">Please enter your name.</p>
                }
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#262626]">Email</span>
                <input
                  type="email"
                  formControlName="email"
                  autocomplete="email"
                  placeholder="Enter your email address"
                  class="h-[52px] w-full rounded-[12px] border border-[#ececec] bg-white px-4 text-base text-[#252525] outline-none transition placeholder:text-[#a8a8a8] hover:border-[#d9d6f4] focus:border-[#6453d9] focus:ring-4 focus:ring-[#6453d9]/10"
                  [attr.aria-invalid]="isInvalid('email')"
                  aria-describedby="contact-email-error"
                />
                @if (isInvalid('email')) {
                  <p id="contact-email-error" class="mt-2 text-sm text-[#bf2c2c]">Please enter a valid email address.</p>
                }
              </label>

              <label class="block">
                <span class="mb-2 block text-[15px] font-medium text-[#262626]">Message</span>
                <textarea
                  formControlName="message"
                  placeholder="How can we help?"
                  class="min-h-[166px] w-full resize-none rounded-[12px] border border-[#ececec] bg-white px-4 py-3 text-base text-[#252525] outline-none transition placeholder:text-[#a8a8a8] hover:border-[#d9d6f4] focus:border-[#6453d9] focus:ring-4 focus:ring-[#6453d9]/10 lg:min-h-[169px]"
                  [attr.aria-invalid]="isInvalid('message')"
                  aria-describedby="contact-message-error"
                ></textarea>
                @if (isInvalid('message')) {
                  <p id="contact-message-error" class="mt-2 text-sm text-[#bf2c2c]">Please add a short message.</p>
                }
              </label>
            </div>

            <button
              type="submit"
              class="mx-auto mt-6 flex h-[52px] w-full max-w-[204px] items-center justify-center rounded-full border border-white bg-[#6453d9] px-6 text-base font-medium text-white shadow-[0_4px_12px_rgba(81,35,173,0.33),0_0_0_1px_#6b5bd5] transition hover:-translate-y-0.5 hover:bg-[#5847cf] hover:shadow-[0_10px_24px_rgba(81,35,173,0.26),0_0_0_1px_#6b5bd5] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 lg:ml-0"
              [disabled]="isSubmitting()"
            >
              {{ submitLabel() }}
            </button>
          </form>
        </div>
      </section>

      <app-home-footer />
      <app-toast />
    </main>
  `,
  host: {
    class: 'block h-dvh overflow-y-auto overflow-x-hidden bg-[#fcfcfc]',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactUsPageComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly toastService = inject(AppToastService);

  readonly isSubmitting = signal(false);
  readonly submitLabel = computed(() => (this.isSubmitting() ? 'Sending...' : 'Submit'));

  readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(4)]],
  });

  isInvalid(controlName: 'name' | 'email' | 'message'): boolean {
    const control = this.contactForm.controls[controlName];
    return control.invalid && (control.dirty || control.touched);
  }

  submitContactForm(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);

    window.setTimeout(() => {
      this.isSubmitting.set(false);
      this.contactForm.reset();
      this.toastService.show({
        message: 'Thanks for reaching out. We will get back to you soon.',
      });
    }, 450);
  }
}
