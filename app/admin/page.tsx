import {
  createBooking,
  createService,
  createServiceGroup,
  createStaff,
  deleteStaff,
  deleteService,
  deleteServiceGroup,
  updateService,
  updateServiceGroup,
  updateStaffSchedule,
} from "@/app/actions";
import { connection } from "next/server";
import { ConfirmSubmitButton } from "@/app/components/ConfirmSubmitButton";
import { FlashModal } from "@/app/components/FlashModal";
import { prisma } from "@/lib/prisma";
import { getServiceColourTheme, SERVICE_COLOURS } from "@/lib/serviceColours";
import {
  BOOKING_START_HOURS,
  DAYS,
  SLOT_DURATIONS,
  SLOT_MINUTES,
  WORK_END_HOURS,
} from "@/lib/services/bookingService";
import { Fragment } from "react";

type HomeProps = {
  searchParams?: Promise<{
    error?: string;
    section?: string;
    success?: string;
  }>;
};

export const dynamic = "force-dynamic";

const sections = [
  { id: "booking", label: "Booking" },
  { id: "staff", label: "Staff" },
  { id: "service", label: "Service" },
  { id: "customer", label: "Customer" },
] as const;

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function splitTime(time: string | undefined, fallback: string) {
  const [hour, minute] = (time ?? fallback).split(":");
  return { hour: String(Number(hour)), minute };
}

function isSection(value: string | undefined): value is (typeof sections)[number]["id"] {
  return sections.some((section) => section.id === value);
}

function colourCardStyle(colour: string) {
  const theme = getServiceColourTheme(colour);

  return {
    background: `linear-gradient(135deg, ${theme.faint} 0%, #ffffff 58%, ${theme.soft} 100%)`,
    borderColor: theme.soft,
  };
}

function ColourPicker({
  defaultColour,
  name = "colour",
}: {
  defaultColour: string;
  name?: string;
}) {
  return (
    <fieldset className="rounded-md border border-stone-200 bg-white/70 p-3">
      <legend className="px-1 text-sm font-medium">Group colour</legend>
      <div className="mt-2 grid grid-cols-5 gap-2">
        {SERVICE_COLOURS.map((colour) => (
          <label
            key={colour.base}
            className="flex cursor-pointer flex-col items-center gap-1 rounded-md border border-transparent p-1 text-[11px] text-stone-600 hover:border-stone-300"
            title={colour.label}
          >
            <input
              name={name}
              type="radio"
              value={colour.base}
              defaultChecked={colour.base === defaultColour}
              className="sr-only peer"
            />
            <span
              className="h-8 w-full rounded-md border border-stone-200 ring-offset-2 peer-checked:ring-2 peer-checked:ring-stone-950"
              style={{
                background: `linear-gradient(135deg, ${colour.base}, ${colour.soft}, ${colour.faint})`,
              }}
            />
            <span className="truncate">{colour.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function DashboardHeader() {
  return (
    <header className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-amber-700">
            Pearl Thai Massage
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            Admin dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">
            Manage bookings, staff, services, and customers from one place.
          </p>
        </div>
        <nav className="flex flex-wrap gap-2 text-sm">
          <a
            href="/staff-calendar"
            className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
          >
            Staff calendar demo
          </a>
          <a
            href="/admin-hours"
            className="rounded-md border border-stone-300 px-3 py-2 font-medium hover:bg-stone-100"
          >
            Admin hours demo
          </a>
        </nav>
      </div>
    </header>
  );
}

export default async function Home({ searchParams }: HomeProps) {
  await connection();

  const params = await searchParams;
  const activeSection = isSection(params?.section) ? params.section : "booking";
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let dashboardData;

  try {
    dashboardData = await Promise.all([
      prisma.staff.findMany({
        include: {
          workingHours: { orderBy: { dayOfWeek: "asc" } },
          staffServiceGroups: true,
        },
        orderBy: { name: "asc" },
      }),
      prisma.serviceGroup.findMany({
        include: {
          services: {
            orderBy: { duration: "asc" },
          },
          staffServiceGroups: {
            include: { staff: true },
            orderBy: { staff: { name: "asc" } },
          },
        },
        orderBy: { name: "asc" },
      }),
      prisma.booking.findMany({
        where: {
          status: { not: "cancelled" },
          startTime: { gte: today },
        },
        include: {
          staff: true,
          service: true,
        },
        orderBy: { startTime: "asc" },
        take: 25,
      }),
      prisma.booking.findMany({
        include: {
          staff: true,
          service: true,
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
    ]);
  } catch (error) {
    console.error("Could not load dashboard data", error);

    return (
      <main className="min-h-screen bg-stone-50 text-stone-950">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <DashboardHeader />
          <section className="rounded-md border border-red-200 bg-white p-5 shadow-sm">
            <div className="rounded-md bg-red-50 p-4 text-red-900">
              <h2 className="text-lg font-semibold">Database unavailable</h2>
              <p className="mt-2 text-sm leading-6">
                The dashboard could not connect to the booking database. This is
                usually because Neon is asleep, the internet connection is down, or
                the database URL is not reachable.
              </p>
              <div className="mt-4 rounded-md border border-red-200 bg-white p-3 text-sm text-red-800">
                Check that Neon is active, then refresh this page. If it still fails,
                verify the `DATABASE_URL` in the project `.env` file.
              </div>
            </div>
          </section>
        </div>
      </main>
    );
  }

  const [staff, serviceGroups, bookings, customerBookings] = dashboardData;
  const services = serviceGroups.flatMap((group) => group.services);

  const customers = Array.from(
    customerBookings
      .reduce((map, booking) => {
        const key = `${booking.customer.toLowerCase()}-${booking.phone ?? ""}`;
        const current = map.get(key);

        if (!current) {
          map.set(key, {
            customer: booking.customer,
            phone: booking.phone,
            bookings: 1,
            lastBooking: booking.startTime,
          });
          return map;
        }

        current.bookings += 1;
        if (booking.startTime > current.lastBooking) {
          current.lastBooking = booking.startTime;
        }

        return map;
      }, new Map<string, { customer: string; phone: string | null; bookings: number; lastBooking: Date }>())
      .values(),
  );

  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <DashboardHeader />

        {params?.error && <FlashModal type="error" message={params.error} />}
        {params?.success && <FlashModal type="success" message={params.success} />}

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="h-fit rounded-md border border-stone-200 bg-white p-3 shadow-sm">
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Manage
            </p>
            <nav className="grid gap-1">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`/admin?section=${section.id}`}
                  className={`rounded-md px-3 py-2 text-sm font-medium ${
                    activeSection === section.id
                      ? "bg-stone-950 text-white"
                      : "text-stone-700 hover:bg-stone-100"
                  }`}
                >
                  {section.label}
                </a>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {activeSection === "booking" && (
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="mb-5 flex flex-col gap-1">
                    <h2 className="text-xl font-semibold">Create booking</h2>
                    <p className="text-sm text-stone-600">
                      Slots start on :00 or :30 and can be 60, 90, or 120 minutes.
                    </p>
                  </div>

                  <form action={createBooking} className="grid gap-4 sm:grid-cols-2">
                    <input type="hidden" name="redirectTo" value="/admin?section=booking" />
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Customer name
                      <input
                        name="customer"
                        required
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Customer name"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Phone
                      <input
                        name="phone"
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Optional"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Service
                      <select
                        name="serviceId"
                        required
                        disabled={services.length === 0}
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700 disabled:bg-stone-100"
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
                      Staff member
                      <select
                        name="staffId"
                        required
                        disabled={staff.length === 0}
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700 disabled:bg-stone-100"
                      >
                        <option value="">Choose staff</option>
                        {staff.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs font-normal text-stone-500">
                        Staff must be assigned to the selected service.
                      </span>
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Date
                      <input
                        name="date"
                        type="date"
                        min={todayInputValue()}
                        defaultValue={todayInputValue()}
                        required
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Start time
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="startHour"
                          required
                          className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                          defaultValue="10"
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
                          className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                          defaultValue="00"
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
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Optional booking notes"
                      />
                    </label>
                    <div className="sm:col-span-2">
                      <ConfirmSubmitButton
                        disabled={staff.length === 0 || services.length === 0}
                        className="rounded-md bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                        confirmTitle="Create this booking?"
                        confirmMessage="Please confirm the customer, service, staff member, date, and time are correct before creating the booking."
                        confirmAction="Create booking"
                      >
                        Book slot
                      </ConfirmSubmitButton>
                    </div>
                  </form>
                </div>

                <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Upcoming bookings</h2>
                  <div className="mt-5 flex flex-col gap-3">
                    {bookings.length === 0 ? (
                      <p className="rounded-md bg-stone-100 p-4 text-sm text-stone-600">
                        No upcoming bookings yet.
                      </p>
                    ) : (
                      bookings.map((booking) => (
                        <article
                          key={booking.id}
                          className="rounded-md border border-stone-200 p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="font-semibold">{booking.customer}</h3>
                              <p className="text-sm text-stone-600">
                                {formatDateTime(booking.startTime)} to{" "}
                                {formatDateTime(booking.endTime)}
                              </p>
                            </div>
                            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                              {booking.service.duration} min
                            </span>
                          </div>
                          <p className="mt-3 text-sm text-stone-700">
                            Staff: <strong>{booking.staff.name}</strong>
                          </p>
                          <p className="mt-1 text-sm text-stone-600">
                            Service: {booking.service.name}
                          </p>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {activeSection === "staff" && (
              <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
                <div className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Add staff</h2>
                  <form action={createStaff} className="mt-4 flex flex-col gap-4">
                    <input type="hidden" name="redirectTo" value="/admin?section=staff" />
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Name
                      <input
                        name="name"
                        required
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Staff name"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Phone
                      <input
                        name="phone"
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Optional"
                      />
                    </label>
                    <ConfirmSubmitButton
                      className="rounded-md border border-stone-950 px-4 py-2 text-sm font-semibold transition hover:bg-stone-950 hover:text-white"
                      confirmTitle="Add this staff member?"
                      confirmMessage="This will create a new staff profile. You can set working hours and services after it is added."
                      confirmAction="Add staff"
                    >
                      Add staff
                    </ConfirmSubmitButton>
                  </form>
                </div>

                <div className="grid gap-4">
                  {staff.length === 0 ? (
                    <p className="rounded-md bg-white p-5 text-sm text-stone-600 shadow-sm">
                      Add a staff member before setting working hours.
                    </p>
                  ) : (
                    staff.map((person) => (
                      <Fragment key={person.id}>
                        <form
                          action={updateStaffSchedule}
                          className="rounded-md border border-stone-200 bg-white p-4 shadow-sm"
                        >
                          <input type="hidden" name="staffId" value={person.id} />
                          <input type="hidden" name="redirectTo" value="/admin?section=staff" />
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h3 className="font-semibold">{person.name}</h3>
                              {person.phone && (
                                <p className="text-sm text-stone-500">{person.phone}</p>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                              >
                                Save staff
                              </button>
                              <ConfirmSubmitButton
                                formId={`delete-staff-${person.id}`}
                                className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                confirmTitle="Delete this staff member?"
                                confirmMessage="This will remove the staff member, their working hours, and service assignments. Staff with existing bookings cannot be deleted."
                                confirmAction="Delete staff"
                              >
                                Delete
                              </ConfirmSubmitButton>
                            </div>
                          </div>

                          <div className="mt-4 grid gap-3">
                            <details className="rounded-md border border-stone-200 bg-stone-50 p-3">
                              <summary className="cursor-pointer text-sm font-semibold">
                                Available service
                              </summary>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {serviceGroups.length === 0 ? (
                                  <p className="text-sm text-stone-500">
                                    Add service groups first, then assign them here.
                                  </p>
                                ) : (
                                  serviceGroups.map((group) => (
                                    <label
                                      key={group.id}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <input
                                        name="groupIds"
                                        type="checkbox"
                                        value={group.id}
                                        defaultChecked={person.staffServiceGroups.some(
                                          (item) => item.groupId === group.id,
                                        )}
                                        className="h-4 w-4 rounded border-stone-300"
                                      />
                                      {group.name}
                                    </label>
                                  ))
                                )}
                              </div>
                            </details>

                            <details className="rounded-md border border-stone-200 bg-stone-50 p-3">
                              <summary className="cursor-pointer text-sm font-semibold">
                                Available work hour
                              </summary>
                              <div className="mt-3 grid gap-3">
                                {DAYS.map((dayName, dayOfWeek) => {
                                  const hours = person.workingHours.find(
                                    (item) => item.dayOfWeek === dayOfWeek,
                                  );
                                  const start = splitTime(hours?.startTime, "10:00");
                                  const end = splitTime(hours?.endTime, "18:00");

                                  return (
                                    <div
                                      key={dayName}
                                      className="grid gap-3 rounded-md bg-white p-3 sm:grid-cols-[120px_1fr_1fr]"
                                    >
                                      <label className="flex items-center gap-2 text-sm font-medium">
                                        <input
                                          name={`works-${dayOfWeek}`}
                                          type="checkbox"
                                          defaultChecked={Boolean(hours)}
                                          className="h-4 w-4 rounded border-stone-300"
                                        />
                                        {dayName}
                                      </label>
                                      <label className="flex items-center gap-2 text-sm text-stone-600">
                                        Start
                                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                                          <select
                                            name={`startHour-${dayOfWeek}`}
                                            defaultValue={start.hour}
                                            className="min-w-0 rounded-md border border-stone-300 px-2 py-2 text-stone-950 outline-none focus:border-amber-700"
                                          >
                                            {BOOKING_START_HOURS.map((hour) => (
                                              <option key={hour} value={hour}>
                                                {String(hour).padStart(2, "0")}
                                              </option>
                                            ))}
                                          </select>
                                          <select
                                            name={`startMinute-${dayOfWeek}`}
                                            defaultValue={start.minute}
                                            className="min-w-0 rounded-md border border-stone-300 px-2 py-2 text-stone-950 outline-none focus:border-amber-700"
                                          >
                                            {SLOT_MINUTES.map((minute) => (
                                              <option key={minute} value={minute}>
                                                {minute}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </label>
                                      <label className="flex items-center gap-2 text-sm text-stone-600">
                                        End
                                        <div className="grid min-w-0 flex-1 grid-cols-2 gap-2">
                                          <select
                                            name={`endHour-${dayOfWeek}`}
                                            defaultValue={end.hour}
                                            className="min-w-0 rounded-md border border-stone-300 px-2 py-2 text-stone-950 outline-none focus:border-amber-700"
                                          >
                                            {WORK_END_HOURS.map((hour) => (
                                              <option key={hour} value={hour}>
                                                {String(hour).padStart(2, "0")}
                                              </option>
                                            ))}
                                          </select>
                                          <select
                                            name={`endMinute-${dayOfWeek}`}
                                            defaultValue={end.minute}
                                            className="min-w-0 rounded-md border border-stone-300 px-2 py-2 text-stone-950 outline-none focus:border-amber-700"
                                          >
                                            {SLOT_MINUTES.map((minute) => (
                                              <option key={minute} value={minute}>
                                                {minute}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </div>
                        </form>
                        <form
                          id={`delete-staff-${person.id}`}
                          action={deleteStaff}
                          className="hidden"
                        >
                          <input type="hidden" name="staffId" value={person.id} />
                          <input type="hidden" name="redirectTo" value="/admin?section=staff" />
                        </form>
                      </Fragment>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeSection === "service" && (
              <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
                <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Service groups</h2>
                  <div className="mt-4 grid gap-3">
                    {serviceGroups.length === 0 ? (
                      <p className="rounded-md bg-stone-100 p-4 text-sm text-stone-600">
                        Add your first service group before creating bookings.
                      </p>
                    ) : (
                      serviceGroups.map((group) => {
                        const groupTheme = getServiceColourTheme(group.colour);

                        return (
                        <details
                          key={group.id}
                          className="rounded-md border p-4 shadow-sm"
                          style={colourCardStyle(group.colour)}
                        >
                          <summary className="cursor-pointer list-none">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-center gap-3">
                                <span
                                  className="h-8 w-8 rounded-md border border-white/70 shadow-sm"
                                  style={{ backgroundColor: groupTheme.base }}
                                />
                                <div>
                                  <h3 className="font-semibold">{group.name}</h3>
                                  <p className="text-sm text-stone-600">
                                    {group.services.length} service option
                                    {group.services.length === 1 ? "" : "s"} ·{" "}
                                    {group.staffServiceGroups.length} staff
                                  </p>
                                </div>
                              </div>
                              <span className="text-sm font-medium text-stone-600">
                                Open
                              </span>
                            </div>
                          </summary>

                          <div className="mt-4 grid gap-4 border-t border-white/70 pt-4">
                          <form action={updateServiceGroup} className="grid gap-4">
                            <input type="hidden" name="groupId" value={group.id} />
                            <input type="hidden" name="redirectTo" value="/admin?section=service" />
                            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                              <label className="flex flex-col gap-2 text-sm font-medium">
                                Group name
                                <input
                                  name="name"
                                  required
                                  defaultValue={group.name}
                                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                                />
                              </label>
                              <span className="h-fit rounded-full bg-stone-100 px-3 py-2 text-xs font-medium text-stone-700">
                                {group.services.length} services
                              </span>
                            </div>
                            <ColourPicker defaultColour={groupTheme.base} />
                            <details className="rounded-md border border-stone-200 bg-stone-50 p-3">
                              <summary className="cursor-pointer text-sm font-semibold">
                                Staff who can do this group ({group.staffServiceGroups.length})
                              </summary>
                              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                {staff.map((person) => (
                                  <label
                                    key={person.id}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <input
                                      name="staffIds"
                                      type="checkbox"
                                      value={person.id}
                                      defaultChecked={group.staffServiceGroups.some(
                                        (item) => item.staffId === person.id,
                                      )}
                                      className="h-4 w-4 rounded border-stone-300"
                                    />
                                    {person.name}
                                  </label>
                                ))}
                              </div>
                            </details>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="submit"
                                className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                              >
                                Save group
                              </button>
                              <ConfirmSubmitButton
                                formId={`delete-group-${group.id}`}
                                className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                confirmTitle="Delete this service group?"
                                confirmMessage="Only empty groups can be deleted. Delete the services inside this group first."
                                confirmAction="Delete group"
                              >
                                Delete group
                              </ConfirmSubmitButton>
                            </div>
                          </form>
                          <form
                            id={`delete-group-${group.id}`}
                            action={deleteServiceGroup}
                            className="hidden"
                          >
                            <input type="hidden" name="groupId" value={group.id} />
                            <input type="hidden" name="redirectTo" value="/admin?section=service" />
                          </form>

                          <div className="grid gap-3">
                            <h3 className="text-sm font-semibold">Services in this group</h3>
                            {group.services.length === 0 ? (
                              <p className="rounded-md bg-stone-50 p-3 text-sm text-stone-500">
                                No service durations in this group yet.
                              </p>
                            ) : (
                              group.services.map((service) => (
                                <div
                                  key={service.id}
                                  className="rounded-md border border-stone-200 bg-stone-50 p-3"
                                >
                                  <form
                                    action={updateService}
                                    className="grid gap-3 sm:grid-cols-[130px_130px_auto]"
                                  >
                                    <input
                                      type="hidden"
                                      name="serviceId"
                                      value={service.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="redirectTo"
                                      value="/admin?section=service"
                                    />
                                    <label className="flex flex-col gap-2 text-sm font-medium">
                                      Duration
                                      <select
                                        name="duration"
                                        required
                                        defaultValue={service.duration}
                                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                                      >
                                        {SLOT_DURATIONS.map((duration) => (
                                          <option key={duration} value={duration}>
                                            {duration} min
                                          </option>
                                        ))}
                                      </select>
                                    </label>
                                    <label className="flex flex-col gap-2 text-sm font-medium">
                                      Price GBP
                                      <input
                                        name="price"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        required
                                        defaultValue={service.price.toFixed(2)}
                                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                                      />
                                    </label>
                                    <div className="flex items-end gap-2">
                                      <button
                                        type="submit"
                                        className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                                      >
                                        Save
                                      </button>
                                      <ConfirmSubmitButton
                                        formId={`delete-service-${service.id}`}
                                        className="rounded-md border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                                        confirmTitle="Delete this service?"
                                        confirmMessage="Services with existing bookings cannot be deleted."
                                        confirmAction="Delete service"
                                      >
                                        Delete
                                      </ConfirmSubmitButton>
                                    </div>
                                  </form>
                                  <form
                                    id={`delete-service-${service.id}`}
                                    action={deleteService}
                                    className="hidden"
                                  >
                                    <input
                                      type="hidden"
                                      name="serviceId"
                                      value={service.id}
                                    />
                                    <input
                                      type="hidden"
                                      name="redirectTo"
                                      value="/admin?section=service"
                                    />
                                  </form>
                                </div>
                              ))
                            )}

                            <form
                              action={createService}
                              className="grid gap-3 rounded-md border border-dashed border-stone-300 p-3 sm:grid-cols-[130px_130px_auto]"
                            >
                              <input type="hidden" name="groupId" value={group.id} />
                              <input type="hidden" name="redirectTo" value="/admin?section=service" />
                              <label className="flex flex-col gap-2 text-sm font-medium">
                                Duration
                                <select
                                  name="duration"
                                  required
                                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                                  defaultValue="60"
                                >
                                  {SLOT_DURATIONS.map((duration) => (
                                    <option key={duration} value={duration}>
                                      {duration} min
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <label className="flex flex-col gap-2 text-sm font-medium">
                                Price GBP
                                <input
                                  name="price"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  required
                                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                                  placeholder="60"
                                />
                              </label>
                              <div className="flex items-end">
                                <ConfirmSubmitButton
                                  className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
                                  confirmTitle="Add service to this group?"
                                  confirmMessage="This will create a new duration and price option inside this service group."
                                  confirmAction="Add service"
                                >
                                  Add service
                                </ConfirmSubmitButton>
                              </div>
                            </form>
                          </div>
                          </div>
                        </details>
                      );
                      })
                    )}
                  </div>
                </div>

                <div className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                  <h2 className="text-xl font-semibold">Add service group</h2>
                  <form action={createServiceGroup} className="mt-4 grid gap-4">
                    <input type="hidden" name="redirectTo" value="/admin?section=service" />
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Group name
                      <input
                        name="name"
                        required
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        placeholder="Hot stone massage"
                      />
                    </label>
                    <ColourPicker defaultColour={SERVICE_COLOURS[0].base} />
                    <details className="rounded-md border border-stone-200 bg-stone-50 p-3">
                      <summary className="cursor-pointer text-sm font-semibold">
                        Staff who can do it
                      </summary>
                      <div className="mt-3 grid gap-2">
                        {staff.length === 0 ? (
                          <p className="text-sm text-stone-500">Add staff first.</p>
                        ) : (
                          staff.map((person) => (
                            <label
                              key={person.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              <input
                                name="staffIds"
                                type="checkbox"
                                value={person.id}
                                className="h-4 w-4 rounded border-stone-300"
                              />
                              {person.name}
                            </label>
                          ))
                        )}
                      </div>
                    </details>
                    <ConfirmSubmitButton
                      className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-800"
                      confirmTitle="Add this service group?"
                      confirmMessage="This will create a new service group. You can add duration and price options inside it."
                      confirmAction="Add group"
                    >
                      Add group
                    </ConfirmSubmitButton>
                  </form>
                </div>
              </section>
            )}

            {activeSection === "customer" && (
              <section className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="text-xl font-semibold">Customers</h2>
                <p className="mt-1 text-sm text-stone-600">
                  Customer records are currently built from booking history.
                </p>
                <div className="mt-5 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="border-b border-stone-200 bg-stone-100 text-xs uppercase tracking-[0.12em] text-stone-500">
                      <tr>
                        <th className="px-3 py-3">Name</th>
                        <th className="px-3 py-3">Phone</th>
                        <th className="px-3 py-3">Bookings</th>
                        <th className="px-3 py-3">Last booking</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.length === 0 ? (
                        <tr>
                          <td className="px-3 py-4 text-stone-500" colSpan={4}>
                            No customers yet.
                          </td>
                        </tr>
                      ) : (
                        customers.map((customer) => (
                          <tr
                            key={`${customer.customer}-${customer.phone ?? "none"}`}
                            className="border-b border-stone-100"
                          >
                            <td className="px-3 py-3 font-medium">{customer.customer}</td>
                            <td className="px-3 py-3 text-stone-600">
                              {customer.phone ?? "Not provided"}
                            </td>
                            <td className="px-3 py-3 text-stone-600">
                              {customer.bookings}
                            </td>
                            <td className="px-3 py-3 text-stone-600">
                              {formatDateTime(customer.lastBooking)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

