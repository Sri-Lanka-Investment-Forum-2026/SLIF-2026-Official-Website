type Breadcrumb = {
  href?: string;
  label: string;
};

type PublicPageTitleProps = {
  breadcrumbs?: Breadcrumb[];
  description?: string;
  subtitle?: string;
  title: string;
  topPadding?: boolean;
};

export function PublicPageTitle({
  breadcrumbs,
  description,
  subtitle,
  title,
  topPadding = false,
}: PublicPageTitleProps) {
  return (
    <div className="page-title">
      <div className="heading">
        <div className="container">
          <div className="row d-flex justify-content-center text-center">
            <div className={`col-lg-8 page-title-copy${topPadding ? " page-title-copy-top-padding" : ""}`}>
              <h1 className="heading-title">{title}</h1>
              {subtitle ? <p className="heading-title h5 mb-3">{subtitle}</p> : null}
              {description ? <p className="mb-0">{description}</p> : null}
            </div>
          </div>
        </div>
      </div>

      {breadcrumbs?.length ? (
        <nav className="breadcrumbs" aria-label={`${title} breadcrumb`}>
          <div className="container">
            <ol>
              {breadcrumbs.map((breadcrumb, index) => {
                const isCurrent = index === breadcrumbs.length - 1 || !breadcrumb.href;

                return (
                  <li key={`${breadcrumb.label}-${index}`} className={isCurrent ? "current" : undefined}>
                    {isCurrent || !breadcrumb.href ? (
                      <span aria-current={isCurrent ? "page" : undefined}>{breadcrumb.label}</span>
                    ) : (
                      <a href={breadcrumb.href}>{breadcrumb.label}</a>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </nav>
      ) : null}
    </div>
  );
}
