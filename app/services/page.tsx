import { PublicLayout } from "@/app/components/PublicLayout";

const services = [
  {
    title: "Traditional Thai Deep Tissue",
    description:
      "A stronger massage designed to work deeper into tight muscles and release built-up tension.",
    image: "/images/service1.jpg",
  },
  {
    title: "Hot Oil Relaxing",
    description:
      "Warm oil and smooth flowing movements for a calming, relaxing treatment.",
    image: "/images/service2.jpg",
  },
  {
    title: "Foot Massage",
    description:
      "Focused care for tired feet and lower legs, ideal after standing, walking, or travelling.",
    image: "/images/service3.jpg",
  },
  {
    title: "Back, Neck & Shoulder",
    description:
      "Targeted massage for common tension areas around the shoulders, neck, and upper back.",
    image: "/images/service4.jpg",
  },
  {
    title: "Hot Stone",
    description:
      "Heated stones help soften muscle tension and bring a deeper sense of relaxation.",
    image: "/images/service5.jpg",
  },
  {
    title: "Holistic Massage",
    description:
      "A gentler treatment focused on comfort, relaxation, and overall wellbeing.",
    image: "/images/service6.jpg",
  },
  {
    title: "Couple Massage",
    description:
      "A shared treatment experience for two people in a calm and welcoming room.",
    image: "/images/service7.jpg",
  },
  {
    title: "Four Hands Massage",
    description:
      "Two therapists work together with coordinated movements for an immersive treatment.",
    image: "/images/service8.jpg",
  },
];

const reviews = [
  {
    text: "The staff were incredibly friendly and the shoulder, neck, and back massage was exactly what I needed.",
    author: "Trishna T.",
  },
  {
    text: "Beautiful ambience and relaxing massage. I slept like a baby when I got home.",
    author: "Modupe F.",
  },
];

export default function ServicesPage() {
  return (
    <PublicLayout>
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-semibold">Services</h1>
          <p className="mx-auto mt-3 max-w-2xl text-stone-600">
            A starting display page for the treatment list. Later we can connect
            this to the service groups in your admin system.
          </p>
        </div>

        <div className="mt-10 grid gap-10">
          {services.map((service, index) => (
            <article
              key={service.title}
              className={`grid overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>img]:order-2" : ""
              }`}
            >
              <img
                src={service.image}
                alt={service.title}
                className="h-72 w-full object-cover lg:h-full"
              />
              <div className="flex flex-col justify-center p-8 text-center">
                <h2 className="text-2xl font-semibold">{service.title}</h2>
                <p className="mt-4 leading-7 text-stone-600">{service.description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <blockquote
              key={review.author}
              className="rounded-md bg-[#f3f7ef] p-6 text-center shadow-sm"
            >
              <p className="italic text-stone-700">"{review.text}"</p>
              <footer className="mt-3 font-semibold text-stone-950">
                - {review.author}
              </footer>
            </blockquote>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
