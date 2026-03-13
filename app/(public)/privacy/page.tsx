import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

export default async function PrivacyPage() {
  const html = await loadLegacyMainHtml("privacy.html");
  return <LegacyHtmlPage html={html} pageClass="starter-page-page" />;
}
