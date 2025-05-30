"use client";

export const documentCookie = document.cookie.split("token=")[1].split(";")[0];
