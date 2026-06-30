import type { Metadata } from "next";
import Link from "next/link";
import { OpenAppButton } from "@/components/open-app-button";

export const metadata: Metadata = {
  title: "Sign up — Shauni",
  description:
    "Create your Shauni account in the app and start finding hidden-gem restaurants.",
};

export default function SignupPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
      <h1
        className="font-heading text-4xl font-semibold tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        Start exploring
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        Your next favorite spot is one scan away. Get the app to create your account
        and find the places nobody&apos;s posted yet.
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
