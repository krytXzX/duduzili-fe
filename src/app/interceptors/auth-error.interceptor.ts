import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthSessionService } from '../services/auth-session.service';

const apiUrl = environment.apiUrl.replace(/\/+$/, '');

export const authErrorInterceptor: HttpInterceptorFn = (request, next) => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return next(request).pipe(
    catchError((error: unknown) => {
      const isApiRequest = request.url.startsWith(apiUrl);
      const isHttp401 = error instanceof HttpErrorResponse && error.status === 401;
      const isAuthRequest = /\/auth\/(login|login\/check-email|logout|refresh)\/?$/.test(
        request.url,
      );

      if (isApiRequest && isHttp401 && !isAuthRequest) {
        authSession.clearSession();
        void router.navigate(['/sign-in']);
      }

      return throwError(() => error);
    }),
  );
};
