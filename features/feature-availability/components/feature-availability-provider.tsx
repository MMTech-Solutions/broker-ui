"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  DISABLED_FEATURES,
  FEATURE_NAMES,
  featureForPage,
  type FeatureName,
  type FeatureState,
  type FeatureStates,
} from "@/features/feature-availability/types";
import { browserBrokerRequest } from "@/lib/api/browser-client";
import { formatBrokerApiError } from "@/lib/api/errors";

type Availability = {
  states: FeatureStates;
  loading: boolean;
  error: string | null;
  canManageConfigs: boolean;
  refresh: (fresh?: boolean) => Promise<void>;
};

const Context = createContext<Availability | null>(null);

export function FeatureAvailabilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [states, setStates] = useState<FeatureStates>(DISABLED_FEATURES);
  const [resolvedPath, setResolvedPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canManageConfigs, setCanManageConfigs] = useState(false);
  const pending = useRef<Promise<void> | null>(null);

  const refresh = useCallback(function refreshStates(
    fresh = false,
  ): Promise<void> {
    if (pending.current) {
      return fresh ? pending.current.then(() => refreshStates()) : pending.current;
    }

    const run = (async () => {
      try {
        const response = await browserBrokerRequest<FeatureState[]>(
          "v1/public/configs/features",
        );
        if (
          !Array.isArray(response.data) ||
          response.data.length !== FEATURE_NAMES.length ||
          FEATURE_NAMES.some(
            (feature) =>
              response.data.filter(
                (item) => item.feature === feature && typeof item.enable === "boolean",
              ).length !== 1,
          )
        ) {
          throw new Error("Invalid feature availability response.");
        }
        setStates(
          Object.fromEntries(
            response.data.map((item) => [item.feature, item.enable]),
          ) as FeatureStates,
        );
        setError(null);
      } catch (cause) {
        setStates(DISABLED_FEATURES);
        setError(formatBrokerApiError(cause));
      } finally {
        setLoading(false);
      }
    })();

    pending.current = run;
    void run.finally(() => {
      pending.current = null;
    });
    return run;
  }, []);

  useEffect(() => {
    let cancelled = false;
    void refresh(true).then(() => {
      if (!cancelled) {
        setResolvedPath(pathname);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [pathname, refresh]);

  useEffect(() => {
    const update = () => {
      void refresh(true);
    };
    window.addEventListener("focus", update);
    window.addEventListener("broker:features-changed", update);
    return () => {
      window.removeEventListener("focus", update);
      window.removeEventListener("broker:features-changed", update);
    };
  }, [refresh]);

  useEffect(() => {
    if (
      pathname.startsWith("/client") ||
      pathname.startsWith("/public/") ||
      pathname.startsWith("/login")
    ) {
      return;
    }
    let cancelled = false;
    browserBrokerRequest<unknown[]>("v1/admin/configs", {
      searchParams: { per_page: 1 },
      redirectOnUnauthorized: false,
    })
      .then(() => {
        if (!cancelled) {
          setCanManageConfigs(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCanManageConfigs(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <Context.Provider
      value={{
        states,
        loading: loading || resolvedPath !== pathname,
        error,
        canManageConfigs,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useFeatureAvailability() {
  const context = useContext(Context);
  if (!context) {
    throw new Error("FeatureAvailabilityProvider is required.");
  }
  return context;
}

export function FeaturePageGuard({ children }: { children: React.ReactNode }) {
  const feature = featureForPage(usePathname());
  const { states, loading, error, refresh } = useFeatureAvailability();
  if (!feature) {
    return children;
  }
  if (loading) {
    return <p className="p-6">Loading feature availability…</p>;
  }
  if (error) {
    return (
      <div className="space-y-3 p-6">
        <p role="alert">{error}</p>
        <Button onClick={() => void refresh(true)}>Retry</Button>
      </div>
    );
  }
  if (!states[feature]) {
    return (
      <p role="status" className="p-6">
        This feature is disabled: {feature}.
      </p>
    );
  }
  return children;
}

export function FeatureSection({
  feature,
  children,
}: {
  feature: FeatureName;
  children: React.ReactNode;
}) {
  const { states, loading, error } = useFeatureAvailability();
  return !loading && !error && states[feature] ? children : null;
}
