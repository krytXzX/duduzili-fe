import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppToastService } from '../../services/app-toast.service';
import { SellerMonetizationService } from '../../services/seller-monetization.service';

@Component({
  selector: 'app-paystack-verify-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="flex min-h-screen items-center justify-center bg-[#F7F7F8] px-6 py-12">
      <section class="w-full max-w-md rounded-[32px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.10)]">
        <div class="mx-auto mb-6 h-14 w-14 rounded-full bg-[#F2EFFF] p-3">
          <div class="h-full w-full animate-pulse rounded-full bg-[#6D5AF0]"></div>
        </div>
        <h1 class="text-[26px] font-semibold tracking-[-0.04em] text-[#1A1C21]">
          {{ title() }}
        </h1>
        <p class="mt-3 text-[15px] leading-6 text-[#6B7280]">
          {{ message() }}
        </p>
      </section>
    </main>
  `,
})
export class PaystackVerifyPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly appToastService = inject(AppToastService);
  private readonly sellerMonetizationService = inject(SellerMonetizationService);

  readonly title = signal('Confirming payment');
  readonly message = signal('Please wait while we confirm your Paystack payment.');

  constructor() {
    const reference =
      this.route.snapshot.queryParamMap.get('reference') ??
      this.route.snapshot.queryParamMap.get('trxref');

    if (!reference) {
      this.handleFailure('We could not find a payment reference for this transaction.');
      return;
    }

    this.sellerMonetizationService.verifyPaystackPayment(reference).subscribe({
      next: (response) => {
        this.title.set('Payment confirmed');
        this.message.set('Your payment has been confirmed successfully. Redirecting you now.');
        this.appToastService.show({ message: 'Payment confirmed successfully.' });
        this.redirectAfterVerification(response.payment_type);
      },
      error: (error) => {
        const errorMessage =
          typeof error?.error?.error === 'string'
            ? error.error.error
            : 'We could not confirm this payment right now. Please try again shortly.';
        this.handleFailure(errorMessage);
      },
    });
  }

  private handleFailure(message: string): void {
    this.title.set('Payment needs attention');
    this.message.set(message);
    this.appToastService.show({ message, durationMs: 5000 });
    globalThis.setTimeout(() => void this.router.navigateByUrl('/seller/wallet'), 2500);
  }

  private redirectAfterVerification(paymentType: string | undefined): void {
    const target =
      paymentType === 'bulk_listing_promotion'
        ? '/seller/listings'
        : paymentType === 'banner_ad_payment'
          ? '/seller/promotions'
          : '/seller/wallet';
    globalThis.setTimeout(() => void this.router.navigateByUrl(target), 1200);
  }
}
