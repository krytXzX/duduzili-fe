import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';
import { AppModeService } from '../services/app-mode.service';
import { DemoAuthService } from '../services/demo-auth.service';

function signedInRedirectTarget(authSession: AuthSessionService): string[] {
  if (authSession.isSuperuser()) {
    return ['/admin'];
  }

  return ['/home'];
}

async function redirectAuthenticatedUsers(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const appMode = inject(AppModeService);
  const demoAuth = inject(DemoAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!appMode.isBackendEnabled()) {
    return demoAuth.isAuthenticated() ? router.createUrlTree(['/home']) : true;
  }

  await authSession.waitForBootstrap();

  return authSession.isAuthenticated()
    ? router.createUrlTree(signedInRedirectTarget(authSession))
    : true;
}

async function requireAuthentication(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const appMode = inject(AppModeService);
  const demoAuth = inject(DemoAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!appMode.isBackendEnabled()) {
    return demoAuth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
  }

  await authSession.waitForBootstrap();

  return authSession.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
}

async function requireBuyerAccess(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const appMode = inject(AppModeService);
  const demoAuth = inject(DemoAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!appMode.isBackendEnabled()) {
    return demoAuth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
  }

  await authSession.waitForBootstrap();

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget(authSession));
  }

  return true;
}

async function requireSellerAccess(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const appMode = inject(AppModeService);
  const demoAuth = inject(DemoAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!appMode.isBackendEnabled()) {
    return demoAuth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
  }

  await authSession.waitForBootstrap();

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget(authSession));
  }

  return true;
}

async function requireAdminAccess(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const appMode = inject(AppModeService);
  const demoAuth = inject(DemoAuthService);
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  if (!appMode.isBackendEnabled()) {
    return demoAuth.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
  }

  await authSession.waitForBootstrap();

  if (!authSession.isAuthenticated()) {
    return router.createUrlTree(['/sign-in']);
  }

  if (!authSession.isSuperuser()) {
    return router.createUrlTree(signedInRedirectTarget(authSession));
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
