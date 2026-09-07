"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { boot, navigateThrough } from "@/lib/fx/boot";

/* ═══════════════════════════════════════════════════════════════════
   ENGINE — boots the motion engine for the current route and tears it
   down when the route changes. Internal links go through the curtain:
   the click is intercepted in the capture phase (before Next's Link
   handler, which respects defaultPrevented), the stripes cover the
   screen, the router pushes, and the next boot lifts the curtain.
   ═══════════════════════════════════════════════════════════════════ */

const INTERNAL = /^\/(films|awards)(\/|$)|^\/$/;

export default function Engine() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => boot(), [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as HTMLElement)?.closest<HTMLAnchorElement>("a[href]");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("/") || href.startsWith("//")) return;
      const [path, hash] = href.split("#");
      if (!INTERNAL.test(path)) return;
      if (path === pathname && hash) return; /* same-page anchor: the boot owns it */
      if (path === pathname && !hash) return;
      e.preventDefault();
      navigateThrough(href, (h) => router.push(h));
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [pathname, router]);

  return null;
}
