import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Store {
  id: string;
  name: string;
  logo: string;
  banner: string;
  followers: string;
  isVerified?: boolean;
}

@Component({
  selector: 'app-store-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './store-card.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StoreCardComponent {
  store = input.required<Store>();
}
