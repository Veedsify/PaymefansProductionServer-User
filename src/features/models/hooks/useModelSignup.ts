"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import swal from "sweetalert";
import { useAuthContext } from "@/contexts/UserUseContext";
import { ValidateModelPayment } from "@/utils/data/ModelSignup";
import type { ModelSignUpData, FormErrors } from "../types";
import { SIGNUP_FEE_KOBO, STORAGE_KEY } from "../types";

export const useModelSignup = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthContext();

  // State management
  const [formData, setFormData] = useState<Partial<ModelSignUpData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Memoized values
  const reference = searchParams.get("reference");

  const userStatus = useMemo(() => {
    if (!user) return "loading";
    if (user.is_model && user.Model?.verification_status === true)
      return "verified";
    if (user.is_model && user.Model?.verification_status === false)
      return "unverified";
    return "eligible";
  }, [user]);

  // Handle payment callback
  useEffect(() => {
    if (!reference) {
      setIsPageLoading(false);
      return;
    }

    const handlePaymentCallback = async () => {
      try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (!storedData) {
          throw new Error("Payment data not found");
        }
        const parsedData = JSON.parse(storedData);
        await ValidateModelPayment("success", reference as string, parsedData);
        localStorage.removeItem(STORAGE_KEY);
        router.push("/verification");
      } catch (error) {
        console.error("Payment validation error:", error);
        await swal({
          icon: "error",
          title: "Payment Error",
          text:
            error instanceof Error
              ? error.message
              : "Payment validation failed",
        });
      } finally {
        setIsPageLoading(false);
      }
    };

    handlePaymentCallback();
  }, [reference, router]);

  // Form validation
  const validateForm = useCallback((): FormErrors => {
    const errors: FormErrors = {};

    if (!formData.firstname?.trim()) {
      errors.firstname = "First name is required";
    }

    if (!formData.lastname?.trim()) {
      errors.lastname = "Last name is required";
    }

    if (!formData.dob) {
      errors.dob = "Date of birth is required";
    } else {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dob = "You must be at least 18 years old";
      }
    }

    if (!formData.country || formData.country === "1") {
      errors.country = "Please select a country";
    }

    if (!formData.available) {
      errors.available = "Please indicate your availability";
    }

    return errors;
  }, [formData]);

  // Event handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [formErrors]
  );

  const handleFocus = useCallback((fieldName: string) => {
    setFocusedField(fieldName);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  const handleSubmit = useCallback(
    async (selectedGender: { name: string }) => {
      const errors = validateForm();
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        // Show first error as toast
        const firstError = Object.values(errors)[0];
        toast.error(firstError);
        return;
      }

      setIsSubmitting(true);
      setFormErrors({});

      try {
        // Generate unique reference
        const reference = `REF_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`.toUpperCase();
        const callbackUrl = `${window.location.origin}/models/become-a-model`;

        // Initialize payment with backend
        const response = await fetch(
          "https://api.paystack.co/transaction/initialize",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_SECRET_KEY}`,
            },
            body: JSON.stringify({
              email: user?.email,
              amount: SIGNUP_FEE_KOBO,
              reference,
              callback_url: callbackUrl,
              metadata: {
                type: "model_signup",
                referral: formData.referral_code || null,
                user_id: user?.id,
                firstname: formData.firstname,
                lastname: formData.lastname,
              },
            }),
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to initialize payment");
        }

        const data = await response.json();

        // Store form data for post-payment processing
        const signupData: ModelSignUpData = {
          firstname: formData.firstname!,
          lastname: formData.lastname!,
          dob: formData.dob!,
          gender: selectedGender.name,
          referral_code: formData.referral_code || undefined,
          country: formData.country!,
          available: formData.available!,
          audience: selectedGender.name.toLowerCase(),
          reference,
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(signupData));

        // Redirect to payment
        window.location.href = data.data.authorization_url;
      } catch (error) {
        console.error("Payment initialization error:", error);

        await swal({
          icon: "error",
          title: "Payment Error",
          text:
            error instanceof Error
              ? error.message
              : "Failed to initialize payment",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, user, validateForm]
  );

  return {
    formData,
    setFormData,
    isSubmitting,
    isPageLoading,
    formErrors,
    setFormErrors,
    focusedField,
    setFocusedField,
    userStatus,
    handleInputChange,
    handleFocus,
    handleBlur,
    handleSubmit,
    validateForm,
  };
};
