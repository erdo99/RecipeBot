import type { Metadata } from "next";
import { Inter, Sacramento, Source_Code_Pro } from "next/font/google";
import "./globals.css";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });
const scp = Source_Code_Pro({ subsets: ["latin"] });
const sacramento = Sacramento({ subsets: ["latin"], weight: ["400"] });

export const metadata: Metadata = {
  title: "AI RECIPE BOT",
  description: "A simple AI project giving recipe",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={scp.className}>
        {/* Navigation Bar */}
        <nav className="flex items-center justify-between bg-black w-full px-6 py-3">
          <Image src="/logo.png" alt="Recipe Logo" width={100} height={30} className="mr-auto" />
          <h1 className="text-3xl font-semibold text-white ml-auto">
            Talk to <span className="highlighted-text">The Recipe Bot</span>
          </h1>
        </nav>

        {/* Main Content */}
        <main>{children}</main>
      </body>
    </html>
  );
}
