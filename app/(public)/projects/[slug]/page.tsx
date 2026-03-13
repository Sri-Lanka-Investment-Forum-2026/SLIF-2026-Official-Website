import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { getProjectBySlugOrLegacyId } from "@/lib/content";

type ProjectDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlugOrLegacyId(slug);

  if (!project) {
    return {};
  }

  return {
    title: `${project.title} | SLIF`,
    description: project.subTitle ?? project.description ?? "",
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = await getProjectBySlugOrLegacyId(slug);

  if (!project) {
    notFound();
  }

  if (slug !== project.slug) {
    redirect(`/projects/${project.slug}`);
  }

  const heroImage = project.media[0]?.url ?? project.sector.heroImageUrl ?? "/assets/img/herobg.png";

  return (
    <div className="project-page">
      <main className="main">
        <div className="slif-project-page">
          <section className="slif-project-hero mb-4 mb-lg-5">
            <div className="slif-project-hero-media">
              {project.heroVideoUrl || project.videoUrl ? (
                <video
                  className="slif-project-hero-media-item"
                  controls
                  preload="metadata"
                  poster={heroImage}
                >
                  <source src={project.heroVideoUrl ?? project.videoUrl ?? ""} />
                </video>
              ) : (
                <img
                  src={heroImage}
                  className="slif-project-hero-media-item"
                  alt={project.title}
                  loading="lazy"
                />
              )}
            </div>
            <div className="slif-sector-hero-overlay" />
            <div className="container slif-sector-hero-content">
              <p className="slif-kicker mb-2">{project.sector.name}</p>
              <h1 className="mb-3">{project.title}</h1>
              <p className="lead mb-0">{project.subTitle}</p>
            </div>
          </section>

          <div className="container">
            <div className="row g-4 align-items-start">
              <div className="col-12 col-lg-8">
                <section className="mb-4">
                  <h2 className="h4 mb-3">Project Overview</h2>
                  <p className="text-muted">{project.description}</p>
                </section>

                <section className="mb-4">
                  <h2 className="h4 mb-3">Investment Highlights</h2>
                  <ul className="slif-detail-list">
                    {project.highlights.map((item) => (
                      <li key={item.id}>{item.value}</li>
                    ))}
                  </ul>
                </section>

                {project.financialItems.length ? (
                  <section className="mb-4">
                    <h2 className="h4 mb-3">Financial Snapshot</h2>
                    <ul className="slif-detail-list">
                      {project.financialItems.map((item) => (
                        <li key={item.id}>{item.value}</li>
                      ))}
                    </ul>
                  </section>
                ) : null}

                {project.media.length > 1 ? (
                  <section className="mb-4">
                    <h2 className="h4 mb-3">Project Media</h2>
                    <div className="row g-3">
                      {project.media.map((item) => (
                        <div key={item.id} className="col-6 col-lg-4">
                          <img
                            src={item.url}
                            alt={item.altText ?? project.title}
                            className="rounded-4 shadow-sm h-100 object-fit-cover"
                            loading="lazy"
                          />
                        </div>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>

              <div className="col-12 col-lg-4">
                <aside className="slif-investment-panel">
                  <h2 className="h5 mb-3">Quick Facts</h2>
                  <div className="row g-3">
                    {project.stats.slice(0, 4).map((fact) => (
                      <div className="col-6 col-lg-12" key={fact.id}>
                        <article className="slif-fact-card">
                          <p className="small text-muted mb-1">{fact.label}</p>
                          <p className="mb-0 fw-semibold">{fact.value}</p>
                        </article>
                      </div>
                    ))}
                  </div>
                  <div className="d-grid gap-2 mt-4">
                    {project.brochureUrl ? (
                      <a className="btn btn-primary" href={project.brochureUrl} target="_blank" rel="noreferrer">
                        Download Brochure
                      </a>
                    ) : null}
                    <Link className="btn btn-outline-primary" href="/contact">
                      Contact Investment Team
                    </Link>
                    <Link className="btn btn-link" href={`/sectors/${project.sector.slug}`}>
                      Back to {project.sector.name}
                    </Link>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
