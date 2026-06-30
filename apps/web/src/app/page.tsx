import { CinematicHeroWrapper } from "@/components/cinematic-hero-wrapper";
import { OpenAppButton } from "@/components/open-app-button";
import { FloatingFoodHero } from "@/components/ui/hero-section-7";
import { ResizableNavbar } from "@/components/ui/resizable-navbar";

// Decorative food accents. Positioned to live in the wide side gutters on
// sm+ (clear of the centered text column and below the fixed navbar). Hidden
// below sm where there are no gutters — see FloatingFoodHero.
const heroImages = [
  {
    src: "https://b.zmtcdn.com/data/o2_assets/110a09a9d81f0e5305041c1b507d0f391743058910.png",
    alt: "A delicious cheeseburger",
    className:
      "w-44 md:w-56 lg:w-72 top-24 -left-6 sm:left-2 md:top-28 md:left-12 lg:left-20 animate-float",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/b4f62434088b0ddfa9b370991f58ca601743060218.png",
    alt: "A bamboo steamer with dumplings",
    className:
      "w-32 md:w-44 lg:w-48 top-24 -right-6 sm:right-2 md:top-24 md:right-12 lg:right-16 animate-float",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/316495f4ba2a9c9d9aa97fed9fe61cf71743059024.png",
    alt: "A slice of pizza",
    className:
      "w-36 md:w-52 lg:w-56 bottom-12 -right-4 sm:right-2 md:bottom-16 md:right-20 animate-float",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/70b50e1a48a82437bfa2bed925b862701742892555.png",
    alt: "A basil leaf",
    className: "w-10 lg:w-12 bottom-20 left-4 md:bottom-28 md:left-24 animate-float",
  },
  {
    src: "https://b.zmtcdn.com/data/o2_assets/9ef1cc6ecf1d92798507ffad71e9492d1742892584.png",
    alt: "A slice of tomato",
    className: "w-9 lg:w-10 top-1/3 left-6 md:left-16 animate-float",
  },
];

export default function Home() {
  return (
    <main className="overflow-x-hidden w-full">
      <span id="top" aria-hidden="true" />
      <ResizableNavbar />
      <FloatingFoodHero
        title="Scan any dish. Know what you're eating."
        description="Point your camera at any plate — our AI identifies ingredients, estimates macros, and logs the dish to your personal food journal. No manual entry needed."
        images={heroImages}
        action={<OpenAppButton />}
      />
      <CinematicHeroWrapper />
    </main>
  );
}
