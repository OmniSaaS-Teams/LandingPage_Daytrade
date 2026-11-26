"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const desktopMediaQuery = "(min-width: 768px)";
const workerUrl = "https://js.app.leads2b.com";
const l2bConfig = {
  token: "Yzc4ODE2MjUtNWIxZi00NzgzLWFjZmQtMjYwZmI0YTE0ZmNk",
  workerUrl,
};

export function Leads2B() {
  const pathname = usePathname();
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;

    const mediaQuery = window.matchMedia(desktopMediaQuery);
    const syncViewport = () => {
      if (mediaQuery.matches) Object.assign(window, { l2bConfig });
      setIsDesktop(mediaQuery.matches);
    };

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, [pathname]);

  if (!isDesktop || pathname.startsWith("/admin")) {
    return null;
  }

  return <Script id="leads2b" src={`${workerUrl}/latest`} strategy="lazyOnload" />;
}
