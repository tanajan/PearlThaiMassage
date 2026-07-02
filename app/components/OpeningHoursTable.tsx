import type { ShopHourRow } from "@/lib/shopHours";

export function OpeningHoursTable({ hours }: { hours: ShopHourRow[] }) {
  return (
    <div className="overflow-hidden rounded-md border border-[#dcebc8]">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#f3f7ef] text-xs uppercase tracking-[0.12em] text-[#587b4b]">
          <tr>
            <th className="px-3 py-3">Day</th>
            <th className="px-3 py-3">Hours</th>
            <th className="px-3 py-3">Note</th>
          </tr>
        </thead>
        <tbody>
          {hours.map((row) => (
            <tr key={row.dayOfWeek} className="border-t border-[#dcebc8]">
              <td className="px-3 py-3 font-medium text-stone-950">{row.dayName}</td>
              <td className="px-3 py-3 text-stone-700">
                {row.isClosed ? "Closed" : `${row.openTime} - ${row.closeTime}`}
              </td>
              <td className="px-3 py-3 text-stone-600">
                {row.note ?? (row.isClosed ? "Closed today" : "-")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
