"use client";

import type React from "react";
import { useState } from "react";
import { LucideEye } from "lucide-react";
import type { postAudienceDataProps2 } from "@/types/Components";
import type { ModelSignUpData, FormErrors } from "../../types";
import ModelFormFields from "./ModelFormFields";
import GenderSelector from "./GenderSelector";
import ModelPaymentHandler from "./ModelPaymentHandler";
import { PiGenderNeuter } from "react-icons/pi";

interface ModelSignupFormProps {
    formData: Partial<ModelSignUpData>;
    formErrors: FormErrors;
    focusedField: string | null;
    isSubmitting: boolean;
    onInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    onFocus: (fieldName: string) => void;
    onBlur: () => void;
    onSubmit: (selectedGender: { name: string }) => void;
}

const ModelSignupForm: React.FC<ModelSignupFormProps> = ({
    formData,
    formErrors,
    focusedField,
    isSubmitting,
    onInputChange,
    onFocus,
    onBlur,
    onSubmit,
}) => {
    const [selectedGender, setSelectedGender] =
        useState<postAudienceDataProps2>({
            id: 0,
            icon: <PiGenderNeuter size={18} className="inline" />,
            name: "Choose Gender",
        });

    const handleSubmit = () => {
        onSubmit(selectedGender);
    };

    return (
        <div className="p-6 pt-8 pb-16 bg-white dark:bg-gray-950 rounded-2xl mb-12">
            <h1 className="block mb-6 text-2xl font-bold text-center text-primary-dark-pink md:hidden">
                Become a Model
            </h1>

            <form className="space-y-4">
                <ModelFormFields
                    formData={formData}
                    formErrors={formErrors}
                    focusedField={focusedField}
                    onInputChange={onInputChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />

                {/* Gender Selection */}
                <GenderSelector
                    selectedGender={selectedGender}
                    setSelectedGender={setSelectedGender}
                    formErrors={formErrors}
                    focusedField={focusedField}
                    onFocus={onFocus}
                    onBlur={onBlur}
                />

                <ModelPaymentHandler
                    isSubmitting={isSubmitting}
                    onSubmit={handleSubmit}
                />
            </form>
        </div>
    );
};

export default ModelSignupForm;
