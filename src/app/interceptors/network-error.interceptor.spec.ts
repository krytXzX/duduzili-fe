import { TestBed } from '@angular/core/testing';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { networkErrorInterceptor } from './network-error.interceptor';

describe('networkErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([networkErrorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should pass through successful requests', () => {
    let responseData: unknown;
    httpClient.get('/api/test').subscribe((response) => {
      responseData = response;
    });

    const req = httpMock.expectOne('/api/test');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true });

    expect(responseData).toEqual({ success: true });
  });

  it('should pass through 4xx client errors without modification', () => {
    const errorBody = { detail: 'Invalid credentials' };
    let capturedError: HttpErrorResponse | undefined;

    httpClient.get('/api/test').subscribe({
      next: () => {
        throw new Error('expected an error');
      },
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush(errorBody, { status: 400, statusText: 'Bad Request' });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(400);
    expect(capturedError?.error).toEqual(errorBody);
  });

  it('should rewrite 0 status (network failure) errors to a generic error message', () => {
    let capturedError: HttpErrorResponse | undefined;

    httpClient.get('/api/test').subscribe({
      next: () => {
        throw new Error('expected an error');
      },
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.error(new ProgressEvent('error'));

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(0);
    expect(capturedError?.error).toEqual({
      detail: 'Something went wrong, try again later',
      message: 'Something went wrong, try again later',
    });
    expect(capturedError?.message).toBe('Something went wrong, try again later');
  });

  it('should rewrite 5xx status (server failure) errors to a generic error message', () => {
    let capturedError: HttpErrorResponse | undefined;

    httpClient.get('/api/test').subscribe({
      next: () => {
        throw new Error('expected an error');
      },
      error: (error: HttpErrorResponse) => {
        capturedError = error;
      },
    });

    const req = httpMock.expectOne('/api/test');
    req.flush('Internal Server Error', { status: 500, statusText: 'Internal Server Error' });

    expect(capturedError).toBeDefined();
    expect(capturedError?.status).toBe(500);
    expect(capturedError?.error).toEqual({
      detail: 'Something went wrong, try again later',
      message: 'Something went wrong, try again later',
    });
    expect(capturedError?.message).toBe('Something went wrong, try again later');
  });
});
