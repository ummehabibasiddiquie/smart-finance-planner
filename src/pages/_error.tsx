import * as React from "react";
import type { NextPageContext } from "next";

// Fallback for legacy Pages Router error handling.
// The app primarily uses the App Router, but Next.js can still look for /_error during build in some setups.
export default function ErrorPage({ statusCode }: { statusCode?: number }) {
  return (
    <main style={{ padding: 24, fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 20, fontWeight: 600 }}>Something went wrong</h1>
      <p style={{ marginTop: 8, opacity: 0.8 }}>
        {statusCode ? `Error code: ${statusCode}` : "An unexpected error occurred."}
      </p>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};
