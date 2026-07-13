import Link from "next/link";
import { verifyPhoneCode } from "@/app/actions";

type VerifyPageProps = {
  searchParams?: Promise<{
    phone?: string;
    demoCode?: string;
    error?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const phone = params?.phone ?? "";

  return (
    <main className="min-h-screen bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <section className="mx-auto max-w-md rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
        <Link href="/login" className="text-sm font-medium text-[#587b4b]">
          Change phone number
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">Verify phone</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Enter the six digit code for {phone || "your phone number"}.
        </p>

        {params?.demoCode && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Demo verification code: <strong>{params.demoCode}</strong>
            <br />
            Later this code should be sent by SMS instead of shown here.
          </div>
        )}

        {params?.error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </p>
        )}

        <form action={verifyPhoneCode} className="mt-6 grid gap-4">
          <input type="hidden" name="phone" value={phone} />
          <label className="flex flex-col gap-2 text-sm font-medium">
            Verification code
            <input
              name="code"
              inputMode="numeric"
              required
              minLength={6}
              maxLength={6}
              className="rounded-md border border-stone-300 px-3 py-2 font-normal tracking-[0.4em] outline-none focus:border-[#587b4b]"
            />
          </label>
          <button
            type="submit"
            className="rounded-md bg-[#315c46] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#263f32]"
          >
            Verify and continue
          </button>
        </form>
      </section>
    </main>
  );
}
