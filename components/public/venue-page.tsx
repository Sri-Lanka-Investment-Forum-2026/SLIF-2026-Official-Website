import { PublicPageTitle } from "@/components/public/page-title";

const hotelFinderUrl = "https://www.google.com/maps/search/hotels+near+Cinnamon+Life+Colombo/";

const venueFeatures = [
  { icon: "bi-people", label: "2,500 + Capacity" },
  { icon: "bi-wifi", label: "High-Speed WiFi" },
  { icon: "bi-cup-hot", label: "Catering Available" },
  { icon: "bi-universal-access", label: "Fully Accessible" },
] as const;

const travelOptions = [
  {
    icon: "bi-airplane",
    subtitle: "45 min drive",
    text: "Colombo Bandaranaike International Airport",
    title: "By Air",
  },
  {
    icon: "bi-car-front",
    subtitle: "500+ spaces",
    text: "Free parking available on-site",
    title: "By Car",
  },
] as const;

export function VenuePageContent() {
  return (
    <div className="venue-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <PublicPageTitle
          title="Venue"
          subtitle="Cinnamon Life Colombo"
          description="Located in: City of Dreams Sri Lanka - Integrated Resort, Casino & Entertainment"
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Venue" },
          ]}
          topPadding
        />

        <section id="venue-2" className="venue-2 section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row gy-5">
              <div className="col-lg-6">
                <div className="venue-card" data-aos="fade-right" data-aos-delay="100">
                  <div className="venue-image">
                    <img
                      src="https://media.srilankainvestmentforum.com/slifmedia/images/city-of-dreams.webp"
                      alt="Cinnamon Life Colombo"
                      className="img-fluid"
                    />
                    <div className="venue-badge">
                      <i className="bi bi-calendar-event" aria-hidden="true" />
                      March 30, 2026
                    </div>
                  </div>

                  <div className="venue-content">
                    <h3>Cinnamon Life Colombo</h3>
                    <div className="venue-address">
                      <i className="bi bi-geo-alt" />
                      <span>No 01 Justice Akbar Mawatha, Colombo 00200</span>
                    </div>

                    <p className="venue-description">
                      Located along the vibrant Beira Lake waterfront and near the famed Galle
                      Face Green, this flagship property blends contemporary design with local
                      cultural sophistication. Its striking architecture, one of Colombo&apos;s
                      newest landmarks, showcases panoramic views of the Indian Ocean and urban
                      skyline, offering guests a stunning backdrop for any event or stay.
                    </p>

                    <div className="venue-features">
                      {venueFeatures.map((feature) => (
                        <div key={feature.label} className="feature-item">
                          <i className={`bi ${feature.icon}`} />
                          <span>{feature.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="directions-section" data-aos="fade-left" data-aos-delay="200">
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.709384943983!2d79.8479589!3d6.925300600000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae2593dd3494367%3A0x661a9e702317a6c6!2sCinnamon%20Life%20at%20City%20of%20Dreams!5e0!3m2!1sen!2slk!4v1771915704815!5m2!1sen!2slk"
                      title="Map showing Cinnamon Life Colombo"
                      width="600"
                      height="450"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  <div className="travel-options">
                    <h4>Getting There</h4>

                    {travelOptions.map((option) => (
                      <div key={option.title} className="travel-item">
                        <div className="travel-icon">
                          <i className={`bi ${option.icon}`} />
                        </div>
                        <div className="travel-info">
                          <h5>{option.title}</h5>
                          <p>{option.text}</p>
                          <span className="travel-time">{option.subtitle}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="venue-actions">
                    <a
                      href="https://maps.app.goo.gl/dy3CngbxGR8b82ENA"
                      className="btn btn-primary"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-map" aria-hidden="true" />
                      Get Directions
                    </a>
                    <a
                      href={hotelFinderUrl}
                      className="btn btn-outline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-building" aria-hidden="true" />
                      Find Hotels
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
