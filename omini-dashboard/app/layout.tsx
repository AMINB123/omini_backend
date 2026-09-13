import type { Metadata } from "next";
import { Vazirmatn, Space_Grotesk } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({ variable: "--font-vazirmatn", subsets: ["arabic"] });
const spaceGrotesk = Space_Grotesk({ variable: "--font-space-grotesk", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Omini | مدیریت پیام‌های فروشگاه شما",
  description: "همه پیام‌های اینستاگرام، واتساپ و تلگرام فروشگاهت رو یه‌جا مدیریت کن",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fa" dir="rtl">
      <body className={`${vazirmatn.variable} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}