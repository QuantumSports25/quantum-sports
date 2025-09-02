// Minimal CRA-compatible service worker registration helper

export function register() {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    const registerNow = () => {
      navigator.serviceWorker
        .register(swUrl)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error('SW registration failed:', error);
        });
    };

    if (document.readyState === 'complete') {
      registerNow();
    } else {
      window.addEventListener('load', registerNow);
    }
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch(() => undefined);
  }
}

