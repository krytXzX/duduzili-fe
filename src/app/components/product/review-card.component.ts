import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
  avatar?: string;
  images?: string[];
}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-card.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCardComponent {
  review = input.required<Review>();

  get stars() {
    return Array(5).fill(0).map((_, i) => i < this.review().rating);
  }
}

