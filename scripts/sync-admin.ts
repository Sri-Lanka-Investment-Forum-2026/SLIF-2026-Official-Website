import bcrypt from "bcryptjs";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";

async function main() {
  if (!env.initialAdminEmail || !env.initialAdminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env.");
  }

  const passwordHash = await bcrypt.hash(env.initialAdminPassword, 10);

  const user = await prisma.adminUser.upsert({
    where: {
      email: env.initialAdminEmail.toLowerCase(),
    },
    update: {
      name: env.initialAdminName,
      passwordHash,
      active: true,
    },
    create: {
      email: env.initialAdminEmail.toLowerCase(),
      name: env.initialAdminName,
      passwordHash,
      active: true,
    },
    select: {
      email: true,
      active: true,
    },
  });

  console.log(JSON.stringify(user, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
