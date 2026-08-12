import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Empire Atlas | أطلس الإمبراطوريات",
  description: "Empire Atlas — an interactive 3D museum of historical homes across eight civilizations.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Empire Atlas",
    title: "Empire Atlas",
    description:
      "Explore how civilizations lived. Eight historical homes in interactive 3D — turn each dwelling, read its architecture, and see how a household worked.",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "An illustrated cutaway of a Roman domus around its colonnaded garden courtyard, set on aged parchment with architectural sketches, beside the words Empire Atlas.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Empire Atlas",
    description:
      "Explore how civilizations lived. Eight historical homes in interactive 3D — turn each dwelling, read its architecture, and see how a household worked.",
    images: ["/og-cover.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
