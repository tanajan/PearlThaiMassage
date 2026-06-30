import { PublicLayout } from "@/app/components/PublicLayout";

export default function AboutPage() {
  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <div className="flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Pearl Thai Massage logo"
            className="h-56 w-56 rounded-lg object-cover shadow-lg"
          />
        </div>
        <article className="rounded-md bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold text-[#d19a66]">About Us</h1>
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
