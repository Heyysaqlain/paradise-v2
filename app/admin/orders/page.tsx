"use client";

import "../admin.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

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

export default function AdminOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null
  );

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setMessage(error.message);
        setOrders([]);
        return;
      }

      setOrders((data as Order[]) || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return orders;
    }

    return orders.filter((order) => {
      return (
        order.order_number.toLowerCase().includes(value) ||
        order.customer_name.toLowerCase().includes(value) ||
        order.email?.toLowerCase().includes(value) ||
        order.phone?.toLowerCase().includes(value)
      );
    });
  }, [orders, search]);

  const totalOrders = orders.length;

  const processingOrders = orders.filter(
    (order) =>
      order.order_status === "confirmed" ||
      order.order_status === "processing"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.order_status === "delivered"
  ).length;

  const totalRevenue = orders
    .filter((order) => order.order_status !== "cancelled")
    .reduce((total, order) => total + Number(order.total), 0);

  async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ) {
    setUpdatingOrderId(orderId);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("orders")
        .update({
          order_status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        setMessage(`Status update failed: ${error.message}`);
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                order_status: newStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while updating order status.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  async function updatePaymentStatus(
    orderId: string,
    newStatus: PaymentStatus
  ) {
    setUpdatingOrderId(orderId);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: newStatus,
        })
        .eq("id", orderId);

      if (error) {
        setMessage(`Payment update failed: ${error.message}`);
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId
            ? {
                ...order,
                payment_status: newStatus,
              }
            : order
        )
      );
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong while updating payment status.");
    } finally {
      setUpdatingOrderId(null);
    }
  }

  function formatDate(date: string | null) {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="admin-page">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <div className="admin-logo">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>ADMIN PANEL</span>
          </div>
        </div>

        <nav className="admin-menu">
          <button onClick={() => router.push("/admin")}>
            <span>⌂</span>
            Dashboard
          </button>

          <button onClick={() => router.push("/admin/products")}>
            <span>◇</span>
            Products
          </button>

          <button
            className="admin-menu-active"
            onClick={() => router.push("/admin/orders")}
          >
            <span>♧</span>
            Orders
          </button>

          <button onClick={() => router.push("/admin/customers")}>
            <span>♙</span>
            Customers
          </button>

          <button onClick={() => router.push("/admin/coupons")}>
            <span>％</span>
            Coupons
          </button>

          <button onClick={() => router.push("/admin/analytics")}>
            <span>⌁</span>
            Analytics
          </button>

          <button onClick={() => router.push("/admin/settings")}>
            <span>⚙</span>
            Settings
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button onClick={() => router.push("/shop")}>
            <span>←</span>
            View Store
          </button>
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-header">
          <div>
            <p>PARADISE COLLECTION</p>
            <h1>Order Management</h1>
          </div>

          <div className="admin-header-actions">
            <button
              className="admin-refresh-button"
              onClick={loadOrders}
            >
              ↻ Refresh
            </button>

            <button className="admin-profile-button">
              <span>A</span>

              <div>
                <strong>Administrator</strong>
                <small>Paradise Admin</small>
              </div>
            </button>
          </div>
        </header>

        <section className="admin-content">
          <div className="admin-welcome">
            <div>
              <p>ORDER MANAGEMENT</p>

              <h2>Paradise Orders</h2>

              <span>
                View customer orders and manage order and payment
                statuses.
              </span>
            </div>
          </div>

          <div className="admin-stats">
            <article>
              <div className="admin-stat-icon">◇</div>

              <div>
                <span>TOTAL ORDERS</span>
                <strong>{totalOrders}</strong>
                <small>Orders in database</small>
              </div>
            </article>

            <article>
              <div className="admin-stat-icon">⌛</div>

              <div>
                <span>PROCESSING</span>
                <strong>{processingOrders}</strong>
                <small>Orders being prepared</small>
              </div>
            </article>

            <article>
              <div className="admin-stat-icon">✓</div>

              <div>
                <span>DELIVERED</span>
                <strong>{deliveredOrders}</strong>
                <small>Successfully delivered</small>
              </div>
            </article>

            <article>
              <div className="admin-stat-icon">₹</div>

              <div>
                <span>TOTAL REVENUE</span>

                <strong>
                  ₹{totalRevenue.toLocaleString("en-IN")}
                </strong>

                <small>Excluding cancelled orders</small>
              </div>
            </article>
          </div>

          <section className="admin-products-card">
            <div className="admin-products-heading">
              <div>
                <p>ORDER DATABASE</p>

                <h2>All Orders</h2>

                <span>
                  {orders.length} customer orders available.
                </span>
              </div>

              <div className="admin-search">
                <span>⌕</span>

                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                />

                {search && (
                  <button onClick={() => setSearch("")}>
                    ×
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className="admin-message">
                {message}
              </div>
            )}

            {loading ? (
              <div className="admin-empty-state">
                <div className="admin-loading-circle">P</div>

                <h3>Loading Orders...</h3>

                <p>Fetching Paradise Collection orders.</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="admin-empty-state">
                <span>♧</span>

                <h3>No Orders Found</h3>

                <p>
                  Customer orders will appear here after checkout.
                </p>
              </div>
            ) : (
              <div className="admin-table-container">
                <table className="admin-products-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER</th>
                      <th>DATE</th>
                      <th>TOTAL</th>
                      <th>PAYMENT</th>
                      <th>ORDER STATUS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <div className="admin-price">
                            <strong>
                              {order.order_number}
                            </strong>

                            <span>
                              {order.payment_method ||
                                "Cash on Delivery"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="admin-price">
                            <strong>
                              {order.customer_name}
                            </strong>

                            <span>
                              {order.email || order.phone || "—"}
                            </span>
                          </div>
                        </td>

                        <td>
                          {formatDate(order.created_at)}
                        </td>

                        <td>
                          <strong>
                            ₹
                            {Number(order.total).toLocaleString(
                              "en-IN"
                            )}
                          </strong>
                        </td>

                        <td>
                          <select
                            value={order.payment_status || "pending"}
                            disabled={
                              updatingOrderId === order.id
                            }
                            onChange={(event) =>
                              updatePaymentStatus(
                                order.id,
                                event.target
                                  .value as PaymentStatus
                              )
                            }
                          >
                            <option value="pending">
                              Pending
                            </option>

                            <option value="paid">
                              Paid
                            </option>

                            <option value="failed">
                              Failed
                            </option>

                            <option value="refunded">
                              Refunded
                            </option>
                          </select>
                        </td>

                        <td>
                          <select
                            value={order.order_status || "confirmed"}
                            disabled={
                              updatingOrderId === order.id
                            }
                            onChange={(event) =>
                              updateOrderStatus(
                                order.id,
                                event.target.value as OrderStatus
                              )
                            }
                          >
                            <option value="confirmed">
                              Confirmed
                            </option>

                            <option value="processing">
                              Processing
                            </option>

                            <option value="shipped">
                              Shipped
                            </option>

                            <option value="delivered">
                              Delivered
                            </option>

                            <option value="cancelled">
                              Cancelled
                            </option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}