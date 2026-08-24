import { PublicLayout } from "@/app/components/PublicLayout";
import ReviewsCarousel from "@/app/reviews/ReviewsCarousel";

export default function ReviewsPage() {
  return (
    <PublicLayout>
      <section className="flex min-h-[34vh] items-center justify-center bg-[#dcebc8] px-4 py-12 text-center sm:min-h-[50vh] sm:py-16">
        <div>
          <h1 className="text-3xl font-semibold sm:text-4xl">
            What Our Customers Say
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-stone-700">
            A few words from people who visited Pearl Thai Massage.
          </p>
        </div>
      </section>

      <section className="px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <ReviewsCarousel />
      </section>
    </PublicLayout>
  );
}
