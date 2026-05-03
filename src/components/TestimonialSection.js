import Reveal from "./Reveal";

export default function TestimonialSection() {
  const testimonials = [
    {
      name: "Amara Okafor",
      role: "Fashion Enthusiast",
      image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200&q=80",
      text: "Meglit Couture's palazzo pants are absolutely divine! The quality of fabric and the way they drape is unmatched. I received so many compliments.",
      rating: 5,
    },
    {
      name: "Chidinma Eze",
      role: "Style Blogger",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
      text: "The branded fabrics from Meglit are always top-notch. The Ankara collection has such vibrant prints that don't fade. Truly premium quality!",
      rating: 5,
    },
    {
      name: "Folake Adeyemi",
      role: "Interior Designer",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80",
      text: "Shopping at Meglit Couture is always a delight. Fast delivery, beautiful packaging, and the palazzo sets are absolutely stunning on every body type.",
      rating: 5,
    },
  ];

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

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Reveal
              key={i}
              delay={i * 120}
              className="bg-white/[0.06] border border-white/[0.08] p-8 transition-all duration-300 hover:bg-white/[0.09] hover:border-accent-400/40 hover:-translate-y-1"
              id={`testimonial-${i}`}
            >
              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <svg key={j} className="w-3.5 h-3.5 text-accent-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
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
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
