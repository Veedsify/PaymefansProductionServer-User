"use client";
import { countries } from "@/lib/Locations";
import { useUserAuthContext } from "@/lib/UserUseContext";
import { postAudienceDataProps2 } from "@/types/Components";
import { ValidateModelPayment } from "@/utils/data/ModelSignup";
import {
  LucideChevronDown,
  LucideChevronUp,
  LucideEye,
  LucideLoader2,
  LucideUser,
  LucideUser2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ChangeEvent,
  MouseEvent,
  useCallback,
  useState,
  useEffect,
  useMemo,
} from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";

// Constants
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

const SIGNUP_FEE_KOBO = 10000 * 100; // 10,000 NGN in kobo
const STORAGE_KEY = "modelSignupData";

interface ModelSignUpData {
  firstname: string;
  lastname: string;
  dob: string;
  country: string;
  available: string;
  audience?: string;
  reference?: string;
}

interface FormErrors {
  firstname?: string;
  lastname?: string;
  dob?: string;
  country?: string;
  available?: string;
  audience?: string;
}

const BecomeAModel = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUserAuthContext();

  // State management
  const [formData, setFormData] = useState<Partial<ModelSignUpData>>({});
  const [selectedGender, setSelectedGender] = useState<postAudienceDataProps2>({
    id: 0,
    icon: <LucideEye size={20} className="inline" />,
    name: "Choose Gender",
  });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

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

    if (selectedGender.name === "Choose Gender") {
      errors.audience = "Please select a gender";
    }

    if (!formData.country || formData.country === "1") {
      errors.country = "Please select a country";
    }

    if (!formData.available) {
      errors.available = "Please indicate your availability";
    }

    return errors;
  }, [formData, selectedGender]);

  // Event handlers
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error when user starts typing
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
      }
    },
    [formErrors]
  );

  const handleGenderSelect = useCallback(
    (e: MouseEvent<HTMLLIElement>) => {
      const id = e.currentTarget.getAttribute("data-id");
      const gender = GENDER_OPTIONS.find((option) => option.id === Number(id));

      if (gender) {
        setSelectedGender(gender);
        setIsDropdownOpen(false);

        // Clear gender error
        if (formErrors.audience) {
          setFormErrors((prev) => ({ ...prev, audience: undefined }));
        }
      }
    },
    [formErrors.audience]
  );

  const handleSubmit = useCallback(
    async (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

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
          country: formData.country!,
          available: formData.available!,
          audience: selectedGender.name,
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
    [formData, selectedGender, user, validateForm]
  );

  // Render loading state
  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center h-[30dvh]">
        <LucideLoader2 className="animate-spin" size={40} stroke="#FF007A" />
      </div>
    );
  }

  // Render verified model state
  if (userStatus === "verified") {
    return (
      <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Already verified model"
          className="w-3/5 mx-auto block"
        />
        <div>
          <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl">
            You&apos;re already a verified model on Paymefans
          </h1>
          <div className="text-center">
            <Link
              href="/profile"
              className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold m-3 rounded-md inline-block"
            >
              Go to Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Render unverified model state
  if (userStatus === "unverified") {
    return (
      <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Unverified model"
          className="w-1/5 mx-auto block"
        />
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl">
            Verification Pending
          </h1>
          <p className="text-center mb-6">
            You&apos;ve already signed up as a model on Paymefans.
            <br />
            Please complete your verification to start earning.
          </p>
          <Link
            href="/verification"
            className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold rounded-md"
          >
            Complete Verification
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="py-8 bg-white dark:bg-gray-900 rounded-2xl p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary-dark-pink md:hidden block">
        Become a Model
      </h1>

      <form className="space-y-4">
        {/* First Name */}
        <div>
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="First name"
            name="firstname"
            value={formData.firstname || ""}
            className={`border p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition ${
              formErrors.firstname
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            aria-invalid={!!formErrors.firstname}
            aria-describedby={
              formErrors.firstname ? "firstname-error" : undefined
            }
          />
          {formErrors.firstname && (
            <p id="firstname-error" className="text-red-500 text-sm mt-1">
              {formErrors.firstname}
            </p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <input
            onChange={handleInputChange}
            type="text"
            placeholder="Last name"
            name="lastname"
            value={formData.lastname || ""}
            className={`border p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition ${
              formErrors.lastname
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            aria-invalid={!!formErrors.lastname}
            aria-describedby={
              formErrors.lastname ? "lastname-error" : undefined
            }
          />
          {formErrors.lastname && (
            <p id="lastname-error" className="text-red-500 text-sm mt-1">
              {formErrors.lastname}
            </p>
          )}
        </div>

        {/* Date of Birth */}
        <div>
          <input
            onChange={handleInputChange}
            type="date"
            name="dob"
            value={formData.dob || ""}
            max={new Date(
              Date.now() - 18 * 365 * 24 * 60 * 60 * 1000
            ).toISOString()}
            className={`border p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition ${
              formErrors.dob
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            aria-invalid={!!formErrors.dob}
            aria-describedby={formErrors.dob ? "dob-error" : undefined}
          />
          {formErrors.dob && (
            <p id="dob-error" className="text-red-500 text-sm mt-1">
              {formErrors.dob}
            </p>
          )}
        </div>

        {/* Gender Selection */}
        <div className="relative">
          <button
            type="button"
            className={`border p-4 w-full rounded-lg font-semibold outline-none flex items-center justify-between bg-white dark:bg-gray-800 transition focus:ring-2 focus:ring-primary-dark-pink ${
              formErrors.audience
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <span className="flex gap-2 items-center text-sm font-semibold">
              {selectedGender.icon} {selectedGender.name}
            </span>
            {isDropdownOpen ? (
              <LucideChevronUp size={20} className="ml-auto" />
            ) : (
              <LucideChevronDown size={20} className="ml-auto" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute z-10 w-full left-0 mt-2 opacity-100 translate-y-0">
              <ul
                className="bg-white dark:bg-gray-800 rounded-xl shadow-md text-left w-full border border-gray-200 dark:border-gray-700"
                role="listbox"
              >
                {GENDER_OPTIONS.map((option) => (
                  <li
                    key={option.id}
                    data-id={option.id}
                    onClick={handleGenderSelect}
                    className="p-3 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium hover:bg-primary-dark-pink/10 cursor-pointer transition"
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
            <p className="text-red-500 text-sm mt-1">{formErrors.audience}</p>
          )}
        </div>

        {/* Country Selection */}
        <div>
          <select
            onChange={handleInputChange}
            value={formData.country || ""}
            className={`border p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition bg-white dark:bg-gray-800 ${
              formErrors.country
                ? "border-red-500 dark:border-red-500"
                : "border-gray-300 dark:border-gray-700"
            }`}
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
          {formErrors.country && (
            <p className="text-red-500 text-sm mt-1">{formErrors.country}</p>
          )}
        </div>

        {/* Availability */}
        <div>
          <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">
            Are you available hookup?
          </p>
          <div className="flex gap-6">
            <label className="inline-flex cursor-pointer items-center font-medium gap-2 text-gray-600 dark:text-gray-300">
              <input
                onChange={handleInputChange}
                type="radio"
                name="available"
                value="yes"
                checked={formData.available === "yes"}
                className="accent-primary-dark-pink h-5 w-5 outline-none"
              />
              Yes
            </label>
            <label className="inline-flex cursor-pointer items-center font-medium gap-2 text-gray-600 dark:text-gray-300">
              <input
                onChange={handleInputChange}
                type="radio"
                name="available"
                value="no"
                checked={formData.available === "no"}
                className="accent-primary-dark-pink h-5 w-5 outline-none"
              />
              No
            </label>
          </div>
          {formErrors.available && (
            <p className="text-red-500 text-sm mt-1">{formErrors.available}</p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-primary-dark-pink w-full p-3 rounded-xl mt-8 text-white font-semibold shadow-md hover:bg-primary-dark-pink/90 transition cursor-pointer flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              Processing Payment
              <LucideLoader2 className="animate-spin ml-2" size={20} />
            </>
          ) : (
            "Sign Up (₦10,000)"
          )}
        </button>
      </form>
    </div>
  );
};

export default BecomeAModel;
