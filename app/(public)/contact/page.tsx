import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

export default async function ContactPage() {
  const html = await loadLegacyMainHtml("contact.html");
  return <LegacyHtmlPage html={html} pageClass="contact-page" />;
}
