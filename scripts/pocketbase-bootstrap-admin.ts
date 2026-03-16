import { createPocketBaseSuperuserClient, POCKETBASE_ADMIN_COLLECTION } from "@/lib/pocketbase";
import { buildPocketBaseEqFilter } from "@/lib/pocketbase-filter";
import { applyPocketBaseSchema } from "@/lib/pocketbase-schema";
import { env } from "@/lib/env";

async function main() {
  if (!env.initialAdminEmail || !env.initialAdminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.");
  }

  const pb = await createPocketBaseSuperuserClient();
  await applyPocketBaseSchema(pb);
  const email = env.initialAdminEmail.toLowerCase();

  const payload = {
    email,
    password: env.initialAdminPassword,
    passwordConfirm: env.initialAdminPassword,
    name: env.initialAdminName,
    active: true,
    verified: true,
  };

  let result: any;

  try {
    const existing = await pb
      .collection(POCKETBASE_ADMIN_COLLECTION)
      .getFirstListItem(buildPocketBaseEqFilter("email", email), {
        requestKey: null,
      });
    result = await pb.collection(POCKETBASE_ADMIN_COLLECTION).update(existing.id, payload, {
      requestKey: null,
    });
  } catch {
    result = await pb.collection(POCKETBASE_ADMIN_COLLECTION).create(payload, {
      requestKey: null,
    });
  }

  console.log(
    JSON.stringify(
      {
        id: result.id,
        email: result.email,
        active: result.active,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
