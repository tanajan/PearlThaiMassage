import { PublicLayout } from "@/app/components/PublicLayout";
import ServicesList from "@/app/services/ServicesList";

const standardPrices = [
  { duration: "60 min", price: "£60" },
  { duration: "90 min", price: "£90" },
  { duration: "120 min", price: "£120" },
];

const sportPrices = [
  { duration: "60 min", price: "£70" },
  { duration: "90 min", price: "£90" },
  { duration: "120 min", price: "£120" },
];

const singleSixtyFivePrice = [{ duration: "60 min", price: "£65" }];

const hotStonePrices = [{ duration: "60 min", price: "£60" }];

const waxingPrices = [
  { duration: "Full Arms Waxing - 10 min", price: "£20" },
  { duration: "Hollywood Waxing - 15 min", price: "£45" },
  { duration: "Brazilian Waxing - 15 min", price: "£40" },
  { duration: "Underarm Waxing - 15 min", price: "£20" },
  { duration: "Bikini Line Waxing - 15 min", price: "£40" },
];

const services = [
  {
    title: "Thai Massage",
    image: "/images/service1.jpg",
    description:
      "Traditional Thai massage using firm pressure, assisted stretching, and rhythmic movements to ease tension and improve flexibility.",
    prices: standardPrices,
  },
  {
    title: "Thai Massage Mix Oil Massage",
    image: "/images/service2.jpg",
    description:
      "A balanced treatment combining Thai massage techniques with oil massage for deep relief while keeping the session smooth and relaxing.",
    prices: standardPrices,
  },
  {
    title: "Aroma Massage",
    image: "/images/service3.jpg",
    subtitle: "Soft and relaxing massage",
    description:
      "A gentle, calming massage using flowing movements to help relax the body, reduce stress, and create a peaceful feeling.",
    prices: standardPrices,
  },
  {
    title: "Sport Massage",
    image: "/images/service4.jpg",
    description:
      "A focused massage for active bodies, tight muscles, and recovery support, using stronger pressure where needed.",
    prices: sportPrices,
  },
  {
    title: "Back and Shoulder Massage",
    image: "/images/service5.jpg",
    description:
      "Targeted massage for the back, neck, and shoulders to help release common tension from work, posture, and daily stress.",
    prices: standardPrices,
  },
  {
    title: "Foot Massage",
    image: "/images/service6.jpg",
    description:
      "A relaxing treatment for tired feet and lower legs, helping improve comfort after standing, walking, or long days.",
    prices: standardPrices,
  },
  {
    title: "Home Massage",
    image: "/images/service7.jpg",
    description:
      "Enjoy a massage at your own location. Choose this option when booking and provide the address so the team can arrange the visit.",
    prices: standardPrices,
  },
  {
    title: "Pregnancy Massage",
    description:
      "A gentle, supportive massage designed for comfort during pregnancy, helping ease tension and encourage relaxation.",
    prices: singleSixtyFivePrice,
  },
  {
    title: "Lymphatic Massage",
    description:
      "A light, rhythmic treatment that supports relaxation and encourages healthy lymphatic flow.",
    prices: singleSixtyFivePrice,
  },
  {
    title: "Hot Stone Massage",
    description:
      "A warming massage using smooth heated stones to soften muscle tension and create deep relaxation.",
    prices: hotStonePrices,
  },
  {
    title: "Waxing",
    description:
      "A selection of professional waxing treatments, including arms, underarms, bikini line, Brazilian, and Hollywood waxing.",
    prices: waxingPrices,
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
            massage, specialist treatments, and waxing services.
          </p>
        </div>

        <ServicesList services={services} />
      </section>
    </PublicLayout>
  );
}
