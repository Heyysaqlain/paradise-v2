"use client";

import "./customer.css";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile: string | null;
  city: string | null;
  state: string | null;
  created_at: string;
};

type Order = {
  id: string;
  order_number: string;
  user_id: string;
  total: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: string;
};

export default function CustomerDetailsPage() {

  const router = useRouter();

  const params = useParams();

  const customerId = params.id as string;

  const [customer, setCustomer] =
    useState<Profile | null>(null);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {

    if (customerId) {
      loadCustomer();
    }

  }, [customerId]);

  async function loadCustomer() {

    setLoading(true);

    const supabase = createClient();

    const { data: profile } =
      await supabase
        .from("profiles")
        .select("*")
        .eq("id", customerId)
        .single();

    const { data: customerOrders } =
      await supabase
        .from("orders")
        .select("*")
        .eq("user_id", customerId)
        .order("created_at", {
          ascending: false,
        });

    setCustomer(profile);

    setOrders(customerOrders || []);

    setLoading(false);

  }

  const totalSpent = useMemo(() => {

    return orders.reduce(

      (sum, order) =>
        sum + Number(order.total),

      0

    );

  }, [orders]);

  if (loading) {

    return (

      <main className="customer-loading">

        <h2>
          Loading Customer...
        </h2>

      </main>

    );

  }

  if (!customer) {

    return (

      <main className="customer-loading">

        <h2>
          Customer Not Found
        </h2>

      </main>

    );

  }

  return (

    <main className="customer-page">

      <div className="customer-header">

        <button
          className="back-btn"
          onClick={() =>
            router.push("/admin/customers")
          }
        >
          ← Back
        </button>

        <div>

          <p>
            CUSTOMER PROFILE
          </p>

          <h1>
            {customer.full_name}
          </h1>

          <span>
            Paradise Customer Details
          </span>

        </div>

      </div>

      <section className="customer-top-cards">

        <div className="profile-card">

          <div className="avatar">

            {(customer.full_name || "P")
              .charAt(0)
              .toUpperCase()}

          </div>

          <h2>
            {customer.full_name}
          </h2>

          <p>
            {customer.email}
          </p>

          <span>
            {customer.mobile}
          </span>

        </div>
                <div className="stats-grid">

          <div className="stat-card">

            <h3>
              {orders.length}
            </h3>

            <span>
              Total Orders
            </span>

          </div>

          <div className="stat-card">

            <h3>

              ₹
              {totalSpent.toLocaleString("en-IN")}

            </h3>

            <span>
              Lifetime Spend
            </span>

          </div>
          </div>

          <div className="stat-card">

            <h3>

              {new Date(
                customer.created_at
              ).toLocaleDateString("en-IN")}

            </h3>

            <span>
              Joined On
            </span>

          </div>

        </section>

        <section className="customer-info-grid">

          <div className="info-card">

            <h2>
              Customer Information
            </h2>

            <div className="info-row">

              <strong>
                Full Name
              </strong>

              <span>
                {customer.full_name || "-"}
              </span>

            </div>

            <div className="info-row">

              <strong>
                Email
              </strong>

              <span>
                {customer.email || "-"}
              </span>

            </div>

            <div className="info-row">

              <strong>
                Mobile
              </strong>

              <span>
                {customer.mobile || "-"}
              </span>

            </div>

            <div className="info-row">

              <strong>
                City
              </strong>

              <span>
                {customer.city || "-"}
              </span>

            </div>

            <div className="info-row">

              <strong>
                State
              </strong>

              <span>
                {customer.state || "-"}
              </span>

            </div>

          </div>

          <div className="info-card">

            <h2>
              Customer Summary
            </h2>

            <div className="summary-box">

              <h3>
                {orders.length}
              </h3>

              <p>
                Orders Placed
              </p>

            </div>

            <div className="summary-box">

              <h3>

                ₹
                {totalSpent.toLocaleString("en-IN")}

              </h3>

              <p>
                Total Purchased
              </p>

            </div>

            <div className="summary-box">

              <h3>

                {orders.length > 0
                  ? orders[0].order_status
                  : "No Orders"}

              </h3>

              <p>
                Latest Status
              </p>

            </div>

          </div>

        </section>

        <section className="orders-section">

          <div className="section-heading">

            <h2>
              Order History
            </h2>

          </div>

          <table className="orders-table">

            <thead>

              <tr>

                <th>Order</th>

                <th>Date</th>

                <th>Total</th>

                <th>Payment</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>
                            {orders.map((order) => (

              <tr key={order.id}>

                <td>

                  <strong>
                    {order.order_number}
                  </strong>

                </td>

                <td>

                  {new Date(
                    order.created_at
                  ).toLocaleDateString("en-IN")}

                </td>

                <td>

                  ₹
                  {Number(order.total).toLocaleString("en-IN")}

                </td>

                <td>

                  <span
                    className={
                      order.payment_status === "paid"
                        ? "paid-badge"
                        : "pending-badge"
                    }
                  >

                    {order.payment_status}

                  </span>

                </td>

                <td>

                  <span
                    className={`status ${order.order_status}`}
                  >

                    {order.order_status}

                  </span>

                </td>

              </tr>

            ))}

            {orders.length === 0 && (

              <tr>

                <td
                  colSpan={5}
                  style={{
                    textAlign: "center",
                    padding: "60px",
                  }}
                >

                  No Orders Found

                </td>

              </tr>

            )}

          </tbody>

        </table>

      </section>

      <section className="customer-actions">

        <button
          className="primary-btn"
          onClick={() =>
            router.push("/admin/orders")
          }
        >
          View All Orders
        </button>

        <button
          className="secondary-btn"
          onClick={() =>
            router.push("/admin/customers")
          }
        >
          Back To Customers
        </button>

      </section>

    </main>

  );

}