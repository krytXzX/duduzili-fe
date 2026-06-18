import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroMapPin, heroUserCircle, heroBars3 } from '@ng-icons/heroicons/outline';
import { heroChevronDownMini } from '@ng-icons/heroicons/mini';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-flat-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, NgIcon],
  providers: [
    provideIcons({ heroMapPin, heroUserCircle, heroBars3, heroChevronDownMini })
  ],
  templateUrl: './flat-navbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 
    class: 'block w-full h-20 border-b border-white/10 bg-[#15162B] text-white sticky top-0 z-[100] shadow-md border-4 border-red-500',
  },
})
export class FlatNavbarComponent {
  private readonly authSession = inject(AuthSessionService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });
}
