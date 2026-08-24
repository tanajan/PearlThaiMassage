import Link from "next/link";
import RegisterForm from "@/app/register/RegisterForm";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

type RegisterPageProps = {
  searchParams?: Promise<{ error?: string; success?: string }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
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
    <main className="min-h-screen overflow-hidden bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <section className="relative mx-auto max-w-xl animate-[fadeIn_450ms_ease-out] rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-20 top-10 h-40 w-40 rounded-full bg-[#cfe7c8]/70 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-14 h-44 w-44 rounded-full bg-[#9fc49b]/45 blur-2xl" />

        <div className="relative">
          <Link href="/" className="text-sm font-medium text-[#587b4b]">
            Back to website
          </Link>
          <h1 className="mt-4 text-3xl font-semibold">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            A quick account keeps bookings tidy and helps us protect the diary with
            phone verification.
          </p>

          {params?.error && (
            <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
              {params.error}
            </p>
          )}

          <RegisterForm />

          <p className="mt-5 text-center text-sm text-stone-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#315c46]">
              Log in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
