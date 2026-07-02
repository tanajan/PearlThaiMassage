import { prisma } from "@/lib/prisma";
import { DAYS } from "@/lib/services/bookingService";

export type ShopHourRow = {
  dayOfWeek: number;
  dayName: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  note: string | null;
};

const defaultHours: ShopHourRow[] = DAYS.map((dayName, dayOfWeek) => ({
  dayOfWeek,
  dayName,
  openTime: "09:00",
  closeTime: dayOfWeek === 0 ? "18:00" : "19:00",
  isClosed: false,
  note: null,
}));

export function getDefaultShopHours() {
  return defaultHours;
}

export async function getShopHours() {
  try {
    const savedHours = await prisma.shopHours.findMany({
      orderBy: { dayOfWeek: "asc" },
    });

    if (savedHours.length === 0) {
      return defaultHours;
    }

    const savedByDay = new Map(savedHours.map((row) => [row.dayOfWeek, row]));

    return defaultHours.map((fallback) => {
      const saved = savedByDay.get(fallback.dayOfWeek);

      if (!saved) {
        return fallback;
      }

      return {
        dayOfWeek: saved.dayOfWeek,
        dayName: DAYS[saved.dayOfWeek] ?? fallback.dayName,
        openTime: saved.openTime,
        closeTime: saved.closeTime,
        isClosed: saved.isClosed,
        note: saved.note,
      };
    });
  } catch (error) {
    console.error("Could not load shop hours", error);
    return defaultHours;
  }
}
