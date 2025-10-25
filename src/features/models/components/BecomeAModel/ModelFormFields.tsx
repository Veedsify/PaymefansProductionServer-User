"use client";

import type React from "react";
import { countries } from "@/lib/Locations";
import type { ModelSignUpData, FormErrors } from "../../types";

interface ModelFormFieldsProps {
  formData: Partial<ModelSignUpData>;
  formErrors: FormErrors;
  focusedField: string | null;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => void;
  onFocus: (fieldName: string) => void;
  onBlur: () => void;
}

const ModelFormFields: React.FC<ModelFormFieldsProps> = ({
  formData,
  formErrors,
  focusedField,
  onInputChange,
  onFocus,
  onBlur,
}) => {
  return (
    <div className="space-y-4">
      {/* First Name */}
      <div className="relative">
        <div
          className={`relative border-1 rounded-lg transition-all duration-200 ${
            focusedField === "firstname"
              ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
              : formErrors.firstname
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <input
            onChange={onInputChange}
            onFocus={() => onFocus("firstname")}
            onBlur={onBlur}
            type="text"
            placeholder="First name"
            name="firstname"
            value={formData.firstname || ""}
            className="w-full p-4 bg-transparent font-semibold outline-none rounded-lg"
            aria-invalid={!!formErrors.firstname}
            aria-describedby={
              formErrors.firstname ? "firstname-error" : undefined
            }
          />
          {focusedField === "firstname" && (
            <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
              First Name
            </span>
          )}
        </div>
        {formErrors.firstname && (
          <p id="firstname-error" className="mt-1 text-sm text-red-500">
            {formErrors.firstname}
          </p>
        )}
      </div>

      {/* Last Name */}
      <div className="relative">
        <div
          className={`relative border rounded-lg transition-all duration-200 ${
            focusedField === "lastname"
              ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
              : formErrors.lastname
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <input
            onChange={onInputChange}
            onFocus={() => onFocus("lastname")}
            onBlur={onBlur}
            type="text"
            placeholder="Last name"
            name="lastname"
            value={formData.lastname || ""}
            className="w-full p-4 bg-transparent font-semibold outline-none rounded-lg"
            aria-invalid={!!formErrors.lastname}
            aria-describedby={
              formErrors.lastname ? "lastname-error" : undefined
            }
          />
          {focusedField === "lastname" && (
            <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
              Last Name
            </span>
          )}
        </div>
        {formErrors.lastname && (
          <p id="lastname-error" className="mt-1 text-sm text-red-500">
            {formErrors.lastname}
          </p>
        )}
      </div>

      {/* Date of Birth */}
      <div className="relative">
        <div
          className={`relative border rounded-lg transition-all duration-200 ${
            focusedField === "dob"
              ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
              : formErrors.dob
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <input
            onChange={onInputChange}
            onFocus={() => onFocus("dob")}
            onBlur={onBlur}
            type="date"
            name="dob"
            placeholder="Date of Birth"
            defaultValue="2018-01-01"
            className="w-full p-4 bg-transparent font-semibold outline-none rounded-lg"
            aria-invalid={!!formErrors.dob}
            aria-describedby={formErrors.dob ? "dob-error" : undefined}
          />
          {focusedField === "dob" && (
            <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
              Date of Birth
            </span>
          )}
        </div>
        {formErrors.dob && (
          <p id="dob-error" className="mt-1 text-sm text-red-500">
            {formErrors.dob}
          </p>
        )}
      </div>

      {/* Country Selection */}
      <div className="relative">
        <div
          className={`relative border rounded-lg transition-all duration-200 ${
            focusedField === "country"
              ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
              : formErrors.country
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <select
            onChange={onInputChange}
            onFocus={() => onFocus("country")}
            onBlur={onBlur}
            value={formData.country || ""}
            className="w-full p-4 bg-transparent font-semibold outline-none rounded-lg"
            name="country"
            aria-invalid={!!formErrors.country}
          >
            <option value="" disabled>
              Select Country
            </option>
            {countries.map((location) => (
              <option
                value={location.code ? location.name : ""}
                key={location.code}
              >
                {location.name}
              </option>
            ))}
            <option value="uk">UK</option>
          </select>
          {focusedField === "country" && (
            <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
              Country
            </span>
          )}
        </div>
        {formErrors.country && (
          <p className="mt-1 text-sm text-red-500">{formErrors.country}</p>
        )}
      </div>

      {/* Referral Code */}
      <div className="relative">
        <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">
          Do you have a referral code?
        </p>
        <div
          className={`relative border rounded-lg transition-all duration-200 ${
            focusedField === "referral_code"
              ? "border-primary-dark-pink shadow-lg shadow-primary-dark-pink/20"
              : formErrors.referral_code
              ? "border-red-500"
              : "border-gray-300 dark:border-gray-700"
          }`}
        >
          <input
            onChange={onInputChange}
            onFocus={() => onFocus("referral_code")}
            onBlur={onBlur}
            type="text"
            placeholder="Referral Code : PF-000000"
            name="referral_code"
            value={formData.referral_code || ""}
            className="w-full p-4 bg-transparent font-semibold outline-none rounded-lg"
            aria-invalid={!!formErrors.referral_code}
            aria-describedby={
              formErrors.referral_code ? "referral_code-error" : undefined
            }
          />
          {focusedField === "referral_code" && (
            <span className="absolute -top-3 left-3 px-2 text-xs font-semibold bg-white dark:bg-gray-900 text-primary-dark-pink">
              Referral Code
            </span>
          )}
        </div>
        {formErrors.referral_code && (
          <p id="referral_code-error" className="mt-1 text-sm text-red-500">
            {formErrors.referral_code}
          </p>
        )}
      </div>

      {/* Availability */}
      <div>
        <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">
          Are you available hookup?
        </p>
        <div className="flex gap-6">
          <label className="inline-flex items-center font-medium text-gray-600 cursor-pointer gap-2 dark:text-gray-300">
            <input
              onChange={onInputChange}
              type="radio"
              name="available"
              value="yes"
              checked={formData.available === "yes"}
              className="w-5 h-5 outline-none accent-primary-dark-pink"
            />
            Yes
          </label>
          <label className="inline-flex items-center font-medium text-gray-600 cursor-pointer gap-2 dark:text-gray-300">
            <input
              onChange={onInputChange}
              type="radio"
              name="available"
              value="no"
              checked={formData.available === "no"}
              className="w-5 h-5 outline-none accent-primary-dark-pink"
            />
            No
          </label>
        </div>
        {formErrors.available && (
          <p className="mt-1 text-sm text-red-500">{formErrors.available}</p>
        )}
      </div>
    </div>
  );
};

export default ModelFormFields;
