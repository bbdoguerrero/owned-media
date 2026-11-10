import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Owned Media Audit | Uncover Untapped Brand Assets",
  description: "Diagnose your owned media footprint, identify high-utility lived moments, and design high-impact pilots.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full bg-black">
      <body className="min-h-full flex flex-col bg-black text-white antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
