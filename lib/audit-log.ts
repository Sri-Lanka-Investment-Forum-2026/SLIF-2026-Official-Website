import { createPocketBaseSuperuserClient } from "@/lib/pocketbase";

export type AuditAction =
  | "LOGIN"
  | "LOGOUT"
  | "CREATE_SECTOR"
  | "UPDATE_SECTOR"
  | "DELETE_SECTOR"
  | "CREATE_PROJECT"
  | "UPDATE_PROJECT"
  | "DELETE_PROJECT"
  | "UPDATE_SPEAKERS"
  | "UPLOAD_FILE";

type ActivityLogInput = {
  adminId: string;
  adminEmail?: string | null;
  adminName?: string | null;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  entityLabel?: string;
  details?: Record<string, unknown>;
};

export async function logActivity(input: ActivityLogInput): Promise<void> {
  try {
    const pb = await createPocketBaseSuperuserClient();
    await pb.collection("admin_activity_logs").create(
      {
        adminId: input.adminId,
        adminEmail: input.adminEmail ?? "",
        adminName: input.adminName ?? "",
        action: input.action,
        entityType: input.entityType ?? "",
        entityId: input.entityId ?? "",
        entityLabel: input.entityLabel ?? "",
        details: input.details ? JSON.stringify(input.details) : "",
      },
      { requestKey: null },
    );
  } catch {
    // Non-blocking: audit failures must not interrupt admin operations
  }
}
