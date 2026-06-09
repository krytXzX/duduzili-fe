import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-promotions',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './promotions.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromotionsComponent {}
