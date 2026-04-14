import { useCallback, useState } from "react";

/**
 * Browser geolocation with explicit user-triggered request (permission-friendly).
 */
export function useGeolocation() {
  const [status, setStatus] = useState("idle");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [error, setError] = useState(null);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("requesting");
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setStatus("granted");
      },
      (err) => {
        setLat(null);
        setLng(null);
        setStatus("denied");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied—you can still use meal ideas."
            : err.message || "Could not read your location."
        );
      },
      { enableHighAccuracy: true, timeout: 18000, maximumAge: 120000 }
    );
  }, []);

  const clear = useCallback(() => {
    setStatus("idle");
    setLat(null);
    setLng(null);
    setError(null);
  }, []);

  return { status, lat, lng, error, request, clear };
}
