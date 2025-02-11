import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Reminder App",
  description: "Reminder App",
  manifest: "/manifest.json",
  icons: {
    apple: "../public/images/menu-top_bar.png",
    icon: "../public/images/menu-top_bar.png", // Favicon added
    shortcut: "../public/images/menu-top_bar.png",
    other : {
      rel: "apple-touch-icon-precomposed",
      url: "../public/images/menu-top_bar.png",
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
