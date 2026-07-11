"use client";

import "./settings.css";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/lib/client";

type StoreSettings = {
  id: string;
  store_name: string;
  store_description: string;
  store_email: string;
  store_phone: string;
  whatsapp_number: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currency: string;
  delivery_charge: number;
  free_delivery_above: number;
  cod_enabled: boolean;
  online_payment_enabled: boolean;
  order_confirmation_email: boolean;
  low_stock_limit: number;
  maintenance_mode: boolean;
  created_at?: string;
  updated_at?: string;
};

const defaultSettings: StoreSettings = {
  id: "",

  store_name: "Paradise Collection",

  store_description:
    "Premium ladies fashion and designer collection.",

  store_email: "",

  store_phone: "",

  whatsapp_number: "",

  address: "",

  city: "",

  state: "",

  pincode: "",

  currency: "INR",

  delivery_charge: 0,

  free_delivery_above: 0,

  cod_enabled: true,

  online_payment_enabled: false,

  order_confirmation_email: true,

  low_stock_limit: 5,

  maintenance_mode: false,
};

export default function SettingsPage() {
  const [settings, setSettings] =
    useState<StoreSettings>(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [activeSection, setActiveSection] =
    useState<
      "store" | "contact" | "shipping" | "orders"
    >("store");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);

    setError("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
        });
      }
    } catch (error) {
      console.error(
        "LOAD SETTINGS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not load store settings."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateSetting<
    K extends keyof StoreSettings
  >(
    field: K,
    value: StoreSettings[K]
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");

    setSuccess("");
  }

  function showSuccessMessage(
    message: string
  ) {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess("");
    }, 3000);
  }
    async function saveSettings(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const supabase = createClient();

      const settingsData = {
  store_name:
    (settings.store_name || "").trim(),

  store_description:
    (settings.store_description || "").trim(),

  store_email:
    (settings.store_email || "").trim(),

  store_phone:
    (settings.store_phone || "").trim(),

  whatsapp_number:
    (settings.whatsapp_number || "").trim(),

  address:
    (settings.address || "").trim(),

  city:
    (settings.city || "").trim(),

  state:
    (settings.state || "").trim(),

  pincode:
    (settings.pincode || "").trim(),

  currency:
    settings.currency || "INR",

  delivery_charge:
    Number(settings.delivery_charge || 0),

  free_delivery_above:
    Number(settings.free_delivery_above || 0),

  cod_enabled:
    settings.cod_enabled,

  online_payment_enabled:
    settings.online_payment_enabled,

  order_confirmation_email:
    settings.order_confirmation_email,

  low_stock_limit:
    Number(settings.low_stock_limit || 5),

  maintenance_mode:
    settings.maintenance_mode,

  updated_at:
    new Date().toISOString(),
};

      if (settings.id) {
        const { data, error } = await supabase
          .from("store_settings")
          .update(settingsData)
          .eq("id", settings.id)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setSettings({
          ...defaultSettings,
          ...data,
        });

        showSuccessMessage(
          "Settings updated successfully."
        );
      } else {
        const { data, error } = await supabase
          .from("store_settings")
          .insert(settingsData)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setSettings({
          ...defaultSettings,
          ...data,
        });

        showSuccessMessage(
          "Store settings created successfully."
        );
      }
    } catch (error) {
      console.error(
        "SAVE SETTINGS ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Could not save store settings."
      );
    } finally {
      setSaving(false);
    }
  }

  function resetSettings() {
    const confirmReset = window.confirm(
      "Reset unsaved changes?"
    );

    if (!confirmReset) {
      return;
    }

    loadSettings();
  }

  if (loading) {
    return (
      <main className="settings-loading">

        <div className="settings-loader" />

        <p>PARADISE SETTINGS</p>

        <h1>Preparing Store Settings</h1>

        <span>
          Please wait while we load your
          Paradise Collection configuration.
        </span>

      </main>
    );
  }

  return (
    <main className="settings-page">

      <section className="settings-header">

        <div>

          <p>PARADISE STORE CONTROL</p>

          <h1>Store Settings</h1>

          <span>
            Manage your store information,
            delivery preferences and order
            configuration.
          </span>

        </div>

        <div className="settings-header-actions">

          <button
            type="button"
            className="settings-reset-btn"
            onClick={resetSettings}
            disabled={saving}
          >
            Reset Changes
          </button>

          <button
            type="submit"
            form="store-settings-form"
            className="settings-save-btn"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Changes"}
          </button>

        </div>

      </section>

      {error && (
        <div className="settings-message settings-error">
          {error}
        </div>
      )}

      {success && (
        <div className="settings-message settings-success">
          {success}
        </div>
      )}

      <section className="settings-layout">

        <aside className="settings-sidebar">

          <div className="settings-sidebar-heading">

            <p>CONFIGURATION</p>

            <h2>Settings Menu</h2>

          </div>

          <button
            type="button"
            className={
              activeSection === "store"
                ? "settings-nav-btn active"
                : "settings-nav-btn"
            }
            onClick={() =>
              setActiveSection("store")
            }
          >
            <span>01</span>

            <div>
              <strong>Store Information</strong>
              <small>
                Name and description
              </small>
            </div>
          </button>

          <button
            type="button"
            className={
              activeSection === "contact"
                ? "settings-nav-btn active"
                : "settings-nav-btn"
            }
            onClick={() =>
              setActiveSection("contact")
            }
          >
            <span>02</span>

            <div>
              <strong>Contact Details</strong>
              <small>
                Email, phone and address
              </small>
            </div>
          </button>

          <button
            type="button"
            className={
              activeSection === "shipping"
                ? "settings-nav-btn active"
                : "settings-nav-btn"
            }
            onClick={() =>
              setActiveSection("shipping")
            }
          >
            <span>03</span>

            <div>
              <strong>Shipping Settings</strong>
              <small>
                Delivery charges
              </small>
            </div>
          </button>

          <button
            type="button"
            className={
              activeSection === "orders"
                ? "settings-nav-btn active"
                : "settings-nav-btn"
            }
            onClick={() =>
              setActiveSection("orders")
            }
          >
            <span>04</span>

            <div>
              <strong>Order Settings</strong>
              <small>
                Payment and store controls
              </small>
            </div>
          </button>

        </aside>
                <form
          id="store-settings-form"
          className="settings-content"
          onSubmit={saveSettings}
        >

          {activeSection === "store" && (

            <section className="settings-card">

              <div className="settings-section-heading">

                <div>

                  <p>STORE IDENTITY</p>

                  <h2>Store Information</h2>

                  <span>
                    Manage your Paradise Collection
                    store identity and basic details.
                  </span>

                </div>

                <div className="settings-number">
                  01
                </div>

              </div>

              <div className="settings-form-grid">

                <div className="settings-field full-field">

                  <label>
                    Store Name
                  </label>

                  <input
                    type="text"
                    placeholder="Paradise Collection"
                    value={settings.store_name}
                    onChange={(event) =>
                      updateSetting(
                        "store_name",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field full-field">

                  <label>
                    Store Description
                  </label>

                  <textarea
                    placeholder="Enter your store description..."
                    value={
                      settings.store_description
                    }
                    onChange={(event) =>
                      updateSetting(
                        "store_description",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Store Currency
                  </label>

                  <select
                    value={settings.currency}
                    onChange={(event) =>
                      updateSetting(
                        "currency",
                        event.target.value
                      )
                    }
                  >

                    <option value="INR">
                      Indian Rupee (₹)
                    </option>

                    <option value="USD">
                      US Dollar ($)
                    </option>

                    <option value="AED">
                      UAE Dirham (AED)
                    </option>

                  </select>

                </div>

                <div className="settings-field">

                  <label>
                    Low Stock Limit
                  </label>

                  <input
                    type="number"
                    min="0"
                    placeholder="5"
                    value={settings.low_stock_limit}
                    onChange={(event) =>
                      updateSetting(
                        "low_stock_limit",
                        Number(event.target.value)
                      )
                    }
                  />

                </div>

              </div>

            </section>

          )}

          {activeSection === "contact" && (

            <section className="settings-card">

              <div className="settings-section-heading">

                <div>

                  <p>CONTACT INFORMATION</p>

                  <h2>Contact Details</h2>

                  <span>
                    Manage your customer support
                    and business contact information.
                  </span>

                </div>

                <div className="settings-number">
                  02
                </div>

              </div>

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Store Email
                  </label>

                  <input
                    type="email"
                    placeholder="support@paradise.com"
                    value={settings.store_email}
                    onChange={(event) =>
                      updateSetting(
                        "store_email",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Store Phone
                  </label>

                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={settings.store_phone}
                    onChange={(event) =>
                      updateSetting(
                        "store_phone",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    WhatsApp Number
                  </label>

                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={
                      settings.whatsapp_number
                    }
                    onChange={(event) =>
                      updateSetting(
                        "whatsapp_number",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    Pincode
                  </label>

                  <input
                    type="text"
                    placeholder="302001"
                    value={settings.pincode}
                    onChange={(event) =>
                      updateSetting(
                        "pincode",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field full-field">

                  <label>
                    Business Address
                  </label>

                  <textarea
                    placeholder="Enter complete store address..."
                    value={settings.address}
                    onChange={(event) =>
                      updateSetting(
                        "address",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    City
                  </label>

                  <input
                    type="text"
                    placeholder="Jaipur"
                    value={settings.city}
                    onChange={(event) =>
                      updateSetting(
                        "city",
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="settings-field">

                  <label>
                    State
                  </label>

                  <input
                    type="text"
                    placeholder="Rajasthan"
                    value={settings.state}
                    onChange={(event) =>
                      updateSetting(
                        "state",
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </section>

          )}
                    {activeSection === "shipping" && (

            <section className="settings-card">

              <div className="settings-section-heading">

                <div>

                  <p>DELIVERY CONFIGURATION</p>

                  <h2>Shipping Settings</h2>

                  <span>
                    Manage delivery charges and
                    free shipping preferences.
                  </span>

                </div>

                <div className="settings-number">
                  03
                </div>

              </div>

              <div className="settings-form-grid">

                <div className="settings-field">

                  <label>
                    Delivery Charge
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="99"
                    value={settings.delivery_charge}
                    onChange={(event) =>
                      updateSetting(
                        "delivery_charge",
                        Number(event.target.value)
                      )
                    }
                  />

                  <small>
                    Standard delivery charge applied
                    to customer orders.
                  </small>

                </div>

                <div className="settings-field">

                  <label>
                    Free Delivery Above
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="1999"
                    value={
                      settings.free_delivery_above
                    }
                    onChange={(event) =>
                      updateSetting(
                        "free_delivery_above",
                        Number(event.target.value)
                      )
                    }
                  />

                  <small>
                    Orders above this amount receive
                    free delivery.
                  </small>

                </div>

              </div>

              <div className="settings-info-box">

                <div className="settings-info-icon">
                  ₹
                </div>

                <div>

                  <p>CURRENT DELIVERY RULE</p>

                  <h3>
                    ₹
                    {Number(
                      settings.delivery_charge || 0
                    ).toLocaleString("en-IN")}
                    {" Delivery Charge"}
                  </h3>

                  <span>
                    Free delivery on orders above ₹
                    {Number(
                      settings.free_delivery_above || 0
                    ).toLocaleString("en-IN")}
                  </span>

                </div>

              </div>

            </section>

          )}

          {activeSection === "orders" && (

            <section className="settings-card">

              <div className="settings-section-heading">

                <div>

                  <p>ORDER CONFIGURATION</p>

                  <h2>Order Settings</h2>

                  <span>
                    Manage payment methods, order
                    notifications and store controls.
                  </span>

                </div>

                <div className="settings-number">
                  04
                </div>

              </div>

              <div className="settings-toggle-list">

                <div className="settings-toggle-row">

                  <div>

                    <h3>
                      Cash on Delivery
                    </h3>

                    <p>
                      Allow customers to place orders
                      using Cash on Delivery.
                    </p>

                  </div>

                  <label className="settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        settings.cod_enabled
                      }
                      onChange={(event) =>
                        updateSetting(
                          "cod_enabled",
                          event.target.checked
                        )
                      }
                    />

                    <span className="settings-slider" />

                  </label>

                </div>

                <div className="settings-toggle-row">

                  <div>

                    <h3>
                      Online Payments
                    </h3>

                    <p>
                      Enable online payment options
                      for customer orders.
                    </p>

                  </div>

                  <label className="settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        settings.online_payment_enabled
                      }
                      onChange={(event) =>
                        updateSetting(
                          "online_payment_enabled",
                          event.target.checked
                        )
                      }
                    />

                    <span className="settings-slider" />

                  </label>

                </div>

                <div className="settings-toggle-row">

                  <div>

                    <h3>
                      Order Confirmation Email
                    </h3>

                    <p>
                      Send confirmation notification
                      after a customer places an order.
                    </p>

                  </div>

                  <label className="settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        settings.order_confirmation_email
                      }
                      onChange={(event) =>
                        updateSetting(
                          "order_confirmation_email",
                          event.target.checked
                        )
                      }
                    />

                    <span className="settings-slider" />

                  </label>

                </div>

                <div className="settings-toggle-row danger-setting">

                  <div>

                    <h3>
                      Maintenance Mode
                    </h3>

                    <p>
                      Temporarily disable the customer
                      storefront while making updates.
                    </p>

                  </div>

                  <label className="settings-switch">

                    <input
                      type="checkbox"
                      checked={
                        settings.maintenance_mode
                      }
                      onChange={(event) =>
                        updateSetting(
                          "maintenance_mode",
                          event.target.checked
                        )
                      }
                    />

                    <span className="settings-slider" />

                  </label>

                </div>

              </div>

            </section>

          )}

          <div className="settings-bottom-actions">

            <button
              type="button"
              className="settings-reset-btn"
              onClick={resetSettings}
              disabled={saving}
            >
              Reset Changes
            </button>

            <button
              type="submit"
              className="settings-save-btn"
              disabled={saving}
            >
              {saving
                ? "Saving Settings..."
                : "Save All Changes →"}
            </button>

          </div>

        </form>

      </section>

    </main>
  );
}