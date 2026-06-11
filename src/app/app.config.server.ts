import { APP_INITIALIZER, mergeApplicationConfig, ApplicationConfig, inject } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { AuthSessionService } from './services/auth-session.service';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      // On the server we have no cookies / auth tokens, so mark bootstrap
      // complete immediately so the spinner is never shown in SSR output.
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const authSession = inject(AuthSessionService);
        return () => {
          authSession.markBootstrapComplete();
          return Promise.resolve();
        };
      },
    },
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
