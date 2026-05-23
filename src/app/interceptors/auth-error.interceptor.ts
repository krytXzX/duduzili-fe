import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';
import { AuthRefreshService } from '../services/auth-refresh.service';
import { AppModeService } from '../services/app-mode.service';

const apiUrl = environment.apiUrl.replace(/\/+$/, '');
const HAS_REFRESH_RETRIED = new HttpContextToken<boolean>(() => false);
const isMutationMethod = (method: string): boolean =>
  method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

export const authErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const appMode = inject(AppModeService);
  if (!appMode.isBackendEnabled()) {
    return next(request);
  }

  const authSession = inject(AuthSessionService);
  const authRefreshService = inject(AuthRefreshService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isApiRequest = request.url.startsWith(apiUrl);
      const isHttp401 = error instanceof HttpErrorResponse && error.status === 401;
      const isAuthRequest = /\/auth\/(?:.+)\/?$/.test(request.url);
      const hasRetried = request.context.get(HAS_REFRESH_RETRIED);

      if (isApiRequest && isHttp401 && !isAuthRequest && !hasRetried) {
        return from(authRefreshService.refreshAccessToken()).pipe(
          switchMap((didRefreshSucceed) => {
            if (!didRefreshSucceed) {
              authSession.clearSession();
              void router.navigate(['/sign-in']);
              return throwError(() => error);
            }

            let headers = request.headers.delete('Authorization');
            const refreshedAccessToken = authSession.accessToken();
            const csrfToken = authSession.csrfToken();

            if (refreshedAccessToken) {
              headers = headers.set('Authorization', `Bearer ${refreshedAccessToken}`);
            }

            if (isMutationMethod(request.method) && csrfToken) {
              headers = headers.set('X-CSRFToken', csrfToken);
            }

            return next(
              request.clone({
                withCredentials: true,
                headers,
                context: request.context.set(HAS_REFRESH_RETRIED, true),
              }),
            );
          }),
          catchError((refreshError: unknown) => {
            authSession.clearSession();
            void router.navigate(['/sign-in']);
            return throwError(() => refreshError);
          }),
        );
      }

      if (isApiRequest && isHttp401 && !isAuthRequest) {
        authSession.clearSession();
        void router.navigate(['/sign-in']);
      }

      return throwError(() => error);
    }),
  );
};
