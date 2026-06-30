import { PublicLayout } from "@/app/components/PublicLayout";

const reviewSources = [
  {
    image: "/images/19.jpg",
    icon: "/images/googlemaplogo.png",
    label: "Google Map",
    href: "https://maps.app.goo.gl/xjXQnDf5pJDNEaJm9",
  },
  {
    image: "/images/20.jpg",
    icon: "/images/booksyicon.png",
    label: "Booksy",
    href: "https://booksy.com/en-gb/dl/show-business/97016?utm_medium=c2c_referral",
  },
];

export default function ReviewsPage() {
  return (
    <PublicLayout>
      <section className="flex min-h-[34vh] items-center justify-center bg-[#dcebc8] px-4 py-12 text-center sm:min-h-[50vh] sm:py-16">
        <h1 className="rounded-md bg-white/30 px-5 py-4 text-3xl font-semibold shadow-sm sm:px-6 sm:text-4xl">
          What Our Customers Say
        </h1>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:gap-8 sm:px-6 sm:py-14 lg:px-8">
        {reviewSources.map((source, index) => (
          <article
            key={source.label}
            className={`grid gap-6 rounded-md bg-white p-5 shadow-sm md:grid-cols-2 ${
              index % 2 === 1 ? "md:[&>img]:order-2" : ""
            }`}
          >
            <img
              src={source.image}
              alt={`${source.label} review`}
              className="h-56 w-full rounded-md object-cover sm:h-72"
            />
            <div className="flex flex-col items-center justify-center text-center">
              <img
                src={source.icon}
                alt={`${source.label} icon`}
                className="max-h-20 max-w-48 object-contain"
              />
              <div className="mt-5 text-3xl font-bold sm:text-4xl">
                4.9 <span className="text-xl text-[#d7a928] sm:text-2xl">★★★★★</span>
              </div>
              <a
                href={source.href}
                target="_blank"
                rel="noreferrer"
                className="mt-5 rounded-md bg-[#315c46] px-5 py-3 text-center text-sm font-semibold text-white hover:bg-[#263f32]"
              >
                Read More Reviews on {source.label}
              </a>
            </div>
          </article>
        ))}
      </section>
    </PublicLayout>
  );
}
