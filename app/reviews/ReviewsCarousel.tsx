"use client";

import { useState } from "react";

const reviews = [
  {
    name: "Adam",
    text: "The service is great. Nok helped relieve the pain from my back professionally.",
  },
  {
    name: "Maya",
    text: "A calm and welcoming place. The massage was relaxing, careful, and exactly what I needed after a long week.",
  },
  {
    name: "James",
    text: "Friendly staff, clean rooms, and very skilled treatment. My shoulders felt much lighter afterwards.",
  },
];

export default function ReviewsCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeReview = reviews[activeIndex];

  function showPrevious() {
    setActiveIndex((index) => (index === 0 ? reviews.length - 1 : index - 1));
  }

  function showNext() {
    setActiveIndex((index) => (index === reviews.length - 1 ? 0 : index + 1));
  }

  return (
    <div className="mx-auto max-w-3xl">
      <article className="min-h-72 rounded-md bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="text-2xl text-[#d7a928]" aria-label="5 star review">
          ★★★★★
        </div>
        <blockquote className="mt-8 text-2xl font-medium leading-10 text-stone-900 sm:text-3xl sm:leading-[3rem]">
          “{activeReview.text}”
        </blockquote>
        <p className="mt-8 text-lg font-semibold text-[#315c46]">
          {activeReview.name}
        </p>
      </article>

      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={showPrevious}
          className="rounded-full border border-[#b7cf9f] bg-white px-4 py-2 text-sm font-semibold text-[#315c46] transition hover:bg-[#f3f7ef]"
        >
          Previous
        </button>
        <div className="flex gap-2" aria-label="Review slides">
          {reviews.map((review, index) => (
            <button
              key={review.name}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show review from ${review.name}`}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-[#315c46]" : "bg-[#b7cf9f]"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={showNext}
          className="rounded-full border border-[#b7cf9f] bg-white px-4 py-2 text-sm font-semibold text-[#315c46] transition hover:bg-[#f3f7ef]"
        >
          Next
        </button>
      </div>
    </div>
  );
}
