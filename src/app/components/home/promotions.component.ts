import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-promotions',
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './promotions.component.html',
  styles: `
    :host {
      display: block;
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsComponent {}
