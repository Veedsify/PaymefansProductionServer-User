"use client"
import { ReactNode, useEffect } from "react";
import useUserContext from "@/contexts/user-context";

const UserSessionProvider = ({ children, user }: { children: ReactNode, user: any }) => {
    const { setUser } = useUserContext()
    useEffect(() => {
        if (user) {
            setUser(user)
        }
    }, [user, setUser]);
    return (
        <>
            {children}
        </>
    )
}

export default UserSessionProvider