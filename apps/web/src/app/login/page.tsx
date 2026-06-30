import type { Metadata } from "next";
import Link from "next/link";
import { OpenAppButton } from "@/components/open-app-button";

export const metadata: Metadata = {
  title: "Login — Shauni",
  description: "Log in to Shauni in the app to pick up where you left off.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1
        className="font-heading text-4xl font-semibold tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        Welcome back
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Shauni lives in the app. Open it to log in and get back to the spots
        worth finding.
      </p>
      <OpenAppButton />
      <Link
        href="/"
        className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to home
      </Link>
    </main>
  );
}
