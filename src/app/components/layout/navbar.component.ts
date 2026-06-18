import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { AppToastComponent } from '../common/app-toast.component';
import { AuthSessionService } from '../../services/auth-session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, NgOptimizedImage, AppToastComponent],
  templateUrl: './navbar.component.html',
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly authSession = inject(AuthSessionService);

  readonly homeRoute = computed(() => {
    if (!this.authSession.isAuthenticated()) {
      return '/';
    }
    return this.authSession.isSuperuser() ? '/admin' : '/en';
  });

  readonly showSearch = input<boolean>(false);
  readonly searchQuery = signal('');
  readonly mobileMenuOpen = signal(false);

  updateSearchQuery(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  runSearch(): void {
    const query = this.searchQuery().trim() || 'iPhone';
    void this.router.navigate(['/search'], { queryParams: { q: query } });
  }

  openMobileMenu(): void {
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }
}
