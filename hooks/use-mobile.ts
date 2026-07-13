import { useSyncExternalStore } from "react";

const MOBILE_BREAKPOINT = 768;

function subscribeToMobileQuery(onStoreChange: () => void) {
  const mql = globalThis.matchMedia(
    `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
  );

  mql.addEventListener("change", onStoreChange);

  return () => {
    mql.removeEventListener("change", onStoreChange);
  };
}

function getIsMobileSnapshot() {
  return globalThis.innerWidth < MOBILE_BREAKPOINT;
}

function getIsMobileServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(
    subscribeToMobileQuery,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );
}
