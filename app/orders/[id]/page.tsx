"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useParams } from "next/navigation";
import { createClient } from "@/lib/lib/client";
import "./order-details.css";

type OrderStatus =
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  email: string | null;
  phone: string | null;
  address: string;
  city: string | null;
  state: string | null;
  pincode: string | null;
  payment_method: string | null;
  payment_status: PaymentStatus | null;
  order_status: OrderStatus | null;
  subtotal: number;
  discount: number | null;
  delivery_charge: number | null;
  total: number;
  promo_code: string | null;
  created_at: string | null;
  updated_at: string | null;
};

const statusSteps: OrderStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export default function OrderDetailsPage() {
  const params = useParams();

  const orderId = params.id as string;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrder = useCallback(async () => {
    if (!orderId) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      const user = userData.user;

      if (!user) {
        setOrder(null);

        setError(
          "Please login to view this order."
        );

        return;
      }

      const {
        data,
        error: orderError,
      } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) {
        throw new Error(orderError.message);
      }

      if (!data) {
        setOrder(null);

        setError(
          "Order not found or you do not have permission to view it."
        );

        return;
      }

      setOrder(data as Order);
    } catch (error) {
      console.error(
        "LOAD ORDER DETAILS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not load order details."
      );

      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  function formatCurrency(
    value: number | null
  ) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatStatus(
    status: string | null
  ) {
    if (!status) {
      return "Confirmed";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  function getStatusIndex(
    status: OrderStatus | null
  ) {
    if (!status) {
      return 0;
    }

    return statusSteps.indexOf(status);
  }

  const currentStatusIndex =
    getStatusIndex(
      order?.order_status || null
    );

  function isStepActive(
    step: OrderStatus
  ) {
    if (
      order?.order_status === "cancelled"
    ) {
      return false;
    }

    return (
      statusSteps.indexOf(step) <=
      currentStatusIndex
    );
  }
    if (loading) {
    return (
      <main className="order-details-page">
        <div className="order-details-loading">
          <div className="order-details-loading-logo">
            P
          </div>

          <p>PARADISE COLLECTION</p>

          <h1>Loading Order Details</h1>

          <span>
            Please wait while we fetch your order.
          </span>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="order-details-page">
        <div className="order-details-loading">
          <div className="order-details-loading-logo">
            P
          </div>

          <p>PARADISE COLLECTION</p>

          <h1>Order Not Found</h1>

          <span>
            {error || "Could not find this order."}
          </span>

          <Link
            href="/orders"
            className="details-primary-button"
          >
            Back To My Orders →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="order-details-page">

      <div className="details-offer-bar">
        <span>
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </span>

        <span>
          PARADISE COLLECTION
        </span>
      </div>

      <header className="details-header">

        <Link
          href="/shop"
          className="details-brand"
        >
          <div className="details-logo">
            P
          </div>

          <div>
            <h1>PARADISE</h1>
            <p>COLLECTION</p>
          </div>
        </Link>

        <nav>
          <Link href="/shop">
            Shop
          </Link>

          <Link href="/wishlist">
            Wishlist
          </Link>

          <Link href="/orders">
            My Orders
          </Link>

          <Link href="/account">
            Account
          </Link>

          <Link href="/cart">
            Cart
          </Link>
        </nav>

      </header>

      <section className="details-hero">

        <p>YOUR PARADISE PURCHASE</p>

        <h2>Order Details</h2>

        <span>
          View your purchase information and
          track the latest delivery status.
        </span>

      </section>

      <section className="details-container">

        <div className="details-top-card">

          <div>

            <p className="details-eyebrow">
              ORDER NUMBER
            </p>

            <h2>
              #{order.order_number}
            </h2>

            <span>
              Placed on{" "}
              {formatDate(order.created_at)}
            </span>

          </div>

          <div className="details-top-actions">

            <span
              className={`details-status ${
                order.order_status || "confirmed"
              }`}
            >
              {formatStatus(order.order_status)}
            </span>

            <button
              type="button"
              onClick={loadOrder}
              className="details-refresh-button"
            >
              Refresh Status
            </button>

          </div>

        </div>

        {order.order_status === "cancelled" && (

          <div className="details-cancelled-message">

            <strong>
              Order Cancelled
            </strong>

            <span>
              This order has been cancelled.
            </span>

          </div>

        )}

        <div className="details-main-grid">

          <section className="details-content-card">

            <div className="details-section-heading">

              <p>ORDER JOURNEY</p>

              <h3>Delivery Status</h3>

              <span>
                Track your Paradise order through
                every stage of delivery.
              </span>

            </div>

            <div className="details-timeline">
                            <div
                className={`details-timeline-step ${
                  isStepActive("confirmed")
                    ? "active"
                    : ""
                }`}
              >
                <div className="details-timeline-marker">
                  {isStepActive("confirmed")
                    ? "✓"
                    : "1"}
                </div>

                <div className="details-timeline-content">
                  <h4>Order Confirmed</h4>

                  <p>
                    Your order has been successfully
                    placed.
                  </p>
                </div>
              </div>

              <div
                className={`details-timeline-line ${
                  isStepActive("processing")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`details-timeline-step ${
                  isStepActive("processing")
                    ? "active"
                    : ""
                }`}
              >
                <div className="details-timeline-marker">
                  {isStepActive("processing")
                    ? "✓"
                    : "2"}
                </div>

                <div className="details-timeline-content">
                  <h4>Processing</h4>

                  <p>
                    Your Paradise selection is being
                    prepared for dispatch.
                  </p>
                </div>
              </div>

              <div
                className={`details-timeline-line ${
                  isStepActive("shipped")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`details-timeline-step ${
                  isStepActive("shipped")
                    ? "active"
                    : ""
                }`}
              >
                <div className="details-timeline-marker">
                  {isStepActive("shipped")
                    ? "✓"
                    : "3"}
                </div>

                <div className="details-timeline-content">
                  <h4>Shipped</h4>

                  <p>
                    Your order has left our Paradise
                    collection centre.
                  </p>
                </div>
              </div>

              <div
                className={`details-timeline-line ${
                  isStepActive("delivered")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`details-timeline-step ${
                  isStepActive("delivered")
                    ? "active"
                    : ""
                }`}
              >
                <div className="details-timeline-marker">
                  {isStepActive("delivered")
                    ? "✓"
                    : "4"}
                </div>

                <div className="details-timeline-content">
                  <h4>Delivered</h4>

                  <p>
                    Your Paradise order has arrived
                    at your doorstep.
                  </p>
                </div>
              </div>

            </div>

          </section>

          <aside className="details-sidebar">

            <div className="details-summary-card">

              <div className="details-section-heading">
                <p>ORDER SUMMARY</p>

                <h3>Purchase Details</h3>
              </div>

              <div className="details-summary-row">
                <span>Subtotal</span>

                <strong>
                  {formatCurrency(order.subtotal)}
                </strong>
              </div>

              <div className="details-summary-row">
                <span>Discount</span>

                <strong>
                  - {formatCurrency(order.discount)}
                </strong>
              </div>

              <div className="details-summary-row">
                <span>Delivery Charge</span>

                <strong>
                  {formatCurrency(
                    order.delivery_charge
                  )}
                </strong>
              </div>

              {order.promo_code && (
                <div className="details-summary-row">
                  <span>Promo Code</span>

                  <strong>
                    {order.promo_code}
                  </strong>
                </div>
              )}

              <div className="details-summary-divider" />

              <div className="details-summary-row">
                <span>Payment Method</span>

                <strong>
                  {order.payment_method ||
                    "Cash on Delivery"}
                </strong>
              </div>

              <div className="details-summary-row">
                <span>Payment Status</span>

                <strong>
                  {formatStatus(
                    order.payment_status
                  )}
                </strong>
              </div>

              <div className="details-summary-divider" />

              <div className="details-summary-row details-total-row">
                <span>Total Amount</span>

                <strong>
                  {formatCurrency(order.total)}
                </strong>
              </div>

            </div>
                        <div className="details-address-card">

              <div className="details-section-heading">

                <p>DELIVERY DETAILS</p>

                <h3>Shipping Address</h3>

              </div>

              <div className="details-address-content">

                <div className="details-address-icon">
                  ⌂
                </div>

                <div>

                  <strong>
                    {order.customer_name ||
                      "Paradise Customer"}
                  </strong>

                  <p>{order.address}</p>

                  <p>
                    {order.city}

                    {order.city && order.state
                      ? ", "
                      : ""}

                    {order.state}{" "}
                    {order.pincode}
                  </p>

                  {order.phone && (
                    <p>
                      Mobile: {order.phone}
                    </p>
                  )}

                  {order.email && (
                    <p>
                      Email: {order.email}
                    </p>
                  )}

                </div>

              </div>

            </div>

          </aside>

        </div>

        <div className="details-bottom-actions">

          <Link
            href="/orders"
            className="details-primary-button"
          >
            ← Back To My Orders
          </Link>

          <Link
            href="/shop"
            className="details-secondary-button"
          >
            Continue Shopping
          </Link>

        </div>

      </section>

      <section className="details-features">

        <div>

          <strong>◇</strong>

          <span>
            <b>Premium Quality</b>
            Curated Collections
          </span>

        </div>

        <div>

          <strong>♧</strong>

          <span>
            <b>Free Delivery</b>
            Orders Above ₹999
          </span>

        </div>

        <div>

          <strong>↻</strong>

          <span>
            <b>Easy Returns</b>
            Hassle-Free Shopping
          </span>

        </div>

        <div>

          <strong>♙</strong>

          <span>
            <b>Secure Payment</b>
            Trusted Checkout
          </span>

        </div>

      </section>

      <footer className="details-footer">

        <div>

          <div className="details-footer-brand">

            <div className="details-logo">
              P
            </div>

            <section>

              <h3>PARADISE</h3>

              <p>COLLECTION</p>

            </section>

          </div>

          <span>
            Premium fashion, thoughtfully curated
            for every woman and every occasion.
          </span>

        </div>

        <div>

          <h4>SHOP</h4>

          <Link href="/shop">
            New Arrivals
          </Link>

          <Link href="/shop">
            Party Wear
          </Link>

          <Link href="/shop">
            Wedding
          </Link>

          <Link href="/shop">
            Festive
          </Link>

        </div>

        <div>

          <h4>HELP</h4>

          <Link href="/orders">
            My Orders
          </Link>

          <a href="#">
            Returns
          </a>

          <a href="#">
            Shipping
          </a>

          <a href="#">
            Contact Us
          </a>

        </div>

        <div>

          <h4>ABOUT</h4>

          <a href="#">
            Our Story
          </a>

          <a href="#">
            Privacy Policy
          </a>

          <a href="#">
            Terms
          </a>

        </div>

      </footer>

    </main>
  );
}