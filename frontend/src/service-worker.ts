/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// CRA + Workbox: This file is processed by workbox-webpack-plugin (InjectManifest)
// at build time and `self.__WB_MANIFEST` will be injected with precache entries.

import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };

// Immediately take control of pages
self.skipWaiting();
clientsClaim();

// Precache the build assets
precacheAndRoute(self.__WB_MANIFEST || []);

// App Shell-style routing: serve index.html for navigation requests
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' &&
    // Exclude URLs starting with /_ and containing a file extension
    !url.pathname.startsWith('/_') &&
    !fileExtensionRegexp.test(url.pathname),
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Runtime caching: static assets generated at runtime (if any)
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/static/'),
  new CacheFirst({
    cacheName: 'static-resources',
    plugins: [
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 30 * 24 * 60 * 60 }), // 30 days
    ],
  })
);

// Runtime caching: images
registerRoute(
  ({ request }) => request.destination === 'image',
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 })], // 7 days
  })
);

// Example API caching for GET requests to same-origin `/api` (tweak as needed)
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 })], // 5 minutes
  })
);
