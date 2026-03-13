import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

export default async function VenuePage() {
  const html = await loadLegacyMainHtml("venue.html");
  return <LegacyHtmlPage html={html} pageClass="venue-page" />;
}
