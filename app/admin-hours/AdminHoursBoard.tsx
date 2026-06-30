"use client";

import { useState, useTransition } from "react";
import { createBooking, moveBooking, updateBooking } from "@/app/actions";

type ServiceOption = {
  id: number;
  name: string;
  duration: number;
  price: number;
};

type StaffColumn = {
  id: number;
  name: string;
  phone: string | null;
  workingHours: {
    startTime: string;
    endTime: string;
  } | null;
  bookings: BookingItem[];
};

type BookingItem = {
  id: number;
  customer: string;
  phone: string | null;
  note: string | null;
  staffId: number;
  serviceId: number;
  serviceName: string;
  serviceDuration: number;
  servicePrice: number;
  startTime: string;
  endTime: string;
};

type DraftBooking = {
  mode: "create";
  staffId: number;
  date: string;
  startHour: string;
  startMinute: string;
};

type EditBooking = {
  mode: "edit";
  booking: BookingItem;
};

type AdminHoursBoardProps = {
  date: string;
  slots: string[];
  staff: StaffColumn[];
  services: ServiceOption[];
  visibleStart: number;
  visibleEnd: number;
};

const slotHeight = 64;
const colours = [
  "border-pink-500 bg-pink-100",
  "border-purple-500 bg-purple-100",
  "border-sky-500 bg-sky-100",
  "border-emerald-500 bg-emerald-100",
  "border-amber-500 bg-amber-100",
  "border-rose-500 bg-rose-100",
];

function minutesFromTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
}

function dateParts(value: string) {
  const date = new Date(value);
  return {
    date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
      date.getDate(),
    ).padStart(2, "0")}`,
    hour: String(date.getHours()),
    minute: String(date.getMinutes()).padStart(2, "0"),
  };
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(value));
}

export function AdminHoursBoard({
  date,
  slots,
  staff,
  services,
  visibleStart,
  visibleEnd,
}: AdminHoursBoardProps) {
  const [modal, setModal] = useState<DraftBooking | EditBooking | null>(null);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const redirectTo = `/admin-hours?date=${date}`;

  function moveDroppedBooking(staffId: number, slot: string) {
    if (!draggingId) {
      setModal({
        mode: "create",
        staffId,
        date,
        startHour: String(Number(slot.slice(0, 2))),
        startMinute: slot.slice(3),
      });
      return;
    }

    const formData = new FormData();
    formData.set("bookingId", String(draggingId));
    formData.set("staffId", String(staffId));
    formData.set("date", date);
    formData.set("startHour", String(Number(slot.slice(0, 2))));
    formData.set("startMinute", slot.slice(3));
    formData.set("redirectTo", redirectTo);

    startTransition(() => {
      void moveBooking(formData);
    });
  }

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div
            className="grid"
            style={{
              gridTemplateColumns: `84px repeat(${Math.max(staff.length, 1)}, minmax(170px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-30 border-b border-r border-stone-200 bg-stone-100 p-3 text-xs font-semibold">
              Time
            </div>
            {staff.length === 0 ? (
              <div className="border-b border-stone-200 bg-stone-100 p-3 text-sm font-semibold">
                Add staff on the booking desk first
              </div>
            ) : (
              staff.map((person, index) => (
                <div
                  key={person.id}
                  className="border-b border-r border-stone-200 bg-stone-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-full border-2 ${colours[index % colours.length]}`}
                    />
                    <div>
                      <div className="text-sm font-semibold">{person.name}</div>
                      <div className="text-xs text-stone-500">
                        {person.workingHours
                          ? `${person.workingHours.startTime} - ${person.workingHours.endTime}`
                          : "Not working"}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div
            className="grid"
            style={{
              gridTemplateColumns: `84px repeat(${Math.max(staff.length, 1)}, minmax(170px, 1fr))`,
            }}
          >
            <div className="sticky left-0 z-20 bg-white">
              {slots.map((slot) => (
                <div
                  key={slot}
                  className="border-b border-r border-stone-200 px-3 py-4 text-xs font-medium text-stone-500"
                  style={{ height: slotHeight }}
                >
                  {slot}
                </div>
              ))}
            </div>

            {staff.map((person) => (
              <div
                key={person.id}
                className="relative border-r border-stone-200"
                style={{ height: slots.length * slotHeight }}
              >
                {slots.map((slot) => {
                  const slotMinutes = minutesFromTime(slot);
                  const isWorking = person.workingHours
                    ? slotMinutes >= minutesFromTime(person.workingHours.startTime) &&
                      slotMinutes < minutesFromTime(person.workingHours.endTime)
                    : false;

                  return (
                    <button
                      key={slot}
                      type="button"
                      draggable
                      className={`block w-full border-b border-stone-200 text-left transition ${
                        isWorking ? "bg-stone-50 hover:bg-amber-50" : "bg-stone-100"
                      }`}
                      style={{ height: slotHeight }}
                      onClick={() =>
                        setModal({
                          mode: "create",
                          staffId: person.id,
                          date,
                          startHour: String(Number(slot.slice(0, 2))),
                          startMinute: slot.slice(3),
                        })
                      }
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "copy";
                        setDraggingId(null);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={() => moveDroppedBooking(person.id, slot)}
                    />
                  );
                })}

                {person.bookings.map((booking) => {
                  const start = new Date(booking.startTime);
                  const end = new Date(booking.endTime);
                  const startMinutes = start.getHours() * 60 + start.getMinutes();
                  const endMinutes = end.getHours() * 60 + end.getMinutes();

                  if (endMinutes <= visibleStart || startMinutes >= visibleEnd) {
                    return null;
                  }

                  const clippedStart = Math.max(startMinutes, visibleStart);
                  const clippedEnd = Math.min(endMinutes, visibleEnd);
                  const top = ((clippedStart - visibleStart) / 30) * slotHeight;
                  const height = Math.max(
                    slotHeight,
                    ((clippedEnd - clippedStart) / 30) * slotHeight,
                  );

                  return (
                    <button
                      key={booking.id}
                      type="button"
                      draggable
                      className="absolute left-1 right-1 z-30 overflow-hidden rounded-md border-l-4 border-red-500 bg-red-50 p-2 text-left text-xs text-stone-800 shadow-sm transition hover:bg-red-100"
                      style={{
                        top,
                        height: height - 8,
                      }}
                      onClick={() => setModal({ mode: "edit", booking })}
                      onDragStart={(event) => {
                        event.dataTransfer.effectAllowed = "move";
                        setDraggingId(booking.id);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                    >
                      <div className="font-semibold">{booking.customer}</div>
                      <div>
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </div>
                      <div>{booking.serviceDuration} min</div>
                      {booking.note && (
                        <div className="mt-1 truncate text-stone-600">{booking.note}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal && (
        <div
          className="flash-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px]"
          role="presentation"
          onClick={() => setModal(null)}
        >
          <div
            className="flash-modal w-full max-w-xl rounded-md border border-stone-200 bg-white p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {modal.mode === "edit" ? "Booking detail" : "Create booking"}
                </h2>
                <p className="mt-1 text-sm text-stone-600">
                  Edit the booking details, then save.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="rounded-md border border-stone-300 px-3 py-1 text-sm font-medium hover:bg-stone-100"
              >
                Close
              </button>
            </div>

            <form
              action={modal.mode === "edit" ? updateBooking : createBooking}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <input type="hidden" name="redirectTo" value={redirectTo} />
              {modal.mode === "edit" && (
                <input type="hidden" name="bookingId" value={modal.booking.id} />
              )}

              <label className="flex flex-col gap-2 text-sm font-medium">
                Customer
                <input
                  name="customer"
                  required
                  defaultValue={modal.mode === "edit" ? modal.booking.customer : ""}
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Phone
                <input
                  name="phone"
                  defaultValue={modal.mode === "edit" ? modal.booking.phone ?? "" : ""}
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Service
                <select
                  name="serviceId"
                  required
                  defaultValue={
                    modal.mode === "edit" ? modal.booking.serviceId : services[0]?.id
                  }
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                >
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} - {service.duration} min - GBP{" "}
                      {service.price.toFixed(2)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium">
                Staff
                <select
                  name="staffId"
                  required
                  defaultValue={
                    modal.mode === "edit" ? modal.booking.staffId : modal.staffId
                  }
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                >
                  {staff.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </label>

              {(() => {
                const parts =
                  modal.mode === "edit"
                    ? dateParts(modal.booking.startTime)
                    : {
                        date: modal.date,
                        hour: modal.startHour,
                        minute: modal.startMinute,
                      };

                return (
                  <>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Date
                      <input
                        name="date"
                        type="date"
                        required
                        defaultValue={parts.date}
                        className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-sm font-medium">
                      Start time
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          name="startHour"
                          required
                          defaultValue={parts.hour}
                          className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        >
                          {Array.from({ length: 10 }, (_, index) => index + 10).map(
                            (hour) => (
                              <option key={hour} value={hour}>
                                {String(hour).padStart(2, "0")}
                              </option>
                            ),
                          )}
                        </select>
                        <select
                          name="startMinute"
                          required
                          defaultValue={parts.minute}
                          className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                        >
                          <option value="00">00</option>
                          <option value="30">30</option>
                        </select>
                      </div>
                    </label>
                  </>
                );
              })()}

              <label className="flex flex-col gap-2 text-sm font-medium sm:col-span-2">
                Note
                <textarea
                  name="note"
                  rows={3}
                  defaultValue={modal.mode === "edit" ? modal.booking.note ?? "" : ""}
                  className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-amber-700"
                />
              </label>

              <div className="flex gap-2 sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800"
                >
                  {modal.mode === "edit" ? "Save booking" : "Create booking"}
                </button>
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold hover:bg-stone-100"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
