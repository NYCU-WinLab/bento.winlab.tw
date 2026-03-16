import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "店家列表 | Bento",
};

export default function MenusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
