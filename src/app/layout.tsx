

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
          "min-h-screen bg-background font-sans antialiased",
          outfit.variable,
          inter.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {/* Global Cosmic Background */}
            <div className="fixed inset-0 z-[-1] bg-[#050508]">
              <div className="absolute inset-0 opacity-40">
                <Aurora
                  colorStops={['#8e03a0', '#fd68dd', '#3610d1']}
                  speed={0.5}
                  blend={1.0}
                  amplitude={1.0}
                />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)]" />
            </div>

            <Navbar />

            <main className="flex-1 min-h-[calc(100vh-140px)] relative z-10">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
