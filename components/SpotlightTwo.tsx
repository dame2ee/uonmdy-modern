"use client";

import Image from "next/image";

export default function SpotlightTwo() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-navy-deep via-navy to-brand">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />

      <div className="uon-container relative grid gap-10 py-14 lg:grid-cols-3">
        {/* Newsletter */}
        <div>
          <h2 className="uon-section-title text-base text-white">Newsletter</h2>
          <p className="mt-3 text-[14px] text-white/70">
            Make sure you don&apos;t miss interesting happenings by joining our newsletter
            program.
          </p>
          <form
            className="mt-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="email"
              name="user[email]"
              placeholder="Your e-mail"
              defaultValue=""
              className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[14px] text-white outline-none transition-colors placeholder:text-white/50 focus:border-white/40 focus:bg-white/15"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gold px-5 py-3 text-[13px] font-bold text-navy-deep transition-colors hover:bg-gold-deep hover:text-white"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Contact us */}
        <div>
          <h2 className="uon-section-title text-base text-white">Contact us</h2>
          <div className="mt-4 flex items-start gap-4">
            <a
              href="/images/misc/qr.png"
              target="_blank"
              rel="noopener noreferrer"
              title="QR code for UONMDY web"
              className="shrink-0 rounded-xl bg-white p-1.5"
            >
              <Image
                src="/images/misc/qr.png"
                alt="QR code for UONMDY web"
                width={92}
                height={92}
                className="h-[92px] w-[92px]"
              />
            </a>
            <ul className="space-y-2 text-[14px] text-white/70">
              <li className="font-semibold text-white">University of Nursing, Mandalay</li>
              <li>
                <strong className="font-semibold text-white">Hot line:</strong> (+95) 02 4080405
                ext - 120
              </li>
              <li>
                <strong className="font-semibold text-white">Email:</strong>{" "}
                <a
                  href="mailto:uonadmin@uonmdy.edu.mm"
                  className="text-white underline decoration-white/30 underline-offset-4 transition-colors hover:decoration-white"
                >
                  uonadmin@uonmdy.edu.mm
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Connect with us */}
        <div>
          <h2 className="uon-section-title text-base text-white">Connect with us</h2>
          <p className="mt-3 text-[14px] text-white/70">
            We&apos;re on social networks.
            <br />
            Follow us &amp; get in touch.
          </p>
          <a
            href="https://www.facebook.com/University-of-Nursing-Mandalay-522220597832426/"
            target="_blank"
            rel="noopener noreferrer"
            title="UonMdy Facebook"
            className="mt-5 inline-flex items-center gap-2.5 rounded-full bg-white px-5 py-2.5 text-[13px] font-bold text-navy transition-colors hover:bg-white/90"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
              <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5H17V4.6c-.29-.04-1.3-.12-2.47-.12-2.44 0-4.11 1.49-4.11 4.22v2.2H7.7V14h2.72v8h3.08Z" />
            </svg>
            Follow us on Facebook
          </a>
        </div>
      </div>
    </section>
  );
}
