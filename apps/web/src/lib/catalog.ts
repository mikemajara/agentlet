import catalog from "../../catalog.json";

export type CatalogTag = {
  id: string;
  label: string;
};

export type CatalogListing = {
  id: string;
  title: string;
  description: string;
  examplePath: string;
  tags: string[];
  deployUrl: string;
  createCommand: string;
};

export type CatalogFile = {
  schemaVersion: number;
  tagVocabulary: CatalogTag[];
  listings: CatalogListing[];
};

const file = catalog as CatalogFile;

export function tagVocabulary(): CatalogTag[] {
  return file.tagVocabulary ?? [];
}

export function listAgentlets(opts?: {
  tag?: string;
}): CatalogListing[] {
  let listings = [...(file.listings ?? [])];
  if (opts?.tag?.trim()) {
    const tag = opts.tag.trim().toLowerCase();
    listings = listings.filter((item) =>
      (item.tags ?? []).some((t) => t.toLowerCase() === tag),
    );
  }
  return listings;
}

export function getAgentlet(id: string): CatalogListing | null {
  return (file.listings ?? []).find((item) => item.id === id) ?? null;
}
