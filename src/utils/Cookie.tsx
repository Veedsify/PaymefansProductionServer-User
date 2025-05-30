"use client";
export const getToken = () => {
    if (typeof document !== "undefined") {
        const tokenCookie = document.cookie.split("token=")[1];
        if (tokenCookie) {
            const token = tokenCookie.split(";")[0];
            return token;
        }
    }
    return "";
};
