import { PublicLayout } from "@/app/components/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 sm:py-16 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <div className="flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Pearl Thai Massage logo"
            className="h-40 w-40 rounded-lg object-cover shadow-lg sm:h-56 sm:w-56"
          />
        </div>
        <article className="rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold text-[#587b4b] sm:text-3xl">About Us</h1>
          <p className="mt-5 leading-8 text-stone-700">
            Pearl Thai Massage is dedicated to bringing the authentic experience of
            traditional Thai massage to Birmingham. Our therapists combine
            acupressure, stretching, and deep tissue massage to help relieve
            tension, improve flexibility, and support your overall wellbeing.
          </p>
          <p className="mt-4 leading-8 text-stone-700">
            We aim to create a calm and welcoming space where every visit is shaped
            around your needs, whether you want deep pressure, relaxation, or a
            restorative treatment after a busy week.
          </p>
          <p className="mt-4 leading-8 text-stone-700">
            Cancellations or changes need at least 6 hours' notice. This helps us
            manage staff time and offer the appointment to another customer.
          </p>
        </article>
      </section>
    </PublicLayout>
  );
}
