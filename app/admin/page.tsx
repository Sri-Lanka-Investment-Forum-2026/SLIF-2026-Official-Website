import { AdminShell } from "@/components/admin/admin-shell";
import { getAdminDashboardSummary } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminDashboardPage() {
  const user = await requireAdmin();
  const summary = await getAdminDashboardSummary();

  return (
    <AdminShell
      user={user}
      title="Dashboard"
      description="Manage database-backed forum content and media-backed assets."
    >
      <div className="row g-4">
        <div className="col-md-3">
          <div className="admin-stat">
            <p className="small text-uppercase text-white-50 mb-2">Sectors</p>
            <p className="display-6 fw-semibold">{summary.sectorCount}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat">
            <p className="small text-uppercase text-white-50 mb-2">Projects</p>
            <p className="display-6 fw-semibold">{summary.projectCount}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat">
            <p className="small text-uppercase text-white-50 mb-2">Sessions</p>
            <p className="display-6 fw-semibold">{summary.sessionCount}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="admin-stat">
            <p className="small text-uppercase text-white-50 mb-2">Speakers</p>
            <p className="display-6 fw-semibold">{summary.speakerCount}</p>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
