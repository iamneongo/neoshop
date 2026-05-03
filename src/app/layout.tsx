import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { viVN } from "@clerk/localizations";
import { ActionScript } from "./_components/action-script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://neoshop.vn"),
  title: {
    default: "NeoShop - Tài khoản ChatGPT Plus 1 tháng",
    template: "%s | NeoShop"
  },
  description: "NeoShop cung cấp tài khoản ChatGPT Plus 1 tháng chính hãng giá 120.000đ, giao nhanh, bảo hành đầy đủ.",
  keywords: ["NeoShop", "ChatGPT Plus", "ChatGPT Plus 1 tháng", "tài khoản ChatGPT", "shop acc ChatGPT"],
  applicationName: "NeoShop",
  authors: [{ name: "NeoShop" }],
  creator: "NeoShop",
  publisher: "NeoShop",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }]
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: "https://neoshop.vn",
    siteName: "NeoShop",
    title: "NeoShop - Tài khoản ChatGPT Plus 1 tháng",
    description: "Mua tài khoản ChatGPT Plus 1 tháng giá 120.000đ với QR thanh toán nhanh, bảo hành đầy đủ và hỗ trợ 24/7.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "NeoShop - Tài khoản ChatGPT Plus 1 tháng"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "NeoShop - Tài khoản ChatGPT Plus 1 tháng",
    description: "ChatGPT Plus 1 tháng chính hãng giá 120.000đ.",
    images: ["/twitter-image.png"]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={viVN} telemetry={false}>
      <html lang="vi">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap&subset=vietnamese"
            rel="stylesheet"
          />
        </head>
        <body>
          {children}
          <ActionScript />
        </body>
      </html>
    </ClerkProvider>
  );
}
