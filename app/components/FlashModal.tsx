"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type FlashModalProps = {
  type: "success" | "error";
  message: string;
};

export function FlashModal({ type, message }: FlashModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isClosing, setIsClosing] = useState(false);
  const isError = type === "error";

  function close() {
    setIsClosing(true);
    window.setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("error");
      nextParams.delete("success");
      const query = nextParams.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
      router.refresh();
    }, 220);
  }

  return (
    <div
      className={`flash-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px] ${
        isClosing ? "flash-backdrop-out" : ""
      }`}
      role="presentation"
      onClick={close}
    >
      <div
        className={`flash-modal w-full max-w-sm rounded-md border bg-white p-6 text-center shadow-2xl ${
          isClosing ? "flash-modal-out" : ""
        } ${isError ? "border-red-200" : "border-emerald-200"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="flash-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold ${
            isError ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {isError ? "!" : "OK"}
        </div>
        <h2 id="flash-modal-title" className="mt-4 text-lg font-semibold">
          {isError ? "Something needs fixing" : "Saved"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">{message}</p>
        <button
          type="button"
          onClick={close}
          className="mt-5 inline-flex rounded-md bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2"
        >
          Close
        </button>
      </div>
    </div>
  );
}
