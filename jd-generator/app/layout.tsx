import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Juicebox JD Generator",
  description: "Role-focused job description generator for pSEO hub",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
