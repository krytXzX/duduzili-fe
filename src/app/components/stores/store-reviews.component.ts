import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReviewCardComponent, Review } from '../product/review-card.component';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroStar, heroChevronDown } from '@ng-icons/heroicons/outline';
import { heroStarSolid } from '@ng-icons/heroicons/solid';

@Component({
  selector: 'app-store-reviews',
  standalone: true,
  imports: [CommonModule, ReviewCardComponent, NgIcon],
  providers: [
    provideIcons({ heroStar, heroStarSolid, heroChevronDown })
  ],
  template: `
    <div class="flex flex-col lg:flex-row gap-12 pt-4">
      <!-- Left Column: Rating Summary -->
      <div class="w-full lg:w-[280px] shrink-0">
        <div class="flex items-baseline gap-1 mb-2">
          <span class="text-6xl font-black text-[#1A1C21] tracking-tight">4.57</span>
          <span class="text-2xl font-bold text-gray-300">/5</span>
        </div>

        <!-- Star Rating -->
        <div class="flex gap-1 mb-4 text-yellow-400 text-2xl">
          @for (i of [1,2,3,4,5]; track i) {
            <ng-icon name="heroStarSolid"></ng-icon>
          }
        </div>

        <p class="text-[13px] font-bold text-gray-900 mb-8 tracking-wide">Overall rating</p>

        <!-- Rating Progress Bars -->
        <div class="space-y-4">
          @for (bar of distribution; track bar.stars) {
            <div class="flex items-center gap-4">
              <div class="flex items-center gap-1 w-6 shrink-0">
                <span class="text-xs font-bold text-gray-900">{{ bar.stars }}★</span>
              </div>
              <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full bg-gray-900 rounded-full transition-all duration-1000" [style.width.%]="bar.percentage"></div>
              </div>
              <span class="text-[11px] font-bold text-gray-400 w-8 text-right">{{ bar.percentage }}%</span>
            </div>
          }
        </div>
      </div>

      <!-- Right Column: Reviews List -->
      <div class="flex-1 min-w-0">
        <!-- Header -->
        <div class="flex items-center justify-between mb-8">
          <h3 class="text-2xl font-black text-[#1A1C21]">215 reviews</h3>
          
          <div class="relative group">
            <button class="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#1A1C21] hover:bg-gray-50 transition-all">
              Most recent
              <ng-icon name="heroChevronDown" class="text-gray-400"></ng-icon>
            </button>
          </div>
        </div>

        <!-- Vendor Quality Tags -->
        <div class="mb-10">
          <p class="text-sm font-bold text-[#1A1C21] mb-5 tracking-tight">This vendor is great at..</p>
          <div class="flex flex-wrap gap-2.5">
            @for (tag of vendorTags; track tag.label) {
              <div class="px-5 py-2.5 bg-white border border-gray-100 rounded-full text-[13px] font-bold text-[#1A1C21] hover:bg-gray-50 transition-colors shadow-xs">
                {{ tag.label }} <span class="text-gray-400 ml-0.5">({{ tag.count }})</span>
              </div>
            }
          </div>
        </div>

        <!-- Individual Reviews -->
        <div class="flex flex-col gap-10">
          @for (review of reviews(); track $index) {
            <app-review-card [review]="review" class="animate-in fade-in slide-in-from-right-4 duration-500" [style.animation-delay]="$index * 100 + 'ms'"></app-review-card>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreReviewsComponent {
  averageRating = input<string>('4.57');
  reviews = input<Review[]>([]);

  distribution = [
    { stars: 5, percentage: 65 },
    { stars: 4, percentage: 11 },
    { stars: 3, percentage: 9 },
    { stars: 2, percentage: 3 },
    { stars: 1, percentage: 2 }
  ];

  vendorTags = [
    { label: 'Timely response', count: 16 },
    { label: 'Safety', count: 7 },
    { label: 'Credibility', count: 7 },
    { label: 'Manners', count: 7 },
    { label: 'Hospitality', count: 7 }
  ];
}

