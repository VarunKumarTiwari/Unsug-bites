import Link from "next/link";

interface ErrorPageProps {
  /** Big display code/word, e.g. "404". */
  code?: string;
  title: string;
  description: string;
  /** Where the primary action points. Defaults to home. */
  href?: string;
  actionLabel?: string;
}

/**
 * Reusable on-brand error/empty-state page. Drop into any error route convention
 * (`not-found.tsx`, `error.tsx`) — e.g. `export default () => <ErrorPage ... />`.
 * Tokens only; matches the landing page's restraint.
 */
export function ErrorPage({
  code,
  title,
  description,
  href = "/",
  actionLabel = "Back to home",
}: ErrorPageProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center">
      {code && (
        <span
          className="font-heading text-6xl font-semibold text-primary"
          style={{ fontFamily: "var(--font-fraunces)" }}
        >
          {code}
        </span>
      )}
      <h1
        className="font-heading text-3xl font-semibold tracking-tight text-foreground"
        style={{ fontFamily: "var(--font-fraunces)" }}
      >
        {title}
      </h1>
      <p className="max-w-md text-base leading-relaxed text-muted-foreground">
        {description}
      </p>
      <Link
        href={href}
        className="inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {actionLabel}
      </Link>
    </main>
  );
}
