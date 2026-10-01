import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: "Heritage Villa Studio | استوديو الفلل التراثية",
  description: "Heritage Villa Studio — the nineteen Saudi heritage architectural styles reimagined as modern villas in interactive 3D.",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "Heritage Villa Studio",
    title: "Heritage Villa Studio",
    description:
      "All nineteen Saudi heritage architectural styles, from Najdi and Hijazi to Jazani and Farasani, as modern villas in interactive 3D. Turn each villa and read its signature motifs.",
    images: [
      {
        url: "/og-cover.jpg",
        width: 1200,
        height: 630,
        alt: "Nineteen modern villas, one for each Saudi heritage architectural style, beside the words Heritage Villa Studio.",
      },
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Heritage Villa Studio",
    description:
      "All nineteen Saudi heritage architectural styles, from Najdi and Hijazi to Jazani and Farasani, as modern villas in interactive 3D. Turn each villa and read its signature motifs.",
    images: ["/og-cover.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
