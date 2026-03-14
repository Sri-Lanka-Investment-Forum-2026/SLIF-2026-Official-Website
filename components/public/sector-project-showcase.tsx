"use client";

import Link from "next/link";
import { startTransition, useEffect, useState } from "react";

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

function ProjectBrochureDialog({
  onClose,
  project,
}: {
  onClose: () => void;
  project: SectorProject;
}) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!project.brochureUrl) {
    return null;
  }

  return (
    <div
      className="slif-brochure-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="brochureTitle"
      onClick={onClose}
    >
      <div
        className="slif-brochure-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="slif-brochure-modal-header">
          <div>
            <p className="slif-brochure-kicker mb-1">Project Brief</p>
            <h3 id="brochureTitle" className="mb-0">
              {project.title}
            </h3>
          </div>
          <button
            type="button"
            className="slif-brochure-close"
            onClick={onClose}
            aria-label="Close brochure dialog"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className="slif-brochure-modal-body">
          {isLoading ? (
            <div className="slif-brochure-loading" aria-live="polite">
              <div className="slif-brochure-spinner" />
              <p className="mb-2">Opening brochure</p>
              <div className="slif-brochure-loading-bars" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </div>
          ) : null}

          <iframe
            title={`${project.title} brochure`}
            src={project.brochureUrl}
            className={`slif-brochure-frame${isLoading ? " is-loading" : ""}`}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </div>
    </div>
  );
}

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
          <span className="badge rounded-pill bg-dark-subtle text-dark px-3 py-2">
            {visibleProjects.length} projects
          </span>
          {hasFlagshipProjects ? (
            <div
              className="slif-project-filter"
              role="tablist"
              aria-label="Project filter"
            >
              <button
                type="button"
                className={`btn${filterMode === "all" ? " is-active" : ""}`}
                onClick={() => startTransition(() => setFilterMode("all"))}
              >
                All
              </button>
              <button
                type="button"
                className={`btn${filterMode === "flagship" ? " is-active" : ""}`}
                onClick={() => startTransition(() => setFilterMode("flagship"))}
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

          return (
            <article key={project.id} className="slif-project-feature-card">
              <div className="slif-project-media">
                {isFlagship ? (
                  <span className="slif-project-badge">Flagship Project</span>
                ) : null}
                <div className="slif-media-frame">
                  <img
                    src={image}
                    alt={project.media[0]?.altText ?? project.title}
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
                  {project.brochureUrl ? (
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => {
                        setActiveProjectId(project.id);
                      }}
                    >
                      View Project Brief
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
