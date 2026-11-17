"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { pageViewPath } from "../../lib/page-view-path.ts";

export function PageViewTracker() {
  const pathname = usePathname();
  const lastView = useRef<{ pathname: string; sent: boolean } | null>(null);

  useEffect(() => {
    if (lastView.current?.pathname !== pathname) lastView.current = { pathname, sent: false };
    const view = lastView.current;
    const path = pageViewPath(pathname);
    if (!path || !view) return;

    const recordView = () => {
      if (view.sent || document.visibilityState !== "visible") return;
      view.sent = true;
      void fetch("/api/page-views", {
        method: "POST",
        credentials: "omit",
        referrerPolicy: "no-referrer",
        keepalive: true,
        headers: {
          "Idempotency-Key": crypto.randomUUID(),
          "X-Daytrade-Page-Path": path,
        },
      }).catch(() => {});
    };

    const onPageShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      view.sent = false;
      recordView();
    };

    recordView();
    document.addEventListener("visibilitychange", recordView);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", recordView);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, [pathname]);

  return null;
}
