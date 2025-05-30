"use client";

import axiosInstance from "@/utils/axios";
import { getToken } from "@/utils/cookie.get";
import swal from "sweetalert";
import toast from "react-hot-toast";

const VerificationPageButton = () => {
  const token = getToken();
  const handleButtonClick = () => {
    axiosInstance
      .post(
        "/verification",
        {
          action: "start",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res.data.error) {
          return toast.error(res.data.message);
        }
        swal({
          title: "Verification Started",
          text: "You will be redirected to the verification page",
          icon: "info",
          buttons: ["Cancel", "Continue"],
        }).then((value) => {
          if (value) {
            window.location.href = `${process.env.NEXT_PUBLIC_VERIFICATION_URL}/${res.data.token}`;
          }
        });
      })
      .catch((err) => {
        console.error(err);
        toast.error("An error occurred, please try again later");
      });
  };
  return (
    <div className="mt-12 flex flex-col justify-center items-center">
      <button
        onClick={handleButtonClick}
        className="block w-96 text-center px-3 py-3 text-sm font-bold text-white rounded-lg bg-primary-dark-pink cursor-pointer"
      >
        VERIFY
      </button>
    </div>
  );
};

export default VerificationPageButton;
