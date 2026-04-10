import { ChangeDetectionStrategy, Component, ElementRef, viewChild, signal } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';

interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, NgOptimizedImage],
  templateUrl: './categories.component.html',
  styles: `
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesComponent {
  readonly categoriesScroller = viewChild<ElementRef<HTMLDivElement>>('categoriesScroller');

  readonly categories = signal<Category[]>([
    { id: '1', name: 'Automobiles', icon: 'assets/icons/category-automobiles.svg' },
    { id: '2', name: 'Real Estate & Property', icon: 'assets/icons/category-real-estate.svg' },
    { id: '3', name: 'Phones & Tablet', icon: 'assets/icons/category-phones.svg' },
    { id: '4', name: 'Electronics', icon: 'assets/icons/category-computers.svg' },
    { id: '5', name: 'Home, furniture & decor', icon: 'assets/icons/category-home.svg' },
    { id: '6', name: 'Men\'s wear', icon: 'assets/icons/category-menswear.svg' },
    { id: '7', name: 'Women\'s wear', icon: 'assets/icons/category-womenswear.svg' },
    { id: '8', name: 'Beauty', icon: 'assets/icons/category-beauty.svg' },
  ]);

  scrollCategories(): void {
    this.categoriesScroller()?.nativeElement.scrollBy({
      left: 320,
      behavior: 'smooth',
    });
  }

  scrollCategoriesBackward(): void {
    this.categoriesScroller()?.nativeElement.scrollBy({
      left: -320,
      behavior: 'smooth',
    });
  }
}
