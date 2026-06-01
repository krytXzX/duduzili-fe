import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';

import { BuyerDashboardLayoutComponent } from './components/layout/buyer-dashboard-layout.component';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { AdminDashboardLayoutComponent } from './components/layout/admin-dashboard-layout.component';
import {
  adminChildGuard,
  adminGuard,
  buyerChildGuard,
  buyerGuard,
  guestGuard,
  sellerChildGuard,
  sellerGuard,
} from './guards/auth.guards';
export const routes: Routes = [
  // Home (Specific match for empty path)
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full',
    title: 'Home',
  },
  {
    path: '',
    component: BuyerDashboardLayoutComponent,
    canActivate: [buyerGuard],
    canActivateChild: [buyerChildGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home',
      },
      {
        path: 'wishlist',
        title: 'Wishlist',
        loadComponent: () =>
          import('./pages/buyer/wishlist-page.component').then((m) => m.BuyerWishlistPageComponent),
      },
      {
        path: 'chats',
        title: 'Chats',
        loadComponent: () =>
          import('./pages/messages/messages-page.component').then((m) => m.MessagesPageComponent),
      },
      {
        path: 'followed-stores',
        title: 'Followed Stores',
        loadComponent: () =>
          import('./pages/buyer/followed-stores-page.component').then(
            (m) => m.BuyerFollowedStoresPageComponent,
          ),
      },
      {
        path: 'stores/:id',
        title: 'Store Details',
        loadComponent: () =>
          import('./pages/buyer/followed-store-details-page.component').then(
            (m) => m.BuyerFollowedStoreDetailsPageComponent,
          ),
      },
      {
        path: 'recently-viewed',
        title: 'Recently Viewed',
        loadComponent: () =>
          import('./pages/buyer/recently-viewed-page.component').then(
            (m) => m.BuyerRecentlyViewedPageComponent,
          ),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'more',
        title: 'More',
        loadComponent: () =>
          import('./pages/more/more-page.component').then((m) => m.MorePageComponent),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
  {
    path: 'admin/invite',
    title: 'Admin Invite',
    loadComponent: () =>
      import('./pages/admin/admin-home-page.component').then((m) => m.AdminHomePageComponent),
  },
  {
    path: 'admin',
    component: AdminDashboardLayoutComponent,
    canActivate: [adminGuard],
    canActivateChild: [adminChildGuard],
    children: [
      {
        path: '',
        title: 'Admin Home',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard-home-page.component').then(
            (m) => m.AdminDashboardHomePageComponent,
          ),
      },
      {
        path: 'users',
        title: 'Users',
        loadComponent: () =>
          import('./pages/admin/admin-users-page.component').then((m) => m.AdminUsersPageComponent),
      },
      {
        path: 'users/:id',
        title: 'User Details',
        loadComponent: () =>
          import('./pages/admin/admin-user-details-page.component').then(
            (m) => m.AdminUserDetailsPageComponent,
          ),
      },
      {
        path: 'listings',
        title: 'Listings',
        loadComponent: () =>
          import('./pages/admin/admin-listings-page.component').then(
            (m) => m.AdminListingsPageComponent,
          ),
      },
      {
        path: 'stores',
        title: 'Stores',
        loadComponent: () =>
          import('./pages/admin/admin-stores-page.component').then(
            (m) => m.AdminStoresPageComponent,
          ),
      },
      {
        path: 'categories',
        title: 'Categories',
        loadComponent: () =>
          import('./pages/admin/admin-categories-page.component').then(
            (m) => m.AdminCategoriesPageComponent,
          ),
      },
      {
        path: 'stores/:id',
        title: 'Store Details',
        loadComponent: () =>
          import('./pages/admin/admin-store-details-page.component').then(
            (m) => m.AdminStoreDetailsPageComponent,
          ),
      },
      {
        path: 'listings/:id',
        title: 'Listing Details',
        loadComponent: () =>
          import('./pages/admin/admin-listing-details-page.component').then(
            (m) => m.AdminListingDetailsPageComponent,
          ),
      },
      {
        path: 'ads',
        title: 'Ads Management',
        loadComponent: () =>
          import('./pages/admin/admin-ads-management-page.component').then(
            (m) => m.AdminAdsManagementPageComponent,
          ),
      },
      {
        path: 'ads/plans',
        title: 'Ads Plans',
        loadComponent: () =>
          import('./pages/admin/admin-ads-plans-page.component').then(
            (m) => m.AdminAdsPlansPageComponent,
          ),
      },
      {
        path: 'ads/running',
        title: 'Running Ads',
        loadComponent: () =>
          import('./pages/admin/admin-running-ads-page.component').then(
            (m) => m.AdminRunningAdsPageComponent,
          ),
      },
      {
        path: 'ads/approvals',
        title: 'Ads Approvals',
        loadComponent: () =>
          import('./pages/admin/admin-ads-approvals-page.component').then(
            (m) => m.AdminAdsApprovalsPageComponent,
          ),
      },
      {
        path: 'ads/transactions',
        title: 'Ads Transactions',
        loadComponent: () =>
          import('./pages/admin/admin-ads-transactions-page.component').then(
            (m) => m.AdminAdsTransactionsPageComponent,
          ),
      },
      {
        path: 'kyc-requests',
        title: 'KYC Requests',
        loadComponent: () =>
          import('./pages/admin/admin-kyc-requests-page.component').then(
            (m) => m.AdminKycRequestsPageComponent,
          ),
      },
      {
        path: 'reports',
        title: 'Reports',
        loadComponent: () =>
          import('./pages/admin/admin-reports-page.component').then(
            (m) => m.AdminReportsPageComponent,
          ),
      },
      {
        path: 'analytics',
        title: 'Analytics',
        loadComponent: () =>
          import('./pages/admin/admin-analytics-page.component').then(
            (m) => m.AdminAnalyticsPageComponent,
          ),
      },
      {
        path: 'more',
        title: 'More',
        loadComponent: () =>
          import('./pages/admin/admin-more-page.component').then((m) => m.AdminMorePageComponent),
      },
      {
        path: 'audit-log',
        title: 'Audit Log',
        loadComponent: () =>
          import('./pages/admin/admin-audit-log-page.component').then(
            (m) => m.AdminAuditLogPageComponent,
          ),
      },
      {
        path: 'team-management',
        title: 'Team Management',
        loadComponent: () =>
          import('./pages/admin/admin-team-management-page.component').then(
            (m) => m.AdminTeamManagementPageComponent,
          ),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'notifications',
        title: 'Notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications-page.component').then(
            (m) => m.NotificationsPageComponent,
          ),
      },
    ],
  },
  // Dashboard Routes
  {
    path: 'seller',
    component: DashboardLayoutComponent,
    canActivate: [sellerGuard],
    canActivateChild: [sellerChildGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'listings',
      },
      {
        path: 'listings',
        title: 'Listings',
        loadComponent: () =>
          import('./pages/listings/listings-page.component').then((m) => m.ListingsPageComponent),
      },
      {
        path: 'listings/:id',
        title: 'Listing Details',
        loadComponent: () =>
          import('./pages/listings/listing-details-page').then(
            (m) => m.ListingDetailsPageComponent,
          ),
      },
      {
        path: 'my-stores',
        title: 'My Stores',
        loadComponent: () =>
          import('./pages/my-stores/my-stores-page.component').then((m) => m.MyStoresPageComponent),
        pathMatch: 'full',
      },
      {
        path: 'my-stores/:id',
        title: 'Store Details',
        loadComponent: () =>
          import('./pages/store/store-details-dashboard.component').then(
            (m) => m.StoreDetailsDashboardComponent,
          ),
      },
      {
        path: 'messages',
        title: 'Messages',
        loadComponent: () =>
          import('./pages/messages/messages-page.component').then((m) => m.MessagesPageComponent),
      },
      {
        path: 'requests',
        title: 'Requests',
        loadComponent: () =>
          import('./pages/requests/requests-page.component').then((m) => m.RequestsPageComponent),
      },
      {
        path: 'requests/offers',
        title: 'Offers',
        loadComponent: () =>
          import('./pages/requests/offers/offers-page.component').then(
            (m) => m.OffersPageComponent,
          ),
      },
      {
        path: 'requests/callbacks',
        title: 'Call Back Requests',
        loadComponent: () =>
          import('./pages/requests/callbacks/callbacks-page.component').then(
            (m) => m.CallbacksPageComponent,
          ),
      },
      {
        path: 'more',
        title: 'More',
        loadComponent: () =>
          import('./pages/more/seller-more-page.component').then((m) => m.SellerMorePageComponent),
      },
      {
        path: 'promotions',
        title: 'Banner Promotions',
        loadComponent: () =>
          import('./pages/promotions/banner-promotions-page.component').then(
            (m) => m.BannerPromotionsPageComponent,
          ),
      },
      {
        path: 'ads',
        title: 'Ads',
        loadComponent: () =>
          import('./pages/ads/ads-page.component').then((m) => m.AdsPageComponent),
      },
      {
        path: 'ads/plans',
        title: 'Plans',
        loadComponent: () =>
          import('./pages/ads/plans-page.component').then((m) => m.AdsPlansPageComponent),
      },
      {
        path: 'ads/running',
        title: 'Running Ads',
        loadComponent: () =>
          import('./pages/ads/running-ads-page.component').then((m) => m.RunningAdsPageComponent),
      },
      {
        path: 'ads/running/:id',
        title: 'Ad Details',
        loadComponent: () =>
          import('./pages/ads/ad-details-page.component').then((m) => m.AdDetailsPageComponent),
      },
      {
        path: 'ads/billing-history',
        title: 'Billing History',
        loadComponent: () =>
          import('./pages/ads/billing-history-page.component').then(
            (m) => m.BillingHistoryPageComponent,
          ),
      },
      {
        path: 'analytics',
        title: 'Analytics',
        loadComponent: () =>
          import('./pages/analytics/analytics-page.component').then(
            (m) => m.AnalyticsPageComponent,
          ),
      },
      {
        path: 'wallet',
        title: 'Wallet',
        loadComponent: () =>
          import('./pages/wallet/wallet-page.component').then((m) => m.WalletPageComponent),
      },
      {
        path: 'settings',
        title: 'Settings',
        loadComponent: () =>
          import('./pages/settings/settings-page.component').then((m) => m.SettingsPageComponent),
      },
      {
        path: 'notifications',
        title: 'Notifications',
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
        title: 'Sign In',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/sign-in/sign-in-page').then((module) => module.SignInPageComponent),
      },
      {
        path: 'sign-up',
        title: 'Sign Up',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/sign-up/sign-up-page').then((m) => m.SignUpPageComponent),
      },
      {
        path: 'forgot-password',
        title: 'Forgot Password',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password-page').then(
            (m) => m.ForgotPasswordPageComponent,
          ),
      },
      {
        path: 'two-factor',
        title: 'Two Factor Authentication',
        canActivate: [guestGuard],
        loadComponent: () =>
          import('./pages/two-factor/two-factor-page').then((m) => m.TwoFactorPageComponent),
      },
    ],
  },
  {
    path: 'home',
    title: 'Home',
    canActivate: [buyerGuard],
    loadComponent: () =>
      import('./pages/home/buyer-signed-in-home-page.component').then(
        (m) => m.BuyerSignedInHomePageComponent,
      ),
  },
  // Category & Product Routes
  {
    path: 'search',
    title: 'Search',
    loadComponent: () =>
      import('./pages/search/search-page.component').then((m) => m.SearchPageComponent),
  },
  {
    path: 'category',
    title: 'Categories',
    loadComponent: () =>
      import('./pages/category/category-page.component').then((m) => m.CategoryPageComponent),
  },
  {
    path: 'product/:id',
    title: 'Product Details',
    loadComponent: () =>
      import('./pages/product/product-page.component').then((m) => m.ProductPageComponent),
  },
  {
    path: 'terms-of-service',
    title: 'Terms of Service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service-page.component').then(
        (m) => m.TermsOfServicePageComponent,
      ),
  },
  {
    path: 'privacy-policy',
    title: 'Privacy Policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy-page.component').then(
        (m) => m.PrivacyPolicyPageComponent,
      ),
  },
  // Catch-all (Optional, but good for stability)
  {
    path: '**',
    redirectTo: '',
  },
];
