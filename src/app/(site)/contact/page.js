export const metadata = {
  title: "Contact Us | Meglit Couture",
  description: "Get in touch with Meglit Couture. We'd love to hear from you.",
};

import ContactForm from "@/components/ContactForm";

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-950 py-16 md:py-20" id="contact-hero">
        <div className="container-custom text-center">
          <span className="text-accent-400 text-xs font-semibold tracking-[0.25em] uppercase">
            Get in Touch
          </span>
          <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mt-3">
            Contact Us
          </h1>
        </div>
      </section>

      <section className="section-padding bg-brand-50" id="contact-form-section">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="space-y-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-brand-950 mb-4">
                  We&apos;d Love to Hear From You
                </h2>
                <p className="text-ink-500 text-sm leading-relaxed">
                  Have a question about our products, need help with an order, or want styling advice?
                  Our team is here to help.
                </p>
              </div>

              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  ),
                  title: "Visit Us",
                  lines: ["No. 10 Lawrence Ejeku Street", "Rumuodomaya, Port Harcourt", "Rivers State, Nigeria"],
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                  title: "Email Us",
                  lines: ["info@meglitcouture.com", "support@meglitcouture.com"],
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  ),
                  title: "Call Us",
                  lines: ["+234 800 MEGLIT", "Mon-Sat, 9am - 6pm"],
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4" id={`contact-info-${i}`}>
                  <div className="w-10 h-10 bg-brand-100 text-brand-700 flex items-center justify-center flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-ink-800 text-sm mb-1">{item.title}</h3>
                    {item.lines.map((line, j) => (
                      <p key={j} className="text-xs text-ink-500">{line}</p>
                    ))}
                  </div>
                </div>
              ))}

              {/* Social */}
              <div>
                <h3 className="font-medium text-ink-800 text-sm mb-3">Follow Us</h3>
                <div className="flex gap-2">
                  {["Instagram", "Facebook", "Twitter", "TikTok"].map((s) => (
                    <a key={s} href="#" className="px-3 py-2 bg-brand-100 text-brand-700 text-xs font-medium hover:bg-brand-950 hover:text-white transition-colors">
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-brand-100 p-6 md:p-8" id="contact-form">
                <h2 className="font-heading text-xl font-bold text-brand-950 mb-6">Send Us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="mt-12" id="contact-map">
            <h2 className="font-heading text-xl font-bold text-brand-950 mb-4">Find Us</h2>
            <div className="bg-white border border-brand-100 overflow-hidden">
              <iframe
                title="Meglit Couture location"
                src="https://www.google.com/maps?q=No.%2010%20Lawrence%20Ejeku%20Street%2C%20Rumuodomaya%2C%20Port%20Harcourt&output=embed"
                width="100%"
                height="360"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="px-4 py-3 border-t border-brand-100 flex items-center justify-between text-xs">
                <span className="text-ink-600">No. 10 Lawrence Ejeku Street, Rumuodomaya, Port Harcourt</span>
                <a
                  href="https://www.google.com/maps/dir/?api=1&destination=No.%2010%20Lawrence%20Ejeku%20Street%2C%20Rumuodomaya%2C%20Port%20Harcourt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="uppercase tracking-[0.15em] text-brand-950 hover:text-accent-600 font-medium"
                >
                  Get directions
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
