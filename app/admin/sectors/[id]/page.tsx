import { notFound } from "next/navigation";

import { AdminShell } from "@/components/admin/admin-shell";
import { SectorEditor } from "@/components/admin/sector-editor";
import { getSectorForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

type EditSectorPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditSectorPage({ params }: EditSectorPageProps) {
  const user = await requireAdmin();
  const { id } = await params;
  const sector = await getSectorForAdmin(id);

  if (!sector) {
    notFound();
  }

  return (
    <AdminShell
      user={user}
      title={`Edit ${sector.name}`}
      description="Update public sector content and the linked CTA/officer information."
      backHref="/admin/sectors"
      backLabel="Back to sectors"
    >
      <SectorEditor initialValue={sector} />
    </AdminShell>
  );
}
