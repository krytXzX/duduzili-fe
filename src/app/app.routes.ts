import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';

import { BuyerDashboardLayoutComponent } from './components/layout/buyer-dashboard-layout.component';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { AdminDashboardLayoutComponent } from './components/layout/admin-dashboard-layout.component';

// Mock guard
const isLoggedin = () => {
  return true;
};
export const routes: Routes = [
  // Home (Specific match for empty path)
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full',
  },
  {
    path: 'buyer',
    component: BuyerDashboardLayoutComponent,
    canActivate: [isLoggedin],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'chats',
      },
      {
        path: 'wishlist',
        loadComponent: () =>
          import('./pages/buyer/wishlist-page.component').then((m) => m.BuyerWishlistPageComponent),
      },
      {
        path: 'chats',
        loadComponent: () =>
          import('./pages/messages/messages-page.component').then((m) => m.MessagesPageComponent),
      },
      {
        path: 'followed-stores',
        loadComponent: () =>
          import('./pages/buyer/followed-stores-page.component').then(
            (m) => m.BuyerFollowedStoresPageComponent,
          ),
      },
      {
        path: 'followed-stores/:id',
        loadComponent: () =>
          import('./pages/buyer/followed-store-details-page.component').then(
            (m) => m.BuyerFollowedStoreDetailsPageComponent,
          ),
      },
      {
        path: 'recently-viewed',
        loadComponent: () =>
          import('./pages/buyer/recently-viewed-page.component').then(
            (m) => m.BuyerRecentlyViewedPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('./pages/more/more-page.component').then((m) => m.MorePageComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
  {
    path: 'admin/invite',
    loadComponent: () =>
      import('./pages/admin/admin-home-page.component').then((m) => m.AdminHomePageComponent),
  },
  {
    path: 'admin',
    component: AdminDashboardLayoutComponent,
    canActivate: [isLoggedin],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard-home-page.component').then(
            (m) => m.AdminDashboardHomePageComponent,
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/admin/admin-users-page.component').then((m) => m.AdminUsersPageComponent),
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./pages/admin/admin-user-details-page.component').then(
            (m) => m.AdminUserDetailsPageComponent,
          ),
      },
      {
        path: 'listings',
        loadComponent: () =>
          import('./pages/admin/admin-listings-page.component').then(
            (m) => m.AdminListingsPageComponent,
          ),
      },
      {
        path: 'stores',
        loadComponent: () =>
          import('./pages/admin/admin-stores-page.component').then(
            (m) => m.AdminStoresPageComponent,
          ),
      },
      {
        path: 'stores/:id',
        loadComponent: () =>
          import('./pages/admin/admin-store-details-page.component').then(
            (m) => m.AdminStoreDetailsPageComponent,
          ),
      },
      {
        path: 'listings/:id',
        loadComponent: () =>
          import('./pages/admin/admin-listing-details-page.component').then(
            (m) => m.AdminListingDetailsPageComponent,
          ),
      },
      {
        path: 'ads',
        loadComponent: () =>
          import('./pages/ads/ads-page.component').then((m) => m.AdsPageComponent),
      },
      {
        path: 'ads/plans',
        loadComponent: () =>
          import('./pages/admin/admin-ads-plans-page.component').then(
            (m) => m.AdminAdsPlansPageComponent,
          ),
      },
      {
        path: 'ads/running',
        loadComponent: () =>
          import('./pages/admin/admin-running-ads-page.component').then(
            (m) => m.AdminRunningAdsPageComponent,
          ),
      },
      {
        path: 'ads/approvals',
        loadComponent: () =>
          import('./pages/admin/admin-ads-approvals-page.component').then(
            (m) => m.AdminAdsApprovalsPageComponent,
          ),
      },
      {
        path: 'ads/transactions',
        loadComponent: () =>
          import('./pages/admin/admin-ads-transactions-page.component').then(
            (m) => m.AdminAdsTransactionsPageComponent,
          ),
      },
      {
        path: 'kyc-requests',
        loadComponent: () =>
          import('./pages/admin/admin-kyc-requests-page.component').then(
            (m) => m.AdminKycRequestsPageComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/admin/admin-reports-page.component').then(
            (m) => m.AdminReportsPageComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/admin/admin-analytics-page.component').then(
            (m) => m.AdminAnalyticsPageComponent,
          ),
      },
      {
        path: 'audit-log',
        loadComponent: () =>
          import('./pages/admin/admin-audit-log-page.component').then(
            (m) => m.AdminAuditLogPageComponent,
          ),
      },
      {
        path: 'team-management',
        loadComponent: () =>
          import('./pages/admin/admin-team-management-page.component').then(
            (m) => m.AdminTeamManagementPageComponent,
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
  // Dashboard Routes
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [isLoggedin],
    children: [
      {
        path: 'listings',
        loadComponent: () =>
          import('./pages/listings/listings-page.component').then((m) => m.ListingsPageComponent),
      },
      {
        path: 'listings/:id',
        loadComponent: () =>
          import('./pages/listings/listing-details-page').then(
            (m) => m.ListingDetailsPageComponent,
          ),
      },
      {
        path: 'my-stores',
        loadComponent: () =>
          import('./pages/my-stores/my-stores-page.component').then((m) => m.MyStoresPageComponent),
        pathMatch: 'full',
      },
      {
        path: 'my-stores/:id',
        loadComponent: () =>
          import('./pages/store/store-details-dashboard.component').then(
            (m) => m.StoreDetailsDashboardComponent,
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages/messages-page.component').then((m) => m.MessagesPageComponent),
      },
      {
        path: 'requests',
        loadComponent: () =>
          import('./pages/requests/requests-page.component').then((m) => m.RequestsPageComponent),
      },
      {
        path: 'requests/offers',
        loadComponent: () =>
          import('./pages/requests/offers/offers-page.component').then(
            (m) => m.OffersPageComponent,
          ),
      },
      {
        path: 'requests/callbacks',
        loadComponent: () =>
          import('./pages/requests/callbacks/callbacks-page.component').then(
            (m) => m.CallbacksPageComponent,
          ),
      },
      {
        path: 'more',
        loadComponent: () =>
          import('./pages/more/more-page.component').then((m) => m.MorePageComponent),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/promotions/banner-promotions-page.component').then(
            (m) => m.BannerPromotionsPageComponent,
          ),
      },
      {
        path: 'ads',
        loadComponent: () =>
          import('./pages/ads/ads-page.component').then((m) => m.AdsPageComponent),
      },
      {
        path: 'ads/plans',
        loadComponent: () =>
          import('./pages/ads/plans-page.component').then((m) => m.AdsPlansPageComponent),
      },
      {
        path: 'ads/running',
        loadComponent: () =>
          import('./pages/ads/running-ads-page.component').then((m) => m.RunningAdsPageComponent),
      },
      {
        path: 'ads/running/:id',
        loadComponent: () =>
          import('./pages/ads/ad-details-page.component').then((m) => m.AdDetailsPageComponent),
      },
      {
        path: 'ads/billing-history',
        loadComponent: () =>
          import('./pages/ads/billing-history-page.component').then(
            (m) => m.BillingHistoryPageComponent,
          ),
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./pages/analytics/analytics-page.component').then(
            (m) => m.AnalyticsPageComponent,
          ),
      },
      {
        path: 'wallet',
        loadComponent: () =>
          import('./pages/wallet/wallet-page.component').then((m) => m.WalletPageComponent),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
  // Auth Routes
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth/auth-layout.component').then((m) => m.AuthLayoutComponent),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./pages/sign-in/sign-in-page').then((module) => module.SignInPageComponent),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./pages/sign-up/sign-up-page').then((m) => m.SignUpPageComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password-page').then(
            (m) => m.ForgotPasswordPageComponent,
          ),
      },
      {
        path: 'two-factor',
        loadComponent: () =>
          import('./pages/two-factor/two-factor-page').then((m) => m.TwoFactorPageComponent),
      },
    ],
  },
  // Category & Product Routes
  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category-page.component').then((m) => m.CategoryPageComponent),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product-page.component').then((m) => m.ProductPageComponent),
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service-page.component').then(
        (m) => m.TermsOfServicePageComponent,
      ),
  },
  // Catch-all (Optional, but good for stability)
  {
    path: '**',
    redirectTo: '',
  },
];
