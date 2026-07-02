import Link from "next/link";
import { OpeningHoursTable } from "@/app/components/OpeningHoursTable";
import { PublicLayout } from "@/app/components/PublicLayout";
import { getShopHours } from "@/lib/shopHours";

export const dynamic = "force-dynamic";

const treatments = [
  {
    title: "Thai Massage",
    image: "/images/service1.jpg",
    description:
      "Traditional Thai techniques with firm pressure and assisted stretching.",
  },
  {
    title: "Aroma Massage",
    image: "/images/service2.jpg",
    description:
      "A soft and relaxing massage with smooth, calming movements.",
  },
  {
    title: "Back and Shoulder Massage",
    image: "/images/service4.jpg",
    description:
      "Focused relief for common back, neck, and shoulder tension.",
  },
];

export default async function PublicHome() {
  const shopHours = await getShopHours();

  return (
    <PublicLayout>
      <section className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden text-center text-white sm:min-h-[calc(100vh-88px)]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/LandingPlaceholder.jpg"
        >
          <source src="/images/LandingVId.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 py-16">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Pearl Thai Massage
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/90 sm:text-lg sm:leading-8">
            Authentic Thai massage, relaxing treatments, and caring therapists
          </p>
          <div className="mt-8 grid w-full max-w-xs gap-3 sm:flex sm:max-w-none sm:flex-wrap sm:justify-center">
            <Link
              href="/admin?section=booking"
              className="rounded-full bg-[#7fa66a] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#dcebc8] hover:text-[#263f32]"
            >
              Book Now
            </Link>
            <Link
              href="/services"
              className="rounded-full bg-[#315c46] px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white hover:text-[#263f32]"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 lg:px-8">
        <div className="flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Pearl Thai Massage logo"
            className="h-40 w-40 rounded-lg object-cover shadow-lg sm:h-52 sm:w-52"
          />
        </div>
        <div className="rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-semibold text-[#587b4b] sm:text-3xl">About Us</h2>
          <p className="mt-4 leading-8 text-stone-700">
            Pearl Thai Massage is dedicated to bringing the authentic experience of
            traditional Thai massage to Birmingham. Our skilled therapists combine
            acupressure, stretching, and deep tissue work to promote relaxation,
            relieve tension, and support your wellbeing.
          </p>
          <p className="mt-4 leading-8 text-stone-700">
            If you need to cancel or reschedule, please give us at least 6 hours'
            notice so we can offer the appointment to another customer.
          </p>
        </div>
      </section>

      <section className="bg-white px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold sm:text-3xl">Popular Treatments</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {treatments.map((treatment, index) => (
              <article
                key={treatment.title}
                className="rounded-2xl bg-[#f3f7ef] p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ marginTop: index === 0 ? 0 : undefined }}
              >
                <img
                  src={treatment.image}
                  alt={treatment.title}
                  className="h-56 w-full rounded-xl object-cover"
                />
                <h3 className="mt-5 text-2xl font-light">{treatment.title}</h3>
                <p className="mt-3 text-sm leading-6 text-stone-600">
                  {treatment.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <div className="min-h-72 overflow-hidden rounded-md bg-stone-200 shadow-sm sm:min-h-80">
          <iframe
            title="Pearl Thai Massage map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.719313740936!2d0.15545367934570314!3d52.2121481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d870681f6ce20f%3A0x5c1c2c29728a63dc!2s2%20Whitehill%20Rd%2C%20Cambridge%20CB5%208LT!5e0!3m2!1sen!2suk!4v1782859588467!5m2!1sen!2suk"
            className="h-full min-h-80 w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-semibold sm:text-3xl">Find Us Here</h2>
          <div className="mt-5 space-y-5 text-stone-700">
            <div>
              <h3 className="font-semibold text-stone-950">Opening Hours</h3>
              <div className="mt-3">
                <OpeningHoursTable hours={shopHours} />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-stone-950">Address</h3>
              <p className="mt-1">
                2 Whitehill Road Cambridge CB5 8LT
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-stone-950">Phone</h3>
              <p className="mt-1">+44 7472 908714</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
            <a
              href="https://maps.app.goo.gl/244QRPtaMziaEYta6"
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-[#315c46] px-4 py-2 text-sm font-semibold text-white hover:bg-[#263f32]"
            >
              Google Map
            </a>
            <Link
              href="/contact"
              className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
