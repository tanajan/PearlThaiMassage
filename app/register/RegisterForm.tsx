"use client";

import { useMemo, useState } from "react";
import { requestRegisterCode } from "@/app/actions";

function RuleIndicator({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`h-2.5 w-2.5 rounded-full ${passed ? "bg-[#4f8f57]" : "bg-stone-300"}`}
        aria-hidden="true"
      />
      <span className={passed ? "text-[#315c46]" : "text-stone-600"}>{label}</span>
    </li>
  );
}

export default function RegisterForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswordHelp, setShowPasswordHelp] = useState(false);

  const rules = useMemo(
    () => ({
      length: password.length >= 8,
      capital: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      match: password.length > 0 && password === confirmPassword,
    }),
    [confirmPassword, password],
  );

  return (
    <form action={requestRegisterCode} className="mt-6 grid gap-4">
      <label className="flex flex-col gap-2 text-sm font-medium">
        Username
        <input
          name="username"
          required
          minLength={2}
          placeholder="Your name"
          className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none transition focus:border-[#587b4b]"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm font-medium">
          Date of birth
          <input
            name="dob"
            type="date"
            required
            className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none transition focus:border-[#587b4b]"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">
          Phone number
          <input
            name="phone"
            type="tel"
            required
            placeholder="07356 259149"
            className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none transition focus:border-[#587b4b]"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="relative flex flex-col gap-2 text-sm font-medium">
          Password
          <input
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onBlur={() => setShowPasswordHelp(false)}
            onChange={(event) => setPassword(event.target.value)}
            onFocus={() => setShowPasswordHelp(true)}
            className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none transition focus:border-[#587b4b]"
          />
          <div
            className={`absolute left-0 top-full z-10 mt-2 w-full rounded-md border border-[#dcebc8] bg-white p-3 text-xs shadow-lg transition duration-200 sm:w-72 ${
              showPasswordHelp
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-1 opacity-0"
            }`}
          >
            <p className="mb-2 font-semibold text-stone-800">Password needs:</p>
            <ul className="grid gap-1.5">
              <RuleIndicator label="At least 8 characters" passed={rules.length} />
              <RuleIndicator label="At least 1 capital letter" passed={rules.capital} />
              <RuleIndicator label="At least 1 lowercase character" passed={rules.lowercase} />
            </ul>
          </div>
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">
          Confirm password
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="rounded-md border border-stone-300 px-3 py-2 font-normal outline-none transition focus:border-[#587b4b]"
          />
          <span
            className={`flex items-center gap-2 text-xs transition ${
              confirmPassword
                ? rules.match
                  ? "text-[#315c46]"
                  : "text-red-700"
                : "text-stone-500"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                confirmPassword && rules.match
                  ? "bg-[#4f8f57]"
                  : confirmPassword
                    ? "bg-red-500"
                    : "bg-stone-300"
              }`}
              aria-hidden="true"
            />
            {confirmPassword
              ? rules.match
                ? "Passwords match"
                : "Passwords do not match yet"
              : "Repeat your password"}
          </span>
        </label>
      </div>

      <button
        type="submit"
        className="rounded-md bg-[#315c46] px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#263f32]"
      >
        Send OTP to register
      </button>
    </form>
  );
}
