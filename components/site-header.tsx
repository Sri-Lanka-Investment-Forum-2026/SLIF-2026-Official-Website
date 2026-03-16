import Link from "next/link";

import { env } from "@/lib/env";

export function SiteHeader() {
  return (
    <header id="header" className="header d-flex align-items-center fixed-top">
      <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-between">
        <nav id="navmenu" className="navmenu" aria-label="Primary">
          <ul>
            <li>
              <Link href="/">Home</Link>
            </li>
            <li>
              <Link href="/#schedule">Programme</Link>
            </li>
            <li>
              <Link href="/#speakers">Speakers</Link>
            </li>
            <li>
              <Link href="/offers">Exclusive Offers</Link>
            </li>
            <li>
              <Link href="/venue">Venue</Link>
            </li>
            {env.sectorsPagePublished ? (
              <li>
                <Link href="/sectors">Ready to Invest</Link>
              </li>
            ) : null}
            <li>
              <Link href="/contact">Contact</Link>
            </li>
          </ul>
          <button
            type="button"
            className="mobile-nav-toggle d-xl-none bi bi-list"
            aria-label="Open navigation menu"
            aria-controls="navmenu"
            aria-expanded="false"
          />
        </nav>

        <div className="getstarted-container d-flex align-items-center">
          <p className="getstarted-text">Registration Now Open</p>
          <a
            className="btn-getstarted"
            target="_blank"
            rel="noopener noreferrer"
            href="https://register.srilankainvestmentforum.com/"
            aria-label="Register now for Sri Lanka Investment Forum 2026"
          >
            Register Now
          </a>
        </div>
      </div>
    </header>
  );
}
