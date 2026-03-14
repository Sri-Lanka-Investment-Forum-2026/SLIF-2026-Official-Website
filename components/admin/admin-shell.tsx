import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";

type AdminShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
  title: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
};

export function AdminShell({ user, title, description, actions, children }: AdminShellProps) {
  return (
    <div className="admin-shell">
      <nav className="admin-nav">
        <div className="container py-3 d-flex flex-wrap align-items-center justify-content-between gap-3">
          <div>
            <p className="text-uppercase small fw-semibold mb-1 text-secondary">SLIF CMS</p>
            <div className="d-flex flex-wrap gap-3">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/sectors">Sectors</Link>
              <Link href="/admin/projects">Projects</Link>
              <Link href="/admin/speakers">Speakers</Link>
              <Link href="/" target="_blank" rel="noopener noreferrer">
                View site
              </Link>
            </div>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <p className="mb-0 fw-semibold">{user.name ?? "Admin"}</p>
              <p className="mb-0 small text-secondary">{user.email}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" className="btn btn-outline-dark btn-sm">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </nav>

      <main className="admin-main">
        <div className="container">
          <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
            <div>
              <p className="text-uppercase small fw-semibold text-secondary mb-2">Admin dashboard</p>
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
