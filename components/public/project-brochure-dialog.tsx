"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type BrochureProject = {
  brochureUrl: string | null;
  title: string;
};

function buildBrochureMetaUrl(url: string) {
  const params = new URLSearchParams({ url });
  return `/api/brochure/meta?${params.toString()}`;
}

function buildBrochurePageUrl(url: string, page: number) {
  const params = new URLSearchParams({
    page: String(page),
    url,
    width: "1600",
  });

  return `/api/brochure/page?${params.toString()}`;
}

export function hasRenderableBrochure(
  url: string | null | undefined,
): url is string {
  return Boolean(url && url !== "#");
}

export function ProjectBrochureDialog({
  onClose,
  project,
}: {
  onClose: () => void;
  project: BrochureProject;
}) {
  const presentationRef = useRef<HTMLDivElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [frontReady, setFrontReady] = useState(false);
  const [frontFailed, setFrontFailed] = useState(false);
  const [backFailed, setBackFailed] = useState(false);
  const [pageCount, setPageCount] = useState(2);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.fullscreenElement) {
          void document.exitFullscreen();
          return;
        }

        onClose();
      }

      if (event.key === "ArrowRight") {
        setIsFlipped(true);
      }

      if (event.key === "ArrowLeft") {
        setIsFlipped(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const brochureUrl = hasRenderableBrochure(project.brochureUrl)
    ? project.brochureUrl
    : null;

  const metaUrl = useMemo(
    () => (brochureUrl ? buildBrochureMetaUrl(brochureUrl) : ""),
    [brochureUrl],
  );
  const frontPageUrl = useMemo(
    () => (brochureUrl ? buildBrochurePageUrl(brochureUrl, 1) : ""),
    [brochureUrl],
  );
  const backPageUrl = useMemo(
    () => (brochureUrl ? buildBrochurePageUrl(brochureUrl, 2) : ""),
    [brochureUrl],
  );

  useEffect(() => {
    setFrontReady(false);
    setIsFlipped(false);
    setFrontFailed(false);
    setBackFailed(false);
    setPageCount(2);

    const timeoutId = window.setTimeout(() => {
      setFrontReady(true);
    }, 1600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [brochureUrl, project.title]);

  useEffect(() => {
    if (!metaUrl) {
      return;
    }

    let isCancelled = false;

    const loadMeta = async () => {
      try {
        const response = await fetch(metaUrl, { cache: "force-cache" });
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { pages?: number };
        if (!isCancelled && data.pages) {
          setPageCount(Math.max(1, Math.min(2, data.pages)));
        }
      } catch {
        // Keep the default 2-page assumption if metadata fetch fails.
      }
    };

    void loadMeta();

    return () => {
      isCancelled = true;
    };
  }, [metaUrl]);

  useEffect(() => {
    const hasBackPage = pageCount > 1 && !backFailed;
    if (!hasBackPage && isFlipped) {
      setIsFlipped(false);
    }
  }, [backFailed, isFlipped, pageCount]);

  if (!brochureUrl) {
    return null;
  }

  const hasBackPage = pageCount > 1 && !backFailed;
  const currentPage = isFlipped && hasBackPage ? 2 : 1;

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    await presentationRef.current?.requestFullscreen();
  };

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
        ref={presentationRef}
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="brochureTitle" className="visually-hidden">
          {project.title}
        </h3>

        <div className="slif-brochure-modal-body">
          {!frontReady ? (
            <div className="slif-brochure-loading" aria-live="polite">
              <div className="slif-brochure-loading-card">
                <div className="slif-brochure-spinner" />
                <p className="slif-brochure-loading-title">
                  Preparing brochure preview
                </p>
                <p className="slif-brochure-loading-copy">
                  Loading the brochure for optimal viewing experience
                </p>
              </div>
            </div>
          ) : null}

          <div
            className={`slif-brochure-stage${frontReady ? " is-ready" : ""}`}
          >
            <div className="slif-brochure-viewer">
              <button
                type="button"
                className="slif-brochure-nav slif-brochure-nav-prev"
                onClick={() => setIsFlipped(false)}
                aria-label="Show first page"
                disabled={!isFlipped || !hasBackPage}
              >
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </button>

              <div
                className={`slif-brochure-book-wrap${isFlipped ? " is-flipped" : ""}`}
              >
                <div className="slif-brochure-book-shadow" aria-hidden="true" />
                <div
                  className={`slif-brochure-book${isFlipped ? " is-flipped" : ""}`}
                  role="button"
                  tabIndex={hasBackPage ? 0 : -1}
                  aria-label={
                    hasBackPage
                      ? `Flip brochure to ${isFlipped ? "front" : "back"} side`
                      : "Brochure preview"
                  }
                  onClick={() => {
                    if (hasBackPage) {
                      setIsFlipped((current) => !current);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (
                      hasBackPage &&
                      (event.key === "Enter" || event.key === " ")
                    ) {
                      event.preventDefault();
                      setIsFlipped((current) => !current);
                    }
                  }}
                >
                  <div
                    className={`slif-brochure-face slif-brochure-face-front${!isFlipped ? " is-active" : ""}`}
                    aria-hidden={isFlipped}
                  >
                    <div className="slif-brochure-face-frame">
                      {frontFailed ? (
                        <div
                          className="slif-brochure-page-fallback"
                          role="status"
                        >
                          <i
                            className="bi bi-file-earmark-x"
                            aria-hidden="true"
                          />
                          <h4>Brosure Unavailable</h4>
                          <p>Please refresh the page or try again later.</p>
                        </div>
                      ) : (
                        <img
                          title={`${project.title} brochure front`}
                          src={frontPageUrl}
                          className="slif-brochure-page-frame"
                          onLoad={() => setFrontReady(true)}
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setFrontFailed(true);
                            setFrontReady(true);
                          }}
                          alt={`${project.title} brochure page 1`}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={`slif-brochure-face slif-brochure-face-back${isFlipped ? " is-active" : ""}`}
                    aria-hidden={!isFlipped}
                  >
                    <div className="slif-brochure-face-frame">
                      {backFailed ? (
                        <div
                          className="slif-brochure-page-fallback"
                          role="status"
                        >
                          <i
                            className="bi bi-file-earmark-break"
                            aria-hidden="true"
                          />
                          <h4>Brosure Unavailable</h4>
                          <p>Please refresh the page or try again later.</p>
                        </div>
                      ) : (
                        <img
                          title={`${project.title} brochure back`}
                          src={backPageUrl}
                          className="slif-brochure-page-frame"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                            setBackFailed(true);
                          }}
                          alt={`${project.title} brochure page ${pageCount > 1 ? 2 : 1}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="slif-brochure-nav slif-brochure-nav-next"
                onClick={() => setIsFlipped(true)}
                aria-label="Show second page"
                disabled={isFlipped || !hasBackPage}
              >
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            </div>

            <aside className="slif-brochure-rail" aria-label="Brochure actions">
              <button
                type="button"
                className="slif-brochure-rail-item"
                onClick={onClose}
                aria-label="Exit brochure viewer"
              >
                <span className="slif-brochure-rail-icon">
                  <i className="bi bi-x-lg" aria-hidden="true" />
                </span>
                <span className="slif-brochure-rail-label">Exit</span>
              </button>

              <button
                type="button"
                className="slif-brochure-rail-item"
                onClick={() => {
                  void toggleFullscreen();
                }}
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Open fullscreen"
                }
              >
                <span className="slif-brochure-rail-icon">
                  <i
                    className={`bi ${isFullscreen ? "bi-fullscreen-exit" : "bi-fullscreen"}`}
                    aria-hidden="true"
                  />
                </span>
                <span className="slif-brochure-rail-label">Fullscreen</span>
              </button>

              {/* <a
                href={brochureUrl}
                target="_blank"
                rel="noreferrer"
                className="slif-brochure-rail-item"
                aria-label="Open brochure in new tab"
              >
                <span className="slif-brochure-rail-icon">
                  <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
                </span>
                <span className="slif-brochure-rail-label">New Tab</span>
              </a> */}

              <button
                type="button"
                className="slif-brochure-rail-item"
                onClick={() => {
                  if (hasBackPage) {
                    setIsFlipped((current) => !current);
                  }
                }}
                aria-label="Flip brochure"
                disabled={!hasBackPage}
              >
                <span className="slif-brochure-rail-icon">
                  <i className="bi bi-arrow-repeat" aria-hidden="true" />
                </span>
                <span className="slif-brochure-rail-label">Flip</span>
              </button>

              <div className="slif-brochure-rail-item slif-brochure-rail-item-static">
                <span className="slif-brochure-rail-icon slif-brochure-rail-page">
                  {currentPage}/{hasBackPage ? pageCount : 1}
                </span>
                <span className="slif-brochure-rail-label">Page</span>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
