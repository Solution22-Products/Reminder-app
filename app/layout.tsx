import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Reminder App",
  description: "Reminder App",
  manifest: "/manifest.json",
  icons: {
    apple: "/favicon.ico",
    icon: "/favicon.ico", // Favicon added
    shortcut: "/favicon.ico",
    other : {
      rel: "apple-touch-icon-precomposed",
      url: "/favicon.ico",
    }
  },
  // themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className='font-geist'>
      <body>
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
