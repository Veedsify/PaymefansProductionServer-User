import CartComponent from "@/components/route_component/cart-component";
import Link from "next/link";

const page = () => {
    return (
        <div className="relative p-2 md:p-5">
            <div className="flex items-center justify-between mb-3">
                <h1 className="md:text-lg font-bold mb-3">
                    Cart
                </h1>
            <span className="text-sm">
                <Link href="/store" className="text-primary-dark-pink hover:text-primary-text-dark-pink duration-200">
                    Continue Shopping
                </Link>
            </span>
            </div>
            <CartComponent />
        </div>
    );
}

export default page;