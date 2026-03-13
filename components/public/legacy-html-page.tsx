type LegacyHtmlPageProps = {
  html: string;
  pageClass?: string;
};

export function LegacyHtmlPage({ html, pageClass }: LegacyHtmlPageProps) {
  return (
    <div className={pageClass}>
      <main className="main legacy-html" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
