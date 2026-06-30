import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { AdminHoursBoard } from "./AdminHoursBoard";
import {
  addDays,
  formatShortDate,
  halfHourSlots,
  minutesFromTime,
  parseDateParam,
  startOfDay,
  toDateInputValue,
} from "@/lib/calendar";
import { DAYS } from "@/lib/services/bookingService";

type AdminHoursProps = {
  searchParams?: Promise<{
    date?: string;
  }>;
};

export const dynamic = "force-dynamic";

function dateHref(date: Date) {
  return `/admin-hours?date=${toDateInputValue(date)}`;
}

export default async function AdminHours({ searchParams }: AdminHoursProps) {
  await connection();

  const params = await searchParams;
  const selectedDate = parseDateParam(params?.date);
  const dayStart = startOfDay(selectedDate);
  const dayEnd = addDays(dayStart, 1);
  const dayOfWeek = selectedDate.getDay();
  const slots = halfHourSlots();
  const visibleStart = minutesFromTime(slots[0]);
  const visibleEnd = minutesFromTime(slots[slots.length - 1]) + 30;

  const [staff, services] = await Promise.all([
    prisma.staff.findMany({
      include: {
        workingHours: {
          where: { dayOfWeek },
        },
        bookings: {
          where: {
            status: { not: "cancelled" },
            startTime: { gte: dayStart },
            endTime: { lt: dayEnd },
          },
          include: { service: true },
          orderBy: { startTime: "asc" },
        },
      },
      orderBy: { name: "asc" },
    }),
    prisma.service.findMany({
      orderBy: [{ name: "asc" }, { duration: "asc" }],
    }),
  ]);

  const dateValue = toDateInputValue(selectedDate);
  const staffColumns = staff.map((person) => ({
    id: person.id,
    name: person.name,
    phone: person.phone,
    workingHours: person.workingHours[0]
      ? {
          startTime: person.workingHours[0].startTime,
          endTime: person.workingHours[0].endTime,
        }
      : null,
    bookings: person.bookings.map((booking) => ({
      id: booking.id,
      customer: booking.customer,
      phone: booking.phone,
      note: booking.note,
      staffId: booking.staffId,
      serviceId: booking.serviceId,
      serviceName: booking.service.name,
      serviceDuration: booking.service.duration,
      servicePrice: booking.service.price,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    })),
  }));

  const serviceOptions = services.map((service) => ({
    id: service.id,
    name: service.name,
    duration: service.duration,
    price: service.price,
  }));

  return (
    <main className="min-h-screen bg-[#4f49b8] px-4 py-6 text-stone-950 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-col overflow-hidden rounded-md border-4 border-pink-300 bg-white shadow-2xl">
        <header className="flex flex-col gap-4 border-b border-stone-200 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-amber-700">
              Back to booking desk
            </Link>
            <h1 className="mt-2 text-2xl font-semibold">Admin hours demo</h1>
            <p className="text-sm text-stone-600">
              {formatShortDate(selectedDate)} - {DAYS[dayOfWeek]} rota
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <form action="/admin-hours" className="flex flex-wrap items-center gap-2">
              <label className="sr-only" htmlFor="admin-hours-date">
                Choose date
              </label>
              <input
                id="admin-hours-date"
                name="date"
                type="date"
                defaultValue={dateValue}
                className="rounded-md border border-stone-300 px-3 py-2 font-medium outline-none focus:border-amber-700"
              />
              <button
                type="submit"
                className="rounded-md bg-amber-700 px-3 py-2 font-medium text-white hover:bg-amber-800"
              >
                Go
              </button>
            </form>
            <Link
              href={dateHref(addDays(selectedDate, -1))}
              className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
            >
              Previous day
            </Link>
            <Link
              href={dateHref(new Date())}
              className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
            >
              Today
            </Link>
            <Link
              href={dateHref(addDays(selectedDate, 1))}
              className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
            >
              Next day
            </Link>
            <Link
              href={`/staff-calendar?date=${toDateInputValue(selectedDate)}&view=week`}
              className="rounded-md bg-stone-950 px-3 py-2 font-medium text-white hover:bg-stone-800"
            >
              Staff calendar
            </Link>
          </nav>
        </header>

        <AdminHoursBoard
          date={dateValue}
          slots={slots}
          staff={staffColumns}
          services={serviceOptions}
          visibleStart={visibleStart}
          visibleEnd={visibleEnd}
        />
      </section>
    </main>
  );
}
