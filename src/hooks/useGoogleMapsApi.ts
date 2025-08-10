// Shared Google Maps JS API loader to ensure reliable initialization across components
// Handles cases where the script exists but isn't loaded yet, and avoids duplicate inserts.

import { useEffect, useState } from 'react';

let googleMapsLoadingPromise: Promise<any> | null = null;

declare global {
  interface Window {
    google: any;
  }
}

async function ensureLibrariesLoaded(google: any) {
  // Ensure the modular libraries are available before resolving
  if (google?.maps?.importLibrary) {
    await Promise.all([
      google.maps.importLibrary('maps'),
      google.maps.importLibrary('places').catch(() => {}),
      // Load routes/geocoding if available for Directions/Geocoder reliability
      google.maps.importLibrary?.('routes')?.catch?.(() => {}),
      google.maps.importLibrary?.('geocoding')?.catch?.(() => {}),
    ]);
  }
}

export function loadGoogleMapsApi(): Promise<any> {
  // Already available
  if (typeof window !== 'undefined' && (window as any).google?.maps) {
    const g = (window as any).google;
    return (async () => {
      await ensureLibrariesLoaded(g);
      return g;
    })();
  }

  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com/maps/api/js"]'
    ) as HTMLScriptElement | null;

    const resolveIfReady = async () => {
      const g = (window as any).google;
      if (g?.maps) {
        try {
          await ensureLibrariesLoaded(g);
          resolve(g);
          return true;
        } catch (e) {
          reject(e as Error);
          return false;
        }
      }
      return false;
    };

    

    const onLoad = async () => {
      if (!(await resolveIfReady())) {
        // In rare cases, load fires before maps is ready; poll briefly
        const start = Date.now();
        const iv = window.setInterval(async () => {
          if (await resolveIfReady()) {
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
      const iv = window.setInterval(async () => {
        if (await resolveIfReady()) {
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
      'https://maps.googleapis.com/maps/api/js?key=AIzaSyAejqe2t4TAptcLnkpoFTTNMhm0SFHFJgQ&v=weekly&libraries=places,routes,geocoding&loading=async';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', onError, { once: true });
    document.head.appendChild(script);

    // Extra safety: poll in case load event is missed by the browser
    const start = Date.now();
    const iv = window.setInterval(async () => {
      if (await resolveIfReady()) {
        window.clearInterval(iv);
      } else if (Date.now() - start > 15000) {
        window.clearInterval(iv);
        reject(new Error('Timed out waiting for Google Maps API'));
      }
    }, 50);
  });

  return googleMapsLoadingPromise;
}

export function useGoogleMapsLoader() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [googleObj, setGoogleObj] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMapsApi()
      .then((g) => {
        if (cancelled) return;
        setGoogleObj(g);
        setReady(true);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e as Error);
        setReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { ready, error, google: googleObj } as const;
}
