import { cn } from "@/components/ui/cn";
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
      className={cn(
        className,
        "absolute z-10 -translate-y-1/2 md:rounded-full text-white transition-colors duration-200",
        "p-18 h-[70vh] md:h-auto opacity-0 bg-white md:opacity-100 md:p-4 md:bg-black/70",
        disabled && "md:opacity-30 cursor-not-allowed"
      )}
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      type="button"
      whileHover={!disabled ? { scale: 1 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
    >
      {direction === "prev" ? (
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      ) : (
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      )}
    </motion.button>
  )
);

NavigationButton.displayName = "NavigationButton";

export default NavigationButton;
