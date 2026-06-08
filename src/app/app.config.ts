import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideServiceWorker } from '@angular/service-worker';
import { AppTitleStrategy } from './app-title.strategy';
import { apiAuthInterceptor } from './interceptors/api-auth.interceptor';
import { authErrorInterceptor } from './interceptors/auth-error.interceptor';
import { AuthBootstrapService } from './services/auth-bootstrap.service';
import { APP_ENVIRONMENT } from './config/app-environment.token';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withFetch(),
      withXsrfConfiguration({
        cookieName: 'csrftoken',
        headerName: 'X-CSRFToken',
      }),
      withInterceptors([apiAuthInterceptor, authErrorInterceptor]),
    ),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideServiceWorker('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000',
    }),
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy,
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const authBootstrapService = inject(AuthBootstrapService);
        return () => authBootstrapService.initialize();
      },
    },
    {
      provide: APP_ENVIRONMENT,
      useValue: environment,
    },
  ],
};
