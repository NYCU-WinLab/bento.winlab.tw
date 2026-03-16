import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "排名 | Bento",
};

export default function RankLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
