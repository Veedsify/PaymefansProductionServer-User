"use client"
import { useUserAuthContext } from "@/lib/userUseContext";
import Link from "next/link";

const VerificationAlert = () => {
    const { user } = useUserAuthContext()

    if (user && user.is_model && !user.Model?.verification_status) {
        return (
            <div className="fixed w-full top-0 left-0 z-[999]">
                <div className="bg-primary-dark-pink text-white p-3 opacity-40 duration-200 hover:opacity-100">
                    <p className="text-center text-white text-sm">
                        Your account is not verified. Please verify your account to access all features
                        &nbsp;
                        <Link href="/profile/verification" className="underline">
                            Verification Center
                        </Link>
                    </p>
                </div>
            </div>
        )
    }
}

export default VerificationAlert;