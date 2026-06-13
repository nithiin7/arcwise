import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arcwise — AI System Design Coach",
    template: "%s | Arcwise",
  },
  description:
    "Master system design with an AI coach. Get clarifying questions, architecture diagrams, iterative refinement, and scored reviews — all in one flow.",
  keywords: ["system design", "AI", "architecture", "interview prep", "software engineering"],
  openGraph: {
    title: "Arcwise — AI System Design Coach",
    description:
      "Master system design with an AI coach. Get architecture diagrams, iterative refinement, and scored reviews.",
    type: "website",
    siteName: "Arcwise",
  },
  twitter: {
    card: "summary",
    title: "Arcwise — AI System Design Coach",
    description: "Master system design with an AI coach. Architecture diagrams, refinement, and scored reviews.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/favicon.ico",
  },
};

const themeScript = `
(function(){try{
  var s=localStorage.getItem('arcwise-settings');
  var t=s?JSON.parse(s)?.theme:null;
  var dark=t==='dark'||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.add(dark?'dark':'light');
}catch(e){}})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col" style={{ backgroundColor: "var(--color-bg)" }}>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
