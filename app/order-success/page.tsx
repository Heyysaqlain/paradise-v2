"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/lib/client";
import "./order-success.css";

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

export default function OrderSuccessPage() {
  const [order, setOrder] =
    useState<Order | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadLatestOrder =
    useCallback(async () => {
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
            "Please login to view your order."
          );

          return;
        }

        const {
          data,
          error: orderError,
        } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

        if (orderError) {
          throw new Error(orderError.message);
        }

        setOrder((data as Order) || null);
      } catch (error) {
        console.error(
          "LOAD ORDER ERROR:",
          error
        );

        setError(
          error instanceof Error
            ? error.message
            : "Could not load your order."
        );

        setOrder(null);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadLatestOrder();
  }, [loadLatestOrder]);

  function formatStatus(
    status: OrderStatus | null
  ) {
    if (!status) {
      return "Confirmed";
    }

    return status
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
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

  const formattedTotal = Number(
    order?.total || 0
  ).toLocaleString("en-IN");

  const formattedDeliveryCharge = Number(
    order?.delivery_charge || 0
  ).toLocaleString("en-IN");
    if (loading) {
    return (
      <main className="success-page">

        <div className="success-loading">

          <div className="success-loading-logo">
            P
          </div>

          <p>YOUR PARADISE ORDER</p>

          <h2>Loading Order Details</h2>

          <span>
            Please wait while we fetch your
            latest Paradise order.
          </span>

        </div>

      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="success-page">

        <div className="success-loading">

          <div className="success-loading-logo">
            P
          </div>

          <p>PARADISE COLLECTION</p>

          <h2>Order Not Found</h2>

          <span>
            {error ||
              "We could not find your order."}
          </span>

          <Link
            href="/shop"
            className="primary-button"
          >
            Continue Shopping →
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main className="success-page">

      <div className="top-offer-bar">

        <span>
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </span>

        <span>
          THANK YOU FOR SHOPPING WITH PARADISE
        </span>

      </div>

      <header className="success-header">

        <Link
          href="/shop"
          className="brand"
        >

          <div className="brand-circle">
            P
          </div>

          <div>

            <h1>PARADISE</h1>

            <p>COLLECTION</p>

          </div>

        </Link>

        <div className="checkout-progress">

          <div className="progress-item completed">

            <span>✓</span>

            <p>Shopping Bag</p>

          </div>

          <div className="progress-line completed-line" />

          <div className="progress-item completed">

            <span>✓</span>

            <p>Address</p>

          </div>

          <div className="progress-line completed-line" />

          <div className="progress-item completed">

            <span>✓</span>

            <p>Payment</p>

          </div>

        </div>

        <Link
          href="/shop"
          className="continue-shopping"
        >
          Continue Shopping →
        </Link>

      </header>

      <section className="success-hero">

        <div className="success-icon">

          <span>✓</span>

        </div>

        <p className="success-eyebrow">
          YOUR PARADISE ORDER
        </p>

        <h2>

          Thank You For

          <br />

          Your Order.

        </h2>

        <p className="success-description">

          Your order status is currently{" "}

          <strong>
            {formatStatus(
              order.order_status
            )}
          </strong>.

          {" "}Track your Paradise selection
          through every stage of delivery.

        </p>

        <div className="order-number">

          <span>ORDER NUMBER</span>

          <strong>
            #{order.order_number}
          </strong>

        </div>

      </section>

      <section className="order-content">

        <div className="order-left">

          <p className="section-eyebrow">
            ORDER STATUS
          </p>

          <h3>
            Your Order Is{" "}
            {formatStatus(
              order.order_status
            )}
          </h3>

          <p className="order-message">

            Hello{" "}

            {order.customer_name ||
              "Paradise Customer"},

            {" "}thank you for choosing
            Paradise Collection. Your order
            journey is updated according to
            its latest delivery status.

          </p>

          <div className="status-card">

            <div className="status-heading">

              <div>

                <p className="section-eyebrow">
                  ORDER JOURNEY
                </p>

                <h4>Delivery Status</h4>

              </div>

              <span
                className={`confirmed-badge ${
                  order.order_status ||
                  "confirmed"
                }`}
              >
                {formatStatus(
                  order.order_status
                )}
              </span>

            </div>
                        <div className="status-timeline">

              <div
                className={`timeline-step ${
                  isStepActive("confirmed")
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-marker">
                  {isStepActive("confirmed")
                    ? "✓"
                    : "1"}
                </div>

                <div className="timeline-content">

                  <h5>Order Confirmed</h5>

                  <p>
                    Your order has been
                    successfully placed.
                  </p>

                </div>

              </div>

              <div
                className={`timeline-line ${
                  isStepActive("processing")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`timeline-step ${
                  isStepActive("processing")
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-marker">
                  {isStepActive("processing")
                    ? "✓"
                    : "2"}
                </div>

                <div className="timeline-content">

                  <h5>Processing</h5>

                  <p>
                    Your Paradise selection
                    is being prepared.
                  </p>

                </div>

              </div>

              <div
                className={`timeline-line ${
                  isStepActive("shipped")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`timeline-step ${
                  isStepActive("shipped")
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-marker">
                  {isStepActive("shipped")
                    ? "✓"
                    : "3"}
                </div>

                <div className="timeline-content">

                  <h5>Shipped</h5>

                  <p>
                    Your order has left our
                    Paradise collection centre.
                  </p>

                </div>

              </div>

              <div
                className={`timeline-line ${
                  isStepActive("delivered")
                    ? "active"
                    : ""
                }`}
              />

              <div
                className={`timeline-step ${
                  isStepActive("delivered")
                    ? "active"
                    : ""
                }`}
              >

                <div className="timeline-marker">
                  {isStepActive("delivered")
                    ? "✓"
                    : "4"}
                </div>

                <div className="timeline-content">

                  <h5>Delivered</h5>

                  <p>
                    Your Paradise order has
                    arrived at your doorstep.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        <aside className="order-right">

          <div className="summary-card">

            <p className="section-eyebrow">
              ORDER SUMMARY
            </p>

            <h3>Purchase Details</h3>

            <div className="summary-divider" />

            <div className="summary-row">

              <span>Order Number</span>

              <strong>
                #{order.order_number}
              </strong>

            </div>

            <div className="summary-row">

              <span>Payment Method</span>

              <strong>
                {order.payment_method ||
                  "Cash on Delivery"}
              </strong>

            </div>

            <div className="summary-row">

              <span>Payment Status</span>

              <strong>
                {formatStatus(
                  order.payment_status as
                    OrderStatus
                )}
              </strong>

            </div>

            <div className="summary-row">

              <span>Delivery Charge</span>

              <strong>
                ₹{formattedDeliveryCharge}
              </strong>

            </div>

            <div className="summary-divider" />

            <div className="summary-row total-row">

              <span>Total Amount</span>

              <strong>
                ₹{formattedTotal}
              </strong>

            </div>

          </div>
                    <div className="delivery-card">

            <p className="section-eyebrow">
              DELIVERY DETAILS
            </p>

            <h4>Shipping Address</h4>

            <div className="address-content">

              <div className="address-icon">
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

                  {order.state} {order.pincode}
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

          <div className="order-success-actions">

            <button
              type="button"
              className="primary-button"
              onClick={loadLatestOrder}
            >
              Refresh Order Status
            </button>

            <Link
              href="/orders"
              className="secondary-button"
            >
              View My Orders →
            </Link>

            <Link
              href="/shop"
              className="secondary-button"
            >
              Continue Shopping
            </Link>

          </div>

        </aside>

      </section>

      <section className="success-features">

        <div>

          <span>◇</span>

          <section>

            <strong>
              Premium Quality
            </strong>

            <p>
              Curated Collections
            </p>

          </section>

        </div>

        <div>

          <span>♧</span>

          <section>

            <strong>
              Free Delivery
            </strong>

            <p>
              Orders Above ₹999
            </p>

          </section>

        </div>

        <div>

          <span>↻</span>

          <section>

            <strong>
              Easy Returns
            </strong>

            <p>
              Hassle-Free Shopping
            </p>

          </section>

        </div>

        <div>

          <span>♙</span>

          <section>

            <strong>
              Secure Payment
            </strong>

            <p>
              Trusted Checkout
            </p>

          </section>

        </div>

      </section>

      <footer className="success-footer">

        <div className="footer-brand">

          <div className="footer-logo">

            <div className="brand-circle">
              P
            </div>

            <div>

              <h3>PARADISE</h3>

              <p>COLLECTION</p>

            </div>

          </div>

          <p>
            Premium fashion, thoughtfully curated
            for every woman and every occasion.
          </p>

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