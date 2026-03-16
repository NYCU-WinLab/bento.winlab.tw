import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "統計 | Bento",
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
