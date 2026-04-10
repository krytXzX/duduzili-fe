import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { faSolidClock } from '@ng-icons/font-awesome/solid';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, NgIcon],
  templateUrl: './hero.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [provideIcons({ faSolidClock })],
})
export class HeroComponent {}
