import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroClock, heroStar } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-store-tabs',
  standalone: true,
  imports: [CommonModule, NgIcon],
  providers: [
    provideIcons({ heroClock, heroStar })
  ],
  template: `
    <div class="border-b border-gray-100 mb-8 overflow-x-auto flex flex-nowrap scrollbar-hide">
      <div class="flex gap-8 px-2">
        @for (tab of tabs; track tab.id) {
          <button 
            (click)="selectTab(tab.id)"
            class="pb-4 pt-2 px-1 relative text-sm font-bold transition-all duration-200 whitespace-nowrap flex items-center gap-2"
            [class.text-purple-600]="activeTab() === tab.id"
            [class.text-gray-400]="activeTab() !== tab.id"
            [class.hover:text-gray-600]="activeTab() !== tab.id"
          >
            <ng-icon [name]="tab.icon" class="text-lg"></ng-icon>
            {{ tab.label }}
            
            @if (activeTab() === tab.id) {
              <div class="absolute -bottom-px left-0 w-full h-1 bg-purple-600 rounded-t-lg transition-all duration-300"></div>
            }
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .scrollbar-hide::-webkit-scrollbar {
      display: none;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StoreTabsComponent {
  activeTab = input.required<string>();
  tabChange = output<string>();

  tabs = [
    { id: 'listings', label: 'Listings', icon: 'heroClock' },
    { id: 'reviews', label: 'Reviews', icon: 'heroStar' }
  ];

  selectTab(id: string) {
    this.tabChange.emit(id);
  }
}

