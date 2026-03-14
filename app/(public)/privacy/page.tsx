import { PublicPageTitle } from "@/components/public/page-title";

type PrivacySubSection = {
  bullets?: string[];
  paragraphs: string[];
  title: string;
};

type PrivacySection = {
  bullets?: string[];
  paragraphs: string[];
  subSections?: PrivacySubSection[];
  title: string;
};

const sections: PrivacySection[] = [
  {
    paragraphs: [
      "When you use our services, you trust us with your information. We treat that responsibility seriously and work to protect the information shared through registrations, enquiries, and related forum services.",
      "This Privacy Policy explains what information we collect, why we collect it, and how we use and protect it.",
    ],
    title: "1. Introduction",
  },
  {
    paragraphs: ["We collect information to provide and improve our services. The types of information we collect include:"],
    subSections: [
      {
        bullets: [
          "Your name and contact information",
          "Organization, role, and event participation details",
          "Account or registration credentials when required",
          "Communication preferences",
        ],
        paragraphs: ["When you register or contact us, you may provide personal information such as:"],
        title: "2.1 Information You Provide",
      },
      {
        bullets: [
          "Device and browser details",
          "Log information and usage analytics",
          "Approximate location or network data where applicable",
          "Technical information needed to secure and operate the service",
        ],
        paragraphs: ["We may also automatically collect operational information such as:"],
        title: "2.2 Automatic Information",
      },
    ],
    title: "2. Information We Collect",
  },
  {
    bullets: [
      "Provide and personalize event-related services",
      "Process registrations and send event updates",
      "Respond to enquiries and support requests",
      "Maintain security and verify access where needed",
      "Analyze usage and improve our services",
    ],
    paragraphs: ["We use the information we collect to operate, maintain, and improve the Sri Lanka Investment Forum experience. In particular, we use it to:"],
    title: "3. How We Use Your Information",
  },
  {
    paragraphs: [
      "We do not share personal information with companies, organizations, or individuals outside the event and its supporting operations except in limited circumstances described below.",
    ],
    subSections: [
      {
        paragraphs: [
          "We may share information when you ask us to do so or when the service you request clearly requires it.",
        ],
        title: "4.1 With Your Consent",
      },
      {
        bullets: [
          "Comply with applicable law, regulation, legal process, or enforceable governmental request",
          "Enforce applicable terms and event policies",
          "Detect, prevent, or address fraud, abuse, security, or technical issues",
          "Protect the rights, property, and safety of users, organizers, and the public",
        ],
        paragraphs: ["We may disclose personal information when we reasonably believe it is necessary to:"],
        title: "4.2 For Legal Reasons",
      },
    ],
    title: "4. Information Sharing and Disclosure",
  },
  {
    bullets: [
      "Use secure channels where practical",
      "Review storage and access controls periodically",
      "Limit access to information to authorized personnel with a business need",
    ],
    paragraphs: ["We work to protect personal information from unauthorized access, disclosure, alteration, or destruction. This includes measures such as the following:"],
    title: "5. Data Security",
  },
  {
    bullets: [
      "Request access to your personal information",
      "Request correction of inaccurate information",
      "Request deletion where appropriate",
      "Object to or restrict certain processing where applicable",
    ],
    paragraphs: ["You may have rights regarding your personal information, including the ability to:"],
    title: "6. Your Rights and Choices",
  },
  {
    paragraphs: [
      "We may update this Privacy Policy from time to time. When we do, we will post the revised version on this page and update the effective date shown below.",
      "Your continued use of our services after an update takes effect constitutes acceptance of the revised policy.",
    ],
    title: "7. Changes to This Policy",
  },
];

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <PublicPageTitle
          title="Privacy"
          description="How the Sri Lanka Investment Forum handles personal information submitted through registrations, enquiries, and related event services."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Privacy" },
          ]}
        />

        <section id="privacy" className="privacy section">
          <div className="container" data-aos="fade-up">
            <div className="privacy-header" data-aos="fade-up">
              <div className="header-content">
                <div className="last-updated">Effective Date: February 27, 2025</div>
                <h2>Privacy Policy</h2>
                <p className="intro-text">
                  This Privacy Policy describes how we collect, use, process, and disclose
                  information in connection with your access to and use of the Sri Lanka
                  Investment Forum services.
                </p>
              </div>
            </div>

            <div className="privacy-content" data-aos="fade-up">
              {sections.map((section) => (
                <div key={section.title} className="content-section">
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.bullets ? (
                    <ul>
                      {section.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  ) : null}
                  {section.subSections?.map((subsection) => (
                    <div key={subsection.title}>
                      <h3>{subsection.title}</h3>
                      {subsection.paragraphs.map((paragraph) => (
                        <p key={paragraph}>{paragraph}</p>
                      ))}
                      {subsection.bullets ? (
                        <ul>
                          {subsection.bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="privacy-contact" data-aos="fade-up">
              <h2>Contact Us</h2>
              <p>If you have any questions about this Privacy Policy or our practices, please contact us:</p>
              <div className="contact-details">
                <p>
                  <strong>Email:</strong> info@boi.lk
                </p>
                <p>
                  <strong>Address:</strong> Level 24, West Tower, World Trade Centre, Colombo 01
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
