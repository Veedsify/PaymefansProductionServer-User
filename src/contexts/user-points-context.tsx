"use client"
import { createContext, ReactNode, useContext, useState } from "react";

interface UserPointsContextValue {
    points: number;
    updatePoints: (newPoints: number) => void;
}

const UserPointsContext = createContext<UserPointsContextValue | null>(null);

export const useUserPointsContext = () => {
    const context = useContext(UserPointsContext);
    if (!context) {
        throw new Error("useUserPointsContext must be used within a UserPointsContextProvider or points is undefined");
    }
    return context;
}

interface UserPointsContextProviderProps {
    children: ReactNode;
}

export const UserPointsContextProvider = ({ children }: UserPointsContextProviderProps) => {
    const [points, setPoints] = useState(0);

    const updatePoints = (newPoints: any) => {
        setPoints(newPoints);
    }

    return (
        <UserPointsContext.Provider value={{ points, updatePoints }}>
            {children}
        </UserPointsContext.Provider>
    );
}
