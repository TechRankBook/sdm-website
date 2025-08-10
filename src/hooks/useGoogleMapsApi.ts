// Shared Google Maps JS API loader to ensure reliable initialization across components
// Handles cases where the script exists but isn't loaded yet, and avoids duplicate inserts.

let googleMapsLoadingPromise: Promise<any> | null = null;

declare global {
  interface Window {
    google: any;
  }
}

export function loadGoogleMapsApi(): Promise<any> {
  // Already available
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    return Promise.resolve((window as any).google);
  }

  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    ) as HTMLScriptElement | null;

    const resolveIfReady = () => {
      if ((window as any).google?.maps) {
        resolve((window as any).google);
        return true;
      }
      return false;
    };

    if (resolveIfReady()) return; // In case it loaded between checks

    const onLoad = () => {
      if (!resolveIfReady()) {
        // In rare cases, load fires before maps is ready; poll briefly
        const start = Date.now();
        const iv = window.setInterval(() => {
          if (resolveIfReady()) {
            window.clearInterval(iv);
          } else if (Date.now() - start > 5000) {
            window.clearInterval(iv);
            reject(new Error('Google Maps API loaded but maps namespace unavailable'));
          }
        }, 50);
      }
    };

    const onError = () => reject(new Error('Failed to load Google Maps API'));

    if (existing) {
      // Attach listeners in case it hasn't finished loading
      existing.addEventListener('load', onLoad, { once: true });
      existing.addEventListener('error', onError, { once: true });

      // Fallback polling if events don't fire (cached or preloaded)
      const start = Date.now();
      const iv = window.setInterval(() => {
        if (resolveIfReady()) {
          window.clearInterval(iv);
        } else if (Date.now() - start > 15000) {
          window.clearInterval(iv);
          reject(new Error('Timed out waiting for Google Maps API'));
        }
      }, 50);
      return;
    }

    // Insert script if not present
    const script = document.createElement('script');
    script.src =
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ&libraries=places&loading=async';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.head.appendChild(script);

    // Extra safety: poll in case load event is missed by the browser
    const start = Date.now();
    const iv = window.setInterval(() => {
      if (resolveIfReady()) {
        window.clearInterval(iv);
      } else if (Date.now() - start > 15000) {
        window.clearInterval(iv);
        reject(new Error('Timed out waiting for Google Maps API'));
      }
    }, 50);
  });

  return googleMapsLoadingPromise;
}
