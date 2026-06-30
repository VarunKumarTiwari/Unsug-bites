"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { detectPlatform, openApp } from "@/lib/smartAppLink";
import { Logo, BRAND } from "@/components/ui/logo";

interface NavLink {
  label: string;
  href: string;
}

const LINKS: NavLink[] = [
  { label: "Home", href: "#top" },
  { label: "Discover", href: "#discover" },
  { label: "How it works", href: "#how-it-works" },
  { label: "About", href: "#about" },
];

const SCROLL_THRESHOLD = 80;

function openTheApp() {
  openApp({ platform: detectPlatform(navigator.userAgent) });
}

/**
 * Resizable landing navbar (Aceternity pattern), restyled to Unsung Bites.
 * Transparent + full-width at the top of the page; collapses to a centered
 * frosted pill once scrolled past SCROLL_THRESHOLD. Nav links borrow the
 * mobile VibeChip active-state treatment (candlelit fill + Sparkles icon).
 */
export function ResizableNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("Home");
  const [menuOpen, setMenuOpen] = useState(false);
  const ticking = useRef(false);

  useEffect(() => {
    const update = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
      ticking.current = false;
    };
    // Initialize correctly even if the page loads already scrolled.
    update();
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel once the user starts scrolling.
  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener("scroll", close, { passive: true });
    return () => window.removeEventListener("scroll", close);
  }, [menuOpen]);

  return (
    <header className="fixed inset-x-0 top-0 z-[60] flex justify-center px-4 pt-3 md:pt-4">
      <nav
        aria-label="Primary"
        className={cn(
          "flex w-full items-center justify-between gap-2 motion-safe:transition-all motion-safe:duration-300 ease-out",
          scrolled
            ? "max-w-5xl rounded-full border border-border bg-cream/70 px-3 py-2 shadow-card backdrop-blur-xl md:translate-y-1"
            : "max-w-6xl rounded-full border border-transparent bg-transparent px-4 py-2.5"
        )}
      >
        {/* Logo */}
        <Link
          href="/"
          onClick={() => setActive("Home")}
          className="flex shrink-0 items-center gap-2 rounded-full px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${BRAND.name} home`}
        >
          <Logo size={26} className="text-primary" />
          <span
            className="font-heading text-lg font-semibold tracking-tight text-foreground"
            style={{ fontFamily: "var(--font-fraunces)" }}
          >
            {BRAND.name}
          </span>
        </Link>

        {/* Centered links (desktop) */}
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <li key={link.label}>
              <NavPill
                link={link}
                active={active === link.label}
                onSelect={() => setActive(link.label)}
              />
            </li>
          ))}
        </ul>

        {/* Right actions (desktop) */}
        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Link
            href="/login"
            className="inline-flex h-11 items-center rounded-full border border-transparent bg-transparent px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Login
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-11 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Signup
          </Link>
          <button
            type="button"
            onClick={openTheApp}
            className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-cream transition-colors hover:bg-ink/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Sparkles className="size-4" />
            Get the app
          </button>
        </div>

        {/* Hamburger (mobile) */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-panel"
          className="flex size-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="absolute inset-x-4 top-[calc(100%+0.5rem)] flex flex-col gap-1 rounded-3xl border border-border bg-cream/95 p-3 shadow-card backdrop-blur-xl md:hidden"
        >
          {LINKS.map((link) => (
            <NavPill
              key={link.label}
              link={link}
              active={active === link.label}
              full
              onSelect={() => {
                setActive(link.label);
                setMenuOpen(false);
              }}
            />
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3">
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Login
            </Link>
            <Link
              href="/signup"
              onClick={() => setMenuOpen(false)}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Signup
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openTheApp();
              }}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-ink px-4 text-sm font-medium text-cream transition-colors hover:bg-ink/90"
            >
              <Sparkles className="size-4" />
              Get the app
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/** A nav link styled like the mobile VibeChip: candlelit fill + Sparkles when active. */
function NavPill({
  link,
  active,
  full,
  onSelect,
}: {
  link: NavLink;
  active: boolean;
  full?: boolean;
  onSelect: () => void;
}) {
  return (
    <a
      href={link.href}
      onClick={onSelect}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-medium motion-safe:transition-colors motion-safe:duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        full && "w-full",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-transparent text-foreground hover:bg-muted"
      )}
    >
      {active && <Sparkles className="size-3.5" aria-hidden="true" />}
      {link.label}
    </a>
  );
}
