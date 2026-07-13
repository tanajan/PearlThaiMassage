import Link from "next/link";
import { createCustomerBooking, logout } from "@/app/actions";
import { FlashModal } from "@/app/components/FlashModal";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  BOOKING_START_HOURS,
  SLOT_MINUTES,
} from "@/lib/services/bookingService";

type BookPageProps = {
  searchParams?: Promise<{
    error?: string;
    success?: string;
  }>;
};

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export const dynamic = "force-dynamic";

export default async function BookPage({ searchParams }: BookPageProps) {
  const user = await requireUser();
  const params = await searchParams;

  if (user.role === "owner") {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-950">
        <section className="mx-auto max-w-xl rounded-md border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Owner account</h1>
          <p className="mt-2 text-stone-600">
            Owners should create and manage bookings from the admin dashboard.
          </p>
          <Link
            href="/admin"
            className="mt-5 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (user.role === "staff") {
    return (
      <main className="min-h-screen bg-stone-50 px-4 py-10 text-stone-950">
        <section className="mx-auto max-w-xl rounded-md border border-stone-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Staff account</h1>
          <p className="mt-2 text-stone-600">
            Staff accounts can view their own calendar.
          </p>
          <Link
            href="/staff-calendar"
            className="mt-5 inline-flex rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white"
          >
            Go to staff calendar
          </Link>
        </section>
      </main>
    );
  }

  const [staff, serviceGroups, bookings] = await Promise.all([
    prisma.staff.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.serviceGroup.findMany({
      include: { services: { orderBy: { duration: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.booking.findMany({
      where: { phone: user.phone },
      include: { staff: true, service: true },
      orderBy: { startTime: "desc" },
      take: 10,
    }),
  ]);
  const services = serviceGroups.flatMap((group) => group.services);

  return (
    <main className="min-h-screen bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <section className="rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Link href="/" className="text-sm font-medium text-[#587b4b]">
                Back to website
              </Link>
              <h1 className="mt-3 text-3xl font-semibold">Book an appointment</h1>
              <p className="mt-2 text-sm text-stone-600">
                Logged in as {user.phone}. Your phone number is verified.
              </p>
            </div>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-md border border-stone-300 px-3 py-2 text-sm font-semibold hover:bg-stone-100"
              >
                Logout
              </button>
            </form>
          </div>

          {params?.error && <FlashModal type="error" message={params.error} />}
          {params?.success && <FlashModal type="success" message={params.success} />}

          <form action={createCustomerBooking} className="mt-6 grid gap-4 sm:grid-cols-2">
            <input type="hidden" name="redirectTo" value="/book" />
            <label className="flex flex-col gap-2 text-sm font-medium">
              Your name
              <input
                name="customer"
                required
                defaultValue={user.name ?? ""}
                className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Phone
              <input
                value={user.phone}
                readOnly
                className="rounded-md border border-stone-300 bg-stone-100 px-3 py-2 font-normal text-stone-600"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Service
              <select
                name="serviceId"
                required
                disabled={services.length === 0}
                className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
              >
                <option value="">Choose service</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - {service.duration} min - GBP{" "}
                    {service.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Preferred staff
              <select
                name="staffId"
                required
                disabled={staff.length === 0}
                className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
              >
                <option value="">Choose staff</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Date
              <input
                name="date"
                type="date"
                min={todayInputValue()}
                defaultValue={todayInputValue()}
                required
                className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium">
              Start time
              <div className="grid grid-cols-2 gap-2">
                <select
                  name="startHour"
                  required
                  defaultValue="10"
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
                >
                  {BOOKING_START_HOURS.map((hour) => (
                    <option key={hour} value={hour}>
                      {String(hour).padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <select
                  name="startMinute"
                  required
                  defaultValue="00"
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
                >
                  {SLOT_MINUTES.map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
              Note
              <textarea
                name="note"
                rows={3}
                className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
                placeholder="Optional"
              />
            </label>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={staff.length === 0 || services.length === 0}
                className="rounded-md bg-[#315c46] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#263f32] disabled:cursor-not-allowed disabled:bg-stone-400"
              >
                Book appointment
              </button>
            </div>
          </form>
        </section>

        <aside className="h-fit rounded-md border border-[#dcebc8] bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold">Your recent bookings</h2>
          <div className="mt-4 grid gap-3">
            {bookings.length === 0 ? (
              <p className="rounded-md bg-stone-100 p-4 text-sm text-stone-600">
                No bookings yet.
              </p>
            ) : (
              bookings.map((booking) => (
                <article key={booking.id} className="rounded-md border border-stone-200 p-3">
                  <h3 className="font-semibold">{booking.service.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">
                    {booking.startTime.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Staff: {booking.staff.name}
                  </p>
                  <p className="mt-1 text-sm capitalize text-stone-500">
                    Status: {booking.status === "confirmed" ? "coming" : booking.status}
                  </p>
                </article>
              ))
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
