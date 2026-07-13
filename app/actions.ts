"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SERVICE_COLOUR, isServiceColour } from "@/lib/serviceColours";
import {
  DAYS,
  assertBookingFitsStaffSchedule,
  buildHalfHourTime,
  combineDateAndTime,
  isSlotDuration,
  parseTimeToMinutes,
} from "@/lib/services/bookingService";

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

function cleanOptionalText(value: FormDataEntryValue | null) {
  const text = cleanText(value);
  return text.length > 0 ? text : null;
}

function safeRedirectPath(value: FormDataEntryValue | null) {
  const path = cleanText(value);

  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/";
  }

  return path;
}

function redirectWithMessage(
  type: "success" | "error",
  message: string,
  path = "/",
): never {
  const separator = path.includes("?") ? "&" : "?";
  redirect(`${path}${separator}${type}=${encodeURIComponent(message)}`);
}

function toPositiveInteger(value: FormDataEntryValue | null, label: string) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${label} is required.`);
  }

  return parsed;
}

function getPositiveIntegerList(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0);
}

function parsePrice(value: FormDataEntryValue | null) {
  const parsed = Number(cleanText(value));

  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Service price must be a valid amount.");
  }

  return Number(parsed.toFixed(2));
}

function parseServiceColour(value: FormDataEntryValue | null) {
  const colour = cleanText(value);

  if (!colour) {
    return DEFAULT_SERVICE_COLOUR;
  }

  if (!isServiceColour(colour)) {
    throw new Error("Choose a valid service group colour.");
  }

  return colour;
}

function serviceVariantName(groupName: string, duration: number) {
  return `${groupName} ${duration} minutes`;
}

function parseDateAndHalfHour(formData: FormData) {
  const date = cleanText(formData.get("date"));
  const time = buildHalfHourTime(
    cleanText(formData.get("startHour")),
    cleanText(formData.get("startMinute")),
  );

  return combineDateAndTime(date, time);
}

function parseClockTime(value: FormDataEntryValue | null, label: string) {
  const time = cleanText(value);

  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`${label} must be a valid time.`);
  }

  const [hour, minute] = time.split(":").map(Number);

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error(`${label} must be a valid time.`);
  }

  return time;
}

async function assertGroupNameIsNotDuplicate(name: string, excludingId?: number) {
  const existingGroup = await prisma.serviceGroup.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      ...(excludingId ? { id: { not: excludingId } } : {}),
    },
  });

  if (existingGroup) {
    throw new Error("This service group already exists.");
  }
}

async function assertServiceVariantIsNotDuplicate({
  groupId,
  duration,
  price,
  excludingId,
}: {
  groupId: number;
  duration: number;
  price: number;
  excludingId?: number;
}) {
  const existingService = await prisma.service.findFirst({
    where: {
      groupId,
      duration,
      price,
      ...(excludingId ? { id: { not: excludingId } } : {}),
    },
  });

  if (existingService) {
    throw new Error("This duration and price already exists in this group.");
  }
}

export async function createStaff(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const name = cleanText(formData.get("name"));

    if (!name) {
      throw new Error("Staff name is required.");
    }

    await prisma.staff.create({
      data: {
        name,
        phone: cleanOptionalText(formData.get("phone")),
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not add staff member.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Staff member added.", redirectTo);
}

export async function deleteStaff(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const bookingCount = await prisma.booking.count({ where: { staffId } });

    if (bookingCount > 0) {
      throw new Error("This staff member has bookings, so they cannot be deleted.");
    }

    await prisma.$transaction([
      prisma.workingHours.deleteMany({ where: { staffId } }),
      prisma.staffServiceGroup.deleteMany({ where: { staffId } }),
      prisma.staff.delete({ where: { id: staffId } }),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not delete staff member.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Staff member deleted.", redirectTo);
}

export async function createServiceGroup(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const name = cleanText(formData.get("name"));
    const colour = parseServiceColour(formData.get("colour"));
    const staffIds = getPositiveIntegerList(formData, "staffIds");

    if (!name) {
      throw new Error("Service group name is required.");
    }

    await assertGroupNameIsNotDuplicate(name);

    await prisma.serviceGroup.create({
      data: {
        name,
        colour,
        staffServiceGroups: {
          create: staffIds.map((staffId) => ({ staffId })),
        },
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not add service group.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Service group added.", redirectTo);
}

export async function updateServiceGroup(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const groupId = toPositiveInteger(formData.get("groupId"), "Service group");
    const name = cleanText(formData.get("name"));
    const colour = parseServiceColour(formData.get("colour"));
    const staffIds = getPositiveIntegerList(formData, "staffIds");

    if (!name) {
      throw new Error("Service group name is required.");
    }

    await assertGroupNameIsNotDuplicate(name, groupId);

    const services = await prisma.service.findMany({
      where: { groupId },
      select: { id: true, duration: true },
    });

    await prisma.$transaction([
      prisma.serviceGroup.update({
        where: { id: groupId },
        data: { name, colour },
      }),
      ...services.map((service) =>
        prisma.service.update({
          where: { id: service.id },
          data: { name: serviceVariantName(name, service.duration) },
        }),
      ),
      prisma.staffServiceGroup.deleteMany({ where: { groupId } }),
      ...(staffIds.length > 0
        ? [
            prisma.staffServiceGroup.createMany({
              data: staffIds.map((staffId) => ({ staffId, groupId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update service group.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Service group updated.", redirectTo);
}

export async function deleteServiceGroup(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const groupId = toPositiveInteger(formData.get("groupId"), "Service group");
    const services = await prisma.service.findMany({
      where: { groupId },
      select: { id: true },
    });
    const serviceIds = services.map((service) => service.id);

    await prisma.$transaction([
      ...(serviceIds.length > 0
        ? [prisma.booking.deleteMany({ where: { serviceId: { in: serviceIds } } })]
        : []),
      prisma.service.deleteMany({ where: { groupId } }),
      prisma.staffServiceGroup.deleteMany({ where: { groupId } }),
      prisma.serviceGroup.delete({ where: { id: groupId } }),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not delete service group.",
      redirectTo,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin-hours");
  revalidatePath("/staff-calendar");
  redirectWithMessage("success", "Service group deleted.", redirectTo);
}

export async function createService(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const groupId = toPositiveInteger(formData.get("groupId"), "Service group");
    const duration = Number(formData.get("duration"));
    const price = parsePrice(formData.get("price"));

    if (!isSlotDuration(duration)) {
      throw new Error("Services must be 60, 90, or 120 minutes long.");
    }

    const group = await prisma.serviceGroup.findUnique({ where: { id: groupId } });

    if (!group) {
      throw new Error("Choose a valid service group.");
    }

    await assertServiceVariantIsNotDuplicate({ groupId, duration, price });

    await prisma.service.create({
      data: {
        groupId,
        name: serviceVariantName(group.name, duration),
        duration,
        price,
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not add service.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Service added.", redirectTo);
}

export async function updateService(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const serviceId = toPositiveInteger(formData.get("serviceId"), "Service");
    const duration = Number(formData.get("duration"));
    const price = parsePrice(formData.get("price"));

    if (!isSlotDuration(duration)) {
      throw new Error("Services must be 60, 90, or 120 minutes long.");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { group: true },
    });

    if (!service) {
      throw new Error("Choose a valid service.");
    }

    await assertServiceVariantIsNotDuplicate({
      groupId: service.groupId,
      duration,
      price,
      excludingId: serviceId,
    });

    await prisma.service.update({
      where: { id: serviceId },
      data: {
        duration,
        price,
        name: serviceVariantName(service.group.name, duration),
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update service.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Service updated.", redirectTo);
}

export async function deleteService(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const serviceId = toPositiveInteger(formData.get("serviceId"), "Service");

    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { serviceId } }),
      prisma.service.delete({ where: { id: serviceId } }),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not delete service.",
      redirectTo,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin-hours");
  revalidatePath("/staff-calendar");
  redirectWithMessage("success", "Service deleted.", redirectTo);
}

export async function updateStaffSchedule(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const rows = [];
    const groupIds = getPositiveIntegerList(formData, "groupIds");

    for (const dayName of DAYS) {
      const dayOfWeek = DAYS.indexOf(dayName);

      if (formData.get(`works-${dayOfWeek}`) !== "on") {
        continue;
      }

      const startTime = buildHalfHourTime(
        cleanText(formData.get(`startHour-${dayOfWeek}`)),
        cleanText(formData.get(`startMinute-${dayOfWeek}`)),
      );
      const endTime = buildHalfHourTime(
        cleanText(formData.get(`endHour-${dayOfWeek}`)),
        cleanText(formData.get(`endMinute-${dayOfWeek}`)),
      );
      const startMinutes = parseTimeToMinutes(startTime);
      const endMinutes = parseTimeToMinutes(endTime);

      if (endMinutes <= startMinutes) {
        throw new Error(`${dayName} end time must be after the start time.`);
      }

      rows.push({ staffId, dayOfWeek, startTime, endTime });
    }

    await prisma.$transaction([
      prisma.workingHours.deleteMany({ where: { staffId } }),
      ...(rows.length > 0 ? [prisma.workingHours.createMany({ data: rows })] : []),
      prisma.staffServiceGroup.deleteMany({ where: { staffId } }),
      ...(groupIds.length > 0
        ? [
            prisma.staffServiceGroup.createMany({
              data: groupIds.map((groupId) => ({ staffId, groupId })),
              skipDuplicates: true,
            }),
          ]
        : []),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update working hours.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Working hours updated.", redirectTo);
}

export async function updateShopHours(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const rows = DAYS.map((dayName, dayOfWeek) => {
      const isClosed = formData.get(`closed-${dayOfWeek}`) === "on";
      const openTime = parseClockTime(formData.get(`openTime-${dayOfWeek}`), `${dayName} open time`);
      const closeTime = parseClockTime(
        formData.get(`closeTime-${dayOfWeek}`),
        `${dayName} close time`,
      );

      if (!isClosed && parseTimeToMinutes(closeTime) <= parseTimeToMinutes(openTime)) {
        throw new Error(`${dayName} close time must be after the open time.`);
      }

      return {
        dayOfWeek,
        openTime,
        closeTime,
        isClosed,
        note: cleanOptionalText(formData.get(`note-${dayOfWeek}`)),
      };
    });

    await prisma.$transaction(
      rows.map((row) =>
        prisma.shopHours.upsert({
          where: { dayOfWeek: row.dayOfWeek },
          update: row,
          create: row,
        }),
      ),
    );
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update shop hours.",
      redirectTo,
    );
  }

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin");
  redirectWithMessage("success", "Shop hours updated.", redirectTo);
}

export async function createBooking(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const customer = cleanText(formData.get("customer"));
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const serviceId = toPositiveInteger(formData.get("serviceId"), "Service");
    const startTime = parseDateAndHalfHour(formData);

    if (!customer) {
      throw new Error("Customer name is required.");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        group: {
          include: {
            staffServiceGroups: {
              where: { staffId },
            },
          },
        },
      },
    });

    if (!service) {
      throw new Error("Choose a valid service.");
    }

    if (!isSlotDuration(service.duration)) {
      throw new Error("Bookings must use a 60, 90, or 120 minute service.");
    }

    if (service.group.staffServiceGroups.length === 0) {
      throw new Error("This staff member is not assigned to that service group.");
    }

    const endTime = await assertBookingFitsStaffSchedule({
      staffId,
      startTime,
      duration: service.duration,
    });

    await prisma.booking.create({
      data: {
        customer,
        phone: cleanOptionalText(formData.get("phone")),
        note: cleanOptionalText(formData.get("note")),
        staffId,
        serviceId,
        startTime,
        endTime,
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not create booking.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Booking created.", redirectTo);
}

export async function updateBooking(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const bookingId = toPositiveInteger(formData.get("bookingId"), "Booking");
    const customer = cleanText(formData.get("customer"));
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const serviceId = toPositiveInteger(formData.get("serviceId"), "Service");
    const startTime = parseDateAndHalfHour(formData);

    if (!customer) {
      throw new Error("Customer name is required.");
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        group: {
          include: {
            staffServiceGroups: {
              where: { staffId },
            },
          },
        },
      },
    });

    if (!service || !isSlotDuration(service.duration)) {
      throw new Error("Choose a valid service.");
    }

    if (service.group.staffServiceGroups.length === 0) {
      throw new Error("This staff member is not assigned to that service group.");
    }

    const endTime = await assertBookingFitsStaffSchedule({
      staffId,
      startTime,
      duration: service.duration,
      excludingBookingId: bookingId,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        customer,
        phone: cleanOptionalText(formData.get("phone")),
        note: cleanOptionalText(formData.get("note")),
        staffId,
        serviceId,
        startTime,
        endTime,
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update booking.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Booking updated.", redirectTo);
}

export async function moveBooking(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const bookingId = toPositiveInteger(formData.get("bookingId"), "Booking");
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const startTime = parseDateAndHalfHour(formData);
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { service: true },
    });

    if (!booking || !isSlotDuration(booking.service.duration)) {
      throw new Error("Choose a valid booking.");
    }

    const service = await prisma.service.findUnique({
      where: { id: booking.serviceId },
      include: {
        group: {
          include: {
            staffServiceGroups: {
              where: { staffId },
            },
          },
        },
      },
    });

    if (!service || service.group.staffServiceGroups.length === 0) {
      throw new Error("This staff member is not assigned to that service group.");
    }

    const endTime = await assertBookingFitsStaffSchedule({
      staffId,
      startTime,
      duration: booking.service.duration,
      excludingBookingId: bookingId,
    });

    await prisma.booking.update({
      where: { id: bookingId },
      data: { staffId, startTime, endTime },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not move booking.",
      redirectTo,
    );
  }

  revalidatePath("/");
  redirectWithMessage("success", "Booking moved.", redirectTo);
}
