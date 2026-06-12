import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

const NETWORK_FAILURE_MESSAGE = 'Something went wrong, try again later';

export const networkErrorInterceptor: HttpInterceptorFn = (request, next) =>
  next(request).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 0) {
        const normalizedError = new HttpErrorResponse({
          error: {
            detail: NETWORK_FAILURE_MESSAGE,
            message: NETWORK_FAILURE_MESSAGE,
          },
          headers: error.headers,
          status: error.status,
          statusText: 'Network Error',
          url: error.url ?? request.urlWithParams,
        });

        Object.defineProperty(normalizedError, 'message', {
          configurable: true,
          value: NETWORK_FAILURE_MESSAGE,
        });

        return throwError(() => normalizedError);
      }

      return throwError(() => error);
    }),
  );
