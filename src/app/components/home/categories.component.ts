import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Category {
  id: string;
  name: string;
  icon: string;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
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
  categories = signal<Category[]>([
    { id: '1', name: 'Automobiles', icon: '🚗' },
    { id: '2', name: 'Real Estate & Property', icon: '🏠' },
    { id: '3', name: 'Phones & Tablets', icon: '📱' },
    { id: '4', name: 'Computers', icon: '💻' },
    { id: '5', name: 'Home, Furniture & Appliances', icon: '🛋️' },
    { id: '6', name: 'Men\'s Wear', icon: '👔' },
    { id: '7', name: 'Women\'s Fashion', icon: '👗' },
    { id: '8', name: 'Beauty & Cosmetics', icon: '💄' },
  ]);
}
