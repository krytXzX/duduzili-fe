import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';

const apiUrl = environment.apiUrl.replace(/\/+$/, '');

export const apiAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith(apiUrl)) {
    return next(request);
  }

  const authSession = inject(AuthSessionService);
  const accessToken = authSession.accessToken();

  const headers = accessToken
    ? request.headers.set('Authorization', `Bearer ${accessToken}`)
    : request.headers;

  return next(
    request.clone({
      withCredentials: true,
      headers,
    }),
  );
};
