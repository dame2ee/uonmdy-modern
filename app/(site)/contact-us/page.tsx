import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import PageBanner from "@/components/PageBanner";

export const metadata: Metadata = {
  title: "Contact us - University of Nursing, Mandalay",
};

export default function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Get in touch"
        title="Contact us"
        crumbs={[{ label: "Contact us" }]}
      />

      <div className="uon-container grid gap-6 py-10 lg:grid-cols-[1fr_1.4fr]">
        <aside className="uon-card h-fit p-6">
          <h2 className="uon-section-title text-base">University of Nursing, Mandalay</h2>
          <p className="mt-4 text-[13.5px] leading-relaxed text-body">
            Mandalay, Myanmar
          </p>

          <dl className="mt-5 space-y-4 text-[13.5px]">
            <div>
              <dt className="font-semibold text-ink">Hot line</dt>
              <dd className="text-body">(+95) 02 4080405 ext - 120</dd>
            </div>
            <div>
              <dt className="font-semibold text-ink">Email</dt>
              <dd>
                <a href="mailto:uonadmin@uonmdy.edu.mm" className="text-brand hover:text-navy">
                  uonadmin@uonmdy.edu.mm
                </a>
              </dd>
            </div>
          </dl>
        </aside>

        <section className="uon-card p-6 sm:p-8">
          <h2 className="uon-section-title text-base">Send us a message</h2>
          <p className="mt-2 mb-6 text-[13px] text-muted">
            Fill in the form and the university office will reply by email.
          </p>
          <ContactForm />
        </section>
      </div>
    </>
  );
}
