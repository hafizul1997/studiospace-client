
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    id: 1,
    name: "Photo Studios",
    description: "Professional spaces for photography and creative shoots.",
    image:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72",
    category: "Photo Studio",
  },
  {
    id: 2,
    name: "Sound Stages",
    description: "Production spaces for films, videos and creative projects.",
    image:
      "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb",
    category: "Film Stage",
  },
  {
    id: 3,
    name: "Podcast Rooms",
    description: "Create podcasts with professional recording equipment.",
    image:
      "https://images.unsplash.com/photo-1590602847861-f357a9332bbc",
    category: "Podcast Lounge",
  },
  {
    id: 4,
    name: "Music Suites",
    description: "Explore spaces designed for music and sound production.",
    image:
      "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04",
    category: "Music Suite",
  },
  {
    id: 5,
    name: "Art Workshops",
    description: "Creative environments for artists and makers.",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b",
    category: "Workshop",
  },
];

export default function CategoryCards() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
      {/* Section Heading */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-green-600">
          Explore by Category
        </p>

        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Find the Perfect Creative Space
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Explore different types of professional creative spaces
          for your next project.
        </p>
      </div>

      {/* Category Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/studios?category=${encodeURIComponent(category.category)}`}
            className="group relative h-72 overflow-hidden rounded-2xl shadow-md"
          >
            {/* Background Image */}
            <Image
              src={category.image}
              alt={category.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition duration-500 group-hover:scale-110"
            />

            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

            {/* Card Content */}
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {category.name}
                </h3>

                <p className="mt-2 text-sm text-gray-200">
                  {category.description}
                </p>
              </div>

              <div className="ml-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-gray-900 transition group-hover:bg-green-600 group-hover:text-white">
                <ArrowUpRight size={20} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
