"use client";
import Loader from "@/components/common/loaders/Loader";
import { useEffect, useState } from "react";

export default function PreloaderProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500); // simulate load
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <Loader />;
  return <>{children}</>;
}
