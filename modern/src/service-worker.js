/* eslint-disable no-restricted-globals */

// Import Workbox modules
import { clientsClaim } from 'workbox-core';
import { ExpirationPlugin } from 'workbox-expiration';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

clientsClaim();

// Precache assets generated by the build process
precacheAndRoute(self.__WB_MANIFEST);

// App Shell-style routing
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') {
      return false;
    }
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/_')) {
      return false;
    }
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// Runtime caching for same-origin .png requests
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.endsWith('.png'),
  new StaleWhileRevalidate({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// Handle 'SKIP_WAITING' message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Listen for the 'install' event and force activation
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Take control of all clients as soon as the service worker is activated
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Optionally notify clients about updates
self.addEventListener('controllerchange', () => {
  // Notify clients about the update, e.g., via a custom event or direct message
  navigator.serviceWorker.oncontrollerchange = () => {
    window.location.reload();
  };
});

// Any other custom service worker logic can go here.
function isAsset(url) {
  return isNotApi(url) && isNotSocket(url) && !url.href?.includes('chunk');
}

function isNotApi(url) {
  return !url.pathname.startsWith('/api/');
}

function isNotSocket(url) {
  return !/\/socket.io\/\?/.test(url.href);
}

function race(promiseA, promiseB) {
  return new Promise((fulfil, reject) => {
    promiseA.then(fulfil, () => promiseB.catch(reject));
    promiseB.then(fulfil, () => promiseA.catch(reject));
  });
}

function fromCache(request) {
  return caches.match(request)
    .then(response => {
      if (!response) {
        return Promise.reject('not-found');
      }
      return Promise.resolve(response);
    });
}

function fromNetwork(request) {
  return fetch(request);
}

function update(request, response) {
  return self.caches.open('tileCache')
    .then(cache => cache.put(request, response));
}

self.onfetch = (evt) => {
  var request = evt.request;
  var url = new URL(request.url);
  if (request.method === 'GET' && isAsset(url)) {
    var cacheResponse = fromCache(request);
    var networkResponse = fromNetwork(request);
    evt.respondWith(race(
      cacheResponse,
      networkResponse.then(response => response.clone())
    ));
    evt.waitUntil(networkResponse.then(response => update(request, response.clone())));
  }
};

// push
self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'GPS Tracker MX';
  const options = {
    body: event.data.text(),
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click received.');

  event.notification.close();
});