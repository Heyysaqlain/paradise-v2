"use client";

import "./cart.css";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  mrp: number;
  image: string;
};

type CartItem = Product & {
  quantity: number;
};

const products: Product[] = [
  {
    id: 1,
    name: "Noor Embroidered Anarkali Suit",
    category: "Party Wear",
    price: 1999,
    mrp: 2999,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Meher Premium Festive Suit",
    category: "Festive",
    price: 2499,
    mrp: 3499,
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Royal Wedding Collection Suit",
    category: "Wedding",
    price: 3299,
    mrp: 4999,
    image:
      "https://images.unsplash.com/photo-1597983073512-90bd150e19f6?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Aayat Designer Party Suit",
    category: "Party Wear",
    price: 1799,
    mrp: 2699,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Zara Elegant Cotton Suit",
    category: "Daily Wear",
    price: 1299,
    mrp: 1999,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Inaya Luxury Designer Suit",
    category: "Designer",
    price: 2899,
    mrp: 4299,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Mahira Festive Embroidered Suit",
    category: "Festive",
    price: 2199,
    mrp: 3199,
    image:
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Safa Premium Wedding Suit",
    category: "Wedding",
    price: 3999,
    mrp: 5999,
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
  },
];

export default function CartPage() {
  const router = useRouter();

  const [cartIds, setCartIds] = useState<number[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("paradise-cart");

      if (savedCart) {
        setCartIds(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Unable to load cart", error);
    } finally {
      setLoading(false);
    }
  }, []);

  function saveCart(updatedCart: number[]) {
    setCartIds(updatedCart);

    localStorage.setItem(
      "paradise-cart",
      JSON.stringify(updatedCart)
    );
  }

  const cartItems = useMemo<CartItem[]>(() => {
    const quantities: Record<number, number> = {};

    cartIds.forEach((id) => {
      quantities[id] = (quantities[id] || 0) + 1;
    });

    return Object.entries(quantities)
      .map(([id, quantity]) => {
        const product = products.find(
          (item) => item.id === Number(id)
        );

        if (!product) return null;

        return {
          ...product,
          quantity,
        };
      })
      .filter(Boolean) as CartItem[];
  }, [cartIds]);

  function increaseQuantity(productId: number) {
    const updatedCart = [...cartIds, productId];

    saveCart(updatedCart);
  }

  function decreaseQuantity(productId: number) {
    const index = cartIds.lastIndexOf(productId);

    if (index === -1) return;

    const updatedCart = [...cartIds];

    updatedCart.splice(index, 1);

    saveCart(updatedCart);
  }

  function removeProduct(productId: number) {
    const updatedCart = cartIds.filter(
      (id) => id !== productId
    );

    saveCart(updatedCart);
  }

  function clearCart() {
    saveCart([]);
    setCouponApplied(false);
    setCoupon("");
    setCouponMessage("");
  }

  function applyCoupon() {
    if (coupon.trim().toUpperCase() === "PARADISE10") {
      setCouponApplied(true);

      setCouponMessage(
        "PARADISE10 applied successfully. You saved 10%."
      );

      return;
    }

    setCouponApplied(false);

    setCouponMessage(
      "Invalid coupon code. Try PARADISE10."
    );
  }

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  const mrpTotal = cartItems.reduce(
    (total, item) =>
      total + item.mrp * item.quantity,
    0
  );

  const productSavings = mrpTotal - subtotal;

  const couponDiscount = couponApplied
    ? Math.round(subtotal * 0.1)
    : 0;

  const deliveryCharge =
    subtotal === 0 || subtotal >= 999 ? 0 : 99;

  const finalTotal =
    subtotal - couponDiscount + deliveryCharge;

  function proceedToCheckout() {
    if (cartItems.length === 0) return;

    const checkoutSummary = {
      subtotal,
      productSavings,
      couponDiscount,
      deliveryCharge,
      total: finalTotal,
      items: cartItems,
    };

    localStorage.setItem(
      "paradise-checkout",
      JSON.stringify(checkoutSummary)
    );

    router.push("/checkout");
  }

  if (loading) {
    return (
      <main className="cart-page cart-loading">
        Loading your Paradise bag...
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-top-offer">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>

        <span>NEW CUSTOMER? USE CODE PARADISE10</span>
      </div>

      <header className="cart-page-header">
        <button
          className="cart-page-logo"
          onClick={() => router.push("/shop")}
        >
          <div className="cart-page-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </button>

        <div className="cart-progress">
          <div className="active-cart-progress">
            <b>1</b>
            <span>Shopping Bag</span>
          </div>

          <i />

          <div>
            <b>2</b>
            <span>Address</span>
          </div>

          <i />

          <div>
            <b>3</b>
            <span>Payment</span>
          </div>
        </div>

        <button
          className="continue-shopping-top"
          onClick={() => router.push("/shop")}
        >
          Continue Shopping →
        </button>
      </header>

      <section className="cart-hero">
        <p>YOUR PARADISE SELECTION</p>

        <h1>Shopping Bag</h1>

        <span>
          {cartIds.length}{" "}
          {cartIds.length === 1 ? "item" : "items"} in your bag
        </span>
      </section>

      {cartItems.length === 0 ? (
        <section className="cart-empty-state">
          <div className="empty-bag-icon">◇</div>

          <p>YOUR PARADISE BAG</p>

          <h2>Your Shopping Bag Is Empty</h2>

          <span>
            Your perfect Paradise collection is waiting for you.
          </span>

          <button onClick={() => router.push("/shop")}>
            Explore Collection →
          </button>
        </section>
      ) : (
        <section className="cart-content">
          <div className="cart-products-column">
            <div className="cart-products-heading">
              <div>
                <p>YOUR SELECTED ITEMS</p>

                <h2>My Shopping Bag</h2>
              </div>

              <button onClick={clearCart}>
                Clear Bag
              </button>
            </div>

            <div className="cart-product-list">
              {cartItems.map((item) => {
                const discount = Math.round(
                  ((item.mrp - item.price) / item.mrp) *
                    100
                );

                return (
                  <article
                    className="cart-product-card"
                    key={item.id}
                  >
                    <button
                      className="cart-product-image"
                      onClick={() =>
                        router.push(`/product/${item.id}`)
                      }
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                      />
                    </button>

                    <div className="cart-product-info">
                      <p>{item.category}</p>

                      <h3
                        onClick={() =>
                          router.push(`/product/${item.id}`)
                        }
                      >
                        {item.name}
                      </h3>

                      <div className="cart-item-price">
                        <strong>
                          ₹{item.price.toLocaleString()}
                        </strong>

                        <del>
                          ₹{item.mrp.toLocaleString()}
                        </del>

                        <span>{discount}% OFF</span>
                      </div>

                      <small>
                        Inclusive of all taxes
                      </small>

                      <div className="cart-item-actions">
                        <div className="cart-quantity">
                          <button
                            onClick={() =>
                              decreaseQuantity(item.id)
                            }
                          >
                            −
                          </button>

                          <span>{item.quantity}</span>

                          <button
                            onClick={() =>
                              increaseQuantity(item.id)
                            }
                          >
                            +
                          </button>
                        </div>

                        <button
                          className="cart-remove-button"
                          onClick={() =>
                            removeProduct(item.id)
                          }
                        >
                          Remove
                        </button>

                        <button className="cart-wishlist-button">
                          ♡ Move To Wishlist
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total">
                      <small>ITEM TOTAL</small>

                      <strong>
                        ₹
                        {(
                          item.price * item.quantity
                        ).toLocaleString()}
                      </strong>

                      <span>In Stock</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="cart-delivery-benefits">
              <div>
                <strong>◇</strong>

                <span>
                  <b>Free Delivery</b>
                  On orders above ₹999
                </span>
              </div>

              <div>
                <strong>↻</strong>

                <span>
                  <b>Easy Returns</b>
                  Hassle-free shopping
                </span>
              </div>

              <div>
                <strong>♢</strong>

                <span>
                  <b>Secure Payment</b>
                  Safe & protected
                </span>
              </div>
            </div>
          </div>

          <aside className="cart-summary">
            <div className="cart-summary-title">
              <p>ORDER DETAILS</p>

              <h2>Price Summary</h2>
            </div>

            <div className="cart-coupon">
              <label>Have a coupon?</label>

              <div>
                <input
                  type="text"
                  value={coupon}
                  placeholder="Enter coupon code"
                  onChange={(event) => {
                    setCoupon(event.target.value);
                    setCouponMessage("");
                  }}
                />

                <button onClick={applyCoupon}>
                  Apply
                </button>
              </div>

              {couponMessage && (
                <p
                  className={
                    couponApplied
                      ? "coupon-success"
                      : "coupon-error"
                  }
                >
                  {couponMessage}
                </p>
              )}
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-price-lines">
              <div>
                <span>
                  Total MRP ({cartIds.length} items)
                </span>

                <strong>
                  ₹{mrpTotal.toLocaleString()}
                </strong>
              </div>

              <div>
                <span>Product Discount</span>

                <strong className="cart-green-price">
                  − ₹{productSavings.toLocaleString()}
                </strong>
              </div>

              {couponApplied && (
                <div>
                  <span>Coupon Discount</span>

                  <strong className="cart-green-price">
                    − ₹{couponDiscount.toLocaleString()}
                  </strong>
                </div>
              )}

              <div>
                <span>Delivery Charges</span>

                <strong
                  className={
                    deliveryCharge === 0
                      ? "cart-green-price"
                      : ""
                  }
                >
                  {deliveryCharge === 0
                    ? "FREE"
                    : `₹${deliveryCharge}`}
                </strong>
              </div>
            </div>

            <div className="cart-summary-divider" />

            <div className="cart-final-price">
              <span>Total Amount</span>

              <strong>
                ₹{finalTotal.toLocaleString()}
              </strong>
            </div>

            <div className="cart-saving-message">
              You are saving ₹
              {(
                productSavings + couponDiscount
              ).toLocaleString()}{" "}
              on this order.
            </div>

            <button
              className="cart-checkout-button"
              onClick={proceedToCheckout}
            >
              Proceed To Checkout →
            </button>

            <button
              className="cart-continue-button"
              onClick={() => router.push("/shop")}
            >
              ← Continue Shopping
            </button>

            <div className="cart-secure-message">
              <span>♢</span>

              <p>
                <strong>100% Secure Checkout</strong>
                Your payment information is protected.
              </p>
            </div>
          </aside>
        </section>
      )}

      <section className="cart-help">
        <p>NEED ASSISTANCE?</p>

        <h2>Your Paradise Assistant Is Here To Help</h2>

        <span>
          Need help choosing the perfect collection or completing
          your order?
        </span>

        <button onClick={() => router.push("/assistant")}>
          Talk To Your Assistant →
        </button>
      </section>

      <footer className="cart-page-footer">
        <div className="cart-footer-logo">
          <div className="cart-page-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </div>

        <p>
          Premium fashion, thoughtfully curated for every woman
          and every occasion.
        </p>

        <small>© 2026 Paradise Collection</small>
      </footer>
    </main>
  );
}