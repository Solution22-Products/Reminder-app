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
      <head>
        <link rel="icon" href="../public/images/menu-top_bar.png" sizes="any" />
        <link rel="icon" type="image/png" href="../public/images/menu-top_bar.png" sizes="32x32" />
        <link rel="icon" type="image/png" href="../public/images/menu-top_bar.png" sizes="16x16" />
      </head>
      <body>
        {children}
        {/* <Footer /> */}
      </body>
    </html>
  );
}
