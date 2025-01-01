"use client";
import React, { useEffect, useState } from "react";
import {
  Heart,
  Share2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Product } from "@/types/components";
import fetchSingleProduct from "@/utils/data/fetch-single-product";
import CartIcon from "@/components/sub_components/cart-icon";

// Sample product data - in a real app this would come from props or an API
// const product = {
//   product_id: 1,
//   name: "Classic Cotton Blend Crew Neck T-Shirt",
//   price: 29.99,
//   description:
//     "Premium quality t-shirt made from soft cotton blend fabric. Features a comfortable crew neck and short sleeves. Perfect for everyday wear.",
//   sizes: ["XS", "S", "M", "L", "XL"],
//   colors: ["White", "Black", "Navy", "Gray"],
//   images: [
//     "/api/placeholder/600/800",
//     "/api/placeholder/600/800",
//     "/api/placeholder/600/800",
//     "/api/placeholder/600/800",
//   ],
// };

const ProductPreview = () => {
  const params = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>No product found</div>;

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const previousImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white sm:text-3xl">
              On Paymefans Store
            </h2>
            <CartIcon />
          </div>

          <p className="mt-4 max-w-md text-gray-500 dark:text-white">
           Get the best of products from your favorite creators
          </p>
        </header>
        {/* Product Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Image Gallery Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={product.images[selectedImage]?.image_url}
                alt={`Product view ${selectedImage + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Navigation Arrows */}
              <button
                onClick={previousImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Preview */}
            <div className="grid grid-cols-4 gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden ${
                    selectedImage === index ? "ring-2 ring-black" : ""
                  }`}
                >
                  <img
                    src={image.image_url}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Details Section */}
          <div className="space-y-6">
            {/* Product Title and Price */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {product.name}
              </h1>
              <p className="text-2xl font-semibold text-gray-900">
                ${product.price}
              </p>
            </div>

            {/* Description */}
            <p className="text-gray-600">{product.description}</p>

            {/* Size Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Size</h3>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedSize(size.size.name)}
                    className={`py-2 text-sm font-medium rounded-md ${
                      selectedSize === size.size.name
                        ? "bg-primary-dark-pink text-white"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {size.size.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            {/* <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Color</h3>
              <div className="grid grid-cols-4 gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`py-2 text-sm font-medium rounded-md ${
                      selectedColor === color
                        ? 'bg-primary-dark-pink text-white'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div> */}
            {/* Qunatity */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <button
                  onClick={() =>
                    setSelectedQuantity((prev) => Math.max(prev - 1, 1))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  -
                </button>
                <span className="text-lg font-semibold">
                  {selectedQuantity}
                </span>
                <button
                  onClick={() => setSelectedQuantity((prev) => prev + 1)}
                  className="px-4 py-2 border border-gray-300 rounded-md"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-4 flex-wrap pt-6">
              <button className="flex items-center text-nowrap justify-center gap-2 bg-primary-dark-pink text-white px-6 py-3 rounded-lg hover:bg-gray-800">
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
                  <Heart className="w-5 h-5" />
                  Save
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50">
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
