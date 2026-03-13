import Link from "next/link";

export default function NotFound() {
  return (
    <div className="d-flex min-vh-100 align-items-center justify-content-center bg-light px-4">
      <div className="text-center">
        <p className="text-uppercase text-muted fw-semibold mb-2">SLIF 2026</p>
        <h1 className="display-5 mb-3">Page not found</h1>
        <p className="text-muted mb-4">The requested page does not exist or has moved.</p>
        <Link href="/" className="btn btn-primary">
          Back to home
        </Link>
      </div>
    </div>
  );
}
