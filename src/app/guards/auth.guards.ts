import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

function signedInRedirectTarget(): string[] {
  const authSession = inject(AuthSessionService);

  if (authSession.isSuperuser()) {
    return ['/admin'];
  }

  return ['/home'];
}

function redirectAuthenticatedUsers(): boolean | ReturnType<Router['createUrlTree']> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return authSession.isAuthenticated()
    ? router.createUrlTree(signedInRedirectTarget())
    : true;
}

function requireAuthentication(): boolean | ReturnType<Router['createUrlTree']> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  return authSession.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
}

function requireBuyerAccess(): boolean | ReturnType<Router['createUrlTree']> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget());
  }

  return true;
}

function requireSellerAccess(): boolean | ReturnType<Router['createUrlTree']> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget());
  }

  return true;
}

function requireAdminAccess(): boolean | ReturnType<Router['createUrlTree']> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (!authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget());
  }

  return true;
}

export const authenticatedGuard: CanActivateFn = () => requireAuthentication();
export const buyerGuard: CanActivateFn = () => requireBuyerAccess();
export const buyerChildGuard: CanActivateChildFn = () => requireBuyerAccess();
export const sellerGuard: CanActivateFn = () => requireSellerAccess();
export const sellerChildGuard: CanActivateChildFn = () => requireSellerAccess();
export const adminGuard: CanActivateFn = () => requireAdminAccess();
export const adminChildGuard: CanActivateChildFn = () => requireAdminAccess();
export const guestGuard: CanActivateFn = () => redirectAuthenticatedUsers();
