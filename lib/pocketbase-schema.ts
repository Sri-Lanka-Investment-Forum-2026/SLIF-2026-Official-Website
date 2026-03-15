import { pocketbaseSchema } from "@/pocketbase/schema";

type CollectionRecord = {
  id: string;
  name: string;
};

const resolveRelations = (fields: Array<Record<string, unknown>>, collectionIdByName: Map<string, string>) =>
  fields.map((field) => {
    if (field.type !== "relation") {
      return field;
    }

    const target = field.collectionId;

    if (typeof target !== "string") {
      return field;
    }

    const collectionId = collectionIdByName.get(target);

    if (!collectionId) {
      throw new Error(`Unknown relation target: ${target}`);
    }

    return {
      ...field,
      collectionId,
    };
  });

export async function applyPocketBaseSchema(pb: any) {
  const existingCollections = (await pb.collections.getFullList({ requestKey: null })) as CollectionRecord[];
  const collectionByName = new Map(existingCollections.map((collection) => [collection.name, collection]));
  const collectionIdByName = new Map(existingCollections.map((collection) => [collection.name, collection.id]));

  for (const definition of pocketbaseSchema) {
    const payload = {
      ...definition,
      fields: resolveRelations([...definition.fields], collectionIdByName),
    };

    const existing = collectionByName.get(definition.name);
    const saved = existing
      ? await pb.collections.update(existing.id, payload, { requestKey: null })
      : await pb.collections.create(payload, { requestKey: null });

    collectionByName.set(definition.name, saved as CollectionRecord);
    collectionIdByName.set(definition.name, (saved as CollectionRecord).id);
  }

  return pocketbaseSchema.map((collection) => collection.name);
}
