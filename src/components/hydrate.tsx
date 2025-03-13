"use client"

import { ReactNode, use, useEffect, useState } from "react";

const HydrateComponent = ({ children }: { children: ReactNode }) => {
    const [loading, setLoading] = useState<boolean>(true);
    useEffect(() => {
        setLoading(false);
    }, []);
    return (
        <div>
            {loading && <div>Loading...</div>}
            {!loading && (
                <>
                    {children}
                </>
            )}
        </div>
    );
}

export default HydrateComponent;