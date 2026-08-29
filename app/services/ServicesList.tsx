"use client";

import { useEffect, useRef, useState } from "react";

type Service = {
  title: string;
  image?: string;
  subtitle?: string;
  description: string;
  prices: Array<{ duration: string; price: string }>;
};

export default function ServicesList({ services }: { services: Service[] }) {
  const [visibleServices, setVisibleServices] = useState<Set<string>>(new Set());
  const serviceRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const title = entry.target.getAttribute("data-service-title");

          if (title) {
            setVisibleServices((current) => new Set(current).add(title));
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.18 },
    );

    Object.values(serviceRefs.current).forEach((element) => {
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="mt-8 grid gap-6 sm:mt-10 lg:gap-8">
      {services.map((service, index) => {
        const isReversed = index % 2 === 1;
        const isVisible = visibleServices.has(service.title);

        return (
          <article
            key={service.title}
            ref={(element) => {
              serviceRefs.current[service.title] = element;
            }}
            data-service-title={service.title}
            className={`grid overflow-hidden rounded-md bg-white shadow-sm lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)] ${
              isReversed ? "lg:[&>img]:order-2" : ""
            }`}
          >
            {service.image ? (
              <img
                src={service.image}
                alt={service.title}
                className={`service-scroll-fade h-56 w-full bg-[#e7efe0] object-cover sm:h-72 lg:h-96 ${
                  isVisible ? "service-scroll-visible" : ""
                } ${isReversed ? "service-from-right" : "service-from-left"}`}
              />
            ) : (
              <div
                className={`service-scroll-fade flex h-56 w-full items-center justify-center bg-stone-200 text-center sm:h-72 lg:h-96 ${
                  isVisible ? "service-scroll-visible" : ""
                } ${isReversed ? "service-from-right" : "service-from-left"}`}
              >
                <p className="px-6 text-sm font-medium text-stone-500">
                  Service photo coming soon
                </p>
              </div>
            )}

            <div
              className={`service-scroll-fade flex flex-col justify-center p-5 sm:p-8 ${
                isVisible ? "service-scroll-visible" : ""
              } ${isReversed ? "service-from-left" : "service-from-right"}`}
            >
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
        );
      })}
    </div>
  );
}
