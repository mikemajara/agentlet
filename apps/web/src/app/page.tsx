import { CatalogApp } from "@/components/CatalogApp";
import { listAgentlets, tagVocabulary } from "@/lib/catalog";

export default function Home() {
  return (
    <CatalogApp listings={listAgentlets()} tags={tagVocabulary()} />
  );
}
