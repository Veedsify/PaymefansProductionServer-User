import { useEffect, useState } from "react";

export default function useThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme");
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      return savedTheme || (systemPrefersDark ? "dark" : "light");
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.style.colorScheme = "light";
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  return { theme, setTheme };
  //   return (
  //     <button
  //       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
  //       className="p-2 bg-gray-200 rounded dark:bg-gray-800"
  //     >
  //       {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
  //     </button>
  //   );
}
