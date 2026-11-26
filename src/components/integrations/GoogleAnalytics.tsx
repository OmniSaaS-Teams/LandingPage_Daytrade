"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef } from "react";
import { pageViewPath } from "../../lib/page-view-path";

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

export function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  const path = pageViewPath(usePathname());
  const configured = useRef(false);
  const lastPage = useRef<string | null>(null);

  useEffect(() => {
    if (!path) {
      lastPage.current = null;
      return;
    }

    const pageUrl = new URL(path + window.location.search, window.location.origin).href;
    const previousPage = lastPage.current;
    if (previousPage === pageUrl) return;

    const analyticsWindow = window as AnalyticsWindow;
    const dataLayer = (analyticsWindow.dataLayer ??= []);
    const tag = (analyticsWindow.gtag ??= function () {
      // eslint-disable-next-line prefer-rest-params -- Match the Google tag's bootstrap queue format.
      dataLayer.push(arguments);
    });

    if (!configured.current) {
      tag("js", new Date());
      tag("config", measurementId, { send_page_view: false });
      configured.current = true;
    }

    tag("event", "page_view", {
      send_to: measurementId,
      page_location: pageUrl,
      ...(previousPage ? { page_referrer: previousPage } : {}),
    });
    lastPage.current = pageUrl;
  }, [measurementId, path]);

  return path ? (
    <Script
      id="daytrade-ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
      strategy="afterInteractive"
    />
  ) : null;
}
