import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

export default async function OffersPage() {
  const html = await loadLegacyMainHtml("offers.html");
  return <LegacyHtmlPage html={html} pageClass="venue-page" />;
}
