import {Metadata} from "next";

interface WalletLayout {
    children: React.ReactNode;
}

export  const metadata: Metadata = {
    title: "Add Bank Account",
    description: `Add a bank account to the wallet account`,
}

export default function WalletAddLayout({children}: WalletLayout) {
    return <>{children}</>
}