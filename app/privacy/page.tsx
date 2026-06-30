import { PublicLayout } from "@/app/components/PublicLayout";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <article className="mx-auto max-w-3xl px-4 py-14 leading-7 sm:px-6 lg:px-8">
        <h1 className="text-center text-4xl font-semibold">Privacy Policy</h1>
        <p className="mt-6">
          This demo privacy policy explains the type of information a massage
          booking website may collect. It should be reviewed before real client
          deployment.
        </p>
        <h2 className="mt-8 text-2xl font-semibold">Information We Collect</h2>
        <ul className="mt-3 list-disc pl-6">
          <li>Name, phone number, and appointment details.</li>
          <li>Messages sent through contact or booking forms.</li>
          <li>Website usage information used to improve the service.</li>
        </ul>
        <h2 className="mt-8 text-2xl font-semibold">How We Use Information</h2>
        <ul className="mt-3 list-disc pl-6">
          <li>To manage bookings and provide massage services.</li>
          <li>To respond to customer questions.</li>
          <li>To improve the website and booking experience.</li>
        </ul>
        <h2 className="mt-8 text-2xl font-semibold">Contact</h2>
        <p className="mt-3">
          For privacy questions, contact Pearl Thai Massage directly before using
          this demo for live customers.
        </p>
      </article>
    </PublicLayout>
  );
}
