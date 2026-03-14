import { CountdownTimer } from "@/components/public/countdown-timer";
import { getSpeakerContent } from "@/lib/content";

const featureCards = [
  {
    delay: "200",
    description:
      "Explore investment-ready projects and high-growth sectors aligned with Sri Lanka national development priorities",
    icon: "bi-lightbulb",
    title: "Investment Opportunities",
  },
  {
    delay: "300",
    description:
      "Engage directly with policymakers, regulators, and national leaders shaping Sri Lanka investment landscape",
    icon: "bi-trophy",
    title: "Policy & Leadership Dialogue",
  },
  {
    delay: "400",
    description:
      "Connect with global investors, business leaders, development partners, and decision-makers through curated networking sessions",
    icon: "bi-rocket-takeoff",
    title: "Strategic Networking",
  },
  {
    delay: "500",
    description:
      "Gain insights into Sri Lanka economic outlook, sector trends, incentives, and reforms driving investor confidence",
    icon: "bi-graph-up-arrow",
    title: "Market Intelligence",
  },
  {
    delay: "600",
    description:
      "Discover opportunities for collaboration through public-private partnerships that support sustainable and inclusive growth",
    icon: "bi-puzzle",
    title: "Public-Private Partnerships",
  },
  {
    delay: "700",
    description:
      "Join an international platform bringing together domestic and foreign investors committed to Sri Lanka long-term growth",
    icon: "bi-globe2",
    title: "Global Investor Community",
  },
] as const;

type ProgrammeItem = {
  bullets?: string[];
  icon: string;
  title: string;
};

const programmeItems: ProgrammeItem[] = [
  {
    icon: "bi-person-check",
    title: "Registration",
  },
  {
    icon: "bi-mic",
    title: "Inaugural Session",
  },
  {
    icon: "bi-graph-up",
    title: "Navigating Sri Lanka's Economic Recovery",
  },
  {
    icon: "bi-building",
    title: "Sri Lanka's Investment Eco System",
  },
  {
    bullets: [
      "Renewable Energy Development Landscape",
      "Investing in Green Transition",
      "Green Finance Instruments",
    ],
    icon: "bi-leaf",
    title: "Shaping the Green Future",
  },
  {
    icon: "bi-chat-dots",
    title: "EU - SL Investor Dialogue (Closed Door Event)",
  },
  {
    icon: "bi-people",
    title: "Deal Matching and B2B Connect",
  },
];

type SectorSession = {
  bullets: string[];
  title: string;
};

const sectorSessions: SectorSession[] = [
  {
    bullets: ["Logistics", "Integrated Warehousing", "Aviation Services"],
    title: "Services Sector",
  },
  {
    bullets: ["Value Added Processing", "Pharmaceuticals", "Industrial Manufacturing"],
    title: "Manufacturing Sector",
  },
  {
    bullets: ["Nautical & Waterfront Tourism", "Hotel Development", "Theme & Amusement Parks"],
    title: "Leisure & Recreation",
  },
  {
    bullets: ["Technology & Innovation Parks", "University Towns", "Film Production Hubs"],
    title: "Infrastructure",
  },
];

const heroBadges = [
  { delay: "600", icon: "bi-award", label: "International Speakers" },
  { delay: "650", icon: "bi-wifi", label: "Invest Ready Projects" },
  { delay: "700", icon: "bi-gift", label: "B2B Networking" },
] as const;

const overviewStats = [
  { label: "Day", value: "1" },
  { label: "Session", value: "8+" },
  { label: "Speakers", value: "30+" },
  { label: "Attendees", value: "500+" },
] as const;

export async function HomePageContent() {
  const speakerContent = await getSpeakerContent();

  return (
    <div className="index-page">
      <main className="main">
        <section id="hero" className="hero section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center">
              <div className="col-lg-6" data-aos="fade-right" data-aos-delay="200">
                <h1 className="hero-title">Sri Lanka Investment Forum 2026</h1>
                <p className="hero-description">
                  Discover opportunities, connect with visionaries, and invest in the future of Sri
                  Lanka&apos;s dynamic economy.
                </p>

                <div className="event-details mb-4">
                  <div className="detail-item date-highlight" data-aos="fade-up" data-aos-delay="300">
                    <i className="bi bi-calendar-event" />
                    <span>March 30, 2026</span>
                  </div>
                  <div className="detail-item" data-aos="fade-up" data-aos-delay="350">
                    <i className="bi bi-geo-alt" />
                    <span>Cinnamon Life - Colombo</span>
                  </div>
                  <div className="detail-item" data-aos="fade-up" data-aos-delay="400">
                    <i className="bi bi-people" />
                    <span>500+ Attendees Expected</span>
                  </div>
                </div>

                <div className="hero-actions" data-aos="fade-up" data-aos-delay="450">
                  <a
                    href="https://register.srilankainvestmentforum.com/"
                    className="btn btn-primary btn-lg me-3"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Register Now
                  </a>
                  <a href="#schedule" className="btn btn-outline-primary btn-lg">
                    Programme
                  </a>
                </div>

                <div className="countdown-wrapper mt-4" data-aos="fade-up" data-aos-delay="500">
                  <h5 className="countdown-title">Event Starts In:</h5>
                  <CountdownTimer targetDate="2026-03-30T09:00:00+05:30" />
                </div>
              </div>

              <div className="col-lg-6" data-aos="fade-left" data-aos-delay="300">
                <div className="hero-image-wrapper">
                  <img
                    src="https://media.srilankainvestmentforum.com/slifmedia/images/herobg.webp"
                    alt="Sri Lanka Investment Forum hero visual"
                    className="img-fluid hero-image"
                  />
                  <div className="floating-badges">
                    {heroBadges.map((badge) => (
                      <div
                        key={badge.label}
                        className="badge-item"
                        data-aos="zoom-in"
                        data-aos-delay={badge.delay}
                      >
                        <i className={`bi ${badge.icon}`} />
                        <span>{badge.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="forum-highlights" className="about section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="features-grid">
              <div className="row g-4">
                {featureCards.map((card) => (
                  <div
                    key={card.title}
                    className="col-lg-4 col-md-6"
                    data-aos="fade-up"
                    data-aos-delay={card.delay}
                  >
                    <div className="feature-card">
                      <div className="feature-icon">
                        <i className={`bi ${card.icon}`} />
                      </div>
                      <h4>{card.title}</h4>
                      <p>{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="schedule" className="schedule section">
          <div className="container section-title" data-aos="fade-up">
            <h2>Programme</h2>
            <p>Session flow for 30th March, 2026 at Cinnamon Life, Colombo</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="programme-timeline">
              {programmeItems.map((item) => (
                <div key={item.title} className="programme-item">
                  <span className="programme-node">
                    <i className={`bi ${item.icon}`} />
                  </span>
                  <div className="card programme-card shadow-sm">
                    <div className="card-body">
                      <h3 className={`programme-title${item.bullets ? " mb-3" : ""}`}>
                        <i className={`bi ${item.icon}`} />
                        {item.title}
                      </h3>
                      {item.bullets ? (
                        <ul className="mb-0 ps-3">
                          {item.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}

              <div className="programme-item mb-0">
                <span className="programme-node">
                  <i className="bi bi-grid" />
                </span>
                <div className="card programme-card shadow-sm">
                  <div className="card-body">
                    <h3 className="programme-title mb-3">
                      <i className="bi bi-grid" />
                      Sector Themed Parallel Sessions
                    </h3>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
                      {sectorSessions.map((session) => (
                        <div className="col" key={session.title}>
                          <div className="programme-sector-card p-3">
                            <h4 className="h6">{session.title}</h4>
                            <ul className="mb-0 ps-3">
                              {session.bullets.map((bullet) => (
                                <li key={bullet}>{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="speakers" className="speakers section">
          <div className="container section-title" data-aos="fade-up">
            <h2>{speakerContent.title}</h2>
            <p>{speakerContent.subtitle || "Distinguished speakers across the forum's key sessions"}</p>
          </div>

          <div className="container" data-aos="fade-up" data-aos-delay="100">
            {speakerContent.sessions.length ? (
              speakerContent.sessions.map((session, index) => (
                <div key={session.id} className={index === speakerContent.sessions.length - 1 ? "" : "mb-5"}>
                  <h3 className="h4 mb-4">{session.name}</h3>
                  <div className="row g-4">
                    {session.speakers.map((speaker) => (
                      <div key={speaker.id} className="col-lg-3 col-md-6">
                        <div className="speaker-card h-100">
                          <div className="speaker-image">
                            <img
                              src={speaker.imageUrl ?? ""}
                              alt={speaker.alt ?? speaker.name}
                              className="img-fluid"
                              loading="lazy"
                              decoding="async"
                            />
                          </div>
                          <div className="speaker-content">
                            <h4>{speaker.name}</h4>
                            {speaker.title ? <p className="speaker-title">{speaker.title}</p> : null}
                            {speaker.company ? <p className="speaker-company">{speaker.company}</p> : null}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">Speaker details will be announced soon.</p>
            )}
          </div>
        </section>

        <section id="call-to-action" className="call-to-action section light-background">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2>Connect, Collaborate and Capitalize on Sri Lanka&apos;s Next Growth Story</h2>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="about section">
          <div className="container" data-aos="fade-up" data-aos-delay="100">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-4 mb-lg-0">
                <div className="content">
                  <h2 data-aos="fade-up" data-aos-delay="200">
                    Unlocking Sri Lanka&apos;s Potential for Global Investors
                  </h2>
                  <p data-aos="fade-up" data-aos-delay="300">
                    The Sri Lanka Investment Forum 2026 offers a unique platform to connect
                    with global investors, industry leaders, policymakers, and development
                    partners. Participants gain direct access to high-value networking
                    opportunities, explore emerging investment prospects, and engage in
                    meaningful discussions that shape strategic partnerships.
                  </p>
                  <p data-aos="fade-up" data-aos-delay="400">
                    The forum is designed to turn dialogue into action, creating pathways for
                    collaboration, growth, and long-term investment in Sri Lanka&apos;s evolving
                    economy.
                  </p>

                  <div className="stats-grid" data-aos="fade-up" data-aos-delay="500">
                    {overviewStats.map((stat) => (
                      <div key={stat.label} className="stat-item">
                        <div className="stat-number">{stat.value}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="image-wrapper" data-aos="zoom-in" data-aos-delay="300">
                  <img
                    src="/assets/img/events/showcase-8.webp"
                    alt="Sri Lanka Investment Forum showcase"
                    className="img-fluid"
                  />
                  <div className="floating-card" data-aos="fade-up" data-aos-delay="600">
                    <div className="card-icon">
                      <i className="bi bi-people" />
                    </div>
                    <div className="card-content">
                      <h4>Global Network</h4>
                      <p>Connect with professionals from 45+ countries</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="cta-section" data-aos="fade-up" data-aos-delay="100">
              <div className="text-center">
                <h3>Ready to Invest in Sri Lanka&apos;s Future</h3>
                <p>
                  Join global leaders, investors, and policymakers to explore opportunities,
                  build partnerships, and shape the next chapter of Sri Lanka economic
                  transformation.
                </p>
                <div className="cta-buttons">
                  <a
                    href="https://register.srilankainvestmentforum.com/"
                    className="btn btn-primary"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Register Now
                  </a>
                  <a href="#schedule" className="btn btn-outline">
                    Programme
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
