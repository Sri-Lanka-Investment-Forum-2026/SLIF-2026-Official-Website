import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboardSummary } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

const stats = [
  {
    key: "sectorCount" as const,
    label: "Sectors",
    icon: "bi-collection",
    colorClass: "cyan",
    href: "/admin/sectors",
  },
  {
    key: "projectCount" as const,
    label: "Projects",
    icon: "bi-building",
    colorClass: "violet",
    href: "/admin/projects",
  },
  {
    key: "sessionCount" as const,
    label: "Sessions",
    icon: "bi-calendar-event",
    colorClass: "amber",
    href: "/admin/speakers",
  },
  {
    key: "speakerCount" as const,
    label: "Speakers",
    icon: "bi-people",
    colorClass: "emerald",
    href: "/admin/speakers",
  },
] as const;

type QuickAction = {
  href: string;
  icon: string;
  iconClass: string;
  label: string;
  description: string;
  external?: boolean;
};

const quickActions: QuickAction[] = [
  {
    href: "/admin/sectors/new",
    icon: "bi-plus-circle",
    iconClass: "cyan",
    label: "Add sector",
    description: "Create a new investment sector",
  },
  {
    href: "/admin/projects/new",
    icon: "bi-plus-circle",
    iconClass: "violet",
    label: "Add project",
    description: "Add a project to a sector",
  },
  {
    href: "/admin/speakers",
    icon: "bi-pencil-square",
    iconClass: "amber",
    label: "Edit speakers",
    description: "Manage sessions and speakers",
  },
  {
    href: "/",
    icon: "bi-globe",
    iconClass: "emerald",
    label: "View live site",
    description: "Open the public SLIF 2026 site",
    external: true,
  },
];

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const summary = await getAdminDashboardSummary();

  return (
    <AdminShell
      user={user}
      title="Dashboard"
      description="Manage database-backed forum content and media assets."
    >
      {/* Stat cards */}
      <div className="row g-3 mb-4">
        {stats.map((stat) => (
          <div key={stat.key} className="col-6 col-lg-3">
            <div className="admin-stat">
              <span className={`admin-stat-icon ${stat.colorClass}`}>
                <i className={`bi ${stat.icon}`} aria-hidden="true" />
              </span>
              <p className="admin-stat-value">{summary[stat.key]}</p>
              <p className="admin-stat-label">{stat.label}</p>
              <Link href={stat.href as "/admin"} className="admin-stat-link">
                Manage <i className="bi bi-arrow-right" aria-hidden="true" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <p className="admin-page-eyebrow mt-2 mb-3">Quick actions</p>
      <div className="row g-3">
        {quickActions.map((action) => (
          <div key={action.label} className="col-12 col-sm-6 col-lg-3">
            <Link
              href={action.href as "/admin"}
              className="admin-quick-action"
              {...(action.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            >
              <span className={`admin-quick-action-icon admin-stat-icon ${action.iconClass}`}>
                <i className={`bi ${action.icon}`} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="mb-0 fw-semibold small">{action.label}</p>
                <p className="mb-0 text-secondary" style={{ fontSize: "0.78rem" }}>
                  {action.description}
                </p>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
