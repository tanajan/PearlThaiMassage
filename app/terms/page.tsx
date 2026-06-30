import { PublicLayout } from "@/app/components/PublicLayout";

export default function TermsPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-14 leading-7 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-semibold">Terms of Service</h1>
        <p className="mt-6">
          These demo terms outline common booking rules for a massage business.
          They should be checked and customised before the website is used live.
        </p>
        <h2 className="mt-8 text-2xl font-semibold">Booking & Cancellation</h2>
        <ul className="mt-3 list-disc pl-6">
          <li>Customers should book appointments in advance.</li>
          <li>Changes or cancellations should be made as early as possible.</li>
          <li>Late arrivals may reduce treatment time.</li>
        </ul>
        <h2 className="mt-8 text-2xl font-semibold">Payments & Refunds</h2>
        <p className="mt-3">
          Payment and deposit rules will be added when the online payment system is
          connected.
        </p>
        <h2 className="mt-8 text-2xl font-semibold">Conduct</h2>
        <ul className="mt-3 list-disc pl-6">
          <li>Customers must treat staff respectfully.</li>
          <li>Customers must wear underwear during the service. We may refuse service if not followed</li>
          <li>The business may refuse service for inappropriate behaviour.</li>
        </ul>
      </article>
    </PublicLayout>
  );
}
