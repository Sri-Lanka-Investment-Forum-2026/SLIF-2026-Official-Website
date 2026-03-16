import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SectorProjectShowcase } from "@/components/public/sector-project-showcase";
import { getSectorBySlug } from "@/lib/content";
import { env } from "@/lib/env";
import {
  isAbsoluteUrl,
  toSafeMediaUrl,
  toSafeNavigationHref,
} from "@/lib/utils";

type SectorDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: SectorDetailPageProps): Promise<Metadata> {
  if (!env.sectorsPagePublished) {
    return {};
  }

  const { slug } = await params;
  const sector = await getSectorBySlug(slug);

  if (!sector) {
    return {};
  }

  return {
    title: sector.seoTitle ?? `${sector.name} | SLIF`,
    description: sector.seoDescription ?? sector.tagline ?? "",
  };
}

const cardIcons = [
  "bi-briefcase-fill",
  "bi-graph-up-arrow",
  "bi-globe2",
  "bi-lightning-charge-fill",
  "bi-building-fill-check",
  "bi-shield-check",
];

export default async function SectorDetailPage({
  params,
}: SectorDetailPageProps) {
  if (!env.sectorsPagePublished) {
    notFound();
  }

  const { slug } = await params;
  const sector = await getSectorBySlug(slug);

  if (!sector) {
    notFound();
  }

  const heroImage = toSafeMediaUrl(
    sector.heroImageUrl ?? sector.imageUrl,
    "/assets/img/herobg.png",
  );
  const overviewImage = toSafeMediaUrl(
    sector.imageUrl ?? sector.heroImageUrl,
    "/assets/img/herobg.png",
  );
  const officerImage = toSafeMediaUrl(
    sector.officerImageUrl,
    "/assets/img/person/person-m-8.webp",
  );
  const consultationLink = toSafeNavigationHref(sector.consultationLink);
  const reportLink = toSafeNavigationHref(sector.reportLink);
  const officerPhone = sector.officerPhone?.trim() ?? "";
  const officerEmail = sector.officerEmail?.trim() ?? "";

  return (
    <div className="sectors-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <div className="slif-sector-page">
          <section className="slif-sector-hero position-relative">
            <img
              className="slif-sector-hero-image"
              src={heroImage}
              alt={sector.name}
              loading="lazy"
            />
            <div className="slif-sector-hero-overlay" />

            <div className="container slif-sector-hero-content">
              <p className="slif-kicker mb-2">Sri Lanka Investment Forum</p>
              <h1 className="mb-3">{sector.name}</h1>
              <p className="lead mb-4">{sector.tagline}</p>
              <a
                href="#sectorProjects"
                className="btn btn-primary slif-cta-btn"
              >
                Explore Opportunities
              </a>
            </div>
          </section>

          <section className="container slif-stats-wrapper">
            <div className="row g-4 justify-content-center">
              {sector.stats.map((stat: any, index: number) => (
                <div key={stat.id} className="col-5 col-lg-3">
                  <article className="slif-stat-card h-100 fade-in-up">
                    <span className="slif-card-icon-box" aria-hidden="true">
                      <i
                        className={`bi ${cardIcons[index % cardIcons.length]}`}
                      />
                    </span>
                    <p className="slif-stat-value mb-1">{stat.value}</p>
                    <p className="slif-stat-label mb-0">{stat.label}</p>
                  </article>
                </div>
              ))}
            </div>
          </section>

          <div className="container">
            <section className="slif-section-modern">
              <div className="row align-items-start g-5">
                <div className="col-lg-6">
                  <h2 className="section-title mb-4">Sector Overview</h2>
                  <div className="text-muted">
                    {sector.overviewParagraphs.map((item: any) => (
                      <p key={item.id}>{item.value}</p>
                    ))}
                  </div>
                </div>

                <div className="col-lg-6">
                  <div className="slif-glass-image">
                    <img
                      src={overviewImage}
                      className="img-fluid rounded-4"
                      alt={`${sector.name} overview`}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="slif-section-modern">
              <h2 className="section-title mb-4">Why Invest</h2>
              <div className="slif-bullet-grid">
                {sector.whyInvestItems.map((item: any, index: number) => (
                  <article
                    className="slif-bullet-card fade-in-up"
                    key={item.id}
                  >
                    <span className="slif-card-icon-box" aria-hidden="true">
                      <i
                        className={`bi ${cardIcons[index % cardIcons.length]}`}
                      />
                    </span>
                    <div>
                      <p className="mb-0">{item.value}</p>
                      <span className="slif-hover-arrow" aria-hidden="true">
                        <i className="bi bi-arrow-up-right" />
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="sectorProjects" className="slif-section-modern">
              <SectorProjectShowcase
                projects={sector.projects}
                fallbackImage={heroImage}
              />
            </section>

            <section className="slif-section-modern">
              <h2 className="section-title mb-4">Strategic Advantages</h2>
              <div className="row g-4">
                {sector.advantages.map((item: any, index: number) => (
                  <div className="col-12 col-md-6 col-lg-4" key={item.id}>
                    <article className="slif-adv-card h-100 fade-in-up">
                      <span className="slif-card-icon-box" aria-hidden="true">
                        <i
                          className={`bi ${cardIcons[(index + 2) % cardIcons.length]}`}
                        />
                      </span>
                      <div>
                        <p className="mb-0">{item.value}</p>
                        <span className="slif-hover-arrow" aria-hidden="true">
                          <i className="bi bi-arrow-up-right" />
                        </span>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            </section>

            {/* <section className="slif-sector-contact p-5 rounded-4 mb-5">
              <div className="slif-sector-officer-wrapper">
                <div className="container">
                  <div className="slif-sector-officer-section">
                    <div className="slif-officer-wrapper">
                      <div className="slif-officer-left">
                        <h2 className="slif-officer-title mb-3">Interested in This Sector?</h2>
                        <p className="slif-officer-desc mb-4">{sector.officerDescription}</p>
                        <div className="slif-officer-actions">
                          {consultationLink ? (
                            <a
                              href={consultationLink}
                              className="btn btn-light slif-cta-btn"
                              target={isAbsoluteUrl(consultationLink) ? "_blank" : undefined}
                              rel={isAbsoluteUrl(consultationLink) ? "noopener noreferrer" : undefined}
                            >
                              Book a Consultation
                            </a>
                          ) : (
                            <Link href="/contact" className="btn btn-light slif-cta-btn">
                              Contact Investment Team
                            </Link>
                          )}
                          {reportLink ? (
                            <a
                              href={reportLink}
                              className="btn btn-outline-light slif-cta-btn"
                              target={isAbsoluteUrl(reportLink) ? "_blank" : undefined}
                              rel={isAbsoluteUrl(reportLink) ? "noopener noreferrer" : undefined}
                            >
                              Download Sector Report
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="slif-officer-card">
                        <div className="d-flex align-items-center mb-3">
                          <img
                            className="slif-officer-img me-3"
                            src={officerImage}
                            alt={sector.officerName ?? "Sector officer"}
                          />
                          <div>
                            <h5 className="mb-1">{sector.officerName}</h5>
                            <p className="mb-0 small">{sector.officerTitle}</p>
                            <small className="text-muted">{sector.officerSpecialization}</small>
                          </div>
                        </div>
                        <hr />
                        <div>
                          {officerPhone ? (
                            <p className="mb-2">
                              <strong>Direct Line:</strong>{" "}
                              <a href={`tel:${officerPhone.replace(/[^\d+]/g, "")}`}>
                                {officerPhone}
                              </a>
                            </p>
                          ) : null}
                          {officerEmail ? (
                            <p className="mb-0">
                              <strong>Email:</strong> <a href={`mailto:${officerEmail}`}>{officerEmail}</a>
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section> */}
          </div>
        </div>
      </main>
    </div>
  );
}
