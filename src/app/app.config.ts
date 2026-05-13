import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideRouter, TitleStrategy } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { AppTitleStrategy } from './app-title.strategy';
import { apiAuthInterceptor } from './interceptors/api-auth.interceptor';
import { authErrorInterceptor } from './interceptors/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([apiAuthInterceptor, authErrorInterceptor])),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    {
      provide: TitleStrategy,
      useClass: AppTitleStrategy,
    },
  ],
};
