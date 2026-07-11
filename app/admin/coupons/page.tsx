"use client";

import "./coupons.css";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import { createClient } from "@/lib/lib/client";

type PromoCode = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  minimum_order: number;
  maximum_discount: number | null;
  usage_limit: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string | null;
  is_active: boolean;
  created_at: string;
};

type CouponForm = {
  code: string;
  description: string;
  discount_type: "percentage" | "fixed";
  discount_value: string;
  minimum_order: string;
  maximum_discount: string;
  usage_limit: string;
  valid_until: string;
  is_active: boolean;
};

const emptyCouponForm: CouponForm = {
  code: "",
  description: "",
  discount_type: "percentage",
  discount_value: "",
  minimum_order: "0",
  maximum_discount: "",
  usage_limit: "",
  valid_until: "",
  is_active: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<PromoCode[]>([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingCoupon, setEditingCoupon] =
    useState<PromoCode | null>(null);

  const [couponForm, setCouponForm] =
    useState<CouponForm>(emptyCouponForm);

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("promo_codes")
        .select("*")
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        throw new Error(error.message);
      }

      setCoupons((data as PromoCode[]) || []);
    } catch (error) {
      console.error(
        "LOAD COUPONS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not load coupons."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateCouponForm(
    field: keyof CouponForm,
    value: string | boolean
  ) {
    setCouponForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
    setSuccess("");
  }

  function openCreateCoupon() {
    setEditingCoupon(null);

    setCouponForm(emptyCouponForm);

    setError("");

    setSuccess("");

    setShowForm(true);
  }

  function closeCouponForm() {
    setShowForm(false);

    setEditingCoupon(null);

    setCouponForm(emptyCouponForm);

    setError("");
  }

  function openEditCoupon(coupon: PromoCode) {
    setEditingCoupon(coupon);

    setCouponForm({
      code: coupon.code,

      description:
        coupon.description || "",

      discount_type:
        coupon.discount_type,

      discount_value:
        String(coupon.discount_value),

      minimum_order:
        String(coupon.minimum_order || 0),

      maximum_discount:
        coupon.maximum_discount !== null
          ? String(coupon.maximum_discount)
          : "",

      usage_limit:
        coupon.usage_limit !== null
          ? String(coupon.usage_limit)
          : "",

      valid_until:
        coupon.valid_until
          ? new Date(coupon.valid_until)
              .toISOString()
              .slice(0, 10)
          : "",

      is_active:
        coupon.is_active ?? true,
    });

    setError("");

    setSuccess("");

    setShowForm(true);
  }
    const filteredCoupons = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    if (!searchText) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      return (
        coupon.code
          .toLowerCase()
          .includes(searchText) ||
        coupon.description
          ?.toLowerCase()
          .includes(searchText) ||
        coupon.discount_type
          .toLowerCase()
          .includes(searchText)
      );
    });
  }, [coupons, search]);

  const activeCoupons = useMemo(() => {
    return coupons.filter(
      (coupon) => coupon.is_active
    ).length;
  }, [coupons]);

  const totalUsage = useMemo(() => {
    return coupons.reduce(
      (total, coupon) =>
        total + Number(coupon.used_count || 0),
      0
    );
  }, [coupons]);

  function validateCouponForm() {
    if (!couponForm.code.trim()) {
      return "Please enter coupon code.";
    }

    if (
      !couponForm.discount_value ||
      Number(couponForm.discount_value) <= 0
    ) {
      return "Please enter a valid discount value.";
    }

    if (
      couponForm.discount_type ===
        "percentage" &&
      Number(couponForm.discount_value) > 100
    ) {
      return "Percentage discount cannot be greater than 100.";
    }

    if (
      Number(couponForm.minimum_order || 0) < 0
    ) {
      return "Minimum order cannot be negative.";
    }

    if (
      couponForm.maximum_discount &&
      Number(couponForm.maximum_discount) < 0
    ) {
      return "Maximum discount cannot be negative.";
    }

    if (
      couponForm.usage_limit &&
      Number(couponForm.usage_limit) <= 0
    ) {
      return "Usage limit must be greater than zero.";
    }

    return "";
  }

  async function saveCoupon(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError =
      validateCouponForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      const couponData = {
        code: couponForm.code
          .trim()
          .toUpperCase(),

        description:
          couponForm.description.trim() ||
          null,

        discount_type:
          couponForm.discount_type,

        discount_value:
          Number(couponForm.discount_value),

        minimum_order:
          Number(
            couponForm.minimum_order || 0
          ),

        maximum_discount:
          couponForm.maximum_discount
            ? Number(
                couponForm.maximum_discount
              )
            : null,

        usage_limit:
          couponForm.usage_limit
            ? Number(couponForm.usage_limit)
            : null,

        valid_until:
          couponForm.valid_until
            ? new Date(
                `${couponForm.valid_until}T23:59:59`
              ).toISOString()
            : null,

        is_active:
          couponForm.is_active,
      };

      if (editingCoupon) {
        const { error } = await supabase
          .from("promo_codes")
          .update(couponData)
          .eq("id", editingCoupon.id);

        if (error) {
          throw new Error(error.message);
        }

        setSuccess(
          "Coupon updated successfully."
        );
      } else {
        const { error } = await supabase
          .from("promo_codes")
          .insert(couponData);

        if (error) {
          throw new Error(error.message);
        }

        setSuccess(
          "Coupon created successfully."
        );
      }

      await loadCoupons();

      setShowForm(false);

      setEditingCoupon(null);

      setCouponForm(emptyCouponForm);
    } catch (error) {
      console.error(
        "SAVE COUPON ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not save coupon."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCoupon(
    coupon: PromoCode
  ) {
    const confirmDelete = window.confirm(
      `Delete coupon "${coupon.code}"?`
    );

    if (!confirmDelete) {
      return;
    }

    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("promo_codes")
        .delete()
        .eq("id", coupon.id);

      if (error) {
        throw new Error(error.message);
      }

      setCoupons((previous) =>
        previous.filter(
          (item) => item.id !== coupon.id
        )
      );

      setSuccess(
        "Coupon deleted successfully."
      );
    } catch (error) {
      console.error(
        "DELETE COUPON ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not delete coupon."
      );
    }
  }

  async function toggleCouponStatus(
    coupon: PromoCode
  ) {
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const newStatus = !coupon.is_active;

      const { error } = await supabase
        .from("promo_codes")
        .update({
          is_active: newStatus,
        })
        .eq("id", coupon.id);

      if (error) {
        throw new Error(error.message);
      }

      setCoupons((previous) =>
        previous.map((item) =>
          item.id === coupon.id
            ? {
                ...item,
                is_active: newStatus,
              }
            : item
        )
      );
    } catch (error) {
      console.error(
        "TOGGLE COUPON ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not update coupon status."
      );
    }
  }
    function getCouponStatus(coupon: PromoCode) {
    if (!coupon.is_active) {
      return {
        label: "Inactive",
        className: "coupon-status inactive",
      };
    }

    if (
      coupon.valid_until &&
      new Date(coupon.valid_until) < new Date()
    ) {
      return {
        label: "Expired",
        className: "coupon-status expired",
      };
    }

    if (
      coupon.usage_limit !== null &&
      Number(coupon.used_count || 0) >=
        coupon.usage_limit
    ) {
      return {
        label: "Limit Reached",
        className: "coupon-status expired",
      };
    }

    return {
      label: "Active",
      className: "coupon-status active",
    };
  }

  return (
    <main className="coupons-page">

      <section className="coupons-header">

        <div>
          <p>PARADISE PROMOTIONS</p>

          <h1>Coupon Management</h1>

          <span>
            Create and manage promotional offers for
            Paradise Collection customers.
          </span>
        </div>

        <div className="coupons-header-actions">

          <button
            className="coupon-refresh-btn"
            onClick={loadCoupons}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>

          <button
            className="create-coupon-btn"
            onClick={openCreateCoupon}
          >
            + Create Coupon
          </button>

        </div>

      </section>

      <section className="coupon-stats">

        <div className="coupon-stat-card">

          <p>TOTAL COUPONS</p>

          <h2>{coupons.length}</h2>

          <span>
            All promotional codes
          </span>

        </div>

        <div className="coupon-stat-card">

          <p>ACTIVE OFFERS</p>

          <h2>{activeCoupons}</h2>

          <span>
            Currently enabled coupons
          </span>

        </div>

        <div className="coupon-stat-card">

          <p>TOTAL USAGE</p>

          <h2>
            {totalUsage.toLocaleString("en-IN")}
          </h2>

          <span>
            Coupon redemptions
          </span>

        </div>

      </section>

      {error && (
        <div className="coupon-message coupon-error">
          {error}
        </div>
      )}

      {success && (
        <div className="coupon-message coupon-success">
          {success}
        </div>
      )}

      <section className="coupons-card">

        <div className="coupons-toolbar">

          <div>

            <p>DISCOUNT COLLECTION</p>

            <h2>All Coupons</h2>

          </div>

          <input
            type="text"
            placeholder="Search coupon code..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>

        <div className="coupons-table-wrapper">

          <table className="coupons-table">

            <thead>

              <tr>
                <th>Coupon</th>
                <th>Discount</th>
                <th>Minimum Order</th>
                <th>Usage</th>
                <th>Valid Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>

            </thead>

            <tbody>

              {filteredCoupons.map((coupon) => {

                const status =
                  getCouponStatus(coupon);

                return (

                  <tr key={coupon.id}>

                    <td>

                      <div className="coupon-code-info">

                        <strong>
                          {coupon.code}
                        </strong>

                        <span>
                          {coupon.description ||
                            "Paradise promotional offer"}
                        </span>

                      </div>

                    </td>

                    <td>

                      <div className="coupon-discount">

                        <strong>

                          {coupon.discount_type ===
                          "percentage"
                            ? `${Number(
                                coupon.discount_value
                              )}%`
                            : `₹${Number(
                                coupon.discount_value
                              ).toLocaleString(
                                "en-IN"
                              )}`}

                        </strong>

                        <span>
                          {coupon.discount_type ===
                          "percentage"
                            ? "Percentage"
                            : "Fixed Amount"}
                        </span>

                      </div>

                    </td>

                    <td>

                      ₹
                      {Number(
                        coupon.minimum_order || 0
                      ).toLocaleString("en-IN")}

                    </td>

                    <td>

                      <div className="coupon-usage">

                        <strong>
                          {coupon.used_count || 0}
                        </strong>

                        <span>
                          {" / "}
                          {coupon.usage_limit ??
                            "Unlimited"}
                        </span>

                      </div>

                    </td>

                    <td>

                      {coupon.valid_until
                        ? new Date(
                            coupon.valid_until
                          ).toLocaleDateString(
                            "en-IN"
                          )
                        : "No Expiry"}

                    </td>

                    <td>

                      <button
                        type="button"
                        className={status.className}
                        onClick={() =>
                          toggleCouponStatus(coupon)
                        }
                      >
                        {status.label}
                      </button>

                    </td>

                    <td>

                      <div className="coupon-actions">

                        <button
                          type="button"
                          className="coupon-edit-btn"
                          onClick={() =>
                            openEditCoupon(coupon)
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="coupon-delete-btn"
                          onClick={() =>
                            deleteCoupon(coupon)
                          }
                        >
                          Delete
                        </button>

                      </div>

                    </td>

                  </tr>

                );

              })}

            </tbody>

          </table>

        </div>
                {!loading &&
          filteredCoupons.length === 0 && (
            <div className="empty-coupons">

              <div className="empty-coupon-icon">
                %
              </div>

              <p>PARADISE PROMOTIONS</p>

              <h2>No Coupons Found</h2>

              <span>
                Create your first promotional coupon
                for Paradise Collection customers.
              </span>

              <button
                type="button"
                onClick={openCreateCoupon}
              >
                Create Coupon →
              </button>

            </div>
          )}

        {loading && (
          <div className="coupons-loading">

            <div className="coupon-loader" />

            <h2>Loading Coupons</h2>

            <p>
              Please wait while we prepare your
              Paradise promotional offers.
            </p>

          </div>
        )}

      </section>

      {showForm && (

        <div className="coupon-modal-overlay">

          <div className="coupon-modal">

            <div className="coupon-modal-header">

              <div>

                <p>
                  {editingCoupon
                    ? "UPDATE PARADISE OFFER"
                    : "CREATE PARADISE OFFER"}
                </p>

                <h2>
                  {editingCoupon
                    ? "Edit Coupon"
                    : "Create Coupon"}
                </h2>

              </div>

              <button
                type="button"
                className="coupon-close-btn"
                onClick={closeCouponForm}
              >
                ×
              </button>

            </div>

            <form
              className="coupon-form"
              onSubmit={saveCoupon}
            >

              <div className="coupon-form-grid">

                <div className="coupon-field">

                  <label>
                    Coupon Code *
                  </label>

                  <input
                    type="text"
                    placeholder="WELCOME20"
                    value={couponForm.code}
                    onChange={(event) =>
                      updateCouponForm(
                        "code",
                        event.target.value.toUpperCase()
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Discount Type *
                  </label>

                  <select
                    value={
                      couponForm.discount_type
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "discount_type",
                        event.target.value
                      )
                    }
                  >
                    <option value="percentage">
                      Percentage Discount
                    </option>

                    <option value="fixed">
                      Fixed Amount
                    </option>
                  </select>

                </div>

                <div className="coupon-field full-field">

                  <label>
                    Description
                  </label>

                  <textarea
                    placeholder="Enter coupon description..."
                    value={
                      couponForm.description
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "description",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Discount Value *
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder={
                      couponForm.discount_type ===
                      "percentage"
                        ? "20"
                        : "500"
                    }
                    value={
                      couponForm.discount_value
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "discount_value",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Minimum Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="999"
                    value={
                      couponForm.minimum_order
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "minimum_order",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Maximum Discount
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Optional"
                    value={
                      couponForm.maximum_discount
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "maximum_discount",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Usage Limit
                  </label>

                  <input
                    type="number"
                    min="1"
                    placeholder="Optional"
                    value={
                      couponForm.usage_limit
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "usage_limit",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field">

                  <label>
                    Valid Until
                  </label>

                  <input
                    type="date"
                    value={
                      couponForm.valid_until
                    }
                    onChange={(event) =>
                      updateCouponForm(
                        "valid_until",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="coupon-field coupon-active-field">

                  <label>
                    Coupon Status
                  </label>

                  <label className="coupon-switch">

                    <input
                      type="checkbox"
                      checked={
                        couponForm.is_active
                      }
                      onChange={(event) =>
                        updateCouponForm(
                          "is_active",
                          event.target.checked
                        )
                      }
                    />

                    <span className="coupon-slider" />

                    <strong>
                      {couponForm.is_active
                        ? "Active"
                        : "Inactive"}
                    </strong>

                  </label>

                </div>

              </div>

              <div className="coupon-form-actions">

                <button
                  type="button"
                  className="coupon-cancel-btn"
                  onClick={closeCouponForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="coupon-save-btn"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingCoupon
                    ? "Update Coupon →"
                    : "Create Coupon →"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </main>
  );
}