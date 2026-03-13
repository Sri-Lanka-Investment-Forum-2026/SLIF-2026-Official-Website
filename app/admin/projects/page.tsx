import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { deleteProjectAction } from "@/app/admin/actions";
import { getAllProjectsForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminProjectsPage() {
  const user = await requireAdmin();
  const projects = await getAllProjectsForAdmin();

  return (
    <AdminShell
      user={user}
      title="Projects"
      description="Manage project details, brochures, media galleries, and sector assignments."
      actions={
        <Link href="/admin/projects/new" className="btn btn-dark">
          New project
        </Link>
      }
    >
      <div className="admin-card p-4">
        <div className="table-responsive">
          <table className="table admin-table align-middle">
            <thead>
              <tr>
                <th>Project</th>
                <th>Sector</th>
                <th>Legacy ID</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <div className="fw-semibold">{project.title}</div>
                    <div className="small text-secondary">{project.slug}</div>
                  </td>
                  <td>{project.sector.name}</td>
                  <td>{project.legacyId}</td>
                  <td>{project.published ? "Published" : "Hidden"}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Link href={`/admin/projects/${project.id}`} className="btn btn-outline-dark btn-sm">
                        Edit
                      </Link>
                      <form action={deleteProjectAction.bind(null, project.id)}>
                        <button className="btn btn-outline-danger btn-sm" type="submit">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
