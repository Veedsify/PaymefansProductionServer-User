"use client";
import { useState, useEffect, useRef, ChangeEvent } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import { acceptedBankTypes } from "@/utils/data/AcceptedBankCountries";

type CountrySelectorProps = {
  acceptedBankCountries: {
    countryIso: string;
    name: string;
    bankType: string;
  }[];
  onCountryChange?: (countryIso: keyof typeof acceptedBankTypes, bankType: string) => void;
  defaultCountry?: string;
};

const CountrySelector = ({
  acceptedBankCountries = [],
  onCountryChange,
  defaultCountry,
}: CountrySelectorProps) => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find the current country object
  const currentCountry =
    acceptedBankCountries.find((c) => c.countryIso === selectedCountry) || null;

  // Filter countries based on search term
  const filteredCountries = searchTerm
    ? acceptedBankCountries.filter((country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    : acceptedBankCountries;

  // Handle selection
  const handleSelect = (countryIso: keyof typeof acceptedBankTypes, bankType: string) => {
    if (countryIso !== selectedCountry) {
      setSelectedCountry(countryIso);
      if (onCountryChange) onCountryChange(countryIso, bankType);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  // Handle dropdown key navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchTerm("");
        break;
      case "ArrowDown":
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
        break;
      case "Tab":
        if (!e.shiftKey) {
          setIsOpen(false);
          setSearchTerm("");
        }
        break;
      default:
        break;
    }
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Announce selected country for screen readers
  useEffect(() => {
    if (currentCountry && !isOpen) {
      const announcement = `Selected country: ${currentCountry.name}`;
      const ariaLive = document.getElementById("country-selector-live");
      if (ariaLive) {
        ariaLive.textContent = announcement;
      }
    }
  }, [currentCountry, isOpen]);

  // Fix: Keep selectedCountry in sync with defaultCountry prop changes
  useEffect(() => {
    if (defaultCountry && defaultCountry !== selectedCountry) {
      setSelectedCountry(defaultCountry);
    }
    // Only run if defaultCountry changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultCountry]);

  // Defensive: handle if acceptedBankCountries changes (reset if selected no longer present)
  useEffect(() => {
    if (
      selectedCountry &&
      !acceptedBankCountries.some((c) => c.countryIso === selectedCountry)
    ) {
      setSelectedCountry(acceptedBankCountries[0]?.countryIso || "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedBankCountries]);

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      {/* Accessibility announcement */}
      <div
        id="country-selector-live"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      ></div>

      {/* Selected country button */}
      <button
        id="country-selector-button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls="country-listbox"
        aria-label="Select country"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          setIsOpen((open) => !open);
        }}
        onKeyDown={handleKeyDown}
        className="flex items-center justify-between w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-primary-dark-pink focus:outline-none focus:ring-2 focus:ring-primary-dark-pink focus:ring-opacity-50 transition-all duration-200"
      >
        <div className="flex items-center space-x-3">
          {/* Flag - with fallback */}
          {currentCountry && (
            <Image
              src={`https://flagcdn.com/h20/${currentCountry.countryIso.toLowerCase()}.png`}
              alt=""
              width={24}
              height={16}
              aria-hidden="true"
              className="w-6 h-4 object-cover rounded-sm shadow-sm"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" fill="%23f0f0f0"/></svg>';
              }}
            />
          )}
          <span className="font-medium text-gray-800">
            {currentCountry?.name || "Select Country"}
          </span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transform origin-top transition-all duration-200 ease-in-out animate-fadeIn">
          {/* Search input */}
          <div className="p-2 border-b border-gray-200">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search countries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary-dark-pink"
              aria-label="Search countries"
              aria-controls="country-listbox"
              autoComplete="off"
            />
          </div>

          {/* Countries list */}
          <div
            id="country-listbox"
            role="listbox"
            aria-label="Countries"
            tabIndex={-1}
            className="max-h-60 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
          >
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country: any) => (
                <div
                  key={country.countryIso}
                  id={`country-option-${country.countryIso}`}
                  role="option"
                  aria-selected={selectedCountry === country.countryIso}
                  onClick={() =>
                    handleSelect(country.countryIso, country.bankType)
                  }
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(country.countryIso, country.bankType);
                    }
                  }}
                  className={`flex items-center w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 cursor-pointer ${selectedCountry === country.countryIso
                    ? "bg-primary-dark-pink text-white bg-opacity-10 font-medium"
                    : ""
                    }`}
                >
                  <div className="flex items-center space-x-3">
                    {/* Flag */}
                    <Image
                      width={24}
                      height={16}
                      src={`https://flagcdn.com/w40/${country.countryIso.toLowerCase()}.png`}
                      alt=""
                      aria-hidden="true"
                      className="w-6 h-4 object-cover rounded-sm shadow-sm"
                      onError={(e: any) => {
                        e.target.onerror = null;
                        e.target.src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="16" viewBox="0 0 24 16"><rect width="24" height="16" fill="%23f0f0f0"/>';
                      }}
                    />
                    <span
                      className={`${selectedCountry === country.countryIso
                        ? "text-primary-dark-pink"
                        : "text-gray-800"
                        }`}
                    >
                      {country.name}
                    </span>
                  </div>

                  {selectedCountry === country.countryIso && (
                    <div className="ml-auto" aria-hidden="true">
                      <svg
                        className="w-5 h-5 text-primary-dark-pink"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-3 text-gray-500 text-center">
                No countries found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
