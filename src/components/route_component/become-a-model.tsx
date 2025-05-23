"use client";
import { countries } from "@/lib/locations";
import { useUserAuthContext } from "@/lib/userUseContext";
import {
  postAudienceDataProps,
  postAudienceDataProps2,
} from "@/types/components";
import { ValidateModelPayment } from "@/utils/data/model-signup";
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
import PaystackPop from '@paystack/inline-js'
import { useRouter } from "next/navigation";
import {
  ChangeEvent,
  MouseEvent,
  useState,
} from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";

const postAudienceData: postAudienceDataProps2[] = [
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

interface ModelSignUpProps {
  firstname?: string;
  lastname?: string;
  dob?: string;
  country?: string;
  available?: string;
  audience?: string;
}

const BecomeAModel = () => {
  const router = useRouter();
  const { user } = useUserAuthContext();
  const [modelSignUpdata, setModelSignUpData] = useState<ModelSignUpProps>({});
  const [dropdown, setDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postAudience, setPostAudience] = useState<postAudienceDataProps2>({
    id: 0,
    icon: <LucideEye size={20} className="inline" />,
    name: "Choose Gender",
  });

  const updatePostAudience = (e: MouseEvent<HTMLLIElement>) => {
    const id = e.currentTarget.getAttribute("data-id");
    const audience = postAudienceData.find(
      (audience) => audience.id === Number(id)
    ) as postAudienceDataProps;
    setPostAudience(audience);
    setDropdown(false);
  };

  const updateModelSignUpData = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setModelSignUpData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const submitData = async (e: MouseEvent<HTMLButtonElement>) => {
    if (!modelSignUpdata.firstname)
      return toast.error("Please insert a firstname");
    if (!modelSignUpdata.lastname)
      return toast.error("Please insert a lastname");
    if (!modelSignUpdata.dob) return toast.error("Please insert a date ");
    if (postAudience.name === "Choose Gender")
      return toast.error("Please select a gender");
    if (!modelSignUpdata.country)
      return toast.error("Please select a country ");
    if (!modelSignUpdata.available)
      return toast.error("Please select a if you'd be available for hookup ");

    try {
      setLoading(true);

      async function payWithPaystack() {
        const popup = new PaystackPop()
        popup.checkout({
          key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
          amount: Number(10_000 * 100),
          email: user?.email as string,
          firstName: modelSignUpdata.firstname,
          lastName: modelSignUpdata.lastname,
          onCancel: async function () {
            swal({
              icon: "error",
              title: "Transaction Cancelled",
              text: "You have cancelled the transaction",
            });
            setLoading(false);
          },
          onSuccess: async (transaction) => {
            if (transaction.status) {
              const data = await ValidateModelPayment(transaction.status, transaction.reference, { ...modelSignUpdata, audience: postAudience.name });
              setLoading(false);
              if (!data.error) {
                toast.success(String(data.message));
                router.push("/verification");
              }
            }
          }
        })
      }
      payWithPaystack()
    } catch (error: any) {
      console.error(error);
      swal({
        icon: "error",
        title: error.response?.data?.errorTitle || "Error",
        text: error.response?.data?.message || "An error occurred, contact support for help",
      });
      setLoading(false);
    }
  };

  if (user && user?.is_model && user?.Model?.verification_status === true) {
    return (
      <>
        <div>
          <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="w-3/5 mx-auto block"
            />
            <div>
              <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
                Sorry you are already a verified model <br /> on Paymefans
              </h1>
              <div className="text-center">
                <Link
                  href="/profile"
                  className="bg-primary-dark-pink text-white text-sm py-3 px-4 font-bold m-3 rounded-md w-full text-center"
                >
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else if (user?.is_model && user?.Model?.verification_status === false) {
    return (
      <>
        <div>
          <div className="m-3 p-8 px-12 rounded-2xl dark:text-white">
            <Image
              src="/icons/feeling_sorry.svg"
              width={300}
              height={300}
              alt="Sorry you are already a model"
              className="w-1/5 mx-auto block"
            />
            <div className="flex flex-col justify-center align-center">
              <h1 className="text-center mt-6 mb-8 font-bold md:text-3xl text-2xl ">
                You are not verified.
              </h1>
              <p className="text-center">
                You have already signed up as a model on Paymefans, <br />
                Please go to your verification center to complete your
                verification
              </p>
              <div className="text-center">
                <Link
                  href="/verification"
                  className="bg-primary-dark-pink inline-block text-white text-sm py-3 px-4 font-bold m-3 rounded-md text-center"
                >
                  Go to Verification
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return (
      <div className="py-8 bg-white dark:bg-gray-900 rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-6 text-center text-primary-dark-pink md:hidden block">
          Become a Model
        </h1>
        <div className="space-y-4">
          <input
            onChange={updateModelSignUpData}
            type="text"
            placeholder="First name"
            name="firstname"
            className="border border-gray-300 dark:border-gray-700 p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition"
          />
          <input
            onChange={updateModelSignUpData}
            type="text"
            placeholder="Last name"
            name="lastname"
            className="border border-gray-300 dark:border-gray-700 p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition"
          />
          <input
            onChange={updateModelSignUpData}
            type="date"
            placeholder="Date of Birth"
            name="dob"
            className="border border-gray-300 dark:border-gray-700 p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition"
          />
          <div className="relative">
            <button
              type="button"
              className="border border-gray-300 dark:border-gray-700 p-4 w-full rounded-lg font-semibold outline-none flex items-center justify-between bg-white dark:bg-gray-800 transition focus:ring-2 focus:ring-primary-dark-pink"
              onClick={() => setDropdown(!dropdown)}
              data-gender={postAudience.name}
            >
              <span className="flex gap-2 items-center text-sm font-semibold">
                {postAudience.icon} {postAudience.name}
              </span>
              {dropdown ? (
                <LucideChevronUp size={20} className="ml-auto" />
              ) : (
                <LucideChevronDown size={20} className="ml-auto" />
              )}
            </button>
            <div
              className={`absolute z-10 w-full left-0 mt-2 transition-all duration-200 ${dropdown
                ? "opacity-100 translate-y-0 pointer-events-auto"
                : "opacity-0 -translate-y-2 pointer-events-none"
                }`}
            >
              <ul className="bg-white dark:bg-gray-800 rounded-xl shadow-md text-left w-full border border-gray-200 dark:border-gray-700">
                {postAudienceData.map((audience) => (
                  <li
                    key={audience.id}
                    data-id={audience.id}
                    onClick={updatePostAudience}
                    className="p-3 text-sm flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium hover:bg-primary-dark-pink/10 cursor-pointer transition"
                  >
                    {audience.icon}
                    {audience.name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <select
            onChange={updateModelSignUpData}
            defaultValue="1"
            className="border border-gray-300 dark:border-gray-700 p-4 w-full rounded-lg font-semibold outline-none focus:ring-2 focus:ring-primary-dark-pink transition bg-white dark:bg-gray-800"
            name="country"
          >
            <option value={1} disabled>
              (--- Select Country ---)
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
        </div>
        <div className="mt-6">
          <p className="font-medium text-gray-700 dark:text-gray-200 mb-2">
            Are you available to Hookup?
          </p>
          <div className="flex gap-6">
            <label
              className="inline-flex cursor-pointer items-center font-medium gap-2 text-gray-600 dark:text-gray-300"
              htmlFor="yes"
            >
              <input
                onChange={updateModelSignUpData}
                type="radio"
                name="available"
                id="yes"
                value="yes"
                className="accent-primary-dark-pink h-5 w-5 outline-none"
              />
              Yes
            </label>
            <label
              className="inline-flex cursor-pointer items-center font-medium gap-2 text-gray-600 dark:text-gray-300"
              htmlFor="no"
            >
              <input
                onChange={updateModelSignUpData}
                type="radio"
                name="available"
                value="no"
                id="no"
                className="accent-primary-dark-pink h-5 w-5 outline-none"
              />
              No
            </label>
          </div>
        </div>
        <button
          onClick={submitData}
          className="bg-primary-dark-pink w-full p-3 rounded-xl mt-8 text-white font-semibold shadow-md hover:bg-primary-dark-pink/90 transition cursor-pointer flex items-center justify-center disabled:bg-gray-400"
          disabled={loading}
        >
          Signup
          {loading && (
            <span className="ml-2">
              <LucideLoader2
                className="animate-spin"
                size={20}
                stroke="white"
              />
            </span>
          )}
        </button>
      </div>
    );
  }
};

export default BecomeAModel;
