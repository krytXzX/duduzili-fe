import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { NavbarComponent } from '../../components/layout/navbar.component';
import { FlatNavbarComponent } from '../../components/layout/flat-navbar.component';
import { PremiumFooterComponent } from '../../components/layout/premium-footer.component';
import { FooterComponent } from '../../components/layout/footer.component';

@Component({
  selector: 'app-terms-of-service-page',
  imports: [CommonModule, RouterLink, RouterLinkActive, FlatNavbarComponent, PremiumFooterComponent, NgOptimizedImage],
  templateUrl: './terms-of-service-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block w-full h-screen overflow-y-auto bg-white',
  },
})
export class TermsOfServicePageComponent {
  sections = [
    { id: 'background', label: 'Background' },
    { id: 'cookies', label: 'What type of cookies do we use?' },
    { id: 'delete-cookies', label: 'How to delete cookies' },
  ];
}
