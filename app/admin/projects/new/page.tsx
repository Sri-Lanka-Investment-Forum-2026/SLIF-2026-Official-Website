import { AdminShell } from "@/components/admin/admin-shell";
import { ProjectEditor } from "@/components/admin/project-editor";
import { getAllSectorsForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";
import type { ProjectInput } from "@/lib/validation";

const emptyProject: ProjectInput = {
  id: "",
  legacyId: "",
  slug: "",
  sectorId: "",
  sortOrder: 0,
  published: true,
  type: "flagship",
  title: "",
  subTitle: "",
  description: "",
  brochureUrl: "",
  moreInfoUrl: "",
  videoUrl: "",
  heroVideoUrl: "",
  media: [],
  stats: [],
  highlights: [],
  financialItems: [],
};

export default async function NewProjectPage() {
  const user = await requireAdmin();
  const sectors = await getAllSectorsForAdmin();

  return (
    <AdminShell user={user} title="New project" description="Create a new project and assign it to a sector.">
      <ProjectEditor
        initialValue={{ ...emptyProject, sectorId: sectors[0]?.id ?? "" }}
        sectors={sectors.map((sector) => ({ id: sector.id, name: sector.name }))}
      />
    </AdminShell>
  );
}
