import React from "react";
import { cn } from "@/lib/utils";

interface FloatingImageProps {
  src: string;
  alt: string;
  className: string;
}

export interface FloatingFoodHeroProps {
  title: string;
  description: string;
  images: FloatingImageProps[];
  className?: string;
}

const Swirls = () => (
  <>
    <svg
      className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3 text-stone dark:text-muted"
      width="600"
      height="600"
      viewBox="0 0 600 600"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M515.266 181.33C377.943 51.564 128.537 136.256 50.8123 293.565C-26.9127 450.874 125.728 600 125.728 600"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
    <svg
      className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 text-stone dark:text-muted"
      width="700"
      height="700"
      viewBox="0 0 700 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M26.8838 528.274C193.934 689.816 480.051 637.218 594.397 451.983C708.742 266.748 543.953 2.22235 543.953 2.22235"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  </>
);

export function FloatingFoodHero({
  title,
  description,
  images,
  className,
}: FloatingFoodHeroProps) {
  return (
    <section
      className={cn(
        "relative w-full min-h-[50vh] sm:min-h-[60vh] lg:min-h-[80vh] flex items-center justify-center overflow-hidden bg-background py-16 sm:py-24 md:py-32",
        className
      )}
    >
      <div className="absolute inset-0 z-0">
        <Swirls />
      </div>

      <div className="absolute inset-0 z-10 hidden sm:block">
        {images.map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt=""
            className={cn("absolute object-contain", image.className)}
            style={{ animationDelay: `${index * 300}ms` }}
          />
        ))}
      </div>

      <div className="absolute inset-0 z-10 sm:hidden">
        {images.slice(0, 3).map((image, index) => (
          <img
            key={index}
            src={image.src}
            alt=""
            className={cn(
              "absolute object-contain opacity-30",
              index === 0 && "w-28 -top-2 -left-4 animate-float",
              index === 1 && "w-24 top-0 -right-4 animate-float",
              index === 2 && "w-24 bottom-4 right-0 animate-float"
            )}
            style={{ animationDelay: `${index * 300}ms` }}
          />
        ))}
      </div>

      <div className="relative z-20 container mx-auto px-6 text-center max-w-2xl">
        <h1
          className="text-[clamp(2rem,6vw,3.75rem)] font-bold tracking-tight text-primary leading-[1.1]"
          style={{ fontFamily: "var(--font-fraunces)", textWrap: "balance" }}
        >
          {title}
        </h1>
        <p
          className="mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-muted-foreground max-w-lg mx-auto"
          style={{ textWrap: "pretty" }}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
