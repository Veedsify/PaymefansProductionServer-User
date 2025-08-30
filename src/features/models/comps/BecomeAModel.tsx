"use client";
import { countries } from "@/lib/Locations";
import { useAuthContext } from "@/contexts/UserUseContext";
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
  gender: string;
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
  const { user } = useAuthContext();

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
      const gender = GENDER_OPTIONS.find((option) => option.id == Number(id));
      console.log(gender);
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
          gender: selectedGender.name,
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
      <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Already verified model"
          className="block w-3/5 mx-auto"
        />
        <div>
          <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl">
            You&apos;re already a verified model on Paymefans
          </h1>
          <div className="text-center">
            <Link
              href="/profile"
              className="inline-block px-4 py-3 m-3 text-sm font-bold text-white bg-primary-dark-pink rounded-md"
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
      <div className="p-8 px-12 m-3 rounded-2xl dark:text-white">
        <Image
          src="/icons/feeling_sorry.svg"
          width={300}
          height={300}
          alt="Unverified model"
          className="block w-1/5 mx-auto"
        />
        <div className="flex flex-col items-center justify-center">
          <h1 className="mt-6 mb-8 text-2xl font-bold text-center md:text-3xl">
            Verification Pending
          </h1>
          <p className="mb-6 text-center">
            You&apos;ve already signed up as a model on Paymefans.
            <br />
            Please complete your verification to start earning.
          </p>
          <Link
            href="/verification"
            className="px-4 py-3 text-sm font-bold text-white bg-primary-dark-pink rounded-md"
          >
            Complete Verification
          </Link>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="p-6 py-8 bg-white dark:bg-gray-900 rounded-2xl">
      <h1 className="block mb-6 text-2xl font-bold text-center text-primary-dark-pink md:hidden">
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
            <p id="firstname-error" className="mt-1 text-sm text-red-500">
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
            <p id="lastname-error" className="mt-1 text-sm text-red-500">
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
            <p id="dob-error" className="mt-1 text-sm text-red-500">
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
            <span className="flex items-center text-sm font-semibold gap-2">
              {selectedGender.icon} {selectedGender.name}
            </span>
            {isDropdownOpen ? (
              <LucideChevronUp size={20} className="ml-auto" />
            ) : (
              <LucideChevronDown size={20} className="ml-auto" />
            )}
          </button>

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
            <p className="mt-1 text-sm text-red-500">{formErrors.country}</p>
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
                onChange={handleInputChange}
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
                onChange={handleInputChange}
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

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex items-center justify-center w-full p-3 mt-8 font-semibold text-white shadow-md cursor-pointer bg-primary-dark-pink rounded-xl hover:bg-primary-dark-pink/90 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              Processing Payment
              <LucideLoader2 className="ml-2 animate-spin" size={20} />
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
