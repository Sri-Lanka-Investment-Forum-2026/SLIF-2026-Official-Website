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
                  <strong>Email:</strong> <span>slif2026@boi.lk</span>
                </p>
                <p>
                  <strong>Website:</strong> <span>srilankainvestmentforum.com</span>
                </p>
              </div>
              <div className="social-links d-flex mt-4">
                <a href="https://x.com/Investin_SL" target="_blank" rel="noreferrer">
                  <i className="bi bi-twitter-x" />
                </a>
                <a
                  href="https://web.facebook.com/people/BOI-Sri-Lanka/100071941136865/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <i className="bi bi-facebook" />
                </a>
                <a href="https://www.linkedin.com/company/boisrilanka" target="_blank" rel="noreferrer">
                  <i className="bi bi-linkedin" />
                </a>
              </div>
            </div>

            <div className="col-lg-6 col-md-6 footer-contact">
              <h4>BOARD OF INVESTMENT OF SRI LANKA</h4>
              <p>Level 24, West Tower, World Trade Centre, Colombo 01</p>
              <p className="mt-3">
                <strong>Hotline:</strong> <span>+94-77-1211213</span>
              </p>
              <p>
                <strong>Telephone:</strong> <span>+94-11-2434403 / +94-11-2346131/3</span>
              </p>
              <p>
                <strong>Fax:</strong> <span>+94-11-2448105</span>
              </p>
              <p>
                <strong>Email:</strong> <span>info@boi.lk</span>
              </p>
              <p>
                <strong>Website:</strong> <span>www.investsrilanka.com</span>
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
            <a href="https://investsrilanka.com/" target="_blank" rel="noreferrer">
              Board of Investment of Sri Lanka
            </a>
          </div>
        </div>
      </footer>

      <a
        href="#"
        id="scroll-top"
        className="scroll-top d-flex align-items-center justify-content-center"
      >
        <i className="bi bi-arrow-up-short" />
      </a>
    </>
  );
}
