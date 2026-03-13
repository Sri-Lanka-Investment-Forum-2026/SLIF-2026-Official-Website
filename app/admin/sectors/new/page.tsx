import { AdminShell } from "@/components/admin/admin-shell";
import { SectorEditor } from "@/components/admin/sector-editor";
import { requireAdmin } from "@/lib/auth-utils";
import type { SectorInput } from "@/lib/validation";

const emptySector: SectorInput = {
  id: "",
  slug: "",
  sortOrder: 0,
  published: true,
  name: "",
  tagline: "",
  heroImageUrl: "",
  imageUrl: "",
  seoTitle: "",
  seoDescription: "",
  ctaTitle: "",
  ctaDescription: "",
  officerName: "",
  officerTitle: "",
  officerSpecialization: "",
  officerPhone: "",
  officerEmail: "",
  officerImageUrl: "",
  consultationLink: "",
  reportLink: "",
  officerDescription: "",
  overviewParagraphs: [],
  stats: [],
  whyInvestItems: [],
  advantages: [],
};

export default async function NewSectorPage() {
  const user = await requireAdmin();

  return (
    <AdminShell user={user} title="New sector" description="Create a new sector and publish it to the public site.">
      <SectorEditor initialValue={emptySector} />
    </AdminShell>
  );
}
