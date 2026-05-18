import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';
import { AppModeService } from '../services/app-mode.service';

const apiUrl = environment.apiUrl.replace(/\/+$/, '');
const isAuthEndpoint = (url: string): boolean => /\/auth\/(?:.+)\/?$/.test(url);

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const appMode = inject(AppModeService);
  if (!appMode.isBackendEnabled()) {
    return next(request);
  }

  if (!request.url.startsWith(apiUrl)) {
    return next(request);
  }

  const authSession = inject(AuthSessionService);
  const accessToken = authSession.accessToken();
  const shouldAttachAuthorization = !isAuthEndpoint(request.url) && !!accessToken;

  const headers = shouldAttachAuthorization
    ? request.headers.set('Authorization', `Bearer ${accessToken}`)
    : request.headers;

  return next(
    request.clone({
      withCredentials: true,
      headers,
    }),
  );
};
