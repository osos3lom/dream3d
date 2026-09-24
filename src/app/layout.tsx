import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Heritage Villa Studio | استوديو الفلل التراثية",
  description: "Heritage Villa Studio — five Saudi heritage architectural styles reimagined as modern villas in interactive 3D.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Heritage Villa Studio",
    title: "Heritage Villa Studio",
    description:
      "Najdi, Salmani, Hijazi, Asiri and Eastern Coastal — five Saudi heritage styles as modern villas in interactive 3D. Turn each villa and read its signature motifs.",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Five modern villas in Najdi, Salmani, Hijazi, Asiri and Eastern Coastal heritage styles, beside the words Heritage Villa Studio.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heritage Villa Studio",
    description:
      "Najdi, Salmani, Hijazi, Asiri and Eastern Coastal — five Saudi heritage styles as modern villas in interactive 3D. Turn each villa and read its signature motifs.",
    images: ["/og-cover.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
