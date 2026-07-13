import Link from "next/link";
import { OpeningHoursTable } from "@/app/components/OpeningHoursTable";
import { PublicLayout } from "@/app/components/PublicLayout";
import { getShopHours } from "@/lib/shopHours";

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const shopHours = await getShopHours();

  return (
    <PublicLayout>
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-8 lg:px-8">
        <img
          src="/images/location.png"
          alt="Pearl Thai Massage shop"
          className="h-72 w-full rounded-md object-cover shadow-sm sm:h-full sm:min-h-96"
        />
        <div className="rounded-md bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-2xl font-semibold sm:text-3xl">Contact</h1>
          <div className="mt-6 space-y-6 text-stone-700">
            <div>
              <h2 className="text-xl font-semibold text-stone-950">Opening Hours</h2>
              <div className="mt-3">
                <OpeningHoursTable hours={shopHours} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950">Address</h2>
              <p className="mt-2">
                2 Whitehill Road Cambridge CB5 8LT
              </p>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-stone-950">Phone</h2>
              <p className="mt-2">+44 7472 908714</p>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/book"
              className="rounded-full bg-[#315c46] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#263f32]"
            >
              Book an Appointment
            </Link>
            <a
              href="https://wa.me/447472908714"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-[#7fa66a] bg-[#dcebc8] px-5 py-3 text-center text-sm font-semibold text-[#263f32] hover:bg-[#c6dfac]"
            >
              WhatsApp
            </a>
            <a
              href="https://maps.app.goo.gl/244QRPtaMziaEYta6"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-stone-300 px-5 py-3 text-center text-sm font-semibold hover:bg-stone-100"
            >
              Google Map
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <div className="min-h-96 overflow-hidden rounded-md shadow-sm">
          <iframe
            title="Pearl Thai Massage map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2444.719313740936!2d0.15545367934570314!3d52.2121481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d870681f6ce20f%3A0x5c1c2c29728a63dc!2s2%20Whitehill%20Rd%2C%20Cambridge%20CB5%208LT!5e0!3m2!1sen!2suk!4v1782859588467!5m2!1sen!2suk"
            className="h-72 w-full border-0 sm:h-96"
            loading="lazy"
          />
        </div>
      </section>
    </PublicLayout>
  );
}
