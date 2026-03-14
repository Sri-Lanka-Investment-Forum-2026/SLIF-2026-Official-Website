import { PublicPageTitle } from "@/components/public/page-title";

const contactCards = [
  {
    href: "https://maps.app.goo.gl/mD2zE68o63o2hLQq6",
    icon: "bi-pin-map-fill",
    label: "Our Location",
    value: "Level 05, Echelon Square, WTC, Colombo",
  },
  {
    href: "mailto:info@boi.com",
    icon: "bi-envelope-open",
    label: "Email Us",
    value: "info@boi.com",
  },
  {
    href: "tel:+94112427291",
    icon: "bi-telephone-fill",
    label: "Call Us",
    value: "+94 11 242 7291",
  },
  {
    icon: "bi-clock-history",
    label: "Working Hours",
    value: "Monday-Friday: 9AM - 4PM",
  },
] as const;

const socialLinks = [
  {
    href: "https://web.facebook.com/people/BOI-Sri-Lanka/100071941136865/",
    icon: "bi-facebook",
    label: "Facebook",
  },
  {
    href: "https://x.com/Investin_SL",
    icon: "bi-twitter-x",
    label: "X",
  },
  {
    href: "#",
    icon: "bi-instagram",
    label: "Instagram",
  },
  {
    href: "https://www.linkedin.com/company/boisrilanka",
    icon: "bi-linkedin",
    label: "LinkedIn",
  },
  {
    href: "#",
    icon: "bi-youtube",
    label: "YouTube",
  },
] as const;

export function ContactPageContent() {
  return (
    <div className="contact-page">
      <main className="main">
        <PublicPageTitle
          title="Contact"
          description="For inquiries regarding participation, partnerships, sponsorship opportunities, or general information about the Sri Lanka Investment Forum 2026, please contact the organizing team."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Contact" },
          ]}
        />

        <section id="contact" className="contact section">
          <div className="container">
            <div className="contact-wrapper">
              <div className="contact-info-panel">
                <div className="contact-info-header">
                  <span className="contact-badge">SLIF 2026 Support</span>
                  <h3>Contact Information</h3>
                  <p>
                    For inquiries regarding participation, partnerships, sponsorship
                    opportunities, or general information about the Sri Lanka Investment Forum
                    2026, please contact the organizing team.
                  </p>
                </div>

                <div className="contact-info-cards">
                  {contactCards.map((card) => (
                    <div key={card.label} className="info-card">
                      <div className="icon-container">
                        <i className={`bi ${card.icon}`} />
                      </div>
                      <div className="card-content">
                        <h4>{card.label}</h4>
                        <p>
                          {"href" in card && card.href ? (
                            <a
                              href={card.href}
                              target={card.href.startsWith("http") ? "_blank" : undefined}
                              rel={card.href.startsWith("http") ? "noopener noreferrer" : undefined}
                            >
                              {card.value}
                            </a>
                          ) : (
                            card.value
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="social-links-panel">
                  <h5>Follow Us</h5>
                  <div className="social-icons">
                    {socialLinks.map((link) => (
                      <a
                        key={link.label}
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel={link.href.startsWith("http") ? "noreferrer" : undefined}
                        aria-label={link.label}
                      >
                        <i className={`bi ${link.icon}`} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="contact-form-panel">
                <div className="map-card">
                  <div className="map-card-header">
                    <h3>Visit Our Office</h3>
                    <p>Board of Investment of Sri Lanka, Echelon Square, Colombo.</p>
                  </div>
                  <div className="map-container">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.6475603082927!2d79.8409383736529!3d6.932660018276178!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ae259268c28e33d%3A0x7bffb6c3c9934fb5!2sBoard%20of%20investment%20of%20SriLanka!5e0!3m2!1sen!2slk!4v1771916380357!5m2!1sen!2slk"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
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
