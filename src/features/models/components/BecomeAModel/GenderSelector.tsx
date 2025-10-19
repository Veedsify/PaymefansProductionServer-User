"use client";

import React, { useCallback, useState } from "react";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEye,
  LucideUser,
  LucideUser2,
} from "lucide-react";
import type { postAudienceDataProps2 } from "@/types/Components";
import type { FormErrors } from "../../types";

const GENDER_OPTIONS: postAudienceDataProps2[] = [
  {
    id: 1,
    name: "Male",
    icon: <LucideUser size={20} className="inline" />,
  },
  {
    id: 2,
    name: "Female",
    icon: <LucideUser2 size={20} className="inline" />,
  },
];

interface GenderSelectorProps {
  selectedGender: postAudienceDataProps2;
  setSelectedGender: (gender: postAudienceDataProps2) => void;
  formErrors: FormErrors;
  focusedField: string | null;
  onFocus: (fieldName: string) => void;
  onBlur: () => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({
  selectedGender,
  setSelectedGender,
  formErrors,
  focusedField,
  onFocus,
  onBlur,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleGenderSelect = useCallback(
    (e: React.MouseEvent<HTMLLIElement>) => {
      const id = e.currentTarget.getAttribute("data-id");
      const gender = GENDER_OPTIONS.find((option) => option.id == Number(id));
      if (gender) {
        setSelectedGender(gender);
        setIsDropdownOpen(false);
      }
    },
    [setSelectedGender]
  );

  return (
    <div className="relative">
      <div
        className={`relative border rounded-lg transition-all duration-200 ${
          focusedField === "gender"
            ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
            : formErrors.audience
            ? "border-red-500"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        <button
          type="button"
          className="w-full p-4 bg-transparent font-semibold outline-none flex items-center justify-between rounded-lg"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onFocus={() => onFocus("gender")}
          onBlur={onBlur}
        >
          <span className="flex items-center text-sm font-semibold gap-2">
            {selectedGender.icon} {selectedGender.name}
          </span>
          {isDropdownOpen ? (
            <LucideChevronUp size={20} className="ml-auto" />
          ) : (
            <LucideChevronDown size={20} className="ml-auto" />
          )}
        </button>
        {focusedField === "gender" && (
          <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
            Gender
          </span>
        )}
      </div>

      {isDropdownOpen && (
        <div className="absolute left-0 z-10 w-full mt-2 opacity-100 translate-y-0">
          <ul
            className="w-full text-left bg-white border border-gray-200 shadow-md dark:bg-gray-800 rounded-xl dark:border-gray-700"
            role="listbox"
          >
            {GENDER_OPTIONS.map((option) => (
              <li
                key={option.id}
                data-id={option.id}
                onClick={handleGenderSelect}
                className="flex items-center p-3 text-sm font-medium text-gray-700 cursor-pointer gap-2 dark:text-gray-200 hover:bg-primary-dark-pink/10 transition"
                role="option"
                aria-selected={selectedGender.id === option.id}
              >
                {option.icon}
                {option.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {formErrors.audience && (
        <p className="mt-1 text-sm text-red-500">{formErrors.audience}</p>
      )}
    </div>
  );
};

export default GenderSelector;
