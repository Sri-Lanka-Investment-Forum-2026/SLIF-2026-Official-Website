import { AdminShell } from "@/components/admin/admin-shell";
import { SpeakersEditor } from "@/components/admin/speakers-editor";
import { getSpeakerSettingsForAdmin } from "@/lib/content";
import { requireAdmin } from "@/lib/auth-utils";

export default async function AdminSpeakersPage() {
  const user = await requireAdmin();
  const settings = await getSpeakerSettingsForAdmin();

  return (
    <AdminShell
      user={user}
      title="Speakers"
      description="Manage the homepage speakers section, sessions, and individual speaker cards."
    >
      <SpeakersEditor initialValue={settings} />
    </AdminShell>
  );
}
