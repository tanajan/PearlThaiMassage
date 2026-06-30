"use client";

import { useState } from "react";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  className: string;
  confirmTitle: string;
  confirmMessage: string;
  confirmAction?: string;
  disabled?: boolean;
  formId?: string;
};

export function ConfirmSubmitButton({
  children,
  className,
  confirmTitle,
  confirmMessage,
  confirmAction = "Confirm",
  disabled = false,
  formId,
}: ConfirmSubmitButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  function open() {
    if (!disabled) {
      setIsOpen(true);
    }
  }

  function close() {
    setIsClosing(true);
    window.setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 180);
  }

  function submit(event: React.MouseEvent<HTMLButtonElement>) {
    const fallbackForm = event.currentTarget.closest("form");
    const targetForm = formId
      ? document.getElementById(formId)
      : fallbackForm;

    if (targetForm instanceof HTMLFormElement) {
      targetForm.requestSubmit();
    }
  }

  return (
    <>
      <button type="button" disabled={disabled} onClick={open} className={className}>
        {children}
      </button>

      {isOpen && (
        <div
          className={`flash-backdrop fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 backdrop-blur-[2px] ${
            isClosing ? "flash-backdrop-out" : ""
          }`}
          role="presentation"
          onClick={close}
        >
          <div
            className={`flash-modal w-full max-w-sm rounded-md border border-stone-200 bg-white p-6 text-center shadow-2xl ${
              isClosing ? "flash-modal-out" : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-submit-title"
            onClick={(modalEvent) => modalEvent.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-base font-semibold text-amber-800">
              ?
            </div>
            <h2 id="confirm-submit-title" className="mt-4 text-lg font-semibold">
              {confirmTitle}
            </h2>
            <p className="mt-2 text-sm leading-6 text-stone-600">
              {confirmMessage}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={close}
                className="rounded-md border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-800"
              >
                {confirmAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
