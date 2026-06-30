import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
  { href: "/gallery", label: "Gallery" },
  { href: "/reviews", label: "Reviews" },
];

export function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#f3f7ef] text-stone-900">
      <header className="sticky top-0 z-40 bg-[#315c46] text-white shadow-md">
        <nav className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              <img
                src="/images/logo.jpeg"
                alt="Pearl Thai Massage"
                className="h-14 w-14 rounded-md object-cover sm:h-16 sm:w-16"
              />
              <span className="truncate text-base font-semibold text-[#dcebc8] sm:text-lg">
                Pearl Thai Massage
              </span>
            </Link>

            <div className="hidden items-center gap-2 text-sm font-semibold lg:flex">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-2 text-[#dcebc8] transition hover:bg-white hover:text-[#263f32]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/admin"
                className="rounded-full bg-white/10 px-4 py-2 text-white ring-1 ring-white/30 transition hover:bg-white hover:text-[#263f32]"
              >
                Admin
              </Link>
              <Link
                href="/admin?section=booking"
                className="rounded-full bg-[#7fa66a] px-4 py-2 text-white transition hover:bg-[#dcebc8] hover:text-[#263f32]"
              >
                Book Now
              </Link>
            </div>

            <details className="group relative lg:hidden">
              <summary className="list-none rounded-md border border-white/30 px-3 py-2 text-sm font-semibold text-[#dcebc8] marker:hidden">
                Menu
              </summary>
              <div className="absolute right-0 mt-3 grid w-56 gap-1 rounded-md bg-white p-2 text-sm font-semibold text-[#263f32] shadow-xl">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-2 hover:bg-[#f3f7ef]"
                  >
                    {item.label}
                  </Link>
                ))}
                <Link href="/admin" className="rounded-md px-3 py-2 hover:bg-[#f3f7ef]">
                  Admin
                </Link>
                <Link
                  href="/admin?section=booking"
                  className="rounded-md bg-[#7fa66a] px-3 py-2 text-white hover:bg-[#315c46]"
                >
                  Book Now
                </Link>
              </div>
            </details>
          </div>
        </nav>
      </header>

      <main>{children}</main>

      <footer className="bg-[#263f32] px-4 py-8 text-center text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-3">
          <div>
            <h4 className="font-semibold">Contact</h4>
            <p className="mt-2 text-sm text-stone-200">
              38A Meriden Street, Birmingham B5 5LS
            </p>
            <p className="mt-1 text-sm text-stone-200">+44 7596 959873</p>
          </div>
          <div>
            <h4 className="font-semibold">Quick Links</h4>
            <div className="mt-2 flex flex-wrap justify-center gap-3 text-sm text-stone-200">
              <Link href="/about">About</Link>
              <Link href="/services">Services</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold">Social</h4>
            <div className="mt-2 flex justify-center gap-4 text-sm text-stone-200">
              <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
                Facebook
              </a>
              <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>
        <p className="mt-8 border-t border-white/15 pt-5 text-xs text-stone-300">
          Copyright 2026 Pearl Thai Massage. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
