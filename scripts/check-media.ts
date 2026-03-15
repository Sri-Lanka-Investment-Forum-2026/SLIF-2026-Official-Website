import { dataRepository } from "@/lib/data/repository";

const main = async () => {
  const assets = await dataRepository.listMediaAssets();

  let missing = 0;

  for (const asset of assets) {
    try {
      const response = await fetch(asset.publicUrl, {
        method: "HEAD",
      });

      if (!response.ok) {
        missing += 1;
        console.log(`${response.status} ${asset.publicUrl}`);
      }
    } catch (error) {
      missing += 1;
      console.log(`ERR ${asset.publicUrl} ${(error as Error).message}`);
    }
  }

  console.log(JSON.stringify({ checked: assets.length, missing }, null, 2));
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
