import Link from "next/link";

import { PublicPageTitle } from "@/components/public/page-title";

const intellectualPropertyItems = [
  "All content is the property of its respective owners or licensors",
  "You may not copy or modify content beyond permitted use",
  "Trademarks and identifying marks may not be used without permission",
  "Site content is provided for lawful informational and participation purposes",
] as const;

const prohibitedItems = [
  "Systematic retrieval of data or content without permission",
  "Publishing malicious or unlawful content",
  "Engaging in unauthorized framing or impersonation",
  "Attempting to gain unauthorized access to systems or accounts",
] as const;

const disclaimerItems = [
  "The service will meet every requirement or use case",
  "The service will always be uninterrupted or error-free",
  "Information published will always be complete or current",
  "Any defect or error will be corrected immediately",
] as const;

export default function TermsPage() {
  return (
    <div className="terms-page">
      <main id="main-content" className="main" tabIndex={-1}>
        <PublicPageTitle
          title="Terms"
          description="Terms governing the use of the Sri Lanka Investment Forum website, registrations, and related services."
          breadcrumbs={[
            { href: "/", label: "Home" },
            { label: "Terms" },
          ]}
        />

        <section id="terms-of-service" className="terms-of-service section">
          <div className="container" data-aos="fade-up">
            <div className="tos-header text-center" data-aos="fade-up">
              <span className="last-updated">Last Updated: February 27, 2025</span>
              <h2>Terms of Service</h2>
              <p>Please read these terms of service carefully before using our services.</p>
            </div>

            <div className="tos-content" data-aos="fade-up" data-aos-delay="200">
              <div id="agreement" className="content-section">
                <h3>1. Agreement to Terms</h3>
                <p>
                  By accessing this website or using related services, you agree to be bound by
                  these Terms of Service and all applicable laws and regulations. If you do not
                  agree with any part of these terms, you must not use the service.
                </p>
                <div className="info-box">
                  <i className="bi bi-info-circle" />
                  <p>These terms apply to all visitors, registrants, users, and participants.</p>
                </div>
              </div>

              <div id="intellectual-property" className="content-section">
                <h3>2. Intellectual Property Rights</h3>
                <p>
                  The service and its original content, features, branding, and supporting
                  materials are protected by applicable intellectual property laws.
                </p>
                <ul className="list-items">
                  {intellectualPropertyItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div id="user-accounts" className="content-section">
                <h3>3. User Accounts</h3>
                <p>
                  If you create an account or submit registration information, you must provide
                  accurate, complete, and current information. Failure to do so may result in
                  suspension or termination of access.
                </p>
                <div className="alert-box">
                  <i className="bi bi-exclamation-triangle" />
                  <div className="alert-content">
                    <h5>Important Notice</h5>
                    <p>
                      You are responsible for safeguarding your credentials and for activities
                      performed under your account.
                    </p>
                  </div>
                </div>
              </div>

              <div id="prohibited" className="content-section">
                <h3>4. Prohibited Activities</h3>
                <p>
                  You may not access or use the service for any purpose other than the purpose for
                  which we make it available.
                </p>
                <div className="prohibited-list">
                  {prohibitedItems.map((item) => (
                    <div key={item} className="prohibited-item">
                      <i className="bi bi-x-circle" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div id="disclaimer" className="content-section">
                <h3>5. Disclaimers</h3>
                <p>
                  Your use of our service is at your sole risk. The service is provided
                  &quot;as is&quot; and &quot;as available&quot; without warranties of any kind,
                  whether express or implied.
                </p>
                <div className="disclaimer-box">
                  <p>We do not guarantee that:</p>
                  <ul>
                    {disclaimerItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div id="limitation" className="content-section">
                <h3>6. Limitation of Liability</h3>
                <p>
                  To the fullest extent permitted by law, we will not be liable for indirect,
                  incidental, special, consequential, or exemplary damages arising out of or in
                  connection with your use of the service.
                </p>
              </div>

              <div id="indemnification" className="content-section">
                <h3>7. Indemnification</h3>
                <p>
                  You agree to defend, indemnify, and hold us harmless from and against claims,
                  liabilities, damages, losses, and expenses arising out of your misuse of the
                  service or your breach of these terms.
                </p>
              </div>

              <div id="termination" className="content-section">
                <h3>8. Termination</h3>
                <p>
                  We may suspend or terminate access immediately, without prior notice, if you
                  violate these terms or use the service in a way that creates legal, security, or
                  operational risk.
                </p>
              </div>

              <div id="governing-law" className="content-section">
                <h3>9. Governing Law</h3>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of Sri
                  Lanka, without regard to conflict of law principles.
                </p>
              </div>

              <div id="changes" className="content-section">
                <h3>10. Changes to Terms</h3>
                <p>
                  We may update these Terms from time to time. Revised terms become effective when
                  they are published on this page unless otherwise stated.
                </p>
                <div className="notice-box">
                  <i className="bi bi-bell" />
                  <p>
                    By continuing to access or use the service after an update takes effect, you
                    agree to be bound by the revised terms.
                  </p>
                </div>
              </div>
            </div>

            <div className="tos-contact" data-aos="fade-up" data-aos-delay="300">
              <div className="contact-box">
                <div className="contact-icon">
                  <i className="bi bi-envelope" />
                </div>
                <div className="contact-content">
                  <h4>Questions About Terms?</h4>
                  <p>If you have any questions about these Terms, please contact the event team.</p>
                  <Link href="/contact" className="contact-link">
                    Contact Support
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
