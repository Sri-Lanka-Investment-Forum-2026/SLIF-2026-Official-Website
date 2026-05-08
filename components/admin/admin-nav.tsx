"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/admin/actions";

type NavLink = { href: string; label: string; icon: string; exact?: boolean };

const navLinks: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: "bi-speedometer2", exact: true },
  { href: "/admin/sectors", label: "Sectors", icon: "bi-collection" },
  { href: "/admin/projects", label: "Projects", icon: "bi-building" },
  { href: "/admin/speakers", label: "Speakers", icon: "bi-people" },
  { href: "/admin/activity", label: "Activity", icon: "bi-clock-history" },
];

function initials(name?: string | null, email?: string | null): string {
  if (name) return name.slice(0, 2).toUpperCase();
  if (email) return email.slice(0, 2).toUpperCase();
  return "AD";
}

type AdminNavProps = {
  user: {
    name?: string | null;
    email?: string | null;
  };
};

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <nav className="admin-nav" aria-label="Admin navigation">
      <div className="container py-2 d-flex align-items-center justify-content-between gap-3">
        {/* Brand + nav links */}
        <div className="d-flex align-items-center gap-3 flex-wrap">
          <span className="admin-nav-brand">SLIF CMS</span>
          <span className="admin-nav-divider d-none d-sm-block" aria-hidden="true" />
          <div className="d-flex flex-wrap gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as "/admin"}
                className={`admin-nav-link${isActive(link.href, link.exact) ? " active" : ""}`}
                aria-current={isActive(link.href, link.exact) ? "page" : undefined}
              >
                <i className={`bi ${link.icon}`} aria-hidden="true" />
                <span>{link.label}</span>
              </Link>
            ))}
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-nav-link">
              <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
              <span className="d-none d-lg-inline">View site</span>
            </a>
          </div>
        </div>

        {/* User area */}
        <div className="d-flex align-items-center gap-2">
          <div className="d-none d-md-flex align-items-center gap-2">
            <span className="admin-user-avatar" aria-hidden="true">
              {initials(user.name, user.email)}
            </span>
            <div className="text-end lh-sm">
              <p className="mb-0 fw-semibold small">{user.name ?? "Admin"}</p>
              <p className="mb-0 text-secondary" style={{ fontSize: "0.72rem" }}>
                {user.email}
              </p>
            </div>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1 ms-1"
              title="Sign out"
            >
              <i className="bi bi-box-arrow-right" aria-hidden="true" />
              <span className="d-none d-md-inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </nav>
  );
}
