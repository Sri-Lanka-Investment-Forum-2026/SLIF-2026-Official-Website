import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

export default async function TermsPage() {
  const html = await loadLegacyMainHtml("terms.html");
  return <LegacyHtmlPage html={html} pageClass="starter-page-page" />;
}
