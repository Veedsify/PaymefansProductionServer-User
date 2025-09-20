import { motion } from "framer-motion";
import { LucideLoader2 } from "lucide-react";
import type React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "gray";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  const colorClasses = {
    primary: "border-primary-dark-pink",
    secondary: "border-blue-500",
    white: "border-white",
    gray: "border-gray-400",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <span
          className={`
        ${sizeClasses[size]}
        ${color === "primary" ? "text-primary-dark-pink" : ""}
        ${color === "secondary" ? "text-blue-500" : ""}
        ${color === "white" ? "text-white" : ""}
        ${color === "gray" ? "text-gray-400" : ""}
        animate-spin
        flex items-center justify-center
          `}
        >
          {/* Example Lucide icon: Loader2 */}
          <LucideLoader2
            className="animate-spin"
            size={size === "sm" ? 16 : size === "md" ? 24 : 32}
          />
        </span>
        {text && (
          <p className="text-sm text-gray-600 dark:text-gray-400 animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
