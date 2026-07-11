"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/lib/client";
import "./orders.css";

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

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadOrders = useCallback(async () => {
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
        setOrders([]);
        setError(
          "Please login to view your orders."
        );
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error(
        "LOAD CUSTOMER ORDERS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not load your orders."
      );

      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  function formatCurrency(
    value: number | null
  ) {
    return `₹${Number(
      value || 0
    ).toLocaleString("en-IN")}`;
  }

  function formatStatus(status: string | null) {
    if (!status) {
      return "Confirmed";
    }

    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }

  function formatDate(date: string | null) {
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
    if (loading) {
    return (
      <main className="orders-page">

        <div className="orders-loading">

          <div className="orders-loading-logo">
            P
          </div>

          <p>YOUR PARADISE COLLECTION</p>

          <h2>Loading Your Orders</h2>

          <span>
            Please wait while we fetch your
            latest Paradise purchases.
          </span>

        </div>

      </main>
    );
  }

  return (
    <main className="orders-page">

      <div className="orders-offer-bar">

        <span>
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </span>

        <span>
          PARADISE COLLECTION
        </span>

      </div>

      <header className="orders-header">

        <Link
          href="/shop"
          className="orders-brand"
        >

          <div className="orders-logo">
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

          <Link href="/account">
            Account
          </Link>

          <Link href="/cart">
            Cart
          </Link>

        </nav>

      </header>

      <section className="orders-hero">

        <p>
          YOUR PARADISE COLLECTION
        </p>

        <h2>My Orders</h2>

        <span>
          View and track your Paradise purchases.
        </span>

      </section>

      <section className="orders-container">

        {error && (

          <div className="orders-error">

            {error}

          </div>

        )}

        {orders.length > 0 ? (

          <div className="orders-list">

            {orders.map((order) => (

              <div
                className="order-card"
                key={order.id}
              >

                <div className="order-card-top">

                  <div>

                    <p>ORDER NUMBER</p>

                    <h3>
                      #{order.order_number}
                    </h3>

                  </div>

                  <span
                    className={`order-status ${
                      order.order_status ||
                      "confirmed"
                    }`}
                  >
                    {formatStatus(
                      order.order_status
                    )}
                  </span>

                </div>

                <div className="order-divider" />

                <div className="order-product">

                  <div className="order-image">

                    <img
                      src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=85"
                      alt="Paradise Collection Product"
                    />

                  </div>

                  <div className="order-product-info">

                    <p>
                      PARADISE COLLECTION
                    </p>

                    <h3>
                      Order #{order.order_number}
                    </h3>

                    <span>

                      Thank you{" "}

                      {order.customer_name ||
                        "Paradise Customer"}.

                      {" "}Your order is currently{" "}

                      <strong>
                        {formatStatus(
                          order.order_status
                        )}
                      </strong>.

                    </span>

                    <div className="order-details">

                      <div>

                        <small>
                          TOTAL AMOUNT
                        </small>

                        <strong>
                          {formatCurrency(
                            order.total
                          )}
                        </strong>

                      </div>

                      <div>

                        <small>
                          PAYMENT
                        </small>

                        <strong>
                          {order.payment_method ||
                            "Cash on Delivery"}
                        </strong>

                      </div>

                      <div>

                        <small>
                          ORDER DATE
                        </small>

                        <strong>
                          {formatDate(
                            order.created_at
                          )}
                        </strong>

                      </div>

                    </div>

                  </div>

                </div>
                                <div className="order-divider" />

                <div className="order-actions">

                  <Link
                    href={`/orders/${order.id}`}
                    className="track-button"
                  >
                    View Order Details →
                  </Link>

                  <Link
                    href="/shop"
                    className="shop-button"
                  >
                    Continue Shopping
                  </Link>

                </div>

              </div>

            ))}

          </div>

        ) : (

          <div className="empty-orders">

            <div className="empty-logo">
              P
            </div>

            <p>
              YOUR PARADISE COLLECTION
            </p>

            <h2>No Orders Yet</h2>

            <span>
              Once you place your first Paradise
              order, it will appear here.
            </span>

            <Link href="/shop">
              Explore Collection →
            </Link>

          </div>

        )}

      </section>

      <section className="orders-features">

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

      <footer className="orders-footer">

        <div>

          <div className="footer-brand">

            <div className="orders-logo">
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