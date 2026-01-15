

import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";

import Aurora from "@/components/ui/reactbits/aurora";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "AroAce Midgard",
  description: "A safe, aesthetic introduction platform for the community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-black font-sans antialiased",
          outfit.variable,
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* Global Cosmic Background */}
            <div className="fixed inset-0 z-0 bg-black pointer-events-none">
              <div className="absolute inset-0 opacity-80">
                <Aurora
                  colorStops={['#a855f7', '#d946ef', '#ec4899']} // Global Purple to Pink Theme
                  speed={0.5}
                  blend={1.0}
                  amplitude={1.0}
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1 min-h-[calc(100vh-140px)] relative z-10">{children}</main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
