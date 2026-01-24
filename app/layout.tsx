import type { Metadata } from "next";
import { Geist, Geist_Mono, Bangers, Creepster, Pacifico, Permanent_Marker, Press_Start_2P, Rubik_Mono_One, Satisfy, Special_Elite } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bangers = Bangers({
  weight: "400",
  variable: "--font-bangers",
  subsets: ["latin"],
});

const creepster = Creepster({
  weight: "400",
  variable: "--font-creepster",
  subsets: ["latin"],
});

const pacifico = Pacifico({
  weight: "400",
  variable: "--font-pacifico",
  subsets: ["latin"],
});

const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
});

const pressStart = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start",
  subsets: ["latin"],
});

const rubikMono = Rubik_Mono_One({
  weight: "400",
  variable: "--font-rubik-mono",
  subsets: ["latin"],
});

const satisfy = Satisfy({
  weight: "400",
  variable: "--font-satisfy",
  subsets: ["latin"],
});

const specialElite = Special_Elite({
  weight: "400",
  variable: "--font-special-elite",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mario Party Drinks",
  description: "Order your drinks for Mario Party Night",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bangers.variable} ${creepster.variable} ${pacifico.variable} ${permanentMarker.variable} ${pressStart.variable} ${rubikMono.variable} ${satisfy.variable} ${specialElite.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
