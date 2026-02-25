import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const robotoHeading = Roboto({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["300", "400", "500", "700", "900"],
});

const robotoBody = Roboto({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["300", "400", "500", "700", "900"],
});

export const metadata: Metadata = {
  title: "ROOMe — Find Your Perfect Roommate",
  description: "ROOMe helps you find compatible roommates and apartments.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${robotoHeading.variable} ${robotoBody.variable} font-body antialiased bg-roome-offwhite text-roome-black`}>
        {children}
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      </body>
    </html>
  );
}
