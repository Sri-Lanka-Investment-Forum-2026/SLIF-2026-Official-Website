import Link from "next/link";

import { AdminShell } from "@/components/admin/admin-shell";
import { deleteSectorAction } from "@/app/admin/actions";
import { getAllSectorsForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminSectorsPage() {
  const user = await requireAdmin();
  const sectors = await getAllSectorsForAdmin();

  return (
    <AdminShell
      user={user}
      title="Sectors"
      description="Manage sector metadata, SEO, statistics, officer information, and overview content."
      actions={
        <Link href="/admin/sectors/new" className="btn btn-dark">
          New sector
        </Link>
      }
    >
      <div className="admin-card p-4">
        <div className="table-responsive">
          <table className="table admin-table align-middle">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Projects</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sectors.map((sector) => (
                <tr key={sector.id}>
                  <td>
                    <div className="fw-semibold">{sector.name}</div>
                    <div className="small text-secondary">{sector.tagline}</div>
                  </td>
                  <td>{sector.slug}</td>
                  <td>{sector.projects.length}</td>
                  <td>{sector.published ? "Published" : "Hidden"}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <Link href={`/admin/sectors/${sector.id}`} className="btn btn-outline-dark btn-sm">
                        Edit
                      </Link>
                      <form action={deleteSectorAction.bind(null, sector.id)}>
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
