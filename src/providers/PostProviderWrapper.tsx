"use client";
import type React from "react";
import { PostProvider } from "@/contexts/PostContext";

interface PostProviderWrapperProps {
  children: React.ReactNode;
}

export const PostProviderWrapper: React.FC<PostProviderWrapperProps> = ({
  children,
}) => {
  return <PostProvider>{children}</PostProvider>;
};
