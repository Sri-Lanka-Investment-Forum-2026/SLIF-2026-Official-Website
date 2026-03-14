import { PublicPageTitle } from "@/components/public/page-title";

export function OffersPageContent() {
  return (
    <div className="venue-page">
      <main className="main">
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
      </main>
    </div>
  );
}
