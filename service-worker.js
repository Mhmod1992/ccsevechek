// service-worker.js

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Check if the request is for a .ts or .tsx file
  if (url.pathname.endsWith('.ts') || url.pathname.endsWith('.tsx')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If the fetch fails, just return the failed response
          if (!response.ok) {
            return response;
          }

          // Clone the response headers and set the correct Content-Type
          const newHeaders = new Headers(response.headers);
          newHeaders.set('Content-Type', 'text/javascript');

          // Create and return a new response with the modified headers
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch(error => {
            // Handle fetch errors (e.g., network failures)
            console.error('Service Worker fetch failed:', error);
            throw error;
        })
    );
  }
  // For all other requests, let them pass through normally
});
