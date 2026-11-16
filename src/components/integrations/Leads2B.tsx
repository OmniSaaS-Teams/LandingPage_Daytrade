"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const desktopMediaQuery = "(min-width: 768px)";

export function Leads2B() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  if (!isDesktop || pathname.startsWith("/admin")) {
    return null;
  }

  return <Script id="leads2b" src="https://js.app.leads2b.com/latest" strategy="afterInteractive" />;
}
