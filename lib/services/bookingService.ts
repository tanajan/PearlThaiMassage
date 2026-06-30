import { prisma } from "@/lib/prisma";

export const SLOT_DURATIONS = [60, 90, 120] as const;
export const BOOKING_START_HOURS = Array.from({ length: 10 }, (_, index) => index + 10);
export const WORK_END_HOURS = Array.from({ length: 11 }, (_, index) => index + 10);
export const SLOT_MINUTES = ["00", "30"] as const;

export type SlotDuration = (typeof SLOT_DURATIONS)[number];

export const DAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

const TIME_PATTERN = /^([01]\d|2[0-3]):(00|30)$/;

export function isSlotDuration(duration: number): duration is SlotDuration {
  return SLOT_DURATIONS.includes(duration as SlotDuration);
}

export function parseTimeToMinutes(time: string) {
  if (!TIME_PATTERN.test(time)) {
    throw new Error("Times must start on the hour or half hour.");
  }

  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function buildHalfHourTime(hour: string, minute: string) {
  const parsedHour = Number(hour);

  if (!Number.isInteger(parsedHour) || parsedHour < 0 || parsedHour > 23) {
    throw new Error("Choose a valid hour.");
  }

  if (!SLOT_MINUTES.includes(minute as (typeof SLOT_MINUTES)[number])) {
    throw new Error("Minutes must be 00 or 30.");
  }

  return `${String(parsedHour).padStart(2, "0")}:${minute}`;
}

export function combineDateAndTime(date: string, time: string) {
  parseTimeToMinutes(time);

  const value = new Date(`${date}T${time}:00`);

  if (Number.isNaN(value.getTime())) {
    throw new Error("Choose a valid booking date and time.");
  }

  return value;
}

export async function assertBookingFitsStaffSchedule({
  staffId,
  startTime,
  duration,
  excludingBookingId,
}: {
  staffId: number;
  startTime: Date;
  duration: SlotDuration;
  excludingBookingId?: number;
}) {
  const endTime = new Date(startTime.getTime() + duration * 60_000);
  const dayOfWeek = startTime.getDay();
  const startMinutes = startTime.getHours() * 60 + startTime.getMinutes();
  const endMinutes = startMinutes + duration;

  const workingHours = await prisma.workingHours.findFirst({
    where: { staffId, dayOfWeek },
  });

  if (!workingHours) {
    throw new Error("This staff member is not working on that day.");
  }

  const workStart = parseTimeToMinutes(workingHours.startTime);
  const workEnd = parseTimeToMinutes(workingHours.endTime);

  if (startMinutes < workStart || endMinutes > workEnd) {
    throw new Error("That slot is outside this staff member's working hours.");
  }

  const overlappingBooking = await prisma.booking.findFirst({
    where: {
      staffId,
      status: { not: "cancelled" },
      startTime: { lt: endTime },
      endTime: { gt: startTime },
      ...(excludingBookingId ? { id: { not: excludingBookingId } } : {}),
    },
  });

  if (overlappingBooking) {
    throw new Error("That staff member already has a booking in this slot.");
  }

  return endTime;
}
