import { jsonLdScript } from "@/lib/seo";

/** Server-safe JSON-LD injector for page-level structured data */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={jsonLdScript(data)}
    />
  );
}
