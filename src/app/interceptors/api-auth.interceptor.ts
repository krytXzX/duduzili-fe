import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';
import { AppModeService } from '../services/app-mode.service';

const apiUrl = environment.apiUrl.replace(/\/+$/, '');
const isAuthEndpoint = (url: string): boolean => /\/auth\/(?:.+)\/?$/.test(url);
const isMutationMethod = (method: string): boolean =>
  method === 'POST' || method === 'PUT' || method === 'PATCH' || method === 'DELETE';

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
  const csrfToken = authSession.csrfToken();
  const shouldAttachAuthorization = !isAuthEndpoint(request.url) && !!accessToken;
  const shouldAttachCsrfToken = isMutationMethod(request.method) && !!csrfToken;

  let headers = request.headers;

  if (shouldAttachAuthorization) {
    headers = headers.set('Authorization', `Bearer ${accessToken}`);
  }

  if (shouldAttachCsrfToken) {
    headers = headers.set('X-CSRFToken', csrfToken);
  }

  return next(
    request.clone({
      withCredentials: true,
      headers,
    }),
  );
};
