import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Dashboard routes (CSR only)
  {
    path: 'listings/**',
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
