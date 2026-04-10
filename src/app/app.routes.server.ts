import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'admin/invite',
    renderMode: RenderMode.Server
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  // Dashboard routes (CSR only)
  {
    path: 'listings/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'my-stores/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'messages',
    renderMode: RenderMode.Client
  },
  {
    path: 'requests/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'promotions',
    renderMode: RenderMode.Client
  },
  {
    path: 'ads/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'analytics',
    renderMode: RenderMode.Client
  },
  {
    path: 'wallet',
    renderMode: RenderMode.Client
  },
  {
    path: 'settings',
    renderMode: RenderMode.Client
  },
  {
    path: 'notifications',
    renderMode: RenderMode.Client
  },
  // Auth and Public routes (SSR)
  {
    path: 'sign-in',
    renderMode: RenderMode.Server
  },
  {
    path: 'sign-up',
    renderMode: RenderMode.Server
  },
  {
    path: 'forgot-password',
    renderMode: RenderMode.Server
  },
  {
    path: 'category',
    renderMode: RenderMode.Server
  },
  {
    path: 'product/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '',
    renderMode: RenderMode.Server
  },
  // Match any other route for SSR by default
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
