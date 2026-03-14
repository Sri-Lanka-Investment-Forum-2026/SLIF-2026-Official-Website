import Link from "next/link";

import { getPublishedSectors } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function SectorsPage() {
  const sectors = await getPublishedSectors();
  const projectCount = sectors.reduce((count, sector) => count + sector.projects.length, 0);

  return (
    <div className="sectors-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <div className="page-title slif-page-hero">
          <div className="slif-page-hero-overlay" />
          <div className="heading position-relative">
            <div className="container">
              <div className="row d-flex justify-content-center text-center">
                <div className="col-lg-8 mt-5 pt-5 pb-4">
                  <h1 className="heading-title sectors-hero-title text-white">Investment Sectors</h1>
                  <p className="mb-0 sectors-hero-subtitle text-white">
                    Browse sector opportunities and flagship projects curated for the Sri Lanka
                    Investment Forum.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <nav className="breadcrumbs position-relative">
            <div className="container text-center">
              <ol>
                <li>
                  <Link href="/">Home</Link>
                </li>
                <li className="current">Sectors</li>
              </ol>
            </div>
          </nav>
        </div>

        <section className="container slif-stats-wrapper" data-aos="fade-up">
          <div className="row g-4 justify-content-center">
            <div className="col-12 col-md-6 col-lg-4">
              <article className="slif-stat-card h-100">
                <span className="slif-card-icon-box" aria-hidden="true">
                  <i className="bi bi-grid-1x2-fill" aria-hidden="true" />
                </span>
                <p className="slif-stat-value mb-1">{sectors.length} Sectors</p>
                <p className="slif-stat-label mb-0">Priority investment sectors</p>
              </article>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <article className="slif-stat-card h-100">
                <span className="slif-card-icon-box" aria-hidden="true">
                  <i className="bi bi-diagram-3-fill" aria-hidden="true" />
                </span>
                <p className="slif-stat-value mb-1">{projectCount} Projects</p>
                <p className="slif-stat-label mb-0">Investment-ready projects</p>
              </article>
            </div>
            <div className="col-12 col-md-6 col-lg-4">
              <article className="slif-stat-card h-100">
                <span className="slif-card-icon-box" aria-hidden="true">
                  <i className="bi bi-cash-stack" aria-hidden="true" />
                </span>
                <p className="slif-stat-value mb-1">US $ 6 Bn.</p>
                <p className="slif-stat-label mb-0">Indicative investment value</p>
              </article>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container" data-aos="fade-up">
            <div className="row g-4">
              {sectors.map((sector) => {
                const baseStats = sector.stats.slice(0, 4).map((stat) => ({
                  id: stat.id,
                  label: stat.label,
                  value: stat.value,
                }));
                if (baseStats.length < 4 && sector.projects.length) {
                  baseStats.push({ id: `${sector.id}-projects`, label: "Projects", value: `${sector.projects.length}` });
                }

                const overviewText = sector.overviewParagraphs[0]?.value ?? sector.tagline ?? "";

                return (
                  <div key={sector.id} className="col-12 col-md-6 col-lg-4">
                    <Link
                      className="text-decoration-none text-reset"
                      href={`/sectors/${sector.slug}`}
                      aria-label={`View ${sector.name} sector`}
                    >
                      <article className="card border-0 sector-card h-100">
                        <div className="sector-media">
                          <img
                            src={sector.heroImageUrl ?? "/assets/img/herobg.png"}
                            loading="lazy"
                            alt={`${sector.name} sector`}
                          />
                          <div className="sector-overlay" />
                          <div className="sector-title-wrap">
                            <h3 className="sector-title">{sector.name}</h3>
                          </div>
                        </div>
                        <div className="card-body sector-body">
                          <p className="sector-tagline">{sector.tagline ?? overviewText}</p>
                          <div className="sector-stats">
                            {baseStats.slice(0, 4).map((stat) => (
                              <div className="sector-stat" key={stat.id}>
                                <span className="sector-stat-label">{stat.label}</span>
                                <span className="sector-stat-value">{stat.value}</span>
                              </div>
                            ))}
                          </div>
                          <span className="btn btn-primary sector-action">
                            View Projects <i className="bi bi-arrow-right" aria-hidden="true" />
                          </span>
                        </div>
                      </article>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
