"use client";

import "./customers.css";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type Customer = {
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
  user_id: string;
  total: number;
};

export default function CustomersPage() {

  const router = useRouter();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {

    setLoading(true);

    const supabase = createClient();

    const [{ data: profiles }, { data: orders }] =
      await Promise.all([
        supabase.from("profiles").select("*"),
        supabase.from("orders").select("*"),
      ]);

    setCustomers((profiles as Customer[]) || []);
    setOrders((orders as Order[]) || []);

    setLoading(false);

  }
async function deleteCustomer(id: string) {

  const ok = window.confirm("Delete this customer?");

  if (!ok) return;

  const supabase = createClient();

  const { data, error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", id)
    .select();

  console.log("DELETE DATA:", data);
  console.log("DELETE ERROR:", error);

  if (error) {
    alert(error.message);
    return;
  }

  loadData();
}

  const customerData = useMemo(() => {

    return customers.map((customer) => {

      const customerOrders = orders.filter(
        (order) => order.user_id === customer.id
      );

      const totalSpent = customerOrders.reduce(
        (sum, order) => sum + Number(order.total),
        0
      );

      return {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent,
      };

    });

  }, [customers, orders]);

  return (

    <main className="customers-page">

      <div className="customers-header">

        <div>

          <p>CUSTOMER MANAGEMENT</p>

          <h1>Paradise Customers</h1>

          <span>
            Manage your Paradise Collection customers.
          </span>

        </div>

        <button
          className="refresh-btn"
          onClick={loadData}
        >
          Refresh
        </button>

      </div>

      <div className="customer-stats">

        <div className="stat-card">

          <h2>{customerData.length}</h2>

          <span>Total Customers</span>

        </div>

        <div className="stat-card">

          <h2>{orders.length}</h2>

          <span>Total Orders</span>

        </div>

        <div className="stat-card">

          <h2>

            ₹

            {orders
              .reduce(
                (sum, order) =>
                  sum + Number(order.total),
                0
              )
              .toLocaleString("en-IN")}

          </h2>

          <span>Total Revenue</span>

        </div>

      </div>

      <div className="customers-card">

        <div className="customers-toolbar">

          <h2>All Customers</h2>

          <input
            type="text"
            placeholder="Search customer..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>

        <table className="customers-table">

          <thead>

            <tr>

              <th>Name</th>

              <th>Email</th>

              <th>Phone</th>

              <th>Orders</th>

              <th>Total Spend</th>

              <th>Joined</th>

              <th>Action</th>

            </tr>

          </thead>

          <tbody>
                    {customerData
            .filter((customer) => {

              const text = search.toLowerCase();

              return (

                (customer.full_name || "")
                  .toLowerCase()
                  .includes(text)

                ||

                (customer.email || "")
                  .toLowerCase()
                  .includes(text)

                ||

                (customer.mobile || "")
                  .includes(text)

              );

            })

            .map((customer) => (

              <tr key={customer.id}>

                <td>

                  <div className="customer-info">

                    <div className="customer-avatar">

                      {(customer.full_name || "P")
                        .charAt(0)
                        .toUpperCase()}

                    </div>

                    <div>

                      <strong>
                        {customer.full_name || "Unknown Customer"}
                      </strong>

                      <small>
                        {customer.city || "-"},{" "}
                        {customer.state || "-"}
                      </small>

                    </div>

                  </div>

                </td>

                <td>

                  {customer.email || "-"}

                </td>

                <td>

                  {customer.mobile || "-"}

                </td>

                <td>

                  <span className="orders-badge">

                    {customer.totalOrders}

                  </span>

                </td>

                <td>

                  <strong>

                    ₹
                    {customer.totalSpent.toLocaleString("en-IN")}

                  </strong>

                </td>

                <td>

                  {new Date(
                    customer.created_at
                  ).toLocaleDateString("en-IN")}

                </td>

                <td>

                  <div className="action-buttons">

                    <button
                      className="view-btn"
                      onClick={() =>
                        router.push(
                          `/admin/customers/${customer.id}`
                        )
                      }
                    >
                      View
                    </button>

                    
<button
  className="delete-btn"
  onClick={() => deleteCustomer(customer.id)}
>
  Delete
</button>

                  </div>

                </td>

              </tr>

            ))}
                      </tbody>

        </table>

        {!loading && customerData.length === 0 && (

          <div className="empty-customers">

            <div className="empty-icon">
              👥
            </div>

            <h2>No Customers Found</h2>

            <p>
              No customer records are available yet.
            </p>

          </div>

        )}

        {loading && (

          <div className="customers-loading">

            <div className="loader"></div>

            <p>
              Loading customers...
            </p>

          </div>

        )}

      </div>

      <section className="customers-summary">

        <div className="summary-card">

          <h3>
            {customerData.filter(
              (customer) => customer.totalOrders > 0
            ).length}
          </h3>

          <span>
            Customers With Orders
          </span>

        </div>

        <div className="summary-card">

          <h3>

            ₹

            {customerData
              .reduce(
                (sum, customer) =>
                  sum + customer.totalSpent,
                0
              )
              .toLocaleString("en-IN")}

          </h3>

          <span>
            Lifetime Revenue
          </span>

        </div>

        <div className="summary-card">

          <h3>

            {customerData.reduce(
              (sum, customer) =>
                sum + customer.totalOrders,
              0
            )}

          </h3>

          <span>
            Total Orders
          </span>

        </div>

      </section>

    </main>

  );

}