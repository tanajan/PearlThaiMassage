import Link from "next/link";
import { requestLoginCode } from "@/app/actions";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams?: Promise<{ error?: string; phone?: string; success?: string }>;
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
  const phone = params?.phone ?? "";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <section className="relative mx-auto max-w-md animate-[fadeIn_450ms_ease-out] rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#dcebc8]/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-14 -left-16 h-32 w-32 rounded-full bg-[#b9d8b0]/60 blur-2xl" />
        <Link href="/" className="text-sm font-medium text-[#587b4b]">
          Back to website
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Welcome back</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Log in with your phone and password. We will text a short OTP code before
          opening your account.
        </p>

        {params?.error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </p>
        )}

        <form action={requestLoginCode} className="mt-6 grid gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">
            Phone number
            <input
              name="phone"
              type="text"
              required
              defaultValue={phone}
              className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none focus:border-[#587b4b]"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-[#315c46] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263f32]"
          >
            Continue
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-stone-600">
          New here?{" "}
          <Link href="/register" className="font-semibold text-[#315c46]">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
