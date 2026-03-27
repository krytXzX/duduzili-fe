import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing-page').then(
        (module) => module.LandingPageComponent,
      ),
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./pages/sign-in/sign-in-page').then(
        (module) => module.SignInPageComponent,
      ),
  },
];
