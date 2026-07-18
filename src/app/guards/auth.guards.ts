import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

function signedInRedirectTarget(authSession: AuthSessionService): string[] {
  if (authSession.isSuperuser()) {
    return ['/admin'];
  }

  return ['/en'];
}

async function redirectAuthenticatedUsers(): Promise<
  boolean | ReturnType<Router['createUrlTree']>
> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  await authSession.waitForBootstrap();

  return authSession.isAuthenticated()
    ? router.createUrlTree(signedInRedirectTarget(authSession))
    : true;
}

async function requireAuthentication(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

  await authSession.waitForBootstrap();

  return authSession.isAuthenticated() ? true : router.createUrlTree(['/sign-in']);
}

async function requireBuyerAccess(): Promise<boolean | ReturnType<Router['createUrlTree']>> {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

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
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

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
  const authSession = inject(AuthSessionService);
  const router = inject(Router);

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

export const subscriptionsEnabledGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  await authSession.waitForBootstrap();
  return authSession.subscriptionsEnabled() ? true : router.createUrlTree(['/seller/listings']);
};

function requireAdminPermission(
  permissionCheck: (session: AuthSessionService) => boolean,
): CanActivateFn {
  return async () => {
    const authSession = inject(AuthSessionService);
    const router = inject(Router);

    await authSession.waitForBootstrap();

    if (!authSession.isAuthenticated()) {
      return router.createUrlTree(['/sign-in']);
    }

    if (!authSession.isSuperuser()) {
      return router.createUrlTree(signedInRedirectTarget(authSession));
    }

    if (!permissionCheck(authSession)) {
      return router.createUrlTree(['/admin']);
    }

    return true;
  };
}

export const adminUsersGuard: CanActivateFn = requireAdminPermission(s => s.canManageUsers());
export const adminListingsGuard: CanActivateFn = requireAdminPermission(s => s.canManageListings());
export const adminKycGuard: CanActivateFn = requireAdminPermission(s => s.canManageKyc());
export const adminReportsGuard: CanActivateFn = requireAdminPermission(s => s.canManageReports());
export const adminAnalyticsGuard: CanActivateFn = requireAdminPermission(s => s.canViewAnalytics());
export const adminTeamGuard: CanActivateFn = requireAdminPermission(s => s.canManageTeam());
export const adminSiteConfigGuard: CanActivateFn = requireAdminPermission(s => s.canManageSiteConfiguration());
export const adminAdsGuard: CanActivateFn = requireAdminPermission(s => s.canManageAds());
export const adminCategoriesGuard: CanActivateFn = requireAdminPermission(s => s.canManageCategories());
