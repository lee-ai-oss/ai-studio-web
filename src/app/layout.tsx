import "./globals.css";

export const metadata = {
  title: "AI 통합 스튜디오",
  description: "YouTube 제작 자동화 스튜디오",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
