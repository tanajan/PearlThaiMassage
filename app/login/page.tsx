import Link from "next/link";
import { requestPhoneCode } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user?.role === "owner") {
    redirect("/admin");
  }

  if (user?.role === "staff") {
    redirect("/staff-calendar");
  }

  if (user?.role === "customer") {
    redirect("/book");
  }

  const params = await searchParams;

  return (
    <main className="min-h-screen bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <section className="mx-auto max-w-md rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
        <Link href="/" className="text-sm font-medium text-[#587b4b]">
          Back to website
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Login or sign up</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Use your phone number to access the right area. Owners see the dashboard,
          staff see their own calendar, and customers can book.
        </p>

        {params?.error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </p>
        )}

        <form action={requestPhoneCode} className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Phone number
            <input
              name="phone"
              type="tel"
              required
              placeholder="+44..."
              className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-[#315c46] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263f32]"
          >
            Send verification code
          </button>
        </form>
      </section>
    </main>
  );
}
