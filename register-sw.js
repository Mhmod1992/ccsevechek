// register-sw.js

if ('serviceWorker' in navigator) {
  // Check if a service worker is already controlling the page.
  // If not, it's the first visit or a hard refresh, so we need to register and potentially reload.
  if (!navigator.serviceWorker.controller) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
          .then(function(registration) {
            console.log('Service worker has been registered.');
            
            // This event fires when the new service worker has taken control of the page.
            navigator.serviceWorker.addEventListener('controllerchange', function() {
              // The page is now controlled by the service worker.
              // Reload the page to ensure all scripts are fetched through the service worker.
              console.log('New service worker activated. Reloading page to apply MIME type fix.');
              window.location.reload();
            });
          }).catch(function(error) {
            console.log('Service worker registration failed:', error);
          });
    });
  } else {
      console.log('Service worker is active and controlling the page.');
  }
}
