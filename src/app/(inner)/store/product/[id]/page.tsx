"use client";
import React, { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { Product } from "@/types/Components";
import fetchSingleProduct from "@/utils/data/FetchSingleProduct";
import CartIcon from "@/components/sub_components/CartIcon";
import numeral from "numeral";
import Loader from "@/components/lib_components/LoadingAnimation";
import Link from "next/link";
import { useCartStore } from "@/contexts/StoreContext";
import { useWishlistStore } from "@/contexts/WishlistContext";
import { useToggleWishlist } from "@/hooks/useWishlist";
import toast from "react-hot-toast";
import Image from "next/image";

const ProductPreview = () => {
  const params = useParams();
  const { addProduct, cart } = useCartStore();
  const { isInWishlist } = useWishlistStore();
  const { toggleWishlist, isLoading: wishlistLoading } = useToggleWishlist();
  const [selectedImage, setSelectedImage] = useState(0);
  // const [selectedSize, setSelectedSize] = useState<string | null>(null);
  // const [selectedColor, setSelectedColor] = useState(null);
  // const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const selectedSize = searchParams.get("size") ?? null;
  const selectedColor = searchParams.get("color") ?? null;
  const selectedQuantity = searchParams.get("quantity") ?? 1;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetchSingleProduct(params.id as string);
        if (response.error) {
          setError(response.message as string);
          return;
        }
        setProduct(response.data as Product);
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.id]);

  const AddItemToCart = () => {
    if (!product) return;

    // Validate size selection
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }

    // Find the complete size object from product.sizes
    const selectedSizeObject = product.sizes.find(
      (size) => size.size.name === selectedSize,
    );

    if (!selectedSizeObject) {
      toast.error("Selected size not available");
      return;
    }

    const findProductIncart = cart.find(
      (p) =>
        p.product_id === product.product_id && p.size?.name === selectedSize,
    );

    if (findProductIncart) {
      toast.error("Product with this size already in cart");
      return;
    }

    addProduct({
      id: product!.id,
      name: product!.name,
      price: product!.price,
      images: product!.images,
      size: {
        id: selectedSizeObject.size.id,
        name: selectedSizeObject.size.name,
      },
      quantity: Number(selectedQuantity),
      description: product!.description,
      instock: product!.instock,
      category: product!.category,
      product_id: product!.product_id,
    });
    toast.success("Product added to cart");
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product.product_id, product);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-dvh">
        <Loader2 className="w-10 h-10 animate-spin" />;
      </div>
    );
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>No product found</div>;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length,
    );
  };

  return (
    <div className="bg-white min-h-dvh dark:bg-black">
      {/* Main Container */}
      <div className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              <Link href="/store">Store</Link>
            </h2>
            <CartIcon />
          </div>

          <p className="max-w-md mt-4 text-slate-500 dark:text-slate-300">
            Get the best of products from your favorite creators
          </p>
        </header>
        {/* Product Grid */}
        <div className="h-full pb-20 grid grid-cols-1 xl:grid-cols-2 gap-8 md:pb-0">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
              <Image
                width={640}
                unoptimized
                height={480}
                src={product.images[selectedImage]?.image_url}
                alt={`Product view ${selectedImage + 1}`}
                className="object-cover w-full h-full"
              />

              {/* Navigation Arrows */}
              <button
                onClick={previousImage}
                className="absolute p-2 rounded-full left-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700"
              >
                <ChevronLeft className="w-6 h-6 dark:text-white" />
              </button>
              <button
                onClick={nextImage}
                className="absolute p-2 rounded-full right-4 top-1/2 -translate-y-1/2 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700"
              >
                <ChevronRight className="w-6 h-6 dark:text-white" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index
                      ? "ring-2 ring-black dark:ring-white"
                      : ""
                  }`}
                >
                  <Image
                    width={200}
                    height={200}
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                ₦ {numeral(product.price).format("0,0.00")}
              </p>
            </div>

            {/* Description */}
            <p className="text-slate-600 dark:text-slate-300">
              {product.description}
            </p>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Size
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size, index) => (
                  <Link
                    key={index}
                    href={`?${String(
                      new URLSearchParams({
                        ...Object.fromEntries(searchParams.entries()),
                        size: size.size.name,
                      }),
                    )}`}
                    className={`py-2 text-center block text-sm font-medium rounded-md ${
                      selectedSize === size.size.name
                        ? "bg-primary-dark-pink text-white"
                        : "bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {size.size.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900 dark:text-white">
                Quantity
              </h3>
              <div className="flex items-center gap-4">
                <Link
                  href={`?${String(
                    new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      quantity:
                        Number(selectedQuantity) > 1
                          ? String(Number(selectedQuantity) - 1)
                          : "1",
                    }),
                  )}`}
                  // onClick={() =>
                  //   setSelectedQuantity((prev) => Math.max(prev - 1, 1))
                  // }
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:text-white"
                >
                  -
                </Link>
                <span className="text-lg font-semibold dark:text-white">
                  {selectedQuantity}
                </span>
                <Link
                  href={`?${String(
                    new URLSearchParams({
                      ...Object.fromEntries(searchParams.entries()),
                      quantity: String(Number(selectedQuantity) + 1),
                    }),
                  )}`}
                  // onClick={() => setSelectedQuantity((prev) => prev + 1)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-md dark:text-white"
                >
                  +
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center pt-6 gap-4">
              <button
                onClick={AddItemToCart}
                className="flex items-center justify-center px-6 py-3 text-white rounded-lg text-nowrap gap-2 bg-primary-dark-pink hover:bg-slate-800 dark:hover:bg-slate-700"
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <div className="flex gap-4">
                <button
                  onClick={handleWishlistToggle}
                  disabled={wishlistLoading}
                  className={`flex-1 flex items-center justify-center gap-2 border px-6 py-3 rounded-lg transition-colors dark:text-white ${
                    isInWishlist(product.product_id)
                      ? "border-red-500 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400"
                      : "border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  } disabled:opacity-50`}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isInWishlist(product.product_id) ? "fill-current" : ""
                    }`}
                  />
                  {isInWishlist(product.product_id) ? "Saved" : "Save"}
                </button>
                <button className="flex items-center justify-center flex-1 px-6 py-3 border rounded-lg gap-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-white">
                  <Share2 className="w-5 h-5" />
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
