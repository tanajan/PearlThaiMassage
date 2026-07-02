import { PublicLayout } from "@/app/components/PublicLayout";

const standardPrices = [
  { duration: "60 min", price: "£60" },
  { duration: "90 min", price: "£85" },
  { duration: "120 min", price: "£110" },
];

const sportPrices = [
  { duration: "60 min", price: "£65" },
  { duration: "90 min", price: "£95" },
  { duration: "120 min", price: "£125" },
];

const services = [
  {
    title: "Thai Massage",
    description:
      "Traditional Thai massage using firm pressure, assisted stretching, and rhythmic movements to ease tension and improve flexibility.",
    prices: standardPrices,
  },
  {
    title: "Thai Massage Mix Oil Massage",
    description:
      "A balanced treatment combining Thai massage techniques with oil massage for deep relief while keeping the session smooth and relaxing.",
    prices: standardPrices,
  },
  {
    title: "Aroma Massage",
    subtitle: "Soft and relaxing massage",
    description:
      "A gentle, calming massage using flowing movements to help relax the body, reduce stress, and create a peaceful feeling.",
    prices: standardPrices,
  },
  {
    title: "Sport Massage",
    description:
      "A focused massage for active bodies, tight muscles, and recovery support, using stronger pressure where needed.",
    prices: sportPrices,
  },
  {
    title: "Back and Shoulder Massage",
    description:
      "Targeted massage for the back, neck, and shoulders to help release common tension from work, posture, and daily stress.",
    prices: standardPrices,
  },
  {
    title: "Foot Massage",
    description:
      "A relaxing treatment for tired feet and lower legs, helping improve comfort after standing, walking, or long days.",
    prices: standardPrices,
  },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold sm:text-4xl">Services</h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">
            Choose from traditional Thai massage, relaxing oil treatments, sports
            massage, and focused back, shoulder, or foot treatments.
          </p>
        </div>

        <div className="mt-8 grid gap-6 sm:mt-10 lg:gap-8">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`grid overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)] ${
                index % 2 === 1 ? "lg:[&>div:first-child]:order-2" : ""
              }`}
            >
              <div className="flex min-h-56 items-center justify-center bg-[#e7efe0] p-6 text-center sm:min-h-72">
                <div>
                  <div className="mx-auto h-16 w-16 rounded-full border border-[#b7cf9f] bg-[#f3f7ef]" />
                  <p className="mt-4 text-sm font-medium text-[#587b4b]">
                    Service photo coming soon
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-center p-5 sm:p-8">
                <div className="text-center lg:text-left">
                  <h2 className="text-xl font-semibold sm:text-2xl">
                    {service.title}
                  </h2>
                  {service.subtitle && (
                    <p className="mt-1 text-sm font-medium text-[#587b4b]">
                      {service.subtitle}
                    </p>
                  )}
                  <p className="mt-4 leading-7 text-stone-600">
                    {service.description}
                  </p>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {service.prices.map((price) => (
                    <div
                      key={`${service.title}-${price.duration}`}
                      className="rounded-md border border-[#dcebc8] bg-[#f3f7ef] p-4 text-center"
                    >
                      <div className="text-sm font-medium text-stone-600">
                        {price.duration}
                      </div>
                      <div className="mt-1 text-2xl font-semibold text-[#315c46]">
                        {price.price}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
