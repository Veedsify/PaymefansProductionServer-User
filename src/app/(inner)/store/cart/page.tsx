import CartComponent from "@/components/route_component/cart-component";

const page = () => {
    return (
        <div className="relative p-2 md:p-5">
            <div className="flex items-center justify-between mb-3">
                <h1 className="md:text-lg font-bold mb-3">
                    Cart
                </h1>
                <button 
                className="bg-primary-dark-pink hover:bg-primary-text-dark-pink duration-200 text-white text-sm font-bold py-2 px-4 rounded-lg"
                >   
                 Checkout
                </button>
            </div>
            <CartComponent />
        </div>
    );
}

export default page;