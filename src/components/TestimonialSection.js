"use client";
import { useState, useEffect, useCallback } from "react";
import Reveal from "./Reveal";

const TESTIMONIALS = [
  {
    name: "Amara Okafor",
    role: "Fashion Enthusiast",
    image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
    text: "Meglit Couture's palazzo pants are absolutely divine! The quality of fabric and the way they drape is unmatched. I received so many compliments at every event.",
    rating: 5,
  },
  {
    name: "Chidinma Eze",
    role: "Style Blogger",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    text: "The branded fabrics from Meglit are always top-notch. The Ankara collection has such vibrant prints that don't fade. Truly premium quality I keep coming back for!",
    rating: 5,
  },
  {
    name: "Folake Adeyemi",
    role: "Interior Designer",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
    text: "Shopping at Meglit Couture is always a delight. Fast delivery, beautiful packaging, and the palazzo sets are absolutely stunning on every body type.",
    rating: 5,
  },
  {
    name: "Ngozi Nwosu",
    role: "Corporate Executive",
    image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=200&q=80",
    text: "The wigs from Meglit are incredibly natural-looking. My HD lace frontal wig arrived perfectly packaged and the customer service was prompt and professional.",
    rating: 5,
  },
  {
    name: "Adaeze Obi",
    role: "Wedding Planner",
    image: "https://images.unsplash.com/photo-1502323777036-f29e3972d82f?w=200&q=80",
    text: "I ordered the bridal jewelry set for my own wedding and it was breathtaking. Every piece looked luxurious and I got endless compliments throughout the day.",
    rating: 5,
  },
  {
    name: "Temi Bankole",
    role: "Fashion Stylist",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    text: "As a stylist, quality is non-negotiable. Meglit consistently delivers premium bags and shoes that photograph beautifully and hold up after repeated use. My go-to store!",
    rating: 5,
  },
];

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

export default function TestimonialSection() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(true);
  const [perSlide, setPerSlide] = useState(3);

  useEffect(() => {
    const update = () => setPerSlide(window.innerWidth < 768 ? 1 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => { setCurrent(0); }, [perSlide]);

  const totalSlides = Math.ceil(TESTIMONIALS.length / perSlide);

  const goTo = useCallback((idx) => {
    setVisible(false);
    setTimeout(() => {
      setCurrent(idx);
      setVisible(true);
    }, 220);
  }, []);

  const next = useCallback(() => goTo((current + 1) % totalSlides), [current, goTo, totalSlides]);
  const prev = () => goTo((current - 1 + totalSlides) % totalSlides);

  useEffect(() => {
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [next]);

  const slide = TESTIMONIALS.slice(current * perSlide, current * perSlide + perSlide);

  return (
    <section className="section-padding bg-brand-950" id="testimonials-section">
      <div className="container-custom">
        {/* Header */}
        <Reveal className="text-center mb-14">
          <span className="text-accent-400 text-xs font-semibold tracking-[0.25em] uppercase">
            Testimonials
          </span>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mt-3">
            What Our Clients Say
          </h2>
          <div className="w-12 h-[2px] bg-accent-500 mx-auto mt-4" />
        </Reveal>

        {/* Carousel */}
        <div className="relative">
          {/* Cards */}
          <div
            className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-200 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          >
            {slide.map((t, i) => (
              <div
                key={`${current}-${i}`}
                className="bg-white/[0.06] border border-white/[0.08] p-8 transition-all duration-300 hover:bg-white/[0.09] hover:border-accent-400/40 hover:-translate-y-1"
                id={`testimonial-${current * PER_SLIDE + i}`}
              >
                {/* Stars */}
                <div className="flex gap-1 mb-5">
                  {[...Array(t.rating)].map((_, j) => <StarIcon key={j} />)}
                </div>

                {/* Quote */}
                <p className="text-brand-200 text-sm leading-relaxed mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-5 border-t border-white/[0.08]">
                  <img
                    src={t.image}
                    alt={t.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-white font-medium text-sm">{t.name}</p>
                    <p className="text-brand-400 text-xs">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-5 mt-10">
            {/* Prev */}
            <button
              onClick={prev}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-accent-400 hover:text-accent-400 transition-colors"
              aria-label="Previous"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {[...Array(totalSlides)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === current
                      ? "w-6 h-2 bg-accent-400"
                      : "w-2 h-2 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Next */}
            <button
              onClick={next}
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:border-accent-400 hover:text-accent-400 transition-colors"
              aria-label="Next"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
