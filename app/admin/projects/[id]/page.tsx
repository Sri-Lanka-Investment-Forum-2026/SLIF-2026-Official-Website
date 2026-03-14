import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectEditor } from "@/components/admin/project-editor";
import { getAllSectorsForAdmin, getProjectForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

type EditProjectPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const user = await requireAdmin();
  const { id } = await params;
  const [project, sectors] = await Promise.all([getProjectForAdmin(id), getAllSectorsForAdmin()]);

  if (!project) {
    notFound();
  }

  return (
    <AdminShell
      user={user}
      title={`Edit ${project.title}`}
      description="Update project content, assets, and download links."
      backHref="/admin/projects"
      backLabel="Back to projects"
    >
      <ProjectEditor
        initialValue={project}
        sectors={sectors.map((sector) => ({ id: sector.id, name: sector.name }))}
      />
    </AdminShell>
  );
}
