import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Subscribe",
  description: "Subscribe to your favorite creators on Paymefans.",
};

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div>{children}</div>;
}
