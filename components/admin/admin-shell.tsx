import Link from "next/link";

import { AdminNav } from "@/components/admin/admin-nav";

type AdminShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminShell({
  user,
  title,
  description,
  backHref,
  backLabel = "Back",
  actions,
  children,
}: AdminShellProps) {
  return (
    <div className="admin-shell">
      <AdminNav user={user} />

      <main className="admin-main">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              {backHref ? (
                <Link
                  href={backHref as "/admin"}
                  className="btn btn-link px-0 mb-3 text-decoration-none d-inline-flex align-items-center gap-2"
                >
                  <i className="bi bi-arrow-left" aria-hidden="true" />
                  <span>{backLabel}</span>
                </Link>
              ) : null}
              <p className="admin-page-eyebrow">Admin dashboard</p>
              <h1 className="display-6 mb-2">{title}</h1>
              {description ? <p className="text-secondary mb-0">{description}</p> : null}
            </div>
            {actions}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
