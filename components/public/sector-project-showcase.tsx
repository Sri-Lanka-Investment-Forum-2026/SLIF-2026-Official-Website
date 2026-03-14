"use client";

import Link from "next/link";
import { startTransition, useState } from "react";

import { ProjectBrochureDialog } from "@/components/public/project-brochure-dialog";
import { hasRenderableBrochure } from "@/lib/utils";

type ProjectStat = {
  id: string;
  label: string;
  value: string;
};

type ProjectHighlight = {
  id: string;
  value: string;
};

type SectorProject = {
  brochureUrl: string | null;
  description: string | null;
  id: string;
  media: Array<{
    id: string;
    url: string;
    altText: string | null;
  }>;
  slug: string;
  stats: ProjectStat[];
  highlights: ProjectHighlight[];
  subTitle: string | null;
  title: string;
  type: string | null;
};

type SectorProjectShowcaseProps = {
  fallbackImage: string;
  projects: SectorProject[];
};

type FilterMode = "all" | "flagship";

export function SectorProjectShowcase({
  fallbackImage,
  projects,
}: SectorProjectShowcaseProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  const hasFlagshipProjects = projects.some(
    (project) => project.type?.toLowerCase() === "flagship",
  );
  const visibleProjects =
    filterMode === "flagship"
      ? projects.filter((project) => project.type?.toLowerCase() === "flagship")
      : projects;

  const activeProject =
    projects.find((project) => project.id === activeProjectId) ?? null;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <h2 className="section-title m-0">Investment Projects</h2>
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span
            className="badge rounded-pill bg-dark-subtle text-dark px-3 py-2"
            aria-live="polite"
          >
            {visibleProjects.length} projects
          </span>
          {hasFlagshipProjects ? (
            <div
              className="slif-project-filter"
              role="group"
              aria-label="Project filter"
            >
              <button
                type="button"
                className={`btn${filterMode === "all" ? " is-active" : ""}`}
                onClick={() => startTransition(() => setFilterMode("all"))}
                aria-controls="flagshipProjects"
                aria-pressed={filterMode === "all"}
              >
                All
              </button>
              <button
                type="button"
                className={`btn${filterMode === "flagship" ? " is-active" : ""}`}
                onClick={() => startTransition(() => setFilterMode("flagship"))}
                aria-controls="flagshipProjects"
                aria-pressed={filterMode === "flagship"}
              >
                Flagship
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div id="flagshipProjects" className="slif-project-list">
        {visibleProjects.map((project) => {
          const image = project.media[0]?.url ?? fallbackImage;
          const isFlagship = project.type?.toLowerCase() === "flagship";
          const imageAlt =
            project.media[0]?.altText?.trim() ||
            `${project.title} project preview`;

          return (
            <article key={project.id} className="slif-project-feature-card">
              <div className="slif-project-media">
                {isFlagship ? (
                  <span className="slif-project-badge">Flagship Project</span>
                ) : null}
                <div className="slif-media-frame">
                  <img
                    src={image}
                    alt={imageAlt}
                    className="slif-project-media-item"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="slif-project-body">
                <h3 className="slif-project-title">{project.title}</h3>
                {project.subTitle ? (
                  <p className="slif-project-subtitle">{project.subTitle}</p>
                ) : null}
                {project.description ? (
                  <p className="slif-project-description">
                    {project.description}
                  </p>
                ) : null}

                <div className="slif-project-stats">
                  {project.stats.slice(0, 4).map((stat) => (
                    <div key={stat.id} className="slif-project-stat">
                      <span className="slif-project-stat-label">
                        {stat.label}
                      </span>
                      <span className="slif-project-stat-value">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                {project.highlights.length ? (
                  <>
                    <div className="slif-project-divider" />
                    <h4 className="slif-project-highlights-title">
                      Key Highlights
                    </h4>
                    <ul className="slif-project-highlights-list">
                      {project.highlights.slice(0, 4).map((highlight) => (
                        <li key={highlight.id}>{highlight.value}</li>
                      ))}
                    </ul>
                  </>
                ) : null}

                <div className="slif-project-actions">
                  <Link href="/contact" className="btn btn-primary">
                    Contact Investment Team{" "}
                    <i className="bi bi-arrow-right ms-1" />
                  </Link>
                  {hasRenderableBrochure(project.brochureUrl) ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setActiveProjectId(project.id);
                      }}
                      aria-haspopup="dialog"
                      aria-label={`Open brochure preview for ${project.title}`}
                    >
                      View Project Brochure
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {activeProject ? (
        <ProjectBrochureDialog
          project={activeProject}
          onClose={() => setActiveProjectId(null)}
        />
      ) : null}
    </>
  );
}
