import Script from "next/script";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <SiteHeader />
      {children}
      <SiteFooter />
      <Script src="/assets/vendor/bootstrap/js/bootstrap.bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/aos/aos.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/purecounter/purecounter_vanilla.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/imagesloaded/imagesloaded.pkgd.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/isotope-layout/isotope.pkgd.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/swiper/swiper-bundle.min.js" strategy="afterInteractive" />
      <Script src="/assets/vendor/glightbox/js/glightbox.min.js" strategy="afterInteractive" />
      <Script src="/assets/js/main.js" strategy="afterInteractive" />
    </>
  );
}
