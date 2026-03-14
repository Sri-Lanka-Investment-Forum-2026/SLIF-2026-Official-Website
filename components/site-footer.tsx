import Link from "next/link";

export function SiteFooter() {
  return (
    <>
      <footer id="footer" className="footer position-relative light-background">
        <div className="container footer-top">
          <div className="row gy-4">
            <div className="col-lg-6 col-md-6 footer-about">
              <Link href="/" className="logo d-flex align-items-center">
                <span className="sitename">Sri Lanka Investment Forum - 2026</span>
              </Link>
              <div className="footer-contact pt-3">
                <p>Level 24, West Tower, World Trade Centre, Colombo 01</p>
                <p>
                  <strong>Email:</strong> <a href="mailto:slif2026@boi.lk">slif2026@boi.lk</a>
                </p>
                <p>
                  <strong>Website:</strong>{" "}
                  <a href="https://srilankainvestmentforum.com/">srilankainvestmentforum.com</a>
                </p>
              </div>
              <div className="social-links d-flex mt-4">
                <a
                  href="https://x.com/Investin_SL"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow SLIF on X"
                >
                  <i className="bi bi-twitter-x" aria-hidden="true" />
                </a>
                <a
                  href="https://web.facebook.com/people/BOI-Sri-Lanka/100071941136865/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow SLIF on Facebook"
                >
                  <i className="bi bi-facebook" aria-hidden="true" />
                </a>
                <a
                  href="https://www.linkedin.com/company/boisrilanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Follow SLIF on LinkedIn"
                >
                  <i className="bi bi-linkedin" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="col-lg-6 col-md-6 footer-contact">
              <h4>BOARD OF INVESTMENT OF SRI LANKA</h4>
              <p>Level 24, West Tower, World Trade Centre, Colombo 01</p>
              <p className="mt-3">
                <strong>Hotline:</strong> <a href="tel:+94771211213">+94-77-1211213</a>
              </p>
              <p>
                <strong>Telephone:</strong> <a href="tel:+94112434403">+94-11-2434403</a> / +94-11-2346131/3
              </p>
              <p>
                <strong>Fax:</strong> <span>+94-11-2448105</span>
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:info@boi.lk">info@boi.lk</a>
              </p>
              <p>
                <strong>Website:</strong> <a href="https://investsrilanka.com/">www.investsrilanka.com</a>
              </p>
            </div>
          </div>
        </div>

        <div className="container copyright text-center mt-4">
          <p>
            <span>All Rights Reserved © 2026 -</span>
            <strong className="px-1 sitename">Sri Lanka Investment Forum</strong>
          </p>
          <div className="credits">
            Powered by: Information Technology Department,{" "}
            <a href="https://investsrilanka.com/" target="_blank" rel="noopener noreferrer">
              Board of Investment of Sri Lanka
            </a>
          </div>
        </div>
      </footer>

      <a
        href="#main-content"
        id="scroll-top"
        className="scroll-top d-flex align-items-center justify-content-center"
        aria-label="Back to top"
      >
        <i className="bi bi-arrow-up-short" aria-hidden="true" />
      </a>
    </>
  );
}
