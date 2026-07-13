"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  clearSession,
  createSession,
  createVerificationCode,
  hashSecret,
  isUserRole,
  normalizePhone,
  requireOwner,
} from "@/lib/auth";
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

function parseBookingStatus(value: FormDataEntryValue | null) {
  const status = cleanText(value);

  if (["coming", "completed", "cancelled"].includes(status)) {
    return status;
  }

  throw new Error("Choose a valid booking status.");
}

function ownerPhoneList() {
  return (process.env.OWNER_PHONE_NUMBERS ?? "")
    .split(",")
    .map(normalizePhone)
    .filter(Boolean);
}

async function roleForVerifiedPhone(phone: string) {
  const ownerCount = await prisma.user.count({ where: { role: "owner" } });

  if (ownerCount === 0 || ownerPhoneList().includes(phone)) {
    return "owner";
  }

  return "customer";
}

async function findMatchingStaffId(phone: string) {
  const staff = await prisma.staff.findMany({
    where: { phone: { not: null } },
    select: { id: true, phone: true },
  });
  const match = staff.find((person) => normalizePhone(person.phone ?? "") === phone);

  return match?.id ?? null;
}

export async function requestPhoneCode(formData: FormData) {
  const phone = normalizePhone(cleanText(formData.get("phone")));

  if (phone.length < 8) {
    redirectWithMessage("error", "Enter a valid phone number.", "/login");
  }

  const code = createVerificationCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.phoneVerificationCode.create({
    data: {
      phone,
      codeHash: hashSecret(code),
      expiresAt,
    },
  });

  // Demo mode: this code is shown on screen. Later this is where SMS sending plugs in.
  redirect(
    `/verify?phone=${encodeURIComponent(phone)}&demoCode=${encodeURIComponent(code)}`,
  );
}

export async function verifyPhoneCode(formData: FormData) {
  const phone = normalizePhone(cleanText(formData.get("phone")));
  const code = cleanText(formData.get("code"));
  let destination = "/book";

  try {
    const verification = await prisma.phoneVerificationCode.findFirst({
      where: {
        phone,
        codeHash: hashSecret(code),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!verification) {
      throw new Error("That verification code is invalid or expired.");
    }

    await prisma.phoneVerificationCode.update({
      where: { id: verification.id },
      data: { usedAt: new Date() },
    });

    const existingUser = await prisma.user.findUnique({ where: { phone } });
    const role = existingUser?.role ?? (await roleForVerifiedPhone(phone));
    const staffId = existingUser?.staffId ?? (await findMatchingStaffId(phone));
    const user = await prisma.user.upsert({
      where: { phone },
      update: { staffId },
      create: { phone, role, staffId },
    });

    await createSession(user.id);

    if (user.role === "owner") {
      destination = "/admin";
    } else if (user.role === "staff") {
      destination = "/staff-calendar";
    }
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not verify phone.",
      `/verify?phone=${encodeURIComponent(phone)}`,
    );
  }

  redirect(destination);
}

export async function logout() {
  await clearSession();
  redirect("/login");
}

export async function updateUserAccess(formData: FormData) {
  await requireOwner();
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const userId = toPositiveInteger(formData.get("userId"), "User");
    const role = cleanText(formData.get("role"));
    const staffIdValue = cleanText(formData.get("staffId"));
    const staffId = staffIdValue ? Number(staffIdValue) : null;

    if (!isUserRole(role)) {
      throw new Error("Choose a valid access level.");
    }

    if (staffId !== null && (!Number.isInteger(staffId) || staffId <= 0)) {
      throw new Error("Choose a valid staff profile.");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        role,
        staffId: role === "staff" ? staffId : null,
      },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update user access.",
      redirectTo,
    );
  }

  revalidatePath("/admin");
  redirectWithMessage("success", "User access updated.", redirectTo);
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

    await prisma.$transaction([
      prisma.booking.deleteMany({ where: { staffId } }),
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
  revalidatePath("/admin");
  revalidatePath("/admin-hours");
  revalidatePath("/staff-calendar");
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
        status: "coming",
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

export async function createCustomerBooking(formData: FormData) {
  const user = await import("@/lib/auth").then((mod) => mod.requireUser());
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const customer = cleanText(formData.get("customer"));
    const staffId = toPositiveInteger(formData.get("staffId"), "Staff");
    const serviceId = toPositiveInteger(formData.get("serviceId"), "Service");
    const startTime = parseDateAndHalfHour(formData);

    if (!customer) {
      throw new Error("Your name is required.");
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
    });

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { name: customer },
      }),
      prisma.booking.create({
        data: {
          customer,
          phone: user.phone,
          note: cleanOptionalText(formData.get("note")),
          staffId,
          serviceId,
          startTime,
          endTime,
          status: "coming",
        },
      }),
    ]);
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not create booking.",
      redirectTo,
    );
  }

  revalidatePath("/book");
  revalidatePath("/admin");
  revalidatePath("/admin-hours");
  revalidatePath("/staff-calendar");
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

export async function updateBookingStatus(formData: FormData) {
  const redirectTo = safeRedirectPath(formData.get("redirectTo"));

  try {
    const bookingId = toPositiveInteger(formData.get("bookingId"), "Booking");
    const status = parseBookingStatus(formData.get("status"));

    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });
  } catch (error) {
    redirectWithMessage(
      "error",
      error instanceof Error ? error.message : "Could not update booking status.",
      redirectTo,
    );
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin-hours");
  revalidatePath("/staff-calendar");
  redirectWithMessage("success", "Booking status updated.", redirectTo);
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
