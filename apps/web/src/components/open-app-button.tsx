"use client";

import { ArrowRight } from "lucide-react";
import { detectPlatform, openApp } from "@/lib/smartAppLink";

export function OpenAppButton() {
  return (
    <button
      type="button"
      onClick={() =>
        openApp({ platform: detectPlatform(navigator.userAgent) })
      }
      className="group inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-primary-foreground font-medium shadow-card hover:bg-primary/90 transition-colors"
    >
      Open the app
      <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}
