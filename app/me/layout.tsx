import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "個人資料 | Bento",
};

export default function MeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
