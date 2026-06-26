"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { detectPlatform, openApp, storeUrlFor } from "@/lib/smartAppLink";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
      position: absolute; inset: 0; width: 100%; height: 100%;
      pointer-events: none; z-index: 50; opacity: 0.04; mix-blend-mode: overlay;
      background: url('data:image/svg+xml;utf8,<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(%23noiseFilter)"/></svg>');
  }

  .bg-grid-theme {
      background-size: 60px 60px;
      background-image:
          linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 4%, transparent) 1px, transparent 1px),
          linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 4%, transparent) 1px, transparent 1px);
      mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
      -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-3d-matte {
      color: var(--color-foreground);
      text-shadow:
          0 10px 30px color-mix(in srgb, var(--color-foreground) 15%, transparent),
          0 2px 4px color-mix(in srgb, var(--color-foreground) 8%, transparent);
  }

  .text-silver-matte {
      color: var(--color-foreground);
      transform: translateZ(0);
      text-shadow:
          0 10px 20px color-mix(in srgb, var(--color-foreground) 12%, transparent),
          0 2px 4px color-mix(in srgb, var(--color-foreground) 8%, transparent);
  }

  .text-card-silver-matte {
      color: var(--color-cream);
      transform: translateZ(0);
      text-shadow:
          0 12px 24px rgba(0,0,0,0.8),
          0 4px 8px rgba(0,0,0,0.6);
  }

  .premium-depth-card {
      background: linear-gradient(145deg, var(--color-olive) 0%, var(--color-ink) 100%);
      box-shadow:
          0 40px 100px -20px rgba(0, 0, 0, 0.9),
          0 20px 40px -20px rgba(0, 0, 0, 0.8),
          inset 0 1px 2px rgba(255, 255, 255, 0.12),
          inset 0 -2px 4px rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.04);
      position: relative;
  }

  .card-sheen {
      position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
      background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), var(--color-candlelit-soft) 0%, transparent 40%);
      mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
      background-color: var(--color-ink);
      box-shadow:
          inset 0 0 0 2px color-mix(in srgb, var(--color-ink), white 30%),
          inset 0 0 0 7px black,
          0 40px 80px -15px rgba(0,0,0,0.9),
          0 15px 25px -5px rgba(0,0,0,0.7);
      transform-style: preserve-3d;
  }

  .hardware-btn {
      background: linear-gradient(90deg, color-mix(in srgb, var(--color-ink), white 25%) 0%, var(--color-ink) 100%);
      box-shadow:
          -2px 0 5px rgba(0,0,0,0.8),
          inset -1px 0 1px rgba(255,255,255,0.15),
          inset 1px 0 2px rgba(0,0,0,0.8);
      border-left: 1px solid rgba(255,255,255,0.05);
  }

  .screen-glare {
      background: linear-gradient(110deg, rgba(253,252,247,0.08) 0%, rgba(253,252,247,0) 45%);
  }

  .widget-depth {
      background: linear-gradient(180deg, rgba(253,252,247,0.04) 0%, rgba(253,252,247,0.01) 100%);
      box-shadow:
          0 10px 20px rgba(0,0,0,0.3),
          inset 0 1px 1px rgba(253,252,247,0.05),
          inset 0 -1px 1px rgba(0,0,0,0.5);
      border: 1px solid rgba(253,252,247,0.03);
  }

  .floating-ui-badge {
      background: linear-gradient(135deg, rgba(253, 252, 247, 0.08) 0%, rgba(253, 252, 247, 0.01) 100%);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      box-shadow:
          0 0 0 1px rgba(253, 252, 247, 0.1),
          0 25px 50px -12px rgba(0, 0, 0, 0.8),
          inset 0 1px 1px rgba(253,252,247,0.2),
          inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .btn-modern-light, .btn-modern-dark {
      transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
      background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-parchment) 100%);
      color: var(--color-ink);
      box-shadow: 0 0 0 1px rgba(28,28,30,0.05), 0 2px 4px rgba(28,28,30,0.1), 0 12px 24px -4px rgba(28,28,30,0.2), inset 0 1px 1px rgba(253,252,247,1), inset 0 -3px 6px rgba(28,28,30,0.04);
  }
  .btn-modern-light:hover {
      transform: translateY(-3px);
      box-shadow: 0 0 0 1px rgba(28,28,30,0.05), 0 6px 12px -2px rgba(28,28,30,0.12), 0 20px 32px -6px rgba(28,28,30,0.3), inset 0 1px 1px rgba(253,252,247,1), inset 0 -3px 6px rgba(28,28,30,0.04);
  }
  .btn-modern-light:active {
      transform: translateY(1px);
      background: linear-gradient(180deg, var(--color-parchment) 0%, var(--color-stone) 100%);
      box-shadow: 0 0 0 1px rgba(28,28,30,0.1), 0 1px 2px rgba(28,28,30,0.1), inset 0 3px 6px rgba(28,28,30,0.1), inset 0 0 0 1px rgba(28,28,30,0.02);
  }
  .btn-modern-dark {
      background: linear-gradient(180deg, var(--color-olive) 0%, color-mix(in srgb, var(--color-olive), black 30%) 100%);
      color: var(--color-cream);
      box-shadow: 0 0 0 1px rgba(253,252,247,0.08), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(253,252,247,0.12), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
      transform: translateY(-3px);
      background: linear-gradient(180deg, color-mix(in srgb, var(--color-olive), white 10%) 0%, var(--color-olive) 100%);
      box-shadow: 0 0 0 1px rgba(253,252,247,0.12), 0 6px 12px -2px rgba(0,0,0,0.7), 0 20px 32px -6px rgba(0,0,0,1), inset 0 1px 1px rgba(253,252,247,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:active {
      transform: translateY(1px);
      background: color-mix(in srgb, var(--color-olive), black 30%);
      box-shadow: 0 0 0 1px rgba(253,252,247,0.05), inset 0 3px 8px rgba(0,0,0,0.9), inset 0 0 0 1px rgba(0,0,0,0.5);
  }

  .progress-ring {
      transform: rotate(-90deg);
      transform-origin: center;
      stroke-dasharray: 402;
      stroke-dashoffset: 402;
      stroke-linecap: round;
  }

  @media (prefers-reduced-motion: reduce) {
      .gsap-reveal { visibility: visible; }
      .text-track, .text-days, .main-card, .cta-wrapper,
      .card-left-text, .card-right-text, .mockup-scroll-wrapper,
      .floating-badge, .phone-widget {
          opacity: 1 !important;
          visibility: visible !important;
          transform: none !important;
          filter: none !important;
          clip-path: none !important;
      }
  }
`;

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
}

export function CinematicHero({
  brandName = "Unsung Bites",
  tagline1 = "Find the spots",
  tagline2 = "nobody's posted yet.",
  cardHeading = "Discovery, not algorithms.",
  cardDescription = (
    <>
      <span className="text-white font-semibold">Unsung Bites</span> helps you
      find hidden-gem restaurants, scan dishes with AI for ingredients and macros,
      leave honest reviews, and earn badges for exploring off-radar spots.
    </>
  ),
  metricValue = 4,
  metricLabel = "Spots Found",
  ctaHeading = "Your next favorite spot.",
  ctaDescription = "Your next favorite spot is one scan away. Download the app and start exploring the places your friends haven't found yet.",
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;

      cancelAnimationFrame(requestRef.current);

      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          mainCardRef.current.style.setProperty("--mouse-x", `${mouseX}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${mouseY}px`);

          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;

          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", {
        autoAlpha: 0,
        y: 60,
        scale: 0.85,
        filter: "blur(20px)",
        rotationX: -20,
      });
      gsap.set(".text-days", {
        autoAlpha: 1,
        clipPath: "inset(0 100% 0 0)",
      });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set(
        [
          ".card-left-text",
          ".card-right-text",
          ".mockup-scroll-wrapper",
          ".floating-badge",
          ".phone-widget",
        ],
        { autoAlpha: 0 }
      );
      gsap.set(".cta-wrapper", {
        autoAlpha: 0,
        scale: 0.8,
        filter: "blur(30px)",
      });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", {
          duration: 1.8,
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          rotationX: 0,
          ease: "expo.out",
        })
        .to(
          ".text-days",
          {
            duration: 1.4,
            clipPath: "inset(0 0% 0 0)",
            ease: "power4.inOut",
          },
          "-=1.0"
        );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to(
          [".hero-text-wrapper", ".bg-grid-theme"],
          {
            scale: 1.15,
            filter: "blur(20px)",
            opacity: 0.2,
            ease: "power2.inOut",
            duration: 2,
          },
          0
        )
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", {
          width: "100%",
          height: "100%",
          borderRadius: "0px",
          ease: "power3.inOut",
          duration: 1.5,
        })
        .fromTo(
          ".mockup-scroll-wrapper",
          {
            y: 300,
            z: -500,
            rotationX: 50,
            rotationY: -30,
            autoAlpha: 0,
            scale: 0.6,
          },
          {
            y: 0,
            z: 0,
            rotationX: 0,
            rotationY: 0,
            autoAlpha: 1,
            scale: 1,
            ease: "expo.out",
            duration: 2.5,
          },
          "-=0.8"
        )
        .fromTo(
          ".phone-widget",
          { y: 40, autoAlpha: 0, scale: 0.95 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            stagger: 0.15,
            ease: "back.out(1.2)",
            duration: 1.5,
          },
          "-=1.5"
        )
        .to(
          ".progress-ring",
          { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" },
          "-=1.2"
        )
        .to(
          ".counter-val",
          {
            innerHTML: metricValue,
            snap: { innerHTML: 1 },
            duration: 2,
            ease: "expo.out",
          },
          "-=2.0"
        )
        .fromTo(
          ".floating-badge",
          { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            rotationZ: 0,
            ease: "back.out(1.5)",
            duration: 1.5,
            stagger: 0.2,
          },
          "-=2.0"
        )
        .fromTo(
          ".card-left-text",
          { x: -50, autoAlpha: 0 },
          { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 },
          "-=1.5"
        )
        .fromTo(
          ".card-right-text",
          { x: 50, autoAlpha: 0, scale: 0.8 },
          { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 },
          "<"
        )
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to(
          [
            ".mockup-scroll-wrapper",
            ".floating-badge",
            ".card-left-text",
            ".card-right-text",
          ],
          {
            scale: 0.9,
            y: -40,
            z: -200,
            autoAlpha: 0,
            ease: "power3.in",
            duration: 1.2,
            stagger: 0.05,
          }
        )
        .to(
          ".main-card",
          {
            width: isMobile ? "92vw" : "85vw",
            height: isMobile ? "92vh" : "85vh",
            borderRadius: isMobile ? "32px" : "40px",
            ease: "expo.inOut",
            duration: 1.8,
          },
          "pullback"
        )
        .to(
          ".cta-wrapper",
          { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 },
          "pullback"
        )
        .to(".main-card", {
          y: -window.innerHeight - 300,
          ease: "power3.in",
          duration: 1.5,
        });
    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-screen h-screen overflow-hidden flex items-center justify-center bg-background text-foreground font-sans antialiased",
        className
      )}
      style={{ perspective: "1500px" }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />
      <div className="film-grain" aria-hidden="true" />
      <div
        className="bg-grid-theme absolute inset-0 z-0 pointer-events-none opacity-50"
        aria-hidden="true"
      />

      {/* Hero Tagline */}
      <div className="hero-text-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-6 will-change-transform">
        <h1
          className="text-track gsap-reveal text-3d-matte text-[clamp(2.5rem,6vw,5.5rem)] tracking-tight mb-2"
          style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
        >
          {tagline1}
        </h1>
        <h1
          className="text-days gsap-reveal text-silver-matte text-[clamp(2.5rem,6vw,5.5rem)] font-extrabold tracking-tighter"
          style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
        >
          {tagline2}
        </h1>
      </div>

      {/* CTA Section with App Store Buttons */}
      <div className="cta-wrapper absolute z-10 flex flex-col items-center justify-center text-center w-screen px-4 gsap-reveal pointer-events-auto will-change-transform">
        <h2
          className="text-[clamp(2.25rem,5vw,4.5rem)] font-bold mb-6 tracking-tight text-foreground"
          style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
        >
          {ctaHeading}
        </h2>
        <p
          className="text-muted-foreground text-base md:text-lg mb-12 max-w-xl mx-auto font-normal leading-relaxed"
          style={{ textWrap: "pretty" }}
        >
          {ctaDescription}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <a
            href={storeUrlFor("ios")}
            onClick={(e) => {
              e.preventDefault();
              openApp({ platform: detectPlatform(navigator.userAgent) });
            }}
            aria-label="Download on the App Store"
            className="btn-modern-light flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-candlelit focus:ring-offset-2"
          >
            <svg
              className="w-7 h-7 sm:w-8 sm:h-8 transition-transform group-hover:scale-105"
              fill="currentColor"
              viewBox="0 0 384 512"
              aria-hidden="true"
            >
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase mb-[-2px]">
                Download on the
              </div>
              <div className="text-lg sm:text-xl font-bold leading-none tracking-tight">
                App Store
              </div>
            </div>
          </a>
          <a
            href={storeUrlFor("android")}
            onClick={(e) => {
              e.preventDefault();
              const platform = detectPlatform(navigator.userAgent);
              openApp({ platform: platform === "desktop" ? "android" : platform });
            }}
            aria-label="Get it on Google Play"
            className="btn-modern-dark flex items-center justify-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-[1.25rem] group focus:outline-none focus:ring-2 focus:ring-candlelit focus:ring-offset-2 focus:ring-offset-background"
          >
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 transition-transform group-hover:scale-105"
              fill="currentColor"
              viewBox="0 0 512 512"
              aria-hidden="true"
            >
              <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] font-bold tracking-wider opacity-60 uppercase mb-[-2px]">
                Get it on
              </div>
              <div className="text-lg sm:text-xl font-bold leading-none tracking-tight">
                Google Play
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* The Deep Card (Olive/Forest) */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
        style={{ perspective: "1500px" }}
      >
        <div
          ref={mainCardRef}
          className="main-card premium-depth-card relative overflow-hidden gsap-reveal flex items-center justify-center pointer-events-auto w-[92vw] md:w-[85vw] h-[92vh] md:h-[85vh] rounded-[32px] md:rounded-[40px]"
        >
          <div className="card-sheen" aria-hidden="true" />

          <div className="relative w-full h-full max-w-7xl mx-auto px-4 lg:px-12 flex flex-col justify-evenly lg:grid lg:grid-cols-3 items-center lg:gap-8 z-10 py-6 lg:py-0">
            {/* Brand Name */}
            <div className="card-right-text gsap-reveal order-1 lg:order-3 flex justify-center lg:justify-end z-20 w-full">
              <h2
                className="text-[clamp(2.5rem,8vw,6rem)] font-black uppercase tracking-tighter text-card-silver-matte lg:mt-0"
                style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
              >
                {brandName}
              </h2>
            </div>

            {/* iPhone Mockup */}
            <div
              className="mockup-scroll-wrapper order-2 lg:order-2 relative w-full h-[380px] lg:h-[600px] flex items-center justify-center z-10"
              style={{ perspective: "1000px" }}
            >
              <div className="relative w-full h-full flex items-center justify-center transform scale-[0.65] md:scale-85 lg:scale-100">
                <div
                  ref={mockupRef}
                  className="relative w-[280px] h-[580px] rounded-[3rem] iphone-bezel flex flex-col will-change-transform"
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Hardware Buttons */}
                  <div className="absolute top-[120px] -left-[3px] w-[3px] h-[25px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[160px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[220px] -left-[3px] w-[3px] h-[45px] hardware-btn rounded-l-md z-0" aria-hidden="true" />
                  <div className="absolute top-[170px] -right-[3px] w-[3px] h-[70px] hardware-btn rounded-r-md z-0 scale-x-[-1]" aria-hidden="true" />

                  {/* Screen */}
                  <div className="absolute inset-[7px] bg-ink rounded-[2.5rem] overflow-hidden shadow-[inset_0_0_15px_rgba(0,0,0,1)] text-cream z-10">
                    <div className="absolute inset-0 screen-glare z-40 pointer-events-none" aria-hidden="true" />

                    {/* Dynamic Island */}
                    <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-[100px] h-[28px] bg-black rounded-full z-50 flex items-center justify-end px-3 shadow-[inset_0_-1px_2px_rgba(253,252,247,0.1)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-candlelit shadow-[0_0_8px_var(--color-candlelit)] animate-pulse" />
                    </div>

                    {/* App UI */}
                    <div className="relative w-full h-full pt-11 px-4 pb-6 flex flex-col overflow-hidden">
                      {/* Header */}
                      <div className="phone-widget flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-candlelit shadow-[0_0_6px_var(--color-candlelit)]" aria-hidden="true" />
                          <span className="text-[9px] text-cream/60 uppercase tracking-[0.18em] font-bold">
                            Nearby
                          </span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-cream/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>

                      {/* Title */}
                      <h4
                        className="phone-widget text-candlelit text-[1.7rem] font-bold leading-[1.05] tracking-tight drop-shadow-md"
                        style={{ fontFamily: "var(--font-fraunces)" }}
                      >
                        Hidden Gems
                      </h4>
                      <div className="phone-widget flex items-center gap-2 mt-1 mb-3">
                        <span className="block w-4 h-px bg-cream/25" aria-hidden="true" />
                        <span className="text-[10px] text-cream/55">
                          <span className="counter-val text-cream font-semibold">0</span>
                          <span> spots worth finding</span>
                        </span>
                      </div>

                      {/* Vibe chips */}
                      <div className="phone-widget flex gap-1.5 mb-3 -mx-1 px-1 overflow-hidden">
                        {["Cozy", "Date Night", "Hidden Gem", "Late Night"].map((chip, i) => (
                          <span
                            key={chip}
                            className={cn(
                              "shrink-0 px-2.5 py-1 rounded-full text-[9px] font-semibold tracking-tight border whitespace-nowrap",
                              i === 2
                                ? "bg-candlelit/15 text-candlelit border-candlelit/30"
                                : "text-cream/70 border-cream/15"
                            )}
                          >
                            {chip}
                          </span>
                        ))}
                      </div>

                      {/* TOP PICK eyebrow */}
                      <div className="phone-widget flex items-center gap-2 mb-2">
                        <span className="text-[8px] text-cream/40 uppercase tracking-[0.2em] font-bold">
                          Top Pick
                        </span>
                        <span className="flex-1 h-px bg-cream/10" aria-hidden="true" />
                      </div>

                      {/* Restaurant card */}
                      <div className="phone-widget widget-depth rounded-2xl overflow-hidden">
                        <div
                          className="relative h-[120px] w-full"
                          style={{
                            background:
                              "linear-gradient(135deg, color-mix(in srgb, var(--color-candlelit), black 30%) 0%, color-mix(in srgb, var(--color-olive), black 20%) 100%)",
                          }}
                          aria-hidden="true"
                        >
                          <div
                            className="absolute inset-0 opacity-60 mix-blend-overlay"
                            style={{
                              background:
                                "radial-gradient(circle at 30% 40%, rgba(255,180,80,0.5), transparent 50%), radial-gradient(circle at 70% 60%, rgba(120,60,30,0.6), transparent 55%)",
                            }}
                          />
                          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-cream text-ink text-[8px] font-bold tracking-wider uppercase shadow-md">
                            <svg className="w-2.5 h-2.5 text-candlelit" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                              <path d="M12 2l1.6 4.9H19l-4.3 3.1 1.6 5L12 12l-4.3 3 1.6-5L5 6.9h5.4z" />
                            </svg>
                            Hidden Gem
                          </span>
                        </div>
                        <div className="px-3 py-2.5">
                          <div className="h-3 w-28 rounded-full bg-cream/15 shadow-inner animate-pulse" aria-hidden="true" />
                          <div className="h-2 w-40 rounded-full bg-cream/8 shadow-inner mt-2 animate-pulse" aria-hidden="true" />
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-candlelit/40 animate-pulse" aria-hidden="true" />
                            <span className="h-2 w-10 rounded-full bg-cream/12 animate-pulse" aria-hidden="true" />
                            <span className="h-2 w-8 rounded-full bg-cream/8 animate-pulse" aria-hidden="true" />
                          </div>
                        </div>
                      </div>

                      <div className="phone-widget flex items-center gap-2 mt-2 mb-2">
                        <span className="text-[8px] text-cream/35 uppercase tracking-[0.2em] font-bold">
                          More Nearby
                        </span>
                        <span className="flex-1 h-px bg-cream/8" aria-hidden="true" />
                        <span className="text-[9px] text-cream/40 font-bold">3</span>
                      </div>

                      <div className="phone-widget widget-depth rounded-xl p-2.5 flex items-center gap-2.5">
                        <div
                          className="w-11 h-11 rounded-lg shrink-0"
                          style={{
                            background:
                              "linear-gradient(135deg, color-mix(in srgb, var(--color-olive), black 10%) 0%, color-mix(in srgb, var(--color-candlelit), black 40%) 100%)",
                          }}
                          aria-hidden="true"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="h-2 w-20 rounded-full bg-cream/15 animate-pulse" aria-hidden="true" />
                          <div className="h-1.5 w-28 rounded-full bg-cream/8 mt-1.5 animate-pulse" aria-hidden="true" />
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="w-2 h-2 rounded-full bg-candlelit/40" aria-hidden="true" />
                          <span className="h-1.5 w-5 rounded-full bg-cream/12 animate-pulse" aria-hidden="true" />
                        </div>
                      </div>

                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[120px] h-[4px] bg-cream/20 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.5)]" />
                    </div>
                  </div>
                </div>

                {/* Floating Badges */}
                <div className="floating-badge absolute flex top-6 lg:top-12 left-[-15px] lg:left-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-candlelit/20 to-candlelit/5 flex items-center justify-center border border-candlelit/30 shadow-inner">
                    <span className="text-base lg:text-xl drop-shadow-lg" aria-hidden="true">🏅</span>
                  </div>
                  <div>
                    <p className="text-cream text-xs lg:text-sm font-bold tracking-tight">7-Day Streak</p>
                    <p className="text-candlelit/50 text-[10px] lg:text-xs font-medium">Explorer badge earned</p>
                  </div>
                </div>

                <div className="floating-badge absolute flex bottom-12 lg:bottom-20 right-[-15px] lg:right-[-80px] floating-ui-badge rounded-xl lg:rounded-2xl p-3 lg:p-4 items-center gap-3 lg:gap-4 z-30">
                  <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-b from-olive/30 to-olive/10 flex items-center justify-center border border-olive/30 shadow-inner">
                    <span className="text-base lg:text-lg drop-shadow-lg" aria-hidden="true">📸</span>
                  </div>
                  <div>
                    <p className="text-cream text-xs lg:text-sm font-bold tracking-tight">Dish Scanned</p>
                    <p className="text-candlelit/50 text-[10px] lg:text-xs font-medium">340 cal · 12g protein</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Description */}
            <div className="card-left-text gsap-reveal order-3 lg:order-1 flex flex-col justify-center text-center lg:text-left z-20 w-full lg:max-w-none px-4 lg:px-0">
              <h3
                className="text-cream text-xl md:text-2xl lg:text-3xl font-bold mb-3 lg:mb-5 tracking-tight"
                style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
              >
                {cardHeading}
              </h3>
              <p className="hidden md:block text-cream/60 text-sm lg:text-base font-normal leading-relaxed mx-auto lg:mx-0 max-w-sm lg:max-w-none">
                {cardDescription}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
