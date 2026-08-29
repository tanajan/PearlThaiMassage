import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type BookingConfirmationPageProps = {
  params: Promise<{ bookingId: string }>;
};

function formatDateTime(date: Date) {
  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function googleCalendarDate(date: Date) {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function googleCalendarUrl({
  endTime,
  location,
  serviceName,
  startTime,
}: {
  endTime: Date;
  location: string;
  serviceName: string;
  startTime: Date;
}) {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: `Pearl Thai Massage - ${serviceName}`,
    dates: `${googleCalendarDate(startTime)}/${googleCalendarDate(endTime)}`,
    location,
    details: "Your appointment with Pearl Thai Massage.",
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export const dynamic = "force-dynamic";

export default async function BookingConfirmationPage({
  params,
}: BookingConfirmationPageProps) {
  const user = await requireUser();
  const { bookingId } = await params;
  const id = Number(bookingId);

  if (!Number.isInteger(id) || id <= 0) {
    notFound();
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { service: true, staff: true },
  });

  if (!booking || (user.role === "customer" && booking.phone !== user.phone)) {
    notFound();
  }

  const durationMinutes = Math.round(
    (booking.endTime.getTime() - booking.startTime.getTime()) / 60000,
  );
  const location = booking.isHomeMassage
    ? booking.location || "Home massage location"
    : "2 Whitehill Road Cambridge CB5 8LT";
  const calendarUrl = googleCalendarUrl({
    endTime: booking.endTime,
    location,
    serviceName: booking.service.name,
    startTime: booking.startTime,
  });

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-stone-950">
      <section className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          Thank you, {booking.customer}
        </h1>
        <p className="mt-4 text-lg">Your booking has been saved.</p>
        <p className="mt-4 text-sm">Booking number: {booking.id}</p>
      </section>

      <section className="mx-auto mt-10 max-w-5xl border border-[#b8c7ff] px-5 py-8 sm:px-10">
        <div className="grid gap-6 sm:grid-cols-[130px_minmax(0,1fr)_auto]">
          <div className="h-32 w-32 rounded-md bg-[#f3f7ef]" />
          <div className="text-left">
            <h2 className="text-xl font-semibold">{booking.service.name}</h2>
            <p className="mt-1 text-stone-600">Pay in person</p>
            <div className="mt-5 grid gap-1 text-stone-700">
              <p>GBP {booking.service.price.toFixed(2)}</p>
              <p>*Please contact us if you need to change this booking.</p>
              <p>{formatDateTime(booking.startTime)}</p>
              <p>{durationMinutes / 60} hr</p>
              <p>Staff: {booking.staff.name}</p>
              <p>{location}</p>
              {booking.note && <p>Note: {booking.note}</p>}
            </div>
            <a
              href={calendarUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-semibold underline"
            >
              <span aria-hidden="true">[]</span>
              Add to My Google Calendar
            </a>
          </div>
          <p className="text-right text-lg font-semibold">
            GBP {booking.service.price.toFixed(2)}
          </p>
        </div>

        <div className="mt-10 border-t border-[#b8c7ff] pt-6">
          <div className="ml-auto grid max-w-md gap-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>GBP {booking.service.price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>VAT</span>
              <span>GBP 0.00</span>
            </div>
            <div className="border-t border-[#b8c7ff] pt-6 text-2xl font-semibold">
              <div className="flex justify-between">
                <span>Total:</span>
                <span>GBP {booking.service.price.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="font-semibold underline">
          Continue Browsing
        </Link>
      </div>
    </main>
  );
}
