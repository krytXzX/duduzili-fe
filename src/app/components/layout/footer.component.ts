import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faBrandInstagram, faBrandXTwitter } from '@ng-icons/font-awesome/brands';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink, NgOptimizedImage, NgIcon],
  providers: [
    provideIcons({
      faBrandInstagram,
      faBrandXTwitter,
    }),
  ],
  templateUrl: './footer.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {}
