import { useEffect, useState } from "react";

export default function useThemeToggle() {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem("theme") === "dark"
      ? "dark"
      : "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  return {theme, setTheme}
//   return (
//     <button
//       onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
//       className="p-2 bg-gray-200 dark:bg-gray-800 rounded"
//     >
//       {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
//     </button>
//   );
}
