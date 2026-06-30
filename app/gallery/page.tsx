import { PublicLayout } from "@/app/components/PublicLayout";

const images = [
  "/images/1.jpg",
  "/images/2.jpg",
  "/images/3.jpg",
  "/images/4.jpg",
  "/images/5.jpg",
  "/images/6.jpg",
  "/images/7.jpg",
  "/images/8.jpg",
];

export default function GalleryPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Gallery</h1>
          <p className="mt-3 text-stone-600">
            A preview of the treatment rooms and atmosphere.
          </p>
        </div>
        <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {images.map((image, index) => (
            <img
              key={image}
              src={image}
              alt={`Pearl Thai Massage gallery ${index + 1}`}
              className="h-56 w-full rounded-md object-cover shadow-sm transition hover:scale-[1.02] sm:h-64"
            />
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
