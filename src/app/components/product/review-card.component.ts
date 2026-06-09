import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface Review {
  rating: number;
  text: string;
  author: string;
  date: string;
  avatar?: string;
  images?: string[];
  tags?: string[];
}


@Component({
  selector: 'app-review-card',
  imports: [CommonModule, NgOptimizedImage],
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
  protected readonly avatarSrc = computed(
    () => this.review().avatar?.trim() || '/assets/images/auth-avatar-fallback.svg',
  );

  get stars() {
    return Array(5).fill(0).map((_, i) => i < this.review().rating);
  }
}
