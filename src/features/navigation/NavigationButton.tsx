import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { memo } from "react";

interface NavigationButtonProps {
  direction: "prev" | "next";
  className: string;
  ariaLabel: string;
  onClick?: () => void;
  disabled?: boolean;
}

const NavigationButton = memo(
  ({
    direction,
    className,
    ariaLabel,
    onClick,
    disabled,
  }: NavigationButtonProps) => (
    <motion.button
      className={`${className} absolute z-10 -translate-y-1/2 rounded-full bg-black/70 backdrop-blur-sm p-2 md:p-3 text-white transition-colors duration-200 hover:bg-black/90 focus:outline-none focus:ring-2 focus:ring-white/50 ${
        disabled ? "opacity-30 cursor-not-allowed" : "hover:scale-110"
      }`}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      type="button"
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {direction === "prev" ? (
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      ) : (
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      )}
    </motion.button>
  ),
);

NavigationButton.displayName = "NavigationButton";

export default NavigationButton;
