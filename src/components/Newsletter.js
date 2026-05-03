"use client";

import SubscribeForm from "./SubscribeForm";
import Reveal from "./Reveal";

export default function Newsletter() {
  return (
    <section className="section-padding bg-brand-50" id="newsletter-section">
      <div className="container-custom">
        <Reveal className="max-w-xl mx-auto text-center">
          <span className="section-label">Newsletter</span>
          <h2 className="section-title">Join the Meglit Family</h2>
          <p className="text-ink-500 text-sm leading-relaxed mb-8">
            Be the first to know about new collections, exclusive offers, and
            styling tips. Get 10% off your first order when you subscribe.
          </p>
          <SubscribeForm variant="inline" source="newsletter-section" />
          <p className="text-[11px] text-ink-400 mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
