import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-filter-chips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './filter-chips.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterChipsComponent {
  activeDropdownIndex = signal<number | null>(null);
  
  // Track selected values for each filter (by index)
  selectedOptions = signal<Record<number, string | null>>({
    0: null, // Location
    1: null, // Price
    2: null, // Condition
    3: null, // Verification status
    4: null, // Following
    5: 'Recommended', // Sort by
  });

  filterConfigs = [
    { label: 'Location', options: ['All of Nigeria', 'Lagos', 'Abuja', 'Port Harcourt', 'Enugu', 'Ibadan'] },
    { label: 'Price', options: ['Under 50k', '50k - 100k', '100k - 500k', '500k - 1M', '1M+'] },
    { label: 'Condition', options: ['Any', 'New', 'Used (Nigeria)', 'Used (Foreign)'] },
    { label: 'Verification status', options: ['All', 'Verified Sellers Only'] },
    { label: 'Following', options: ['All sellers', 'Following only'] },
    { label: 'Sort by', options: ['Recommended', 'Price: Low to High', 'Price: High to Low', 'Newest'] },
  ];

  toggleDropdown(index: number, event: Event) {
    event.stopPropagation();
    if (this.activeDropdownIndex() === index) {
      this.activeDropdownIndex.set(null);
    } else {
      this.activeDropdownIndex.set(index);
    }
  }

  selectOption(index: number, option: string) {
    this.selectedOptions.update(prev => ({
      ...prev,
      [index]: option === 'Any' || option === 'All' ? null : option
    }));
    this.activeDropdownIndex.set(null);
  }

  resetFilters() {
    this.selectedOptions.set({
      0: null, 1: null, 2: null, 3: null, 4: null, 5: 'Recommended'
    });
    this.activeDropdownIndex.set(null);
  }

  closeAll() {
    this.activeDropdownIndex.set(null);
  }
}
