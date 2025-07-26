"use client";
import CartIcon from "@/components/sub_components/CartIcon";
import { StoreProduct } from "@/types/Components.d";
import { ShoppingCart, Loader2, LucideArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import numeral from "numeral";
import { useStoreProducts } from "@/hooks/useStoreProducts";
import { useMemo } from "react";

const Store = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useStoreProducts(12);

  const products = useMemo(() => {
    return data?.pages.flatMap((page) => page.data) || [];
  }, [data]);

  const totalProducts = data?.pages[0]?.totalProducts || 0;

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
            Paymefans store is a platform where you can buy products and
            merchandise from your favorite models. We offer a wide range of
            products, including clothing, accessories, and more.
          </p>
          <Link
            href="/store/orders"
            className="text-primary-dark-pink font-medium inline-flex"
          >
            View My Orders <LucideArrowRight size={20} />
          </Link>
        </header>

        <div className="mt-8">
          <p className="text-sm text-gray-500 dark:text-white">
            Showing <span>{products.length}</span> of {totalProducts} products
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center mt-4 min-h-96">
            <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex items-center justify-center mt-4 min-h-96">
            <p className="text-red-500 dark:text-red-400">
              {error?.message || "Failed to load products"}
            </p>
          </div>
        ) : products.length > 0 ? (
          <>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/store/product/${product.product_id}`}
                    className="group block overflow-hidden"
                  >
                    <Image
                      src={product.images[0]?.image_url || "/placeholder.png"}
                      alt={product.name}
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
            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load More"
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
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
