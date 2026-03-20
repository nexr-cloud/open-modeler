import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Sora } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";


const primaryFont = Poppins({
  variable: "--font-sans",
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
});

const secondaryFont = Sora({
  variable: "--font-serif",
  weight: ["300", "400", "700", "500", "600", "800", "200"],
  subsets: ["latin"],
});


import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Open NEXr Modeler | SAP BTP Architecture Designer",
  description: "An advanced open-source architecture modeler for designing, visualizing, and standardizing SAP Business Technology Platform solutions with enterprise-grade precision.",
  keywords: ["SAP BTP", "Cloud Architecture", "Open NEXr Modeler", "Open Source Architecture", "Diagram Tool", "SAP Architecture", "Enterprise Design"],
  authors: [{ name: "Open NEXr Community" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${primaryFont.variable} ${secondaryFont.variable} font-sans antialiased`}
      >
        <NextTopLoader showSpinner={false} color="var(--primary)" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster
              position="bottom-right"
              expand={false}
              closeButton={true}
              duration={4000}
              offset="32px"
              gap={12}
              theme="dark"
              toastOptions={{
                className: 'sonnerLB-toast-shell sonnerLB-has-loader',
              }} />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
