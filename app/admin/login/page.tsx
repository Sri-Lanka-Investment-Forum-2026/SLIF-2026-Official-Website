import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

export default async function AdminLoginPage() {
  const session = await auth();

  if (session?.user) {
    redirect("/admin");
  }

  return (
    <div className="admin-login">
      {/* Left branding panel */}
      <div className="admin-login-brand">
        <div className="admin-login-brand-grid" aria-hidden="true" />
        <div className="position-relative z-1">
          <Image
            src="/assets/img/slif-logo.png"
            alt="SLIF 2026"
            width={80}
            height={80}
            className="mb-4"
            style={{ objectFit: "contain" }}
          />
          <p
            className="text-uppercase fw-bold mb-2"
            style={{
              fontSize: "0.7rem",
              letterSpacing: "0.14em",
              color: "#94a3b8",
            }}
          >
            Content Management
          </p>
          <h2
            className="fw-bold mb-3"
            style={{ fontSize: "1.75rem", lineHeight: 1.2, color: "#0f172a" }}
          >
            Sri Lanka Investment Forum 2026
          </h2>
          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
              maxWidth: "26rem",
            }}
          >
            Internal dashboard for managing sectors, investment projects, and
            speakers.
          </p>
        </div>

        <div className="position-relative z-1 d-flex align-items-center gap-2">
          <span
            className="badge rounded-pill"
            style={{
              background: "rgba(8,145,178,0.1)",
              color: "#0891b2",
              border: "1px solid rgba(8,145,178,0.25)",
              fontSize: "0.7rem",
              letterSpacing: "0.05em",
            }}
          >
            Restricted access
          </span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="admin-login-form-side">
        <LoginForm />
      </div>
    </div>
  );
}
