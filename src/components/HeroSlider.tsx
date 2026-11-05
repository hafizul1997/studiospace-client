
"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

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

function HeroSliderContent() {
  return (
    <section className="mx-auto w-full max-w-7xl px-5 pt-4 lg:px-8">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        className="hero-swiper overflow-hidden rounded-2xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div
              className="relative flex h-95 w-full items-center overflow-hidden rounded-2xl bg-gray-950 bg-cover bg-center sm:h-107.5 lg:h-120"
              style={{
                backgroundImage: `url('${slide.image}')`,
              }}
            >
              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-linear-to-r from-black/85 via-black/60 to-black/20" />

              {/* Slide Content */}
              <div className="relative z-10 max-w-2xl px-6 py-12 text-white sm:px-10 lg:px-14">
                <span className="inline-block rounded-full border border-white/30 bg-white/10 px-4 py-2 text-[11px] font-semibold tracking-[2px] backdrop-blur-sm sm:text-xs">
                  {slide.category}
                </span>

                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  {slide.title}
                </h1>

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
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Swiper Styling */}
      <style jsx global>{`
        .hero-swiper .swiper-pagination {
          bottom: 22px !important;
          text-align: left;
          padding-left: 28px;
        }

        .hero-swiper .swiper-pagination-bullet {
          width: 20px;
          height: 6px;
          border-radius: 10px;
          background: white;
          opacity: 0.6;
        }

        .hero-swiper .swiper-pagination-bullet-active {
          width: 40px;
          background: #f97316;
          opacity: 1;
        }

        .hero-swiper .swiper-button-prev,
        .hero-swiper .swiper-button-next {
          color: white;
          background: rgb(0 0 0 / 30%);
          width: 42px;
          height: 42px;
          border: 1px solid rgb(255 255 255 / 50%);
          border-radius: 50%;
        }

        .hero-swiper .swiper-button-prev::after,
        .hero-swiper .swiper-button-next::after {
          font-size: 16px;
          font-weight: bold;
        }
      `}</style>
    </section>
  );
}

// Load Swiper only in the browser
const HeroSlider = dynamic(
  () => Promise.resolve(HeroSliderContent),
  {
    ssr: false,
    loading: () => (
      <section className="mx-auto w-full max-w-7xl px-5 pt-4 lg:px-8">
        <div className="h-95 w-full animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800 sm:h-107.5 lg:h-120" />
      </section>
    ),
  }
);

export default HeroSlider;
