import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({ subsets: ["latin"], variable: '--font-sans' });
const cairo = Cairo({ subsets: ["arabic"], variable: '--font-arabic' });

export const metadata = {
  title: "Abbas Restaurant | مطاعم عباس",
  description: "Authentic Arabic Cuisine in Saudi Arabia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={`${inter.variable} ${cairo.variable} scroll-smooth`}>
      <body className="bg-background text-foreground antialiased min-h-screen flex flex-col">
        <LanguageProvider>
          <Navbar />
          <main className="flex-grow pt-20">
            {children}
          </main>
        </LanguageProvider>
      </body>
    </html>
  );
}
