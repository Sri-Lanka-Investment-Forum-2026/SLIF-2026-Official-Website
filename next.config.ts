import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/contact.html",
        destination: "/contact",
        permanent: true,
      },
      {
        source: "/offers.html",
        destination: "/offers",
        permanent: true,
      },
      {
        source: "/venue.html",
        destination: "/venue",
        permanent: true,
      },
      {
        source: "/privacy.html",
        destination: "/privacy",
        permanent: true,
      },
      {
        source: "/terms.html",
        destination: "/terms",
        permanent: true,
      },
      {
        source: "/sectors/index.html",
        destination: "/sectors",
        permanent: true,
      },
      {
        source: "/speaker-details.html",
        destination: "/",
        permanent: true,
      },
      {
        source: "/sectors/:slug.html",
        destination: "/sectors/:slug",
        permanent: true,
      },
      {
        source: "/project.html",
        has: [
          {
            type: "query",
            key: "id",
            value: "(?<id>.*)",
          },
        ],
        destination: "/projects/:id",
        permanent: false,
      },
      {
        source: "/sectors/sector.html",
        has: [
          {
            type: "query",
            key: "sector",
            value: "(?<sector>.*)",
          },
        ],
        destination: "/sectors/:sector",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
