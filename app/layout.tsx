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
    title: "학교 안전 탈출작전 | 모바일 안전교육 방탈출 게임",
    description:
      "교실·복도·통학로·체육관·수영장·과학실을 탐색하고 OX 퀴즈와 안전 미션을 해결하는 모바일 학교 안전교육 방탈출 게임",
    authors: [{ name: "kimju.zip", url: "https://www.instagram.com/kimju.zip/" }],
    creator: "kimju.zip",
    alternates: {
      canonical: "/",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
      },
    },
    openGraph: {
      title: "학교 안전 탈출작전 | 모바일 안전교육 방탈출 게임",
      description:
        "교실부터 수영장·과학실까지 여섯 구역을 탐색하고 안전 미션을 해결하세요.",
      type: "website",
      locale: "ko_KR",
      siteName: "학교 안전 탈출작전",
      url: "/",
      images: [
        {
          url: socialImage,
          width: 1672,
          height: 941,
          type: "image/png",
          alt: "학교 앞에서 세이프봇과 함께 교실·교통·수영장·과학실 안전 미션을 시작하는 학교 안전 탈출작전",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "학교 안전 탈출작전 | 모바일 안전교육 게임",
      description:
        "위험요소를 찾고 OX·순서 퀴즈를 풀며 배우는 모바일 학교 안전교육 방탈출 게임",
      images: [
        {
          url: socialImage,
          alt: "세이프봇과 함께 여섯 구역을 탐색하는 학교 안전 탈출작전",
        },
      ],
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
