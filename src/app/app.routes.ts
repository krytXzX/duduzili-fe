import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';

import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { ListingsPageComponent } from './pages/listings/listings-page.component';

// Mock guard
const isLoggedin = () => {
  return true;
}
export const routes: Routes = [
  // Home (Specific match for empty path)
  {
    path: '',
    component: HomePageComponent,
    pathMatch: 'full',
  },
  // Dashboard Routes
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [isLoggedin],
    children: [
      {
        path: 'listings',
        component: ListingsPageComponent,
      },
      {
        path: 'listings/:id',
        loadComponent: () =>
          import('./pages/listings/listing-details-page').then(
            (m) => m.ListingDetailsPageComponent
          ),
      },
      {
        path: 'my-stores',
        loadComponent: () =>
          import('./pages/my-stores/my-stores-page.component').then(
            (m) => m.MyStoresPageComponent
          ),
        pathMatch: 'full',
      },
      {
        path: 'my-stores/:id',
        loadComponent: () =>
          import('./pages/store/store-details-dashboard.component').then(
            (m) => m.StoreDetailsDashboardComponent
          ),
      },
      {
        path: 'messages',
        loadComponent: () =>
          import('./pages/messages/messages-page.component').then(
            (m) => m.MessagesPageComponent
          ),
      },
      {
        path: 'requests/offers',
        loadComponent: () =>
          import('./pages/requests/offers/offers-page.component').then(
            (m) => m.OffersPageComponent
          ),
      },
      {
        path: 'requests/callbacks',
        loadComponent: () =>
          import('./pages/requests/callbacks/callbacks-page.component').then(
            (m) => m.CallbacksPageComponent
          ),
      },
      {
        path: 'promotions',
        loadComponent: () =>
          import('./pages/promotions/banner-promotions-page.component').then(
            (m) => m.BannerPromotionsPageComponent
          ),
      },
    ],
  },
  // Auth Routes
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth/auth-layout.component').then(
        (m) => m.AuthLayoutComponent
      ),
    children: [
      {
        path: 'sign-in',
        loadComponent: () =>
          import('./pages/sign-in/sign-in-page').then(
            (module) => module.SignInPageComponent
          ),
      },
      {
        path: 'sign-up',
        loadComponent: () =>
          import('./pages/sign-up/sign-up-page').then(
            (m) => m.SignUpPageComponent
          ),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./pages/forgot-password/forgot-password-page').then(
            (m) => m.ForgotPasswordPageComponent
          ),
      },
      {
        path: 'two-factor',
        loadComponent: () =>
          import('./pages/two-factor/two-factor-page').then(
            (m) => m.TwoFactorPageComponent
          ),
      },
    ],
  },
  // Category & Product Routes
  {
    path: 'category',
    loadComponent: () =>
      import('./pages/category/category-page.component').then(
        (m) => m.CategoryPageComponent
      ),
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./pages/product/product-page.component').then(
        (m) => m.ProductPageComponent
      ),
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service-page.component').then(
        (m) => m.TermsOfServicePageComponent
      ),
  },
  // Catch-all (Optional, but good for stability)
  {
    path: '**',
    redirectTo: '',
  }
];
