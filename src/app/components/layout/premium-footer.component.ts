import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandInstagram, faBrandXTwitter } from '@ng-icons/font-awesome/brands';

@Component({
  selector: 'app-premium-footer',
  imports: [CommonModule, RouterLink, NgOptimizedImage, FormsModule, NgIcon],
  providers: [
    provideIcons({
      faBrandInstagram,
      faBrandXTwitter,
    }),
  ],
  templateUrl: './premium-footer.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 
    class: 'block w-full bg-[#FAFAFA] border-t border-[#F0F0F0] overflow-hidden relative pt-24 pb-12',
  },
})
export class PremiumFooterComponent {
  email = signal('');

  submitNewsletter() {
    console.log('Newsletter signup:', this.email());
    this.email.set('');
  }
}
