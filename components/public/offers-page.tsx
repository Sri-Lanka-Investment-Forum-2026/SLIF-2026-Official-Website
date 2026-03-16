import { PublicPageTitle } from "@/components/public/page-title";

export function OffersPageContent() {
  return (
    <div className="venue-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <PublicPageTitle title="Exclusive Offers" topPadding />

        <section id="offers-flyer" className="section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="d-flex justify-content-center">
              <img
                src="https://media.srilankainvestmentforum.com/slifmedia/images/offers.jpg"
                alt="Sri Lanka Investment Forum 2026 Exclusive Global Investor Benefits"
                className="img-fluid shadow-sm"
                style={{ maxWidth: "900px", width: "100%", height: "auto" }}
              />
            </div>
          </div>
        </section>

        <section className="section offers-partner-section">
          <div className="container" data-aos="fade-up" data-aos-delay="150">
            <div className="section-title">
              <h2>Official Hospitality Partner</h2>
              <p>
                Walkers Tours is the official hospitality partner for Sri Lanka Investment Forum
                2026.
              </p>
            </div>

            <div className="offers-partner-card">
              <div className="offers-partner-media">
                <img
                  src="/assets/img/events/city-of-dreams.webp"
                  alt="City of Dreams Sri Lanka skyline"
                />
              </div>

              <div className="offers-partner-content">
                <span className="offers-partner-badge">Preferred Travel &amp; Stay Support</span>
                <img
                  src="/assets/img/walkers-tours-logo.webp"
                  alt="Walkers Tours"
                  className="offers-partner-logo"
                />
                <h3>Plan your visit with Walkers Tours</h3>
                <p>
                  Explore curated hospitality support for your SLIF 2026 trip, including
                  accommodation and travel arrangements through the forum&apos;s official
                  hospitality partner.
                </p>
                <a
                  href="https://slif2026.walkersevent.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="offers-partner-button"
                >
                  Visit Walkers Tours
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
