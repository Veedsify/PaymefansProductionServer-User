import {Metadata} from "next";

type RootLayoutProps = {
    children?: React.ReactNode;
}

export const metadata: Metadata = {
    title: "Help & Supports",
    description: "Help & Support From Paymefans"
}
const RootLayout = ({children}: RootLayoutProps) => {
    return <>
        {children}
    </>
}

export default RootLayout