import { LegacyHtmlPage } from "@/components/public/legacy-html-page";
import { getSpeakerContent } from "@/lib/content";
import { loadLegacyMainHtml } from "@/lib/legacy-pages";

const buildSpeakerCards = async () => {
  const data = await getSpeakerContent();

  const sessionsHtml = data.sessions
    .map((session, index) => {
      const rowClass = index === data.sessions.length - 1 ? "row g-4" : "row g-4 mb-5";
      const speakers = session.speakers
        .map(
          (speaker) => `
          <div class="col-lg-3 col-md-6">
            <div class="speaker-card h-100">
              <div class="speaker-image">
                <img src="${speaker.imageUrl ?? ""}" alt="${speaker.alt ?? speaker.name}" class="img-fluid" loading="lazy" decoding="async" />
              </div>
              <div class="speaker-content">
                <h4>${speaker.name}</h4>
                <p class="speaker-title">${speaker.title ?? ""}</p>
                <p class="speaker-company">${speaker.company ?? ""}</p>
              </div>
            </div>
          </div>
        `,
        )
        .join("");

      return `
        <h3 class="h4 mb-4">${session.name}</h3>
        <div class="${rowClass}">
          ${speakers}
        </div>
      `;
    })
    .join("");

  return {
    title: data.title,
    subtitle: data.subtitle,
    sessionsHtml:
      sessionsHtml || '<p class="text-muted">Speaker details will be announced soon.</p>',
  };
};

export default async function HomePage() {
  const [legacyHtml, speakerMarkup] = await Promise.all([
    loadLegacyMainHtml("index.html"),
    buildSpeakerCards(),
  ]);

  const html = legacyHtml
    .replace("<h2>Speakers</h2>", `<h2>${speakerMarkup.title}</h2>`)
    .replace(
      "<p>Distinguished speakers across the forum's key sessions</p>",
      `<p>${speakerMarkup.subtitle}</p>`,
    )
    .replace(
      /<div id="speakersContent" class="container" data-aos="fade-up" data-aos-delay="100"><\/div>/,
      `<div id="speakersContent" class="container" data-aos="fade-up" data-aos-delay="100">${speakerMarkup.sessionsHtml}</div>`,
    );

  return <LegacyHtmlPage html={html} pageClass="index-page" />;
}
