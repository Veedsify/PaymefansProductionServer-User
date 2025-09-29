"use client";
import { LucideLoader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type MouseEvent,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";
import type { UserRegisterType } from "@/features/user/types/user";
import { countries } from "@/lib/Locations";
import { useUser } from "@/lib/UserContext";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";
import LoadingSpinner from "@/components/common/loaders/LoadingSpinner";

const Register = () => {
  const [country, setCountry] = useState<string>(" -- Select a country -- ");
  const [countryList, setCountryList] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserRegisterType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { setUser, user } = useUser();
  const router = useRouter();
  const UserInputCaptured = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    // Update userData state using spread operator to ensure immutability:
    setUserData({
      ...userData,
      [name]: value,
    } as UserRegisterType);
  };

  useEffect(() => {
    // Update user state in the context only when userData changes:
    if (userData) {
      setUser(userData);
    }
  }, [userData, setUser]);

  const selectCountry = (e: MouseEvent<HTMLButtonElement>) => {
    const code = e.currentTarget.getAttribute("data-code");
    const selectedCountry = countries.find((country) => country.code === code);

    if (selectedCountry) {
      // Only update if a valid country is selected:
      setCountry(selectedCountry.name);
      setUserData({
        ...userData,
        location: selectedCountry.code, //Ensure consistent key name
      } as UserRegisterType);
    }

    setCountryList(false);
  };

  function CreateNewUserFunction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.name) {
      toast.error("Sorry your name is required");
      return;
    }
    if (!user.email) {
      toast.error("Sorry an email address is required");
      return;
    }
    if (!user.phone) {
      toast.error("Sorry a phone number is required");
      return;
    }
    if (!user.location) {
      toast.error("Please select your location");
      return;
    }
    if (!user.password || user.password.length < 5) {
      toast.error("Password length should be more than 5 characters");
      return;
    }
    if (!user.terms) {
      toast.error("Please accept our terms of service");
      return;
    }

    const ValidateAccount = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.post(
          `/auth/signup/validate-registration-details`,
          {
            email: user.email,
            phone: user.phone,
          }
        );
        const data = res.data;

        if (!data.status) {
          setLoading(false);
          toast.error(data.message, {
            id: "validate-error",
          });
        }
        router.push("/register/username");
      } catch (e: any) {
        setLoading(false);
        toast.error(e.response.data.message || e.response.message);
      }
    };
    ValidateAccount();
  }

  return (
    <div className="p-5 bg-black min-h-dvh lg:p-0">
      <div className="items-start justify-center mx-auto lg:grid grid-cols-2">
        <div className="relative hidden min-h-dvh lg:block">
          <Image
            width={1200}
            height={1200}
            priority
            src="/images/auth_image.jpeg"
            alt="Login Image"
            className="absolute inset-0 object-cover w-full h-full"
          />
          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/60 to-black/95"></div>
          {/* Secondary gradient for extra depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        </div>
        <div className="h-full lg:p-14 2xl:p-28">
          <div className="pt-12 mx-auto mb-16 max-w-screen-xl md:mt-16">
            <Link
              href="/"
              className="inline-block transition-transform hover:scale-105"
            >
              <Image
                width={150}
                height={150}
                priority
                className="h-auto w-[150px]"
                src="/site/logo.svg"
                alt="Logo"
              />
            </Link>
          </div>

          <div className="max-w-lg mb-8">
            <h1 className="mb-2 text-3xl font-bold text-white">
              Create your account
            </h1>
            <p className="text-gray-300">
              Join thousands of creators and fans worldwide
            </p>
          </div>
          <form
            action=""
            className="flex-1 w-full mb-6"
            autoComplete="false"
            onSubmit={CreateNewUserFunction}
          >
            <div className="flex flex-col max-w-lg mb-6 gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-gray-300"
              >
                Name
              </label>
              <input
                type="text"
                onChange={UserInputCaptured}
                name="name"
                id="name"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your name"
              />
            </div>

            <div className="flex flex-col max-w-lg mb-6 gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email Address
              </label>
              <input
                type="email"
                onChange={UserInputCaptured}
                name="email"
                id="email"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm"
                placeholder="Enter your email"
              />
            </div>

            <div className="flex flex-col max-w-lg mb-6 gap-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-gray-300"
              >
                Phone Number
              </label>
              <div className="flex">
                <select
                  className="px-3 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 border-r-0 rounded-l-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 backdrop-blur-sm"
                  style={{ maxWidth: 120 }}
                  defaultValue={userData?.countryCode || ""}
                  onChange={(e) => {
                    const selected = countries.find(
                      (c) => c.code === e.target.value
                    );
                    if (selected) {
                      setUserData({
                        ...userData,
                        countryCode: selected.dial_code,
                      } as UserRegisterType);
                    }
                  }}
                >
                  {countries.map((country, idx) => (
                    <option
                      key={idx}
                      value={country.code?.toString()}
                      className="bg-black"
                    >
                      {country?.dial_code} {country?.name}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  onChange={UserInputCaptured}
                  name="phone"
                  id="phone"
                  className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-r-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>
            <div className="flex flex-col max-w-lg mb-6 gap-2 relative">
              <label
                htmlFor="location"
                className="text-sm font-medium text-gray-300"
              >
                Country/Location
              </label>
              <input
                onFocus={() => setCountryList(true)}
                onChange={UserInputCaptured}
                name="location"
                id="location"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm cursor-pointer"
                value={country}
                placeholder="Select your country"
                readOnly
              />
              {countryList && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 p-2 overflow-y-auto bg-white/95 backdrop-blur-md rounded-xl max-h-60 border border-white/20 shadow-xl">
                  {countries.map((country, index) => (
                    <button
                      onClick={selectCountry}
                      data-code={country.code}
                      className="block w-full py-2 px-3 text-sm font-medium text-left text-black rounded-lg hover:bg-primary-dark-pink/10 transition-colors duration-150"
                      key={index}
                      type="button"
                    >
                      {country.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col max-w-lg mb-6 gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Password
              </label>
              <input
                type="password"
                onChange={UserInputCaptured}
                name="password"
                id="password"
                className="block w-full px-4 py-3 text-sm font-medium text-white bg-white/5 border border-white/10 rounded-xl outline-none focus:border-primary-dark-pink/50 focus:ring-2 focus:ring-primary-dark-pink/20 transition-all duration-200 backdrop-blur-sm"
                placeholder="Create a strong password"
              />
            </div>
            <div className="flex items-start w-full mb-8 max-w-lg">
              <input
                type="checkbox"
                name="terms"
                id="terms"
                onChange={UserInputCaptured}
                className="w-4 h-4 mt-1 mr-3 rounded border-white/20 bg-white/5 text-primary-dark-pink focus:ring-primary-dark-pink/50 focus:ring-2 accent-primary-dark-pink"
                value="accepted"
              />
              <label
                htmlFor="terms"
                className="text-sm font-medium text-gray-300 cursor-pointer select-none leading-relaxed"
              >
                I am 18+ and it is legal to access this site in my country. I
                agree to the{" "}
                <span className="text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors">
                  Privacy Policy
                </span>
                .
              </label>
            </div>

            <div className="max-w-lg">
              <button
                type="submit"
                disabled={loading}
                className={`block w-full px-4 py-3 text-sm font-semibold text-white rounded-xl transition-all duration-200 shadow-lg ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-primary-dark-pink to-primary-dark-pink/80 hover:from-primary-dark-pink/90 hover:to-primary-dark-pink/70 hover:shadow-primary-dark-pink/25 hover:shadow-xl active:scale-[0.98]"
                }`}
              >
                {loading ? (
                  <LoadingSpinner text="Creating Account..." />
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <p className="text-sm font-medium text-gray-300">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-dark-pink hover:text-primary-dark-pink/80 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
