"use client";

import "./checkout.css";
import { createClient } from "@/lib/lib/client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CartItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
};

type CheckoutData = {
  subtotal: number;
  productSavings: number;
  couponDiscount: number;
  deliveryCharge: number;
  total: number;
  items: CartItem[];
};

type Address = {
  fullName: string;
  mobile: string;
  alternateMobile: string;
  pincode: string;
  house: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
};

const emptyAddress: Address = {
  fullName: "",
  mobile: "",
  alternateMobile: "",
  pincode: "",
  house: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
};

export default function CheckoutPage() {
  const router = useRouter();

  const [checkout, setCheckout] =
    useState<CheckoutData | null>(null);

  const [address, setAddress] =
    useState<Address>(emptyAddress);

  const [paymentMethod, setPaymentMethod] =
    useState("cod");

  const [error, setError] = useState("");

  const [placingOrder, setPlacingOrder] =
    useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCheckout =
        localStorage.getItem("paradise-checkout");

      const savedBuyNow =
        localStorage.getItem("paradise-buy-now");

      const savedAddress =
        localStorage.getItem("paradise-address");

      if (savedCheckout) {
        const parsedCheckout =
          JSON.parse(savedCheckout);

        setCheckout(parsedCheckout);
      } else if (savedBuyNow) {
        const buyNowProduct =
          JSON.parse(savedBuyNow);

        const quantity =
          Number(buyNowProduct.quantity) || 1;

        const price =
          Number(buyNowProduct.price) || 0;

        const mrp =
          Number(buyNowProduct.mrp) || price;

        const actualSubtotal =
          price * quantity;

        const mrpTotal =
          mrp * quantity;

        const productSavings =
          mrpTotal - actualSubtotal;

        const deliveryCharge =
          actualSubtotal >= 999 ? 0 : 99;

        const total =
          actualSubtotal + deliveryCharge;

        const buyNowCheckout: CheckoutData = {
          subtotal: actualSubtotal,
          productSavings,
          couponDiscount: 0,
          deliveryCharge,
          total,
          items: [
            {
              id: String(buyNowProduct.id),

              name:
                buyNowProduct.name ||
                "Paradise Collection Product",

              category:
                buyNowProduct.category ||
                "Paradise Collection",

              price,

              mrp,

              image:
                buyNowProduct.image ||
                buyNowProduct.image_url ||
                "",

              quantity,
            },
          ],
        };

        setCheckout(buyNowCheckout);

        localStorage.setItem(
          "paradise-checkout",
          JSON.stringify(buyNowCheckout)
        );
      }

      if (savedAddress) {
        setAddress(
          JSON.parse(savedAddress)
        );
      }
    } catch (error) {
      console.error(
        "Checkout data error:",
        error
      );

      setError(
        "Could not load checkout information."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  function updateAddress(
    field: keyof Address,
    value: string
  ) {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));

    setError("");
  }

  function validateAddress() {
    if (!address.fullName.trim()) {
      return "Please enter your full name.";
    }

    if (!/^[0-9]{10}$/.test(address.mobile)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (!/^[0-9]{6}$/.test(address.pincode)) {
      return "Please enter a valid 6-digit PIN code.";
    }

    if (!address.house.trim()) {
      return "Please enter house number or building name.";
    }

    if (!address.area.trim()) {
      return "Please enter your area or street.";
    }

    if (!address.city.trim()) {
      return "Please enter your city.";
    }

    if (!address.state.trim()) {
      return "Please enter your state.";
    }

    return "";
  }

  async function placeOrder(event: FormEvent) {
    event.preventDefault();

    setError("");

    if (!checkout) {
      setError(
        "Checkout information not found."
      );

      return;
    }

    if (checkout.items.length === 0) {
      setError(
        "Your shopping bag is empty."
      );

      return;
    }

    const validationError =
      validateAddress();

    if (validationError) {
      setError(validationError);

      return;
    }

    setPlacingOrder(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(
          userError.message
        );
      }

      if (!user) {
        throw new Error(
          "Please login before placing your order."
        );
      }

      localStorage.setItem(
        "paradise-address",
        JSON.stringify(address)
      );

      const orderNumber =
        `PAR${Date.now()}`;

      const completeAddress = [
        address.house.trim(),
        address.area.trim(),
        address.landmark.trim()
          ? `Near ${address.landmark.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join(", ");

      const databasePaymentMethod =
        paymentMethod === "cod"
          ? "Cash on Delivery"
          : "Online Payment";

      const {
        data: createdOrder,
        error: orderError,
      } = await supabase
        .from("orders")
        .insert({
          order_number:
            orderNumber,

          user_id:
            user.id,

          customer_name:
            address.fullName.trim(),

          email:
            user.email || null,

          phone:
            address.mobile,

          address:
            completeAddress,

          city:
            address.city.trim(),

          state:
            address.state.trim(),

          pincode:
            address.pincode,

          payment_method:
            databasePaymentMethod,

          payment_status:
            "pending",

          order_status:
            "confirmed",

          subtotal:
            Number(checkout.subtotal),

          discount:
            Number(
              checkout.productSavings +
              checkout.couponDiscount
            ),

          delivery_charge:
            Number(
              checkout.deliveryCharge
            ),

          total:
            Number(checkout.total),

          promo_code:
            null,
        })
        .select(
          "id, order_number, created_at"
        )
        .single();

      if (orderError) {
        console.error(
          "ORDER INSERT ERROR:",
          orderError
        );

        throw new Error(
          `Order could not be created: ${orderError.message}`
        );
      }

      if (!createdOrder) {
        throw new Error(
          "Order could not be created."
        );
      }

      const orderItems =
        checkout.items.map((item) => ({
          order_id:
            createdOrder.id,

          product_id:
            item.id,

          product_name:
            item.name,

          product_image:
            item.image || null,

          price:
            Number(item.price),

          quantity:
            Number(item.quantity),
        }));

      const order = {
        id:
          createdOrder.id,

        orderId:
          createdOrder.order_number,

        createdAt:
          createdOrder.created_at,

        status:
          "Order Confirmed",

        paymentMethod,

        address,

        subtotal:
          checkout.subtotal,

        productSavings:
          checkout.productSavings,

        couponDiscount:
          checkout.couponDiscount,

        deliveryCharge:
          checkout.deliveryCharge,

        total:
          checkout.total,

        items:
          checkout.items,
      };

      let existingOrders = [];

      try {
        existingOrders =
          JSON.parse(
            localStorage.getItem(
              "paradise-orders"
            ) || "[]"
          );
      } catch {
        existingOrders = [];
      }

      localStorage.setItem(
        "paradise-orders",

        JSON.stringify([
          order,
          ...existingOrders,
        ])
      );

      localStorage.setItem(
        "paradise-current-order",
        JSON.stringify(order)
      );

      const successOrder = {
        id:
          createdOrder.id,

        orderId:
          createdOrder.order_number,

        customerName:
          address.fullName,

        phone:
          address.mobile,

        email:
          user.email || "",

        address:
          completeAddress,

        city:
          address.city,

        state:
          address.state,

        pincode:
          address.pincode,

        paymentMethod:
          databasePaymentMethod,

        subtotal:
          checkout.subtotal,

        deliveryCharge:
          checkout.deliveryCharge,

        total:
          checkout.total,

        items:
          checkout.items,
      };

      localStorage.setItem(
        "paradiseLastOrder",
        JSON.stringify(successOrder)
      );

      localStorage.removeItem(
        "paradise-cart"
      );

      localStorage.removeItem(
        "paradise-checkout"
      );

      localStorage.removeItem(
        "paradise-buy-now"
      );

      router.push(
        "/order-success"
      );
    } catch (error) {
      console.error(
        "PLACE ORDER ERROR:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to place your order. Please try again."
      );

      setPlacingOrder(false);
    }
  }

  if (loading) {
    return (
      <main className="checkout-empty">
        <div className="checkout-empty-logo">
          P
        </div>

        <p>
          PARADISE COLLECTION
        </p>

        <h1>
          Preparing Your Checkout
        </h1>

        <span>
          Please wait while we prepare
          your Paradise order.
        </span>
      </main>
    );
  }

  if (!checkout) {
    return (
      <main className="checkout-empty">
        <div className="checkout-empty-logo">
          P
        </div>

        <p>
          PARADISE COLLECTION
        </p>

        <h1>
          No Checkout Session Found
        </h1>

        <span>
          Please select a product or
          add products to your shopping bag.
        </span>

        <button
          onClick={() =>
            router.push("/shop")
          }
        >
          Explore Collection →
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page">

      <div className="checkout-offer-bar">
        <span>
          FREE SHIPPING ON ORDERS ABOVE ₹999
        </span>

        <span>
          SECURE & TRUSTED CHECKOUT
        </span>
      </div>

      <header className="checkout-header">

        <button
          className="checkout-logo"
          onClick={() =>
            router.push("/shop")
          }
        >
          <div className="checkout-logo-icon">
            P
          </div>

          <div>
            <strong>
              PARADISE
            </strong>

            <span>
              COLLECTION
            </span>
          </div>
        </button>

        <div className="checkout-progress">

          <div className="progress-complete">
            <b>✓</b>
            <span>
              Shopping Bag
            </span>
          </div>

          <i className="progress-line-complete" />

          <div className="progress-active">
            <b>2</b>
            <span>
              Address
            </span>
          </div>

          <i />

          <div>
            <b>3</b>
            <span>
              Payment
            </span>
          </div>

        </div>

        <button
          className="checkout-back"
          onClick={() =>
            router.push("/cart")
          }
        >
          ← Back To Bag
        </button>

      </header>

      <section className="checkout-hero">

        <p>
          COMPLETE YOUR PARADISE ORDER
        </p>

        <h1>
          Secure Checkout
        </h1>

        <span>
          Enter your delivery details
          and choose your payment method.
        </span>

      </section>

      <form
        className="checkout-layout"
        onSubmit={placeOrder}
      >

        <div className="checkout-main-column">

          <section className="checkout-card">

            <div className="checkout-section-heading">

              <div className="checkout-step-number">
                1
              </div>

              <div>
                <p>
                  DELIVERY DETAILS
                </p>

                <h2>
                  Where Should We Deliver?
                </h2>
              </div>

            </div>

            <div className="checkout-form-grid">

              <div className="checkout-field full-field">

                <label>
                  Full Name *
                </label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={address.fullName}
                  onChange={(event) =>
                    updateAddress(
                      "fullName",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="checkout-field">

                <label>
                  Mobile Number *
                </label>

                <div className="checkout-mobile-input">

                  <span>
                    +91
                  </span>

                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={address.mobile}
                    onChange={(event) =>
                      updateAddress(
                        "mobile",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />

                </div>

              </div>

              <div className="checkout-field">

                <label>
                  Alternate Mobile
                </label>

                <div className="checkout-mobile-input">

                  <span>
                    +91
                  </span>

                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="Optional"
                    value={
                      address.alternateMobile
                    }
                    onChange={(event) =>
                      updateAddress(
                        "alternateMobile",
                        event.target.value.replace(
                          /\D/g,
                          ""
                        )
                      )
                    }
                  />

                </div>

              </div>

              <div className="checkout-field">

                <label>
                  PIN Code *
                </label>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="6-digit PIN code"
                  value={address.pincode}
                  onChange={(event) =>
                    updateAddress(
                      "pincode",
                      event.target.value.replace(
                        /\D/g,
                        ""
                      )
                    )
                  }
                />

              </div>

              <div className="checkout-field">

                <label>
                  City *
                </label>

                <input
                  type="text"
                  placeholder="Enter city"
                  value={address.city}
                  onChange={(event) =>
                    updateAddress(
                      "city",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="checkout-field full-field">

                <label>
                  House No., Building Name *
                </label>

                <input
                  type="text"
                  placeholder="House number, flat or building name"
                  value={address.house}
                  onChange={(event) =>
                    updateAddress(
                      "house",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="checkout-field full-field">

                <label>
                  Road, Area, Colony *
                </label>

                <input
                  type="text"
                  placeholder="Area, street, sector or colony"
                  value={address.area}
                  onChange={(event) =>
                    updateAddress(
                      "area",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="checkout-field">

                <label>
                  Landmark
                </label>

                <input
                  type="text"
                  placeholder="Optional landmark"
                  value={address.landmark}
                  onChange={(event) =>
                    updateAddress(
                      "landmark",
                      event.target.value
                    )
                  }
                />

              </div>

              <div className="checkout-field">

                <label>
                  State *
                </label>

                <input
                  type="text"
                  placeholder="Enter state"
                  value={address.state}
                  onChange={(event) =>
                    updateAddress(
                      "state",
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

          </section>

          <section className="checkout-card">

            <div className="checkout-section-heading">

              <div className="checkout-step-number">
                2
              </div>

              <div>
                <p>
                  PAYMENT METHOD
                </p>

                <h2>
                  How Would You Like To Pay?
                </h2>
              </div>

            </div>

            <div className="payment-options">

              <label
                className={
                  paymentMethod === "cod"
                    ? "payment-option payment-selected"
                    : "payment-option"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  value="cod"
                  checked={
                    paymentMethod === "cod"
                  }
                  onChange={() =>
                    setPaymentMethod("cod")
                  }
                />

                <div className="payment-icon">
                  ₹
                </div>

                <div>
                  <strong>
                    Cash On Delivery
                  </strong>

                  <span>
                    Pay securely when your
                    Paradise order arrives.
                  </span>
                </div>

                <b className="payment-check">
                  {paymentMethod === "cod"
                    ? "✓"
                    : ""}
                </b>

              </label>

              <label
                className={
                  paymentMethod === "online"
                    ? "payment-option payment-selected"
                    : "payment-option"
                }
              >

                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={
                    paymentMethod === "online"
                  }
                  onChange={() =>
                    setPaymentMethod("online")
                  }
                />

                <div className="payment-icon">
                  ◇
                </div>

                <div>
                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    UPI, Cards, Net Banking
                    and secure payment options.
                  </span>
                </div>

                <b className="payment-check">
                  {paymentMethod === "online"
                    ? "✓"
                    : ""}
                </b>

              </label>

            </div>

            {paymentMethod === "online" && (
              <div className="online-payment-notice">

                <strong>
                  Online Payment Integration
                </strong>

                <p>
                  Online payment gateway will
                  be connected before production
                  deployment. Currently this
                  option creates a test order.
                </p>

              </div>
            )}

          </section>

          {error && (
            <div className="checkout-error-message">
              {error}
            </div>
          )}

        </div>

        <aside className="checkout-order-summary">

          <div className="checkout-summary-heading">

            <p>
              YOUR ORDER
            </p>

            <h2>
              Order Summary
            </h2>

          </div>

          <div className="checkout-product-list">

            {checkout.items.map((item) => (

              <div
                className="checkout-product"
                key={item.id}
              >

                <div className="checkout-product-image">

                  <img
                    src={item.image}
                    alt={item.name}
                  />

                  <span>
                    {item.quantity}
                  </span>

                </div>

                <div className="checkout-product-info">

                  <p>
                    {item.category}
                  </p>

                  <strong>
                    {item.name}
                  </strong>

                  <span>
                    ₹{item.price.toLocaleString()}
                    {" × "}
                    {item.quantity}
                  </span>

                </div>

                <b>
                  ₹
                  {(
                    item.price *
                    item.quantity
                  ).toLocaleString()}
                </b>

              </div>

            ))}

          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-price-list">

            <div>
              <span>
                Subtotal
              </span>

              <strong>
                ₹
                {checkout.subtotal.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>
                Product Savings
              </span>

              <strong className="checkout-green">
                − ₹
                {checkout.productSavings.toLocaleString()}
              </strong>
            </div>

            {checkout.couponDiscount > 0 && (
              <div>
                <span>
                  Coupon Discount
                </span>

                <strong className="checkout-green">
                  − ₹
                  {checkout.couponDiscount.toLocaleString()}
                </strong>
              </div>
            )}

            <div>
              <span>
                Delivery
              </span>

              <strong
                className={
                  checkout.deliveryCharge === 0
                    ? "checkout-green"
                    : ""
                }
              >
                {checkout.deliveryCharge === 0
                  ? "FREE"
                  : `₹${checkout.deliveryCharge}`}
              </strong>
            </div>

          </div>

          <div className="checkout-summary-divider" />

          <div className="checkout-final-total">

            <span>
              Total Amount
            </span>

            <strong>
              ₹
              {checkout.total.toLocaleString()}
            </strong>

          </div>

          <div className="checkout-savings">

            You save ₹
            {(
              checkout.productSavings +
              checkout.couponDiscount
            ).toLocaleString()}{" "}
            on this Paradise order.

          </div>

          <button
            type="submit"
            className="place-order-button"
            disabled={placingOrder}
          >
            {placingOrder
              ? "Placing Your Order..."
              : paymentMethod === "cod"
              ? "Place COD Order →"
              : "Continue To Payment →"}
          </button>

          <div className="checkout-security">

            <span>
              ♢
            </span>

            <div>
              <strong>
                100% Secure Checkout
              </strong>

              <p>
                Your personal information
                is protected.
              </p>
            </div>

          </div>

          <div className="checkout-policies">

            <span>
              ✓ Easy Returns
            </span>

            <span>
              ✓ Trusted Delivery
            </span>

            <span>
              ✓ Secure Shopping
            </span>

          </div>

        </aside>

      </form>

      <section className="checkout-assistance">

        <p>
          NEED HELP?
        </p>

        <h2>
          Your Paradise Assistant Is Always Here
        </h2>

        <span>
          Need help with your order,
          delivery or collection?
        </span>

        <button
          onClick={() =>
            router.push("/assistant")
          }
        >
          Talk To Your Assistant →
        </button>

      </section>

      <footer className="checkout-footer">

        <div className="checkout-footer-brand">

          <div className="checkout-logo-icon">
            P
          </div>

          <div>
            <strong>
              PARADISE
            </strong>

            <span>
              COLLECTION
            </span>
          </div>

        </div>

        <p>
          Premium fashion, thoughtfully
          curated for every woman and
          every occasion.
        </p>

        <small>
          © 2026 Paradise Collection
        </small>

      </footer>

    </main>
  );
}