import {ReactNode} from "react";
import {Metadata} from "next";

export const metadata: Metadata ={
    title: "Point User",
    description: "Support users withs points",
}

function Layout ({children}: {children: ReactNode}) {
    return <> {children}</>
}

export default Layout;