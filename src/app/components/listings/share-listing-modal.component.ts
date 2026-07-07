import { Component, computed, inject, input, model, output, signal } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { AppToastService } from '../../services/app-toast.service';

@Component({
  selector: 'app-share-listing-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './share-listing-modal.component.html',
})
export class ShareListingModalComponent {
  private readonly document = inject(DOCUMENT);
  private readonly appToastService = inject(AppToastService);

  readonly isOpen = model.required<boolean>();
  readonly listingName = input.required<string>();
  readonly itemType = input<'listing' | 'store'>('listing');
  readonly customShareUrl = input<string>();

  readonly shareUrl = computed(() => this.customShareUrl() ?? this.document.defaultView?.location.href ?? '');
  readonly canUseNativeShare = computed(
    () => typeof navigator !== 'undefined' && 'share' in navigator,
  );
  readonly hasCopiedShareUrl = signal(false);

  closeModal(): void {
    this.isOpen.set(false);
    this.hasCopiedShareUrl.set(false);
    this.setBodyScrollLocked(false);
  }

  private setBodyScrollLocked(isLocked: boolean): void {
    this.document.body.style.overflow = isLocked ? 'hidden' : '';
  }

  async shareListingWithDevice(): Promise<void> {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: `This ${this.itemType()} can’t be shared right now. Please try again in a moment.`,
      });
      return;
    }

    if (!(typeof navigator !== 'undefined' && 'share' in navigator)) {
      this.appToastService.show({
        message: 'Sharing is not available on this device.',
      });
      return;
    }

    try {
      await navigator.share({
        title: this.listingName(),
        text: `Check out ${this.listingName()} on Duduzili`,
        url: shareUrl,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }

      this.appToastService.show({
        message: `This ${this.itemType()} can’t be shared right now. Please try again in a moment.`,
      });
    }
  }

  async copyShareUrl(): Promise<void> {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      this.appToastService.show({
        message: `This ${this.itemType()} can’t be shared right now. Please try again in a moment.`,
      });
      return;
    }

    const copied = await this.copyTextToClipboard(shareUrl);
    if (copied) {
      this.hasCopiedShareUrl.set(true);
      this.appToastService.show({
        message: `${this.itemType() === 'store' ? 'Store' : 'Listing'} link copied`,
        durationMs: 2200,
      });
      return;
    }

    this.appToastService.show({
      message: `This ${this.itemType()} can’t be shared right now. Please try again in a moment.`,
    });
  }

  shareViaWhatsApp(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://wa.me/?text=${encodeURIComponent(`Check out ${this.listingName()} on Duduzili: ${shareUrl}`)}`,
    );
  }

  shareViaEmail(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `mailto:?subject=${encodeURIComponent(this.listingName())}&body=${encodeURIComponent(`Check out ${this.listingName()} on Duduzili: ${shareUrl}`)}`,
    );
  }

  shareViaX(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://x.com/intent/tweet?text=${encodeURIComponent(`Check out ${this.listingName()} on Duduzili`)}&url=${encodeURIComponent(shareUrl)}`,
    );
  }

  shareViaFacebook(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  }

  shareViaLinkedIn(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
  }

  shareViaTelegram(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Check out ${this.listingName()} on Duduzili`)}`,
    );
  }

  shareViaReddit(): void {
    const shareUrl = this.shareUrl();
    if (!shareUrl) {
      return;
    }

    this.openExternalShareUrl(
      `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(this.listingName())}`,
    );
  }

  private openExternalShareUrl(url: string): void {
    const win = this.document.defaultView?.open(url, '_blank', 'noopener,noreferrer');
    if (win) {
      win.opener = null;
    }
  }

  private async copyTextToClipboard(value: string): Promise<boolean> {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        return true;
      }
    } catch {
      // Fall back to execCommand when clipboard permissions are unavailable.
    }

    const textArea = this.document.createElement('textarea');
    textArea.value = value;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    this.document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      return this.document.execCommand('copy');
    } catch {
      return false;
    } finally {
      this.document.body.removeChild(textArea);
    }
  }
}
