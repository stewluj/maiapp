import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAI - Campus Marketplace",
  description: "The default supply chain for physical academic materials inside universities",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
