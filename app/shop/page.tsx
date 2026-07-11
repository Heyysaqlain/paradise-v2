"use client";

import "./shop.css";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/lib/client";

type Product = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image_url: string;
  second_image_url: string | null;
  stock: number;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
};

const categories = [
  "All",
  "New Arrivals",
  "Party Wear",
  "Wedding Collection",
  "Festive Wear",
  "Designer",
  "Daily Wear",
];

const fallbackImage =
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=85";

export default function ShopPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [databaseError, setDatabaseError] = useState("");

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState("featured");

  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);

  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    fetchProducts();

    const savedCart = localStorage.getItem("paradise-cart");
    const savedWishlist = localStorage.getItem("paradise-wishlist");

    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch {
        localStorage.removeItem("paradise-cart");
      }
    }

    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch {
        localStorage.removeItem("paradise-wishlist");
      }
    }
  }, []);

  async function fetchProducts() {
    setLoading(true);
    setDatabaseError("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Products fetch error:", error);
      setDatabaseError(error.message);
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts((data as Product[]) || []);
    setLoading(false);
  }

  function addToCart(productId: string) {
    const updatedCart = [...cart, productId];

    setCart(updatedCart);

    localStorage.setItem(
      "paradise-cart",
      JSON.stringify(updatedCart)
    );

    setCartOpen(true);
  }

  function removeFromCart(index: number) {
    const updatedCart = [...cart];

    updatedCart.splice(index, 1);

    setCart(updatedCart);

    localStorage.setItem(
      "paradise-cart",
      JSON.stringify(updatedCart)
    );
  }

  function toggleWishlist(productId: string) {
    let updatedWishlist: string[];

    if (wishlist.includes(productId)) {
      updatedWishlist = wishlist.filter(
        (id) => id !== productId
      );
    } else {
      updatedWishlist = [...wishlist, productId];
    }

    setWishlist(updatedWishlist);

    localStorage.setItem(
      "paradise-wishlist",
      JSON.stringify(updatedWishlist)
    );
  }

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        product.name.toLowerCase().includes(searchValue) ||
        product.category.toLowerCase().includes(searchValue) ||
        (product.description || "")
          .toLowerCase()
          .includes(searchValue);

      let matchesCategory = true;

      if (activeCategory === "New Arrivals") {
        matchesCategory = true;
      } else if (activeCategory !== "All") {
        matchesCategory =
          product.category === activeCategory;
      }

      return matchesSearch && matchesCategory;
    });

    if (activeCategory === "New Arrivals") {
      result = [...result].sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (sort === "featured") {
      result = [...result].sort(
        (a, b) =>
          Number(b.is_featured) - Number(a.is_featured)
      );
    }

    if (sort === "low-high") {
      result = [...result].sort(
        (a, b) => Number(a.price) - Number(b.price)
      );
    }

    if (sort === "high-low") {
      result = [...result].sort(
        (a, b) => Number(b.price) - Number(a.price)
      );
    }

    return result;
  }, [products, search, activeCategory, sort]);

  const cartProducts = cart
    .map((id) =>
      products.find((product) => product.id === id)
    )
    .filter(Boolean) as Product[];

  const cartTotal = cartProducts.reduce(
    (total, product) => total + Number(product.price),
    0
  );

  function getDiscount(product: Product) {
    const originalPrice = Number(product.original_price);
    const currentPrice = Number(product.price);

    if (!originalPrice || originalPrice <= currentPrice) {
      return 0;
    }

    return Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
  }

  return (
    <main className="shop-page">
      <div className="shop-offer-bar">
        <p>FREE SHIPPING ON ORDERS ABOVE ₹999</p>

        <span>NEW CUSTOMER? USE CODE PARADISE10</span>
      </div>

      <header className="shop-header">
        <div className="shop-logo">
          <div className="shop-logo-icon">P</div>

          <div>
            <strong>PARADISE</strong>
            <span>COLLECTION</span>
          </div>
        </div>

        <div className="shop-search">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Search for suits, colours and collections..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

          {search && (
            <button onClick={() => setSearch("")}>×</button>
          )}
        </div>

        <nav className="shop-nav">
          <button onClick={() => router.push("/wishlist")}>
            ♡
            <small>Wishlist</small>

            {wishlist.length > 0 && (
              <b>{wishlist.length}</b>
            )}
          </button>

          <button onClick={() => router.push("/account")}>
            ♙
            <small>Account</small>
          </button>

          <button onClick={() => setCartOpen(true)}>
            ◇
            <small>Cart</small>

            {cart.length > 0 && <b>{cart.length}</b>}
          </button>
        </nav>
      </header>

      <nav className="shop-categories">
        {categories.map((category) => (
          <button
            key={category}
            className={
              activeCategory === category
                ? "active-shop-category"
                : ""
            }
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </nav>

      <section className="shop-hero">
        <div className="shop-hero-content">
          <p>THE PARADISE EDIT</p>

          <h1>
            Elegance For
            <br />
            <em>Every Occasion.</em>
          </h1>

          <span>
            Discover timeless designs, premium fabrics and
            collections curated especially for you.
          </span>

          <button
            onClick={() =>
              document
                .getElementById("products")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            Explore Collection
            <b>→</b>
          </button>
        </div>

        <div className="shop-hero-offer">
          <small>PARADISE EXCLUSIVE</small>
          <strong>UP TO</strong>
          <h2>40%</h2>
          <strong>OFF</strong>
          <span>Selected Collections</span>
        </div>
      </section>

      <section className="shop-benefits">
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

      <section
        className="shop-products-section"
        id="products"
      >
        <div className="products-heading">
          <div>
            <p>CURATED FOR YOU</p>
            <h2>Explore Our Collection</h2>

            <span>
              {loading
                ? "Loading products..."
                : `${filteredProducts.length} products available`}
            </span>
          </div>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
          >
            <option value="featured">Featured</option>

            <option value="low-high">
              Price: Low to High
            </option>

            <option value="high-low">
              Price: High to Low
            </option>
          </select>
        </div>

        {loading ? (
          <div className="no-products">
            <span>◇</span>
            <h3>Loading Collection...</h3>
            <p>
              Please wait while we prepare your Paradise
              collection.
            </p>
          </div>
        ) : databaseError ? (
          <div className="no-products">
            <span>!</span>
            <h3>Unable To Load Products</h3>
            <p>{databaseError}</p>

            <button onClick={fetchProducts}>
              Try Again
            </button>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const discount = getDiscount(product);

              const wished = wishlist.includes(product.id);

              return (
                <article
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image-box">
                    <img
                      src={product.image_url || fallbackImage}
                      alt={product.name}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = fallbackImage;
                      }}
                      onClick={() =>
                        router.push(`/product/${product.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    />

                    {product.is_featured && (
                      <span className="product-badge">
                        FEATURED
                      </span>
                    )}

                    <button
                      className={`wishlist-button ${
                        wished ? "wished" : ""
                      }`}
                      onClick={() =>
                        toggleWishlist(product.id)
                      }
                    >
                      {wished ? "♥" : "♡"}
                    </button>

                    <div className="product-quick-actions">
                      <button
                        onClick={() =>
                          addToCart(product.id)
                        }
                      >
                        Add To Cart
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

                  <div className="product-information">
                    <span className="product-category">
                      {product.category}
                    </span>

                    <h3
                      onClick={() =>
                        router.push(`/product/${product.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {product.name}
                    </h3>

                    <div className="product-rating">
                      <strong>★ 4.8</strong>
                      <span>Premium Collection</span>
                    </div>

                    <div className="product-price">
                      <strong>
                        ₹{Number(product.price).toLocaleString(
                          "en-IN"
                        )}
                      </strong>

                      {product.original_price &&
                        Number(product.original_price) >
                          Number(product.price) && (
                          <>
                            <del>
                              ₹
                              {Number(
                                product.original_price
                              ).toLocaleString("en-IN")}
                            </del>

                            <span>{discount}% OFF</span>
                          </>
                        )}
                    </div>

                    <p>
                      {product.stock > 0
                        ? `${product.stock} items available`
                        : "Out of stock"}
                    </p>

                    <button
                      className="mobile-add-cart"
                      disabled={product.stock <= 0}
                      onClick={() => addToCart(product.id)}
                    >
                      {product.stock > 0
                        ? "Add To Cart"
                        : "Out Of Stock"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="no-products">
            <span>◇</span>
            <h3>No Products Found</h3>

            <p>
              Try changing your search or category.
            </p>

            <button
              onClick={() => {
                setSearch("");
                setActiveCategory("All");
              }}
            >
              View All Products
            </button>
          </div>
        )}
      </section>

      <section className="shop-newsletter">
        <p>JOIN THE PARADISE FAMILY</p>

        <h2>
          Be The First To Discover
          <br />
          Our New Collections
        </h2>

        <span>
          Exclusive launches, private offers and style
          inspiration delivered to your inbox.
        </span>

        <div>
          <input
            type="email"
            placeholder="Enter your email address"
          />

          <button>Subscribe →</button>
        </div>
      </section>

      <footer className="shop-footer">
        <div className="footer-brand">
          <div className="shop-logo">
            <div className="shop-logo-icon">P</div>

            <div>
              <strong>PARADISE</strong>
              <span>COLLECTION</span>
            </div>
          </div>

          <p>
            Premium fashion, thoughtfully curated for every
            woman and every occasion.
          </p>
        </div>

        <div>
          <strong>SHOP</strong>
          <a>New Arrivals</a>
          <a>Party Wear</a>
          <a>Wedding</a>
          <a>Festive</a>
        </div>

        <div>
          <strong>HELP</strong>
          <a>My Orders</a>
          <a>Returns</a>
          <a>Shipping</a>
          <a>Contact Us</a>
        </div>

        <div>
          <strong>ABOUT</strong>
          <a>Our Story</a>
          <a>Privacy Policy</a>
          <a>Terms</a>
        </div>
      </footer>

      <div
        className={`cart-overlay ${
          cartOpen ? "cart-overlay-open" : ""
        }`}
        onClick={() => setCartOpen(false)}
      />

      <aside
        className={`cart-drawer ${
          cartOpen ? "cart-drawer-open" : ""
        }`}
      >
        <div className="cart-drawer-header">
          <div>
            <p>YOUR SHOPPING BAG</p>
            <h2>My Cart</h2>
          </div>

          <button onClick={() => setCartOpen(false)}>
            ×
          </button>
        </div>

        <div className="cart-items">
          {cartProducts.length === 0 ? (
            <div className="empty-cart">
              <span>◇</span>
              <h3>Your Bag Is Empty</h3>

              <p>
                Discover something beautiful today.
              </p>
            </div>
          ) : (
            cartProducts.map((product, index) => (
              <div
                className="cart-item"
                key={`${product.id}-${index}`}
              >
                <img
                  src={product.image_url || fallbackImage}
                  alt={product.name}
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = fallbackImage;
                  }}
                />

                <div>
                  <span>{product.category}</span>

                  <strong>{product.name}</strong>

                  <p>
                    ₹
                    {Number(product.price).toLocaleString(
                      "en-IN"
                    )}
                  </p>

                  <button
                    onClick={() => removeFromCart(index)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {cartProducts.length > 0 && (
          <div className="cart-footer">
            <div>
              <span>Subtotal</span>

              <strong>
                ₹{cartTotal.toLocaleString("en-IN")}
              </strong>
            </div>

            <p>
              Shipping and discounts calculated at checkout.
            </p>

            <button
              onClick={() => {
                localStorage.setItem(
                  "paradiseCheckout",
                  JSON.stringify({
                    items: cartProducts,
                    total: cartTotal,
                  })
                );

                setCartOpen(false);
                router.push("/checkout");
              }}
            >
              Proceed To Checkout →
            </button>
          </div>
        )}
      </aside>
    </main>
  );
}