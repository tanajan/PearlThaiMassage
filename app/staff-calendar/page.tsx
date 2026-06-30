import Link from "next/link";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  addDays,
  endOfMonth,
  endOfWeek,
  formatMonthTitle,
  formatShortDate,
  formatTime,
  halfHourSlots,
  minutesFromTime,
  parseDateParam,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toDateInputValue,
} from "@/lib/calendar";

type StaffCalendarProps = {
  searchParams?: Promise<{
    date?: string;
    view?: string;
    staffId?: string;
  }>;
};

const views = ["day", "week", "month"] as const;
const SLOT_HEIGHT = 64;

export const dynamic = "force-dynamic";

function hrefFor({
  date,
  view,
  staffId,
}: {
  date: Date;
  view: (typeof views)[number];
  staffId?: number;
}) {
  const params = new URLSearchParams({
    date: toDateInputValue(date),
    view,
  });

  if (staffId) {
    params.set("staffId", String(staffId));
  }

  return `/staff-calendar?${params.toString()}`;
}

function sameDay(left: Date, right: Date) {
  return toDateInputValue(left) === toDateInputValue(right);
}

function bookingStartMinutes(booking: { startTime: Date }) {
  return booking.startTime.getHours() * 60 + booking.startTime.getMinutes();
}

function bookingEndMinutes(booking: { endTime: Date }) {
  return booking.endTime.getHours() * 60 + booking.endTime.getMinutes();
}

export default async function StaffCalendar({ searchParams }: StaffCalendarProps) {
  await connection();

  const params = await searchParams;
  const selectedDate = parseDateParam(params?.date);
  const view = views.includes(params?.view as (typeof views)[number])
    ? (params?.view as (typeof views)[number])
    : "week";
  const selectedStaffId = Number(params?.staffId) || undefined;

  const staff = await prisma.staff.findMany({
    orderBy: { name: "asc" },
  });
  const activeStaffId = selectedStaffId ?? staff[0]?.id;

  const rangeStart =
    view === "month"
      ? startOfWeek(startOfMonth(selectedDate))
      : view === "day"
        ? startOfDay(selectedDate)
        : startOfWeek(selectedDate);
  const rangeEnd =
    view === "month"
      ? endOfWeek(addDays(endOfMonth(selectedDate), -1))
      : view === "day"
        ? addDays(startOfDay(selectedDate), 1)
        : endOfWeek(selectedDate);

  const bookings = activeStaffId
    ? await prisma.booking.findMany({
        where: {
          staffId: activeStaffId,
          status: { not: "cancelled" },
          startTime: { gte: rangeStart },
          endTime: { lt: rangeEnd },
        },
        include: { service: true, staff: true },
        orderBy: { startTime: "asc" },
      })
    : [];

  const weekStart = startOfWeek(selectedDate);
  const days =
    view === "day"
      ? [startOfDay(selectedDate)]
      : Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const slots = halfHourSlots();
  const visibleStart = minutesFromTime(slots[0]);
  const visibleEnd = minutesFromTime(slots[slots.length - 1]) + 30;
  const monthCells = Array.from(
    { length: Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86_400_000) },
    (_, index) => addDays(rangeStart, index),
  );
  const selectedStaff = staff.find((person) => person.id === activeStaffId);

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link href="/" className="text-sm font-medium text-amber-700">
              Back to booking desk
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Staff calendar demo
            </h1>
            <p className="mt-2 text-sm text-stone-600">
              See customer bookings by day, week, or month for one staff member.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {staff.map((person) => (
              <Link
                key={person.id}
                href={hrefFor({ date: selectedDate, view, staffId: person.id })}
                className={`rounded-md border px-3 py-2 text-sm font-medium ${
                  person.id === activeStaffId
                    ? "border-stone-950 bg-stone-950 text-white"
                    : "border-stone-300 bg-white hover:bg-stone-100"
                }`}
              >
                {person.name}
              </Link>
            ))}
          </div>
        </header>

        <section className="flex flex-col gap-3 rounded-md border border-stone-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              {view === "month"
                ? formatMonthTitle(selectedDate)
                : view === "day"
                  ? formatShortDate(selectedDate)
                  : `${formatShortDate(weekStart)} - ${formatShortDate(addDays(weekStart, 6))}`}
            </h2>
            <p className="text-sm text-stone-600">
              {selectedStaff?.name ?? "Add a staff member to see bookings"}
            </p>
          </div>

          <nav className="flex flex-wrap gap-2 text-sm">
            {views.map((item) => (
              <Link
                key={item}
                href={hrefFor({ date: selectedDate, view: item, staffId: activeStaffId })}
                className={`rounded-md border px-3 py-2 font-medium capitalize ${
                  item === view
                    ? "border-amber-700 bg-amber-700 text-white"
                    : "border-stone-300 hover:bg-stone-100"
                }`}
              >
                {item}
              </Link>
            ))}
            <Link
              href={hrefFor({
                date:
                  view === "month"
                    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1)
                    : addDays(selectedDate, view === "day" ? -1 : -7),
                view,
                staffId: activeStaffId,
              })}
              className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
            >
              Previous
            </Link>
            <Link
              href={hrefFor({
                date:
                  view === "month"
                    ? new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1)
                    : addDays(selectedDate, view === "day" ? 1 : 7),
                view,
                staffId: activeStaffId,
              })}
              className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
            >
              Next
            </Link>
          </nav>
        </section>

        {view === "month" ? (
          <section className="grid grid-cols-7 overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
              <div
                key={day}
                className="border-b border-stone-200 bg-stone-100 px-3 py-2 text-sm font-semibold"
              >
                {day}
              </div>
            ))}
            {monthCells.map((day) => {
              const dayBookings = bookings.filter((booking) =>
                sameDay(booking.startTime, day),
              );
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();

              return (
                <Link
                  key={day.toISOString()}
                  href={hrefFor({ date: day, view: "week", staffId: activeStaffId })}
                  className={`min-h-28 border-b border-r border-stone-200 p-3 hover:bg-amber-50 ${
                    isCurrentMonth ? "bg-white" : "bg-stone-50 text-stone-400"
                  }`}
                >
                  <div className="text-sm font-semibold">{day.getDate()}</div>
                  {dayBookings.length > 0 && (
                    <div className="mt-3 rounded-md bg-amber-100 px-2 py-1 text-sm font-medium text-amber-900">
                      {dayBookings.length} booking{dayBookings.length === 1 ? "" : "s"}
                    </div>
                  )}
                </Link>
              );
            })}
          </section>
        ) : (
          <section className="overflow-x-auto rounded-md border border-stone-200 bg-white shadow-sm">
            <div
              className="min-w-[900px] grid"
              style={{ gridTemplateColumns: `84px repeat(${days.length}, minmax(160px, 1fr))` }}
            >
              <div className="border-b border-r border-stone-200 bg-stone-100 p-3 text-sm font-semibold">
                Time
              </div>
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className="border-b border-r border-stone-200 bg-stone-100 p-3 text-sm font-semibold"
                >
                  {formatShortDate(day)}
                </div>
              ))}

              <div className="border-r border-stone-200 bg-white">
                {slots.map((slot) => (
                  <div
                    key={slot}
                    className="border-b border-stone-200 px-3 py-4 text-xs font-medium text-stone-500"
                    style={{ height: SLOT_HEIGHT }}
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {days.map((day) => {
                const dayBookings = bookings.filter((booking) =>
                  sameDay(booking.startTime, day),
                );

                return (
                  <div
                    key={day.toISOString()}
                    className="relative border-r border-stone-200"
                    style={{ height: slots.length * SLOT_HEIGHT }}
                  >
                    {slots.map((slot) => (
                      <div
                        key={`${day.toISOString()}-${slot}`}
                        className="border-b border-stone-200"
                        style={{ height: SLOT_HEIGHT }}
                      />
                    ))}

                    {dayBookings.map((booking) => {
                      const start = bookingStartMinutes(booking);
                      const end = bookingEndMinutes(booking);

                      if (end <= visibleStart || start >= visibleEnd) {
                        return null;
                      }

                      const clippedStart = Math.max(start, visibleStart);
                      const clippedEnd = Math.min(end, visibleEnd);
                      const top = ((clippedStart - visibleStart) / 30) * SLOT_HEIGHT;
                      const height = Math.max(
                        SLOT_HEIGHT,
                        ((clippedEnd - clippedStart) / 30) * SLOT_HEIGHT,
                      );

                      return (
                        <div
                          key={booking.id}
                          className="absolute left-2 right-2 z-20 overflow-hidden rounded-md border-l-4 border-amber-700 bg-amber-50 p-2 text-xs text-stone-800 shadow-sm"
                          style={{
                            top,
                            height: height - 8,
                          }}
                        >
                          <div className="font-semibold">{booking.customer}</div>
                          <div>
                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                          </div>
                          <div>{booking.service.duration} min</div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
