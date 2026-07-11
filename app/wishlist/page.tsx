"use client";

import "./wishlist.css";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  category: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  color: string;
};

const products: Product[] = [
  {
    id: 1,
    name: "Noor Embroidered Anarkali Suit",
    category: "Party Wear",
    price: 1999,
    mrp: 2999,
    rating: 4.7,
    reviews: 245,
    image:
      "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85",
    badge: "BESTSELLER",
    color: "Purple",
  },
  {
    id: 2,
    name: "Meher Premium Festive Suit",
    category: "Festive",
    price: 2499,
    mrp: 3499,
    rating: 4.8,
    reviews: 189,
    image:
      "https://images.unsplash.com/photo-1583391733956-6c78276477e2?auto=format&fit=crop&w=900&q=85",
    badge: "NEW",
    color: "Red",
  },
  {
    id: 3,
    name: "Royal Wedding Collection Suit",
    category: "Wedding",
    price: 3299,
    mrp: 4999,
    rating: 4.9,
    reviews: 312,
    image:
      "https://images.unsplash.com/photo-1597983073512-90bd150e19f6?auto=format&fit=crop&w=900&q=85",
    badge: "PREMIUM",
    color: "Green",
  },
  {
    id: 4,
    name: "Aayat Designer Party Suit",
    category: "Party Wear",
    price: 1799,
    mrp: 2699,
    rating: 4.5,
    reviews: 118,
    image:
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=85",
    badge: "SALE",
    color: "Black",
  },
  {
    id: 5,
    name: "Zara Elegant Cotton Suit",
    category: "Daily Wear",
    price: 1299,
    mrp: 1999,
    rating: 4.4,
    reviews: 97,
    image:
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=85",
    color: "Pink",
  },
  {
    id: 6,
    name: "Inaya Luxury Designer Suit",
    category: "Designer",
    price: 2899,
    mrp: 4299,
    rating: 4.8,
    reviews: 204,
    image:
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=85",
    badge: "TRENDING",
    color: "Black",
  },
  {
    id: 7,
    name: "Mahira Festive Embroidered Suit",
    category: "Festive",
    price: 2199,
    mrp: 3199,
    rating: 4.6,
    reviews: 156,
    image:
      "https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&w=900&q=85",
    color: "Blue",
  },
  {
    id: 8,
    name: "Safa Premium Wedding Suit",
    category: "Wedding",
    price: 3999,
    mrp: 5999,
    rating: 4.9,
    reviews: 278,
    image:
      "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=85",
    badge: "EXCLUSIVE",
    color: "Red",
  },
];

export default function WishlistPage() {
  const router = useRouter();

  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cart, setCart] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedWishlist = localStorage.getItem("paradise-wishlist");
      const savedCart = localStorage.getItem("paradise-cart");

      if (savedWishlist) {
        setWishlist(JSON.parse(savedWishlist));
      }

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Could not load wishlist:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  const wishlistProducts = useMemo(() => {
    return wishlist
      .map((id) => products.find((product) => product.id === id))
      .filter(Boolean) as Product[];
  }, [wishlist]);

  function removeFromWishlist(productId: number) {
    const updatedWishlist = wishlist.filter(
      (id) => id !== productId
    );

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "paradise-wishlist",
      JSON.stringify(updatedWishlist)
    );
  }

  function addToCart(productId: number) {
    const updatedCart = [...cart, productId];

    setCart(updatedCart);

    localStorage.setItem(
      "paradise-cart",
      JSON.stringify(updatedCart)
    );
  }

  function moveToCart(productId: number) {
    addToCart(productId);
    removeFromWishlist(productId);
  }

  function clearWishlist() {
    setWishlist([]);
    localStorage.setItem(
      "paradise-wishlist",
      JSON.stringify([])
    );
  }

  if (!loaded) {
    return (
      <main className="wishlist-loading">
        <div className="loading-logo">P</div>
        <p>PARADISE COLLECTION</p>
      </main>
    );
  }

  return (
    <main className="wishlist-page">
      {/* TOP OFFER BAR */}

      <div className="wishlist-offer-bar">
        <span>FREE SHIPPING ON ORDERS ABOVE ₹999</span>
        <span>YOUR PARADISE WISHLIST</span>
      </div>

      {/* HEADER */}

      <header className="wishlist-header">
        <button
          className="wishlist-logo"
          onClick={() => router.push("/shop")}
        >
          <div className="wishlist-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </button>

        <div className="wishlist-header-title">
          <span>YOUR SAVED SELECTIONS</span>
          <strong>Wishlist</strong>
        </div>

        <nav className="wishlist-nav">
          <button
            onClick={() => router.push("/shop")}
          >
            <span>⌂</span>
            <small>Shop</small>
          </button>

          <button
            onClick={() => router.push("/account")}
          >
            <span>♙</span>
            <small>Account</small>
          </button>

          <button
            onClick={() => router.push("/cart")}
          >
            <span>◇</span>
            <small>Cart</small>

            {cart.length > 0 && (
              <b>{cart.length}</b>
            )}
          </button>
        </nav>
      </header>

      {/* HERO */}

      <section className="wishlist-hero">
        <p>CURATED BY YOU</p>

        <h1>
          Your Paradise
          <br />
          <em>Wishlist.</em>
        </h1>

        <span>
          A collection of pieces you love, saved especially
          for you.
        </span>
      </section>

      {/* WISHLIST CONTENT */}

      <section className="wishlist-content">
        {wishlistProducts.length > 0 ? (
          <>
            <div className="wishlist-heading">
              <div>
                <p>YOUR FAVOURITES</p>

                <h2>Saved Collections</h2>

                <span>
                  {wishlistProducts.length}{" "}
                  {wishlistProducts.length === 1
                    ? "item"
                    : "items"}{" "}
                  in your wishlist
                </span>
              </div>

              <button
                className="clear-wishlist"
                onClick={clearWishlist}
              >
                Clear Wishlist
              </button>
            </div>

            <div className="wishlist-grid">
              {wishlistProducts.map((product) => {
                const discount = Math.round(
                  ((product.mrp - product.price) /
                    product.mrp) *
                    100
                );

                return (
                  <article
                    className="wishlist-card"
                    key={product.id}
                  >
                    <div className="wishlist-image-box">
                      <img
                        src={product.image}
                        alt={product.name}
                        onClick={() =>
                          router.push(
                            `/product/${product.id}`
                          )
                        }
                      />

                      {product.badge && (
                        <span className="wishlist-badge">
                          {product.badge}
                        </span>
                      )}

                      <button
                        className="remove-heart"
                        onClick={() =>
                          removeFromWishlist(product.id)
                        }
                        aria-label="Remove from wishlist"
                      >
                        ♥
                      </button>

                      <div className="wishlist-image-actions">
                        <button
                          onClick={() =>
                            moveToCart(product.id)
                          }
                        >
                          Move To Cart
                        </button>

                        <button
                          onClick={() =>
                            router.push(
                              `/product/${product.id}`
                            )
                          }
                        >
                          Quick View
                        </button>
                      </div>
                    </div>

                    <div className="wishlist-product-info">
                      <span className="wishlist-category">
                        {product.category}
                      </span>

                      <h3
                        onClick={() =>
                          router.push(
                            `/product/${product.id}`
                          )
                        }
                      >
                        {product.name}
                      </h3>

                      <div className="wishlist-rating">
                        <strong>
                          ★ {product.rating}
                        </strong>

                        <span>
                          ({product.reviews})
                        </span>
                      </div>

                      <div className="wishlist-price">
                        <strong>
                          ₹{product.price.toLocaleString(
                            "en-IN"
                          )}
                        </strong>

                        <del>
                          ₹{product.mrp.toLocaleString(
                            "en-IN"
                          )}
                        </del>

                        <span>{discount}% OFF</span>
                      </div>

                      <p>Inclusive of all taxes</p>

                      <button
                        className="wishlist-cart-button"
                        onClick={() =>
                          moveToCart(product.id)
                        }
                      >
                        Move To Cart →
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="empty-wishlist">
            <div className="empty-heart">♡</div>

            <p>YOUR SAVED SELECTIONS</p>

            <h2>
              Your Wishlist
              <br />
              Is Waiting.
            </h2>

            <span>
              Save the pieces you love and find them here
              whenever you return.
            </span>

            <button
              onClick={() => router.push("/shop")}
            >
              Explore Collection →
            </button>
          </div>
        )}
      </section>

      {/* BENEFITS */}

      <section className="wishlist-benefits">
        <div>
          <strong>◇</strong>

          <span>
            <b>Premium Quality</b>
            Curated Collections
          </span>
        </div>

        <div>
          <strong>♢</strong>

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
          <strong>♧</strong>

          <span>
            <b>Secure Payment</b>
            Trusted Checkout
          </span>
        </div>
      </section>

      {/* FOOTER */}

      <footer className="wishlist-footer">
        <div className="wishlist-footer-brand">
          <div className="footer-logo-row">
            <div className="wishlist-logo-icon">P</div>

            <div>
              <strong>PARADISE</strong>
              <span>COLLECTION</span>
            </div>
          </div>

          <p>
            Premium fashion, thoughtfully curated for
            every woman and every occasion.
          </p>
        </div>

        <div>
          <strong>SHOP</strong>
          <button onClick={() => router.push("/shop")}>
            New Arrivals
          </button>
          <button onClick={() => router.push("/shop")}>
            Party Wear
          </button>
          <button onClick={() => router.push("/shop")}>
            Wedding
          </button>
          <button onClick={() => router.push("/shop")}>
            Festive
          </button>
        </div>

        <div>
          <strong>HELP</strong>
          <button onClick={() => router.push("/orders")}>
            My Orders
          </button>
          <button>Returns</button>
          <button>Shipping</button>
          <button>Contact Us</button>
        </div>

        <div>
          <strong>ABOUT</strong>
          <button>Our Story</button>
          <button>Privacy Policy</button>
          <button>Terms</button>
        </div>
      </footer>
    </main>
  );
}