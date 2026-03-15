import { createPocketBaseSuperuserClient } from "@/lib/pocketbase";
import { applyPocketBaseSchema } from "@/lib/pocketbase-schema";

async function main() {
  const pb = await createPocketBaseSuperuserClient();
  const collections = await applyPocketBaseSchema(pb);

  console.log(
    JSON.stringify(
      {
        applied: collections.length,
        collections,
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
