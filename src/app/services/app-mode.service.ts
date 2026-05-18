import { Injectable, computed, inject } from '@angular/core';
import { APP_ENVIRONMENT } from '../config/app-environment.token';

@Injectable({ providedIn: 'root' })
export class AppModeService {
  private readonly appEnvironment = inject(APP_ENVIRONMENT);

  readonly isDemoMode = computed(() => this.appEnvironment.demoMode);
  readonly isBackendEnabled = computed(
    () => this.appEnvironment.backendEnabled && !this.appEnvironment.demoMode,
  );
  readonly apiUrl = computed(() => this.appEnvironment.apiUrl);
}
