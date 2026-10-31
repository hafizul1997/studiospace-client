
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const slides = [
  {
    id: 1,
    category: "PHOTOGRAPHY STUDIOS",
    title: "Find Your Perfect Creative Space",
    description:
      "Discover and book professional photography studios, production spaces and creative workspaces for your next project.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
  },
  {
    id: 2,
    category: "MUSIC & SOUND STUDIOS",
    title: "Create Something Extraordinary",
    description:
      "Explore professional music studios and sound stages designed to bring your creative vision to life.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
  },
  {
    id: 3,
    category: "PODCAST & PRODUCTION",
    title: "Bring Your Ideas to Life",
    description:
      "Find inspiring podcast rooms, art workshops and production spaces to make your next idea happen.",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc",
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + slides.length) % slides.length
    );
  };

  const slide = slides[currentSlide];

  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 lg:px-8">

      {/* Hero Slider */}
      <div
        className="relative flex h-[380px] w-full items-center overflow-hidden rounded-2xl bg-gray-950 bg-cover bg-center sm:h-[430px] lg:h-[480px]"
        style={{
          backgroundImage: `url('${slide.image}')`,
        }}
      >

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/20" />

        {/* Slide Content */}
        <div className="relative z-10 max-w-2xl px-6 py-12 text-white sm:px-10 lg:px-14">

          {/* Category */}
          <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[2px] backdrop-blur-sm sm:text-xs">
            {slide.category}
          </span>

          {/* Heading */}
          <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            {slide.title}
          </h1>

          {/* Description */}
          <p className="mt-5 max-w-lg text-sm leading-6 text-gray-200 sm:text-base sm:leading-7">
            {slide.description}
          </p>

          {/* CTA Buttons */}
          <div className="mt-7 flex flex-wrap items-center gap-3">

            <Link
              href="/studios"
              className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              Explore Studios
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/studios"
              className="rounded-lg border border-white/70 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-gray-950"
            >
              Host Your Space
            </Link>

          </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute bottom-5 right-5 z-20 flex items-center gap-2 sm:bottom-8 sm:right-8">

          <span className="mr-2 text-xs font-semibold text-white sm:text-sm">
            0{currentSlide + 1} / 0{slides.length}
          </span>

          <button
            onClick={prevSlide}
            aria-label="Previous slide"
            className="rounded-full border border-white/50 bg-black/20 p-2.5 text-white transition hover:bg-white hover:text-gray-950 sm:p-3"
          >
            <ChevronLeft size={19} />
          </button>

          <button
            onClick={nextSlide}
            aria-label="Next slide"
            className="rounded-full border border-white/50 bg-black/20 p-2.5 text-white transition hover:bg-white hover:text-gray-950 sm:p-3"
          >
            <ChevronRight size={19} />
          </button>

        </div>

        {/* Slide Indicators */}
        <div className="absolute bottom-8 left-6 z-20 flex items-center gap-2 sm:left-10 lg:left-14">

          {slides.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : undefined}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "w-10 bg-orange-500"
                  : "w-5 bg-white/60 hover:bg-white"
              }`}
            />
          ))}

        </div>

      </div>
    </section>
  );
}
