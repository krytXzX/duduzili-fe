import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Listing {
  id: string;
  image: string;
  title: string;
  price: string;
  location: string;
  timeAgo: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-listing-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './listing-card.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListingCardComponent {
  listing = input.required<Listing>();
}
