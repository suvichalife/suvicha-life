import type { Metadata } from "next";
import { Gloock, Kanit } from "next/font/google";
import "./globals.css";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";

const gloock = Gloock({
  variable: "--font-gloock",
  subsets: ["latin"],
  weight: "400",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin", "thai"],
  weight: ["300", "400", "500", "600", "700"],
});

const title = "suvicha.life — Life, Unlocked.";
const description = "สุวิชชา | ตัวแทนประกันชีวิตและที่ปรึกษาการเงิน\nปกป้องทุกจังหวะของชีวิต";

export const metadata: Metadata = {
  metadataBase: new URL("https://suvicha.life"),
  title,
  description,
  openGraph: {
    title,
    description,
    url: "https://suvicha.life",
    siteName: "suvicha.life",
    images: ["/images/standing-portrait.jpg"],
    locale: "th_TH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/images/standing-portrait.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${gloock.variable} ${kanit.variable} h-full antialiased`}>
      <head>
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
