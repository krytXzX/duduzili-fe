import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/invite',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  // Dashboard routes (CSR only)
  {
    path: 'en',
    renderMode: RenderMode.Client,
  },
  {
    path: 'wishlist',
    renderMode: RenderMode.Client,
  },
  {
    path: 'chats',
    renderMode: RenderMode.Client,
  },
  {
    path: 'followed-stores',
    renderMode: RenderMode.Client,
  },
  {
    path: 'stores/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'recently-viewed',
    renderMode: RenderMode.Client,
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'more',
    renderMode: RenderMode.Client,
  },
  {
    path: 'notifications',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/listings/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/my-stores/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/messages',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/requests/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/promotions',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/ads/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/analytics',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/wallet',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/settings',
    renderMode: RenderMode.Client,
  },
  {
    path: 'seller/notifications',
    renderMode: RenderMode.Client,
  },
  // Auth and Public routes (SSR)
  {
    path: 'sign-in',
    renderMode: RenderMode.Server,
  },
  {
    path: 'sign-up',
    renderMode: RenderMode.Server,
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Server,
  },
  {
    path: 'search',
    renderMode: RenderMode.Server,
  },
  {
    path: 'category',
    renderMode: RenderMode.Server,
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  // Match any other route for SSR by default
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
