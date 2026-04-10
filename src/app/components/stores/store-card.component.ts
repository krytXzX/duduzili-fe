import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

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
  imports: [CommonModule, RouterLink],
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
