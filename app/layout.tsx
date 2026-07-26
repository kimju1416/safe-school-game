import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost || requestHeaders.get("host") || "localhost:3000";
  const forwardedProtocol = requestHeaders
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim();
  const protocol = forwardedProtocol === "http" ? "http" : "https";
  const metadataBase = new URL(`${protocol}://${host}`);
  const socialImage = new URL("/og.png", metadataBase).toString();

  return {
    metadataBase,
    title: "세이프스쿨: 잠긴 안전코어",
    description:
      "학교를 탐색하며 교실, 등하교·자전거, 물놀이, 실험안전을 배우는 인터랙티브 방탈출 게임",
    openGraph: {
      title: "세이프스쿨: 잠긴 안전코어",
      description: "네 개의 안전 미션을 해결하고 학교의 안전코어를 복구하세요.",
      type: "website",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: "세이프스쿨: 잠긴 안전코어",
      description: "교통·물놀이까지 담은 학교 안전교육 방탈출 게임",
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
