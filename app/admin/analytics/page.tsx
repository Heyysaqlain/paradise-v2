"use client";

import "./analytics.css";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/lib/client";

type Order = {
  id: string;
  order_number: string;
  user_id: string | null;
  customer_name: string;
  email: string | null;
  payment_method: string | null;
  payment_status:
    | "pending"
    | "paid"
    | "failed"
    | "refunded";
  order_status:
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  subtotal: number;
  discount: number;
  delivery_charge: number;
  total: number;
  created_at: string;
};

type Customer = {
  id: string;
  created_at: string;
};

type Product = {
  id: string;
  stock: number | null;
  created_at: string;
};

type AnalyticsData = {
  orders: Order[];
  customers: Customer[];
  products: Product[];
};

export default function AnalyticsPage() {
  const [orders, setOrders] =
    useState<Order[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [lastUpdated, setLastUpdated] =
    useState<Date | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const [
        ordersResponse,
        customersResponse,
        productsResponse,
      ] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("profiles")
          .select("id, created_at")
          .order("created_at", {
            ascending: false,
          }),

        supabase
          .from("products")
          .select("id, stock, created_at")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (ordersResponse.error) {
        throw new Error(
          ordersResponse.error.message
        );
      }

      if (customersResponse.error) {
        throw new Error(
          customersResponse.error.message
        );
      }

      if (productsResponse.error) {
        throw new Error(
          productsResponse.error.message
        );
      }

      const analyticsData: AnalyticsData = {
        orders:
          (ordersResponse.data as Order[]) ||
          [],

        customers:
          (customersResponse.data as Customer[]) ||
          [],

        products:
          (productsResponse.data as Product[]) ||
          [],
      };

      setOrders(analyticsData.orders);

      setCustomers(
        analyticsData.customers
      );

      setProducts(
        analyticsData.products
      );

      setLastUpdated(new Date());
    } catch (error) {
      console.error(
        "ANALYTICS LOAD ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not load analytics data."
      );
    } finally {
      setLoading(false);
    }
  }

  const totalRevenue = useMemo(() => {
    return orders
      .filter(
        (order) =>
          order.order_status !== "cancelled"
      )
      .reduce(
        (total, order) =>
          total + Number(order.total || 0),
        0
      );
  }, [orders]);

  const totalOrders = orders.length;

  const totalCustomers = customers.length;

  const totalProducts = products.length;

  const averageOrderValue = useMemo(() => {
    const validOrders = orders.filter(
      (order) =>
        order.order_status !== "cancelled"
    );

    if (validOrders.length === 0) {
      return 0;
    }

    const revenue = validOrders.reduce(
      (total, order) =>
        total + Number(order.total || 0),
      0
    );

    return revenue / validOrders.length;
  }, [orders]);

  const deliveredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.order_status === "delivered"
    ).length;
  }, [orders]);

  const pendingOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.order_status === "confirmed" ||
        order.order_status === "processing"
    ).length;
  }, [orders]);

  const cancelledOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.order_status === "cancelled"
    ).length;
  }, [orders]);
    const paidOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.payment_status === "paid"
    ).length;
  }, [orders]);

  const pendingPayments = useMemo(() => {
    return orders.filter(
      (order) =>
        order.payment_status === "pending"
    ).length;
  }, [orders]);

  const lowStockProducts = useMemo(() => {
    return products.filter(
      (product) =>
        Number(product.stock || 0) <= 5
    ).length;
  }, [products]);

  const orderStatusData = useMemo(() => {
    const statuses = [
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ] as const;

    return statuses.map((status) => {
      const count = orders.filter(
        (order) =>
          order.order_status === status
      ).length;

      const percentage =
        totalOrders > 0
          ? (count / totalOrders) * 100
          : 0;

      return {
        status,
        count,
        percentage,
      };
    });
  }, [orders, totalOrders]);

  const paymentStatusData = useMemo(() => {
    const statuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ] as const;

    return statuses.map((status) => {
      const count = orders.filter(
        (order) =>
          order.payment_status === status
      ).length;

      const percentage =
        totalOrders > 0
          ? (count / totalOrders) * 100
          : 0;

      return {
        status,
        count,
        percentage,
      };
    });
  }, [orders, totalOrders]);

  const monthlyRevenue = useMemo(() => {
    const months: {
      key: string;
      label: string;
      revenue: number;
      orders: number;
    }[] = [];

    const today = new Date();

    for (let index = 5; index >= 0; index--) {
      const date = new Date(
        today.getFullYear(),
        today.getMonth() - index,
        1
      );

      const key = `${date.getFullYear()}-${date.getMonth()}`;

      const label = date.toLocaleDateString(
        "en-IN",
        {
          month: "short",
          year: "2-digit",
        }
      );

      months.push({
        key,
        label,
        revenue: 0,
        orders: 0,
      });
    }

    orders.forEach((order) => {
      if (
        order.order_status === "cancelled"
      ) {
        return;
      }

      const orderDate = new Date(
        order.created_at
      );

      const orderKey =
        `${orderDate.getFullYear()}-${orderDate.getMonth()}`;

      const month = months.find(
        (item) => item.key === orderKey
      );

      if (month) {
        month.revenue += Number(
          order.total || 0
        );

        month.orders += 1;
      }
    });

    return months;
  }, [orders]);

  const maximumMonthlyRevenue =
    useMemo(() => {
      const revenues = monthlyRevenue.map(
        (month) => month.revenue
      );

      return Math.max(...revenues, 1);
    }, [monthlyRevenue]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 6);
  }, [orders]);

  const thisMonthRevenue = useMemo(() => {
    const today = new Date();

    return orders
      .filter((order) => {
        const orderDate = new Date(
          order.created_at
        );

        return (
          orderDate.getMonth() ===
            today.getMonth() &&
          orderDate.getFullYear() ===
            today.getFullYear() &&
          order.order_status !== "cancelled"
        );
      })
      .reduce(
        (total, order) =>
          total + Number(order.total || 0),
        0
      );
  }, [orders]);

  const thisMonthOrders = useMemo(() => {
    const today = new Date();

    return orders.filter((order) => {
      const orderDate = new Date(
        order.created_at
      );

      return (
        orderDate.getMonth() ===
          today.getMonth() &&
        orderDate.getFullYear() ===
          today.getFullYear()
      );
    }).length;
  }, [orders]);

  const thisMonthCustomers = useMemo(() => {
    const today = new Date();

    return customers.filter((customer) => {
      const customerDate = new Date(
        customer.created_at
      );

      return (
        customerDate.getMonth() ===
          today.getMonth() &&
        customerDate.getFullYear() ===
          today.getFullYear()
      );
    }).length;
  }, [customers]);

  function formatCurrency(value: number) {
    return `₹${Number(value).toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 0,
      }
    )}`;
  }

  function formatStatus(status: string) {
    return status
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  }
    if (loading) {
    return (
      <main className="analytics-loading">

        <div className="analytics-loader" />

        <p>PARADISE ANALYTICS</p>

        <h1>Preparing Your Insights</h1>

        <span>
          Please wait while we analyze your
          Paradise Collection data.
        </span>

      </main>
    );
  }

  return (
    <main className="analytics-page">

      <section className="analytics-header">

        <div>

          <p>PARADISE BUSINESS INTELLIGENCE</p>

          <h1>Analytics Overview</h1>

          <span>
            Track your store performance, revenue,
            customers and orders.
          </span>

        </div>

        <div className="analytics-header-actions">

          {lastUpdated && (
            <small>
              Last Updated:{" "}
              {lastUpdated.toLocaleTimeString(
                "en-IN",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                }
              )}
            </small>
          )}

          <button
            type="button"
            onClick={loadAnalytics}
          >
            Refresh Analytics
          </button>

        </div>

      </section>

      {error && (
        <div className="analytics-error">
          {error}
        </div>
      )}

      <section className="analytics-main-stats">

        <div className="analytics-stat-card">

          <p>TOTAL REVENUE</p>

          <h2>
            {formatCurrency(totalRevenue)}
          </h2>

          <span>
            Revenue from non-cancelled orders
          </span>

        </div>

        <div className="analytics-stat-card">

          <p>TOTAL ORDERS</p>

          <h2>{totalOrders}</h2>

          <span>
            {thisMonthOrders} orders this month
          </span>

        </div>

        <div className="analytics-stat-card">

          <p>TOTAL CUSTOMERS</p>

          <h2>{totalCustomers}</h2>

          <span>
            {thisMonthCustomers} joined this month
          </span>

        </div>

        <div className="analytics-stat-card">

          <p>AVERAGE ORDER VALUE</p>

          <h2>
            {formatCurrency(averageOrderValue)}
          </h2>

          <span>
            Average customer purchase value
          </span>

        </div>

      </section>

      <section className="analytics-secondary-stats">

        <div className="analytics-mini-card">

          <div>
            <p>THIS MONTH REVENUE</p>

            <h3>
              {formatCurrency(thisMonthRevenue)}
            </h3>
          </div>

          <span>₹</span>

        </div>

        <div className="analytics-mini-card">

          <div>
            <p>DELIVERED ORDERS</p>

            <h3>{deliveredOrders}</h3>
          </div>

          <span>✓</span>

        </div>

        <div className="analytics-mini-card">

          <div>
            <p>PENDING ORDERS</p>

            <h3>{pendingOrders}</h3>
          </div>

          <span>◷</span>

        </div>

        <div className="analytics-mini-card">

          <div>
            <p>CANCELLED ORDERS</p>

            <h3>{cancelledOrders}</h3>
          </div>

          <span>×</span>

        </div>

        <div className="analytics-mini-card">

          <div>
            <p>PAID ORDERS</p>

            <h3>{paidOrders}</h3>
          </div>

          <span>◇</span>

        </div>

        <div className="analytics-mini-card">

          <div>
            <p>LOW STOCK PRODUCTS</p>

            <h3>{lowStockProducts}</h3>
          </div>

          <span>!</span>

        </div>

      </section>

      <section className="analytics-content-grid">

        <div className="analytics-chart-card">

          <div className="analytics-section-heading">

            <div>
              <p>SALES PERFORMANCE</p>

              <h2>Revenue Overview</h2>
            </div>

            <span>Last 6 Months</span>

          </div>

          <div className="revenue-chart">

            {monthlyRevenue.map((month) => {

              const barHeight =
                maximumMonthlyRevenue > 0
                  ? Math.max(
                      (month.revenue /
                        maximumMonthlyRevenue) *
                        100,
                      month.revenue > 0 ? 8 : 2
                    )
                  : 2;

              return (

                <div
                  className="revenue-column"
                  key={month.key}
                >

                  <div className="revenue-value">

                    <strong>
                      {formatCurrency(
                        month.revenue
                      )}
                    </strong>

                    <span>
                      {month.orders} Orders
                    </span>

                  </div>

                  <div className="revenue-bar-area">

                    <div
                      className="revenue-bar"
                      style={{
                        height: `${barHeight}%`,
                      }}
                    />

                  </div>

                  <p>{month.label}</p>

                </div>

              );

            })}

          </div>

        </div>
                <div className="analytics-breakdown-card">

          <div className="analytics-section-heading">

            <div>
              <p>ORDER PERFORMANCE</p>

              <h2>Order Status</h2>
            </div>

            <span>{totalOrders} Total</span>

          </div>

          <div className="analytics-breakdown-list">

            {orderStatusData.map((item) => (

              <div
                className="analytics-breakdown-item"
                key={item.status}
              >

                <div className="breakdown-info">

                  <span>
                    {formatStatus(item.status)}
                  </span>

                  <strong>
                    {item.count}
                  </strong>

                </div>

                <div className="breakdown-progress">

                  <div
                    className={`breakdown-progress-bar ${item.status}`}
                    style={{
                      width: `${item.percentage}%`,
                    }}
                  />

                </div>

                <small>
                  {item.percentage.toFixed(1)}%
                </small>

              </div>

            ))}

          </div>

        </div>

      </section>

      <section className="analytics-bottom-grid">

        <div className="analytics-payment-card">

          <div className="analytics-section-heading">

            <div>
              <p>PAYMENT INSIGHTS</p>

              <h2>Payment Status</h2>
            </div>

            <span>
              {pendingPayments} Pending
            </span>

          </div>

          <div className="payment-status-grid">

            {paymentStatusData.map((item) => (

              <div
                className="payment-status-card"
                key={item.status}
              >

                <div
                  className={`payment-status-icon ${item.status}`}
                >
                  {item.status === "paid"
                    ? "✓"
                    : item.status === "pending"
                    ? "◷"
                    : item.status === "failed"
                    ? "×"
                    : "↻"}
                </div>

                <div>

                  <p>
                    {formatStatus(item.status)}
                  </p>

                  <h3>{item.count}</h3>

                  <span>
                    {item.percentage.toFixed(1)}%
                    {" of orders"}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </div>

        <div className="analytics-products-card">

          <div className="analytics-section-heading">

            <div>
              <p>STORE INVENTORY</p>

              <h2>Product Insights</h2>
            </div>

          </div>

          <div className="product-insight-list">

            <div className="product-insight-row">

              <span>Total Products</span>

              <strong>
                {totalProducts}
              </strong>

            </div>

            <div className="product-insight-row">

              <span>Low Stock Products</span>

              <strong>
                {lowStockProducts}
              </strong>

            </div>

            <div className="product-insight-row">

              <span>Healthy Stock</span>

              <strong>
                {Math.max(
                  totalProducts - lowStockProducts,
                  0
                )}
              </strong>

            </div>

            <div className="product-insight-row">

              <span>Total Customers</span>

              <strong>
                {totalCustomers}
              </strong>

            </div>

          </div>

        </div>

      </section>

      <section className="analytics-recent-orders">

        <div className="analytics-section-heading">

          <div>
            <p>RECENT ACTIVITY</p>

            <h2>Latest Orders</h2>
          </div>

          <span>
            Last {recentOrders.length} Orders
          </span>

        </div>

        <div className="analytics-table-wrapper">

          <table className="analytics-orders-table">

            <thead>

              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Payment</th>
                <th>Order Status</th>
                <th>Total</th>
                <th>Date</th>
              </tr>

            </thead>

            <tbody>

              {recentOrders.map((order) => (

                <tr key={order.id}>

                  <td>

                    <strong>
                      #{order.order_number}
                    </strong>

                  </td>

                  <td>

                    <div className="analytics-customer">

                      <span>
                        {order.customer_name
                          ?.charAt(0)
                          .toUpperCase() || "P"}
                      </span>

                      <div>

                        <strong>
                          {order.customer_name}
                        </strong>

                        <small>
                          {order.email ||
                            "Paradise Customer"}
                        </small>

                      </div>

                    </div>

                  </td>

                  <td>

                    <span
                      className={`analytics-payment-badge ${order.payment_status}`}
                    >
                      {formatStatus(
                        order.payment_status
                      )}
                    </span>

                  </td>

                  <td>

                    <span
                      className={`analytics-order-badge ${order.order_status}`}
                    >
                      {formatStatus(
                        order.order_status
                      )}
                    </span>

                  </td>

                  <td>

                    <strong>
                      {formatCurrency(
                        Number(order.total)
                      )}
                    </strong>

                  </td>

                  <td>

                    {new Date(
                      order.created_at
                    ).toLocaleDateString(
                      "en-IN"
                    )}

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {recentOrders.length === 0 && (

          <div className="analytics-empty">

            <div>◇</div>

            <p>PARADISE ANALYTICS</p>

            <h2>No Orders Yet</h2>

            <span>
              Your latest Paradise orders will
              appear here.
            </span>

          </div>

        )}

      </section>

    </main>
  );
}