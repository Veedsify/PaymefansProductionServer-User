"use client";

import { getToken } from "@/utils/cookie.get";
import axios from "axios";
import { ChangeEvent, useState } from "react";
import toast from "react-hot-toast";
import swal from "sweetalert";

const UpdatePasswords = () => {
    const token = getToken()
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNpassword: "",
    });

    const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        if (passwords.newPassword !== passwords.confirmNpassword) {
            swal({
                title: "Error", text: "Confirm that new password match", icon: "error", buttons: {
                    cancel: true,
                    catch: {
                        className: "text-white bg-primary-dark-pink border-none shadow-none",
                        text: "Retry",
                    },
                }
            });
            return;
        }
        if (passwords.newPassword.length < 6) {
            swal({
                title: "Error", text: "New password must be at least 6 characters", icon: "error", buttons: {
                    cancel: true,
                    catch: {
                        className: "text-white bg-primary-dark-pink",
                        text: "Retry",
                    },
                }
            });
            return;
        }

        // call api to update password
        async function updatePassword() {
            const res = await axios.patch(`${process.env.NEXT_PUBLIC_TS_EXPRESS_URL}/settings/update/password`, {
                ...passwords,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            });

            return res.data;
        }
        try {
            const reset = await updatePassword();
            if (reset.status === false) {
                toast.error(reset.message);
                return;
            }
            toast.success("Password updated successfully");
        } catch (error: any) {
            toast.error(error.message);
            return;
        }
    }

    return (
        <div>
            <input
                type="password"
                name="oldPassword"
                className="w-full block border mb-3 border-gray-300 p-4 outline-none text-black rounded-xl dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                onChange={handleChange}
                placeholder="Old Password "
            />
            <input
                type="password"
                name="newPassword"
                className="w-full block border mb-3 border-gray-300 p-4 outline-none text-black rounded-xl dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                onChange={handleChange}
                placeholder="New Password "
            />
            <input
                type="password"
                name="confirmNpassword"
                className="w-full block border mb-3 border-gray-300 p-4 outline-none text-black rounded-xl dark:border-gray-600 dark:bg-gray-950 dark:text-white"
                onChange={handleChange}
                placeholder="Re-enter new Password "
            />
            <input
                type="submit"
                onClick={handleSubmit}
                value={"Update Password"}
                className="w-full block border dark:border-none mb-3 bg-primary-dark-pink p-4 outline-none text-white rounded-xl cursor-pointer"
            />
        </div>
    );
};

export default UpdatePasswords;
