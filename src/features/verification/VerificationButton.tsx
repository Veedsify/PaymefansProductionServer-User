"use client";

import toast from "react-hot-toast";
import swal from "sweetalert";
import axiosInstance from "@/utils/Axios";
import { getToken } from "@/utils/Cookie";

const VerificationPageButton = () => {
  const handleButtonClick = () => {
    axiosInstance
      .post("/verification", {
        action: "start",
      })
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
    <div className="flex flex-col items-center justify-center mt-12">
      <button
        onClick={handleButtonClick}
        className="block px-3 py-3 text-sm font-bold text-center text-white rounded-lg cursor-pointer w-96 bg-primary-dark-pink"
      >
        VERIFY
      </button>
    </div>
  );
};

export default VerificationPageButton;
