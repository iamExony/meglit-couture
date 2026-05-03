import { Playfair_Display, Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import NavigationProgress from "@/components/NavigationProgress";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Meglit Couture | Palazzo & Premium Fabrics",
  description: "Discover elegance with Meglit Couture's exclusive palazzo collections and premium branded fabrics. Redefining fashion with African sophistication.",
  keywords: "palazzo, fashion, fabrics, ankara, lace, couture, Nigerian fashion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="min-h-screen flex flex-col antialiased">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
