import Link from "next/link";
import OtpForm from "@/app/verify/OtpForm";

type VerifyPageProps = {
  searchParams?: Promise<{
    phone?: string;
    mode?: string;
    demoCode?: string;
    error?: string;
    success?: string;
  }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const phone = params?.phone ?? "";
  const mode = params?.mode === "register" ? "register" : "login";
  const backPath = mode === "register" ? "/register" : "/login";
  const title = mode === "register" ? "Verify and create account" : "Verify login";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f3f7ef] px-4 py-10 text-stone-950">
      <section className="relative mx-auto max-w-md animate-[fadeIn_450ms_ease-out] rounded-md border border-[#dcebc8] bg-white p-6 shadow-sm">
        <div className="pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full bg-[#dcebc8]/70 blur-2xl" />
        <Link href={backPath} className="text-sm font-medium text-[#587b4b]">
          Change details
        </Link>
        <h1 className="mt-4 text-3xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Enter the six digit OTP code sent to {phone || "your phone number"}.
        </p>

        {params?.demoCode && (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Demo verification code: <strong>{params.demoCode}</strong>
            <br />
            This appears only when Twilio env variables are missing or demo mode is on.
          </div>
        )}

        {params?.error && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-800">
            {params.error}
          </p>
        )}

        {params?.success && (
          <p className="mt-4 rounded-md bg-[#f3f7ef] p-3 text-sm text-[#315c46]">
            {params.success}
          </p>
        )}

        <OtpForm mode={mode} phone={phone} />
      </section>
    </main>
  );
}
