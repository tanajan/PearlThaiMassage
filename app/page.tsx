import Link from "next/link";
import { PublicLayout } from "@/app/components/PublicLayout";

const treatments = [
  {
    title: "Hot Stone",
    image: "/images/service5.jpg",
    description:
      "Warm stones and flowing massage techniques to release deep tension and encourage calm.",
  },
  {
    title: "Deep Tissue Massage",
    image: "/images/service1.jpg",
    description:
      "Focused pressure for tight muscles, tired shoulders, and areas that need extra care.",
  },
  {
    title: "Hot Oil Relaxing",
    image: "/images/service2.jpg",
    description:
      "A soothing massage using warm oil to help you slow down, relax, and reset.",
  },
];

export default function PublicHome() {
  return (
    <PublicLayout>
      <section className="relative flex min-h-[calc(100vh-88px)] items-center justify-center overflow-hidden text-center text-white">
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
        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Pearl Thai Massage
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90">
            Authentic Thai massage, relaxing treatments, and caring therapists
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/admin?section=booking"
              className="rounded-full bg-[#7fa66a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#dcebc8] hover:text-[#263f32]"
            >
              Book Now
            </Link>
            <Link
              href="/services"
              className="rounded-full bg-[#315c46] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white hover:text-[#263f32]"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:px-8">
        <div className="flex justify-center">
          <img
            src="/images/logo.jpeg"
            alt="Pearl Thai Massage logo"
            className="h-52 w-52 rounded-lg object-cover shadow-lg"
          />
        </div>
        <div className="rounded-md bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-semibold text-[#587b4b]">About Us</h2>
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

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-3xl font-semibold">Popular Treatments</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {treatments.map((treatment, index) => (
              <article
                key={treatment.title}
                className="rounded-2xl bg-[#f3f7ef] p-5 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                style={{ marginTop: `${index * 16}px` }}
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

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="min-h-80 overflow-hidden rounded-md bg-stone-200 shadow-sm">
          <iframe
            title="Pearl Thai Massage map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.719313740936!2d0.15545367934570314!3d52.2121481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d870681f6ce20f%3A0x5c1c2c29728a63dc!2s2%20Whitehill%20Rd%2C%20Cambridge%20CB5%208LT!5e0!3m2!1sen!2suk!4v1782859588467!5m2!1sen!2suk"
            className="h-full min-h-80 w-full border-0"
            loading="lazy"
          />
        </div>
        <div className="rounded-md bg-white p-6 shadow-sm">
          <h2 className="text-3xl font-semibold">Find Us Here</h2>
          <div className="mt-5 space-y-5 text-stone-700">
            <div>
              <h3 className="font-semibold text-stone-950">Opening Hours</h3>
              <p className="mt-1">Monday - Saturday: 10:00 - 21:00</p>
              <p>Sunday: 11:00 - 19:00</p>
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
          <div className="mt-6 flex flex-wrap gap-3">
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
