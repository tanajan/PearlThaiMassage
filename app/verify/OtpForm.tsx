"use client";

import { useEffect, useRef, useState } from "react";
import { resendOtpCode, verifyOtpCode } from "@/app/actions";

function formatTimer(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = String(totalSeconds % 60).padStart(2, "0");

  return `${minutes}:${seconds}`;
}

export default function OtpForm({
  mode,
  phone,
}: {
  mode: "login" | "register";
  phone: string;
}) {
  const [digits, setDigits] = useState(Array(6).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const code = digits.join("");

  function updateDigit(index: number, value: string) {
    const nextDigit = value.replace(/\D/g, "").slice(-1);
    const nextDigits = [...digits];
    nextDigits[index] = nextDigit;
    setDigits(nextDigits);

    if (nextDigit && index < inputsRef.current.length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(value: string) {
    const pastedDigits = value.replace(/\D/g, "").slice(0, 6).split("");

    if (pastedDigits.length === 0) {
      return;
    }

    const nextDigits = Array(6).fill("");
    pastedDigits.forEach((digit, index) => {
      nextDigits[index] = digit;
    });
    setDigits(nextDigits);
    inputsRef.current[Math.min(pastedDigits.length, 6) - 1]?.focus();
  }

  return (
    <>
      <form
        action={verifyOtpCode}
        className="mt-6 grid gap-4"
        onSubmit={() => setIsVerifying(true)}
      >
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="mode" value={mode} />
        <input type="hidden" name="code" value={code} />

        <fieldset className="grid gap-2">
          <legend className="text-sm font-medium">OTP code</legend>
          <div className="grid grid-cols-6 gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputsRef.current[index] = element;
                }}
                aria-label={`OTP digit ${index + 1}`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                className="h-12 rounded-md border border-stone-300 bg-white text-center text-xl font-semibold outline-none transition focus:border-[#587b4b] focus:ring-2 focus:ring-[#dcebc8]"
                inputMode="numeric"
                maxLength={1}
                required
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event.key)}
                onPaste={(event) => {
                  event.preventDefault();
                  handlePaste(event.clipboardData.getData("text"));
                }}
              />
            ))}
          </div>
        </fieldset>

        <button
          type="submit"
          disabled={code.length !== 6}
          className="rounded-md bg-[#315c46] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263f32] disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          Verify and continue
        </button>
      </form>

      <form action={resendOtpCode} className="mt-4">
        <input type="hidden" name="phone" value={phone} />
        <input type="hidden" name="mode" value={mode} />
        <button
          type="submit"
          disabled={secondsLeft > 0}
          className="w-full rounded-md border border-[#dcebc8] px-4 py-2 text-sm font-semibold text-[#315c46] transition hover:bg-[#f3f7ef] disabled:cursor-not-allowed disabled:text-stone-400"
        >
          {secondsLeft > 0
            ? `Resend OTP in ${formatTimer(secondsLeft)}`
            : "Resend OTP"}
        </button>
      </form>

      {isVerifying && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-stone-950/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm animate-[fadeIn_180ms_ease-out] rounded-md bg-white p-6 text-center shadow-xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#dcebc8] border-t-[#315c46]" />
            <h2 className="mt-4 text-lg font-semibold">Checking your code</h2>
            <p className="mt-2 text-sm text-stone-600">
              One moment, we are opening the right page for you.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
