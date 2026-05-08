import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth-utils";
import { dataRepository } from "@/lib/data/repository";

type ActionMeta = { label: string; badgeClass: string };

const ACTION_META: Record<string, ActionMeta> = {
  LOGIN: { label: "Login", badgeClass: "bg-success" },
  LOGOUT: { label: "Logout", badgeClass: "bg-secondary" },
  CREATE_SECTOR: { label: "Create sector", badgeClass: "bg-primary" },
  UPDATE_SECTOR: { label: "Update sector", badgeClass: "bg-warning text-dark" },
  DELETE_SECTOR: { label: "Delete sector", badgeClass: "bg-danger" },
  CREATE_PROJECT: { label: "Create project", badgeClass: "bg-primary" },
  UPDATE_PROJECT: { label: "Update project", badgeClass: "bg-warning text-dark" },
  DELETE_PROJECT: { label: "Delete project", badgeClass: "bg-danger" },
  UPDATE_SPEAKERS: { label: "Update speakers", badgeClass: "bg-warning text-dark" },
  UPLOAD_FILE: { label: "Upload file", badgeClass: "bg-info text-dark" },
};

function formatTimestamp(created: string) {
  return new Date(created).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminActivityPage({ searchParams }: PageProps) {
  const user = await requireAdmin();
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1") || 1);
  const logs = await dataRepository.listActivityLogs({ page, perPage: 50 });

  return (
    <AdminShell
      user={user}
      title="Activity Log"
      description="Audit trail of all admin actions — who did what and when."
    >
      <div className="admin-card p-4">
        <div className="table-responsive">
          <table className="table admin-table align-middle">
            <thead>
              <tr>
                <th style={{ minWidth: "11rem" }}>Time</th>
                <th>Admin</th>
                <th style={{ minWidth: "9rem" }}>Action</th>
                <th>Entity</th>
              </tr>
            </thead>
            <tbody>
              {logs.items.map((log) => {
                const meta = ACTION_META[log.action];
                const displayName = log.adminName || log.adminEmail;
                const showEmail = log.adminName && log.adminEmail && log.adminName !== log.adminEmail;

                return (
                  <tr key={log.id}>
                    <td>
                      <span className="small text-secondary text-nowrap">
                        {formatTimestamp(log.created)}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold small">{displayName}</div>
                      {showEmail && (
                        <div className="text-secondary" style={{ fontSize: "0.72rem" }}>
                          {log.adminEmail}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={`badge rounded-pill ${meta?.badgeClass ?? "bg-secondary"}`}>
                        {meta?.label ?? log.action}
                      </span>
                    </td>
                    <td>
                      {log.entityLabel && (
                        <div className="small fw-semibold">{log.entityLabel}</div>
                      )}
                      {log.entityType && (
                        <div className="text-secondary" style={{ fontSize: "0.72rem" }}>
                          {log.entityType}
                          {log.entityId ? ` · ${log.entityId}` : ""}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {logs.items.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-secondary py-5">
                    No activity logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {logs.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
            <span className="small text-secondary">
              Page {logs.page} of {logs.totalPages} &middot; {logs.totalItems} entries
            </span>
            <div className="d-flex gap-2">
              {logs.page > 1 && (
                <Link
                  href={`/admin/activity?page=${logs.page - 1}` as "/admin"}
                  className="btn btn-sm btn-outline-dark"
                >
                  Previous
                </Link>
              )}
              {logs.page < logs.totalPages && (
                <Link
                  href={`/admin/activity?page=${logs.page + 1}` as "/admin"}
                  className="btn btn-sm btn-outline-dark"
                >
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
