"use client";
export const getToken = () => {
  if (typeof document === "undefined") return "";
  const cookies = document.cookie.split(";").map((cookie) => cookie.trim());
  const tokenCookie = cookies.find((cookie) => cookie.startsWith("token="));
  if (!tokenCookie) return "";
  const token = tokenCookie.split("=")[1];
  return token;
};
