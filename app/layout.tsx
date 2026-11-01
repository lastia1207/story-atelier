import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Interface font file: Agbalumo-Regular.ttf.
// Story CONTENT stays Times New Roman (see globals.css `.font-story`).
const uiFont = localFont({
  src: "./fonts/Agbalumo-Regular.ttf",
  variable: "--font-brunette",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Story Atelier",
  description:
    "A calm writing workspace for planning, drafting, and managing stories.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${uiFont.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        {children}
      </body>
    </html>
  );
}