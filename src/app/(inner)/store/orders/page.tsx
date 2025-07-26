"use client";
import { useUserOrders } from "@/hooks/useCheckout";
import {
  Loader2,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

const getStatusIcon = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return <Clock className="w-5 h-5 text-yellow-600" />;
    case "processing":
      return <Package className="w-5 h-5 text-blue-600" />;
    case "shipped":
      return <Truck className="w-5 h-5 text-purple-600" />;
    case "delivered":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "cancelled":
      return <XCircle className="w-5 h-5 text-red-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusColor = (status: OrderStatus) => {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
    case "processing":
      return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
    case "shipped":
      return "text-purple-600 bg-purple-50 dark:bg-purple-900/20";
    case "delivered":
      return "text-green-600 bg-green-50 dark:bg-green-900/20";
    case "cancelled":
      return "text-red-600 bg-red-50 dark:bg-red-900/20";
    default:
      return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
  }
};

const OrdersPage = () => {
  const { data, isLoading, isError, error } = useUserOrders();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gray-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500">
            {(error as any)?.response?.data?.message || "Failed to load orders"}
          </p>
        </div>
      </div>
    );
  }

  const orders = data?.data || [];

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Orders
        </h1>
        <Link href="/store" className="text-primary-dark-pink font-medium">
          Continue Shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No orders yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start shopping to see your orders here
          </p>
          <Link
            href="/store"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-800 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Order #{order.order_id}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        order.status,
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        ₦{order.total_amount.toLocaleString()}
                      </p>
                      <p
                        className={`text-sm ${
                          order.payment_status === "paid"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }`}
                      >
                        {order.payment_status === "paid"
                          ? "Paid"
                          : "Pending Payment"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <Image
                        src={
                          item.product.images[0]?.image_url ||
                          "/placeholder.png"
                        }
                        alt={item.product.name}
                        width={80}
                        height={80}
                        className="rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {item.product.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size.name}</span>}
                          <span>₦{item.price.toLocaleString()} each</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">
                          ₦{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Shipping Address
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>{order.shipping_address.name}</p>
                    <p>{order.shipping_address.phone}</p>
                    <p>{order.shipping_address.address}</p>
                    <p>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state}
                    </p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
