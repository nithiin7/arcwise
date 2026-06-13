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
    default: "Arcwise — AI System Design Platform",
    template: "%s | Arcwise",
  },
  description:
    "Design and evaluate production-grade architectures with AI. Requirements, diagrams, iterative refinement, and expert analysis — all in one flow.",
  keywords: ["system design", "AI", "architecture", "software engineering", "technical review"],
  openGraph: {
    title: "Arcwise — AI System Design Platform",
    description:
      "AI-powered system design analysis. Architecture diagrams, iterative refinement, and expert evaluation.",
    type: "website",
    siteName: "Arcwise",
  },
  twitter: {
    card: "summary",
    title: "Arcwise — AI System Design Platform",
    description: "AI-powered system design analysis. Architecture diagrams, refinement, and expert evaluation.",
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
