"use client";
import CartIcon from "@/components/sub_components/cart-icon";
import { fetstoreProps, StoreProduct } from "@/types/components";
import fetchStoreProducts from "@/utils/data/fetch-store-products";
import { ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import numeral from "numeral";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import _ from "lodash";

const Store = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const getProducts = useCallback(async () => {
    setLoading(true);
    const product = await fetchStoreProducts();

    if ('error' in product && product.error === true) {
      setLoading(false);
      toast.error(product.message as string);
      return;
    }
    
    setProducts(prev => _.uniqBy([...prev, ...product.data as StoreProduct[] || []], "id"));
    setLoading(false);
  }, []);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  return (
    <section>
      <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="font-bold text-xl flex-shrink-0 mb-3 md:hidden">
          Store
        </div>
        <header>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              All Products
            </h2>
            <CartIcon />
          </div>

          <p className="mt-4 max-w-md text-gray-500 dark:text-white">
            Paymefans store is a platform where you can buy products
            and merchandise from your favorite models. We offer a wide range of
            products, including clothing, accessories, and more. 
          </p>
        </header>

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-white">
            Showing <span> 4 </span> of 40
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center mt-4 min-h-96">
            <ShoppingCart className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products?.map((product) => (
              <li key={product.id}>
                <Link
                  href={`/store/product/${product.product_id}`}
                  className="group block overflow-hidden"
                >
                  <Image
                    src={product.images[0].image_url}
                    alt=""
                    width={480}
                    height={640}
                    priority
                    className="aspect-[3/4] w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="relative bg-white pt-3 p-3 dark:bg-slate-900 dark:text-white">
                    <p className="mb-2">
                      <span className="tracking-wider text-xl text-gray-900 dark:text-white">
                        {product.name}
                      </span>
                    </p>
                    <h3 className="dark:text-white text-gray-700 group-hover:underline group-hover:underline-offset-4">
                      ₦ {numeral(product.price).format("0,0.00")}
                    </h3>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {products?.length === 0 && (
          <div className="flex items-center justify-center mt-4 min-h-96">
            <p className="text-gray-500 dark:text-white">
              No products available
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Store;
